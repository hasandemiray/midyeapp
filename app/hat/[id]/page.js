'use client';
import { supabase } from '../../lib/supabase'
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HatDetay() {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [gecenGun, setGecenGun] = useState(0)
  

useEffect(() => {
  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/login')
      return
    }

    const { data: recordsData, error } = await supabase
      .from('records')
      .select('*')

    if (!error && recordsData) {
      setRecords(recordsData)

      const hatKayitlari = recordsData.filter(r => r.line === id)

      if (hatKayitlari.length > 0) {
        const sorted = [...hatKayitlari].sort(
          (a, b) => new Date(a.tarih) - new Date(b.tarih)
        )

        const ilkTarih = new Date(sorted[0].tarih)
        const bugun = new Date()

        const fark = Math.floor(
          (bugun - ilkTarih) / (1000 * 60 * 60 * 24)
        )

        setGecenGun(fark)
      }
    }
  }

  checkUser()
}, [])

  const hatKayitlari = records.filter(r => r.line === id);

  const sirali = [...hatKayitlari].sort(
    (a, b) => new Date(a.tarih) - new Date(b.tarih)
  );

  const ilkKayit = sirali[0];

  let guncelBoy = 0;
  let guncelKg = 0;
  let metre = 0;
  let toplamIlkKg = 0;
  let ilkToplamKg = 0;

  sirali.forEach(r => {

    const ekimTarihi = new Date(r.tarih);
    const bugun = new Date();

    const gun = Math.floor(
      (bugun - ekimTarihi) / (1000 * 60 * 60 * 24)
    );

    let buyume = 0;

    if (gun > 15) {
      const ay = (gun - 15) / 30;
      const ayNum = bugun.getMonth() + 1;

      buyume = (ayNum >= 6 && ayNum <= 11)
        ? ay * 0.3
        : ay * 0.5;
    }

    const boy = (r.cm || 0) + buyume;

    if (boy > guncelBoy) {
      guncelBoy = boy;
    }

    const halat = 56;
    const hatMetre = (r.ara || 1) * halat;

    metre += hatMetre;

    const ilkKg = (parseFloat(r.kg) || 0) * hatMetre;
    toplamIlkKg += ilkKg;

    let kg = parseFloat(r.kg) || 0;

    if (r.cm <= 3) {
      kg *= (4 ** (gun / 240));
    } else if (r.cm <= 4.5) {
      kg *= (2 ** (gun / 150));
    }

    guncelKg += kg * hatMetre;
  });

  if (ilkKayit) {
    ilkToplamKg =
      (parseFloat(ilkKayit.kg) || 0) *
      (ilkKayit.ara || 1) * 56;
  }

  const durum =
    guncelBoy >= 6 ? '🟢 HASADA HAZIR'
    : guncelBoy >= 5 ? '🟡 YAKLAŞTI'
    : '🔴 ERKEN';

  return (
    <div style={{ padding: 20 }}>

      {/* 🔥 SADECE BURASI DEĞİŞTİ */}
      <Link href="/" style={homeBtn}>← ANASAYFA</Link>

      {/* 🔥 SADECE BURASI DEĞİŞTİ */}
      <div style={titleBox}>{id} Detay</div>

      <h2>
        <b>Güncel Boy:</b> 
        <span style={valueBox}>{guncelBoy.toFixed(2)} cm</span>
      </h2>

      <h2>
        <b>Toplam Metre:</b> 
        <span style={valueBox}>{metre} m</span>
      </h2>

      <h2>
        <b>İlk Toplam KG:</b> 
        <span style={valueBox}>{toplamIlkKg.toFixed(2)}</span>
      </h2>

      <h2>
        <b>Toplam KG:</b> 
        <span style={valueBox}>{guncelKg.toFixed(2)}</span>
      </h2>

      <h3>
        <b>Geçen Gün:</b> 
        <span style={valueBox}>{gecenGun} gün</span>
      </h3>

      <h2>
        <b>Artış:</b> 
        <span style={valueBox}>
          {(guncelKg - toplamIlkKg).toFixed(2)} kg
        </span>
      </h2>

      <h3>{durum}</h3>

      {ilkKayit && (
        <div style={box}>
          <h3>İlk Ekim</h3>

          <div>Ara: {ilkKayit.ara}</div>
          <div>KG (metre): {ilkKayit.kg}</div>
          <div>İlk Toplam KG: {ilkToplamKg.toFixed(2)}</div>
          <div>Boy: {ilkKayit.cm} cm</div>
          <div>
            Tarih: {new Date(ilkKayit.tarih).toLocaleDateString()}
          </div>
        </div>
      )}

      {sirali.length > 0 && (
        <div style={box}>
          <h3>Ekim Geçmişi</h3>

          {sirali.map((r, i) => {

            const halat = 56;
            const toplamKg =
              (parseFloat(r.kg) || 0) *
              (r.ara || 1) * halat;

            return (
              <div key={i} style={{ fontSize:14 }}>
                {new Date(r.tarih).toLocaleDateString()} →
                {r.kg} kg / {r.cm} cm / Ara: {r.ara}
                {" "}→ {toplamKg.toFixed(2)} kg
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

const box = {
  background: '#f5f5f5',
  padding: 15,
  borderRadius: 10,
  marginTop: 10
};

const valueBox = {
  background:'#0070f3',
  color:'white',
  padding:'4px 10px',
  borderRadius:8,
  marginLeft:8,
  fontWeight:'bold'
};

/* 🔥 YENİ EKLENEN SADECE 2 STYLE */
const homeBtn = {
  background:'red',
  color:'white',
  padding:'10px 15px',
  fontWeight:'bold',
  fontSize:18,
  borderRadius:10,
  display:'inline-block',
  marginBottom:10,
  textDecoration:'none'
};

const titleBox = {
  background:'green',
  color:'white',
  padding:'10px',
  fontSize:22,
  fontWeight:'bold',
  borderRadius:10,
  marginBottom:10
};