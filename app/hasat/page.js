'use client'

import { useRouter } from 'next/navigation'

export default function Hasat() {

  const router = useRouter()

  return (
    <div style={{padding:20}}>

      {/* 🔙 ÜST BAR */}
      <div style={{
        display:'flex',
        gap:10,
        marginBottom:15
      }}>
        <button
          onClick={()=>router.push('/')}
          style={{
            background:'#ef4444',
            color:'white',
            padding:'8px 12px',
            borderRadius:8,
            border:'none'
          }}
        >
          ← Anasayfa
        </button>
      </div>

      <h2 style={{marginBottom:15}}>📊 Hasat - Blok Seç</h2>

      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(3,1fr)',
        gap:10
      }}>

        {['A','B','C','D','E','F'].map(b => (
          <button
            key={b}
            onClick={()=>router.push(`/hasat/${b}`)}
            style={{
              background:'#16a34a',
              color:'white',
              padding:20,
              borderRadius:12,
              fontWeight:'bold',
              fontSize:16
            }}
          >
            {b} Blok
          </button>
        ))}

      </div>

      {/* 🔥 ANALİZ BUTONU */}
      <div style={{marginTop:15}}>
        <button
          onClick={()=>router.push('/hasat-analiz')}
          style={{
            width:'100%',
            background:'linear-gradient(90deg,#0ea5e9,#0284c7)',
            color:'white',
            padding:15,
            borderRadius:10,
            fontWeight:'bold'
          }}
        >
          📊 HASAT ANALİZ PANELİ
        </button>
      </div>

    </div>
  )
}