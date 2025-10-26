"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CPUCoolingSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [temp, setTemp] = useState(80);
  const [params, setParams] = useState({ T0: 80, Tambient: 25, k: 0.15 });
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Image refs
  const cpuImageRef = useRef<HTMLImageElement | null>(null);
  const heatsinkImageRef = useRef<HTMLImageElement | null>(null);
  const fancoolerImageRef = useRef<HTMLImageElement | null>(null);
  const liquidImageRef = useRef<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const { T0, Tambient, k } = params;
  
  const calculateTemp = (t: number): number => {
    return Tambient + (T0 - Tambient) * Math.exp(-k * t);
  };
  
  // Load images
  useEffect(() => {
    const loadImages = () => {
      const cpuImg = new Image();
      const heatsinkImg = new Image();
      const fancoolerImg = new Image();
      const liquidImg = new Image();
      
      let loadedCount = 0;
      const totalImages = 4;
      
      const onLoad = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      
      cpuImg.onload = onLoad;
      heatsinkImg.onload = onLoad;
      fancoolerImg.onload = onLoad;
      liquidImg.onload = onLoad;
      
      cpuImg.src = 'asset/CPU.png';
      heatsinkImg.src = 'asset/heatsink_.png';
      fancoolerImg.src = 'asset/fanCooler.png';
      liquidImg.src = 'asset/Liquid.png';
      
      cpuImageRef.current = cpuImg;
      heatsinkImageRef.current = heatsinkImg;
      fancoolerImageRef.current = fancoolerImg;
      liquidImageRef.current = liquidImg;
    };
    
    loadImages();
  }, []);
  
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#050814');
    bgGrad.addColorStop(1, '#0f1729');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    
    // Main 3D system
    drawMainSystem(ctx, width, height);
    
    // Graph
    drawTemperatureGraph(ctx, width, height);
    
  }, [temp, time, isRunning, params, imagesLoaded]);
  
  const drawMainSystem = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = 400;
    
    // ============ AMBIENT AIR (TOP) ============
    drawAmbientAir(ctx, centerX, 50);
    
    // ============ FAN ============
    const fanY = centerY - 130;
    drawFan(ctx, centerX, fanY);
    
    // Airflow arrows
    if (isRunning) {
      const offset = (time * 50) % 60;
      for (let i = 0; i < 4; i++) {
        const ay = fanY + 70 - i * 60 + offset;
        if (ay > 20 && ay < fanY + 40) {
          drawAirflowArrow(ctx, centerX + 100, ay - 40, centerX + 100, ay);
        }
      }
      for (let i = 0; i < 4; i++) {
        const ay = fanY + 90 - i * 60 - offset;
        if (ay > 20 && ay < fanY + 20) {
          drawHotAirArrow(ctx, centerX - 100, ay + 40, centerX - 100, ay);
        }
      }
    }
    
    // ============ HEATSINK ============
    const hsY = centerY - 40;
    drawHeatsink(ctx, centerX, hsY);
    
    // Heat transfer arrows from CPU to heatsink
    const tempRatio = (temp - Tambient) / (T0 - Tambient);
    if (tempRatio > 0.05) {
      const heatOffset = (time * 25) % 30;
      for (let i = 0; i < 4; i++) {
        const hy = centerY + 50 - i * 35 + heatOffset;
        if (hy > hsY + 60 && hy < centerY + 50) {
          ctx.strokeStyle = `rgba(251, 146, 60, ${0.3 + tempRatio * 0.6})`;
          ctx.fillStyle = `rgba(251, 146, 60, ${0.3 + tempRatio * 0.6})`;
          ctx.lineWidth = 5;
          drawUpArrow(ctx, centerX - 40, hy + 25, centerX - 40, hy);
          drawUpArrow(ctx, centerX + 40, hy + 25, centerX + 40, hy);
        }
      }
    }
    
    // Heat dissipation from heatsink sides
    if (tempRatio > 0.05) {
      const dissOffset = (time * 20) % 40;
      for (let i = 0; i < 3; i++) {
        const dx = 80 + i * 45 + dissOffset;
        if (dx > 80 && dx < 180) {
          ctx.strokeStyle = `rgba(234, 179, 8, ${0.3 + tempRatio * 0.5})`;
          ctx.fillStyle = `rgba(234, 179, 8, ${0.3 + tempRatio * 0.5})`;
          ctx.lineWidth = 4;
          drawLeftArrow(ctx, centerX - dx + 40, hsY + 80, centerX - dx, hsY + 80);
          drawLeftArrow(ctx, centerX - dx + 40, hsY + 110, centerX - dx, hsY + 110);
          drawRightArrow(ctx, centerX + dx - 40, hsY + 80, centerX + dx, hsY + 80);
          drawRightArrow(ctx, centerX + dx - 40, hsY + 110, centerX + dx, hsY + 110);
        }
      }
    }
    
    // ============ CPU CHIP ============
    drawCPU(ctx, centerX, centerY);
    
    // Heat generation from CPU
    if (tempRatio > 0.1) {
      const genOffset = (time * 30) % 35;
      ctx.strokeStyle = `rgba(239, 68, 68, ${tempRatio * 0.7})`;
      ctx.lineWidth = 5;
      
      for (let i = 0; i < 5; i++) {
        const gy = centerY + 170 + i * 40 - genOffset;
        if (gy < centerY + 200) {
          ctx.beginPath();
          ctx.moveTo(centerX - 60, gy);
          ctx.quadraticCurveTo(centerX, gy - 15, centerX + 60, gy);
          ctx.stroke();
        }
      }
    }
    
    // ============ LABELS ============
    
    // Fan label - TOP CENTER
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#3b82f6';
    ctx.fillText('FAN (KIPAS)', centerX, fanY - 120);
    ctx.shadowBlur = 0;
    
    // Cold air label - TOP RIGHT
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#60a5fa';
    ctx.fillText('Udara Dingin', centerX + 200, fanY - 80);
    ctx.fillText('Masuk ↓', centerX + 200, fanY - 50);
    ctx.shadowBlur = 0;
    
    // Hot air label - TOP LEFT
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'right';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';
    ctx.fillText('Udara Panas', centerX - 200, fanY - 80);
    ctx.fillText('Keluar ↑', centerX - 200, fanY - 50);
    ctx.shadowBlur = 0;
    
    let systemName = "Heatsink Pasif";
    
    if (k <= 0.1) {
      // Passive heatsink only
      systemName = "Heatsink Pasif";
    } else if (k <= 0.2) {
      // Fan cooler
      systemName = "Fan Cooler";
    } else {
      // Liquid cooling
      systemName = "Liquid Cooling";
    }
    
    // Heat dissipation labels - FAR LEFT & RIGHT
    if (tempRatio > 0.05) {
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 20px sans-serif';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#eab308';
      
      ctx.textAlign = 'right';
      ctx.fillText('Penyebaran', centerX - 260, hsY + 85);
      ctx.fillText('Panas →', centerX - 260, hsY + 115);
      
      ctx.textAlign = 'left';
      ctx.fillText('Penyebaran', centerX + 260, hsY + 85);
      ctx.fillText('← Panas', centerX + 260, hsY + 115);
      ctx.shadowBlur = 0;
    }
    
    // Conduction label - RIGHT
    if (tempRatio > 0.05) {
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fb923c';
      ctx.fillText('Konduksi', centerX + 150, centerY + 130);
      ctx.fillText('Panas ↑', centerX + 150, centerY + 160);
      ctx.shadowBlur = 0;
    }
    
    // CPU heat generation label - BOTTOM CENTER
    if (tempRatio > 0.1) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 22px sans-serif';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ef4444';
      ctx.fillText('CPU Menghasilkan', centerX + 100, centerY + 270);
      ctx.fillText('Panas', centerX + 100, centerY + 300);
      ctx.shadowBlur = 0;
    }
    
    // Temperature display on CPU
    const hue = 120 - tempRatio * 120;
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
    ctx.font = 'bold 38px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 25;
    ctx.shadowColor = `hsl(${hue}, 80%, 50%)`;
    ctx.fillText(`${temp.toFixed(1)}°C`, centerX + 170, centerY + 230);
    ctx.shadowBlur = 0;
    
    // Formula display at bottom
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#3b82f6';
    ctx.fillText('T(t) = T_ambient + (T₀ - T_ambient) × e^(-kt)', centerX, centerY + 370);
    ctx.shadowBlur = 0;
    
    // Process flow indicators - FAR RIGHT
    drawProcessFlow(ctx, centerX, centerY);
  };
  
  const drawProcessFlow = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    const steps = [
      { num: '1', label: 'Panas\nDihasilkan', x: cx - 520, y: cy + 330, color: '#ef4444' },
      { num: '2', label: 'Konduksi\nke Heatsink', x: cx - 520, y: cy + 200, color: '#f97316' },
      { num: '3', label: 'Penyebaran\nPanas', x: cx - 520, y: cy + 60, color: '#eab308' },
      { num: '4', label: 'Konveksi\nPaksa', x: cx - 520, y: cy - 80, color: '#3b82f6' },
      { num: '5', label: 'Pendinginan\nOptimal', x: cx - 520, y: cy - 220, color: '#22c55e' }
    ];
    
    steps.forEach((step, i) => {
      // Circle background
      ctx.fillStyle = step.color + '33';
      ctx.beginPath();
      ctx.arc(step.x, step.y, 35, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = step.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Number
      ctx.fillStyle = step.color;
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(step.num, step.x, step.y + 10);
      
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      const lines = step.label.split('\n');
      lines.forEach((line, li) => {
        ctx.fillText(line, step.x, step.y + 55 + li * 18);
      });
      
      // Connecting arrow
      if (i < steps.length - 1) {
        ctx.strokeStyle = '#475569';
        ctx.fillStyle = '#475569';
        ctx.lineWidth = 2;
        drawUpArrow(ctx, step.x, step.y - 38, step.x, steps[i + 1].y + 38);
      }
    });
  };
  
  const drawAmbientAir = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = 'rgba(96, 165, 250, 0.15)';
    ctx.fillRect(50, y, 1100, 60);
    
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(50, y, 1100, 60);
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#3b82f6';
    ctx.fillText(`UDARA SEKITAR (T_ambient = ${Tambient}°C)`, x, y + 38);
    ctx.shadowBlur = 0;
  };
  
  const drawFan = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const radius = 70;
    
    // Fan glow
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#3b82f6';
    
    // Fan housing
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    
    // Rotating blades
    const rotation = isRunning ? (time * 7) : 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    for (let i = 0; i < 4; i++) {
      const bladeGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 55);
      bladeGrad.addColorStop(0, '#60a5fa');
      bladeGrad.addColorStop(0.7, '#3b82f6');
      bladeGrad.addColorStop(1, '#1e3a8a');
      
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.ellipse(32, 0, 35, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.rotate(Math.PI / 2);
    }
    ctx.restore();
    
    // Center hub with 3D effect
    const hubGrad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, 18);
    hubGrad.addColorStop(0, '#dbeafe');
    hubGrad.addColorStop(0.5, '#60a5fa');
    hubGrad.addColorStop(1, '#1e40af');
    
    ctx.fillStyle = hubGrad;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const drawHeatsink = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const width = 240;
    const height = 240;
    
    // Determine cooling system based on k value
    let coolingImage = heatsinkImageRef.current;
    let systemName = "Heatsink Pasif";
    
    if (k <= 0.1) {
      // Passive heatsink only
      coolingImage = heatsinkImageRef.current;
      systemName = "Heatsink Pasif";
    } else if (k <= 0.2) {
      // Fan cooler
      coolingImage = fancoolerImageRef.current;
      systemName = "Fan Cooler";
    } else {
      // Liquid cooling
      coolingImage = liquidImageRef.current;
      systemName = "Liquid Cooling";
    }
    
    if (coolingImage && coolingImage.complete) {
      // Draw cooling system image
      const imgWidth = width + 40;
      const imgHeight = height + 40;
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(100, 150, 200, 0.5)';
      ctx.drawImage(coolingImage, x - imgWidth / 2, y - 20, imgWidth, imgHeight);
      ctx.restore();
    }
  };
  
  const drawCPU = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const cpuYOffset = 160;
    const cy = y + cpuYOffset;
    const size = 120;
    const tempRatio = (temp - Tambient) / (T0 - Tambient);
    
    if (cpuImageRef.current && cpuImageRef.current.complete) {
      ctx.save();
      
      // Apply red tint based on temperature
      const hue = 120 - tempRatio * 120;
      ctx.shadowBlur = 25;
      ctx.shadowColor = `hsl(${hue}, 75%, 45%)`;
      
      // Draw CPU image
      ctx.drawImage(cpuImageRef.current, x - size / 2, cy - size / 2 + 100, size, size);
      
      // Apply red overlay for heat effect
      if (tempRatio > 0.3) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${tempRatio * 0.4})`;
        ctx.fillRect(x - size / 2, cy - size / 2 + 100, size, size);
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      // Fallback to original drawing if image not loaded
      const hue = 120 - tempRatio * 120;
      const cpuGrad = ctx.createLinearGradient(x - size / 2, cy - size / 2, x + size / 2, cy + size / 2);
      cpuGrad.addColorStop(0, `hsl(${hue}, 75%, 60%)`);
      cpuGrad.addColorStop(0.5, `hsl(${hue}, 75%, 50%)`);
      cpuGrad.addColorStop(1, `hsl(${hue}, 75%, 35%)`);
      
      ctx.shadowBlur = 25;
      ctx.shadowColor = `hsl(${hue}, 75%, 45%)`;
      ctx.fillStyle = cpuGrad;
      ctx.fillRect(x - size / 2, cy - size / 2, size, size);
      ctx.shadowBlur = 0;
      
      // Grid pattern
      ctx.strokeStyle = `hsl(${hue}, 60%, 25%)`;
      ctx.lineWidth = 2;
      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x - size / 2 + (size / 5) * i, cy - size / 2);
        ctx.lineTo(x - size / 2 + (size / 5) * i, cy + size / 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x - size / 2, cy - size / 2 + (size / 5) * i);
        ctx.lineTo(x + size / 2, cy - size / 2 + (size / 5) * i);
        ctx.stroke();
      }
      
      // CPU border with 3D effect
      ctx.strokeStyle = `hsl(${hue}, 60%, 20%)`;
      ctx.lineWidth = 5;
      ctx.strokeRect(x - size / 2, cy - size / 2, size, size);
      
      // Highlight edge
      ctx.strokeStyle = `hsl(${hue}, 60%, 70%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - size / 2, cy - size / 2);
      ctx.lineTo(x + size / 2, cy - size / 2);
      ctx.lineTo(x + size / 2, cy + size / 2);
      ctx.stroke();
    }
  };
  
  const drawTemperatureGraph = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const graphX = 50;
    const graphY = height - 280;
    const graphWidth = width - 100;
    const graphHeight = 200;
    
    // Graph background with gradient
    const graphBg = ctx.createLinearGradient(graphX, graphY, graphX, graphY + graphHeight);
    graphBg.addColorStop(0, '#1e293b');
    graphBg.addColorStop(1, '#0f172a');
    ctx.fillStyle = graphBg;
    ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
    
    // Border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);
    
    // Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      // Horizontal
      const gy = graphY + (graphHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(graphX, gy);
      ctx.lineTo(graphX + graphWidth, gy);
      ctx.stroke();
      
      // Vertical
      const gx = graphX + (graphWidth / 5) * i;
      ctx.beginPath();
      ctx.moveTo(gx, graphY);
      ctx.lineTo(gx, graphY + graphHeight);
      ctx.stroke();
    }
    
    // Y-axis labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const tempVal = T0 - (T0 - Tambient) * (i / 4);
      const gy = graphY + (graphHeight / 4) * i;
      ctx.fillText(`${tempVal.toFixed(0)}°C`, graphX - 15, gy + 5);
    }
    
    // X-axis labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const timeVal = (time / 5) * i;
      const gx = graphX + (graphWidth / 5) * i;
      ctx.fillText(`${timeVal.toFixed(1)}s`, gx, graphY + graphHeight + 25);
    }
    
    // Plot temperature curve
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#22c55e';
    ctx.beginPath();
    
    let firstPoint = true;
    for (let i = 0; i <= time * 20; i++) {
      const t = i / 20;
      const tempVal = calculateTemp(t);
      const gx = graphX + (t / (time > 0 ? time : 1)) * graphWidth;
      const gy = graphY + graphHeight - ((tempVal - Tambient) / (T0 - Tambient)) * graphHeight;
      
      if (firstPoint) {
        ctx.moveTo(gx, gy);
        firstPoint = false;
      } else {
        ctx.lineTo(gx, gy);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Current point indicator
    if (time > 0) {
      const currentX = graphX + graphWidth;
      const currentY = graphY + graphHeight - ((temp - Tambient) / (T0 - Tambient)) * graphHeight;
      
      ctx.fillStyle = '#22c55e';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#22c55e';
      ctx.beginPath();
      ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#3b82f6';
    ctx.fillText('GRAFIK PENDINGINAN CPU', graphX + graphWidth / 2, graphY - 20);
    ctx.shadowBlur = 0;
  };
  
  const drawAirflowArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    ctx.strokeStyle = '#60a5fa';
    ctx.fillStyle = '#60a5fa';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#3b82f6';
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Arrow head untuk panah ke BAWAH (di ujung y2)
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8, y2 - 12);
    ctx.lineTo(x2 + 8, y2 - 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  };
  
  const drawHotAirArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#dc2626';
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Arrow head untuk panah ke ATAS (di ujung y2)
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8, y2 + 12);
    ctx.lineTo(x2 + 8, y2 + 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  };
  
  const drawUpArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Arrow head di ujung atas (y2)
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 7, y2 + 12);
    ctx.lineTo(x2 + 7, y2 + 12);
    ctx.closePath();
    ctx.fill();
  };
  
  const drawLeftArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Arrow head di ujung kiri (x2)
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + 12, y2 - 7);
    ctx.lineTo(x2 + 12, y2 + 7);
    ctx.closePath();
    ctx.fill();
  };
  
  const drawRightArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Arrow head di ujung kanan (x2)
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 12, y2 - 7);
    ctx.lineTo(x2 - 12, y2 + 7);
    ctx.closePath();
    ctx.fill();
  };
  
  useEffect(() => {
    if (isRunning) {
      animationRef.current = setInterval(() => {
        setTime(t => {
          const newTime = t + 0.1;
          setTemp(calculateTemp(newTime));
          return newTime;
        });
      }, 100);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isRunning, params]);
  
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setTemp(T0);
  };
  
  const handleParamChange = (param: keyof typeof params, value: number) => {
    let validatedValue = value;
    
    switch (param) {
      case 'T0':
        validatedValue = Math.max(50, Math.min(100, value));
        break;
      case 'Tambient':
        validatedValue = Math.max(15, Math.min(35, value));
        break;
      case 'k':
        validatedValue = Math.max(0.05, Math.min(0.3, value));
        break;
    }
    
    setParams(prev => ({ ...prev, [param]: validatedValue }));
    
    if (!isRunning) {
      setTemp(calculateTemp(time));
    }
  };
  
  return (
    <div className="w-full min-h-screen md:h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <button 
        onClick={() => {
          const infoBox = document.querySelector('.informationBox') as HTMLElement;
          if (infoBox) {
            infoBox.style.display = 'flex';
          }
        }}
        className="fixed bottom-5 left-5 bg-black w-10 h-10 z-40 rounded-full border-gray-700 border-[0.5] text-sm text-gray-400 flex items-center justify-center hover:bg-gray-900 duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#f44336" d="M15.787 13.71c-.275 0-.587 0-.918.047c1.098.796 1.865 1.847 1.865 3.267v2.367h5.68v-2.367c0-2.206-4.42-3.314-6.627-3.314m-7.575 0c-2.206 0-6.628 1.108-6.628 3.314v2.367H14.84v-2.367c0-2.206-4.421-3.314-6.628-3.314m0-1.894a2.84 2.84 0 0 0 2.841-2.84a2.84 2.84 0 0 0-2.84-2.84a2.84 2.84 0 0 0-2.841 2.84a2.84 2.84 0 0 0 2.84 2.84m7.575 0a2.84 2.84 0 0 0 2.84-2.84a2.84 2.84 0 0 0-2.84-2.84a2.84 2.84 0 0 0-2.84 2.84a2.84 2.84 0 0 0 2.84 2.84"/>
        </svg>
      </button>
      
      <div className="informationBox w-screen h-screen fixed top-0 left-0 bg-black/50 backdrop-blur z-40 flex flex-col items-center justify-center p-4 text-white text-center" style={{ display: 'none' }}>
        <div className="textBox bg-black p-6 w-full max-w-lg border border-yellow-600 rounded-lg flex flex-col items-center justify-center shadow-2xl">
          <h2 className="text-xl md:text-3xl font-bold mb-4">Selamat Datang di Simulasi Sistem Pendinginan CPU</h2>
          <p className="text-sm md:text-md mb-6 max-w-3xl">
            Simulasi ini dirancang untuk memenuhi tugas <b>Fisika Dasar - Sistem Pendinginan CPU/Server</b> dengan memvisualisasikan Hukum Pendinginan Newton melalui sistem pendinginan CPU.
          </p>
          <p className="text-lg pb-2 font-bold">Anggota Kelompok</p>
          <ul className="list-disc list-inside mb-6 text-left w-fit pb-8">
            <li>Handika Putra Nur Ilhami (25051130026)</li>
            <li>Randi Dwi Nur Cahyo (25051130008)</li>
            <li>Rachela Mecka Fauzi (25051130010)</li>
            <li>Lina Faridhatul Khakimah (25051130004)</li>
          </ul>
          <button 
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-yellow-500/50"
            onClick={() => {
              const infoBox = document.querySelector('.informationBox') as HTMLElement;
              if (infoBox) {
                infoBox.style.display = 'none';
              }
            }}
          >
            Mulai Simulasi
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto md:h-screen flex flex-col">
        <div className="text-center mb-4 md:mb-8 flex-0">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            SIMULASI SISTEM PENDINGINAN CPU
          </h1>
          <p className="text-slate-300 text-sm md:text-xl"> Newton's Law of Cooling - Visualisasi Interaktif </p>
        </div>
        
        <div className="flex md:flex-row flex-col flex-1 justify-between overflow-hidden md:max-h-full gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur rounded-xl md:rounded-3xl p-4 md:p-8 mb-4 md:mb-8 shadow-2xl border border-slate-700/50">
            <canvas 
              ref={canvasRef} 
              width={1200} 
              height={1200} 
              className="w-full h-full rounded-lg md:rounded-2xl shadow-2xl" 
            />
          </div>
          
          {/* <div className="flex md:flex-row flex-col gap-4 md:gap-6">
          <div className="md:w-[60%] w-full">
            <div className={`rounded-xl md:rounded-3xl p-2 ${isLightMode ? 'bg-white/70 border border-blue-200' : ' bg-black backdrop-blur border border-slate-700/50'}`}>
              <div className="relative pb-[100%] w-full">
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={1200}
                  className="absolute inset-0 w-full h-full rounded-lg md:rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div> */}

          <div className="md:h-full md:overflow-y-auto pb-4 md:pb-8">
            <div className="flex-col gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-slate-700/50">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Play size={16} className="md:hidden text-white" />
                    <Play size={20} className="hidden md:block text-white" />
                  </div>
                  Kontrol Simulasi
                </h3>
                
                <div className="flex gap-3 md:gap-4 mb-6 md:mb-8">
                  <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className="flex-1 flex items-center justify-center gap-2 md:gap-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-xl transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
                  >
                    {isRunning ? <Pause size={20} className="md:hidden" /> : <Play size={20} className="md:hidden" />}
                    {isRunning ? <Pause size={24} className="hidden md:block" /> : <Play size={24} className="hidden md:block" />}
                    {isRunning ? 'Jeda' : 'Mulai'}
                  </button>
                  <button 
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-xl transition-all shadow-xl hover:scale-105"
                  >
                    <RotateCcw size={20} className="md:hidden" />
                    <RotateCcw size={24} className="hidden md:block" />
                  </button>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-purple-600/20 backdrop-blur rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-500/30 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 text-sm md:text-xl font-semibold">Waktu Simulasi</span>
                      <span className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {time.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-500/20 via-green-600/20 to-teal-600/20 backdrop-blur rounded-xl md:rounded-2xl p-4 md:p-6 border border-emerald-500/30 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 text-sm md:text-xl font-semibold">Suhu CPU Saat Ini</span>
                      <span className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        {temp.toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-600/20 backdrop-blur rounded-xl md:rounded-2xl p-4 md:p-6 border border-cyan-500/30 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 text-sm md:text-xl font-semibold">Suhu Ambient</span>
                      <span className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {Tambient}°C
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br mt-4 md:mt-6 from-slate-800/80 to-slate-900/80 backdrop-blur rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border border-slate-700/50">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Parameter Simulasi</h3>
                
                <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                  <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur rounded-xl md:rounded-2xl p-4 md:p-6 border border-red-500/30 shadow-xl">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-slate-300 text-sm md:text-base font-semibold">Suhu Awal CPU</p>
                        <p className="text-lg md:text-2xl font-bold text-red-400">T₀</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl md:text-3xl font-bold text-red-300">{T0}°C</p>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      step="1" 
                      value={T0} 
                      onChange={(e) => handleParamChange('T0', Number(e.target.value))} 
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-red" 
                    />
                    <div className="flex justify-between text-xs md:text-sm text-slate-400 mt-2">
                      <span>50°C</span>
                      <span>100°C</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-500/30 shadow-xl">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-slate-300 text-sm md:text-base font-semibold">Suhu Ambient</p>
                        <p className="text-lg md:text-2xl font-bold text-blue-400">T_amb</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl md:text-3xl font-bold text-blue-300">{Tambient}°C</p>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="15" 
                      max="35" 
                      step="1" 
                      value={Tambient} 
                      onChange={(e) => handleParamChange('Tambient', Number(e.target.value))} 
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue" 
                    />
                    <div className="flex justify-between text-xs md:text-sm text-slate-400 mt-2">
                      <span>15°C</span>
                      <span>35°C</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur rounded-xl md:rounded-2xl p-4 md:p-6 border border-emerald-500/30 shadow-xl">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-slate-300 text-sm md:text-base font-semibold">Konstanta Pendinginan</p>
                        <p className="text-lg md:text-2xl font-bold text-emerald-400">k</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl md:text-3xl font-bold text-emerald-300">{k}</p>
                        <p className="text-xs md:text-sm text-slate-400 mt-1">
                          {k <= 0.1 ? "Heatsink Pasif" : k <= 0.2 ? "Fan Cooler" : "Liquid Cooling"}
                        </p>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0.05" 
                      max="0.3" 
                      step="0.01" 
                      value={k} 
                      onChange={(e) => handleParamChange('k', Number(e.target.value))} 
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-green" 
                    />
                    <div className="flex justify-between text-xs md:text-sm text-slate-400 mt-2">
                      <span>0.05<br/>(Pasif)</span>
                      <span>0.15<br/>(Fan)</span>
                      <span>0.3<br/>(Liquid)</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 backdrop-blur rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-500/30 shadow-xl">
                  <h4 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-3xl">📐</span> Newton's Law of Cooling
                  </h4>
                  
                  <div className="bg-slate-950/70 backdrop-blur rounded-lg md:rounded-xl p-4 md:p-6 mb-4 md:mb-6 border border-purple-500/20">
                    <p className="text-xl md:text-3xl text-center font-mono font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      T(t) = T<sub className="text-sm md:text-xl">amb</sub> + (T₀ - T<sub className="text-sm md:text-xl">amb</sub>) × e<sup className="text-sm md:text-xl">-kt</sup>
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-slate-300">
                    <div className="hidden md:block">
                      <div className="overflow-x-auto rounded-lg border border-slate-700/40">
                        <table className="min-w-full text-sm md:text-base divide-y divide-slate-700">
                          <thead className="bg-slate-900/60">
                            <tr>
                              <th className="px-4 py-3 text-left text-slate-200 font-medium">Simbol</th>
                              <th className="px-4 py-3 text-left text-slate-200 font-medium">Keterangan</th>
                              <th className="px-4 py-3 text-left text-slate-400 text-sm">Nilai</th>
                            </tr>
                          </thead>
                          <tbody className="bg-slate-950">
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-emerald-400 text-lg">T(t)</td>
                              <td className="px-4 py-3">Suhu CPU pada waktu t (detik)</td>
                              <td className="px-4 py-3 text-slate-400">{temp.toFixed(1)}°C</td>
                            </tr>
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-cyan-400 text-lg">T_amb</td>
                              <td className="px-4 py-3">Suhu udara sekitar</td>
                              <td className="px-4 py-3 text-slate-400">{Tambient}°C</td>
                            </tr>
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-red-400 text-lg">T₀</td>
                              <td className="px-4 py-3">Suhu awal CPU</td>
                              <td className="px-4 py-3 text-slate-400">{T0}°C</td>
                            </tr>
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-yellow-400 text-lg">k</td>
                              <td className="px-4 py-3">Konstanta pendinginan</td>
                              <td className="px-4 py-3 text-slate-400">{k}</td>
                            </tr>
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-purple-400 text-lg">t</td>
                              <td className="px-4 py-3">Waktu (detik)</td>
                              <td className="px-4 py-3 text-slate-400">{time.toFixed(1)}s</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="md:hidden grid grid-cols-1 gap-3">
                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-emerald-400">T(t)</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">Suhu CPU pada waktu t</div>
                          <div className="text-xs text-slate-400">{temp.toFixed(1)}°C</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-cyan-400">T_amb</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">Suhu udara sekitar</div>
                          <div className="text-xs text-slate-400">{Tambient}°C</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-red-400">T₀</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">Suhu awal CPU</div>
                          <div className="text-xs text-slate-400">{T0}°C</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-yellow-400">k</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">Konstanta pendinginan</div>
                          <div className="text-xs text-slate-400">{k}</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-purple-400">t</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">Waktu</div>
                          <div className="text-xs text-slate-400">{time.toFixed(1)}s</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .slider-red::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }
        
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        .slider-green::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        
        .slider-red::-moz-range-thumb,
        .slider-blue::-moz-range-thumb,
        .slider-green::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 10px currentColor;
        }
      `}</style>
    </div>
  );
};

export default CPUCoolingSimulation;
