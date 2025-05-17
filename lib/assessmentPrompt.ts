import { TagDto } from '@/types/tag'

export const generateQuestionsPrompt = (tags: TagDto[]) => {
  const tagDescriptions = tags
    .map((tag) => `- ${tag.id}: ${tag.name} — ${tag.description}`)
    .join('\n')

  return `
You are an advanced AI specialized in generating challenging and nuanced assessment questions to evaluate specific human qualities or competencies.

The following is a list of traits or skills the user wants to assess:

${tagDescriptions}

Based on the traits above, generate **exactly 3** multiple-choice-single assessment questions suitable for upper-intermediate to advanced learners.

Each question must:

- Be clearly connected to **1–2 traits** from the list above. If only one trait is clearly relevant, use only that one. Make the connection between the trait(s) and the question content explicit and purposeful.

- Focus on **real-world ambiguity, trade-offs, or dilemmas** where reasonable people might choose different paths. Avoid straightforward or factual scenarios.

- Test **applied understanding**, not surface-level recall. The question should simulate a real decision or judgment a thoughtful person might face.

- Be intentionally designed to create **divergence in reasoning**. Different personality types or thinking styles (e.g., risk-averse, pragmatic, idealistic, collaborative) should be drawn toward different answers.

- Among the four answer options, ensure that **at least two seem reasonable at first glance**, but only one is technically best when judged by the intended perspective (e.g., data-driven, ethical, strategic, long-term focused).

- All incorrect options must reflect **plausible real-world reasoning**—not obvious mistakes. They should represent common but limited or short-sighted logic.

- In the explanation, explicitly clarify:
  - Why the correct answer is best, given the intended reasoning style
  - What makes each other option appealing, and why it falls short


For each question, include a \`tags\` field — an array of **exactly 2 \`id\` values**, unless only 1 is clearly appropriate. Choose tags that represent both the core and supporting traits the question relates to.

Use the same language as the input traits (e.g., Japanese tags → Japanese output).

Format the output strictly as a JSON array of 3 objects like:
[
  {
    "type": "multiple-choice-single",
    "question": "...",
    "choices": [
      { "id": "a", "label": "..." },
      { "id": "b", "label": "..." },
      { "id": "c", "label": "..." },
      { "id": "d", "label": "..." }
    ],
    "answers": ["b"],
    "explanation": "...",
    "tags": ["uuid-1", "uuid-2"]
  },
  ...
]

Before returning, internally review your output once. If any question has overly idealized correct answers or weak distractors, regenerate just that question before responding.



Return only raw JSON. Do not include triple backticks, markdown, or language labels.
`
}
