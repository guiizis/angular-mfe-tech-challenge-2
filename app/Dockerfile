FROM node:24.15.0-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install -g npm@11.12.1
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/app/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
