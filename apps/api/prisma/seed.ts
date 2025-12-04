import {
  PrismaClient,
  PropertyType,
  ListingType,
} from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker/locale/fr';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer la base (optionnel)
  await prisma.favorite.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.property.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Créer des utilisateurs
  console.log('👥 Création des utilisateurs...');
  const users = await Promise.all(
    Array.from({ length: 50 }).map(async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return prisma.user.create({
        data: {
          id: faker.string.uuid(),
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          emailVerified: faker.datatype.boolean(0.8),
          phone: faker.helpers.maybe(() => faker.phone.number(), {
            probability: 0.7,
          }),
          phoneVerified: faker.datatype.boolean(0.5),
          image: faker.helpers.maybe(() => faker.image.avatar(), {
            probability: 0.6,
          }),
          preferredLanguage: faker.helpers.arrayElement(['es', 'en', 'fr']),
          role: faker.helpers.weightedArrayElement([
            { value: 'REGULAR', weight: 5 },
            { value: 'OWNER', weight: 3 },
            { value: 'AGENCY', weight: 1 },
            { value: 'ADMIN', weight: 0.5 },
          ]),
        },
      });
    }),
  );

  console.log(`✅ ${users.length} utilisateurs créés`);

  // Créer 1000 propriétés
  console.log('🏠 Création des propriétés...');

  // SeLoger-style: Focus on residential real estate
  const propertyTypes: PropertyType[] = [
    'APARTMENT', // Most common
    'APARTMENT',
    'APARTMENT',
    'HOUSE',
    'HOUSE',
    'VILLA',
    'TOWNHOUSE',
    'STUDIO',
    'LOFT',
    'DUPLEX',
    'PENTHOUSE',
    'LAND', // Terrains
  ];

  // SeLoger-style: Only SALE and RENT (no SHORT_TERM/Airbnb)
  const listingTypes: ListingType[] = [
    'SALE',
    'SALE', // More sale properties
    'RENT',
    'RENT', // Balanced with rentals
  ];
  // Mexican cities for Puerto Escondido area
  const cities = [
    'Puerto Escondido',
    'Oaxaca de Juárez',
    'Huatulco',
    'Zipolite',
    'Mazunte',
    'San Agustinillo',
    'Carrizalillo',
    'La Punta',
    'Zicatela',
    'Bacocho',
  ];
  const states = [
    'Oaxaca',
    'Oaxaca',
    'Oaxaca',
    'Oaxaca',
    'Oaxaca',
    'Oaxaca',
    'Oaxaca',
    'Oaxaca',
    'Oaxaca',
  ];

  for (let i = 0; i < 1000; i++) {
    const propertyType = faker.helpers.arrayElement(propertyTypes);
    const listingType = faker.helpers.arrayElement(listingTypes);
    const city = faker.helpers.arrayElement(cities);
    const owner = faker.helpers.arrayElement(users);

    const property = await prisma.property.create({
      data: {
        userId: owner.id,
        propertyType,
        listingType,
        title: generatePropertyTitle(propertyType, city),
        description: faker.lorem.paragraphs(3),
        // Mexican pesos pricing (MXN)
        monthlyPrice:
          listingType === 'RENT'
            ? faker.number.float({ min: 3000, max: 25000, fractionDigits: 2 })
            : null,
        nightlyPrice: null, // Not used in SeLoger-style
        salePrice:
          listingType === 'SALE'
            ? faker.number.float({
                min: 800000,
                max: 15000000,
                fractionDigits: 2,
              })
            : null,
        currency: 'MXN',
        address: faker.location.streetAddress(),
        city,
        state: faker.helpers.arrayElement(states),
        postalCode: faker.location.zipCode('#####'),
        country: 'MX',
        // Oaxaca Coast coordinates (latitude: 15-16.5, longitude: -97 to -96)
        latitude: Number(
          faker.location.latitude({ min: 15, max: 16.5 }).toFixed(6),
        ),
        longitude: Number(
          faker.location
            .longitude({
              min: -97,
              max: -96,
            })
            .toFixed(6),
        ),
        area:
          propertyType !== 'LAND'
            ? faker.number.float({ min: 30, max: 500, fractionDigits: 2 })
            : faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
        bedrooms: ['LAND', 'OFFICE', 'RETAIL', 'WAREHOUSE'].includes(
          propertyType,
        )
          ? null
          : faker.number.int({ min: 1, max: 6 }),
        bathrooms: ['LAND', 'WAREHOUSE'].includes(propertyType)
          ? null
          : faker.number.int({ min: 1, max: 4 }),
        capacity: null, // Not used for SeLoger-style properties
        floor: ['APARTMENT', 'STUDIO', 'LOFT', 'OFFICE'].includes(propertyType)
          ? faker.number.int({ min: 1, max: 20 })
          : null,
        amenities: generateAmenities(propertyType),
        status: faker.helpers.weightedArrayElement([
          { value: 'ACTIVE', weight: 7 },
          { value: 'DRAFT', weight: 1 },
          { value: 'RENTED', weight: 1 },
          { value: 'SOLD', weight: 0.5 },
          { value: 'INACTIVE', weight: 0.5 },
        ]),
        availableFrom: faker.date.future(),
      },
    });

    // Ajouter des photos
    const photoCount = faker.number.int({ min: 3, max: 10 });
    for (let j = 0; j < photoCount; j++) {
      await prisma.photo.create({
        data: {
          propertyId: property.id,
          url: faker.image.urlLoremFlickr({
            category: 'house',
            width: 1200,
            height: 800,
          }),
          thumbnailUrl: faker.image.urlLoremFlickr({
            category: 'house',
            width: 400,
            height: 300,
          }),
          order: j,
          isPrimary: j === 0,
        },
      });
    }

    // Ajouter des disponibilités pour les locations
    if (listingType !== 'SALE' && property.status === 'ACTIVE') {
      const availabilityCount = faker.number.int({ min: 2, max: 5 });
      for (let k = 0; k < availabilityCount; k++) {
        const startDate = faker.date.future({ years: 1 });
        const endDate = new Date(startDate);
        endDate.setDate(
          endDate.getDate() + faker.number.int({ min: 7, max: 90 }),
        );

        await prisma.availability.create({
          data: {
            propertyId: property.id,
            startDate,
            endDate,
            specialPrice: faker.helpers.maybe(
              () =>
                faker.number.float({ min: 400, max: 3000, fractionDigits: 2 }),
              { probability: 0.3 },
            ),
            status: faker.helpers.arrayElement([
              'AVAILABLE',
              'RESERVED',
              'BLOCKED',
            ]),
          },
        });
      }
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  ✓ ${i + 1} propriétés créées...`);
    }
  }

  console.log('✅ 1000 propriétés créées avec succès!');

  // Créer quelques réservations
  console.log('📅 Création des réservations...');
  const activeProperties = await prisma.property.findMany({
    where: {
      status: 'ACTIVE',
      listingType: { in: ['SHORT_TERM', 'RENT'] },
    },
    take: 200,
  });

  for (const property of activeProperties) {
    if (faker.datatype.boolean(0.3)) {
      const guest = faker.helpers.arrayElement(users);
      const startDate = faker.date.future({ years: 0.5 });
      const endDate = new Date(startDate);
      endDate.setDate(
        endDate.getDate() + faker.number.int({ min: 2, max: 30 }),
      );

      const nights = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const pricePerNight =
        property.nightlyPrice || property.monthlyPrice || 1000;
      const totalPrice = Number(pricePerNight) * nights;

      await prisma.reservation.create({
        data: {
          propertyId: property.id,
          userId: guest.id,
          startDate,
          endDate,
          totalPrice,
          status: faker.helpers.arrayElement([
            'PENDING',
            'CONFIRMED',
            'CANCELLED',
            'COMPLETED',
          ]),
          guests: faker.number.int({ min: 1, max: 6 }),
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), {
            probability: 0.3,
          }),
        },
      });
    }
  }

  console.log('✅ Réservations créées');

  // Créer des favoris
  console.log('❤️ Création des favoris...');
  const allProperties = await prisma.property.findMany({ take: 500 });

  for (const user of users) {
    const favoriteCount = faker.number.int({ min: 0, max: 10 });
    const selectedProperties = faker.helpers.arrayElements(
      allProperties,
      favoriteCount,
    );

    for (const property of selectedProperties) {
      await prisma.favorite
        .create({
          data: {
            userId: user.id,
            propertyId: property.id,
          },
        })
        .catch(() => {}); // Ignorer les duplicatas
    }
  }

  console.log('✅ Favoris créés');
  console.log('🎉 Seeding terminé avec succès!');
}

function generatePropertyTitle(type: string, city: string): string {
  const titles: Record<string, string[]> = {
    HOTEL: ['Hotel', 'Hotel Boutique', 'Gran Hotel'],
    HOSTEL: ['Hostel', 'Albergue', 'Hostal'],
    GUESTHOUSE: ['Casa de Huéspedes', 'Pensión', 'Posada'],
    HOUSE: ['Casa', 'Residencia', 'Villa'],
    APARTMENT: ['Departamento', 'Apartamento', 'Piso'],
    LAND: ['Terreno', 'Lote', 'Propiedad'],
    ROOM: ['Habitación', 'Cuarto', 'Recámara'],
  };

  const prefix = faker.helpers.arrayElement(titles[type] || ['Propiedad']);
  const adjective = faker.helpers.arrayElement([
    'Moderno',
    'Acogedor',
    'Espacioso',
    'Céntrico',
    'Luminoso',
  ]);

  return `${adjective} ${prefix} en ${city}`;
}

function generateAmenities(propertyType: string) {
  const allAmenities = {
    wifi: faker.datatype.boolean(0.9),
    parking: faker.datatype.boolean(0.7),
    pool: faker.datatype.boolean(0.3),
    gym: faker.datatype.boolean(0.4),
    airConditioning: faker.datatype.boolean(0.8),
    heating: faker.datatype.boolean(0.5),
    kitchen:
      !['HOTEL', 'HOSTEL', 'ROOM'].includes(propertyType) &&
      faker.datatype.boolean(0.9),
    washingMachine: faker.datatype.boolean(0.6),
    tv: faker.datatype.boolean(0.8),
    petFriendly: faker.datatype.boolean(0.4),
    securitySystem: faker.datatype.boolean(0.5),
  };

  return allAmenities;
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
