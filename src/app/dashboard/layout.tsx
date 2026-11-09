'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCreditStore } from '@/lib/store/useCreditStore'
import { Coins, FileAudio, LogOut, Music, LayoutDashboard, User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const credits = useCreditStore((state) => state.balance)
  const isAdministrator = user?.app_metadata?.role === 'administrator' || user?.user_metadata?.role === 'administrator'

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          setUser(data.user)
          return
        }
      } catch {
        // Supabase offline/error
      }

      // Check dev session cookie fallback
      try {
        const match = document.cookie.match(/harkat_dev_session=([^;]+)/)
        if (match) {
          const parsed = JSON.parse(decodeURIComponent(match[1]))
          setUser({
            id: parsed.id || 'dev-admin',
            email: parsed.email || 'admin@harkat.com',
            app_metadata: { role: parsed.role || 'administrator' },
            user_metadata: { role: parsed.role || 'administrator', username: parsed.username || 'Admin Harkat' },
          } as any)
        }
      } catch {
        // ignore
      }
    }
    getUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    try {
      await supabase.auth.signOut()
    } catch {}
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <Music className="text-primary" />
            <span>Harkat Studio</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/create" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            <Music size={20} />
            <span>Create Harkat</span>
          </Link>
          <Link href="/library" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            <Music size={20} />
            <span>Library Saya</span>
          </Link>
          <Link href="/studio/transcribe" className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
            <FileAudio size={20} />
            <span>AudioScore Studio</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Coins size={16} className="text-yellow-500" />
              <span>{isAdministrator ? '⚡ Akses Tanpa Batas' : `${credits} Kredit`}</span>
            </div>
            {!isAdministrator && <button className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Top Up</button>}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                <User size={16} />
              </div>
              <span className="truncate w-24">{user?.user_metadata?.username || user?.email || 'Admin'}</span>
            </div>
            <button onClick={handleSignOut} title="Keluar" className="text-gray-400 hover:text-white p-2">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
