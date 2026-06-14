"use client";

import { useParams } from "next/navigation";

const Newsletter = () => {
    const _params = useParams<{ projectId: string }>();
    return <div>Newsletter</div>;
};

export default Newsletter;
