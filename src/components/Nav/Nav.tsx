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
import type { ProjectType } from "@/app/(protected)/admin/projects/(projects)/components/Project/types";
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

export const Nav = ({ projects }: { projects?: ProjectType[] }) => {
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
                return pathName.startsWith(prefix);
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
                            prefix="/admin/projects"
                            icon={FolderPen}
                        />

                        <SubNavigation>
                            <NavigationLink
                                isActive={
                                    pathName.startsWith("/admin/projects") &&
                                    pathName !== "/admin/projects/create"
                                }
                                href="/admin/projects"
                                label="Projects"
                                icon={FolderPen}
                            />

                            <NavigationLink
                                href="/admin/projects/create"
                                label="Create Project"
                                icon={FolderPlus}
                            />
                        </SubNavigation>
                    </SubNavigationTrigger>
                </NavigationSection>
            )}

            <NavigationSection>
                <NavigationSectionLabel>Workspace</NavigationSectionLabel>

                {projects && projects.length > 0 ? (
                    <SubNavigationTrigger
                        stateID="workspace-projects"
                        label="My Projects"
                    >
                        <NavigationButton prefix="/projects" icon={Folder} />

                        <SubNavigation>
                            <NavigationLink
                                isActive={
                                    pathName === "/projects" ||
                                    pathName === "/projects/"
                                }
                                href="/projects"
                                label="All Projects"
                            />

                            {projects.map((project) => (
                                <NavigationLink
                                    key={project.projectId}
                                    isActive={pathName.startsWith(
                                        `/projects/${project.projectId}`
                                    )}
                                    href={`/projects/${project.projectId}`}
                                    label={project.projectName}
                                />
                            ))}
                        </SubNavigation>
                    </SubNavigationTrigger>
                ) : (
                    <NavigationLink
                        href="/projects"
                        label="My Projects"
                        icon={Folder}
                        isActive={pathName === "/projects"}
                    />
                )}
            </NavigationSection>
        </Navigation>
    );
};
