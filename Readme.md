# School and Student Management API Documentation

This document outlines the API endpoints available for the **School and Student Management System**, providing details about each route, its purpose, request parameters, and expected responses.

---

## Base URL

`http://localhost:3000/`

---

## Endpoints

### 1. Get School

- **URL**: `/school/get-school`
- **Method**: `GET`
- **Description**: Fetches all schools from the database.
- **Response**:
    - **Success (200)**:
      ```json
      [
          {
              "school_id": 1,
              "school_name": "ABC School",
              "location": "City A"
          },
          {
              "school_id": 2,
              "school_name": "XYZ School",
              "location": "City B"
          }
      ]
      ```
    - **Error (500)**:
      ```json
      { "error": "Internal Server Error" }
      ```

---

### 2. Get Students by School ID

- **URL**: `/school/get-student/:id`
- **Method**: `GET`
- **Description**: Fetches all students for a specific school based on `school_id`.
- **Parameters**:
    - `id` (URL param): The ID of the school.
- **Response**:
    - **Success (200)**:
      ```json
      [
          {
              "student_id": 101,
              "name": "John Doe",
              "email": "john@example.com"
          },
          ...
      ]
      ```
    - **Error (400)**:
      ```json
      { "error": "School id is required" }
      ```
    - **Error (500)**:
      ```json
      { "error": "Internal Server Error" }
      ```

---

### 3. Register a Student

- **URL**: `/school/register-student`
- **Method**: `POST`
- **Description**: Registers a new student in the system.
- **Request Body** (JSON):
    ```json
    {
        "student_id": "1",
        "student_school_fk": "2",
        "name": "John Doe",
        "email": "john@example.com",
        "std_class": "10",
        "section": "A",
        "gender": "Male",
        "father_name": "David Doe",
        "dob": "2005-08-12",
        "contact_no": "1234567890"
    }
    ```
- **Response**:
    - **Success (201)**:
      ```json
      { "message": "Student registered successfully, password sent via email" }
      ```
    - **Error (400)**:
      ```json
      { "error": "All fields are required" }
      ```
    - **Error (500)**:
      ```json
      { "error": "Internal Server Error" }
      ```

---

### 4. Forgot Password

- **URL**: `/school/forget-password`
- **Method**: `PUT`
- **Description**: Resets the student’s password and sends the new password via email.
- **Request Body** (JSON):
    ```json
    {
        "email": "john@example.com"
    }
    ```
- **Response**:
    - **Success (200)**:
      ```json
      { "message": "New password has been sent to your email." }
      ```
    - **Error (404)**:
      ```json
      { "error": "Student not found" }
      ```
    - **Error (500)**:
      ```json
      { "error": "Internal Server Error" }
      ```

---

### 5. Change Password

- **URL**: `/school/change-password`
- **Method**: `PUT`
- **Description**: Allows a student to change their password.
- **Request Body** (JSON):
    ```json
    {
        "email": "john@example.com",
        "newPassword": "newPassword123"
    }
    ```
- **Response**:
    - **Success (200)**:
      ```json
      { "message": "Password successfully changed" }
      ```
    - **Error (400)**:
      ```json
      { "error": "Email and new password are required" }
      ```
    - **Error (404)**:
      ```json
      { "error": "Student not found" }
      ```
    - **Error (500)**:
      ```json
      { "error": "Internal Server Error" }
      ```

---

### 6. Upload CSV File

- **URL**: `/school/upload-csv`
- **Method**: `POST`
- **Description**: Uploads a CSV file and processes the data for student information.
- **Form Data**:
    - `file` (File): The CSV file to be uploaded.
- **Response**:
    - **Success (200)**:
      ```json
      {
          "message": "CSV file parsed successfully.",
          "data": [
              {
                  "email": "john@example.com",
                  "name": "John Doe"
              },
              ...
          ]
      }
      ```
    - **Error (500)**:
      ```json
      { "message": "Internal server error." }
      ```

---

### 7. Delete a Student

- **URL**: `/school/delete-student`
- **Method**: `DELETE`
- **Description**: Deletes a student from the database.
- **Request Body** (JSON):
    ```json
    {
        "email": "john@example.com"
    }
    ```
- **Response**:
    - **Success (200)**:
      ```json
      { "message": "Student deleted successfully" }
      ```
    - **Error (404)**:
      ```json
      { "error": "Student not found" }
      ```
    - **Error (500)**:
      ```json
      { "error": "Internal Server Error" }
      ```

---

## Scheduled Email Functions (Server-Side)

- **Resend email if student hasn't logged in for a long time**:
    - Sends reminder emails to students who haven't logged in for over 30 days.

- **Send welcome email if student hasn't logged in for the first time within 2 days**:
    - Sends a welcome email to students who registered but didn't log in within the first two days.

These email functions are executed on the server automatically without specific API endpoints.

---
