import React from 'react';
import Card from '../ui/Card';
import { FileText, Mail, CheckCircle } from 'lucide-react';

const RecentActivity = ({ activities = [] }) => {
  if (!activities.length) {
    return (
      <Card className="h-full">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="text-sm text-gray-500 text-center py-8">
          No recent activity to show.
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="mt-0.5">
              {activity.type === 'extraction' && <FileText className="w-4 h-4 text-indigo-500" />}
              {activity.type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
              {activity.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div>
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentActivity;
