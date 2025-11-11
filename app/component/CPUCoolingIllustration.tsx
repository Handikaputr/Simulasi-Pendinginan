import React, { useState, useEffect } from 'react';
import AspectRatio from '@mui/joy/AspectRatio';
import 'animate.css';
import { Maximize2, Footprints, Zap, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';
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
    onFullscreenChange?: (isFullscreen: boolean) => void;
    onStepModeChange?: (stepMode: boolean) => void;
    onRunningChange?: (isRunning: boolean) => void;
    onTimeChange?: (time: number) => void;
    onTempChange?: (temp: number) => void;
    onSpeedChange?: (speed: number) => void;
}

// ==================== STEP MODE CONFIGURATION ====================
// Konfigurasi untuk setiap tahap pendinginan berdasarkan tempRatio
interface StepConfig {
    tempRatioThreshold: number; // Batas tempRatio untuk step ini
    title: string; // Judul step
    description: string; // Deskripsi detail
    cpuScale: number; // Skala CPU (1 = normal, 1.5 = 1.5x lebih besar)
    cpuTop: string; // Posisi top CPU (e.g., "55%", "60%")
    cpuLeft: string; // Posisi left CPU (e.g., "50%")
    cpuOpacity: number; // Opacity CPU (0-1)
    coolerOpacity: number; // Opacity cooler (0-1)
    coolerScale: number; // Skala cooler
    coolerTop: string; // Posisi top cooler (e.g., "12%", "16%")
    coolerLeft: string; // Posisi left cooler (e.g., "50%", "51%")
    highlightColor: string; // Warna highlight untuk elemen
    customElements?: string[]; // Array nama element yang akan ditampilkan
    // Contoh: customElements: ["pulseEffect", "warningBox", "heatWaves"]
    // Jika element ada di array, maka ditampilkan. Tidak perlu true/false!
}

