import { Chess } from 'chess.js';

// Strip comments and recursive annotation variations only for game-boundary checks.
function mainline(text) {
  let depth = 0, brace = false, line = false, header = false, quoted = false, escaped = false, out = '';
  for (const c of text) {
    if (header) {
      out += c;
      if (escaped) { escaped = false; continue; }
      if (c === '\\' && quoted) { escaped = true; continue; }
      if (c === '"') quoted = !quoted;
      if (c === ']' && !quoted) header = false;
      continue;
    }
    if (line) { if (c === '\n') line = false; else continue; }
    if (brace) { if (c === '}') brace = false; continue; }
    if (c === '[' && !depth) { header = true; out += c; continue; }
    if (c === ';') { line = true; continue; }
    if (c === '{') { brace = true; continue; }
    if (c === '(') { depth++; continue; }
    if (c === ')') { if (!depth) throw Error('Unbalanced PGN variation.'); depth--; continue; }
    if (!depth) out += c;
  }
  if (depth || brace || header) throw Error('Unclosed PGN header, comment or variation.');
  return out;
}

export function loadGame(text) {
  if (!text.trim()) throw Error('Paste PGN text or choose a .pgn file first.');
  const clean = mainline(text);
  const tagPattern = /\[\s*\w+\s+"(?:[^"\\]|\\.)*"\s*\]/g;
  let endOfHeaders = 0;
  for (const tag of clean.matchAll(tagPattern)) {
    if (clean.slice(endOfHeaders, tag.index).trim()) throw Error('One game at a time is supported. Please supply a single PGN game.');
    endOfHeaders = tag.index + tag[0].length;
  }
  const body = clean.replace(/\[\s*\w+\s+"(?:[^"\\]|\\.)*"\s*\]/g, ' ');
  const results = [...body.matchAll(/(?:^|\s)(1-0|0-1|1\/2-1\/2|\*)(?=\s|$)/g)];
  if (results.length > 1 || (results.length && body.slice(results[0].index + results[0][0].length).trim()) ||
      [...clean.matchAll(/\[Event\s/g)].length > 1) {
    throw Error('One game at a time is supported. Please supply a single PGN game.');
  }
  const chess = new Chess();
  try { chess.loadPgn(text); } catch (error) { throw Error(`Cannot load PGN: ${error.message}`); }
  const moves = chess.history({ verbose: true });
  if (!moves.length) throw Error('No moves found. Supply a PGN containing a recorded game.');
  const headers = chess.getHeaders();
  if (headers.Variant && !['standard', 'chess'].includes(headers.Variant.toLowerCase())) throw Error('Only standard chess is supported.');
  const initial = new Chess(moves[0].before);
  const pieces = [], position = {};
  for (const row of initial.board()) for (const piece of row) if (piece) {
    const id = `${piece.color}-${piece.square}`;
    pieces.push({ id, color: piece.color, originalType: piece.type, start: piece.square });
    position[piece.square] = { id, color: piece.color, type: piece.type };
  }
  const frames = [{ position: structuredClone(position), fen: initial.fen() }];
  for (let index = 0; index < moves.length; index++) {
    const move = moves[index], piece = position[move.from];
    if (!piece) throw Error('Unsupported position: moving piece is missing.');
    delete position[move.from];
    if (move.isEnPassant()) delete position[`${move.to[0]}${move.from[1]}`];
    if (move.isKingsideCastle() || move.isQueensideCastle()) {
      const rank = move.from[1], kingSide = move.isKingsideCastle();
      position[`${kingSide ? 'f' : 'd'}${rank}`] = position[`${kingSide ? 'h' : 'a'}${rank}`];
      delete position[`${kingSide ? 'h' : 'a'}${rank}`];
    }
    if (move.promotion) {
      piece.type = move.promotion;
      pieces.find(p => p.id === piece.id).promotion = { ply: index + 1, type: move.promotion, square: move.to };
    }
    position[move.to] = piece;
    frames.push({ position: structuredClone(position), fen: move.after });
  }
  return { headers, moves, frames, pieces };
}

export function newVisibility(game) {
  return { wPawns: true, bPawns: true, pieces: Object.fromEntries(game.pieces.map(p => [p.id, true])) };
}
export function isVisible(piece, visibility) {
  return piece.type === 'p' ? visibility[`${piece.color}Pawns`] : visibility.pieces[piece.id];
}
export function pawnsOnly(game) {
  return { wPawns: true, bPawns: true, pieces: Object.fromEntries(game.pieces.map(p => [p.id, false])) };
}

// Derive actual movement from identity snapshots, including a castling rook.
// Disappearance on capture is not a move; promotion keeps the same identity.
export function pieceHistory(game, id, ply) {
  if (!game.pieces.some(piece => piece.id === id)) return [];
  const history = [];
  let previous = game.pieces.find(piece => piece.id === id).start;
  for (let step = 1; step <= Math.min(ply, game.moves.length); step++) {
    const square = Object.keys(game.frames[step].position).find(square => game.frames[step].position[square].id === id);
    if (square && square !== previous) {
      history.push({ from: previous, to: square, ply: step, san: game.moves[step - 1].san });
      previous = square;
    }
  }
  return history;
}
