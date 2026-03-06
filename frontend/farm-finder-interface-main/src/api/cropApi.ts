const API_BASE_URL = "https://crop-recommendation-system-t44g.onrender.com";

export const predictCrop = async (data: Record<string, number>) => {
  const payload = {
    N: data.nitrogen,
    P: data.phosphorus,
    K: data.potassium,
    temperature: data.temperature,
    humidity: data.humidity,
    ph: data.ph,
    rainfall: data.rainfall
  };

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  return result.recommended_crop;
};
