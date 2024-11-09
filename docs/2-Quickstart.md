# Quickstart Guide

This quickstart guide includes installation, creating a new project, and writing a basic "Hello, World!" application.

---
# Global Prerequisites

1. **Install .NET SDK**  
	If you want to run any of the listed C# applications outside of the container, it is recommended to download and install the latest [.NET SDK](https://dotnet.microsoft.com/download) to compile and run your C# applications.

3. **Install Docker Compose**	
	Download and install the latest version of [Docker Compose](https://docs.docker.com/compose/install/). This can be done through Docker Desktop, or a standalone version. 

5. **Verify Installation**  
	Open a terminal or command prompt and run:
```bash
dotnet --version       # .NET SDK
docker compose version # Docker Compose
```
   You should see the installed version of both .NET SDK and Docker Compose.
   
> **Note:** In order to get Docker commands to work within Windows Subsystem for Linux (WSL) you'll need to enable 'WSL integration' in Docker's resource settings. 

---
# Run the Application

1. **Build and Run**  
   In the terminal, make sure you’re in the project directory and enter:
   ```bash
   dotnet run               # Outside of container
   docker compose up --build # With container
   ```

--- 

_This guide provides a basic setup. Check out the official documentation of the listed resources for a more detailed guide._