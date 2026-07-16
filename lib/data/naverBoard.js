// 네이버 종목토론실 최근 게시글 제목을 가져온다. 로그인 불필요.
import { decodeEntities } from "./htmlUtils";

const HEADERS = { "User-Agent": "Mozilla/5.0" };

export async function fetchNaverBoard(code, limit = 15) {
  const url = `https://finance.naver.com/item/board.naver?code=${code}`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`네이버 종목토론실 요청 실패: HTTP ${res.status}`);
  const html = await res.text();

  const rowRe = /<td class="title"[^>]*>[\s\S]*?<a href="\/item\/board_read\.naver\?code=\d+&nid=\d+&page=1"[^>]*title="([^"]+)"/g;
  const titles = [];
  let m;
  while ((m = rowRe.exec(html)) && titles.length < limit) {
    const title = decodeEntities(m[1].trim());
    if (title) titles.push(title);
  }
  return titles;
}
