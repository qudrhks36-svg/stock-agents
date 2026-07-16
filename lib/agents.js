import { callLLM } from "./llm";

const COMMON_RULES = `
너는 한국의 증권사 리서치센터에서 일하는 애널리스트다. 아래 조건을 반드시 지켜라:
- 반말 없이 정중한 존댓말, 하지만 보고서처럼 간결하고 단정적인 어투.
- 3~5문장 내외로 짧게. 서론 없이 바로 분석 내용으로 시작.
- 숫자와 근거를 구체적으로 언급 (막연한 얘기 금지).
- 확정적 예언이 아니라 "~로 판단됩니다", "~가능성이 있습니다" 같은 전문가 톤 사용.
`.trim();

function fmtChart(chart) {
  const cur = chart.market === "kr" ? "원" : "$";
  const lines = [
    `현재가: ${cur}${chart.price?.toLocaleString?.() ?? chart.price} (전일 대비 ${chart.changeRate?.toFixed(2)}%)`,
    chart.ma5 ? `5일 이동평균: ${cur}${Math.round(chart.ma5).toLocaleString()}` : null,
    chart.ma20 ? `20일 이동평균: ${cur}${Math.round(chart.ma20).toLocaleString()}` : null,
    chart.high3m ? `최근 3개월 고점: ${cur}${Math.round(chart.high3m).toLocaleString()}` : null,
    chart.low3m ? `최근 3개월 저점: ${cur}${Math.round(chart.low3m).toLocaleString()}` : null,
    chart.recentVolAvg ? `최근 5일 평균 거래량: ${Math.round(chart.recentVolAvg).toLocaleString()}` : null,
    "",
    "최근 10거래일 일봉(날짜/시가/고가/저가/종가/거래량):",
    ...chart.recentDaily.map(
      (d) => `${d.date} ${Math.round(d.open)}/${Math.round(d.high)}/${Math.round(d.low)}/${Math.round(d.close)}/${d.volume}`
    ),
  ].filter(Boolean);
  return lines.join("\n");
}

function fmtNews(news) {
  if (!news.length) return "(관련 뉴스를 찾지 못했습니다)";
  return news.map((n) => `- ${n.title}`).join("\n");
}

function fmtSentiment(naverTitles, dcPosts) {
  const parts = [];
  parts.push("[네이버 종목토론실 최근 글 제목]");
  parts.push(naverTitles.length ? naverTitles.map((t) => `- ${t}`).join("\n") : "(데이터 없음)");
  parts.push("");
  parts.push("[디시인사이드 주식 갤러리 관련 글 제목]");
  parts.push(
    dcPosts.length
      ? dcPosts.map((p) => `- (${p.date}) ${p.title}`).join("\n")
      : "(데이터 없음)"
  );
  return parts.join("\n");
}

export async function runTechnicalAnalyst(target, chart) {
  const prompt = `${COMMON_RULES}

너는 [차트 분석가]다. 아래 ${target.name}(${target.code}) 시세 데이터를 보고 기술적 분석을 해라.
추세(상승/하락/횡보), 이동평균선 위치, 최근 거래량 변화, 지지/저항 구간을 근거로 판단해라.

${fmtChart(chart)}`;
  return callLLM(prompt);
}

export async function runNewsAnalyst(target, news) {
  const prompt = `${COMMON_RULES}

너는 [뉴스 분석가]다. 아래 ${target.name}(${target.code}) 관련 최근 뉴스 제목들을 보고
호재/악재 여부와 핵심 이슈를 판단해라. 뉴스가 없으면 "특별한 뉴스 이슈 없음"이라고 명시해라.

${fmtNews(news)}`;
  return callLLM(prompt);
}

export async function runSentimentAnalyst(target, naverTitles, dcPosts) {
  const prompt = `${COMMON_RULES}

너는 [여론 분석가]다. 아래 ${target.name} 관련 커뮤니티 게시글 제목들을 보고 개인 투자자 여론을 판단해라.
디시인사이드 글은 종목과 무관한 잡담/정치글이 섞여 있을 수 있으니, 종목과 관련 없는 글은 무시하고
실제로 종목 얘기를 하는 글만 근거로 삼아라. 전반적 분위기(낙관/비관/혼조)와 특이 신호를 짚어라.

${fmtSentiment(naverTitles, dcPosts)}`;
  return callLLM(prompt);
}

export async function runBull(target, technical, news, sentiment) {
  const prompt = `${COMMON_RULES}

너는 [매수 논자]다. 아래 세 애널리스트의 분석을 근거로 ${target.name} "매수"를 주장해라.
반대 논리는 신경 쓰지 말고, 매수해야 하는 이유만 최대한 설득력 있게 제시해라.

[차트 분석가]
${technical}

[뉴스 분석가]
${news}

[여론 분석가]
${sentiment}`;
  return callLLM(prompt);
}

export async function runBear(target, technical, news, sentiment) {
  const prompt = `${COMMON_RULES}

너는 [매도 논자]다. 아래 세 애널리스트의 분석을 근거로 ${target.name} "매도(또는 매수 보류)"를 주장해라.
반대 논리는 신경 쓰지 말고, 매도/보류해야 하는 이유만 최대한 설득력 있게 제시해라.

[차트 분석가]
${technical}

[뉴스 분석가]
${news}

[여론 분석가]
${sentiment}`;
  return callLLM(prompt);
}

export async function runChief(target, technical, news, sentiment, bull, bear) {
  const prompt = `${COMMON_RULES}

너는 [총괄 팀장]이다. 아래 애널리스트 3명의 분석과 매수/매도 논자의 토론을 모두 종합해서
최종 리포트를 작성해라. 반드시 아래 형식을 지켜라:

1줄: 예상 방향과 범위 (예: "단기적으로 3~6% 내외의 상승 가능성이 있다고 판단됩니다" — 확정적 숫자 하나가 아니라 범위로, 그리고 이건 예측이지 확정이 아님을 톤으로 드러낼 것)
2줄: 추천 (매수 / 매도 / 관망 중 하나 + 한 줄 이유)
3줄: 신뢰도 (근거가 얼마나 명확한지, 낮음/중간/높음 중 하나 + 이유)
4줄: 핵심 리스크 (이 판단이 틀릴 수 있는 가장 큰 이유 하나)
마지막 줄: "최종 결정은 투자자 본인의 판단입니다."를 반드시 포함.

[차트 분석가]
${technical}

[뉴스 분석가]
${news}

[여론 분석가]
${sentiment}

[매수 논자]
${bull}

[매도 논자]
${bear}`;
  return callLLM(prompt);
}
