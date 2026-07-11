FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_AUTH0_DOMAIN
ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN

ARG VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID

RUN npm run build

FROM nginx:alpine AS final

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
