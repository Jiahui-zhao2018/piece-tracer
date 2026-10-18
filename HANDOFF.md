# Piece Tracer — handoff

## Milestone and status

V1 plus the requested movement-history extension are implemented and verified for delivery to `main`. User acceptance remains pending. The final task report records the delivery commit and push outcome; a push alone does not accept the milestone.

## Implemented behavior

The existing PGN paste/upload, main-line replay, navigation, independent non-pawn controls, pawn groups, capture restoration and promotion visibility remain in place. A separate Movement path selector now chooses any stable piece identity, including hidden/captured pieces and pawns. Numbered arrows and an ordered move list show actual movement through the selected ply only. Rewind truncates the path; castling includes rook movement; promotion retains the complete identity history. Captures stop movement at the last occupied square.

Trace selection and visibility do not change one another. Clear affects only the trace; a valid new game clears selection, while invalid imports preserve it. See README for usage and PROJECT_BRIEF for accepted scope and implementation defaults.

## Verification (2026-10-18)

- `npm test`: all 12 model tests passed, including the original 9 and history identity, chronology, castling, captures, en passant, promotion and nonmutation checks.
- `npm run build`: passed, Vite 7.3.7.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`: all 8 tests passed, including the original 6 visibility/import/navigation regressions and new trace independence, rewind, switching, clearing, captured selection, castling and import-reset checks.
- Chromium trace screenshot inspected; overlay is aligned with square centers. Existing responsive-layout check passes.
- An initial new nonmutation assertion failed because structuredClone removes chess.js Move prototypes; comparing normalized snapshots corrected the test. No outstanding test failure.
- Source/documentation diff reviewed before commit. Build output and browser artifacts remain ignored. A pre-existing README removal is preserved outside this task's commit.

Prior v1 setup verified npm installation with a writable cache. No dependency changes were needed for tracing.

## Limitations and blockers

Single standard game, main line only; no move creation, persistence or board rotation. FEN-start identities use initial FEN squares. Arrows connect move endpoints (including knights); repeated/overlapping paths can overlap visually, with the ordered list preserving exact chronology. Long-game performance has not been benchmarked. Firefox/Safari and formal accessibility testing remain unverified. No known blocking application defect; no deployment performed.

## Next action

Review traces and visibility with personal PGNs and confirm acceptance, including the chosen current-ply-only and all-piece selection defaults. Check target browsers before expanding the feature.
