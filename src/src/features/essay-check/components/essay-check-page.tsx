"use client";

import {
    ChangeEvent,
    FormEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
    MobileNavigation,
} from "@/features/home/components/mobile-navigation";

import styles from "./essay-check-page.module.css";

type ReviewType = "ai" | "teacher-ai";

type FormErrors = {
    topic?: string;
    essay?: string;
    images?: string;
};

type SelectedImage = {
    readonly id: string;
    readonly file: File;
    readonly previewUrl: string;
};

const MIN_TYPED_CHARACTERS = 120;
const MIN_IMAGES = 3;
const MAX_IMAGES = 5;
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;

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

function SparkIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 3.5 13.7 8l4.8 1.7-4.8 1.7L12 16l-1.7-4.6-4.8-1.7L10.3 8 12 3.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
            <path
                d="m18.5 15 .8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TeacherIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
                cx="12"
                cy="8"
                r="3.2"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M5.8 19.5a6.4 6.4 0 0 1 12.4 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="m17.2 6.2 1.1 1.1 2.1-2.2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function UploadIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 13.5v5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-5"
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
                d="m7 7 10 10M17 7 7 17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function EssayCheckPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [reviewType, setReviewType] = useState<ReviewType>("ai");
    const [topic, setTopic] = useState("");
    const [essay, setEssay] = useState("");
    const [selectedImages, setSelectedImages] = useState<readonly SelectedImage[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isPrepared, setIsPrepared] = useState(false);

    useEffect(() => {
        return () => {
            selectedImages.forEach((image) => {
                URL.revokeObjectURL(image.previewUrl);
            });
        };
    }, [selectedImages]);

    const wordCount = useMemo(() => {
        const trimmed = essay.trim();
        return trimmed ? trimmed.split(/\s+/).length : 0;
    }, [essay]);

    const reviewPrice = reviewType === "ai"
        ? "Birinchi marta bepul"
        : "6 Tanga";

    const changeReviewType = (nextType: ReviewType) => {
        if (nextType === reviewType) {
            return;
        }

        if (nextType === "ai") {
            selectedImages.forEach((image) => {
                URL.revokeObjectURL(image.previewUrl);
            });
            setSelectedImages([]);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }

        setReviewType(nextType);
        setErrors({});
        setIsPrepared(false);
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const incomingFiles = Array.from(event.target.files ?? []);

        if (incomingFiles.length === 0) {
            return;
        }

        const invalidFileExists = incomingFiles.some(
            (file) => !ACCEPTED_IMAGE_TYPES.includes(
                file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
            ),
        );

        if (invalidFileExists) {
            setErrors((current) => ({
                ...current,
                images: "Faqat JPG, PNG yoki WEBP rasmlarini yuklang.",
            }));
            event.target.value = "";
            return;
        }

        const remainingSlots = MAX_IMAGES - selectedImages.length;
        const filesToAdd = incomingFiles.slice(0, remainingSlots);

        const nextImages = filesToAdd.map((file, index): SelectedImage => ({
            id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setSelectedImages((current) => [
            ...current,
            ...nextImages,
        ]);

        setErrors((current) => ({
            ...current,
            images: incomingFiles.length > remainingSlots
                ? `Ko‘pi bilan ${MAX_IMAGES} ta rasm yuklash mumkin.`
                : undefined,
        }));
        setIsPrepared(false);
        event.target.value = "";
    };

    const removeImage = (imageId: string) => {
        setSelectedImages((current) => {
            const imageToRemove = current.find((image) => image.id === imageId);

            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.previewUrl);
            }

            return current.filter((image) => image.id !== imageId);
        });
        setErrors((current) => ({ ...current, images: undefined }));
        setIsPrepared(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors: FormErrors = {};

        if (topic.trim().length < 10) {
            nextErrors.topic = "Esse mavzusini to‘liqroq kiriting.";
        }

        if (essay.trim().length < MIN_TYPED_CHARACTERS) {
            nextErrors.essay = "Esse matnini to‘liqroq kiriting.";
        }

        if (
            reviewType === "teacher-ai" &&
            selectedImages.length < MIN_IMAGES
        ) {
            nextErrors.images = `Ustoz tekshiruvi uchun kamida ${MIN_IMAGES} ta rasm yuklang.`;
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setIsPrepared(false);
            return;
        }

        setIsPrepared(true);
    };

    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <button
                        type="button"
                        aria-label="Bosh sahifaga qaytish"
                        onClick={() => router.push("/")}
                    >
                        <BackIcon />
                    </button>

                    <div>
                        <span>TA’LIMOT XIZMATI</span>
                        <strong>Esse tekshirish</strong>
                    </div>
                </header>

                <section className={styles.hero}>
                    <span className={styles.heroBadge}>75 BALLIK BAHOLASH</span>
                    <h1>Essengizni tekshirtiring</h1>
                    <p>
                        AI tekshiruvida esse matnini kiriting. Ustoz + AI
                        tekshiruvida matnga qo‘shimcha ravishda 3–5 ta aniq
                        surat yuklang.
                    </p>

                    <div className={styles.heroStats}>
                        <article>
                            <strong>12 ta</strong>
                            <span>baholash mezoni</span>
                        </article>
                        <article>
                            <strong>75 ball</strong>
                            <span>yakuniy natija</span>
                        </article>
                    </div>
                </section>

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <section className={styles.section}>
                        <span className={styles.sectionLabel}>01 · TEKSHIRUV TURI</span>
                        <h2>Kerakli xizmatni tanlang</h2>

                        <div className={styles.reviewOptions}>
                            <label
                                className={[
                                    styles.reviewCard,
                                    reviewType === "ai" ? styles.selectedCard : "",
                                ].filter(Boolean).join(" ")}
                            >
                                <input
                                    type="radio"
                                    name="review-type"
                                    value="ai"
                                    checked={reviewType === "ai"}
                                    onChange={() => changeReviewType("ai")}
                                />
                                <span className={styles.reviewIcon}><SparkIcon /></span>
                                <span className={styles.reviewCopy}>
                                    <strong>AI orqali tekshirish</strong>
                                    <small>Faqat esse matni kiritiladi</small>
                                    <em>Birinchi tekshiruv bepul, keyingisi 2 Tanga</em>
                                </span>
                                <span className={styles.radioMark} aria-hidden="true" />
                            </label>

                            <label
                                className={[
                                    styles.reviewCard,
                                    reviewType === "teacher-ai" ? styles.selectedCard : "",
                                ].filter(Boolean).join(" ")}
                            >
                                <input
                                    type="radio"
                                    name="review-type"
                                    value="teacher-ai"
                                    checked={reviewType === "teacher-ai"}
                                    onChange={() => changeReviewType("teacher-ai")}
                                />
                                <span className={styles.reviewIcon}><TeacherIcon /></span>
                                <span className={styles.reviewCopy}>
                                    <strong>Ustoz + AI tekshiruvi</strong>
                                    <small>Esse matni va 3–5 ta rasm</small>
                                    <em>6 Tanga · 24 soatgacha</em>
                                </span>
                                <span className={styles.radioMark} aria-hidden="true" />
                            </label>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <span className={styles.sectionLabel}>02 · ESSE MAVZUSI</span>
                        <h2>Mavzuni kiriting</h2>
                        <label className={styles.field}>
                            <span>Esse mavzusi</span>
                            <textarea
                                value={topic}
                                rows={3}
                                placeholder="Masalan: Ta’limda zamonaviy texnologiyalarning o‘rni"
                                aria-invalid={Boolean(errors.topic)}
                                onChange={(event) => {
                                    setTopic(event.target.value);
                                    setErrors((current) => ({ ...current, topic: undefined }));
                                    setIsPrepared(false);
                                }}
                            />
                            {errors.topic ? <small>{errors.topic}</small> : null}
                        </label>
                    </section>

                    <section className={styles.section}>
                        <span className={styles.sectionLabel}>03 · ESSE MATNI</span>
                        <h2>Esseni kiriting</h2>

                        <label className={styles.field}>
                            <span>Esse matni</span>
                            <textarea
                                className={styles.essayTextarea}
                                value={essay}
                                rows={12}
                                placeholder="Esseni shu yerga yozing yoki tayyor matnni joylashtiring..."
                                aria-invalid={Boolean(errors.essay)}
                                onChange={(event) => {
                                    setEssay(event.target.value);
                                    setErrors((current) => ({ ...current, essay: undefined }));
                                    setIsPrepared(false);
                                }}
                            />
                            <div className={styles.counterRow}>
                                {errors.essay ? <small>{errors.essay}</small> : <span />}
                                <output>{wordCount} ta so‘z</output>
                            </div>
                        </label>
                    </section>

                    {reviewType === "teacher-ai" ? (
                        <section className={styles.section}>
                            <span className={styles.sectionLabel}>04 · ESSE RASMLARI</span>
                            <h2>3–5 ta rasm yuklang</h2>
                            <p className={styles.sectionDescription}>
                                Har bir sahifa to‘liq, tiniq va o‘qiladigan holatda
                                ko‘rinishi kerak.
                            </p>

                            <label
                                className={[
                                    styles.uploadBox,
                                    selectedImages.length >= MAX_IMAGES
                                        ? styles.uploadBoxDisabled
                                        : "",
                                ].filter(Boolean).join(" ")}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    disabled={selectedImages.length >= MAX_IMAGES}
                                    onChange={handleImageChange}
                                />
                                <span className={styles.uploadIcon}><UploadIcon /></span>
                                <strong>
                                    {selectedImages.length >= MAX_IMAGES
                                        ? "5 ta rasm tanlandi"
                                        : "Rasmlarni tanlang"}
                                </strong>
                                <p>JPG, PNG yoki WEBP. Bir vaqtning o‘zida bir nechta rasm tanlash mumkin.</p>
                                <em>
                                    {selectedImages.length}/{MAX_IMAGES} ta rasm
                                </em>
                            </label>

                            {selectedImages.length > 0 ? (
                                <div
                                    className={styles.imageGrid}
                                    aria-label="Tanlangan esse rasmlari"
                                >
                                    {selectedImages.map((image, index) => (
                                        <article className={styles.imageCard} key={image.id}>
                                            <div className={styles.imagePreview}>
                                                <Image
                                                    src={image.previewUrl}
                                                    alt={`Esse rasmi ${index + 1}`}
                                                    fill
                                                    unoptimized
                                                    sizes="(max-width: 480px) 42vw, 190px"
                                                />
                                            </div>
                                            <div className={styles.imageMeta}>
                                                <span>{index + 1}-rasm</span>
                                                <small>{image.file.name}</small>
                                            </div>
                                            <button
                                                type="button"
                                                aria-label={`${index + 1}-rasmni o‘chirish`}
                                                onClick={() => removeImage(image.id)}
                                            >
                                                <CloseIcon />
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            ) : null}

                            <div className={styles.uploadStatus}>
                                <span>
                                    Kamida {MIN_IMAGES} ta, ko‘pi bilan {MAX_IMAGES} ta rasm
                                </span>
                                <strong>
                                    {selectedImages.length >= MIN_IMAGES
                                        ? "Yetarli"
                                        : `${MIN_IMAGES - selectedImages.length} ta rasm kerak`}
                                </strong>
                            </div>

                            {errors.images ? (
                                <small className={styles.uploadError}>{errors.images}</small>
                            ) : null}
                        </section>
                    ) : null}

                    <section className={styles.summary}>
                        <div>
                            <span>Tanlangan xizmat</span>
                            <strong>
                                {reviewType === "ai"
                                    ? "AI orqali tekshirish"
                                    : "Ustoz + AI tekshiruvi"}
                            </strong>
                        </div>
                        <div>
                            <span>Xizmat narxi</span>
                            <strong>{reviewPrice}</strong>
                        </div>
                        {reviewType === "teacher-ai" ? (
                            <div>
                                <span>Yuklangan rasmlar</span>
                                <strong>{selectedImages.length} ta</strong>
                            </div>
                        ) : null}
                    </section>

                    {isPrepared ? (
                        <section className={styles.notice} role="status" aria-live="polite">
                            <strong>Esse ma’lumotlari tayyor</strong>
                            <p>
                                Hozircha hech qanday Tanga yechilmadi, rasm yuklanmadi
                                va esse serverga yuborilmadi. Keyingi bosqich backend
                                integratsiyasi bilan ulanadi.
                            </p>
                        </section>
                    ) : null}

                    <button type="submit" className={styles.submitButton}>
                        <span>Tekshiruvni tayyorlash</span>
                        <strong>{reviewPrice}</strong>
                    </button>

                    <p className={styles.legalNote}>
                        Ushbu bosqich faqat frontend ma’lumotlarini tayyorlaydi.
                        To‘lov, fayl yuborish va baholash hali amalga oshirilmaydi.
                    </p>
                </form>
            </div>

            <MobileNavigation />
        </main>
    );
}
