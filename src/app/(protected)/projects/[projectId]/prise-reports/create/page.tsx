"use client";

import {
    Button,
    ComboBox,
    ComboBoxPopover,
    ComboBoxTrigger,
    Input,
    SelectItem,
    SelectList,
    typography,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { useContext, useMemo, useState } from "react";
import { Form, Heading } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { UserContext } from "@/components/AuthContext/authContext";
import type { ValidationErrors } from "@/helpers/validation";
import styles from "../prise-reports.module.css";
import { priseReportsInputItems, regions } from "../types";

const CreateReportSchema = z.object({
    region: z.string().min(1, "Region is required"),
    Territoire: z.string().optional(),
    "Site d'intervention": z.string().optional(),
    Infrastructures: z.string().optional(),
    Latitude: z.string().optional(),
    Longitude: z.string().optional(),
});

const PriseReportCreate = () => {
    const snackbarQueue = useSnackbarQueue();

    const userWithRole = useContext(UserContext);
    const user = useMemo(() => {
        return userWithRole ? userWithRole.user : null;
    }, [userWithRole]);

    const params = useParams<{ projectId: string }>();

    const {
        value: submitting,
        setTrue: startSubmitting,
        setFalse: stopSubmitting,
    } = useBoolean();

    const [selectedRegion, setSelectedRegion] = useState<string>("");
    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const result = validateAndGetFormValues(
            e.currentTarget,
            CreateReportSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        setFieldErr(undefined);
        startSubmitting();

        const form = e.currentTarget;
        const region = result.data.region;

        const url = `${process.env.NEXT_PUBLIC_API}/services/prise-reports/${params.projectId}/${region}`;
        const token = await user?.getIdToken();
        const body = JSON.stringify(result.data);
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
                snackbarQueue.add({
                    supportingText: "Successfully created new record",
                });
                form.reset();
                setSelectedRegion("");
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => {
                stopSubmitting();
            });
    };

    return (
        <div className={styles["container"]}>
            <Heading
                className={clsx(styles["heading"], typography.headlineMedium)}
            >
                Create New Report
            </Heading>

            <Form
                onSubmit={handleSubmit}
                className={styles["form"]}
                validationErrors={fieldErr}
            >
                {priseReportsInputItems.map((item) => {
                    if (item.name === "region") {
                        return (
                            <ComboBox
                                key={item.name}
                                label="Region"
                                name="region"
                                isDisabled={submitting}
                                value={selectedRegion}
                                onChange={(key) =>
                                    setSelectedRegion(String(key))
                                }
                                isRequired
                            >
                                <ComboBoxTrigger placeholder="Select Region" />
                                <ComboBoxPopover>
                                    <SelectList items={regions}>
                                        {(reg) => (
                                            <SelectItem
                                                key={reg.value}
                                                id={reg.value}
                                                label={reg.displayValue}
                                            />
                                        )}
                                    </SelectList>
                                </ComboBoxPopover>
                            </ComboBox>
                        );
                    }

                    if (item.elementType === "input") {
                        return (
                            <Input
                                key={item.name}
                                label={item.label}
                                name={item.name}
                                placeholder={item.placeholder}
                                isReadOnly={submitting}
                            />
                        );
                    }

                    return null;
                })}

                <div className={styles["submit"]}>
                    <Button type="submit" isPending={submitting}>
                        Submit
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default PriseReportCreate;
