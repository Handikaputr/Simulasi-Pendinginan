"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sun, Moon, ArrowDown, ArrowUp, Settings } from 'lucide-react';
import 'animate.css';
import AspectRatio from '@mui/joy/AspectRatio';
import { drawScene, calculateTemp } from './component/ilustrator';
import CPUCoolingIllustration from './component/CPUCoolingIllustration';

const CPUCoolingSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [temp, setTemp] = useState(80);
  const [params, setParams] = useState({ T0: 80, Tambient: 25, k: 0.15 });
  const [isParamOpen, setIsParamOpen] = useState(true);
  const [paramManuallyOpened, setParamManuallyOpened] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches;
    }
    return false;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stepMode, setStepMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // Speed multiplier dari child component
  const [isLoading, setIsLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Image refs
  const cpuImageRef = useRef<HTMLImageElement | null>(null);
  const heatsinkImageRef = useRef<HTMLImageElement | null>(null);
  const fancoolerImageRef = useRef<HTMLImageElement | null>(null);
  const liquidImageRef = useRef<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { T0, Tambient, k } = params;

  // Tambahkan useEffect untuk memantau perubahan preferensi sistem
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleChange = (e: MediaQueryListEvent) => setIsLightMode(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Load images
  useEffect(() => {
    const loadImages = () => {
      // Semua gambar yang perlu di-preload
      const imageSources = [
        'asset/CPU.png',
        'asset/heatsink_.png',
        'asset/fanCooler.png',
        'asset/Liquid.png',
        // Step mode images
        'asset/arlotTalk.svg',
        'asset/Liquid_1.png',
        'asset/Liquid_2.png',
        'asset/Liquid_3.png',
        'asset/fanCooler_1.png',
        'asset/fanCooler_2.png',
        'asset/fanCooler_3.png',
      ];

      let loadedCount = 0;
      const totalImages = imageSources.length;
      const images: HTMLImageElement[] = [];

      const onLoad = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
          setIsLoading(false);
        }
      };

      const onError = (src: string) => {
        console.warn(`Failed to load image: ${src}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
          setIsLoading(false);
        }
      };

      imageSources.forEach((src, index) => {
        const img = new Image();
        img.onload = onLoad;
        img.onerror = () => onError(src);
        img.src = src;
        images.push(img);

        // Store main images in refs
        if (index === 0) cpuImageRef.current = img;
        if (index === 1) heatsinkImageRef.current = img;
        if (index === 2) fancoolerImageRef.current = img;
        if (index === 3) liquidImageRef.current = img;
      });
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

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    drawScene({
      ctx,
      width,
      height,
      temp,
      time,
      isRunning,
      params,
      imagesLoaded,
      isLightMode,
      cpuImageRef,
      heatsinkImageRef,
      fancoolerImageRef,
      liquidImageRef
    });

  }, [temp, time, isRunning, params, imagesLoaded, isLightMode]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = setInterval(() => {
        setTime(t => {
          const newTime = t + 0.1;
          setTemp(calculateTemp(newTime, params));
          return newTime;
        });
      }, 100 / simulationSpeed); 
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
  }, [isRunning, params, simulationSpeed]);

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
      setTemp(calculateTemp(time, { ...params, [param]: validatedValue }));
    }
  };

  const toggleLightMode = () => {
    setIsLightMode(!isLightMode);
  };

  const toggleInfoDetails = () => {
    setDetailsOpen(!detailsOpen);
  };

  // hitung dulu
  const exponentValue = Math.exp(-k * time);
  const computedTemp = Tambient + (T0 - Tambient) * exponentValue;

  // Loading screen
  if (isLoading) {
    return (
      <div className={`w-full min-h-screen flex items-center justify-center ${isLightMode ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'}`}>
        <div className="flex flex-col items-center gap-6">
          {/* Spinner */}
          <div className="relative w-20 h-20">
            <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${isLightMode ? 'border-blue-500' : 'border-blue-400'}`}></div>
            <div className={`absolute inset-2 rounded-full border-4 border-t-transparent animate-spin animation-delay-150 ${isLightMode ? 'border-cyan-400' : 'border-cyan-300'}`} style={{ animationDirection: 'reverse' }}></div>
          </div>
          {/* Loading text */}
          <div className={`text-lg font-semibold ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>
            Memuat Simulasi...
          </div>
          {/* Progress hint */}
          <div className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Sedang memuat asset dan komponen
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${isFullscreen ? '' : '2xl:h-screen'} overflow-hidden p-4 md:p-6 ${isLightMode ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'}`}>
      {/* Tombol Toggle Mode Terang/Gelap */}
      <button
        onClick={toggleLightMode}
        className="fixed hidden top-5 right-5 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 md:flex items-center justify-center shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
      >
        {isLightMode ? (
          <Moon size={24} className="text-white" />
        ) : (
          <Sun size={24} className="text-white" />
        )}
      </button>

      <button
        onClick={() => {
          const infoBox = document.querySelector('.informationBox') as HTMLDivElement;
          if (infoBox) {
            infoBox.style.display = 'flex';
          }
        }}
        id='tombolInfo'
        className={`fixed top-5 left-5 z-40 w-12 h-12 rounded-full hidden md:flex items-center justify-center shadow-lg transition-all duration-300 ${isLightMode
          ? 'bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
          : 'bg-gradient-to-br from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800'
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

      <div className={`informationBox w-screen h-screen fixed top-0 left-0 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 text-center md:text-start transition-colors duration-300 ${isLightMode ? 'bg-slate-900/20' : 'bg-black/50'
        }`} style={{ display: 'flex' }}>
        <div className={`textBox w-full lg:w-4xl overflow-hidden relative  p-6 rounded-2xl  animate__animated animate__jackInTheBox  flex   shadow-2xl   ${isLightMode
          ? 'bg-white/95 text-slate-800 border border-blue-200'
          : 'bg-slate-900/95 text-white border border-slate-700'
          }`}>
          <div className="main_content relative flex flex-col items-center md:items-start max-w-lg z-10 justify-center ">
            <h2 className={`text-xl md:text-3xl font-bold mb-4 ${isLightMode
              ? 'bg-gradient-to-r from-blue-600 via-cyan-700 to-blue-800'
              : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600'
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
              className={`px-6 py-3 rounded-xl text-lg w-fit font-semibold transition-all shadow-lg ${isLightMode
                ? 'bg-gradient-to-r from-blue-500 via-cyan-600 to-blue-700 hover:from-blue-600 hover:via-cyan-700 hover:to-blue-800 text-white'
                : 'bg-gradient-to-r from-blue-600 via-cyan-700 to-blue-800 hover:from-blue-700 hover:via-cyan-800 hover:to-blue-900 text-white'
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
          <div className="image_container absolute w-full h-full max-w-4xl overflow-hidden  left-[30%] top-0" style={{
            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)'
          }}>
            <img className='  md:w-full h-full md:h-auto  object-cover  md:object-contain' src="/arlot.png" alt="" />
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto  flex flex-col ${isFullscreen ? '' : '2xl:h-screen'}`}>
        <div className="text-center mb-4 md:mb-8 flex-0">
          <h1 className={`text-2xl md:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r ${isLightMode ? 'from-blue-600 via-cyan-700 to-blue-800' : 'from-cyan-400 via-blue-500 to-cyan-600'} bg-clip-text text-transparent`}>
            SIMULASI SISTEM PENDINGINAN CPU
          </h1>
          <p className={isLightMode ? 'text-slate-700 text-sm md:text-xl' : 'text-slate-300 text-sm md:text-xl'}>
            Newton's Law of Cooling - Visualisasi Interaktif
          </p>
        </div>
        <div className="flex px-3 gap-4 w-full justify-center mb-4 md:hidden">
          <button
            onClick={toggleLightMode}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
          >
            {isLightMode ? (
              <Moon size={24} className="text-white" />
            ) : (
              <Sun size={24} className="text-white" />
            )}
          </button>

          <button
            onClick={() => {
              const infoBox = document.querySelector('.informationBox') as HTMLDivElement;
              if (infoBox) {
                infoBox.style.display = 'flex';
              }
            }}
            id='tombolInfo'
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isLightMode
              ? 'bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
              : 'bg-gradient-to-br from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800'
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
        </div>
        <div className={`flex  ${isFullscreen ? '' : ' 2xl:flex-row 2xl:max-h-full'} flex-col transition-all duration-300 flex-1 justify-between overflow-hidden  gap-4 md:gap-6`}>
          <div className={`flex h-fit w-full border shadow-md rounded-lg  ${isLightMode ? "bg-white border-slate-200" : "bg-gradient-to-b from-[#050814] to-[#0f1729] border-slate-700"}  p-2  md:p-4 rounded-md md:rounded-xl flex-col`}>
            <CPUCoolingIllustration
              temp={temp}
              time={time}
              isRunning={isRunning}
              params={params}
              isLightMode={isLightMode}
              onFullscreenChange={setIsFullscreen}
              onStepModeChange={setStepMode}
              onRunningChange={setIsRunning}
              onTimeChange={setTime}
              onTempChange={setTemp}
              onSpeedChange={setSimulationSpeed}
            />
            <AspectRatio ratio={4 / 1} className="box w-full bg-unset p-4 ">
              <canvas
                ref={canvasRef}
                width={1000}
                height={250}
                className="w-full h-full  bg-transparent shadow-2xl"
              />
            </AspectRatio>
          </div>

          <div className={`2xl:h-full w-full ${isFullscreen ? '' : '2xl:max-w-md'} 2xl:overflow-y-auto pb-4 md:pb-8`}>
            <div className="flex-col gap-4 flex md:gap-6">
              <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-white/70 border border-blue-200' : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur border border-slate-700/50'}`}>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className={`text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg ${isLightMode ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
                      <Settings size={16} className="md:hidden text-white" />
                      <Settings size={20} className="hidden md:block text-white" />
                    </div>
                    Kontrol Simulasi
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl md:text-3xl font-bold ${isLightMode ? 'bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent'}`}>
                      {time.toFixed(1)}s
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 md:gap-4">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 flex duration-300 relative cursor-pointer text-base md:text-xl overflow-hidden h-16 w-48 rounded-md p-2 font-extrabold
    ${isLightMode
                        ? 'text-white px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                        : 'text-white px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800'
                      }`}
                  >
                    <div
                      className={`absolute z-10 w-16 h-16 rounded-full bg-yellow-400 transition-all duration-700 ease-in-out 
      ${isRunning ? '-top-1 -right-2 scale-150' : 'top-12 right-12 scale-100'}`}
                    ></div>

                    <div
                      className={`absolute z-10 w-12 h-12 rounded-full bg-orange-400 transition-all duration-700 ease-in-out 
      ${isRunning ? '-top-1 -right-2 scale-150' : '-top-6 right-20 scale-100'}`}
                    ></div>

                    <div
                      className={`absolute z-10 w-8 h-8 rounded-full bg-amber-400 transition-all duration-700 ease-in-out 
      ${isRunning ? '-top-1 -right-2 scale-150' : 'top-6 right-32 scale-100'}`}
                    ></div>

                    <div
                      className={`absolute z-10 w-4 h-4 rounded-full bg-red-500 transition-all duration-700 ease-in-out 
      ${isRunning ? '-top-1 -right-2 scale-150' : 'top-12 right-2 scale-100'}`}
                    ></div>

                    <p className="z-10 absolute bottom-2 left-2 flex h-full items-center pt-4 gap-2">
                      {isRunning ? <Pause size={20} className="md:hidden" /> : <Play size={20} className="md:hidden" />}
                      {isRunning ? <Pause size={24} className="hidden md:block" /> : <Play size={24} className="hidden md:block" />}
                      {isRunning ? 'Jeda' : 'Mulai'}
                    </p>
                  </button>

                  <button
                    onClick={handleReset}
                    className={`flex items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl font-bold duration-200 text-base md:text-xl transition-all ${isLightMode ? 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 px-4 md:px-6 py-3 md:py-4 shadow-xl' : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 md:px-6 py-3 md:py-4 shadow-xl'}`}
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
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg ${isLightMode ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
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
                    <div className={`rounded-xl mt-4 md:mt-6 md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-red-50 to-orange-100 border border-red-200' : 'bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur border border-red-500/30'}`}>
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
                        onChange={(e) => { handleParamChange('T0', Number(e.target.value)); handleReset(); }}
                        disabled={isRunning}
                        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-red ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <div className="flex justify-between text-xs md:text-sm text-slate-400 mt-2">
                        <span>50°C</span>
                        <span>100°C</span>
                      </div>
                    </div>

                    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200' : 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur border border-blue-500/30'}`}>
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
                        onChange={(e) => { handleParamChange('Tambient', Number(e.target.value)); handleReset(); }}
                        disabled={isRunning}
                        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <div className="flex justify-between text-xs md:text-sm text-slate-400 mt-2">
                        <span>15°C</span>
                        <span>35°C</span>
                      </div>
                    </div>

                    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200' : 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur border border-emerald-500/30'}`}>
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
                        onChange={(e) => { handleParamChange('k', Number(e.target.value)); handleReset(); }}
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
              <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border border-blue-200' : 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 backdrop-blur border border-blue-500/30'}`}>
                <h4 className={`text-lg md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2 md:gap-3 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                  <span className="text-xl md:text-3xl">📐</span>
                  Newton's Law of Cooling
                </h4>

                <div
                  className={`rounded-lg md:rounded-xl relative p-4 md:p-6 mb-4 md:mb-6 ${isLightMode
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-slate-950/70 backdrop-blur border border-blue-500/20'
                    }`}
                >
                  <button
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/10 transition-colors"
                    onClick={toggleInfoDetails}
                    aria-label="Toggle details"
                  >
                    {!detailsOpen ? (
                      <ArrowDown
                        size={22}
                        className={`${isLightMode
                          ? 'text-blue-500 hover:text-blue-700'
                          : 'text-cyan-400 hover:text-cyan-300'
                          }`}
                      />
                    ) : (
                      <ArrowUp
                        size={22}
                        className={`${isLightMode
                          ? 'text-blue-500 hover:text-blue-700'
                          : 'text-cyan-400 hover:text-cyan-300'
                          }`}
                      />
                    )}
                  </button>

                  {!detailsOpen ? (
                    time !== 0 ? (
                      <div className="text-center pr-8">
                        <div className={`text-xs md:text-sm mb-2 ${isLightMode ? 'text-blue-600' : 'text-cyan-300'}`}>
                          Hasil Perhitungan
                        </div>
                        <div
                          className={`text-2xl md:text-3xl font-bold mb-3 ${isLightMode
                            ? 'text-blue-600'
                            : 'text-cyan-400'
                            }`}
                        >
                          T(t) = {computedTemp.toFixed(2)}°C
                        </div>
                        <div className={`text-xs md:text-sm font-mono ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                          {Tambient} + ({T0} − {Tambient}) × 2.718<sup>−{k}·{time.toFixed(2)}</sup>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center pr-8">
                        <div className={`text-xs md:text-sm mb-2 ${isLightMode ? 'text-blue-600' : 'text-cyan-300'}`}>
                          Rumus Suhu Benda
                        </div>
                        <div className={`text-sm md:text-lg font-mono font-bold ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                          T(t) =  <br></br>T<sub>amb</sub> + (T<sub>0</sub> − T<sub>amb</sub>) × e<sup>−k·t</sup>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="">
                      <div className={`text-sm md:text-base font-semibold mb-4 ${isLightMode ? 'text-blue-700' : 'text-cyan-300'}`}>
                        📊 Langkah-langkah Perhitungan
                      </div>

                      <div className="space-y-4 w-full text-sm  md:text-base">
                        {/* Step 1 */}
                        <div className={`p-3 rounded-lg w-full ${isLightMode ? 'bg-white/60' : 'bg-slate-900/50'}`}>
                          <div className={`text-xs mb-1 ${isLightMode ? 'text-blue-600' : 'text-cyan-400'}`}>
                            Langkah 1: Hitung selisih suhu awal
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-slate-700' : 'text-white'}`}>
                            ΔT = T₀ − T<sub>ambient</sub>
                          </div>
                          <div className={`font-mono mt-1 ${isLightMode ? 'text-slate-700' : 'text-white'}`}>
                            ΔT = {T0}°C − {Tambient}°C = <span className="font-bold text-orange-500">{(T0 - Tambient).toFixed(2)}°C</span>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`p-3 rounded-lg ${isLightMode ? 'bg-white/60' : 'bg-slate-900/50'}`}>
                          <div className={`text-xs mb-1 ${isLightMode ? 'text-blue-600' : 'text-cyan-400'}`}>
                            Langkah 2: Hitung faktor peluruhan eksponensial
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-slate-700' : 'text-white'}`}>
                            e<sup>−k·t</sup> = 2.718<sup>−{k}×{time.toFixed(2)}</sup>
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-slate-700' : 'text-white'}`}>
                            e<sup>−k·t</sup> = 2.718<sup>{(-k * time).toFixed(3)}</sup>
                          </div>
                          <div className={`font-mono mt-1 ${isLightMode ? 'text-slate-700' : 'text-white'}`}>
                            e<sup>−k·t</sup> = <span className="font-bold text-orange-500">{Math.exp(-k * time).toFixed(3)}</span>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className={`p-3 rounded-lg ${isLightMode ? 'bg-white/60' : 'bg-slate-900/50'}`}>
                          <div className={`text-xs mb-1 ${isLightMode ? 'text-blue-600' : 'text-cyan-400'}`}>
                            Langkah 3: Kalikan ΔT dengan faktor peluruhan
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-slate-700' : 'text-white'}`}>
                            ΔT × e<sup>−k·t</sup> = {(T0 - Tambient).toFixed(2)} × {Math.exp(-k * time).toFixed(3)}
                          </div>
                          <div className={`font-mono mt-1 ${isLightMode ? 'text-slate-700' : 'text-white'}`}>
                            = <span className="font-bold text-orange-500">{((T0 - Tambient) * Math.exp(-k * time)).toFixed(3)}°C</span>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className={`p-3 rounded-lg ${isLightMode ? 'bg-blue-100 border-2 border-blue-300' : 'bg-blue-900/30 border-2 border-blue-500/50'}`}>
                          <div className={`text-xs mb-1 ${isLightMode ? 'text-blue-700' : 'text-cyan-300'}`}>
                            Langkah 4: Tambahkan suhu lingkungan (Hasil Akhir)
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-slate-700' : 'text-white'}`}>
                            T(t) = T<sub>ambient</sub> + ΔT × e<sup>−k·t</sup>
                          </div>
                          <div className={`font-mono mt-1 ${isLightMode ? 'text-slate-700' : 'text-white'}`}>
                            T(t) = {Tambient}°C + {((T0 - Tambient) * Math.exp(-k * time)).toFixed(3)}°C
                          </div>
                          <div className={`font-mono text-lg md:text-xl mt-2 font-bold ${isLightMode ? 'text-blue-700' : 'text-cyan-400'}`}>
                            = {computedTemp.toFixed(2)}°C
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`}>t</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-700' : ''}`}>Waktu (detik)</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{time.toFixed(1)}s</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-blue-50' : 'hover:bg-slate-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`}>e</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-700' : ''}`}>Konstanta Euler</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>2.718</td>
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
                        <div className={`font-mono text-lg ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`}>t</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                          Waktu
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{time.toFixed(1)}s</div>
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-blue-50' : 'bg-slate-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`}>e</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                          Konstanta Euler
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>2.718</div>
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
  ); return (
    <div className={`w-full min-h-screen 2xl:h-screen overflow-hidden p-4 md:p-6 ${isLightMode ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50' : 'bg-gradient-to-br from-stone-950 via-amber-950/20 to-rose-950/20'}`}>
      {/* Tombol Toggle Mode Terang/Gelap */}
      <button
        onClick={toggleLightMode}
        className="fixed hidden top-5 right-5 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 2xl:flex items-center justify-center shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300"
      >
        {isLightMode ? (
          <Moon size={24} className="text-white" />
        ) : (
          <Sun size={24} className="text-white" />
        )}
      </button>

      <button
        onClick={() => {
          const infoBox = document.querySelector('.informationBox') as HTMLDivElement;
          if (infoBox) {
            infoBox.style.display = 'flex';
          }
        }}
        id='tombolInfo'
        className={`fixed top-5 left-5 z-40 w-12 h-12 rounded-full hidden md:flex items-center justify-center shadow-lg transition-all duration-300 ${isLightMode
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
          : 'bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800'
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

      <div className={`informationBox w-screen h-screen fixed top-0 left-0 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 text-center transition-colors duration-300 ${isLightMode ? 'bg-stone-900/10' : 'bg-black/40'
        }`} style={{ display: 'flex' }}>
        <div className={`textBox w-full max-w-lg p-6 rounded-2xl flex animate__animated animate__jackInTheBox flex-col items-center justify-center shadow-2xl transition-all duration-300 ${isLightMode
          ? 'bg-white/95 text-stone-800 border border-amber-200'
          : 'bg-stone-900/95 text-white border border-stone-700'
          }`}>
          <h2 className={`text-xl md:text-3xl font-bold mb-4 ${isLightMode
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600'
            : 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400'
            } bg-clip-text text-transparent`}>
            Selamat Datang di Simulasi Sistem Pendinginan CPU
          </h2>
          <p className={`text-sm md:text-md mb-6 max-w-3xl ${isLightMode ? 'text-stone-600' : 'text-stone-300'}`}>
            Simulasi ini dirancang untuk memenuhi tugas <b>Fisika Dasar - Sistem Pendinginan CPU/Server</b> dengan memvisualisasikan Hukum Pendinginan Newton melalui sistem pendinginan CPU.
          </p>
          <p className={`text-lg pb-2 font-bold ${isLightMode ? 'text-stone-800' : 'text-white'}`}>
            Anggota Kelompok
          </p>
          <ul className={`list-disc list-inside mb-6 text-left w-fit pb-8 ${isLightMode ? 'text-stone-600' : 'text-stone-300'}`}>
            <li>Handika Putra Nur Ilhami (25051130026)</li>
            <li>Randi Dwi Nur Cahyo (25051130008)</li>
            <li>Rachela Mecka Fauzi (25051130010)</li>
            <li>Lina Faridhatul Khakimah (25051130004)</li>
          </ul>
          <button
            className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all shadow-lg ${isLightMode
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white'
              : 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:via-orange-700 hover:to-rose-700 text-white'
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

      <div className="max-w-7xl mx-auto 2xl:h-screen flex flex-col">
        <div className="text-center mb-4 md:mb-8 flex-0">
          <h1 className={`text-2xl md:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r ${isLightMode ? 'from-amber-600 via-orange-600 to-rose-600' : 'from-amber-400 via-orange-400 to-rose-400'} bg-clip-text text-transparent`}>
            SIMULASI SISTEM PENDINGINAN CPU
          </h1>
          <p className={isLightMode ? 'text-stone-700 text-sm md:text-xl' : 'text-stone-300 text-sm md:text-xl'}>
            Newton's Law of Cooling - Visualisasi Interaktif
          </p>
        </div>
        <div className="flex px-3 gap-4 w-full justify-center mb-4 md:hidden">
          <button
            onClick={toggleLightMode}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300"
          >
            {isLightMode ? (
              <Moon size={24} className="text-white" />
            ) : (
              <Sun size={24} className="text-white" />
            )}
          </button>

          <button
            onClick={() => {
              const infoBox = document.querySelector('.informationBox') as HTMLDivElement;
              if (infoBox) {
                infoBox.style.display = 'flex';
              }
            }}
            id='tombolInfo'
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isLightMode
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
              : 'bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800'
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
        </div>
        <div className="flex 2xl:flex-row flex-col flex-1 justify-between overflow-hidden 2xl:max-h-full gap-4 md:gap-6">
          <div className={`flex w-full border shadow-md rounded-lg  ${isLightMode ? "bg-white border-stone-200" : "bg-gradient-to-b from-stone-950 to-stone-900 border-stone-700"} h-fit p-2  md:p-4 rounded-md md:rounded-xl flex-col`}>
            <CPUCoolingIllustration
              temp={temp}
              time={time}
              isRunning={isRunning}
              params={params}
              isLightMode={isLightMode}
              onFullscreenChange={setIsFullscreen}
              onStepModeChange={setStepMode}
              onRunningChange={setIsRunning}
              onTimeChange={setTime}
              onTempChange={setTemp}
              onSpeedChange={setSimulationSpeed}
            />
            <AspectRatio ratio={4 / 1} className="box w-full bg-unset p-4 ">
              <canvas
                ref={canvasRef}
                width={1000}
                height={250}
                className="w-full h-full  bg-transparent shadow-2xl"
              />
            </AspectRatio>
          </div>

          <div className={`2xl:h-full w-full ${isFullscreen ? '' : '2xl:max-w-md'} 2xl:overflow-y-auto pb-4 md:pb-8`}>
            <div className="flex-col gap-4 flex md:gap-6">
              <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-white/80 border border-amber-200' : 'bg-gradient-to-br from-stone-800/90 to-stone-900/90 backdrop-blur border border-stone-600/50'}`}>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className={`text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3 ${isLightMode ? 'text-stone-800' : 'text-white'}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg ${isLightMode ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                      <Settings size={16} className="md:hidden text-white" />
                      <Settings size={20} className="hidden md:block text-white" />
                    </div>
                    Kontrol Simulasi
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl md:text-3xl font-bold ${isLightMode ? 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent'}`}>
                      {time.toFixed(1)}s
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 md:gap-4">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 flex duration-300 relative cursor-pointer text-base md:text-xl overflow-hidden h-16 w-48 rounded-lg p-2 font-extrabold
    ${isLightMode
                        ? 'text-white px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                        : 'text-white px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800'
                      }`}
                  >
                    <div
                      className={`absolute z-10 w-16 h-16 rounded-full bg-yellow-300 transition-all duration-700 ease-in-out 
      ${isRunning ? '-top-1 -right-2 scale-150' : 'top-12 right-12 scale-100'}`}
                    ></div>

                    <div
                      className={`absolute z-10 w-12 h-12 rounded-full bg-orange-300 transition-all duration-700 ease-in-out 
      ${isRunning ? '-top-1 -right-2 scale-150' : '-top-6 right-20 scale-100'}`}
                    ></div>

                    <div
                      className={`absolute z-10 w-8 h-8 rounded-full bg-amber-300 transition-all duration-700 ease-in-out 
      ${isRunning ? '-top-1 -right-2 scale-150' : 'top-6 right-32 scale-100'}`}
                    ></div>

                    <div
                      className={`absolute z-10 w-4 h-4 rounded-full bg-red-400 transition-all duration-700 ease-in-out 
      ${isRunning ? '-top-1 -right-2 scale-150' : 'top-12 right-2 scale-100'}`}
                    ></div>

                    <p className="z-10 absolute bottom-2 left-2 flex h-full items-center pt-4 gap-2">
                      {isRunning ? <Pause size={20} className="md:hidden" /> : <Play size={20} className="md:hidden" />}
                      {isRunning ? <Pause size={24} className="hidden md:block" /> : <Play size={24} className="hidden md:block" />}
                      {isRunning ? 'Jeda' : 'Mulai'}
                    </p>
                  </button>

                  <button
                    onClick={handleReset}
                    className={`flex items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl font-bold duration-200 text-base md:text-xl transition-all ${isLightMode ? 'bg-gradient-to-r from-stone-100 to-stone-200 hover:from-stone-200 hover:to-stone-300 text-stone-700 px-4 md:px-6 py-3 md:py-4 shadow-xl' : 'bg-gradient-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 text-white px-4 md:px-6 py-3 md:py-4 shadow-xl'}`}
                  >
                    <RotateCcw size={20} className="md:hidden" />
                    <RotateCcw size={24} className="hidden md:block" />
                  </button>
                </div>
              </div>

              <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-white/80 border border-amber-200' : 'bg-gradient-to-br from-stone-800/90 to-stone-900/90 backdrop-blur border border-stone-600/50'}`}>
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
                  <h3 className={`text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3 ${isLightMode ? 'text-stone-800' : 'text-white'}`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg ${isLightMode ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
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
                      className={`transform transition-transform duration-300 ${(isRunning ? paramManuallyOpened : isParamOpen) ? 'rotate-180' : ''} ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${(isRunning ? paramManuallyOpened : isParamOpen) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                    <div className={`rounded-xl mt-4 md:mt-6 md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-red-50/90 to-orange-100/90 border border-red-200' : 'bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur border border-red-500/30'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className={isLightMode ? 'text-stone-700 text-sm md:text-base font-semibold' : 'text-stone-300 text-sm md:text-base font-semibold'}>Suhu Awal CPU</p>
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
                        onChange={(e) => { handleParamChange('T0', Number(e.target.value)); handleReset(); }}
                        disabled={isRunning}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-red ${isRunning ? 'opacity-50 cursor-not-allowed' : ''} ${isLightMode ? 'bg-stone-200' : 'bg-stone-700'}`}
                      />
                      <div className="flex justify-between text-xs md:text-sm text-stone-500 mt-2">
                        <span>50°C</span>
                        <span>100°C</span>
                      </div>
                    </div>

                    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-emerald-50/90 to-teal-100/90 border border-emerald-200' : 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur border border-emerald-500/30'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className={isLightMode ? 'text-stone-700 text-sm md:text-base font-semibold' : 'text-stone-300 text-sm md:text-base font-semibold'}>Suhu Ambient</p>
                          <p className={`text-lg md:text-2xl font-bold ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>T_amb</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl md:text-3xl font-bold ${isLightMode ? 'text-emerald-700' : 'text-emerald-300'}`}>{Tambient}°C</p>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="35"
                        step="1"
                        value={Tambient}
                        onChange={(e) => { handleParamChange('Tambient', Number(e.target.value)); handleReset(); }}
                        disabled={isRunning}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-green ${isRunning ? 'opacity-50 cursor-not-allowed' : ''} ${isLightMode ? 'bg-stone-200' : 'bg-stone-700'}`}
                      />
                      <div className="flex justify-between text-xs md:text-sm text-stone-500 mt-2">
                        <span>15°C</span>
                        <span>35°C</span>
                      </div>
                    </div>

                    <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-amber-50/90 to-orange-100/90 border border-amber-200' : 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur border border-amber-500/30'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className={isLightMode ? 'text-stone-700 text-sm md:text-base font-semibold' : 'text-stone-300 text-sm md:text-base font-semibold'}>Konstanta Pendinginan</p>
                          <p className={`text-lg md:text-2xl font-bold ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>k</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl md:text-3xl font-bold ${isLightMode ? 'text-amber-700' : 'text-amber-300'}`}>{k}</p>
                          <p className={`text-xs md:text-sm mt-1 ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>
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
                        onChange={(e) => { handleParamChange('k', Number(e.target.value)); handleReset(); }}
                        disabled={isRunning}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-amber ${isRunning ? 'opacity-50 cursor-not-allowed' : ''} ${isLightMode ? 'bg-stone-200' : 'bg-stone-700'}`}
                      />
                      <div className="flex justify-between text-xs md:text-sm text-stone-500 mt-2">
                        <span>0.05<br />(Pasif)</span>
                        <span>0.15<br />(Fan)</span>
                        <span>0.3<br />(Liquid)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl ${isLightMode ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/90 to-rose-50/90 border border-amber-200' : 'bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 backdrop-blur border border-amber-500/30'}`}>
                <h4 className={`text-lg md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2 md:gap-3 ${isLightMode ? 'text-stone-800' : 'text-white'}`}>
                  <span className="text-xl md:text-3xl">📐</span>
                  Newton's Law of Cooling
                </h4>

                <div
                  className={`rounded-lg md:rounded-xl relative p-4 md:p-6 mb-4 md:mb-6 ${isLightMode
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-stone-900/80 backdrop-blur border border-amber-500/20'
                    }`}
                >
                  <button
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/10 transition-colors"
                    onClick={toggleInfoDetails}
                    aria-label="Toggle details"
                  >
                    {!detailsOpen ? (
                      <ArrowDown
                        size={22}
                        className={`${isLightMode
                          ? 'text-amber-600 hover:text-amber-700'
                          : 'text-amber-400 hover:text-amber-300'
                          }`}
                      />
                    ) : (
                      <ArrowUp
                        size={22}
                        className={`${isLightMode
                          ? 'text-amber-600 hover:text-amber-700'
                          : 'text-amber-400 hover:text-amber-300'
                          }`}
                      />
                    )}
                  </button>

                  {!detailsOpen ? (
                    time !== 0 ? (
                      <div className="text-center pr-8">
                        <div className={`text-xs md:text-sm mb-2 ${isLightMode ? 'text-amber-600' : 'text-amber-300'}`}>
                          Hasil Perhitungan
                        </div>
                        <div
                          className={`text-2xl md:text-3xl font-bold mb-3 ${isLightMode
                            ? 'text-amber-600'
                            : 'text-amber-400'
                            }`}
                        >
                          T(t) = {computedTemp.toFixed(2)}°C
                        </div>
                        <div className={`text-xs md:text-sm font-mono ${isLightMode ? 'text-stone-600' : 'text-stone-300'}`}>
                          T<sub>amb</sub> + (T<sub>0</sub> − T<sub>amb</sub>) × e<sup>−k·{time.toFixed(2)}</sup>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center pr-8">
                        <div className={`text-xs md:text-sm mb-2 ${isLightMode ? 'text-amber-600' : 'text-amber-300'}`}>
                          Rumus Suhu Benda
                        </div>
                        <div className={`text-sm md:text-lg font-mono font-bold ${isLightMode ? 'text-stone-600' : 'text-stone-300'}`}>
                          T(t) =  <br></br>T<sub>amb</sub> + (T<sub>0</sub> − T<sub>amb</sub>) × e<sup>−k·t</sup>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="">
                      <div className={`text-sm md:text-base font-semibold mb-4 ${isLightMode ? 'text-amber-700' : 'text-amber-300'}`}>
                        📊 Langkah-langkah Perhitungan
                      </div>

                      <div className="space-y-4 w-full text-sm  md:text-base">
                        {/* Step 1 */}
                        <div className={`p-3 rounded-lg w-full ${isLightMode ? 'bg-white/80' : 'bg-stone-800/60'}`}>
                          <div className={`text-xs mb-1 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>
                            Langkah 1: Hitung selisih suhu awal
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-stone-700' : 'text-white'}`}>
                            ΔT = T₀ − T<sub>ambient</sub>
                          </div>
                          <div className={`font-mono mt-1 ${isLightMode ? 'text-stone-700' : 'text-white'}`}>
                            ΔT = {T0}°C − {Tambient}°C = <span className="font-bold text-orange-500">{(T0 - Tambient).toFixed(2)}°C</span>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`p-3 rounded-lg ${isLightMode ? 'bg-white/80' : 'bg-stone-800/60'}`}>
                          <div className={`text-xs mb-1 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>
                            Langkah 2: Hitung faktor peluruhan eksponensial
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-stone-700' : 'text-white'}`}>
                            e<sup>−k·t</sup> = 2.718<sup>−{k}×{time.toFixed(2)}</sup>
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-stone-700' : 'text-white'}`}>
                            e<sup>−k·t</sup> = 2.718<sup>{(-k * time).toFixed(3)}</sup>
                          </div>
                          <div className={`font-mono mt-1 ${isLightMode ? 'text-stone-700' : 'text-white'}`}>
                            e<sup>−k·t</sup> = <span className="font-bold text-orange-500">{Math.exp(-k * time).toFixed(3)}</span>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className={`p-3 rounded-lg ${isLightMode ? 'bg-white/80' : 'bg-stone-800/60'}`}>
                          <div className={`text-xs mb-1 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>
                            Langkah 3: Kalikan ΔT dengan faktor peluruhan
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-stone-700' : 'text-white'}`}>
                            ΔT × e<sup>−k·t</sup> = {(T0 - Tambient).toFixed(2)} × {Math.exp(-k * time).toFixed(3)}
                          </div>
                          <div className={`font-mono mt-1 ${isLightMode ? 'text-stone-700' : 'text-white'}`}>
                            = <span className="font-bold text-orange-500">{((T0 - Tambient) * Math.exp(-k * time)).toFixed(3)}°C</span>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className={`p-3 rounded-lg ${isLightMode ? 'bg-amber-100 border-2 border-amber-300' : 'bg-amber-900/40 border-2 border-amber-500/50'}`}>
                          <div className={`text-xs mb-1 ${isLightMode ? 'text-amber-700' : 'text-amber-300'}`}>
                            Langkah 4: Tambahkan suhu lingkungan (Hasil Akhir)
                          </div>
                          <div className={`font-mono ${isLightMode ? 'text-stone-700' : 'text-white'}`}>
                            T(t) = T<sub>ambient</sub> + ΔT × e<sup>−k·t</sup>
                          </div>
                          <div className={`font-mono mt-1 ${isLightMode ? 'text-stone-700' : 'text-white'}`}>
                            T(t) = {Tambient}°C + {((T0 - Tambient) * Math.exp(-k * time)).toFixed(3)}°C
                          </div>
                          <div className={`font-mono text-lg md:text-xl mt-2 font-bold ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>
                            = {computedTemp.toFixed(2)}°C
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="hidden md:block">
                    <div className={`overflow-x-auto rounded-lg ${isLightMode ? 'border border-stone-300' : 'border border-stone-700/40'}`}>
                      <table className="min-w-full text-sm md:text-base divide-y divide-stone-700">
                        <thead className={isLightMode ? 'bg-amber-100' : 'bg-stone-900/60'}>
                          <tr>
                            <th className={`px-4 py-3 text-left font-medium ${isLightMode ? 'text-stone-800' : 'text-stone-200'}`}>Simbol</th>
                            <th className={`px-4 py-3 text-left font-medium ${isLightMode ? 'text-stone-800' : 'text-stone-200'}`}>Keterangan</th>
                            <th className={`px-4 py-3 text-left text-sm ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>Nilai</th>
                          </tr>
                        </thead>
                        <tbody className={isLightMode ? 'bg-white' : 'bg-stone-950'}>
                          <tr className={isLightMode ? 'hover:bg-amber-50' : 'hover:bg-stone-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>T(t)</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-700' : ''}`}>Suhu CPU pada waktu t (detik)</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{temp.toFixed(1)}°C</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-amber-50' : 'hover:bg-stone-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>T_amb</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-700' : ''}`}>Suhu udara sekitar</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{Tambient}°C</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-amber-50' : 'hover:bg-stone-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-red-600' : 'text-red-400'}`}>T₀</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-700' : ''}`}>Suhu awal CPU</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{T0}°C</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-amber-50' : 'hover:bg-stone-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>k</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-700' : ''}`}>Konstanta pendinginan</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{k}</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-amber-50' : 'hover:bg-stone-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>t</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-700' : ''}`}>Waktu (detik)</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{time.toFixed(1)}s</td>
                          </tr>
                          <tr className={isLightMode ? 'hover:bg-amber-50' : 'hover:bg-stone-900/30'}>
                            <td className={`px-4 py-3 font-mono text-lg ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>e</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-700' : ''}`}>Konstanta Euler</td>
                            <td className={`px-4 py-3 ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>2.718</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="md:hidden grid grid-cols-1 gap-3">
                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-amber-50' : 'bg-stone-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>T(t)</div>
                      </div>
                      <div className="flex-1 ">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-stone-800' : 'text-stone-200'}`}>
                          Suhu CPU pada waktu t
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{temp.toFixed(1)}°C</div>
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-amber-50' : 'bg-stone-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>T_amb</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-stone-800' : 'text-stone-200'}`}>
                          Suhu udara sekitar
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{Tambient}°C</div>
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-amber-50' : 'bg-stone-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-red-600' : 'text-red-400'}`}>T₀</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-stone-800' : 'text-stone-200'}`}>
                          Suhu awal CPU
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{T0}°C</div>
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-amber-50' : 'bg-stone-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>k</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-stone-800' : 'text-stone-200'}`}>
                          Konstanta pendinginan
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{k}</div>
                      </div>
                    </div>

                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-amber-50' : 'bg-stone-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>t</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-stone-800' : 'text-stone-200'}`}>
                          Waktu
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>{time.toFixed(1)}s</div>
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 flex items-start gap-3 ${isLightMode ? 'bg-amber-50' : 'bg-stone-900/40'}`}>
                      <div className="flex-shrink-0 w-12">
                        <div className={`font-mono text-lg ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>e</div>
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${isLightMode ? 'text-stone-800' : 'text-stone-200'}`}>
                          Konstanta Euler
                        </div>
                        <div className={`text-xs ${isLightMode ? 'text-stone-600' : 'text-stone-400'}`}>2.718</div>
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
        .animation-delay-150 {
          animation-delay: 150ms;
        }

        .slider-red::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }
        
        .slider-green::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        .slider-amber::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        }

        .slider-red::-moz-range-thumb,
        .slider-green::-moz-range-thumb,
        .slider-amber::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 8px currentColor;
        }
      `}</style>
    </div>
  );
};

export default CPUCoolingSimulation;