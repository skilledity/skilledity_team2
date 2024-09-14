# Skilledity Backend Team-2

# API DOCUMENTATION

Here is the API documentation for your Express.js backend, including the available endpoints, HTTP methods, expected request bodies, and responses. This documentation is based on the `index.js`, `school.route.js`, and `school.controller.js` files you provided.

---

## API Documentation

### Base URL: `http://localhost:3000`

### 1. **Test API**

- **Endpoint:** `/`
- **Method:** `GET`
- **Description:** This endpoint checks if the API is running.
- **Response:**
    - `200 OK`
    
    ```json
    {
      "message": "API is Working"
    }
    
    ```
    

---

### 2. **Get All Schools**

- **Endpoint:** `/school/get-school`
- **Method:** `GET`
- **Description:** Fetches all schools from the database.
- **Response:**
    - `200 OK` (Example response)
    
    ```json
    [
      {
        "school_id": 1,
        "name": "Green Valley High",
        "address": "123 Green Street"
      },
      ...
    ]
    
    ```
    

---

### 3. **Register a Student**

- **Endpoint:** `/school/register-student`
- **Method:** `POST`
- **Description:** Registers a new student with the provided information.
- **Request Body:**
    
    ```json
    {
      "email": "student@example.com",
      "regno": "12345",
      "name": "John Doe",
      "age": 20,
      "course": "Computer Science",
      "school_id": 1,
      "address": "123 Elm Street"
    }
    
    ```
    
- **Response:**
    - `201 Created`
    
    ```json
    {
      "message": "Student registered successfully, password sent via email"
    }
    
    ```
    
    - `400 Bad Request` (If required fields are missing)
    
    ```json
    {
      "error": "All fields are required"
    }
    
    ```
    
    - `500 Internal Server Error`

---

### 4. **Forgot Password**

- **Endpoint:** `/school/forget-password`
- **Method:** `PUT`
- **Description:** Sends a new password to the student’s email if they forget their password.
- **Request Body:**
    
    ```json
    {
      "email": "student@example.com"
    }
    
    ```
    
- **Response:**
    - `200 OK`
    
    ```json
    {
      "message": "New password has been sent to your email."
    }
    
    ```
    
    - `404 Not Found` (If the student does not exist)
    
    ```json
    {
      "error": "Student not found"
    }
    
    ```
    
    - `500 Internal Server Error`

---

### 5. **Change Password**

- **Endpoint:** `/school/change-password`
- **Method:** `PUT`
- **Description:** Allows a student to change their password.
- **Request Body:**
    
    ```json
    {
      "email": "student@example.com",
      "newPassword": "newpassword123"
    }
    
    ```
    
- **Response:**
    - `200 OK`
    
    ```json
    {
      "message": "Password successfully changed"
    }
    
    ```
    
    - `400 Bad Request` (If required fields are missing)
    
    ```json
    {
      "error": "Email and new password are required"
    }
    
    ```
    
    - `500 Internal Server Error`

---

### 6. **Convert CSV to JSON**

- **Endpoint:** `/school/upload-csv`
- **Method:** `POST`
- **Description:** Uploads a CSV file and processes it. It also removes duplicates based on the `email` field.
- **Request Body:** `multipart/form-data` (with a `file` field containing the CSV file)
- **Response:**
    - `200 OK`
    
    ```json
    {
      "message": "CSV file parsed successfully.",
      "data": [
        { "name": "John Doe", "email": "johndoe@example.com", "age": 25, ... },
        ...
      ]
    }
    
    ```
    
    - `500 Internal Server Error`

---

## Error Handling

- **400 Bad Request:** Returned if required fields are missing in the request body.
- **404 Not Found:** Returned if a student or school is not found for the given criteria.
- **500 Internal Server Error:** Returned for any internal issues that arise during the request.

---