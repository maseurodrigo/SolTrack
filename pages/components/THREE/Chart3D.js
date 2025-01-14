import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
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

function Axes({ maxValue, minValue }) {
  // Calculate nice round numbers for the axis
  const range = maxValue - minValue;
  const step = Math.pow(10, Math.floor(Math.log10(range))) / 2;
  const start = Math.floor(minValue / step) * step;
  const end = Math.ceil(maxValue / step) * step;
  const steps = Math.ceil((end - start) / step);

  return (
    <group>
      {/* Y-axis */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-25, minValue * 2, 0), new THREE.Vector3(-25, maxValue * 2, 0)])}/>
        <lineBasicMaterial attach="material" color="#666666"/>
      </line>
      <Text position={[-25, maxValue * 2 + 1, 0]} color="#666666" fontSize={1.5} anchorX="center">
        PnL (SOL)
      </Text>

      {/* Y-axis markers */}
      {Array.from({ length: steps + 1 }, (_, i) => {
        const value = start + i * step;
        return (
          <group key={i}>
            <Text position={[-26, value * 2, 0]} color="#666666" fontSize={1} anchorX="right">
              {value.toFixed(1)}
            </Text>
            <line>
              <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-25.5, value * 2, 0), new THREE.Vector3(-24.5, value * 2, 0)])}/>
              <lineBasicMaterial attach="material" color="#666666"/>
            </line>
          </group>
        );
      })}
    </group>
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
      <Axes maxValue={maxValue} minValue={minValue} />
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
  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 75 }} className="w-full h-full">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <LineChart data={data} />
      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}