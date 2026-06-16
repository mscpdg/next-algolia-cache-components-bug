import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algolia InstantSearchNext Reproduction",
  description: "Minimal reproduction of header access error during pre-rendering",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

