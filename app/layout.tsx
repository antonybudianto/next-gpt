import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Next GPT",
  description: "Custom GPT Web",
  applicationName: "NextGPT",
  manifest: "/manifest.json",
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NextGPT",
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@300&display=swap"
          rel="stylesheet"
          // @ts-ignore
          precedence="default"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body
        style={{
          fontFamily: "Nunito, Arial",
        }}
      >
        {children}
      </body>
    </html>
  );
}
