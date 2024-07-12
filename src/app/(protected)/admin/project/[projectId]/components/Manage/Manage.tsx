import React, { useContext, useMemo } from "react";
import styles from "../../project.module.scss";
import * as Tabs from "@radix-ui/react-tabs";
import { Services, Users } from "../../page";
import User from "./User";
import Service from "./Service";
import { UserContext } from "@/components/AuthContext/authContext";

interface ManageProps {
	// handleManage: () => void;
	// getProjectDetail: () => void;
	users: Users[] | null;
	// services: Services[] | null;
}

const Manage = ({
	// handleManage,
	// getProjectDetail,
	users,
}: // services,
ManageProps) => {
	const userWithRole = useContext(UserContext);
	const user = useMemo(
		() => (userWithRole ? userWithRole.user : null),
		[userWithRole]
	);

	const getProjectDetail = () => {};

	return (
		<div className={styles.manage}>
			<div className={styles.tabs}>
				<Tabs.Root
					defaultValue="users"
					style={{
						display: "grid",
						gap: "1em",
					}}
				>
					<Tabs.List asChild>
						<div className={styles.trigger}>
							<Tabs.Trigger asChild value="users">
								<button data-type="link">Users</button>
							</Tabs.Trigger>

							<Tabs.Trigger asChild value="services">
								<button data-type="link">Services</button>
							</Tabs.Trigger>
						</div>
					</Tabs.List>

					<div className={styles.tabs_content}>
						<Tabs.Content value="users">
							<User
								addedUsers={users}
								getProjectDetail={getProjectDetail}
								user={user}
							/>
						</Tabs.Content>
						<Tabs.Content value="services">
							{/* <Service
								addedServices={services}
								getProjectDetail={getProjectDetail}
								user={user}
							/> */}
						</Tabs.Content>
					</div>
				</Tabs.Root>
			</div>

			<div className={styles.action}>
				<button
					data-type="link"
					data-variant="primary"
					// onClick={handleManage}
				>
					details
				</button>
			</div>
		</div>
	);
};

export default Manage;
