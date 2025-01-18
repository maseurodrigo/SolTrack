import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * PulsingIndicator Component
 * Renders a pulsing sphere at the latest data point position
 * @param {Object} position - 3D vector position
 * @param {number} value - Data point value determining color
 */
function PulsingIndicator({ position, value }) {
  const materialRef = useRef(null);

  // Animate opacity for pulsing effect
  useFrame(({ clock }) => {
    if (materialRef.current) {
      const opacity = (Math.sin(clock.getElapsedTime() * 3) + 1) / 2;
      materialRef.current.opacity = opacity * 0.8 + 0.2;
    }
  });

  const color = value >= 0 ? '#00ff88' : '#ff4444';

  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        transparent
        emissive={color}
        emissiveIntensity={1}
      />
    </mesh>
  );
}

/**
 * ShadowPlane Component
 * Creates a vertical plane between two points with gradient opacity
 * Used to create the shadow effect beneath the line chart
 * @param {Object} start - Starting point vector
 * @param {Object} end - Ending point vector
 * @param {string} color - Hex color string
 */
function ShadowPlane({ start, end, color }) {
  // Validate input points to prevent NaN errors
  if (!start || !end || typeof start.x !== 'number' || typeof start.y !== 'number' || 
      typeof start.z !== 'number' || typeof end.x !== 'number' || 
      typeof end.y !== 'number' || typeof end.z !== 'number') {
    return null;
  }

  // Create four corners of the shadow plane
  const points = [
    new THREE.Vector3(start.x, 0, start.z),        // Bottom start
    new THREE.Vector3(start.x, start.y, start.z),  // Top start
    new THREE.Vector3(end.x, end.y, end.z),        // Top end
    new THREE.Vector3(end.x, 0, end.z),            // Bottom end
  ];

  // Additional validation for numerical values
  if (points.some(p => isNaN(p.x) || isNaN(p.y) || isNaN(p.z))) {
    return null;
  }

  // Create geometry and set up faces
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  // Set up colors with opacity gradient
  const colors = new Float32Array(points.length * 4);
  
  // Convert hex color to RGB
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  
  const maxHeight = Math.max(Math.abs(start.y), Math.abs(end.y)) || 1;
  
  // Apply colors and opacity to each vertex
  points.forEach((point, i) => {
    const colorIndex = i * 4;
    const heightRatio = Math.abs(point.y) / maxHeight;
    const opacity = point.y === 0 ? 0 : heightRatio;
    
    colors[colorIndex] = r;
    colors[colorIndex + 1] = g;
    colors[colorIndex + 2] = b;
    colors[colorIndex + 3] = opacity;
  });

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        vertexColors
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.NormalBlending}
        opacity={0.5}
      />
    </mesh>
  );
}

/**
 * LineChart Component
 * Renders the main 3D line chart with shadows and color transitions
 * @param {Array} data - Array of data points with timestamp and value
 * @param {Function} onPointsUpdate - Callback to update parent with current points
 */
function LineChart({ data, onPointsUpdate }) {
  // Handle empty or invalid data
  if (!Array.isArray(data) || data.length === 0) {
    useEffect(() => {
      onPointsUpdate([]);
    }, [onPointsUpdate]);

    return <group />;
  }

  const points = [];
  const colors = [];
  
  // Configuration for point spacing and perspective
  const spacing = 2;
  const startX = -((data.length - 1) * spacing) / 2;
  const maxMagnitude = Math.max(
    ...data.map(d => Math.abs(d.value) || 0),
    1
  );

  // Perspective and rotation settings
  const rotationAngle = Math.PI * 0.15;  // 15 degrees rotation
  const perspectiveDepth = 20;           // Maximum depth for perspective effect
  
  // Generate points and colors with perspective transformation
  for (let i = 0; i < data.length; i++) {
    const x = startX + (i * spacing);
    const y = data[i].value || 0;
    
    // Calculate perspective position
    const age = (data.length - 1 - i) / Math.max(data.length - 1, 1);
    const z = -age * perspectiveDepth;
    
    // Apply rotation transformation
    const rotatedZ = z * Math.cos(rotationAngle);
    const rotatedX = x + z * Math.sin(rotationAngle);

    points.push(new THREE.Vector3(rotatedX, y, rotatedZ));

    // Calculate color intensity based on value and age
    const intensity = Math.min(Math.abs(y) / maxMagnitude, 1);
    const baseIntensity = 0.2;
    const scaledIntensity = baseIntensity + (intensity * (1 - baseIntensity));
    const distanceFade = 1 - (age * 0.5);

    // Set colors (green for positive, red for negative values)
    if (y >= 0) {
      colors.push(0, scaledIntensity * distanceFade, 0.53 * scaledIntensity * distanceFade);
    } else {
      colors.push(scaledIntensity * distanceFade, 0, 0);
    }
  }

  // Update parent component with current points
  useEffect(() => {
    onPointsUpdate(points);
  }, [points, onPointsUpdate]);

  // Create line geometry with vertex colors
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  return (
    <group>
      {/* Render shadow planes between points */}
      {points.map((point, i) => {
        if (i < points.length - 1) {
          const nextPoint = points[i + 1];
          const currentValue = data[i].value || 0;
          const nextValue = data[i + 1].value || 0;

          // Handle different cases for shadow planes
          if (currentValue >= 0 && nextValue >= 0) {
            // Both points positive
            return (
              <ShadowPlane
                key={i}
                start={point}
                end={nextPoint}
                color="#00ff88"
              />
            );
          } else if (currentValue < 0 && nextValue < 0) {
            // Both points negative
            return (
              <ShadowPlane
                key={i}
                start={point}
                end={nextPoint}
                color="#ff4444"
              />
            );
          } else {
            // Crossing zero - split into two shadow planes
            const denominator = nextValue - currentValue;
            const t = denominator !== 0 ? Math.abs(currentValue) / Math.abs(denominator) : 0.5;
            const crossX = point.x + (nextPoint.x - point.x) * t;
            const crossZ = point.z + (nextPoint.z - point.z) * t;
            const crossPoint = new THREE.Vector3(crossX, 0, crossZ);

            return (
              <React.Fragment key={i}>
                <ShadowPlane
                  start={point}
                  end={crossPoint}
                  color={currentValue >= 0 ? "#00ff88" : "#ff4444"}
                />
                <ShadowPlane
                  start={crossPoint}
                  end={nextPoint}
                  color={nextValue >= 0 ? "#00ff88" : "#ff4444"}
                />
              </React.Fragment>
            );
          }
        }
        return null;
      })}

      {/* Render the main line */}
      <line>
        <bufferGeometry attach="geometry" {...lineGeometry} />
        <lineBasicMaterial attach="material" vertexColors linewidth={2} />
      </line>

      {/* Render the pulsing indicator at the latest point */}
      {points.length > 0 && (
        <PulsingIndicator 
          position={points[points.length - 1]} 
          value={data[data.length - 1].value || 0} 
        />
      )}
    </group>
  );
}

