/** Deterministic, original geometry. No textures, network requests or per-frame uploads. */
export function createParticleGeometry(count: number) {
  if (!Number.isInteger(count) || count < 1 || count > 50000)
    throw new RangeError("Particle count must be between 1 and 50000");
  // Interleaved prism xyz, knot xyz, seed, type (sculpture / floor / dust).
  const data = new Float32Array(count * 8);
  let seed = 42;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const u = random(),
      v = random(),
      s = random();
    const kind = i < count * 0.78 ? 0 : i < count * 0.96 ? 1 : 2;
    let a: number[], b: number[];
    if (kind === 0) {
      a = [u * 2 - 1, v * 2 - 1, s * 2 - 1];
      a[i % 3] = i % 2 ? 1 : -1;
      // A continuous trefoil tube: distinct creative strands meeting in one form.
      const t = u * Math.PI * 2,
        tube = v * Math.PI * 2;
      const r = 0.75 + 0.28 * Math.cos(3 * t) + 0.12 * Math.cos(tube);
      b = [
        r * Math.cos(2 * t),
        0.53 * Math.sin(3 * t) + 0.12 * Math.sin(tube),
        r * Math.sin(2 * t),
      ];
    } else if (kind === 1) {
      const t = u * Math.PI * 2,
        r = 1.55 + (i % 4) * 0.32 + v * 0.016;
      a = b = [Math.cos(t) * r, -1.38, Math.sin(t) * r];
    } else {
      a = b = [(u - 0.5) * 7, v * 4 - 1.2, (s - 0.5) * 5];
    }
    data.set([...a, ...b, s, kind], i * 8);
  }
  return data;
}

const vertex = `
attribute vec3 a_prism;
attribute vec3 a_knot;
attribute float a_seed;
attribute float a_kind;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dpr;
uniform float u_reflection;
varying vec3 v_color;
varying float v_alpha;
void main() {
  float morph = smoothstep(-0.55, 0.55, sin(u_time * 0.22 - 1.57));
  vec3 p = mix(a_prism, a_knot, morph);
  float angle = u_time * 0.18 + 0.52;
  float c = cos(angle), s = sin(angle);
  p.xz = mat2(c, -s, s, c) * p.xz;
  if (a_kind < 0.5) {
    p.y += sin(u_time * 0.65) * 0.06;
    p += sin(u_time * 0.9 + a_seed * 40.0) * 0.007;
  }
  if (a_kind > 1.5) p.y += sin(u_time * 0.15 + a_seed * 30.0) * 0.16;
  float reflected = u_reflection;
  if (reflected > 0.5) p.y = -2.76 - p.y;
  // A slightly elevated camera reveals the glossy ground plane.
  float py = p.y * 0.94 - p.z * 0.342;
  float pz = p.y * 0.342 + p.z * 0.94;
  float depth = 5.5 / (5.5 - pz);
  vec2 css = u_resolution / u_dpr;
  bool mobile = css.x < 768.0;
  float scale = mobile ? min(css.x * 0.28, 155.0) : min(css.x * 0.155, css.y * 0.245);
  vec2 center = mobile ? vec2(css.x * 0.5, 238.0) : vec2(css.x * 0.74, css.y * 0.46);
  vec2 pixel = center + vec2(p.x, -py) * scale * depth;
  gl_Position = vec4(pixel / css * vec2(2.0, -2.0) + vec2(-1.0, 1.0), 0.0, 1.0);
  gl_PointSize = clamp((1.15 + a_seed * 1.25) * depth * u_dpr, 1.0, 6.0);
  v_color = mix(vec3(0.18, 0.35, 1.0), vec3(0.38, 0.82, 1.0), a_seed);
  if (a_seed > 0.965 && a_kind < 0.5) v_color = vec3(1.0, 0.35, 0.235);
  v_alpha = a_kind < 0.5 ? 0.70 : a_kind < 1.5 ? 0.40 : 0.24;
  v_alpha *= 0.82 + 0.18 * sin(u_time + a_seed * 20.0);
  if (reflected > 0.5) {
    v_alpha *= a_kind < 0.5 ? 0.18 : 0.0;
    v_alpha *= clamp(1.0 - abs(p.y + 1.38) * 0.3, 0.0, 1.0);
  }
}`;
const fragment = `
precision mediump float;
varying vec3 v_color;
varying float v_alpha;
void main() {
  float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
  if (r > 1.0) discard;
  float light = pow(1.0 - r, 1.5);
  gl_FragColor = vec4(v_color, light * v_alpha);
}`;

export function createParticleRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL unavailable");
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const dispose = () => {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
  };
  try {
    if (!program || !buffer)
      throw new Error("Unable to allocate particle scene");
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Unable to allocate shader");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error("Particle shader compilation failed");
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Particle shader linking failed");
    gl.useProgram(program);
    const count = canvas.clientWidth < 768 ? 10500 : 22000;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      createParticleGeometry(count),
      gl.STATIC_DRAW,
    );
    for (const [name, size, offset] of [
      ["a_prism", 3, 0],
      ["a_knot", 3, 12],
      ["a_seed", 1, 24],
      ["a_kind", 1, 28],
    ] as const) {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 32, offset);
    }
    const uniforms = Object.fromEntries(
      ["u_resolution", "u_time", "u_dpr", "u_reflection"].map((name) => [
        name,
        gl.getUniformLocation(program, name),
      ]),
    );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);
    let dpr = 1;
    return {
      resize() {
        dpr = Math.min(
          window.devicePixelRatio || 1,
          1.5,
          4096 / Math.max(canvas.clientWidth, canvas.clientHeight, 1),
        );
        canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
        canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
      },
      draw(time: number) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.u_dpr, dpr);
        gl.uniform1f(uniforms.u_time, time);
        for (const reflection of [1, 0]) {
          gl.uniform1f(uniforms.u_reflection, reflection);
          gl.drawArrays(gl.POINTS, 0, count);
        }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
