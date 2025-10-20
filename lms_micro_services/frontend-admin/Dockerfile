FROM node:16-alpine as build

# Tăng bộ nhớ cho Node.js và tối ưu hóa cấu hình npm
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy all files
COPY . .

# Build the React app với tùy chọn bỏ qua warnings và tối ưu build
RUN CI=false DISABLE_ESLINT_PLUGIN=true npm run build

# Production stage
FROM nginx:1.25.3-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Install curl for health check
RUN apk add --no-cache curl

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]