// 디시인사이드 주식 갤러리(neostock)에서 종목명으로 검색한 최근 게시글 제목을 가져온다.
// 로그인 불필요. 검색 결과가 없거나 실패해도 빈 배열 반환 (보조 데이터라 파이프라인을 막지 않음).
import { decodeEntities } from "./htmlUtils";

const HEADERS = { "User-Agent": "Mozilla/5.0" };

export async function fetchDcGallery(keyword, limit = 15) {
  try {
    const url = `https://gall.dcinside.com/board/lists/?id=neostock&s_keyword=${encodeURIComponent(
      keyword
    )}&s_type=search_subject_memo`;
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const html = await res.text();

    const rowRe = /<td class="gall_tit ub-word">[\s\S]*?<a[^>]*>\s*(?:<em[^>]*><\/em>)?\s*([^<]+)<\/a>[\s\S]*?<td class="gall_date"[^>]*title="([^"]+)"/g;
    const posts = [];
    let m;
    while ((m = rowRe.exec(html)) && posts.length < limit) {
      const title = decodeEntities(m[1].trim());
      const date = m[2].trim();
      if (title) posts.push({ title, date });
    }
    return posts;
  } catch {
    return [];
  }
}
