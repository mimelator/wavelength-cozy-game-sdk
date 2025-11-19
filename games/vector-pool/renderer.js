import { simpleVs, simpleFs, crtVs, crtFs } from './shaders.js';

export class PostProcessor {
    constructor(gl) {
        this.gl = gl;
        this.program = this.createProgram(gl, crtVs, crtFs);
        this.attribs = {
            position: gl.getAttribLocation(this.program, 'aPosition'),
        };
        this.uniforms = {
            texture: gl.getUniformLocation(this.program, 'uTexture'),
            resolution: gl.getUniformLocation(this.program, 'uResolution'),
            time: gl.getUniformLocation(this.program, 'uTime'),
        };
        
        // Setup Texture and Framebuffer
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // Parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        this.fbo = gl.createFramebuffer();
        
        // Fullscreen quad
        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);
    }
    
    resize(width, height) {
        const gl = this.gl;
        this.width = width;
        this.height = height;
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    
    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.clearColor(0.05, 0.05, 0.1, 1); // Dark BG
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    
    unbind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    
    render(time) {
        const gl = this.gl;
        gl.viewport(0, 0, this.width, this.height);
        gl.useProgram(this.program);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.enableVertexAttribArray(this.attribs.position);
        gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 0, 0);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uniforms.texture, 0);
        
        gl.uniform2f(this.uniforms.resolution, this.width, this.height);
        gl.uniform1f(this.uniforms.time, time);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
    // Helper
    createProgram(gl, vs, fs) {
        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        };
        const p = gl.createProgram();
        gl.attachShader(p, createShader(gl.VERTEX_SHADER, vs));
        gl.attachShader(p, createShader(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(p));
            return null;
        }
        return p;
    }
}

export class Renderer {
    constructor(gl) {
        this.gl = gl;
        this.program = this.createProgram(gl, simpleVs, simpleFs);
        this.attribs = {
            position: gl.getAttribLocation(this.program, 'aPosition'),
            color: gl.getAttribLocation(this.program, 'aColor'),
        };
        this.uniforms = {
            resolution: gl.getUniformLocation(this.program, 'uResolution'),
            cameraPos: gl.getUniformLocation(this.program, 'uCameraPos'),
        };

        // Buffer for batching lines
        // 2 floats for pos, 4 floats for color = 6 floats per vertex
        this.maxVertices = 10000;
        this.vertexSize = 6;
        this.bufferData = new Float32Array(this.maxVertices * this.vertexSize);
        this.vertexCount = 0;

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.bufferData.byteLength, gl.DYNAMIC_DRAW);
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(gl, vsSource, fsSource) {
        const vs = this.createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = this.createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.gl.viewport(0, 0, width, height);
    }

    begin(cameraX, cameraY) {
        this.vertexCount = 0;
        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.uniforms.resolution, this.width, this.height);
        this.gl.uniform2f(this.uniforms.cameraPos, cameraX, cameraY);
    }

    // Add a line segment to the batch
    drawLine(x1, y1, x2, y2, r, g, b, a = 1.0, thickness = 1.0) {
        // For simple lines (gl.LINES), thickness is ignored in many browsers.
        // To support thickness, we generate 2 triangles (a quad).
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;

        const nx = -(dy / len) * (thickness / 2);
        const ny = (dx / len) * (thickness / 2);

        // 4 vertices
        // 0: x1 + n
        // 1: x2 + n
        // 2: x1 - n
        // 3: x2 - n

        this.addVertex(x1 + nx, y1 + ny, r, g, b, a);
        this.addVertex(x2 + nx, y2 + ny, r, g, b, a);
        this.addVertex(x1 - nx, y1 - ny, r, g, b, a);
        
        this.addVertex(x1 - nx, y1 - ny, r, g, b, a);
        this.addVertex(x2 + nx, y2 + ny, r, g, b, a);
        this.addVertex(x2 - nx, y2 - ny, r, g, b, a);
    }
    
    // Draw a filled circle using triangle fan (converted to triangles for batching)
    drawCircle(cx, cy, radius, r, g, b, a) {
        const segments = 32;
        const step = (Math.PI * 2) / segments;
        
        for (let i = 0; i < segments; i++) {
            const angle1 = i * step;
            const angle2 = (i + 1) * step;
            
            const x1 = cx + Math.cos(angle1) * radius;
            const y1 = cy + Math.sin(angle1) * radius;
            const x2 = cx + Math.cos(angle2) * radius;
            const y2 = cy + Math.sin(angle2) * radius;
            
            // Center vertex + 2 rim vertices = 1 triangle
            // Use center alpha 1.0 and rim alpha 0.0 for a "glow/smear" effect?
            // Or just solid color.
            // Let's do a gradient for "gas cloud" look: Center is opaque, rim is transparent
            
            this.addVertex(cx, cy, r, g, b, a);
            this.addVertex(x1, y1, r, g, b, 0); // Rim fade
            this.addVertex(x2, y2, r, g, b, 0); // Rim fade
        }
    }
    
    addVertex(x, y, r, g, b, a) {
        if (this.vertexCount >= this.maxVertices) return; // Flush?
        
        let i = this.vertexCount * this.vertexSize;
        this.bufferData[i++] = x;
        this.bufferData[i++] = y;
        this.bufferData[i++] = r;
        this.bufferData[i++] = g;
        this.bufferData[i++] = b;
        this.bufferData[i++] = a;
        this.vertexCount++;
    }

    end() {
        if (this.vertexCount === 0) return;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.bufferData.subarray(0, this.vertexCount * this.vertexSize));

        const stride = this.vertexSize * 4;
        this.gl.enableVertexAttribArray(this.attribs.position);
        this.gl.vertexAttribPointer(this.attribs.position, 2, this.gl.FLOAT, false, stride, 0);

        this.gl.enableVertexAttribArray(this.attribs.color);
        this.gl.vertexAttribPointer(this.attribs.color, 4, this.gl.FLOAT, false, stride, 8);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
}

