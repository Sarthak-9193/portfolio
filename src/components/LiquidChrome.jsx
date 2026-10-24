import { useEffect, useRef } from 'react';
import './LiquidChrome.css';

const vertexSource = `
attribute vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentSource = `
precision mediump float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uTint;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform float uDetail;
uniform float uRoughness;
uniform float uExposure;
uniform float uLightMode;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uResolution.xy;
  vec2 p=(uv-.5)*vec2(uResolution.x/uResolution.y,1.0);
  float t=uTime;
  vec2 q=p;
  for(float i=1.; i<=8.; i++){
    if(i>uDetail) break;
    float a=uAmplitude/i;
    q.x += a*sin((q.y*uFrequencyY*i)+t*(.45+i*.025));
    q.y += a*cos((q.x*uFrequencyX*i)-t*(.35+i*.02));
  }
  float phase = q.x*3.7 + q.y*2.4 + sin(q.y*4.0-t*.4)*.8;
  float bands = sin(phase*3.0 + sin(q.y*5.0+t*.2)*1.2);
  float streak = 1.0-smoothstep(.02,.65,abs(bands));
  float fine = sin(phase*8.0 + noise(q*4.0)*2.0);
  float broad = sin(phase*1.25 + cos(q.y*3.2+t*.15));
  float reflect = .5 + .5*cos(phase*2.1 + fine*.32);
  float chrome = smoothstep(.22,.98,reflect*.72 + streak*.34 + broad*.08);
  chrome = mix(chrome, smoothstep(.28,.95,reflect*.7+streak*.3), uRoughness*.6);
  float edge = smoothstep(1.2,.05,length(p));
  float vignette = smoothstep(1.25,.15,length(p));
  float grain = (hash(gl_FragCoord.xy)-.5)*.025;
  vec3 dark = uLightMode>.5 ? vec3(.24,.23,.24) : vec3(.008,.006,.009);
  vec3 metal = mix(dark, vec3(.78,.76,.78)*uTint, chrome);
  metal += vec3(streak*.22 + pow(max(0.0, fine),12.0)*.16);
  metal *= uExposure;
  metal = mix(dark, metal, vignette*.88);
  metal += grain;
  gl_FragColor = vec4(clamp(metal,0.0,1.0), .92);
}`;

function makeShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('LiquidChrome shader compile failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function hexToRgb(hex) {
  const value = String(hex || '#ffffff').replace('#', '');
  const full = value.length === 3 ? value.split('').map(c => c + c).join('') : value;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function LiquidChrome({
  color = '#ffffff', speed = 0.2, amplitude = 0.3, frequencyX = 3, frequencyY = 3,
  detail = 4, thickness = 1, depth = 1, roughness = 0.3, exposure = 1,
  interactive = false, rippleStrength = 0, rippleSize = 1, tilt = 0, intro = true,
  lightMode = false, maxDevicePixelRatio = 2, className = '', style
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const settingsRef = useRef({ color, speed, amplitude, frequencyX, frequencyY, detail, thickness, depth, roughness, exposure, interactive, rippleStrength, rippleSize, tilt, intro, lightMode, maxDevicePixelRatio });
  settingsRef.current = { color, speed, amplitude, frequencyX, frequencyY, detail, thickness, depth, roughness, exposure, interactive, rippleStrength, rippleSize, tilt, intro, lightMode, maxDevicePixelRatio };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) {
      container.classList.add('liquid-chrome--fallback');
      return;
    }
    const vertex = makeShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = makeShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('LiquidChrome program link failed:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = name => gl.getUniformLocation(program, name);
    const uniforms = {
      resolution: uniform('uResolution'), time: uniform('uTime'), tint: uniform('uTint'),
      amplitude: uniform('uAmplitude'), frequencyX: uniform('uFrequencyX'), frequencyY: uniform('uFrequencyY'),
      detail: uniform('uDetail'), roughness: uniform('uRoughness'), exposure: uniform('uExposure'), lightMode: uniform('uLightMode')
    };
    let raf = 0, start = performance.now(), width = 0, height = 0, visible = true;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const settings = settingsRef.current;
      const ratio = Math.min(window.devicePixelRatio || 1, settings.maxDevicePixelRatio || 1.5, 1.5);
      width = Math.max(1, Math.round(rect.width * ratio)); height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, width, height);
    };
    const draw = now => {
      if (!visible || document.visibilityState === 'hidden') { raf = requestAnimationFrame(draw); return; }
      const s = settingsRef.current;
      resize();
      gl.useProgram(program);
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform1f(uniforms.time, ((now - start) / 1000) * Math.max(0, s.speed));
      gl.uniform3fv(uniforms.tint, hexToRgb(s.color));
      gl.uniform1f(uniforms.amplitude, Math.max(0, Math.min(1.2, s.amplitude)));
      gl.uniform1f(uniforms.frequencyX, s.frequencyX);
      gl.uniform1f(uniforms.frequencyY, s.frequencyY);
      gl.uniform1f(uniforms.detail, Math.max(1, Math.min(8, s.detail)));
      gl.uniform1f(uniforms.roughness, Math.max(0, Math.min(1, s.roughness)));
      gl.uniform1f(uniforms.exposure, Math.max(0, s.exposure));
      gl.uniform1f(uniforms.lightMode, s.lightMode ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const intersection = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); });
    intersection.observe(container);
    resize(); raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf); observer.disconnect(); intersection.disconnect();
      gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
    };
  }, []);

  return <div ref={containerRef} className={`liquid-chrome ${className}`.trim()} style={style} aria-hidden="true">
    <canvas ref={canvasRef} className="liquid-chrome__canvas" />
  </div>;
}
