'use client'

import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'

export default function Home() {

  const router = useRouter()

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

      {/* 🔥 BAŞLIK */}
      <div style={{
  display:'flex',
  justifyContent:'center',
  alignItems:'center',
  gap:10,
  margin:'20px 0'
}}>

  <img src="/midye.png" width={40} />

  <h1 style={{margin:0}}>MİDYE TAKİP SİSTEMİ</h1>

  <img src="/midye.png" width={40} />

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

    </div>
  )
}