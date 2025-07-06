## 🧥 Dress Recommendation API using FastAPI

A machine learning-powered API to recommend appropriate dresses based on occasion, country, formality, and cultural context. Built with **FastAPI** and a trained **TensorFlow** model.

Model : https://colab.research.google.com/drive/1MiVA4gJTEfRF4d8c5qznFduASFZYRN9P?usp=sharing
Data: https://drive.google.com/file/d/1QNRdp77kEjScdcjtLXsGtq0VzGof_uXk/view?usp=sharing

### 📁 Project Structure

```
fastapi_dress_recommendation/
├── main.py                   # FastAPI app
├── model/                    # Saved model and encoders
│   ├── dress_model.keras
│   ├── *.pkl                 # Label encoders
├── templates/
│   └── form.html             # HTML input form
├── requirements.txt
└── README.md
```

---

### 🚀 Getting Started

#### 1. Clone the repository

```bash
git clone https://github.com/john-nash-rs/fastapi-dress-recommendation.git
cd fastapi-dress-recommendation
```

#### 2. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
```

#### 3. Install dependencies

```bash
pip install -r requirements.txt
```

#### 4. Run the API server

```bash
uvicorn main:app --reload
```

---

### 📦 API Endpoints

#### 🔹 `POST /predict`

Predicts the best dress recommendation.

**Request Body (JSON):**

```json
{
  "occasion": "job_interview",
  "country": "india",
  "formality": "formal",           // optional
  "context": "moderate"            // optional
}
```

**Response:**

```json
{
  "top_recommendation": "formal_suit",
  "confidence": 0.91,
  "top_3": [
    ["formal_suit", 0.91],
    ["smart_casual", 0.06],
    ["ethnic_wear", 0.03]
  ]
}
```

You can test it with:

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"occasion": "job_interview", "country": "india"}'
```

---

#### 🔹 `GET /form`

A simple web form to input data and see predictions.

Open in your browser:

```
http://127.0.0.1:8000/form
```

---

### 🧠 How It Works

* Trained neural network model with embeddings for categorical features:

  * `occasion`
  * `country`
  * `formality`
  * `cultural context`
* Predicts `dress_recommendation` class.
* Top 3 predictions returned with confidence scores.

---

### 🛠 Tech Stack

* **FastAPI** – for serving APIs and rendering templates.
* **TensorFlow / Keras** – trained recommendation model.
* **scikit-learn** – for label encoding and preprocessing.
* **Jinja2** – templating for HTML form.

---

### 📌 Notes

* Make sure you place the saved `.keras` model and `.pkl` encoders inside the `model/` folder.
* If retraining the model, follow the structure of `DressRecommendationNN` from your training script.

---

### 📄 License

MIT © YourName

---

Would you like a zipped starter template version of this repo?
