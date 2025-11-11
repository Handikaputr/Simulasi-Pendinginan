import { RefObject } from 'react';

interface DrawingParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  temp: number;
  time: number;
  isRunning: boolean;
  params: { T0: number, Tambient: number, k: number };
  imagesLoaded: boolean;
  isLightMode: boolean;
  cpuImageRef: RefObject<HTMLImageElement | null>;
  heatsinkImageRef: RefObject<HTMLImageElement | null>;
  fancoolerImageRef: RefObject<HTMLImageElement | null>;
  liquidImageRef: RefObject<HTMLImageElement | null>;
}

export const calculateTemp = (t: number, params: { T0: number, Tambient: number, k: number }): number => {
  const { T0, Tambient, k } = params;
  return Tambient + (T0 - Tambient) * Math.exp(-k * t);
};

export const drawScene = (params: DrawingParams) => {
  const { ctx, width, height, temp, time, isRunning, params: simParams, imagesLoaded, isLightMode, cpuImageRef, heatsinkImageRef, fancoolerImageRef, liquidImageRef } = params;
  const { T0, Tambient, k } = simParams;

  
  if (isLightMode) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else {
    
    ctx.fillStyle = '#0f1729';

    ctx.fillRect(0, 0, width, height);
  }
  
  drawTemperatureGraph({ ctx, width, height, temp, time, params: simParams, isLightMode });
};




const drawTemperatureGraph = (
  params: Omit<DrawingParams, 'imagesLoaded' | 'isRunning' | 'cpuImageRef' | 'heatsinkImageRef' | 'fancoolerImageRef' | 'liquidImageRef'>
) => {
  const { ctx, width, height, temp, time, params: simParams, isLightMode } = params;
  const { T0, Tambient, k } = simParams;
  
  const graphX = 50;
  const graphY = height - 230;
  const graphWidth = width - 70;
  const graphHeight = height - 50;
  

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
    const tempVal = calculateTemp(t, simParams);
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
  ctx.shadowBlur = 0;
};




