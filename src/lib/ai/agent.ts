import type OpenAI from "openai";
import { getOpenAI, AI_MODEL } from "./openai";
import { AI_TOOLS, runTool } from "./tools";

export interface AgentResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  toolCalls: string[];
}

/**
 * Runs a single agent turn with automatic function-calling. The model may call
 * the deterministic health tools; we execute them and let it finalise an answer.
 */
export async function runAgent(
  systemPrompt: string,
  userPrompt: string,
  opts: { useTools?: boolean; maxToolRounds?: number } = {},
): Promise<AgentResult> {
  const client = getOpenAI();
  const { useTools = true, maxToolRounds = 4 } = opts;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let tokensIn = 0;
  let tokensOut = 0;
  const toolCalls: string[] = [];

  for (let round = 0; round < maxToolRounds; round++) {
    const res = await client.chat.completions.create({
      model: AI_MODEL,
      messages,
      temperature: 0.4,
      tools: useTools ? AI_TOOLS : undefined,
    });

    tokensIn += res.usage?.prompt_tokens ?? 0;
    tokensOut += res.usage?.completion_tokens ?? 0;

    const msg = res.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls?.length) {
      return { text: msg.content ?? "", tokensIn, tokensOut, toolCalls };
    }

    for (const call of msg.tool_calls) {
      toolCalls.push(call.function.name);
      let output: unknown;
      try {
        output = runTool(call.function.name, JSON.parse(call.function.arguments || "{}"));
      } catch (err) {
        output = { error: (err as Error).message };
      }
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(output),
      });
    }
  }

  // Tool rounds exhausted — make a final call without tools.
  const final = await client.chat.completions.create({
    model: AI_MODEL,
    messages,
    temperature: 0.4,
  });
  tokensIn += final.usage?.prompt_tokens ?? 0;
  tokensOut += final.usage?.completion_tokens ?? 0;
  return { text: final.choices[0].message.content ?? "", tokensIn, tokensOut, toolCalls };
}
