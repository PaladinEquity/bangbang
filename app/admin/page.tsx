'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getDashboardStats} from '@/services/adminService';

// Dashboard card component for metrics
const DashboardCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    <div className={`rounded-full p-3 mr-4 ${color}`}>
      <span className="text-white text-xl">{icon}</span>
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  </div>
);

// Recent activity item component
const ActivityItem = ({ type, user, time, action }: { type: string; user: string; time: string; action: string }) => (
  <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
      <span className="text-purple-600">{type[0].toUpperCase()}</span>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">{action}</p>
      <p className="text-xs text-gray-500">{user} • {time}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalWallpapers: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
    currentMonthRevenue: 0,
    monthlyStats: Array(12).fill(0),
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
  // Month names for chart
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  useEffect(() => {
    // Fetch dashboard data from admin service
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Import dynamically to avoid server-side issues
        const stats = await getDashboardStats();
        setDashboardData(stats as any);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Dashboard metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Total Users" 
          value={dashboardData.totalUsers} 
          icon="👥" 
          color="bg-blue-500" 
        />
        <DashboardCard 
          title="Total Wallpapers" 
          value={dashboardData.totalWallpapers} 
          icon="🖼️" 
          color="bg-green-500" 
        />
        <DashboardCard 
          title="Total Orders" 
          value={dashboardData.totalOrders} 
          icon="📦" 
          color="bg-amber-500" 
        />
        <DashboardCard 
          title="Pending Orders" 
          value={dashboardData.pendingOrdersCount} 
          icon="⏳" 
          color="bg-yellow-500" 
        />
      </div>

      {/* Revenue metrics */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Revenue Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-purple-800 mb-2">{currentMonth} Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">${dashboardData.currentMonthRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Monthly Statistics</h3>
            <div className="h-40 flex items-end space-x-2">
              {dashboardData.monthlyStats.map((value, index) => {
                const maxValue = Math.max(...dashboardData.monthlyStats, 1);
                const height = (value / maxValue) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-400 rounded-t" 
                      style={{ height: `${height}%` }}
                      title={`$${value.toLocaleString()}`}
                    ></div>
                    <span className="text-xs mt-1">{monthNames[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/users/create" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors">
            <div className="text-purple-600 text-2xl mb-2">👤</div>
            <div className="font-medium">Add New User</div>
          </Link>
          <Link href="/admin/products/create" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors">
            <div className="text-green-600 text-2xl mb-2">➕</div>
            <div className="font-medium">Add New Product</div>
          </Link>
          <Link href="/admin/orders" className="bg-amber-50 hover:bg-amber-100 p-4 rounded-lg text-center transition-colors">
            <div className="text-amber-600 text-2xl mb-2">📋</div>
            <div className="font-medium">View Orders</div>
          </Link>
          <Link href="/admin/analytics" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors">
            <div className="text-blue-600 text-2xl mb-2">📊</div>
            <div className="font-medium">View Analytics</div>
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div>
          {dashboardData.recentActivity.length > 0 ? (
            dashboardData.recentActivity.map((activity: any, index: number) => (
              <ActivityItem 
                key={index}
                type={activity.type}
                user={activity.user}
                time={activity.time}
                action={activity.action}
              />
            ))
          ) : (
            <p className="text-gray-500 py-4 text-center">No recent activity</p>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link href="/admin/activity" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
            View All Activity
          </Link>
        </div>
      </div>
    </div>
  );
}