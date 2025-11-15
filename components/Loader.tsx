
import React from 'react';

const Loader = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
      <p className="text-lg text-content/80">{text}</p>
    </div>
  );
};

export default Loader;
