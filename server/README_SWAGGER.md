# Course Student Management API Documentation

This document provides information about the Swagger API documentation for the Course Student Management System.

## Overview

The API documentation is built using Swagger/OpenAPI 3.0 and provides comprehensive documentation for all endpoints in the Course Student Management System.

## Accessing the API Documentation

Once the server is running, you can access the Swagger UI at:

```
http://localhost:5000/api-docs
```

## API Base URL

All API endpoints are prefixed with `/api`:

- Base URL: `http://localhost:5000/api`

## Authentication

Most endpoints require authentication using JWT Bearer tokens. To authenticate:

1. Use the `/api/auth/login` endpoint to get a JWT token
2. Include the token in the Authorization header: `Bearer <your-token>`

## API Endpoints by Category

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `PUT /change-password` - Change user password
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile

### Courses (`/api/courses`)
- `GET /` - Get all courses
- `GET /active` - Get active courses only
- `GET /my-courses` - Get courses by current instructor
- `GET /{id}` - Get course by ID
- `POST /` - Create a new course (Instructor/Admin)
- `PUT /{id}` - Update course (Instructor/Admin)
- `PATCH /{id}/admin-status` - Update course status (Admin only)
- `DELETE /{id}` - Delete course (Instructor/Admin)

### Quizzes (`/api/quizzes`)
- `POST /` - Create a new quiz (Instructor/Admin)
- `PUT /{quizId}` - Update quiz (Instructor/Admin)
- `GET /course/{courseId}` - Get quiz for a course (Student)
- `GET /course/{courseId}/instructor` - Get quiz for instructor view
- `GET /instructor` - Get all quizzes by current instructor
- `POST /submit` - Submit quiz answers (Student)
- `GET /{quizId}/submissions` - Get quiz submissions (Instructor/Admin)
- `GET /course/{courseId}/summary` - Get quiz summary for a course
- `POST /course/{courseId}/approve/{studentId}` - Approve course completion
- `GET /course/{courseId}/student/{studentId}` - Get student's quiz progress

### Enrollments (`/api/enrollments`)
- `POST /` - Enroll in a course (Student)
- `GET /my-courses` - Get current user's enrolled courses (Student)
- `GET /by-course/{courseId}/students` - Get students in a course (Instructor/Admin)
- `GET /instructor-students` - Get all students in instructor's courses
- `PUT /{enrollmentId}/approve` - Approve enrollment (Instructor/Admin)
- `DELETE /{enrollmentId}/reject` - Reject enrollment (Instructor/Admin)
- `DELETE /{enrollmentId}` - Cancel enrollment (Student)

### Certificates (`/api/certificates`)
- `GET /` - Get current user's certificates (Student)
- `GET /all` - Get all certificates (Admin)
- `POST /issue` - Issue a certificate (Instructor/Admin)
- `POST /issue-completed` - Issue certificate for completed course
- `DELETE /{id}` - Revoke certificate (Admin)
- `GET /{id}` - Get certificate by ID (Student)

### Users (`/api/user`)
- `GET /me` - Get current user information
- `GET /admin-only` - Admin only endpoint
- `GET /` - Get all users (Admin)
- `PUT /{id}/role` - Update user role (Admin)
- `DELETE /{id}` - Delete user (Admin)

### Dashboard (`/api/dashboard`)
- `GET /admin` - Get admin dashboard statistics
- `GET /instructor` - Get instructor dashboard statistics
- `GET /student` - Get student dashboard statistics

## Data Models

The API documentation includes comprehensive schemas for all data models:

- **User**: User information with roles (student, instructor, admin)
- **Course**: Course details with content and status
- **Quiz**: Quiz structure with questions and answers
- **Enrollment**: Student course enrollment information
- **Certificate**: Course completion certificates

## Error Responses

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing the API

You can test the API directly from the Swagger UI:

1. Navigate to `http://localhost:5000/api-docs`
2. Click on any endpoint to expand it
3. Click "Try it out" to test the endpoint
4. Fill in the required parameters
5. Click "Execute" to make the request

## Security

- All sensitive endpoints require JWT authentication
- Role-based access control is implemented
- Admin-only endpoints are clearly marked
- Instructor endpoints require instructor or admin role
- Student endpoints require student role

## Getting Started

1. Start the server: `npm run dev`
2. Open your browser and go to `http://localhost:5000/api-docs`
3. Use the `/api/auth/register` endpoint to create a test account
4. Use the `/api/auth/login` endpoint to get a JWT token
5. Click the "Authorize" button in Swagger UI and enter your token
6. Start testing the API endpoints

## Notes

- The server runs on port 5000 by default
- Make sure MongoDB is running and connected
- JWT tokens expire after a certain time period
- All timestamps are in ISO 8601 format
- Object IDs are MongoDB ObjectId strings 