import {
    ActionDialog,
    Button,
    Modal,
    ModalOverlay,
    typography,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { ImageUp } from "lucide-react";
import { useContext, useState } from "react";
import { FileTrigger } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import { UserContext } from "@/components/AuthContext/authContext";
import { useBlogActions } from "../../context";
import styles from "./updateBlogCover.module.css";

export const UpdateBlogCover: React.FC<{
    id: string;
    currentCover: string;
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
}> = ({ id, currentCover, isOpen, onOpenChange }) => {
    const userWithRole = useContext(UserContext);
    const currentUser = userWithRole ? userWithRole.user : null;

    const { updateBlog, projectID } = useBlogActions();
    const snackbarQueue = useSnackbarQueue();

    const [formErr, setFormErr] = useState<string | null>(null);

    const [cover, setCover] = useState<{
        file: File;
        url: string;
    } | null>(null);

    const {
        value: isUpdating,
        setTrue: startUpdating,
        setFalse: stopUpdating,
    } = useBoolean();

    const updateCoverImage = async (close: () => void) => {
        if (cover === null) {
            return;
        }

        setFormErr(null);
        startUpdating();

        const url = `${process.env.NEXT_PUBLIC_API}/services/blogs/${projectID}/${id}/cover`;
        const token = await currentUser?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const formData = new FormData();
        formData.append("cover", cover.file);

        fetch(url, {
            method: "PATCH",
            headers,
            body: formData,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                snackbarQueue.add(
                    { supportingText: "Successfully updated blog cover." },
                    {
                        timeout: 5000,
                    }
                );
                updateBlog(id, { cover: cover.url });
                setCover(null);
                close();
            })
            .catch((err) => {
                setFormErr(err.message);
            })
            .finally(() => {
                stopUpdating();
            });
    };

    return (
        <ModalOverlay
            isKeyboardDismissDisabled={isUpdating}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <Modal>
                <ActionDialog
                    divider="all"
                    icon={ImageUp}
                    heading="Update Cover"
                    actions={({ close }) => [
                        <Button
                            key="cancel"
                            slot="close"
                            color="text"
                            isDisabled={isUpdating}
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="save"
                            isPending={isUpdating}
                            isDisabled={cover === null}
                            onPress={() => updateCoverImage(close)}
                        >
                            Update
                        </Button>,
                    ]}
                >
                    <div className={clsx(styles["container"])}>
                        <div className={clsx(styles["select-cover"])}>
                            <FileTrigger
                                acceptedFileTypes={["image/*"]}
                                onSelect={(files) => {
                                    if (!files) return;
                                    if (files.length < 1) return;

                                    const logo = files.item(0);
                                    if (!logo) return;

                                    const url = URL.createObjectURL(logo);

                                    setCover({
                                        file: logo,
                                        url,
                                    });
                                }}
                            >
                                <Button color="text" isDisabled={isUpdating}>
                                    Select
                                </Button>
                            </FileTrigger>
                        </div>

                        <img
                            className={clsx(styles["cover"])}
                            src={
                                cover
                                    ? cover.url
                                    : currentCover || "/fallback-blog.png"
                            }
                            alt=""
                            width={300}
                            height={200}
                        />

                        {formErr && (
                            <p
                                className={clsx(
                                    "error-message",
                                    typography.bodySmall
                                )}
                            >
                                {formErr}
                            </p>
                        )}
                    </div>
                </ActionDialog>
            </Modal>
        </ModalOverlay>
    );
};
