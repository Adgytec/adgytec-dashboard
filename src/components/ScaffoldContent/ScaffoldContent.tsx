import { AppBarStateContext } from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { type ReactNode, useContext } from "react";
import styles from "./scaffoldContent.module.css";

export const ScaffoldContent: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const appBarState = useContext(AppBarStateContext);

    return (
        <div
            className={clsx(styles["content"])}
            onScroll={(e) =>
                appBarState?.updateScrolling(e.currentTarget.scrollTop > 0)
            }
        >
            {children}
        </div>
    );
};
