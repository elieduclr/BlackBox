import React, { useEffect, useRef } from 'react';
import { Algorithm } from '../types/crypto';

interface VisualizerProps {
  inputText: string;
  outputText: string;
  algorithm: Algorithm;
  isEncrypting: boolean;
  isProcessing: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({
  inputText,
  outputText,
  algorithm,
  isEncrypting,
  isProcessing
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Different visualization based on algorithm
    switch (algorithm) {
      case 'aes':
        drawAesVisualization(ctx, canvas, inputText, outputText, isEncrypting, isProcessing);
        break;
      case 'chacha':
        drawChaChaVisualization(ctx, canvas, inputText, outputText, isEncrypting, isProcessing);
        break;
      case 'kyber':
        drawKyberVisualization(ctx, canvas, inputText, outputText, isEncrypting, isProcessing);
        break;
      case 'custom':
        drawCustomVisualization(ctx, canvas, inputText, outputText, isEncrypting, isProcessing);
        break;
      default:
        break;
    }
  }, [inputText, outputText, algorithm, isEncrypting, isProcessing]);

  // AES visualization with block transformations
  const drawAesVisualization = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    input: string,
    output: string,
    isEncrypting: boolean,
    isProcessing: boolean
  ) => {
    const blockSize = 40;
    const margin = 10;
    const textLength = input.length;
    const numBlocks = Math.ceil(textLength / 16); // AES uses 16-byte blocks
    const cols = Math.min(Math.ceil(Math.sqrt(numBlocks)), 6);
    const rows = Math.ceil(numBlocks / cols);

    // Calculate grid dimensions
    const gridWidth = cols * (blockSize + margin);
    const gridHeight = rows * (blockSize + margin);
    const startX = (canvas.width - gridWidth) / 2;
    const startY = (canvas.height - gridHeight) / 2;

    // Animation parameters
    const time = Date.now() / 1000;
    const rotationSpeed = isProcessing ? 2 : 0;
    const pulseSpeed = isProcessing ? 4 : 0;

    // Draw blocks with transformations
    for (let i = 0; i < numBlocks; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (blockSize + margin);
      const y = startY + row * (blockSize + margin);

      ctx.save();
      ctx.translate(x + blockSize/2, y + blockSize/2);
      
      // Add rotation during processing
      if (isProcessing) {
        ctx.rotate((Math.sin(time * rotationSpeed + i) * Math.PI) / 8);
      }

      // Pulse effect
      const scale = 1 + (isProcessing ? Math.sin(time * pulseSpeed + i) * 0.1 : 0);
      ctx.scale(scale, scale);

      // Draw block
      ctx.beginPath();
      ctx.rect(-blockSize/2, -blockSize/2, blockSize, blockSize);
      
      // Color based on encryption state
      const progress = isProcessing ? Math.sin(time * pulseSpeed + i) * 0.5 + 0.5 : 1;
      const alpha = 0.3 + progress * 0.7;
      
      if (isEncrypting) {
        ctx.fillStyle = `rgba(10, 255, 255, ${alpha})`;
        ctx.strokeStyle = 'rgba(10, 255, 255, 0.8)';
      } else {
        ctx.fillStyle = `rgba(186, 1, 255, ${alpha})`;
        ctx.strokeStyle = 'rgba(186, 1, 255, 0.8)';
      }
      
      ctx.fill();
      ctx.stroke();

      // Add data visualization inside block
      if (input && i * 16 < input.length) {
        const blockText = input.substr(i * 16, 16);
        const charCode = blockText.charCodeAt(0);
        const pattern = Math.floor((charCode % 4));

        ctx.strokeStyle = isEncrypting ? '#0AFFFF' : '#BA01FF';
        ctx.lineWidth = 2;

        switch (pattern) {
          case 0: // Cross pattern
            ctx.beginPath();
            ctx.moveTo(-blockSize/3, -blockSize/3);
            ctx.lineTo(blockSize/3, blockSize/3);
            ctx.moveTo(blockSize/3, -blockSize/3);
            ctx.lineTo(-blockSize/3, blockSize/3);
            ctx.stroke();
            break;
          case 1: // Circle pattern
            ctx.beginPath();
            ctx.arc(0, 0, blockSize/3, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case 2: // Square pattern
            ctx.strokeRect(-blockSize/3, -blockSize/3, blockSize/1.5, blockSize/1.5);
            break;
          case 3: // Diamond pattern
            ctx.beginPath();
            ctx.moveTo(0, -blockSize/3);
            ctx.lineTo(blockSize/3, 0);
            ctx.lineTo(0, blockSize/3);
            ctx.lineTo(-blockSize/3, 0);
            ctx.closePath();
            ctx.stroke();
            break;
        }
      }

      ctx.restore();
    }

    // Draw connecting lines between blocks during processing
    if (isProcessing) {
      ctx.beginPath();
      ctx.strokeStyle = isEncrypting ? 'rgba(10, 255, 255, 0.3)' : 'rgba(186, 1, 255, 0.3)';
      ctx.lineWidth = 1;

      for (let i = 0; i < numBlocks - 1; i++) {
        const col1 = i % cols;
        const row1 = Math.floor(i / cols);
        const col2 = (i + 1) % cols;
        const row2 = Math.floor((i + 1) / cols);

        const x1 = startX + col1 * (blockSize + margin) + blockSize/2;
        const y1 = startY + row1 * (blockSize + margin) + blockSize/2;
        const x2 = startX + col2 * (blockSize + margin) + blockSize/2;
        const y2 = startY + row2 * (blockSize + margin) + blockSize/2;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();
    }
  };

  // ChaCha visualization with dynamic state matrix
  const drawChaChaVisualization = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    input: string,
    output: string,
    isEncrypting: boolean,
    isProcessing: boolean
  ) => {
    const time = Date.now() / 1000;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;
    
    // Draw the main circular structure
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2;
    
    // Rotating circles
    for (let i = 0; i < 4; i++) {
      const angle = (time * (i + 1) * 0.5) % (Math.PI * 2);
      const x = centerX + Math.cos(angle) * radius * 0.8;
      const y = centerY + Math.sin(angle) * radius * 0.8;
      
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.stroke();
      
      if (input && isProcessing) {
        // Add data bits visualization
        const charCode = input.charCodeAt(i % input.length);
        for (let j = 0; j < 8; j++) {
          const bit = (charCode >> j) & 1;
          const bitAngle = (j / 8) * Math.PI * 2 + angle;
          const bitX = x + Math.cos(bitAngle) * 25;
          const bitY = y + Math.sin(bitAngle) * 25;
          
          ctx.fillStyle = bit ? '#39FF14' : 'rgba(57, 255, 20, 0.2)';
          ctx.beginPath();
          ctx.arc(bitX, bitY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // Draw state matrix connections
    if (isProcessing) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.3)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 4; i++) {
        const angle1 = (time * (i + 1) * 0.5) % (Math.PI * 2);
        const x1 = centerX + Math.cos(angle1) * radius * 0.8;
        const y1 = centerY + Math.sin(angle1) * radius * 0.8;
        
        for (let j = i + 1; j < 4; j++) {
          const angle2 = (time * (j + 1) * 0.5) % (Math.PI * 2);
          const x2 = centerX + Math.cos(angle2) * radius * 0.8;
          const y2 = centerY + Math.sin(angle2) * radius * 0.8;
          
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
      }
      ctx.stroke();
    }
    
    // Add data flow effect
    if (input && isProcessing) {
      const particles = Math.min(input.length, 32);
      for (let i = 0; i < particles; i++) {
        const particleTime = (time + i * 0.1) % 1;
        const angle = (i / particles) * Math.PI * 2;
        
        const x = centerX + Math.cos(angle) * (radius * particleTime);
        const y = centerY + Math.sin(angle) * (radius * particleTime);
        
        const charCode = input.charCodeAt(i % input.length);
        const hue = (charCode % 120) + 90; // Green spectrum
        
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${1 - particleTime})`;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Kyber visualization with lattice points
  const drawKyberVisualization = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    input: string,
    output: string,
    isEncrypting: boolean,
    isProcessing: boolean
  ) => {
    const time = Date.now() / 1000;
    const gridSize = 12;
    const cellSize = Math.min(canvas.width, canvas.height) / gridSize;
    
    // Draw base lattice grid
    ctx.strokeStyle = 'rgba(186, 1, 255, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridSize; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    
    if (!input) return;
    
    // Generate lattice points based on input
    const points = [];
    for (let i = 0; i < Math.min(input.length * 2, 50); i++) {
      const charCode = input.charCodeAt(i % input.length);
      const x = ((charCode * 17) % gridSize) * cellSize + cellSize / 2;
      const y = ((charCode * 23) % gridSize) * cellSize + cellSize / 2;
      points.push({ x, y, charCode });
    }
    
    // Draw connections between points
    if (isProcessing) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(186, 1, 255, 0.3)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // Animated connection line
        const progress = (Math.sin(time * 2 + i) + 1) / 2;
        const midX = p1.x + (p2.x - p1.x) * progress;
        const midY = p1.y + (p2.y - p1.y) * progress;
        
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(midX, midY);
      }
      ctx.stroke();
    }
    
    // Draw lattice points with animation
    points.forEach((point, i) => {
      const pointSize = 4 + Math.sin(time * 3 + i) * 2;
      const hue = (point.charCode % 60) + 270; // Purple spectrum
      
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Add quantum superposition effect during processing
      if (isProcessing) {
        const ghostPoints = 3;
        for (let j = 0; j < ghostPoints; j++) {
          const angle = (j / ghostPoints) * Math.PI * 2 + time * 2;
          const radius = 10 + Math.sin(time * 4 + i) * 5;
          const ghostX = point.x + Math.cos(angle) * radius;
          const ghostY = point.y + Math.sin(angle) * radius;
          
          ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.2)`;
          ctx.beginPath();
          ctx.arc(ghostX, ghostY, pointSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  };

  // Custom algorithm visualization with fractal patterns
  const drawCustomVisualization = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    input: string,
    output: string,
    isEncrypting: boolean,
    isProcessing: boolean
  ) => {
    const time = Date.now() / 1000;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;
    
    if (!input) return;
    
    // Create dynamic fractal pattern
    const layers = Math.min(input.length, 8);
    const angleStep = (Math.PI * 2) / layers;
    
    for (let layer = 0; layer < layers; layer++) {
      const radius = maxRadius * (1 - layer / layers);
      const baseAngle = time * (layer % 2 ? 0.5 : -0.5) + layer * angleStep;
      
      // Get color from input data
      const charCode = input.charCodeAt(layer % input.length);
      const hue = (charCode % 360);
      const saturation = 80 + layer * 2;
      const lightness = 50 + layer * 3;
      
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
      ctx.lineWidth = 2;
      
      // Draw fractal arms
      const arms = 5 + layer;
      for (let arm = 0; arm < arms; arm++) {
        const angle = baseAngle + (arm * Math.PI * 2) / arms;
        const x1 = centerX + Math.cos(angle) * radius * 0.5;
        const y1 = centerY + Math.sin(angle) * radius * 0.5;
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Add processing effects
        if (isProcessing) {
          const particles = 3;
          for (let p = 0; p < particles; p++) {
            const progress = ((time * 2 + p / particles) % 1);
            const px = x1 + (x2 - x1) * progress;
            const py = y1 + (y2 - y1) * progress;
            
            ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${1 - progress})`;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Add connecting arcs during processing
      if (isProcessing && layer < layers - 1) {
        const nextRadius = maxRadius * (1 - (layer + 1) / layers);
        const arcRadius = (radius + nextRadius) / 2;
        const arcCount = 3;
        
        for (let arc = 0; arc < arcCount; arc++) {
          const arcAngle = baseAngle + (arc * Math.PI * 2) / arcCount;
          const arcProgress = (Math.sin(time * 3 + layer + arc) + 1) / 2;
          
          ctx.beginPath();
          ctx.arc(
            centerX,
            centerY,
            arcRadius,
            arcAngle,
            arcAngle + Math.PI / arcCount * arcProgress
          );
          ctx.stroke();
        }
      }
    }
  };
  
  return (
    <div className="border border-cyber-blue p-1 h-64 bg-cyber-black">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ display: 'block' }}
      ></canvas>
    </div>
  );
};

export default Visualizer;