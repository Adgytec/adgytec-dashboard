import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "next/navigation";
import type React from "react";
import { useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { KEYLIMIT } from "@/helpers/helpers";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import type { IContactUsItem } from "../../page";
import styles from "./contact-us-item.module.scss";

interface ContactUsItemProps {
    data: IContactUsItem;
    setAllItems: React.Dispatch<React.SetStateAction<IContactUsItem[]>>;
}

const ContactUsItem = ({ data, setAllItems }: ContactUsItemProps) => {
    const userWithRole = useContext(UserContext);
    const myUser = userWithRole ? userWithRole.user : null;

    const createdAt = new Date(data.createdAt);
    const formItems = Object.entries(data.data);

    const keyLen = 2 + formItems.length;
    const params = useParams<{ projectId: string }>();

    const deleteConfirmRef = useRef<HTMLDialogElement | null>(null);
    const handleDeleteModalClose = () => handleModalClose(deleteConfirmRef);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setDeleting(true);

        const url = `${process.env.NEXT_PUBLIC_API}/services/contact-us/${params.projectId}/${data.id}`;
        const token = await myUser?.getIdToken();
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
                setAllItems((prev) => {
                    const temp = prev;

                    return temp.toSpliced(
                        temp.findIndex((u) => u.id === data.id),
                        1
                    );
                });
                toast.success(res.message);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => setDeleting(false));
    };

    return (
        <>
            {createPortal(
                <>
                    <dialog
                        onKeyDown={handleEscModal}
                        ref={deleteConfirmRef}
                        className="delete-confirm"
                    >
                        <div className="delete-modal">
                            <div className="modal-menu">
                                <h2>Confirm Record Deletion</h2>

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
                                    className={styles.delete}
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
            <div
                className={styles.tableItem}
                data-responsive={keyLen <= KEYLIMIT}
            >
                {formItems.map((item) => {
                    return (
                        <p
                            key={data.id + item[0] + "item"}
                            data-label={item[0]}
                        >
                            {item[1]}
                        </p>
                    );
                })}

                <p data-label="Submitted On">{createdAt.toDateString()}</p>

                <p data-label="Delete">
                    <button
                        data-type="link"
                        data-variant="error"
                        onClick={() => deleteConfirmRef.current?.showModal()}
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                </p>
            </div>
        </>
    );
};

export default ContactUsItem;
