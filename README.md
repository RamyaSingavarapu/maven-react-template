# Maven React Template

A full-stack template featuring a **Spring Boot** backend and a **React (Vite)** frontend, integrated into a single Maven-managed project. This setup provides a seamless development experience with hot reloading and a unified production build.

## Architecture Overview

The project uses a "Hybrid" architecture:
- **Development:** Two separate servers run concurrently. Vite (port 3000) proxies API requests to Spring Boot (port 8080), avoiding CORS issues while enabling Hot Module Replacement (HMR).
- **Production:** The `frontend-maven-plugin` automates the Node.js environment setup, installs dependencies, and builds the React app. The resulting static assets are bundled into the Spring Boot JAR, allowing the entire application to run as a single executable.

## Project Structure

```text
maven-react-template/
├── pom.xml                 # Root Maven configuration
├── src/
│   ├── main/
│   │   ├── java/           # Spring Boot Backend source
│   │   ├── resources/
│   │   │   └── static/     # Production frontend assets (populated by Maven)
│   │   └── frontend/       # React Vite Frontend source
│   │       ├── package.json
│   │       ├── vite.config.js
│   │       └── src/        # React source code
```

## Prerequisites

- **Java 24** or higher
- **Maven 3.9+**
- **Node.js** (Managed automatically by Maven during build, but useful for local dev)

## Getting Started

### 1. Run the Backend (Spring Boot)
Open a terminal in the root directory:
```bash
mvn spring-boot:run
```
The backend will start on `http://localhost:8080`.

### 2. Run the Frontend (React + Vite)
Open a second terminal in `src/main/frontend`:
```bash
npm install
npm run dev
```
The frontend will start on `http://localhost:3000`.

### 3. Access the App
Navigate to **`http://localhost:3000`**. All requests to `/api/*` are automatically proxied to the Spring Boot backend.

## Production Build

To package the entire application into a single runnable JAR file:

```bash
mvn clean package
```

This command will:
1. Install a local version of Node and NPM in the `target/` directory.
2. Run `npm install` in `src/main/frontend`.
3. Run `npm run build`, which outputs the optimized assets to `src/main/resources/static`.
4. Package the Spring Boot application along with the frontend assets into `target/maven-react-template-0.0.1-SNAPSHOT.jar`.

To run the production JAR:
```bash
java -jar target/maven-react-template-0.0.1-SNAPSHOT.jar
```
The full app will be available at `http://localhost:8080`.

## Key Technologies

- **Backend:** Spring Boot 4.0.2, Maven
- **Frontend:** React, Vite, ESLint
- **Integration:** `frontend-maven-plugin`
