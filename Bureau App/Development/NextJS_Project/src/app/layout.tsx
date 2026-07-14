import type { Metadata } from "next";
import "./globals.css";
import Topbar from "@/components/Layout/Topbar";
import Sidebar from "@/components/Layout/Sidebar";

export const metadata: Metadata = {
  title: "The Bureau",
  description: "Personal AI Business OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="lrbg"></div>
        <div className="app">
          <Topbar />
          <div className="main">
            <Sidebar />
            <div className="content">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
