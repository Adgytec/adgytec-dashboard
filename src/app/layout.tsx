import { clsx } from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/main.css";
import "@/styles/core/core.css";
import "@/styles/core/theme/base/base.css";

import { Providers } from "@/components/Providers";
import ViewPort from "@/components/ViewPort/ViewPort";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Adgytec - Dashboard",
    description: "Client management dashboard for Team Adgytec",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={clsx(inter.className)}>
                <Providers>
                    <ViewPort />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
