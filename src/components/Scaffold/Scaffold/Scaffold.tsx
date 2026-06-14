import { AppBarStateContext } from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { type ReactNode, useContext, useEffect, useState } from "react";
import type { ProjectType } from "@/app/(protected)/admin/projects/(projects)/components/Project/types";
import { UserContext } from "@/components/AuthContext/authContext";
import { Header } from "@/components/Header";
import { Nav } from "@/components/Nav";
import { useNavigationDocked } from "@/hooks/useNavigationDocked";
import { ScaffoldContent } from "../ScaffoldContent";
import styles from "./scaffold.module.css";

export const Scaffold: React.FC<{ children?: ReactNode }> = ({ children }) => {
    const appBarState = useContext(AppBarStateContext);
    const isNavigationDocked = useNavigationDocked();
    const userWithRole = useContext(UserContext);
    const user = userWithRole?.user;

    const [projects, setProjects] = useState<ProjectType[]>([]);

    useEffect(() => {
        if (!user) return;

        let active = true;

        (async function getProjects() {
            try {
                const url = `${process.env.NEXT_PUBLIC_API}/client/projects`;
                const token = await user.getIdToken();
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const res = await fetch(url, { headers });
                const json = await res.json();

                if (active) {
                    if (json.error) {
                        console.error(json.message);
                    } else if (Array.isArray(json.data)) {
                        setProjects(json.data);
                    }
                }
            } catch (err) {
                console.error("Failed to load user projects:", err);
            }
        })();

        return () => {
            active = false;
        };
    }, [user]);

    return (
        <div
            className={clsx(styles["scaffold"])}
            onScroll={(e) => {
                appBarState?.updateScrolling(e.currentTarget.scrollTop > 24);
            }}
            data-docked-navigation={isNavigationDocked || undefined}
        >
            <div aria-hidden className={styles["blob3"]} />
            {isNavigationDocked && (
                <aside className={clsx(styles["docked-navigation"])}>
                    <Nav projects={projects} />
                </aside>
            )}

            <div className={clsx(styles["main"])}>
                <Header projects={projects} />

                <ScaffoldContent>{children}</ScaffoldContent>
            </div>
        </div>
    );
};
