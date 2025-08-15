import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../utils/pwaUtils';

const OfflineIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();
  const [showIndicator, setShowIndicator] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
    } else {
      // Hide indicator after a brief delay when back online
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showIndicator) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Back Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline Mode</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;