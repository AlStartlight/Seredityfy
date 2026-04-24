'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';

/* ── Generated mesh from Pixel2Mesh output ─────────────────────────────────── */
function GeneratedMesh({ vertices, faces, mode }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices.flat()), 3));
    g.setIndex(faces.flat());
    g.computeVertexNormals();
    return g;
  }, [vertices, faces]);

  return (
    <group>
      {/* Solid fill */}
      {(mode === 'solid' || mode === 'normals') && (
        <mesh geometry={geo} castShadow receiveShadow>
          {mode === 'normals'
            ? <meshNormalMaterial side={THREE.DoubleSide} />
            : <meshStandardMaterial
                color="#c8aaff"
                metalness={0.15}
                roughness={0.65}
                side={THREE.DoubleSide}
              />
          }
        </mesh>
      )}
      {/* Wireframe overlay */}
      {(mode === 'wireframe' || mode === 'solid') && (
        <mesh geometry={geo}>
          <meshBasicMaterial
            color={mode === 'wireframe' ? '#d5baff' : '#ffffff'}
            wireframe
            opacity={mode === 'wireframe' ? 0.75 : 0.08}
            transparent
          />
        </mesh>
      )}
    </group>
  );
}

/* ── Animated placeholder ellipsoid ────────────────────────────────────────── */
function Placeholder({ generating }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * (generating ? 1.2 : 0.45);
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.12;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.75, generating ? 10 : 28, generating ? 10 : 16]} />
      <meshBasicMaterial
        color={generating ? '#ffabf3' : '#d5baff'}
        wireframe
        opacity={generating ? 0.55 : 0.25}
        transparent
      />
    </mesh>
  );
}

/* ── Canvas export ──────────────────────────────────────────────────────────── */
export default function MeshCanvas({ meshData, mode = 'solid', generating = false }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.6, 2.6], fov: 44, near: 0.01, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', display: 'block', background: '#0d0a14', borderRadius: '0.75rem' }}
    >
      <color attach="background" args={['#0d0a14']} />
      <fog attach="fog" args={['#0d0a14', 6, 18]} />

      {/* Lights */}
      <ambientLight intensity={0.55} color="#e2d5ff" />
      <directionalLight position={[4, 7, 4]} intensity={1.6} color="#ffffff" castShadow shadow-mapSize={1024} />
      <directionalLight position={[-3, -2, -4]} intensity={0.5} color="#7c3aed" />
      <pointLight position={[0, 3, 2]} intensity={0.9} color="#ffabf3" distance={9} decay={2} />

      {meshData
        ? <GeneratedMesh vertices={meshData.vertices} faces={meshData.faces} mode={mode} />
        : <Placeholder generating={generating} />
      }

      <Grid
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#1a0328"
        sectionSize={2}
        sectionThickness={0.7}
        sectionColor="#3d1060"
        fadeDistance={7}
        fadeStrength={1.2}
        position={[0, -1.15, 0]}
      />

      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport
          axisColors={['#f87171', '#4ade80', '#60a5fa']}
          labelColor="white"
          hideNegativeAxes
        />
      </GizmoHelper>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minDistance={0.6}
        maxDistance={7}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
