'use client'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'
import { useState, useEffect } from 'react'

export default function Page() {

  const router = useRouter()

  const [block, setBlock] = useState(null)
  const [selectedLine, setSelectedLine] = useState(null)
  const [records, setRecords] = useState([])

  const [ara, setAra] = useState('')
  const [kg, setKg] = useState('')
  const [cm, setCm] = useState('')
  const [tarih, setTarih] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [lastDeleted, setLastDeleted] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }
    }

    checkUser()

    const load = async () => {
      const { data, error } = await supabase
        .from('records')
        .select('*')

      if (!error && data) {
        setRecords(data)
      }
    }

    load()
  }, [])

  const handleSave = async () => {
    const yeni = {
      line: selectedLine,
      ara: parseFloat(ara) || 0,
      kg: parseFloat(kg) || 0,
      cm: parseFloat(cm) || 0,
      tarih
    }

    const { error } = await supabase
      .from('records')
      .insert([yeni])

    if (!error) {
      setRecords(prev => [...prev, yeni])
    }

    setSelectedLine(null)
    setAra('')
    setKg('')
    setCm('')
  }

  const confirmDelete = async () => {
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('line', deleteTarget)

    if (!error) {
      const kalan = records.filter(r => r.line !== deleteTarget)
      setRecords(kalan)
    }

    setDeleteTarget(null)
  }

  const undoDelete = () => {
    const updated = [...records, ...lastDeleted]
    localStorage.setItem('records', JSON.stringify(updated))
    setRecords(updated)
    setLastDeleted(null)
  }

  return (
    <div style={container}>

      {/* ÜST BAR */}
      <div style={{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:15
      }}>
        <b>👤 Hoşgeldin akana</b>
<button
  onClick={() => router.push('/hasat')}
  style={{
    background:'green',
    color:'white',
    padding:'10px',
    borderRadius:10,
    fontWeight:'bold',
    marginBottom:10
  }}
>
  HASAT
</button>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
          }}
          style={{
            background:'#ff4d4f',
            color:'white',
            border:'none',
            padding:'8px 14px',
            borderRadius:8,
            fontWeight:'bold'
          }}
          
        >
          <button
  onClick={() => router.push('/analiz')}
  style={{
    background:'#722ed1',
    color:'white',
    padding:'10px',
    borderRadius:10,
    fontWeight:'bold',
    marginBottom:10
  }}
>
  📊 ANALİZ
</button>
          Çıkış
        </button>
      </div>

      {/* BAŞLIK */}
      <div style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        gap:12,
        marginBottom:25
      }}>
        <img src="/midye.png" style={{width:50}} />

        <h1 style={{
          fontSize:30,
          fontWeight:'bold'
        }}>
          MİDYE TAKİP SİSTEMİ
        </h1>

        <img src="/midye.png" style={{width:50, transform:'scaleX(-1)'}} />
      </div>

      {/* BLOKLAR */}
      <div style={blockBar}>
       {['A','B','C','D','E','F'].map(b => (
  <button key={b} onClick={() => setBlock(b)} style={btnBlue}>
    {b} Blok
  </button>
))}
      </div>

      {/* GRID */}
      {block && (
        <div style={grid}>
          {[...Array(15)].map((_, i) => {
            const hat = block + (i + 1)
            const ilk = records.find(r => r.line === hat)

            let boy = 0

            if (ilk) {
              const gun = Math.floor(
                (new Date() - new Date(ilk.tarih))/(1000*60*60*24)
              )

              let buyume = 0

              if (gun > 15) {
                const ay = (gun - 15)/30
                const ayNum = new Date().getMonth()+1

                buyume = (ayNum >= 6 && ayNum <= 11)
                  ? ay * 0.3
                  : ay * 0.5
              }

              boy = (ilk.cm || 0) + buyume
            }

            const durum =
              boy >= 6 ? '🟢'
              : boy >= 5 ? '🟡'
              : '🔴'

            return (
              <div key={i} style={card} onClick={()=>setSelectedLine(hat)}>

                <div>
                  <div style={hatTitle}>{hat}</div>
                  <div style={hatInfo}>
                    {durum} {boy.toFixed(2)} cm
                  </div>
                </div>

                <div style={cardButtons}>
                  <button
                    onClick={(e)=>{
                      e.stopPropagation()
                      router.push(`/hat/${hat}`)
                    }}
                    style={btnDetail}
                  >
                    Detay
                  </button>

                  <button
                    onClick={(e)=>{
                      e.stopPropagation()
                      setDeleteTarget(hat)
                    }}
                    style={btnDelete}
                  >
                    🗑️
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* MODAL */}
      {selectedLine && (
        <div style={overlay}>
          <div style={modal}>

            <h2>{selectedLine} Ekim</h2>

            <input placeholder="Ara" value={ara} onChange={e=>setAra(e.target.value)} style={input}/>
            <input placeholder="KG" value={kg} onChange={e=>setKg(e.target.value)} style={input}/>
            <input placeholder="CM" value={cm} onChange={e=>setCm(e.target.value)} style={input}/>
            <input type="date" value={tarih} onChange={e=>setTarih(e.target.value)} style={input}/>

            <button style={btnSave} onClick={handleSave}>Kaydet</button>
            <button style={btnClose} onClick={()=>setSelectedLine(null)}>Kapat</button>

          </div>
        </div>
      )}

      {/* DELETE */}
      {deleteTarget && (
        <div style={overlay}>
          <div style={modal}>
            <h3>{deleteTarget} silinsin mi?</h3>
            <button onClick={confirmDelete} style={btnDelete}>Evet</button>
            <button onClick={()=>setDeleteTarget(null)}>Vazgeç</button>
          </div>
        </div>
      )}

    </div>
  )
}

/* STYLES */
const container = {
  padding:20,
  background:'#f0f2f5',
  minHeight:'100vh'
}

const blockBar = {
  display:'grid',
  gridTemplateColumns:'repeat(3, 1fr)',
  gap:12,
  marginBottom:20
}

const btnBlue = {
  background:'#0070f3',
  color:'white',
  border:'none',
  padding:'18px 0',
  borderRadius:12,
  fontSize:20,
  fontWeight:'bold'
}

const grid = {
  display:'grid',
  gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',
  gap:18
}

const card = {
  background:'white',
  padding:24,
  borderRadius:18,
  boxShadow:'0 8px 18px rgba(0,0,0,0.15)',
  display:'flex',
  flexDirection:'column',
  gap:18,
  cursor:'pointer'
}

const hatTitle = { fontSize:24, fontWeight:'bold' }
const hatInfo = { fontSize:18 }

const cardButtons = { display:'flex', gap:12 }

const btnDetail = {
  flex:2,
  background:'#333',
  color:'white',
  border:'none',
  padding:'14px',
  borderRadius:12
}

const btnDelete = {
  flex:1,
  background:'red',
  color:'white',
  border:'none',
  padding:'14px',
  borderRadius:12
}

const overlay = {
  position:'fixed',
  inset:0,
  background:'rgba(0,0,0,0.5)',
  display:'flex',
  justifyContent:'center',
  alignItems:'center'
}

const modal = {
  background:'white',
  padding:24,
  borderRadius:16,
  width:320,
  display:'flex',
  flexDirection:'column',
  gap:10
}

const input = {
  padding:10,
  borderRadius:8,
  border:'1px solid #ccc'
}

const btnSave = {
  background:'#0070f3',
  color:'white',
  padding:12,
  border:'none',
  borderRadius:10
}

const btnClose = {
  background:'#ddd',
  padding:12,
  border:'none',
  borderRadius:10
}