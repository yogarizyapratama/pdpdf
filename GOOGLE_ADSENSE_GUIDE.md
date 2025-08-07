# Google AdSense Implementation Guide

## Ketentuan Google AdSense yang Diterapkan

### 1. **Penempatan Iklan yang Diizinkan**
- ✅ **Above the fold content**: Iklan di atas konten utama (setelah header)
- ✅ **Within content**: Iklan di tengah konten (natural placement)
- ✅ **Below content**: Iklan di bawah konten utama
- ❌ **Modal/Popup ads**: DILARANG - mengganggu user experience
- ❌ **Overlay ads**: DILARANG - menutupi konten utama

### 2. **Format Iklan yang Digunakan**
```tsx
// Rectangle ads (paling populer dan efektif)
<GoogleAdSense 
  adSlot="1234567890"
  adFormat="rectangle"
  style={{ width: '300px', height: '250px' }}
/>

// Horizontal banner (untuk header/footer)
<GoogleAdSense 
  adSlot="2345678901"
  adFormat="horizontal" 
  style={{ width: '728px', height: '90px' }}
/>

// Responsive ads (menyesuaikan dengan layar)
<GoogleAdSense 
  adSlot="3456789012"
  adFormat="auto"
  fullWidthResponsive={true}
/>
```

### 3. **Ukuran Iklan Standar Google**
- **Medium Rectangle**: 300x250 (paling efektif)
- **Leaderboard**: 728x90 (header/footer)
- **Large Rectangle**: 336x280
- **Mobile Banner**: 320x50 (mobile)
- **Wide Skyscraper**: 160x600 (sidebar)

### 4. **Prinsip Penempatan**
1. **Natural Integration**: Iklan harus terasa natural dalam konten
2. **User Experience First**: Tidak mengganggu fungsi utama aplikasi
3. **Valuable Content**: Iklan di dekat konten yang berharga
4. **Mobile Friendly**: Responsive di semua perangkat

### 5. **Lokasi Penempatan yang Digunakan**
```tsx
// 1. Setelah upload file (dalam content area)
<div className="my-6">
  <GoogleAdSense adSlot="1234567890" adFormat="rectangle" />
</div>

// 2. Sebelum tombol aksi (natural break)
<div className="mb-8">
  <GoogleAdSense adSlot="2345678901" adFormat="horizontal" />
</div>

// 3. Di footer area (standard placement)
<div className="mt-8">
  <GoogleAdSense adSlot="3456789012" adFormat="horizontal" />
</div>
```

### 6. **Kebijakan yang Dihindari**
- ❌ Iklan yang memblokir konten utama
- ❌ Iklan dengan tombol "Close" yang misleading
- ❌ Iklan yang mengharuskan user action untuk melanjutkan
- ❌ Lebih dari 3 iklan per halaman (recommended)
- ❌ Iklan di dalam form atau input area

### 7. **Label Iklan yang Wajib**
```tsx
<div className="text-xs text-gray-500 text-center mb-2">
  Advertisement
</div>
```

### 8. **Setup AdSense**
1. Daftar di Google AdSense
2. Dapatkan Publisher ID: `ca-pub-XXXXXXXXXXXXXXXXX`
3. Buat Ad Units dan dapatkan Ad Slot IDs
4. Ganti placeholder IDs di komponen

### 9. **Performance Best Practices**
- Load async untuk tidak memblokir rendering
- Lazy loading untuk iklan di bawah fold
- Responsive design untuk semua ukuran layar
- Error handling untuk koneksi gagal

### 10. **Compliance Checklist**
- ✅ Iklan tidak menghalangi navigasi
- ✅ Konten utama mudah diakses
- ✅ Iklan diberi label "Advertisement"
- ✅ Tidak ada click manipulation
- ✅ Mobile friendly implementation
- ✅ Privacy policy mencakup ads
