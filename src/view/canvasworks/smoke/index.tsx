import React, {useCallback, useEffect, useRef} from 'react';
import {useLocation} from 'react-router-dom';
import * as THREE from 'three';

interface Iprops {
    src: string;
    opacity: number;
    smokeSrc: string;
    smokeOpacity: number;
    height: string;
    width: string;
}
const CanvasSmoke = () => {
    const location = useLocation();
    const props: Iprops = location.state || {};
    const mount = useRef<HTMLDivElement>(null);
    const clockRef = useRef(new THREE.Clock());
    const rendererRef = useRef<THREE.WebGLRenderer>(new THREE.WebGLRenderer());
    const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
    const cameraRef = useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera());
    const meshRef = useRef<THREE.Mesh>(new THREE.Mesh());
    const smokeParticlesRef = useRef<THREE.Mesh[]>([]);
    const cubeSineDriverRef = useRef(0);
    const frameIdRef = useRef<number | undefined>(undefined);
    const deltaRef = useRef(0);
    const colorRef = useRef<THREE.Color>(new THREE.Color());
    const timeRef = useRef(0);
    const textRef = useRef<THREE.Mesh>(new THREE.Mesh());

    const evolveSmoke = useCallback(() => {
        let sp = smokeParticlesRef.current.length;
        while (sp--) {
            smokeParticlesRef.current[sp].rotation.z += deltaRef.current * 0.5;
            smokeParticlesRef.current[sp].rotation.y += 0.02;
            // smokeParticlesRef.current[sp].rotation.x += 0.02;
        }
    }, []);
    const colorchange = useCallback(() => {
        timeRef.current += deltaRef.current;
        const hue = (timeRef.current * 0.1 + 0.01) % 1;
        const saturation = 1.0; // 饱和度：1.0 表示最饱和
        const lightness = 0.5; // 亮度：0.5 表示中等亮度

        colorRef.current = new THREE.Color().setHSL(hue, saturation, lightness);
    }, []);
    const animate = useCallback(() => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !meshRef.current) return;

        deltaRef.current = clockRef.current.getDelta();
        frameIdRef.current = requestAnimationFrame(animate);
        evolveSmoke();
        colorchange();

        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.01;
        cubeSineDriverRef.current += 0.01;
        meshRef.current.position.z = 100 + Math.sin(cubeSineDriverRef.current) * 500;

        if (textRef.current?.material instanceof THREE.MeshLambertMaterial) {
            textRef.current.material.color = colorRef.current;
            textRef.current.material.needsUpdate = true;
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
    }, [evolveSmoke, colorchange]);

    useEffect(() => {
        const mountElement = mount.current;
        if (!mountElement) return;

        const width = mountElement.clientWidth;
        const height = mountElement.clientHeight;

        //Three.js setup
        rendererRef.current = new THREE.WebGLRenderer();
        rendererRef.current.setSize(width, height);

        sceneRef.current = new THREE.Scene();
        cameraRef.current = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
        cameraRef.current.position.z = 1000;
        sceneRef.current.add(cameraRef.current);
        let geometry = new THREE.BoxGeometry(200, 200, 200);
        let material = new THREE.MeshLambertMaterial({
            color: 0xaa6666,
            wireframe: false
        });

        meshRef.current = new THREE.Mesh(geometry, material);
        let textGeo = new THREE.PlaneGeometry(300, 300);

        new THREE.TextureLoader().load(
            props.src,
            (textTexture) => {
                let textMaterial = new THREE.MeshLambertMaterial({
                    color: colorRef.current,
                    opacity: props.opacity,
                    map: textTexture,
                    transparent: true,
                    blending: THREE.AdditiveBlending
                });
                let text = new THREE.Mesh(textGeo, textMaterial);
                text.position.z = 800;
                sceneRef.current.add(text);
                textRef.current = text;
            },
            undefined,
            (err) => {
                console.log('load failed.');
                console.log(err);
            }
        );

        let light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(-1, 0, 1);
        sceneRef.current.add(light);
        new THREE.TextureLoader().load(
            props.smokeSrc,
            (smokeTexture) => {
                for (let p = 0; p < 150; p++) {
                    const hue = Math.random();
                    const saturation = 1.0;
                    const lightness = 0.5;

                    const color = new THREE.Color().setHSL(hue, saturation, lightness);
                    let smokeMaterial = new THREE.MeshLambertMaterial({
                        color: color,
                        map: smokeTexture,
                        opacity: props.smokeOpacity,
                        transparent: true,
                        blending: THREE.AdditiveBlending
                    });
                    let smokeGeo = new THREE.PlaneGeometry(300, 300);
                    let particle = new THREE.Mesh(smokeGeo, smokeMaterial);
                    particle.position.set(
                        Math.random() * 500 - 250,
                        Math.random() * 500 - 250,
                        Math.random() * 1000 - 100
                    );
                    particle.rotation.z = Math.random() * 360;
                    sceneRef.current.add(particle);
                    smokeParticlesRef.current.push(particle);
                }
            },
            undefined,
            (err) => {
                console.log('load failed.');
                console.log(err);
            }
        );

        mountElement.appendChild(rendererRef.current.domElement);
        // remember these initial values
        // let tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov) / 2);
        // let windowHeight = height;

        animate();
        return () => {
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
            if (mountElement && rendererRef.current) {
                mountElement.removeChild(rendererRef.current.domElement);
            }
        };
    }, [props.src, props.opacity, props.smokeSrc, props.smokeOpacity, animate]);
    return (
        <div
            style={{
                height: props.height || '100vh',
                width: props.width || '100vw',
                margin: '0'
            }}
            ref={mount}
        />
    );
};

export default CanvasSmoke;
