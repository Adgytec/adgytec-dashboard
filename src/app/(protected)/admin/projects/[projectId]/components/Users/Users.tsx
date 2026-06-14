import { LinkButton, typography } from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { UserRoundPen } from "lucide-react";
import Link from "next/link";
import { GridList, GridListItem, Text } from "react-aria-components";
import type { Users } from "../../page";
import styles from "./users.module.css";

interface AddedUsersProps {
    users: Users[];
}

const AddedUsers = ({ users }: AddedUsersProps) => {
    return (
        <div className={styles.users}>
            <div className={styles.action}>
                <LinkButton
                    href="?view=users&manage=true"
                    icon={UserRoundPen}
                    color="tonal"
                    render={(props) => {
                        if ("href" in props) {
                            return <Link {...props} />;
                        }
                        return <span {...props} />;
                    }}
                >
                    Manage Users
                </LinkButton>
            </div>
            {users.length === 0 ? (
                <div data-empty="true">
                    <h3>No users are added</h3>
                </div>
            ) : (
                <div className={styles.list}>
                    <GridList
                        className={clsx(styles["users-list"])}
                        layout="grid"
                        items={users}
                    >
                        {(user) => (
                            <GridListItem
                                className={clsx(styles["user"])}
                                key={user.userId}
                            >
                                <div className={clsx(styles["leading"])}>
                                    <Text
                                        className={clsx(
                                            styles["name"],
                                            typography.bodyLarge
                                        )}
                                    >
                                        {user.name}
                                    </Text>
                                    <Text
                                        className={clsx(
                                            styles["info"],
                                            typography.bodyMedium
                                        )}
                                    >
                                        {user.email}
                                    </Text>
                                </div>
                            </GridListItem>
                        )}
                    </GridList>
                </div>
            )}
        </div>
    );
};

export default AddedUsers;
