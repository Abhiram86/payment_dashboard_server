# NestJS API Documentation

## Client Repo

[Client Repo](https://github.com/Abhiram86/payment_dashboard_client)

## Table of Contents

1. [Auth Module](#auth-module)
   - [Auth Controller](#auth-controller)
   - [Auth Service](#auth-service)
2. [Payments Module](#payments-module)
   - [Payments Controller](#payments-controller)
   - [Payments Service](#payments-service)
3. [Entities](#entities)
4. [Environment Variables](#environment-variables)

---

## Auth Module

### Overview

Handles user authentication and authorization using JWT.

### Auth Controller

`POST /auth/login`  
**Request Body (LoginDto):**

```typescript
{
  email: string;
  password: string;
}
```

**Response:**

```typescript
{
  id: number;
  username: string;
  email: string;
  token: string; // JWT token
}
```

`POST /auth/register`  
**Request Body (RegisterDto):**

```typescript
{
  username: string;
  email: string;
  password: string;
}
```

**Response:** Same as login

`GET /auth/me`  
**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```typescript
{
  id: number;
  username: string;
  email: string;
}
```

### Auth Service

**Methods:**

- `login(data: LoginDto)` - Authenticates user
- `register(data: RegisterDto)` - Creates new user
- `getUser(id: number)` - Gets user profile

**Dependencies:**

- `@nestjs/jwt` for token generation
- `bcrypt` for password hashing
- TypeORM `User` repository

---

## Payments Module

### Overview

Manages payment transactions and statistics.

### Payments Controller

`GET /payments`  
**Query Params:**

- `status?`: 'pending' | 'success' | 'failed'
- `method?`: 'card' | 'upi' | 'bank_transfer'

**Response:**

```typescript
Payment[] // Array of payment entities
```

`POST /payments`  
**Request Body (CreatePaymentDto):**

```typescript
{
  amount: number;
  receiver: string;
  method: 'card' | 'upi' | 'bank_transfer';
}
```

**Response:** Created payment entity

`GET /payments/stats`  
**Response:**

```typescript
{
  counts: {
    total: number;
    success: number;
    failed: number;
    pending: number;
  }
  amounts: {
    totalRevenue: number;
    averageAmount: number;
    minAmount: number;
    maxAmount: number;
  }
  methods: {
    card: number;
    upi: number;
    bank_transfer: number;
  }
  successRate: number;
}
```

`GET /payments/:id`  
**Response:** Single payment entity

### Payments Service

**Methods:**

- `getPayments()` - Retrieves filtered payments
- `createPayment()` - Simulates new payment
- `getPaymentStats()` - Calculates payment metrics
- `getPayment()` - Gets single payment

**Dependencies:**

- TypeORM `Payment` and `User` repositories

---

## Entities

### User Entity

```typescript
{
  id: number;
  username: string;
  email: string;
  password: string; // Hashed
  payments: Payment[]; // One-to-many relation
}
```

### Payment Entity

```typescript
{
  id: number;
  amount: number;
  receiver: string;
  method: 'card' | 'upi' | 'bank_transfer';
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
  user: User; // Many-to-one relation
}
```

---

## Environment Variables

Create `.env` file in root directory:

```env
PORT=8080(or anything)
JWT_SECRET=your_secure_secret
DATABASE_URL=postgres://user:password@localhost:5432/db_name
```

---

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Start server:

```bash
npm run start:dev
```

---

## Architecture Notes

- **Authentication**: JWT with 1-day expiration
- **Security**: Password hashing with bcrypt
- **Validation**: Automatic via DTOs
- **Database**: PostgreSQL (configured via TypeORM)
- **Error Handling**: Custom BadRequestExceptions

This documentation covers all the key aspects of your NestJS implementation. Would you like me to add any specific details or generate a Postman collection for the API endpoints?
