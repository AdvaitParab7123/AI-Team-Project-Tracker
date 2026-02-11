import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Team Project Tracker",
  description: "Project management for the AI Adoption Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
