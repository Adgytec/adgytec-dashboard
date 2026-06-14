"use client";

import {
    ComboBox,
    ComboBoxPopover,
    ComboBoxTrigger,
    LinkButton,
    SelectItem,
    SelectList,
} from "@adgytec/adgytec-web-ui-components";
import { BadgePlus } from "lucide-react";
import Link from "next/link";
import {
    useParams,
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import PriseReports from "@/components/PriseReports/PriseReports";
import styles from "./prise-reports.module.css";
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
    }, [region, pathname, router]);

    const handleRegionChange = (key: React.Key | null) => {
        if (!key) return;
        const params = new URLSearchParams();
        params.set("region", String(key));

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className={styles["container"]}>
            <div className={styles["select-region"]}>
                <LinkButton
                    href={`/projects/${params.projectId}/prise-reports/create`}
                    icon={BadgePlus}
                    color="tonal"
                    size="medium"
                    render={(props) => {
                        if ("href" in props) {
                            return <Link {...props} />;
                        }
                        return <span {...props} />;
                    }}
                >
                    Add
                </LinkButton>

                <ComboBox
                    aria-label="Region"
                    name="region"
                    value={region}
                    onChange={handleRegionChange}
                >
                    <ComboBoxTrigger placeholder="Select Region" />
                    <ComboBoxPopover>
                        <SelectList items={regions}>
                            {(item) => (
                                <SelectItem
                                    key={item.value}
                                    id={item.value}
                                    label={item.displayValue}
                                />
                            )}
                        </SelectList>
                    </ComboBoxPopover>
                </ComboBox>
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
