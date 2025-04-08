/**
 * Analytics related type definitions
 */

// Monthly sales data type
export type MonthlySales = {
  month: string;
  sales: number;
};

// Product sales data type
export type ProductSales = {
  name: string;
  sales: number;
  revenue: number;
};

// User statistics type
export type UserStats = {
  total: number;
  newThisMonth: number;
  activeThisMonth: number;
  conversionRate: number;
};

// Order statistics type
export type OrderStats = {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
};

// Complete analytics data type
export type AnalyticsData = {
  salesOverTime: MonthlySales[];
  topProducts: ProductSales[];
  userStats: UserStats;
  orderStats: OrderStats;
};

// Monthly revenue data returned from API
export type MonthlyRevenue = Record<string, number>;

// Bar chart component props
export type BarChartProps = {
  data: any[];
  xKey: string;
  yKey: string;
  title: string;
};

// Stat card component props
export type StatCardProps = {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
};

// Progress bar component props
export type ProgressBarProps = {
  label: string;
  value: number;
  max: number;
  color: string;
};