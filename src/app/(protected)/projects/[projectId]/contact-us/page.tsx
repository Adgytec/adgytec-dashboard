"use client";

import Container from "@/components/Container/Container";
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import styles from "./contact-us.module.scss";
import { UserContext } from "@/components/AuthContext/authContext";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useIntersection } from "@/hooks/intersetion-observer/intersection-observer";
import { getNow, KEYLIMIT, trimStringWithEllipsis } from "@/helpers/helpers";
import Loader from "@/components/Loader/Loader";
import ContactUsItem from "./components/contactUsItem/contactUsItem";
import { PageInfo } from "@/helpers/type";

export interface IContactUsItem {
	id: string;
	createdAt: string;
	data: string;
}

const LIMIT = 20;

const ContactUsPage = () => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(() => {
		return userWithRole ? userWithRole.user : null;
	}, [userWithRole]);

	const params = useParams<{ projectId: string }>();
	const pageInfoRef = useRef<PageInfo>({
		nextPage: false,
		cursor: "",
	});

	const [allItems, setAllItems] = useState<IContactUsItem[]>([]);
	const [loading, setLoading] = useState(true);

	const getAllItems = useCallback(
		async (cursor: string) => {
			setLoading(true);

			const url = `${process.env.NEXT_PUBLIC_API}/services/contact-us/${params.projectId}?cursor=${cursor}`;
			const token = await user?.getIdToken();
			const headers = {
				Authorization: `Bearer ${token}`,
			};

			fetch(url, {
				method: "GET",
				headers,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.error) throw new Error(res.message);
					pageInfoRef.current = res.data.pageInfo;
					let len = res.data.responses.length;

					setAllItems((prev) => {
						const newItems = res.data.responses.filter(
							(item: IContactUsItem) =>
								!prev.some(
									(existingItem) =>
										existingItem.id === item.id
								)
						);
						return [...prev, ...newItems];
					});
					if (len > 0) {
						let keyCount =
							2 + Object.keys(res.data.responses[0].data).length;
						let tableParent = document.getElementById("form-table");
						if (tableParent) {
							tableParent.style.setProperty(
								"--table-items",
								keyCount.toString()
							);
						}
					}
				})
				.catch((err) => {
					toast.error(err.message);
				})
				.finally(() => setLoading(false));
		},
		[user, params.projectId]
	);

	const callback: IntersectionObserverCallback = useCallback(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					if (pageInfoRef.current.nextPage)
						getAllItems(pageInfoRef.current.cursor);
				}
			});
		},
		[allItems, getAllItems, pageInfoRef.current]
	);

	const elementRef = useIntersection(
		callback,
		document.getElementById("content-root")
	);

	useEffect(() => {
		getAllItems(getNow());
	}, [getAllItems]);

	let keyLength = 2;
	if (allItems.length > 0) {
		keyLength += Object.keys(allItems[0].data).length;
	}

	return (
		<Container className={styles.contactUs}>
			<h2>Contact Us Overview</h2>

			<div
				data-empty={allItems.length === 0}
				data-load={loading && allItems.length === 0}
				id="form-table"
			>
				{loading && allItems.length === 0 ? (
					<Loader />
				) : allItems.length === 0 ? (
					<h3>No form submitted</h3>
				) : (
					<Container
						type="full"
						className={styles.table}
						data-responsive={keyLength <= KEYLIMIT}
					>
						{keyLength <= KEYLIMIT && (
							<div className={styles.heading}>
								{Object.keys(allItems[0].data).map(
									(heading) => {
										return (
											<h4
												key={heading + "table"}
												title={heading}
											>
												{trimStringWithEllipsis(
													heading,
													10
												)}
											</h4>
										);
									}
								)}
								<h4>Submitted On</h4>

								<h4>Delete</h4>
							</div>
						)}

						{allItems.map((item) => {
							return (
								<ContactUsItem
									key={item.id}
									data={item}
									setAllItems={setAllItems}
								/>
							);
						})}

						<div
							style={{
								visibility: "hidden",
							}}
							ref={elementRef}
						></div>
					</Container>
				)}
			</div>

			{loading && allItems.length > 0 && <Loader variant="small" />}
		</Container>
	);
};

export default ContactUsPage;
