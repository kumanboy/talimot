"use client";

import {
    FormEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import type {
    BookDefinition,
} from "@/features/books/model/book-types";

import {
    BookCoverPlaceholder,
} from "./book-cover-placeholder";
import {
    MANUAL_PAYMENT_CARD_HOLDER,
    MANUAL_PAYMENT_CARD_NUMBER,
    MANUAL_PAYMENT_METHOD,
    MANUAL_PAYMENT_TELEGRAM_USERNAME,
} from "@/features/payments/config/manual-payment";
import styles from "./book-purchase-page.module.css";

type BookPurchasePageProps = {
    readonly book: BookDefinition;
};

type FormValues = {
    readonly fullName: string;
    readonly phone: string;
    readonly telegramUsername: string;
    readonly region: string;
    readonly district: string;
    readonly btsPoint: string;
    readonly quantity: number;
    readonly note: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;


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

const initialValues: FormValues = {
    fullName: "",
    phone: "",
    telegramUsername: "",
    region: "",
    district: "",
    btsPoint: "",
    quantity: 1,
    note: "",
};

function formatPrice(value: number): string {
    return `${new Intl.NumberFormat("uz-UZ").format(value)} so‘m`;
}

function validateForm(values: FormValues): FormErrors {
    const errors: FormErrors = {};

    if (values.fullName.trim().length < 5) {
        errors.fullName = "Ism va familiyangizni to‘liq kiriting.";
    }
    if (values.phone.replace(/\D/g, "").length < 9) {
        errors.phone = "Telefon raqamingizni to‘liq kiriting.";
    }
    if (values.telegramUsername.trim().replace(/^@/, "").length < 5) {
        errors.telegramUsername = "Telegram foydalanuvchi nomini kiriting.";
    }
    if (values.region.trim().length < 3) {
        errors.region = "Viloyat nomini kiriting.";
    }
    if (values.district.trim().length < 3) {
        errors.district = "Shahar yoki tuman nomini kiriting.";
    }
    if (values.btsPoint.trim().length < 5) {
        errors.btsPoint = "Eng yaqin BTS pochta punktini aniqroq yozing.";
    }

    return errors;
}

export function BookPurchasePage({ book }: BookPurchasePageProps) {
    const router = useRouter();
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const [values, setValues] = useState<FormValues>(initialValues);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copyStatus, setCopyStatus] = useState<
        "idle" | "copied" | "failed"
    >("idle");

    const subtotal = useMemo(
        () => book.sale.salePrice * values.quantity,
        [book.sale.salePrice, values.quantity],
    );
    const total = subtotal + book.delivery.price;

    const updateField = <K extends keyof FormValues>(
        field: K,
        value: FormValues[K],
    ) => {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextErrors = validateForm(values);
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setCopyStatus("idle");
        setIsModalOpen(true);
    };

    const handleCopyCard = async () => {
        const copied = await copyText(
            MANUAL_PAYMENT_CARD_NUMBER.replace(/\s/g, ""),
        );

        setCopyStatus(copied ? "copied" : "failed");

        window.setTimeout(() => {
            setCopyStatus("idle");
        }, 1800);
    };

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsModalOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isModalOpen]);

    const openTelegram = () => {
        const telegramUsername = values.telegramUsername
            .trim()
            .replace(/^@/, "");

        const message = [
            "Assalomu alaykum!",
            `To‘lov usuli: ${MANUAL_PAYMENT_METHOD}`,
            `Karta: ${MANUAL_PAYMENT_CARD_NUMBER} (${MANUAL_PAYMENT_CARD_HOLDER})`,
            "",
            `Men “${book.title}” kitobini sotib olmoqchiman.`,
            `Kitob soni: ${values.quantity} ta`,
            `Kitoblar narxi: ${formatPrice(subtotal)}`,
            `Yetkazib berish: ${formatPrice(book.delivery.price)}`,
            `Jami: ${formatPrice(total)}`,
            "",
            `Ism-familiya: ${values.fullName.trim()}`,
            `Telefon: ${values.phone.trim()}`,
            `Telegram: @${telegramUsername}`,
            "",
            `Viloyat: ${values.region.trim()}`,
            `Shahar/tuman: ${values.district.trim()}`,
            `Eng yaqin BTS punkti: ${values.btsPoint.trim()}`,
            values.note.trim() ? `Izoh: ${values.note.trim()}` : "",
            "",
            "To‘lovni amalga oshirgach, chekni shu chatga yuboraman.",
        ]
            .filter(Boolean)
            .join("\n");

        const telegramUrl = `https://t.me/${MANUAL_PAYMENT_TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
        window.location.href = telegramUrl;
    };

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <button
                        type="button"
                        aria-label="Kitob sahifasiga qaytish"
                        onClick={() =>
                            router.replace(`/kitoblar/${book.slug}`)
                        }
                    >
                        ←
                    </button>
                    <div>
                        <span>KITOBNI SOTIB OLISH</span>
                        <strong>{book.title}</strong>
                    </div>
                </header>

                <section className={styles.summary}>
                    <BookCoverPlaceholder
                        title={book.title}
                        badge={book.badge}
                        compact
                    />
                    <div>
                        <span>{book.author}</span>
                        <h1>{book.title}</h1>
                        <p>{book.shortDescription}</p>
                    </div>
                </section>

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <section className={styles.section}>
                        <span className={styles.sectionLabel}>01 · XARIDOR</span>
                        <h2>Ma’lumotlaringiz</h2>

                        <div className={styles.fields}>
                            <label>
                                <span>Ism va familiya</span>
                                <input
                                    value={values.fullName}
                                    onChange={(event) =>
                                        updateField("fullName", event.target.value)
                                    }
                                    placeholder="Masalan: Ali Valiyev"
                                    autoComplete="name"
                                    aria-invalid={Boolean(errors.fullName)}
                                />
                                {errors.fullName ? <small>{errors.fullName}</small> : null}
                            </label>

                            <label>
                                <span>Telefon raqami</span>
                                <input
                                    type="tel"
                                    value={values.phone}
                                    onChange={(event) =>
                                        updateField("phone", event.target.value)
                                    }
                                    placeholder="+998 90 123 45 67"
                                    autoComplete="tel"
                                    aria-invalid={Boolean(errors.phone)}
                                />
                                {errors.phone ? <small>{errors.phone}</small> : null}
                            </label>

                            <label>
                                <span>Telegram foydalanuvchi nomi</span>
                                <input
                                    value={values.telegramUsername}
                                    onChange={(event) =>
                                        updateField(
                                            "telegramUsername",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="@username"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    aria-invalid={Boolean(errors.telegramUsername)}
                                />
                                {errors.telegramUsername ? (
                                    <small>{errors.telegramUsername}</small>
                                ) : null}
                            </label>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <span className={styles.sectionLabel}>02 · YETKAZIB BERISH</span>
                        <h2>BTS pochta punkti</h2>
                        <p>
                            Sizga eng yaqin BTS pochta punktini aniq yozing.
                        </p>

                        <div className={styles.fields}>
                            <label>
                                <span>Viloyat</span>
                                <input
                                    value={values.region}
                                    onChange={(event) =>
                                        updateField("region", event.target.value)
                                    }
                                    placeholder="Masalan: Navoiy viloyati"
                                    aria-invalid={Boolean(errors.region)}
                                />
                                {errors.region ? <small>{errors.region}</small> : null}
                            </label>

                            <label>
                                <span>Shahar yoki tuman</span>
                                <input
                                    value={values.district}
                                    onChange={(event) =>
                                        updateField("district", event.target.value)
                                    }
                                    placeholder="Masalan: Navoiy shahri"
                                    aria-invalid={Boolean(errors.district)}
                                />
                                {errors.district ? <small>{errors.district}</small> : null}
                            </label>

                            <label>
                                <span>Eng yaqin BTS pochta punkti</span>
                                <input
                                    value={values.btsPoint}
                                    onChange={(event) =>
                                        updateField("btsPoint", event.target.value)
                                    }
                                    placeholder="Masalan: Navoiy markaziy BTS punkti"
                                    aria-invalid={Boolean(errors.btsPoint)}
                                />
                                <em>
                                    Punkt nomi, ko‘cha yoki mo‘ljalni imkon qadar aniq yozing.
                                </em>
                                {errors.btsPoint ? <small>{errors.btsPoint}</small> : null}
                            </label>

                            <label>
                                <span>Qo‘shimcha izoh</span>
                                <textarea
                                    value={values.note}
                                    onChange={(event) =>
                                        updateField("note", event.target.value)
                                    }
                                    placeholder="Ixtiyoriy"
                                    rows={3}
                                />
                            </label>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <span className={styles.sectionLabel}>03 · BUYURTMA</span>
                        <h2>Buyurtma xulosasi</h2>

                        <div className={styles.quantityRow}>
                            <span>Kitob soni</span>
                            <div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateField(
                                            "quantity",
                                            Math.max(1, values.quantity - 1),
                                        )
                                    }
                                    aria-label="Kitob sonini kamaytirish"
                                >
                                    −
                                </button>
                                <strong>{values.quantity}</strong>
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateField(
                                            "quantity",
                                            Math.min(10, values.quantity + 1),
                                        )
                                    }
                                    aria-label="Kitob sonini oshirish"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <dl className={styles.orderSummary}>
                            <div><dt>Kitoblar</dt><dd>{formatPrice(subtotal)}</dd></div>
                            <div><dt>Yetkazib berish</dt><dd>{formatPrice(book.delivery.price)}</dd></div>
                            <div className={styles.totalRow}><dt>Jami</dt><dd>{formatPrice(total)}</dd></div>
                        </dl>
                    </section>

                    <button type="submit" className={styles.submitButton}>
                        <span>Buyurtmani tekshirish</span>
                        <strong>{formatPrice(total)}</strong>
                    </button>
                </form>
            </div>

            {isModalOpen ? (
                <div
                    className={styles.modalBackdrop}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target) {
                            setIsModalOpen(false);
                        }
                    }}
                >
                    <section
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="book-payment-title"
                    >
                        <div className={styles.modalHandle} />

                        <header className={styles.modalHeader}>
                            <div>
                                <span className={styles.modalEyebrow}>
                                    TO‘LOV MA’LUMOTLARI
                                </span>
                                <h2 id="book-payment-title">
                                    “{book.title}” kitobini sotib olish
                                </h2>
                            </div>

                            <button
                                ref={closeButtonRef}
                                type="button"
                                className={styles.modalClose}
                                aria-label="Modalni yopish"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <CloseIcon />
                            </button>
                        </header>

                        <div className={styles.modalOrderGrid}>
                            <div>
                                <span>Kitob soni</span>
                                <strong>{values.quantity} ta</strong>
                            </div>

                            <div>
                                <span>Jami to‘lov</span>
                                <strong>{formatPrice(total)}</strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={styles.cardBox}
                            onClick={handleCopyCard}
                        >
                            <span className={styles.cardTop}>
                                <span>DEMO KARTA</span>
                                <CopyIcon />
                            </span>

                            <strong>{MANUAL_PAYMENT_CARD_NUMBER}</strong>

                            <span className={styles.cardBottom}>
                                <span>{MANUAL_PAYMENT_CARD_HOLDER}</span>
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
                            ma’lumoti. Haqiqiy to‘lov qabul qilmaydi.
                            Ishga tushirishdan oldin administratorning
                            haqiqiy karta ma’lumotlari bilan almashtiring.
                        </p>

                        <button
                            type="button"
                            className={styles.telegramButton}
                            onClick={openTelegram}
                        >
                            Telegram orqali tasdiqlash
                        </button>

                        <p className={styles.modalHelper}>
                            To‘lov qilgandan keyin chekni
                            <strong> @{MANUAL_PAYMENT_TELEGRAM_USERNAME}</strong>
                            ga yuboring. Kitob, miqdor, manzil va summa
                            xabarga avtomatik qo‘shiladi.
                        </p>
                    </section>
                </div>
            ) : null}
        </main>
    );
}
