"use client";

import {
    SearchField,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import { GridList, Text } from "react-aria-components";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { userRoles } from "@/helpers/type";
import { User, type UserType } from "../User";
import { type OnEditSuccessInput, UserActionProvider } from "./context";
import styles from "./users.module.css";

export const Users = () => {
    const userWithRole = useContext(UserContext);
    const user = userWithRole ? userWithRole.user : null;
    const role = userWithRole ? userWithRole.role : null;

    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const snackbarQueue = useSnackbarQueue();

    useEffect(() => {
        (async function getUsers() {
            const url = `${process.env.NEXT_PUBLIC_API}/users`;
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
        })();
    }, [user, snackbarQueue]);

    const usersToRender: UserType[] = [];
    users.forEach((user) => {
        const { userId, email, name, role: userRole } = user;

        if (
            role === userRoles.admin &&
            (userRole === userRoles.superAdmin || role === userRole)
        ) {
            return;
        }

        if (search.length === 0) {
            usersToRender.push(user);
            return;
        }

        if (
            userId.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase()) ||
            name.toLowerCase().includes(search.toLowerCase()) ||
            userRole.toLowerCase().includes(search.toLowerCase())
        )
            usersToRender.push(user);
    });

    const onUserDeleteSuccess = (id: string) => {
        setUsers((prev) => {
            const temp = prev;
            return temp.toSpliced(
                temp.findIndex((u) => u.userId === id),
                1
            );
        });
    };

    const onUserUpdateSuccess = ({ id, name, role }: OnEditSuccessInput) => {
        setUsers((prev) => {
            return prev.map((u) =>
                u.userId === id ? { ...u, name, role } : u
            );
        });
    };

    return (
        <div className={clsx(styles["users"])}>
            <div className={clsx(styles["search"])}>
                <SearchField
                    placeholder="Search Users"
                    value={search}
                    onChange={setSearch}
                />
            </div>

            {loading ? (
                <div
                    style={{
                        display: "grid",
                        placeItems: "center",
                        blockSize: "50dvb",
                    }}
                >
                    <Loader />
                </div>
            ) : users.length === 0 ? (
                <Text>No user exists</Text>
            ) : usersToRender.length === 0 ? (
                <Text>
                    There is no user named{" "}
                    <span className="italic">
                        <q>{search}</q>
                    </span>
                </Text>
            ) : (
                <UserActionProvider
                    value={{
                        onDeleteSuccess: onUserDeleteSuccess,
                        onEditSuccess: onUserUpdateSuccess,
                    }}
                >
                    <GridList
                        className={clsx(styles["users-list"])}
                        layout="grid"
                        items={usersToRender}
                    >
                        {(user) => <User user={user} />}
                    </GridList>
                </UserActionProvider>
            )}
        </div>
    );
};
