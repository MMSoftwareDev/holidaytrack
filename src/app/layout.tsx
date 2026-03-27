import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HolidayTrack — UK Holiday Management for Employers",
  description:
    "Manage employee holiday requests, approvals, and compliance. Built for UK employers to meet the 6 April 2026 Fair Work Agency regulations.",
  keywords: [
    "holiday management",
    "annual leave tracker",
    "UK employer",
    "holiday requests",
    "Fair Work Agency",
    "employee leave",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
