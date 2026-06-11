"use client";

import {
    SearchField,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import { GridList, Text } from "react-aria-components";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { Project, type ProjectType } from "../Project";
import styles from "./projects.module.css";

export const Projects = () => {
    const userWithRole = useContext(UserContext);
    const user = userWithRole ? userWithRole.user : null;

    const [search, setSearch] = useState("");
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const snackbarQueue = useSnackbarQueue();

    useEffect(() => {
        (async function getUsers() {
            const url = `${process.env.NEXT_PUBLIC_API}/client/projects`;
            const token = await user?.getIdToken();
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            fetch(url, {
                headers,
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.error) throw new Error(res.message);

                    setProjects(res.data);
                })
                .catch((err) => {
                    snackbarQueue.add({ supportingText: err.message });
                })
                .finally(() => {
                    setLoading(false);
                });
        })();
    }, [user, snackbarQueue]);

    const projectsToRender: ProjectType[] = [];
    projects.forEach((project) => {
        const { projectName: name } = project;

        if (search.length === 0) {
            projectsToRender.push(project);
            return;
        }

        if (name.toLowerCase().includes(search.toLowerCase())) {
            projectsToRender.push(project);
        }
    });

    return (
        <div className={clsx(styles["projects"])}>
            <div className={clsx(styles["search"])}>
                <SearchField
                    placeholder="Search Projects"
                    value={search}
                    onChange={setSearch}
                />
            </div>

            {loading ? (
                <div
                    style={{
                        display: "grid",
                        placeItems: "center",
                        blockSize: "50dvb",
                    }}
                >
                    <Loader />
                </div>
            ) : projects.length === 0 ? (
                <Text>No user exists</Text>
            ) : projectsToRender.length === 0 ? (
                <Text>
                    There is no user named{" "}
                    <span className="italic">
                        <q>{search}</q>
                    </span>
                </Text>
            ) : (
                <GridList
                    className={clsx(styles["project-list"])}
                    layout="grid"
                    items={projectsToRender}
                >
                    {(project) => <Project project={project} />}
                </GridList>
            )}
        </div>
    );
};
