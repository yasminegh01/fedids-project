# iiot_client/client.py

import flwr as fl
import tensorflow as tf
import numpy as np
import argparse, os, configparser, requests, time, threading, random # <<< 'random' EST MAINTENANT IMPORTÉ
from typing import Optional
from sklearn.model_selection import train_test_split

# --- Configuration Globale ---
API_URL = "http://127.0.0.1:8000" 
FLOWER_SERVER_ADDRESS = "127.0.0.1:8080"
TIME_STEPS, NUM_FEATURES, NUM_CLASSES = 20, 7, 15
REAL_WORLD_IPS = ["8.8.8.8", "1.1.1.1", "195.8.215.68", "139.130.4.5", "202.12.27.33"]
ATTACK_TYPES = ['Backdoor','DDoS_ICMP','DDoS_TCP','MITM','Port_Scanning','Ransomware']

# --- Fonctions Utilitaires ---
def get_device_api_key(config_file: str) -> Optional[str]:
    config = configparser.ConfigParser(); config.read(config_file)
    return config.get('device', 'api_key', fallback=None)

def background_tasks(api_key: str, stop_event: threading.Event):
    """Thread pour le heartbeat et la simulation d'attaques."""
    while not stop_event.is_set():
        # Heartbeat
        try:
            requests.post(f"{API_URL}/api/devices/heartbeat", json={"api_key": api_key}, timeout=5)
            print(f"[Background] Heartbeat sent for ...{api_key[-4:]}.")
        except: pass

        # Simulation d'attaque (30% de chance)
        if random.random() > 0.7:
            attack = {
                "source_ip": random.choice(REAL_WORLD_IPS),
                "attack_type": random.choice(ATTACK_TYPES),
                "confidence": round(random.uniform(0.8, 1.0), 2)
            }
            try:
                requests.post(f"{API_URL}/api/attacks/report", json=attack, timeout=5)
                print(f"🛑 [Background] Attack '{attack['attack_type']}' from {attack['source_ip']} reported.")
            except: pass
        
        time.sleep(30) # Exécute les tâches toutes les 30 secondes

def generate_local_data(num_samples=1000):
    print(f"Generating {num_samples} local data samples for training...")
    X_raw = np.random.rand(num_samples, NUM_FEATURES)
    y_raw = np.random.randint(0, NUM_CLASSES, size=num_samples)
    Xs, ys = [], []
    for i in range(len(X_raw) - TIME_STEPS):
        Xs.append(X_raw[i:(i + TIME_STEPS)])
        ys.append(y_raw[i + TIME_STEPS])
    if not Xs: return None
    X_seq, y_seq = np.array(Xs), np.array(ys)
    return train_test_split(X_seq, y_seq, test_size=0.2, random_state=42)

# --- Client Flower ---
class CnnLstmClient(fl.client.NumPyClient):
    # ... (cette classe est correcte)
    pass

# --- Fonction Principale ---
def main():
    parser = argparse.ArgumentParser(description="FedIds IIoT Client")
    parser.add_argument("--client-id", type=int, required=True)
    parser.add_argument("--config", type=str, default="config.ini")
    parser.add_argument("--server-ip", type=str, default="127.0.0.1")
    args = parser.parse_args()

    global API_URL, FLOWER_SERVER_ADDRESS
    API_URL = f"http://{args.server_ip}:8000"
    FLOWER_SERVER_ADDRESS = f"{args.server_ip}:8080"

    api_key = get_device_api_key(args.config)
    if not api_key: return

    # Démarrer le thread d'arrière-plan
    stop_event = threading.Event()
    bg_thread = threading.Thread(target=background_tasks, args=(api_key, stop_event), daemon=True)
    bg_thread.start()

    # Générer les données et charger le modèle
    data = generate_local_data()
    if not data: return
    x_train, x_val, y_train, y_val = data
    try: model = tf.keras.models.load_model('global_model.h5')
    except Exception as e: print(f"❌ Failed to load model: {e}"); return

    # Démarrer le client Flower (qui est bloquant)
    client = CnnLstmClient(model, x_train, y_train, x_val, y_val)
    print(f"Connecting to Flower server at {FLOWER_SERVER_ADDRESS}...")
    try:
        fl.client.start_client(server_address=FLOWER_SERVER_ADDRESS, client=client)
    except Exception as e:
        print(f"❌ Could not connect to Flower server: {e}")
    finally:
        print("Shutting down background tasks...")
        stop_event.set()
        bg_thread.join(2)

if __name__ == "__main__":
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    main()