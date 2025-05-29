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
        drawAesVisualization(ctx, canvas, inputText, isProcessing);
        break;
      case 'chacha':
        drawChaChaVisualization(ctx, canvas, inputText, isProcessing);
        break;
      case 'kyber':
        drawKyberVisualization(ctx, canvas, inputText, isProcessing);
        break;
      case 'custom':
        drawCustomVisualization(ctx, canvas, inputText, isProcessing);
        break;
      default:
        break;
    }
    
  }, [inputText, outputText, algorithm, isEncrypting, isProcessing]);
  
  // AES visualization with block structure
  const drawAesVisualization = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    text: string,
    isProcessing: boolean
  ) => {
    ctx.fillStyle = '#0AFFFF';
    ctx.strokeStyle = '#0AFFFF';
    ctx.lineWidth = 2;
    
    const blockSize = 30;
    const margin = 10;
    const rows = 4;
    const cols = Math.min(Math.ceil(text.length / rows), 8);
    
    // Draw blocks
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = margin + j * (blockSize + margin);
        const y = margin + i * (blockSize + margin);
        
        ctx.strokeRect(x, y, blockSize, blockSize);
        
        if (isProcessing) {
          // Animated fill for processing state
          const fillPercentage = (Date.now() % 1000) / 1000;
          ctx.fillStyle = `rgba(10, 255, 255, ${fillPercentage * 0.5})`;
          ctx.fillRect(x, y, blockSize, blockSize);
        } else if (text && i * cols + j < text.length) {
          // Fill based on character code
          const charCode = text.charCodeAt(i * cols + j) % 255;
          ctx.fillStyle = `rgba(10, 255, 255, ${charCode / 512})`;
          ctx.fillRect(x, y, blockSize, blockSize);
        }
      }
    }
    
    // Draw connecting lines
    if (isProcessing) {
      ctx.beginPath();
      ctx.strokeStyle = '#BA01FF';
      
      for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < cols; j++) {
          const x1 = margin + j * (blockSize + margin) + blockSize / 2;
          const y1 = margin + i * (blockSize + margin) + blockSize;
          const x2 = margin + ((j + 1) % cols) * (blockSize + margin) + blockSize / 2;
          const y2 = margin + (i + 1) * (blockSize + margin);
          
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
      }
      
      ctx.stroke();
    }
  };
  
  // ChaCha visualization with a stream of rotating blocks
  const drawChaChaVisualization = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    text: string,
    isProcessing: boolean
  ) => {
    ctx.fillStyle = '#39FF14';
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2;
    
    const center = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };
    
    const radius = Math.min(canvas.width, canvas.height) / 3;
    
    // Draw circular pattern
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw quarter circular divisions
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      const angle = (i * Math.PI / 2) + (isProcessing ? Date.now() % 2000 / 2000 * Math.PI / 4 : 0);
      ctx.lineTo(
        center.x + Math.cos(angle) * radius,
        center.y + Math.sin(angle) * radius
      );
      ctx.stroke();
    }
    
    // Draw data chunks around the circle
    if (text) {
      const chunks = Math.min(16, text.length);
      for (let i = 0; i < chunks; i++) {
        const angle = (i / chunks) * Math.PI * 2 + 
          (isProcessing ? Date.now() % 3000 / 3000 * Math.PI * 2 : 0);
        
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        
        ctx.fillStyle = `rgba(57, 255, 20, ${0.3 + (i % 3) * 0.2})`;
        ctx.fillRect(x - 10, y - 10, 20, 20);
        ctx.strokeRect(x - 10, y - 10, 20, 20);
      }
    }
  };
  
  // Kyber visualization with lattice-like structure
  const drawKyberVisualization = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    text: string,
    isProcessing: boolean
  ) => {
    ctx.strokeStyle = '#BA01FF';
    ctx.lineWidth = 1;
    
    const gridSize = 10;
    const cellSize = Math.min(canvas.width, canvas.height) / gridSize;
    
    // Draw a lattice grid
    for (let i = 0; i <= gridSize; i++) {
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
      
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
    }
    
    // Draw points representing data
    if (text) {
      const pointCount = Math.min(text.length, 50);
      
      for (let i = 0; i < pointCount; i++) {
        const charCode = text.charCodeAt(i % text.length);
        
        // Generate "lattice point" positions based on character code
        const x = (charCode % gridSize) * cellSize + cellSize / 2;
        const y = (Math.floor(charCode / 256 * gridSize)) * cellSize + cellSize / 2;
        
        // Size based on processing status
        const pointSize = isProcessing ? 
          4 + Math.sin(Date.now() % 1000 / 1000 * Math.PI * 2) * 2 : 4;
        
        ctx.fillStyle = '#BA01FF';
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Connect some points if processing
        if (isProcessing && i < pointCount - 1) {
          const nextCharCode = text.charCodeAt((i + 1) % text.length);
          const nextX = (nextCharCode % gridSize) * cellSize + cellSize / 2;
          const nextY = (Math.floor(nextCharCode / 256 * gridSize)) * cellSize + cellSize / 2;
          
          ctx.strokeStyle = 'rgba(186, 1, 255, 0.5)';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nextX, nextY);
          ctx.stroke();
        }
      }
    }
  };
  
  // Custom algorithm visualization with a mix of patterns
  const drawCustomVisualization = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    text: string,
    isProcessing: boolean
  ) => {
    ctx.lineWidth = 2;
    
    // Clear with fade
    ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!text) return;
    
    // Create a spiral pattern
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 20;
    
    ctx.strokeStyle = '#FF00F5';
    ctx.beginPath();
    
    const spins = 2;
    const points = Math.min(text.length, 100);
    
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      const angle = spins * Math.PI * 2 * t;
      const radius = t * maxRadius;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Add data points along the spiral
    for (let i = 0; i < Math.min(text.length, 20); i++) {
      const t = i / 20;
      const angle = spins * Math.PI * 2 * t + 
        (isProcessing ? Date.now() % 2000 / 2000 * Math.PI : 0);
      const radius = t * maxRadius;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Mix colors based on character code
      const charCode = text.charCodeAt(i % text.length);
      const hue = (charCode % 360);
      
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Add connecting lines between some points
      if (i > 0 && i % 3 === 0) {
        const prevT = (i - 3) / 20;
        const prevAngle = spins * Math.PI * 2 * prevT + 
          (isProcessing ? Date.now() % 2000 / 2000 * Math.PI : 0);
        const prevRadius = prevT * maxRadius;
        
        const prevX = centerX + Math.cos(prevAngle) * prevRadius;
        const prevY = centerY + Math.sin(prevAngle) * prevRadius;
        
        ctx.strokeStyle = `hsla(${(hue + 180) % 360}, 100%, 60%, 0.6)`;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
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