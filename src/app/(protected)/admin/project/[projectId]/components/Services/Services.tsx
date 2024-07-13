import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { ProjectDetails, Services } from "../../page";
import styles from "./services.module.scss";
import { handleEscModal, handleModalClose } from "@/helpers/modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Loader from "@/components/Loader/Loader";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import Image from "next/image";

interface AddedServicesProps {
	details: ProjectDetails;
	setDetails: React.Dispatch<React.SetStateAction<ProjectDetails | null>>;
}

interface ServiceObj {
	serviceId: string;
	serviceName: string;
	icon: string;
}

const AddedServices = ({ setDetails, details }: AddedServicesProps) => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const manageServiceRef = useRef<HTMLDialogElement | null>(null);
	const addedServices = details.services;
	const params = useParams<{ projectId: string }>();

	const [services, setServices] = useState<ServiceObj[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [adding, setAdding] = useState(false);
	const [removing, setRemoving] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [selectedServices, setSelectedServices] = useState<string[]>([]);

	const handleManageModalClose = () => handleModalClose(manageServiceRef);

	const getAllServices = useCallback(async () => {
		const url = `${process.env.NEXT_PUBLIC_API}/services`;
		const token = await user?.getIdToken();
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		fetch(url, {
			headers,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);

				setServices(res.data);
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [user]);

	useEffect(() => {
		getAllServices();
	}, [getAllServices]);

	const handleRemoveSerice = async (serviceId: string) => {
		setRemoving(serviceId);
		setError(null);
		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/services`;
		const token = await user?.getIdToken();
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
		const body = JSON.stringify({
			services: [serviceId],
		});

		fetch(url, {
			method: "DELETE",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);
				// toast.success("successfully removed service from project");

				// remove service from details
				const service = addedServices.find(
					(el) => el.serviceId === serviceId
				);
				if (!service) return;

				setDetails((prev) => {
					if (!prev) return null;

					prev.services = prev.services.filter(
						(s) => s.serviceId !== serviceId
					);
					return prev;
				});
			})
			.catch((err) => {
				// toast.error(err.message);
				setError(err.message);
			})
			.finally(() => setRemoving(""));
	};

	const handleAddServices = async () => {
		if (selectedServices.length === 0) {
			// toast.error("No services selected");
			setError("No services selected");
			return;
		}

		let serviceToAdd = selectedServices;

		setAdding(true);
		setError(null);
		const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/services`;
		const token = await user?.getIdToken();
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
		const body = JSON.stringify({
			services: selectedServices,
		});

		fetch(url, {
			method: "POST",
			headers,
			body,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) throw new Error(res.message);
				// toast.success("successfully added service to project");
				setSelectedServices([]);

				// add service to details
				const addedServices = services.filter((service) => {
					return serviceToAdd.includes(service.serviceId);
				});

				setDetails((prev) => {
					if (!prev) return null;

					prev.services = [...prev.services, ...addedServices];

					return prev;
				});
			})
			.catch((err) => {
				// toast.error(err.message);
				setError(err.message);
			})
			.finally(() => setAdding(false));
	};

	const handleCheckboxChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const serviceId = event.target.dataset.id; // Assuming data-id attribute
		const isChecked = event.target.checked;

		if (!serviceId) return;

		// Update selectedServices state based on checkbox state
		if (isChecked) {
			setSelectedServices([...selectedServices, serviceId]);
		} else {
			setSelectedServices(
				selectedServices.filter((id) => id !== serviceId)
			);
		}
	};

	let servicesToAdd: React.JSX.Element[] = [];
	services.forEach((service) => {
		if (addedServices?.some((s) => s.serviceId === service.serviceId)) {
			return;
		}

		const { serviceName } = service;
		let element = (
			<div key={service.serviceId} className={styles.item}>
				<input
					type="checkbox"
					name="service"
					data-id={service.serviceId}
					onChange={handleCheckboxChange}
					checked={selectedServices.includes(service.serviceId)}
					id={service.serviceId}
					disabled={adding}
				/>
				<label htmlFor={service.serviceId}>
					<Image src={service.icon} alt="" width={17} height={17} />
					{service.serviceName}
				</label>
			</div>
		);

		if (search.length === 0) {
			servicesToAdd.push(element);
			return;
		}

		if (serviceName.toLowerCase().includes(search.toLowerCase())) {
			servicesToAdd.push(element);
			return;
		}
	});

	return (
		<>
			<dialog
				ref={manageServiceRef}
				onKeyDown={handleEscModal}
				className={styles.modal}
			>
				<div className="modal">
					<div className="modal-menu">
						<h2>Manage Services</h2>

						<button
							data-type="link"
							onClick={handleManageModalClose}
							title="close"
							// disabled={updating}
						>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className={styles.modal_content}>
						<div className={styles.added}>
							<div className={styles.title}>
								<h3>Added Services</h3>
							</div>

							{!addedServices || addedServices.length === 0 ? (
								<div className={styles.empty}>
									<h4>No services added</h4>
								</div>
							) : (
								<div className={styles.items}>
									{addedServices.map((service) => {
										return (
											<div
												className={styles.item}
												key={service.serviceId}
											>
												<Image
													src={service.icon}
													alt=""
													width={17}
													height={17}
												/>
												<p>{service.serviceName}</p>

												<button
													data-type="link"
													data-variant="error"
													disabled={
														removing.length > 0
													}
													data-load={
														removing ===
														service.serviceId
													}
													onClick={() =>
														handleRemoveSerice(
															service.serviceId
														)
													}
												>
													{removing ===
													service.serviceId ? (
														<Loader variant="small" />
													) : (
														<FontAwesomeIcon
															icon={faCircleXmark}
														/>
													)}
												</button>
											</div>
										);
									})}
								</div>
							)}
						</div>

						<div className={styles.toAdd}>
							<div className={styles.title}>
								<h3>Add Services</h3>

								<input
									type="text"
									placeholder="Type to search..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									disabled={adding}
								></input>
							</div>

							{loading ? (
								<div className={styles.load}>
									<Loader variant="small" />
								</div>
							) : servicesToAdd.length === 0 ? (
								<div className={styles.empty}>
									<h4>No services to add</h4>
								</div>
							) : (
								<div className={styles.items}>
									{servicesToAdd}
								</div>
							)}
						</div>
					</div>

					{error && <p className="error">{error}</p>}

					<div className="action">
						<button
							data-type="link"
							// disabled={updating}
							onClick={handleManageModalClose}
						>
							Cancel
						</button>

						<button
							data-type="button"
							data-variant="secondary"
							disabled={adding || selectedServices.length === 0}
							data-load={adding}
							onClick={handleAddServices}
						>
							{adding ? (
								<Loader variant="small" />
							) : (
								"Add services"
							)}
						</button>
					</div>
				</div>
			</dialog>

			<div className={styles.services}>
				<div className={styles.action}>
					<button
						data-variant="primary"
						data-type="link"
						onClick={() => manageServiceRef.current?.showModal()}
					>
						Manage Services
					</button>
				</div>

				{addedServices.length === 0 ? (
					<div data-empty={true}>
						<h3>No services are added</h3>
					</div>
				) : (
					<div className={styles.list}>
						{addedServices.map((service) => {
							return (
								<div
									className={styles.item}
									key={service.serviceId}
								>
									<Image
										width={17}
										height={17}
										src={service.icon}
										alt=""
									/>
									{service.serviceName}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
};

export default AddedServices;
