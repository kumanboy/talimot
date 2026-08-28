"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

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
    ...props
}: PendingNavigationButtonProps) {
    const navigation = usePendingNavigation();

    const handleClick = () => {
        if (mode === "back") navigation.back();
        else if (mode === "replace" && href) navigation.replace(href);
        else if (href) navigation.push(href);
    };

    return (
        <button
            {...props}
            type={props.type ?? "button"}
            disabled={disabled || navigation.pending}
            aria-busy={navigation.pending || undefined}
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
