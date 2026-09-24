# Use official Node.js 20 LTS Alpine image for minimal size and security
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Set default production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts

# Copy the rest of application files
COPY . .

# Expose the application port
EXPOSE 3000

# Start server directly with Node
CMD ["node", "server.js"]
