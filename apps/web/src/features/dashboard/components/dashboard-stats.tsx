'use client';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, CreditCard, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { itemVariants } from '@/components/content-card/animations/content-card-animations';
import { DashboardCard } from './dashboard-card';

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, description, icon }: StatsCardProps) => (
  <DashboardCard size="base" spacing="compact">
    <CardHeader
      data-card-header
      className="flex flex-row items-center justify-between space-y-0 pb-2 px-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between w-full gap-2"
      >
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </motion.div>
    </CardHeader>
    <CardContent data-card-content className="px-6">
      <motion.div variants={itemVariants}>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </motion.div>
    </CardContent>
  </DashboardCard>
);

export const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Revenue"
        value="$45,231.89"
        description="+20.1% from last month"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Active Users"
        value="2,350"
        description="+180.1% from last month"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Sales"
        value="12,234"
        description="+19% from last month"
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Active Now"
        value="573"
        description="+201 since last hour"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};
