import type React from "react";
import Container from "@/components/Container/Container";
import LinkHeader from "@/components/LinkHeader/LinkHeader";
import styles from "./user.module.scss";

interface UserLayoutProps {
    children: React.ReactNode;
}

const linkProps = [
    {
        href: "/admin/user",
        text: "Active Users",
    },
    {
        href: "/admin/user/create",
        text: "Create New",
    },
];

const UserLayout = ({ children }: UserLayoutProps) => {
    return (
        <div className={styles.layout}>
            <Container>
                <h1>Manage User</h1>
            </Container>

            <LinkHeader links={linkProps} />

            <Container>{children}</Container>
        </div>
    );
};

export default UserLayout;
