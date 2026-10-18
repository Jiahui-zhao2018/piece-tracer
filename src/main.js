import './style.css';
import { loadGame, newVisibility, pawnsOnly, isVisible, pieceHistory } from './model.js';
const names = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
const glyphs = { w: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }, b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' } };
const sample = '[Event "A quiet opening"]\n[White "White"]\n[Black "Black"]\n[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O *';
let game = loadGame(sample), visibility = newVisibility(game), ply = 0, tracedId = '';
const app = document.querySelector('#app');
app.innerHTML = `
<header><a class="brand" href="./"><span class="brand-mark">♞</span><span>Piece Tracer<small>A clearer view of the game</small></span></a><span class="header-note">YOUR PERSONAL CHESS STUDY</span></header>
<main><div class="intro"><div><span class="eyebrow">THE STUDY BOARD</span><h1>See the structure.<br><em>Follow the pieces.</em></h1></div><p>Replay a game. Set pieces aside.<br>Discover what holds the position together.</p></div>
<div class="workspace"><section class="board-column" aria-label="Game board"><div class="game-heading"><div><h2 id="game-title"></h2><p id="game-subtitle"></p></div><span class="badge" id="turn"></span></div><div class="board-wrap"><div class="board-stage"><div id="board" role="img" aria-label="Chess position"></div><svg id="trace-overlay" viewBox="0 0 800 800" aria-hidden="true"></svg></div></div><div class="playback"><div class="nav-controls"><button id="start" aria-label="Go to start" title="Go to start">|‹</button><button id="prev" aria-label="Previous move" title="Previous move (Left arrow)">‹</button><button id="next" aria-label="Next move" title="Next move (Right arrow)">›</button><button id="end" aria-label="Go to end" title="Go to end">›|</button></div><span id="progress" aria-live="polite"></span></div><p class="board-note"><span class="status-dot"></span> Visibility changes the view. The full position stays intact.</p></section>
<aside><section class="panel trace-panel"><div class="panel-heading"><h2>Movement path</h2><button id="clear-trace" type="button">Clear</button></div><label for="trace-piece">Trace a piece</label><select id="trace-piece"><option value="">No piece selected</option></select><p id="trace-status" role="status"></p><ol id="trace-history" aria-label="Selected piece movement history"></ol><p class="panel-note">Numbered arrows show moves up to this position, even for hidden or captured pieces.</p></section><section class="panel visibility-panel"><div class="panel-heading"><div><span class="eyebrow">FOCUS YOUR VIEW</span><h2>Piece visibility</h2></div><span id="visible-count" class="count"></span></div><div class="presets"><button id="show-all">Show all</button><button id="pawns-only">♟ &nbsp; Pawns only</button></div><div id="visibility"></div><p class="panel-note">Pieces are identified by their starting square.<br>Captured pieces stay here for when you rewind.</p></section><section class="panel moves-panel"><div class="panel-heading"><h2>Game moves</h2><span class="count">MAIN LINE</span></div><div id="moves" aria-label="Move list"></div></section></aside></div>
<section class="panel import-panel"><div><span class="eyebrow">BRING YOUR OWN GAME</span><h2>Load a PGN</h2><p>Paste a recorded game or upload a .pgn file.<br> One game at a time. Main line only.</p><label class="upload" for="file">↥ &nbsp; Upload .pgn<input id="file" type="file" accept=".pgn,text/plain"></label></div><form id="import-form"><label for="pgn">PGN notation</label><textarea id="pgn" spellcheck="false" placeholder='[Event "My game"]&#10;&#10;1. e4 e5 2. Nf3 Nc6 ...'></textarea><div class="import-actions"><p id="message" role="status">Example game loaded. Add yours to begin studying.</p><button class="primary" type="submit">Load game <span>→</span></button></div></form></section><footer>PIECE TRACER <span>A little less on the board. A little more to see.</span></footer></main>`;
const $ = id => document.getElementById(id);
function label(piece) { return `${piece.color === 'w' ? 'White' : 'Black'} ${names[piece.originalType]} · ${piece.start}`; }
function render() {
  const focusedId = document.activeElement?.id;
  const frame = game.frames[ply], position = frame.position;
  $('game-title').textContent = `${game.headers.White || 'White'} vs ${game.headers.Black || 'Black'}`;
  $('game-subtitle').textContent = game.headers.Event || 'Recorded game';
  $('turn').textContent = `${frame.fen.split(' ')[1] === 'w' ? 'White' : 'Black'} to move`;
  $('board').replaceChildren();
  const description = [];
  for (let rank = 8; rank >= 1; rank--) for (let file = 0; file < 8; file++) {
    const square = `${String.fromCharCode(97 + file)}${rank}`, piece = position[square];
    const cell = document.createElement('div');
    cell.className = `square ${(file + rank) % 2 ? 'dark' : 'light'}`;
    cell.dataset.square = square;
    if (ply && [game.moves[ply - 1].from, game.moves[ply - 1].to].includes(square)) cell.classList.add('last-move');
    if (file === 0) { const coordinate = document.createElement('small'); coordinate.className = 'rank'; coordinate.textContent = rank; cell.append(coordinate); }
    if (rank === 1) { const coordinate = document.createElement('small'); coordinate.className = 'file'; coordinate.textContent = square[0]; cell.append(coordinate); }
    if (piece && isVisible(piece, visibility)) {
      const el = document.createElement('span'); el.className = `piece ${piece.color}`; el.textContent = glyphs[piece.color][piece.type]; el.dataset.pieceId = piece.id;
      el.setAttribute('aria-hidden', 'true'); cell.append(el);
      description.push(`${piece.color === 'w' ? 'White' : 'Black'} ${names[piece.type]} on ${square}`);
    }
    $('board').append(cell);
  }
  $('board').setAttribute('aria-label', `Position after ${ply} half-moves. Visible pieces: ${description.join(', ') || 'none'}.`);
  $('progress').textContent = ply ? `${ply} / ${game.moves.length} · ${game.moves[ply - 1].san}` : `Start position · 0 / ${game.moves.length}`;
  $('start').disabled = $('prev').disabled = ply === 0;
  $('end').disabled = $('next').disabled = ply === game.moves.length;
  renderVisibility(); renderMoves(); renderTrace();
  if (focusedId) $(focusedId)?.focus({ preventScroll: true });
}
function checkbox(text, checked, onChange, status, extra = '') {
  const row = document.createElement('label'); row.className = `piece-control ${extra}`;
  const input = document.createElement('input'); input.type = 'checkbox'; input.checked = checked; input.addEventListener('change', () => { onChange(input.checked); render(); });
  const title = document.createElement('span'); title.textContent = text;
  const detail = document.createElement('small'); detail.textContent = status;
  row.append(input, title, detail); return row;
}
function renderVisibility() {
  $('visibility').replaceChildren();
  for (const color of ['w', 'b']) {
    const section = document.createElement('div'); section.className = 'color-group';
    const heading = document.createElement('h3'); heading.textContent = `${color === 'w' ? '○ White' : '● Black'} pieces`; section.append(heading);
    const pawnCount = Object.values(game.frames[ply].position).filter(p => p.color === color && p.type === 'p').length;
    const pawns = checkbox('Pawns', visibility[`${color}Pawns`], value => visibility[`${color}Pawns`] = value, `${pawnCount} on board`, 'pawn-group');
    pawns.querySelector('input').id = `visibility-${color}-pawns`;
    section.append(pawns);
    for (const piece of game.pieces.filter(p => p.color === color && (p.originalType !== 'p' || p.promotion))) {
      const current = Object.entries(game.frames[ply].position).find(([, p]) => p.id === piece.id);
      const pending = piece.promotion && ply < piece.promotion.ply;
      const text = piece.originalType === 'p' ? `${names[piece.promotion.type]} · ${piece.start} (promoted)` : `${names[piece.originalType]} · ${piece.start}`;
      const status = pending ? 'Before promotion' : current ? current[0] : 'Captured';
      const row = checkbox(text, visibility.pieces[piece.id], value => visibility.pieces[piece.id] = value, status, !current && !pending ? 'captured' : '');
      row.querySelector('input').id = `visibility-${piece.id}`;
      row.querySelector('input').setAttribute('aria-label', piece.originalType === 'p' ? `${label(piece)} promoted ${names[piece.promotion.type]}` : label(piece));
      section.append(row);
    }
    $('visibility').append(section);
  }
  const all = Object.values(game.frames[ply].position);
  $('visible-count').textContent = `${all.filter(p => isVisible(p, visibility)).length} / ${all.length}`;
}
function renderMoves() {
  const list = $('moves'); list.replaceChildren();
  let row;
  game.moves.forEach((move, index) => {
    if (!row || move.color === 'w') {
      row = document.createElement('div'); row.className = 'move-row';
      const number = document.createElement('span'); number.textContent = `${move.before.split(' ')[5]}.`; row.append(number);
      if (move.color === 'b') row.append(document.createElement('span'));
      list.append(row);
    }
    const button = document.createElement('button'); button.textContent = move.san; button.dataset.ply = index + 1; button.id = `move-${index + 1}`;
    button.setAttribute('aria-label', `Move ${move.before.split(' ')[5]}, ${move.color === 'w' ? 'White' : 'Black'}: ${move.san}`);
    if (ply === index + 1) { button.className = 'selected'; button.setAttribute('aria-current', 'step'); }
    button.onclick = () => navigate(index + 1); row.append(button);
  });
  const selected = list.querySelector('.selected');
  if (selected) {
    const top = selected.offsetTop;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (top + selected.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top + selected.offsetHeight - list.clientHeight;
  }
}
function navigate(next) { ply = Math.max(0, Math.min(game.moves.length, next)); render(); }
function importPgn(text) {
  try {
    const next = loadGame(text); game = next; visibility = newVisibility(game); ply = 0; tracedId = ''; render();
    $('message').textContent = `Loaded ${game.moves.length} half-moves. All pieces visible.`; $('message').className = 'success';
  } catch (error) { $('message').textContent = error.message; $('message').className = 'error'; }
}

function renderTrace() {
  const selector = $('trace-piece');
  selector.replaceChildren(new Option('No piece selected', ''));
  for (const piece of game.pieces) {
    const present = Object.values(game.frames[ply].position).some(p => p.id === piece.id);
    selector.add(new Option(`${label(piece)}${piece.promotion ? ' (promotes)' : ''}${present ? '' : ' — captured'}`, piece.id));
  }
  selector.value = tracedId;
  $('clear-trace').disabled = !tracedId;
  const svg = $('trace-overlay'); svg.replaceChildren();
  $('trace-history').replaceChildren();
  if (!tracedId) { $('trace-status').textContent = 'Choose a piece to see its path.'; return; }
  const history = pieceHistory(game, tracedId, ply);
  const present = Object.values(game.frames[ply].position).some(p => p.id === tracedId);
  $('trace-status').textContent = `${history.length} recorded movement${history.length === 1 ? '' : 's'} through this position${present ? '.' : ' · Captured.'}${history.length ? '' : ' This piece has not moved yet.'}`;
  const ns = 'http://www.w3.org/2000/svg';
  function element(tag, attrs, text) {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const defs = element('defs', {}), marker = element('marker', { id: 'trace-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto-start-reverse' });
  marker.append(element('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#a54116' })); defs.append(marker); svg.append(defs);
  const center = square => [(square.charCodeAt(0) - 97) * 100 + 50, (8 - Number(square[1])) * 100 + 50];
  history.forEach((move, index) => {
    const [x1, y1] = center(move.from), [x2, y2] = center(move.to);
    const length = Math.hypot(x2 - x1, y2 - y1), dx = (x2 - x1) / length, dy = (y2 - y1) / length;
    const line = element('line', { x1: x1 + dx * 20, y1: y1 + dy * 20, x2: x2 - dx * 25, y2: y2 - dy * 25, stroke: '#a54116', 'stroke-width': 7, 'stroke-linecap': 'round', 'marker-end': 'url(#trace-arrow)', 'data-from': move.from, 'data-to': move.to });
    svg.append(line);
    // Slightly offset successive labels to keep repeated/reversed paths legible.
    const x = (x1 + x2) / 2 - dy * (14 + index % 3 * 18), y = (y1 + y2) / 2 + dx * (14 + index % 3 * 18);
    svg.append(element('circle', { cx: x, cy: y, r: 15, fill: '#fff9e8', stroke: '#a54116', 'stroke-width': 2 }));
    svg.append(element('text', { x, y: y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#78300f', 'font-size': 17, 'font-weight': 700 }, index + 1));
    const item = document.createElement('li');
    // FEN-start games can start on an arbitrary fullmove number.
    item.textContent = `${move.from} → ${move.to} · ${game.moves[move.ply - 1].before.split(' ')[5]}${game.moves[move.ply - 1].color === 'w' ? '.' : '…'} ${move.san}`;
    $('trace-history').append(item);
  });
}
$('trace-piece').onchange = event => { tracedId = event.target.value; render(); };
$('clear-trace').onclick = () => { tracedId = ''; render(); };

$('start').onclick = () => navigate(0); $('prev').onclick = () => navigate(ply - 1); $('next').onclick = () => navigate(ply + 1); $('end').onclick = () => navigate(game.moves.length);
$('show-all').onclick = () => { visibility = newVisibility(game); render(); };
$('pawns-only').onclick = () => { visibility = pawnsOnly(game); render(); };
$('import-form').onsubmit = event => { event.preventDefault(); importPgn($('pgn').value); };
$('file').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (!/\.pgn$/i.test(file.name)) throw Error('Choose a file with the .pgn extension.');
    const text = await file.text(); $('pgn').value = text; importPgn(text);
  } catch (error) { $('message').textContent = `Could not read file: ${error.message}`; $('message').className = 'error'; }
  finally { event.target.value = ''; }
};
document.addEventListener('keydown', event => {
  if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(event.target.tagName) || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = { ArrowLeft: ply - 1, ArrowRight: ply + 1, Home: 0, End: game.moves.length }[event.key];
  if (target !== undefined) { event.preventDefault(); navigate(target); }
});
render();
