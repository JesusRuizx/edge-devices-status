import { ThemeModeScript, ThemeProvider } from "flowbite-react";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

import "../styles/globals.css";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
          type="text/css"
        />
        <ThemeModeScript />
      </head>
      <body
        suppressHydrationWarning
        className={twMerge("bg-gray-50 font-sans antialiased dark:bg-gray-900")}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
