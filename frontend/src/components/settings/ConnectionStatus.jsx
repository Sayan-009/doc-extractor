import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import Badge from '../ui/Badge';

const ConnectionStatus = ({ isConnected, provider, accountName }) => {
  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-400" />
      )}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{provider}</span>
          <Badge variant={isConnected ? 'success' : 'neutral'} dot>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        {isConnected && accountName && (
          <p className="text-sm text-gray-500 mt-0.5">{accountName}</p>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
