"use client";

import { typography } from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import type React from "react";
import { useContext } from "react";
import { Text } from "react-aria-components";
import { UserContext } from "@/components/AuthContext/authContext";
import Loader from "@/components/Loader/Loader";
import { userRoles } from "@/helpers/type";

interface AdminLayoutProps {
    children: React.ReactNode;
}
const AdminLayout = ({ children }: AdminLayoutProps) => {
    const userWithRole = useContext(UserContext);
    const role = userWithRole?.role;

    if (role === "") {
        return (
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                    blockSize: "50svb",
                }}
            >
                <Loader />
            </div>
        );
    }

    if (role === userRoles.user) {
        return (
            <div>
                <Text className={clsx(typography.bodyLarge)}>
                    This Page Isn't Available to Your Account
                </Text>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminLayout;
