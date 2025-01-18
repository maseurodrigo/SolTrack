import React, { useEffect, useRef } from 'react';

const LineChart2D = ({ data = [], width = 1600, height = 200 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set actual canvas size
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate min/max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values, 0); // Include 0 in the range
    const maxValue = Math.max(...values, 0); // Include 0 in the range
    const valueRange = Math.max(maxValue - minValue, 1);
    const maxMagnitude = Math.max(Math.abs(minValue), Math.abs(maxValue));
    
    // Function to calculate color intensity based on value
    const getIntensity = (value) => {
      const normalizedValue = Math.abs(value) / maxMagnitude;
      return Math.min(0.2 + (normalizedValue * 0.8), 1); // Min 0.2 opacity, max 1.0
    };

    // Add padding to the value range
    const padding = valueRange * 0.1;
    const yMin = minValue - padding;
    const yMax = maxValue + padding;

    // Calculate zero line position
    const zeroY = height - ((0 - yMin) / (yMax - yMin)) * height;

    // Draw zero line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(102, 102, 102, 0.15)';
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, zeroY);
    ctx.lineTo(width, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Function to get point coordinates
    const getPointCoords = (index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((data[index].value - yMin) / (yMax - yMin)) * height;
      return { x, y };
    };

    // Draw fills
    for (let i = 0; i < data.length - 1; i++) {
      const start = getPointCoords(i);
      const end = getPointCoords(i + 1);
      
      if (data[i].value >= 0 && data[i + 1].value >= 0) {
        const fillGradient = ctx.createLinearGradient(start.x, start.y, start.x, zeroY);
        fillGradient.addColorStop(0, `rgba(0, 255, 136, ${getIntensity(data[i].value) * 0.15})`);
        fillGradient.addColorStop(0.7, `rgba(0, 255, 136, ${getIntensity(data[i].value) * 0.05})`);
        fillGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = fillGradient;
        ctx.moveTo(start.x, zeroY);
        ctx.lineTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(end.x, zeroY);
        ctx.closePath();
        ctx.fill();
      } else if (data[i].value < 0 && data[i + 1].value < 0) {
        const fillGradient = ctx.createLinearGradient(start.x, start.y, start.x, zeroY);
        fillGradient.addColorStop(0, `rgba(255, 68, 68, ${getIntensity(data[i].value) * 0.15})`);
        fillGradient.addColorStop(0.7, `rgba(255, 68, 68, ${getIntensity(data[i].value) * 0.05})`);
        fillGradient.addColorStop(1, 'rgba(255, 68, 68, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = fillGradient;
        ctx.moveTo(start.x, zeroY);
        ctx.lineTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(end.x, zeroY);
        ctx.closePath();
        ctx.fill();
      } else {
        const t = Math.abs(data[i].value) / Math.abs(data[i + 1].value - data[i].value);
        const crossX = start.x + (end.x - start.x) * t;
        
        if (data[i].value >= 0) {
          const fillGradient1 = ctx.createLinearGradient(start.x, start.y, start.x, zeroY);
          fillGradient1.addColorStop(0, `rgba(0, 255, 136, ${getIntensity(data[i].value) * 0.15})`);
          fillGradient1.addColorStop(0.7, `rgba(0, 255, 136, ${getIntensity(data[i].value) * 0.05})`);
          fillGradient1.addColorStop(1, 'rgba(0, 255, 136, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = fillGradient1;
          ctx.moveTo(start.x, zeroY);
          ctx.lineTo(start.x, start.y);
          ctx.lineTo(crossX, zeroY);
          ctx.closePath();
          ctx.fill();

          const fillGradient2 = ctx.createLinearGradient(end.x, end.y, end.x, zeroY);
          fillGradient2.addColorStop(0, `rgba(255, 68, 68, ${getIntensity(data[i + 1].value) * 0.15})`);
          fillGradient2.addColorStop(0.7, `rgba(255, 68, 68, ${getIntensity(data[i + 1].value) * 0.05})`);
          fillGradient2.addColorStop(1, 'rgba(255, 68, 68, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = fillGradient2;
          ctx.moveTo(crossX, zeroY);
          ctx.lineTo(end.x, end.y);
          ctx.lineTo(end.x, zeroY);
          ctx.closePath();
          ctx.fill();
        } else {
          const fillGradient1 = ctx.createLinearGradient(start.x, start.y, start.x, zeroY);
          fillGradient1.addColorStop(0, `rgba(255, 68, 68, ${getIntensity(data[i].value) * 0.15})`);
          fillGradient1.addColorStop(0.7, `rgba(255, 68, 68, ${getIntensity(data[i].value) * 0.05})`);
          fillGradient1.addColorStop(1, 'rgba(255, 68, 68, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = fillGradient1;
          ctx.moveTo(start.x, zeroY);
          ctx.lineTo(start.x, start.y);
          ctx.lineTo(crossX, zeroY);
          ctx.closePath();
          ctx.fill();

          const fillGradient2 = ctx.createLinearGradient(end.x, end.y, end.x, zeroY);
          fillGradient2.addColorStop(0, `rgba(0, 255, 136, ${getIntensity(data[i + 1].value) * 0.15})`);
          fillGradient2.addColorStop(0.7, `rgba(0, 255, 136, ${getIntensity(data[i + 1].value) * 0.05})`);
          fillGradient2.addColorStop(1, 'rgba(0, 255, 136, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = fillGradient2;
          ctx.moveTo(crossX, zeroY);
          ctx.lineTo(end.x, end.y);
          ctx.lineTo(end.x, zeroY);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Draw line segments with gradients
    for (let i = 0; i < data.length - 1; i++) {
      const start = getPointCoords(i);
      const end = getPointCoords(i + 1);

      ctx.beginPath();
      ctx.lineWidth = 3;
      
      if (data[i].value >= 0 && data[i + 1].value >= 0) {
        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, `rgba(0, 255, 136, ${getIntensity(data[i].value)})`);
        gradient.addColorStop(1, `rgba(0, 255, 136, ${getIntensity(data[i + 1].value)})`);
        ctx.strokeStyle = gradient;
      } else if (data[i].value < 0 && data[i + 1].value < 0) {
        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, `rgba(255, 68, 68, ${getIntensity(data[i].value)})`);
        gradient.addColorStop(1, `rgba(255, 68, 68, ${getIntensity(data[i + 1].value)})`);
        ctx.strokeStyle = gradient;
      } else {
        const t = Math.abs(data[i].value) / Math.abs(data[i + 1].value - data[i].value);
        const crossX = start.x + (end.x - start.x) * t;
        const crossY = zeroY;

        // Draw first half
        ctx.beginPath();
        const gradient1 = ctx.createLinearGradient(start.x, start.y, crossX, crossY);
        if (data[i].value >= 0) {
          gradient1.addColorStop(0, `rgba(0, 255, 136, ${getIntensity(data[i].value)})`);
          gradient1.addColorStop(1, `rgba(0, 255, 136, 0.1)`);
        } else {
          gradient1.addColorStop(0, `rgba(255, 68, 68, ${getIntensity(data[i].value)})`);
          gradient1.addColorStop(1, `rgba(255, 68, 68, 0.1)`);
        }
        ctx.strokeStyle = gradient1;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(crossX, crossY);
        ctx.stroke();

        // Draw second half
        ctx.beginPath();
        const gradient2 = ctx.createLinearGradient(crossX, crossY, end.x, end.y);
        if (data[i + 1].value >= 0) {
          gradient2.addColorStop(0, `rgba(0, 255, 136, 0.1)`);
          gradient2.addColorStop(1, `rgba(0, 255, 136, ${getIntensity(data[i + 1].value)})`);
        } else {
          gradient2.addColorStop(0, `rgba(255, 68, 68, 0.1)`);
          gradient2.addColorStop(1, `rgba(255, 68, 68, ${getIntensity(data[i + 1].value)})`);
        }
        ctx.strokeStyle = gradient2;
        ctx.moveTo(crossX, crossY);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        continue;
      }

      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Draw points
    data.forEach((point, i) => {
      const { x, y } = getPointCoords(i);
      
      ctx.beginPath();
      ctx.fillStyle = point.value >= 0 ? '#00ff88' : '#ff4444';
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ 
        position: 'absolute', top: '0', left: '0', 
        width: width, height: height, maxWidth: '100%', maxHeight: '100%', 
        opacity: '0.2'
      }}
    />
  );
};

export default LineChart2D;