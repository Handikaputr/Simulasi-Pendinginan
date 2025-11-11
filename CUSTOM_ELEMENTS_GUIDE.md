# Custom Elements Guide untuk Step Mode

## ✅ Sistem Simple - Cukup Tulis Nama Element!

Tidak perlu `true/false` lagi! Cukup masukkan nama element ke dalam array `customElements`.

## Cara Kerja (Super Simple!)

### 1. **Menambahkan Custom Element di Konfigurasi**

Cukup tulis nama element yang ingin ditampilkan:

```typescript
{
    tempRatioThreshold: 0.95,
    title: "Step 1: Panas Dihasilkan",
    description: "CPU menghasilkan panas saat beroperasi.",
    // ... konfigurasi lainnya ...
    customElements: ["pulseEffect", "warningBox", "heatWaves"]
    // Kalau nama ada di array, element akan ditampilkan!
}
```

**Tanpa element:**
```typescript
customElements: []  // Atau bisa dihapus/undefined
```

**Dengan beberapa element:**
```typescript
customElements: ["pulseEffect", "warningBox", "contactArea", "heatWaves"]
```

### 2. **Menggunakan di Rendering**

Cukup cek dengan `.includes()`:

```tsx
{/* Simple check */}
{currentStepConfig?.customElements?.includes("warningBox") && (
    <div className="warning">
        ⚠️ Peringatan!
    </div>
)}

{/* Element lain */}
{currentStepConfig?.customElements?.includes("pulseEffect") && (
    <div className="pulse-effect">
        Pulse animation
    </div>
)}
```

## Contoh Implementasi Lengkap

### Contoh 1: Step dengan Warning Box

**Di Konfigurasi:**
```typescript
passive: [
    {
        tempRatioThreshold: 0.95,
        title: "Step 1: Panas Dihasilkan",
        cpuScale: 1.5,
        cpuPosition: { x: "50%", y: "55%" },
        coolerOpacity: 0,
        coolerScale: 1,
        fanSpeed: 0,
        arrowsVisible: { heatUp: true, heatToCooler: false, airFlow: false },
        highlightColor: "#ef4444",
        customElements: ["warningBox", "pulseEffect", "heatWaves"]
        // ☝️ Cukup daftar nama element yang mau tampil!
    }
]
```

**Di Rendering:**
```tsx
{currentStepConfig?.customElements?.includes("warningBox") && (
    <div className="absolute top-[23%] right-[5%] px-3 py-2 rounded-lg border-2 bg-red-50">
        <div className="text-sm font-bold text-red-600">
            ⚠️ Suhu Tinggi!
        </div>
    </div>
)}
```

### Contoh 2: Step dengan Multiple Elements

**Di Konfigurasi:**
```typescript
{
    tempRatioThreshold: 0.8,
    title: "Step 2: Konduksi",
    // ...
    customElements: ["pulseEffect", "contactArea", "conductionArrows", "temperatureLabel"]
}
```

**Di Rendering:**
```tsx
{/* Pulse Effect */}
{currentStepConfig?.customElements?.includes("pulseEffect") && (
    <div className="pulse-animation" />
)}

{/* Contact Area */}
{currentStepConfig?.customElements?.includes("contactArea") && (
    <div className="contact-label">📍 Area Kontak</div>
)}

{/* Conduction Arrows */}
{currentStepConfig?.customElements?.includes("conductionArrows") && (
    <div className="arrows">→ → →</div>
)}

{/* Temperature Label */}
{currentStepConfig?.customElements?.includes("temperatureLabel") && (
    <div className="temp-label">🌡️ {temp}°C</div>
)}
```

### Contoh 3: Step Tanpa Custom Elements

**Di Konfigurasi:**
```typescript
{
    tempRatioThreshold: 0.3,
    title: "Step 4: Konveksi Alami",
    // ...
    customElements: []  // Atau bisa tidak ditulis sama sekali
}
```

