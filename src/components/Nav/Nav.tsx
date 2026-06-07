import {
    NavigationLink as AriaNavigationLink,
    Navigation,
    NavigationSection,
    NavigationSectionLabel,
} from "@adgytec/adgytec-web-ui-components";
import {
    Folder,
    FolderPen,
    House,
    UserRoundPen,
    UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { userRoles } from "@/helpers/type";
import { UserContext } from "../AuthContext/authContext";
import { useNavigationDocked } from "@/hooks/useNavigationDocked";

const NavigationLink: React.FC<
    Omit<React.ComponentPropsWithRef<typeof AriaNavigationLink>, "render">
> = (props) => {
    return (
        <AriaNavigationLink
            {...props}
            render={(props) => {
                if ("href" in props) {
                    return <Link {...props} />;
                }

                return <span {...props} />;
            }}
        />
    );
};

export const Nav = () => {
    const isNavigationDocked = useNavigationDocked();

    const userWithRole = useContext(UserContext);
    const role = userWithRole?.role;

    const isAdmin = role === userRoles.admin || userRoles.superAdmin;

    const pathName = usePathname();

    return (
        <Navigation
            label={isNavigationDocked ? undefined : "Adgytec"}
            stateID="dashboard"
            isLinkActive={(href) => {
                if (!href) return false;
                return pathName.includes(href);
            }}
        >
            <NavigationSection>
                <NavigationSectionLabel>General</NavigationSectionLabel>

                <NavigationLink
                    href="/"
                    label="Home"
                    icon={House}
                    isActive={pathName === "/"}
                />

                <NavigationLink
                    href="/profile"
                    label="Edit Profile"
                    icon={UserRoundPen}
                />
            </NavigationSection>

            {isAdmin && (
                <NavigationSection>
                    <NavigationSectionLabel>
                        Administration
                    </NavigationSectionLabel>

                    <NavigationLink
                        href="/admin/user"
                        label="Users"
                        icon={UsersRound}
                    />

                    <NavigationLink
                        href="/admin/project"
                        label="Projects"
                        icon={FolderPen}
                    />
                </NavigationSection>
            )}

            <NavigationSection>
                <NavigationSectionLabel>Workspace</NavigationSectionLabel>

                <NavigationLink
                    href="/projects"
                    label="My Projects"
                    icon={Folder}
                />
            </NavigationSection>
        </Navigation>
    );
};
