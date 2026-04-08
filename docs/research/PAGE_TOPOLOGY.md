# Page Topology — dialed.gg

## App Type
Color memory game (single-page application). Not a marketing website — a fully interactive game with multiplayer, daily challenges, and leaderboards.

## Screen Map (Top to Bottom in Game Flow)

### Solo Mode Flow
1. **Intro Screen** (`#intro-screen`) — Landing page with title, description, mode buttons (Solo/Multi/Daily), Easy/Hard toggle, leaderboard button, credit footer
2. **Countdown Screen** (`#countdown-screen`) — Ready/Set/Go countdown with colored backgrounds
3. **Memorize Screen** (`#memorize-screen`) — Full-screen color to memorize + countdown timer (5s easy / 2s hard)
4. **Picker Screen** (`#picker-screen`) — 3 vertical HSB strips (Hue/Saturation/Brightness) + go button
5. **Result Screen** (`#result-screen`) — Side-by-side color comparison + animated score climb
6. **Total Screen** (`#total-screen`) — Final results: total score, color swatch grid, initials input, challenge CTA, leaderboard rank

### Multiplayer Flow
- **Challenge Setup** (`#challenge-setup-screen`) — Create challenge: enter name, copy link, start playing
- **Challenge Intro** (`#challenge-intro-screen`) — Join challenge: see challenger name, enter name, start
- **Challenge Result** (`#challenge-result-screen`) — Waiting state → 2-player hero → 3+ ranked list

### Daily Flow
- **Daily Intro** (`#daily-intro`) — Date, flipping color cards, play button, countdown timer
- **Daily Results** (`#daily-results`) — Score, color grid with per-round scores, rank badge, share
- **Daily Played** (`#daily-played`) — Already played today: previous score, colors, rank, share

### Standalone
- **Leaderboard** (`#leaderboard-screen`) — Easy/Hard/Daily tabs, ranked list with tie lines

### Overlays
- **Name Prompt** (`#name-prompt-overlay`) — Post-game name input
- **Fade Overlay** (`#fade-overlay`) — Black transition between screens
- **Spicy Overlay** (`#spicy-overlay`) — Profanity check dialog

## Interaction Model
- **Intro**: Click-driven (buttons trigger mode selection)
- **Countdown**: Time-driven (automatic 3-2-1 sequence)
- **Memorize**: Time-driven (countdown timer expires)
- **Picker**: Drag-driven (HSB strip handles)
- **Result**: Time-driven (animated score climb)
- **Total**: Click-driven (challenge CTA, leaderboard)
- **Challenge**: Click + Polling (submit scores, poll for updates)
- **Daily**: Click + Time-driven (countdown to next daily)

## Layout Architecture
- **Mobile**: Full-screen, `position: fixed`, black background, no scrolling
- **Desktop** (768px+): Centered card (476px wide, 390-650px height) on white background, with fixed desktop chrome (logo, dark mode toggle, mute toggle, version nav)
- **Screen transitions**: Opacity crossfade (0.4s ease)
- **Z-index**: Active screen gets z-index 10, overlays above

## Key Technical Details
- Custom font: `Suisse Intl S Alt` (self-hosted woff2, weight 500)
- Fallback: Inter (Google Fonts)
- All colors generated in HSB, scoring uses Delta E 2000 (CIEDE2000)
- Backend: Supabase (leaderboard, challenges, daily scores)
- Sound: Web Audio API (procedural audio)
- No scroll — all content within fixed screens
- No framework — vanilla HTML/CSS/JS in single file
