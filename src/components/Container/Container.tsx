import React from "react";
import styles from "./container.module.scss";

interface ContainerProps {
	type: "normal" | "wide" | "full" | "sm-full" | "lg-full" | "sm-full-wide";
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

const Container = ({ type, children, className, style }: ContainerProps) => {
	const getClassname = (type: string) => {
		switch (type) {
			case "normal":
				return styles.normal;
			case "wide":
				return styles.wide;
			case "full":
				return styles.full;
			case "sm-full":
				return styles.sm_full;
			case "lg-full":
				return styles.lg_full;
			case "sm-full-wide":
				return styles.sm_full_wide;
		}
	};

	return (
		<div
			className={`${getClassname(type)} ${className} ${styles.container}`}
			style={style}
		>
			{children}
		</div>
	);
};

export default Container;
