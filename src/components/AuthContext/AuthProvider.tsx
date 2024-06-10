"use client";

import React, { useEffect, useState } from "react";
import { UserContext } from "./authContext";
import { auth, signoutUser } from "@/firebase/auth/auth";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Loader from "../Loader/Loader";

interface AuthProviderProps {
	children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const router = useRouter();

	useEffect(() => {
		const authState = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				router.push("/login");
			} else {
				if (!user.emailVerified) {
					await signoutUser();
					return;
				} else {
					setLoading(false);
					setUser(user);
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
