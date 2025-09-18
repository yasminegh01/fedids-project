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
    """
    Custom strategy that sends updates to the FastAPI web backend after each round.
    """
    def aggregate_evaluate(
        self,
        server_round: int,
        results: List[Tuple[ClientProxy, EvaluateRes]],
        failures: List[BaseException],
    ) -> Optional[Tuple[float, Dict[str, Scalar]]]:
        
        # Call the parent class method to perform the standard aggregation
        aggregated_loss, aggregated_metrics = super().aggregate_evaluate(server_round, results, failures)
        
        if aggregated_loss is not None and aggregated_metrics is not None and "accuracy" in aggregated_metrics:
            accuracy = aggregated_metrics["accuracy"]
            print(f"✅ Round {server_round} COMPLETE. Global Accuracy: {accuracy:.4f}, Loss: {aggregated_loss:.4f}")
            
            # --- PHASE 2 INTEGRATION: Send Global Status to Dashboard ---
            try:
                # This sends the live update that the frontend WebSocket is listening for
                requests.post(f"{API_URL}/api/fl_update", json={"server_round": server_round, "accuracy": accuracy})
                print("   -> Successfully notified dashboard of global status.")
            except requests.exceptions.RequestException as e:
                print(f"   🔥 API Error (Global Status): Failed to connect to backend. Is it running? Details: {e}")

        # --- PHASE 2 INTEGRATION: Send Individual Client History ---
        history_payload = [
            {
                "client_flower_id": client.cid,
                "server_round": server_round,
                "accuracy": res.metrics.get("accuracy", 0.0),
                "loss": res.loss,
            }
            for client, res in results
        ]
        if history_payload:
            try:
                # This saves the round data to the database for the Client Management page
                requests.post(f"{API_URL}/api/admin/client_history", json=history_payload)
                print("   -> Successfully saved client history to database.")
            except requests.exceptions.RequestException as e:
                print(f"   🔥 API Error (Client History): Failed to save client history. Details: {e}")
        
        return aggregated_loss, aggregated_metrics

    def aggregate_fit(self, server_round, results, failures):
        """Aggregate model weights and save the new global model after each fit round."""
        aggregated_parameters, _ = super().aggregate_fit(server_round, results, failures)

        if aggregated_parameters is not None:
            # Save the new global model to be used by the monitor and for the next round
            print(f"💾 Saving updated global model for round {server_round}...")
            aggregated_ndarrays = fl.common.parameters_to_ndarrays(aggregated_parameters)
            
            # Load a temporary model with the correct architecture to apply the new weights
            temp_model = tf.keras.models.load_model("global_model.h5")
            temp_model.set_weights(aggregated_ndarrays)
            temp_model.save("global_model.h5")
        
        return aggregated_parameters, {}


# --- Main Execution Logic ---

def main():
    print("🚀 Starting Flower Server...")
    try:
        model = tf.keras.models.load_model("global_model.h5")
        initial_params = ndarrays_to_parameters(model.get_weights())
    except Exception as e:
        print(f"❌ Could not load initial model 'global_model.h5'. Did you run model_creator.py? Error: {e}")
        return

    # Define the strategy
    strategy = FedIdsStrategy(
        initial_parameters=initial_params,
        min_fit_clients=2,
        min_evaluate_clients=2,
        min_available_clients=2,
        evaluate_metrics_aggregation_fn=weighted_average,
    )
    
    # Give the FastAPI backend a moment to start up
    print("Waiting 5 seconds for FastAPI backend to initialize...")
    time.sleep(5)
    
    # Start the Flower server
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=10),
        strategy=strategy
    )
    print("✅ Federated Learning process complete.")

if __name__ == "__main__":
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    main()