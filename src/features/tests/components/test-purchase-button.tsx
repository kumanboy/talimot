"use client";

import {
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { ButtonLoader } from "@/components/ui/button-loader";

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
    const [isOpeningTest, setIsOpeningTest] = useState(false);
    const [isGoingToPackages, setIsGoingToPackages] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [error, setError] = useState("");

    const walletRequestLockRef = useRef(false);
    const purchaseLockRef = useRef(false);
    const packagesNavigationLockRef = useRef(false);

    const loginHref = `/auth/login?next=${encodeURIComponent(href)}`;
    const safePrice = Math.max(1, Math.trunc(price));
    const enoughBalance = balance !== null && balance >= safePrice;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isPurchasing && !isOpeningTest) {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isOpeningTest, isPurchasing]);

    const openPurchase = async () => {
        if (walletRequestLockRef.current || purchaseLockRef.current) return;
        walletRequestLockRef.current = true;
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
            walletRequestLockRef.current = false;
            setIsLoadingWallet(false);
        }
    };

    const purchase = async () => {
        if (purchaseLockRef.current || walletRequestLockRef.current || isOpeningTest) return;
        purchaseLockRef.current = true;
        setError("");
        setIsPurchasing(true);
        let navigationStarted = false;

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

            navigationStarted = true;
            setIsOpeningTest(true);
            router.push(href);
            router.refresh();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Testni sotib olishda xatolik yuz berdi.",
            );
        } finally {
            if (!navigationStarted) {
                purchaseLockRef.current = false;
                setIsPurchasing(false);
            }
        }
    };

    return (
        <>
            <button
                type="button"
                className={[styles.trigger, className].filter(Boolean).join(" ")}
                disabled={isLoadingWallet || isPurchasing || isOpeningTest || isGoingToPackages}
                aria-busy={isLoadingWallet || isOpeningTest || undefined}
                onClick={openPurchase}
            >
                {isLoadingWallet ? (<>
                    <ButtonLoader /> Balans tekshirilmoqda...
                </>) : children}
            </button>

            {isOpen && typeof document !== "undefined"
                ? createPortal(
                    <div
                        className={styles.overlay}
                        role="presentation"
                        onMouseDown={(event) => {
                            if (event.currentTarget === event.target && !isPurchasing && !isOpeningTest) {
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
                                    disabled={isPurchasing || isOpeningTest}
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
                                    disabled={isPurchasing || isOpeningTest}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Bekor qilish
                                </button>

                                {balance !== null && !enoughBalance ? (
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        disabled={isGoingToPackages}
                                        aria-busy={isGoingToPackages || undefined}
                                        onClick={() => {
                                            if (packagesNavigationLockRef.current || isGoingToPackages) return;
                                            packagesNavigationLockRef.current = true;
                                            setIsGoingToPackages(true);
                                            router.push("/packages");
                                        }}
                                    >
                                        {isGoingToPackages ? (
                                            <><ButtonLoader /> Tanga bo‘limi ochilmoqda...</>
                                        ) : "Tanga sotib olish"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        disabled={isPurchasing || isOpeningTest || !enoughBalance}
                                        aria-busy={isPurchasing || isOpeningTest || undefined}
                                        onClick={purchase}
                                    >
                                        {isOpeningTest
                                            ? <><ButtonLoader /> Test ochilmoqda...</>
                                            : isPurchasing
                                                ? <><ButtonLoader /> Sotib olinmoqda...</>
                                                : `${safePrice} Tanga bilan ochish`}
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>,
                    document.body,
                )
                : null}
        </>
    );
}
