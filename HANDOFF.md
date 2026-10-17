# Piece Tracer — handoff

## Milestone and status

V1 source and documentation are implemented and verified; the authorized GitHub delivery target is `main`. User acceptance remains pending. The delivery commit and push outcome are reported in the task's final report; a push alone does not accept the milestone.

## Implemented

Client-only PGN paste/file import, board, clickable main-line moves, half-move navigation and keyboard shortcuts. Independent non-pawn visibility, pawn groups, Show all and Pawns only preserve underlying chess state. Stable identities survive movement, captures, castling and promotion. Captured non-pawns remain controllable. Promotion switches from group to individual visibility; rewinds retain both settings. Import errors preserve the current game, position and visibility. See README for usage and PROJECT_BRIEF for scope/decisions.

## Verification evidence

The implementation task verified installation, 9 Node model tests, 6 Chromium browser tests and the production build. Desktop and narrow-screen screenshots were inspected. Delivery verification (2026-10-17, Node 24):

- `npm ci --cache /tmp/piece-npm-cache`: passed, 19 packages installed.
- `npm test`: passed, 9 tests; no failed, skipped or cancelled tests.
- `npm run build`: passed with Vite 7.3.7.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`: passed, all 6 tests.
- Diff/documentation review completed; generated dependencies, build output and browser artifacts are ignored.

No required verification failed or remained unrun. Cross-browser and user acceptance checks below remain outstanding.

Coverage includes frame-by-frame comparisons with chess.js positions, independent knight identities, both castling directions, capture restoration, en passant, promotion/underpromotion, comments/variations, invalid and multiple-game input, paste/upload, presets, keyboard navigation, focus retention, board coloring and narrow-screen overflow.

## Limitations and blockers

- Single standard game, main line only; annotations/variations are not displayed. No move creation, persistence, tracing arrows or board rotation.
- FEN-start labels identify initial FEN squares, not unknown earlier origins. Empty games are rejected.
- Chromium checked; Firefox/Safari and a formal accessibility audit are unverified. Glyph appearance depends on installed system fonts.
- Playwright's browser download received HTTP 403 (domain forbidden). System Chromium works, so this does not block tested delivery.
- No known blocking application defect. User acceptance with personal PGNs and target browsers is outstanding; no deployment performed.

## Next action

Review the pushed v1 against personal study games and confirm acceptance. Check Firefox/Safari if they are target browsers. Plan tracing only as a separately authorized feature after v1 review.
