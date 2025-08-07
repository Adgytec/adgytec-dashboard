import { regions } from "@/app/(protected)/projects/[projectId]/prise-reports/types";

export interface PriseReportsProps {
  region: string;
  projectId: string;
}

export interface PriseReportItem {
  id: string;
  createdAt: string; // or Date, if you parse it
  region: string;
  Ouvrage: string;
  Territoire: string;
  Coordonnées: string;
  Infrastructures: string;
  "Lieu d'implantation": string;
  Secteur: string;
  "Site d'intervention": string;
}

export interface PriseReportItemCompProps {
  item: PriseReportItem;
  ind: number;
  projectId: string;
  setReports: React.Dispatch<React.SetStateAction<PriseReportItem[]>>;
}

export const getRegionDisplayValue = (region: string) => {
  const val = regions.find((val) => val.value === region)?.displayValue || "";

  return val;
};
