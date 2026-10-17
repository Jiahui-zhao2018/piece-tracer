import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { loadGame, newVisibility, pawnsOnly, isVisible } from '../src/model.js';
const opening = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 *';
function assertFrames(game) {
  game.frames.forEach(frame => {
    const expected = new Chess(frame.fen).board().flat().filter(Boolean).map(p => `${p.square}:${p.color}${p.type}`).sort();
    const actual = Object.entries(frame.position).map(([square, p]) => `${square}:${p.color}${p.type}`).sort();
    assert.deepEqual(actual, expected);
    assert.equal(new Set(Object.values(frame.position).map(p => p.id)).size, actual.length);
  });
}
test('PGN positions and stable identities survive movement, castling, and arbitrary navigation', () => {
  const game = loadGame(opening), visibility = newVisibility(game);
  visibility.pieces['w-g1'] = false;
  assertFrames(game);
  assert.equal(game.frames[3].position.f3.id, 'w-g1');
  assert.equal(isVisible(game.frames[3].position.f3, visibility), false);
  assert.equal(isVisible(game.frames[3].position.b1, visibility), true);
  assert.equal(isVisible(game.frames[0].position.g1, visibility), false);
  assert.equal(game.frames[9].position.g1.id, 'w-e1');
  assert.equal(game.frames[9].position.f1.id, 'w-h1');
  assert.equal(game.frames[11].position.e1.id, 'w-h1');
});
test('pawns only preserves full state while reviewing both directions; show all restores selected position', () => {
  const game = loadGame(opening), visibility = pawnsOnly(game);
  for (const ply of [0, 7, 12, 3, 0]) {
    const position = Object.values(game.frames[ply].position);
    assert.equal(position.length, 32);
    assert.equal(position.filter(p => isVisible(p, visibility)).length, 16);
    assert.ok(position.filter(p => isVisible(p, visibility)).every(p => p.type === 'p'));
    assert.equal(position.filter(p => isVisible(p, newVisibility(game))).length, 32);
  }
});
test('capture keeps victim identity in registry and restores it when rewinding', () => {
  const game = loadGame('1. e4 d5 2. exd5 Qxd5 *');
  assertFrames(game);
  const visibility = newVisibility(game); visibility.wPawns = false;
  assert.ok(game.pieces.find(p => p.id === 'w-e2'));
  assert.equal(Object.values(game.frames[4].position).some(p => p.id === 'w-e2'), false);
  assert.equal(game.frames[3].position.d5.id, 'w-e2');
  assert.equal(isVisible(game.frames[3].position.d5, visibility), false);
});
test('en passant removes captured pawn from its actual square', () => {
  const game = loadGame('1. e4 a6 2. e5 d5 3. exd6 *'); assertFrames(game);
  assert.equal(game.frames[5].position.d6.id, 'w-e2');
  assert.equal(game.frames[5].position.d5, undefined);
  assert.equal(game.frames[4].position.d5.id, 'b-d7');
});
test('queenside castling retains king and rook identity', () => {
  const game = loadGame('[SetUp "1"]\n[FEN "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"]\n\n1. O-O-O O-O *');
  assertFrames(game);
  assert.equal(game.frames[1].position.c1.id, 'w-e1');
  assert.equal(game.frames[1].position.d1.id, 'w-a1');
  assert.equal(game.frames[2].position.f8.id, 'b-h8');
});
test('promotion uses pawn group before promotion, own setting after; underpromotion supported', () => {
  const game = loadGame('[SetUp "1"]\n[FEN "7k/P7/8/8/8/8/8/7K w - - 0 1"]\n\n1. a8=N *');
  assertFrames(game);
  const visibility = newVisibility(game); visibility.wPawns = false;
  assert.equal(isVisible(game.frames[0].position.a7, visibility), false);
  assert.equal(game.frames[1].position.a8.id, 'w-a7');
  assert.equal(isVisible(game.frames[1].position.a8, visibility), true);
  visibility.pieces['w-a7'] = false; visibility.wPawns = true;
  assert.equal(isVisible(game.frames[1].position.a8, visibility), false);
  assert.equal(isVisible(game.frames[0].position.a7, visibility), true);
  assert.equal(isVisible(game.frames[1].position.a8, visibility), false);
  assert.equal(game.pieces.find(p => p.id === 'w-a7').promotion.type, 'n');
});
test('comments, annotations, and variations do not enter main line', () => {
  const game = loadGame('1. e4 {test 1-0} (1. d4 d5) e5 $1 2. Nf3 *');
  assert.deepEqual(game.moves.map(m => m.san), ['e4', 'e5', 'Nf3']);
});
test('invalid, empty, unsupported and multiple-game inputs are rejected', () => {
  for (const pgn of ['', 'hello', '1. e5 *', '1. e4 {oops', '1. e4 *\n1. d4 *', '[Event "A"]\n1. e4\n[Event "B"]\n1. d4', '[Variant "Chess960"]\n1. e4 *']) assert.throws(() => loadGame(pgn));
});
test('punctuation and move-like text inside PGN header values remain valid', () => {
  const game = loadGame('[Event "Round 1. Final (study); {practice}"]\n[White "Player"]\n\n1. e4 e5 *');
  assert.equal(game.moves.length, 2);
});
