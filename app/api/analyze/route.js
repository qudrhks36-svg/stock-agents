import { resolveTicker } from "@/lib/resolveTicker";
import { fetchKrChart } from "@/lib/data/krChart";
import { fetchUsChart } from "@/lib/data/usChart";
import { fetchNews } from "@/lib/data/news";
import { fetchNaverBoard } from "@/lib/data/naverBoard";
import { fetchDcGallery } from "@/lib/data/dcGallery";
import {
  runTechnicalAnalyst,
  runNewsAnalyst,
  runSentimentAnalyst,
  runBull,
  runBear,
  runChief,
} from "@/lib/agents";

export const maxDuration = 300;

function sseLine(obj) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function POST(req) {
  const { input } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj) => controller.enqueue(new TextEncoder().encode(sseLine(obj)));

      try {
        const target = await resolveTicker(input);
        send({ type: "target", target });

        const [chart, news, naverTitles, dcPosts] = await Promise.all([
          target.market === "kr" ? fetchKrChart(target.code) : fetchUsChart(target.code),
          fetchNews(target.name),
          target.market === "kr" ? fetchNaverBoard(target.code) : Promise.resolve([]),
          fetchDcGallery(target.name),
        ]);

        const technical = await runTechnicalAnalyst(target, chart);
        send({ type: "message", persona: "technical", message: technical });

        const newsAnalysis = await runNewsAnalyst(target, news);
        send({ type: "message", persona: "news", message: newsAnalysis });

        const sentiment = await runSentimentAnalyst(target, naverTitles, dcPosts);
        send({ type: "message", persona: "sentiment", message: sentiment });

        // 매수/매도 논자는 서로 결과에 의존하지 않으므로 병렬 실행해 타임아웃 여유를 확보한다
        const [bull, bear] = await Promise.all([
          runBull(target, technical, newsAnalysis, sentiment),
          runBear(target, technical, newsAnalysis, sentiment),
        ]);
        send({ type: "message", persona: "bull", message: bull });
        send({ type: "message", persona: "bear", message: bear });

        const chief = await runChief(target, technical, newsAnalysis, sentiment, bull, bear);
        send({ type: "message", persona: "chief", message: chief });

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: String(err.message || err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
