"use client";

import {
    useParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import type React from "react";
import { ReactEventHandler, useContext, useEffect, useMemo } from "react";
import { UserContext } from "@/components/AuthContext/authContext";
import PriseReports from "@/components/PriseReports/PriseReports";
import styles from "./prise-reports.module.scss";
import { regions } from "./types";

const PriseReportPage = () => {
    const searchParams = useSearchParams();
    const region = searchParams.get("region") ?? "";
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams<{ projectId: string }>();

    useEffect(() => {
        if (
            region.length === 0 ||
            !regions.some((val) => region === val.value)
        ) {
            const params = new URLSearchParams();
            params.set("region", regions[0].value);

            router.push(`${pathname}?${params.toString()}`);
        }
    }, [region]);

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams();
        params.set("region", e.target.value);

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className={styles["container"]}>
            <div className={styles["select-region"]}>
                <select onChange={handleRegionChange} defaultValue={region}>
                    {regions.map((val) => {
                        return (
                            <option key={val.value} value={val.value}>
                                {val.displayValue}
                            </option>
                        );
                    })}
                </select>
            </div>

            <PriseReports
                key={region}
                projectId={params.projectId}
                region={region}
            />
        </div>
    );
};

export default PriseReportPage;
