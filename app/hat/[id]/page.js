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

    // kullanıcı varsa veri çek
    const { data: recordsData, error } = await supabase
      .from('records')
      .select('*')

    if (!error && recordsData) {
      setRecords(recordsData)

      // 🔥 SADECE EKLENEN KISIM
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

  // 🔥 TÜM EKİMLER
  sirali.forEach(r => {

    const ekimTarihi = new Date(r.tarih);
    const bugun = new Date();

    const gun = Math.floor(
      (bugun - ekimTarihi) / (1000 * 60 * 60 * 24)
    );

    // BOY
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

    // METRE
    const halat = 56;
    const hatMetre = (r.ara || 1) * halat;

    metre += hatMetre;

    // İLK HAL
    const ilkKg = (parseFloat(r.kg) || 0) * hatMetre;
    toplamIlkKg += ilkKg;

    // BÜYÜMÜŞ HAL
    let kg = parseFloat(r.kg) || 0;

    if (r.cm <= 3) {
      kg *= (4 ** (gun / 180));
    } else if (r.cm <= 4.5) {
      kg *= (2 ** (gun / 120));
    }

    guncelKg += kg * hatMetre;
  });

  // 🔥 İLK EKİM TOPLAM
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

      <Link href="/">← Ana Sayfa</Link>

      <h1>{id} Detay</h1>

      
      

      {/* İLK EKİM */}
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

      {/* GÜNCEL */}
      <h2>Güncel Boy: {guncelBoy.toFixed(2)} cm</h2>

      <h2>Toplam Metre: {metre} m</h2>

      <h2>İlk Toplam KG: {toplamIlkKg.toFixed(2)}</h2>

      <h2>Toplam KG: {guncelKg.toFixed(2)}</h2>
      <h3>Geçen Gün: {gecenGun} gün</h3>

      <h2>
        Artış: {(guncelKg - toplamIlkKg).toFixed(2)} kg
      </h2>

      <h3>{durum}</h3>

      {/* 🔥 EKİM GEÇMİŞİ */}
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

/* STYLE */
const box = {
  background: '#f5f5f5',
  padding: 15,
  borderRadius: 10,
  marginTop: 10
};