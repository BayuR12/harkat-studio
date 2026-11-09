import { Check } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background p-8 md:p-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">Pilih Paket Anda</h1>
        <p className="text-gray-400">Harga transparan untuk kreator dari semua tingkatan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-2">Free</h3>
          <p className="text-gray-400 text-sm mb-6">Untuk pemula yang ingin mencoba AI.</p>
          <div className="text-3xl font-bold mb-6">Rp 0<span className="text-sm font-normal text-gray-400">/bln</span></div>
          <button className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition mb-8">Mulai Gratis</button>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-green-500" /> 50 Kredit / bulan</li>
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-green-500" /> Kualitas Audio Standar</li>
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-green-500" /> Lisensi Non-komersial</li>
          </ul>
        </div>

        {/* Creator Plan */}
        <div className="bg-[#1e293b] border-2 border-primary rounded-2xl p-8 relative transform md:-translate-y-4 shadow-2xl shadow-primary/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULER</div>
          <h3 className="text-xl font-bold mb-2">Creator</h3>
          <p className="text-gray-400 text-sm mb-6">Untuk musisi yang aktif berkarya.</p>
          <div className="text-3xl font-bold mb-6">Rp 150.000<span className="text-sm font-normal text-gray-400">/bln</span></div>
          <button className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition mb-8">Pilih Creator</button>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary" /> 2,500 Kredit / bulan</li>
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary" /> Kualitas Audio WAV High-Res</li>
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary" /> Hak Komersial Penuh</li>
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-primary" /> Stem Separation</li>
          </ul>
        </div>

        {/* Studio Plan */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-2">Studio</h3>
          <p className="text-gray-400 text-sm mb-6">Untuk profesional dan produser.</p>
          <div className="text-3xl font-bold mb-6">Rp 450.000<span className="text-sm font-normal text-gray-400">/bln</span></div>
          <button className="w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition mb-8">Pilih Studio</button>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-secondary" /> 10,000 Kredit / bulan</li>
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-secondary" /> Multitrack Web Studio Pro</li>
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-secondary" /> Prioritas Antrean Server</li>
            <li className="flex items-center gap-3 text-sm"><Check size={16} className="text-secondary" /> Ekspor Stems & MIDI</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
