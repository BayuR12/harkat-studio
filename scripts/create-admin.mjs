import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Baca environment
const envFile = path.resolve('.env.local')
if (!fs.existsSync(envFile)) {
  console.error('File .env.local tidak ditemukan!')
  process.exit(1)
}

const envContent = fs.readFileSync(envFile, 'utf8')
const env = {}
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Kredensial Supabase di .env.local belum lengkap.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const email = process.argv[2] || 'admin@harkat.id'
const password = process.argv[3] || 'AdminHarkat2026!'
const username = process.argv[4] || 'admin_harkat'

async function createOrPromoteAdmin() {
  console.log(`Memproses akun administrator: ${email}...`)

  try {
    // 1. Cek apakah user sudah ada
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error('Gagal mengambil daftar user:', listError.message)
      if (listError.message.includes('Bad Gateway') || listError.status === 502) {
        console.log('\n⚠️ PERHATIAN: Project Supabase Anda di cloud kemungkinan sedang dijeda (paused).')
        console.log(`Silakan buka https://supabase.com/dashboard/project/${env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')} dan klik "Restore project".`)
      }
      return
    }

    const existingUser = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      console.log(`User ${email} ditemukan. Memperbarui role menjadi administrator...`)
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        app_metadata: { role: 'administrator' },
        user_metadata: { ...existingUser.user_metadata, role: 'administrator' },
      })
      if (updateError) throw updateError

      await supabase.from('profiles').update({ role: 'administrator' }).eq('id', existingUser.id)
      console.log(`✅ Berhasil! Akun ${email} sekarang memiliki role: administrator.`)
    } else {
      console.log(`Membuat akun administrator baru (${email})...`)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role: 'administrator' },
        user_metadata: { username, display_name: 'Administrator Harkat', role: 'administrator' },
      })
      if (createError) throw createError

      if (newUser?.user?.id) {
        await supabase.from('profiles').upsert({
          id: newUser.user.id,
          username,
          display_name: 'Administrator Harkat',
          role: 'administrator',
        })
      }

      console.log('\n=============================================')
      console.log('✅ AKUN ADMINISTRATOR BERHASIL DIBUAT!')
      console.log(`Email    : ${email}`)
      console.log(`Password : ${password}`)
      console.log(`Username : ${username}`)
      console.log('Role     : administrator (Akses Tanpa Batas)')
      console.log('=============================================\n')
    }
  } catch (err) {
    console.error('Terjadi kesalahan:', err.message || err)
  }
}

createOrPromoteAdmin()
