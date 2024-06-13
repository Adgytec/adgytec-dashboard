import React, { useEffect, useState } from "react";
import styles from "../../project.module.scss";
import { Services } from "../../page";
import { User as AuthUser } from "firebase/auth";
import Loader from "@/components/Loader/Loader";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

interface ServiceProps {
	addedServices: Services[] | null;
	getProjectDetail: () => void;
	user: AuthUser | null;
}

interface ServiceObj {
	serviceName: string;
	serviceId: string;
}

const Service = ({ addedServices, getProjectDetail, user }: ServiceProps) => {
	const [services, setServices] = useState<ServiceObj[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [adding, setAdding] = useState(false);
	const [removing, setRemoving] = useState("");

	const [selectedServices, setSelectedServices] = useState<string[]>([]);

	const params = useParams<{ projectId: string }>();

	useEffect(() => {
		getAllServices();
	}, []);

	const getAllServices = async () => {
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
				// console.error(err.message);
				toast.error(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	if (loading) {
		return (
			<div
				style={{
					height: "20rem",
					display: "grid",
					placeItems: "center",
				}}
			>
				<Loader />
			</div>
		);
	}

	const handleRemoveSerice = async (serviceId: string) => {
		setRemoving(serviceId);
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
				toast.success("successfully removed service from project");
				getProjectDetail();
			})
			.catch((err) => {
				toast.error(err.message);
			})
			.finally(() => setRemoving(""));
	};

	const handleAddServices = async () => {
		if (selectedServices.length === 0) {
			toast.error("No services selected");
			return;
		}

		setAdding(true);
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
				toast.success("successfully added service to project");
				getProjectDetail();
				setSelectedServices([]);
			})
			.catch((err) => {
				toast.error(err.message);
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

	let elements: React.JSX.Element[] = [];
	services.forEach((service) => {
		if (addedServices?.some((s) => s.id === service.serviceId)) {
			return;
		}

		const { serviceName } = service;
		let element = (
			<div key={service.serviceId} className={styles.services_input}>
				<input
					type="checkbox"
					name="service"
					data-id={service.serviceId}
					onChange={handleCheckboxChange}
					checked={selectedServices.includes(service.serviceId)}
					id={service.serviceId}
					disabled={adding}
				/>
				<label htmlFor={service.serviceId}>{service.serviceName}</label>
			</div>
		);

		if (search.length === 0) {
			elements.push(element);
			return;
		}

		if (serviceName.toLowerCase().includes(search.toLowerCase())) {
			elements.push(element);
			return;
		}
	});

	return (
		<div className={styles.services}>
			<div className={styles.services_container}>
				<h3>Added services</h3>

				<div className={styles.services_list}>
					{addedServices && addedServices.length > 0 ? (
						<>
							{addedServices.map((service) => {
								return (
									<div
										className={styles.services_item}
										key={service.id}
									>
										<p>
											<strong>Name: </strong>{" "}
											{service.name}
										</p>

										<div>
											<button
												data-type="link"
												data-variant="error"
												disabled={removing.length > 0}
												data-load={
													removing === service.id
												}
												onClick={() =>
													handleRemoveSerice(
														service.id
													)
												}
											>
												{removing === service.id ? (
													<Loader variant="small" />
												) : (
													"Remove"
												)}
											</button>
										</div>
									</div>
								);
							})}
						</>
					) : (
						<p>No services added</p>
					)}
				</div>
			</div>

			<div className={styles.services_container}>
				<h3>Add services</h3>

				<div title="serach service based on name">
					<input
						type="text"
						placeholder="Search..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					></input>
				</div>

				<div className={styles.services_list}>
					{elements.length > 0 ? (
						<>{elements}</>
					) : (
						<p>No services to add</p>
					)}
				</div>

				<div>
					<button
						data-type="button"
						data-variant="secondary"
						onClick={handleAddServices}
						disabled={adding || selectedServices.length === 0}
						data-load={adding}
					>
						{adding ? <Loader variant="small" /> : "Add"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Service;
