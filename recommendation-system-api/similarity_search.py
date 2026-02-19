from fastapi import FastAPI
from pydantic import BaseModel
import hashlib
import chromadb
from dotenv import load_dotenv
import os
from google import genai
from contextlib import asynccontextmanager

# load env
load_dotenv()

# globals (initialized in lifespan)
client = None
collection_occasion = None
collection_country = None

EMBEDDING_MODEL = "models/embedding-001"


def generate_id(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


# embed text func
def embed_texts(texts: list[str]) -> list[list[float]]:
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts
    )
    return [e.values for e in response.embeddings]


# embed query func
def embed_query(text: str) -> list[float]:
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=[text]
    )
    return response.embeddings[0].values


# chroma db setup
def init_chroma():
    chroma_client = chromadb.Client()

    collection_occasion = chroma_client.get_or_create_collection(
        name="occasion",
        metadata={"hnsw:space": "cosine"}
    )

    collection_country = chroma_client.get_or_create_collection(
        name="country",
        metadata={"hnsw:space": "cosine"}
    )

    return collection_occasion, collection_country


def add_document(collection_occasion, collection_country):
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

    collection_occasion.add(
        ids=[generate_id(d) for d in doc_occasion],
        documents=doc_occasion,
        embeddings=embed_texts(doc_occasion)
    )

    collection_country.add(
        ids=[generate_id(d) for d in doc_country],
        documents=doc_country,
        embeddings=embed_texts(doc_country)
    )


def search_similar(collection, query, n_results=1):
    return collection.query(
        query_embeddings=embed_query(query),
        n_results=n_results
    )


# 🔥 lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, collection_occasion, collection_country

    print("🔄 Starting similarity service...")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY missing")

    client = genai.Client(api_key=api_key)

    collection_occasion, collection_country = init_chroma()
    add_document(collection_occasion, collection_country)

    print("✅ Similarity service ready")
    yield
    print("🛑 Similarity service shutdown")


app = FastAPI(lifespan=lifespan)


# health check
@app.get("/health")
def health():
    return {"status": "similarity ok"}


class SimilarityRequest(BaseModel):
    occasion: str
    country: str


@app.post("/similar")
def get_similar(request: SimilarityRequest):
    if collection_occasion is None or collection_country is None:
        return {"error": "Service warming up, try again shortly"}

    return {
        "occasion_similar": search_similar(collection_occasion, request.occasion),
        "country_similar": search_similar(collection_country, request.country),
    }
