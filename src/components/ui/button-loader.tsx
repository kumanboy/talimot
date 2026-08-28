import styles from "./button-loader.module.css";

export function ButtonLoader({
    size = "small",
}: {
    readonly size?: "small" | "medium";
}) {
    return (
        <span
            className={[styles.spinner, size === "medium" ? styles.medium : ""]
                .filter(Boolean)
                .join(" ")}
            aria-hidden="true"
        />
    );
}
