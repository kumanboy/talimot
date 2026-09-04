"use client";

import {
    useRef,
    type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type IntentPrefetchLinkProps = {
    readonly href: string;
    readonly className?: string;
    readonly children: ReactNode;
};

/**
 * Avoid prefetching every module card at once. Instead start fetching the
 * specific route as soon as the user shows intent (hover/focus/touch).
 * This is friendlier to mobile data and Supabase while still improving the
 * first tap.
 */
export function IntentPrefetchLink({
    href,
    className,
    children,
}: IntentPrefetchLinkProps) {
    const router = useRouter();
    const prefetchedHrefRef =
        useRef<string | null>(null);

    const prefetch = () => {
        if (
            prefetchedHrefRef.current ===
            href
        ) {
            return;
        }

        prefetchedHrefRef.current = href;
        router.prefetch(href);
    };

    return (
        <Link
            href={href}
            className={className}
            prefetch={false}
            onPointerEnter={prefetch}
            onFocus={prefetch}
            onTouchStart={prefetch}
        >
            {children}
        </Link>
    );
}
