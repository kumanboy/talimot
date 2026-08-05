import type {
    Metadata,
} from "next";

export const metadata: Metadata = {
    title:
        "Admin kirish | TA’LIMOT",
    robots: {
        index: false,
        follow: false,
    },
};

type AdminLoginLayoutProps =
    Readonly<{
        children:
            React.ReactNode;
    }>;

export default function AdminLoginLayout({
    children,
}: AdminLoginLayoutProps) {
    return children;
}
