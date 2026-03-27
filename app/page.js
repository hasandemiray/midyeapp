'use client'

import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Page() {
  const router = useRouter()

  const [records, setRecords] = useState([])
  const [selectedLine, setSelectedLine] = useState(null)

  const [ara, setAra] = useState('')
  const [kg, setKg] = useState('')
  const [cm, setCm] = useState('')
  const [tarih, setTarih] = useState(
    new Date().toISOString().split('T')[0]
  )

  // 🔐 LOGIN KONTROL + VERİ ÇEK
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      const { data: recordsData } = await supabase
        .from('records')
        .select('*')

      if (recordsData) setRecords(recordsData)
    }

    checkUser()
  }, [])

  // 🚪 LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ➕ KAYDET
  const handleSave = async () => {
    if (!selectedLine) return alert('Hat seç')

    const { error } = await supabase
      .from('records')
      .insert([
        {
          line: selectedLine,
          ara: parseFloat(ara),
          kg: parseFloat(kg),
          cm: parseFloat(cm),
          tarih
        }
      ])

    if (!error) {
      alert('Kaydedildi')

      const { data } = await supabase
        .from('records')
        .select('*')

      setRecords(data || [])
    }
  }

  const lines = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div style={{ padding: 20 }}>

      {/* 🔥 ÜST BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 20
      }}>
        <b>👤 Hoşgeldin akana</b>

        <button onClick={handleLogout}
          style={{
            background: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px'
          }}>
          Çıkış
        </button>
      </div>

      <h2>Midye Dashboard</h2>

      {/* HATLAR */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 10,
        marginBottom: 20
      }}>
        {lines.map(l => (
          <button
            key={l}
            onClick={() => setSelectedLine(l)}
            style={{
              padding: 15,
              borderRadius: 10,
              background: selectedLine === l ? '#0051a3' : '#0070f3',
              color: 'white',
              border: 'none'
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* FORM */}
      {selectedLine && (
        <div style={{
          background: '#f5f5f5',
          padding: 15,
          borderRadius: 10,
          marginBottom: 20
        }}>
          <h3>{selectedLine} Ekim</h3>

          <input placeholder="Ara"
            value={ara}
            onChange={e => setAra(e.target.value)}
          />
          <input placeholder="Kg"
            value={kg}
            onChange={e => setKg(e.target.value)}
          />
          <input placeholder="Cm"
            value={cm}
            onChange={e => setCm(e.target.value)}
          />
          <input type="date"
            value={tarih}
            onChange={e => setTarih(e.target.value)}
          />

          <br /><br />

          <button onClick={handleSave}>
            Kaydet
          </button>
        </div>
      )}

      {/* LİNKLER */}
      {lines.map(l => (
        <div key={l}>
          <Link href={`/hat/${l}`}>
            {l} Detay
          </Link>
        </div>
      ))}

    </div>
  )
}