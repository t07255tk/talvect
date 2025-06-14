import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // await prisma.tag.deleteMany()
  const presetTags = [
    {
      name: 'Logical Thinking',
      description:
        'Ability to analyze situations logically and make reasoned judgments.',
      isPreset: true,
    },
    {
      name: 'Creativity',
      description: 'Capacity to generate original ideas and approaches.',
      isPreset: true,
    },
    {
      name: 'Communication',
      description: 'Effectiveness in conveying and receiving messages clearly.',
      isPreset: true,
    },
    {
      name: 'Problem Solving',
      description:
        'Skill in identifying solutions to complex or unexpected issues.',
      isPreset: true,
    },
    {
      name: 'Attention to Detail',
      description:
        'Carefulness and precision in completing tasks and reviewing work.',
      isPreset: true,
    },
    {
      name: 'Adaptability',
      description:
        'Ability to adjust effectively to new conditions and environments.',
      isPreset: true,
    },
    {
      name: 'Critical Thinking',
      description:
        'Ability to evaluate information and arguments objectively to make reasoned conclusions.',
      isPreset: true,
    },
    {
      name: 'Teamwork',
      description:
        'Capacity to collaborate effectively with others to achieve shared goals.',
      isPreset: true,
    },
    {
      name: 'Leadership',
      description:
        'Skill in guiding and motivating a group to achieve common objectives.',
      isPreset: true,
    },
    {
      name: 'Resilience',
      description:
        'Ability to recover quickly from difficulties and persist through challenges.',
      isPreset: true,
    },
    {
      name: 'Empathy',
      description:
        'Understanding and sharing the feelings of others to build strong relationships.',
      isPreset: true,
    },
    {
      name: 'Curiosity',
      description: 'Desire to learn and explore new ideas and experiences.',
      isPreset: true,
    },
    {
      name: 'Time Management',
      description:
        'Effectiveness in organizing and prioritizing tasks to use time efficiently.',
      isPreset: true,
    },
    {
      name: 'Decision Making',
      description:
        'Ability to choose the best course of action among alternatives.',
      isPreset: true,
    },
    {
      name: 'Initiative',
      description:
        'Willingness to take charge and act proactively without being told.',
      isPreset: true,
    },
  ]

  for (const tag of presetTags) {
    const exists = await prisma.tag.findFirst({
      where: {
        name: tag.name,
        createdBy: null,
      },
    })

    if (!exists) {
      await prisma.tag.create({
        data: {
          name: tag.name,
          description: tag.description,
          isPreset: true,
          createdBy: null,
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
