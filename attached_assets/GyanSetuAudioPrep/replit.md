# replit.md

## Overview

GYANSETU is an accessible, audio-first exam preparation mobile application designed specifically for visually impaired students. The application features a government-style interface with Indian tricolor branding (saffron, white, and green), voice navigation, text-to-speech capabilities, and comprehensive accessibility features. Built as a full-stack web application using React with TypeScript on the frontend and Express.js on the backend, it provides offline quiz functionality, progress tracking, and adaptive learning features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with custom theming supporting dark/light modes and high contrast accessibility
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Custom CSS variables implementing Indian tricolor theme with accessibility-first approach

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Design**: RESTful API structure with dedicated routes for authentication, exam packs, questions, and user progress
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple
- **Development**: Hot module replacement with Vite integration for development workflow

### Accessibility Features
- **Voice Navigation**: Web Speech API integration for voice commands and navigation
- **Text-to-Speech**: SpeechSynthesis API for reading content aloud in English and Hindi
- **Screen Reader Support**: ARIA labels, semantic HTML, and announcements for screen readers
- **Visual Accessibility**: High contrast modes, large text options, and keyboard navigation support
- **Audio-First Design**: All interactions can be completed through voice commands and audio feedback

### Data Model
- **Users**: Profile management with accessibility preferences (language, voice settings, contrast mode)
- **Exam Packs**: Downloadable question collections categorized by exam type (SSC, UPSC, Banking)
- **Questions**: Multiple choice questions with explanations, difficulty levels, and language support
- **Progress Tracking**: User answers, completion status, and performance analytics
- **Offline Content**: Local storage for downloaded exam packs and quiz sessions

### PWA Features
- **Offline Support**: Service worker implementation for offline quiz functionality
- **Mobile Optimization**: Responsive design optimized for mobile devices
- **Performance**: Code splitting and lazy loading for optimal performance
- **Accessibility Standards**: WCAG 2.1 AA compliance with government-style interface

## External Dependencies

### Database and Storage
- **PostgreSQL**: Primary database hosted via Neon serverless database
- **Drizzle ORM**: Type-safe database toolkit with migrations support
- **Local Storage**: Browser storage for offline content and user preferences

### Audio and Speech APIs
- **Web Speech API**: Browser-native speech recognition for voice commands
- **SpeechSynthesis API**: Text-to-speech functionality with multi-language support
- **Font Awesome**: Icon library for consistent iconography

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom accessibility extensions
- **Radix UI**: Headless UI primitives for accessible component foundation
- **Google Fonts**: Inter font family for optimal readability
- **CSS Custom Properties**: Dynamic theming system for accessibility modes

### Development and Build Tools
- **Vite**: Fast build tool with hot module replacement and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins for debugging and deployment