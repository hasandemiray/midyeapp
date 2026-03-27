'use client'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Hasat() {

  const router = useRouter()

  const [line, setLine] = useState('')
  const [records, setRecords] = useState([])
  const [kg, setKg] = useState('')
  const [kalanKg, setKalanKg] = useState(0)

  // 🔐 login + veri çek
  useEffect(() => {
  const checkUser = async () => {

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      router.push('/login')
      return
    }

    const { data: recordsData } = await supabase
      .from('records')
      .select('*')

    setRecords(recordsData || [])
  }

  checkUser()
}, [])

  // 🔥 DETAY SAYFASIYLA AYNI HESAP
  const hatKayitlari = records.filter(r => r.line === line)

  const sirali = [...hatKayitlari].sort(
    (a, b) => new Date(a.tarih) - new Date(b.tarih)
  )

  let toplamKg = 0

  sirali.forEach(r => {

    const ekimTarihi = new Date(r.tarih)
    const bugun = new Date()

    const gun = Math.floor(
      (bugun - ekimTarihi) / (1000 * 60 * 60 * 24)
    )

    const halat = 56
    const hatMetre = (r.ara || 1) * halat

    let kgDeger = parseFloat(r.kg) || 0

    if (r.cm <= 3) {
      kgDeger *= (4 ** (gun / 180))
    } else if (r.cm <= 4.5) {
      kgDeger *= (2 ** (gun / 120))
    }

    toplamKg += kgDeger * hatMetre
  })

  // 🔥 CANLI KALAN
  useEffect(() => {
    if (kg !== '') {
      const kalan = toplamKg - (parseFloat(kg) || 0)
      setKalanKg(kalan)
    }
  }, [kg, toplamKg])

  // 💾 KAYDET
  const handleSave = async () => {

    if (!line) return alert("Hat seç")

    await supabase.from('hasat').insert([{
      line,
      kg: parseFloat(kg) || 0
    }])

    alert("Hasat kaydedildi")
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

      <hr />

      {/* 🔥 DETAY GİBİ */}
      <h2>Toplam KG: {toplamKg.toFixed(2)}</h2>

      {/* 🔥 HASAT */}
      {line && (
        <>
          <input
            placeholder="Hasat KG"
            onChange={e=>setKg(e.target.value)}
          />

          <br /><br />

          <button onClick={handleSave}>Kaydet</button>

          <h3>Hasat Edilen: {kg || 0}</h3>
          <h3>Kalan KG: {kalanKg.toFixed(2)}</h3>
        </>
      )}

    </div>
  )
}