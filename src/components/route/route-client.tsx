"use client";
import dynamic from "next/dynamic";
const EcoRoute = dynamic(() => import("@/components/route/eco-route"), {
    ssr: false,
});

const RouteClient = () => {
    return <EcoRoute />;
};

export default RouteClient;