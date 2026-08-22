# 🚀 EduMap Platform — Cloud & Vercel Deployment Guide

Follow this simple 3-step guide to get your live production URLs for judges!

---

## 🏗️ Architecture Overview

- 🎓 **Student Portal** $\rightarrow$ **Vercel** (`https://edumap-student.vercel.app`)
- 🧑‍🏫 **Teacher Portal** $\rightarrow$ **Vercel** (`https://edumap-teacher.vercel.app`)
- ⚡ **Backend API & WebSockets** $\rightarrow$ **Render / Railway** (`https://edumap-api.onrender.com`)

---

## ⚡ STEP 1: Deploy Backend (Render.com - 2 Mins)

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **"New +"** $\rightarrow$ **"Web Service"** $\rightarrow$ Select your **`eduMap-github`** repository.
3. Configure the service:
   - **Name**: `edumap-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add **Environment Variables** (under Advanced):
   - `PORT` = `5001`
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://sohamharyani101_db_user:CdSeOGz52bX16Xtr@cluster0.d86ggw1.mongodb.net/eduMapDB?appName=Cluster0`
   - `JWT_SECRET` = `edumap_jwt_super_secret_key_2026_production`
   - `GEMINI_API_KEY` = `AIzaSyDaadfwDsZcGMAWCfmbwgaW85rym5Bpcbc`
   - `GEMINI_MODEL` = `gemini-3.5-flash`
5. Click **"Deploy Web Service"**.
6. 📋 Copy your Render backend URL (e.g. `https://edumap-backend-xyz.onrender.com`).

---

## 🎓 STEP 2: Deploy Student Portal (Vercel - 1 Min)

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **"Add New..."** $\rightarrow$ **"Project"** $\rightarrow$ Import **`eduMap-github`**.
3. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend/student-frontend`
4. Add **Environment Variables**:
   - `VITE_API_URL` = `https://edumap-backend-xyz.onrender.com` *(Your Render backend URL from Step 1)*
   - `VITE_SOCKET_URL` = `https://edumap-backend-xyz.onrender.com`
   - `VITE_TEACHER_PORTAL_URL` = `https://edumap-teacher.vercel.app` *(Will be active after Step 3)*
5. Click **"Deploy"**.

---

## 🧑‍🏫 STEP 3: Deploy Teacher Portal (Vercel - 1 Min)

1. In Vercel, click **"Add New..."** $\rightarrow$ **"Project"** $\rightarrow$ Import **`eduMap-github`** again.
2. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend/teacher-portal-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
3. Add **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://edumap-backend-xyz.onrender.com/api`
   - `VITE_STUDENT_PORTAL_URL` = `https://edumap-student.vercel.app` *(Your Student Vercel URL from Step 2)*
4. Click **"Deploy"**.

---

## 🎉 You're Done!

You now have 2 live HTTPS links you can paste directly in your hackathon submission or show judges on any device:
- **Student Portal & Doubt Solver**: `https://edumap-student.vercel.app`
- **Teacher Portal & AI Quiz Generator**: `https://edumap-teacher.vercel.app`
