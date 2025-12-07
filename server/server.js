// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { text, numQuestions, difficulty, questionType } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing PDF text" });
    }

    const prompt = `
      Generate ${numQuestions} ${questionType === "mcq" ? "multiple-choice" : "essay"} 
      questions from the text below.
      Difficulty: ${difficulty}.
      ${
        questionType === "mcq"
          ? `Each MCQ should have 1 correct answer and 3 incorrect options. 
             Format strictly as JSON array of objects like: 
             [{ "question": "...", "options": ["...","...","...","..."], "correct_answer": "..." }]`
          : `Format strictly as JSON array of objects like: 
             [{ "question": "...", "sample_answer": "..." }]`
      }

      Text:
      ${text.slice(0, 3000)}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    });

   const raw = response.choices[0].message.content;

// Remove markdown fences like ```json ... ```
const cleaned = raw.replace(/```json|```/g, "").trim();

let parsed;
try {
  parsed = JSON.parse(cleaned);

  // ✅ Always enforce consistent shape
  if (Array.isArray(parsed)) {
    parsed = { questions: parsed };
  }
} catch (err) {
  console.error("❌ JSON parse error:", err, cleaned);
  return res.json({ raw, error: "Could not parse JSON" });
}

res.json({ quiz: parsed });

  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/grade-essay", async (req, res) => {
  const { question, studentAnswer, sampleAnswer } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a supportive examiner. Grade the student’s essay answer fairly from 1 to 5, 
where 5 is excellent and 1 means very poor effort. 
⚠️ Important: Never give 0 marks — always give at least 1 mark to encourage the student.
Also provide short, constructive, and encouraging feedback that highlights both 
strengths (if any) and how the student can improve.
Keep feedback friendly and motivational.
`,

        },
        {
          role: "user",
          content: `Question: ${question}\nStudent Answer: ${studentAnswer}\nSample/Ideal Answer: ${sampleAnswer || "Not provided"}`,
        },
      ],
      max_tokens: 200,
    });

    const response = completion.choices[0].message.content;
    res.json({ evaluation: response });
  } catch (err) {
    console.error("Error grading essay:", err);
    res.status(500).json({ error: "Failed to grade essay" });
  }
}); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
