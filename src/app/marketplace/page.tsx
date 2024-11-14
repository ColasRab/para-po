// app/marketplace/page.tsx
import { TransportMarketplaceComponent } from "@/components/marketplace/marketplace";
import { db } from "@/db/index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace | Para Po!",
};

export type Rewards = Awaited<ReturnType<typeof getRewards>>;

async function getRewards() {
  return await db.reward.findMany({
    select: {
      id: true,
      name: true,
      points: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      points: "asc",
    },
  });
}

export default async function MarketplacePage() {
  const rewards = await getRewards();

  return (
    <TransportMarketplaceComponent
      props={{
        rewards,
      }}
    />
  );
}
