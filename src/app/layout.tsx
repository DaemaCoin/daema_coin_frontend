import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "대마코인 - GitHub 커밋으로 코인 채굴",
  description: "GitHub 커밋을 통해 대마코인을 채굴하는 혁신적인 서비스입니다.",
  keywords: ["대마코인", "GitHub", "채굴", "코인", "개발자"],
  authors: [{ name: "대마코인 팀" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-pretendard antialiased">
        {children}
      </body>
    </html>
  );
}
