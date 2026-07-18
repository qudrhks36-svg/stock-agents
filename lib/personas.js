// 6명의 애널리스트 페르소나. 아바타는 CraftPix의 무료 "Tiny Hero Sprites" 픽셀아트 팩
// (Pink/Owlet/Dude Monster)에서 idle/attack 프레임을 잘라내고 색조만 바꿔 만든
// 정적 스프라이트다 (public/sprites/). 외부 API 호출 없이 항상 즉시 로드된다.
export const PERSONAS = {
  technical: {
    id: "technical",
    name: "차트 분석가",
    role: "기술적 분석 담당",
    fallback: "📈",
    avatar: {
      idle: "/sprites/technical-idle.png",
      talk: "/sprites/technical-talk.png",
    },
  },
  news: {
    id: "news",
    name: "뉴스 분석가",
    role: "호재/악재 뉴스 담당",
    fallback: "🗞️",
    avatar: {
      idle: "/sprites/news-idle.png",
      talk: "/sprites/news-talk.png",
    },
  },
  sentiment: {
    id: "sentiment",
    name: "여론 분석가",
    role: "커뮤니티 여론 담당",
    fallback: "💬",
    avatar: {
      idle: "/sprites/sentiment-idle.png",
      talk: "/sprites/sentiment-talk.png",
    },
  },
  bull: {
    id: "bull",
    name: "매수 논자",
    role: "매수 근거 주장",
    fallback: "🐂",
    avatar: {
      idle: "/sprites/bull-idle.png",
      talk: "/sprites/bull-talk.png",
    },
  },
  bear: {
    id: "bear",
    name: "매도 논자",
    role: "매도 근거 주장",
    fallback: "🐻",
    avatar: {
      idle: "/sprites/bear-idle.png",
      talk: "/sprites/bear-talk.png",
    },
  },
  chief: {
    id: "chief",
    name: "총괄 팀장",
    role: "종합 판단 및 최종 리포트",
    fallback: "🧑‍💼",
    avatar: {
      idle: "/sprites/chief-idle.png",
      talk: "/sprites/chief-talk.png",
    },
  },
};
