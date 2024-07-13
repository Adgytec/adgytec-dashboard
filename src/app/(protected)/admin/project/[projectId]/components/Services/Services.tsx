import React from "react";
import { Services } from "../../page";
import styles from "./services.module.scss";

interface AddedServicesProps {
	services: Services[];
}

const AddedServices = ({ services }: AddedServicesProps) => {
	return (
		<div className={styles.services}>
			<div className={styles.action}>
				<button data-variant="primary" data-type="link">
					Manage Services
				</button>
			</div>

			{services.length === 0 ? (
				<div data-empty={true}>
					<h3>No services are added</h3>
				</div>
			) : (
				<div className={styles.list}>
					{services.map((service) => {
						return (
							<div className={styles.item} key={service.id}>
								<img src={service.icon} alt={service.name} />
								{service.name}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default AddedServices;
