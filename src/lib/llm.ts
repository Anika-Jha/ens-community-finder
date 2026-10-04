const TIMEOUT_MS = 15_000;

export async function rankAndExplain(query: string, candidates: {name:string; bio:string; skills:string; availability:string}[]) {
  if (candidates.length === 0) return [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const system = `You match a community question to candidate profiles.
Only recommend candidate names exactly as supplied in the candidate data.
Never invent people.
Return JSON: {"matches":[{"name":"exact candidate name","reason":"short evidence-based reason"}]}.
If none fit, return {"matches":[]}.`;

  // Profile text is DATA in a separate user message, never system instructions.
  const dataMessage = JSON.stringify({query, candidates});

  try {
    const response = await fetch(`${(process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/,"")}/chat/completions`, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.LLM_API_KEY || ""}`},
      signal:controller.signal,
      body:JSON.stringify({
        model:process.env.LLM_MODEL || "openai/gpt-oss-20b",
        messages:[
          {role:"system",content:system},
          {role:"user",content:dataMessage}
        ],
        temperature:0
      })
    });
    if (!response.ok) throw new Error(`Model provider returned ${response.status}.`);
    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || '{"matches":[]}';
    const cleaned = content.replace(/^```json\s*/i,"").replace(/\s*```$/,"");
    return JSON.parse(cleaned).matches || [];
  } finally { clearTimeout(timeout); }
}
