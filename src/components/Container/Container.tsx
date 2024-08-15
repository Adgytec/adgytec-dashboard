import React from "react";
import styles from "./container.module.scss";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	type?: "normal" | "wide" | "full" | "sm-full" | "lg-full" | "sm-full-wide";
	children?: React.ReactNode;
	className?: string;
	// style?: React.CSSProperties;
}

const Container = ({
	type,
	children,
	className,
	// style,
	...restProps
}: ContainerProps) => {
	const getClassname = (type: string | undefined) => {
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
			default:
				return styles.normal;
		}
	};

	return (
		<div
			className={`${getClassname(type)} ${className ? className : ""} ${
				styles.container
			}`}
			{...restProps}
		>
			{children}
		</div>
	);
};

export default Container;
