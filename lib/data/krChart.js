// 네이버 금융에서 국내 종목 실시간가 + 최근 3개월 일봉을 가져와서
// 기술분석가 에이전트가 쓰기 좋은 요약 형태로 정리한다.
const HEADERS = { "User-Agent": "Mozilla/5.0" };

function parseSiseJson(text) {
  // 응답이 순수 JSON이 아니라 작은따옴표 섞인 JS 배열 리터럴이라 행 단위로 직접 파싱한다.
  const rowRe = /\["(\d{8})",\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*(\d+)/g;
  const rows = [];
  let m;
  while ((m = rowRe.exec(text))) {
    rows.push({
      date: m[1],
      open: Number(m[2]),
      high: Number(m[3]),
      low: Number(m[4]),
      close: Number(m[5]),
      volume: Number(m[6]),
    });
  }
  return rows;
}

function average(nums) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export async function fetchKrChart(code) {
  const end = new Date();
  const start = new Date(end.getTime() - 100 * 24 * 60 * 60 * 1000); // ~3개월 전
  const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");

  const [realtimeRes, siseRes] = await Promise.all([
    fetch(`https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
    }),
    fetch(
      `https://api.finance.naver.com/siseJson.naver?symbol=${code}&requestType=1&startTime=${fmt(
        start
      )}&endTime=${fmt(end)}&timeframe=day`,
      { headers: HEADERS, signal: AbortSignal.timeout(10000) }
    ),
  ]);

  if (!realtimeRes.ok) throw new Error(`네이버 실시간 시세 요청 실패: HTTP ${realtimeRes.status}`);
  const realtime = (await realtimeRes.json()).datas[0];

  const siseText = await siseRes.text();
  const rows = parseSiseJson(siseText).sort((a, b) => (a.date < b.date ? -1 : 1));

  const closes = rows.map((r) => r.close);
  const ma5 = closes.length >= 5 ? average(closes.slice(-5)) : null;
  const ma20 = closes.length >= 20 ? average(closes.slice(-20)) : null;
  const high52 = rows.length ? Math.max(...rows.map((r) => r.high)) : null;
  const low52 = rows.length ? Math.min(...rows.map((r) => r.low)) : null;
  const recentVolAvg = rows.length >= 5 ? average(rows.slice(-5).map((r) => r.volume)) : null;

  return {
    market: "kr",
    price: realtime.closePrice,
    changeAmount: realtime.compareToPreviousClosePrice,
    changeRate: Number(realtime.fluctuationsRatioRaw),
    ma5,
    ma20,
    high3m: high52,
    low3m: low52,
    recentVolAvg,
    recentDaily: rows.slice(-10), // 최근 10거래일 원자료 (프롬프트에 그대로 넣기 좋은 크기)
  };
}
