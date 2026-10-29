# StreamBox Colombia - Glassmorphism V3 Premium Authentication

Implementation plan for upgrading the StreamBox Colombia authentication system to a futuristic Glassmorphism V3 design with cyber curves, luminous electric blue/cyan accents, real-time validation, password strength metering, and Firebase Authentication integration.

## User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying preferences confirmed by the user in Phase 1 govern the visual and validation behavior:

- **Confirmed Decision 1 (Visual Style)**: Subtle cyber glass with soft electric blue reflections, backdrop-filter blur, thin luminous borders, and fluid cyan/blue glow curves.
- **Confirmed Decision 2 (Password Strength)**: Balanced security policy featuring real-time visual meter, 6+ character baseline, and combination feedback (numbers, uppercase, lowercase).
- **Confirmed Decision 3 (Google Sign-In)**: Retain the seamless 1-click Google Account Chooser with zero manual typing, preserving role routing (`d.s.gal.mor.9@gmail.com` as `SUPER_ADMIN` to `/admin`, and client accounts to `/inicio`).

---

### 1. Overview & Core Concept

- **What It Does**: Upgrades the login, registration, and password recovery interfaces into a Glassmorphism V3 experience. Combines dark aesthetics, animated translucent glass panels, floating persistent input labels, real-time strength indicators, password visibility toggles, and terms confirmation with Firebase Authentication and client state synchronization.
- **Target Audience / Persona**: Colombian streaming and software license customers purchasing Netflix, Disney+, Max, Spotify, Prime Video, Office, and Windows activations, as well as the platform Super Administrator.
- **Key Value**: Delivers a high-trust, responsive authentication gateway with zero friction, protecting private routes while retaining 100% compatibility with Render deployment and existing Firebase security rules.

---

### 2. User Experience & Visual Design

- **Futuristic Dark Atmosphere**:
  - Deep obsidian canvas (`#0A0A10` to `#0E0E18`) enriched with dual SVG electric blue (`#0066FF`, `#3B82F6`) and cyan (`#06B6D4`, `#22D3EE`) luminous curves and ambient glow orbs.
  - Reduced-motion support (`motion-reduce:animate-none`) ensuring accessibility compliance.
- **Glassmorphism V3 Central Panel**:
  - Multilayered translucent glass card (`backdrop-blur-xl bg-white/[0.03]` with `border border-white/10 shadow-[0_8px_32px_0_rgba(0,102,255,0.18)]`).
  - Subtle specular highlights on top borders and soft electric blue reflection lines.
  - StreamBox Colombia branding lockup with neon gradient title.
- **Interactive Form Fields & Controls**:
  - Dark inputs (`bg-black/40 border border-white/10`) that smoothly illuminate with a cyan ring (`focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)]`) upon focus.
  - Floating/persistent label hierarchy with Lucide icons (Mail, Lock, User, Check, Eye, EyeOff, ShieldCheck).
  - Show/Hide password toggle buttons with accessible `aria-label` and `aria-pressed`.
  - Dynamic password strength meter with 4 visual tiers (Débil, Media, Buena, Excelente) and animated progress segments.
  - Password confirmation validator with real-time match indicator.
  - Terms and privacy checkbox (Ley 1581 de 2012 / Habeas Data compliance).
- **Action Buttons & Google Sign-In**:
  - Primary CTA with vibrant blue-to-cyan gradient (`bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500`) with hover lift and glowing neon cast.
  - Instant 1-click Google Account Chooser modal with official Google branding and zero manual typing.
  - Animated spinner states (`Loader2`) preventing duplicate form submissions.
  - Visual toast/banner feedback for successful registration, credential errors, or recovery links.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Seamless Component Refactor vs. Complete Rewrite**:
  - *Chosen Approach*: Refactor `src/components/auth/LoginView.tsx` and `src/components/auth/AuthModal.tsx` in place, adding modular subcomponents for the Glassmorphism V3 background curves and password strength meter.
  - *Why*: Preserves all established route handlers, cart integrations, Colombian payment workflows, and Render hosting compatibility without breaking existing application state.
- **Decision 2: Dual Firebase & Local Resilience**:
  - *Chosen Approach*: Maintain Firebase Authentication (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `sendPasswordResetEmail`, `GoogleAuthProvider`) as the primary auth mechanism, with automatic local fallback for registered client sessions if Firebase has network latency or mock credentials.
  - *Why*: Ensures the application never locks out legitimate users on Render or development environments while maintaining rigorous role separation (`SUPER_ADMIN` exclusively for `d.s.gal.mor.9@gmail.com`).
