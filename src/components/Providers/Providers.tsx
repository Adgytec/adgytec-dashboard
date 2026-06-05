"use client";

import {
    SnackbarRegion,
    ThemeProvider,
} from "@adgytec/adgytec-web-ui-components";
import type { ReactNode } from "react";

export const Providers: React.FC<{ children?: ReactNode }> = ({ children }) => {
    return (
        <ThemeProvider>
            <SnackbarRegion>{children}</SnackbarRegion>
        </ThemeProvider>
    );
};
