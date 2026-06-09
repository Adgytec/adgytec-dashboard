import clsx from "clsx";
import styles from "./createProject.module.css";
import { Form, Heading } from "react-aria-components";
import { Input, typography } from "@adgytec/adgytec-web-ui-components";

export const CreateProject = () => {
    return (
        <div className={clsx(styles["container"])}>
            <Heading
                className={clsx(styles["heading"], typography.headlineMedium)}
            >
                Create Project
            </Heading>

            <Form className={clsx(styles["form"])}>
                <Input name="projectName" />
            </Form>
        </div>
    );
};