Tidak ada element tambahan yang akan muncul!

## Daftar Custom Elements yang Sudah Ada

### 1. **`warningBox`** ⚠️
Menampilkan kotak peringatan merah dengan animasi pulse.

**Konfigurasi:**
```typescript
customElements: ["warningBox"]
```

**Hasil:** Kotak merah di kanan atas dengan text "⚠️ Suhu Tinggi!"

---

### 2. **`pulseEffect`** 💫
Efek pulse radial gradient di sekitar CPU.

**Konfigurasi:**
```typescript
customElements: ["pulseEffect"]
```

**Hasil:** Animasi pulse dengan warna sesuai `highlightColor`

---

### 3. **`contactArea`** 📍
Label area kontak termal.

**Konfigurasi:**
```typescript
customElements: ["contactArea"]
```

**Hasil:** Label "📍 Area Kontak Termal" di kiri tengah

---

## Cara Menambahkan Custom Element Baru

### Langkah 1: Buat Element di Rendering

Tambahkan setelah `{/* ==================== END STEP INFO BOX ==================== */}`:

```tsx
{/* My New Element */}
{currentStepConfig?.customElements?.includes("myNewElement") && (
    <div className="absolute top-[30%] left-[30%]">
        <span className="text-lg">🔥 Element Baru!</span>
    </div>
)}
```

### Langkah 2: Gunakan di Konfigurasi

```typescript
{
    tempRatioThreshold: 0.95,
    title: "Step 1",
    // ...
    customElements: ["myNewElement"]  // ✅ Selesai!
}
```

### Langkah 3: Done! 🎉

Tidak perlu setting `true/false`, cukup masukkan nama ke array!

## Tips & Best Practices

### ✅ Gunakan Nama yang Jelas
```typescript
// Good
customElements: ["heatWaves", "temperatureWarning", "conductionArrows"]

// Avoid
customElements: ["elem1", "x", "thing"]
```

### ✅ Kelompokkan Element Related
```typescript
// Step awal - fokus pada panas
customElements: ["pulseEffect", "warningBox", "heatWaves"]

// Step tengah - fokus pada transfer
customElements: ["contactArea", "conductionArrows", "transferLabel"]

// Step akhir - fokus pada pendinginan
customElements: ["airFlow", "coolingEffect", "successMessage"]
```

### ✅ Kombinasi dengan Kondisi Lain
```tsx
{/* Tampilkan hanya jika ada element DAN tempRatio tinggi */}
{currentStepConfig?.customElements?.includes("extremeHeat") && 
 tempRatio > 0.9 && (
    <div className="extreme-warning">🔥🔥🔥 SANGAT PANAS!</div>
)}

{/* Tampilkan hanya di sistem tertentu */}
{currentStepConfig?.customElements?.includes("liquidFlow") && 
 getCoolingSystemType() === 'liquid' && (
    <div className="liquid-animation">💧 Aliran Liquid</div>
)}
```

## Contoh Lengkap: Satu Step Komplit

```typescript
{
    tempRatioThreshold: 0.75,
    title: "Step 2: Konduksi ke Heatsink",
    description: "Panas berpindah dari CPU ke heatsink melalui konduksi termal.",
    cpuScale: 1.2,
    cpuPosition: { x: "50%", y: "60%" },
    coolerOpacity: 1,
    coolerScale: 1,
    fanSpeed: 0.5,
    arrowsVisible: { 
        heatUp: true, 
        heatToCooler: true, 
        airFlow: false 
    },
    highlightColor: "#f97316",
    customElements: [
        "pulseEffect",      // Efek pulse di CPU
        "contactArea",      // Label area kontak
        "conductionArrows", // Arrow konduksi
        "heatWaves",        // Gelombang panas
        "thermalPaste"      // Indikator thermal paste
    ]
}
```

## Implementasi di Rendering

