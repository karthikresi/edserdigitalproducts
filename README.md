# EDSER — Mindful Digital Downloads & Creative Activities

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_API-3.8_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

> **EDSER** is a mindful digital commerce platform and creative download studio designed for intentional living, everyday organization, and screen-free exploration. Explore printable planners, automated spreadsheets, and wholesome activity packs with interactive print simulators, real-time reviews, and instant digital delivery.

---

## 🌟 Highlights & Key Features

### 🖨️ Interactive Print Preview Simulator
- **Standard Sheet Sizes**: Live aspect-ratio simulation for **US Letter (8.5 × 11 in / 216 × 279 mm)** and **A4 (210 × 297 mm)** paper.
- **Orientation Control**: Toggle between **Portrait** and **Landscape** orientations with accurate bounding box calculation.
- **Realistic Paper Simulation**: Renders authentic paper dropshadows, textured page surfaces, and sheet margins.
- **0.5" Safe Margin Guides**: Visual toggle for safe margins (12.7 mm) to prevent home printers from clipping text or edge borders.
- **Grayscale / B&W Eco-Mode**: Preview designs in monochrome grayscale to evaluate ink density and contrast before printing.
- **Multi-Sheet Page Selector**: Cycle through multi-page activity packs (e.g. Coloring Sheet, Maze & Scavenger Hunt, Junior Explorer Certificate).
- **Direct Test Print**: Browser-integrated print trigger configured with clean `@media print` CSS rules that suppress UI chrome.

### ⭐ Real-Time Ratings & Customer Reviews
- **Persistent Firestore Storage**: Reviews are synced to `/products/{productId}/reviews/{reviewId}` in Firestore with real-time `onSnapshot` listeners.
- **Interactive Rating Form**: 1–5 star rating picker with responsive hover states and qualitative score labels (*Poor* to *Exceptional*).
- **Review Attributes**: Optional headline, in-depth comments (with live character counter and validation), and verified author attribution.
- **Author Control**: Authors can edit or delete their own feedback directly from the product view.
- **Smart Aggregations**: Dynamic calculation of average ratings and total review counts on each product showcase.

### ❤️ Wishlist & User Profile Sync
- **Firestore Profile Integration**: Save favorite planners and activity kits to the user's personal wishlist in Firestore.
- **Persistent State**: Wishlist items persist across sessions and synchronize instantly upon Google account authentication.
- **Quick Cart Migration**: Move items seamlessly from the wishlist modal directly into the active cart drawer.

### 🛍️ Digital Download Storefront & Cart Experience
- **Curated Collections**:
  - *Planners & Organization*: Undated daily planners, meal planners, and financial spreadsheets.
  - *Kids & Creative Activities*: National parks nature coloring books, trail scavenger hunts, and STEM activity packs.
- **Format Transparency**: Clear indicators for file formats (300 DPI Print-Ready PDF, Google Sheets, Excel `.xlsx`).
- **Instant Digital Delivery & Real-Time Tracking**: Instant access codes generated upon simulated checkout, with live order fulfillment states (`Processing` → `Delivered`) fetched and synchronized in real-time from Firestore via `onSnapshot`.
- **Digital Library Suite**: User library modal with live status indicators, filter tabs (*All*, *Delivered*, *Processing*), lifetime access codes, and one-click file package downloads.

### 🎨 Creative Studio & Nature Exploration
- **Wildlife & Botanical Taxonomy**: Connected to biological and scientific databases (UniProt and PubMed) for accurate nature journaling and flora/fauna information.
- **Mindful Assistant**: Gemini-powered concierge for advice on personal productivity habits, printing tips, and screen-free kids' play ideas.
- **Voice Navigation**: Audio transcription endpoint using Gemini for hands-free voice interactions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons, Cormorant Garamond & Plus Jakarta Sans typography |
| **Backend Server** | Node.js, Express (`server.ts` with Vite middleware integration in dev) |
| **Database & Auth** | Firebase Firestore (cloud document store), Firebase Authentication |
| **AI & LLM Services** | `@google/genai` TypeScript SDK (Gemini 3.8 Flash, Gemini 3.5 Transcribe) |
| **External Integrations**| UniProt Taxonomy API, PubMed E-Utilities, Google Maps & Search Grounding |

---

## 📁 Project Directory Structure

