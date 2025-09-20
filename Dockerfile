### STAGE 1:BUILD ###
FROM node:18-alpine AS build
WORKDIR /app
RUN npm cache clean --force
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build --prod

### STAGE 2:RUN ###
FROM nginx:latest AS ngi
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80