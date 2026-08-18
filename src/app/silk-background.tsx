"use client";

import { useEffect, useRef } from "react";

/**
 * Full-viewport WebGL silk. Two layers of domain-warped value noise produce the
 * drape; a sine band across the warped field becomes the sheen along each fold.
 * The pointer both displaces the field locally and lights it, so the fabric
 * reacts rather than just scrolling past.
 *
 * Deliberately low contrast — this sits behind readable UI, not in front of it.
 */

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform vec2  u_mouse;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float scale = min(u_res.x, u_res.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / scale;
  vec2 m = (u_mouse - 0.5 * u_res) / scale;

  float t = u_time * 0.075;

  // Pointer well: pull the field toward the cursor and push a small ripple
  // outward, falling off fast so the rest of the drape keeps its own motion.
  vec2 d = p - m;
  float dist2 = dot(d, d);
  float infl = exp(-dist2 * 2.6);
  p += normalize(d + 1e-5) * infl * 0.20;
  p -= d * infl * 0.12;

  // Two-pass domain warp (Iñigo Quílez): noise displacing noise is what turns
  // flat fbm into something that reads as folded cloth.
  vec2 q = vec2(
    fbm(p * 1.55 + t),
    fbm(p * 1.55 + vec2(3.2, 1.3) - t * 0.7)
  );
  vec2 r = vec2(
    fbm(p * 1.55 + 3.0 * q + vec2(1.7, 9.2) + t * 0.5),
    fbm(p * 1.55 + 3.0 * q + vec2(8.3, 2.8) - t * 0.4)
  );
  float f = fbm(p * 1.55 + 3.4 * r);

  // Sheen: banding along the warped field, sharpened so highlights sit on the
  // crease of each fold instead of smearing evenly.
  float folds = 0.5 + 0.5 * sin(f * 9.5 + r.x * 4.0 + t * 2.2);
  folds = pow(folds, 2.4);

  float shade = mix(f, folds, 0.55);

  // Strictly neutral greys, kept inside the graphite range: the panels sit at
  // #171717, so the drape must stay below the reference board's mid-tone or it
  // washes the page out instead of sitting behind it.
  vec3 base = vec3(0.075);
  vec3 hi   = vec3(0.215);
  vec3 col  = mix(base, hi, shade);

  col += infl * 0.028;

  // Soft lift toward the top-centre, echoing the reference board's lighting.
  vec2 lc = uv - vec2(0.5, 0.82);
  col += 0.045 * exp(-dot(lc, lc) * 2.2);

  vec2 c = uv - 0.5;
  col *= 1.0 - 0.34 * dot(c, c);

  // Dither: 8-bit output bands badly across these shallow gradients.
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.013;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("silk shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function SilkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      powerPreference: "low-power",
    });
    // No WebGL: the CSS gradient on <body> already stands in, so just bail.
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("silk link:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // One oversized triangle covers the viewport with fewer verts than a quad.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uTime = gl.getUniformLocation(program, "u_time");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Target is where the pointer is; current chases it, which is what gives
    // the fabric its lag instead of snapping to the cursor.
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let curX = targetX;
    let curY = targetY;

    function resize() {
      if (!canvas || !gl) return;
      // Capping DPR matters: this is a per-pixel shader and retina panels would
      // otherwise quadruple the fragment count for no visible gain.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    function onPointer(e: PointerEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });

    const start = performance.now();
    let frame = 0;

    function draw(now: number) {
      frame = requestAnimationFrame(draw);
      if (!gl || !canvas) return;

      // Skip work while backgrounded — rAF usually throttles, but not always.
      if (document.hidden) return;

      curX += (targetX - curX) * 0.045;
      curY += (targetY - curY) * 0.045;

      const dpr = canvas.width / window.innerWidth;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      // Canvas Y is bottom-up; pointer Y is top-down.
      gl.uniform2f(uMouse, curX * dpr, canvas.height - curY * dpr);
      gl.uniform1f(uTime, reduced ? 0 : (now - start) / 1000);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 h-full w-full"
    />
  );
}
