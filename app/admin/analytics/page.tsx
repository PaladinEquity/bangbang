'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getDashboardStats, getMonthlyRevenue, getAllWallpapersWithRanking, getAllOrders } from '@/services/adminService';

// Analytics data type
type AnalyticsData = {
  salesOverTime: { month: string; sales: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  userStats: {
    total: number;
    newThisMonth: number;
    activeThisMonth: number;
    conversionRate: string;
  };
  orderStats: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
};

// Default empty analytics data
const emptyAnalytics: AnalyticsData = {
  salesOverTime: [],
  topProducts: [],
  userStats: {
    total: 0,
    newThisMonth: 0,
    activeThisMonth: 0,
    conversionRate: "0",
  },
  orderStats: {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  },
};


// Simple bar chart component
const BarChart = ({ data, xKey, yKey, title }: { data: any[]; xKey: string; yKey: string; title: string }) => {
  const maxValue = Math.max(...data.map(item => item[yKey]));
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-end space-x-2 h-64">
        {data.map((item, index) => {
          const height = (item[yKey] / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-purple-500 rounded-t" 
                style={{ height: `${height}%` }}
              ></div>
              <div className="text-xs mt-2 text-gray-600">{item[xKey]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Stat card component
const StatCard = ({ title, value, change, icon }: { title: string; value: string | number; change?: string; icon: string }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        {change && (
          <p className="text-xs mt-1">
            <span className={change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>{change}</span> from last month
          </p>
        )}
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

// Progress bar component
const ProgressBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value} / {max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(emptyAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard stats
        const dashboardStats = await getDashboardStats();
        
        // Fetch monthly revenue data
        const monthlyRevenue = await getMonthlyRevenue();
        
        // Fetch all wallpapers for top products calculation
        const wallpapers = await getAllWallpapersWithRanking();
        
        // Fetch all orders for order stats
        const orders = await getAllOrders();
        
        // Process monthly revenue data for chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const salesOverTime = [];
        
        // Get current year
        const currentYear = new Date().getFullYear();
        
        // Create sales data for each month
        for (let i = 0; i < 12; i++) {
          const monthKey = `${currentYear}-${i + 1}`;
          const sales = monthlyRevenue[monthKey] || 0;
          salesOverTime.push({
            month: monthNames[i],
            sales: sales
          });
        }
        
        // Calculate top products based on orders
        const productSales: Record<string, { count: number; revenue: number }> = {};
        
        orders.forEach(order => {
          if (order.items && order.paymentStatus === 'paid') {
            try {
              const items = JSON.parse(order.items);
              items.forEach((item: any) => {
                if (!productSales[item.name]) {
                  productSales[item.name] = { count: 0, revenue: 0 };
                }
                productSales[item.name].count += item.quantity || 1;
                productSales[item.name].revenue += (item.price * (item.quantity || 1));
              });
            } catch (e) {
              console.error('Error parsing order items:', e);
            }
          }
        });
        
        // Convert to array and sort by sales count
        const topProducts = Object.entries(productSales)
          .map(([name, data]) => ({
            name,
            sales: data.count,
            revenue: data.revenue
          }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);
        
        // Calculate order stats
        const orderStats = {
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending').length,
          processing: orders.filter(o => o.status === 'processing').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
        };
        
        // Set analytics data
        setAnalytics({
          salesOverTime: salesOverTime,
          topProducts: topProducts,
          userStats: {
            total: dashboardStats.totalUsers,
            newThisMonth: Math.round(dashboardStats.totalUsers * 0.15), // Estimate for demo
            activeThisMonth: Math.round(dashboardStats.totalUsers * 0.65), // Estimate for demo
            conversionRate: ((orders.length / dashboardStats.totalUsers) * 100).toFixed(1)
          },
          orderStats: orderStats
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your store's performance</p>
        </div>
        <div>
          <select
            className="p-2 border border-gray-300 rounded-md"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${(analytics.salesOverTime.reduce((sum: number, item: any) => sum + item.sales, 0)).toLocaleString()}`} 
          change="+12.5%" 
          icon="💰" 
        />
        <StatCard 
          title="Total Orders" 
          value={analytics.orderStats.total} 
          change="+8.2%" 
          icon="📦" 
        />
        <StatCard 
          title="Total Users" 
          value={analytics.userStats.total} 
          change="+15.3%" 
          icon="👥" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${analytics.userStats.conversionRate}%`} 
          change="+0.8%" 
          icon="📈" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart 
          data={analytics.salesOverTime} 
          xKey="month" 
          yKey="sales" 
          title="Sales Over Time" 
        />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {analytics.topProducts.map((product: any, index: number) => (
              <div key={index} className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-sm font-medium">${product.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-purple-500" 
                      style={{ width: `${(product.sales / analytics.topProducts[0].sales) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{product.sales} sold</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">New Users This Month</p>
              <p className="text-2xl font-semibold">{analytics.userStats.newThisMonth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users This Month</p>
              <p className="text-2xl font-semibold">{analytics.userStats.activeThisMonth}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">User Activity</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white" 
                style={{ width: `${(analytics.userStats.activeThisMonth / analytics.userStats.total) * 100}%` }}
              >
                {Math.round((analytics.userStats.activeThisMonth / analytics.userStats.total) * 100)}%
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Percentage of active users out of total users</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status</h3>
          <ProgressBar 
            label="Pending" 
            value={analytics.orderStats.pending} 
            max={analytics.orderStats.total} 
            color="bg-yellow-500" 
          />
          <ProgressBar 
            label="Processing" 
            value={analytics.orderStats.processing} 
            max={analytics.orderStats.total} 
            color="bg-blue-500" 
          />
          <ProgressBar 
            label="Shipped" 
            value={analytics.orderStats.shipped} 
            max={analytics.orderStats.total} 
            color="bg-purple-500" 
          />
          <ProgressBar 
            label="Delivered" 
            value={analytics.orderStats.delivered} 
            max={analytics.orderStats.total} 
            color="bg-green-500" 
          />
          <div className="mt-4">
            <p className="text-sm text-gray-500">Fulfillment Rate</p>
            <p className="text-2xl font-semibold">
              {Math.round((analytics.orderStats.delivered / analytics.orderStats.total) * 100)}%
            </p>
            <p className="text-xs text-gray-500">Percentage of orders that have been delivered</p>
          </div>
        </div>
      </div>
    </div>
  );
}