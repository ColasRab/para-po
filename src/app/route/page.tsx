import RouteClient from "@/components/route/route-client";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Route | Para Po!",
};


const RoutePage = () => {
  return <RouteClient />;
};

export default RoutePage;