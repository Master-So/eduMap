# Stage 1: Build Vite React App with base /teacher/
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ENV VITE_BASE_PATH=/teacher/
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/public /usr/share/nginx/html/teacher

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
