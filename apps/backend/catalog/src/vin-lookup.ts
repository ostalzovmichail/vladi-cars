const wmiMap: Record<string, string[]> = {
  J: ['Lexus', 'Infiniti', 'Acura'],
  JT: ['Toyota', 'Lexus'],
  JTE: ['Toyota'],
  JTF: ['Toyota'],
  JTG: ['Toyota'],
  JTJ: ['Lexus'],
  JTK: ['Toyota'],
  JTM: ['Toyota'],
  JTN: ['Toyota'],
  JTP: ['Toyota'],
  JTS: ['Toyota'],
  JN: ['Nissan', 'Infiniti'],
  JNA: ['Nissan'],
  JNC: ['Nissan'],
  JND: ['Nissan'],
  JNF: ['Nissan', 'Infiniti'],
  JNK: ['Nissan', 'Infiniti'],
  JNR: ['Infiniti'],
  JNX: ['Nissan'],
  JA: ['Isuzu'],
  JAA: ['Isuzu'],
  JAB: ['Isuzu'],
  JM: ['Mitsubishi'],
  JMA: ['Mitsubishi'],
  JMB: ['Mitsubishi'],
  JMG: ['Mitsubishi'],
  JH: ['Honda', 'Acura'],
  JHM: ['Honda'],
  JHG: ['Honda'],
  JH4: ['Acura'],
  JF: ['Subaru', 'Mazda', 'Hino'],
  JFM: ['Mazda'],
  JF1: ['Subaru'],
  JF2: ['Subaru'],
  JSA: ['Suzuki', 'Mazda'],
  JS1: ['Suzuki'],
  JS2: ['Suzuki'],
  JS3: ['Suzuki'],
  KL: ['Hyundai', 'Daewoo'],
  KLA: ['Daewoo'],
  KL4: ['Daewoo'],
  KM: ['Hyundai'],
  KMH: ['Hyundai'],
  KNA: ['Kia'],
  KNC: ['Kia'],
}

export function lookupVin(vin: string): { brand: string | null, hint: string | null } {
  if (!vin || vin.length < 3) return { brand: null, hint: 'VIN должен содержать минимум 3 символа' }

  const upperVin = vin.toUpperCase()
  const wmi = upperVin.slice(0, 3)

  const matched = wmiMap[wmi] || wmiMap[wmi.slice(0, 2)] || wmiMap[wmi[0]] || null

  if (!matched) return { brand: null, hint: 'Не удалось определить производителя по VIN' }

  if (matched.length === 1) return { brand: matched[0], hint: null }

  return { brand: matched[0], hint: `Производитель: ${matched.join(', ')}` }
}
