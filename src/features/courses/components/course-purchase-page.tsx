"use client";

import Image from "next/image";
import {
    FormEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    useRouter,
} from "next/navigation";

import type {
    CourseDefinition,
} from "@/features/courses/model/course-types";

import {
    CourseSaleCountdown,
} from "./course-sale-countdown";

import styles from "./course-purchase-page.module.css";

type CoursePurchasePageProps = {
    readonly course: CourseDefinition;
};

type PurchaseFormValues = {
    readonly fullName: string;
    readonly phone: string;
    readonly telegramUsername: string;
};

type PurchaseFormErrors = Partial<
    Record<keyof PurchaseFormValues, string>
>;

const initialValues: PurchaseFormValues = {
    fullName: "",
    phone: "",
    telegramUsername: "",
};

function formatPrice(
    value: number,
): string {
    return `${new Intl.NumberFormat(
        "uz-UZ",
    ).format(value)} so‘m`;
}

function normalizePhone(
    value: string,
): string {
    return value.replace(
        /[^\d+\s()-]/g,
        "",
    );
}

function validateForm(
    values: PurchaseFormValues,
): PurchaseFormErrors {
    const errors: PurchaseFormErrors = {};

    if (
        values.fullName.trim().length < 5
    ) {
        errors.fullName =
            "Ism va familiyangizni to‘liq kiriting.";
    }

    const phoneDigits =
        values.phone.replace(
            /\D/g,
            "",
        );

    if (phoneDigits.length < 9) {
        errors.phone =
            "Telefon raqamingizni to‘liq kiriting.";
    }

    const telegramUsername =
        values.telegramUsername
            .trim()
            .replace(/^@/, "");

    if (telegramUsername.length < 5) {
        errors.telegramUsername =
            "Telegram foydalanuvchi nomini kiriting.";
    }

    return errors;
}

function BackIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
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

const TELEGRAM_SUPPORT_USERNAME = "husan_davronov";
const DEMO_CARD_NUMBER = "8600 0000 0000 0000";
const DEMO_CARD_OWNER = "TA’LIMOT DEMO";

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

function createTelegramPurchaseUrl({
    courseTitle,
    price,
    fullName,
    phone,
    telegramUsername,
}: {
    readonly courseTitle: string;
    readonly price: string;
    readonly fullName: string;
    readonly phone: string;
    readonly telegramUsername: string;
}): string {
    const normalizedTelegram = telegramUsername.trim().replace(/^@/, "");
    const message = [
        "Assalomu alaykum!",
        `Men “${courseTitle}” kursini ${price} narxda sotib olmoqchiman.`,
        "",
        `Ism-familiya: ${fullName.trim()}`,
        `Telefon raqami: ${phone.trim()}`,
        `Telegram: @${normalizedTelegram}`,
        "",
        "To‘lovni amalga oshirgach, chekni shu chatga yuboraman.",
    ].join("\n");

    return `https://t.me/${TELEGRAM_SUPPORT_USERNAME}?text=${encodeURIComponent(message)}`;
}

