FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/src ./backend/src

# Copy frontend build
COPY frontend/dist ./frontend/dist

# Create output directory
RUN mkdir -p /app/backend/output /app/backend/uploads

# Environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start backend
CMD ["node", "backend/src/index.js"]
