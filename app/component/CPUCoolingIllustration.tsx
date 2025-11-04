import React, { useState, useEffect } from 'react';
import AspectRatio from '@mui/joy/AspectRatio';
import 'animate.css';
interface CPUCoolingIllustrationProps {
    temp: number;
    time: number;
    isRunning: boolean;
    params: {
        T0: number;
        Tambient: number;
        k: number;
    };
    isLightMode: boolean;
}

const CPUCoolingIllustration: React.FC<CPUCoolingIllustrationProps> = ({
    temp,
    time,
    isRunning,
    params,
    isLightMode
}) => {
    const { T0, Tambient, k } = params;
    const [rotation, setRotation] = useState(0);
    const [airOffset, setAirOffset] = useState(0);
    const [heatOffset, setHeatOffset] = useState(0);

    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                setRotation(prev => (prev + 10) % 360);
                setAirOffset(prev => (prev + 2) % 60);
                setHeatOffset(prev => (prev + 3) % 35);
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isRunning]);

    const tempRatio = (temp - Tambient) / (T0 - Tambient);
    const hue = 120 - tempRatio * 120;
    let steps: { num: string; label: string; color: string }[] = [];
    if (k <= 0.1) {
        // Heatsink Pasif
        steps = [
            { num: '1', label: 'Panas\nDihasilkan', color: isLightMode ? '#b91c1c' : '#ef4444' },
            { num: '2', label: 'Konduksi\nke Heatsink', color: isLightMode ? '#c2410c' : '#f97316' },
            { num: '3', label: 'Radiasi dari\nSirip Heatsink', color: isLightMode ? '#854d0e' : '#eab308' },
            { num: '4', label: 'Konveksi\nAlami', color: isLightMode ? '#1e40af' : '#3b82f6' },
            { num: '5', label: 'Pendinginan\nLambat', color: isLightMode ? '#15803d' : '#22c55e' }
        ];
    } else if (k <= 0.2) {
        // Fan Cooler
        steps = [
            { num: '1', label: 'Panas\nDihasilkan', color: isLightMode ? '#b91c1c' : '#ef4444' },
            { num: '2', label: 'Konduksi\nke Heatsink', color: isLightMode ? '#c2410c' : '#f97316' },
            { num: '3', label: 'Penyebaran\nPanas', color: isLightMode ? '#854d0e' : '#eab308' },
            { num: '4', label: 'Konveksi\nPaksa (Fan)', color: isLightMode ? '#1e40af' : '#3b82f6' },
            { num: '5', label: 'Pendinginan\nModerat', color: isLightMode ? '#15803d' : '#22c55e' }
        ];
    } else {
        // Liquid Cooling
        steps = [
            { num: '1', label: 'Panas\nDihasilkan', color: isLightMode ? '#b91c1c' : '#ef4444' },
            { num: '2', label: 'Konduksi ke\nWaterblock', color: isLightMode ? '#c2410c' : '#f97316' },
            { num: '3', label: 'Sirkulasi\nCairan', color: isLightMode ? '#854d0e' : '#eab308' },
            { num: '4', label: 'Transfer ke\nRadiator', color: isLightMode ? '#1e40af' : '#3b82f6' },
            { num: '5', label: 'Pendinginan\nOptimal', color: isLightMode ? '#15803d' : '#22c55e' }
        ];
    }
    let systemName = "Heatsink Pasif";
    let coolingImage = "asset/heatsink_.png";

    if (k <= 0.1) {
        systemName = "Heatsink Pasif";
        coolingImage = "asset/heatsink_.png";
    } else if (k <= 0.2) {
        systemName = "Fan Cooler";
        coolingImage = "asset/fanCooler.png";
    } else {
        systemName = "Liquid Cooling";
        coolingImage = "asset/Liquid.png";
    }

    // Arrow SVG Component
    const ArrowDown = ({ opacity = 1, color = "#60a5fa" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 24 24"><path fill={color} d="M14.716 2.25H9.284c-.714 0-1.232.596-1.232 1.256v8.849H4.483c-1.161 0-1.592 1.387-.884 2.13l.037.036l7.502 6.87a1.216 1.216 0 0 0 1.724 0l7.502-6.87l.037-.035c.708-.744.277-2.131-.884-2.131h-3.569v-8.85c0-.659-.518-1.255-1.232-1.255" /></svg>
    );

    const ArrowUp = ({ opacity = 1, color = "#ef4444" }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="32" viewBox="0 0 24 24"><path fill={color} d="M10.586 3L4 9.586a2 2 0 0 0-.434 2.18l.068.145A2 2 0 0 0 5.414 13H8v7a2 2 0 0 0 2 2h4l.15-.005A2 2 0 0 0 16 20l-.001-7h2.587A2 2 0 0 0 20 9.586L13.414 3a2 2 0 0 0-2.828 0" /></svg>
    );

    const ArrowRight = ({ opacity = 1, color = "#eab308" }) => (
        <svg width="32" height="16" viewBox="0 0 32 16" fill="none" style={{ opacity }}>
            <path d="M0 8 L28 8" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <path d="M32 8 L24 0 L28 8 L24 16 Z" fill={color} />
        </svg>
    );

    const ArrowLeft = ({ opacity = 1, color = "#eab308" }) => (
        <svg width="32" height="16" viewBox="0 0 32 16" fill="none" style={{ opacity }}>
            <path d="M32 8 L4 8" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <path d="M0 8 L8 0 L4 8 L8 16 Z" fill={color} />
        </svg>
    );

    return (
        <div className={`rounded-xl max-h-[900px] w-full p-2 mb-4  ${isLightMode ? 'bg-slate-100 ' : 'bg-black  '}`}>
            <AspectRatio
                ratio="4/3"
                className="w-full md:flex-1"
                sx={{ bgcolor: 'background.level2', borderRadius: 'md' }}
            >
                <div className={`w-full h-full relative ${isLightMode ? 'bg-blue-50/50' : 'bg-gradient-to-b from-slate-950 to-slate-900'}`}>
                    {/* Ambient Air Zone - TOP */}
                    <div
                        className="absolute top-[2%] left-[5%] w-[90%] h-[8%] border-2 border-dashed rounded-lg flex items-center justify-center"
                        style={{
                            borderColor: isLightMode ? '#af1e1eff' : '#fa6060ff',
                            backgroundColor: isLightMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(96, 165, 250, 0.1)'
                        }}
                    >
                        <span
                            className="font-bold text-[clamp(0.6rem,1.5vw,1.1rem)]"
                            style={{ color: isLightMode ? '#af1e1eff' : '#fa6060ff' }}
                        >
                            UDARA SEKITAR (T_ambient = {Tambient}°C)
                        </span>
                    </div>

                    {/* Fan - CENTER TOP */}
                    <div className="absolute top-[22%] left-[10%] -translate-x-1/2 w-[12%] aspect-square">
                        <div
                            className="w-full h-full rounded-full border-4 relative flex items-center justify-center"
                            style={{ borderColor: isLightMode ? '#8a1e1eff' : '#af1e1eff' }}
                        >
                            {/* Rotating Blades */}
                            <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                {[0, 90, 180, 270].map((angle, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-[70%] h-[30%] rounded-full"
                                        style={{
                                            background: isLightMode
                                                ? 'linear-gradient(90deg, #fd9393ff, #f63b3bff, #8a1e1eff)'
                                                : 'linear-gradient(90deg, #fa6060ff, #f63b3bff, #8a1e1eff)',
                                            transform: `rotate(${angle}deg)`,
                                            boxShadow: isLightMode ? 'none' : '0 0 10px rgba(246, 59, 59, 0.5)'
                                        }}
                                    />
                                ))}
                            </div>
                            {/* Hub */}
                            <div
                                className="absolute w-[30%] h-[30%] rounded-full z-10"
                                style={{
                                    background: isLightMode
                                        ? 'radial-gradient(circle at 30% 30%, #fedbdbff, #fd9393ff, #af1e1eff)'
                                        : 'radial-gradient(circle at 30% 30%, #fedbdbff, #fa6060ff, #af1e1eff)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                }}
                            />
                        </div>
                        {/* Fan Label */}
                        <div
                            className="absolute top-[110%] left-1/2 -translate-x-1/2 font-bold text-[clamp(0.3rem,1.6vw,0.8rem)] whitespace-nowrap"
                            style={{
                                color: isLightMode ? '#1e40af' : '#60a5fa',
                                textShadow: isLightMode ? 'none' : '0 0 10px rgba(59, 130, 246, 0.8)'
                            }}
                        >
                            FAN (KIPAS)
                        </div>
                    </div>

                    {/* Fan - CENTER TOP */}
                    <div className="absolute top-[22%] right-[10%] translate-x-1/2 w-[12%] aspect-square">
                        <div
                            className="w-full h-full rounded-full border-4 relative flex items-center justify-center"
                            style={{ borderColor: isLightMode ? '#1e3a8a' : '#1e40af' }}
                        >
                            {/* Rotating Blades */}
                            <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                {[0, 90, 180, 270].map((angle, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-[70%] h-[30%] rounded-full"
                                        style={{
                                            background: isLightMode
                                                ? 'linear-gradient(90deg, #93c5fd, #3b82f6, #1e3a8a)'
                                                : 'linear-gradient(90deg, #60a5fa, #3b82f6, #1e3a8a)',
                                            transform: `rotate(${angle}deg)`,
                                            boxShadow: isLightMode ? 'none' : '0 0 10px rgba(59, 130, 246, 0.5)'
                                        }}
                                    />
                                ))}
                            </div>
                            {/* Hub */}
                            <div
                                className="absolute w-[30%] h-[30%] rounded-full z-10"
                                style={{
                                    background: isLightMode
                                        ? 'radial-gradient(circle at 30% 30%, #dbeafe, #93c5fd, #1e40af)'
                                        : 'radial-gradient(circle at 30% 30%, #dbeafe, #60a5fa, #1e40af)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                }}
                            />
                        </div>
                        {/* Fan Label */}
                        <div
                            className="absolute top-[110%] left-1/2 -translate-x-1/2 font-bold text-[clamp(0.3rem,1.6vw,0.8rem)] whitespace-nowrap"
                            style={{
                                color: isLightMode ? '#1e40af' : '#60a5fa',
                                textShadow: isLightMode ? 'none' : '0 0 10px rgba(59, 130, 246, 0.8)'
                            }}
                        >
                            FAN (KIPAS)
                        </div>
                    </div>

                    {/* Cold Air Arrows - RIGHT */}
                    {time != 0 && (
                        <div className="absolute top-[18%] right-[20%] flex flex-col gap-[8%]">
                            <div className={`${isRunning ? "arrowDown" : ""}`}>
                                <ArrowDown color={isLightMode ? '#1e40af' : '#60a5fa'} />
                            </div>
                            <div className={`${isRunning ? "arrowDown" : ""}`}>
                                <ArrowDown color={isLightMode ? '#1e40af' : '#60a5fa'} />
                            </div>
                            <div className={`${isRunning ? "arrowDown" : ""}`}>
                                <ArrowDown color={isLightMode ? '#1e40af' : '#60a5fa'} />
                            </div>
                        </div>
                    )}

                    {/* Cold Air Label - TOP RIGHT */}
                    <div
                        className="absolute top-[12%] right-[3%] text-right font-bold text-[clamp(0.6rem,1.5vw,1rem)]"
                        style={{
                            color: isLightMode ? '#1e40af' : '#60a5fa',
                            textShadow: isLightMode ? 'none' : '0 0 8px rgba(96, 165, 250, 0.8)'
                        }}
                    >
                        <div>Udara Dingin</div>
                        <div>Masuk ↓</div>
                    </div>

                    {/* Hot Air Arrows - LEFT */}
                    {time != 0 && (
                        <div className="absolute top-[22%] left-[20%] flex flex-col gap-[100%]">
                            <div className={`${isRunning ? "arrowUp" : ""}`}>
                                <ArrowUp color={isLightMode ? '#af1e1eff' : '#fa6060ff'} />
                            </div>
                            <div className={`${isRunning ? "arrowUp" : ""}`}>
                                <ArrowUp color={isLightMode ? '#af1e1eff' : '#fa6060ff'} />
                            </div>
                            <div className={`${isRunning ? "arrowUp" : ""}`}>
                                <ArrowUp color={isLightMode ? '#af1e1eff' : '#fa6060ff'} />
                            </div>
                        </div>
                    )}


                    {/* Hot Air Label - TOP LEFT */}
                    <div
                        className="absolute top-[12%] left-[3%] text-left font-bold text-[clamp(0.6rem,1.5vw,1rem)]"
                        style={{
                            color: isLightMode ? '#b91c1c' : '#ef4444',
                            textShadow: isLightMode ? 'none' : '0 0 8px rgba(239, 68, 68, 0.8)'
                        }}
                    >
                        <div>Udara Panas</div>
                        <div>Keluar ↑</div>
                    </div>

                    {/* Cooling System Image */}
                    <div className={`absolute ${k <= 0.2 ? 'top-[16%] left-[51%]' : 'top-[12%] left-[50%]'} z-10 -translate-x-1/2  w-[34%] aspect-square`}>
                        <img
                            src={coolingImage}
                            alt="Cooling System"
                            className={`w-full h-full   object-contain duration-500  ${isRunning || time != 0 ? 'translate-y-[10%]' : 'translate-y-[52%]'}  `}
                            style={{
                                filter: isLightMode ? 'none' : 'drop-shadow(0 0 15px rgba(100, 150, 200, 0.4))'
                            }}
                        />
                        {/* System Name Label */}
                        <div
                            className={`absolute  left-[50%] -translate-x-[50%] ${isRunning || time != 0 ? "top-[0%]" : "top-[5%]"} duration-500  font-bold text-[clamp(0.6rem,1.3vw,0.9rem)] whitespace-nowrap`}
                            style={{
                                color: '#60a5fa',
                                textShadow: '0 0 8px rgba(59, 130, 246, 0.8)'
                            }}
                        >
                            {systemName}
                        </div>
                    </div>

                    {/* Heat Conduction Arrows (CPU to Heatsink) */}
                    {tempRatio > 0.05 && time != 0 && (
                        <>
                            <div className="absolute top-[58%] left-[38%] flex flex-col gap-[5%]">
                                <div className={`${isRunning ? "arrowUp" : ""}`}>
                                    <ArrowUp color={isLightMode ? '#af1e1eff' : '#fa6060ff'} />
                                </div>
                                <div className={`${isRunning ? "arrowUp" : ""}`}>
                                    <ArrowUp color={isLightMode ? '#af1e1eff' : '#fa6060ff'} />
                                </div>
                                <div className={`${isRunning ? "arrowUp" : ""}`}>
                                    <ArrowUp color={isLightMode ? '#af1e1eff' : '#fa6060ff'} />
                                </div>
                            </div>
                            <div className="absolute top-[58%] right-[38%] flex flex-col gap-[5%]">
                                <div className={`${isRunning ? "arrowUp" : ""}`}>
                                    <ArrowUp color={isLightMode ? '#af1e1eff' : '#fa6060ff'} />
                                </div>
                                <div className={`${isRunning ? "arrowUp" : ""}`}>
                                    <ArrowUp color={isLightMode ? '#af1e1eff' : '#fa6060ff'} />
                                </div>
                                <div className={`${isRunning ? "arrowUp" : ""}`}>
                                    <ArrowUp color={isLightMode ? '#af1e1eff' : '#fa6060ff'} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Conduction Label - RIGHT */}
                    
                        <div
                            className={`absolute duration-500 ${time != 0 && tempRatio > 0.05 ? " top-[47%] opacity-100 right-[23%]" : "top-[53%] right-[27%] opacity-0"}  text-left font-bold text-[clamp(0.6rem,1.4vw,0.95rem)]`}
                            style={{
                                color: isLightMode ? '#c2410c' : '#fb923c',
                                textShadow: isLightMode ? 'none' : '0 0 8px rgba(251, 146, 60, 0.8)'
                            }}
                        >
                            <div>Konduksi</div>
                            <div>Panas ↑</div>
                        </div>
                    

                    {/* Heat Dissipation Arrows - Sides (based on k value) */}
                    {k <= 0.1 && tempRatio > 0.05 && (
                        <>
                            {/* Left arrows */}
                            <div className={`absolute top-[38%] duration-500 ${isRunning || time != 0 ? "left-[40%] opacity-100" : "left-[45%] opacity-0"} flex flex-col gap-[8%]`}>

                                {[0, 1].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            opacity: 0.3 + tempRatio * 0.5,
                                            transform: `translateX(-${((heatOffset + i * 20) % 40) * 0.6}px)`
                                        }}
                                    >
                                        <ArrowLeft color={isLightMode ? '#854d0e' : '#eab308'} />
                                    </div>
                                ))}
                            </div>
                            {/* Right arrows */}
                            <div className={`absolute top-[38%] duration-500 ${isRunning || time != 0 ? "right-[34%] opacity-100" : "right-[39%] opacity-0"} flex flex-col gap-[8%]`}>
                                {[0, 1].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            opacity: 0.3 + tempRatio * 0.5,
                                            transform: `translateX(${((heatOffset + i * 20) % 40) * 0.6}px)`
                                        }}
                                    >
                                        <ArrowRight color={isLightMode ? '#854d0e' : '#eab308'} />
                                    </div>
                                ))}
                            </div>
                            {/* Labels */}


                        </>
                    )}
                    <div
                        className={`absolute duration-500 ${time != 0 && tempRatio > 0.05  && k <= 0.2? "top-[50%] opacity-100 left-[20%]" : "top-[55%] left-[25%] opacity-0"} text-right font-bold text-[clamp(0.55rem,1.3vw,0.85rem)]`}
                        style={{
                            color: isLightMode ? '#854d0e' : '#eab308',
                            textShadow: isLightMode ? 'none' : '0 0 8px rgba(234, 179, 8, 0.8)'
                        }}
                    >
                        <div>Penyebaran</div>
                        <div>Panas →</div>
                    </div>
                    {k > 0.1 && k <= 0.2 && tempRatio > 0.05 && (
                        <>
                            {/* Right arrows only */}
                            <div className={`absolute duration-500 ${ time != 0 ? "top-[38%]  right-[30%] opacity-100" : "top-[43%] right-[35%] opacity-0"} flex flex-col gap-[8%]`}>
                                {[0, 1].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            opacity: 0.3 + tempRatio * 0.5,
                                            transform: `translateX(${((heatOffset + i * 20) % 40) * 0.6}px)`
                                        }}
                                    >
                                        <ArrowRight color={isLightMode ? '#854d0e' : '#eab308'} />
                                    </div>
                                ))}
                            </div>
                            <div
                                className={`absolute duration-500 ${isRunning || time != 0 ? "top-[37%] left-[30%] opacity-100" : "top-[43%] opacity-0 left-[35%]"}  text-right font-bold text-[clamp(0.55rem,1.3vw,0.85rem)]`}
                                style={{
                                    color: isLightMode ? '#854d0e' : '#eab308',
                                    textShadow: isLightMode ? 'none' : '0 0 8px rgba(234, 179, 8, 0.8)'
                                }}
                            >
                                <div>Konveksi</div>
                                <div>Paksa →</div>
                            </div>
                        </>
                    )}

                    {k > 0.2 && (
                        <div
                            className={`absolute duration-500 ${time != 0 ? "top-[50%] opacity-100 left-[18%] " : "top-[55%] opacity-0 left-[25%] "} text-left font-bold text-[clamp(0.5rem,1.2vw,0.8rem)]`}
                            style={{
                                color: isLightMode ? '#854d0e' : '#eab308',
                                textShadow: isLightMode ? 'none' : '0 0 8px rgba(234, 179, 8, 0.8)'
                            }}
                        >
                            <div className="flex items-center gap-1">
                                <span>Sirkulasi Cairan 🔄</span>
                                <ArrowRight color={isLightMode ? '#854d0e' : '#eab308'} />
                            </div>
                            <div>Transfer Ke Radiator</div>
                        </div>
                    )}

                    {/* CPU */}
                    <div className="absolute top-[55%] left-1/2 z-1 -translate-x-1/2 w-[30%] aspect-square">
                        <img
                            src="asset/CPU.png"
                            alt="CPU"
                            className="w-full h-full object-contain "
                            style={{
                                filter: `drop-shadow(0 0 ${15 + tempRatio * 10}px hsla(${hue}, 80%, 50%, ${0.6 + tempRatio * 0.4}))`
                            }}
                        />
                        {/* Temperature Display */}
                        <div
                            className="absolute -right-[69%] top-[10%] font-bold text-[clamp(1rem,2.5vw,2rem)] whitespace-nowrap font-mono"
                            style={{
                                color: `hsl(${hue}, 80%, ${isLightMode ? '40%' : '60%'})`,
                                textShadow: isLightMode ? 'none' : `0 0 15px hsl(${hue}, 80%, 50%)`
                            }}
                        >
                            {temp.toFixed(2)}°C
                        </div>
                    </div>

                    {/* CPU Heat Generation Label */}
                    
                        <div
                            className={`absolute duration-500 ${time !=0 && tempRatio > 0.05 ? "bottom-[24%] right-[12%]" :"opacity-0 bottom-[20%] right-[20%]"}    font-bold text-[clamp(0.65rem,1.6vw,1.05rem)]`}
                            style={{
                                color: isLightMode ? '#b91c1c' : '#ef4444',
                                textShadow: isLightMode ? 'none' : '0 0 10px rgba(239, 68, 68, 0.8)'
                            }}
                        >
                            <div>CPU Menghasilkan</div>
                            <div>Panas</div>
                        </div>
                

                    {/* Heat Generation Waves */}
                        <div className={`absolute ${time != 0 && tempRatio > 0.1 ? "opacity-100" : "opacity-0"} duration-500 bottom-[30%] z-2 left-1/2 -translate-x-1/2 w-[15%]`}>
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full"
                                    style={{
                                        height: '2px',
                                        background: `rgba(239, 68, 68, ${tempRatio * 0.7})`,
                                        borderRadius: '50%',
                                        transform: `translateY(${-i * 30 - (heatOffset * 0.8)}px) scaleX(${1 + i * 0.3})`,
                                        opacity: 1 - (i * 0.3)
                                    }}
                                />
                            ))}
                        </div>

                    {/* Steps - Bottom Row */}
                    <div
                        className="absolute bottom-[4%] left-[50%] -translate-x-1/2 w-[96%] h-[10%] flex items-center justify-center transition-all duration-500"
                        style={{
                            gap: isRunning ? '1%' : '0.2%'
                        }}
                    >
                        {steps.map((step, index) => (
                            <React.Fragment key={index}>
                                {/* Step Card */}
                                <div
                                    className="flex flex-col items-center justify-center rounded-lg h-[100%] backdrop-blur-sm transition-all duration-500 hover:scale-105"
                                    style={{
                                        width: isRunning ? '16%' : '18%',

                                    }}
                                >
                                    {/* Number Badge */}
                                    <div
                                        className="rounded-full flex items-center justify-center font-bold text-[clamp(0.6rem,1.5vw,1rem)] mb-[3%]"
                                        style={{
                                            width: '30%',
                                            aspectRatio: '1/1',
                                            backgroundColor: step.color,
                                            color: '#ffffff',
                                            boxShadow: isLightMode ? 'none' : `0 0 10px ${step.color}`
                                        }}
                                    >
                                        {step.num}
                                    </div>
                                    {/* Label */}
                                    <div
                                        className="text-center font-semibold text-[clamp(0.45rem,1.1vw,0.7rem)] leading-tight whitespace-pre-line"
                                        style={{
                                            color: isLightMode ? '#1e293b' : '#e2e8f0',
                                            textShadow: isLightMode ? 'none' : '0 1px 3px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        {step.label}
                                    </div>
                                </div>

                                {/* Arrow Between Steps */}
                                {index < steps.length - 1 && (
                                    <div
                                        className="flex-shrink-0 transition-all duration-500 flex items-center justify-center"
                                        style={{
                                            width: isRunning ? '2%' : '0%',
                                            opacity: isRunning ? 0.7 : 0,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <svg
                                            width="100%"
                                            height="100%"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            <path
                                                d="M9 5L16 12L9 19"
                                                stroke={isLightMode ? '#64748b' : '#94a3b8'}
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Formula
          <div 
            className="absolute bottom-[1%] left-1/2 -translate-x-1/2 font-bold text-[clamp(0.6rem,1.5vw,1.2rem)] font-mono whitespace-nowrap"
            style={{ 
              color: isLightMode ? '#1e293b' : '#e2e8f0',
              textShadow: isLightMode ? 'none' : '0 0 8px rgba(59, 130, 246, 0.5)'
            }}
          >
            T(t) = T_ambient + (T₀ - T_ambient) × e^(-kt)
          </div> */}
                </div>
            </AspectRatio>
            <style jsx>{`

                .arrowUp {
                    animation: arrowUpAnim 1.5s linear infinite; 
                }
                    .arrowDown {
                    animation: arrowDownAnim 1.5s linear infinite; 
                }
                @keyframes arrowUpAnim {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-30px); opacity: 0; }
                }
                @keyframes arrowDownAnim {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(30px); opacity: 0; }
                }
            
        `}   </style>
        </div>

    );
};



export default CPUCoolingIllustration;