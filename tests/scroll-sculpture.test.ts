import test from "node:test";
import assert from "node:assert/strict";
import { scrollProgress, easeSculpture } from "../src/lib/scroll-sculpture";

test("scroll progression is bounded across overscroll, short pages and invalid sizes", () => {
  assert.equal(scrollProgress(0, 5000, 1000), 0);
  assert.equal(scrollProgress(-2000, 5000, 1000), 0.5);
  assert.equal(scrollProgress(-4000, 5000, 1000), 1);
  assert.equal(scrollProgress(-9000, 5000, 1000), 1);
  assert.equal(scrollProgress(200, 5000, 1000), 0);
  assert.equal(scrollProgress(-100, 600, 900), 0);
  assert.equal(scrollProgress(NaN, 5000, 900), 0);
});
test("eased scroll never jumps, overshoots or depends on frame rate", () => {
  const halfway = easeSculpture(0, 1, 1 / 60);
  assert.ok(halfway > 0 && halfway < 0.15);
  assert.equal(easeSculpture(0.5, 0.5, 1 / 60), 0.5);
  assert.equal(easeSculpture(0.5, 1, 0), 0.5);
  assert.equal(easeSculpture(0, 1, 999), easeSculpture(0, 1, 0.05));
  let sixty = 0,
    thirty = 0;
  for (let i = 0; i < 60; i++) sixty = easeSculpture(sixty, 1, 1 / 60);
  for (let i = 0; i < 30; i++) thirty = easeSculpture(thirty, 1, 1 / 30);
  assert.ok(Math.abs(sixty - thirty) < 0.00001);
  assert.ok(sixty < 1 && sixty > 0.99);
});
