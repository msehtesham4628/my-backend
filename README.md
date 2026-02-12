# Backend API

Node.js/Express server handling Authentication and RBAC for the Micro-Frontend architecture.

## Features
-   **JWT Authentication**: `/api/auth/login`
-   **RBAC**: Middleware to protect routes based on `admin` or `user` role.
-   **MFE Configuration**: `/api/config/mfe` returns the remote URL based on the user's role.

## Setup
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the server:
    ```bash
    npm run dev
    ```
    Runs on port `4000`.
