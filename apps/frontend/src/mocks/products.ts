import type { Product } from '@vladi-cars/shared-types'

const brands = ['Toyota', 'Nissan', 'Mitsubishi', 'Honda', 'Subaru', 'Mazda', 'Suzuki', 'Lexus', 'Infiniti', 'Isuzu']
const models: Record<string, string[]> = {
  Toyota: ['Land Cruiser Prado', 'Land Cruiser 200', 'Camry', 'Corolla', 'RAV4', 'Harrier', 'Crown', 'Alphard', 'Hiace', 'Mark X'],
  Nissan: ['X-Trail', 'Patrol', 'Qashqai', 'Teana', 'Juke', 'Murano', 'Pathfinder', 'Skyline', 'Note', 'Serena'],
  Mitsubishi: ['Pajero', 'Outlander', 'L200', 'ASX', 'Lancer', 'Delica', 'Eclipse Cross', 'Grandis'],
  Honda: ['CR-V', 'Civic', 'Accord', 'Stepwgn', 'Vezel', 'Fit', 'Odyssey', 'Pilot'],
  Subaru: ['Forester', 'Outback', 'Impreza', 'Legacy', 'XV', 'Levorg', 'WRX'],
  Mazda: ['CX-5', 'CX-9', 'Mazda 6', 'Mazda 3', 'CX-7', 'BT-50'],
  Suzuki: ['Grand Vitara', 'Swift', 'SX4', 'Escudo', 'Jimny'],
  Lexus: ['RX350', 'LX570', 'NX200', 'ES350', 'GX460', 'IS250'],
  Infiniti: ['FX35', 'QX80', 'Q50', 'Q70', 'QX60'],
  Isuzu: ['Trooper', 'Bighorn', 'D-Max', 'MU-X'],
}

const categories: Product['category'][] = [
  'engine', 'transmission', 'suspension', 'brakes', 'body',
  'optics', 'electronics', 'interior', 'exhaust', 'cooling',
]

const categoryNames: Record<Product['category'], string> = {
  engine: 'Двигатель',
  transmission: 'Трансмиссия',
  suspension: 'Подвеска',
  brakes: 'Тормозная система',
  body: 'Кузов',
  optics: 'Оптика',
  electronics: 'Электроника',
  interior: 'Салон',
  exhaust: 'Выхлопная система',
  cooling: 'Система охлаждения',
}

const partNames: Record<Product['category'], string[]> = {
  engine: ['Двигатель в сборе', 'Головка блока цилиндров', 'Поршневая группа', 'Коленчатый вал', 'Распредвал', 'Масляный насос', 'Форсунки', 'Турбина', 'Ремень ГРМ', 'Прокладка ГБЦ'],
  transmission: ['АКПП в сборе', 'МКПП в сборе', 'Вариатор', 'Карданный вал', 'Сцепление', 'Дифференциал', 'Раздаточная коробка', 'Приводной вал'],
  suspension: ['Амортизатор', 'Пружина', 'Стойка стабилизатора', 'Рычаг подвески', 'Шаровая опора', 'Сайлентблок', 'Подушка двигателя', 'Стабилизатор'],
  brakes: ['Тормозные колодки', 'Тормозной диск', 'Суппорт', 'Тормозной барабан', 'Вакуумный усилитель', 'Главный тормозной цилиндр'],
  body: ['Капот', 'Крыло переднее', 'Дверь', 'Бампер передний', 'Бампер задний', 'Крышка багажника', 'Решетка радиатора', 'Порог', 'Крыша'],
  optics: ['Фара левая', 'Фара правая', 'Задний фонарь', 'Противотуманная фара', 'Поворотник', 'Дневные ходовые огни'],
  electronics: ['ЭБУ двигателя', 'Генератор', 'Стартер', 'Датчик ABS', 'Лямбда-зонд', 'Катушка зажигания', 'Аккумулятор', 'Блок управления'],
  interior: ['Сиденье водительское', 'Панель приборов', 'Руль', 'Магнитола', 'Коврик салона', 'Обшивка двери', 'Потолок', 'Ручка КПП'],
  exhaust: ['Глушитель', 'Катализатор', 'Выпускной коллектор', 'Гофра выхлопа', 'Резонатор', 'Глушитель задний'],
  cooling: ['Радиатор', 'Вентилятор радиатора', 'Помпа', 'Термостат', 'Расширительный бачок', 'Патрубки охлаждения'],
}

function generatePrice(category: Product['category'], condition: 'new' | 'used'): number {
  const basePrices: Record<Product['category'], [number, number]> = {
    engine: [30000, 150000],
    transmission: [20000, 120000],
    suspension: [3000, 25000],
    brakes: [2000, 15000],
    body: [5000, 40000],
    optics: [5000, 35000],
    electronics: [3000, 30000],
    interior: [3000, 30000],
    exhaust: [3000, 25000],
    cooling: [2000, 20000],
  }
  const [min, max] = basePrices[categories.find(c => c === category) || 'engine']
  const multiplier = condition === 'new' ? 1.3 : 0.7
  return Math.round((min + Math.random() * (max - min)) * multiplier)
}

function generateId(index: number): string {
  return `PROD-${String(index + 1).padStart(4, '0')}`
}

export function generateProducts(count: number = 100): Product[] {
  const products: Product[] = []

  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)]
    const brandModels = models[brand]
    const model = brandModels[Math.floor(Math.random() * brandModels.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const partNamesList = partNames[category]
    const partName = partNamesList[Math.floor(Math.random() * partNamesList.length)]
    const condition = Math.random() > 0.4 ? 'used' : 'new'
    const year = 1995 + Math.floor(Math.random() * 30)

    products.push({
      id: generateId(i),
      name: `${partName} ${brand} ${model} (${year})`,
      description: `${categoryNames[category]}: ${partName} для ${brand} ${model} ${year} года. ${condition === 'used' ? 'Контрактная запчасть из Японии. Состояние отличное.' : 'Оригинальная новая запчасть. В наличии во Владивостоке.'}`,
      price: generatePrice(category, condition),
      currency: '₽',
      images: [],
      category,
      brand,
      model,
      year,
      condition,
      inStock: Math.random() > 0.15,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return products
}

export const products = generateProducts(100)
