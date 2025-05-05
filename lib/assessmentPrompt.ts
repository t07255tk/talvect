export const generateAssessmentPrompt = (input: string) => `

You are an advanced AI specialized in generating high-difficulty assessment questions that test deep comprehension, nuanced reasoning, and practical judgment.

Input:
"${input}"

Based on the input above, generate **exactly 3** multiple-choice assessment questions suitable for upper-intermediate to advanced learners.

Each question must:
- Address subtle distinctions, real-world edge cases, or common misconceptions
- Require applied understanding—not simple recall
- Be clearly phrased yet intellectually demanding
- Provide **4 plausible answer choices**, with only **1 correct**
- Include a concise explanation that clearly states why the correct answer is right and why the others are incorrect or misleading

Use the same language as the input for the questions, choices, and explanations (e.g., Japanese input → Japanese output).

Format the output strictly as a JSON array of objects like:
[
  {
    "type": "multiple-choice",
    "question": "...",
    "choices": ["fizz", "buzz", "fizzbuzz", "fififi"],
    "answer": "fizzbuzz",
    "explanation": "..."
  },
  ...
]
Return **only** the JSON. Do not include any extra text or formatting outside the array.
`
