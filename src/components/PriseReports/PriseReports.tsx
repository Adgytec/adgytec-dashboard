import { useSnackbarQueue } from "@adgytec/adgytec-web-ui-components";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Column, Table, TableBody, TableHeader } from "react-aria-components";
import { UserContext } from "../AuthContext/authContext";
import Loader from "../Loader/Loader";
import PriseReportItemComp from "./PriseReportItem";
import styles from "./prise-reports.module.css";
import type { PriseReportItem, PriseReportsProps } from "./types";

const PriseReports = ({ region, projectId }: PriseReportsProps) => {
    const snackbarQueue = useSnackbarQueue();

    const userWithRole = useContext(UserContext);
    const user = useMemo(() => {
        return userWithRole ? userWithRole.user : null;
    }, [userWithRole]);

    const [loading, setLoading] = useState(true);

    const [reportItems, setReportItems] = useState<PriseReportItem[]>([]);

    const getPriseReportByRegion = useCallback(async () => {
        if (!region) return;

        const url = `${process.env.NEXT_PUBLIC_API}/services/prise-reports/${projectId}/${region}`;
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
                const flattendResponse = res.data.map((item: any) => {
                    const { data, ...rest } = item;
                    return { ...rest, ...data };
                });

                setReportItems(flattendResponse);
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => setLoading(false));
    }, [projectId, region, user, snackbarQueue.add]);

    useEffect(() => {
        getPriseReportByRegion();
    }, [getPriseReportByRegion]);

    return (
        <div className={styles["container"]} data-load={loading}>
            {loading ? (
                <Loader />
            ) : (
                <div className={styles["table-container"]}>
                    <Table aria-label="Prise Reports" className={styles.table}>
                        <TableHeader className={styles.thead}>
                            <Column className={styles.th} isRowHeader>
                                N°
                            </Column>
                            {/* <Column className={styles.th}>Region</Column> */}
                            {/* <Column className={styles.th}>Ouvrage</Column> */}
                            <Column className={styles.th}>Territoire</Column>
                            <Column className={styles.th}>
                                {"Site d'intervention"}
                            </Column>
                            {/* <Column className={styles.th}>Coordonnées</Column> */}
                            <Column className={styles.th}>
                                Infrastructures
                            </Column>
                            {/* <Column className={styles.th}>Lieu d'implantation</Column> */}
                            {/* <Column className={styles.th}>Secteur</Column> */}
                            <Column className={styles.th}>Latitude</Column>
                            <Column className={styles.th}>Longitude</Column>
                            <Column
                                className={styles.th}
                                aria-label="Actions"
                            />
                        </TableHeader>

                        <TableBody className={styles.tbody}>
                            {reportItems.map((reportItem, index) => {
                                return (
                                    <PriseReportItemComp
                                        key={reportItem.id}
                                        projectId={projectId}
                                        ind={index + 1}
                                        setReports={setReportItems}
                                        item={reportItem}
                                    />
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default PriseReports;
