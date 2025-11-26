import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Adding new enum values...\n');

  try {
    // Step 1: Add new PropertyType values
    console.log('Adding PropertyType values...');
    const propertyTypes = [
      'VILLA',
      'TOWNHOUSE',
      'DUPLEX',
      'PENTHOUSE',
      'STUDIO',
      'LOFT',
      'OFFICE',
      'RETAIL',
      'WAREHOUSE',
      'BUILDING',
    ];

    for (const type of propertyTypes) {
      await prisma.$executeRawUnsafe(
        `ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS '${type}'`,
      );
    }
    console.log('✅ PropertyType values added\n');

    // Step 2: Add RENT to ListingType
    console.log('Adding RENT to ListingType...');
    await prisma.$executeRawUnsafe(
      `ALTER TYPE "ListingType" ADD VALUE IF NOT EXISTS 'RENT'`,
    );
    console.log('✅ RENT added to ListingType\n');

    // Disconnect to commit the transaction
    await prisma.$disconnect();

    // Reconnect for data migration
    const pool2 = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter2 = new PrismaPg(pool2);
    const prisma2 = new PrismaClient({ adapter: adapter2 });

    // Step 3: Migrate data from LONG_TERM to RENT
    console.log('Migrating LONG_TERM to RENT...');
    const result = await prisma2.$executeRaw`
      UPDATE properties 
      SET listing_type = 'RENT' 
      WHERE listing_type = 'LONG_TERM'
    `;
    console.log(`✅ Migrated ${result} properties from LONG_TERM to RENT\n`);

    await prisma2.$disconnect();

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
