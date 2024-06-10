"use client";

import React, { useContext } from "react";
import styles from "./nav.module.scss";
import { UserContext } from "../AuthContext/authContext";

function Nav() {
	const user = useContext(UserContext);
	return <nav className={styles.nav}>{user?.displayName}</nav>;
}

export default Nav;
