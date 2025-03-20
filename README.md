# BoetePot

A modern web application for managing and tracking fines/payments.

## Features

- Modern React-based UI with TailwindCSS
- Full-stack TypeScript application
- PostgreSQL database with Drizzle ORM
- Real-time updates with WebSocket
- Authentication system
- Responsive design

## Tech Stack

- Frontend: React, Vite, TailwindCSS
- Backend: Express.js, TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: Passport.js
- Real-time: WebSocket

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/boetepot.git
cd boetepot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
PORT=3000
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Deployment

This project is configured for deployment on Render.com. See the `render.yaml` file for deployment configuration.

## License

MIT 