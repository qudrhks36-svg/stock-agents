// 사용자가 입력한 종목명/코드/티커를 { market: "kr"|"us", code, name } 형태로 정규화한다.
// 네이버 자동완성 API 하나로 국내 종목뿐 아니라 해외 종목(한글명/영문 티커 모두)까지 통합 검색한다.
// 예: "삼성전자", "엔비디아", "NVDA", "테슬라" 모두 이 API 하나로 잡힌다.
const HEADERS = { "User-Agent": "Mozilla/5.0" };

async function searchNaverStock(query) {
  const url = `https://ac.stock.naver.com/ac?q=${encodeURIComponent(
    query
  )}&target=index,stock,marketindicator`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).filter((it) => it.category === "stock");
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
    const match = items.find((it) => it.code === input && it.nationCode === "KOR");
    return { market: "kr", code: input, name: match?.name || input };
  }

  // 2) 네이버 통합 검색: 국내/해외 종목명, 해외 종목의 한글 표기, 영문 티커까지 한 번에 처리.
  //    같은 이름을 가진 ETF/ETN이 여러 개 섞여 나올 수 있어 정확히 일치하는 항목을 우선한다.
  const items = await searchNaverStock(input);
  if (items.length > 0) {
    const exact = items.find(
      (it) => it.name === input || it.code === input.toUpperCase()
    );
    const best = exact || items[0];
    return {
      market: best.nationCode === "KOR" ? "kr" : "us",
      code: best.code,
      name: best.name,
    };
  }

  // 3) 네이버 검색에 안 걸리는 티커 대비 최후 폴백: 야후 파이낸스로 직접 검증 (영문 1~5자만)
  if (/^[A-Za-z.]{1,5}$/.test(input)) {
    const us = await validateUsTicker(input.toUpperCase());
    if (us) return us;
  }

  throw new Error(`"${input}"에 해당하는 종목을 찾지 못했습니다. 정확한 종목명이나 티커를 입력해주세요.`);
}
