"use client";

import {
    useState,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import styles from "./test-purchase-button.module.css";

type WalletResponse = {
    readonly ok?: boolean;
    readonly wallet?: {
        readonly balance?: number;
    };
    readonly error?: string;
};

type PurchaseResponse = {
    readonly ok?: boolean;
    readonly purchased?: boolean;
    readonly alreadyPurchased?: boolean;
    readonly balance?: number;
    readonly error?: string;
    readonly code?: string;
    readonly required?: number;
};

type TestPurchaseButtonProps = {
    readonly testId: string;
    readonly href: string;
    readonly title: string;
    readonly price: number;
    readonly className?: string;
    readonly children?: ReactNode;
};

export function TestPurchaseButton({
    testId,
    href,
    title,
    price,
    className,
    children,
}: TestPurchaseButtonProps) {
    const router = useRouter();
    const [isLoadingWallet, setIsLoadingWallet] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [error, setError] = useState("");

    const loginHref = `/auth/login?next=${encodeURIComponent(href)}`;
    const safePrice = Math.max(1, Math.trunc(price));
    const enoughBalance = balance !== null && balance >= safePrice;

    const openPurchase = async () => {
        setError("");
        setIsLoadingWallet(true);

        try {
            const response = await fetch("/api/tanga/wallet", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            if (response.status === 401) {
                router.push(loginHref);
                return;
            }

            const payload = await response.json() as WalletResponse;

            if (!response.ok || !payload.ok) {
                throw new Error(payload.error || "Tanga balansini yuklab bo‘lmadi.");
            }

            setBalance(Number(payload.wallet?.balance ?? 0));
            setIsOpen(true);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Tanga balansini yuklab bo‘lmadi.",
            );
            setIsOpen(true);
        } finally {
            setIsLoadingWallet(false);
        }
    };

    const purchase = async () => {
        setError("");
        setIsPurchasing(true);

        try {
            const response = await fetch(
                `/api/tests/${encodeURIComponent(testId)}/purchase`,
                {
                    method: "POST",
                    credentials: "include",
                },
            );

            if (response.status === 401) {
                router.push(loginHref);
                return;
            }

            const payload = await response.json() as PurchaseResponse;

            if (response.status === 402 || payload.code === "INSUFFICIENT_BALANCE") {
                if (typeof payload.balance === "number") {
                    setBalance(payload.balance);
                }
                setError(payload.error || "Tanga balansingiz yetarli emas.");
                return;
            }

            if (!response.ok || !payload.ok) {
                throw new Error(payload.error || "Testni sotib olib bo‘lmadi.");
            }

            if (typeof payload.balance === "number") {
                setBalance(payload.balance);
            }

            setIsOpen(false);
            router.push(href);
            router.refresh();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Testni sotib olishda xatolik yuz berdi.",
            );
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <>
            <button
                type="button"
                className={[styles.trigger, className].filter(Boolean).join(" ")}
                disabled={isLoadingWallet || isPurchasing}
                onClick={openPurchase}
            >
                {isLoadingWallet ? "Balans tekshirilmoqda..." : children}
            </button>

            {isOpen ? (
                <div
                    className={styles.overlay}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target && !isPurchasing) {
                            setIsOpen(false);
                        }
                    }}
                >
                    <section
                        className={styles.dialog}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`purchase-title-${testId}`}
                    >
                        <div className={styles.dialogHeader}>
                            <span>Pullik test</span>

                            <button
                                type="button"
                                className={styles.closeButton}
                                aria-label="Oynani yopish"
                                disabled={isPurchasing}
                                onClick={() => setIsOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <h3 id={`purchase-title-${testId}`}>{title}</h3>
                        <p className={styles.dialogText}>
                            Test bir marta sotib olinadi va hisobingizda doimiy ochiq qoladi.
                        </p>

                        <div className={styles.balanceCard}>
                            <span>Joriy balans</span>
                            <strong>{balance ?? "—"} Tanga</strong>

                            <span>Test narxi</span>
                            <strong>{safePrice} Tanga</strong>

                            <span>Qoladigan balans</span>
                            <strong className={styles.afterBalance}>
                                {balance === null
                                    ? "—"
                                    : `${Math.max(0, balance - safePrice)} Tanga`}
                            </strong>
                        </div>

                        {error ? (
                            <p className={styles.error} role="alert">
                                {error}
                            </p>
                        ) : null}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                disabled={isPurchasing}
                                onClick={() => setIsOpen(false)}
                            >
                                Bekor qilish
                            </button>

                            {balance !== null && !enoughBalance ? (
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={() => router.push("/packages")}
                                >
                                    Tanga sotib olish
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    disabled={isPurchasing || !enoughBalance}
                                    onClick={purchase}
                                >
                                    {isPurchasing
                                        ? "Sotib olinmoqda..."
                                        : `${safePrice} Tanga bilan ochish`}
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            ) : null}
        </>
    );
}
