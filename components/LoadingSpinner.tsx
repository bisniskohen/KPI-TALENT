
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
        <p className="mt-4 text-lg text-text-secondary">Loading Data...</p>
    </div>
    
  );
};

export default LoadingSpinner;
