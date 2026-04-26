'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  // ✅ GİRİŞ VARSA OTOMATİK ANASAYFA
  useEffect(() => {
    const kontrol = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.push('/')
      }
    }

    kontrol()
  }, [])

  const handleLogin = async () => {
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
      background: 'linear-gradient(135deg, #0070f3, #00c6ff)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>

      <div style={{
        background: 'white',
        padding: 30,
        borderRadius: 20,
        width: 320,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 15
      }}>

        {/* 🔥 LOGO + BAŞLIK */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 10
        }}>
          {/* SOL MIDYE */}
          <img 
            src="/midye.png" 
            style={{ 
              width: 32,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }} 
          />

          {/* YAZI */}
          <h2 style={{
            margin: 0,
            fontWeight: 'bold'
          }}>
            Midye Panel
          </h2>

          {/* SAĞ MIDYE (TERS) */}
          <img 
            src="/midye.png" 
            style={{ 
              width: 32,
              transform: 'scaleX(-1)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }} 
          />
        </div>

        <input
          placeholder="Kullanıcı Adı"
          onChange={e => setUsername(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #ddd',
            fontSize: 14
          }}
        />

        <input
          placeholder="Şifre"
          type="password"
          onChange={e => setPassword(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #ddd',
            fontSize: 14
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            padding: 12,
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, #0070f3, #0051a3)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          Giriş Yap
        </button>

      </div>

    </div>
  )
}