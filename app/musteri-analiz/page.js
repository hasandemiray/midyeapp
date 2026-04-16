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

  // 🔥 TARİH ÇÖZÜCÜ
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

    if (filtre[0]) {
      const lastDate = parseTarih(filtre[0].tarih)
      const diffDays = Math.floor((new Date() - lastDate) / (1000*60*60*24))
      setSonAlim(`${diffDays} gün önce`)
      
      if (diffDays <= 7) setDurum('🟢 Aktif')
      else if (diffDays <= 30) setDurum('🟡 Yavaşladı')
      else setDurum('🔴 Pasif')
    }

    const aylar = Object.entries(aylikMap)
      .sort((a,b)=>b[0].localeCompare(a[0]))

    if (aylar.length >= 2) {
      if (aylar[0][1] > aylar[1][1]) setTrend('📈 Artıyor')
      else if (aylar[0][1] < aylar[1][1]) setTrend('📉 Düşüyor')
      else setTrend('➖ Sabit')
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
/* STYLE aynı bıraktım */