"use client";

import {
    useMemo,
    useState,
} from "react";
import {
    useRouter,
} from "next/navigation";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";
import {
    tangaPackages,
} from "@/features/tanga/model/tanga-packages";
import type {
    TangaPackageId,
} from "@/features/tanga/model/tanga-package-types";

import styles from "./tanga-packages-page.module.css";

const DEMO_CARD_NUMBER = "8600 0000 0000 0000";
const DEMO_CARD_HOLDER = "TA’LIMOT DEMO";
const TELEGRAM_USERNAME = "husan_davronov";

function formatPrice(value: number): string {
    return `${new Intl.NumberFormat("uz-UZ").format(value)} so‘m`;
}

function BackIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="m15 5-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function WalletIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M4 7.5h14.5A1.5 1.5 0 0 1 20 9v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V7.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M15.5 12.5H20v3h-4.5a1.5 1.5 0 0 1 0-3Z"
                stroke="currentColor"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function CoinIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
                cx="12"
                cy="12"
                r="8.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M9 8.5h6M12 8.5v7M9.5 12h5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CopyIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
                x="8"
                y="8"
                width="11"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

async function copyText(value: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return true;
        }

        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        const copied = document.execCommand("copy");
        textarea.remove();

        return copied;
    } catch {
        return false;
    }
}

