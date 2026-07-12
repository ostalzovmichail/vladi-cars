import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const dbUrl = new URL(process.env.DATABASE_URL!)
const pool = new pg.Pool({
  host: dbUrl.hostname,
  port: Number(dbUrl.port),
  database: dbUrl.pathname.slice(1),
  user: dbUrl.username,
  password: dbUrl.password,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const
const shippingAddress = 'г. Владивосток, ул. Русская, д. 15'

function pick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

async function main() {
  const existingOrders = await prisma.order.findMany()
  if (existingOrders.length > 0) {
    console.log('Clearing existing orders...')
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
  }

  const users = await prisma.user.findMany({ where: { role: 'customer' } })
  if (users.length === 0) {
    console.error('No customer users found. Run catalog seed first.')
    process.exit(1)
  }

  const products = await prisma.product.findMany({ where: { inStock: true } })
  if (products.length === 0) {
    console.error('No products found. Run catalog seed first.')
    process.exit(1)
  }

  console.log(`Found ${users.length} users and ${products.length} products`)

  let totalOrders = 0
  let totalItems = 0

  for (const user of users) {
    const orderCount = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < orderCount; i++) {
      const itemsCount = 1 + Math.floor(Math.random() * 3)
      const orderProducts = pick(products, itemsCount)
      const items = orderProducts.map(p => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: 1 + Math.floor(Math.random() * 2),
      }))
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      await prisma.order.create({
        data: {
          userId: user.id,
          status,
          total,
          items: { create: items },
        },
      })

      totalOrders++
      totalItems += items.length
    }
  }

  console.log(`\n✅ Orders seed complete!`)
  console.log(`   Orders: ${totalOrders}`)
  console.log(`   Items:  ${totalItems}`)
  console.log(`   Statuses: pending, confirmed, shipped, delivered, cancelled`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
