import Link from 'next/link'
import { Plus, Music, ListMusic, Headphones, Sparkles, TrendingUp, Activity } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen p-8 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Logo size="lg" asLink href="/dashboard" />
          <Link
            href="/create"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-950/30 transition hover:scale-105"
          >
            <Plus size={16} /> Buat Lagu Baru
          </Link>
        </div>

        <header className="mb-12 animate-fade-in-up opacity-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium border rounded-full text-primary border-primary/30 bg-primary/10">
            <Sparkles size={14} />
            <span>AI Music Studio v2.0</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Selamat Datang di Workspace Anda
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Pusat kontrol di mana ide-ide brilian Anda diubah menjadi karya musik nyata dengan bantuan AI.
          </p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up delay-100 opacity-0">
          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-500/20 text-blue-400">
              <Music size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Lagu Dibuat</p>
              <h4 className="text-2xl font-bold">12 Karya</h4>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-green-500/20 text-green-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Jam Studio Berjalan</p>
              <h4 className="text-2xl font-bold">4.5 Jam</h4>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-purple-500/20 text-purple-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Engagement (Plays)</p>
              <h4 className="text-2xl font-bold">342 Kali</h4>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6 animate-fade-in-up delay-200 opacity-0">Akses Cepat</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-fade-in-up delay-300 opacity-0">
          {/* Quick Actions */}
          <Link href="/create" className="glass-card p-6 rounded-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-700 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:rotate-6 transition-transform">
              <Plus size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-primary transition-colors">Buat Lagu AI</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Generate melodi, lirik, atau lagu penuh menggunakan model AI terbaru.</p>
          </Link>
          
          <Link href="/studio/audio/new" className="glass-card p-6 rounded-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-secondary/50 hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)]">
            <div className="w-14 h-14 bg-gradient-to-br from-secondary to-blue-700 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:-rotate-6 transition-transform">
              <Headphones size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-secondary transition-colors">Web Studio</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Mixing, mastering, dan multitrack editor layaknya DAW profesional di browser.</p>
          </Link>

          <Link href="/studio/score/new" className="glass-card p-6 rounded-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-accent/50 hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)]">
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-teal-700 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:rotate-6 transition-transform">
              <Music size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-accent transition-colors">Score Studio</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Buat partitur, notasi balok, dan tablature secara interaktif.</p>
          </Link>

          <Link href="/library" className="glass-card p-6 rounded-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-gray-500/50 hover:bg-white/5">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:-rotate-6 transition-transform">
              <ListMusic size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white transition-colors">Koleksi Saya</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Lihat, putar, dan kelola semua lagu serta proyek yang telah Anda simpan.</p>
          </Link>
        </div>

        <section className="animate-fade-in-up delay-400 opacity-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Proyek Terakhir</h2>
            <Link href="/library" className="text-sm text-primary hover:underline font-medium">Lihat Semua</Link>
          </div>
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[250px] text-center border-dashed border-2 border-border/50">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-300 font-medium mb-2 text-lg">Mulai karya pertama Anda hari ini</p>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">Jelajahi ide musik Anda dan biarkan AI membantu Anda menyusunnya menjadi lagu yang luar biasa.</p>
            <Link href="/create" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Plus size={18} /> Ciptakan Sekarang
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
