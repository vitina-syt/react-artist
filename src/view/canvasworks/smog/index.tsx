import React, {useEffect, useRef} from 'react';
import {createProgram, compileShader} from '@/utils/webgl';
import './index.less';

interface Particle {
    x: number; // 粒子的 x 坐标
    y: number; // 粒子的 y 坐标
    vx: number; // 粒子在 x 方向的速度
    vy: number; // 粒子在 y 方向的速度
    size: number; // 粒子的大小
    alpha: number; // 粒子的透明度
    color: string;
    velocity: {
        x: number;
        y: number;
    };
}
interface Icolor {
    r: number;
    g: number;
    b: number;
}
const CanvasSmog = () => {
    const canvasref = useRef<HTMLCanvasElement>(null);
    const particles: Particle[] = [];
    const numParticles = 1000;
    let aPosition: any;
    let uPointSize: any;
    let uColor: any;
    // 顶点着色器
    const vertexShaderSource = `
    attribute vec4 a_position;
    uniform float u_pointSize;
    void main() {
    gl_Position = a_position;
    gl_PointSize = u_pointSize;
    }
    `;

    // 片元着色器
    const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
    gl_FragColor = u_color;
    }
    `;
    // 启动渲染
    useEffect(() => {
        if (!canvasref.current) return;
        // 设置画布大小
        canvasref.current.width = window.innerWidth;
        canvasref.current.height = window.innerHeight;
        const gl = canvasref.current.getContext('webgl');
        if (!gl) return;
        gl.viewport(0, 0, canvasref.current.width, canvasref.current.height);
        // 编译着色器
        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(gl, vertexShader, fragmentShader);
        gl.useProgram(program);

        // 获取变量位置
        aPosition = gl.getAttribLocation(program, 'a_position');
        uPointSize = gl.getUniformLocation(program, 'u_pointSize');
        uColor = gl.getUniformLocation(program, 'u_color');

        // 启用混合模式
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // 粒子数据
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * 2 - 1, // 随机初始位置
                y: Math.random() * 2 - 1,
                vx: (Math.random() - 0.5) * 0.01, // 随机速度
                vy: Math.random() * 0.02,
                size: Math.random() * 0.05 + 4, // 随机大小
                alpha: Math.random(), // 随机透明度
                color: `hsl(${Math.random() * 360}, 50%, 50%)`,
                velocity: {
                    x: (Math.random() - 0.5) * 8, // 增加水平扩散
                    y: (Math.random() - 0.5) * 8 // 增加垂直扩散
                }
            });
        }
        render();
    }, []);
    // 辅助方法：将 HSL 颜色转换为 RGB 值
    function getColorValues(color: string): Icolor {
        const hsl = color.match(/\d+/g);
        if (!hsl) return {r: 255, g: 255, b: 255};

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
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return {r, g, b};
    }
    // 渲染循环
    function render() {
        if (!canvasref.current) return;
        const gl = canvasref.current.getContext('webgl');
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        gl.clear(gl.COLOR_BUFFER_BIT);

        particles.forEach((particle) => {
            // 更新粒子位置
            particle.x += particle.vx;
            particle.y += particle.vy;

            // 重置超出边界的粒子
            if (particle.x < -1 || particle.x > 1 || particle.y < -1 || particle.y > 1) {
                particle.x = Math.random() * 2 - 1;
                particle.y = Math.random() * 2 - 1;
            }
            const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
            // 设置粒子属性
            gl.vertexAttrib2f(aPosition, particle.x, particle.y);
            gl.uniform1f(uPointSize, particle.size);
            gl.uniform4f(
                uColor,
                getColorValues(color).r,
                getColorValues(color).g,
                getColorValues(color).b,
                particle.alpha
            );

            // 绘制粒子
            gl.drawArrays(gl.POINTS, 0, 1);
        });

        requestAnimationFrame(render);
    }

    return (
        <div className='home-root'>
            <canvas ref={canvasref}></canvas>
        </div>
    );
};
export default CanvasSmog;
