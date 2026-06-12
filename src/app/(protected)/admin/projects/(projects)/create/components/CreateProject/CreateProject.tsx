"use client";

import {
    Button,
    IconButton,
    Input,
    typography,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { ImagePlus, Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { FileTrigger, Form, Heading } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { UserContext } from "@/components/AuthContext/authContext";
import {
    ProjectNameMinLength,
    type ValidationErrors,
} from "@/helpers/validation";
import styles from "./createProject.module.css";

const CreateProjectSchema = z.object({
    projectName: z.string().min(ProjectNameMinLength),
});

export const CreateProject = () => {
    const userWithRole = useContext(UserContext);
    const user = userWithRole ? userWithRole.user : null;

    const snackbarQueue = useSnackbarQueue();

    const [logo, setLogo] = useState<{
        file: File;
        url: string;
    } | null>(null);

    const {
        value: isCreating,
        setTrue: startCreating,
        setFalse: stopCreating,
    } = useBoolean();

    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );

    const createNewProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const reset = e.currentTarget.reset;
        const result = validateAndGetFormValues(
            e.currentTarget,
            CreateProjectSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        if (logo === null) {
            snackbarQueue.add({ supportingText: "No project logo selected." });
            return;
        }

        setFieldErr(undefined);
        startCreating();

        const { projectName } = result.data;

        const url = `${process.env.NEXT_PUBLIC_API}/project`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const formData = new FormData();
        formData.append("projectName", projectName);
        formData.append("cover", logo.file);

        fetch(url, {
            method: "POST",
            headers,
            body: formData,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                snackbarQueue.add(
                    {
                        supportingText: "Successfully created the project",
                    },
                    { timeout: 5000 }
                );

                reset();
                setLogo(null);
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(stopCreating);
    };

    return (
        <div className={clsx(styles["container"])}>
            <Heading
                className={clsx(styles["heading"], typography.headlineMedium)}
            >
                Create Project
            </Heading>

            <Form
                className={clsx(styles["form"])}
                validationErrors={fieldErr}
                onSubmit={createNewProject}
            >
                <Input
                    name="projectName"
                    label="Project Name"
                    placeholder="Project Name"
                    isRequired
                    minLength={ProjectNameMinLength}
                    isReadOnly={isCreating}
                />

                <div className={clsx(styles["logo-preview"])}>
                    {!logo && (
                        <FileTrigger
                            acceptedFileTypes={["image/*"]}
                            onSelect={(files) => {
                                if (!files) return;
                                if (files.length < 1) return;

                                const logo = files.item(0);
                                if (!logo) return;

                                const url = URL.createObjectURL(logo);

                                setLogo({
                                    file: logo,
                                    url,
                                });
                            }}
                        >
                            <Button
                                color="text"
                                isDisabled={isCreating}
                                icon={ImagePlus}
                                className={clsx(styles["logo-selection"])}
                            >
                                Add
                            </Button>
                        </FileTrigger>
                    )}

                    {logo && (
                        <IconButton
                            icon={Trash2}
                            color="tonal"
                            className={clsx(styles["logo-remove"])}
                            onPress={() => setLogo(null)}
                            isDisabled={isCreating}
                        />
                    )}

                    {logo && (
                        <img
                            src={logo.url}
                            alt="Project logo"
                            className={clsx(styles["logo"])}
                            height={120}
                        />
                    )}
                </div>

                <div className={clsx(styles["action"])}>
                    <Button type="submit" isPending={isCreating}>
                        Create
                    </Button>
                </div>
            </Form>
        </div>
    );
};
