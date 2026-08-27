import Link from "next/link";

import {
    TestPurchaseButton,
} from "@/features/tests/components/test-purchase-button";

import styles from "./paid-test-access-required.module.css";

type PaidTestAccessRequiredProps = {
    readonly testId: string;
    readonly title: string;
    readonly href: string;
    readonly backHref: string;
    readonly tangaPrice: number;
};

export function PaidTestAccessRequired({
    testId,
    title,
    href,
    backHref,
    tangaPrice,
}: PaidTestAccessRequiredProps) {
    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <span className={styles.badge}>Pullik test</span>

                <h1>{title}</h1>

                <p>
                    Ushbu testni ochish uchun Tanga orqali bir martalik xarid qiling.
                    Xariddan keyin test hisobingizda doimiy ochiq qoladi.
                </p>

                <div className={styles.price}>
                    <span>Test narxi</span>
                    <strong>{tangaPrice} Tanga</strong>
                </div>

                <TestPurchaseButton
                    testId={testId}
                    title={title}
                    href={href}
                    price={tangaPrice}
                    className={styles.purchaseButton}
                >
                    Sotib olish · {tangaPrice} Tanga
                </TestPurchaseButton>

                <Link className={styles.backLink} href={backHref}>
                    Testlar ro‘yxatiga qaytish
                </Link>
            </section>
        </main>
    );
}
