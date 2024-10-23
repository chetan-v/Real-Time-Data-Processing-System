# Weather Monitoring Application

This project consists of a client-side React application and a server-side Node.js application that monitors weather data using the OpenWeatherMap API and stores it in a MongoDB database.

## Prerequisites

- Docker and Docker Compose must be installed on your machine.

## Getting Started

Follow these steps to set up and run the application:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Set Up Environment Variables

Ensure you have the necessary environment variables set up. You can modify them directly in the `docker-compose.yml` file:

- `MONGODB_URI`: The URI for connecting to MongoDB. It's already set to connect to the MongoDB service defined in the `docker-compose.yml`.
- `OPENWEATHERMAP_API_KEY`: Your OpenWeatherMap API key. Replace the placeholder with your actual API key.

### 3. Build and Run the Application

Use Docker Compose to build and run the application:

```bash
docker-compose up --build
```

### 4. Access the Application

- The client application will be accessible at `http://localhost:3000`.
- The server application will be running on `http://localhost:5000`.

### 5. Stopping the Application

To stop the application, press `Ctrl+C` in the terminal where the Docker Compose is running, or run:

```bash
docker-compose down
```

This command will stop and remove the containers.

## Additional Information

- The client application is built using Create React App.
- The server application is built using Express.js and connects to a MongoDB database.
- Weather data is fetched every 5 minutes and stored in MongoDB.
- Alerts are generated if the temperature in any city exceeds 35°C.
