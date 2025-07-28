# 👗 An AI-Powered Boutique

Welcome to the ultimate eCommerce experience — powered by **Next.js 15+, FastAPI, MongoDB, and ChromaDB**. This isn’t just a website — it’s a modular, AI-driven shopping ecosystem. 💅

---

## 🚀 Features

### 🛍️ Product & Order Management
- Browse, search, and filter products
- Add to cart & checkout with **Stripe** integration
- Store and manage orders using **MongoDB**

### 🔐 Authentication (Auth.js)
- Secure user login with email & password (Credentials Provider)
- JWT-based session management
- Auth-protected routes using `getServerSession` in App Router
- MongoDB-powered user storage with bcrypt password hashing

### 🤖 AI-Powered Recommendation System
- Custom-built recommendation engine using **FastAPI**
- Trained ML model that predicts personalized product recommendations
- Hosted as a separate microservice

### 🔍 Semantic Similarity Search
- Implemented with **ChromaDB**
- Vector search to show visually/textually similar items
- Integrated as a dedicated microservice communicating with the recommender

### 🧩 Microservice Architecture
- Split into 3 independent services:
  - `main-app` (Next.js frontend)
  - `recommendation-service` (FastAPI backend for ML inference)
  - `similarity-service` (ChromaDB for vector search)
- Services communicate via internal API calls

### 💾 Database Stack
- **MongoDB** for:
  - Users
  - Products
  - Orders
- **ChromaDB** for:
  - Vector embeddings of products
  - Real-time similarity retrieval

---

## 📦 Tech Stack

| Layer              | Tech             |
|-------------------|------------------|
| Frontend          | Next.js 15+ (App Router) |
| Auth              | Auth.js (formerly NextAuth) |
| Backend API       | FastAPI          |
| Machine Learning  | Custom model (recommendations) |
| Vector DB         | ChromaDB         |
| Database          | MongoDB          |
| Payment Gateway   | Stripe           |
| Styling           | Tailwind CSS     |
| State Management  | React Hooks (no Redux mess) |

---
