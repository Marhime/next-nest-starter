import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Migrating LONG_TERM to RENT...');

  const result = await prisma.$executeRaw`
    UPDATE properties 
    SET listing_type = 'RENT' 
    WHERE listing_type = 'LONG_TERM'
  `;

  console.log(`✅ Migrated ${result} properties from LONG_TERM to RENT`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
