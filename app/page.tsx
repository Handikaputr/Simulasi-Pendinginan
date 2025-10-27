"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sun, Moon } from 'lucide-react';
import 'animate.css';
const CPUCoolingSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [temp, setTemp] = useState(80);
  const [params, setParams] = useState({ T0: 80, Tambient: 25, k: 0.15 });
  const [isParamOpen, setIsParamOpen] = useState(true);
  const [paramManuallyOpened, setParamManuallyOpened] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isLightMode, setIsLightMode] = useState(() => {
    // Cek preferensi sistem pengguna
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches;
    }
    return false; // Default ke dark mode jika tidak bisa deteksi
  });

  // Tambahkan useEffect untuk memantau perubahan preferensi sistem
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleChange = (e) => setIsLightMode(e.matches);

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);


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
  // Fungsi untuk toggle mode terang/gelap
  const toggleLightMode = () => {
    setIsLightMode(!isLightMode);
  };
  // hitung dulu
  const exponentValue = Math.exp(-k * time); // e^(-k*t)
  const computedTemp = Tambient + (T0 - Tambient) * exponentValue;



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
    if (isRunning) {
      setIsParamOpen(false);
      setParamManuallyOpened(false);
    }
  }, [isRunning]);


  useEffect(() => {
    if (!imagesLoaded) return;
    if (isRunning) {
      setIsParamOpen(false);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient - berdasarkan mode terang/gelap
    if (isLightMode) {
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(0, 0, width, height);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#050814');
      bgGrad.addColorStop(1, '#0f1729');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Main 3D system
    drawMainSystem(ctx, width, height);

    // Graph
    drawTemperatureGraph(ctx, width, height);

  }, [temp, time, isRunning, params, imagesLoaded, isLightMode]);

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
    if (k < 0.1) {
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
    } else if (k < 0.2) {
      if (tempRatio > 0.05) {
        const dissOffset = (time * 20) % 40;
        for (let i = 0; i < 3; i++) {
          const dx = 80 + i * 45 + dissOffset;
          if (dx > 80 && dx < 180) {
            ctx.strokeStyle = `rgba(234, 179, 8, ${0.3 + tempRatio * 0.5})`;
            ctx.fillStyle = `rgba(234, 179, 8, ${0.3 + tempRatio * 0.5})`;
            ctx.lineWidth = 4;
            drawRightArrow(ctx, centerX - dx - 40, hsY + 80, centerX - dx, hsY + 80);
            drawRightArrow(ctx, centerX - dx - 40, hsY + 110, centerX - dx, hsY + 110);
            drawRightArrow(ctx, centerX + dx - 40, hsY + 80, centerX + dx, hsY + 80);
            drawRightArrow(ctx, centerX + dx - 40, hsY + 110, centerX + dx, hsY + 110);
          }
        }
      }
    } else {

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
    ctx.fillStyle = isLightMode ? '#1e40af' : '#60a5fa';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = isLightMode ? 0 : 20;
    ctx.shadowColor = isLightMode ? 'transparent' : '#3b82f6';
    ctx.fillText('FAN (KIPAS)', centerX, fanY - 120);
    ctx.shadowBlur = 0;

    // Cold air label - TOP RIGHT
    ctx.fillStyle = isLightMode ? '#1e40af' : '#60a5fa';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowBlur = isLightMode ? 0 : 15;
    ctx.shadowColor = isLightMode ? 'transparent' : '#60a5fa';
    ctx.fillText('Udara Dingin', centerX + 200, fanY - 80);
    ctx.fillText('Masuk ↓', centerX + 200, fanY - 50);
    ctx.shadowBlur = 0;

    // Hot air label - TOP LEFT
    ctx.fillStyle = isLightMode ? '#b91c1c' : '#ef4444';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'right';
    ctx.shadowBlur = isLightMode ? 0 : 15;
    ctx.shadowColor = isLightMode ? 'transparent' : '#ef4444';
    ctx.fillText('Udara Panas', centerX - 200, fanY - 80);
    ctx.fillText('Keluar ↑', centerX - 200, fanY - 50);
    ctx.shadowBlur = 0;

    let systemName = "Heatsink Pasif";

    if (k <= 0.1) {
      systemName = "Heatsink Pasif";
    } else if (k <= 0.2) {
      systemName = "Fan Cooler";
    } else {
      systemName = "Liquid Cooling";
    }
    // // Draw system name label 
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#3b82f6';
    ctx.fillText(systemName, centerX - 130, centerY);
    ctx.shadowBlur = 0;

    if (k <= 0.1) {
      // Heat dissipation labels - FAR LEFT & RIGHT
      if (tempRatio > 0.05) {
        ctx.fillStyle = isLightMode ? '#854d0e' : '#eab308';
        ctx.font = 'bold 20px sans-serif';
        ctx.shadowBlur = isLightMode ? 0 : 15;
        ctx.shadowColor = isLightMode ? 'transparent' : '#eab308';

        ctx.textAlign = 'right';
        ctx.fillText('Penyebaran', centerX - 260, hsY + 85);
        ctx.fillText('Panas →', centerX - 260, hsY + 115);

        ctx.textAlign = 'left';
        ctx.fillText('Penyebaran', centerX + 260, hsY + 85);
        ctx.fillText('← Panas', centerX + 260, hsY + 115);
        ctx.shadowBlur = 0;
      }

    } else if (k <= 0.2) {
      // Heat dissipation labels - FAR LEFT & RIGHT
      if (tempRatio > 0.05) {
        ctx.fillStyle = isLightMode ? '#854d0e' : '#eab308';
        ctx.font = 'bold 20px sans-serif';
        ctx.shadowBlur = isLightMode ? 0 : 15;
        ctx.shadowColor = isLightMode ? 'transparent' : '#eab308';

        ctx.textAlign = 'right';
        ctx.fillText('Konveksi', centerX - 260, hsY + 85);
        ctx.fillText('Paksa →', centerX - 260, hsY + 115);




      }

    } else {
      // Heat dissipation labels - FAR LEFT & RIGHT
      if (tempRatio > 0.05) {
        ctx.fillStyle = isLightMode ? '#854d0e' : '#eab308';
        ctx.font = 'bold 20px sans-serif';
        ctx.shadowBlur = isLightMode ? 0 : 15;
        ctx.shadowColor = isLightMode ? 'transparent' : '#eab308';

        ctx.textAlign = 'right';
        ctx.fillText('Sirkulasi', centerX + 220, hsY + 85);
        ctx.fillText('Cairan 🔁', centerX + 230, hsY + 115);
        drawRightArrow(ctx, centerX + 250, hsY + 90, centerX + 285, hsY + 90);
        ctx.fillText('Transfer', centerX + 390, hsY + 85);
        ctx.fillText('Ke Radiator', centerX + 426, hsY + 115);

      }

    }

    // Conduction label - RIGHT
    if (tempRatio > 0.05) {
      ctx.fillStyle = isLightMode ? '#c2410c' : '#fb923c';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';
      ctx.shadowBlur = isLightMode ? 0 : 15;
      ctx.shadowColor = isLightMode ? 'transparent' : '#fb923c';
      ctx.fillText('Konduksi', centerX + 150, centerY + 130);
      ctx.fillText('Panas ↑', centerX + 150, centerY + 160);
      ctx.shadowBlur = 0;
    }

    // CPU heat generation label - BOTTOM CENTER
    if (tempRatio > 0.1) {
      ctx.fillStyle = isLightMode ? '#b91c1c' : '#ef4444';
      ctx.font = 'bold 22px sans-serif';
      ctx.shadowBlur = isLightMode ? 0 : 20;
      ctx.shadowColor = isLightMode ? 'transparent' : '#ef4444';
      ctx.fillText('CPU Menghasilkan', centerX + 100, centerY + 270);
      ctx.fillText('Panas', centerX + 100, centerY + 300);
      ctx.shadowBlur = 0;
    }

    // Temperature display on CPU
    const hue = 120 - tempRatio * 120;
    ctx.fillStyle = `hsl(${hue}, 80%, ${isLightMode ? '40%' : '60%'})`;
    ctx.font = 'bold 38px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = isLightMode ? 0 : 25;
    ctx.shadowColor = isLightMode ? 'transparent' : `hsl(${hue}, 80%, 50%)`;
    ctx.fillText(`${temp.toFixed(1)}°C`, centerX + 170, centerY + 230);
    ctx.shadowBlur = 0;

    // Formula display at bottom
    ctx.fillStyle = isLightMode ? '#1e293b' : '#e2e8f0';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = isLightMode ? 0 : 10;
    ctx.shadowColor = isLightMode ? 'transparent' : '#3b82f6';
    ctx.fillText('T(t) = T_ambient + (T₀ - T_ambient) × e^(-kt)', centerX, centerY + 370);
    ctx.shadowBlur = 0;

    // Process flow indicators - FAR RIGHT
    drawProcessFlow(ctx, centerX, centerY);
  };

  const drawProcessFlow = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    let steps = [];
    if (k <= 0.1) {
      // Heatsink Pasif
      steps = [
        { num: '1', label: 'Panas\nDihasilkan', x: cx - 520, y: cy + 330, color: isLightMode ? '#b91c1c' : '#ef4444' },
        { num: '2', label: 'Konduksi\nke Heatsink', x: cx - 520, y: cy + 200, color: isLightMode ? '#c2410c' : '#f97316' },
        { num: '3', label: 'Radiasi dari\nSirip Heatsink', x: cx - 520, y: cy + 60, color: isLightMode ? '#854d0e' : '#eab308' },
        { num: '4', label: 'Konveksi\nAlami', x: cx - 520, y: cy - 80, color: isLightMode ? '#1e40af' : '#3b82f6' },
        { num: '5', label: 'Pendinginan\nLambat', x: cx - 520, y: cy - 220, color: isLightMode ? '#15803d' : '#22c55e' }
      ];
    } else if (k <= 0.2) {
      // Fan Cooler
      steps = [
        { num: '1', label: 'Panas\nDihasilkan', x: cx - 520, y: cy + 330, color: isLightMode ? '#b91c1c' : '#ef4444' },
        { num: '2', label: 'Konduksi\nke Heatsink', x: cx - 520, y: cy + 200, color: isLightMode ? '#c2410c' : '#f97316' },
        { num: '3', label: 'Penyebaran\nPanas', x: cx - 520, y: cy + 60, color: isLightMode ? '#854d0e' : '#eab308' },
        { num: '4', label: 'Konveksi\nPaksa (Fan)', x: cx - 520, y: cy - 80, color: isLightMode ? '#1e40af' : '#3b82f6' },
        { num: '5', label: 'Pendinginan\nModerat', x: cx - 520, y: cy - 220, color: isLightMode ? '#15803d' : '#22c55e' }
      ];
    } else {
      // Liquid Cooling
      steps = [
        { num: '1', label: 'Panas\nDihasilkan', x: cx - 520, y: cy + 330, color: isLightMode ? '#b91c1c' : '#ef4444' },
        { num: '2', label: 'Konduksi ke\nWaterblock', x: cx - 520, y: cy + 200, color: isLightMode ? '#c2410c' : '#f97316' },
        { num: '3', label: 'Sirkulasi\nCairan', x: cx - 520, y: cy + 60, color: isLightMode ? '#854d0e' : '#eab308' },
        { num: '4', label: 'Transfer ke\nRadiator', x: cx - 520, y: cy - 80, color: isLightMode ? '#1e40af' : '#3b82f6' },
        { num: '5', label: 'Pendinginan\nOptimal', x: cx - 520, y: cy - 220, color: isLightMode ? '#15803d' : '#22c55e' }
      ];
    }

    steps.forEach((step, i) => {
      // Circle background
      ctx.fillStyle = step.color + (isLightMode ? '22' : '33');
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
      ctx.fillStyle = isLightMode ? '#1e293b' : '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      const lines = step.label.split('\n');
      lines.forEach((line, li) => {
        ctx.fillText(line, step.x, step.y + 55 + li * 18);
      });

      // Connecting arrow
      if (i < steps.length - 1) {
        ctx.strokeStyle = isLightMode ? '#94a3b8' : '#475569';
        ctx.fillStyle = isLightMode ? '#94a3b8' : '#475569';
        ctx.lineWidth = 2;
        drawUpArrow(ctx, step.x, step.y - 38, step.x, steps[i + 1].y + 38);
      }
    });
  };

  const drawAmbientAir = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = isLightMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.15)';
    ctx.fillRect(50, y, 1100, 60);

    ctx.strokeStyle = isLightMode ? '#1e40af' : '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(50, y, 1100, 60);
    ctx.setLineDash([]);

    ctx.fillStyle = isLightMode ? '#1e40af' : '#60a5fa';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = isLightMode ? 0 : 10;
    ctx.shadowColor = isLightMode ? 'transparent' : '#3b82f6';
    ctx.fillText(`UDARA SEKITAR (T_ambient = ${Tambient}°C)`, x, y + 38);
    ctx.shadowBlur = 0;
  };

  const drawFan = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const radius = 70;

    // Fan glow
    ctx.shadowBlur = isLightMode ? 0 : 30;
    ctx.shadowColor = isLightMode ? 'transparent' : '#3b82f6';

    // Fan housing
    ctx.strokeStyle = isLightMode ? '#1e3a8a' : '#1e40af';
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
      if (isLightMode) {
        bladeGrad.addColorStop(0, '#93c5fd');
        bladeGrad.addColorStop(0.7, '#3b82f6');
        bladeGrad.addColorStop(1, '#1e3a8a');
      } else {
        bladeGrad.addColorStop(0, '#60a5fa');
        bladeGrad.addColorStop(0.7, '#3b82f6');
        bladeGrad.addColorStop(1, '#1e3a8a');
      }

      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.ellipse(32, 0, 35, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isLightMode ? '#1e3a8a' : '#1e40af';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.rotate(Math.PI / 2);
    }
    ctx.restore();

    // Center hub with 3D effect
    const hubGrad = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, 18);
    if (isLightMode) {
      hubGrad.addColorStop(0, '#dbeafe');
      hubGrad.addColorStop(0.5, '#93c5fd');
      hubGrad.addColorStop(1, '#1e40af');
    } else {
      hubGrad.addColorStop(0, '#dbeafe');
      hubGrad.addColorStop(0.5, '#60a5fa');
      hubGrad.addColorStop(1, '#1e40af');
    }

    ctx.fillStyle = hubGrad;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isLightMode ? '#1e3a8a' : '#1e3a8a';
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
      coolingImage = heatsinkImageRef.current;
      systemName = "Heatsink Pasif";
    } else if (k <= 0.2) {
      coolingImage = fancoolerImageRef.current;
      systemName = "Fan Cooler";
    } else {
      coolingImage = liquidImageRef.current;
      systemName = "Liquid Cooling";
    }

    if (coolingImage) {
      ctx.save();
      ctx.shadowBlur = isLightMode ? 0 : 20;
      ctx.shadowColor = isLightMode ? 'transparent' : 'rgba(100, 150, 200, 0.5)';
      ctx.drawImage(coolingImage, x - width / 2, y - 20, width, height);
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

      // Efek glow berdasarkan suhu (lebih halus)
      const hue = 120 - tempRatio * 120;
      ctx.shadowBlur = 30 + tempRatio * 20;
      ctx.shadowColor = `hsla(${hue}, 80%, 50%, ${0.6 + tempRatio * 0.4})`;

      // Draw CPU image
      ctx.drawImage(cpuImageRef.current, x - size / 2, cy - size / 2 + 100, size, size);

      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      // Fallback to original drawing if image not loaded
      const hue = 120 - tempRatio * 120;
      const cpuGrad = ctx.createLinearGradient(x - size / 2, cy - size / 2, x + size / 2, cy + size / 2);
      if (isLightMode) {
        cpuGrad.addColorStop(0, `hsl(${hue}, 75%, 70%)`);
        cpuGrad.addColorStop(0.5, `hsl(${hue}, 75%, 60%)`);
        cpuGrad.addColorStop(1, `hsl(${hue}, 75%, 45%)`);
      } else {
        cpuGrad.addColorStop(0, `hsl(${hue}, 75%, 60%)`);
        cpuGrad.addColorStop(0.5, `hsl(${hue}, 75%, 50%)`);
        cpuGrad.addColorStop(1, `hsl(${hue}, 75%, 35%)`);
      }

      ctx.shadowBlur = isLightMode ? 0 : 25;
      ctx.shadowColor = isLightMode ? 'transparent' : `hsl(${hue}, 75%, 45%)`;
      ctx.fillStyle = cpuGrad;
      ctx.fillRect(x - size / 2, cy - size / 2, size, size);
      ctx.shadowBlur = 0;

      // Grid pattern
      ctx.strokeStyle = isLightMode ? `hsl(${hue}, 60%, 45%)` : `hsl(${hue}, 60%, 25%)`;
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
      ctx.strokeStyle = isLightMode ? `hsl(${hue}, 60%, 40%)` : `hsl(${hue}, 60%, 20%)`;
      ctx.lineWidth = 5;
      ctx.strokeRect(x - size / 2, cy - size / 2, size, size);

      // Highlight edge
      ctx.strokeStyle = isLightMode ? `hsl(${hue}, 60%, 80%)` : `hsl(${hue}, 60%, 70%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - size / 2, cy - size / 2);
      ctx.lineTo(x + size / 2, cy - size / 2);
      ctx.lineTo(x + size / 2, cy + size / 2);
      ctx.stroke();
    }
  };

  const drawTemperatureGraph = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const graphX = 100;
    const graphY = height - 280;
    const graphWidth = width - 200;
    const graphHeight = 200;

    // Graph background with gradient
    if (isLightMode) {
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
    } else {
      const graphBg = ctx.createLinearGradient(graphX, graphY, graphX, graphY + graphHeight);
      graphBg.addColorStop(0, '#1e293b');
      graphBg.addColorStop(1, '#0f172a');
      ctx.fillStyle = graphBg;
      ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
    }

    // Border
    ctx.strokeStyle = isLightMode ? '#94a3b8' : '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);

    // Grid
    ctx.strokeStyle = isLightMode ? '#cbd5e1' : '#334155';
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
    ctx.fillStyle = isLightMode ? '#1e293b' : '#cbd5e1';
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
    ctx.strokeStyle = isLightMode ? '#15803d' : '#22c55e';
    ctx.lineWidth = 4;
    ctx.shadowBlur = isLightMode ? 0 : 15;
    ctx.shadowColor = isLightMode ? 'transparent' : '#22c55e';
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

      ctx.fillStyle = isLightMode ? '#15803d' : '#22c55e';
      ctx.shadowBlur = isLightMode ? 0 : 20;
      ctx.shadowColor = isLightMode ? 'transparent' : '#22c55e';
      ctx.beginPath();
      ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Title
    ctx.fillStyle = isLightMode ? '#1e293b' : '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = isLightMode ? 0 : 10;
    ctx.shadowColor = isLightMode ? 'transparent' : '#3b82f6';
    ctx.fillText('GRAFIK PENDINGINAN CPU', graphX + graphWidth / 2, graphY - 20);
    ctx.shadowBlur = 0;
  };

  const drawAirflowArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    ctx.strokeStyle = isLightMode ? '#1e40af' : '#60a5fa';
    ctx.fillStyle = isLightMode ? '#1e40af' : '#60a5fa';
    ctx.lineWidth = 4;
    ctx.shadowBlur = isLightMode ? 0 : 10;
    ctx.shadowColor = isLightMode ? 'transparent' : '#3b82f6';

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
    ctx.strokeStyle = isLightMode ? '#b91c1c' : '#ef4444';
    ctx.fillStyle = isLightMode ? '#b91c1c' : '#ef4444';
    ctx.lineWidth = 4;
    ctx.shadowBlur = isLightMode ? 0 : 10;
    ctx.shadowColor = isLightMode ? 'transparent' : '#dc2626';

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
    setIsParamOpen(true);
    setParamManuallyOpened(false);
  };

  const handleParamChange = (param: 'T0' | 'Tambient' | 'k', value: number) => {
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

    setParams(prev => ({
      ...prev,
      [param]: validatedValue
    }));

    if (!isRunning) {
      setTemp(calculateTemp(time));
    }
  };

  return (
    <div className={`w-full min-h-screen md:h-screen overflow-hidden p-4 md:p-6 ${isLightMode ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'}`}>
      {/* Tombol Toggle Mode Terang/Gelap */}
      <button
        onClick={toggleLightMode}
        className="fixed top-5 right-5 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
      >
        {isLightMode ? (
          <Moon size={24} className="text-white" />
        ) : (
          <Sun size={24} className="text-white" />
        )}
      </button>

      {/* Tombol Info - tetap ada */}
      <button
        onClick={() => {
          const infoBox = document.querySelector('.informationBox') as HTMLDivElement;
          if (infoBox) {
            infoBox.style.display = 'flex';
          }
        }}
        id='tombolInfo'
        className={`fixed top-5 left-5 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isLightMode
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
          : 'bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800'
          }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="white"
          strokeWidth="2"
          className="text-white"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>

      <div className={`informationBox w-screen h-screen fixed top-0 left-0 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 text-center transition-colors duration-300 ${isLightMode ? 'bg-slate-900/20' : 'bg-black/50'
        }`} style={{ display: 'flex' }}>
        <div className={`textBox w-full max-w-lg p-6 rounded-2xl flex animate__animated animate__jackInTheBox flex-col items-center justify-center shadow-2xl transition-all duration-300 ${isLightMode
          ? 'bg-white/95 text-slate-800 border border-blue-200'
          : 'bg-slate-900/95 text-white border border-slate-700'
          }`}>
          <h2 className={`text-xl md:text-3xl font-bold mb-4 ${isLightMode
            ? 'bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800'
            : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600'
            } bg-clip-text text-transparent`}>
            Selamat Datang di Simulasi Sistem Pendinginan CPU
          </h2>
          <p className={`text-sm md:text-md mb-6 max-w-3xl ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
            Simulasi ini dirancang untuk memenuhi tugas <b>Fisika Dasar - Sistem Pendinginan CPU/Server</b> dengan memvisualisasikan Hukum Pendinginan Newton melalui sistem pendinginan CPU.
          </p>
          <p className={`text-lg pb-2 font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
            Anggota Kelompok
          </p>
          <ul className={`list-disc list-inside mb-6 text-left w-fit pb-8 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
            <li>Handika Putra Nur Ilhami (25051130026)</li>
            <li>Randi Dwi Nur Cahyo (25051130008)</li>
            <li>Rachela Mecka Fauzi (25051130010)</li>
            <li>Lina Faridhatul Khakimah (25051130004)</li>
          </ul>
          <button
            className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all shadow-lg ${isLightMode
              ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-800 text-white'
              : 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white'
              }`}
            onClick={() => {
              const infoBox = document.querySelector('.informationBox') as HTMLDivElement;
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
          <h1 className={`text-2xl md:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r ${isLightMode ? 'from-blue-600 via-indigo-700 to-purple-800' : 'from-cyan-400 via-blue-500 to-purple-600'} bg-clip-text text-transparent`}>
            SIMULASI SISTEM PENDINGINAN CPU
          </h1>
          <p className={isLightMode ? 'text-slate-700 text-sm md:text-xl' : 'text-slate-300 text-sm md:text-xl'}>
            Newton's Law of Cooling - Visualisasi Interaktif
          </p>
        </div>

        <div className="flex md:flex-row flex-col flex-1 justify-between overflow-hidden md:max-h-full gap-4 md:gap-6">
          <div className={`rounded-xl md:rounded-3xl max-h-[900px] p-2 mb-4 md:mb-8  ${isLightMode ? 'bg-white/70 border border-blue-200' : ' bg-black backdrop-blur border border-slate-700/50'}`}>
            <canvas
              ref={canvasRef}
              width={1200}
              height={1200}
              className="w-full h-full rounded-lg md:rounded-2xl shadow-2xl"
            />
          </div>

          <div className="md:h-full w-full md:max-w-md md:overflow-y-auto pb-4 md:pb-8">
            <div className="flex-col gap-4 flex md:gap-6">
              <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-white/70 border border-blue-200' : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur border border-slate-700/50'}`}>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className={`text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg ${isLightMode ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                      <Play size={16} className="md:hidden text-white" />
                      <Play size={20} className="hidden md:block text-white" />
                    </div>
                    Kontrol Simulasi
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl md:text-3xl font-bold ${isLightMode ? 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'}`}>
                      {time.toFixed(1)}s
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 md:gap-4">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 flex items-center justify-center gap-2 md:gap-4 rounded-xl md:rounded-2xl font-bold text-base md:text-xl transition-all shadow-2xl hover:scale-105 ${isLightMode ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-800 text-white px-4 md:px-8 py-3 md:py-4' : 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white px-4 md:px-8 py-3 md:py-4'}`}
                  >
                    {isRunning ? <Pause size={20} className="md:hidden" /> : <Play size={20} className="md:hidden" />}
                    {isRunning ? <Pause size={24} className="hidden md:block" /> : <Play size={24} className="hidden md:block" />}
                    {isRunning ? 'Jeda' : 'Mulai'}
                  </button>
                  <button
                    onClick={handleReset}
                    className={`flex items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl font-bold text-base md:text-xl transition-all ${isLightMode ? 'bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white px-4 md:px-6 py-3 md:py-4 shadow-xl' : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 md:px-6 py-3 md:py-4 shadow-xl'}`}
                  >
                    <RotateCcw size={20} className="md:hidden" />
                    <RotateCcw size={24} className="hidden md:block" />
                  </button>
                </div>
              </div>

              <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-white/70 border border-blue-200' : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur border border-slate-700/50'}`}>
                <div
                  className="flex justify-between items-center  cursor-pointer"
                  onClick={() => {
                    if (isRunning) {
                      setParamManuallyOpened(!paramManuallyOpened);
                    } else {
                      setIsParamOpen(!isParamOpen);
                    }
                  }}
                >
                  <h3 className={`text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg ${isLightMode ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                      </svg>
                    </div>
                    Parameter Simulasi
                  </h3>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transform transition-transform duration-300 ${(isRunning ? paramManuallyOpened : isParamOpen) ? 'rotate-180' : ''} ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${(isRunning ? paramManuallyOpened : isParamOpen) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                    {/* Konten parameter tetap sama */}
                    <div className={`rounded-xl mt-4 md:mt-6 md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-red-100 to-orange-200 border border-red-300' : 'bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur border border-red-500/30'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className={isLightMode ? 'text-slate-700 text-sm md:text-base font-semibold' : 'text-slate-300 text-sm md:text-base font-semibold'}>Suhu Awal CPU</p>
                          <p className={`text-lg md:text-2xl font-bold ${isLightMode ? 'text-red-600' : 'text-red-400'}`}>T₀</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl md:text-3xl font-bold ${isLightMode ? 'text-red-700' : 'text-red-300'}`}>{T0}°C</p>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="1"
                        value={T0}
                        onChange={(e) => handleParamChange('T0', Number(e.target.value))}
                        disabled={isRunning}
                        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-red ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <div className="flex justify-between text-xs md:text-sm text-slate-400 mt-2">
                        <span>50°C</span>
                        <span>100°C</span>
                      </div>
                    </div>


                    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-blue-100 to-cyan-200 border border-blue-300' : 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur border border-blue-500/30'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className={isLightMode ? 'text-slate-700 text-sm md:text-base font-semibold' : 'text-slate-300 text-sm md:text-base font-semibold'}>Suhu Ambient</p>
                          <p className={`text-lg md:text-2xl font-bold ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`}>T_amb</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl md:text-3xl font-bold ${isLightMode ? 'text-blue-700' : 'text-blue-300'}`}>{Tambient}°C</p>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="35"
                        step="1"
                        value={Tambient}
                        onChange={(e) => handleParamChange('Tambient', Number(e.target.value))}
                        disabled={isRunning}
                        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <div className="flex justify-between text-xs md:text-sm text-slate-400 mt-2">
                        <span>15°C</span>
                        <span>35°C</span>
                      </div>
                    </div>

                    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-emerald-100 to-teal-200 border border-emerald-300' : 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur border border-emerald-500/30'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className={isLightMode ? 'text-slate-700 text-sm md:text-base font-semibold' : 'text-slate-300 text-sm md:text-base font-semibold'}>Konstanta Pendinginan</p>
                          <p className={`text-lg md:text-2xl font-bold ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>k</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl md:text-3xl font-bold ${isLightMode ? 'text-emerald-700' : 'text-emerald-300'}`}>{k}</p>
                          <p className={`text-xs md:text-sm mt-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
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
                        disabled={isRunning}
                        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-green ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <div className="flex justify-between text-xs md:text-sm text-slate-400 mt-2">
                        <span>0.05<br />(Pasif)</span>
                        <span>0.15<br />(Fan)</span>
                        <span>0.3<br />(Liquid)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 border border-purple-300' : 'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 backdrop-blur border border-purple-500/30'}`}>
                <h4 className={`text-lg md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2 md:gap-3 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                  <span className="text-xl md:text-3xl">📐</span>
                  Newton's Law of Cooling
                </h4>

                <div className={`rounded-lg md:rounded-xl p-2 md:p-6 mb-4 md:mb-6 ${isLightMode ? 'bg-blue-50 border border-blue-200' : 'bg-slate-950/70 text-nowrap backdrop-blur border border-purple-500/20'}`}>
                  <p className={`text-[1rem] text-center font-mono font-bold ${isLightMode
                    ? 'text-slate-800'
                    : 'text-white drop-shadow-[0_0_10px_rgba(0,180,255,0.7)]'
                    }`}>
                    T(t) {computedTemp.toFixed(2)} = <br></br> {Tambient} + ({T0} − {Tambient}) × e^(-{k}·{time.toFixed(2)})
                  </p>


                </div>

                <div className="space-y-3">
                  <div className="hidden md:block">
                    <div className={`overflow-x-auto rounded-lg ${isLightMode ? 'border border-slate-300' : 'border border-slate-700/40'}`}>
                      <table className="min-w-full text-sm md:text-base divide-y divide-slate-700">
                        <thead className={isLightMode ? 'bg-blue-100' : 'bg-slate-900/60'}>
                          <tr>
                            <th className={`px-4 py-3 text-left font-medium ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>Simbol</th>
                            <th className={`px-4 py-3 text-left font-medium ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>Keterangan</th>
                            <th className={`px-4 py-3 text-left text-sm ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>Nilai</th>
                          </tr>
                        </thead>
                        <tbody className={isLightMode ? 'bg-white' : 'bg-slate-950'}>
                          <tr className={isLightMode ? 'hover:bg-blue-50' : 'hover:bg-slate-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>T(t)</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-700' : ''}`}>Suhu CPU pada waktu t (detik)</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{temp.toFixed(1)}°C</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-blue-50' : 'hover:bg-slate-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-cyan-600' : 'text-cyan-400'}`}>T_amb</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-700' : ''}`}>Suhu udara sekitar</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{Tambient}°C</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-blue-50' : 'hover:bg-slate-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-red-600' : 'text-red-400'}`}>T₀</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-700' : ''}`}>Suhu awal CPU</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{T0}°C</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-blue-50' : 'hover:bg-slate-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-yellow-600' : 'text-yellow-400'}`}>k</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-700' : ''}`}>Konstanta pendinginan</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{k}</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-blue-50' : 'hover:bg-slate-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`}>t</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-700' : ''}`}>Waktu (detik)</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{time.toFixed(1)}s</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="md:hidden grid grid-cols-1 gap-3">
                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-blue-50' : 'bg-slate-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>T(t)</div>
                      </div>
                      <div className="flex-1 ">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                          Suhu CPU pada waktu t
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{temp.toFixed(1)}°C</div>
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-blue-50' : 'bg-slate-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-cyan-600' : 'text-cyan-400'}`}>T_amb</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                          Suhu udara sekitar
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{Tambient}°C</div>
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-blue-50' : 'bg-slate-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-red-600' : 'text-red-400'}`}>T₀</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                          Suhu awal CPU
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{T0}°C</div>
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-blue-50' : 'bg-slate-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-yellow-600' : 'text-yellow-400'}`}>k</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                          Konstanta pendinginan
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{k}</div>
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-blue-50' : 'bg-slate-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`}>t</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                          Waktu
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{time.toFixed(1)}s</div>
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
        .auto-text {
  font-size: clamp(0.75rem, 2vw, 1.25rem);
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
