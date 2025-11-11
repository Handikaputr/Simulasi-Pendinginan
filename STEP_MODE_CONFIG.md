# Step Mode Configuration Guide

## Struktur Konfigurasi

Konfigurasi step mode sudah ditambahkan di file `CPUCoolingIllustration.tsx` dengan struktur sebagai berikut:

### Interface StepConfig
```typescript
interface StepConfig {
    tempRatioThreshold: number;  // Batas tempRatio untuk step ini (0-1)
    title: string;               // Judul step (ditampilkan di Info Box)
    description: string;         // Deskripsi detail (ditampilkan di Info Box)
    cpuScale: number;           // Skala CPU (1 = normal, 1.5 = 1.5x lebih besar)
    cpuPosition: { x: string; y: string };  // Posisi CPU (percentage)
    coolerOpacity: number;      // Opacity cooler (0-1)
    coolerScale: number;        // Skala cooler (1 = normal)
    fanSpeed: number;           // Kecepatan fan (0 = stop, 1 = normal, 2 = fast)
    arrowsVisible: {
        heatUp: boolean;        // Arrow panas naik dari CPU
        heatToCooler: boolean;  // Arrow panas ke cooler
        airFlow: boolean;       // Arrow aliran udara
    };
    highlightColor: string;     // Warna highlight untuk UI
    customElements?: string[];  // Array nama element yang akan ditampilkan
    // Contoh: customElements: ["pulseEffect", "warningBox", "heatWaves"]
    // ⚡ Cukup tulis nama element, TIDAK PERLU true/false!
}
```

### Sistem Pendinginan

Ada 3 sistem pendinginan dengan konfigurasi masing-masing 5 steps:

#### 1. Heatsink Pasif (k <= 0.1)
- **Step 1 (tempRatio ≥ 0.95)**: Panas Dihasilkan
  - CPU diperbesar 1.5x, posisi tengah
  - Cooler tidak terlihat (opacity 0)
  - Hanya arrow panas naik yang terlihat

- **Step 2 (tempRatio ≥ 0.8)**: Konduksi ke Heatsink
  - CPU 1.2x, cooler muncul (opacity 1)
  - Arrow panas ke cooler muncul

- **Step 3 (tempRatio ≥ 0.6)**: Radiasi dari Sirip Heatsink
  - CPU normal size, cooler membesar 1.1x
  - Semua arrow terlihat

- **Step 4 (tempRatio ≥ 0.3)**: Konveksi Alami
  - Fan berputar lambat (speed 0.3)

- **Step 5 (tempRatio ≥ 0)**: Pendinginan Lambat
  - Arrow panas naik hilang
  - Fan berputar sangat lambat (speed 0.2)

#### 2. Fan Cooler (0.1 < k <= 0.2)
- **Step 1 (tempRatio ≥ 0.95)**: Panas Dihasilkan
  - CPU 1.5x, cooler tidak terlihat

- **Step 2 (tempRatio ≥ 0.75)**: Konduksi ke Heatsink
  - CPU 1.2x, cooler muncul
  - Fan mulai berputar (speed 0.5)

- **Step 3 (tempRatio ≥ 0.5)**: Penyebaran Panas
  - Cooler membesar 1.1x
  - Fan berputar normal (speed 1)

- **Step 4 (tempRatio ≥ 0.25)**: Konveksi Paksa (Fan)
  - Fan berputar cepat (speed 2)

- **Step 5 (tempRatio ≥ 0)**: Pendinginan Moderat
  - Fan berputar moderat (speed 1.5)

#### 3. Liquid Cooling (k > 0.2)
- **Step 1 (tempRatio ≥ 0.95)**: Panas Dihasilkan
  - CPU 1.5x, cooler tidak terlihat

- **Step 2 (tempRatio ≥ 0.7)**: Konduksi ke Waterblock
  - CPU 1.2x, waterblock muncul
  - Fan mulai berputar (speed 0.5)

- **Step 3 (tempRatio ≥ 0.45)**: Sirkulasi Cairan
  - Cooler membesar, fan kencang (speed 1.5)

- **Step 4 (tempRatio ≥ 0.2)**: Transfer ke Radiator
  - Fan sangat kencang (speed 2)

- **Step 5 (tempRatio ≥ 0)**: Pendinginan Optimal
  - Fan kencang optimal (speed 1.8)

## Fitur yang Sudah Diimplementasikan

