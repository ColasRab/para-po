// app/profile/page.tsx
import { ProfilePageComponent } from "@/components/profile/profile-page";
import { db } from "@/db/index";
import { authOptions } from "@/server/auth";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | Para Po!",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/");
  }

  // Fetch data only if we have a session
  const [savedTrips, userTrips] = await Promise.all([
    db.savedTrip.findMany({
      where: {
        createdById: session.user.id,
      },
    }),
    db.userTrip.findMany({
      where: {
        createdById: session.user.id,
      },
    }),
  ]);

  return (
    <ProfilePageComponent
      props={{
        savedTrips,
        userTrips,
      }}
    />
  );
}
