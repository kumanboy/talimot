"use client";

import {
    useRef,
    type ButtonHTMLAttributes,
    type FocusEvent,
    type PointerEvent,
    type ReactNode,
    type TouchEvent,
} from "react";
import { useRouter } from "next/navigation";

import { ButtonLoader } from "@/components/ui/button-loader";
import { usePendingNavigation } from "@/hooks/use-pending-navigation";

type PendingNavigationButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> & {
    readonly mode?: "push" | "replace" | "back";
    readonly href?: string;
    readonly pendingText?: string;
    readonly children: ReactNode;
};

export function PendingNavigationButton({
    mode = "push",
    href,
    pendingText = "Yuklanmoqda...",
    children,
    disabled,
    onPointerEnter,
    onFocus,
    onTouchStart,
    ...props
}: PendingNavigationButtonProps) {
    const navigation = usePendingNavigation();
    const router = useRouter();
    const prefetchedHrefRef = useRef<string | null>(null);

    const prefetch = () => {
        if (
            mode === "back" ||
            !href ||
            prefetchedHrefRef.current === href
        ) {
            return;
        }

        prefetchedHrefRef.current = href;
        router.prefetch(href);
    };

    const handleClick = () => {
        if (mode === "back") navigation.back();
        else if (mode === "replace" && href) navigation.replace(href);
        else if (href) navigation.push(href);
    };

    const handlePointerEnter = (
        event: PointerEvent<HTMLButtonElement>,
    ) => {
        onPointerEnter?.(event);
        prefetch();
    };

    const handleFocus = (
        event: FocusEvent<HTMLButtonElement>,
    ) => {
        onFocus?.(event);
        prefetch();
    };

    const handleTouchStart = (
        event: TouchEvent<HTMLButtonElement>,
    ) => {
        onTouchStart?.(event);
        prefetch();
    };

    return (
        <button
            {...props}
            type={props.type ?? "button"}
            disabled={disabled || navigation.pending}
            aria-busy={navigation.pending || undefined}
            onPointerEnter={handlePointerEnter}
            onFocus={handleFocus}
            onTouchStart={handleTouchStart}
            onClick={handleClick}
        >
            {navigation.pending ? (
                <>
                    <ButtonLoader />
                    <span>{pendingText}</span>
                </>
            ) : children}
        </button>
    );
}
