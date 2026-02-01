# 🔴 Cũ:
# FROM node:18-alpine

# 🟢 Mới (Sửa thành dòng này):
FROM node:20-alpine

# ... Các dòng bên dưới giữ nguyên ...
RUN apk add --no-cache bash git
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 8081
CMD ["npm", "start"]