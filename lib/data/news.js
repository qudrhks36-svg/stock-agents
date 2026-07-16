// 구글 뉴스 RSS로 종목 관련 최근 뉴스 제목을 가져온다. (money_agent/scripts/check_stocks.py와 동일 방식)
import { decodeEntities } from "./htmlUtils";

const HEADERS = { "User-Agent": "Mozilla/5.0" };

export async function fetchNews(query, limit = 8) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=ko&gl=KR&ceid=KR:ko`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`뉴스 요청 실패: HTTP ${res.status}`);
  const xml = await res.text();

  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  const titleRe = /<title>([\s\S]*?)<\/title>/;
  const pubDateRe = /<pubDate>([\s\S]*?)<\/pubDate>/;

  const items = [];
  let m;
  while ((m = itemRe.exec(xml)) && items.length < limit) {
    const block = m[1];
    const titleMatch = titleRe.exec(block);
    const dateMatch = pubDateRe.exec(block);
    if (!titleMatch) continue;
    let title = titleMatch[1].replace(/^<!\[CDATA\[|\]\]>$/g, "");
    title = decodeEntities(title).replace(/\s*-\s*[^-]+$/, "").trim(); // 언론사명 접미어 제거
    items.push({ title, pubDate: dateMatch ? dateMatch[1] : null });
  }
  return items;
}
