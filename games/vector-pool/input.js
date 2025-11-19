export class Input {
    constructor(canvas) {
        this.keys = {};
        this.justPressedKeys = {};
        this.pointer = { 
            x: 0, 
            y: 0, 
            isDown: false, 
            justPressed: false, 
            justReleased: false 
        };
        this.doubleClick = { x: 0, y: 0, active: false };
        this.canvas = canvas;

        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.justPressedKeys[e.code] = true;
            }
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        window.addEventListener('pointermove', (e) => this.onPointerMove(e));
        window.addEventListener('pointerup', (e) => this.onPointerUp(e));
        canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        // Handle touch specific to prevent scrolling if needed, but pointer events usually cover it.
        canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    onPointerDown(e) {
        const pos = this.getPos(e);
        this.pointer.x = pos.x;
        this.pointer.y = pos.y;
        this.pointer.isDown = true;
        this.pointer.justPressed = true;
    }

    onPointerMove(e) {
        const pos = this.getPos(e);
        this.pointer.x = pos.x;
        this.pointer.y = pos.y;
    }

    onPointerUp(e) {
        this.pointer.isDown = false;
        this.pointer.justReleased = true;
    }

    onDoubleClick(e) {
        const pos = this.getPos(e);
        this.doubleClick.x = pos.x;
        this.doubleClick.y = pos.y;
        this.doubleClick.active = true;
    }

    isDown(code) {
        return !!this.keys[code];
    }

    isJustPressed(code) {
        return !!this.justPressedKeys[code];
    }

    update() {
        this.pointer.justPressed = false;
        this.pointer.justReleased = false;
        this.doubleClick.active = false; // Reset double click
        this.justPressedKeys = {}; // Reset per frame
    }
}