// Konfigurasi untuk 3 sistem pendinginan
const COOLING_SYSTEMS_STEPS = {
    // k <= 0.1 - Heatsink Pasif
    passive: [
        {
            tempRatioThreshold: 0.95,
            title: "Step 1: Panas Dihasilkan",
            description: "CPU menghasilkan panas saat beroperasi. Suhu meningkat dengan cepat.",
            cpuScale: 2.0,
            cpuTop: "2%",
            cpuLeft: "50%",
            cpuOpacity: 1,
            coolerOpacity: 0,
            coolerScale: 1,
            coolerTop: "-2%",
            coolerLeft: "51%",
            highlightColor: "#ef4444",
            customElements: ["heatWaves", "warningBox", "pulseEffect"]
        },
        {
            tempRatioThreshold: 0.8,
            title: "Step 2: Konduksi ke Heatsink",
            description: "Panas berpindah dari CPU ke heatsink melalui konduksi termal.",
            cpuScale: 1.2,
            cpuTop: "42%",
            cpuLeft: "50%",
            cpuOpacity: 1,
            coolerOpacity: 1,
            coolerScale: 1.5,
            coolerTop: "10%",
            coolerLeft: "50%",
            highlightColor: "#f97316",
            customElements: ["heatWaves", "conductionLabel", "contactArea"]
        },
        {
            tempRatioThreshold: 0.6,
            title: "Step 3: Radiasi dari Sirip Heatsink",
            description: "Sirip heatsink meradiasikan panas ke udara sekitar.",
            cpuScale: 1.2,
            cpuTop: "47%",
            cpuLeft: "50%",
            cpuOpacity: 1,
            coolerOpacity: 1,
            coolerScale: 1.5,
            coolerTop: "12%",
            coolerLeft: "50%",
            highlightColor: "#eab308"
        },
        {
            tempRatioThreshold: 0.3,
            title: "Step 4: Konveksi Alami",
            description: "Udara panas naik secara alami, udara dingin menggantikan posisinya.",
            cpuScale: 1.2,
            cpuTop: "47%",
            cpuLeft: "50%",
            cpuOpacity: 1,
            coolerOpacity: 1,
            coolerScale: 1.5,
            coolerTop: "12%",
            coolerLeft: "50%",
            highlightColor: "#3b82f6"
        },
        {
            tempRatioThreshold: 0.01,
            title: "Step 5: Pendinginan Lambat",
            description: "Suhu CPU menurun perlahan mendekati suhu ambient.",
            cpuScale: 1.2,
            cpuTop: "47%",
            cpuLeft: "50%",
            cpuOpacity: 1,
            coolerOpacity: 1,
            coolerScale: 1.5,
            coolerTop: "12%",
            coolerLeft: "50%",
            highlightColor: "#22c55e"
        }
    ],
    // k > 0.1 && k <= 0.2 - Fan Cooler
    fan: [
        {
            tempRatioThreshold: 0.95,
            title: "Step 1: Panas Dihasilkan",
            description: "CPU menghasilkan panas saat beroperasi dengan beban tinggi.",
            cpuScale: 2.0,
            cpuTop: "8%",
            cpuLeft: "50%",
            cpuOpacity: 1,
            coolerOpacity: 0,
            coolerScale: 1,
            coolerTop: "-2%",
            coolerLeft: "51%",
            highlightColor: "#ef4444"
        },
        {
            tempRatioThreshold: 0.75,
            title: "Step 2: Konduksi ke Heatsink",
            description: "Panas berpindah dari CPU ke heatsink dengan fan cooler melalui konduksi.",
            cpuScale: 1.5,
            cpuTop: "24%",
            cpuLeft: "51%",
            cpuOpacity: 1,
            coolerOpacity: 1,
            coolerScale: 1.5,
            coolerTop: "10%",
            customElements: ["heatsink"],
            coolerLeft: "51%",
            highlightColor: "#f97316"
        },
        {
            tempRatioThreshold: 0.5,
            title: "Step 3: Penyebaran Panas",
            description: "Panas menyebar ke seluruh sirip heatsink untuk area pendinginan lebih luas.",
            cpuScale: 1.5,
            cpuTop: "24%",
            cpuLeft: "51%",
            cpuOpacity: 0,
            coolerOpacity: 0.4,
            coolerScale: 1.5,
            coolerTop: "16%",
            coolerLeft: "51%",
            customElements: ["anthena"],
            highlightColor: "#eab308"
        },
        {
            tempRatioThreshold: 0.25,
            title: "Step 4: Konveksi Paksa (Fan)",
            description: "Kipas memaksa udara mengalir melewati heatsink, mempercepat perpindahan panas.",
            cpuScale: 1.5,
            cpuTop: "22%",
            cpuLeft: "50%",
            cpuOpacity: 0,
            coolerOpacity: 0.4,
            coolerScale: 1.5,
            coolerTop: "16%",
            customElements: ["fan"],
            coolerLeft: "55%",
            highlightColor: "#3b82f6"
        },
        {
            tempRatioThreshold: 0.01,
            title: "Step 5: Pendinginan Moderat",
            description: "Suhu CPU turun dengan kecepatan moderat mencapai suhu stabil.",
            cpuScale: 1.3,
            cpuTop: "42%",
            cpuLeft: "50%",
            cpuOpacity: 1,
            coolerOpacity: 1,
            coolerScale: 1.3,
            coolerTop: "12%",
            coolerLeft: "51%",
            highlightColor: "#22c55e"
        }
    ],
    // k > 0.2 - Liquid Cooling
    liquid: [
        {
            tempRatioThreshold: 0.95,
            title: "Step 1: Panas Dihasilkan",
            description: "CPU menghasilkan panas intensif yang memerlukan pendinginan liquid.",
            cpuScale: 2.0,
            cpuTop: "2%",
            cpuLeft: "50%",
            cpuOpacity: 1,
            coolerOpacity: 0,
            coolerScale: 1,
            coolerTop: "-2%",
            coolerLeft: "51%",
            highlightColor: "#ef4444"
        },
        {
            tempRatioThreshold: 0.7,
            title: "Step 2: Konduksi ke Waterblock",
            description: "Panas diserap oleh waterblock yang berisi cairan pendingin.",
            cpuScale: 1.6,
            cpuTop: "35%",
            cpuLeft: "51%",
            cpuOpacity: 1,
            coolerOpacity: 1,
            coolerScale: 1.6,
            coolerTop: "17%",
            coolerLeft: "51%",
            customElements: ["waterblock"],
            highlightColor: "#f97316"
        },
        {
            tempRatioThreshold: 0.45,
            title: "Step 3: Sirkulasi Cairan",
            description: "Pompa mensirkulasikan cairan panas dari waterblock ke radiator.",
            cpuScale: 1.5,
            cpuTop: "32%",
            cpuLeft: "51%",
            cpuOpacity: 0.4,
            coolerOpacity: 0.3,
            coolerScale: 1.5,
            coolerTop: "14%",
            coolerLeft: "51%",
            customElements: ["sirkulasi"],
            highlightColor: "#eab308"
        },
        {
            tempRatioThreshold: 0.2,
            title: "Step 4: Transfer ke Radiator",
            description: "Radiator melepaskan panas dari cairan ke udara dengan bantuan fan.",
            cpuScale: 1.5,
            cpuTop: "34%",
            cpuLeft: "51%",
            cpuOpacity: 0.4,
            coolerOpacity: 0.3,
            coolerScale: 1.5,
            coolerTop: "16%",
            coolerLeft: "51%",
            customElements: ["radiator"],
            highlightColor: "#3b82f6"
        },
        {
            tempRatioThreshold: 0.01,
            title: "Step 5: Pendinginan Optimal",
            description: "Sistem liquid cooling memberikan pendinginan maksimal dan suhu stabil.",
            cpuScale: 1.2,
            cpuTop: "47%",
            cpuLeft: "50%",
            cpuOpacity: 1,
            coolerOpacity: 1,
            coolerScale: 1.3,
            coolerTop: "14%",
            coolerLeft: "50%",
            highlightColor: "#22c55e"
        }
    ]
};
// ==================== END CONFIGURATION ====================

