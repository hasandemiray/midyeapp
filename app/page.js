'use client'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'
import { useState, useEffect } from 'react'

export default function Page() {

  const router = useRouter()

  const [block, setBlock] = useState(null)
  const [selectedLine, setSelectedLine] = useState(null)
  const [records, setRecords] = useState([])

  const [ara, setAra] = useState('')
  const [kg, setKg] = useState('')
  const [cm, setCm] = useState('')
  const [tarih, setTarih] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [lastDeleted, setLastDeleted] = useState(null)

useEffect(() => {
  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/login')
    }
  }

  checkUser()

  const load = async () => {
    const { data, error } = await supabase
      .from('records')
      .select('*')

    if (!error && data) {
      setRecords(data)
    }
  }

  load()
}, [])

const handleSave = async () => {
  const yeni = {
    line: selectedLine,
    ara: parseFloat(ara) || 0,
    kg: parseFloat(kg) || 0,
    cm: parseFloat(cm) || 0,
    tarih
  }

  const { error } = await supabase
    .from('records')
    .insert([yeni])

  if (!error) {
    setRecords(prev => [...prev, yeni])
  }

  setSelectedLine(null)
  setAra('')
  setKg('')
  setCm('')
}

const confirmDelete = async () => {
  const { error } = await supabase
    .from('records')
    .delete()
    .eq('line', deleteTarget)

  if (!error) {
    const kalan = records.filter(r => r.line !== deleteTarget)
    setRecords(kalan)
  }

  setDeleteTarget(null)
}

  const undoDelete = () => {
    const updated = [...records, ...lastDeleted]
    localStorage.setItem('records', JSON.stringify(updated))
    setRecords(updated)
    setLastDeleted(null)
  }

  return (
    <div style={container}>

      {/* 🔥 ÜST BAR */}
      <div style={{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:15
      }}>
        <b>👤 Hoşgeldin akana</b>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
          }}
          style={{
            background:'#ff4d4f',
            color:'white',
            border:'none',
            padding:'8px 14px',
            borderRadius:8,
            fontWeight:'bold'
          }}
        >
          Çıkış
        </button>
      </div>

      {/* 🔥 SADECE BURASI DEĞİŞTİ */}
      <div style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        gap:12,
        marginBottom:25
      }}>
        <img src="/midye.png" style={{width:50}} />

        <h1 style={{
          fontSize:30,
          fontWeight:'bold'
        }}>
          MİDYE TAKİP SİSTEMİ
        </h1>

        <img src="/midye.png" style={{width:50, transform:'scaleX(-1)'}} />
      </div>

      {/* BLOKLAR */}
      <div style={blockBar}>
        {['A','B','C','D','E','F'].map(b => (
          <button key={b} onClick={() => setBlock(b)} style={btnBlue}>
            {b}
          </button>
        ))}
          </div>
      </div>
  )
}