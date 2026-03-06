

## Plan: Aurora Background Effect + Streak Repositioning

### 1. Aurora/Mesh Gradient Background on Landing Page

Add animated aurora blobs to `src/pages/LandingPage.tsx` — three large, blurred (`blur-3xl`) green-neon circles with very low opacity (10-15%) that move slowly and continuously using Framer Motion's `animate` with infinite repeat.

These will be placed as `fixed` divs behind all content (z-0), replacing the current static ambient glow `div`s (lines ~67-71). The particle canvas stays on top of these blobs.

Each blob will have a different animation path (translating x/y over 15-25s cycles) to create organic, non-repetitive movement.

### 2. Streak Badge Placement on Landing Page

The StreakBadge currently only appears in `ChatView.tsx` (the dashboard). The user wants it placed "strategically" on the landing page as well.

Since the landing page is public (pre-auth), and the StreakBadge depends on `useConversation` context (which requires auth), we have two options:
- Place the streak in the navbar of the landing page (visible only as a decorative/motivational element)
- Better approach: move the StreakBadge to a more prominent position within the dashboard's ChatView, since it needs auth context

Given the StreakBadge requires conversation history (auth-dependent), the strategic move is to reposition it within the **dashboard** — placing it in the header row next to the user greeting and notification bell, rather than beside the WealthWidget where it currently sits. This gives it more visibility.

### Changes

**`src/pages/LandingPage.tsx`:**
- Replace the static ambient glow divs (lines 67-71) with three `motion.div` aurora blobs:
  - Blob 1: top-left, `bg-primary/10`, `blur-3xl`, slow diagonal drift (20s loop)
  - Blob 2: bottom-right, `bg-primary/[0.08]`, `blur-3xl`, circular drift (25s loop)
  - Blob 3: center, `bg-emerald-500/[0.06]`, `blur-3xl`, vertical drift (18s loop)
- All blobs: `fixed`, `pointer-events-none`, `z-[1]`, `w-[500-600px]`, `h-[500-600px]`, `rounded-full`
- Use `framer-motion` `animate` with `x`/`y` keyframes and `repeat: Infinity`, `repeatType: "mirror"`

**`src/components/views/ChatView.tsx`:**
- Move `StreakBadge` from the Wealth row (line 175) into the header (line 161 area), placing it between the bell icon and `UserMenu` for maximum visibility
- Remove the standalone streak from the wealth row

