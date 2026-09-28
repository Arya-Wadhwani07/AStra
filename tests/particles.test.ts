import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  createParticleGeometry,
  createParticleRenderer,
} from "../src/lib/particle-scene";
import { ParticleHero } from "../src/components/particle-hero";

test("particle geometry is deterministic and finite at both device budgets", () => {
  for (const count of [10500, 22000]) {
    const data = createParticleGeometry(count);
    assert.equal(data.length, count * 8);
    assert.deepEqual(data, createParticleGeometry(count));
    assert.ok(data.every(Number.isFinite));
  }
});
test("particle geometry includes prism, knot, floor and ambient dust", () => {
  const data = createParticleGeometry(1000);
  const types = new Set<number>();
  for (let i = 0; i < data.length; i += 8) {
    types.add(data[i + 7]);
    assert.ok(data[i + 6] >= 0 && data[i + 6] <= 1);
    if (data[i + 7] === 0) {
      assert.ok(data.slice(i, i + 3).some((x) => Math.abs(x) === 1));
      assert.ok(data.slice(i + 3, i + 6).every((x) => Math.abs(x) < 1.3));
    }
    if (data[i + 7] === 1) assert.ok(Math.abs(data[i + 1] + 1.38) < 0.00001);
  }
  assert.deepEqual([...types], [0, 1, 2]);
});
test("particle budgets reject invalid or unbounded allocations", () => {
  for (const count of [0, -1, 1.5, NaN, Infinity, 50001])
    assert.throws(() => createParticleGeometry(count), RangeError);
});
test("unsupported WebGL reports a recoverable initialization failure", () => {
  assert.throws(
    () =>
      createParticleRenderer({
        getContext: () => null,
      } as unknown as HTMLCanvasElement),
    /WebGL unavailable/,
  );
});
test("hero server rendering includes a crisp vector fallback without autoplay", () => {
  const html = renderToString(React.createElement(ParticleHero));
  assert.match(html, /<svg[^>]+aria-hidden="true"/);
  assert.match(html, /<canvas[^>]+aria-hidden="true"/);
  assert.doesNotMatch(html, /<video|<button/);
});
test("collaboration and loyalty use distinct deterministic finite geometries", () => {
  for (const variant of ["collab", "loyalty"] as const) {
    const data = createParticleGeometry(10500, variant);
    assert.ok(data.every(Number.isFinite));
    assert.deepEqual(data, createParticleGeometry(10500, variant));
    assert.notDeepEqual(data, createParticleGeometry(10500));
    const html = renderToString(React.createElement(ParticleHero, { variant }));
    assert.match(html, new RegExp(`data-sculpture="${variant}"`));
    assert.doesNotMatch(html, /<video|\.mp4|\.jpg/);
  }
});
