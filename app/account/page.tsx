'use client';

import React, { useState, useEffect, Suspense } from 'react';
import RouteProtection from '../../components/auth/RouteProtection';
import { useSearchParams } from 'next/navigation';
import AccountTabs from '../../components/AccountTabs';

// Import components from existing pages
import MyAccountContent from '../../components/account/MyAccountContent';
import MyOrdersContent from '../../components/account/MyOrdersContent';
import MyAddressesContent from '../../components/account/MyAddressesContent';
import MyWalletContent from '../../components/account/MyWalletContent';

function AccountPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('account');
  
  useEffect(() => {
    // Get the tab from URL query parameter or default to 'account'
    const tab = searchParams.get('tab') || 'account';
    setActiveTab(tab);
  }, [searchParams]);

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <MyOrdersContent />;
      case 'addresses':
        return <MyAddressesContent />;
      case 'wallet':
        return <MyWalletContent />;
      case 'account':
      default:
        return <MyAccountContent />;
    }
  };

  // Get the heading based on the active tab
  const getHeading = () => {
    switch (activeTab) {
      case 'orders':
        return 'My Orders';
      case 'addresses':
        return 'My Addresses';
      case 'wallet':
        return 'My Wallet';
      case 'account':
      default:
        return 'My Account';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-10">
      <h1 className="text-2xl font-bold mb-6">{getHeading()}</h1>
      <AccountTabs activeTab={activeTab} />
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <RouteProtection requireAuth={true}>
      <Suspense fallback={<div>Loading...</div>}>
        <AccountPageContent />
      </Suspense>
    </RouteProtection>
  );
}