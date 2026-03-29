'use client'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Hasat() {

  const router = useRouter()

  const [line, setLine] = useState('')
  const [records, setRecords] = useState([])
  const [hasatlar, setHasatlar] = useState([])

  const [hasatlikHatlar, setHasatlikHatlar] = useState([])
  const [boylamaHatlar, setBoylamaHatlar] = useState([])

  const [kg, setKg] = useState('')
  const [toplamKg, setToplamKg] = useState(0)
  const [kalanKg, setKalanKg] = useState(0)

  useEffect(() => {
    const loadData = async () => {

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      const { data: recordsData } = await supabase
        .from('records')
        .select('*')

      setRecords(recordsData || [])

      const { data: hasatData } = await supabase
        .from('hasat')
        .select('*')

      setHasatlar(hasatData || [])
    }

    loadData()
  }, [])

  useEffect(() => {

    if (!records.length) return

    const hatlar = {}

    records.forEach(r => {
      if (!hatlar[r.line]) hatlar[r.line] = []
      hatlar[r.line].push(r)
    })

    const hasatList = []
    const boylamaList = []

    Object.keys(hatlar).forEach(line => {

      const sirali = [...hatlar[line]].sort(
        (a, b) => new Date(a.tarih) - new Date(b.tarih)
      )

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

        if (boy > enBuyukBoy) {
          enBuyukBoy = boy
        }
      })

      if (enBuyukBoy >= 6) {
        hasatList.push(line)
      } else {
        boylamaList.push(line)
      }

    })

    setHasatlikHatlar(hasatList)
    setBoylamaHatlar(boylamaList)

  }, [records])

  useEffect(() => {

    if (!line) return

    const hatKayitlari = records.filter(r => r.line === line)

    const sirali = [...hatKayitlari].sort(
      (a, b) => new Date(a.tarih) - new Date(b.tarih)
    )

    let guncelKg = 0

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

      guncelKg += kgDeger * hatMetre
    })

    const ilgiliHasatlar = hasatlar.filter(h => h.line === line)

    const toplamHasat = ilgiliHasatlar.reduce(
      (acc, h) => acc + (parseFloat(h.kg) || 0),
      0
    )

    const kalan = guncelKg - toplamHasat

    setToplamKg(kalan < 0 ? 0 : kalan)

  }, [line, records, hasatlar])

  useEffect(() => {
    if (kg !== '') {
      setKalanKg(toplamKg - (parseFloat(kg) || 0))
    }
  }, [kg, toplamKg])

  const handleSave = async () => {

    if (!line) return alert("Hat seç")
    if (!kg || kg <= 0) return alert("Geçerli KG gir")

    const yeni = {
      line,
      kg: parseFloat(kg) || 0,
      tarih: new Date().toISOString()
    }

    await supabase.from('hasat').insert([yeni])

    setHasatlar(prev => [...prev, yeni])
    setKg('')
  }

  const deleteHasat = async (id) => {

    const confirmDelete = confirm("Silinsin mi?")
    if (!confirmDelete) return

    await supabase
      .from('hasat')
      .delete()
      .eq('id', id)

    setHasatlar(prev => prev.filter(h => h.id !== id))
  }

  return (
    <div style={{ padding:20 }}>
      <button onClick={()=>router.push('/')}>← Anasayfa</button>
      <h1>HASAT PANELİ</h1>
    </div>
  )
}