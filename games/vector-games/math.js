export class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    scale(s) { return new Vec2(this.x * s, this.y * s); }
    dot(v) { return this.x * v.x + this.y * v.y; }
    length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() {
        const len = this.length();
        return len > 0 ? this.scale(1 / len) : new Vec2(0, 0);
    }
    rotate(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
    }
    clone() { return new Vec2(this.x, this.y); }
}

