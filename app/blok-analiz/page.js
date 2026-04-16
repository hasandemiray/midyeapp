'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function BlokAnaliz() {

  const router = useRouter()

  const [bloklar, setBloklar] = useState({})
  const [hatlar, setHatlar] = useState({})

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {

    const { data } = await supabase
      .from('hasat')
      .select('*')

    const blokMap = {}
    const hatMap = {}

    ;(data || []).forEach(d => {

      const kg = d.kg || 0

      if (!d.hat) return

      // 🔥 HAT NORMALİZE
      const hat = d.hat.toUpperCase().trim()

      if (!hatMap[hat]) hatMap[hat] = 0
      hatMap[hat] += kg

      // 🔥 BLOK NORMALİZE
      const blok = hat.charAt(0)

      if (!blokMap[blok]) blokMap[blok] = 0
      blokMap[blok] += kg

    })

    setBloklar(blokMap)
    setHatlar(hatMap)
  }

  const enIyiBlok = Object.entries(bloklar)
    .sort((a,b)=>b[1]-a[1])[0]

  const enIyiHat = Object.entries(hatlar)
    .sort((a,b)=>b[1]-a[1])[0]

  return (
    <div style={{padding:20}}>

      <div style={{display:'flex', gap:10, marginBottom:15}}>
        <button onClick={()=>router.back()} style={btnGri}>← Geri</button>
        <button onClick={()=>router.push('/')} style={btnYesil}>🏠 Anasayfa</button>
      </div>

      <h2>📊 Blok & Hat Analiz</h2>

      <div style={{marginTop:15}}>

        <div style={kartMor}>
          🏆 En iyi blok <br/>
          <b>{enIyiBlok?.[0]} ({enIyiBlok?.[1]} kg)</b>
        </div>

        <div style={kartYesil}>
          👑 En iyi hat <br/>
          <b>{enIyiHat?.[0]} ({enIyiHat?.[1]} kg)</b>
        </div>

      </div>

      <h3 style={{marginTop:20}}>📦 Bloklar</h3>

      {Object.entries(bloklar)
        .sort((a,b)=>b[1]-a[1])
        .map(([blok, kg]) => (
          <div key={blok} style={listItem}>
            {blok} Blok
            <span>{kg} kg</span>
          </div>
      ))}

      <h3 style={{marginTop:20}}>🔗 Hatlar</h3>

      {Object.entries(hatlar)
        .sort((a,b)=>b[1]-a[1])
        .map(([hat, kg]) => (
          <div key={hat} style={listItem}>
            {hat}
            <span>{kg} kg</span>
          </div>
      ))}

    </div>
  )
}

/* STYLE */

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

const kartMor = {
  background:'linear-gradient(90deg,#7c3aed,#9333ea)',
  color:'white',
  padding:15,
  borderRadius:12,
  marginTop:10
}

const kartYesil = {
  background:'linear-gradient(90deg,#16a34a,#22c55e)',
  color:'white',
  padding:15,
  borderRadius:12,
  marginTop:10
}

const listItem = {
  background:'#f1f5f9',
  padding:12,
  borderRadius:10,
  marginTop:8,
  display:'flex',
  justifyContent:'space-between'
}