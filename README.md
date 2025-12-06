<h1 align="center">FynVid</h1>

<p align="center">
  <img src="logof.png" alt="FynVid Logo" width="160"/>
</p>

[FynVid](https://fynvid.vercel.app/) is a full-stack video streaming platform inspired by YouTube, built using the **MERN** stack with **Kafka** for asynchronous event processing and **NGINX** load balancing across multiple backend instances.

---

## Tech Stack

### **Backend**

- Node.js + Express.js
- MongoDB + Mongoose
- Kafka (Producers/Consumers)
- JWT Authentication
- NGINX Load Balancer (3 Node.js instances)

### **Frontend**

- React.js
- Tailwind CSS
- React Router
- Context API (Auth + Global State)

---

## System Architecture

<p align="center">
  <img src="SystemArchitecture.png" alt="System Architecture" width="800"/>
</p>

---

## Features

### **User System**

- Register & login using JWT
- Update profile, avatar, and cover image

### **Video Management**

- Upload and manage videos
- Like, comment, and view videos
- View events are processed asynchronously via Kafka

### **Playlists**

- Create, update, delete playlists
- Add/remove videos

### **Likes & Comments**

- Real-time updates
- Kafka producers trigger notification events

### **Notifications**

- When someone:
  - Likes your video
  - Comments
  - Subscribes
- Kafka consumers create notifications asynchronously

### **Subscriptions**

- Subscribe/unsubscribe to channels
- Watch feed from subscribed creators

### **Dashboard**

- Track uploads, views, engagement

---

## Kafka Integration

FynVid uses **Kafka** to decouple backend operations from event processing.

### **Why Kafka?**

- High scalability
- Better responsiveness (async)
- Prevents data loss with persistent logs
- Easy to extend (add more microservices)

### **Consumers**

| Consumer Name         | Responsibility                      |
| --------------------- | ----------------------------------- |
| Video Views Consumer  | Bulk processes video view events    |
| Likes Consumer        | Creates notifications for likes     |
| Comments Consumer     | Handles comment-based notifications |
| Subscription Consumer | Processes subscriber notifications  |

> Database insertions for likes, comments, and subscriptions still happen directly in controllers. Kafka is used mainly for **notification creation** and **view processing**.

---

## NGINX Load Balancing

FynVid backend uses NGINX to distribute traffic across 3 Node.js instances.

### **Load balancing strategy:**

```
least_conn;
```

This sends requests to the backend with the fewest active connections.

---

## Docker Setup

Start **Kafka**, **Zookeeper**, **Kafka UI**, and **3 backend servers**:

```bash
docker-compose up -d
```

### After starting:

- Kafka Broker → **localhost:9092**
- Kafka UI → **localhost:8089**
- Backend Instances → **8001, 8002, 8003**

Access Kafka UI:  
**http://localhost:8089**

---

## Manual Setup (Setup Required for Docker-Compose)

### Clone repo

```bash
git clone https://github.com/Vedantspit/FynVid.git
cd FynVid
```

### Backend setup

```bash
cd backend
npm install
```

### Frontend setup

```bash
cd frontend
npm install
```

### Backend `.env`

```
PORT=8000
MONGO_URL=your_mongo_string
CORS_ORIGIN=frontend_url
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=duration
REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=duration
CLOUD_NAME=cloudinary_name
CLOUD_KEY=cloudinary_key
CLOUD_SECRET=cloudinary_secret
```

### Frontend `.env`

```
VITE_API_URL = "http://localhost:8020/api/v1"
```

### Start backend (Manual or run Docker-compose)

```bash
npm run dev
```

For production:

```bash
npm run build
```

## Frontend Deployment With NGINX

After running the build command, place the generated `dist` folder in your preferred directory.  
Download and install **NGINX**, then replace the default `nginx.conf` with the configuration provided in the repository.

Update the following path to point to your actual build directory:

```
location / {
    root YOUR_PATH/dist;
    index index.html;
    try_files $uri /index.html;
}
```

---

## Full Architecture Overview

```
Frontend (React)
        ↓
NGINX (Load Balancer)
        ↓
Backend Instances (Node.js: 8001, 8002, 8003)
        ↓
MongoDB
        ↓
Kafka (Event Queue)
        ↓
Kafka Consumers (Async Processing)
```

---
