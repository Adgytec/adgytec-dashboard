"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { auth, signoutUser } from "@/firebase/auth/auth";
import Loader from "../Loader/Loader";
import { UserContext, type UserWithRole } from "./authContext";

interface AuthProviderProps {
    children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserWithRole | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        const authState = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                const pathName = window.location.pathname;
                router.push(`/login?next=${pathName}`);
            } else {
                if (!user.emailVerified) {
                    await signoutUser();
                    return;
                } else {
                    setLoading(false);

                    const idTokenResult = await user.getIdTokenResult();
                    const role = idTokenResult?.claims.role;

                    setUser({
                        user,
                        role: role as string,
                    });
                }
            }
        });

        return () => authState();
    }, [router]);

    if (loading) {
        return (
            <div
                style={{
                    width: "calc(var(--vw) * 100)",
                    height: "100vb",
                    display: "grid",
                    placeItems: "center",
                }}
            >
                <Loader />
            </div>
        );
    }

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export default AuthProvider;
