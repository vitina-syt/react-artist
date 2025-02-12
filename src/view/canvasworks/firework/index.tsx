import React, {useRef, useEffect, useCallback} from 'react';
import './index.less';

interface IParticle {
    x: number;
    y: number;
    color: string;
    radius: number;
    velocity: {
        x: number;
        y: number;
    };
    alpha: number;
    gravity: number;
    friction: number;
}
interface IWind {
    x: number;
    y: number;
}
let wind: IWind = {
    x: 0,
    y: 0
};
// 粒子
class Particle implements IParticle {
    x: number;
    y: number;
    color: string;
    radius: number;
    velocity: {
        x: number;
        y: number;
    };
    alpha: number;
    gravity: number;
    friction: number;
    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 2 + 1; // 随机大小
        this.velocity = {
            x: (Math.random() - 0.5) * 8, // 增加水平扩散
            y: (Math.random() - 0.5) * 8 // 增加垂直扩散
        };
        this.alpha = 1; // 透明度
        this.gravity = 0.08; // 增加重力效果
        this.friction = 0.98; // 稍微减小摩擦力
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.globalCompositeOperation = 'lighter'; // 添加混合模式

        // 创建径向渐变
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
        gradient.addColorStop(0.4, `rgba(${this.getColorValues()}, ${this.alpha})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 辅助方法：将 HSL 颜色转换为 RGB 值
    getColorValues(): string {
        const hsl = this.color.match(/\d+/g);
        if (!hsl) return '255, 255, 255';

        const h = parseInt(hsl[0]);
        const s = parseInt(hsl[1]) / 100;
        const l = parseInt(hsl[2]) / 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0,
            g = 0,
            b = 0;

        if (h >= 0 && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (h >= 60 && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (h >= 180 && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (h >= 240 && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else {
            r = c;
            g = 0;
            b = x;
        }

        return `${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}`;
    }

    update(wind: IWind) {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity; // 重力影响
        this.velocity.y += wind.y;
        this.velocity.x += wind.x;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.003; // 降低消失速度
        this.radius += 0.02; // 粒子逐渐变大
    }
}

class Firework {
    x: number;
    y: number;
    color: string;
    particles: Particle[];
    constructor() {
        this.x = Math.random() * window.innerWidth;
        // 从屏幕底部再往下一点开始
        this.y = window.innerHeight - 300;
        this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        for (let i = 0; i < 100; i++) {
            const particle = new Particle(this.x, this.y, this.color);
            // 增加向上的初始速度
            particle.velocity.y = (Math.random() - 0.8) * 15; // 更大的向上速度
            this.particles.push(particle);
        }
    }

    update() {
        this.particles.forEach((particle, index) => {
            if (particle.alpha <= 0) {
                this.particles.splice(index, 1); // 移除消失的粒子
            } else {
                particle.update(wind);
            }
        });
        // 动态调整风力
        //  wind.x = Math.sin(Date.now() * 0.001) * 0.1; // 随时间变化的风力
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.particles.forEach((particle) => particle.draw(ctx));
    }
}

const CanvasFirework = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fireworksRef = useRef<Firework[]>([]);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 设置模糊效果
        ctx.filter = 'blur(1px)';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // 降低透明度以增加拖尾效果
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // Update using ref instead of state
        fireworksRef.current = fireworksRef.current.filter((firework) => {
            if (firework.particles.length === 0) return false;
            firework.update();
            firework.draw(ctx);
            return true;
        });

        if (Math.random() < 0.03) {
            fireworksRef.current.push(new Firework());
        }

        requestAnimationFrame(animate);
    }, []);

    // 初始化画布和动画
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        animate();

        // 窗口大小调整时重置画布
        const handleResize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [animate]);

    return (
        <div className='home-root'>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default CanvasFirework;
