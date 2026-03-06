from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib

app = Flask(__name__)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Load model
model = joblib.load("rf.pkl")


@app.route("/")
def home():
    return "Crop Recommendation API running"


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():

    # Handle preflight request
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    try:
        data = request.get_json()

        N = float(data["N"])
        P = float(data["P"])
        K = float(data["K"])
        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
        ph = float(data["ph"])
        rainfall = float(data["rainfall"])

        features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])

        prediction = model.predict(features)

        return jsonify({
            "recommended_crop": str(prediction[0])
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
