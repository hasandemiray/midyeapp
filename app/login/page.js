'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error) {
      router.push('/')
    } else {
      alert('Giriş hatalı')
    }
  }

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (!error) {
      alert('Kayıt başarılı')
    } else {
      alert('Kayıt hatası')
    }
  }

  return (
    <div style={{
      padding: 20,
      maxWidth: 300,
      margin: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ textAlign: 'center' }}>Giriş Paneli</h2>

      <input
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
        style={{ padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="Şifre"
        type="password"
        onChange={e => setPassword(e.target.value)}
        style={{ padding: 10, marginBottom: 15 }}
      />

      <button
        onClick={handleLogin}
        style={{
          padding: 10,
          marginBottom: 10,
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: 5
        }}
      >
        Giriş Yap
      </button>

      <button
        onClick={handleRegister}
        style={{
          padding: 10,
          background: '#555',
          color: 'white',
          border: 'none',
          borderRadius: 5
        }}
      >
        Kayıt Ol
      </button>
    </div>
  )
}