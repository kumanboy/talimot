import type {
    Metadata,
} from "next";

import Script from "next/script";

import { TelegramWebAppSetup } from "@/components/telegram-webapp-setup";

import "./globals.css";

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
            <head>
                <Script
                    id="talimot-theme-bootstrap"
                    src="/theme-bootstrap.js"
                    strategy="beforeInteractive"
                />

                <Script
                    id="telegram-web-app-sdk"
                    src="https://telegram.org/js/telegram-web-app.js"
                    strategy="beforeInteractive"
                />
            </head>

            <body>
                <TelegramWebAppSetup />
                {children}
            </body>
        </html>
    );
}