### 1. Step Info Box ✅
- Ditampilkan di bagian atas ilustrasi step mode
- Menampilkan: Title, Description, Progress Indicator
- Animasi transition yang smooth
- Warna dinamis berdasarkan highlightColor

### 2. Dynamic Fan Speed ✅
- Fan berputar sesuai konfigurasi `fanSpeed`
- Transisi smooth antar kecepatan

### 3. Helper Functions ✅
```typescript
getCoolingSystemType() // Menentukan tipe sistem (passive/fan/liquid)
getCurrentStep()       // Mendapatkan step config saat ini
```

## Yang Perlu Dikembangkan Lebih Lanjut

### 1. Dynamic CPU Transform
Perlu update bagian CPU di step mode untuk menggunakan:
```typescript
style={{
    top: currentStepConfig?.cpuPosition.y || "55%",
    left: currentStepConfig?.cpuPosition.x || "50%",
    width: `${30 * (currentStepConfig?.cpuScale || 1)}%`,
    transform: `translateX(-50%) scale(${currentStepConfig?.cpuScale || 1})`
}}
```

### 2. Dynamic Cooler Visibility & Scale
Update cooler image untuk:
```typescript
style={{
    opacity: currentStepConfig?.coolerOpacity || 1,
    transform: `scale(${currentStepConfig?.coolerScale || 1})`
}}
```

### 3. Conditional Arrows Based on Config
Update arrows visibility:
```typescript
{currentStepConfig?.arrowsVisible.heatUp && (
    // Heat up arrows
)}

{currentStepConfig?.arrowsVisible.heatToCooler && (
    // Heat to cooler arrows
)}

{currentStepConfig?.arrowsVisible.airFlow && (
    // Air flow arrows  
)}
```

### 4. Cooler Position Adjustment
Saat CPU scale berubah dan posisi bergeser, cooler juga perlu menyesuaikan posisinya agar tetap di atas CPU.

## Cara Modifikasi Konfigurasi

### Mengubah Threshold TempRatio
```typescript
{
    tempRatioThreshold: 0.8,  // Ubah nilai ini (0-1)
    // Step ini aktif ketika tempRatio >= 0.8
}
```

### Mengubah Posisi & Skala CPU
```typescript
{
    cpuScale: 1.5,                    // 1.5x lebih besar
    cpuPosition: { x: "50%", y: "55%" }, // Tengah-tengah sedikit ke bawah
}
```

### Mengubah Kecepatan Fan
```typescript
{
    fanSpeed: 2,  // 0 = stop, 1 = normal, 2 = 2x kecepatan
}
```

### Mengubah Visibility Arrows
```typescript
{
    arrowsVisible: {
        heatUp: true,          // Tampilkan arrow panas naik
        heatToCooler: false,   // Sembunyikan arrow ke cooler
        airFlow: true          // Tampilkan arrow aliran udara
    }
}
```

### Mengubah Text & Warna
```typescript
{
    title: "Step 1: Custom Title",
    description: "Deskripsi custom sesuai kebutuhan",
    highlightColor: "#ef4444"  // Warna merah
}
```

### Menambahkan Custom Elements
```typescript
{
    customElements: ["pulseEffect", "warningBox", "heatWaves"]
    // ⚡ Cukup tulis nama element yang ingin ditampilkan!
    // TIDAK perlu showPulseEffect: true, showWarningBox: true, dll
}
```

Untuk detail lengkap tentang custom elements, lihat file `CUSTOM_ELEMENTS_GUIDE.md`.

## Implementasi yang Tersisa

File sudah berisi struktur konfigurasi lengkap. Yang perlu dilakukan:

1. **Update CPU rendering** di step mode section (line ~737)
2. **Update Cooler rendering** untuk opacity dan scale dinamis
3. **Update Arrow conditions** untuk menggunakan config
4. **Adjust Cooler position** relatif terhadap CPU

Semua konfigurasi sudah ada di `COOLING_SYSTEMS_STEPS` object, tinggal digunakan oleh komponen visual.

## Testing
Untuk testing konfigurasi:
1. Set mode step (klik tombol Footprints/Zap)
2. Pilih nilai k berbeda untuk test 3 sistem
3. Jalankan simulasi dan perhatikan perubahan step sesuai tempRatio
4. Sesuaikan threshold dan parameter di konfigurasi jika perlu
