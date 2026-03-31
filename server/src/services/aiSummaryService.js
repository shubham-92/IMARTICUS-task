import OpenAI from "openai";

const createClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const isGroqKey = process.env.OPENAI_API_KEY.startsWith("gsk_");

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: isGroqKey ? "https://api.groq.com/openai/v1" : undefined
  });
};

const fallbackSummary = (text) => {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "No readable document text was available to summarise.";
  }

  const sentences = normalized.split(/(?<=[.!?])\s+/).slice(0, 3);
  return `## Quick Summary\n\n- ${sentences.join("\n- ")}`;
};

export const summariseDocumentText = async (text) => {
  const client = createClient();
  if (!client) {
    return fallbackSummary(text);
  }

  const isGroqKey = process.env.OPENAI_API_KEY.startsWith("gsk_");
  const model = isGroqKey ? "llama-3.1-8b-instant" : "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You summarise LMS documents for learners. Return clean markdown with a short title, 3-6 bullet points, and a brief key takeaway. Keep it concise, clear, and study-friendly."
      },
      {
        role: "user",
        content: `Summarise this course document for a learner:\n\n${text}`
      }
    ]
  });

  return response.choices?.[0]?.message?.content?.trim() || fallbackSummary(text);
};
