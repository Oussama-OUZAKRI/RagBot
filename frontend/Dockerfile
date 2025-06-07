FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port and start the app
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
