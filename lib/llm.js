// OpenRouter 무료 모델 여러 개를 순서대로 시도한다.
// 무료 모델은 업스트림 제공사(Venice, Google AI Studio 등)가 자주 혼잡해서
// 429가 나면 다음 모델로 자동 폴백한다.
// openai/gpt-oss-20b:free는 내부 추론 채널 토큰(<|channel|>analysis<|message|>...)이
// 최종 응답에 그대로 새어나오는 결함이 있어 폴백 목록에서 제외했다.
const FREE_MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "google/gemma-4-31b-it:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "nvidia/nemotron-nano-9b-v2:free",
];

// 일부 무료 모델이 내부 추론/채널 토큰(<|channel|>, <|message|> 등)이나
// 메타 발언("We have truncated content...")을 최종 응답에 흘리는 경우가 있어 방어적으로 제거한다.
function sanitize(text) {
  return text
    .replace(/assistant\s*<\|channel\|>\s*\w*\s*<\|message\|>/gi, "")
    .replace(/<\|channel\|>\s*\w*\s*<\|message\|>/gi, "")
    .replace(/<\|[^|>]{1,30}\|>/g, "")
    .replace(/^assistant\s*/i, "")
    .replace(/We have truncated content[^.]*\.\s*/gi, "")
    .replace(/We need to produce[^.]*\.\s*/gi, "")
    .replace(/Should re-do\.?\s*/gi, "")
    .trim();
}

async function tryModel(model, prompt, apiKey) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(30000),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const code = data?.error?.code || res.status;
    const message = data?.error?.message || `HTTP ${res.status}`;
    const err = new Error(message);
    err.code = code;
    throw err;
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("모델 응답에서 텍스트를 찾을 수 없습니다.");
  }
  const clean = sanitize(text.trim());
  if (!clean) {
    throw new Error("모델 응답이 필터링 후 비어있습니다.");
  }
  return clean;
}

export async function callLLM(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const errors = [];
  for (const model of FREE_MODELS) {
    try {
      return await tryModel(model, prompt, apiKey);
    } catch (e) {
      errors.push(`${model}: ${e.message}`);
      continue;
    }
  }

  throw new Error(
    `모든 무료 모델이 현재 혼잡하거나 실패했습니다. 잠시 후 다시 시도해주세요.\n(${errors.join(" / ")})`
  );
}
