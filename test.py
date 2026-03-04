import requests

data = {
"N": 90,
"P": 42,
"K": 43,
"temperature": 20.8,
"humidity": 82,
"ph": 6.5,
"rainfall": 202
}

res = requests.post("http://127.0.0.1:5000/predict", json=data)

print(res.json())