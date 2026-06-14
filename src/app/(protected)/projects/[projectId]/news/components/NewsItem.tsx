import { Icon, useSnackbarQueue } from "@adgytec/adgytec-web-ui-components";
import { X } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import { useContext, useRef, useState } from "react";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import { validateString, validateURL } from "@/helpers/validation";
import styles from "../news.module.css";
import type { NewsObj } from "../page";

interface NewsItemProps {
    news: NewsObj;
    setNews: React.Dispatch<React.SetStateAction<NewsObj[]>>;
}

const NewsItem = ({ news, setNews }: NewsItemProps) => {
    const snackbarQueue = useSnackbarQueue();
    const userWithRole = useContext(UserContext);
    const user = userWithRole ? userWithRole.user : null;

    const params = useParams<{ projectId: string }>();
    const deleteConfirmRef = useRef<HTMLDialogElement | null>(null);

    const [editable, setEditable] = useState(false);
    const [userShow, setUserShow] = useState({
        title: news.title,
        text: news.text,
        link: news.link,
    });
    const [input, setInput] = useState({
        title: news.title,
        text: news.text,
        link: news.link,
    });
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    const handleClose = () => handleModalClose(deleteConfirmRef);

    const handleEdit = () => {
        setEditable((prev) => !prev);
    };

    const handleInputChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const key = e.target.name;
        const value = e.target.value;

        setInput((prev) => ({ ...prev, [key]: value }));
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);

        const url = `${process.env.NEXT_PUBLIC_API}/services/news/${params.projectId}/${news.id}`;
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

                setNews((prev) => {
                    const temp = prev;

                    return temp.toSpliced(
                        temp.findIndex((n) => n.id === news.id),
                        1
                    );
                });
                snackbarQueue.add(
                    { supportingText: "successfully deleted news item" },
                    { timeout: 5000 }
                );
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => setDeleting(false));
    };

    const validateInput = () => {
        const { title, link, text } = input;

        if (!validateString(title, 3)) {
            snackbarQueue.add({ supportingText: "Invalid title" });
            return false;
        }

        if (!validateString(text, 3)) {
            snackbarQueue.add({ supportingText: "Invalid text" });
            return false;
        }

        if (!validateURL(link)) {
            snackbarQueue.add({ supportingText: "Invalid link" });
            return false;
        }

        return true;
    };

    const handleUpdate = async () => {
        if (!validateInput()) return;

        const url = `${process.env.NEXT_PUBLIC_API}/services/news/${params.projectId}/${news.id}`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        const body = JSON.stringify({
            title: input.title,
            link: input.link,
            text: input.text,
        });

        fetch(url, {
            method: "PUT",
            headers,
            body,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);

                snackbarQueue.add(
                    { supportingText: "Successfully updated news item" },
                    { timeout: 5000 }
                );
                setEditable(false);
                setUserShow(input);
            })
            .catch((err) => snackbarQueue.add({ supportingText: err.message }))
            .finally(() => setUpdating(false));
    };

    const updateDisabled =
        input.text === news.text &&
        input.link === news.link &&
        input.title === news.title;

    return (
        <>
            <dialog
                onKeyDown={handleEscModal}
                ref={deleteConfirmRef}
                className="delete-confirm"
            >
                <div className="delete-modal">
                    <div className="modal-menu">
                        <h2>Confirm Deletion</h2>

                        <button
                            type="button"
                            data-type="link"
                            onClick={handleClose}
                            title="close"
                            disabled={deleting}
                        >
                            <Icon icon={X} />
                        </button>
                    </div>

                    <div className="delete-content">
                        <p>Are you sure you want to delete?</p>

                        <p>
                            Deleting this will permanently remove this item.
                            This action cannot be undone.
                        </p>
                    </div>

                    {error && <p className="error">{error}</p>}

                    <div className="delete-action">
                        <button
                            type="button"
                            data-type="link"
                            disabled={deleting}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            data-type="button"
                            className={styles.delete}
                            disabled={deleting}
                            data-load={deleting}
                            onClick={handleDelete}
                            data-variant="error"
                        >
                            {deleting ? <Loader variant="small" /> : "Delete"}
                        </button>
                    </div>
                </div>
            </dialog>
            <div className={styles.item}>
                <div className={styles.item_image}>
                    <img
                        // width={2}
                        // height={1}
                        style={{ width: "100%", height: "auto" }}
                        src={news.image}
                        alt={userShow.title}
                    />
                </div>

                {!editable ? (
                    <div className={styles.item_details}>
                        <h2 contentEditable={editable}>{userShow.title}</h2>

                        <p>{userShow.text}</p>
                        <div>
                            <a
                                data-type="link"
                                data-variant="secondary"
                                href={userShow.link}
                                target="__blank"
                            >
                                news link
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className={styles.item_details}>
                        <div>
                            <input
                                type="text"
                                placeholder="Title..."
                                value={input.title}
                                onChange={handleInputChange}
                                name="title"
                                disabled={updating}
                            />
                        </div>
                        <div>
                            <textarea
                                name="text"
                                value={input.text}
                                onChange={handleInputChange}
                                placeholder="Text..."
                                disabled={updating}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Link..."
                                value={input.link}
                                onChange={handleInputChange}
                                name="link"
                                disabled={updating}
                            />
                        </div>
                    </div>
                )}

                <div className={styles.item_action}>
                    {editable && (
                        <button
                            type="button"
                            data-type="button"
                            data-variant="secondary"
                            data-load={updating}
                            disabled={updating || updateDisabled}
                            onClick={handleUpdate}
                        >
                            {updating ? <Loader variant="small" /> : "Update"}
                        </button>
                    )}
                    <button
                        type="button"
                        data-type="link"
                        data-variant="primary"
                        onClick={handleEdit}
                        disabled={updating}
                    >
                        {editable ? "Cancel" : "Edit"}
                    </button>

                    <button
                        type="button"
                        data-type="button"
                        data-variant="error"
                        onClick={() => deleteConfirmRef.current?.showModal()}
                        disabled={updating}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </>
    );
};

export default NewsItem;
