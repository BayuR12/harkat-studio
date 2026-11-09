'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const executeLogin = async (userEmail: string, userPass: string) => {
    setLoading(true)
    setError(null)
    
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: userPass }),
        signal: controller.signal,
      })
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Login gagal.')

      router.push('/dashboard')
      router.refresh()
    } catch (loginError) {
      setError(loginError instanceof DOMException && loginError.name === 'AbortError'
        ? 'Login melewati batas waktu. Silakan coba lagi.'
        : loginError instanceof Error ? loginError.message : 'Login gagal.')
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await executeLogin(email, password)
  }

  const handleQuickAdminLogin = async () => {
    setEmail('admin@harkat.id')
    setPassword('AdminPassword123!')
    await executeLogin('admin@harkat.id', 'AdminPassword123!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border border-border">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo size="xl" showText={false} className="mb-3" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Unit Kegiatan Mahasiswa Musik</span>
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Masuk ke Harkat Studio</h1>
        <p className="text-center text-gray-400 text-sm mb-6">Universitas Harkat Negeri</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">Kata Sandi</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-3 text-xs text-muted-foreground uppercase">atau</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button
          type="button"
          onClick={handleQuickAdminLogin}
          disabled={loading}
          className="w-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          ⚡ Masuk Cepat sebagai Admin (admin@harkat.id)
        </button>

        <div className="mt-6 text-center text-sm text-gray-400">
          Belum punya akun?{' '}
          <Link href="/register" className="text-secondary hover:underline">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  )
}
