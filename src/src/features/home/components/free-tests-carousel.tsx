"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import styles from "./free-tests-carousel.module.css";

type FreeTestIcon =
    | "verb"
    | "syntax"
    | "morphemics"
    | "scientific"
    | "ghazal"
    | "essay";

type FreeTest = {
    id: string;
    title: string;
    description: string;
    meta: string;
    actionLabel: string;
    href: string;
    icon: FreeTestIcon;
};

const freeTests: readonly FreeTest[] = [
    {
        id: "verb-test",
        title: "Fe’l testi",
        description:
            "Fe’lning shakllari, nisbatlari va vazifa shakllari bo‘yicha bilimingizni tekshiring.",
        meta: "10 ta savol",
        actionLabel: "Testni ishlash",
        href: "/tests/grammatika/morfologiya/fel",
        icon: "verb",
    },
    {
        id: "syntax-test",
        title: "Sintaksis testi",
        description:
            "Gap bo‘laklari, gap turlari va sintaktik bog‘lanishlar bo‘yicha test.",
        meta: "12 ta savol",
        actionLabel: "Testni ishlash",
        href: "/tests/grammatika/sintaksis",
        icon: "syntax",
    },
    {
        id: "morphemics-test",
        title: "Morfemika testi",
        description:
            "O‘zak, qo‘shimcha va so‘z tarkibi bo‘yicha bilimlaringizni sinang.",
        meta: "10 ta savol",
        actionLabel: "Testni ishlash",
        href: "/tests/grammatika/morfemika",
        icon: "morphemics",
    },
    {
        id: "scientific-text-test",
        title: "Ilmiy matn testi",
        description:
            "Matn mazmuni, dalillar va ilmiy uslubni tahlil qilishni mashq qiling.",
        meta: "5 ta savol",
        actionLabel: "Testni ishlash",
        href: "/tests/milliy-sertifikat/ilmiy-matn",
        icon: "scientific",
    },
    {
        id: "ghazal-test",
        title: "G‘azal testi",
        description:
            "Bayt mazmuni, mumtoz so‘zlar va she’riy san’atlarni aniqlang.",
        meta: "5 ta savol",
        actionLabel: "Testni ishlash",
        href: "/tests/milliy-sertifikat/gazal",
        icon: "ghazal",
    },
    {
        id: "free-essay-check",
        title: "Bepul esse tekshirish",
        description:
            "Essengizni yuboring va mezonlar asosidagi dastlabki tahlilni oling.",
        meta: "Bepul tekshiruv",
        actionLabel: "Esseni tekshirtirish",
        href: "/esse-tekshirish",
        icon: "essay",
    },
];

function TestIcon({ type }: { type: FreeTestIcon }) {
    if (type === "verb") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                    d="M7 9h18M7 16h11M7 23h15"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                />
                <path
                    d="m22 14 4 3-4 3"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    if (type === "syntax") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect
                    x="5"
                    y="7"
                    width="22"
                    height="18"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                <path
                    d="M9 12h14M9 17h9M9 22h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "morphemics") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect
                    x="4"
                    y="11"
                    width="8"
                    height="10"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                <rect
                    x="12"
                    y="11"
                    width="8"
                    height="10"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                <rect
                    x="20"
                    y="11"
                    width="8"
                    height="10"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                />
            </svg>
        );
    }

    if (type === "scientific") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                    d="M11 5h10M13 5v8L7 23c-1 2 0 4 3 4h12c3 0 4-2 3-4l-6-10V5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M10 21h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    if (type === "ghazal") {
        return (
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                    d="M8 24c6-1 11-6 14-13 2-4 4-5 6-5-1 6-4 11-9 15-4 3-7 4-11 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                <path
                    d="M7 26h13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
                d="m7 25 3-9L22 4l6 6-12 12-9 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="m19 7 6 6M7 25l7-2-5-5-2 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function FreeTestsCarousel() {
    const router = useRouter();
    const carouselRef = useRef<HTMLDivElement>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const scrollToCard = (
        index: number,
        behavior: ScrollBehavior = "smooth",
    ) => {
        const carousel = carouselRef.current;

        if (!carousel) {
            return;
        }

        const card = carousel.children.item(index);

        if (!(card instanceof HTMLElement)) {
            return;
        }

        carousel.scrollTo({
            left: card.offsetLeft - 16,
            behavior,
        });

        setActiveIndex(index);
    };

    useEffect(() => {
        if (isPaused) {
            return;
        }

        const intervalId = window.setInterval(() => {
            const nextIndex =
                activeIndex === freeTests.length - 1
                    ? 0
                    : activeIndex + 1;

            scrollToCard(nextIndex);
        }, 3000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [activeIndex, isPaused]);

    const handleScroll = () => {
        const carousel = carouselRef.current;

        if (!carousel) {
            return;
        }

        const cards = Array.from(carousel.children).filter(
            (child): child is HTMLElement =>
                child instanceof HTMLElement,
        );

        if (cards.length === 0) {
            return;
        }

        const carouselCenter =
            carousel.scrollLeft + carousel.clientWidth / 2;

        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
            const cardCenter =
                card.offsetLeft + card.offsetWidth / 2;

            const distance = Math.abs(
                carouselCenter - cardCenter,
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });

        setActiveIndex(nearestIndex);
    };

    const handlePointerDown = () => {
        setIsPaused(true);
    };


    const handlePointerUp = () => {
        window.setTimeout(() => {
            setIsPaused(false);
        }, 1300);
    };

    return (
        <section
            className={styles.section}
            aria-labelledby="free-tests-heading"
        >
            <header className={styles.heading}>
                <div>
                    <span>BEPUL IMKONIYATLAR</span>

                    <h2 id="free-tests-heading">
                        Bepul testlar
                    </h2>

                    <p>
                        Testni tanlang, bilimingizni tekshiring va
                        natijangizni oshiring.
                    </p>
                </div>
            </header>

            <div
                ref={carouselRef}
                className={styles.carousel}
                aria-label="Bepul testlar ro‘yxati"
                onScroll={handleScroll}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {freeTests.map((test, index) => (
                    <article
                        key={test.id}
                        className={[
                            styles.card,
                            styles[test.icon],
                            index === activeIndex
                                ? styles.activeCard
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={() => router.push(test.href)}
                    >
                        <div className={styles.accentLine} />

                        <div className={styles.cardTop}>
              <span className={styles.icon}>
                <TestIcon type={test.icon} />
              </span>

                            <span className={styles.freeBadge}>
                <span aria-hidden="true">✓</span>
                BEPUL
              </span>
                        </div>

                        <div className={styles.cardCopy}>
                            <h3>{test.title}</h3>
                            <p>{test.description}</p>
                        </div>

                        <div className={styles.cardFooter}>
              <span className={styles.meta}>
                {test.meta}
              </span>

                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    router.push(test.href);
                                }}
                            >
                                {test.actionLabel}

                                <span
                                    className={styles.buttonArrow}
                                    aria-hidden="true"
                                >
                  →
                </span>
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}