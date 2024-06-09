import React from "react";

import styles from "./loader.module.scss";

interface LoaderProps {
	variant?: "small" | "normal";
}

const Loader = ({ variant }: LoaderProps) => {
	return <span className={styles.loader} data-variant={variant}></span>;
};

export default Loader;
