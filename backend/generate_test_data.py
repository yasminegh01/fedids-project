# backend/generate_test_data.py
import pandas as pd
import numpy as np

# --- Configuration (doit correspondre à votre modèle) ---
NUM_SAMPLES = 1000
NUM_FEATURES = 7
FEATURE_NAMES = [
    'icmp.checksum','icmp.seq_le','tcp.ack','tcp.ack_raw',
    'mqtt.topic_0','mqtt.topic_0.0','mqtt.topic_Temperature_and_Humidity'
]
LABEL_COLUMN_NAME = 'Attack_type'
ATTACK_LABELS = [
    'Backdoor',
    'DDoS_HTTP',
    'DDoS_ICMP',
    'DDoS_TCP',
    'DDoS_UDP',
    'Fingerprinting',
    'MITM',
    'Normal',
    'Password',
    'Port_Scanning',
    'Ransomware',
    'SQL_injection',
    'Uploading',
    'Vulnerability_scanner',
    'XSS'
]

def generate_data():
    print(f"Generating {NUM_SAMPLES} samples of test data...")
    
    # Créer des données numériques aléatoires
    features = np.random.rand(NUM_SAMPLES, NUM_FEATURES)
    
    # Créer des labels aléatoires
    labels = np.random.choice(ATTACK_LABELS, size=NUM_SAMPLES)
    
    # Combiner en un DataFrame pandas
    df = pd.DataFrame(features, columns=FEATURE_NAMES)
    df[LABEL_COLUMN_NAME] = labels
    
    # Sauvegarder en CSV
    output_filename = "test_data_for_evaluation.csv"
    df.to_csv(output_filename, index=False)
    
    print(f"✅ Successfully created '{output_filename}'. You can now upload this file.")

if __name__ == "__main__":
    generate_data()