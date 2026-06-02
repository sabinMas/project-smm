import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default user
  const user = await prisma.user.upsert({
    where: { email: 'masonsabin@gmail.com' },
    update: {},
    create: {
      email: 'masonsabin@gmail.com',
      name: 'Mason Sabin',
    },
  });

  console.log(`✅ User: ${user.email} (${user.id})`);

  // Seed default post types
  const businessForward = await prisma.postType.upsert({
    where: { id: 'default-business' },
    update: {},
    create: {
      id: 'default-business',
      userId: user.id,
      name: 'Business Forward',
      isDefault: true,
      targetPlatforms: ['linkedin', 'x'],
      toneDescriptor: 'Professional, thought-leadership, data-driven',
      formattingPreferencesJson: {
        useEmojis: false,
        hashtagStyle: 'minimal',
        linkPlacement: 'end',
        mentionStyle: 'formal',
      },
    },
  });

  const personal = await prisma.postType.upsert({
    where: { id: 'default-personal' },
    update: {},
    create: {
      id: 'default-personal',
      userId: user.id,
      name: 'Personal',
      isDefault: true,
      targetPlatforms: ['x', 'instagram', 'bluesky', 'facebook', 'tiktok'],
      toneDescriptor: 'Casual, authentic, conversational',
      formattingPreferencesJson: {
        useEmojis: true,
        hashtagStyle: 'moderate',
        linkPlacement: 'inline',
        mentionStyle: 'casual',
      },
    },
  });

  console.log(`✅ Post type: ${businessForward.name}`);
  console.log(`✅ Post type: ${personal.name}`);
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
