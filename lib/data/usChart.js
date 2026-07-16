// Yahoo Finance에서 미국 종목 실시간가 + 최근 3개월 일봉을 가져와서
// 기술분석가 에이전트가 쓰기 좋은 요약 형태로 정리한다.
const HEADERS = { "User-Agent": "Mozilla/5.0" };

function average(nums) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export async function fetchUsChart(ticker) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`,
    { headers: HEADERS, signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`야후 파이낸스 요청 실패: HTTP ${res.status}`);
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`야후 파이낸스에서 ${ticker} 데이터를 찾지 못했습니다.`);

  const meta = result.meta;
  const ts = result.timestamp || [];
  const quote = result.indicators.quote[0];

  const rows = ts
    .map((t, i) => ({
      date: new Date(t * 1000).toISOString().slice(0, 10),
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i],
    }))
    .filter((r) => r.close != null);

  const closes = rows.map((r) => r.close);
  const ma5 = closes.length >= 5 ? average(closes.slice(-5)) : null;
  const ma20 = closes.length >= 20 ? average(closes.slice(-20)) : null;
  const high3m = rows.length ? Math.max(...rows.map((r) => r.high)) : null;
  const low3m = rows.length ? Math.min(...rows.map((r) => r.low)) : null;
  const recentVolAvg = rows.length >= 5 ? average(rows.slice(-5).map((r) => r.volume)) : null;

  const price = meta.regularMarketPrice;
  // meta.previousClose/chartPreviousClose는 range 파라미터에 따라 값이 부정확하거나
  // 아예 없는 경우가 있어서, 실제 일봉 시계열의 마지막 두 종가로 직접 계산한다.
  const prevClose =
    rows.length >= 2 ? rows[rows.length - 2].close : meta.chartPreviousClose ?? price;
  const changeAmount = price - prevClose;
  const changeRate = prevClose ? (changeAmount / prevClose) * 100 : 0;

  return {
    market: "us",
    price,
    changeAmount,
    changeRate,
    ma5,
    ma20,
    high3m,
    low3m,
    recentVolAvg,
    recentDaily: rows.slice(-10),
  };
}
