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
    <div style={{ padding: 20 }}>
      <h2>Giriş Paneli</h2>

      <input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Şifre" type="password" onChange={e=>setPassword(e.target.value)} />

      <br /><br />

      <button onClick={handleLogin}>Giriş Yap</button>
      <button onClick={handleRegister}>Kayıt Ol</button>
    </div>
  )
}