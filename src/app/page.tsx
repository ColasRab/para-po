import Landing from "@/components/home/landing";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Home | Para Po!",
};
export default function Home() {
  return (
    <>
      <Landing />
    </>
  );
}
