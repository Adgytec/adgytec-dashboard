import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { PriseReportItemCompProps, getRegionDisplayValue } from "./types";
import { useContext, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import { createPortal } from "react-dom";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Loader/Loader";
import { UserContext } from "../AuthContext/authContext";
import { toast } from "react-toastify";

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
  const [error, setError] = useState<string | null>(null);

  const [isEdit, setIsEdit] = useState(false);
  const [updating, setUpdating] = useState(false);

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
          let temp = prev;

          return temp.toSpliced(
            temp.findIndex((u) => u.id === item.id),
            1,
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
                <p>Are you sure you want to delete this record?</p>

                <p>
                  Deleting this record will permanently remove this record. This
                  action cannot be undone.
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
                  {deleting ? <Loader variant="small" /> : "Delete"}
                </button>
              </div>
            </div>
          </dialog>
        </>,
        document.body,
      )}

      <p>{ind}</p>
      <p>{getRegionDisplayValue(item.region)}</p>
      <p>{item.Ouvrage || "-"}</p>
      <p>{item.Territoire || "-"}</p>
      <p>{item["Coordonnées"] || "-"}</p>
      <p>{item.Infrastructures || "-"}</p>
      <p>{item["Lieu d'implantation"] || "-"}</p>
      <p>{item.Secteur || "-"}</p>
      <p>{item["Site d'intervention"] || "-"}</p>
      <p>
        <button
          data-type="link"
          data-variant="secondary"
          onClick={() => setIsEdit((prev) => !prev)}
          disabled={updating || deleting}
        >
          <FontAwesomeIcon icon={isEdit ? faXmark : faPenToSquare} />
        </button>
      </p>
      <p>
        <button
          data-type="link"
          onClick={() => deleteConfirmRef.current?.showModal()}
          disabled={updating || deleting}
          data-variant="error"
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </p>
    </div>
  );
};

export default PriseReportItemComp;
