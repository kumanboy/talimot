export {};

declare global {
    interface TelegramWebAppApi {
        initData: string;
        ready: () => void;
        expand: () => void;
        disableVerticalSwipes?: () => void;
        openTelegramLink?: (url: string) => void;
        close?: () => void;
        onEvent?: (eventType: string, handler: () => void) => void;
        offEvent?: (eventType: string, handler: () => void) => void;
    }

    interface Window {
        Telegram?: {
            WebApp?: TelegramWebAppApi;
        };
    }
}
