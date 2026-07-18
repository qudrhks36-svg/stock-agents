// 6명의 애널리스트 페르소나. 아바타는 Pollinations.ai로 고정 프롬프트+seed를 써서
// 매번 같은 이미지가 나오도록 만들었다 (무료, API 키 불필요). 16비트 픽셀아트 스프라이트 스타일.
// 각 페르소나는 idle(평상시)과 talk(분석 중 말하는 모습) 두 프레임을 갖고,
// 같은 seed에 프롬프트만 살짝 바꿔 같은 캐릭터처럼 보이도록 했다.
function pollinationsUrl(prompt, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt
  )}?width=320&height=480&nologo=true&seed=${seed}`;
}

export const PERSONAS = {
  technical: {
    id: "technical",
    name: "차트 분석가",
    role: "기술적 분석 담당",
    fallback: "📈",
    avatar: {
      idle: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, financial chart analyst holding a magnifying glass over a candlestick chart, confident stance, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        9
      ),
      talk: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, financial chart analyst holding a magnifying glass over a candlestick chart, mouth open speaking, pointing excitedly at a rising candlestick, confident stance, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        9
      ),
    },
  },
  news: {
    id: "news",
    name: "뉴스 분석가",
    role: "호재/악재 뉴스 담당",
    fallback: "🗞️",
    avatar: {
      idle: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, financial news analyst holding a newspaper with headline, alert expression, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        4
      ),
      talk: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, financial news analyst holding a newspaper with headline, mouth open reporting urgently, one hand raised pointing at the headline, alert expression, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        4
      ),
    },
  },
  sentiment: {
    id: "sentiment",
    name: "여론 분석가",
    role: "커뮤니티 여론 담당",
    fallback: "💬",
    avatar: {
      idle: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, social sentiment analyst surrounded by small speech bubble icons, thoughtful expression, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        9
      ),
      talk: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, social sentiment analyst surrounded by small glowing speech bubble icons, mouth open talking, both hands gesturing, thoughtful expression, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        9
      ),
    },
  },
  bull: {
    id: "bull",
    name: "매수 논자",
    role: "매수 근거 주장",
    fallback: "🐂",
    avatar: {
      idle: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, optimistic bullish stock trader pointing upward with a small green bull icon nearby, excited expression, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        4
      ),
      talk: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, optimistic bullish stock trader with a small green bull icon nearby, mouth wide open cheering enthusiastically, both arms raised triumphantly, excited expression, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        4
      ),
    },
  },
  bear: {
    id: "bear",
    name: "매도 논자",
    role: "매도 근거 주장",
    fallback: "🐻",
    avatar: {
      idle: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, cautious bearish stock trader pointing downward with a small red bear icon nearby, serious expression, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        4
      ),
      talk: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, cautious bearish stock trader with a small red bear icon nearby, mouth open warning sternly, shaking head while pointing downward firmly, serious expression, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        4
      ),
    },
  },
  chief: {
    id: "chief",
    name: "총괄 팀장",
    role: "종합 판단 및 최종 리포트",
    fallback: "🧑‍💼",
    avatar: {
      idle: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, senior investment team chief wearing glasses and a suit, calm authoritative expression, holding a clipboard report, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        5
      ),
      talk: pollinationsUrl(
        "16-bit pixel art rpg character sprite, full body standing pose, senior investment team chief wearing glasses and a suit, mouth open delivering a verdict calmly, nodding while pointing at a clipboard report, authoritative expression, normal humanoid proportions, retro game style, limited color palette, front facing, flat solid color background, no text, no watermark, crisp pixels",
        5
      ),
    },
  },
};
