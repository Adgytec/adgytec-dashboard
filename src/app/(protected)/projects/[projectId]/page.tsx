"use client";

import { typography } from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";

const Project = () => {
    return (
        <div className={clsx(typography.bodyLarge)}>
            <p>Select a service above to get started.</p>

            <p>
                If there are no services, please contact us at{" "}
                <a
                    href="mailto:info@adgytec.in"
                    data-type="link"
                    data-variant="secondary"
                >
                    info@adgytec.in
                </a>
            </p>
        </div>
    );
};

export default Project;
