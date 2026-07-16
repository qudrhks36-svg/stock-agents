# 주식 애널리스트 팀 (stock-agents)

증권사 리서치센터 프로세스를 흉내낸 6인 AI 에이전트 위원회. 종목명/티커를 입력하면 차트→뉴스→여론→매수/매도 토론→총괄 순서로 캐릭터 채팅 UI에 실시간으로 등장하며 분석 리포트를 만든다. **자동 매매는 하지 않으며, 최종 결정은 항상 사용자 본인.**

## 구조

- `lib/resolveTicker.js` — 입력값(종목명/6자리코드/티커)을 국내/해외로 자동 판별. 네이버 자동완성 API(`ac.stock.naver.com`) + 야후 파이낸스로 검증.
- `lib/data/krChart.js`, `usChart.js` — 네이버/야후에서 실시간가 + 최근 3개월 일봉을 가져와 이동평균(5/20일), 거래량(5일/20일 평균), **투자심리선(최근 12거래일 상승 마감 비율)**까지 계산해서 반환.
- `lib/data/news.js` — 구글 뉴스 RSS (money_agent와 동일 방식).
- `lib/data/naverBoard.js` — 네이버 종목토론실 (`finance.naver.com/item/board.naver`) 최근 글 제목. 국내 종목만.
- `lib/data/dcGallery.js` — 디시인사이드 **주식 갤러리(`neostock`)**에서 종목명 검색. 실패해도 빈 배열 반환(보조 데이터라 파이프라인을 막지 않음).
- `lib/agents.js` — 6개 페르소나의 프롬프트. 각자 이전 단계 결과를 이어받아 순차 실행.
- `lib/personas.js` — 페르소나별 이름/역할/Pollinations.ai 고정 아바타 URL.
- `app/api/analyze/route.js` — SSE(Server-Sent Events)로 각 에이전트 결과를 실시간 스트리밍.
- `app/page.js` — 입력창 + 채팅 UI. 에이전트가 끝날 때마다 말풍선이 하나씩 나타남.

## 6인 위원회 순서

1. **차트 분석가** — 이동평균선, 거래량, 투자심리선 세 가지는 프롬프트에서 **필수 언급**을 강제함 (사용자 요청으로 추가, 2026-07-16)
2. **뉴스 분석가** — 호재/악재 판단
3. **여론 분석가** — 네이버 종목토론실 + 디시 주식갤러리 종합 (디시 글은 종목 무관 잡담이 섞여있어 필터링하라고 명시)
4. **매수 논자** / 5. **매도 논자** — 위 3명 근거로 반대 없이 한쪽만 주장 (토론 구도)
6. **총괄 팀장** — 전부 종합해서 예상 범위(확정 아님) + 매수/매도/관망 + 신뢰도 + 핵심 리스크 + "최종 결정은 투자자 본인의 판단입니다" 고정 문구

## 왜 디시인사이드 갤러리 ID가 `neostock`인가

`stock_new1`은 2015~2017년 아카이브 갤러리였고, 실제 현재 활성 갤러리는 `neostock`(정식 주식 갤러리)이다. 검색 URL: `gall.dcinside.com/board/lists/?id=neostock&s_keyword={종목명}&s_type=search_subject_memo`. HTML 구조가 바뀌면 `dcGallery.js`의 정규식이 깨질 수 있음 — 그 경우 `여론 분석가`는 그냥 "디시 데이터 없음"으로 넘어가고 전체 파이프라인은 안 죽는다.

## Vercel 배포 관련

- 프로젝트: `bottlepipe` 팀의 `stock-agents` (team id: `team_5iMUnnwvYGMhU9lr9aNQlecj`)
- blog-agent와 달리 **Deployment Protection이 걸려있지 않음** (첫 배포부터 바로 공개 접근 가능했음)
- **`OPENROUTER_API_KEY` 환경변수를 Vercel에 직접 등록해야 함** — 새 프로젝트라 blog-agent처럼 자동으로 안 딸려옴. [환경변수 설정](https://vercel.com/bottlepipe/stock-agents/settings/environment-variables)에서 blog-agent와 같은 키 재사용 가능.
- git 연동 없음. `deploy_to_vercel` 도구로 매번 전체 소스를 업로드하는 방식이라, `git push`만으로는 배포가 안 바뀜.
- 무료 OpenRouter 모델을 순차로 6번 호출하는 구조라 전체 분석에 1~2분 정도 걸림 (실측 약 100초/삼성전자). 더 빠르게 하려면 `lib/llm.js`를 유료 모델로 바꾸면 됨.

## 알려진 한계 / 다음에 손볼 만한 것

- 미국 종목은 여론 분석(레딧/스탁트윗 등) 소스가 없음 — `fetchNaverBoard`가 국내 전용이라 해외 종목은 여론 분석가가 디시 데이터만 보고 판단.
- 무료 LLM 모델 특성상 가끔 단어가 깨지는 경우가 있음(예: "현재가"가 이상하게 출력) — 유료 모델로 바꾸면 개선됨.
