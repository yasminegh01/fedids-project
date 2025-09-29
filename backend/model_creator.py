# backend/model_creator.py

import os
# On importe la fonction depuis le fichier local
from model_definition import create_model 

def main():
    print("--- Creating Initial Global Model Weights ---")
    # On appelle la fonction sans arguments, elle utilisera les valeurs par défaut
    model = create_model() 
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    
    model.summary()
    model.save_weights("global_model.weights.h5")
    print("\n✅ Successfully saved 'global_model.weights.h5'.")

if __name__ == '__main__':
    main()