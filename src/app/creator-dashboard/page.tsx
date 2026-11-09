import Link from 'next/link'

export default function CreatorDashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard Kreator</h1>
      <p className="text-gray-400 mb-8">Kelola rilisan, analitik pendengar, dan penghasilan Anda.</p>

      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-4">Statistik Bulanan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background p-4 rounded-lg border border-border">
            <div className="text-sm text-gray-400">Total Diputar</div>
            <div className="text-2xl font-bold">1,240</div>
          </div>
          <div className="bg-background p-4 rounded-lg border border-border">
            <div className="text-sm text-gray-400">Pengikut Baru</div>
            <div className="text-2xl font-bold">+45</div>
          </div>
          <div className="bg-background p-4 rounded-lg border border-border">
            <div className="text-sm text-gray-400">Pendapatan (Estimasi)</div>
            <div className="text-2xl font-bold">Rp 0</div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-sm">
        <Link href="/dashboard" className="text-secondary hover:underline">Kembali ke Dashboard Utama</Link>
      </div>
    </div>
  )
}
