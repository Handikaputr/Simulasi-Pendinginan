"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CPUCoolingSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [temp, setTemp] = useState(80);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const T0 = 80;
  const Tambient = 25;
  const k = 0.15;

  const calculateTemp = (t: number): number => {
    return Tambient + (T0 - Tambient) * Math.exp(-k * t);
  };
  useEffect(() => {
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

  }, [temp, time, isRunning]);

  const drawMainSystem = (ctx, width, height) => {
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
        const ay = fanY - 90 - i * 60 + offset;
        if (ay > 20 && ay < fanY - 90) {
          drawAirflowArrow(ctx, centerX - 50, ay, centerX - 50, ay - 40);
          drawAirflowArrow(ctx, centerX + 50, ay, centerX + 50, ay - 40);
        }
      }

      // Hot air out arrows
      const hotOffset = (time * 50) % 60;
      for (let i = 0; i < 3; i++) {
        const ay = fanY + 90 + i * 60 - hotOffset;
        if (ay > fanY + 90 && ay < centerY - 180) {
          drawHotAirArrow(ctx, centerX, ay, centerX, ay + 40);
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
          drawUpArrow(ctx, centerX - 40, hy, centerX - 40, hy - 25);
          drawUpArrow(ctx, centerX + 40, hy, centerX + 40, hy - 25);
        }
      }
    }

    // Heat dissipation from heatsink sides
    if (tempRatio > 0.05) {
      const dissOffset = (time * 20) % 40;
      for (let i = 0; i < 3; i++) {
        const dx = 80 + i * 45 - dissOffset;
        if (dx > 80 && dx < 180) {
          ctx.strokeStyle = `rgba(234, 179, 8, ${0.3 + tempRatio * 0.5})`;
          ctx.fillStyle = `rgba(234, 179, 8, ${0.3 + tempRatio * 0.5})`;
          ctx.lineWidth = 4;
          drawLeftArrow(ctx, centerX - dx, hsY + 30, centerX - dx - 40, hsY + 30);
          drawLeftArrow(ctx, centerX - dx, hsY + 60, centerX - dx - 40, hsY + 60);

          drawRightArrow(ctx, centerX + dx, hsY + 30, centerX + dx + 40, hsY + 30);
          drawRightArrow(ctx, centerX + dx, hsY + 60, centerX + dx + 40, hsY + 60);
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
        const gy = centerY + 10 + i * 40 - genOffset;
        if (gy < centerY + 100) {
          ctx.beginPath();
          ctx.moveTo(centerX - 60, gy);
          ctx.quadraticCurveTo(centerX, gy - 15, centerX + 60, gy);
          ctx.stroke();
        }
      }
    }

    // ============ LABELS - SEMUA TIDAK TABRAKAN ============

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

    // Heatsink label - LEFT
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'right';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#cbd5e1';
    ctx.fillText('HEATSINK', centerX - 240, hsY + 150);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX - 240, hsY + 145);
    ctx.lineTo(centerX - 180, hsY + 110);
    ctx.stroke();
    drawRightArrow(ctx, centerX - 180, hsY + 110, centerX - 170, hsY + 105);

    // Heat dissipation labels - FAR LEFT & RIGHT
    if (tempRatio > 0.05) {
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 20px sans-serif';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#eab308';

      ctx.textAlign = 'right';
      ctx.fillText('Penyebaran', centerX - 300, hsY + 35);
      ctx.fillText('← Panas', centerX - 300, hsY + 65);

      ctx.textAlign = 'left';
      ctx.fillText('Penyebaran', centerX + 360, hsY + 35);
      ctx.fillText('Panas →', centerX + 360, hsY + 65);
      ctx.shadowBlur = 0;
    }

    // Conduction label - RIGHT
    if (tempRatio > 0.05) {
      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fb923c';
      ctx.fillText('Konduksi', centerX + 180, centerY - 30);
      ctx.fillText('Panas ↑', centerX + 180, centerY);
      ctx.shadowBlur = 0;
    }

   

    // CPU heat generation label - BOTTOM CENTER
    if (tempRatio > 0.1) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ef4444';
      ctx.fillText('CPU Menghasilkan', centerX, centerY + 270);
      ctx.fillText('Panas', centerX, centerY + 300);
      ctx.shadowBlur = 0;
    }

    // Temperature display on CPU
    const hue = 120 - tempRatio * 120;
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
    ctx.font = 'bold 38px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 25;
    ctx.shadowColor = `hsl(${hue}, 80%, 50%)`;
    ctx.fillText(`${temp.toFixed(1)}°C`, centerX + 170, centerY + 170);
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

  const drawProcessFlow = (ctx, cx, cy) => {
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

  const drawAmbientAir = (ctx, x, y) => {
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
    ctx.fillText('UDARA SEKITAR (T_ambient = 25°C)', x, y + 38);
    ctx.shadowBlur = 0;
  };

  const drawFan = (ctx, x, y) => {
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

  const drawHeatsink = (ctx, x, y) => {
    const width = 240;
    const height = 90;
    const finCount = 16;

    // Heatsink fins with 3D effect
    for (let i = 0; i < finCount; i++) {
      const finX = x - width / 2 + (width / finCount) * i;

      const finGrad = ctx.createLinearGradient(finX, y, finX + 12, y);
      finGrad.addColorStop(0, '#cbd5e1');
      finGrad.addColorStop(0.3, '#94a3b8');
      finGrad.addColorStop(1, '#64748b');

      ctx.fillStyle = finGrad;
      ctx.fillRect(finX, y, 12, height);

      // Highlight
      ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
      ctx.fillRect(finX + 1, y, 3, height);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(finX + 10, y, 2, height);
    }

    // Heatsink base plate with 3D
    const baseGrad = ctx.createLinearGradient(0, y + height - 12, 0, y + height + 5);
    baseGrad.addColorStop(0, '#475569');
    baseGrad.addColorStop(0.5, '#334155');
    baseGrad.addColorStop(1, '#1e293b');

    ctx.fillStyle = baseGrad;
    ctx.fillRect(x - width / 2 - 10, y + height - 12, width + 20, 17);

    // Base highlight
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.fillRect(x - width / 2 - 10, y + height - 12, width + 20, 3);
  };

  const drawCPU = (ctx, x, y) => {
    // Only modify drawCPU: introduce a local cpuYOffset so the CPU can be moved
    // up/down without touching centerY or other components. Positive moves CPU down.
    const cpuYOffset = 160; // adjust this value to move CPU only (px)
    const cy = y + cpuYOffset;
    const size = 120;
    const tempRatio = (temp - Tambient) / (T0 - Tambient);

    // CPU shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - size / 2 + 8, cy - size / 2 + 8, size, size);

    // CPU body with temperature-based gradient
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

    // CPU pins
    ctx.fillStyle = '#71717a';
    for (let i = 0; i < 10; i++) {
      // Bottom pins
      ctx.fillRect(x - 50 + i * 11, cy + size / 2, 8, 8);
      // Top pins
      ctx.fillRect(x - 50 + i * 11, cy - size / 2 - 8, 8, 8);
      // Left pins
      ctx.fillRect(x - size / 2 - 8, cy - 50 + i * 11, 8, 8);
      // Right pins
      ctx.fillRect(x + size / 2, cy - 50 + i * 11, 8, 8);
    }
  };

  const drawTemperatureGraph = (ctx, width, height) => {
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

  const drawAirflowArrow = (ctx, x1, y1, x2, y2) => {
    ctx.strokeStyle = '#60a5fa';
    ctx.fillStyle = '#60a5fa';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#3b82f6';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8, y2 + 12);
    ctx.lineTo(x2 + 8, y2 + 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawHotAirArrow = (ctx, x1, y1, x2, y2) => {
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#dc2626';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8, y2 - 12);
    ctx.lineTo(x2 + 8, y2 - 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawUpArrow = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 7, y2 + 12);
    ctx.lineTo(x2 + 7, y2 + 12);
    ctx.closePath();
    ctx.fill();
  };

  const drawLeftArrow = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + 12, y2 - 7);
    ctx.lineTo(x2 + 12, y2 + 7);
    ctx.closePath();
    ctx.fill();
  };

  const drawRightArrow = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

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
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setTemp(T0);
  };

  return (
    <div className="w-full min-h-screen md:h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto md:h-screen flex flex-col">
        <div className="text-center mb-8 flex-0">
          <h1 className="text-4xl font-bold mb-3  bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            SIMULASI SISTEM PENDINGINAN CPU
          </h1>
          <p className="text-slate-300 text-xl">
            Newton's Law of Cooling - Visualisasi Interaktif
          </p>
        </div>

        <div className="flex md:flex-row flex-col flex-1 justify-between overflow-hidden md:max-h-full gap-6">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur rounded-3xl p-8 mb-8 shadow-2xl border border-slate-700/50">
            <canvas
              ref={canvasRef}
              width={1200}
              height={1200}
              className="w-full h-full rounded-2xl shadow-2xl"
            />
          </div>

          <div className="md:h-full md:overflow-y-auto pb-8">
            <div className="flex-col gap-6">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur rounded-2xl p-8 shadow-xl border border-slate-700/50">
                <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Play size={26} className="text-white" />
                  </div>
                  Kontrol Simulasi
                </h3>

                <div className="flex gap-4 mb-10">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="flex-1 flex items-center justify-center gap-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white px-8 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
                  >
                    {isRunning ? <Pause size={28} /> : <Play size={28} />}
                    {isRunning ? 'Jeda' : 'Mulai'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl hover:scale-105"
                  >
                    <RotateCcw size={28} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-purple-600/20 backdrop-blur rounded-2xl p-6 border border-blue-500/30 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 text-xl font-semibold">Waktu Simulasi</span>
                      <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {time.toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-500/20 via-green-600/20 to-teal-600/20 backdrop-blur rounded-2xl p-6 border border-emerald-500/30 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 text-xl font-semibold">Suhu CPU Saat Ini</span>
                      <span className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        {temp.toFixed(1)}°C
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-600/20 backdrop-blur rounded-2xl p-6 border border-cyan-500/30 shadow-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 text-xl font-semibold">Suhu Ambient</span>
                      <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {Tambient}°C
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br mt-8  from-slate-800/80 to-slate-900/80 backdrop-blur rounded-2xl p-8 shadow-xl border border-slate-700/50">
                <h3 className="text-3xl font-bold text-white mb-8">Parameter Simulasi</h3>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur rounded-2xl p-6 border border-red-500/30 shadow-xl">
                    <p className="text-slate-300 text-sm whitespace-nowrap mb-3  font-semibold">Suhu Awal</p>
                    <p className="text-4xl font-bold text-red-400">T₀</p>
                    <p className="text-3xl font-bold text-red-300 mt-2">{T0}°C</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur rounded-2xl p-6 border border-blue-500/30 shadow-xl">
                    <p className="text-slate-300 text-sm mb-3 font-semibold">Ambient</p>
                    <p className="text-2xl font-bold text-blue-400">T_amb</p>
                    <p className="text-3xl font-bold text-blue-300 mt-4">{Tambient}°C</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur rounded-2xl p-6 border border-emerald-500/30 shadow-xl">
                    <p className="text-slate-300 text-sm mb-3 font-semibold">Konstanta</p>
                    <p className="text-4xl font-bold text-emerald-400">k</p>
                    <p className="text-3xl font-bold text-emerald-300 mt-2">{k}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 backdrop-blur rounded-2xl p-8 border border-purple-500/30 shadow-xl">
                  <h4 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
                    <span className="text-3xl">📐</span>
                    Newton's Law of Cooling
                  </h4>

                  <div className="bg-slate-950/70 backdrop-blur rounded-xl p-6 mb-6 border border-purple-500/20">
                    <p className="text-3xl text-center font-mono font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      T(t) = T<sub className="text-xl">amb</sub> + (T₀ - T<sub className="text-xl">amb</sub>) × e<sup className="text-xl">-kt</sup>
                    </p>
                  </div>

                  <div className="space-y-3 text-slate-300">
                    {/* Desktop: attractive table */}
                    <div className="hidden md:block">
                      <div className="overflow-x-auto rounded-lg border border-slate-700/40">
                        <table className="min-w-full text-sm md:text-base divide-y divide-slate-700">
                          <thead className="bg-slate-900/60">
                            <tr>
                              <th className="px-4 py-3 text-left text-slate-200 font-medium">Simbol</th>
                              <th className="px-4 py-3 text-left text-slate-200 font-medium">Keterangan</th>
                              <th className="px-4 py-3 text-left text-slate-400 text-sm">Catatan</th>
                            </tr>
                          </thead>
                          <tbody className="bg-slate-950">
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-emerald-400 text-lg">T(t)</td>
                              <td className="px-4 py-3">Suhu CPU pada waktu t (detik)</td>
                              <td className="px-4 py-3 text-slate-400">Nilai berubah seiring waktu</td>
                            </tr>
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-cyan-400 text-lg">T_amb</td>
                              <td className="px-4 py-3">Suhu udara sekitar</td>
                              <td className="px-4 py-3 text-slate-400">Default: {Tambient}°C</td>
                            </tr>
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-red-400 text-lg">T₀</td>
                              <td className="px-4 py-3">Suhu awal CPU</td>
                              <td className="px-4 py-3 text-slate-400">Contoh: {T0}°C</td>
                            </tr>
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-yellow-400 text-lg">k</td>
                              <td className="px-4 py-3">Konstanta pendinginan</td>
                              <td className="px-4 py-3 text-slate-400">Mempengaruhi laju pendinginan</td>
                            </tr>
                            <tr className="hover:bg-slate-900/30">
                              <td className="px-4 py-3 font-mono text-purple-400 text-lg">t</td>
                              <td className="px-4 py-3">Waktu (detik)</td>
                              <td className="px-4 py-3 text-slate-400">Satuan: detik</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile: stacked cards for readability */}
                    <div className="md:hidden grid grid-cols-1 gap-3">
                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-emerald-400">T(t)</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Suhu CPU pada waktu t (detik)</div>
                          <div className="text-xs text-slate-400">Nilai berubah seiring waktu</div>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-cyan-400">T_amb</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Suhu udara sekitar</div>
                          <div className="text-xs text-slate-400">Default: {Tambient}°C</div>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-red-400">T₀</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Suhu awal CPU</div>
                          <div className="text-xs text-slate-400">Contoh: {T0}°C</div>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-yellow-400">k</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Konstanta pendinginan</div>
                          <div className="text-xs text-slate-400">Mempengaruhi laju pendinginan</div>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 rounded-lg p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-12">
                          <div className="font-mono text-lg text-purple-400">t</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Waktu</div>
                          <div className="text-xs text-slate-400">Satuan: detik</div>
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
    </div>
  );
};

export default CPUCoolingSimulation;