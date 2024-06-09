"use client";

import withAuth from "@/hoc/withAuth";
import React from "react";
import { UserProps } from "./type";

const Home = ({ user }: UserProps) => {
	return <div>hello</div>;
};

export default withAuth(Home);
