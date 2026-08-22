# 🐳 EduMap Platform — Docker Deployment Guide

Run the entire EduMap ecosystem (Backend API + Teacher Portal + Student Portal + Gemini AI Engine) on **any machine** (Mac, Windows, Linux) with a single command!

---

## 🚀 Quick Start (Single Command)

Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. **Navigate to the Repository Directory:**
   ```bash
   cd eduMap-github
   ```

2. **Start All Services with Docker Compose:**
   ```bash
   docker compose up --build
   ```
   *(Tip: Add `-d` flag to run in background mode: `docker compose up --build -d`)*

3. **Open the Portals in your Browser:**
   - 🎓 **Student Portal & Master Gateway**: [http://localhost:5173](http://localhost:5173)
   - 🧑‍🏫 **Teacher & Educator Portal**: [http://localhost:3000](http://localhost:3000)
   - ⚡ **Backend REST & WebSocket API**: [http://localhost:5001](http://localhost:5001)

---

## 📦 Container Architecture

| Service | Container Name | Host Port | Container Port | Technology |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | `edumap-backend` | `5001` | `5001` | Node.js 20 Alpine + Socket.IO + Gemini AI |
| **Teacher Portal** | `edumap-teacher-portal` | `3000` | `80` | Nginx Alpine (Production SPA build) |
| **Student Portal** | `edumap-student-portal` | `5173` | `80` | Nginx Alpine (Production SPA build) |

---

## 🛠️ Management Commands

- **Stop all containers:**
  ```bash
  docker compose down
  ```

- **View real-time logs across all services:**
  ```bash
  docker compose logs -f
  ```

- **View logs for a specific service:**
  ```bash
  docker compose logs -f backend
  docker compose logs -f student-portal
  docker compose logs -f teacher-portal
  ```

- **Rebuild after making code changes:**
  ```bash
  docker compose up --build
  ```

---

## 💡 Local Non-Docker Development (Alternative)

If you prefer to run locally using Node.js without Docker:
```bash
npm install
npm run dev
```
This uses `concurrently` to start all three services simultaneously in one terminal window.