- **Decision 3: Password Security & Privacy**:
  - *Chosen Approach*: Passwords are strictly evaluated in memory and submitted directly to Firebase Authentication; never persisted in Firestore documents, unencrypted state, or `localStorage`.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STREAMBOX COLOMBIA UI                           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 Glassmorphism V3 Auth Gateway                  │   │
│   │                                                                │   │
│   │  ┌───────────────────────┐          ┌───────────────────────┐  │   │
│   │  │   LOGIN TAB           │          │   REGISTER TAB        │  │   │
│   │  │  - Email & Password   │          │  - Full Name & Email  │  │   │
│   │  │  - Password Recovery  │          │  - Password & Confirm │  │   │
│   │  │  - 1-Click Google CTA │          │  - Strength Meter     │  │   │
│   │  │                       │          │  - Terms Checkbox     │  │   │
│   │  └───────────┬───────────┘          └───────────┬───────────┘  │   │
│   └──────────────┼──────────────────────────────────┼──────────────┘   │
└──────────────────┼──────────────────────────────────┼──────────────────┘
                   ▼                                  ▼
        ┌─────────────────────────────────────────────────────┐
        │                  StoreContext.tsx                   │
        │                                                     │
        │   - loginWithCredentials(email, password)           │
        │   - register(name, email, phone, password)          │
        │   - loginWithGoogle(customEmail, customName)        │
        │   - resetPassword(email)                            │
        │   - role resolution (SUPER_ADMIN vs CLIENTE)        │
        └──────────────────────────┬──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
       ┌────────────────────────┐    ┌────────────────────────┐
       │ Firebase Auth SDK      │    │ App Route Guard        │
       │ - signInWithEmail...   │    │ - /admin (SUPER_ADMIN) │
       │ - createUserWith...    │    │ - /inicio (CLIENTE)    │
       │ - sendPasswordReset... │    │ - Protected Checkout   │
       └────────────────────────┘    └────────────────────────┘
```

### 5. Performance Overview & Admin Capabilities

- **Recharts Donut Chart (`PerformanceOverview.tsx`)**:
  - Implemented a Donut Chart (`PieChart`, `Pie`, `Cell`, `Tooltip`, `ResponsiveContainer`) directly integrated next to the existing Bar Chart in a balanced side-by-side grid (`grid-cols-1 lg:grid-cols-2`).
  - Visualizes subscription lifecycle distribution:
    - *Activas (En Garantía)*: Emerald `#10B981` (100% legal warranty)
    - *Por Renovar (≤ 3 días)*: Violet `#8B5CF6` (Automatic WhatsApp notice)
    - *En Revisión / Pendientes*: Amber `#F59E0B` (Payment/credential validation)
    - *Vencidas / Expiradas*: Rose/Red `#EF4444` (Cycle finished)
  - Interactive custom Dark Cinema tooltip and center total subscription count badge.
  - Tab selector updated with 4 options: `Vista Completa`, `Ingresos Diarios`, `Categorías`, and `Estados (Donut)`.
  - Export to CSV enhanced with Section 4 detailing the Donut Chart status breakdown.

- **Admin Original Price Reset Button ("Restablecer Precios Originales")**:
  - Accessible directly in the action bar of `PerformanceOverview.tsx` and in the Catálogo/Productos management panel of `AdminPortalView.tsx`.
  - Executes `resetCatalogPrices()`, restoring all products and modalities to their initial launch prices from `INITIAL_PRODUCTS`.
  - Displays instant visual feedback toast with the count of synchronized modalities and auto-dismiss.
  - `src/components/auth/GlassAuthCard.tsx` (or integrated in `LoginView.tsx`): Houses the glass container, animated background SVG curves, mode switcher, and form logic.
  - `src/components/auth/PasswordStrengthMeter.tsx`: Lightweight, reactive strength evaluator checking length, numbers, upper/lowercase, and special characters with animated visual bar.
  - `src/components/auth/GoogleAccountChooserModal.tsx`: Unchanged 1-click Google Account Chooser preserving full zero-typing workflow.
  - `src/context/StoreContext.tsx`: Exposes `sendPasswordReset` and executes `createUserWithEmailAndPassword` + Firestore profile syncing safely.
- **Verification Plan**:
  - Run `lint_applet` and `compile_applet` to ensure 0 TypeScript errors.
  - Test registration with password confirmation and terms checkbox.
  - Test login with email/password and verify route redirection.
  - Test 1-click Google Sign-in for both admin and client roles.
