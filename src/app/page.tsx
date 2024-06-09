"use client";

import withAuth from "@/hoc/withAuth";
import React, { useEffect } from "react";
import { UserProps } from "./type";

const Home = ({ user }: UserProps) => {
	useEffect(() => {
		(async function trial() {
			let d = new Date();
			if (user?.metadata.creationTime)
				d = new Date(user.metadata.creationTime);

			console.log(d.toDateString());
		})();
	}, []);
	return <div>hello</div>;
};

export default withAuth(Home);
