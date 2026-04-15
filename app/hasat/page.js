'use client'

import { useRouter } from 'next/navigation'

export default function Hasat() {

  const router = useRouter()

  return (
    <div style={{padding:20}}>

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

    </div>
  )
}