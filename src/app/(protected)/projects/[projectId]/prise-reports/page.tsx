"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { regions } from "./types";

import React, { ReactEventHandler, useEffect } from "react";
import styles from "./prise-reports.module.scss";

const page = () => {
  const searchParams = useSearchParams();
  const region = searchParams.get("region") ?? "";
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (region.length === 0 || !regions.some((val) => region === val.value)) {
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
    </div>
  );
};

export default page;
