# Piece Tracer — project brief

## Accepted purpose and scope

Build a standalone, desktop-first browser app for personal chess study: replay a recorded game while selectively hiding pieces to study pawn structures and piece activity.

Accepted v1 requirements:

- Paste PGN or upload a `.pgn` file; one standard-chess game at a time, main line only. Explain multiple-game/invalid/unsupported input and preserve the current valid game on errors.
- Display the board and clickable moves. Start, previous, next and end navigate by one player's move per step. The board cannot create moves.
- A separate, always-restorable visibility panel controls each non-pawn individually and White/Black pawns as two groups. Same-type pieces are distinguished by initial square.
- Visibility affects rendering only, belongs to stable piece identities, and persists through navigation, captures and castling. Captured non-pawns remain listed with status.
- Show all restores the complete selected position. Pawns only shows both pawn groups and hides individual pieces.
- New games start at their initial position with all pieces visible. Promotion retains identity: before promotion use the pawn group, afterwards use an individual setting initially on.
- No reload persistence, servers, accounts, databases or external service integrations are needed.

## Implementation decisions and reasons

- Vite, plain JavaScript and maintained chess.js: small client-only stack with library-backed legal PGN replay.
- Separate position snapshots and visibility settings: jumps/rewinds cannot change chess logic or forget visibility.
- IDs use color plus initial square: distinguish original pieces and retain identity after special moves and promotion.
- Standard PGN FEN starts are supported; initial FEN squares identify pieces because earlier origins cannot be inferred.
- Promotion controls are available before promotion; presets also update them. This makes settings deterministic across jumps and rewinds.
- White stays at the bottom; an example game is loaded initially. These are implementation defaults, not additional user requirements.

## Acceptance criteria and status

Automated model/browser checks cover paste/upload, correct positions, pawn-only forward/backward review, independent knights, hidden identity after movement/rewind, captures, castling, en passant, promotion, Show all and invalid-input preservation. See HANDOFF for actual results and remaining checks. User acceptance is pending.

## Deferred and proposed work

Move-history arrows for a selected non-pawn are explicitly deferred; only stable identities are prepared now. No tracing interface is implemented. Next recommended proposal: user acceptance review with personal PGNs and target-browser checks. This proposal is not an accepted feature expansion.

GitHub delivery to `main` is authorized; force-pushing, merging into another branch and deployment are outside this delivery instruction.
