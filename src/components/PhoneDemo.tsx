import React from 'react';
import { Smartphone, Zap } from 'lucide-react';

interface PhoneDemoProps {
  accountType: 'creator' | 'brand';
}

const PhoneDemo: React.FC<PhoneDemoProps> = ({ accountType }) => {
  const isCreator = accountType === 'creator';
  
  // Dynamic content based on the account type
  const title = isCreator ? 'Your InfluLink Creator Profile' : 'Discover Campaign Potential';
  const features = isCreator 
    ? ['Showcase your best content', 'Track real-time analytics', 'Connect with top brands']
    : ['Access verified creator data', 'Manage campaigns easily', 'View detailed performance metrics'];

  return (
    <div className="hidden lg:flex flex-col items-center justify-center p-8">
      {/* Phone Mockup Container */}
      <div className="relative w-[300px] h-[600px] border-[10px] border-gray-800 dark:border-gray-200 rounded-[40px] shadow-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        
        {/* Notch/Camera Area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-800 dark:bg-gray-200 rounded-b-lg z-10" />
        
        {/* Screen Content (Demo) */}
        <div className="p-4 h-full flex flex-col items-center justify-start">
          <Smartphone className={`h-8 w-8 mb-2 ${isCreator ? 'text-cyan-500' : 'text-indigo-500'}`} />
          <p className="text-lg font-bold text-center mb-6 dark:text-white">{title}</p>
          
          <ul className="space-y-3 w-full px-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3 text-sm dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                <Zap className={`h-4 w-4 flex-shrink-0 ${isCreator ? 'text-cyan-500' : 'text-indigo-500'}`} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto w-full p-3 text-center text-xs text-gray-400 border-t dark:border-gray-700">
             Live Preview
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneDemo;