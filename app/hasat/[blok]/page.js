'use client'

import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Blok() {

  const { blok } = useParams()
  const router = useRouter()

  const [seciliHat, setSeciliHat] = useState(null)
  const [data, setData] = useState([])

  const [kg, setKg] = useState('')
  const [cuval, setCuval] = useState('')
  const [tarih, setTarih] = useState('')
  const [alici, setAlici] = useState('')

  // 🧮 HESAP
  const [cuvalKg, setCuvalKg] = useState('')
  const [cuvalAdet, setCuvalAdet] = useState('')
  const sonuc = cuvalKg && cuvalAdet ? cuvalKg * cuvalAdet : 0

  const parseTarih = (t) => {
    try {
      if (!t) return null
      if (t.includes('.')) {
        const [g, m, y] = t.split('.')
        return new Date(`${y}-${m}-${g}`)
      }
      return new Date(t)
    } catch {
      return null
    }
  }

  const formatTarih = (t) => {
    const d = parseTarih(t)
    if (!d || isNaN(d)) return t

    const gun = String(d.getDate()).padStart(2, '0')
    const ay = String(d.getMonth() + 1).padStart(2, '0')
    const yil = d.getFullYear()

    return `${gun}.${ay}.${yil}`
  }

  const getData = async () => {
    if (!seciliHat) return

    const { data } = await supabase
      .from('hasat')
      .select('*')
      .eq('hat', seciliHat.toUpperCase())

    const sorted = (data || []).sort((a,b)=> {
      const da = parseTarih(a.tarih)
      const db = parseTarih(b.tarih)
      return db - da
    })

    setData(sorted)
  }

  useEffect(() => {
    getData()
  }, [seciliHat])

  useEffect(() => {
    if (blok) {
      setSeciliHat(`${blok.toUpperCase()}1`)
    }
  }, [blok])

  const kaydet = async () => {

    if (!tarih) return alert("Tarih gir")

    await supabase.from('hasat').insert([
      {
        hat: seciliHat.toUpperCase(),
        kg: Number(kg),
        cuval: Number(cuval),
        tarih,
        alici: alici.toLowerCase().trim()
      }
    ])

    setKg('')
    setCuval('')
    setTarih('')
    setAlici('')

    getData()
  }

  const sil = async (id) => {
    if (!confirm("Silinsin mi?")) return
    await supabase.from('hasat').delete().eq('id', id)
    getData()
  }

  return (
    <div style={{padding:20, maxWidth:600, margin:'auto'}}>

      <div style={{display:'flex', gap:10, marginBottom:15}}>
        <button onClick={()=>router.back()} style={btnGri}>← Geri</button>
        <button onClick={()=>router.push('/')} style={btnYesil}>🏠 Anasayfa</button>
      </div>

      <h2>📊 {blok.toUpperCase()} Blok</h2>

      {/* HATLAR */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(3,1fr)',
        gap:10,
        marginBottom:20
      }}>
        {[...Array(15)].map((_,i)=>{
          const hat = `${blok.toUpperCase()}${i+1}`
          return (
            <button
              key={hat}
              onClick={()=>setSeciliHat(hat)}
              style={{
                padding:'16px 0',
                borderRadius:12,
                background: seciliHat === hat ? '#16a34a' : '#1d4ed8',
                color:'white',
                fontWeight:'bold',
                fontSize:18
              }}
            >
              {hat}
            </button>
          )
        })}
      </div>

      {/* FORM */}
      {seciliHat && (
        <div style={formBox}>
          <h3>{seciliHat} Hasat Gir</h3>

          <input placeholder="KG" value={kg} onChange={e=>setKg(e.target.value)} style={input}/>
          <input placeholder="Çuval" value={cuval} onChange={e=>setCuval(e.target.value)} style={input}/>
          <input type="date" value={tarih} onChange={e=>setTarih(e.target.value)} style={input}/>
          <input placeholder="Alıcı" value={alici} onChange={e=>setAlici(e.target.value)} style={input}/>

          <button onClick={kaydet} style={saveBtn}>Kaydet</button>
        </div>
      )}

      {/* 🧮 HESAP MAKİNESİ */}
      <div style={{marginTop:30, padding:20, borderRadius:15, background:'#f1f5f9'}}>
        <h3>🧮 Çuval Hesapla</h3>

        <input placeholder="1 çuval kaç kg" value={cuvalKg} onChange={e=>setCuvalKg(e.target.value)} style={input}/>
        <input placeholder="Çuval sayısı" value={cuvalAdet} onChange={e=>setCuvalAdet(e.target.value)} style={input}/>

        <div style={{fontSize:22, fontWeight:'bold', marginTop:10}}>
          {sonuc} kg
        </div>

        <div style={{display:'flex', gap:10, marginTop:10}}>

  <button onClick={()=>setKg(sonuc)} style={aktarBtn}>
    ➡️ KG’ye Aktar
  </button>

  <button onClick={()=>setCuval(cuvalAdet)} style={aktarBtn}>
    📦 Çuvalı Aktar
  </button>

  <button onClick={()=>{
    setCuvalKg('')
    setCuvalAdet('')
  }} style={resetBtn}>
    ♻️ Temizle
  </button>

</div>
      </div>

      {/* GEÇMİŞ */}
      {seciliHat && (
        <div>
          <h3>{seciliHat} Geçmiş</h3>

          {data.length === 0 && <div>Kayıt yok</div>}

          {data.map(d => (
            <div key={d.id} style={card}>
              <div>📅 {formatTarih(d.tarih)}</div>
              <div>⚖️ {d.kg} kg / {d.cuval} çuval</div>
              {d.alici && <div>👤 {d.alici}</div>}
              <button onClick={()=>sil(d.id)} style={deleteBtn}>Sil</button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

/* STYLE */

const btnGri = { background:'#64748b', color:'white', padding:'8px 12px', borderRadius:8, border:'none' }
const btnYesil = { background:'#16a34a', color:'white', padding:'8px 12px', borderRadius:8, border:'none' }

const formBox = { background:'#fff', padding:15, borderRadius:12, marginBottom:20, display:'flex', flexDirection:'column', gap:10 }
const input = { padding:12, borderRadius:10, border:'1px solid #ccc', fontSize:16 }

const saveBtn = { background:'#16a34a', color:'white', padding:14, borderRadius:10, border:'none', fontSize:16 }

const card = { background:'#f9fafb', padding:12, borderRadius:10, marginBottom:10 }

const deleteBtn = { marginTop:5, background:'#ef4444', color:'white', padding:'5px 10px', borderRadius:8, border:'none' }

const copyBtn = { flex:1, background:'#2563eb', color:'white', padding:12, borderRadius:10, border:'none' }
const resetBtn = { flex:1, background:'#475569', color:'white', padding:12, borderRadius:10, border:'none' }
const aktarBtn = { flex:1, background:'#16a34a', color:'white', padding:12, borderRadius:10, border:'none' }