# Technology Stack

## Frontend

### Core Framework
- **React 18** - UI library for building interactive user interfaces
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library built on Radix UI
- **Lucide React** - Icon library for modern UI icons

### Mapping & Geolocation
- **Leaflet** - Open-source JavaScript library for interactive maps
- **React Leaflet** - React components for Leaflet maps
- **OpenStreetMap** - Free, editable map data provider
- **Leaflet Routing Machine** - Routing and directions on Leaflet maps

### State Management & Routing
- **React Router DOM** - Client-side routing for single-page applications
- **React Hooks** - Built-in state management (useState, useEffect, etc.)

## Backend

### Runtime & Framework
- **Node.js 18** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework for Node.js

### Database
- **MySQL 8.0** - Relational database management system
- **mysql2** - MySQL client for Node.js with Promise support

### AI & NLP
- **node-nlp** - Natural Language Processing library for chatbot
- **@tensorflow/tfjs-node** - TensorFlow.js for machine learning capabilities

### PDF Generation
- **PDFKit** - PDF document generation library for Node.js

### Security & Authentication
- **bcryptjs** - Password hashing library
- **jsonwebtoken (JWT)** - Token-based authentication
- **helmet** - Security middleware for Express
- **express-rate-limit** - Rate limiting middleware

### Utilities
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing middleware
- **uuid** - Unique identifier generation

## DevOps & Deployment

### Containerization
- **Docker** - Container platform for consistent environments
- **Docker Compose** - Multi-container Docker application orchestration
- **Nginx** - Web server and reverse proxy for serving frontend

### Development Tools
- **nodemon** - Auto-restart Node.js server on file changes
- **ESLint** - JavaScript/TypeScript linting
- **Git** - Version control system

## Architecture

### Design Patterns
- **RESTful API** - Standard HTTP methods for API endpoints
- **MVC Pattern** - Model-View-Controller architecture
- **Microservices** - Separated frontend, backend, and database services

### Key Features
- **Expert System** - Weighted scoring algorithm for personalized recommendations
- **Chatbot** - NLP-powered conversational interface
- **PDF Generation** - Dynamic itinerary document creation
- **Interactive Maps** - Real-time route visualization with markers
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## Database Schema

### Tables
- `destinations` - Tourist destinations with coordinates and metadata
- `packages` - Pre-built tour packages
- `activities` - Available activities at destinations
- `hotels` - Accommodation options
- `users` - User accounts
- `bookings` - Booking records
- `questionnaire_responses` - User preferences for itinerary generation

## API Endpoints

### Public Endpoints
- `/api/health` - Health check
- `/api/destinations` - Get all destinations
- `/api/packages` - Get tour packages
- `/api/activities` - Get activities
- `/api/map/*` - Map-related data
- `/api/itinerary/generate` - Generate custom itinerary
- `/api/itinerary/generate-pdf` - Generate PDF itinerary
- `/api/expert-system/recommend` - Get personalized recommendations
- `/api/chat/message` - Chatbot interaction

### Protected Endpoints (Admin)
- `/api/admin/destinations` - Manage destinations
- `/api/admin/hotels` - Manage hotels
- `/api/auth/*` - Authentication endpoints

## Performance Optimizations

- **Multi-stage Docker builds** - Smaller image sizes
- **Nginx caching** - Static asset caching
- **Database indexing** - Optimized query performance
- **Gzip compression** - Reduced payload sizes
- **Lazy loading** - On-demand component loading

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for secure password storage
- **Rate Limiting** - Protection against DDoS attacks
- **Helmet.js** - HTTP security headers
- **CORS Configuration** - Controlled cross-origin requests
- **Input Validation** - Sanitized user inputs

## Development Workflow

1. **Local Development**: `npm run dev` (Frontend), `npm start` (Backend)
2. **Docker Development**: `docker-compose up --build`
3. **Production Build**: Multi-stage Docker builds with optimization
4. **Version Control**: Git with conventional commit messages

## Future Enhancements

- **Redis** - Caching layer for improved performance
- **WebSockets** - Real-time updates for bookings
- **AWS S3** - Cloud storage for images
- **CI/CD Pipeline** - Automated testing and deployment
- **Monitoring** - Application performance monitoring (APM)
