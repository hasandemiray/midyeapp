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

  const [weather, setWeather] = useState(null)

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

  // 🔥 HAVA + DENİZ (FIXLİ)
  useEffect(() => {

    const getWeather = async () => {
      try {
        const lat = 40.40
        const lon = 27.85

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=sea_surface_temperature`
        )

        const data = await res.json()

        if (!data?.current_weather) return

        setWeather({
          temp: data.current_weather.temperature,
          sea: data.hourly?.sea_surface_temperature?.[0]
        })

      } catch (err) {
        console.log("weather error", err)
      }
    }

    getWeather()

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

  return (
    <div style={container}>

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
            padding:'10px 20px',
            borderRadius:10,
            fontWeight:'bold'
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
            padding:'10px 14px',
            borderRadius:10,
            fontWeight:'bold'
          }}
        >
          Çıkış
        </button>
      </div>

      {/* 🔥 WEATHER */}
      <div style={{
        background:'#1e293b',
        padding:12,
        borderRadius:12,
        marginBottom:15,
        color:'white'
      }}>
        <div>📅 {new Date().toLocaleDateString()}</div>

        {weather && (
          <>
            <div>🌤️ Hava: {weather.temp}°C</div>
            <div>🌊 Deniz: {weather.sea?.toFixed(1)}°C</div>
          </>
        )}
      </div>

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

      <div style={blockBar}>
        {['A','B','C','D','E','F'].map(b => (
          <button key={b} onClick={() => setBlock(b)} style={btnBlue}>
            {b} Blok
          </button>
        ))}
      </div>

      <div style={{marginBottom:20}}>
        <button
          onClick={() => router.push('/analiz')}
          style={{
            width:'100%',
            background:'#722ed1',
            color:'white',
            padding:'16px',
            border:'none',
            borderRadius:12,
            fontSize:18,
            fontWeight:'bold'
          }}
        >
          📊 ANALİZ PANELİ
        </button>
      </div>

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

/* 🔥 SADECE STYLE EKLENDİ */

const container = {
  padding:20,
  background:'#f0f2f5',
  minHeight:'100vh'
}

const blockBar = {
  display:'grid',
  gridTemplateColumns:'repeat(3,1fr)',
  gap:10,
  marginBottom:20
}

const btnBlue = {
  background:'#1677ff',
  color:'white',
  padding:'14px',
  border:'none',
  borderRadius:10,
  fontWeight:'bold'
}

const grid = {
  display:'grid',
  gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',
  gap:15
}

const card = {
  background:'white',
  padding:15,
  borderRadius:12,
  display:'flex',
  justifyContent:'space-between',
  alignItems:'center'
}

const hatTitle = {
  fontWeight:'bold',
  fontSize:18
}

const hatInfo = {
  fontSize:14
}

const cardButtons = {
  display:'flex',
  gap:5
}

const btnDetail = {
  background:'#52c41a',
  color:'white',
  border:'none',
  padding:'6px 8px',
  borderRadius:6
}

const btnDelete = {
  background:'#ff4d4f',
  color:'white',
  border:'none',
  padding:'6px 8px',
  borderRadius:6
}

const overlay = {
  position:'fixed',
  top:0,
  left:0,
  width:'100%',
  height:'100%',
  background:'rgba(0,0,0,0.5)',
  display:'flex',
  justifyContent:'center',
  alignItems:'center'
}

const modal = {
  background:'white',
  padding:20,
  borderRadius:12,
  width:300
}

const input = {
  width:'100%',
  marginBottom:10,
  padding:8
}

const btnSave = {
  background:'#1677ff',
  color:'white',
  padding:10,
  width:'100%',
  border:'none',
  borderRadius:8
}

const btnClose = {
  marginTop:10,
  padding:8,
  width:'100%'
}