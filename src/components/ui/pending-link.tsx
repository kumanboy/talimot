"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

import { ButtonLoader } from "@/components/ui/button-loader";
import { usePendingNavigation } from "@/hooks/use-pending-navigation";

type PendingLinkProps = {
    readonly href: string;
    readonly className?: string;
    readonly children: ReactNode;
    readonly pendingText?: string;
    readonly replace?: boolean;
    readonly ariaLabel?: string;
};

export function PendingLink({
    href,
    className,
    children,
    pendingText = "Yuklanmoqda...",
    replace = false,
    ariaLabel,
}: PendingLinkProps) {
    const navigation = usePendingNavigation();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        event.preventDefault();
        if (navigation.pending) return;
        if (replace) navigation.replace(href);
        else navigation.push(href);
    };

    return (
        <Link
            href={href}
            className={className}
            aria-label={ariaLabel}
            aria-busy={navigation.pending || undefined}
            aria-disabled={navigation.pending || undefined}
            onClick={handleClick}
        >
            {navigation.pending ? (
                <>
                    <ButtonLoader />
                    <span>{pendingText}</span>
                </>
            ) : children}
        </Link>
    );
}
