import { clsx } from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/main.scss";
import "@/styles/core/core.css";
import "@/styles/core/theme/base/base.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import { Bounce, ToastContainer } from "react-toastify";
import ViewPort from "@/components/ViewPort/ViewPort";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Providers } from "@/components/Providers";

config.autoAddCss = false;

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
                    <ToastContainer
                        stacked
                        position="bottom-right"
                        autoClose={5000}
                        limit={10}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="dark"
                        transition={Bounce}
                    />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
