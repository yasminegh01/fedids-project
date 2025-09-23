# backend/server.py

import flwr as fl
import tensorflow as tf
import requests
from typing import List, Tuple, Optional, Dict, Union
from flwr.common import Parameters, EvaluateRes, Scalar, ndarrays_to_parameters
from flwr.server.client_proxy import ClientProxy
from flwr.server.strategy.aggregate import aggregate
import time
import os
import argparse 
from model_definition import create_model

# --- Configuration ---
# The URL of our FastAPI backend's API
API_URL = "http://127.0.0.1:8000"


# --- Helper Function for Metric Aggregation ---

def weighted_average(metrics: List[Tuple[int, Dict[str, Scalar]]]) -> Dict[str, Scalar]:
    """A standard function to aggregate metrics in a weighted manner."""
    if not metrics:
        return {}
    num_total_examples = sum(num_examples for num_examples, _ in metrics)
    if num_total_examples == 0:
        return {}
    
    aggregated_metrics: Dict[str, Union[float, int]] = {}
    # Check if the metrics dictionary is not empty
    if metrics[0][1]:
        for metric_name in metrics[0][1].keys():
            weighted_sum = sum(num_examples * m.get(metric_name, 0.0) for num_examples, m in metrics)
            aggregated_metrics[metric_name] = weighted_sum / num_total_examples
            
    return aggregated_metrics


# --- Custom Flower Strategy ---

class FedIdsStrategy(fl.server.strategy.FedAvg):
    def aggregate_evaluate(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, EvaluateRes]],
        failures: List[BaseException],
    ) -> Optional[Tuple[float, Dict[str, Scalar]]]:
        
        aggregated_loss, aggregated_metrics = super().aggregate_evaluate(server_round, results, failures)
        
        if aggregated_loss is not None and aggregated_metrics and "accuracy" in aggregated_metrics:
            accuracy = aggregated_metrics["accuracy"]
            print(f"✅ Round {server_round} COMPLETE. Global Accuracy: {accuracy:.4f}")
            
            # === BLOC DE COMMUNICATION AMÉLIORÉ ===
            try:
                # On envoie la mise à jour pour le graphique en temps réel
                requests.post(f"{API_URL}/api/fl_update", json={"server_round": server_round, "accuracy": accuracy}, timeout=5)
                print("   -> ✅ Successfully notified dashboard of global status.")
            except requests.exceptions.RequestException as e:
                print(f"   -> ❌ FAILED to notify dashboard. Is uvicorn running? Error: {e}")

            # On envoie l'historique détaillé pour la base de données
            history_payload = [{"client_flower_id": c.cid, "server_round": server_round, "accuracy": r.metrics.get("accuracy", 0.0), "loss": r.loss} for c, r in results]
            if history_payload:
                try:
                    requests.post(f"{API_URL}/api/admin/client_history", json=history_payload, timeout=5)
                    print("   -> ✅ Successfully saved client history to database.")
                except requests.exceptions.RequestException as e:
                    print(f"   -> ❌ FAILED to save client history. Error: {e}")
        
        return aggregated_loss, aggregated_metrics

    def aggregate_fit(self, server_round, results, failures):
        aggregated_parameters, aggregated_metrics = super().aggregate_fit(server_round, results, failures)

        if aggregated_parameters is not None:
            print(f"💾 Saving updated global model weights for round {server_round}...")
            aggregated_ndarrays = fl.common.parameters_to_ndarrays(aggregated_parameters)
            
            # === LA CORRECTION EST ICI ===
            # On ne charge pas un .h5 complet, on crée l'architecture et on y met les poids
            temp_model = create_model()
            temp_model.set_weights(aggregated_ndarrays)
            
            # On sauvegarde uniquement les poids
            temp_model.save_weights("global_model.weights.h5")
        
        return aggregated_parameters, aggregated_metrics



# --- Main Execution Logic ---


def main():
    parser = argparse.ArgumentParser(description="Flower Server for FedIds")
    parser.add_argument("--num-clients", type=int, default=2, help="Minimum clients for training.")
    args = parser.parse_args()
    
    print(f"🚀 Starting Flower Server... (waiting for {args.num_clients} clients)")
    
    try:
        # === LA CORRECTION EST ICI ===
        # On s'assure qu'on utilise le bon nom de fichier et le bon message d'erreur
        model = create_model()
        model.load_weights("global_model.weights.h5") 
        initial_params = fl.common.ndarrays_to_parameters(model.get_weights())
        print("✅ Initial model weights loaded successfully.")
    except Exception as e:
        print(f"❌ Could not load initial model weights from 'global_model.weights.h5'. Error: {e}")
        return

    strategy = FedIdsStrategy(
        initial_parameters=initial_params,
        min_fit_clients=args.num_clients,
        min_evaluate_clients=args.num_clients,
        min_available_clients=args.num_clients,
        evaluate_metrics_aggregation_fn=weighted_average,
    )
    
    print("Waiting 5s for FastAPI backend...")
    time.sleep(5)
    
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=10),
        strategy=strategy
    )
    print("✅ Federated Learning process complete.")

if __name__ == "__main__":
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    main()