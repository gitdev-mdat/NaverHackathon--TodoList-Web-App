export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

export type GenAIResponse = {
  ok: boolean;
  raw?: string;
  error?: string;
  status?: number;
};

export async function generateFromPromptClient(
  apiKey: string,
  prompt: string,
  opts?: { model?: string; temperature?: number; maxOutputTokens?: number }
): Promise<GenAIResponse> {
  if (!apiKey) return { ok: false, error: "No API key provided" };

  const model = opts?.model ?? DEFAULT_GEMINI_MODEL;
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const payload: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      ...(typeof opts?.temperature === "number"
        ? { temperature: opts.temperature }
        : {}),
      ...(typeof opts?.maxOutputTokens === "number"
        ? { maxOutputTokens: opts.maxOutputTokens }
        : {}),
    },
  };

  try {
    const resp = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();

    if (!resp.ok) {
      return {
        ok: false,
        error: `API error ${resp.status}: ${text}`,
        status: resp.status,
      };
    }

    // return raw body (we'll extract in caller)
    return { ok: true, raw: text };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}
