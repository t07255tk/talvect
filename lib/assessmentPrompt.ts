import { TagDto } from '@/types/tag'

export const generateQuestionsPrompt = (tags: TagDto[]) => {
  const tagDescriptions = tags
    .map((tag) => `- ${tag.id}: ${tag.name} — ${tag.description}`)
    .join('\n')

  return `
You are an advanced AI specialized in generating assessment questions to evaluate specific human tendencies, styles, and competencies through nuanced decision-making.

The following is a list of evaluation tags (traits or skills):

${tagDescriptions}

Your task is to generate exactly 3 multiple-choice-single questions designed to reveal reasoning patterns and judgment tendencies.

Each question must:

- Be clearly aligned with 1 or 2 tags from the list above. Select tags that reflect both the core and supporting traits.
- Focus on real-world ambiguity, trade-offs, or dilemmas where reasonable people may choose differently.
- Test applied understanding, not factual knowledge.
- Be designed to create divergent reasoning—different thinking styles (e.g., risk-averse, ethical, strategic) should gravitate toward different choices.

Answer choices:

- Each question must provide 4 options labeled with uppercase letters: "A", "B", "C", "D".
- Each option should be plausible and grounded in real-world logic. No obvious throwaway answers.
- Each option must be assigned a \`tagWeights\` field, a dictionary mapping tag IDs to numeric values between 0.0 and 1.0, representing how much the option expresses that trait.
- It is not required to assign weights to all tags; only include tags relevant to the option.
- Tag weights do not need to sum to 1.0. They represent absolute strength of each trait independently.

Tag distribution logic:

- If 3 tags: use each tag once (1 per question).
- If 4 tags: use all tags; assign 2 tags to two questions, 1 tag to one.
- If 5 tags: use all tags; assign 2 tags per question with one tag reused.
- If 6 tags: assign 2 tags to each question, use all tags once.

Output a JSON array of exactly 3 question objects in the following format:

[
  {
    "type": "multiple-choice-single",
    "question": "...",
    "choices": [
      {
        "id": "A",
        "label": "...",
        "tagWeights": {
          "uuid-1": 0.6,
          "uuid-2": 0.4
        }
      },
      ...
    ]
  },
  ...
]

Do not include answers or explanations.

This is not a right-or-wrong test. It assesses decision tendencies.

Before responding, verify:

- All questions clearly align with the tag goals.
- tagWeights are realistic and meaningful.
- Output raw JSON only, no markdown, backticks, or comments.
`
}
