"use client";

import {
    Tag,
    typography,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { useParams, usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TagGroup, TagList, Text } from "react-aria-components";

import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import {
    type Category,
    ProjectMetadataContext,
} from "./context/projectMetadataContext";
import styles from "./projectId.module.css";

interface ProjectObj {
    projectName: string;
    services: {
        id: string;
        name: string;
    }[];
    categories: Category;
}

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
    const snackbarQueue = useSnackbarQueue();
    const userWithRole = useContext(UserContext);
    const user = useMemo(
        () => (userWithRole ? userWithRole.user : null),
        [userWithRole]
    );

    const params = useParams<{ projectId: string }>();
    const router = useRouter();

    const pathName = usePathname();
    const paths = useMemo(() => pathName.split("/"), [pathName]);

    const [project, setProject] = useState<ProjectObj>();
    const [loading, setLoading] = useState(true);
    const [activePath, setActivePath] = useState<string>("");

    const getMetadataByProjectId = useCallback(async () => {
        const url = `${process.env.NEXT_PUBLIC_API}/client/projects/${params.projectId}/metadata`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        fetch(url, {
            method: "GET",
            headers,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                setProject(res.data);
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => setLoading(false));
    }, [user, params.projectId, snackbarQueue]);

    useEffect(() => {
        getMetadataByProjectId();
    }, [getMetadataByProjectId]);

    useEffect(() => {
        const services = project?.services;
        if (!services) return;

        services.forEach((service) => {
            const active = paths.includes(service.name);
            if (active) setActivePath(service.name);
        });
    }, [project, paths]);

    if (loading) {
        return (
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                    minBlockSize: "50svb",
                }}
            >
                <Loader />
            </div>
        );
    }

    const serviceRedirect = (service: string) => {
        setActivePath(service);
        router.push(`/projects/${params.projectId}/${service}`);
    };

    return (
        <div className={clsx(styles["project"])}>
            {project && project.services.length > 0 && (
                <TagGroup
                    selectedKeys={[activePath]}
                    selectionMode="single"
                    selectionBehavior="replace"
                    onSelectionChange={(keys) => {
                        if (keys === "all") return;

                        const service = keys.values().next().value;
                        if (typeof service === "string") {
                            serviceRedirect(service);
                        }
                    }}
                    onAction={(key) => {
                        if (typeof key === "string") serviceRedirect(key);
                    }}
                    className={clsx(styles["services-group"])}
                >
                    <TagList
                        items={project.services}
                        className={clsx(styles["services"])}
                    >
                        {(service) => (
                            <Tag id={service.name} label={service.name} />
                        )}
                    </TagList>
                </TagGroup>
            )}

            {project ? (
                <ProjectMetadataContext.Provider
                    value={{
                        categories: project.categories,
                    }}
                >
                    {children}
                </ProjectMetadataContext.Provider>
            ) : (
                <div>
                    <Text className={clsx(typography.bodyLargeEmphasized)}>
                        Something went wrong. Please refresh the page and try
                        again. If the problem persists, contact us at{" "}
                        <a
                            href="mailto:info@adgytec.in"
                            data-type="link"
                            data-variant="secondary"
                        >
                            info@adgytec.in
                        </a>
                        .
                    </Text>
                </div>
            )}
        </div>
    );
};

export default ProjectLayout;