```tsx
{/* Pulse Effect */}
{currentStepConfig?.customElements?.includes("pulseEffect") && (
    <div className="pulse" style={{ background: `radial-gradient(circle, ${currentStepConfig.highlightColor}40 0%, transparent 70%)` }} />
)}

{/* Contact Area */}
{currentStepConfig?.customElements?.includes("contactArea") && (
    <div className="absolute top-[48%] left-[20%]">📍 Area Kontak Termal</div>
)}

{/* Conduction Arrows */}
{currentStepConfig?.customElements?.includes("conductionArrows") && (
    <div className="arrows-animation">↑ ↑ ↑</div>
)}

{/* Heat Waves */}
{currentStepConfig?.customElements?.includes("heatWaves") && (
    <div className="heat-waves">
        {[0, 1, 2].map(i => <div key={i} className="wave" />)}
    </div>
)}

{/* Thermal Paste */}
{currentStepConfig?.customElements?.includes("thermalPaste") && (
    <div className="paste-indicator">🔹 Thermal Paste</div>
)}
```

## Keuntungan Sistem Baru

✅ **Lebih Simple** - Tidak perlu tulis `true/false`  
✅ **Lebih Bersih** - Array lebih mudah dibaca  
✅ **Lebih Cepat** - Langsung tulis nama element  
✅ **Mudah di-maintain** - Tinggal tambah/hapus dari array  

## Perbandingan

### ❌ Cara Lama (Kompleks)
```typescript
customElements: {
    showWarningBox: true,
    showPulseEffect: true,
    showContactArea: false,
    showHeatWaves: true,
    showConductionLabel: false
}
```

### ✅ Cara Baru (Simple!)
```typescript
customElements: ["warningBox", "pulseEffect", "heatWaves"]
```

**Jauh lebih simple dan clean!** 🚀

## Cara Kerja

### 1. **Menambahkan Custom Element di Konfigurasi**

Tambahkan property `customElements` di step yang diinginkan:

```typescript
{
    tempRatioThreshold: 0.95,
    title: "Step 1: Panas Dihasilkan",
    description: "CPU menghasilkan panas saat beroperasi.",
    // ... konfigurasi lainnya ...
    customElements: {
        showWarningBox: true,      // Tampilkan warning box
        pulseEffect: true,          // Efek pulse pada CPU
        showHeatWaves: true,        // Tampilkan gelombang panas
        customMessage: "Panas!",    // Custom property apapun
        animationType: "shake"      // Bisa property apapun
    }
}
```

### 2. **Menggunakan di Rendering**

Di bagian rendering (setelah Step Info Box), gunakan conditional rendering:

```tsx
{/* Kondisi berdasarkan property custom */}
{currentStepConfig?.customElements?.showWarningBox && (
    <div className="custom-warning">
        ⚠️ Peringatan Custom!
    </div>
)}

{/* Kondisi berdasarkan title step */}
{currentStepConfig?.title === "Step 1: Panas Dihasilkan" && (
    <div>Elemen khusus Step 1</div>
)}

{/* Kondisi berdasarkan tempRatio */}
{tempRatio >= 0.9 && currentStepConfig && (
    <div>Elemen untuk suhu sangat tinggi</div>
)}
```

## Contoh Implementasi Lengkap

### Contoh 1: Warning Box yang Muncul di Step 1

**Di Konfigurasi:**
```typescript
passive: [
    {
        tempRatioThreshold: 0.95,
        title: "Step 1: Panas Dihasilkan",
        // ...
        customElements: {
            showWarningBox: true,
            warningText: "⚠️ CPU Overheating!"
        }
    }
]
```

**Di Rendering:**
```tsx
{currentStepConfig?.customElements?.showWarningBox && (
    <div className={`absolute top-[23%] right-[5%] px-3 py-2 rounded-lg border-2 ${
        isLightMode ? 'bg-red-50 border-red-400' : 'bg-red-900/30 border-red-500'
    }`}>
        <div className="text-sm font-bold text-red-600">
            {currentStepConfig.customElements.warningText || "⚠️ Suhu Tinggi!"}
        </div>
    </div>
)}
```

