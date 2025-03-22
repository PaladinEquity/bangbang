'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabProps {
  href: string;
  label: string;
  isActive: boolean;
}

const Tab: React.FC<TabProps> = ({ href, label, isActive }) => {
  return (
    <Link 
      href={href} 
      className={`px-4 py-2 text-sm ${isActive 
        ? 'border-b-2 border-black font-medium' 
        : 'text-gray-600 hover:text-gray-900'}`}
    >
      {label}
    </Link>
  );
};

interface AccountTabsProps {
  activeTab: string;
}

const AccountTabs: React.FC<AccountTabsProps> = ({ activeTab }) => {
  const pathname = usePathname();
  
  const tabs = [
    { id: 'account', href: '/account?tab=account', label: 'My Account' },
    { id: 'orders', href: '/account?tab=orders', label: 'My Orders' },
    { id: 'addresses', href: '/account?tab=addresses', label: 'My Addresses' },
    { id: 'wallet', href: '/account?tab=wallet', label: 'My Wallet' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <nav className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <Tab 
            key={tab.id}
            href={tab.href}
            label={tab.label}
            isActive={activeTab === tab.id}
          />
        ))}
      </nav>
    </div>
  );
};

export default AccountTabs;