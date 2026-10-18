# Working on Piece Tracer

## Structure and conventions

- `src/model.js`: chess.js PGN validation, stable piece identities, position snapshots, visibility helpers and read-only piece history.
- `src/main.js`: browser UI, imports, navigation and visibility controls.
- `src/style.css` and `index.html`: presentation and entry point.
- `tests/model.test.js`: Node model tests; `tests/browser/app.spec.js`: Playwright interaction tests.
- Plain JavaScript ES modules and Vite; use the existing npm lockfile. No backend, accounts or remote application services.
- Keep complete chess state separate from rendering visibility. Never remove hidden pieces from replay state. Preserve identity through captures, castling, promotion and rewind.
- Trace selection and overlays must remain separate from visibility. Derive paths from stable identities through the selected ply, including castling rook movement; never reveal future moves.
- Use textContent for imported metadata. Keep generated output, dependencies and credentials out of Git; preserve unrelated changes.
- Cloud tasks already have isolated checkouts. Use the existing checkout; do not create worktrees unless requested.

## Setup and verification

Use a Node version allowed by `package.json` (verified with Node 24). From the repository root:

```sh
npm ci
npm run dev
npm test
npm run build
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

The browser command was verified with system Chromium. Other installations can run `npx playwright install chromium` and then `npm run test:browser`; browser download was blocked by network policy here. If the default npm cache is unwritable, use `npm ci --cache /tmp/piece-npm-cache` (verified here). Browser tests start Vite automatically. Run model tests for replay changes, browser tests for UI changes, and a production build before delivery. No separate lint or type-check command exists.

## Documentation and delivery

- Keep README installation/startup/usage accurate; PROJECT_BRIEF records accepted scope and decisions separately from proposals; HANDOFF records current status, evidence, limitations, blockers and next action.
- Update these documents when behavior or workflow changes. Reference equivalent existing documentation rather than creating conflicting copies.
- Report only observed results; distinguish passed, failed, skipped and unrun checks. Do not call implementation or a successful push milestone acceptance.
- Before changes, confirm repository/remote/starting branch and read applicable instructions. Clarify ambiguous repository or delivery branch before pushing. Preserve unrelated work.
- Before delivery, run relevant checks, review the diff and documentation, and commit source plus documentation descriptively. Push only to the user-authorized branch; never force-push, merge elsewhere or deploy without authorization.
- Final report: implemented behavior, verification/results, limitations and outstanding acceptance checks, documentation changes, branch/commit/GitHub link, push outcome, and next recommended task. Report exact authentication or remote-conflict blockers and preserve completed work.
