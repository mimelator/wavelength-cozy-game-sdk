export const vsSource = `
    attribute vec2 aVertexPosition;
    attribute vec2 aOffset; // For line thickness expansion
    attribute vec4 aColor;

    uniform vec2 uResolution;
    uniform float uScale;
    uniform vec2 uCameraPos;

    varying vec4 vColor;
    varying vec2 vUV;

    void main() {
        // Transform world position to screen space
        vec2 position = (aVertexPosition - uCameraPos) * uScale;
        
        // Apply aspect ratio correction or keep it simple?
        // Let's map 0,0 to center and coordinate system to pixels initially or normalized units.
        // Let's use pixels for world coords for simplicity, matching canvas size.
        
        vec2 zeroToOne = (position + uResolution / 2.0) / uResolution;
        vec2 clipSpace = zeroToOne * 2.0 - 1.0;
        
        // Flip Y for traditional 2D coords (Y up) if needed, but let's stick to screen coords (Y down) or math coords (Y up).
        // Let's do Y up.
        clipSpace.y *= -1.0;

        // Add the thickness offset (in screen space/clip space)
        // We need the normal of the line for this, but for a simple point sprite or expanded line:
        // This shader assumes we are passing pre-calculated vertices for quads.
        
        gl_Position = vec4(clipSpace + aOffset / uResolution * 2.0, 0, 1);
        vColor = aColor;
        // vUV could be passed in aOffset or separate if we want fancy glow
    }
`;

export const fsSource = `
    precision mediump float;
    varying vec4 vColor;

    void main() {
        gl_FragColor = vColor;
        
        // Simple glow/anti-aliasing could be done here if we passed UVs
        // For now, solid color.
    }
`;

// Let's make a better shader that handles lines with thickness and glow
export const lineVsSource = `
    attribute vec2 aStart;
    attribute vec2 aEnd;
    attribute float aWidth;
    attribute vec4 aColor;
    attribute float aSide; // -1 or 1 for expansion direction

    uniform vec2 uResolution;
    uniform vec2 uCameraPos;
    uniform float uScale;

    varying vec4 vColor;
    varying float vDist; // Distance from center for glow

    void main() {
        vec2 start = (aStart - uCameraPos) * uScale;
        vec2 end = (aEnd - uCameraPos) * uScale;

        vec2 dir = normalize(end - start);
        vec2 normal = vec2(-dir.y, dir.x);

        vec2 position = start + (end - start) * (aSide > 0.0 ? 1.0 : 0.0); // Start or end?
        // Wait, standard expansion for a segment:
        // A segment has 4 vertices. 
        // We can use instancing or just expand CPU side. 
        // Let's stick to CPU side expansion for simplicity of implementation first, 
        // or a simpler shader that takes vertices directly.
        
        // Let's revert to a simple "position + color" shader and do geometry on CPU.
        // It's slower but easier to debug for a simple game.
    }
`;

export const simpleVs = `
    attribute vec2 aPosition;
    attribute vec4 aColor;
    
    uniform vec2 uResolution;
    uniform vec2 uCameraPos;
    
    varying vec4 vColor;
    
    void main() {
        // Convert from world pixels to clip space
        vec2 p = aPosition - uCameraPos;
        vec2 zeroToOne = p / uResolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        vColor = aColor;
    }
`;

export const simpleFs = `
    precision mediump float;
    varying vec4 vColor;
    void main() {
        gl_FragColor = vColor;
    }
`;

// CRT / Chromatic Aberration Post-Process Shaders
export const crtVs = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

export const crtFs = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
        vec2 uv = vUv;
        
        // Curve the screen (barrel distortion)
        vec2 dc = abs(0.5 - uv);
        dc *= dc;
        uv.x -= 0.5; uv.x *= 1.0 + (dc.y * 0.3); uv.x += 0.5;
        uv.y -= 0.5; uv.y *= 1.0 + (dc.x * 0.3); uv.y += 0.5;

        // Cutoff outside curve
        if (uv.y > 1.0 || uv.y < 0.0 || uv.x > 1.0 || uv.x < 0.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }

        // Chromatic Aberration
        // Reduce offset to make the effect tighter
        float r = texture2D(uTexture, uv + vec2(0.001, 0.0)).r;
        float g = texture2D(uTexture, uv).g;
        float b = texture2D(uTexture, uv - vec2(0.001, 0.0)).b;
        
        // Scanlines
        float scanline = sin(uv.y * uResolution.y * 2.0) * 0.04;
        vec3 color = vec3(r, g, b) - scanline;
        
        // Vignette
        float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
        color *= vec3(pow(vig, 0.3));
        
        // Brightness boost
        color *= 1.2;

        gl_FragColor = vec4(color, 1.0);
    }
`;

