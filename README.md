# GyanSetu

An interactive MCQ-based learning platform with voice-enabled answers.

## Features

- 🎙️ **Voice Recognition**: Answer questions using your voice
- 📚 **Rich Question Bank**: 40+ questions across 8 categories
- 🎨 **Modern UI**: Premium design with smooth animations
- 📱 **Responsive**: Works on all screen sizes
- ✅ **Instant Feedback**: Get immediate results with explanations
- 📊 **Progress Tracking**: Track your performance

## Tech Stack

- React 18 + TypeScript
- Vite
- Web Speech API
- Vanilla CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Modern browser (Chrome, Edge, or Safari recommended)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5174/`

### Building for Production

```bash
npm run build
```

## Usage

1. **Start the Quiz**: Click "Start Quiz" on the landing page
2. **Answer Questions**:
   - Click on an option, OR
   - Use voice by clicking "Use Voice" and saying "Option A", "B", "C", or "D"
3. **Submit**: Click "Submit Answer" to check your response
4. **Continue**: Proceed through all questions
5. **View Results**: See your final score and performance

## Voice Commands

The voice recognition supports multiple formats:
- "Option A" / "Option B" / "Option C" / "Option D"
- "A" / "B" / "C" / "D"
- "First" / "Second" / "Third" / "Fourth"

## Project Structure

```
src/
├── assets/          # Images and static files
├── components/      # Reusable UI components
├── data/           # Question dataset
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
├── App.css         # Application styles
└── index.css       # Global styles and design system
```

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Safari
- ⚠️ Firefox (limited voice support)

## Deployment

The app is split into two deployable pieces:

| Piece | Host | What it runs |
| --- | --- | --- |
| Frontend (React/Vite) | Vercel | Static build from `dist/public` |
| Backend (Express API) | Render | `dist/index.js` (also serves the SPA if opened directly) |

### 1. Backend on Render

1. Push this repository to GitHub and create a **New → Blueprint** (or Web Service) in Render.
2. Render reads [`render.yaml`](./render.yaml) automatically. If configuring manually, use:
   - Build command: `npm ci --include=dev && npm run build`
   - Start command: `npm start`
   - Health check path: `/api/health`
3. Add the environment variables:
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-vercel-app.vercel.app` (comma-separate multiple origins)
   - `OPENAI_API_KEY` (optional)
4. Copy the public URL, e.g. `https://gyansetu-api.onrender.com`.

> The backend currently uses in-memory storage (`server/storage.ts`), so users, progress and downloaded packs reset whenever the Render service restarts or redeploys.

### 2. Frontend on Vercel

1. Import the same repository in Vercel.
2. [`vercel.json`](./vercel.json) already sets the build command (`npm run build:client`) and output directory (`dist/public`), plus SPA fallback routing.
3. Add the environment variable:
   - `VITE_API_URL=https://gyansetu-api.onrender.com`
4. Deploy.

If `VITE_API_URL` is left unset, the frontend calls the API on its own origin. That works when the whole app is hosted on Render, but not when the static frontend is on Vercel.

### Hosting everything on Render only

You can also open the Render service URL directly. The Express server serves the built frontend and the API from the same origin, so no CORS or `VITE_API_URL` configuration is needed.

### Environment variables

See [`.env.example`](./.env.example) for the complete list.

## License

MIT
