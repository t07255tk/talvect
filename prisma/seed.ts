import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // await prisma.tag.deleteMany()
  const presetTags = [
    {
      name: 'Logical Thinking',
      description:
        'Ability to analyze situations logically and make reasoned judgments.',
      is_preset: true,
    },
    {
      name: 'Creativity',
      description: 'Capacity to generate original ideas and approaches.',
      is_preset: true,
    },
    {
      name: 'Communication',
      description: 'Effectiveness in conveying and receiving messages clearly.',
      is_preset: true,
    },
    {
      name: 'Problem Solving',
      description:
        'Skill in identifying solutions to complex or unexpected issues.',
      is_preset: true,
    },
    {
      name: 'Attention to Detail',
      description:
        'Carefulness and precision in completing tasks and reviewing work.',
      is_preset: true,
    },
    {
      name: 'Adaptability',
      description:
        'Ability to adjust effectively to new conditions and environments.',
      is_preset: true,
    },
    {
      name: 'Critical Thinking',
      description:
        'Ability to evaluate information and arguments objectively to make reasoned conclusions.',
      is_preset: true,
    },
    {
      name: 'Teamwork',
      description:
        'Capacity to collaborate effectively with others to achieve shared goals.',
      is_preset: true,
    },
    {
      name: 'Leadership',
      description:
        'Skill in guiding and motivating a group to achieve common objectives.',
      is_preset: true,
    },
    {
      name: 'Resilience',
      description:
        'Ability to recover quickly from difficulties and persist through challenges.',
      is_preset: true,
    },
    {
      name: 'Empathy',
      description:
        'Understanding and sharing the feelings of others to build strong relationships.',
      is_preset: true,
    },
    {
      name: 'Curiosity',
      description: 'Desire to learn and explore new ideas and experiences.',
      is_preset: true,
    },
    {
      name: 'Time Management',
      description:
        'Effectiveness in organizing and prioritizing tasks to use time efficiently.',
      is_preset: true,
    },
    {
      name: 'Decision Making',
      description:
        'Ability to choose the best course of action among alternatives.',
      is_preset: true,
    },
    {
      name: 'Initiative',
      description:
        'Willingness to take charge and act proactively without being told.',
      is_preset: true,
    },
  ]

  for (const tag of presetTags) {
    const exists = await prisma.tag.findFirst({
      where: {
        name: tag.name,
        created_by: null,
      },
    })

    if (!exists) {
      await prisma.tag.create({
        data: {
          name: tag.name,
          description: tag.description,
          is_preset: true,
          created_by: null,
        },
      })
      console.log(`✅ Created preset tag: ${tag.name}`)
    } else {
      console.log(`⚠️ Already exists: ${tag.name}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
