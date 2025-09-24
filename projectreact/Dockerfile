# ---- build stage ----
FROM node:20 AS build
WORKDIR /app

# package.json(+ lock 있으면)만 먼저 복사
COPY package*.json ./

# lock 있으면 ci, 없으면 install  → 그 다음 esbuild 고정 + 중복 정리
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi \
    && npm i -D esbuild@0.25.10 \
    && npm dedupe

# 앱 소스 복사
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM nginx:alpine
RUN mkdir -p /etc/nginx/conf.d
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]