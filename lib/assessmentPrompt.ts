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

- Be clearly aligned with 1 or more tags from the list above. Select tags that reflect both the core and supporting traits.
- Focus on real-world ambiguity, trade-offs, or dilemmas where reasonable people may choose differently.
- Test applied understanding, not factual knowledge.
- Be designed to create divergent reasoning—different thinking styles (e.g., risk-averse, ethical, strategic) should gravitate toward different choices.

Answer choices:

- Each question must provide 4 options labeled with uppercase letters: "A", "B", "C", "D".
- Each option should be plausible and grounded in real-world logic. No obvious throwaway answers.
- Each option must be assigned a "tagWeights" field, a dictionary mapping tag IDs to numeric values between 0.0 and 1.0, representing how much the option expresses that trait.
- All tag weights must reflect meaningful expression of the tag's behavioral trait.
- Each question must include:
  - At least one choice with tag weight ≥ 0.9 (strong alignment).
  - At least one choice with 2 or more tags (hybrid reasoning).
  - You may assign 3 or more tags to a choice **only if** all included traits are clearly and meaningfully expressed.
  - **Do not include extra tags just to increase coverage.**

Tag distribution logic:

- If 3 tags: use each tag once (1 per question).
- If 4 tags: use all tags; assign 2 tags to two questions, 1 tag to one.
- If 5 tags: use all tags; assign 2 tags per question with one tag reused.
- If 6 tags: assign 2 tags to each question, use all tags once.

Additional constraints:

- Do not use any tag more than once per question.
- Do not assign the same tagWeights to multiple choices in the same question.
- Ensure tagWeights vary across choices to maximize behavioral contrast.
- Do not use fractional weights like 0.1 or 0.2 unless the trait expression is truly minor.
- Ensure each choice reflects a **distinct decision-making style or reasoning pattern**. Avoid options that differ only in wording.

Output format:

- Output must be a **raw JSON array** (no markdown, no backticks, no comments, no extra text).
- Each item must follow this structure:
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

Important:

- DO NOT include any markdown formatting, code fences (e.g., \`\`\`json), comments, or explanatory text.
- Output must be valid JSON only.
- Each choice's tagWeights must be logically aligned, meaningfully distributed, and varied in strength.
- Each tagWeights assignment must be **factually and semantically justified**.
  - Only assign a tag if the behavior in the choice **clearly expresses that trait** in a realistic, observable way.
  - Do NOT assign a tag merely to balance or reuse tags. **Tag mappings must reflect behavioral truth, not mathematical distribution.**
- The purpose is not to test correctness, but to reveal decision tendencies and thinking styles through realistic scenarios.
`
}
