"use client";

import { useState, useRef, useEffect } from "react";
import { PERSONAS } from "@/lib/personas";

const ORDER = ["technical", "news", "sentiment", "bull", "bear", "chief"];

// 픽셀 아바타는 Pollinations.ai가 그때그때 생성해서 처음 요청 시 느리거나 실패할 수 있다.
// 깨진 이미지 아이콘이 보이는 대신 캐릭터 이모지로 자연스럽게 대체한다.
// 서버 렌더링된 <img>는 React가 하이드레이션되기 전에 이미 로드를 시도하기 때문에,
// 그 사이에 실패하면 onError가 못 잡을 수 있어 마운트 직후 한 번 더 상태를 확인한다.
//
// 페르소나가 "분석 중"일 때는 idle/talk 두 프레임을 번갈아 보여줘서 말하는 듯한
// 애니메이션을 낸다. idle/완료 상태에서는 idle 프레임에서 멈춘다.
function Avatar({ id, status, className }) {
  const [idleBroken, setIdleBroken] = useState(false);
  const [talkBroken, setTalkBroken] = useState(false);
  const [frame, setFrame] = useState("idle");
  const imgRef = useRef(null);
  const p = PERSONAS[id];

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setIdleBroken(true);
    }
  }, []);

  useEffect(() => {
    if (status !== "active" || talkBroken) {
      setFrame("idle");
      return;
    }
    const timer = setInterval(() => {
      setFrame((f) => (f === "idle" ? "talk" : "idle"));
    }, 450);
    return () => clearInterval(timer);
  }, [status, talkBroken]);

  if (idleBroken) {
    return <span className={`${className} avatar-fallback`}>{p.fallback}</span>;
  }
  const src = frame === "talk" && !talkBroken ? p.avatar.talk : p.avatar.idle;
  return (
    <img
      ref={imgRef}
      className={className}
      src={src}
      alt={p.name}
      onError={() => {
        if (frame === "talk") setTalkBroken(true);
        else setIdleBroken(true);
      }}
    />
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [target, setTarget] = useState(null);
  const [messages, setMessages] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [nextPersona, setNextPersona] = useState(null);
  const abortRef = useRef(null);

  async function startAnalysis() {
    if (!input.trim() || running) return;
    setMessages([]);
    setTarget(null);
    setError("");
    setRunning(true);
    setNextPersona(ORDER[0]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`서버 오류 (HTTP ${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop();

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim());
          handleEvent(payload);
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setRunning(false);
      setNextPersona(null);
    }
  }

  function handleEvent(payload) {
    if (payload.type === "target") {
      setTarget(payload.target);
    } else if (payload.type === "message") {
      setMessages((prev) => [...prev, payload]);
      const idx = ORDER.indexOf(payload.persona);
      setNextPersona(idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null);
    } else if (payload.type === "error") {
      setError(payload.message);
      setNextPersona(null);
    } else if (payload.type === "done") {
      setNextPersona(null);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") startAnalysis();
  }

  function personaStatus(id) {
    if (messages.some((m) => m.persona === id)) return "done";
    if (running && nextPersona === id) return "active";
    return "idle";
  }

  return (
    <div className="wrap">
      <h1>📊 주식 애널리스트 팀</h1>
      <p className="sub">종목명이나 티커를 입력하면 사무실의 6명이 각자 자리에서 순서대로 말풍선을 띄우며 분석·토론합니다.</p>

      <div className="input-bar">
        <input
          type="text"
          placeholder="예: 삼성전자, 005930, 엔비디아, NVDA"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={running}
        />
        <button onClick={startAnalysis} disabled={running || !input.trim()}>
          {running ? "분석 중..." : "분석 시작"}
        </button>
      </div>

      {target && (
        <div className="target-banner">
          <b>{target.name}</b> ({target.market === "kr" ? "국내" : "해외"} · {target.code}) 분석 중
        </div>
      )}

      <div className="board">
        {ORDER.map((id) => {
          const p = PERSONAS[id];
          const status = personaStatus(id);
          const msg = messages.find((m) => m.persona === id);
          return (
            <div className={`station ${id} ${status}`} key={id}>
              <div className="bubble-slot">
                {status === "active" && (
                  <div className="speech-bubble">
                    <span className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                )}
                {status === "done" && msg && <div className="speech-bubble">{msg.message}</div>}
              </div>
              <div className="char-wrap">
                {status === "active" && <div className="tag busy">분석 중</div>}
                {status === "done" && <div className="tag done">완료</div>}
                <Avatar id={id} status={status} className="station-avatar" />
                <div className="desk-surface"></div>
                <div className="station-name">
                  {p.name}
                  <span className="station-role"> · {p.role}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="status error">⚠️ {error}</p>}

      {messages.some((m) => m.persona === "chief") && (
        <div className="disclaimer">
          ⚠️ 이 리포트는 공개 데이터(시세·뉴스·커뮤니티 게시글)를 AI가 요약·해석한 참고 자료이며 투자 권유가
          아닙니다. 모든 투자 판단과 책임은 투자자 본인에게 있습니다.
        </div>
      )}
    </div>
  );
}
