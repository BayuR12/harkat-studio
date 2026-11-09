'use client'

import { Users, Search } from 'lucide-react'

export default function CommunityPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Users className="text-accent" /> Komunitas Kreator
      </h1>
      
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari kreator, kolaborasi, atau tantangan..." 
            className="w-full bg-input border border-border rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full mb-4"></div>
            <h3 className="font-bold text-lg">Kreator {i}</h3>
            <p className="text-gray-400 text-sm mb-4">120 Pengikut • 15 Lagu</p>
            <button className="bg-accent/20 text-accent px-6 py-1.5 rounded-full text-sm font-medium hover:bg-accent hover:text-white transition">
              Ikuti
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
