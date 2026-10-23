/**
 * Lightweight Canvas Confetti Engine
 */

class ConfettiFX {
  static canvas = null;
  static ctx = null;
  static particles = [];
  static animationFrameId = null;

  static init(canvasElement) {
    this.canvas = canvasElement;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  static resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  static fire(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    if (!this.canvas || !this.ctx) return;

    const colors = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
    const count = 45;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: 5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        life: 0,
        maxLife: 60 + Math.random() * 30
      });
    }

    if (!this.animationFrameId) {
      this.animate();
    }
  }

  static animate() {
    if (!this.ctx || this.particles.length === 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationFrameId = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // air drag
      p.rotation += p.rotationSpeed;
      p.life++;
      p.opacity = Math.max(0, 1 - p.life / p.maxLife);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      this.ctx.restore();

      if (p.life >= p.maxLife || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}
