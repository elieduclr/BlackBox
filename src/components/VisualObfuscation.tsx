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
    
    // Clear canvas
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Choose generation style based on algorithm
    switch (algorithm) {
      case 'aes':
        generateCipherMatrix(ctx, canvas, text);
        break;
      case 'chacha':
        generateStreamPattern(ctx, canvas, text);
        break;
      case 'kyber':
        generateQuantumPattern(ctx, canvas, text);
        break;
      case 'custom':
        generateHybridPattern(ctx, canvas, text);
        break;
    }
    
    // Add noise overlay
    addNoiseOverlay(ctx, canvas);
    
  }, [text, algorithm]);
  
  // AES: Matrix-like pattern with data blocks
  const generateCipherMatrix = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string
  ) => {
    const charSize = 14;
    const cols = Math.floor(canvas.width / charSize);
    const rows = Math.floor(canvas.height / charSize);
    
    ctx.font = '12px "Share Tech Mono"';
    
    // Create data matrix
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const index = (i * cols + j) % text.length;
        const char = text.charAt(index);
        const charCode = text.charCodeAt(index);
        
        // Calculate color based on character value
        const hue = (charCode * 2) % 180; // Cyan spectrum
        const opacity = 0.3 + (charCode % 128) / 255;
        
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
        ctx.fillText(char, j * charSize, i * charSize + 12);
        
        // Add block patterns
        if ((i + j) % 4 === 0) {
          ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
          ctx.strokeRect(j * charSize, i * charSize, charSize * 2, charSize * 2);
        }
      }
    }
    
    // Add flowing data streams
    const streams = Math.floor(canvas.width / 40);
    for (let i = 0; i < streams; i++) {
      const x = i * 40 + Math.random() * 20;
      const speed = 1 + Math.random();
      const length = 50 + Math.random() * 100;
      
      ctx.fillStyle = 'rgba(10, 255, 255, 0.1)';
      ctx.fillRect(x, (Date.now() / 1000 * speed * 50) % canvas.height, 2, length);
    }
  };
  
  // ChaCha: Dynamic stream cipher pattern
  const generateStreamPattern = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string
  ) => {
    const time = Date.now() / 1000;
    
    // Create flowing patterns
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const x = (i / text.length) * canvas.width;
      const amplitude = canvas.height / 4;
      const frequency = 0.02 + (charCode % 10) * 0.001;
      const phase = time + i * 0.1;
      
      // Draw main wave
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${(charCode * 2) % 120 + 90}, 100%, 50%, 0.5)`;
      ctx.lineWidth = 2;
      
      for (let j = 0; j < canvas.height; j += 2) {
        const waveX = x + Math.sin(j * frequency + phase) * amplitude;
        ctx.lineTo(waveX, j);
      }
      ctx.stroke();
      
      // Add particle effects
      const particles = 5;
      for (let p = 0; p < particles; p++) {
        const py = (time * 100 + p * canvas.height / particles) % canvas.height;
        const px = x + Math.sin(py * frequency + phase) * amplitude;
        
        ctx.fillStyle = `hsla(${(charCode * 2) % 120 + 90}, 100%, 50%, 0.8)`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  
  // Kyber: Quantum-inspired lattice pattern
  const generateQuantumPattern = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string
  ) => {
    const time = Date.now() / 1000;
    const points = [];
    
    // Generate quantum state points
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      points.push({
        x: (charCode * 17) % canvas.width,
        y: (charCode * 23) % canvas.height,
        value: charCode
      });
    }
    
    // Draw quantum state connections
    ctx.lineWidth = 1;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      
      // Connect to nearby points
      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const alpha = (1 - distance / 150) * 0.5;
          const hue = ((p1.value + p2.value) / 2) % 60 + 270; // Purple spectrum
          
          ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      
      // Add quantum superposition effect
      const superpositions = 3;
      for (let s = 0; s < superpositions; s++) {
        const angle = time * 2 + (s * Math.PI * 2) / superpositions;
        const radius = 10 + Math.sin(time * 3 + i) * 5;
        
        const sx = p1.x + Math.cos(angle) * radius;
        const sy = p1.y + Math.sin(angle) * radius;
        
        ctx.fillStyle = `hsla(${p1.value % 60 + 270}, 100%, 50%, 0.3)`;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  
  // Custom: Hybrid encryption visualization
  const generateHybridPattern = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    text: string
  ) => {
    const time = Date.now() / 1000;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Generate multiple encryption layers
    const layers = 5;
    for (let layer = 0; layer < layers; layer++) {
      const radius = Math.min(canvas.width, canvas.height) * (0.2 + layer * 0.1);
      const points = 8 + layer * 4;
      const rotation = time * (layer % 2 ? 0.2 : -0.2);
      
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${(layer * 60 + time * 30) % 360}, 80%, 50%, 0.3)`;
      
      for (let i = 0; i < points; i++) {
        const angle = rotation + (i * Math.PI * 2) / points;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        // Add data points
        if (i < text.length) {
          const charCode = text.charCodeAt(i);
          const pointRadius = 3 + (charCode % 5);
          
          ctx.fillStyle = `hsla(${charCode % 360}, 80%, 50%, 0.8)`;
          ctx.beginPath();
          ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.closePath();
      ctx.stroke();
      
      // Add connecting beams
      if (layer < layers - 1) {
        const beams = 3;
        for (let b = 0; b < beams; b++) {
          const angle = rotation * 2 + (b * Math.PI * 2) / beams;
          const innerX = centerX + Math.cos(angle) * radius;
          const innerY = centerY + Math.sin(angle) * radius;
          const outerX = centerX + Math.cos(angle) * (radius + 50);
          const outerY = centerY + Math.sin(angle) * (radius + 50);
          
          const gradient = ctx.createLinearGradient(innerX, innerY, outerX, outerY);
          gradient.addColorStop(0, `hsla(${(layer * 60) % 360}, 80%, 50%, 0.8)`);
          gradient.addColorStop(1, `hsla(${((layer + 1) * 60) % 360}, 80%, 50%, 0.8)`);
          
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(innerX, innerY);
          ctx.lineTo(outerX, outerY);
          ctx.stroke();
        }
      }
    }
  };
  
  // Add noise and scanline effects
  const addNoiseOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    // Add subtle noise
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 15;
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
    
    // Add CRT-like glow
    const time = Date.now() / 1000;
    const glow = Math.sin(time) * 0.1 + 0.9;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.02 * glow})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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