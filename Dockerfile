# Optional: portable single-service image (API + built client) for any container host.
# Requires MONGO_URI at runtime (e.g. MongoDB Atlas). Render can use render.yaml instead.

# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
COPY client/package*.json client/
RUN npm install && npm --prefix server install && npm --prefix client install
COPY . .
RUN npm run build

# ---- run stage ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV SERVE_CLIENT=true
ENV PORT=5000
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist
EXPOSE 5000
CMD ["node", "server/dist/main.js"]
