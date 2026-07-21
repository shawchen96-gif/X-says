import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "X-says · 把单词说出来",
    description: "用滑动单词卡完成每日词汇任务。",
    icons: { icon: "/xsays-icon.png", apple: "/xsays-icon.png" },
    openGraph: {
      title: "X-says · 把单词说出来",
      description: "选词书、定节奏，用滑动卡片轻松背单词。",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "X-says 单词卡" }],
    },
    twitter: { card: "summary_large_image", images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
