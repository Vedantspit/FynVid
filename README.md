# 🎬 FynVid

<p align="center">
  <img src="./frontend/public/logof.png" alt="FynVid Logo" width="160"/>
</p>

FynVid is a full-stack video streaming platform inspired by YouTube, built using the **MERN** stack with **Kafka** integration for scalability and asynchronous processing.

---

## 🚀 Tech Stack

### 🖥️ Frontend

- **React.js (Vite)** for a fast, modern UI
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for authentication & state management

### ⚙️ Backend

- **Node.js** + **Express.js** for RESTful APIs
- **MongoDB (Mongoose)** for database management
- **Kafka** for event-driven processing
- **JWT** for secure authentication

---

## ⚡ Features

### 👤 User System

- Register and login users securely using JWT
- Update profile info, avatar, and cover image

### 🎞️ Video Management

- Upload and manage videos
- Like, comment, and view videos
- Each **view event** is processed asynchronously via Kafka for scalability

### 📁 Playlists

- Create, update, and delete playlists
- Add or remove videos from playlists

### ❤️ Likes & Comments

- Real-time updates on likes and comments
- **Kafka producers** trigger events for notifications when users interact with videos

### 🔔 Notifications

- Get notified when:
  - Someone likes your video
  - Someone comments on your video
  - Someone subscribes to your channel
- **Kafka consumers** handle these events and create notifications efficiently

### 👥 Subscriptions

- Subscribe/unsubscribe to channels
- View content from subscribed creators

### 📊 Dashboard

- Track uploaded videos and performance metrics

---

## 🧩 Kafka Integration

FynVid uses **Kafka** to decouple event generation from processing, ensuring scalability and responsiveness.

### 🧠 Why We Use Kafka

- **Scalability:** Can handle a massive number of events (likes, comments, views) concurrently.
- **Decoupling:** Producers don’t wait for consumers, improving app response time.
- **Reliability:** Ensures no data loss even if a service temporarily fails.
- **Extensibility:** New services can listen to the same events easily.

### Kafka Consumers in FynVid

| Consumer                  | Role                                                      |
| ------------------------- | --------------------------------------------------------- |
| **Video Views Consumer**  | Processes and updates view counts in bulk for scalability |
| **Likes Consumer**        | Listens to like events and creates notifications          |
| **Comments Consumer**     | Listens to comment events and creates notifications       |
| **Subscription Consumer** | Handles subscriber events and generates notifications     |

> Except for **video views**, the Kafka consumers primarily handle **notification creation**, while the database insertion for likes, comments, and subscriptions happens in the respective controllers at the time of action.

---

## 🛠️ Installation

### Clone the repository

```bash
git clone https://github.com/Vedantspit/FynVid.git
cd FynVid
```

### Setup backend

```bash
cd backend
npm install
```

### Setup frontend

```bash
cd frontend
npm install
```

### Environment variables

Create a `.env` file in the backend directory with:

```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
KAFKA_BROKER=localhost:9092
FRONTEND_URL=http://localhost:5173
PORT=8000
```

### Start services

```bash
# Start Kafka and Zookeeper (using Docker or local setup)
# Then run:
npm run dev
```

### Run frontend

```bash
npm run dev
```

---

## 🧠 Architecture Overview

```text
Frontend (React)
      ↓
Express API (Node.js)
      ↓
MongoDB (Data Storage)
      ↓
Kafka (Event Queue)
      ↓
Consumers (Async Processing)
```

---

## 🧑‍💻 Author

**Vedant Deshmukh**  
💼 [GitHub](https://github.com/Vedantspit)  
🎓 Software Devloper | AI/ML Enthusiast

---

## 🏁 License

MIT License © 2025 Vedant Deshmukh
