from fastapi import FastAPI
from pydantic import BaseModel
import requests
import time
import numpy as np
import tensorflow as tf
import joblib
import os
from dotenv import load_dotenv

app = FastAPI()

#loading env in dev mode
load_dotenv()

# health check
@app.get("/health")
def health():
    return {"status": "recommendation ok"}

# Load model and encoders
class DressAPIModel:

    # check if similarity_search is up
    def wait_for_similarity_search_service(self, retries=6, delay=5):
        url = os.getenv("SIMILARITY_SEARCH_URL")
        
        print(url)
        health_url = f"{url}/health"

        for attempt in range(retries):
            try:
                r = requests.get(health_url, timeout=5)
                if r.status_code == 200:
                    return True
            except Exception:
                pass
            
            print(f"Similarity service not ready, retry {attempt+1}/{retries}")
            time.sleep(delay)

        return False

    #communicating with similar search microservice
    def get_similar(self, occasion, country):
        base_url = os.getenv("SIMILARITY_SEARCH_URL")
        url=f"{base_url}/similar"
        # proceed only if similarity_searched is awake
        if not self.wait_for_similarity_search_service():
            print("⚠ similarity_search unavailable, using raw inputs")
            return occasion, country

        payload = {
            "occasion": occasion,
            "country": country
        }
        response = requests.post(url, json=payload, timeout=35)
        if response.status_code==200:
            data = response.json()
            return data['occasion_similar']['documents'][0][0], data['country_similar']['documents'][0][0]
        else:
            raise Exception(f"Failed to fetch from similarity service {response.text}")
    

    #Recommender Model
    def __init__(self, model_path="model/"):
        self.model = tf.keras.models.load_model(os.path.join(model_path, "dress_model.keras"))
        self.encoders = {
            name.split("_encoder.pkl")[0]: joblib.load(os.path.join(model_path, name))
            for name in os.listdir(model_path)
            if name.endswith("_encoder.pkl")
        }
        self.vocab_sizes = {k: len(enc.classes_) for k, enc in self.encoders.items()}

    def predict(self, occasion, country, gender, formality=None, context=None):
        try:
            # Inference defaults
            formality = formality or {
                'business_meeting': 'formal', 'picnic': 'casual',
                'wedding': 'formal', 'job_interview': 'formal',
                'beach_party': 'party', 'nightclub': 'party', 'cultural_festival': 'traditional',
                'graduation': 'semi_formal'
            }.get(occasion, 'casual')

            context = context or {
                'saudi_arabia': 'conservative', 'uae': 'conservative',
                'usa': 'moderate', 'uk': 'moderate', 'brazil': 'relaxed'
            }.get(country, 'moderate')

            gender = gender or 'unisex'

            male_dresses = ['blazer_and_jeans', 'formal_suit', 'tuxedo', 'ethnic_kurta_pajama', 'african_dashiki']
            female_dresses = ['summer_dress', 'midi_dress', 'cocktail_dress', 'evening_gown', 'kimono', 'middle_eastern_kaftan', 'saree', 'lehenga', 'abaya']

            #get the most similar value from chroma db if user enters smthg not alreday present

            # Encode
            encoded_input = {
                'occasion': np.array([self.encoders['occasion'].transform([occasion])[0]]),
                'country': np.array([self.encoders['country'].transform([country])[0]]),
                'formality': np.array([self.encoders['occasion_formality'].transform([formality])[0]]),
                'context': np.array([self.encoders['cultural_context'].transform([context])[0]]),
                'gender': np.array([self.encoders['gender'].transform([gender])[0]]),
            }

            dress_labels = self.encoders['dress_recommendation'].classes_  # decoded dress names

            probs = self.model.predict(encoded_input)
           
            probs_flat = probs[0]

            for idx, dress in enumerate(dress_labels):
              if(gender == 'male' and dress in female_dresses) or \
                (gender == 'female' and dress in male_dresses):
                  probs_flat[idx] = 0

            top3_idx = np.argsort(probs[0])[-3:][::-1]
            top3_labels = self.encoders['dress_recommendation'].inverse_transform(top3_idx)
            top3_conf = probs[0][top3_idx]

            return {
                "top_recommendation": top3_labels[0],
                "confidence": float(top3_conf[0]),
                "top_3": [(str(label), float(conf)) for label, conf in zip(top3_labels, top3_conf)]
            }

        except Exception as e:
            return {"error": str(e)}
        
# Instantiate model
dress_model = DressAPIModel()

# API Input model
class PredictRequest(BaseModel):
    occasion: str
    country: str
    formality: str = None
    context: str = None
    gender: str
    

# JSON prediction endpoint
@app.post("/predict")
def predict(request: PredictRequest):
    occasion, country = dress_model.get_similar(request.occasion, request.country)
    print(occasion)
    print(country)
    return dress_model.predict(
        occasion=occasion,
        country=country,
        formality=request.formality,
        context=request.context,
        gender=request.gender,
    )


