import {
    NavigationLink as AriaNavigationLink,
    Navigation,
    NavigationButton,
    NavigationSection,
    NavigationSectionLabel,
    SubNavigation,
    SubNavigationTrigger,
} from "@adgytec/adgytec-web-ui-components";
import {
    Folder,
    FolderPen,
    FolderPlus,
    House,
    UserRoundPen,
    UserRoundPlus,
    UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { userRoles } from "@/helpers/type";
import { useNavigationDocked } from "@/hooks/useNavigationDocked";
import { UserContext } from "../AuthContext/authContext";

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

    const isAdmin = role === userRoles.admin || role === userRoles.superAdmin;

    const pathName = usePathname();

    return (
        <Navigation
            label={isNavigationDocked ? undefined : "Adgytec"}
            stateID="dashboard"
            isLinkActive={(href) => {
                return pathName === href;
            }}
            isButtonActive={(prefix) => {
                if (!prefix) return false;
                return pathName.includes(prefix);
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
                    href="/edit-profile"
                    label="Edit Profile"
                    icon={UserRoundPen}
                />
            </NavigationSection>

            {isAdmin && (
                <NavigationSection>
                    <NavigationSectionLabel>
                        Administration
                    </NavigationSectionLabel>

                    <SubNavigationTrigger stateID="admin-users" label="Users">
                        <NavigationButton
                            prefix="/admin/user"
                            icon={UsersRound}
                        />

                        <SubNavigation>
                            <NavigationLink
                                href="/admin/user"
                                label="Users"
                                icon={UsersRound}
                            />

                            <NavigationLink
                                href="/admin/user/create"
                                label="Create User"
                                icon={UserRoundPlus}
                            />
                        </SubNavigation>
                    </SubNavigationTrigger>

                    <SubNavigationTrigger
                        stateID="admin-projects"
                        label="Projects"
                    >
                        <NavigationButton
                            prefix="/admin/project"
                            icon={FolderPen}
                        />

                        <SubNavigation>
                            <NavigationLink
                                isActive={pathName.startsWith("/admin/project")}
                                href="/admin/project"
                                label="Projects"
                                icon={FolderPen}
                            />

                            <NavigationLink
                                href="/admin/project/create"
                                label="Create Project"
                                icon={FolderPlus}
                            />
                        </SubNavigation>
                    </SubNavigationTrigger>
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
