import "./globals.css";

export const metadata = {
  title: "주식 애널리스트 팀",
  description: "종목명을 입력하면 6명의 AI 애널리스트가 토론 후 리포트를 드립니다",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
