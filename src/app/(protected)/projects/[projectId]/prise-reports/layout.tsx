"use client";

import LinkHeader, { LinkItem } from "@/components/LinkHeader/LinkHeader";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import styles from "./prise-reports.module.scss";
import Container from "@/components/Container/Container";

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