### Contoh 2: Animasi Pulse pada CPU

**Di Konfigurasi:**
```typescript
{
    customElements: {
        pulseEffect: true,
        pulseColor: "#ef4444"
    }
}
```

**Di Rendering:**
```tsx
{currentStepConfig?.customElements?.pulseEffect && (
    <div 
        className="absolute top-[55%] left-1/2 -translate-x-1/2 w-[35%] aspect-square pointer-events-none"
        style={{
            background: `radial-gradient(circle, ${currentStepConfig.customElements.pulseColor || currentStepConfig.highlightColor}40 0%, transparent 70%)`,
            animation: 'pulse 2s ease-in-out infinite'
        }}
    />
)}
```

### Contoh 3: Label Informasi Dinamis

**Di Konfigurasi:**
```typescript
{
    customElements: {
        showContactArea: true,
        contactLabel: "📍 Area Kontak Termal",
        labelPosition: { x: "20%", y: "48%" }
    }
}
```

**Di Rendering:**
```tsx
{currentStepConfig?.customElements?.showContactArea && (
    <div 
        className="absolute text-sm font-bold"
        style={{
            left: currentStepConfig.customElements.labelPosition?.x || "20%",
            top: currentStepConfig.customElements.labelPosition?.y || "48%",
            color: currentStepConfig.highlightColor,
            textShadow: isLightMode ? 'none' : `0 0 8px ${currentStepConfig.highlightColor}`
        }}
    >
        {currentStepConfig.customElements.contactLabel}
    </div>
)}
```

### Contoh 4: Grafik atau Diagram Mini

**Di Konfigurasi:**
```typescript
{
    customElements: {
        showMiniDiagram: true,
        diagramType: "heatTransfer"
    }
}
```

**Di Rendering:**
```tsx
{currentStepConfig?.customElements?.showMiniDiagram && (
    <div className="absolute bottom-[5%] right-[5%] w-32 h-32 bg-white/90 rounded-lg p-2 shadow-lg">
        {currentStepConfig.customElements.diagramType === "heatTransfer" && (
            <div className="flex flex-col h-full justify-center items-center">
                <div className="text-xs font-bold mb-2">Transfer Panas</div>
                <div className="text-2xl">🔥 → 🌊</div>
            </div>
        )}
    </div>
)}
```

### Contoh 5: Particle Effect atau Animasi Khusus

**Di Konfigurasi:**
```typescript
{
    customElements: {
        showParticles: true,
        particleCount: 10,
        particleColor: "#fbbf24"
    }
}
```

**Di Rendering:**
```tsx
{currentStepConfig?.customElements?.showParticles && (
    <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: currentStepConfig.customElements.particleCount || 5 }).map((_, i) => (
            <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate__animated animate__fadeInUp animate__infinite"
                style={{
                    backgroundColor: currentStepConfig.customElements.particleColor,
                    left: `${20 + i * 10}%`,
                    bottom: "30%",
                    animationDelay: `${i * 0.2}s`
                }}
            />
        ))}
    </div>
)}
```

## Kondisi Kombinasi

Anda bisa mengkombinasikan berbagai kondisi:

```tsx
{/* Kombinasi: Custom element + tempRatio + step title */}
{currentStepConfig?.customElements?.showAdvancedInfo && 
 tempRatio < 0.5 && 
 currentStepConfig.title.includes("Konveksi") && (
    <div className="custom-advanced-info">
        Informasi detail untuk step konveksi dengan suhu rendah
    </div>
)}

{/* Kombinasi: Custom element + cooling system type */}
{currentStepConfig?.customElements?.showSystemInfo && 
 getCoolingSystemType() === 'liquid' && (
    <div className="liquid-system-info">
        💧 Sistem Liquid Cooling Aktif
    </div>
)}
```

## Tips & Best Practices