const CPUCoolingIllustration: React.FC<CPUCoolingIllustrationProps> = ({
    temp,
    time,
    isRunning,
    params,
    isLightMode,
    onFullscreenChange,
    onStepModeChange,
    onRunningChange,
    onTimeChange,
    onTempChange,
    onSpeedChange
}) => {
    const { T0, Tambient, k } = params;
    const [rotation, setRotation] = useState(0);
    const [airOffset, setAirOffset] = useState(0);
    const [heatOffset, setHeatOffset] = useState(0);
    const [stepMode, setStepMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [manualStepIndex, setManualStepIndex] = useState(0);
    const [speedMultiplier, setSpeedMultiplier] = useState(1); // 0.5x, 1x, 1.5x, 2x

    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                setRotation(prev => (prev + 10) % 360);
                setAirOffset(prev => (prev + 2) % 60);
                setHeatOffset(prev => (prev + 3) % 35);
            }, 50 / speedMultiplier); // BAGI dengan speedMultiplier (0.5x = lambat, 2x = cepat)
            return () => clearInterval(interval);
        }
    }, [isRunning, speedMultiplier]);

    const tempRatio = (temp - Tambient) / (T0 - Tambient);
    const hue = 120 - tempRatio * 120;

    // Helper function: Determine cooling system type
    const getCoolingSystemType = (): 'passive' | 'fan' | 'liquid' => {
        if (k <= 0.1) return 'passive';
        if (k <= 0.2) return 'fan';
        return 'liquid';
    };

    // Helper function: Get current step based on tempRatio or manual index
    const getCurrentStep = (): StepConfig => {
        const systemType = getCoolingSystemType();
        const stepsConfig = COOLING_SYSTEMS_STEPS[systemType];

        // Jika mode manual (autoPlay off), gunakan manualStepIndex
        if (stepMode && !autoPlay) {
            return stepsConfig[manualStepIndex] || stepsConfig[0];
        }

        // Mode auto: Find the appropriate step based on tempRatio
        for (let i = 0; i < stepsConfig.length; i++) {
            if (tempRatio >= stepsConfig[i].tempRatioThreshold) {
                return stepsConfig[i];
            }
        }

        // Default to last step if tempRatio is very low
        return stepsConfig[stepsConfig.length - 1];
    };

    // Get current step index untuk auto mode
    const getCurrentStepIndex = (): number => {
        const systemType = getCoolingSystemType();
        const stepsConfig = COOLING_SYSTEMS_STEPS[systemType];

        for (let i = 0; i < stepsConfig.length; i++) {
            if (tempRatio >= stepsConfig[i].tempRatioThreshold) {
                return i;
            }
        }
        return stepsConfig.length - 1;
    };

    // Get current step configuration
    const currentStepConfig = stepMode ? getCurrentStep() : null;

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

    // ==================== STEP CONTROL FUNCTIONS ====================
    const handlePrevStep = () => {
        const systemType = getCoolingSystemType();
        const stepsConfig = COOLING_SYSTEMS_STEPS[systemType];
        
        if (manualStepIndex > 0) {
            const newStepIndex = manualStepIndex - 1;
            setManualStepIndex(newStepIndex);
            
            const targetStep = stepsConfig[newStepIndex];
            const targetTempRatio = targetStep.tempRatioThreshold;
            
          
            const { T0, Tambient, k } = params;
            const newTime = -Math.log(targetTempRatio) / k;
            const newTemp = Tambient + (T0 - Tambient) * targetTempRatio;
            
            onTimeChange?.(newTime);
            onTempChange?.(newTemp);
        }
    };

    const handleNextStep = () => {
        const systemType = getCoolingSystemType();
        const stepsConfig = COOLING_SYSTEMS_STEPS[systemType];
        
        if (manualStepIndex < stepsConfig.length - 1) {
            const newStepIndex = manualStepIndex + 1;
            setManualStepIndex(newStepIndex);
            
            // Update waktu dan temp berdasarkan step berikutnya
            const targetStep = stepsConfig[newStepIndex];
            const targetTempRatio = targetStep.tempRatioThreshold;
            
            // Hitung waktu yang diperlukan untuk mencapai tempRatio target
            const { T0, Tambient, k } = params;
            const newTime = -Math.log(targetTempRatio) / k;
            const newTemp = Tambient + (T0 - Tambient) * targetTempRatio;
            
            onTimeChange?.(newTime);
            onTempChange?.(newTemp);
        }
    };

    const handleToggleAutoPlay = () => {
        const newAutoPlay = !autoPlay;
        setAutoPlay(newAutoPlay);
        
        if (!newAutoPlay) {
            setManualStepIndex(getCurrentStepIndex());
            onRunningChange?.(false);
        } else {
            onRunningChange?.(true);
        }
    };

    // Sinkronisasi autoPlay dengan isRunning
    useEffect(() => {
        if (stepMode) {
            if (isRunning && !autoPlay) {
                // Jika play tapi mode manual, switch ke auto
                setAutoPlay(true);
            } else if (!isRunning && autoPlay) {
                // Jika pause tapi mode auto, switch ke manual
                setAutoPlay(false);
                setManualStepIndex(getCurrentStepIndex());
            }
        }
    }, [isRunning, stepMode]);

    // Reset manualStepIndex 
    useEffect(() => {
        if (stepMode && time === 0 && Math.abs(temp - T0) < 0.1) {
            // Reset manual step index ke step pertama
            setManualStepIndex(0);
        }
    }, [time, temp, T0, stepMode]);

    const ArrowLeft = ({ opacity = 1, color = "#eab308" }) => (
        <svg width="32" height="16" viewBox="0 0 32 16" fill="none" style={{ opacity }}>
            <path d="M32 8 L4 8" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <path d="M0 8 L8 0 L4 8 L8 16 Z" fill={color} />
        </svg>
    );

    return (
        <div className={`rounded-xl ${isFullscreen ? '' : '2xl:max-h-[900px]'} w-full p-2 mb-4 2xl:mb-0  ${isLightMode ? 'bg-slate-100 ' : 'bg-black  '}`}>
            {stepMode ? (


                <AspectRatio
                    ratio="4/3"
                    className="w-full md:flex-1"
                    sx={{ bgcolor: 'background.level2', borderRadius: 'md' }}
                >
                    <div className={`w-full h-full relative ${isLightMode ? 'bg-blue-50/50' : 'bg-gradient-to-b from-slate-950 to-slate-900'}`}>
                        {/* ==================== COMIC STYLE DIALOG BOX ==================== */}
                        {currentStepConfig && (
                            <>
                            <div className="img_box w-[30%] bottom-0 -right-[5%] absolute z-2">
                                <img src="./asset/arlotTalk.svg" className='w-[200%]' alt="" />
                            </div>
                            <div className="absolute bottom-[2%] right-[20%] z-20 max-w-[90%] w-fit">
                                {/* Dialog Bubble */}
                                <div className="relative">
                                    {/* Main Bubble */}
                                    <div
                                        className="rounded-xl shadow-lg"
                                        style={{
                                            padding: '2%',
                                            backgroundColor: isLightMode ? '#f8fafc' : '#1e293b',
                                            border: 'none',
                                        }}
                                    >
                                        {/* Title */}
                                        <div
                                            className="font-bold"
                                            style={{
                                                fontSize: isFullscreen ? 'clamp(0.85rem, 1.7vw, 1.7rem)' : 'clamp(0.5rem, 1.3vw, 0.85rem)',
                                                color: currentStepConfig.highlightColor,
                                                marginBottom: '1%',
                                            }}
                                        >
                                            {currentStepConfig.title}
                                        </div>
                                        
                                        {/* Description */}
                                        <div
                                            style={{
                                                fontSize: isFullscreen ? 'clamp(0.68rem, 1.3vw, 1.3rem)' : 'clamp(0.38rem, 0.95vw, 0.6rem)',
                                                color: isLightMode ? '#475569' : '#cbd5e1',
                                            }}
                                        >
                                            {currentStepConfig.description}
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="flex" style={{ marginTop: '3%', gap: '2%' }}>
                                            {COOLING_SYSTEMS_STEPS[getCoolingSystemType()].map((step, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        height: '2px',
                                                        backgroundColor: tempRatio >= step.tempRatioThreshold
                                                            ? currentStepConfig.highlightColor
                                                            : isLightMode ? '#cbd5e1' : '#475569'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Comic Speech Bubble Tail - Pointing Right */}
                                    <div className="absolute" style={{ right: '-5%', bottom: '15%' }}>
                                        {/* Outer tail */}
                                        <div
                                            style={{
                                                width: 0,
                                                height: 0,
                                                borderLeft: `20px solid ${isLightMode ? '#f8fafc' : '#1e293b'}`,
                                                borderTop: '10px solid transparent',
                                                borderBottom: '10px solid transparent',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            </>
                        )}
                        {/* ==================== END DIALOG BOX ==================== */}

                        {/* ==================== CUSTOM ELEMENTS BERDASARKAN STEP ==================== */}
                        {/* Contoh 1: Warning Box khusus untuk Step 1 */}
                        {currentStepConfig?.customElements?.includes("warningBox") && (
                            <div
                                className={`absolute top-[23%] right-[5%] px-3 py-2 rounded-lg border-2 ${isLightMode ? 'bg-red-50 border-red-400' : 'bg-red-900/30 border-red-500'
                                    } animate__animated animate__pulse animate__infinite`}
                            >
                                <div className="text-[clamp(0.6rem,1.4vw,0.9rem)] font-bold text-red-600">
                                    ⚠️ Suhu Tinggi!
                                </div>
                            </div>
                        )}

                        {/* Contoh 2: Pulse Effect pada CPU */}
                        {currentStepConfig?.customElements?.includes("pulseEffect") && (
                            <div
                                className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[35%] aspect-square pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle, ${currentStepConfig.highlightColor}40 0%, transparent 70%)`,
                                    animation: 'pulse 2s ease-in-out infinite'
                                }}
                            />
                        )}

                        {/* Contoh 3: Contact Area Label untuk konduksi */}
                        {currentStepConfig?.customElements?.includes("contactArea") && (
                            <div className="absolute top-[48%] left-[20%] text-[clamp(0.5rem,1.2vw,0.8rem)] font-bold"
                                style={{
                                    color: currentStepConfig.highlightColor,
                                    textShadow: isLightMode ? 'none' : `0 0 8px ${currentStepConfig.highlightColor}`
                                }}
                            >
                                📍 Area Kontak Termal
                            </div>
                        )}
                        {/* ==================== END CUSTOM ELEMENTS ==================== */}


                        {/* Cooling System Image */}
                        <div className="absolute z-10 -translate-x-1/2 w-[34%] aspect-square transition-all duration-700 ease-in-out"
                            style={{
                                top: currentStepConfig?.coolerTop || (k <= 0.2 ? '16%' : '12%'),
                                left: currentStepConfig?.coolerLeft || (k <= 0.2 ? '51%' : '50%'),
                                transform: ` scale(${currentStepConfig?.coolerScale || 1})`
                            }}
                        >

                            {/* Liquid Cooler COnfig */}
                            {currentStepConfig?.customElements?.includes("sirkulasi") && (
                                <img
                                    src="./asset/Liquid_2.png"
                                    alt="Cooling System"
                                    className={`w-full h-full z-10 animate__animated animate__flash animate__infinite animate__slow absolute object-contain duration-500`}
                                    style={{
                                        filter: isLightMode ? 'none' : 'drop-shadow(0 0 15px rgba(100, 150, 200, 0.4))'
                                    }}
                                />
                            )}

                            {currentStepConfig?.customElements?.includes("waterblock") && (
                                <img
                                    src="./asset/Liquid_1.png"
                                    alt="Cooling System"
                                    className={`w-full h-full z-10 animate__animated animate__flash animate__infinite animate__slow absolute object-contain duration-500`}
                                    style={{
                                        filter: isLightMode ? 'none' : 'drop-shadow(0 0 15px rgba(100, 150, 200, 0.4))'
                                    }}
                                />
                            )}
                            {currentStepConfig?.customElements?.includes("radiator") && (
                                <img
                                    src="./asset/Liquid_3.png"
                                    alt="Cooling System"
                                    className={`w-full h-full z-10 animate__animated animate__flash animate__infinite animate__slow absolute object-contain duration-500`}
                                    style={{
                                        filter: isLightMode ? 'none' : 'drop-shadow(0 0 15px rgba(100, 150, 200, 0.4))'
                                    }}
                                />
                            )}

                            {/* fanCooler setings */}
                            {currentStepConfig?.customElements?.includes("fan") && (
                                <img
                                    src="./asset/fanCooler_3.png"
                                    alt="Cooling System"
                                    className={`w-full h-full z-10  absolute object-contain duration-500`}
                                    style={{
                                        filter: isLightMode ? 'none' : 'drop-shadow(0 0 15px rgba(100, 150, 200, 0.4))'
                                    }}
                                />
                            )}
                            {currentStepConfig?.customElements?.includes("anthena") && (
                                <img
                                    src="./asset/fanCooler_2.png"
                                    alt="Cooling System"
                                    className={`w-full h-full z-10 animate__animated animate__slow animate__flash animate__infinite absolute object-contain duration-500`}
                                    style={{
                                        filter: isLightMode ? 'none' : 'drop-shadow(0 0 15px rgba(100, 150, 200, 0.4))'
                                    }}
                                />
                            )}
                            {currentStepConfig?.customElements?.includes("heatsink") && (
                                <img
                                    src="./asset/fanCooler_1.png"
                                    alt="Cooling System"
                                    className={`w-full h-full z-10 animate__animated aimate_slow animate__flash animate__infinite absolute object-contain duration-500`}
                                    style={{
                                        filter: isLightMode ? 'none' : 'drop-shadow(0 0 15px rgba(100, 150, 200, 0.4))'
                                    }}
                                />
                            )}





                            <img
                                src={coolingImage}
                                alt="Cooling System"
                                className={`w-full h-full object-contain duration-500`}
                                style={{
                                    opacity: currentStepConfig?.coolerOpacity ?? 1,
                                }}
                            />

                        </div>


                        {/* CPU */}

                        <div className="absolute z-1 -translate-x-1/2 aspect-square transition-all duration-700 ease-in-out"
                            style={{
                                top: currentStepConfig?.cpuTop || "55%",
                                left: currentStepConfig?.cpuLeft || "50%",
                                width: `${30 * (currentStepConfig?.cpuScale || 1)}%`,
                                opacity: currentStepConfig?.cpuOpacity ?? 1,
                            }}
                        >

                            <img
                                src="asset/CPU.png"
                                alt="CPU"
                                className="w-full h-full object-contain "
                                style={{
                                    filter: `drop-shadow(0 0 ${15 + tempRatio * 10}px hsla(${hue}, 80%, 50%, ${0.6 + tempRatio * 0.4}))`
                                }}
                            />

                        </div>
                        

                    </div>
                </AspectRatio>
            )
                : (

                    // normal mode - ! jangan disentuh !
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
                            <div className={`absolute ${k <= 0.2 ? 'top-[15%] left-[50%]' : 'top-[12%] left-[50%]'} z-10 -translate-x-1/2  w-[34%] aspect-square`}>
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
                                className={`absolute duration-500 ${time != 0 && tempRatio > 0.05 ? " top-[47%] opacity-50 right-[23%]" : "top-[53%] right-[27%] opacity-0"}  text-left font-bold text-[clamp(0.6rem,1.4vw,0.95rem)]`}
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
                                    <div className={`absolute top-[38%] duration-500 ${isRunning || time != 0 ? "left-[40%] opacity-50" : "left-[45%] opacity-0"} flex flex-col gap-[8%]`}>

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
                                    <div className={`absolute top-[38%] duration-500 ${isRunning || time != 0 ? "right-[34%] opacity-50" : "right-[39%] opacity-0"} flex flex-col gap-[8%]`}>
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
                                className={`absolute duration-500 ${time != 0 && tempRatio > 0.05 && k <= 0.2 ? "top-[50%] opacity-50 left-[20%]" : "top-[55%] left-[25%] opacity-0"} text-right font-bold text-[clamp(0.55rem,1.3vw,0.85rem)]`}
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
                                    <div className={`absolute duration-500 ${time != 0 ? "top-[38%]  right-[30%] opacity-60" : "top-[43%] right-[35%] opacity-0"} flex flex-col gap-[8%]`}>
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
                                        className={`absolute duration-500 ${isRunning || time != 0 ? "top-[37%] left-[30%] opacity-50" : "top-[43%] opacity-0 left-[35%]"}  text-right font-bold text-[clamp(0.55rem,1.3vw,0.85rem)]`}
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
                                    className={`absolute duration-500 ${time != 0 ? "top-[50%] opacity-50 left-[18%] " : "top-[55%] opacity-0 left-[25%] "} text-left font-bold text-[clamp(0.5rem,1.2vw,0.8rem)]`}
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
                                className={`absolute duration-500 ${time != 0 && tempRatio > 0.05 ? "bottom-[24%] right-[12%]" : "opacity-0 bottom-[20%] right-[20%]"}    font-bold text-[clamp(0.65rem,1.6vw,1.05rem)]`}
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


                        </div>
                    </AspectRatio>

                )}
            <div className="control-panel flex w-full items-center justify-start gap-2 mt-2 px-2">
                {/* Fullscreen Button */}
                <button
                    onClick={() => {
                        const newValue = !isFullscreen;
                        setIsFullscreen(newValue);
                        onFullscreenChange?.(newValue);
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${isLightMode
                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                    title="Fullscreen"
                >
                    <Maximize2 size={20} />
                </button>

                {/* Step/Instan Mode Toggle */}
                <button
                    onClick={() => {
                        const newValue = !stepMode;
                        setStepMode(newValue);
                        onStepModeChange?.(newValue);
                        
                        // Reset semua ke awal saat stepMode berubah
                        if (newValue) {
                            // Aktifkan step mode: reset ke auto mode dan step pertama
                            setAutoPlay(true);
                            setManualStepIndex(0);
                            // Reset time dan temp ke nilai awal
                            onTimeChange?.(0);
                            onTempChange?.(params.T0);
                            // Stop simulasi - user harus klik Play untuk mulai
                            onRunningChange?.(false);
                        } else {
                            // Nonaktifkan step mode: reset ke nilai awal
                            onTimeChange?.(0);
                            onTempChange?.(params.T0);
                            onRunningChange?.(false);
                        }
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${stepMode
                        ? isLightMode
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                            : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                        : isLightMode
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                            : 'bg-amber-800 hover:bg-amber-700 text-white'
                        }`}
                    title={stepMode ? "Mode Step: Visualisasi bertahap (klik untuk Mode Instan)" : "Mode Instan: Visualisasi real-time (klik untuk Mode Step)"}
                >
                    {stepMode ? <Footprints size={20} /> : <Zap size={20} />}
                </button>

                {/* Speed Control */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isLightMode ? 'bg-purple-100' : 'bg-purple-900/50'}`}>
                    <Gauge size={16} className={isLightMode ? 'text-purple-700' : 'text-purple-300'} />
                    <select
                        value={speedMultiplier}
                        onChange={(e) => {
                            const newSpeed = parseFloat(e.target.value);
                            setSpeedMultiplier(newSpeed);
                            onSpeedChange?.(newSpeed);
                        }}
                        className={`text-sm font-semibold bg-transparent border-none outline-none cursor-pointer ${
                            isLightMode ? 'text-purple-700' : 'text-purple-300'
                        }`}
                        title="Kecepatan Simulasi"
                    >
                        <option value="0.25">0.25x</option>
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>
                </div>

                {/* Step Mode Controls - Show only in Step Mode */}
                {stepMode && (
                    <>
                        {/* Previous Step Button */}
                        <button
                            onClick={handlePrevStep}
                            disabled={autoPlay || manualStepIndex === 0}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                                autoPlay || manualStepIndex === 0
                                    ? isLightMode
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                                    : isLightMode
                                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                        : 'bg-blue-800 hover:bg-blue-700 text-white'
                            }`}
                            title="Previous Step"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Auto/Manual Toggle - MOVED TO CENTER */}
                        <button
                            onClick={handleToggleAutoPlay}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold ${
                                autoPlay
                                    ? isLightMode
                                        ? 'bg-green-100 hover:bg-green-200 text-green-700'
                                        : 'bg-green-800 hover:bg-green-700 text-white'
                                    : isLightMode
                                        ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                                        : 'bg-orange-800 hover:bg-orange-700 text-white'
                            }`}
                            title={autoPlay ? "AUTO (Playing): Klik untuk Pause & Manual" : "MANUAL (Paused): Klik untuk Play & Auto"}
                        >
                            {autoPlay ? "▶ AUTO" : "⏸ MANUAL"}
                        </button>

                        {/* Next Step Button */}
                        <button
                            onClick={handleNextStep}
                            disabled={autoPlay || manualStepIndex === COOLING_SYSTEMS_STEPS[getCoolingSystemType()].length - 1}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                                autoPlay || manualStepIndex === COOLING_SYSTEMS_STEPS[getCoolingSystemType()].length - 1
                                    ? isLightMode
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                                    : isLightMode
                                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                        : 'bg-blue-800 hover:bg-blue-700 text-white'
                            }`}
                            title="Next Step"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>
            <style jsx>{`
                select option {
                    background-color: ${isLightMode ? '#f3f4f6' : '#1e293b'};
                    color: ${isLightMode ? '#374151' : '#e2e8f0'};
                }

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