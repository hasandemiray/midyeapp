'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'

export default function Home() {

  const router = useRouter()

  // ✅ LOGIN KONTROLÜ EKLENDİ
  useEffect(() => {
    const kontrol = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push('/login')
      }
    }

    kontrol()
  }, [])

  const cikisYap = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{padding:20}}>

      {/* 🔥 ÜST BAR */}
      <div style={{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:10
      }}>

        <div style={{fontSize:14}}>
          👤 Hoşgeldin akana
        </div>

        <button onClick={cikisYap} style={{
          background:'#ef4444',
          color:'white',
          padding:'8px 12px',
          borderRadius:8,
          border:'none'
        }}>
          Çıkış
        </button>
      </div>

      <div style={{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        gap:10,
        marginBottom:20
      }}>

        <img src="/midye.png" width={40} />

        <div style={{
          fontWeight:'bold',
          fontSize:18
        }}>
          MİDYE TAKİP SİSTEMİ
        </div>

        <img 
          src="/midye.png" 
          width={40} 
          style={{transform:'scaleX(-1)'}} 
        />
      </div>

      {/* 🔥 BLOKLAR */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(3,1fr)',
        gap:10
      }}>

        {['A','B','C','D','E','F'].map(b => (
          <button
            key={b}
            onClick={()=>router.push(`/hat/${b}`)}
            style={{
              background:'#1d4ed8',
              color:'white',
              padding:20,
              borderRadius:10,
              fontWeight:'bold'
            }}
          >
            {b} Blok
          </button>
        ))}

      </div>

      {/* 🔥 ANALİZ */}
      <div style={{marginTop:15}}>
        <button
          onClick={()=>router.push('/analiz')}
          style={{
            width:'100%',
            background:'linear-gradient(90deg,#7c3aed,#9333ea)',
            color:'white',
            padding:15,
            borderRadius:10,
            fontWeight:'bold'
          }}
        >
          📊 ANALİZ PANELİ
        </button>
      </div>

      {/* 🔥 HASAT DEFTERİ */}
      <div style={{marginTop:10}}>
        <button
          onClick={()=>router.push('/hasat')}
          style={{
            width:'100%',
            background:'linear-gradient(90deg,#16a34a,#22c55e)',
            color:'white',
            padding:15,
            borderRadius:10,
            fontWeight:'bold'
          }}
        >
          🐚 HASAT DEFTERİ
        </button>
      </div>

    </div>
  )
}