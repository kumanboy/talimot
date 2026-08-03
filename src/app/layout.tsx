import type {
    Metadata,
} from "next";

import Script from "next/script";

import "./globals.css";

const themeBootstrapScript = `
(function () {
  try {
    var storageKey = "talimot-theme";
    var storedTheme = window.localStorage.getItem(storageKey);
    var systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    var theme =
      storedTheme === "dark" ||
      storedTheme === "light"
        ? storedTheme
        : systemPrefersDark
          ? "dark"
          : "light";

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export const metadata: Metadata = {
    title:
        "TA’LIMOT — Ona tili milliy sertifikat platformasi",

    description:
        "Ona tili milliy sertifikatiga tizimli va zamonaviy tayyorgarlik platformasi.",
};

type RootLayoutProps = Readonly<{
    children:
        React.ReactNode;
}>;

export default function RootLayout({
                                       children,
                                   }: RootLayoutProps) {
    return (
        <html
            lang="uz"
            suppressHydrationWarning
        >
        <body>
        <Script
            id="talimot-theme-bootstrap"
            strategy="beforeInteractive"
        >
            {themeBootstrapScript}
        </Script>

        {children}
        </body>
        </html>
    );
}