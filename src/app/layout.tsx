import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Team Project Tracker",
  description: "Project management for the AI Adoption Team - Demo Mode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
