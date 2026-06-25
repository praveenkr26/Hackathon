<div align="center">
  <img src="./frontend/public/favicon.svg" alt="YojanaSetu Logo" width="100" />
  
  # YojanaSetu (योजनासेतु)
  **Your AI-Powered Bridge to Indian Government Welfare Schemes**
  
  <p align="center">
    <a href="https://github.com/praveenkr26/Hackathon/commits/main"><img src="https://img.shields.io/github/last-commit/praveenkr26/Hackathon?style=for-the-badge&color=5b4cf0" alt="Last Commit"></a>
    <a href="https://github.com/praveenkr26/Hackathon/issues"><img src="https://img.shields.io/github/issues/praveenkr26/Hackathon?style=for-the-badge&color=06b6d4" alt="Issues"></a>
    <a href="https://github.com/praveenkr26/Hackathon/pulls"><img src="https://img.shields.io/github/issues-pr/praveenkr26/Hackathon?style=for-the-badge&color=10b981" alt="Pull Requests"></a>
  </p>
</div>

---

## 📌 Overview
**YojanaSetu** is an intelligent, user-centric platform designed to help Indian citizens seamlessly discover, understand, and apply for government welfare schemes. Powered by the **MERN Stack** and **Google Gemini 1.5 Flash AI**, it eliminates confusion by providing a Smart Match engine and an interactive AI Chatbot that guides users in both English and Hindi.

---

## 📸 Screenshots

<div align="center">
  
  ### 1. Home Dashboard & AI Smart Match
  <img src="https://via.placeholder.com/800x450.png?text=Screenshot+1:+Home+Page+%26+Smart+Match" alt="Home Page Screenshot" width="800" />
  
  ### 2. Scheme Discovery & Glassmorphism UI
  <img src="https://via.placeholder.com/800x450.png?text=Screenshot+2:+Scheme+Cards+%26+UI" alt="Schemes Screenshot" width="800" />

  ### 3. Real-time AI Assistant Chatbot
  <img src="https://via.placeholder.com/800x450.png?text=Screenshot+3:+AI+Chatbot+with+Speech" alt="Chatbot Screenshot" width="800" />

</div>

---

## ✨ Key Features

- 🧠 **AI-Powered Chatbot**: Ask questions about any scheme in natural language. The bot uses Gemini AI to give direct answers, application links, and features **Text-to-Speech (TTS)** voice readouts.
- 🎯 **Smart Match Engine**: Enter your profile details (age, income, occupation) and let the AI find the exact schemes you are eligible for, along with a personalized match percentage.
- 🗣️ **Bilingual Support (English & Hindi)**: Full UI localization and seamless toggle between English and Hindi to ensure accessibility for all citizens.
- 🌓 **Ultra-Modern UI/UX**: Premium aesthetic featuring dark/light modes, glassmorphism, dynamic gradients, and smooth micro-animations.
- 📄 **Document OCR Processing**: (Beta) Upload documents to automatically extract profile information.
- 📱 **Fully Responsive**: Flawless experience across desktops, tablets, and mobile devices with touch-friendly navigation.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **CSS3** (Custom Modern Design System, No external CSS framework)
- **Axios** (API Calls)
- **React Markdown** (For rich AI formatting)
- **Web Speech API** (Voice output & dictation)

### Backend
- **Node.js & Express.js** (REST API)
- **MongoDB Atlas** (Database & Mongoose ODM)
- **Google Generative AI SDK** (Gemini 2.0/1.5 Flash integration)
- **Tesseract.js** (OCR capabilities)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine. You will also need a **MongoDB Atlas URI** and a **Google Gemini API Key**.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/praveenkr26/Hackathon.git
   cd Hackathon
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_gemini_api_key
   CORS_ORIGIN=http://localhost:5173
   ```
   Run the backend:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend:**
   Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
   Run the frontend:
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Visit `http://localhost:5173` to view the application.

---

## 🛡️ License
This project was developed for Hackathon purposes. Feel free to explore, fork, and contribute!
