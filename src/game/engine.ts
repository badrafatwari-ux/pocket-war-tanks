import { Tank, Bullet, Obstacle, Particle, GameMode } from './types';
import { playFire, playRicochet, playExplosion, vibrate } from './sounds';

const TANK_W = 24;
const TANK_H = 16;
const BULLET_RADIUS = 3;
const TANK_SPEED = 1.2;
const BULLET_SPEED = 4;
const FIRE_COOLDOWN = 20;
const SUDDEN_DEATH_TIME = 20;

interface GameState {
  tanks: [Tank, Tank];
  bullets: Bullet[];
  obstacles: Obstacle[];
  particles: Particle[];
  roundWinner: number | null;
  elapsed: number;
  suddenDeath: boolean;
  arenaInset: number;
  mode: GameMode;
  soundOn: boolean;
  vibrationOn: boolean;
}

interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
}

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: GameState;
  controls: [Controls, Controls];
  animId: number | null = null;
  onRoundEnd: ((winner: number) => void) | null = null;
  lastTime = 0;
  vsAI = false;
  private cw = 0;
  private ch = 0;
  private aiTimer = 0;
  private aiTargetAngle = 0;
  private aiFireCooldown = 0;

  constructor(canvas: HTMLCanvasElement, mode: GameMode, soundOn: boolean, vibrationOn: boolean, vsAI = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.vsAI = vsAI;
    this.controls = [
      { up: false, down: false, left: false, right: false, fire: false },
      { up: false, down: false, left: false, right: false, fire: false },
    ];
    this.state = this.createState(mode, soundOn, vibrationOn);
  }

  private createState(mode: GameMode, soundOn: boolean, vibrationOn: boolean): GameState {
    this.resize();
    const cw = this.cw;
    const ch = this.ch;
    const margin = 50;

    const tanks: [Tank, Tank] = [
      {
        x: margin + 20, y: ch / 2,
        angle: 0, width: TANK_W, height: TANK_H,
        alive: true, color: '#4a6741', turretColor: '#3a5431', cooldown: 0,
      },
      {
        x: cw - margin - 20, y: ch / 2,
        angle: Math.PI, width: TANK_W, height: TANK_H,
        alive: true, color: '#8b7355', turretColor: '#7a6345', cooldown: 0,
      },
    ];

    const obstacles = this.generateObstacles(cw, ch, mode);

    return {
      tanks, bullets: [], obstacles, particles: [],
      roundWinner: null, elapsed: 0, suddenDeath: false, arenaInset: 0,
      mode, soundOn, vibrationOn,
    };
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.cw = rect.width;
    this.ch = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private generateObstacles(cw: number, ch: number, mode: GameMode): Obstacle[] {
    const obs: Obstacle[] = [];
    const blockSize = 20;
    const cx = cw / 2;
    const cy = ch / 2;

    obs.push({ x: cx - blockSize, y: cy - blockSize * 2, w: blockSize * 2, h: blockSize * 4, type: 'steel' });

    const count = mode === 'chaos' ? 12 : 8;
    for (let i = 0; i < count; i++) {
      const ox = 80 + Math.random() * (cw - 160);
      const oy = 40 + Math.random() * (ch - 80);
      if (Math.abs(ox - 70) < 50 && Math.abs(oy - cy) < 50) continue;
      if (Math.abs(ox - (cw - 70)) < 50 && Math.abs(oy - cy) < 50) continue;
      if (Math.abs(ox - cx) < blockSize * 3 && Math.abs(oy - cy) < blockSize * 3) continue;

      const isSteel = Math.random() < 0.3;
      obs.push({
        x: ox, y: oy,
        w: blockSize + Math.random() * blockSize,
        h: blockSize + Math.random() * blockSize,
        type: isSteel ? 'steel' : 'brick',
      });
    }
    return obs;
  }

  reset(mode: GameMode, soundOn: boolean, vibrationOn: boolean) {
    this.state = this.createState(mode, soundOn, vibrationOn);
  }

  start() {
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = null;
  }

  private loop = () => {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 16.67, 3);
    this.lastTime = now;

    if (this.state.roundWinner === null) {
      if (this.vsAI) this.updateAI(dt);
      this.update(dt);
    }
    this.render();
    this.animId = requestAnimationFrame(this.loop);
  };

  private updateAI(_dt: number) {
    const s = this.state;
    const ai = s.tanks[1];
    const player = s.tanks[0];
    if (!ai.alive || !player.alive) return;

    const ctrl = this.controls[1];
    this.aiTimer -= _dt;
    this.aiFireCooldown -= _dt;

    if (this.aiTimer <= 0) {
      this.aiTimer = 20 + Math.random() * 20;
      const dx = player.x - ai.x;
      const dy = player.y - ai.y;
      this.aiTargetAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
    }

    const angleDiff = this.aiTargetAngle - ai.angle;
    const normDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

    ctrl.up = false; ctrl.down = false; ctrl.left = false; ctrl.right = false; ctrl.fire = false;

    const targetDx = Math.cos(this.aiTargetAngle);
    const targetDy = Math.sin(this.aiTargetAngle);
    if (targetDx > 0.3) ctrl.right = true;
    else if (targetDx < -0.3) ctrl.left = true;
    if (targetDy > 0.3) ctrl.down = true;
    else if (targetDy < -0.3) ctrl.up = true;

    if (Math.abs(normDiff) < 0.5 && this.aiFireCooldown <= 0) {
      ctrl.fire = true;
      this.aiFireCooldown = 25 + Math.random() * 20;
    }

    for (const b of s.bullets) {
      if (b.owner === 1) continue;
      const bDist = Math.hypot(b.x - ai.x, b.y - ai.y);
      if (bDist < 80) {
        const perpX = -b.vy;
        const perpY = b.vx;
        if (perpX > 0) ctrl.right = true; else ctrl.left = true;
        if (perpY > 0) ctrl.down = true; else ctrl.up = true;
        break;
      }
    }
  }

  private update(dt: number) {
    const s = this.state;
    s.elapsed += dt / 60;

    if (s.elapsed >= SUDDEN_DEATH_TIME && !s.suddenDeath) {
      s.suddenDeath = true;
    }

    const speedMult = s.suddenDeath ? 1.5 : 1;
    const bulletSpeedMult = s.mode === 'chaos' ? 1.4 : 1;

    if (s.suddenDeath) {
      s.arenaInset = Math.min(s.arenaInset + 0.15 * dt, Math.min(this.cw, this.ch) * 0.3);
    }

    const rotSpeed = 0.05 * dt;
    const moveSpeed = TANK_SPEED * speedMult * dt;

    for (let i = 0; i < 2; i++) {
      const tank = s.tanks[i];
      if (!tank.alive) continue;
      const ctrl = this.controls[i];

      let mx = 0, my = 0;
      if (ctrl.left) mx -= 1;
      if (ctrl.right) mx += 1;
      if (ctrl.up) my -= 1;
      if (ctrl.down) my += 1;

      const inputMag = Math.sqrt(mx * mx + my * my);
      if (inputMag > 0) {
        const targetAngle = Math.atan2(my, mx);
        let ad = targetAngle - tank.angle;
        while (ad > Math.PI) ad -= Math.PI * 2;
        while (ad < -Math.PI) ad += Math.PI * 2;
        tank.angle += Math.sign(ad) * Math.min(Math.abs(ad), rotSpeed * 3);

        const nx = tank.x + Math.cos(tank.angle) * moveSpeed;
        const ny = tank.y + Math.sin(tank.angle) * moveSpeed;

        const inset = s.arenaInset;
        const bounded = this.clampTank(nx, ny, tank, inset);
        tank.x = bounded.x;
        tank.y = bounded.y;
      }

      if (tank.cooldown > 0) tank.cooldown -= dt;
      if (ctrl.fire && tank.cooldown <= 0) {
        const bx = tank.x + Math.cos(tank.angle) * (TANK_W / 2 + 5);
        const by = tank.y + Math.sin(tank.angle) * (TANK_W / 2 + 5);
        const maxBounces = s.mode === 'chaos' ? 5 : 3;
        const bSpeed = BULLET_SPEED * bulletSpeedMult * speedMult;
        s.bullets.push({
          x: bx, y: by,
          vx: Math.cos(tank.angle) * bSpeed,
          vy: Math.sin(tank.angle) * bSpeed,
          bounces: 0, maxBounces, owner: i, speed: bSpeed,
        });
        tank.cooldown = s.mode === 'chaos' ? FIRE_COOLDOWN * 0.6 : FIRE_COOLDOWN;
        if (s.soundOn) playFire();
      }
    }

    const inset = s.arenaInset;
    for (let bi = s.bullets.length - 1; bi >= 0; bi--) {
      const b = s.bullets[bi];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      b.vx = Math.sign(b.vx) * Math.abs(b.vx) * (1 + 0.0005 * dt);
      b.vy = Math.sign(b.vy) * Math.abs(b.vy) * (1 + 0.0005 * dt);

      // Wall bounce
      let bounced = false;
      if (b.x <= inset + BULLET_RADIUS || b.x >= this.cw - inset - BULLET_RADIUS) {
        b.vx = -b.vx;
        b.x = Math.max(inset + BULLET_RADIUS, Math.min(this.cw - inset - BULLET_RADIUS, b.x));
        bounced = true;
      }
      if (b.y <= inset + BULLET_RADIUS || b.y >= this.ch - inset - BULLET_RADIUS) {
        b.vy = -b.vy;
        b.y = Math.max(inset + BULLET_RADIUS, Math.min(this.ch - inset - BULLET_RADIUS, b.y));
        bounced = true;
      }

      if (bounced) {
        b.bounces++;
        if (s.soundOn) playRicochet();
        this.spawnParticles(b.x, b.y, '#ffaa33', 3);
        if (b.bounces > b.maxBounces) {
          s.bullets.splice(bi, 1);
          continue;
        }
      }

      // Obstacle collision — bullet destroyed on hit (no bounce)
      let hitObstacle = false;
      for (const obs of s.obstacles) {
        if (b.x > obs.x && b.x < obs.x + obs.w && b.y > obs.y && b.y < obs.y + obs.h) {
          hitObstacle = true;
          this.spawnParticles(b.x, b.y, '#ffaa33', 4);
          if (s.soundOn) playRicochet();
          break;
        }
      }
      if (hitObstacle) {
        s.bullets.splice(bi, 1);
        continue;
      }

      // Tank hit detection
      for (let ti = 0; ti < 2; ti++) {
        const tank = s.tanks[ti];
        if (!tank.alive) continue;
        const dx = b.x - tank.x;
        const dy = b.y - tank.y;
        if (Math.abs(dx) < TANK_W / 2 + 2 && Math.abs(dy) < TANK_H / 2 + 2) {
          tank.alive = false;
          s.bullets.splice(bi, 1);
          this.explode(tank.x, tank.y);
          if (s.soundOn) playExplosion();
          if (s.vibrationOn) vibrate(200);
          s.roundWinner = ti === 0 ? 2 : 1;
          setTimeout(() => {
            this.onRoundEnd?.(s.roundWinner!);
          }, 1500);
          break;
        }
      }
    }

    for (let pi = s.particles.length - 1; pi >= 0; pi--) {
      const p = s.particles[pi];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) s.particles.splice(pi, 1);
    }
  }

  private clampTank(nx: number, ny: number, tank: Tank, inset: number) {
    const hw = tank.width / 2;
    const hh = tank.height / 2;
    let x = Math.max(inset + hw, Math.min(this.cw - inset - hw, nx));
    let y = Math.max(inset + hh, Math.min(this.ch - inset - hh, ny));

    for (const obs of this.state.obstacles) {
      if (x + hw > obs.x && x - hw < obs.x + obs.w && y + hh > obs.y && y - hh < obs.y + obs.h) {
        const overlapLeft = (x + hw) - obs.x;
        const overlapRight = (obs.x + obs.w) - (x - hw);
        const overlapTop = (y + hh) - obs.y;
        const overlapBottom = (obs.y + obs.h) - (y - hh);
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapLeft) x = obs.x - hw;
        else if (minOverlap === overlapRight) x = obs.x + obs.w + hw;
        else if (minOverlap === overlapTop) y = obs.y - hh;
        else y = obs.y + obs.h + hh;
      }
    }
    return { x, y };
  }

  private explode(x: number, y: number) {
    const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ff6600', '#993300'];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 30,
        maxLife: 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4,
      });
    }
  }

  private spawnParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      this.state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 10 + Math.random() * 15,
        maxLife: 25,
        color,
        size: 1 + Math.random() * 2,
      });
    }
  }

  private render() {
    const ctx = this.ctx;
    const cw = this.cw;
    const ch = this.ch;
    const s = this.state;

    ctx.fillStyle = '#2a2a1e';
    ctx.fillRect(0, 0, cw, ch);

    ctx.fillStyle = '#33301f';
    for (let x = 0; x < cw; x += 40) {
      for (let y = 0; y < ch; y += 40) {
        if ((x + y) % 80 === 0) {
          ctx.fillRect(x, y, 40, 40);
        }
      }
    }

    const inset = s.arenaInset;

    ctx.strokeStyle = s.suddenDeath ? '#aa3322' : '#555540';
    ctx.lineWidth = 3;
    ctx.strokeRect(inset, inset, cw - inset * 2, ch - inset * 2);

    if (s.suddenDeath) {
      ctx.fillStyle = 'rgba(180, 30, 20, 0.08)';
      ctx.fillRect(0, 0, inset, ch);
      ctx.fillRect(cw - inset, 0, inset, ch);
      ctx.fillRect(0, 0, cw, inset);
      ctx.fillRect(0, ch - inset, cw, inset);
    }

    for (const obs of s.obstacles) {
      if (obs.type === 'steel') {
        ctx.fillStyle = '#5a5a60';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#707078';
        ctx.lineWidth = 1;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      } else {
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#6b4e0e';
        ctx.lineWidth = 0.5;
        const brickH = obs.h / 3;
        for (let r = 0; r < 3; r++) {
          ctx.strokeRect(obs.x, obs.y + r * brickH, obs.w, brickH);
        }
      }
    }

    for (const b of s.bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ffcc00';
      ctx.fill();
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (const tank of s.tanks) {
      if (!tank.alive) continue;
      ctx.save();
      ctx.translate(tank.x, tank.y);
      ctx.rotate(tank.angle);

      ctx.fillStyle = tank.color;
      ctx.fillRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);

      ctx.fillStyle = '#222';
      ctx.fillRect(-tank.width / 2, -tank.height / 2 - 2, tank.width, 3);
      ctx.fillRect(-tank.width / 2, tank.height / 2 - 1, tank.width, 3);

      ctx.fillStyle = tank.turretColor;
      ctx.fillRect(0, -3, tank.width / 2 + 6, 6);

      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = tank.turretColor;
      ctx.fill();

      ctx.restore();
    }

    for (const p of s.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    if (s.suddenDeath) {
      ctx.save();
      ctx.font = 'bold 14px Courier New';
      ctx.fillStyle = '#cc3322';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ SUDDEN DEATH ⚠', cw / 2, 18);
      ctx.restore();
    }

    ctx.save();
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(s.elapsed)}s`, cw / 2, ch - 8);
    ctx.restore();

    if (s.roundWinner !== null) {
      ctx.save();
      ctx.font = 'bold 20px Courier New';
      ctx.fillStyle = '#ffcc00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText(`PLAYER ${s.roundWinner} WINS!`, cw / 2, ch / 2);
      ctx.restore();
    }
  }
}
