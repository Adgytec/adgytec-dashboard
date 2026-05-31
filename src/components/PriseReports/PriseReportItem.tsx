import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useContext, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import { UserContext } from "../AuthContext/authContext";
import Loader from "../Loader/Loader";
import { getRegionDisplayValue, type PriseReportItemCompProps } from "./types";
import {
    Button,
    IconButton,
    Input,
    ModalOverlay,
    SideSheet,
    SideSheetModal,
} from "@adgytec/adgytec-web-ui-components";
import { Edit } from "lucide-react";
import { DialogTrigger, Form, Select } from "react-aria-components";
import styles from "./prise-reports.module.scss";

const PriseReportItemComp = ({
    item,
    projectId,
    ind,
    setReports,
}: PriseReportItemCompProps) => {
    const userWithRole = useContext(UserContext);
    const user = useMemo(() => {
        return userWithRole ? userWithRole.user : null;
    }, [userWithRole]);

    const deleteConfirmRef = useRef<HTMLDialogElement | null>(null);
    const handleDeleteModalClose = () => handleModalClose(deleteConfirmRef);

    const [deleting, sepeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setEditing(true);

        const form = e.currentTarget;
        const formdata = new FormData(e.currentTarget);
        const body = JSON.stringify(Object.fromEntries(formdata.entries()));

        const url = `${process.env.NEXT_PUBLIC_API}/services/prise-reports/${projectId}/${item.id}`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        fetch(url, {
            method: "PATCH",
            headers,
            body,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);
                setReports((prev) =>
                    prev.map((report) =>
                        report.id === item.id
                            ? {
                                  ...report,
                                  ...Object.fromEntries(formdata.entries()),
                              }
                            : report
                    )
                );

                window.location.reload();
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => setEditing(false));
    };

    const handleDelete = async () => {
        sepeleting(true);

        const url = `${process.env.NEXT_PUBLIC_API}/services/prise-reports/${projectId}/${item.id}`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        fetch(url, {
            method: "DELETE",
            headers,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);
                setReports((prev) => {
                    const temp = prev;

                    return temp.toSpliced(
                        temp.findIndex((u) => u.id === item.id),
                        1
                    );
                });

                toast.success("successfully deleted record");
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => sepeleting(false));
    };

    return (
        <div>
            {createPortal(
                <>
                    <dialog
                        onKeyDown={handleEscModal}
                        ref={deleteConfirmRef}
                        className="delete-confirm"
                    >
                        <div className="delete-modal">
                            <div className="modal-menu">
                                <h2>Confirm Report Deletion</h2>

                                <button
                                    data-type="link"
                                    onClick={handleDeleteModalClose}
                                    title="close"
                                    disabled={deleting}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            <div className="delete-content">
                                <p>
                                    Are you sure you want to delete this record?
                                </p>

                                <p>
                                    Deleting this record will permanently remove
                                    this record. This action cannot be undone.
                                </p>
                            </div>

                            {error && <p className="error">{error}</p>}

                            <div className="delete-action">
                                <button
                                    data-type="link"
                                    disabled={deleting}
                                    onClick={handleDeleteModalClose}
                                >
                                    Cancel
                                </button>

                                <button
                                    data-type="button"
                                    disabled={deleting}
                                    data-load={deleting}
                                    onClick={handleDelete}
                                    data-variant="error"
                                >
                                    {deleting ? (
                                        <Loader variant="small" />
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </dialog>
                </>,
                document.body
            )}

            <p>{ind}</p>
            {/* <p>{getRegionDisplayValue(item.region)}</p> */}
            {/* <p>{item.Ouvrage || "-"}</p> */}
            <p>{item.Territoire || "-"}</p>
            <p>{item["Site d'intervention"] || "-"}</p>
            {/* <p>{item["Coordonnées"] || "-"}</p> */}
            <p>{item.Infrastructures || "-"}</p>
            {/* <p>{item["Lieu d'implantation"] || "-"}</p> */}
            {/* <p>{item.Secteur || "-"}</p> */}
            <p>{item["Latitude"] || "-"}</p>
            <p>{item["Longitude"] || "-"}</p>
            <p>
                <DialogTrigger>
                    <IconButton
                        icon={Edit}
                        size="extra-small"
                        color="standard"
                    />
                    <ModalOverlay>
                        <SideSheetModal layout="detached">
                            <SideSheet headline="Edit Report">
                                <Form
                                    onSubmit={handleEdit}
                                    className={styles["form"]}
                                    data-new-form
                                >
                                    <Input
                                        label="Region"
                                        name="region"
                                        value={item.region}
                                        isReadOnly
                                    />
                                    <Input
                                        label="Territoire"
                                        name="Territoire"
                                        value={item.Territoire}
                                        isReadOnly
                                    />

                                    <Input
                                        label="Site d'intervention"
                                        name="Site d'intervention"
                                        value={item["Site d'intervention"]}
                                        isReadOnly
                                    />

                                    <Input
                                        label="Infrastructures"
                                        name="Infrastructures"
                                        value={item.Infrastructures}
                                        isReadOnly
                                    />

                                    <Input
                                        label="Latitude"
                                        name="Latitude"
                                        defaultValue={item.Latitude}
                                        isReadOnly={editing}
                                    />

                                    <Input
                                        label="Longitude"
                                        name="Longitude"
                                        defaultValue={item.Longitude}
                                        isReadOnly={editing}
                                    />

                                    <div>
                                        <Button
                                            type="submit"
                                            isPending={editing}
                                        >
                                            Update
                                        </Button>
                                    </div>
                                </Form>
                            </SideSheet>
                        </SideSheetModal>
                    </ModalOverlay>
                </DialogTrigger>
            </p>
            <p>
                <button
                    data-type="link"
                    onClick={() => deleteConfirmRef.current?.showModal()}
                    disabled={deleting}
                    data-variant="error"
                >
                    <FontAwesomeIcon icon={faTrashCan} />
                </button>
            </p>
        </div>
    );
};

export default PriseReportItemComp;
