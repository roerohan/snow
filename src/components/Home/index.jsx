import * as THREE from 'three';
import React, {
  Suspense, useCallback, useRef, useMemo,
} from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import propTypes from 'prop-types';

import './styles.css';

import Effects from './Effects';

function Swarm({ count, mouse }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i += 1) {
      const t = Math.random() * 1000;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -20 + Math.random() * 30;
      const yFactor = -20 + Math.random() * 30;
      const zFactor = -20 + Math.random() * 30;
      temp.push({
        t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0,
      });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    particles.forEach((part, i) => {
      const particle = part;
      const {
        factor, speed, xFactor, yFactor, zFactor,
      } = particle;
      particle.t += speed / 2;
      const { t } = particle;
      const a = Math.cos(t) + Math.sin(t * 1) / 5;
      const b = Math.sin(t) + Math.cos(t * 2) / 5;
      const s = Math.max(1.5, Math.cos(t) * 2.5);
      particle.mx += (mouse.current[0] - particle.mx) * 0.04;
      particle.my += (-mouse.current[1] - particle.my) * 0.04;
      dummy.position.set(
        (particle.mx / 10) * a + xFactor
        + Math.cos((t / 5) * factor) + (Math.sin(t * 1) * factor) / 3,
        (particle.my / 10) * a + yFactor
        + Math.sin((t / 5) * factor) + (Math.cos(t * 2) * factor) / 3,
        (particle.my / 10) * b + zFactor
        + Math.cos((t / 5) * factor) + (Math.sin(t * 3) * factor) / 3,
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <sphereBufferGeometry attach="geometry" args={[1, 32, 32]} />
        <meshPhongMaterial attach="material" color="#ffffff" />
      </instancedMesh>
    </>
  );
}

function Home() {
  const mouse = useRef([0, 0]);
  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => {
    mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2];
  }, []);
  return (
    <div className="home" onMouseMove={onMouseMove}>
      <Canvas
        gl={{ alpha: true, antialias: false, logarithmicDepthBuffer: true }}
        camera={{ fov: 50, position: [0, 0, 70] }}
        style={{ opacity: 0.95 }}
        onCreated={({ gl }) => {
          const glParam = gl;
          glParam.toneMapping = THREE.ACESFilmicToneMapping;
          glParam.outputEncoding = THREE.sRGBEncoding;
        }}
      >
        <ambientLight intensity={1} />
        <pointLight position={[100, 100, 100]} intensity={5} />
        <pointLight position={[-100, -100, -100]} intensity={1} color="grey" />
        <Swarm mouse={mouse} count={30} />
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      </Canvas>
    </div>
  );
}

Swarm.propTypes = {
  count: propTypes.number.isRequired,
  mouse: propTypes.shape({
    current: propTypes.arrayOf(propTypes.number),
  }).isRequired,
};

export default Home;
