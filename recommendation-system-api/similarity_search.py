from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import hashlib
import chromadb
import os
from dotenv import load_dotenv
from google import genai

# --------------------------------------------------
# ENV
# --------------------------------------------------
load_dotenv()

EMBEDDING_MODEL = "gemini-embedding-001"

# --------------------------------------------------
# GLOBAL STATE
# --------------------------------------------------
client = None
collection_occasion = None
collection_country = None
initialized = False


# --------------------------------------------------
# HELPERS
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
# LIFESPAN (FAST ONLY)
# --------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, collection_occasion, collection_country

    print("🚀 similarity_search booting")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY missing")

    client = genai.Client(api_key=api_key)
    collection_occasion, collection_country = init_chroma()

    print("🟢 similarity_search ready (lazy init)")
    yield
    print("🛑 similarity_search shutdown")


app = FastAPI(lifespan=lifespan)


# --------------------------------------------------
# ROUTES
# --------------------------------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "initialized": initialized
    }


class SimilarityRequest(BaseModel):
    occasion: str
    country: str


@app.post("/similar")
def get_similar(request: SimilarityRequest):
    try:
        populate_collections()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {
        "occasion_similar": search_similar(collection_occasion, request.occasion),
        "country_similar": search_similar(collection_country, request.country),
    }
