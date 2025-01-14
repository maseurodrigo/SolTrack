import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function PulsingIndicator({ position, value }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const opacity = (Math.sin(clock.getElapsedTime() * 3) + 1) / 2;
      materialRef.current.opacity = opacity * 0.8 + 0.2;
    }
  });

  // Color based on value
  const color = value >= 0 ? '#00ff88' : '#ff4444';

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} transparent emissive={color} emissiveIntensity={0.5}/>
    </mesh>
  );
}

function DynamicCamera({ maxValue, minValue }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const range = Math.max(Math.abs(maxValue), Math.abs(minValue));
    const zoom = Math.max(20, range * 3); // Base zoom level is 20, scales up with data range
    const height = Math.max(20, range * 2); // Adjust height based on data range
    
    camera.position.set(20, height, zoom);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function LineChart({ data }) {  
  // Calculate min and max values
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  const lastPoint = new THREE.Vector3(
    data.length / 2 - 1,
    data[data.length - 1].value * 2,
    Math.sin((data.length - 1) * 0.2) * 2
  );
  
  // Create points and colors for the line
  const points = [];
  const colors = [];
  const fillPoints = [];
  const fillColors = [];

  for (let i = 0; i < data.length; i++) {
    const y = data[i].value * 2;
    const x = i - data.length / 2;
    const z = Math.sin(i * 0.2) * 2;
    
    points.push(new THREE.Vector3(x, y, z));
    fillPoints.push(new THREE.Vector3(x, y, z));
    fillPoints.push(new THREE.Vector3(x, 0, z));

    // Calculate color based on y value
    if (y >= 0) {
      const intensity = Math.min(y / 20, 1);
      colors.push(0, 1 * intensity, 0.53 * intensity);
      
      // Add colors for both vertices of the fill (top and bottom)
      fillColors.push(0, 1 * intensity, 0.53 * intensity);
      fillColors.push(0, 0.2 * intensity, 0.1 * intensity);
    } else {
      const intensity = Math.min(Math.abs(y) / 20, 1);
      colors.push(1 * intensity, 0, 0);
      
      // Add colors for both vertices of the fill (top and bottom)
      fillColors.push(1 * intensity, 0, 0);
      fillColors.push(0.2 * intensity, 0, 0);
    }
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  // Create fill geometry using triangles
  const fillGeometry = new THREE.BufferGeometry();
  const fillIndices = [];

  for (let i = 0; i < data.length - 1; i++) {
    const baseIndex = i * 2;
    
    // First triangle
    fillIndices.push(baseIndex, baseIndex + 1, baseIndex + 2);
    // Second triangle
    fillIndices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
  }

  fillGeometry.setFromPoints(fillPoints);
  fillGeometry.setAttribute('color', new THREE.Float32BufferAttribute(fillColors, 3));
  fillGeometry.setIndex(fillIndices);

  return (
    <group>
      <DynamicCamera maxValue={maxValue} minValue={minValue} />
      {/* Gradient fill */}
      <mesh>
        <bufferGeometry attach="geometry" {...fillGeometry} />
        <meshBasicMaterial vertexColors transparent opacity={0.2} side={THREE.DoubleSide}/>
      </mesh>
      {/* Line */}
      <line>
        <bufferGeometry attach="geometry" {...lineGeometry} />
        <lineBasicMaterial attach="material" vertexColors linewidth={2} />
      </line>
      <PulsingIndicator position={lastPoint} value={data[data.length - 1].value} />
    </group>
  );
}

export default function Chart3D({ data }) {
  // Calculate the maximum absolute value from the data
  const maxAbsValue = Math.max(...data.map(point => Math.abs(point.value)));

  // Calculate dynamic camera position based on the data range
  const cameraDistance = Math.max(50, maxAbsValue * 2.5); // Minimum distance of 50
  const cameraHeight = Math.max(20, maxAbsValue * 1.5); // Minimum height of 20

  return (
    <Canvas camera={{ position: [0, cameraHeight, cameraDistance], fov: 75 }} className="w-full h-full">
      {/* Reduced ambient light for more dramatic effect */}
      <ambientLight intensity={0.3} />
      {/* Main directional light for general scene illumination */}
      <directionalLight position={[50, 50, 25]} intensity={0.9} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={100} shadow-camera-left={-50} shadow-camera-right={50} shadow-camera-top={50} shadow-camera-bottom={-50}/>
      {/* Soft fill light */}
      <pointLight position={[-10, 20, -20]} intensity={0.5} />
      <LineChart data={data} />
      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}