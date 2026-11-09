'use client'

import { useState } from 'react'
import { FileText, Wand2 } from 'lucide-react'

export default function CreateLyricsPage() {
  const [topic, setTopic] = useState('')
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <FileText className="text-primary" /> AI Lyrics Generator
      </h1>
      <p className="text-gray-400 mb-8">Tulis lirik lagu dengan bantuan AI, atur rima, dan gaya bahasa.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card p-4 rounded-xl border border-border">
            <h3 className="font-semibold mb-4">Pengaturan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Tema Lirik</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full bg-input border border-border rounded p-2 text-sm"
                  placeholder="Misal: Patah hati di hujan"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Genre</label>
                <select className="w-full bg-input border border-border rounded p-2 text-sm">
                  <option>Pop</option>
                  <option>Rock</option>
                  <option>Hip-Hop</option>
                  <option>Indie</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Bahasa</label>
                <select className="w-full bg-input border border-border rounded p-2 text-sm">
                  <option>Indonesia</option>
                  <option>Inggris</option>
                </select>
              </div>
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded font-medium flex items-center justify-center gap-2 mt-4">
                <Wand2 size={16} /> Generate Lirik
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-xl flex flex-col h-[500px]">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold">Editor Lirik</h3>
              <div className="flex gap-2">
                <button className="text-xs bg-white/10 px-2 py-1 rounded">Perbaiki Rima</button>
                <button className="text-xs bg-white/10 px-2 py-1 rounded">Buat Chorus</button>
              </div>
            </div>
            <textarea 
              className="flex-1 bg-transparent p-6 resize-none focus:outline-none"
              placeholder="Hasil lirik akan muncul di sini. Anda juga dapat mengetik lirik Anda sendiri dan meminta AI untuk menyempurnakannya."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  )
}
