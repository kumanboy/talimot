"use client";

import { useCallback, useEffect, useState } from "react";

export type TangaWalletSnapshot = {
    readonly balance: number;
    readonly lifetimeCredited: number;
    readonly lifetimeSpent: number;
    readonly updatedAt: number;
};

export type TangaWalletUser = {
    readonly userNumber: number;
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
};

type WalletResponse = {
    ok?: boolean;
    wallet?: TangaWalletSnapshot;
    user?: TangaWalletUser;
};

export function useTangaWallet() {
    const [wallet, setWallet] = useState<TangaWalletSnapshot | null>(null);
    const [user, setUser] = useState<TangaWalletUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/tanga/wallet", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            if (!response.ok) {
                setWallet(null);
                setUser(null);
                setError(
                    response.status === 401
                        ? "Hisobga kirish talab qilinadi."
                        : "Tanga balansini yuklab bo‘lmadi.",
                );
                return;
            }

            const payload = (await response.json()) as WalletResponse;

            if (!payload.wallet) {
                setWallet(null);
                setUser(null);
                setError("Tanga hamyoni topilmadi.");
                return;
            }

            setWallet(payload.wallet);
            setUser(payload.user ?? null);
        } catch {
            setWallet(null);
            setUser(null);
            setError("Tanga balansini yuklab bo‘lmadi.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return {
        wallet,
        user,
        balance: wallet?.balance ?? 0,
        isLoading,
        error,
        refresh,
    } as const;
}
