import { AppBarStateContext } from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { type ReactNode, useContext } from "react";
import { Header } from "@/components/Header";
import { useNavigationDocked } from "@/hooks/useNavigationDocked";
import { ScaffoldContent } from "../ScaffoldContent";
import styles from "./scaffold.module.css";

export const Scaffold: React.FC<{ children?: ReactNode }> = ({ children }) => {
    const appBarState = useContext(AppBarStateContext);
    const isNavigationDocked = useNavigationDocked();

    return (
        <div
            className={clsx(styles["scaffold"])}
            onScroll={(e) => {
                appBarState?.updateScrolling(e.currentTarget.scrollTop > 25);
            }}
        >
            <div className={clsx(styles["blob3"])} />
            {isNavigationDocked && (
                <aside className={clsx(styles["docked-navigation"])}>
                    docked navigation render
                </aside>
            )}

            <div className={clsx(styles["main"])}>
                <Header />

                <ScaffoldContent>{children}</ScaffoldContent>
            </div>
        </div>
    );
};
