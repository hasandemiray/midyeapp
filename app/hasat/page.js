'use client'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Hasat() {

  const router = useRouter()

  const [line, setLine] = useState('')
  const [ara, setAra] = useState('')
  const [kg, setKg] = useState('')
  const [records, setRecords] = useState([])
  const [kalanKg, setKalanKg] = useState(0)

  // 🔐 login + veri çek
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      const { data: rec } = await supabase
        .from('records')
        .select('*')

      setRecords(rec || [])
    }

    checkUser()
  }, [])

  // 🔥 DETAY SAYFASIYLA AYNI TOPLAM KG HESABI
  const toplamKg = records
    .filter(r => r.line === line)
    .reduce((sum, r) => {

      const halat = 56
      const hatMetre = (r.ara || 1) * halat

      const ekimTarihi = new Date(r.tarih)
      const bugun = new Date()

      const gun = Math.floor(
        (bugun - ekimTarihi) / (1000 * 60 * 60 * 24)
      )

      let kgDeger = parseFloat(r.kg) || 0

      // 🔥 büyüme hesap (detay sayfasıyla aynı)
      if (r.cm <= 3) {
        kgDeger *= (4 ** (gun / 180))
      } else if (r.cm <= 4.5) {
        kgDeger *= (2 ** (gun / 120))
      }

      return sum + (kgDeger * hatMetre)

    }, 0)

  // 🔥 CANLI KALAN HESAP
  useEffect(() => {
    if (line && kg !== '') {
      const kalan = toplamKg - (parseFloat(kg) || 0)
      setKalanKg(kalan)
    }
  }, [kg, line, toplamKg])

  // 💾 KAYDET
  const handleSave = async () => {

    if (!line) return alert("Hat seç")

    const { error } = await supabase
      .from('hasat')
      .insert([{
        line,
        ara: parseFloat(ara) || 0,
        kg: parseFloat(kg) || 0
      }])

    if (!error) {
      alert("Hasat kaydedildi")
    }
  }

  return (
    <div style={{ padding:20 }}>

      <button onClick={()=>router.push('/')}>← ANASAYFA</button>

      <h1>HASAT PANELİ</h1>

      {/* HAT SEÇ */}
      <select onChange={e=>setLine(e.target.value)}>
        <option value="">Hat seç</option>

        {['A','B','C','D','E','F'].map(b =>
          [...Array(15)].map((_,i)=> {
            const hat = b + (i+1)
            return <option key={hat}>{hat}</option>
          })
        )}

      </select>

      <br /><br />

      <input
        placeholder="Kaç Ara Hasat"
        onChange={e=>setAra(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Satış KG"
        onChange={e=>setKg(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSave}>Kaydet</button>

      <hr />

      <h3>Toplam KG: {toplamKg.toFixed(2)}</h3>
      <h3>Hasat Edilen: {kg || 0}</h3>
      <h3>Kalan KG: {kalanKg.toFixed(2)}</h3>

    </div>
  )
}