import React, { useEffect, useRef } from 'react';
import { Algorithm } from '../types/crypto';

interface VisualObfuscationProps {
  text: string;
  algorithm: Algorithm;
}

const VisualObfuscation: React.FC<VisualObfuscationProps> = ({ text, algorithm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !text) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Get a seed from the text
    const getSeed = (text: string) => {
      return Array.from(text).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    };
    
    const seed = getSeed(text);
    
    // Simple random function with seed
    const seededRandom = (seed: number) => {
      let value = Math.sin(seed) * 10000;
      return value - Math.floor(value);
    };
    
    // Clear canvas
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Choose generation style based on algorithm
    switch (algorithm) {
      case 'aes':
        generateGridPattern(ctx, canvas, text, seed);
        break;
      case 'chacha':
        generateFlowField(ctx, canvas, text, seed);
        break;
      case 'kyber':
        generateLatticeArt(ctx, canvas, text, seed);
        break;
      case 'custom':
        generateFractalPattern(ctx, canvas, text, seed);
        break;
      default:
        break;
    }
    
    // Add noise overlay for all patterns
    addNoiseOverlay(ctx, canvas, 0.05);
    
  }, [text, algorithm]);
  
  // AES: Geometric grid pattern
  const generateGridPattern = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string,
    seed: number
  ) => {
    const cellSize = 20;
    const cols = Math.ceil(canvas.width / cellSize);
    const rows = Math.ceil(canvas.height / cellSize);
    
    // Generate pattern colors from text
    const getColor = (i: number, j: number) => {
      const index = (i * cols + j) % text.length;
      const charCode = text.charCodeAt(index);
      return `rgba(10, 255, 255, ${(charCode % 100) / 100})`;
    };
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * cellSize;
        const y = i * cellSize;
        
        const patternType = Math.floor(
          (Math.sin(i * j + seed) + 1) * 2
        ) % 4;
        
        ctx.fillStyle = getColor(i, j);
        
        switch (patternType) {
          case 0: // Square
            ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
            break;
          case 1: // Circle
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 2: // Triangle
            ctx.beginPath();
            ctx.moveTo(x + cellSize / 2, y + 2);
            ctx.lineTo(x + 2, y + cellSize - 2);
            ctx.lineTo(x + cellSize - 2, y + cellSize - 2);
            ctx.closePath();
            ctx.fill();
            break;
          case 3: // Cross
            ctx.beginPath();
            ctx.moveTo(x + 2, y + cellSize / 2);
            ctx.lineTo(x + cellSize - 2, y + cellSize / 2);
            ctx.moveTo(x + cellSize / 2, y + 2);
            ctx.lineTo(x + cellSize / 2, y + cellSize - 2);
            ctx.lineWidth = 3;
            ctx.strokeStyle = getColor(i, j);
            ctx.stroke();
            break;
        }
      }
    }
  };
  
  // ChaCha: Flow field
  const generateFlowField = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string,
    seed: number
  ) => {
    const particleCount = Math.min(100, text.length * 2);
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const charIndex = i % text.length;
      const charCode = text.charCodeAt(charIndex);
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        size: 2 + (charCode % 5),
        color: `hsl(${(charCode * 3) % 360}, 100%, 60%)`
      });
    }
    
    // Flow field parameters
    const resolution = 20;
    const cols = Math.ceil(canvas.width / resolution);
    const rows = Math.ceil(canvas.height / resolution);
    
    // Update and draw particles
    for (let step = 0; step < 100; step++) {
      particles.forEach(particle => {
        // Get flow field angle at particle position
        const col = Math.floor(particle.x / resolution);
        const row = Math.floor(particle.y / resolution);
        const angle = Math.sin(col * 0.1 + seed) * Math.cos(row * 0.1 + seed) * Math.PI * 2;
        
        // Update velocity
        particle.vx = Math.cos(angle) * 0.5;
        particle.vy = Math.sin(angle) * 0.5;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Keep particles on canvas
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };
  
  // Kyber: Lattice-inspired art
  const generateLatticeArt = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string,
    seed: number
  ) => {
    const gridSize = 12;
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;
    
    // Draw base grid
    ctx.strokeStyle = 'rgba(186, 1, 255, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridSize; i++) {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(canvas.width, i * cellHeight);
      ctx.stroke();
      
      // Vertical
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, canvas.height);
      ctx.stroke();
    }
    
    // Generate points based on text
    const points = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const row = Math.floor((charCode % 256) / 256 * gridSize);
      const col = Math.floor((charCode % 127) / 127 * gridSize);
      
      points.push({
        x: col * cellWidth + cellWidth / 2,
        y: row * cellHeight + cellHeight / 2,
        value: charCode
      });
    }
    
    // Draw connections between points
    ctx.lineWidth = 2;
    
    for (let i = 0; i < points.length - 1; i++) {
      const point = points[i];
      const nextPoint = points[i + 1];
      
      // Color based on character values
      const hue = ((point.value + nextPoint.value) / 2) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.6)`;
      
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(nextPoint.x, nextPoint.y);
      ctx.stroke();
      
      // Draw points
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw last point
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      ctx.fillStyle = `hsl(${lastPoint.value % 360}, 100%, 60%)`;
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Custom: Fractal-inspired pattern
  const generateFractalPattern = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string,
    seed: number
  ) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    
    // Create a function to generate a value from text at an index
    const getValue = (index: number) => {
      return text.charCodeAt(index % text.length) / 255;
    };
    
    // Draw concentric shapes with rotational symmetry
    const symmetry = 5 + (seed % 7);
    const layers = Math.min(text.length, 10);
    
    for (let layer = 0; layer < layers; layer++) {
      const radius = maxRadius * (1 - layer / layers);
      const layerRotation = layer * Math.PI / layers + seed * 0.01;
      
      // Get colors from text
      const hue = (text.charCodeAt(layer % text.length) * 3) % 360;
      const saturation = 70 + layer * 3;
      const lightness = 40 + layer * 3;
      
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`;
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
      ctx.lineWidth = 1;
      
      // Draw a shape with n-fold symmetry
      ctx.beginPath();
      
      for (let i = 0; i < symmetry; i++) {
        const angle = (i / symmetry) * Math.PI * 2 + layerRotation;
        const textIndex = (layer * symmetry + i) % text.length;
        const value = getValue(textIndex);
        
        const innerRadius = radius * (0.3 + value * 0.4);
        const outerRadius = radius;
        
        const innerX = centerX + Math.cos(angle) * innerRadius;
        const innerY = centerY + Math.sin(angle) * innerRadius;
        
        const nextAngle = ((i + 1) / symmetry) * Math.PI * 2 + layerRotation;
        const nextTextIndex = (layer * symmetry + i + 1) % text.length;
        const nextValue = getValue(nextTextIndex);
        
        const outerX = centerX + Math.cos(angle + Math.PI / symmetry) * outerRadius;
        const outerY = centerY + Math.sin(angle + Math.PI / symmetry) * outerRadius;
        
        if (i === 0) {
          ctx.moveTo(innerX, innerY);
        } else {
          ctx.lineTo(innerX, innerY);
        }
        
        ctx.lineTo(outerX, outerY);
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  };
  
  // Add noise overlay to any pattern
  const addNoiseOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    intensity: number
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity * 255;
      
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Add scanlines
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, y, canvas.width, 1);
    }
  };
  
  return (
    <div className="border border-cyber-green p-1 h-64 bg-cyber-black">
      {text ? (
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ display: 'block' }}
        ></canvas>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-cyber-green font-cyber text-center">
            ENTER TEXT AND ENCRYPT TO<br />GENERATE VISUAL OBFUSCATION
          </p>
        </div>
      )}
    </div>
  );
};

export default VisualObfuscation;