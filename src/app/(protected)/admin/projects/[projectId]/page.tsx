"use client";

import {
    Input,
    InputButton,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    typography,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { Copy, UsersIcon, Wrench } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    use,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Heading } from "react-aria-components";

import { UserContext } from "@/components/AuthContext/authContext";

import Loader from "@/components/Loader/Loader";
import { copyToClipboard } from "@/helpers/helpers";
import Category from "./components/Category/Category";
import ManageUsers from "./components/Manage/ManageUsers/ManageUsers";
import ServicesComp from "./components/Services/Services";
import UsersComp from "./components/Users/Users";

import styles from "./project.module.css";

interface ProjectDetailsProps {
    params: Promise<{ projectId: string }>;
}

export interface Users {
    userId: string;
    name: string;
    email: string;
}

export interface Services {
    serviceId: string;
    serviceName: string;
    icon: string;
}

export interface ProjectDetails {
    projectName: string;
    createdAt: string;
    publicToken: string;
    users: Users[];
    services: Services[];
    cover: string;
}

const ProjectDetails = (props: ProjectDetailsProps) => {
    const params = use(props.params);
    const userWithRole = useContext(UserContext);
    const user = useMemo(
        () => (userWithRole ? userWithRole.user : null),
        [userWithRole]
    );

    const snackbarQueue = useSnackbarQueue();
    const router = useRouter();

    const [details, setDetails] = useState<ProjectDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const view = searchParams.get("view");
    const manage = searchParams.get("manage");

    const handleSelectionChange = useCallback(
        (key: React.Key) => {
            router.push(
                `/admin/projects/${params.projectId}?view=${key.toString()}`
            );
        },
        [router, params.projectId]
    );

    const getProjectDetail = useCallback(async () => {
        const url = `${process.env.NEXT_PUBLIC_API}/project/${params.projectId}`;
        const token = await user?.getIdToken();
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        fetch(url, {
            method: "GET",
            headers,
        })
            .then((res) => {
                if (res.status === 404) {
                    router.push("/admin/project");
                }
                return res.json();
            })
            .then((res) => {
                if (res.error) throw new Error(res.message);

                setDetails(res.data);
            })
            .catch((err) => {
                snackbarQueue.add(
                    { supportingText: err.message },
                    { timeout: 5000 }
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user, router, params.projectId, snackbarQueue]);

    useEffect(() => {
        getProjectDetail();
    }, [getProjectDetail]);

    if (loading) {
        return (
            <div className={clsx(styles["empty"])}>
                <Loader />
            </div>
        );
    }

    if (!details) {
        return (
            <div className={clsx(styles["empty"])}>
                <h3>Project doesn&apos;t exist</h3>
            </div>
        );
    }

    if (manage === "true" && view === "users") {
        return (
            <ManageUsers
                details={details}
                setDetails={setDetails}
                projectName={details.projectName}
            />
        );
    }

    const createdAt = new Date(details.createdAt);

    return (
        <div className={clsx(styles["container"])}>
            <div className={clsx(styles["details"])}>
                <Heading className={typography.headlineSmall}>Details</Heading>

                <div className={clsx(styles["image"])}>
                    <img
                        src={details.cover}
                        alt={details.projectName}
                        width={200}
                        height={100}
                    />
                </div>

                <Input
                    type="text"
                    defaultValue={details.projectName}
                    isReadOnly
                    label="Project Name"
                />

                <div className={styles.item_group}>
                    <Input
                        label="Created At"
                        type="text"
                        defaultValue={createdAt.toDateString()}
                        isReadOnly
                    />

                    <Input
                        label="Public Secret Token"
                        defaultValue={details.publicToken}
                        isReadOnly
                        trailing={
                            <InputButton
                                icon={Copy}
                                onPress={() => {
                                    copyToClipboard(details.publicToken);
                                    snackbarQueue.add(
                                        { supportingText: "Token copied." },
                                        { timeout: 5000 }
                                    );
                                }}
                            />
                        }
                    />
                </div>
            </div>

            <div className={styles.category}>
                <Heading className={typography.headlineSmall}>Category</Heading>

                <Category />
            </div>

            <div className={styles.metadata}>
                <Tabs
                    selectedKey={view || "users"}
                    onSelectionChange={handleSelectionChange}
                >
                    <TabList style={{ scrollbarWidth: "none" }}>
                        <Tab id="users" label="Added Users" icon={UsersIcon} />
                        <Tab
                            id="services"
                            label="Added Services"
                            icon={Wrench}
                        />
                    </TabList>

                    <TabPanels>
                        <TabPanel id="users">
                            <UsersComp users={details.users} />
                        </TabPanel>
                        <TabPanel id="services">
                            <ServicesComp
                                details={details}
                                setDetails={setDetails}
                            />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </div>
    );
};

export default ProjectDetails;
