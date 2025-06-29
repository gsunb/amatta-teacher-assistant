# Amatta - Teacher's AI Assistant Web App

## Overview
Amatta is a Progressive Web Application (PWA) designed as a comprehensive AI assistant for teachers. The application allows educators to manage their daily tasks through natural language commands, powered by Google Gemini AI. Teachers can handle schedules, incident records, performance assessments, and student rosters in an intuitive Korean interface while maintaining English-based internal documentation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom configuration for development and production
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit OAuth integration with Passport.js strategy
- **API Design**: RESTful endpoints with structured error handling

### Database Layer
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Connection pooling with @neondatabase/serverless

### AI Integration
- **Provider**: Google Gemini API
- **Functionality**: Natural language command processing
- **Fallback**: Basic pattern matching when API key is unavailable
- **Storage**: API keys stored in localStorage (client-side)

## Key Components

### Authentication System
- Replit OAuth integration for user authentication
- Session-based authentication with PostgreSQL session store
- User profile management with automatic user creation/updates
- Protected routes requiring authentication

### Core Modules

#### Schedule Management (`/schedules`)
- Create, view, and delete teaching schedules
- Natural language input processing for schedule creation
- Timeline and list view modes
- Date/time specific scheduling with optional end times

#### Incident Records (`/records`)
- Document and track classroom incidents
- Severity classification (low, medium, high)
- Chronological organization of records
- Searchable incident history

#### Performance Assessments (`/assessments`)
- Upload and manage student performance data
- Support for Excel/CSV file imports
- Grade analysis and visualization
- Individual student performance tracking

#### Student Management (`/students`)
- Maintain comprehensive student rosters
- Excel/CSV import functionality
- Individual student detail pages
- Risk assessment and monitoring

#### Parent Communications (`/parent-communications`)
- Track all parent interactions
- Communication type classification (phone, email, meeting)
- Follow-up scheduling and completion tracking
- Purpose and outcome documentation

#### Notifications System (`/notifications`)
- AI-powered risk assessment alerts
- System-generated notifications
- Priority-based notification management
- Mark as read functionality

#### Reporting Dashboard (`/reports`)
- Weekly and monthly performance summaries
- Student progress analytics
- Incident trend analysis
- Downloadable report generation

#### Data Management (`/data-management`)
- Bulk data operations
- Export functionality
- Data backup and restore capabilities
- System maintenance tools

### UI/UX Design
- **Language**: Korean user interface with English documentation
- **Theme**: Light/dark mode support with CSS custom properties
- **Responsive**: Mobile-first design with adaptive layouts
- **Accessibility**: ARIA labels and keyboard navigation support
- **Components**: Consistent design system using shadcn/ui

## Data Flow

### Authentication Flow
1. User accesses protected route
2. Replit OAuth redirects to authentication provider
3. Successful authentication creates/updates user session
4. Session stored in PostgreSQL with automatic expiration
5. Protected routes validate session before content delivery

### Command Processing Flow
1. User inputs natural language command
2. System checks for stored Gemini API key
3. If available, command sent to Gemini API for processing
4. Parsed results create appropriate database records
5. UI updates reflect new data with optimistic updates
6. Fallback to basic pattern matching if API unavailable

### Data Synchronization
- Real-time updates using TanStack Query
- Optimistic updates for immediate UI feedback
- Background refetching for data consistency
- Error boundaries for graceful failure handling

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Framework**: Radix UI components, Tailwind CSS
- **Database**: Drizzle ORM, Neon PostgreSQL driver
- **Authentication**: Passport.js, OpenID Connect client
- **File Processing**: SheetJS (xlsx) for Excel/CSV handling
- **Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for date manipulation

### Development Dependencies
- **Build Tools**: Vite, ESBuild, PostCSS
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint, Prettier (implied)
- **Development**: tsx for TypeScript execution

### External Services
- **Google Gemini API**: Natural language processing
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit OAuth**: User authentication provider
- **Replit Development**: Development environment integration

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express server with automatic restarts
- Environment variable management for API keys
- Replit-specific development tools integration

### Production Build
- Vite production build with optimizations
- ESBuild bundling for server code
- Static asset optimization and caching
- Environment-specific configuration management

### Database Management
- Drizzle migrations for schema versioning
- Connection pooling for performance
- Automatic table creation for sessions
- Backup and restore procedures

### Security Considerations
- Session-based authentication with secure cookies
- API key client-side storage (localStorage)
- CORS configuration for cross-origin requests
- Input validation and sanitization

## Changelog
- June 28, 2025. Initial setup
- June 28, 2025. Removed attendance functionality completely from application for future development
- June 29, 2025. Modernized dashboard with floating cards, gradients, and improved visual hierarchy
- June 29, 2025. Updated landing page with natural language focus and concrete feature examples

## User Preferences
Preferred communication style: Simple, everyday language.