'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function HasatAnaliz() {

  const router = useRouter()

  const [toplamKg, setToplamKg] = useState(0)
  const [aliciData, setAliciData] = useState({})
  const [aylikToplam, setAylikToplam] = useState(0)
  const [gecenAyToplam, setGecenAyToplam] = useState(0)
  const [data, setData] = useState([])

  const [acikAlici, setAcikAlici] = useState(null)

  // 🔥 TARİH PARSE
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

    let toplam = 0
    const alicilar = {}
    let aylik = 0
    let gecenAy = 0

    const now = new Date()

    const thisMonth =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0')

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const lastMonth =
      lastMonthDate.getFullYear() +
      '-' +
      String(lastMonthDate.getMonth() + 1).padStart(2, '0')

    data.forEach(d => {

      toplam += d.kg || 0

      if (d.alici) {
        if (!alicilar[d.alici]) alicilar[d.alici] = 0
        alicilar[d.alici] += d.kg
      }

      const date = parseTarih(d.tarih)

      if (!date) return

      const ay =
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0')

      if (ay === thisMonth) {
        aylik += d.kg || 0
      }

      if (ay === lastMonth) {
        gecenAy += d.kg || 0
      }

    })

    setToplamKg(toplam)
    setAliciData(alicilar)
    setAylikToplam(aylik)
    setGecenAyToplam(gecenAy)
  }

  const enCokAlan = Object.entries(aliciData)
    .sort((a,b)=>b[1]-a[1])[0]

  return (
    <div style={{padding:20}}>

      {/* 🔙 NAV */}
      <div style={{
        display:'flex',
        gap:10,
        marginBottom:15
      }}>

        <button
          onClick={()=>router.back()}
          style={{
            background:'#64748b',
            color:'white',
            padding:'8px 12px',
            borderRadius:8,
            border:'none'
          }}
        >
          ← Geri
        </button>

        <button
          onClick={()=>router.push('/')}
          style={{
            background:'#16a34a',
            color:'white',
            padding:'8px 12px',
            borderRadius:8,
            border:'none'
          }}
        >
          🏠 Anasayfa
        </button>

      </div>

      <h2 style={{marginBottom:15}}>📊 Hasat Paneli</h2>

      {/* KARTLAR */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr',
        gap:10,
        marginBottom:20
      }}>

        <div style={kartMor}>
          📦 Toplam Satış
          <br/>
          <b>{toplamKg} kg</b>
        </div>

        <div style={kartYesil}>
          👑 En iyi müşteri
          <br/>
          <b>{enCokAlan?.[0]} ({enCokAlan?.[1]} kg)</b>
        </div>

        <div style={kartMavi}>
          📅 Bu Ay
          <br/>
          <b>{aylikToplam} kg</b>
        </div>

        <div style={kartSari}>
          ⏮️ Geçen Ay
          <br/>
          <b>{gecenAyToplam} kg</b>
        </div>

      </div>

      {/* LİSTE */}
      <h3>Müşteri Dağılımı</h3>

      {Object.entries(aliciData).map(([alici, kg]) => {

        const detay = data.filter(d => d.alici === alici)

        return (
          <div key={alici} style={{marginBottom:10}}>

            <div 
              onClick={()=>setAcikAlici(acikAlici === alici ? null : alici)}
              style={{
                ...listItem,
                cursor:'pointer'
              }}
            >
              {alici}
              <span>{kg} kg</span>
            </div>

            {acikAlici === alici && (
              <div style={{
                background:'#e2e8f0',
                padding:10,
                borderRadius:10,
                marginTop:5
              }}>

                {detay.map(d => (
                  <div key={d.id} style={{marginBottom:5}}>
                    📅 {d.tarih} → {d.kg} kg
                  </div>
                ))}

              </div>
            )}

          </div>
        )
      })}

    </div>
  )
}

/* STYLE AYNI */