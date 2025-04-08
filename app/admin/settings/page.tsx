'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

// Tab component for settings navigation
const SettingsTab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    className={`px-4 py-2 font-medium rounded-t-lg ${active ? 'bg-white text-purple-600 border-b-2 border-purple-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Form section component
const FormSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    {description && <p className="text-gray-600 mb-4">{description}</p>}
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// Form input component
const FormInput = ({ 
  label, 
  type = 'text', 
  id, 
  value, 
  onChange,
  placeholder = '',
  required = false,
  helpText = ''
}: { 
  label: string; 
  type?: string; 
  id: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
    />
    {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
  </div>
);

// Form select component
const FormSelect = ({ 
  label, 
  id, 
  value, 
  onChange,
  options,
  required = false,
  helpText = ''
}: { 
  label: string; 
  id: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: {value: string; label: string}[];
  required?: boolean;
  helpText?: string;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
  </div>
);

// Form toggle component
const FormToggle = ({ 
  label, 
  id, 
  checked, 
  onChange,
  helpText = ''
}: { 
  label: string; 
  id: string; 
  checked: boolean; 
  onChange: () => void;
  helpText?: string;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
    <button
      type="button"
      id={id}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${checked ? 'bg-purple-600' : 'bg-gray-200'}`}
    >
      <span className="sr-only">Toggle {label}</span>
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} 
      />
    </button>
  </div>
);

