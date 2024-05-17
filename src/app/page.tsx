"use client";

import { signin } from "@/firebase/auth/auth";
import React, { useState } from "react";

const email = "rohanverma031@gmail.com";
const password = "{ui}Py3F49";
const remember = false;

const Page = () => {
	const [token, setToken] = useState<string>("");

	const handleLogin = async () => {
		const { user, error } = await signin(email, password, remember);

		if (error) {
			console.error(error.message);
			return;
		}

		if (!user) return;

		const token = await user.user.getIdToken();
		setToken(token);
	};

	return (
		<div>
			{/* Adgytec-Dashboard */}
			<button onClick={handleLogin}>Get id token</button>

			<p>{token}</p>
		</div>
	);
};

export default Page;
