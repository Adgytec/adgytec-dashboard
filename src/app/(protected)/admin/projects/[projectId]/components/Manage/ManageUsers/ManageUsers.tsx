import {
    Button,
    IconButton,
    SearchField,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import { Trash2, UserPlus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { GridList, GridListItem, Text } from "react-aria-components";

import { UserContext } from "@/components/AuthContext/authContext";
import Container from "@/components/Container/Container";
import Loader from "@/components/Loader/Loader";
import type { ProjectDetails } from "../../../page";
import styles from "./manageUsers.module.scss";

export interface UserObj {
    name: string;
    email: string;
    role?: string;
    userId: string;
    createdAt?: string;
}

interface ManageUsersProps {
    setDetails: React.Dispatch<React.SetStateAction<ProjectDetails | null>>;
    projectName: string;
    details: ProjectDetails;
}

const ManageUsers = ({
    details,
    setDetails,
    projectName,
}: ManageUsersProps) => {
    const userWithRole = useContext(UserContext);
    const user = useMemo(
        () => (userWithRole ? userWithRole.user : null),
        [userWithRole]
    );

    const params = useParams<{ projectId: string }>();
    const router = useRouter();
    const snackbarQueue = useSnackbarQueue();

    const [users, setUsers] = useState<UserObj[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [adding, setAdding] = useState("");
    const [removing, setRemoving] = useState("");

    const addedUsers = details.users;

    const getAllUsers = useCallback(async () => {
        const url = `${process.env.NEXT_PUBLIC_API}/users?role=user`;
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
                setUsers(res.data);
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user, snackbarQueue]);

    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);

    const handleRemoveUser = async (userId: string) => {
        setRemoving(userId);
        const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/user`;
        const token = await user?.getIdToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
        const body = JSON.stringify({
            userId,
        });

        fetch(url, {
            method: "DELETE",
            headers,
            body,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);
                snackbarQueue.add(
                    {
                        supportingText:
                            "successfully removed user from project",
                    },
                    { timeout: 5000 }
                );

                setDetails((prev) => {
                    if (!prev) return null;

                    prev.users = prev.users.filter((u) => u.userId !== userId);
                    return prev;
                });
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => setRemoving(""));
    };

    const handleAddUser = async (userId: string) => {
        setAdding(userId);
        const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}/user`;
        const token = await user?.getIdToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
        const body = JSON.stringify({
            userId,
        });

        fetch(url, {
            method: "POST",
            headers,
            body,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) throw new Error(res.message);
                snackbarQueue.add(
                    { supportingText: "successfully added user to project" },
                    { timeout: 5000 }
                );

                const user = users.find((el) => el.userId === userId);
                if (!user) return;

                setDetails((prev) => {
                    if (!prev) return null;

                    prev.users = [...prev.users, user];

                    return prev;
                });
            })
            .catch((err) => {
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => setAdding(""));
    };

    const filteredUsersToAdd = useMemo(() => {
        return users.filter((user) => {
            if (addedUsers?.some((u) => u.userId === user.userId)) {
                return false;
            }
            if (search.length === 0) {
                return true;
            }
            return (
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.name.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [users, addedUsers, search]);

    return (
        <Container className={styles.container}>
            <div className={styles.header}>
                <h2>{projectName}</h2>

                <Button color="text" onPress={() => router.back()}>
                    Back
                </Button>
            </div>

            <div className={styles.content}>
                <div className={styles.added}>
                    <div className={styles.title}>
                        <h3>Added Users</h3>
                    </div>

                    {addedUsers.length === 0 ? (
                        <div className={styles.empty}>
                            <h4>No users are added.</h4>
                        </div>
                    ) : (
                        <div className={styles.table_wrapper}>
                            <div className={styles.table_header}>
                                <h4>Name</h4>
                                <h4>Email ID</h4>
                                <h4>Remove</h4>
                            </div>

                            <GridList
                                className={styles.users_list}
                                aria-label="Added Users"
                            >
                                {addedUsers.map((user) => (
                                    <GridListItem
                                        key={user.userId}
                                        className={styles.user_item}
                                    >
                                        <Text
                                            className={styles.user_field}
                                            data-key="Name"
                                        >
                                            {user.name}
                                        </Text>
                                        <Text
                                            className={styles.user_field}
                                            data-key="Email ID"
                                        >
                                            {user.email}
                                        </Text>

                                        <div
                                            className={styles.user_action}
                                            data-key="Remove"
                                        >
                                            <IconButton
                                                icon={Trash2}
                                                color="standard"
                                                tooltip="Remove User"
                                                isDisabled={
                                                    removing.length > 0 &&
                                                    removing !== user.userId
                                                }
                                                isPending={
                                                    removing === user.userId
                                                }
                                                onPress={() =>
                                                    handleRemoveUser(
                                                        user.userId
                                                    )
                                                }
                                            />
                                        </div>
                                    </GridListItem>
                                ))}
                            </GridList>
                        </div>
                    )}
                </div>

                <div className={styles.toAdd}>
                    <div className={styles.title}>
                        <h3>Add Users</h3>

                        <div className={styles.search}>
                            <SearchField
                                placeholder="Search Users"
                                value={search}
                                onChange={setSearch}
                                isDisabled={loading}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div data-load="true">
                            <Loader variant="small" />
                        </div>
                    ) : filteredUsersToAdd.length === 0 ? (
                        <div className={styles.empty}>
                            {search.length !== 0 ? (
                                <p>
                                    There is no user named{" "}
                                    <span className="italic">
                                        <q>{search}</q>
                                    </span>
                                </p>
                            ) : (
                                <h4>No users to add.</h4>
                            )}
                        </div>
                    ) : (
                        <div className={styles.table_wrapper}>
                            <div className={styles.table_header}>
                                <h4>Name</h4>
                                <h4>Email ID</h4>
                                <h4>Add</h4>
                            </div>

                            <GridList
                                className={styles.users_list}
                                aria-label="Users to Add"
                            >
                                {filteredUsersToAdd.map((user) => (
                                    <GridListItem
                                        key={user.userId}
                                        className={styles.user_item}
                                    >
                                        <Text
                                            className={styles.user_field}
                                            data-key="Name"
                                        >
                                            {user.name}
                                        </Text>
                                        <Text
                                            className={styles.user_field}
                                            data-key="Email ID"
                                        >
                                            {user.email}
                                        </Text>

                                        <div
                                            className={styles.user_action}
                                            data-key="Add"
                                        >
                                            <IconButton
                                                icon={UserPlus}
                                                color="standard"
                                                tooltip="Add User"
                                                isDisabled={
                                                    adding.length > 0 &&
                                                    adding !== user.userId
                                                }
                                                isPending={
                                                    adding === user.userId
                                                }
                                                onPress={() =>
                                                    handleAddUser(user.userId)
                                                }
                                            />
                                        </div>
                                    </GridListItem>
                                ))}
                            </GridList>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default ManageUsers;
