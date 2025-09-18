# iiot_client/client.py

import flwr as fl
import tensorflow as tf
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
import argparse
import os
import configparser
import requests
import time
import threading
from typing import Optional

# --- Configuration Globale ---
# L'adresse du serveur sera mise à jour au démarrage
API_URL = "http://127.0.0.1:8000" 
FLOWER_SERVER_ADDRESS = "127.0.0.1:8080"

# Configuration du modèle et des données
DATA_PATH = 'data/balanced_edge.csv'
TIME_STEPS = 20
EDGE_FEATURES = ['icmp.checksum','icmp.seq_le','tcp.ack','tcp.ack_raw','mqtt.topic_0','mqtt.topic_0.0','mqtt.topic_Temperature_and_Humidity']
EDGE_LABEL = 'Attack_type'

# --- Fonctions Utilitaires ---

def get_device_api_key(config_file: str) -> Optional[str]:
    """Lit la clé API depuis le fichier de configuration."""
    config = configparser.ConfigParser()
    if not os.path.exists(config_file):
        print(f"Error: Config file '{config_file}' not found.")
        return None
    config.read(config_file)
    return config.get('device', 'api_key', fallback=None)

def send_heartbeat(api_key: str, stop_event: threading.Event):
    """Envoie un "heartbeat" périodique au backend."""
    while not stop_event.is_set():
        if api_key:
            try:
                requests.post(f"{API_URL}/api/devices/heartbeat", json={"api_key": api_key}, timeout=10)
                print(f"[Heartbeat] Ping sent for ...{api_key[-4:]}.")
            except requests.exceptions.RequestException:
                print("[Heartbeat] Warning: Could not reach backend server.")
        # Attendre 60 secondes avant le prochain ping
        time.sleep(60)

# --- Prétraitement des Données ---
def create_sequences(X, y, time_steps=TIME_STEPS):
    Xs, ys = [], []
    for i in range(len(X) - time_steps):
        Xs.append(X[i:(i + time_steps)])
        ys.append(y[i + time_steps])
    return np.array(Xs), np.array(ys)

def load_and_preprocess_data(dataset_path, feature_columns, label_column, client_id, num_clients):
    """Charge et partitionne le dataset pour un client spécifique."""
    try:
        df = pd.read_csv(dataset_path)
        partition_size = len(df) // num_clients
        start, end = client_id * partition_size, (client_id + 1) * partition_size
        df_client = df.iloc[start:end].copy()
        df_client.dropna(subset=feature_columns + [label_column], inplace=True)
        
        if df_client.empty:
            print("Error: No data for this client after cleaning.")
            return None

        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(df_client[feature_columns])
        
        encoder = LabelEncoder()
        y_encoded = encoder.fit_transform(df_client[label_column])
        
        X_seq, y_seq = create_sequences(X_scaled, y_encoded)
        return train_test_split(X_seq, y_seq, test_size=0.2, random_state=42)
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

# --- Client Flower ---
class CnnLstmClient(fl.client.NumPyClient):
    def __init__(self, model, x_train, y_train, x_val, y_val):
        self.model = model
        self.x_train, self.y_train = x_train, y_train
        self.x_val, self.y_val = x_val, y_val

    def get_parameters(self, config):
        return self.model.get_weights()

    def fit(self, parameters, config):
        self.model.set_weights(parameters)
        self.model.compile("adam", "sparse_categorical_crossentropy", metrics=["accuracy"])
        self.model.fit(self.x_train, self.y_train, epochs=2, batch_size=32, verbose=0)
        print("✅ Local training round finished.")
        return self.model.get_weights(), len(self.x_train), {}

    def evaluate(self, parameters, config):
        self.model.set_weights(parameters)
        self.model.compile("adam", "sparse_categorical_crossentropy", metrics=["accuracy"])
        loss, accuracy = self.model.evaluate(self.x_val, self.y_val, verbose=0)
        return float(loss), len(self.x_val), {"accuracy": float(accuracy)}

# --- Fonction Principale ---
def main():
    # Configuration des arguments de la ligne de commande
    parser = argparse.ArgumentParser(description="FedIds IIoT Client")
    parser.add_argument("--client-id", type=int, required=True, help="Client partition ID (e.g., 0)")
    parser.add_argument("--config", type=str, default="config.ini", help="Path to config file")
    parser.add_argument("--server-ip", type=str, default="127.0.0.1", help="IP address of the main server")
    args = parser.parse_args()

    print(f"--- Starting Client {args.client_id} (Config: {args.config}) ---")

    # Mettre à jour les URLs globales avec l'IP du serveur
    global API_URL, FLOWER_SERVER_ADDRESS
    API_URL = f"http://{args.server_ip}:8000"
    FLOWER_SERVER_ADDRESS = f"{args.server_ip}:8080"

    # 1. Gérer la clé API et le Heartbeat
    api_key = get_device_api_key(args.config)
    if not api_key:
        print(f"❌ FATAL: API Key not found in '{args.config}'. Exiting.")
        return

    print("✅ API Key found. Starting heartbeat thread...")
    stop_event = threading.Event()
    heartbeat_thread = threading.Thread(target=send_heartbeat, args=(api_key, stop_event), daemon=True)
    heartbeat_thread.start()

    # 2. Charger les données et le modèle
    print("Loading data and model...")
    data = load_and_preprocess_data(DATA_PATH, EDGE_FEATURES, EDGE_LABEL, args.client_id, 2) # 2 = num_clients
    if data is None:
        print("❌ Data loading failed. Exiting.")
        return
    x_train, x_val, y_train, y_val = data
    
    try:
        model = tf.keras.models.load_model('global_model.h5')
    except Exception as e:
        print(f"❌ Failed to load model 'global_model.h5': {e}")
        return

    # 3. Démarrer le client Flower
    client = CnnLstmClient(model, x_train, y_train, x_val, y_val)
    
    print(f"Connecting to Flower server at {FLOWER_SERVER_ADDRESS}...")
    try:
        fl.client.start_client(server_address=FLOWER_SERVER_ADDRESS, client=client)
    except Exception as e:
        print(f"❌ Could not connect to Flower server: {e}")
    finally:
        print("Shutting down client...")
        stop_event.set()
        heartbeat_thread.join(2)

if __name__ == "__main__":
    # Supprimer les logs TensorFlow inutiles
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    main()