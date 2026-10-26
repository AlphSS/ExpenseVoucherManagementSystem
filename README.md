# Expense Voucher Management System (EVMS)

## About the Project

The **Expense Voucher Management System (EVMS)** is a web-based application designed to simplify employee expense reporting and approval. It allows employees to create and manage expense vouchers while authorized personnel handle the approval and accounting workflow.

The system implements role-based access control to separate employee, director, and accounts operations, along with voucher ownership restrictions to protect employee data.

## Live Application

- **Frontend:** https://expense-voucher-management-system-sigma.vercel.app
- **Backend API:** https://expensevouchermanagementsystem-bl2e.onrender.com

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT) and bcrypt
- **File Uploads:** Cloudinary
- **Deployment:** Vercel (frontend) and Render (backend and database)

## Key Features

- **Authentication:** Secure login with hashed passwords and JWT-based authentication.
- **Expense Management:** Employees can create and manage their expense vouchers.
- **Approval Workflow:** Supports role-based expense processing for directors and accounts personnel.
- **Role-Based Access:** Employee, Director, and Accounts roles have different responsibilities.
- **Data Isolation:** Employees can access only their own vouchers, enforced through backend ownership checks.
- **File Uploads:** Cloudinary integration for storing supported documents and signatures.
- **Cloud Deployment:** Frontend and backend are deployed separately for easier maintenance and access.

## User Roles

| Role | Responsibility |
|---|---|
| Employee | Creates and manages personal expense vouchers and submits them for approval. |
| Director | Handles the director-level approval workflow. |
| Accounts | Handles the accounts-related processing of vouchers. |

## Demo Login

Use the following test account to explore the employee interface and test voucher data isolation.

| Field | Details |
|---|---|
| Role | Employee |
| Email | `employee2@example.com` |
| Password | `EmployeeTwoTest2026!` |

**Data isolation test:** Log in as Employee 2 and verify that vouchers created by another employee are not visible. This account is for demonstration purposes only and must not be used for real expenses or sensitive information.

## Running the Project Locally

### Prerequisites

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone <https://github.com/AlphSS/ExpenseVoucherManagementSystem.git>
cd ExpenseVoucherManagementSystem
```

Replace the repository URL and folder name with the actual values for your project.

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the required database connection, JWT secret, and Cloudinary environment variables.

Initialize the database using:

`backend/src/database/schema.sql`

Start the backend using the development script defined in `backend/package.json`, commonly:

```bash
npm run dev
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Configure `VITE_API_URL` in the frontend environment to point to your backend API. For a local backend running on port 5000, use:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## Project Structure

```text
ExpenseVoucherManagementSystem/
├── frontend/       # React application and user interface
└── backend/        # Express API, authentication and business logic
    └── src/
        ├── config/     # Database and application configuration
        ├── controllers/# Request handling
        ├── routes/     # API endpoints
        ├── services/   # Business logic
        └── database/   # Database schema
```

*The structure above is a simplified overview; actual folders may vary.*

## Security

- Passwords are hashed using bcrypt rather than stored as plain text.
- JWTs are used for authenticated API requests.
- Backend authorization should validate user roles and voucher ownership for every protected operation.
- Environment variables must be kept private and excluded from version control.
- Public demo credentials must never be used for production accounts.

## Future Enhancements

- Expense analytics and reporting dashboards.
- Email notifications for voucher status changes.
- Improved audit logs and approval history.
- Automated testing and expanded security checks.

## License

This project is intended for educational and demonstration purposes.
