# Urban-IT Ledger Financial Management System

A comprehensive financial management system built with React, Node.js, PostgreSQL, and Prisma.

## 🏗️ Project Structure

```
urban-it-ledger/
├── client/                 # Frontend React application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── server/                # Backend Node.js API
│   ├── src/               # Server source code
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema and migrations
│   └── package.json       # Backend dependencies
├── package.json           # Root package.json with scripts
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   # Copy and configure server environment
   cp server/.env.example server/.env
   # Edit server/.env with your database credentials
   ```

3. **Set up the database:**
   ```bash
   npm run server:db:generate
   npm run server:db:push
   npm run server:db:seed
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📱 Demo Credentials

- **Admin**: `owner@urbanit.com` / `password`
- **User**: `user@urbanit.com` / `password`
- **Read-only**: `readonly@urbanit.com` / `password`

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install:all` - Install dependencies for all packages
- `npm run build` - Build the frontend for production
- `npm run start` - Start the backend in production mode

### Frontend (client/)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (server/)
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with demo data

## 🔧 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma ORM** for database operations
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for input validation

## 🔐 Features

- **User Authentication** with JWT tokens
- **Role-based Access Control** (Admin/User)
- **Permission System** (Read/Write access)
- **Transaction Management** (Income/Expenditure tracking)
- **Financial Reporting** with charts and analytics
- **Admin Panel** for user management
- **Responsive Design** with dark/light mode
- **Real-time Data** synchronization

## 🗄️ Database Schema

- **Users**: Authentication and role management
- **ApprovedUsers**: Email whitelist for registration
- **Transactions**: Financial transaction records
- **Enums**: Roles, permissions, and transaction types

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- CORS configuration
- Input validation and sanitization
- Role and permission-based access control

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration (approved emails only)

### Transactions
- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Reports
- `GET /dashboard/summary` - Financial summary
- `GET /reports/monthly` - Monthly reports
- `GET /reports/category` - Category breakdown

### Admin (Admin only)
- `GET /admin/users` - List users
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `POST /admin/approve` - Approve user email

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
</btml:action>