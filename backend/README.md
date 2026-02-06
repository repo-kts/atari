# Backend

Node.js/Express backend with Prisma ORM and Neon PostgreSQL database.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)

## Project Structure

```
backend/
├── controllers/        # HTTP request handlers
├── services/           # Business logic
├── repositories/       # Data access layer (Prisma queries)
├── routes/             # API route definitions
├── config/             # Configuration files
│   └── prisma.js       # Prisma client instance
├── prisma/
│   └── schema.prisma   # Database schema
├── generated/          # Generated Prisma client
├── index.js            # App entry point
├── setup.sh            # Setup script
├── .env.example        # Environment variables template
└── .env                # Your environment variables (gitignored)
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- A [Neon](https://neon.tech) database account

### Setup

1. **Clone the repository** and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. **Run the setup script**:
   ```bash
   npm run setup
   ```

   This will:
   - Install dependencies
   - Create `.env` file from template
   - Prompt you to add your Neon database URL
   - Generate Prisma client
   - Push the database schema

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:5000`

### Manual Setup

If you prefer manual setup:

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Add your Neon database URL to .env
# DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start server
npm run dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run setup` | First-time setup script |
| `npm run dev` | Start dev server with auto-reload |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:push` | Push schema to DB (no migration history) |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `PORT` | Server port (default: 5000) |

## Adding New Models

1. Edit `prisma/schema.prisma` to add your model
2. Run `npm run db:push` or `npm run db:migrate`
3. Create corresponding files in:
   - `repositories/` - Data access methods
   - `services/` - Business logic
   - `controllers/` - HTTP handlers
   - `routes/` - API routes
4. Register routes in `routes/index.js`
