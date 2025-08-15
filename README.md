# Urban-IT Ledger Financial Management System

A comprehensive financial management system built with React, Node.js, PostgreSQL, and Prisma, fully containerized with Docker and PWA capabilities.

## 🏗️ Project Structure

```
urban-it-ledger/
├── frontend/              # React PWA application
│   ├── src/               # React source code
│   ├── public/            # Static assets & PWA files
│   ├── Dockerfile         # Production frontend container
│   ├── Dockerfile.dev     # Development frontend container
│   └── nginx.conf         # Nginx configuration for production
├── backend/               # Node.js API server
│   ├── src/               # Server source code
│   ├── prisma/            # Database schema and migrations
│   ├── Dockerfile         # Backend container
│   └── docker-entrypoint.sh # Container startup script
├── docker-compose.yml     # Development environment
├── docker-compose.prod.yml # Production environment
├── Makefile              # Development commands
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Make (optional, for convenience commands)

### Development Setup

1. **Clone and start development environment:**
   ```bash
   # Using Make (recommended)
   make dev
   
   # Or using Docker Compose directly
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Production Setup

1. **Start production environment:**
   ```bash
   # Using Make
   make start
   
   # Or using Docker Compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3001 (internal)

## 📱 PWA Features

### ✅ Offline Capabilities
- **Service Worker**: Caches static assets and API responses
- **IndexedDB**: Stores transactions and reports for offline viewing
- **Background Sync**: Queues offline changes and syncs when online
- **Network Status**: Visual indicators for connection status

### ✅ Performance Optimizations
- **Code Splitting**: Vendor, router, charts, and utils chunks
- **Lazy Loading**: Non-critical components load on demand
- **Image Optimization**: Responsive and lazy-loaded images
- **Compression**: Gzip/Brotli compression enabled
- **Caching**: Aggressive caching for static assets

### ✅ Installation
- **Manifest**: Complete PWA manifest with icons and metadata
- **Installable**: Can be installed on desktop and mobile devices
- **Theme Integration**: Proper theme colors and splash screens

## 🐳 Docker Configuration

### Development Environment
```yaml
# docker-compose.yml
- PostgreSQL: Persistent data with health checks
- Backend: Hot reloading with volume mounts
- Frontend: Vite dev server with HMR
```

### Production Environment
```yaml
# docker-compose.prod.yml
- PostgreSQL: Production-ready with security
- Backend: Optimized Node.js container
- Frontend: Nginx with static file serving
```

### Container Features
- **Health Checks**: All services have proper health monitoring
- **Persistent Storage**: Database data survives container restarts
- **Environment Variables**: Configurable for different environments
- **Security**: Non-root users and proper permissions

## 🛠️ Available Commands

### Using Make (Recommended)
```bash
make dev          # Start development environment
make build        # Build all containers
make start        # Start production environment
make stop         # Stop all containers
make clean        # Remove containers and volumes
make logs         # Show container logs
make test         # Run tests
make db-reset     # Reset database with fresh data
```

### Using Docker Compose Directly
```bash
# Development
docker-compose up --build
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down

# Database operations
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed
```

## 📊 Demo Credentials

- **Admin**: `kb@urbanit.com` / `password`
- **User**: `kt@urbanit.com` / `password`
- **Read-only**: `readonly@urbanit.com` / `password`

## 🔧 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** with PWA plugin
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Workbox** for service worker
- **IndexedDB** for offline storage

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma ORM** for database operations
- **JWT** for authentication
- **bcrypt** for password hashing
- **Puppeteer** for PDF generation

### DevOps
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Nginx** for production serving
- **Health checks** for monitoring

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Proper cross-origin setup
- **Security Headers**: Helmet.js for security headers
- **Container Security**: Non-root users and minimal attack surface

## 📈 Performance Features

### Lighthouse Scores (Target: 90+)
- **Performance**: Code splitting, compression, caching
- **PWA**: Complete service worker and offline functionality
- **Accessibility**: Semantic HTML and ARIA labels
- **Best Practices**: Security headers and modern standards

### Optimization Techniques
- **Gzip Compression**: Enabled on backend and frontend
- **Cache Headers**: Proper cache control for static assets
- **Code Splitting**: Separate chunks for different functionality
- **Tree Shaking**: Remove unused code from bundles
- **Minification**: Compressed production builds

## 🧪 Testing Offline Functionality

### Test Offline Mode
1. Start the application
2. Open Chrome DevTools → Network tab
3. Check "Offline" checkbox
4. Navigate through the app - cached data should load
5. Try creating transactions - they should queue for sync
6. Uncheck "Offline" - queued transactions should sync

### Test PWA Installation
1. Open the app in Chrome
2. Look for install prompt in address bar
3. Click install to add to desktop/home screen
4. App should work as standalone application

## 🔄 Database Operations

### Migrations
```bash
# Create new migration
docker-compose exec backend npx prisma migrate dev --name migration_name

# Deploy migrations
docker-compose exec backend npx prisma migrate deploy

# Reset database
docker-compose exec backend npx prisma migrate reset
```

### Seeding
```bash
# Seed database with demo data
docker-compose exec backend npm run db:seed

# Access database directly
docker-compose exec db psql -U postgres -d urban_it_ledger
```

## 🚀 Deployment

### Environment Variables
Create `.env.prod` file:
```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://yourdomain.com
```

### Production Deployment
```bash
# Build and start production containers
make start

# Or with custom environment
DB_PASSWORD=secure_pass JWT_SECRET=secret make start
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database health
   docker-compose exec db pg_isready -U postgres
   
   # View database logs
   docker-compose logs db
   ```

2. **Backend Won't Start**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Rebuild backend container
   docker-compose build backend
   ```

3. **Frontend Build Errors**
   ```bash
   # Clear node modules and rebuild
   docker-compose down
   docker-compose build --no-cache frontend
   ```

### Performance Debugging
```bash
# Check container resource usage
docker stats

# Analyze bundle size
docker-compose exec frontend npm run build -- --analyze

# Run Lighthouse audit
# Open Chrome DevTools → Lighthouse → Run audit
```

## 📄 License

This project is licensed under the MIT License.