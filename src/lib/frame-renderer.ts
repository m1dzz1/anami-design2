/**
 * Draws a frame sequence (Transformation.tsx) onto a canvas: one frame, or two cross-faded.
 *
 * WebGL keeps every decoded frame as a GPU texture, uploaded once, so a scrubbed frame is just a blend of two
 * textures. With a 2D canvas each drawImage of a CPU-side ImageBitmap re-uploads the whole frame (~4 MB at laptop
 * size, twice per cross-faded frame), which capped scrolling through the section at 30 fps. 2D stays as the
 * fallback for browsers without WebGL.
 */

export type FrameHandle = { bitmap?: ImageBitmap; texture?: WebGLTexture };

/** Where the frame is drawn, in canvas pixels (cover fit, so it may overhang the canvas). */
export type FrameRect = { x: number; y: number; width: number; height: number };

export type FrameRenderer = {
  /** Takes ownership of the bitmap. */
  upload: (bitmap: ImageBitmap) => FrameHandle | null;
  release: (handle: FrameHandle) => void;
  draw: (below: FrameHandle, above: FrameHandle, mix: number, rect: FrameRect) => void;
  dispose: () => void;
};

const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_pos;
void main() {
  // Canvas space with the origin at the top left, matching the texture rows
  v_pos = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
varying vec2 v_pos;
uniform sampler2D u_below;
uniform sampler2D u_above;
uniform float u_mix;
uniform vec2 u_scale;
uniform vec2 u_offset;
void main() {
  vec2 uv = v_pos * u_scale - u_offset;
  gl_FragColor = mix(texture2D(u_below, uv), texture2D(u_above, uv), u_mix);
}`;

function createGlRenderer(canvas: HTMLCanvasElement, onReset: () => void): FrameRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  let uniforms: Record<"mix" | "scale" | "offset", WebGLUniformLocation | null> | null = null;
  let lost = false;

  const setup = () => {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);

    // One triangle strip covering the whole canvas
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1i(gl.getUniformLocation(program, "u_below"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_above"), 1);
    uniforms = {
      mix: gl.getUniformLocation(program, "u_mix"),
      scale: gl.getUniformLocation(program, "u_scale"),
      offset: gl.getUniformLocation(program, "u_offset"),
    };
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    return true;
  };
  if (!setup()) return null;

  // The GPU may drop the context (driver reset, too many contexts); every texture goes with it
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
  };
  const onRestored = () => {
    lost = !setup();
    onReset();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  return {
    upload(bitmap) {
      if (lost) {
        bitmap.close();
        return null;
      }
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Frames aren't powers of two: no mipmaps, clamped edges
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
      bitmap.close();
      return texture ? { texture } : null;
    },
    release(handle) {
      if (handle.texture && !lost) gl.deleteTexture(handle.texture);
    },
    draw(below, above, mix, rect) {
      if (lost || !uniforms || !below.texture || !above.texture) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, below.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, above.texture);
      gl.uniform1f(uniforms.mix, mix);
      gl.uniform2f(uniforms.scale, canvas.width / rect.width, canvas.height / rect.height);
      gl.uniform2f(uniforms.offset, rect.x / rect.width, rect.y / rect.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    },
  };
}

function create2dRenderer(canvas: HTMLCanvasElement): FrameRenderer | null {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;
  const paint = (bitmap: ImageBitmap, rect: FrameRect) => ctx.drawImage(bitmap, rect.x, rect.y, rect.width, rect.height);
  return {
    upload: (bitmap) => ({ bitmap }),
    release: (handle) => handle.bitmap?.close(),
    draw(below, above, mix, rect) {
      if (!below.bitmap || !above.bitmap) return;
      ctx.imageSmoothingQuality = "medium";
      ctx.globalAlpha = 1;
      paint(below.bitmap, rect);
      if (mix > 0.01) {
        ctx.globalAlpha = mix;
        paint(above.bitmap, rect);
        ctx.globalAlpha = 1;
      }
    },
    dispose() {},
  };
}

/** `onReset` fires when the GPU context comes back after a loss: every handle is gone and must be uploaded again. */
export function createFrameRenderer(canvas: HTMLCanvasElement, onReset: () => void): FrameRenderer | null {
  return createGlRenderer(canvas, onReset) ?? create2dRenderer(canvas);
}
