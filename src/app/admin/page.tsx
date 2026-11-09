import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-4 text-red-500">Administrator Dashboard</h1>
      <p className="text-gray-400 mb-8">Konfigurasi sistem, manajemen pengguna, dan provider AI.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Total Pengguna</h3>
          <div className="text-3xl font-bold">1,024</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Job Antrean (Pending)</h3>
          <div className="text-3xl font-bold text-yellow-500">12</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Laporan Pelanggaran</h3>
          <div className="text-3xl font-bold text-red-500">3</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Provider Aktif</h3>
          <div className="text-xl font-bold text-green-500">Demo Provider</div>
        </div>
      </div>
      
      <div className="mt-8 text-sm">
        <Link href="/dashboard" className="text-secondary hover:underline">Kembali ke Dashboard Utama</Link>
      </div>
    </div>
  )
}
