import { typography } from "@adgytec/adgytec-web-ui-components";
import { clsx } from "clsx";

export const Footer = () => {
    const today = new Date();
    return (
        <footer
            style={{
                textAlign: "center",
                marginBlock: "var(--md-sys-layout-space-16)",
            }}
        >
            <small className={clsx(typography.bodySmallEmphasized)}>
                © {today.getFullYear()} Adgytec. All Rights Reserved.
            </small>
        </footer>
    );
};
