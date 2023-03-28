import "./globals.css";

export const metadata = {
  title: "Next GPT",
  description: "Custom GPT Web",
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
