'use client';

import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Page() {

  const router = useRouter()

  const [records, setRecords] = useState([])
  const [block, setBlock] = useState(null)
  const [selectedLine, setSelectedLine] = useState(null)

  const [ara, setAra] = useState('')
  const [kg, setKg] = useState('')
  const [cm, setCm] = useState('')
  const [tarih, setTarih] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [deleteTarget, setDeleteTarget] = useState(null)

  // 🔐 LOGIN + DATA
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

  // 💾 SAVE
  const handleSave = async () => {
    const { error } = await supabase
      .from('records')
      .insert([
        {
          line: selectedLine,
          ara: parseFloat(ara) || 0,
          kg: parseFloat(kg) || 0,
          cm: parseFloat(cm) || 0,
          tarih
        }
      ])

    if (!error) {
      const { data } = await supabase
        .from('records')
        .select('*')

      setRecords(data || [])
      setSelectedLine(null)
      setAra('')
      setKg('')
      setCm('')
    }
  }

  // ❌ DELETE
  const confirmDelete = async () => {
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('line', deleteTarget)

    if (!error) {
      const kalan = records.filter(r => r.line !== deleteTarget)
      setRecords(kalan)
      setDeleteTarget(null)
    }
  }

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

      <h1>Midye Dashboard</h1>

      {/* BLOKLAR */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 10
      }}>
        {['A','B','C','D','E','F'].map(b => (
          <button key={b} onClick={() => setBlock(b)}>
            {b}
          </button>
        ))}
      </div>

      {/* GRID */}
      {block && (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(3,1fr)',
          gap:10,
          marginTop:20
        }}>
          {[...Array(15)].map((_, i) => {
            const hat = block + (i + 1)

            return (
              <div
                key={i}
                onClick={()=>setSelectedLine(hat)}
                style={{
                  border:'1px solid #ccc',
                  padding:10,
                  borderRadius:10
                }}
              >
                <div>{hat}</div>

                <button onClick={(e)=>{
                  e.stopPropagation()
                  router.push(`/hat/${hat}`)
                }}>
                  Detay
                </button>

                <button onClick={(e)=>{
                  e.stopPropagation()
                  setDeleteTarget(hat)
                }}>
                  Sil
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL */}
      {selectedLine && (
        <div style={{
          background:'#f5f5f5',
          padding:15,
          borderRadius:10,
          marginTop:20
        }}>
          <h3>{selectedLine}</h3>

          <input placeholder="Ara" value={ara} onChange={e=>setAra(e.target.value)} />
          <input placeholder="KG" value={kg} onChange={e=>setKg(e.target.value)} />
          <input placeholder="CM" value={cm} onChange={e=>setCm(e.target.value)} />
          <input type="date" value={tarih} onChange={e=>setTarih(e.target.value)} />

          <br /><br />

          <button onClick={handleSave}>Kaydet</button>
          <button onClick={()=>setSelectedLine(null)}>Kapat</button>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div style={{
          background:'#fff3f3',
          padding:15,
          marginTop:10
        }}>
          <p>Silinsin mi?</p>
          <button onClick={confirmDelete}>Evet</button>
          <button onClick={()=>setDeleteTarget(null)}>Vazgeç</button>
        </div>
      )}

    </div>
  )
}