export function CoursePurchasePage({
    course,
}: CoursePurchasePageProps) {
    const router = useRouter();

    const [values, setValues] =
        useState<PurchaseFormValues>(
            initialValues,
        );

    const [errors, setErrors] =
        useState<PurchaseFormErrors>({});

    const [isPaymentModalOpen, setIsPaymentModalOpen] =
        useState(false);

    const [copyStatus, setCopyStatus] = useState<
        "idle" | "copied" | "failed"
    >("idle");

    const savings = useMemo(
        () =>
            Math.max(
                0,
                course.sale.originalPrice -
                    course.sale.salePrice,
            ),
        [
            course.sale.originalPrice,
            course.sale.salePrice,
        ],
    );

    const updateField = (
        field: keyof PurchaseFormValues,
        value: string,
    ) => {
        const nextValue =
            field === "phone"
                ? normalizePhone(value)
                : value;

        setValues((current) => ({
            ...current,
            [field]: nextValue,
        }));

        setErrors((current) => ({
            ...current,
            [field]: undefined,
        }));

        setIsPaymentModalOpen(false);
    };

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const nextErrors =
            validateForm(values);

        setErrors(nextErrors);

        if (
            Object.keys(nextErrors).length > 0
        ) {
            return;
        }

        setCopyStatus("idle");
        setIsPaymentModalOpen(true);
    };

    const handleCopyCard = async () => {
        const copied = await copyText(
            DEMO_CARD_NUMBER.replace(/\s/g, ""),
        );

        setCopyStatus(copied ? "copied" : "failed");

        window.setTimeout(() => {
            setCopyStatus("idle");
        }, 1800);
    };

    useEffect(() => {
        if (!isPaymentModalOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsPaymentModalOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isPaymentModalOpen]);

    const continueInTelegram = () => {
        const telegramUrl = createTelegramPurchaseUrl({
            courseTitle: course.title,
            price: formatPrice(course.sale.salePrice),
            fullName: values.fullName,
            phone: values.phone,
            telegramUsername: values.telegramUsername,
        });

        window.location.href = telegramUrl;
    };

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <button
                        type="button"
                        aria-label="Kurs sahifasiga qaytish"
                        onClick={() =>
                            router.replace(
                                `/kurslar/${course.slug}`,
                            )
                        }
                    >
                        <BackIcon />
                    </button>

                    <div>
                        <span>KURSNI SOTIB OLISH</span>
                        <strong>{course.title}</strong>
                    </div>
                </header>

                <section className={styles.courseSummary}>
                    <div className={styles.cover}>
                        <Image
                            src={course.coverImage}
                            alt={course.coverImageAlt}
                            fill
                            priority
                            sizes="92px"
                        />
                    </div>

                    <div className={styles.courseCopy}>
                        <span>{course.badge}</span>
                        <h1>{course.title}</h1>
                        <p>{course.shortDescription}</p>
                    </div>
                </section>

                <section className={styles.saleCard}>
                    <div className={styles.priceRow}>
                        <div>
                            <span>AKSIYA NARXI</span>
                            <del>
                                {formatPrice(
                                    course.sale.originalPrice,
                                )}
                            </del>
                            <strong>
                                {formatPrice(
                                    course.sale.salePrice,
                                )}
                            </strong>
                        </div>

                        <small>
                            {formatPrice(savings)} tejaysiz
                        </small>
                    </div>

                    <CourseSaleCountdown
                        endsAt={course.sale.endsAt}
                    />
                </section>

                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <section className={styles.section}>
                        <span className={styles.sectionLabel}>
                            01 · XARIDOR MA’LUMOTLARI
                        </span>
                        <h2>Ma’lumotlaringizni kiriting</h2>
                        <p>
                            Administrator to‘lovni tekshirish va sizni yopiq
                            Telegram kanaliga qo‘shish uchun ushbu
                            ma’lumotlardan foydalanadi.
                        </p>

                        <div className={styles.fields}>
                            <label>
                                <span>Ism va familiya</span>
                                <input
                                    type="text"
                                    value={values.fullName}
                                    placeholder="Masalan: Ali Valiyev"
                                    autoComplete="name"
                                    aria-invalid={Boolean(errors.fullName)}
                                    aria-describedby={
                                        errors.fullName
                                            ? "purchase-full-name-error"
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "fullName",
                                            event.target.value,
                                        )
                                    }
                                />
                                {errors.fullName ? (
                                    <small
                                        id="purchase-full-name-error"
                                        className={styles.fieldError}
                                    >
                                        {errors.fullName}
                                    </small>
                                ) : null}
                            </label>

                            <label>
                                <span>Telefon raqami</span>
                                <input
                                    type="tel"
                                    value={values.phone}
                                    placeholder="+998 90 123 45 67"
                                    autoComplete="tel"
                                    inputMode="tel"
                                    aria-invalid={Boolean(errors.phone)}
                                    aria-describedby={
                                        errors.phone
                                            ? "purchase-phone-error"
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "phone",
                                            event.target.value,
                                        )
                                    }
                                />
                                {errors.phone ? (
                                    <small
                                        id="purchase-phone-error"
                                        className={styles.fieldError}
                                    >
                                        {errors.phone}
                                    </small>
                                ) : null}
                            </label>

                            <label>
                                <span>Telegram foydalanuvchi nomi</span>
                                <input
                                    type="text"
                                    value={values.telegramUsername}
                                    placeholder="@username"
                                    autoComplete="off"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    aria-invalid={Boolean(
                                        errors.telegramUsername,
                                    )}
                                    aria-describedby={
                                        errors.telegramUsername
                                            ? "purchase-telegram-error"
                                            : undefined
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "telegramUsername",
                                            event.target.value,
                                        )
                                    }
                                />
                                {errors.telegramUsername ? (
                                    <small
                                        id="purchase-telegram-error"
                                        className={styles.fieldError}
                                    >
                                        {errors.telegramUsername}
                                    </small>
                                ) : null}
                            </label>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <span className={styles.sectionLabel}>
                            02 · TO‘LOV USULI
                        </span>
                        <h2>Bank kartasi orqali to‘lov</h2>

                        <label className={styles.paymentMethod}>
                            <input
                                type="radio"
                                name="payment-method"
                                defaultChecked
                            />
                            <span className={styles.radioVisual} />
                            <span>
                                <strong>Karta orqali o‘tkazma</strong>
                                <small>
                                    To‘lov rekvizitlari keyingi bosqichda
                                    ko‘rsatiladi.
                                </small>
                            </span>
                        </label>

                        <div className={styles.paymentNotice}>
                            <strong>To‘lovdan keyin nima bo‘ladi?</strong>
                            <ol>
                                <li>To‘lov ma’lumotlari yuboriladi.</li>
                                <li>Administrator to‘lovni tekshiradi.</li>
                                <li>
                                    Siz yopiq Telegram kanaliga qo‘shilasiz.
                                </li>
                            </ol>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <span className={styles.sectionLabel}>
                            03 · BUYURTMA XULOSASI
                        </span>
                        <h2>Xarid tarkibi</h2>

                        <dl className={styles.orderSummary}>
                            <div>
                                <dt>Kurs</dt>
                                <dd>{course.title}</dd>
                            </div>
                            <div>
                                <dt>Foydalanish</dt>
                                <dd>{course.accessDurationLabel}</dd>
                            </div>
                            <div>
                                <dt>Oddiy narx</dt>
                                <dd>
                                    <del>
                                        {formatPrice(
                                            course.sale.originalPrice,
                                        )}
                                    </del>
                                </dd>
                            </div>
                            <div className={styles.totalRow}>
                                <dt>Jami</dt>
                                <dd>
                                    {formatPrice(
                                        course.sale.salePrice,
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        <span>Buyurtmani tekshirish</span>
                        <strong>
                            {formatPrice(
                                course.sale.salePrice,
                            )}
                        </strong>
                    </button>

                    <p className={styles.legalNote}>
                        Tugmani bosish orqali ma’lumotlaringiz to‘g‘riligini
                        tasdiqlaysiz. To‘lov rekvizitlari modal oynada
                        ko‘rsatiladi.
                    </p>
                </form>
            </div>

            {isPaymentModalOpen ? (
                <div
                    className={styles.modalBackdrop}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsPaymentModalOpen(false);
                        }
                    }}
                >
                    <section
                        className={styles.paymentModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="course-payment-modal-title"
                    >
                        <div className={styles.modalHandle} />

                        <header className={styles.modalHeader}>
                            <div>
                                <span className={styles.modalEyebrow}>
                                    TO‘LOV MA’LUMOTLARI
                                </span>
                                <h2 id="course-payment-modal-title">
                                    “{course.title}” kursini sotib olish
                                </h2>
                            </div>

                            <button
                                type="button"
                                className={styles.modalCloseButton}
                                aria-label="To‘lov oynasini yopish"
                                onClick={() =>
                                    setIsPaymentModalOpen(false)
                                }
                            >
                                <CloseIcon />
                            </button>
                        </header>

                        <div className={styles.modalOrderGrid}>
                            <div>
                                <span>Kurs</span>
                                <strong>{course.title}</strong>
                            </div>

                            <div>
                                <span>To‘lov summasi</span>
                                <strong>
                                    {formatPrice(course.sale.salePrice)}
                                </strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={styles.cardDetails}
                            onClick={handleCopyCard}
                        >
                            <span className={styles.cardTop}>
                                <span>DEMO KARTA</span>
                                <CopyIcon />
                            </span>

                            <strong>{DEMO_CARD_NUMBER}</strong>

                            <span className={styles.cardBottom}>
                                <span>{DEMO_CARD_OWNER}</span>
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
                            onClick={continueInTelegram}
                        >
                            Telegram orqali tasdiqlash
                        </button>

                        <p className={styles.modalHelper}>
                            To‘lov qilgandan keyin chekni
                            <strong> @{TELEGRAM_SUPPORT_USERNAME}</strong>
                            ga yuboring. Kurs nomi, narxi va
                            foydalanuvchi ma’lumotlari xabarga
                            avtomatik qo‘shiladi.
                        </p>
                    </section>
                </div>
            ) : null}
        </main>
    );
}
