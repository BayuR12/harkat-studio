import Link from 'next/link'
import { ArrowRight, Headphones, Sparkles } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#080b18] via-[#171335] to-[#071525] text-white">
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-[140px]" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Logo size="md" asLink href="/" />
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white">Masuk</Link>
          <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">Daftar Gratis</Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-20 text-center lg:px-8 lg:pt-28">
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-200 backdrop-blur-md shadow-lg shadow-amber-950/20">
          <Logo size="xs" showText={false} />
          <span>Unit Kegiatan Mahasiswa Musik • Universitas Harkat Negeri</span>
        </div>
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
          Dari ide menjadi <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">karya musik</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
          Buat lagu, tulis lirik, susun partitur, dan sempurnakan audio dalam satu workspace kreatif.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground transition hover:scale-105 hover:bg-primary/90">
            Mulai Berkarya <ArrowRight size={18} />
          </Link>
          <Link href="/community" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 font-semibold transition hover:bg-white/10">
            <Headphones size={18} /> Jelajahi Komunitas
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
            ['AI Music Generator', 'Ubah deskripsi menjadi demo lagu dalam hitungan detik.'],
            ['Audio & Score Studio', 'Edit audio dan susun partitur dalam workspace terpadu.'],
            ['Komunitas Kreator', 'Temukan inspirasi dan berkolaborasi dengan musisi lain.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
