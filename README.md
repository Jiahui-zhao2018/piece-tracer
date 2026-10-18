# Piece Tracer

A standalone browser app for studying pawn structures and piece activity in recorded chess games. No accounts, backend, or external services. PGN files stay in your browser.

## Run locally

Use Node.js 20.19+ or 22.12+ (Node 24 is supported).

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. To build static files, run `npm run build`; deploy the resulting `dist/` directory to a static host, or inspect it locally with `npm run preview`.

## Study a game

Paste a single PGN and click **Load game**, or choose **Upload .pgn**. A short example is loaded initially. New games start at their initial position with all pieces visible. Invalid input leaves the loaded game, selected move, and visibility unchanged.

- Click a move, or use start / previous / next / end. Each step is one player's move. Left / Right arrows and Home / End work when you aren't in a form control.
- Toggle individual non-pawn pieces in the visibility panel; their labels include their starting square. The smaller label shows their current square or captured status.
- Toggle White or Black pawns as a group. **Pawns only** shows both pawn groups and hides all individual pieces. **Show all** restores every piece at the selected move.
- Captured pieces stay in the panel. Their visibility choice applies when rewinding.
- Promoted pawns have an individual control, labeled with their original square. Before promotion they follow the pawn group; after promotion they follow the individual setting, initially on. The control is available before promotion so its future setting can be adjusted. Presets also update promotion controls.

## Trace a piece

Choose any piece in **Movement path → Trace a piece**, including hidden or captured pieces. Numbered arrows and the matching move list show only its moves up to the selected position. Each arrow connects the move's start and end squares; knight arrows do not represent a sliding route. Rewinding removes later arrows. Castling includes the rook's movement; promotion keeps the pawn's identity and full path.

Tracing is separate from visibility: choosing or clearing a trace never changes checkboxes, and visibility presets never clear the trace. A captured piece's path stops at its last occupied square. **Clear** removes the overlay. Loading a valid new game clears selection; a rejected import preserves it. Overlapping or repeated paths may share arrows; the numbered move list gives the exact sequence.

## Design and scope

Vite + plain JavaScript, with chess.js validating PGN and producing legal main-line moves. Complete immutable position snapshots are separate from visibility settings. Piece identities use color and initial square, surviving captures, castling and promotion; movement-history arrows reference these same identities. Hidden pieces are omitted only from rendering.

Standard chess only, White at the bottom, one game per input. Comments, annotations and variations are parsed but not shown. Standard PGN FEN starting positions are supported; for these positions, identity labels use the initial FEN squares (earlier origins cannot be inferred). Empty games are rejected. This is recorded-game review: the board does not create moves. Reloading resets the app. No storage is included.

## Verify

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Alternatively, use an installed Chromium:

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

Model tests compare every replay snapshot against chess.js positions and check identities, visibility, captures, both castling directions, en passant, promotion/underpromotion and invalid input. Browser tests exercise paste/upload, navigation, independent knights, capture restoration, pawn groups, promotion visibility, error preservation, keyboard controls and responsive layouts. Chromium was checked in this environment; Firefox and Safari have not been verified.

## Project documentation

- [PROJECT_BRIEF.md](PROJECT_BRIEF.md): accepted scope, acceptance criteria and decisions.
- [HANDOFF.md](HANDOFF.md): milestone status, verification evidence, limitations and next action.
- [AGENTS.md](AGENTS.md): contributor conventions, verification and delivery rules.

If npm's default cache is not writable in a cloud workspace, use `npm ci --cache /tmp/piece-npm-cache`. The system-Chromium test command above was verified here; downloading Playwright's bundled browser was blocked by this environment's network policy.
