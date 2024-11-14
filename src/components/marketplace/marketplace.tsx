'use client';

import { Rewards } from "@/app/marketplace/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, Coffee, Gift, ShoppingBag, Zap } from 'lucide-react';
import { useState } from 'react';

const rewardCategories = [
  { name: 'Transport', icon: <Bus className="h-6 w-6" /> },
  { name: 'Food', icon: <Coffee className="h-6 w-6" /> },
  { name: 'Shopping', icon: <ShoppingBag className="h-6 w-6" /> },
  { name: 'Entertainment', icon: <Gift className="h-6 w-6" /> },
];

const featuredDeals = [
  { name: 'Double Points Weekend', description: 'Earn 2x points on all rides this weekend', icon: <Zap className="h-6 w-6" /> },
  { name: 'Flash Sale: 50% Off Rewards', description: 'Limited time offer on select items', icon: <Gift className="h-6 w-6" /> },
];
interface Props {
  props: {
    rewards: Rewards;
  };
}
const TransportMarketplaceComponent: React.FC<Props> = ({ props: { rewards } }) => {
  const [points] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredRewards = selectedCategory === 'All'
    ? rewards
    : rewards.filter(item => item.category.name === selectedCategory);

  const pointsToNextReward = rewards.find(reward => reward.points > points)?.points;
  const progressTilNextReward = pointsToNextReward
    ? (points / pointsToNextReward) * 100
    : 100;
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Your Points</span>
              <span className="text-2xl font-bold">{points} pts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressTilNextReward} />
            <p className="text-sm text-muted-foreground mt-2">
              {pointsToNextReward
                ? `You need ${pointsToNextReward - points} more points to reach your next reward`
                : 'You have enough points to redeem any reward'}

            </p>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Featured Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredDeals.map((deal, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-center">
                  <div className="mr-4 bg-primary text-primary-foreground p-2 rounded-full">
                    {deal.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{deal.name}</h3>
                    <p className="text-sm text-muted-foreground">{deal.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="rewards">
          <TabsList>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="earn">Earn Points</TabsTrigger>
          </TabsList>
          <TabsContent value="rewards">
            <div className="mb-4 flex space-x-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('All')}
              >
                All
              </Button>
              {rewardCategories.map((category, index) => (
                <Button
                  key={index}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.icon}
                  <span className="ml-2">{category.name}</span>
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRewards.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-2">
                      {rewardCategories.find(category => category.name === item.category.name)?.icon}
                    </div>
                    <h3 className="font-semibold text-center">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.points} points</p>
                    <Badge variant="secondary" className="mt-2">{item.category.name}</Badge>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={points < item.points}>Redeem</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="earn">
            <Card>
              <CardHeader>
                <CardTitle>How to Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use public transport: 100 points per ride</li>
                  <li>Refer a friend: 1000 points</li>
                  <li>Complete surveys: 100-500 points per survey</li>
                  <li>Participate in eco-challenges: Up to 2000 points</li>
                  <li>Use partner services: Varies by partner</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export { TransportMarketplaceComponent };
