# 🚀 SceneX – AI-Powered Crime Scene Intelligence Platform

> A futuristic, AI-driven forensic assistant that analyzes crime scene images using **CLIP + Vision Transformers (ViT)** and delivers real-time insights.

---

## 🧠 Overview

**SceneX** is a next-generation mobile application designed to assist investigators, agencies, and forensic analysts by:

* 📸 Analyzing crime scene images
* 🧠 Classifying crime categories using AI
* 📊 Providing confidence scores & insights
* 🔎 Extracting feature embeddings
* 📜 Maintaining structured investigation history

Built with a focus on **performance, scalability, and futuristic UI/UX**, SceneX bridges the gap between AI and real-world investigation workflows.

---

## ✨ Key Features

### 🔐 Authentication

* Secure Login / Signup
* JWT-based authentication
* Biometric-ready (future-ready)

### 🤖 AI Analysis

* Upload image via Camera / Gallery
* Batch image processing
* Real-time crime classification
* Confidence score visualization

### 🏷 Crime Categories

* Abuse, Arrest, Arson, Assault
* Burglary, Explosion, Fighting
* Normal, Road Accidents
* Robbery, Shooting, Shoplifting
* Stealing, Vandalism

### 🔎 Feature Extraction

* CLIP embedding vectors
* Scene-level feature representation
* Future support for similarity matching

### 📜 History

* Past analysis tracking
* Filter by date / category
* Detailed case view

### 🎨 Futuristic UI

* Dark theme + neon accents
* Smooth animations & transitions
* Glassmorphism + AI-inspired visuals

---

## 🏗 Tech Stack

### 📱 Frontend

* React Native (Expo)
* Reanimated 3
* React Navigation
* Gesture Handler
* Lottie Animations

### 🌐 Backend

* Node.js + Express
* MongoDB
* JWT Authentication
* Multer (file uploads)

### 🧠 AI Layer

* CLIP (Image-Text Understanding)
* Vision Transformer (ViT)
* Python (FastAPI for inference)

### ☁️ Cloud (Planned)

* AWS / GCP
* S3 / Cloudinary (image storage)
* GPU inference servers

---

## 🧱 Project Structure

```
SceneX/
│
├── mobile/                 # React Native App (Expo)
│
├── server/                 # Node.js Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── config/
│
├── ai-service/             # Python AI Inference Service
│
└── README.md
```

---

## 🔌 API Overview

### 🔐 Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### 🤖 Analysis

* `POST /api/analysis/upload`

### 📜 History

* `GET /api/history`
* `DELETE /api/history/:id`

---

## 🔄 Data Flow

1. User uploads image
2. Image sent to backend
3. Stored in cloud/local storage
4. Sent to AI service (CLIP + ViT)
5. Prediction returned
6. Saved in database
7. Displayed in mobile app

---

## ⚡ Getting Started

### 📦 Prerequisites

* Node.js
* MongoDB
* Python (for AI service)
* Expo CLI

---

### 🚀 Installation

#### 1. Clone the repo

```
git clone https://github.com/your-username/scenex.git
cd scenex
```

#### 2. Setup Backend

```
cd server
npm install
npm run dev
```

#### 3. Setup Mobile App

```
cd mobile
npm install
npx expo start
```

#### 4. Setup AI Service

```
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 🔒 Security

* JWT-based authentication
* Secure API routes
* Password hashing (bcrypt)
* HTTPS-ready

---

## 📈 Future Roadmap

* 🔗 Similar case matching
* 📊 Advanced analytics dashboard
* 🧑‍💼 Role-based system (Detective / Agency / Customer)
* ☁️ Cloud GPU inference
* 📡 Real-time collaboration
* 💰 SaaS & enterprise model

---

## 🧠 Vision

> SceneX is not just an app — it’s a scalable AI forensic intelligence system designed to assist real-world investigations with speed, accuracy, and intelligence.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Guru Charan**
Building next-gen AI-powered products 🚀

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
