"use client";

import { useParams } from "next/navigation";
import type React from "react";
import { useMemo } from "react";
import Container from "@/components/Container/Container";
import LinkHeader, { type LinkItem } from "@/components/LinkHeader/LinkHeader";
import styles from "./prise-reports.module.scss";

interface PriseReportsLayoutProps {
    children: React.ReactNode;
}

const PriseReportsLayout = ({ children }: PriseReportsLayoutProps) => {
    const params = useParams<{ projectId: string }>();
    const linkProps = useMemo(() => {
        return [
            {
                href: `/projects/${params.projectId}/prise-reports`,
                text: "Active Reports",
            },
            {
                href: `/projects/${params.projectId}/prise-reports/create`,
                text: "Create New",
                // view: ["editor", "metadata"],
            },
        ] as LinkItem[];
    }, [params.projectId]);

    return (
        <div className={styles.layout}>
            <LinkHeader links={linkProps} />

            <Container>{children}</Container>
        </div>
    );
};

export default PriseReportsLayout;
