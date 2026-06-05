"use client";

import {
    AppBarState,
    NavigationState,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import AuthProvider from "@/components/AuthContext/AuthProvider";
import { Header } from "@/components/Header/Header";
import { ScaffoldContent } from "@/components/ScaffoldContent";
import { useNavigationDocked } from "@/hooks/useNavigationDocked";
import styles from "./home.module.css";

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const isNavigationDocked = useNavigationDocked();
    const pathname = usePathname();

    return (
        <AuthProvider>
            <NavigationState>
                <div className={clsx(styles["scaffold"])}>
                    {isNavigationDocked && <aside>docked nav render</aside>}

                    <div className={clsx(styles["main"])}>
                        <AppBarState initialScrolling>
                            <Header isNavigationDocked={isNavigationDocked} />

                            <ScaffoldContent>{children}</ScaffoldContent>
                        </AppBarState>
                    </div>
                </div>
            </NavigationState>
        </AuthProvider>
    );
}
