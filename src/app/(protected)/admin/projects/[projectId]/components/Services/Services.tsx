import {
    Button,
    ModalOverlay,
    SearchField,
    SideSheet,
    SideSheetModal,
    Tag,
    useSnackbarQueue,
} from "@adgytec/adgytec-web-ui-components";
import { useParams } from "next/navigation";
import type React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TagGroup, TagList } from "react-aria-components";

import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import type { ProjectDetails } from "../../page";
import styles from "./services.module.scss";

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

    const [isManageOpen, setIsManageOpen] = useState(false);
    const addedServices = details.services;
    const params = useParams<{ projectId: string }>();
    const snackbarQueue = useSnackbarQueue();

    const [services, setServices] = useState<ServiceObj[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

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
                snackbarQueue.add({ supportingText: err.message });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user, snackbarQueue]);

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

                snackbarQueue.add(
                    {
                        supportingText:
                            "successfully removed service from project",
                    },
                    { timeout: 5000 }
                );

                setDetails((prev) => {
                    if (!prev) return null;

                    prev.services = prev.services.filter(
                        (s) => s.serviceId !== serviceId
                    );
                    return prev;
                });
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => setRemoving(""));
    };

    const handleAddServices = async () => {
        if (selectedServices.length === 0) {
            setError("No services selected");
            return;
        }

        const serviceToAdd = selectedServices;

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

                snackbarQueue.add(
                    {
                        supportingText: "successfully added service to project",
                    },
                    { timeout: 5000 }
                );

                setSelectedServices([]);

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
                setError(err.message);
            })
            .finally(() => setAdding(false));
    };

    const filteredServicesToAdd = useMemo(() => {
        return services.filter((service) => {
            if (addedServices?.some((s) => s.serviceId === service.serviceId)) {
                return false;
            }
            if (search.length === 0) {
                return true;
            }
            return service.serviceName
                .toLowerCase()
                .includes(search.toLowerCase());
        });
    }, [services, addedServices, search]);

    return (
        <>
            <ModalOverlay
                isOpen={isManageOpen}
                onOpenChange={setIsManageOpen}
                isKeyboardDismissDisabled={adding}
            >
                <SideSheetModal>
                    <SideSheet
                        headline="Manage Services"
                        actions={[
                            <Button
                                key="add"
                                isPending={adding}
                                isDisabled={selectedServices.length === 0}
                                onPress={handleAddServices}
                                color="tonal"
                            >
                                Add services
                            </Button>,
                            <Button
                                key="cancel"
                                isDisabled={adding}
                                onPress={() => setIsManageOpen(false)}
                                color="text"
                            >
                                Cancel
                            </Button>,
                        ]}
                    >
                        {() => (
                            <div className={styles.modal_content}>
                                <div className={styles.added}>
                                    <div className={styles.title}>
                                        <h3>Added Services</h3>
                                    </div>

                                    {!addedServices ||
                                    addedServices.length === 0 ? (
                                        <div className={styles.empty}>
                                            <h4>No services added</h4>
                                        </div>
                                    ) : (
                                        <TagGroup
                                            aria-label="Added services"
                                            onRemove={(keys) => {
                                                const serviceId = keys
                                                    .values()
                                                    .next().value;
                                                if (
                                                    typeof serviceId ===
                                                    "string"
                                                ) {
                                                    handleRemoveSerice(
                                                        serviceId
                                                    );
                                                }
                                            }}
                                        >
                                            <TagList
                                                className={styles.items}
                                                items={addedServices}
                                            >
                                                {(service) => (
                                                    <Tag
                                                        id={service.serviceId}
                                                        label={
                                                            service.serviceName
                                                        }
                                                        isDisabled={
                                                            removing.length >
                                                                0 &&
                                                            removing !==
                                                                service.serviceId
                                                        }
                                                        avatar={
                                                            <img
                                                                src={
                                                                    service.icon
                                                                }
                                                                alt=""
                                                                width={17}
                                                                height={17}
                                                            />
                                                        }
                                                    />
                                                )}
                                            </TagList>
                                        </TagGroup>
                                    )}
                                </div>

                                <div className={styles.toAdd}>
                                    <div className={styles.title}>
                                        <h3>Add Services</h3>

                                        <SearchField
                                            placeholder="Search Services"
                                            value={search}
                                            onChange={setSearch}
                                            isDisabled={adding}
                                        />
                                    </div>

                                    {loading ? (
                                        <div className={styles.load}>
                                            <Loader variant="small" />
                                        </div>
                                    ) : filteredServicesToAdd.length === 0 ? (
                                        <div className={styles.empty}>
                                            <h4>No services to add</h4>
                                        </div>
                                    ) : (
                                        <TagGroup
                                            aria-label="Services to add"
                                            selectionMode="multiple"
                                            selectedKeys={
                                                new Set(selectedServices)
                                            }
                                            onSelectionChange={(keys) => {
                                                if (keys === "all") return;
                                                setSelectedServices(
                                                    Array.from(keys) as string[]
                                                );
                                            }}
                                        >
                                            <TagList
                                                className={styles.items}
                                                items={filteredServicesToAdd}
                                            >
                                                {(service) => (
                                                    <Tag
                                                        id={service.serviceId}
                                                        label={
                                                            service.serviceName
                                                        }
                                                        avatar={
                                                            <img
                                                                src={
                                                                    service.icon
                                                                }
                                                                alt=""
                                                                width={17}
                                                                height={17}
                                                            />
                                                        }
                                                    />
                                                )}
                                            </TagList>
                                        </TagGroup>
                                    )}
                                </div>

                                {error && <p className="error">{error}</p>}
                            </div>
                        )}
                    </SideSheet>
                </SideSheetModal>
            </ModalOverlay>

            <div className={styles.services}>
                <div className={styles.action}>
                    <Button color="tonal" onPress={() => setIsManageOpen(true)}>
                        Manage Services
                    </Button>
                </div>

                {addedServices.length === 0 ? (
                    <div data-empty="true">
                        <h3>No services are added</h3>
                    </div>
                ) : (
                    <TagGroup aria-label="Added Services">
                        <TagList className={styles.list} items={addedServices}>
                            {(service) => (
                                <Tag
                                    id={service.serviceId}
                                    label={service.serviceName}
                                    avatar={
                                        <img
                                            src={service.icon}
                                            alt=""
                                            width={17}
                                            height={17}
                                        />
                                    }
                                />
                            )}
                        </TagList>
                    </TagGroup>
                )}
            </div>
        </>
    );
};

export default AddedServices;
