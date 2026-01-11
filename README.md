# 🎉 Fun Zone – Party Games Web App

Fun Zone is a modern, interactive party games web application built using **React**, **Firebase**, and **Tailwind CSS**.  
It brings popular group games like **Truth or Dare**, **Never Have I Ever**, and **Would You Rather** into a clean, mobile-friendly digital experience.

🌐 **Live Demo**  
👉 https://funzone-ashen.vercel.app/

---

## 🕹️ Games Available

### 🎯 Truth or Dare
- Spin-the-Bottle style player selection
- Fair turn distribution (no repeats until all players play)
- Predefined Truth & Dare questions
- **AI-Generated Dares** using Google Gemini API
- Smooth animations and bottle physics

### 🍷 Never Have I Ever (NHIE)
- Single-player and Multiplayer modes
- Real-time multiplayer with Firebase Firestore
- Room-code based sessions
- Finger-count elimination system
- Host-controlled game flow

### 🤔 Would You Rather
- Choice-based interactive questions
- Animated percentage indicators
- Smooth UI transitions

---

## ✨ Features

- ⚛️ React Functional Components & Hooks
- 🔥 Firebase Anonymous Authentication
- 🧠 Firestore Real-Time Database
- 🎨 Tailwind CSS with custom animations
- 🤖 AI-generated dares using Gemini API
- 📱 Fully responsive (mobile-first design)
- 🚀 Deployed on Vercel

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Authentication | Firebase (Anonymous Auth) |
| Database | Firebase Firestore |
| AI | Google Gemini API |
| Deployment | Vercel |

---

## 📂 Project Structure



src/
├── App.jsx
├── components/
│   ├── UI Components (Button, Card, BackButton)
│   ├── Game Screens
│   └── Menu Components
├── firebase/
│   └── firebaseConfig.js
├── assets/
└── styles/



---

## 🔐 Firebase Configuration

Create a Firebase project and enable:

- **Authentication**
  - Anonymous Sign-In
- **Firestore Database**

Update your Firebase configuration:


const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};


---

## 🤖 AI Dare Configuration (Optional)

This project supports AI-generated dares via **Google Gemini API**.

1. Generate a Gemini API key
2. Add the key here:


const apiKey = "YOUR_GEMINI_API_KEY";


If no API key is provided, the app will continue using built-in dares.

---

## ▶️ Run Locally

# Clone the repository
git clone https://github.com/your-username/fun-zone.git

# Navigate to project directory
cd fun-zone

# Install dependencies
npm install

# Start development server
npm run dev

Application will run at:

http://localhost:5173


---

## 🌐 Deployment

This project is deployed using **Vercel**.

🔗 Live URL:
[https://funzone-ashen.vercel.app/](https://funzone-ashen.vercel.app/)

To deploy your own version:

npm run build
vercel deploy


---

## 🎮 How to Play

1. Open the application
2. Choose a game mode
3. Add players (for group games)
4. Spin the bottle or answer questions
5. Enjoy the party experience 🎉

---

## 🚧 Future Enhancements

* 🎵 Background music and sound effects
* 👤 Player avatars and nicknames
* 📊 Game statistics and history
* 🔐 Authenticated user profiles
* 🌍 Public online game rooms

---

## 👨‍💻 Author

**Ajay Rangaraju**

Built with ❤️ for fun, learning, and real-time multiplayer experiences.

---

## 📜 License

This project is open-source and available under the **MIT License**.


---

If you want next, I can:
- ⭐ Add **GitHub badges** (React, Firebase, Vercel)
- 📸 Create a **Screenshots section**
- 🧠 Rewrite this for **resume / LinkedIn / portfolio**
- 📝 Create a **short repo description + tags**

Just tell me 👍

