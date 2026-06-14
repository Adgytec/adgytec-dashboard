"use client";

import { useSnackbarQueue } from "@adgytec/adgytec-web-ui-components";
import { useParams } from "next/navigation";
import { useContext, useEffect, useMemo } from "react";
import {
    Column,
    Table,
    TableBody,
    TableHeader,
    TableLoadMoreItem,
    useAsyncList,
} from "react-aria-components";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { getNow } from "@/helpers/helpers";
import ContactUsItem from "./components/contactUsItem/contactUsItem";
import styles from "./contact-us.module.css";

export interface IContactUsItem {
    id: string;
    createdAt: string;
    data: Record<string, unknown>;
}

const ContactUsPage = () => {
    const snackbarQueue = useSnackbarQueue();
    const userWithRole = useContext(UserContext);
    const user = useMemo(() => {
        return userWithRole ? userWithRole.user : null;
    }, [userWithRole]);

    const params = useParams<{ projectId: string }>();

    const list = useAsyncList<IContactUsItem, string | null>({
        async load({ cursor, signal, items }) {
            if (!user) {
                return {
                    items: [],
                    cursor: null,
                };
            }

            const token = await user?.getIdToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API}/services/contact-us/${
                    params.projectId
                }?cursor=${cursor ?? getNow()}`,
                {
                    signal,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const json = await res.json();

            if (json.error) {
                throw new Error(json.message);
            }

            const existingIds = new Set(items.map((i) => i.id));

            const nextItems = json.data.responses.filter(
                (item: IContactUsItem) => !existingIds.has(item.id)
            );

            return {
                items: nextItems,
                cursor: json.data.pageInfo.nextPage
                    ? json.data.pageInfo.cursor
                    : null,
            };
        },
        getKey(item) {
            return item.id;
        },
    });

    useEffect(() => {
        if (!list.error) return;

        snackbarQueue.add({
            supportingText: list.error.message,
        });
    }, [list.error, snackbarQueue]);

    /* biome-ignore lint: reload list on project change */
    useEffect(() => {
        list.reload();
    }, [params.projectId]);

    const items = list.items;
    const loading = list.loadingState === "loading";

    return (
        <div className={styles.contactUs}>
            <div data-empty={items.length === 0} data-load={loading}>
                {loading ? (
                    <Loader />
                ) : items.length === 0 ? (
                    <h3>No form submitted</h3>
                ) : (
                    <div className={styles["table-container"]}>
                        <Table
                            aria-label="Contact Us Submissions"
                            className={styles.table}
                        >
                            <TableHeader className={styles.thead}>
                                {Object.keys(items[0].data).map((heading) => (
                                    <Column
                                        key={heading}
                                        className={styles.th}
                                        isRowHeader={
                                            heading === "Name" ||
                                            heading === "name" ||
                                            heading === "Email" ||
                                            heading === "email"
                                        }
                                    >
                                        {heading}
                                    </Column>
                                ))}
                                <Column className={styles.th}>
                                    Submitted On
                                </Column>
                                <Column
                                    className={styles.th}
                                    aria-label="Actions"
                                />
                            </TableHeader>

                            <TableBody className={styles.tbody} items={items}>
                                {(item) => (
                                    <ContactUsItem
                                        key={item.id}
                                        data={item}
                                        onDelete={list.remove}
                                    />
                                )}
                            </TableBody>

                            <TableLoadMoreItem
                                isLoading={list.loadingState === "loadingMore"}
                                onLoadMore={list.loadMore}
                            >
                                <Loader variant="small" />
                            </TableLoadMoreItem>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactUsPage;
