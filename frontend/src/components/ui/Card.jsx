import React from 'react';

const Card = ({ children, padding = true, hover = false, className = '', header, footer }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${hover ? 'transition-shadow hover:shadow-md' : 'shadow-sm'} ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          {header}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