export default function SettingsPage() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('general');
  
  // State for form values
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Killer Walls',
    siteDescription: 'Custom wallpaper designs that make a statement',
    contactEmail: 'support@killerwalls.com',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Design St, Creative City, CA 94103',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    paypalEnabled: false,
    bankTransferEnabled: false,
    stripePublicKey: 'pk_test_sample',
    stripeSecretKey: '••••••••••••••••••••••',
    paypalClientId: '',
    paypalClientSecret: '',
  });
  
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingEnabled: true,
    freeShippingThreshold: '100',
    flatRateEnabled: true,
    flatRateAmount: '15',
    internationalShippingEnabled: false,
    internationalShippingAmount: '50',
  });
  
  const [emailSettings, setEmailSettings] = useState({
    orderConfirmationEnabled: true,
    shippingConfirmationEnabled: true,
    abandonedCartEnabled: false,
    marketingEmailsEnabled: true,
    emailSender: 'noreply@killerwalls.com',
    emailFooter: '© 2023 Killer Walls. All rights reserved.',
  });

  // Handle general settings change
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle payment settings change
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle payment toggle change
  const handlePaymentToggle = (setting: string) => {
    setPaymentSettings(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));
  };

  // Handle shipping settings change
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle shipping toggle change
  const handleShippingToggle = (setting: string) => {
    setShippingSettings(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));
  };

  // Handle email settings toggle change
  const handleEmailToggle = (setting: string) => {
    setEmailSettings(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));
  };

  // Handle email settings change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would save the settings to your backend
    toast.success('Settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your store settings</p>
      </div>

      {/* Settings tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <SettingsTab 
          label="General" 
          active={activeTab === 'general'} 
          onClick={() => setActiveTab('general')} 
        />
        <SettingsTab 
          label="Payment" 
          active={activeTab === 'payment'} 
          onClick={() => setActiveTab('payment')} 
        />
        <SettingsTab 
          label="Shipping" 
          active={activeTab === 'shipping'} 
          onClick={() => setActiveTab('shipping')} 
        />
        <SettingsTab 
          label="Email" 
          active={activeTab === 'email'} 
          onClick={() => setActiveTab('email')} 
        />
      </div>

      {/* Settings form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          {/* General Settings */}
          {activeTab === 'general' && (
            <div>
              <FormSection title="Store Information">
                <FormInput 
                  label="Store Name" 
                  id="siteName" 
                  value={generalSettings.siteName} 
                  onChange={handleGeneralChange} 
                  required 
                />
                <FormInput 
                  label="Store Description" 
                  id="siteDescription" 
                  value={generalSettings.siteDescription} 
                  onChange={handleGeneralChange} 
                />
                <FormInput 
                  label="Contact Email" 
                  id="contactEmail" 
                  type="email" 
                  value={generalSettings.contactEmail} 
                  onChange={handleGeneralChange} 
                  required 
                />
                <FormInput 
                  label="Phone Number" 
                  id="phoneNumber" 
                  value={generalSettings.phoneNumber} 
                  onChange={handleGeneralChange} 
                />
                <FormInput 
                  label="Address" 
                  id="address" 
                  value={generalSettings.address} 
                  onChange={handleGeneralChange} 
                />
              </FormSection>

              <FormSection title="Regional Settings">
                <FormSelect 
                  label="Currency" 
                  id="currency" 
                  value={generalSettings.currency} 
                  onChange={handleGeneralChange} 
                  options={[
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' },
                    { value: 'GBP', label: 'GBP - British Pound' },
                    { value: 'CAD', label: 'CAD - Canadian Dollar' },
                    { value: 'AUD', label: 'AUD - Australian Dollar' },
                  ]} 
                />
                <FormSelect 
                  label="Timezone" 
                  id="timezone" 
                  value={generalSettings.timezone} 
                  onChange={handleGeneralChange} 
                  options={[
                    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
                    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
                    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
                    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
                    { value: 'Europe/London', label: 'London' },
                    { value: 'Europe/Paris', label: 'Paris' },
                    { value: 'Asia/Tokyo', label: 'Tokyo' },
                  ]} 
                />
              </FormSection>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div>
              <FormSection 
                title="Payment Methods" 
                description="Configure which payment methods are available to your customers"
              >
                <FormToggle 
                  label="Stripe" 
                  id="stripeEnabled" 
                  checked={paymentSettings.stripeEnabled} 
                  onChange={() => handlePaymentToggle('stripeEnabled')} 
                  helpText="Accept credit card payments via Stripe" 
                />
                <FormToggle 
                  label="PayPal" 
                  id="paypalEnabled" 
                  checked={paymentSettings.paypalEnabled} 
                  onChange={() => handlePaymentToggle('paypalEnabled')} 
                  helpText="Accept payments via PayPal" 
                />
                <FormToggle 
                  label="Bank Transfer" 
                  id="bankTransferEnabled" 
                  checked={paymentSettings.bankTransferEnabled} 
                  onChange={() => handlePaymentToggle('bankTransferEnabled')} 
                  helpText="Accept direct bank transfers" 
                />
              </FormSection>

              {paymentSettings.stripeEnabled && (
                <FormSection title="Stripe Configuration">
                  <FormInput 
                    label="Stripe Public Key" 
                    id="stripePublicKey" 
                    value={paymentSettings.stripePublicKey} 
                    onChange={handlePaymentChange} 
                    required={paymentSettings.stripeEnabled} 
                  />
                  <FormInput 
                    label="Stripe Secret Key" 
                    id="stripeSecretKey" 
                    type="password" 
                    value={paymentSettings.stripeSecretKey} 
                    onChange={handlePaymentChange} 
                    required={paymentSettings.stripeEnabled} 
                    helpText="This key should be kept secret and only stored on the server" 
                  />
                </FormSection>
              )}

              {paymentSettings.paypalEnabled && (
                <FormSection title="PayPal Configuration">
                  <FormInput 
                    label="PayPal Client ID" 
                    id="paypalClientId" 
                    value={paymentSettings.paypalClientId} 
                    onChange={handlePaymentChange} 
                    required={paymentSettings.paypalEnabled} 
                  />
                  <FormInput 
                    label="PayPal Client Secret" 
                    id="paypalClientSecret" 
                    type="password" 
                    value={paymentSettings.paypalClientSecret} 
                    onChange={handlePaymentChange} 
                    required={paymentSettings.paypalEnabled} 
                    helpText="This key should be kept secret and only stored on the server" 
                  />
                </FormSection>
              )}
            </div>
          )}

          {/* Shipping Settings */}
          {activeTab === 'shipping' && (
            <div>
              <FormSection 
                title="Shipping Methods" 
                description="Configure shipping options for your products"
              >
                <FormToggle 
                  label="Free Shipping" 
                  id="freeShippingEnabled" 
                  checked={shippingSettings.freeShippingEnabled} 
                  onChange={() => handleShippingToggle('freeShippingEnabled')} 
                  helpText="Offer free shipping to your customers" 
                />
                {shippingSettings.freeShippingEnabled && (
                  <FormInput 
                    label="Minimum Order Amount for Free Shipping ($)" 
                    id="freeShippingThreshold" 
                    type="number" 
                    value={shippingSettings.freeShippingThreshold} 
                    onChange={handleShippingChange} 
                    helpText="Orders above this amount qualify for free shipping" 
                  />
                )}
                
                <FormToggle 
                  label="Flat Rate Shipping" 
                  id="flatRateEnabled" 
                  checked={shippingSettings.flatRateEnabled} 
                  onChange={() => handleShippingToggle('flatRateEnabled')} 
                  helpText="Charge a flat rate for shipping" 
                />
                {shippingSettings.flatRateEnabled && (
                  <FormInput 
                    label="Flat Rate Amount ($)" 
                    id="flatRateAmount" 
                    type="number" 
                    value={shippingSettings.flatRateAmount} 
                    onChange={handleShippingChange} 
                  />
                )}
                
                <FormToggle 
                  label="International Shipping" 
                  id="internationalShippingEnabled" 
                  checked={shippingSettings.internationalShippingEnabled} 
                  onChange={() => handleShippingToggle('internationalShippingEnabled')} 
                  helpText="Enable shipping to international addresses" 
                />
                {shippingSettings.internationalShippingEnabled && (
                  <FormInput 
                    label="International Shipping Rate ($)" 
                    id="internationalShippingAmount" 
                    type="number" 
                    value={shippingSettings.internationalShippingAmount} 
                    onChange={handleShippingChange} 
                  />
                )}
              </FormSection>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div>
              <FormSection 
                title="Email Notifications" 
                description="Configure automated email notifications"
              >
                <FormToggle 
                  label="Order Confirmation Emails" 
                  id="orderConfirmationEnabled" 
                  checked={emailSettings.orderConfirmationEnabled} 
                  onChange={() => handleEmailToggle('orderConfirmationEnabled')} 
                  helpText="Send an email when a customer places an order" 
                />
                <FormToggle 
                  label="Shipping Confirmation Emails" 
                  id="shippingConfirmationEnabled" 
                  checked={emailSettings.shippingConfirmationEnabled} 
                  onChange={() => handleEmailToggle('shippingConfirmationEnabled')} 
                  helpText="Send an email when an order ships" 
                />
                <FormToggle 
                  label="Abandoned Cart Emails" 
                  id="abandonedCartEnabled" 
                  checked={emailSettings.abandonedCartEnabled} 
                  onChange={() => handleEmailToggle('abandonedCartEnabled')} 
                  helpText="Send reminder emails for abandoned carts" 
                />
                <FormToggle 
                  label="Marketing Emails" 
                  id="marketingEmailsEnabled" 
                  checked={emailSettings.marketingEmailsEnabled} 
                  onChange={() => handleEmailToggle('marketingEmailsEnabled')} 
                  helpText="Send promotional emails to customers" 
                />
              </FormSection>

              <FormSection title="Email Configuration">
                <FormInput 
                  label="Sender Email Address" 
                  id="emailSender" 
                  type="email" 
                  value={emailSettings.emailSender} 
                  onChange={handleEmailChange} 
                  required 
                />
                <div>
                  <label htmlFor="emailFooter" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Footer
                  </label>
                  <textarea
                    id="emailFooter"
                    name="emailFooter"
                    rows={3}
                    value={emailSettings.emailFooter}
                    onChange={handleEmailChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </FormSection>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => {
                // Reset form to initial values
                if (activeTab === 'general') setGeneralSettings(generalSettings);
                if (activeTab === 'payment') setPaymentSettings(paymentSettings);
                if (activeTab === 'shipping') setShippingSettings(shippingSettings);
                if (activeTab === 'email') setEmailSettings(emailSettings);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}