export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Syarat & Ketentuan Penggunaan</h1>
      
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
        <p>Terakhir diperbarui: September 2026</p>
        
        <h2 className="text-xl font-semibold text-white mt-8">1. Penerimaan Syarat</h2>
        <p>Dengan mengakses atau menggunakan Harkat Music AI Studio, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini.</p>
        
        <h2 className="text-xl font-semibold text-white mt-8">2. Penggunaan AI dan Hak Cipta</h2>
        <p>Anda bertanggung jawab penuh atas *prompt* atau audio referensi yang Anda unggah. Anda dilarang menggunakan Harkat Studio untuk:
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Membuat konten yang meniru artis secara eksplisit tanpa izin.</li>
            <li>Mengkloning suara seseorang tanpa persetujuan yang dapat diverifikasi.</li>
            <li>Mengunggah audio berhak cipta tanpa memiliki hak atau lisensi.</li>
          </ul>
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">3. Kepemilikan Karya AI</h2>
        <p>Berdasarkan paket langganan Anda, Anda mungkin mendapatkan hak komersial untuk mengeksploitasi musik yang dihasilkan. Untuk pengguna paket Free, musik hanya dapat digunakan untuk kepentingan non-komersial.</p>
      </div>
    </div>
  )
}
