# iiot_client/model_definition.py
import tensorflow as tf
ATTACK_LABELS = [
    'Normal', 'Backdoor', 'DDoS_ICMP', 'DDoS_TCP', 'DDoS_UDP', 
    'Fingerprinting', 'MITM', 'Port_Scanning', 'Ransomware', 
    'SQL_Injection', 'Uploading', 'Vulnerability_scanner', 'XSS'
]
NUM_CLASSES = len(ATTACK_LABELS)

def create_model(time_steps=20, num_features=7):
    """Crée et compile une version améliorée du modèle CNN-LSTM."""
    model = tf.keras.models.Sequential([
        tf.keras.layers.Conv1D(filters=128, kernel_size=3, activation='relu', input_shape=(time_steps, num_features)),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.MaxPooling1D(pool_size=2),
        
        tf.keras.layers.LSTM(units=100, return_sequences=True),
        tf.keras.layers.Dropout(0.2),
        
        tf.keras.layers.LSTM(units=100),
        tf.keras.layers.Dropout(0.3),
        
        tf.keras.layers.Dense(units=64, activation='relu'),
        tf.keras.layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model
    