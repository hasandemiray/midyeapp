export function hesaplaHat(records, line) {

  const hatKayitlari = records.filter(r => r.line === line)

  const sirali = [...hatKayitlari].sort(
    (a, b) => new Date(a.tarih) - new Date(b.tarih)
  )

  let guncelKg = 0
  let guncelBoy = 0

  sirali.forEach(r => {

    const ekimTarihi = new Date(r.tarih)
    const bugun = new Date()

    const gun = Math.floor(
      (bugun - ekimTarihi) / (1000 * 60 * 60 * 24)
    )

    // BOY
    let buyume = 0

    if (gun > 15) {
      const ay = (gun - 15) / 30
      const ayNum = bugun.getMonth() + 1

      buyume = (ayNum >= 6 && ayNum <= 11)
        ? ay * 0.3
        : ay * 0.5
    }

    const boy = (r.cm || 0) + buyume

    if (boy > guncelBoy) {
      guncelBoy = boy
    }

    // KG
    const halat = 56
    const hatMetre = (r.ara || 1) * halat

    let kg = parseFloat(r.kg) || 0

    if (r.cm <= 3) {
      kg *= (4 ** (gun / 180))
    } else if (r.cm <= 4.5) {
      kg *= (2 ** (gun / 120))
    }

    guncelKg += kg * hatMetre
  })

  return { guncelKg, guncelBoy }
}