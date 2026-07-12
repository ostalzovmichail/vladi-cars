import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as bcrypt from 'bcrypt'

const dbUrl = new URL(process.env.DATABASE_URL!)
const pool = new pg.Pool({
  host: dbUrl.hostname,
  port: Number(dbUrl.port),
  database: dbUrl.pathname.slice(1),
  user: dbUrl.username,
  password: dbUrl.password,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

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

const categories = [
  'engine', 'transmission', 'suspension', 'brakes', 'body',
  'optics', 'electronics', 'interior', 'exhaust', 'cooling',
] as const

const categoryNames: Record<string, string> = {
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

function cuid(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `c${timestamp}${random}`
}

const partNames: Record<string, string[]> = {
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

const reviewTexts = [
  'Отличная запчасть, подошла идеально. Доставка быстрая.',
  'Хорошее качество, соответствует описанию. Рекомендую.',
  'Заказал впервые, остался доволен. Буду заказывать ещё.',
  'Цена/качество отличное. Пришло быстро и хорошо упаковано.',
  'Немного задержали доставку, но товар отличный.',
  'Всё супер, оригинал как и заявлено. Мастер подтвердил.',
  'Долго искал эту деталь, здесь нашёл. Спасибо!',
  'Качество хорошее, но упаковка могла быть лучше.',
]

function generatePrice(category: string, condition: string): number {
  const basePrices: Record<string, [number, number]> = {
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
  const [min, max] = basePrices[category] || [5000, 50000]
  const multiplier = condition === 'new' ? 1.3 : 0.7
  return Math.round((min + Math.random() * (max - min)) * multiplier)
}

function pick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

async function main() {
  console.log('Clearing existing data...')
  for (const table of ['order_items', 'orders', 'cart_items', 'carts', 'password_reset_tokens']) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM ${table}`)
    } catch {
      // table may not exist, ignore
    }
  }
  await prisma.review.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 6)

  console.log('Creating users...')
  const createUser = async (name: string, email: string, role: string, phone?: string) => {
    const id = cuid()
    const now = new Date()
    await prisma.$executeRawUnsafe(
      'INSERT INTO users (id, name, email, password_hash, phone, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      id, name, email, passwordHash, phone ?? null, role, now, now,
    )
    return { id, name } as const
  }
  const admin = await createUser('Администратор', 'admin@test.com', 'admin')
  const ivan = await createUser('Иван Петров', 'ivan@test.com', 'customer', '+7 (423) 123-45-67')
  const elena = await createUser('Елена Соколова', 'elena@test.com', 'customer', '+7 (423) 765-43-21')
  const users = [ivan, elena]

  console.log('Creating 50 products...')
  const products: any[] = []

  for (let i = 0; i < 50; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)]
    const brandModels = models[brand]
    if (!brandModels) continue
    const model = brandModels[Math.floor(Math.random() * brandModels.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const partNamesList = partNames[category]
    const partName = partNamesList[Math.floor(Math.random() * partNamesList.length)]
    const condition = Math.random() > 0.4 ? 'used' : 'new'
    const year = 1995 + Math.floor(Math.random() * 30)

    products.push({
      name: `${partName} ${brand} ${model} (${year})`,
      description: `${categoryNames[category]}: ${partName} для ${brand} ${model} ${year} года. ${condition === 'used' ? 'Контрактная запчасть из Японии. Состояние отличное.' : 'Оригинальная новая запчасть. В наличии во Владивостоке.'}`,
      price: generatePrice(category, condition),
      currency: '₽',
      images: [
        `https://picsum.photos/seed/${i}-1/400/300`,
        `https://picsum.photos/seed/${i}-2/400/300`,
        `https://picsum.photos/seed/${i}-3/400/300`,
      ],
      category,
      brand,
      modelName: model,
      year,
      condition,
      inStock: Math.random() > 0.2,
    })
  }

  await prisma.product.createMany({ data: products })
  const createdProducts = await prisma.product.findMany()
  console.log(`Created ${createdProducts.length} products`)

  console.log('Creating favorites...')
  let favCount = 0
  for (const user of users) {
    const favProducts = pick(createdProducts, 4)
    for (const product of favProducts) {
      await prisma.favorite.create({
        data: { userId: user.id, productId: product.id },
      })
      favCount++
    }
  }
  console.log(`Created ${favCount} favorites`)

  console.log('Creating reviews...')
  let reviewCount = 0
  for (const user of users) {
    const reviewProducts = pick(createdProducts.filter(p => p.inStock), 3)
    for (const product of reviewProducts) {
      const rating = 3 + Math.floor(Math.random() * 3)
      const text = reviewTexts[Math.floor(Math.random() * reviewTexts.length)]
      await prisma.review.create({
        data: { userId: user.id, productId: product.id, rating, text },
      })
      reviewCount++
    }
  }
  console.log(`Created ${reviewCount} reviews`)

  console.log('\n✅ Seed complete!')
  console.log(`   Users:    ${users.length + 1} (admin + ${users.length} customers)`)
  console.log(`   Products: ${createdProducts.length}`)
  console.log(`   Favs:     ${favCount}`)
  console.log(`   Reviews:  ${reviewCount}`)
  console.log(`\n   Login: admin@test.com / password123 (admin)`)
  console.log(`          ivan@test.com / password123`)
  console.log(`          elena@test.com / password123`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
