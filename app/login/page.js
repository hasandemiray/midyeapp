'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    // 🔐 sadece bu kullanıcıya izin ver
    if (username !== 'akana') {
      alert('Kullanıcı adı hatalı')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: 'akana@test.com',
      password
    })

    if (!error) {
      router.push('/')
    } else {
      alert('Şifre hatalı')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: 30,
        borderRadius: 16,
        width: 300,
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>

        <h2 style={{ textAlign: 'center' }}>🔐 Giriş Paneli</h2>

        <input
          placeholder="Kullanıcı Adı"
          onChange={e => setUsername(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ccc'
          }}
        />

        <input
          placeholder="Şifre"
          type="password"
          onChange={e => setPassword(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ccc'
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            padding: 12,
            borderRadius: 8,
            border: 'none',
            background: '#0070f3',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16
          }}
        >
          Giriş Yap
        </button>

      </div>
    </div>
  )
}