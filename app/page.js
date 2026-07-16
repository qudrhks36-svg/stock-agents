"use client";

import { useState, useRef } from "react";
import { PERSONAS } from "@/lib/personas";

const ORDER = ["technical", "news", "sentiment", "bull", "bear", "chief"];

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

  return (
    <div className="wrap">
      <h1>📊 주식 애널리스트 팀</h1>
      <p className="sub">종목명이나 티커를 입력하면 6명의 AI 애널리스트가 순서대로 분석·토론합니다.</p>

      <div className="input-bar">
        <input
          type="text"
          placeholder="예: 삼성전자, 005930, AAPL, NVDA"
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

      <div className="chat">
        {messages.map((m, i) => {
          const p = PERSONAS[m.persona];
          return (
            <div className={`chat-msg ${m.persona}`} key={i}>
              <img className="avatar" src={p.avatar} alt={p.name} />
              <div className="chat-body">
                <div className="chat-name">
                  {p.name} · {p.role}
                </div>
                <div className="bubble">{m.message}</div>
              </div>
            </div>
          );
        })}

        {running && nextPersona && (
          <div className={`chat-msg ${nextPersona}`}>
            <img className="avatar" src={PERSONAS[nextPersona].avatar} alt="" />
            <div className="chat-body">
              <div className="chat-name">{PERSONAS[nextPersona].name}</div>
              <div className="bubble">
                <span className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            </div>
          </div>
        )}
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
