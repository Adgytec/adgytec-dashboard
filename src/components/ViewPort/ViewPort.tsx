"use client";

import { useEffect } from "react";

const ViewPort = () => {
    useEffect(() => {
        // removes classic scroll bar problem
        new ResizeObserver(() => {
            const vw = document.documentElement.clientWidth / 100;
            document.documentElement.style.setProperty("--vw", `${vw}px`);
        }).observe(document.documentElement);
    }, []);

    return <></>;
};

export default ViewPort;
