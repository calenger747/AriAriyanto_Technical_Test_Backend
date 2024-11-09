
# Project Documentation

## User Authentication

This project implements user authentication with roles. Below are the available roles and sample users for login:

### User List

- **Super Admin**:
  - Email: `superadmin@mail.com`
  - Password: `superadmin+`
  - Role: Super Admin

- **Customer Service**:
  - Email: `customer_service@mail.com`
  - Password: `customerservice+`
  - Role: Customer Service

- **Salesperson**:
  - Email: `salesperson1@mail.com`
  - Password: `salesperson1+`
  - Role: Salesperson

- **Operational**:
  - Email: `operational@mail.com`
  - Password: `operational+`
  - Role: Operational

- **Client**:
  - Email: `john.doe@example.com`
  - Password: `f6dsaFjz`
  - Role: Client

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/calenger747/AriAriyanto_Technical_Test_Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your `.env` file with appropriate database connection and JWT secret key.

### Running the Project

1. To start the server:
   ```bash
   npm run start
   ```

2. To test the API, use Postman or any API testing tool to send requests.

### Authentication

- The login API allows users to authenticate with their username (email) and password. A JWT token is returned upon successful authentication.

- Include the JWT token in the `Authorization` header for protected routes.

---

## Endpoints

### POST /login

#### Request Body:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

#### Response:
```json
{
  "token": "JWT_TOKEN"
}
```

---

### Example Usage

- To create a lead, a user with the role `Customer Service` or `Super Admin` can call the `/insert-lead` endpoint.
- A `Salesperson` can access leads assigned to them and update their status.
- A `Client` has access to their own data and can view associated leads and surveys.

