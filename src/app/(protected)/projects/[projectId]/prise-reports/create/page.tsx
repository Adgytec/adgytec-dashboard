"use client";

import { FormEvent, useState, useContext } from "react";
import { InputProps, priseReportsInputItems } from "../types";
import styles from "../prise-reports.module.scss";
import Loader from "@/components/Loader/Loader";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

const Input = ({ label, ...props }: InputProps) => {
  return (
    <label className={styles["label"]}>
      <span className={styles["label-text"]}>{label}</span>

      <input {...props} />
    </label>
  );
};

const page = () => {
  const userWithRole = useContext(UserContext);
  const user = userWithRole ? userWithRole.user : null;

  const params = useParams<{ projectId: string }>();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;

    const formdata = new FormData(e.currentTarget);
    let region = "";
    if (formdata.has("region")) {
      region = formdata.get("region")! as string;
    } else {
      toast.error("Region value not found.");
      return;
    }

    setSubmitting(true);
    const url = `${process.env.NEXT_PUBLIC_API}/services/prise-reports/${params.projectId}/${region}`;
    const token = await user?.getIdToken();
    const body = JSON.stringify(Object.fromEntries(formdata.entries()));
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    fetch(url, {
      method: "POST",
      headers,
      body: body,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) throw new Error(res.message);
        toast.success("Successfully created new record");
        form.reset();
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };
  return (
    <div className={styles["container"]}>
      <form onSubmit={handleSubmit} className={styles["form"]}>
        {priseReportsInputItems.map((item) => {
          if (item.elementType === "input") {
            const { elementType, ...inputProps } = item;

            return <Input {...inputProps} key={inputProps.name} />;
          }

          const { elementType, label, options, ...selectProps } = item;

          return (
            <label className={styles["label"]} key={selectProps.name}>
              <span className={styles["label-text"]}>{label}</span>

              <select {...selectProps} className={styles["input"]}>
                {options.map((option) => {
                  return (
                    <option key={option.value} value={option.value}>
                      {option.displayValue}
                    </option>
                  );
                })}
              </select>
            </label>
          );
        })}

        <div className={styles["submit"]}>
          <button
            data-type="button"
            data-variant="secondary"
            disabled={submitting}
            data-disabled={submitting}
          >
            {submitting ? <Loader variant="small" /> : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default page;
