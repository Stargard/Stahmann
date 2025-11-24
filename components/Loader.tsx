
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-brand-surface rounded-lg">
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 bg-brand-primary rounded-full animate-bounce"></div>
      </div>
      <p className="mt-4 text-brand-subtext">AI is listening and analyzing your track...</p>
    </div>
  );
};

export default Loader;
