# Use an official Node.js runtime based on Alpine for a lightweight image.
FROM node:22-alpine

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy package files and install dependencies.
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code.
COPY . .

# Expose the port the application listens on (adjust the port if necessary).
EXPOSE 3000

# Define the command to run the application.
CMD ["npm", "start"]
