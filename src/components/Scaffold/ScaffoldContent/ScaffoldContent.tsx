import type { ReactNode } from "react";

export const ScaffoldContent: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    return <div>{children}</div>;
};
