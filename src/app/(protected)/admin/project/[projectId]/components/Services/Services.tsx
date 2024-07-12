import React from "react";
import { Services } from "../../page";
import styles from "./services.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faImages,
	faNewspaper,
	faWindowRestore,
} from "@fortawesome/free-regular-svg-icons";

interface AddedServicesProps {
	services: Services[];
}

const AddedServices = ({ services }: AddedServicesProps) => {
	const getIcon = (name: string) => {
		switch (name) {
			case "gallery":
				return <FontAwesomeIcon icon={faImages} />;
			case "news":
				return <FontAwesomeIcon icon={faNewspaper} />;
			case "blogs":
				return <FontAwesomeIcon icon={faWindowRestore} />;
		}
	};

	return (
		<div className={styles.services}>
			<div className={styles.action}>
				<button data-variant="primary" data-type="link">
					Manage Services
				</button>
			</div>

			<div className={styles.list}>
				{services.map((service) => {
					return (
						<div className={styles.item} key={service.id}>
							{getIcon(service.name)}
							{service.name}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default AddedServices;
