"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth } from "@/firebase/auth/auth";
import { useRouter, usePathname } from "next/navigation";
import Loader from "../Loader/Loader";

interface AuthProps {
	children: React.ReactNode;
}

const Auth = ({ children }: AuthProps) => {
	const router = useRouter();
	const pathName = usePathname();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const authState = onAuthStateChanged(auth, (user) => {
			const isLoginPage = pathName.includes("login");

			// if user existst
			if (user) {
				// if in login page
				if (isLoginPage) router.push("/");
			} else {
				// if not in login and user is not valid
				if (!isLoginPage) router.push("/login");
			}

			setLoading(false);
		});

		return () => authState();
	}, [pathName]);

	if (loading) {
		return (
			<div>
				<Loader />
			</div>
		);
	}

	return <div>Auth</div>;
};

export default Auth;
