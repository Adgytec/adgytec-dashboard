import { GridListItem } from "react-aria-components";
import type { ProjectType } from "./types";

export const Project: React.FC<{ project: ProjectType }> = ({ project }) => {
    return <GridListItem>{project.projectName}</GridListItem>;
};
