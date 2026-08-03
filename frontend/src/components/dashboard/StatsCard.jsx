import React from 'react';
import Card from '../ui/Card';

const StatsCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
