# ViApp Backend API

Backend API server for the ViBand-ViApp Health Monitoring System.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Language**: TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your MySQL credentials

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. (Optional) Seed database with sample data:
```bash
npm run seed
```

7. Start development server:
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Student APIs

- `GET /api/student/profile` - Get student profile
- `PUT /api/student/profile` - Update student profile
- `GET /api/student/vitals/latest` - Get latest vitals
- `GET /api/student/vitals/history` - Get vitals history
- `GET /api/student/alerts` - Get student alerts

### Admin APIs

- `POST /api/admin/device/register` - Register new device
- `POST /api/admin/student/create` - Create student account
- `GET /api/admin/students` - Get all students
- `GET /api/admin/student/:id` - Get student details
- `GET /api/admin/alerts` - Get all alerts
- `PUT /api/admin/device/:id/assign` - Assign device to student

### Data Sync

- `POST /api/vitals/upload` - Upload single vital reading
- `POST /api/vitals/bulk-upload` - Bulk upload (offline sync)

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── prisma/          # Prisma schema & seed
│   └── server.ts        # App entry point
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## License

MIT
