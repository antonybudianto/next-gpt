import type { Viewport } from 'next'

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

export const viewport: Viewport = {
  themeColor: "#000000",
  minimumScale: 1,
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  width: 'device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
}

export const metadata  = {
  title: "Next GPT",
  description: "Custom GPT Web",
  applicationName: "NextGPT",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NextGPT",
  },
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

export default RootLayout