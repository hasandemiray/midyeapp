'use client'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Analiz() {

  const router = useRouter()

  const [records, setRecords] = useState([])
  const [bloklar, setBloklar] = useState({})
  const [toplamKg, setToplamKg] = useState(0)
  const [hasatHatSayisi, setHasatHatSayisi] = useState(0)
  const [hasatKg, setHasatKg] = useState(0)
  const [aktifBlok, setAktifBlok] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('records').select('*')
      setRecords(data || [])
    }
    load()
  }, [])

  useEffect(() => {

    if (!records.length) return

    let toplam = 0
    let blokData = {}
    let hasatCount = 0
    let hasatToplamKg = 0

    const hatlar = {}

    records.forEach(r => {
      if (!hatlar[r.line]) hatlar[r.line] = []
      hatlar[r.line].push(r)
    })

    Object.keys(hatlar).forEach(line => {

      const sirali = [...hatlar[line]].sort(
        (a, b) => new Date(a.tarih) - new Date(b.tarih)
      )

      let guncelKg = 0
      let enBuyukBoy = 0

      sirali.forEach(r => {

        const ekimTarihi = new Date(r.tarih)
        const bugun = new Date()

        const gun = Math.floor(
          (bugun - ekimTarihi) / (1000 * 60 * 60 * 24)
        )

        let buyume = 0

        if (gun > 15) {
          const ay = (gun - 15) / 30
          const ayNum = new Date().getMonth() + 1

          buyume = (ayNum >= 6 && ayNum <= 11)
            ? ay * 0.3
            : ay * 0.5
        }

        const boy = (r.cm || 0) + buyume
        if (boy > enBuyukBoy) enBuyukBoy = boy

        const halat = 56
        const hatMetre = (r.ara || 1) * halat

        let kg = parseFloat(r.kg) || 0

        if (r.cm <= 3) kg *= (4 ** (gun / 180))
        else if (r.cm <= 4.5) kg *= (2 ** (gun / 120))

        guncelKg += kg * hatMetre
      })

      toplam += guncelKg

      const blok = line.charAt(0)
      if (!blokData[blok]) blokData[blok] = 0
      blokData[blok] += guncelKg

      if (enBuyukBoy >= 6) {
        hasatCount++
        hasatToplamKg += guncelKg
      }

    })

    setToplamKg(toplam)
    setBloklar(blokData)
    setHasatHatSayisi(hasatCount)
    setHasatKg(hasatToplamKg)

  }, [records])

  return (
    <div style={{padding:20, background:'#0f172a', minHeight:'100vh', color:'white'}}>

      <button onClick={()=>router.push('/')} style={{
        background:'#334155',
        color:'white',
        padding:'8px 12px',
        borderRadius:8,
        border:'none'
      }}>
        ← Anasayfa
      </button>

      <h1 style={{margin:'20px 0'}}>📊 ANALİZ PANELİ</h1>

      {/* ÜST KARTLAR */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
        gap:15
      }}>

        <div style={cardPurple}>
          <div>🏭 Tesis</div>
          <h2>{toplamKg.toFixed(0)} kg</h2>
        </div>

        <div style={cardGreen}>
          <div>🟢 Hasatlık Hat</div>
          <h2>{hasatHatSayisi}</h2>
        </div>

        <div style={cardBlue}>
          <div>📦 Hasat KG</div>
          <h2>{hasatKg.toFixed(0)} kg</h2>
        </div>

      </div>

      {/* BLOKLAR */}
      <h3 style={{marginTop:30}}>Blok Dağılımı</h3>

      {Object.keys(bloklar).map(b => {
        const yuzde = (bloklar[b] / toplamKg) * 100

        return (
          <div
            key={b}
            onClick={() => setAktifBlok(b)}
            style={{marginBottom:15, cursor:'pointer'}}
          >

            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span>{b} Blok</span>
              <span>{bloklar[b].toFixed(0)} kg</span>
            </div>

            <div style={{
              background:'#1e293b',
              height:12,
              borderRadius:10,
              overflow:'hidden'
            }}>
              <div style={{
                width:`${yuzde}%`,
                height:'100%',
                background:'linear-gradient(90deg,#22c55e,#06b6d4)'
              }}/>
            </div>

          </div>
        )
      })}

      {/* 🔥 BLOK DETAY (GÜNCEL HESAPLI) */}
      {aktifBlok && (
        <div style={{
          marginTop:30,
          background:'#1e293b',
          padding:20,
          borderRadius:15
        }}>

          <h3>📊 {aktifBlok} BLOK DETAY</h3>

          {Object.keys(records.reduce((acc, r) => {
            if (r.line.startsWith(aktifBlok)) {
              if (!acc[r.line]) acc[r.line] = []
              acc[r.line].push(r)
            }
            return acc
          }, {})).map(line => {

            const hatKayit = records.filter(r => r.line === line)

            let guncelKg = 0
            let guncelBoy = 0
            let tarih = null

            hatKayit.forEach(r => {

              const ekimTarihi = new Date(r.tarih)
              const bugun = new Date()

              const gun = Math.floor(
                (bugun - ekimTarihi) / (1000 * 60 * 60 * 24)
              )

              let buyume = 0

              if (gun > 15) {
                const ay = (gun - 15) / 30
                const ayNum = new Date().getMonth() + 1

                buyume = (ayNum >= 6 && ayNum <= 11)
                  ? ay * 0.3
                  : ay * 0.5
              }

              const boy = (r.cm || 0) + buyume
              if (boy > guncelBoy) guncelBoy = boy

              const halat = 56
              const hatMetre = (r.ara || 1) * halat

              let kg = parseFloat(r.kg) || 0

              if (r.cm <= 3) kg *= (4 ** (gun / 180))
              else if (r.cm <= 4.5) kg *= (2 ** (gun / 120))

              guncelKg += kg * hatMetre

              if (!tarih) tarih = r.tarih
            })

            return (
              <div key={line} style={{
  marginBottom:10,
  padding:10,
  background: guncelBoy >= 6 ? '#14532d' : '#334155',
  borderRadius:10,
  border: guncelBoy >= 6 ? '1px solid #22c55e' : 'none'
}}>
                <div><b>{line}</b></div>
                <div>📅 {new Date(tarih).toLocaleDateString()}</div>
                <div>🐚 {guncelKg.toFixed(0)} kg</div>
                <div>📏 {guncelBoy.toFixed(2)} cm</div>
              </div>
            )

          })}

        </div>
      )}

    </div>
  )
}

const cardPurple = {
  background:'linear-gradient(135deg,#7c3aed,#9333ea)',
  padding:20,
  borderRadius:15
}

const cardGreen = {
  background:'linear-gradient(135deg,#16a34a,#22c55e)',
  padding:20,
  borderRadius:15
}

const cardBlue = {
  background:'linear-gradient(135deg,#2563eb,#06b6d4)',
  padding:20,
  borderRadius:15
}