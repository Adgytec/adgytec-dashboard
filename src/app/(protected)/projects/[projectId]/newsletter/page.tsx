"use client";

import { useParams } from "next/navigation";
import React from "react";

const Newsletter = () => {
	const params = useParams<{ projectId: string }>();
	return <div>Newsletter</div>;
};

export default Newsletter;
