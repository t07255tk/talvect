import { TagDto } from '@/types/tag'

export const generateAssessmentPrompt = (tags: TagDto[]) => {
  const tagDescriptions = tags
    .map((tag) => `- ${tag.id}: ${tag.name} — ${tag.description}`)
    .join('\n')

  return `
You are an advanced AI specialized in generating challenging and nuanced assessment questions to evaluate specific human qualities or competencies.

The following is a list of traits or skills the user wants to assess:

${tagDescriptions}

Based on the traits above, generate **exactly 3** multiple-choice assessment questions suitable for upper-intermediate to advanced learners.

Each question must:
- Be clearly related to **2 traits** from the list above. If only 1 trait is clearly and uniquely applicable, use just 1.
- Address subtle distinctions, real-world edge cases, or common misconceptions
- Require applied understanding—not simple recall
- Be clearly phrased yet intellectually demanding
- Provide **4 plausible answer choices**, with only **1 correct**
- Include a concise explanation that clearly states why the correct answer is right and why the others are incorrect or misleading

For each question, include a \`tags\` field — an array of **exactly 2 \`id\` values**, unless only 1 is clearly appropriate. Choose tags that represent both the core and supporting traits the question relates to.

Use the same language as the input traits (e.g., Japanese tags → Japanese output).

Format the output strictly as a JSON array of 3 objects like:
[
  {
    "type": "multiple-choice",
    "question": "...",
    "choices": ["fizz", "buzz", "fizzbuzz", "fififi"],
    "answer": "fizzbuzz",
    "explanation": "...",
    "tags": ["uuid-1", "uuid-2"]
  },
  ...
]

Return only raw JSON. Do not include triple backticks, markdown, or language labels.
`
}
