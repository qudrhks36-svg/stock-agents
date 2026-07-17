// 6명의 애널리스트 페르소나. 아바타는 Pollinations.ai로 고정 프롬프트+seed를 써서
// 매번 같은 이미지가 나오도록 만들었다 (무료, API 키 불필요). 16비트 픽셀아트 스프라이트 스타일.
export const PERSONAS = {
  technical: {
    id: "technical",
    name: "차트 분석가",
    role: "기술적 분석 담당",
    fallback: "📈",
    avatar:
      "https://image.pollinations.ai/prompt/16-bit%20pixel%20art%20rpg%20character%20sprite%2C%20financial%20chart%20analyst%20holding%20a%20magnifying%20glass%20over%20a%20candlestick%20chart%2C%20confident%20pose%2C%20retro%20game%20style%2C%20limited%20color%20palette%2C%20chibi%20proportions%2C%20front%20facing%20portrait%2C%20flat%20solid%20color%20background%2C%20no%20text%2C%20no%20watermark%2C%20crisp%20pixels?width=256&height=256&nologo=true&seed=9",
  },
  news: {
    id: "news",
    name: "뉴스 분석가",
    role: "호재/악재 뉴스 담당",
    fallback: "🗞️",
    avatar:
      "https://image.pollinations.ai/prompt/16-bit%20pixel%20art%20rpg%20character%20sprite%2C%20financial%20news%20analyst%20holding%20a%20newspaper%20with%20headline%2C%20alert%20expression%2C%20retro%20game%20style%2C%20limited%20color%20palette%2C%20chibi%20proportions%2C%20front%20facing%20portrait%2C%20flat%20solid%20color%20background%2C%20no%20text%2C%20no%20watermark%2C%20crisp%20pixels?width=256&height=256&nologo=true&seed=4",
  },
  sentiment: {
    id: "sentiment",
    name: "여론 분석가",
    role: "커뮤니티 여론 담당",
    fallback: "💬",
    avatar:
      "https://image.pollinations.ai/prompt/16-bit%20pixel%20art%20rpg%20character%20sprite%2C%20social%20sentiment%20analyst%20surrounded%20by%20small%20speech%20bubble%20icons%2C%20thoughtful%20expression%2C%20retro%20game%20style%2C%20limited%20color%20palette%2C%20chibi%20proportions%2C%20front%20facing%20portrait%2C%20flat%20solid%20color%20background%2C%20no%20text%2C%20no%20watermark%2C%20crisp%20pixels?width=256&height=256&nologo=true&seed=9",
  },
  bull: {
    id: "bull",
    name: "매수 논자",
    role: "매수 근거 주장",
    fallback: "🐂",
    avatar:
      "https://image.pollinations.ai/prompt/16-bit%20pixel%20art%20rpg%20character%20sprite%2C%20optimistic%20bullish%20stock%20trader%20pointing%20upward%20with%20a%20small%20green%20bull%20icon%20nearby%2C%20excited%20expression%2C%20retro%20game%20style%2C%20limited%20color%20palette%2C%20chibi%20proportions%2C%20front%20facing%20portrait%2C%20flat%20solid%20color%20background%2C%20no%20text%2C%20no%20watermark%2C%20crisp%20pixels?width=256&height=256&nologo=true&seed=4",
  },
  bear: {
    id: "bear",
    name: "매도 논자",
    role: "매도 근거 주장",
    fallback: "🐻",
    avatar:
      "https://image.pollinations.ai/prompt/16-bit%20pixel%20art%20rpg%20character%20sprite%2C%20cautious%20bearish%20stock%20trader%20pointing%20downward%20with%20a%20small%20red%20bear%20icon%20nearby%2C%20serious%20expression%2C%20retro%20game%20style%2C%20limited%20color%20palette%2C%20chibi%20proportions%2C%20front%20facing%20portrait%2C%20flat%20solid%20color%20background%2C%20no%20text%2C%20no%20watermark%2C%20crisp%20pixels?width=256&height=256&nologo=true&seed=4",
  },
  chief: {
    id: "chief",
    name: "총괄 팀장",
    role: "종합 판단 및 최종 리포트",
    fallback: "🧑‍💼",
    avatar:
      "https://image.pollinations.ai/prompt/16-bit%20pixel%20art%20rpg%20character%20sprite%2C%20senior%20investment%20team%20chief%20wearing%20glasses%20and%20a%20suit%2C%20calm%20authoritative%20expression%2C%20holding%20a%20clipboard%20report%2C%20retro%20game%20style%2C%20limited%20color%20palette%2C%20chibi%20proportions%2C%20front%20facing%20portrait%2C%20flat%20solid%20color%20background%2C%20no%20text%2C%20no%20watermark%2C%20crisp%20pixels?width=256&height=256&nologo=true&seed=5",
  },
};
