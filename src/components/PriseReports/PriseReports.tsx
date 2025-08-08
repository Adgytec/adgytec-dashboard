import { useContext, useEffect, useMemo, useState } from "react";
import {
  PriseReportItem,
  PriseReportsProps,
  getRegionDisplayValue,
} from "./types";
import { UserContext } from "../AuthContext/authContext";
import styles from "./prise-reports.module.scss";
import Loader from "../Loader/Loader";
import { toast } from "react-toastify";
import PriseReportItemComp from "./PriseReportItem";

const PriseReports = ({ region, projectId }: PriseReportsProps) => {
  const userWithRole = useContext(UserContext);
  const user = useMemo(() => {
    return userWithRole ? userWithRole.user : null;
  }, [userWithRole]);

  const [loading, setLoading] = useState(true);

  const [reportItems, setReportItems] = useState<PriseReportItem[]>([]);

  const getPriseReportByRegion = async () => {
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
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getPriseReportByRegion();
  }, []);

  return (
    <div className={styles["container"]} data-load={loading}>
      {loading ? (
        <Loader />
      ) : (
        <div className={styles.table}>
          <div className={styles.table_heading}>
            <h4>No.</h4>
            <h4>Region</h4>
            <h4>Ouvrage</h4>
            <h4>Territoire</h4>
            <h4>Coordonnées</h4>
            <h4>Infrastructures</h4>
            <h4>{"Lieu d'implantation"}</h4>
            <h4>Secteur</h4>
            <h4>{"Site d'intervention"}</h4>
            <h4>Delete</h4>
          </div>

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
        </div>
      )}
    </div>
  );
};

export default PriseReports;
