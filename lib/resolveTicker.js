// 사용자가 입력한 종목명/코드/티커를 { market: "kr"|"us", code, name } 형태로 정규화한다.
const HEADERS = { "User-Agent": "Mozilla/5.0" };

async function searchNaverStock(query) {
  const url = `https://ac.stock.naver.com/ac?q=${encodeURIComponent(
    query
  )}&target=index,stock,marketindicator`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).filter((it) => it.category === "stock" && it.nationCode === "KOR");
}

async function validateUsTicker(ticker) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`,
    { headers: HEADERS, signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) return null;
  return { market: "us", code: ticker, name: result.meta.longName || result.meta.shortName || ticker };
}

export async function resolveTicker(rawInput) {
  const input = rawInput.trim();
  if (!input) throw new Error("종목명을 입력해주세요.");

  // 1) 6자리 숫자 -> 국내 종목코드 직접 입력
  if (/^\d{6}$/.test(input)) {
    const items = await searchNaverStock(input);
    const match = items.find((it) => it.code === input);
    return { market: "kr", code: input, name: match?.name || input };
  }

  // 2) 영문 대문자 1~5자 (한글 없음) -> 미국 티커로 우선 시도
  if (/^[A-Za-z.]{1,5}$/.test(input)) {
    const ticker = input.toUpperCase();
    const us = await validateUsTicker(ticker);
    if (us) return us;
  }

  // 3) 한글/일반 텍스트 -> 네이버 국내 종목 검색
  const items = await searchNaverStock(input);
  if (items.length > 0) {
    const exact = items.find((it) => it.name === input);
    const best = exact || items[0];
    return { market: "kr", code: best.code, name: best.name };
  }

  // 4) 그래도 못 찾으면 마지막으로 미국 티커로 재시도 (소문자로 입력했을 수도 있으니)
  const us = await validateUsTicker(input.toUpperCase());
  if (us) return us;

  throw new Error(`"${input}"에 해당하는 종목을 찾지 못했습니다. 정확한 종목명이나 티커를 입력해주세요.`);
}
