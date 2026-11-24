import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MULTIPLIER, averageFor, isValidDart, remainingFor, replayGame } from "../js/game.js";
import { suggestCheckout } from "../js/checkout.js";

const single = (segment) => ({ segment, multiplier: MULTIPLIER.SINGLE });
const double = (segment) => ({ segment, multiplier: MULTIPLIER.DOUBLE });
const triple = (segment) => ({ segment, multiplier: MULTIPLIER.TRIPLE });

const givenConfig = (overrides) => ({
  players: [{ name: "Alice" }, { name: "Bob" }],
  startScore: 101,
  doubleOut: true,
  starterIndex: 0,
  ...overrides,
});

describe("replayGame", () => {
  it("keeps the turn open until three darts are thrown", () => {
    const state = replayGame({ config: givenConfig({}), darts: [triple(20), single(1)] });
    assert.equal(state.currentPlayer, 0);
    assert.equal(remainingFor({ state, playerIndex: 0 }), 40);
  });

  it("hands over to the next player after three darts", () => {
    const state = replayGame({ config: givenConfig({}), darts: [single(20), single(20), single(20)] });
    assert.equal(state.currentPlayer, 1);
    assert.equal(state.scores[0], 41);
    assert.equal(state.turns[0].total, 60);
  });

  it("busts when going below zero and restores the start-of-turn score", () => {
    const state = replayGame({ config: givenConfig({}), darts: [triple(20), triple(20)] });
    assert.equal(state.scores[0], 101);
    assert.equal(state.currentPlayer, 1);
    assert.equal(state.turns[0].bust, true);
  });

  it("busts when leaving 1 in double-out", () => {
    const state = replayGame({ config: givenConfig({}), darts: [triple(20), double(20)] });
    assert.equal(state.turns[0].bust, true);
  });

  it("busts when reaching zero without a double in double-out", () => {
    const state = replayGame({ config: givenConfig({ startScore: 40 }), darts: [single(20), single(20)] });
    assert.equal(state.turns[0].bust, true);
    assert.equal(state.scores[0], 40);
  });

  it("wins on a double finish", () => {
    const state = replayGame({ config: givenConfig({}), darts: [triple(20), single(1), double(20)] });
    assert.equal(state.winner, 0);
    assert.equal(state.scores[0], 0);
  });

  it("wins on any finish without double-out", () => {
    const state = replayGame({ config: givenConfig({ doubleOut: false, startScore: 20 }), darts: [single(20)] });
    assert.equal(state.winner, 0);
  });

  it("ignores darts thrown after the win", () => {
    const state = replayGame({ config: givenConfig({ doubleOut: false, startScore: 20 }), darts: [single(20), single(5)] });
    assert.equal(state.turns.length, 1);
  });

  it("averages completed turns, counting busts as zero", () => {
    const state = replayGame({
      config: givenConfig({ startScore: 501 }),
      darts: [single(20), single(20), single(20), single(1), single(1), single(1)],
    });
    assert.equal(averageFor({ state, playerIndex: 0 }), 60);
    assert.equal(averageFor({ state, playerIndex: 1 }), 3);
  });
});

describe("isValidDart", () => {
  it("rejects a triple bull and a doubled miss", () => {
    assert.equal(isValidDart(triple(25)), false);
    assert.equal(isValidDart(double(0)), false);
    assert.equal(isValidDart(double(25)), true);
  });
});

describe("suggestCheckout", () => {
  it("finishes 170 with T20 T20 Bull", () => {
    assert.deepEqual(suggestCheckout({ remaining: 170, dartsLeft: 3, doubleOut: true }), [triple(20), triple(20), double(25)]);
  });

  it("prefers the shortest route", () => {
    assert.deepEqual(suggestCheckout({ remaining: 107, dartsLeft: 3, doubleOut: true }), [triple(19), double(25)]);
  });

  it("returns null for impossible scores", () => {
    assert.equal(suggestCheckout({ remaining: 169, dartsLeft: 3, doubleOut: true }), null);
    assert.equal(suggestCheckout({ remaining: 41, dartsLeft: 1, doubleOut: true }), null);
  });
});
