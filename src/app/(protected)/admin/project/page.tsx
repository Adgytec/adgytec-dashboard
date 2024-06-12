"use client";

import React, { useRef } from "react";
import styles from "./project.module.scss";
import Container from "@/components/Container/Container";
import ModalCreateProject from "./components/ModalCreateProject";
import { handleEscModal, handleModalClose } from "@/helpers/modal";

const ProjectAdmin = () => {
	const createProjectRef = useRef<HTMLDialogElement | null>(null);

	return (
		<>
			<dialog
				ref={createProjectRef}
				className={styles.modal_create}
				onKeyDown={(e) => handleEscModal(e)}
			>
				<ModalCreateProject
					handleClose={() => handleModalClose(createProjectRef)}
				/>
			</dialog>

			<Container type="normal" className={styles.project}>
				<div className={styles.create}>
					<button
						data-type="button"
						data-variant="primary"
						onClick={() => createProjectRef.current?.showModal()}
					>
						Create new project
					</button>
				</div>

				<div className={styles.project_list}></div>
			</Container>
		</>
	);
};

export default ProjectAdmin;
