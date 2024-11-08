# Quickstart Guide for C# Application

This quickstart guide walks you through setting up a simple C# application. It includes installation, creating a new project, and writing a basic "Hello, World!" application.

---

## Prerequisites

1. **Install .NET SDK**  
   Download and install the latest [.NET SDK](https://dotnet.microsoft.com/download) to compile and run your C# applications.

2. **Verify Installation**  
   Open a terminal or command prompt and run:
   ```bash
   dotnet --version
   ```
   You should see the installed version of the .NET SDK.

---

## Create a New Project

1. **Initialize a Console Application**  
   In the terminal, navigate to your desired project directory and run:
   ```bash
   dotnet new console -o HelloWorldApp
   ```
   This command creates a new console application in a folder named `HelloWorldApp`.

2. **Navigate to Project Folder**
   ```bash
   cd HelloWorldApp
   ```

---

## Write Your First Program

1. **Open the Program File**  
   Open `Program.cs` in your favorite text editor or IDE (e.g., Visual Studio Code, Visual Studio).

2. **Replace the Code**  
   Replace the default code with the following to output "Hello, World!" to the console:
   ```csharp
   using System;

   namespace HelloWorldApp
   {
       class Program
       {
           static void Main(string[] args)
           {
               Console.WriteLine("Hello, World!");
           }
       }
   }
   ```

---

## Run the Application

1. **Build and Run**  
   In the terminal, make sure you’re in the project directory and enter:
   ```bash
   dotnet run
   ```
   You should see the output:
   ```
   Hello, World!
   ```

---

## Next Steps

- Explore more C# syntax and features.
- Add additional methods and classes to practice C# concepts.
- Experiment with libraries and frameworks in the .NET ecosystem.

--- 

This guide provides a basic setup. Check out the [official .NET documentation](https://docs.microsoft.com/dotnet) for more tutorials and resources.
