'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Blok() {

  const { blok } = useParams()

  const [seciliHat, setSeciliHat] = useState(null)
  const [data, setData] = useState([])

  const [kg, setKg] = useState('')
  const [cuval, setCuval] = useState('')
  const [tarih, setTarih] = useState('')
  const [alici, setAlici] = useState('')

  const getData = async () => {
    if (!seciliHat) return

    const { data } = await supabase
      .from('hasat')
      .select('*')
      .eq('hat', seciliHat)
      .order('tarih', { ascending: false })

    setData(data || [])
  }

  useEffect(() => {
    getData()
  }, [seciliHat])

  useEffect(() => {
    if (blok) {
      setSeciliHat(`${blok}1`)
    }
  }, [blok])

  const kaydet = async () => {

    if (!tarih) return alert("Tarih gir")

    await supabase.from('hasat').insert([
      {
        hat: seciliHat,
        kg: Number(kg),
        cuval: Number(cuval),
        tarih,
        alici // ✅ EKLENDİ
      }
    ])

    setKg('')
    setCuval('')
    setTarih('')
    setAlici('') // ✅ EKLENDİ

    getData()
  }

  const sil = async (id) => {
    if (!confirm("Silinsin mi?")) return

    await supabase.from('hasat').delete().eq('id', id)
    getData()
  }

  return (
    <div style={{padding:20, maxWidth:600, margin:'auto'}}>

      <h2 style={{marginBottom:15}}>📊 {blok} Blok</h2>

      {/* HATLAR */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(3,1fr)',
        gap:10,
        marginBottom:20
      }}>
        {[...Array(15)].map((_,i)=>{
          const hat = `${blok}${i+1}`

          return (
            <button
              key={hat}
              onClick={()=>setSeciliHat(hat)}
              style={{
                padding:'14px 0',
                borderRadius:10,
                background: seciliHat === hat ? '#16a34a' : '#1d4ed8',
                color:'white',
                fontWeight:'bold',
                fontSize:16
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

          {/* ✅ YENİ ALAN */}
          <input 
            placeholder="Alıcı" 
            value={alici} 
            onChange={e=>setAlici(e.target.value)} 
            style={input}
          />

          <button onClick={kaydet} style={saveBtn}>
            Kaydet
          </button>

        </div>
      )}

      {/* GEÇMİŞ */}
      {seciliHat && (
        <div>

          <h3>{seciliHat} Geçmiş</h3>

          {data.length === 0 && <div>Kayıt yok</div>}

          {data.map(d => (
            <div key={d.id} style={card}>

              <div style={{fontWeight:'bold'}}>
                📅 {d.tarih}
              </div>

              <div>
                ⚖️ {d.kg} kg / {d.cuval} çuval
              </div>

              {/* ✅ ALICI GÖSTER */}
              <div>
                👤 {d.alici || 'Belirtilmemiş'}
              </div>

              <button onClick={()=>sil(d.id)} style={deleteBtn}>
                Sil
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}

/* 🎨 STYLE */

const formBox = {
  background:'#fff',
  padding:15,
  borderRadius:12,
  marginBottom:20,
  display:'flex',
  flexDirection:'column',
  gap:10,
  boxShadow:'0 0 10px rgba(0,0,0,0.1)'
}

const input = {
  padding:10,
  borderRadius:8,
  border:'1px solid #ccc'
}

const saveBtn = {
  background:'#16a34a',
  color:'white',
  padding:12,
  borderRadius:10,
  border:'none',
  fontWeight:'bold'
}

const card = {
  background:'#f9fafb',
  padding:12,
  borderRadius:10,
  marginBottom:10
}

const deleteBtn = {
  marginTop:5,
  background:'#ef4444',
  color:'white',
  padding:'5px 10px',
  borderRadius:8,
  border:'none'
}