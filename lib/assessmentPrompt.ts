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
- Be designed to reveal behavioral tendencies, **not correctness or idealism**.
- Avoid questions that imply moral superiority or logical correctness in any particular answer.
- Ensure all choices feel equally justifiable and grounded in realistic decision-making under constraints.
- Reflect situations where **different personalities or workstyles might reasonably disagree**.
- The **question itself must not imply an ideal behavior**.
  - Avoid phrasing like "What is the best way to...", "How should you...", or "What is the most effective..."
  - Instead, use framing such as:
    - "Which of the following most closely resembles your past approach when faced with..."
    - "A colleague is facing the following dilemma. Which advice would you be most likely to give?"
    - "You recall a time when X happened. Which of the following would have been closest to your action?"
  - The **goal is to simulate real-life ambiguity and trade-offs**, not to present hypotheticals that favor high-minded answers.

Answer choices:

- Each question must provide 4 options labeled with uppercase letters: "A", "B", "C", "D".
- Each option should be plausible and grounded in real-world logic. No obvious throwaway answers.
- Each option must be assigned a "tagWeights" field, a dictionary mapping tag IDs to numeric values between 0.0 and 1.0, representing how much the option expresses that trait.

TagWeight design guidelines:

- Each tagWeight must reflect **behavioral expression**, not moral or logical superiority.
- TagWeights must show variation in **intensity (strong / moderate / weak)** to enable better scoring contrast.
- **Required structure for tagWeights across choices (per question):**
  - One choice must include at least one tag with weight **≥ 0.9** (strong expression)
  - One choice must include tag(s) with weights between **0.5–0.75** (moderate expression)
  - One choice must include tag(s) with weights **≤ 0.4** (weak or partial expression)
  - The fourth choice can have any valid distribution, but should not duplicate another exactly
- Do NOT assign fractional weights (e.g., 0.1, 0.2) unless the expression is truly subtle
- Avoid uniform distributions (e.g., four choices all around 0.6) — intensity contrast is essential
- Each tag must appear at most once per question (no duplication across choices)
- Do not include a tag unless its behavioral trait is clearly, observably expressed
- Tag assignments must be semantically justified, not based on tag usage quotas

Tag distribution logic:

- If 3 tags: use each tag once (1 per question).
- If 4 tags: use all tags; assign 2 tags to two questions, 1 tag to one.
- If 5 tags: use all tags; assign 2 tags per question with one tag reused.
- If 6 tags: assign 2 tags to each question, use all tags once.

Bias reduction requirements:

- DO NOT frame any answer as obviously "right", "better", or "more responsible".
- Each option must reflect a **realistic, justifiable, and context-sensitive choice** someone might make.
- Include trade-offs that **make each option feel situationally valid** — not morally or logically dominant.
- Avoid emotionally loaded language, and use **neutral framing**.
- The **question itself must also be free from normative pressure or prescriptive tone**.

Failure cases to avoid:

- Do NOT include choices where the only difference is tone or verbosity.
- Avoid binary opposites like “trust the team” vs “do it all yourself” unless both are richly contextualized.
- Avoid strawman options that sound reckless, lazy, or overly emotional.
- Avoid phrasing that pressures the user to “do the right thing.”
- Do NOT design the question around competence or expertise levels (e.g., “a junior vs senior person”), as this creates bias.
- Do NOT let tagWeights be determined by ideal behavior. The weights should reflect **expression**, not **evaluation**.

Output format:

- Output must be a **raw JSON array** (no markdown, no backticks, no comments, no extra text).
- Each item must follow this structure:
[
  {
    "type": "MULTIPLE_CHOICE_SINGLE",
    "question": "...",
    "choices": [
      {
        "choiceId": "A",
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
