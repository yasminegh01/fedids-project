import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, LSTM, Dense
from tensorflow.keras.utils import to_categorical
import warnings

warnings.filterwarnings("ignore", category=UserWarning, module='keras')

# --- Create Sequential Time Sequences for LSTM ---
def create_sequences(X, y, time_steps=20):
    Xs, ys = [], []
    for i in range(len(X) - time_steps):
        Xs.append(X[i:(i + time_steps)])
        ys.append(y[i + time_steps])
    return np.array(Xs), np.array(ys)

# --- CNN-LSTM Model ---
def create_cnn_lstm_model(input_shape, num_classes):
    model = Sequential([
        Conv1D(filters=64, kernel_size=3, activation='relu', input_shape=input_shape),
        MaxPooling1D(pool_size=2),
        LSTM(50, return_sequences=False),
        Dense(100, activation='relu'),
        Dense(num_classes, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

# --- Preprocessing + Training + Saving ---
def preprocess_train_and_save(dataset_path, feature_columns, label_column, output_model_name):
    print(f"\n📂 Starting training for: {dataset_path}")

    try:
        df = pd.read_csv(dataset_path)
    except FileNotFoundError:
        print(f"❌ File not found: {dataset_path}")
        return

    df.dropna(subset=feature_columns + [label_column], inplace=True)
    X = df[feature_columns]
    y = df[label_column]

    # Normalize features
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    # Encode labels
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)
    num_classes = len(np.unique(y_encoded))

    # Create sequences for time-based learning
    TIME_STEPS = 20
    X_seq, y_seq = create_sequences(X_scaled, y_encoded, TIME_STEPS)
    y_seq_cat = to_categorical(y_seq, num_classes=num_classes)

    if len(X_seq) == 0:
        print("⚠️ No sequences created. Dataset might be too small for time_steps.")
        return

    print(f"🧪 Sequences created: {X_seq.shape}, Classes: {num_classes}")

    X_train, X_test, y_train, y_test = train_test_split(
        X_seq, y_seq_cat, test_size=0.2, random_state=42, stratify=y_seq_cat
    )

    model = create_cnn_lstm_model(input_shape=(X_train.shape[1], X_train.shape[2]), num_classes=num_classes)

    print("📊 Training model...")
    model.fit(X_train, y_train, epochs=5, batch_size=64, validation_split=0.1, verbose=1)

    print("🧪 Evaluating model...")
    loss, acc = model.evaluate(X_test, y_test, verbose=1)
    print(f"✅ Test Accuracy: {acc*100:.2f}%")

    model.save(output_model_name)
    print(f"💾 Model saved to: {output_model_name}")

# --- Run for your two datasets ---
if __name__ == '__main__':
    print("🚀 CNN-LSTM Training Script Started")

    # --- For balanced_edge.csv ---
    EDGE_FEATURES = [
        'icmp.checksum', 'icmp.seq_le', 'tcp.ack', 'tcp.ack_raw',
        'mqtt.topic_0', 'mqtt.topic_0.0', 'mqtt.topic_Temperature_and_Humidity'
    ]
    EDGE_LABEL = 'Attack_type'

    preprocess_train_and_save(
        dataset_path='data/balanced_edge.csv',
        feature_columns=EDGE_FEATURES,
        label_column=EDGE_LABEL,
        output_model_name='model_edge.h5'
    )

    # --- NEW CORRECTED CODE ---
    CICIOT23_FEATURES = [
     'flow_duration', 'Header_Length', 'Protocol Type', 'Duration',
        'Rate', 'IAT', 'Variance',  # <-- Corrected feature names
      'syn_flag_number_syn_count_merged', 'Tot sum_Max_merged', 'Min_Magnitue_merged'
]
    CICIOT23_LABEL = 'label'

    preprocess_train_and_save(
        dataset_path='data/df_final_ciciot23.csv',
        feature_columns=CICIOT23_FEATURES,
        label_column=CICIOT23_LABEL,
        output_model_name='model_ciciot23.h5'
    )
