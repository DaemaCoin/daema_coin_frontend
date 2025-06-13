import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from 'next/script';

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
        <Script id="channel-io" strategy="afterInteractive">
          {`(function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();\nChannelIO('boot', {\n  "pluginKey": "9abdc3ab-22dd-43f3-b6b5-6f0143210c27"\n});`}
        </Script>
      </body>
    </html>
  );
}
