# Web Admin Dashboard

## Overview

This is a comprehensive full-stack admin dashboard application built with React, TypeScript, Vite, and Drizzle ORM. It serves as a foundation for building larger applications with enterprise-level features including multi-tenancy, role-based access control, and a modular architecture. The application provides user management, system administration capabilities, and a responsive sidebar navigation with custom UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router for client-side navigation with nested routes
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: React Context for authentication state and theme management
- **Error Handling**: Custom ErrorBoundary implementation with automatic route-based error recovery
- **Component Structure**: Modular component architecture with reusable UI components

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: JWT-based authentication with role and permission-based authorization
- **API Design**: RESTful API with organized route modules for different feature areas
- **Middleware**: Custom authentication, validation, and rate limiting middleware

### Multi-Tenancy Support
- **Tenant Isolation**: Database-level tenant separation with tenant_id foreign keys
- **User Context**: Users can belong to multiple tenants with active tenant switching
- **Role Scoping**: Roles and permissions are scoped per tenant for complete isolation

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **Role-Based Access Control (RBAC)**: Hierarchical role system with granular permissions
- **Authorization Component**: React component for conditional rendering based on roles/permissions
- **Route Protection**: Middleware-based route protection on the backend

### Database Schema Design
- **Core Entities**: Tenant, User, Role, Permission with many-to-many relationships
- **Audit Trail**: CreatedAt/UpdatedAt timestamps on all entities
- **Demo Data**: Sample department entity for demonstration purposes
- **System Configuration**: Options table for application settings per tenant

### Component Architecture
- **Reusable Components**: DataPagination, TreeView, SortButton, Breadcrumbs, ConfirmDialog
- **Form Handling**: React Hook Form integration with Zod validation
- **Data Tables**: TanStack Table integration for sortable, pageable data display
- **Advanced UI**: Drag-and-drop support, context menus, and hover cards

### Error Handling Strategy
- **Error Boundaries**: React ErrorBoundary with automatic route-based recovery
- **Development Support**: Detailed error information in development mode
- **User-Friendly Fallbacks**: Graceful error messages with recovery options
- **Console-Specific**: Specialized error boundary for admin interface

## External Dependencies

### Core Framework Dependencies
- **React**: Frontend framework with hooks and context
- **TypeScript**: Type safety and enhanced development experience
- **Vite**: Fast build tool and development server
- **Express**: Backend web framework for Node.js

### Database & ORM
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect
- **PostgreSQL**: Relational database (via DATABASE_URL environment variable)

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI primitives for accessibility
- **shadcn/ui**: Pre-built component library
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Icon library

### Authentication & Security
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **express-rate-limit**: Rate limiting middleware

### Data Handling & Validation
- **Zod**: Schema validation for forms and API requests
- **React Hook Form**: Form state management and validation
- **Axios**: HTTP client for API requests
- **TanStack React Table**: Advanced table functionality

### File & Email Services
- **express-fileupload**: File upload handling
- **nodemailer**: Email sending capability
- **fast-csv**: CSV file processing
- **DOMPurify**: HTML sanitization for security

### Development & Documentation
- **swagger-jsdoc & swagger-ui-express**: API documentation
- **tsx**: TypeScript execution for server
- **nodemon**: Development server with auto-restart