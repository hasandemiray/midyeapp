'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

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
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>

      <div style={{
        background: 'rgba(255,255,255,0.96)',
        padding: 36,
        borderRadius: 20,
        width: 340,
        boxShadow: '0 30px 70px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center' }}>

          <div style={{
            fontSize: 12,
            color: '#444',
            letterSpacing: 2.5,
            marginBottom: 10,
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            Midye Çiftliği Takip Sistemi
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}>

            <img src="/midye.png" style={{ width: 30, opacity: 0.85 }} />

            <h2 style={{
              margin: 0,
              fontWeight: '500',
              fontSize: 24,
              letterSpacing: 0.5
            }}>
              Midye Panel
            </h2>

            <img 
              src="/midye.png" 
              style={{ width: 30, transform: 'scaleX(-1)', opacity: 0.85 }} 
            />

          </div>

        </div>

        {/* INPUT */}
        <input
          placeholder="Kullanıcı Adı"
          onChange={e => setUsername(e.target.value)}
          style={{
            padding: 14,
            borderRadius: 12,
            border: '1px solid #ddd',
            fontSize: 14,
            outline: 'none',
            transition: '0.2s'
          }}
          onFocus={e => e.target.style.border = '1px solid #0070f3'}
          onBlur={e => e.target.style.border = '1px solid #ddd'}
        />

        <input
          placeholder="Şifre"
          type="password"
          onChange={e => setPassword(e.target.value)}
          style={{
            padding: 14,
            borderRadius: 12,
            border: '1px solid #ddd',
            fontSize: 14,
            outline: 'none',
            transition: '0.2s'
          }}
          onFocus={e => e.target.style.border = '1px solid #0070f3'}
          onBlur={e => e.target.style.border = '1px solid #ddd'}
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          style={{
            padding: 14,
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #0070f3, #0051a3)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
            cursor: 'pointer',
            transition: '0.2s'
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          Giriş Yap
        </button>

        {/* 🔒 GÜVEN MESAJI */}
        <div style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#888',
          marginTop: 8,
          opacity: 0.8
        }}>
          🔒 Güvenli bağlantı • Verileriniz korunmaktadır
        </div>

        {/* AYIRICI */}
        <div style={{
          height: 1,
          background: '#eee',
          marginTop: 10
        }} />

        {/* FOOTER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#aaa'
        }}>
          <div>
            Powered by <b style={{ color: '#0070f3' }}>MidyePro</b>
          </div>

          <div>
            v1.0.0
          </div>
        </div>

      </div>

      {/* 🔥 SSL BADGE ALANI */}
      <div style={{
        marginTop: 20,
        display: 'flex',
        gap: 12
      }}>

        <div style={{
          background: '#e6f9f0',
          color: '#1a7f5a',
          padding: '6px 10px',
          borderRadius: 8,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 500
        }}>
          🔒 SSL Secure
        </div>

        <div style={{
          background: '#e8f3ff',
          color: '#1a5fb4',
          padding: '6px 10px',
          borderRadius: 8,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 500
        }}>
          🛡️ 256-bit Encryption
        </div>

      </div>

      {/* ALT SLOGAN */}
      <div style={{
        fontSize: 11,
        color: '#ddd',
        marginTop: 8
      }}>
        Güvenli. Şifreli. Korunan.
      </div>

    </div>
  )
}