'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function MusteriAnaliz() {

  const router = useRouter()

  const [data, setData] = useState([])
  const [musteriler, setMusteriler] = useState([])
  const [secili, setSecili] = useState('')
  const [aylik, setAylik] = useState({})
  const [toplam, setToplam] = useState(0)

  const [trend, setTrend] = useState('')
  const [sonAlim, setSonAlim] = useState('')
  const [durum, setDurum] = useState('')

  const [ortalamaGun, setOrtalamaGun] = useState('')
  const [son3, setSon3] = useState([])

  const parseTarih = (t) => {
    if (!t) return null

    if (t.includes('.')) {
      const [gun, ay, yil] = t.split('.')
      return new Date(`${yil}-${ay}-${gun}`)
    }

    return new Date(t)
  }

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {

    const { data } = await supabase
      .from('hasat')
      .select('*')

    setData(data || [])

    const unique = [...new Set(data.map(d => d.alici).filter(Boolean))]
    setMusteriler(unique)
  }

  useEffect(() => {
    if (!secili) return

    const filtre = data
      .filter(d => d.alici === secili)
      .sort((a,b)=> parseTarih(b.tarih) - parseTarih(a.tarih))

    let toplamKg = 0
    const aylikMap = {}

    filtre.forEach(d => {

      toplamKg += d.kg || 0

      const date = parseTarih(d.tarih)

      const ay =
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0')

      if (!aylikMap[ay]) aylikMap[ay] = 0
      aylikMap[ay] += d.kg || 0

    })

    setToplam(toplamKg)
    setAylik(aylikMap)

    // 🔥 SON ALIM + DURUM
    if (filtre[0]) {
      const lastDate = parseTarih(filtre[0].tarih)
      const diffDays = Math.floor((new Date() - lastDate) / (1000*60*60*24))
      setSonAlim(`${diffDays} gün önce`)
      
      if (diffDays <= 7) setDurum('🟢 Aktif')
      else if (diffDays <= 30) setDurum('🟡 Yavaşladı')
      else setDurum('🔴 Risk')
    }

    // 🔥 ORTALAMA ALIM ARALIĞI
    if (filtre.length > 1) {
      let toplamGun = 0

      for (let i = 0; i < filtre.length - 1; i++) {
        const d1 = parseTarih(filtre[i].tarih)
        const d2 = parseTarih(filtre[i+1].tarih)

        const fark = Math.abs((d1 - d2) / (1000*60*60*24))
        toplamGun += fark
      }

      const ort = (toplamGun / (filtre.length - 1)).toFixed(1)
      setOrtalamaGun(`${ort} gün`)
    } else {
      setOrtalamaGun('-')
    }

    // 🔥 SON 3 ALIM
    setSon3(filtre.slice(0,3))

    // 🔥 TREND (GELİŞMİŞ)
const aylar = Object.entries(aylikMap)
  .sort((a,b)=>b[0].localeCompare(a[0]))

if (aylar.length >= 2) {
  if (aylar[0][1] > aylar[1][1]) setTrend('📈 Artıyor (aylık)')
  else if (aylar[0][1] < aylar[1][1]) setTrend('📉 Düşüyor (aylık)')
  else setTrend('➖ Sabit')
}
else if (filtre.length >= 2) {
  const son = filtre[0].kg || 0
  const onceki = filtre[1].kg || 0

  if (son > onceki) setTrend('📈 Artıyor (son alım)')
  else if (son < onceki) setTrend('📉 Düşüyor (son alım)')
  else setTrend('➖ Sabit')
}
else {
  setTrend('➖ Veri yetersiz')
}

  }, [secili])

  return (
    <div style={{padding:20}}>

      <div style={{display:'flex', gap:10, marginBottom:15}}>
        <button onClick={()=>router.back()} style={btnGri}>← Geri</button>
        <button onClick={()=>router.push('/')} style={btnYesil}>🏠 Anasayfa</button>
      </div>

      <h2>👤 Müşteri Analiz</h2>

      <select
        value={secili}
        onChange={e=>setSecili(e.target.value)}
        style={select}
      >
        <option value="">Müşteri seç</option>
        {musteriler.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {secili && (
        <div style={{marginTop:20}}>

          <div style={kart}>
            📦 Toplam: <b>{toplam} kg</b>
          </div>

          <div style={miniKart}>📊 Trend: {trend}</div>
          <div style={miniKart}>⏱️ Son Alım: {sonAlim}</div>
          <div style={miniKart}>📍 Durum: {durum}</div>
          <div style={miniKart}>📆 Ortalama Alım: {ortalamaGun}</div>

          {/* 🔥 SON 3 ALIM */}
          <h3 style={{marginTop:20}}>📦 Son 3 Alım</h3>
          {son3.map((s,i)=>(
            <div key={i} style={listItem}>
              {s.tarih}
              <span>{s.kg} kg</span>
            </div>
          ))}

          {/* 🔥 AYLIK */}
          <h3 style={{marginTop:20}}>📅 Aylık</h3>

          {Object.entries(aylik)
            .sort((a,b)=>b[0].localeCompare(a[0]))
            .map(([ay, kg]) => (
              <div key={ay} style={listItem}>
                {ay}
                <span>{kg} kg</span>
              </div>
          ))}

        </div>
      )}

    </div>
  )
}

/* 🎨 STYLE aynı */

const btnGri = {
  background:'#64748b',
  color:'white',
  padding:'8px 12px',
  borderRadius:8,
  border:'none'
}

const btnYesil = {
  background:'#16a34a',
  color:'white',
  padding:'8px 12px',
  borderRadius:8,
  border:'none'
}

const select = {
  width:'100%',
  padding:10,
  borderRadius:10,
  border:'1px solid #ccc',
  marginTop:10
}

const kart = {
  background:'linear-gradient(90deg,#0ea5e9,#0284c7)',
  color:'white',
  padding:15,
  borderRadius:12,
  marginBottom:10
}

const miniKart = {
  background:'#f1f5f9',
  padding:10,
  borderRadius:10,
  marginTop:8
}

const listItem = {
  background:'#f1f5f9',
  padding:12,
  borderRadius:10,
  marginTop:8,
  display:'flex',
  justifyContent:'space-between'
}