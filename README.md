# EduSync Learning Management System

A complete learning management system with student and instructor roles, course management, assessments, and results tracking.

## Project Structure

This project consists of two main components:

1. **EduSyncAPIDemo** - ASP.NET Core backend API that handles data storage and business logic
2. **edusync-frontend** - React.js frontend that provides the user interface

## Features

- User authentication with role-based access control (Student/Instructor)
- Course creation and management for instructors
- Assessment creation with multiple-choice questions
- Student enrollment in courses
- Assessment taking and automatic grading
- Results tracking and reporting

## Technologies Used

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT Authentication

### Frontend
- React.js
- React Router
- Axios for API communication
- Bootstrap for responsive design

## Getting Started

### Prerequisites
- .NET 6+ SDK
- Node.js and npm
- SQL Server

### Setup Instructions

#### Backend
1. Navigate to the EduSyncAPIDemo directory
2. Restore dependencies: `dotnet restore`
3. Update the connection string in `appsettings.json` if needed
4. Run migrations: `dotnet ef database update`
5. Start the API: `dotnet run`

#### Frontend
1. Navigate to the edusync-frontend directory
2. Install dependencies: `npm install`
3. Set the API URL in the `.env` file
4. Start the development server: `npm start`

## API Endpoints

The API is organized around the following resources:

- /api/Auth - Authentication and user management
- /api/Courses - Course CRUD operations
- /api/Assessments - Assessment creation and management
- /api/Results - Student assessment results

## License

This project is licensed under the MIT License.
