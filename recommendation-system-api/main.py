from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import requests
import hashlib
import time
import threading
import numpy as np
import tensorflow as tf
import joblib
import chromadb
import os
from dotenv import load_dotenv
from google import genai

# load env in dev mode
load_dotenv()

# --------------------------------------------------
# GLOBAL STATE
# --------------------------------------------------
EMBEDDING_MODEL = "gemini-embedding-001"
client = None
collection_occasion = None
collection_country = None
initialized = False
dress_model = None  # initialized in lifespan

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

    def get_similar(self, occasion, country):
        try:
            populate_collections()
        except Exception as e:
            print(f"⚠ ChromaDB uninitialized: {e}, using raw inputs")
            return occasion, country

        occ_res = search_similar(collection_occasion, occasion)
        ctry_res = search_similar(collection_country, country)

        try:
            return (
                occ_res["documents"][0][0],
                ctry_res["documents"][0][0],
            )
        except (IndexError, KeyError):
            return occasion, country

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


# --------------------------------------------------
# CHROMA HELPERS
# --------------------------------------------------
def generate_id(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()

def embed_texts(texts: list[str]) -> list[list[float]]:
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts
    )
    return [e.values for e in response.embeddings]

def embed_query(text: str) -> list[float]:
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=[text]
    )
    return response.embeddings[0].values

def init_chroma():
    chroma_client = chromadb.Client()
    occ = chroma_client.get_or_create_collection(
        name="occasion",
        metadata={"hnsw:space": "cosine"}
    )
    ctry = chroma_client.get_or_create_collection(
        name="country",
        metadata={"hnsw:space": "cosine"}
    )
    return occ, ctry

def populate_collections():
    global initialized
    if initialized:
        return

    doc_occasion = [
        "casual_outing", "picnic", "graduation", "beach_party",
        "wedding", "formal_dinner", "business_meeting",
        "religious_event", "job_interview", "nightclub",
        "cultural_festival"
    ]
    doc_country = [
        "nigeria", "france", "uk", "uae", "usa", "brazil",
        "japan", "germany", "saudi_arabia", "canada",
        "australia", "india", "south_africa", "china", "mexico"
    ]

    if collection_occasion.count() == 0:
        collection_occasion.add(
            ids=[generate_id(d) for d in doc_occasion],
            documents=doc_occasion,
            embeddings=embed_texts(doc_occasion),
        )
    if collection_country.count() == 0:
        collection_country.add(
            ids=[generate_id(d) for d in doc_country],
            documents=doc_country,
            embeddings=embed_texts(doc_country),
        )

    initialized = True
    print("✅ Chroma populated")

def search_similar(collection, query, n_results=1):
    return collection.query(
        query_embeddings=embed_query(query),
        n_results=n_results
    )


# --------------------------------------------------
# SERVICE LIFESPAN
# --------------------------------------------------
def keep_alive():
    """Pings the unified service periodically to prevent Render from sleeping."""
    port = os.getenv("PORT", 8000)
    my_url = os.getenv("RENDER_EXTERNAL_URL", f"http://127.0.0.1:{port}")
    
    while True:
        time.sleep(14 * 60)  # Ping every 14 minutes
        try:
            requests.get(f"{my_url}/health", timeout=10)
            print("🟢 Keep-alive ping sent to self")
        except Exception as e:
            print(f"⚠️ Keep-alive ping failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global dress_model, client, collection_occasion, collection_country

    print("🔄 Starting Unified Recommender Service...")

    # 1. Start GenAI
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY missing")
    client = genai.Client(api_key=api_key)

    # 2. Start Chroma
    collection_occasion, collection_country = init_chroma()

    # 3. Start TensorFlow
    dress_model = DressAPIModel()

    # 4. Start Keep-Alive Protocol
    threading.Thread(target=keep_alive, daemon=True).start()

    print("✅ Unified Service Ready")
    yield
    print("🛑 Unified Service Shutdown")


app = FastAPI(lifespan=lifespan)

# health check
@app.get("/health")
def health():
    return {
        "status": "recommendation ok",
        "chroma_initialized": initialized
    }


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
