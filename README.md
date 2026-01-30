<<<<<<< HEAD
# GYANSETU
Gyan Setu is an AI-powered education platform that bridges the learning gap using personalized, accessible, and smart digital solutions.
=======
# GYANSETU (ज्ञानसेतु) - Audio-First Exam Prep for Visually Impaired

GYANSETU is an accessible, audio-first exam preparation mobile application designed specifically for visually impaired students in India. The application features a clean, professional government-style interface with Indian tricolor branding, full voice navigation, and AI-powered study assistance.

## 🚀 Vision

Empowering visually impaired students to prepare for competitive government exams (SSC, UPSC, Banking) through a specialized, audio-centric learning environment that bridges the accessibility gap in traditional education platforms.

# GYANSETU (ज्ञानसेतु) - Audio-First Exam Prep for Visually Impaired

GYANSETU is an accessible, audio-first exam preparation mobile application designed specifically for visually impaired students in India. The application features a clean, professional government-style interface with Indian tricolor branding, full voice navigation, and AI-powered study assistance.

## 🚀 Vision

Empowering visually impaired students to prepare for competitive government exams (SSC, UPSC, Banking) through a specialized, audio-centric learning environment that bridges the accessibility gap in traditional education platforms.

## ✨ Key Features

### 🎙️ Audio-First Design
- **Full Voice Control**: Complete application navigation through voice commands.
- **"Hey GyanSarthi"**: AI assistant activation via wake-word for immediate study help.
- **High-Quality TTS**: Multi-language Text-to-Speech support for exam content and UI elements.
- **Double-Tap Activation**: Quickly trigger listening mode and fullscreen view via screen gestures.

### 📚 Exam Preparation
- **SSC & UPSC Focus**: Specialized content and strategies for major competitive exams.
- **Practice Quizzes**: Interactive audio-guided mock tests with instant feedback and explanations.
- **Video Lessons**: Curated strategy and subject-specific video content with audio descriptions.
- **Offline Mode**: Downloadable exam packs for study without an active internet connection.

### 🤖 GyanSarthi (AI Study Assistant)
- **Voice-Activated Tutor**: Ask questions about topics, get explanations, and receive study tips.
- **Personalized Recommendations**: AI-driven suggestions based on practice performance.
- **Dynamic Question Generation**: Request extra practice questions on any specific topic.

### 📊 Progress Tracking
- **Detailed Analytics**: Track accuracy, questions attempted, and study time.
- **Export Progress**: Download your study statistics as a JSON file for backup or sharing.
- **Clear Data**: Privacy-focused data management to reset progress at any time.

## 🛠️ Tech Stack

### Frontend
- **React 18 + TypeScript**: For a robust, type-safe interactive interface.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS**: Custom accessibility-first tricolor theme (Saffron, White, Green).
- **Radix UI**: Accessible UI primitives for inclusive design.
- **Wouter**: Lightweight client-side routing.
- **TanStack Query (React Query)**: Efficient server state management and caching.

### Backend
- **Node.js + Express**: Scalable API development.
- **PostgreSQL**: Reliable data persistence for users and exam content.
- **Drizzle ORM**: Type-safe database toolkit.

### Accessibility APIs
- **Web Speech API**: Browser-native speech recognition for voice commands.
- **SpeechSynthesis API**: Powerful text-to-speech engine.

## 🎨 Theme & Accessibility
- **Government-Style UI**: Professional design using Indian tricolor accents.
- **High Contrast Mode**: Specialized mode for users with partial vision.
- **Screen Reader Optimized**: Full ARIA compliance and semantic HTML.
- **Audio Announcements**: Real-time audio feedback for all system actions.

## 📁 Project Structure

```text
├── client/
│   ├── src/
│   │   ├── components/      # Accessible UI components (GyanSarthi, Header, etc.)
│   │   ├── hooks/           # Voice recognition and TTS custom hooks
│   │   ├── lib/             # Voice command processor and AI logic
│   │   ├── pages/           # Main application screens (Home, Quiz, Lessons)
│   ├── public/              # Static assets and PWA manifest
├── server/
│   ├── routes.ts            # API endpoints for exams and progress
│   ├── ai-routes.ts         # GyanSarthi backend logic
│   ├── storage.ts           # Data storage interface
├── shared/
│   └── schema.ts            # Database schema and Zod validation
```

## 📱 PWA Support
GYANSETU is designed as a Progressive Web App. For the best experience on mobile devices, use the "Add to Home Screen" option in your browser to access it like a native application with hidden address bars.

---
Developed with ❤️ for inclusive education.
