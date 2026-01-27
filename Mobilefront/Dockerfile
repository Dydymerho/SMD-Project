# Sử dụng Node.js phiên bản ổn định (nên khớp với version máy bạn đang chạy ổn)
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file package để cài thư viện trước (tối ưu cache)
COPY package.json yarn.lock* package-lock.json* ./

# Cài đặt dependencies
RUN npm install
# Nếu dùng yarn thì đổi thành: RUN yarn install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở port 8081 (Port mặc định của Metro Bundler)
EXPOSE 8081

# Lệnh chạy Metro Bundler khi container khởi động
CMD ["npm", "start"]