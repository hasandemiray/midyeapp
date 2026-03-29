'use client'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Analiz() {

  const router = useRouter()

  const [records, setRecords] = useState([])
  const [toplamKg, setToplamKg] = useState(0)
  const [bloklar, setBloklar] = useState({})
  const [hasatlikHatlar, setHasatlikHatlar] = useState([])
  const [hasatlikKg, setHasatlikKg] = useState(0)

  useEffect(() => {

    const load = async () => {

      const { data } = await supabase
        .from('records')
        .select('*')

      setRecords(data || [])
    }

    load()
  }, [])

  useEffect(() => {

    if (!records.length) return

    let toplam = 0
    let blokData = {}
    let hasatHat = []
    let hasatKg = 0

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
        hasatHat.push(line)
        hasatKg += guncelKg
      }

    })

    setToplamKg(toplam)
    setBloklar(blokData)
    setHasatlikHatlar(hasatHat)
    setHasatlikKg(hasatKg)

  }, [records])

  return (
    <div style={{ padding:20 }}>

      <button onClick={()=>router.push('/')}>← ANASAYFA</button>

      <h1>📊 ANALİZ PANELİ</h1>

      <h2>🏭 Tesis Toplam: {toplamKg.toFixed(2)} kg</h2>

      <h3>Bloklar:</h3>
      {Object.keys(bloklar).map(b => (
        <div key={b}>
          {b} Blok: {bloklar[b].toFixed(2)} kg
        </div>
      ))}

      <h3>🟢 Hasada Hazır Hatlar:</h3>
      <div>{hasatlikHatlar.join(', ')}</div>

      <h3>📦 Hasat Edilebilir KG:</h3>
      <div>{hasatlikKg.toFixed(2)} kg</div>

    </div>
  )
}