```text
├── index.html                  # HTML entry point with metadata & Google Fonts
├── metadata.json               # AI Studio project configuration & capabilities
├── package.json                # Project dependencies and script definitions
├── server.ts                   # Express server with Vite middleware & Gemini API routes
├── vite.config.ts              # Vite configuration with Tailwind CSS plugin
├── firestore.rules             # Production security rules for Firestore
├── firebase-blueprint.json     # Declarative schema for Firestore collections
├── firebase-applet-config.json # Firebase project identifiers and client configs
└── src/
    ├── App.tsx                 # Root application component & layout state
    ├── main.tsx                # React DOM client entry point
    ├── firebase.ts             # Firebase client SDK initialization & helpers
    ├── types.ts                # TypeScript interfaces (Product, Cart, Review, Order)
    ├── index.css               # Global styles, fonts, and @media print queries
    ├── components/
    │   ├── Header.tsx          # Navigation header with category links, search & cart
    │   ├── Footer.tsx          # Brand footer, newsletter signup, and policy links
    │   ├── ProductCard.tsx     # Product listing card with ratings & wishlist toggle
    │   ├── ProductDetailModal.tsx # Full product modal with reviews & print preview
    │   ├── PrintPreview.tsx    # Interactive A4 / US Letter paper simulator
    │   ├── CartDrawer.tsx      # Slide-out shopping cart drawer
    │   ├── CheckoutModal.tsx   # Simulated digital checkout with instant delivery
    │   ├── WishlistModal.tsx   # Saved products drawer with Firestore sync
    │   ├── UserLibraryModal.tsx# Permanent customer download library
    │   ├── ErrorBoundary.tsx   # Production React error boundary with Firestore incident logging
    │   ├── AuthModal.tsx       # Firebase Google & anonymous authentication
    │   ├── GeminiChatModal.tsx # Mindful AI concierge assistant
    │   ├── SearchBarModal.tsx  # Instant keyword and tag search overlay
    │   ├── HowItWorks.tsx      # 3-step guide: Download, Print, Enjoy
    │   ├── CreativeStudioModal.tsx # Interactive canvas and activity generator
    │   └── VoiceNavOverlay.tsx # Hands-free voice navigation modal
    ├── data/
    │   └── products.ts         # High-resolution digital product catalog
    └── utils/
        └── firestoreError.ts   # Contextual Firestore permission error handler
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- (Optional) A Google AI Studio API key for Gemini features

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/edser-digital-downloads.git
   cd edser-digital-downloads
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key (if using AI features):
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   APP_URL="http://localhost:3000"
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the full-stack Express server with Vite middleware on port 3000 |
| `npm run build` | Compiles TypeScript and creates optimized production assets in `/dist` |
| `npm run start` | Serves the production build with Node.js Express server |
| `npm run lint` | Runs `tsc --noEmit` to validate all TypeScript code |
| `npm run clean` | Cleans build artifacts (`dist` and `server.js`) |

---

## 🌐 Deploying to Render (or Cloud Hosts)

If deploying as a Web Service on [Render](https://render.com) (e.g. `edserdigitalproducts.onrender.com`):

### Render Web Service Settings

| Setting | Recommended Value | Why |
| :--- | :--- | :--- |
| **Runtime** | `Node` or `Bun` | Runs the full-stack server |
| **Build Command** | `npm install && npm run build` *(or `bun install && bun run build`)* | **Required** to compile client assets into `/dist` prior to starting |
| **Start Command** | `npm run start` *(or `bun run start`)* | Starts `node server.ts` |

### Render Environment Variables

In your Render Service Dashboard under **Environment**:
- `NODE_ENV`: `production`
- `GEMINI_API_KEY`: `your-gemini-api-key` *(required for AI Chat, Voice Transcription, and Grounding features)*
- `PORT`: Automatically assigned by Render (handled dynamically by `server.ts`)

---

## 🔒 Security & Secrets Protection Architecture

EDSER follows strict security-by-design principles to ensure that API keys, customer credentials, and database records remain confidential and secure:

### 1. Server-Side Secret Isolation (Zero Client Exposure)
- **Private Environment Variables**: `GEMINI_API_KEY` and other credentials reside solely in server-side memory (`process.env`) and are **never** bundled into front-end JavaScript or transmitted over network responses to the client.
- **Server Proxy Pattern**: All AI features (chat, voice transcription, search grounding) pass through protected Express API routes (`/api/*`). The browser client never touches or sees the API key.
- **Automated Error Redaction**: The server actively sanitizes all outgoing error messages (`sanitizeErrorMessage`) to redact any API key strings (`AIza...`), Bearer tokens, or URL query parameters before responding to clients.

### 2. Git & Version Control Hardening
- **Comprehensive `.gitignore`**: All `.env*` variations (`.env`, `.env.local`, `.env.production`), `*.pem`, `*.key`, `serviceAccountKey*.json`, and credential files are strictly blocked from being committed or pushed to GitHub.
- **Clean `.env.example`**: Only non-sensitive mock placeholders (`MY_GEMINI_API_KEY`) are committed for developer guidance.

### 3. Database & Firestore Security Rules
- **Default-Deny Architecture**: Any collection or path not explicitly granted is denied by default (`match /{document=**} { allow read, write: if false; }`).
- **Strict User Document Isolation**: User profiles and wishlists (`/users/{userId}`) can only be read, modified, or deleted by the authenticated user whose `request.auth.uid == userId`.
- **Order Tampering Protection**: Completed digital orders can only be created with the matching user's UID and valid numeric totals; completed orders can never be modified or deleted via client SDK.
- **Verified Review Constraints**: Customer ratings and reviews enforce schema type checks (`rating` is integer 1–5, length bounded 3–1000 characters) and author verification (`userId == request.auth.uid`), preventing unauthorized manipulation or spoofing.

### 4. HTTP Transport & Payload Safeguards
- **Protective HTTP Headers**: Configured with `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-XSS-Protection`.
- **Payload & Input Bounds**: String length limits and request payload caps prevent memory exhaustion and injection attacks.

---

## 🖨️ Printing Recommendations

For optimal quality when printing digital downloads:

| Item Type | Recommended Paper Stock | Recommended Setting |
| :--- | :--- | :--- |
| **Planners & Journals** | 100–120 gsm Smooth White Paper | "High Quality" or "Fine Detail", 100% scale (Do not fit to page) |
| **Kids Activity Sheets** | 80–90 gsm Standard Bright White Copy Paper | "Normal" / "Draft" for coloring sheets |
| **Certificates & Wall Art**| 200–300 gsm Heavy Cardstock or Matte Presentation Paper | "Photo Paper Matte" or "Heavy Paper", 100% scale |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
