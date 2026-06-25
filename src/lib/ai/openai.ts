import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export const AI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

/** Create an embedding vector for RAG ingestion / retrieval. */
export async function embed(text: string): Promise<number[]> {
  const res = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, " "),
  });
  return res.data[0].embedding;
}
