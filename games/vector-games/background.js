export class Background {
    constructor(gl) {
        this.gl = gl;
        
        const vsSource = `
            attribute vec2 aPosition;
            varying vec2 vUv;
            void main() {
                vUv = aPosition * 0.5 + 0.5; // 0..1
                gl_Position = vec4(aPosition, 0.99, 1.0); // Push to back Z=0.99
            }
        `;

        const fsSource = `
            precision mediump float;
            uniform float uTime;
            uniform vec2 uResolution;
            uniform float uSolarFlare; // 0.0 to 1.0 intensity
            uniform vec2 uSolarFlarePos; // Position of flare
            varying vec2 vUv;

            // Random / Hash function
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            // 2D Noise
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            // FBM (Fractal Brownian Motion)
            float fbm(vec2 st) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(st);
                    st *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / uResolution.xy;
                // Correct aspect ratio for stars
                vec2 suv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
                
                float t = uTime * 0.2;

                // Background Color (Deep Space)
                vec3 color = vec3(0.02, 0.02, 0.05);

                // Nebulae / Auroras (Ghostly shifting)
                // Layer 1: Purple/Pink
                float n1 = fbm(uv * 3.0 + vec2(t * 0.1, t * 0.05));
                float mask1 = smoothstep(0.4, 0.8, n1);
                color = mix(color, vec3(0.4, 0.1, 0.5), mask1 * 0.3);

                // Layer 2: Blue/Cyan
                float n2 = fbm(uv * 2.0 - vec2(t * 0.08, t * 0.02) + 5.0);
                float mask2 = smoothstep(0.3, 0.7, n2);
                color = mix(color, vec3(0.1, 0.3, 0.6), mask2 * 0.3);

                // Layer 3: Red/Dark
                float n3 = fbm(uv * 4.0 + vec2(0.0, t * 0.1) + 2.0);
                float mask3 = smoothstep(0.5, 0.9, n3);
                color = mix(color, vec3(0.5, 0.1, 0.1), mask3 * 0.2);

            // Starfield (Moving "into" screen illusion - dots expanding from center)
            float starT = uTime * 0.1;
            // Use polar coordinates
            vec2 centered = (uv * 2.0 - 1.0); // -1 to 1
            float radius = length(centered);
            float angle = atan(centered.y, centered.x);
            
            float warpSpeed = 0.5;
            float warpTime = uTime * warpSpeed;
            
            // 3 Layers of stars
            for(float i=0.0; i<3.0; i++) {
                 float layerOffset = i * 10.0;
                 // Classic tunnel effect
                 float z = fract(warpTime + i * 0.333); // 0..1 (Depth, 1 is near, 0 is far)
                 
                 if (z < 0.01) continue;
                 
                 float fade = smoothstep(0.0, 0.2, z); 
                 
                 vec2 gridUV = centered / z; 
                 
                 vec2 cell = floor(gridUV * 10.0 + layerOffset); 
                 vec2 cellUV = fract(gridUV * 10.0 + layerOffset);
                 
                 float starRand = random(cell);
                 
                 if (starRand > 0.95) {
                     vec2 starPos = vec2(0.5, 0.5) + (vec2(random(cell*1.1), random(cell*1.2)) - 0.5) * 0.5;
                     float d = distance(cellUV, starPos);
                     if (d < 0.1) { 
                         float brightness = (1.0 - d*10.0) * fade * z; 
                         color += vec3(1.0, 1.0, 1.0) * brightness;
                     }
                 }
            }

            // Solar Flare Effect
            if (uSolarFlare > 0.0) {
                // Convert flare pos to 0..1 UV space (it comes in as pixels)
                vec2 flareUV = uSolarFlarePos / uResolution.xy;
                
                // Calculate distance to flare center
                float d = distance(uv, flareUV);
                
                // Intense center brightness
                float core = 1.0 / (d * 10.0 + 0.1);
                
                // Wide glow
                float glow = 1.0 / (d * 2.0 + 0.5);
                
                // Dynamic rays/noise
                float rayAngle = atan(uv.y - flareUV.y, uv.x - flareUV.x);
                float rays = noise(vec2(rayAngle * 10.0 + uTime * 5.0, d * 2.0));
                
                // Color grading: Yellow/White/Orange
                vec3 flareColor = vec3(1.0, 0.9, 0.5) * core * 2.0;
                flareColor += vec3(1.0, 0.6, 0.2) * glow * 2.0;
                flareColor += vec3(1.0, 0.8, 0.4) * rays * glow;
                
                // Blend additively based on intensity
                color += flareColor * uSolarFlare;
                
                // Screen bleach/overexposure at high intensity
                if (uSolarFlare > 0.8) {
                     color = mix(color, vec3(1.0), (uSolarFlare - 0.8) * 2.0);
                }
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `;
    
    this.program = this.createProgram(gl, vsSource, fsSource);
    
    this.attribs = {
        position: gl.getAttribLocation(this.program, 'aPosition'),
    };
    this.uniforms = {
        time: gl.getUniformLocation(this.program, 'uTime'),
        resolution: gl.getUniformLocation(this.program, 'uResolution'),
        solarFlare: gl.getUniformLocation(this.program, 'uSolarFlare'),
        solarFlarePos: gl.getUniformLocation(this.program, 'uSolarFlarePos'),
    };

        // Full screen quad
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ]);

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    draw(width, height, time, solarFlareIntensity = 0.0, solarFlarePos = {x:0, y:0}) {
        const gl = this.gl;
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.attribs.position);
        gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(this.uniforms.time, time);
        gl.uniform2f(this.uniforms.resolution, width, height);
        gl.uniform1f(this.uniforms.solarFlare, solarFlareIntensity);
        gl.uniform2f(this.uniforms.solarFlarePos, solarFlarePos.x, solarFlarePos.y);

        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // Helper from Renderer, duplicated for simplicity to keep files decoupled
    createProgram(gl, vsSource, fsSource) {
        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };
        const vs = createShader(gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }
}

