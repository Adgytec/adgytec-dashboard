"use client";

import { UserContext } from "@/components/AuthContext/authContext";
import Container from "@/components/Container/Container";
import Loader from "@/components/Loader/Loader";
import React, { useContext, useEffect, useState } from "react";

interface AdminLayoutProps {
	children: React.ReactNode;
}
const AdminLayout = ({ children }: AdminLayoutProps) => {
	const user = useContext(UserContext);
	const [role, setRole] = useState<string>("");

	useEffect(() => {
		(async function getRole() {
			const idResult = await user?.getIdTokenResult();
			let role = idResult?.claims.role;

			if (!role) {
				setRole("");
				return;
			}

			setRole(role as string);
		})();
	}, [user]);

	if (role === "") {
		return (
			<div
				style={{
					position: "absolute",
					inset: "0",
					display: "grid",
					placeItems: "center",
				}}
			>
				<Loader />
			</div>
		);
	}

	if (role === "user") {
		return (
			<Container
				type="normal"
				style={{
					position: "absolute",
					inset: "0",
					display: "grid",
					placeItems: "center",
				}}
			>
				<h1>403 Forbidden</h1>
			</Container>
		);
	}

	return <>{children}</>;
};

export default AdminLayout;
