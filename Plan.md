Set up a professional environment where Spring Boot (Maven) and React (Vite) coexist with Hot Reloading and No CORS issues, you need a "Hybrid" architecture.

During Development, you run two separate servers (Java + Node) connected by a proxy. During Production, Maven bundles everything into a single JAR file.

Here is the step-by-step setup.
1. Recommended Folder Structure

Don't mix root files. Keep the frontend inside your standard Maven structure, but treated as a distinct module.

Recommended Path: src/main/frontend
Plaintext

my-spring-project/
├── pom.xml                 <-- Maven builds everything
├── src/
│   ├── main/
│   │   ├── java/           <-- Spring Boot Backend code
│   │   ├── resources/
│   │   │   └── static/     <-- (Empty in Dev, populated by Maven in Prod)
│   │   └── frontend/       <-- YOUR REACT VITE PROJECT LIVES HERE
│   │       ├── package.json
│   │       ├── vite.config.js
│   │       ├── src/        <-- React source code
│   │       └── node_modules/

Setup Command: Inside your Spring Boot root, run:
Bash

cd src/main
npm create vite@latest frontend -- --template react

2. Development Setup (Hot Reloading & CORS)

You will run Spring Boot on port 8080 and Vite on port 3000. To prevent CORS errors and enable easy communication, you configure Vite to proxy API requests to Spring Boot.

File: src/main/frontend/vite.config.js
JavaScript

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Set the port to avoid conflicts
    port: 3000, 
    // 2. Proxy API requests to Spring Boot
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Your Spring Boot Backend
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Output build files to a folder Maven can easily find
    outDir: '../resources/static', 
    emptyOutDir: true, // Clean old files on build
  }
})

How to Run in Dev:

    Terminal 1: mvn spring-boot:run (Starts Backend on 8080)

    Terminal 2: cd src/main/frontend && npm run dev (Starts Frontend on 3000)

Result: You open http://localhost:3000. When React fetches /api/users, Vite forwards it to localhost:8080/api/users seamlessly. Hot reloading works perfectly because you are using the Vite server.
3. Production Build (Maven Automation)

To make "Maven build the whole project," use the frontend-maven-plugin. This plugin installs Node, runs the build, and ensures the files end up in the final JAR.

File: pom.xml (Add this to <plugins>)
XML

<plugin>
    <groupId>com.github.eirslett</groupId>
    <artifactId>frontend-maven-plugin</artifactId>
    <version>1.15.0</version> <configuration>
        <workingDirectory>src/main/frontend</workingDirectory>
        <installDirectory>target</installDirectory>
    </configuration>

    <executions>
        <execution>
            <id>install node and npm</id>
            <goals>
                <goal>install-node-and-npm</goal>
            </goals>
            <configuration>
                <nodeVersion>v20.10.0</nodeVersion> </configuration>
        </execution>

        <execution>
            <id>npm install</id>
            <goals>
                <goal>npm</goal>
            </goals>
            <configuration>
                <arguments>install</arguments>
            </configuration>
        </execution>

        <execution>
            <id>npm run build</id>
            <goals>
                <goal>npm</goal>
            </goals>
            <configuration>
                <arguments>run build</arguments>
            </configuration>
        </execution>
    </executions>
</plugin>

Note: In vite.config.js (step 2), we set outDir to ../resources/static. When Maven runs npm run build, Vite dumps the production HTML/JS/CSS directly into Spring Boot's static folder before the JAR is packaged.
4. Handling Client-Side Routing (SPA Fallback)

In production (and dev), if a user refreshes the page at http://localhost:8080/dashboard, Spring Boot will try to find a /dashboard controller and fail (404). You need to tell Spring to forward unknown routes to index.html so React Router can handle them.

File: src/main/java/.../SpaController.java
Java

package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Forward all non-API and non-static-file requests to index.html
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}

Summary of Workflow

Feature,Development,Production
Server,Two servers (8080 & 3000),One Server (Java JAR on 8080)
URL,localhost:3000,localhost:8080
API Calls,Proxied by Vite to 8080,Direct (Same Origin)
Build Tool,npm run dev,mvn clean install