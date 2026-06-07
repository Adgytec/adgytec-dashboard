import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./scaffoldContent.module.css";

export const ScaffoldContent: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    return <div className={clsx(styles["content"])}>{children}</div>;
};
