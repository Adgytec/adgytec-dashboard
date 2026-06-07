"use client";

import {
    AppBarState,
    NavigationState,
} from "@adgytec/adgytec-web-ui-components";
import AuthProvider from "@/components/AuthContext/AuthProvider";
import { Scaffold } from "@/components/Scaffold";

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthProvider>
            <NavigationState>
                <AppBarState>
                    <Scaffold>{children}</Scaffold>
                </AppBarState>
            </NavigationState>
        </AuthProvider>
    );
}
