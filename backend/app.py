from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib

app = Flask(__name__)
CORS(app)

# Load model
model = joblib.load("rf.pkl")

@app.route("/")
def home():
    return "Crop Recommendation API running"

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

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
        "recommended_crop": prediction[0]
    })

if __name__ == "__main__":
    app.run(debug=True)