### 1. **Gunakan Property yang Deskriptif**
```typescript
// ✅ Good
customElements: {
    showTemperatureWarning: true,
    showConductionArrows: true
}

// ❌ Avoid
customElements: {
    show1: true,
    flag2: true
}
```

### 2. **Berikan Default Values**
```tsx
{currentStepConfig?.customElements?.message || "Default message"}
```

### 3. **Gunakan Positioning yang Konsisten**
```typescript
customElements: {
    position: { x: "20%", y: "30%" },
    size: { width: "100px", height: "100px" }
}
```

### 4. **Kelompokkan Elements yang Related**
```typescript
customElements: {
    warnings: {
        show: true,
        type: "temperature",
        message: "Suhu tinggi!"
    },
    animations: {
        pulse: true,
        shake: false
    }
}
```

## Akses Data di Custom Elements

Anda bisa mengakses semua data yang tersedia:

```tsx
{currentStepConfig?.customElements?.showDetailedInfo && (
    <div className="info-panel">
        <div>Step: {currentStepConfig.title}</div>
        <div>Temp: {temp.toFixed(2)}°C</div>
        <div>TempRatio: {tempRatio.toFixed(2)}</div>
        <div>Time: {time.toFixed(1)}s</div>
        <div>System: {getCoolingSystemType()}</div>
        <div>Fan Speed: {currentStepConfig.fanSpeed}x</div>
    </div>
)}
```

## Contoh Konfigurasi Lengkap untuk 1 Step

```typescript
{
    tempRatioThreshold: 0.75,
    title: "Step 2: Konduksi ke Heatsink",
    description: "Panas berpindah dari CPU ke heatsink melalui konduksi termal.",
    cpuScale: 1.2,
    cpuPosition: { x: "50%", y: "60%" },
    coolerOpacity: 1,
    coolerScale: 1,
    fanSpeed: 0,
    arrowsVisible: { heatUp: true, heatToCooler: true, airFlow: false },
    highlightColor: "#f97316",
    customElements: {
        // Warning & Notifications
        showWarning: false,
        showSuccessMessage: false,
        
        // Visual Effects
        pulseEffect: true,
        pulseColor: "#f97316",
        glowIntensity: 0.8,
        
        // Labels & Info
        showContactArea: true,
        contactLabel: "📍 Area Kontak Termal",
        showThermalPaste: true,
        
        // Diagrams & Graphics
        showHeatFlowDiagram: true,
        diagramPosition: { x: "80%", y: "20%" },
        
        // Particles & Animations
        showHeatParticles: true,
        particleCount: 15,
        particleColor: "#fb923c",
        
        // Interactive Elements
        showTooltip: true,
        tooltipText: "Konduksi adalah transfer panas melalui kontak langsung",
        
        // Custom Data
        technicalDetails: {
            conductivity: "High",
            material: "Copper",
            efficiency: "85%"
        }
    }
}
```

## Implementasi Sudah Ada

Di file `CPUCoolingIllustration.tsx`, sudah ada 3 contoh implementasi:

1. ✅ **Warning Box** - Muncul ketika `showWarningBox: true`
2. ✅ **Pulse Effect** - Efek pulse ketika `pulseEffect: true`
3. ✅ **Contact Area Label** - Label area kontak ketika `showContactArea: true`

Anda tinggal menambahkan lebih banyak conditional rendering sesuai kebutuhan!

## Cara Menambahkan Custom Element Baru

1. **Tambahkan di konfigurasi:**
```typescript
customElements: {
    showMyNewElement: true,
    myElementData: "Some data"
}
```

2. **Tambahkan di rendering (setelah END STEP INFO BOX):**
```tsx
{currentStepConfig?.customElements?.showMyNewElement && (
    <div className="my-new-element">
        {currentStepConfig.customElements.myElementData}
    </div>
)}
```

3. **Done!** 🎉

Sistem sudah siap untuk dikustomisasi sepenuhnya!