/**
 * Chart3D Component
 * Main component that renders a 3D visualization of time series data
 * Features dynamic camera positioning, shadows, and responsive scaling
 * @param {Array} data - Array of data points with timestamp and value
 */
export default function Chart3D({ data }) {
  const [currentPoints, setCurrentPoints] = useState([]);
  
  // Default camera settings for empty state
  const defaultCamera = {
    position: [0, 0, 50],
    fov: 45,
    near: 0.1,
    far: 1000,
    up: [0, 1, 0]
  };
  
  // Handle empty data case
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '700px' }}>
        <Canvas camera={defaultCamera} shadows>
          <ambientLight intensity={0.4} />
          <LineChart data={[]} onPointsUpdate={setCurrentPoints} />
          <OrbitControls 
            enableZoom={true}
            maxDistance={100}
            minDistance={10}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    );
  }
  
  // Calculate view range and camera settings based on data
  const values = currentPoints.map(p => p.y).filter(y => !isNaN(y));
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  
  // Add padding to the view range
  const totalRange = Math.max(maxValue - minValue, 20);
  const padding = totalRange * 0.2;
  const viewRange = totalRange + padding;
  
  // Calculate camera positioning
  const rangeCenter = (maxValue + minValue) / 2;
  const heightScale = Math.max(1.5, Math.log10(viewRange));
  const cameraHeight = viewRange * heightScale;
  
  // Scale camera distance based on data length and range
  const lengthScale = Math.max(1, currentPoints.length / 25);
  const distanceScale = Math.max(1.5, Math.log10(viewRange));
  const cameraDistance = Math.max(
    50,
    viewRange * distanceScale * lengthScale
  );
  
  // Calculate dynamic field of view
  const baseFOV = 45;
  const maxFOV = 90;
  const fovScale = Math.max(0.3, Math.log10(viewRange) * 0.2);
  const dynamicFOV = Math.min(
    baseFOV + (viewRange * fovScale),
    maxFOV
  );

  // Position camera to follow the latest point
  const lastPointX = currentPoints.length > 0 ? currentPoints[currentPoints.length - 1].x : 0;
  const cameraPosition = new THREE.Vector3(
    lastPointX - cameraDistance * 0.6,
    rangeCenter + cameraHeight * 0.5,
    cameraDistance * 0.8
  );

  const targetPosition = new THREE.Vector3(
    lastPointX,
    rangeCenter,
    0
  );

  return (
    <Canvas
      camera={{
        position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
        fov: dynamicFOV,
        near: 0.1,
        far: Math.max(5000, cameraDistance * 3),
        up: [0, 1, 0]
      }}
      shadows
      className="w-full h-full"
    >
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 20, -20]} intensity={0.4} />
      
      {/* Main chart components */}
      <LineChart data={data} onPointsUpdate={setCurrentPoints} />
      <OrbitControls 
        enableZoom={true}
        maxDistance={cameraDistance * 2}
        minDistance={10}
        target={[targetPosition.x, targetPosition.y, targetPosition.z]}
      />
    </Canvas>
  );
}