import React, { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth, signoutUser } from "@/firebase/auth/auth";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader/Loader";

const withAuth = (Component: any) => {
	const AuthenticatedComponent = (props: any) => {
		const [authUser, setAuthUser] = useState<User | null>(null);
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
					}

					setLoading(false);
					setAuthUser(user);
				}
			});

			return () => authState();
		}, []);

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

		return (
			<>
				<Component {...props} user={authUser} />
			</>
		);
	};

	return AuthenticatedComponent;
};

export default withAuth;
