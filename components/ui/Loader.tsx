import React from 'react';

export const Loader = () => (
  <div className="flex items-center justify-center space-x-2 animate-pulse">
    <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);