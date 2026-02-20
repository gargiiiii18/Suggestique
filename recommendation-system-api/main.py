from fastapi import FastAPI
from pydantic import BaseModel
import requests
import time
import threading
import numpy as np
import tensorflow as tf
import joblib
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# load env in dev mode
load_dotenv()

dress_model = None  # initialized in lifespan


class DressAPIModel:

    def __init__(self, model_path="model/"):
        self.model = tf.keras.models.load_model(
            os.path.join(model_path, "dress_model.keras")
        )

        self.encoders = {
            name.split("_encoder.pkl")[0]: joblib.load(os.path.join(model_path, name))
            for name in os.listdir(model_path)
            if name.endswith("_encoder.pkl")
        }

    # check if similarity_search is up
    def wait_for_similarity_search_service(self, retries=12, delay=5):
        base_url = os.getenv("SIMILARITY_SEARCH_URL")
        health_url = f"{base_url}/health"

        for attempt in range(retries):
            try:
                r = requests.get(health_url, timeout=5)
                if r.status_code == 200:
                    return True
            except Exception:
                pass

            print(f"Similarity service not ready ({attempt+1}/{retries})")
            time.sleep(delay)

        return False

    # communicate with similarity_search microservice
    def get_similar(self, occasion, country):
        base_url = os.getenv("SIMILARITY_SEARCH_URL")
        url = f"{base_url}/similar"

        if not self.wait_for_similarity_search_service():
            print("⚠ similarity_search unavailable, using raw inputs")
            return occasion, country

        payload = {"occasion": occasion, "country": country}
        response = requests.post(url, json=payload, timeout=30)

        if response.status_code == 200:
            data = response.json()
            return (
                data["occasion_similar"]["documents"][0][0],
                data["country_similar"]["documents"][0][0],
            )

        raise RuntimeError("Similarity service failed")

    def predict(self, occasion, country, gender, formality=None, context=None):

        formality = formality or {
            "business_meeting": "formal",
            "picnic": "casual",
            "wedding": "formal",
            "job_interview": "formal",
            "beach_party": "party",
            "nightclub": "party",
            "cultural_festival": "traditional",
            "graduation": "semi_formal",
        }.get(occasion, "casual")

        context = context or {
            "saudi_arabia": "conservative",
            "uae": "conservative",
            "usa": "moderate",
            "uk": "moderate",
            "brazil": "relaxed",
        }.get(country, "moderate")

        gender = gender or "unisex"

        male_dresses = [
            "blazer_and_jeans",
            "formal_suit",
            "tuxedo",
            "ethnic_kurta_pajama",
            "african_dashiki",
        ]

        female_dresses = [
            "summer_dress",
            "midi_dress",
            "cocktail_dress",
            "evening_gown",
            "kimono",
            "middle_eastern_kaftan",
            "saree",
            "lehenga",
            "abaya",
        ]

        encoded_input = {
            "occasion": np.array([self.encoders["occasion"].transform([occasion])[0]]),
            "country": np.array([self.encoders["country"].transform([country])[0]]),
            "formality": np.array(
                [self.encoders["occasion_formality"].transform([formality])[0]]
            ),
            "context": np.array(
                [self.encoders["cultural_context"].transform([context])[0]]
            ),
            "gender": np.array([self.encoders["gender"].transform([gender])[0]]),
        }

        probs = self.model.predict(encoded_input)[0]
        labels = self.encoders["dress_recommendation"].classes_

        for i, dress in enumerate(labels):
            if (gender == "male" and dress in female_dresses) or (
                gender == "female" and dress in male_dresses
            ):
                probs[i] = 0

        top3_idx = np.argsort(probs)[-3:][::-1]
        top3_labels = labels[top3_idx]
        top3_conf = probs[top3_idx]

        return {
            "top_recommendation": top3_labels[0],
            "confidence": float(top3_conf[0]),
            "top_3": [(str(l), float(c)) for l, c in zip(top3_labels, top3_conf)],
        }


# 🔥 Keep Alive Background Process
def keep_alive():
    """Pings itself and similarity_search periodically to prevent Render from sleeping."""
    # Render automatically sets RENDER_EXTERNAL_URL for each web service individually
    port = os.getenv("PORT", 8000)
    my_url = os.getenv("RENDER_EXTERNAL_URL", f"http://127.0.0.1:{port}")
    sim_url = os.getenv("SIMILARITY_SEARCH_URL", "http://127.0.0.1:8001")
    
    while True:
        time.sleep(14 * 60)  # Ping every 14 minutes
        try:
            requests.get(f"{my_url}/health", timeout=10)
            if sim_url:
                requests.get(f"{sim_url}/health", timeout=10)
            print("🟢 Keep-alive pings sent to self and similarity_search")
        except Exception as e:
            print(f"⚠️ Keep-alive pings failed: {e}")


# 🔥 lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    global dress_model

    print("🔄 Starting recommender service...")

    dress_model = DressAPIModel()

    # optional warmup ping
    dress_model.wait_for_similarity_search_service()

    # Start the keep-alive background thread
    threading.Thread(target=keep_alive, daemon=True).start()

    print("✅ Recommender service ready")
    yield
    print("🛑 Recommender service shutdown")


app = FastAPI(lifespan=lifespan)


# health check
@app.get("/health")
def health():
    return {"status": "recommendation ok"}


class PredictRequest(BaseModel):
    occasion: str
    country: str
    formality: str | None = None
    context: str | None = None
    gender: str


@app.post("/predict")
def predict(request: PredictRequest):
    if dress_model is None:
        return {"error": "Service warming up, try again"}

    occasion, country = dress_model.get_similar(
        request.occasion, request.country
    )

    return dress_model.predict(
        occasion=occasion,
        country=country,
        gender=request.gender,
        formality=request.formality,
        context=request.context,
    )
