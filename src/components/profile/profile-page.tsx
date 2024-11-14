'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavedTrip, UserTrip } from "@prisma/client";
import { Bell, Calendar, ChevronRight, CreditCard, HelpCircle, Lock, LogOut, Map, Plus, Settings, Ticket } from 'lucide-react';
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from 'react';
import AvatarComponent from "../nav/avatar";

interface Props {
  props: {
    savedTrips: SavedTrip[];
    userTrips: UserTrip[];
  };
}

const ProfilePageComponent: React.FC<Props> = ({ props: { savedTrips, userTrips } }) => {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-grow p-4 lg:p-8 space-y-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-3">
          {/* User Info */}
          <Card className="lg:col-span-1">
            <CardContent className="flex flex-col items-center space-y-4 pt-6">
              <AvatarComponent className="h-24 w-24" />
              <div className="text-center">
                <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                <p className="text-muted-foreground">{session?.user?.email}</p>
              </div>
              <div className="w-full">
                <h3 className="font-semibold mb-2">Quick Stats</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-bold">152</p>
                    <p className="text-xs text-muted-foreground">Trips</p>
                  </div>
                  <div>
                    <p className="font-bold">{session?.user.rewardPoints}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div>
                    <p className="font-bold">3</p>
                    <p className="text-xs text-muted-foreground">Rewards</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="activity" className="space-y-4">
                {/* Travel History */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Trips</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {
                        userTrips.map((trip, index) => (
                          <TripItem
                            key={index}
                            origin={trip.origin}
                            destination={trip.destination}
                            date={trip.createdAt.toDateString()}
                            distance={trip.distance.toString()}
                            duration={trip.duration.toString()}
                            carbonSaved={trip.carbonSaved.toString()}
                          />
                        ))
                      }
                    </ul>
                  </CardContent>
                </Card>

                {/* Saved Routes */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saved Routes</CardTitle>
                    <Button variant="ghost" size="sm">
                      Add New <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {
                        savedTrips.map((trip, index) => (
                          <SavedRoute key={index} origin={trip.origin} destination={trip.destination} />
                        ))
                      }
                    </ul>
                  </CardContent>
                </Card>

                {/* Upcoming Trips */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
                    <Button variant="ghost" size="sm">
                      Schedule <Calendar className="ml-2 h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <UpcomingTrip
                        from="Home"
                        to="Office"
                        date="May 20, 2023"
                        time="08:30 AM"
                      />
                      <UpcomingTrip
                        from="Office"
                        to="Home"
                        date="May 20, 2023"
                        time="06:00 PM"
                      />
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rewards" className="space-y-4">
                {/* Points Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>MetroMove Points</CardTitle>
                    <CardDescription>Earn and redeem for rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Link href="/marketplace" className="w-full">View Rewards Catalog</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Rewards */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Rewards</CardTitle>
                    <Button variant="ghost" size="sm">
                      Redeem <Ticket className="ml-2 h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <RewardItem
                        name="Free Day Pass"
                        date="Apr 30, 2023"
                        points="1,000"
                        status="Active"
                      />
                      <RewardItem
                        name="50% Off Next Ride"
                        date="Apr 15, 2023"
                        points="500"
                        status="Used"
                      />
                      <RewardItem
                        name="Partner Store Voucher"
                        date="Mar 28, 2023"
                        points="750"
                        status="Expired"
                      />
                    </ul>
                  </CardContent>
                </Card>

                {/* Available Rewards */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
                    <Button variant="ghost" size="sm">
                      See All <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <AvailableReward
                        name="Free Weekend Pass"
                        points="3,000"
                        description="Unlimited rides for an entire weekend"
                      />
                      <AvailableReward
                        name="Coffee Shop Discount"
                        points="1,500"
                        description="20% off at partner coffee shops"
                      />
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="payments" className="space-y-4">
                {/* Payment Methods */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
                    <Button variant="ghost" size="sm">
                      Add New <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <PaymentMethod name="Beep™ Card" last4="3456" isDefault={true} />
                      <PaymentMethod name="Maya" last4="7890" />
                      <PaymentMethod name="GCash" last4="1234" />
                    </ul>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <TransactionItem
                        description="Ride from Quezon Avenue to Ayala"
                        date="May 15, 2023"
                        amount="₱25"
                        method="Beep™ Card"
                      />
                      <TransactionItem
                        description="50% Off Coupon Redemption"
                        date="May 14, 2023"
                        amount="₱15"
                        method="Reward"
                      />
                      <TransactionItem
                        description="Ride from North Avenue to Taft Avenue"
                        date="May 14, 2023"
                        amount="₱30"
                        method="Maya"
                      />
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4">
                {/* Account Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <SettingsItem icon={<Settings className="h-5 w-5" />} label="Preferences" />
                      <SettingsItem icon={<Bell className="h-5 w-5" />} label="Notifications" />
                      <SettingsItem icon={<Lock className="h-5 w-5" />} label="Privacy & Security" />
                      <SettingsItem icon={<HelpCircle className="h-5 w-5" />} label="Help & Support" />
                      <SettingsItem icon={<LogOut className="h-5 w-5" />} label="Sign Out" onClick={async () => {
                        await signOut();
                      }} />
                    </ul>
                  </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <NotificationPreference
                        label="Email Notifications"
                        description="Receive updates and promotions via email"
                      />
                      <NotificationPreference
                        label="Push Notifications"
                        description="Get real-time updates on your mobile device"
                      />
                      <NotificationPreference
                        label="SMS Notifications"
                        description="Receive text messages for important alerts"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

function TripItem({ origin, destination, date, distance, duration, carbonSaved }: { origin: string; destination: string; date: string; distance: string; duration: string; carbonSaved: string; }) {
  return (
    <li className="flex justify-between items-center">
      <div>
        <p className="font-semibold">{origin} to {destination}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <div>
        <p className="font-bold">{distance} km • {duration}</p>
        <p className="text-sm text-muted-foreground">{carbonSaved} kg CO2 saved</p>
      </div>
    </li>
  );
}

function SavedRoute({ origin, destination }: { origin: string; destination: string; }) {
  return (
    <li className="flex justify-between  items-center">
      <span>{origin} to {destination}</span>
      <Button variant="ghost" size="sm">
        <Map className="h-4 w-4" />
      </Button>
    </li>
  );
}

function RewardItem({ name, date, points, status }: { name: string; date: string; points: string; status: string; }) {
  return (
    <li className="flex justify-between items-center">
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <div className="text-right">
        <span className="font-bold">{points} pts</span>
        <Badge variant={status === 'Active' ? 'default' : status === 'Used' ? 'secondary' : 'outline'} className="ml-2">
          {status}
        </Badge>
      </div>
    </li>
  );
}

function PaymentMethod({ name, last4, isDefault = false }: { name: string; last4: string; isDefault?: boolean; }) {
  return (
    <li className="flex justify-between items-center">
      <div className="flex items-center">
        <CreditCard className="h-5 w-5 mr-2" />
        <span>{name}</span>
        {isDefault && <Badge className="ml-2">Default</Badge>}
      </div>
      <span className="text-muted-foreground">•••• {last4}</span>
    </li>
  );
}

function SettingsItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void; }) {
  return (
    <li>
      <Button variant="ghost" className="w-full justify-start" onClick={onClick}>
        {icon}
        <span className="ml-2">{label}</span>
      </Button>
    </li>
  );
}

function UpcomingTrip({ from, to, date, time }: { from: string; to: string; date: string; time: string; }) {
  return (
    <li className="flex justify-between items-center">
      <div>
        <p className="font-semibold">{from} to {to}</p>
        <p className="text-sm text-muted-foreground">{date} at {time}</p>
      </div>
      <Button variant="outline" size="sm">Modify</Button>
    </li>
  );
}

function AvailableReward({ name, points, description }: { name: string; points: string; description: string; }) {
  return (
    <li className="flex justify-between items-center">
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm">{points} pts</Button>
    </li>
  );
}

function TransactionItem({ description, date, amount, method }: { description: string; date: string; amount: string; method: string; }) {
  return (
    <li className="flex justify-between items-center">
      <div>
        <p className="font-semibold">{description}</p>
        <p className="text-sm text-muted-foreground">{date} • {method}</p>
      </div>
      <span className="font-bold">{amount}</span>
    </li>
  );
}

function NotificationPreference({ label, description }: { label: string; description: string; }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={label} className="text-base">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <input
        type="checkbox"
        id={label}
        className="toggle"
        defaultChecked
      />
    </div>
  );
}

export { ProfilePageComponent };
