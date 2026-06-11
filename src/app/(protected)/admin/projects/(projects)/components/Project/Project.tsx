import {
    Splash,
    typography,
    useSplash,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { GridListItem, Heading } from "react-aria-components";
import styles from "./project.module.css";
import type { ProjectType } from "./types";

export const Project: React.FC<{ project: ProjectType }> = ({ project }) => {
    const { splashInfo, handlePress } = useSplash();
    const router = useRouter();

    return (
        <GridListItem
            className={clsx(styles["project"])}
            onAction={() => {
                router.push(`projects/${project.projectId}`);
            }}
            onPress={handlePress}
        >
            {splashInfo && <Splash {...splashInfo} />}
            <div className={clsx(styles["logo"])}>
                {/* biome-ignore lint: using native html image */}
                <img src={project.cover} width={220} height={100} />
            </div>

            <div className={clsx(styles["info"])}>
                <Heading className={clsx(typography.titleLarge)}>
                    {project.projectName}
                </Heading>
            </div>
        </GridListItem>
    );
};
