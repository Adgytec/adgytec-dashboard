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
import { useParams } from "next/navigation";
import type React from "react";
import { useContext, useState } from "react";
import { FileTrigger, Form, Heading } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { UserContext } from "@/components/AuthContext/authContext";
import type { ValidationErrors } from "@/helpers/validation";
import styles from "./create.module.css";

const AlbumNameMinLength = 3;
const CreateAlbumSchema = z.object({
    name: z.string().min(AlbumNameMinLength),
});

const GalleryCreatePage = () => {
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

    const params = useParams<{ projectId: string }>();

    const createNewAlbum = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const reset = e.currentTarget.reset;
        const result = validateAndGetFormValues(
            e.currentTarget,
            CreateAlbumSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        if (logo === null) {
            snackbarQueue.add({ supportingText: "No album cover selected." });
            return;
        }

        setFieldErr(undefined);
        startCreating();

        const { name } = result.data;

        const url = `${process.env.NEXT_PUBLIC_API}/services/gallery/${params.projectId}/albums`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const formData = new FormData();
        formData.append("name", name);
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
                    { supportingText: "Successfully created the album." },
                    {
                        timeout: 5000,
                    }
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
        <div className={styles["container"]}>
            <Heading
                className={clsx(styles["heading"], typography.headlineMedium)}
            >
                Create Album
            </Heading>

            <Form
                className={clsx(styles["form"])}
                validationErrors={fieldErr}
                onSubmit={createNewAlbum}
            >
                <Input
                    name="name"
                    type="text"
                    label="Album Name"
                    placeholder="Album Name"
                    isRequired
                    isReadOnly={isCreating}
                    minLength={AlbumNameMinLength}
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

export default GalleryCreatePage;
