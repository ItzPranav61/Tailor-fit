import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tailor Fit",
  description:
    "Rewrite your resume for a job description without inventing fake experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