export function TangaPackagesPage() {
    const router = useRouter();

    const [selectedId, setSelectedId] =
        useState<TangaPackageId>("standard");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copyStatus, setCopyStatus] = useState<
        "idle" | "copied" | "failed"
    >("idle");

    const selectedPackage = useMemo(
        () =>
            tangaPackages.find(
                (item) => item.id === selectedId,
            ) ?? tangaPackages[1],
        [selectedId],
    );

    const pricePerTanga =
        selectedPackage.price / selectedPackage.amount;

    const telegramMessage = [
        "Assalomu alaykum!",
        "",
        `Men ${selectedPackage.amount} Tanga paketini sotib olmoqchiman.`,
        `To‘lov summasi: ${formatPrice(selectedPackage.price)}.`,
        "To‘lov chekini yuboryapman.",
    ].join("\n");

    const telegramHref =
        `https://t.me/${TELEGRAM_USERNAME}` +
        `?text=${encodeURIComponent(telegramMessage)}`;

    const handleCopyCard = async () => {
        const copied = await copyText(
            DEMO_CARD_NUMBER.replace(/\s/g, ""),
        );

        setCopyStatus(copied ? "copied" : "failed");

        window.setTimeout(() => {
            setCopyStatus("idle");
        }, 1800);
    };

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <button
                        type="button"
                        aria-label="Oldingi sahifaga qaytish"
                        onClick={() => router.back()}
                    >
                        <BackIcon />
                    </button>

                    <div>
                        <span>TA’LIMOT HAMYONI</span>
                        <strong>Tanga paketlari</strong>
                    </div>
                </header>

                <section className={styles.hero}>
                    <span className={styles.heroIcon}>
                        <WalletIcon />
                    </span>

                    <div>
                        <span>JORIY BALANS</span>
                        <h1>0 Tanga</h1>
                        <p>
                            Testlar, esse tekshiruvi va boshqa
                            xizmatlar uchun Tanga ishlatiladi.
                        </p>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeading}>
                        <span>01 · PAKET TANLASH</span>
                        <h2>Kerakli Tanga miqdorini tanlang</h2>
                    </div>

                    <div className={styles.packageList}>
                        {tangaPackages.map((item) => {
                            const selected =
                                item.id === selectedId;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={[
                                        styles.packageCard,
                                        selected
                                            ? styles.selectedCard
                                            : "",
                                        item.recommended
                                            ? styles.recommendedCard
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    aria-pressed={selected}
                                    onClick={() =>
                                        setSelectedId(item.id)
                                    }
                                >
                                    <span className={styles.coinIcon}>
                                        <CoinIcon />
                                    </span>

                                    <span className={styles.packageCopy}>
                                        <span className={styles.packageTop}>
                                            <strong>
                                                {item.amount} Tanga
                                            </strong>

                                            {item.badge ? (
                                                <em>{item.badge}</em>
                                            ) : null}
                                        </span>

                                        <small>{item.description}</small>

                                        <span className={styles.unitPrice}>
                                            1 Tanga ≈{" "}
                                            {formatPrice(
                                                Math.round(
                                                    item.price /
                                                        item.amount,
                                                ),
                                            )}
                                        </span>
                                    </span>

                                    <span className={styles.packagePrice}>
                                        {formatPrice(item.price)}
                                    </span>

                                    <span
                                        className={styles.radioMark}
                                        aria-hidden="true"
                                    />
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className={styles.serviceInfo}>
                    <span>XIZMAT NARXLARI</span>

                    <div>
                        <article>
                            <strong>1 Tanga</strong>
                            <p>Pullik mavzu testi</p>
                        </article>

                        <article>
                            <strong>2 Tanga</strong>
                            <p>AI esse tekshiruvi</p>
                        </article>

                        <article>
                            <strong>6 Tanga</strong>
                            <p>Ustoz + AI tekshiruvi</p>
                        </article>

                        <article>
                            <strong>2 Tanga</strong>
                            <p>Pullik sinov imtihoni</p>
                        </article>
                    </div>
                </section>

                <section className={styles.summary}>
                    <div>
                        <span>Tanlangan paket</span>
                        <strong>
                            {selectedPackage.amount} Tanga
                        </strong>
                    </div>

                    <div>
                        <span>Bir Tanga qiymati</span>
                        <strong>
                            {formatPrice(
                                Math.round(pricePerTanga),
                            )}
                        </strong>
                    </div>

                    <div className={styles.totalRow}>
                        <span>Jami</span>
                        <strong>
                            {formatPrice(selectedPackage.price)}
                        </strong>
                    </div>
                </section>

                <button
                    type="button"
                    className={styles.submitButton}
                    onClick={() => {
                        setCopyStatus("idle");
                        setIsModalOpen(true);
                    }}
                >
                    <span>Sotib olish</span>
                    <strong>
                        {formatPrice(selectedPackage.price)}
                    </strong>
                </button>

                <p className={styles.legalNote}>
                    Paketni tanlang, to‘lov ma’lumotlarini
                    ko‘ring va chekni Telegram orqali yuboring.
                </p>
            </div>

            <MobileNavigation />

            {isModalOpen ? (
                <div
                    className={styles.modalLayer}
                    role="presentation"
                >
                    <button
                        type="button"
                        className={styles.modalOverlay}
                        aria-label="Modal oynani yopish"
                        onClick={() => setIsModalOpen(false)}
                    />

                    <section
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="purchase-modal-title"
                    >
                        <div className={styles.modalHandle} />

                        <header className={styles.modalHeader}>
                            <div>
                                <span>TO‘LOV MA’LUMOTLARI</span>
                                <h2 id="purchase-modal-title">
                                    {selectedPackage.amount} Tanga
                                    paketini sotib olish
                                </h2>
                            </div>

                            <button
                                type="button"
                                aria-label="Modal oynani yopish"
                                onClick={() =>
                                    setIsModalOpen(false)
                                }
                            >
                                <CloseIcon />
                            </button>
                        </header>

                        <div className={styles.orderInfo}>
                            <div>
                                <span>Paket</span>
                                <strong>
                                    {selectedPackage.amount} Tanga
                                </strong>
                            </div>

                            <div>
                                <span>To‘lov summasi</span>
                                <strong>
                                    {formatPrice(
                                        selectedPackage.price,
                                    )}
                                </strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={styles.cardCopy}
                            onClick={handleCopyCard}
                        >
                            <span className={styles.cardTop}>
                                <span>DEMO KARTA</span>
                                <CopyIcon />
                            </span>

                            <strong>{DEMO_CARD_NUMBER}</strong>

                            <span className={styles.cardBottom}>
                                <span>{DEMO_CARD_HOLDER}</span>
                                <em>
                                    {copyStatus === "copied"
                                        ? "Nusxalandi ✓"
                                        : copyStatus === "failed"
                                          ? "Nusxalab bo‘lmadi"
                                          : "Bosib nusxalash"}
                                </em>
                            </span>
                        </button>

                        <p className={styles.demoWarning}>
                            Bu tasodifiy yaratilgan demo karta
                            ma’lumoti. Haqiqiy to‘lov qabul
                            qilmaydi. Ishga tushirishdan oldin
                            administratorning haqiqiy karta
                            ma’lumotlari bilan almashtiring.
                        </p>

                        <a
                            className={styles.telegramButton}
                            href={telegramHref}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Telegram orqali tasdiqlash
                        </a>

                        <p className={styles.modalHelper}>
                            To‘lov qilgandan keyin chekni
                            <strong> @{TELEGRAM_USERNAME}</strong>
                            ga yuboring. Paket va summa xabarga
                            avtomatik qo‘shiladi.
                        </p>
                    </section>
                </div>
            ) : null}
        </main>
    );
}
