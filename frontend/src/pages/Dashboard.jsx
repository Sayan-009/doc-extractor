import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutDashboard, FileText, Activity, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import SessionCard from '../components/dashboard/SessionCard';
import StatsCard from '../components/dashboard/StatsCard';
import { sessionService } from '../services/sessionService';
import { useToast } from '../hooks/useToast';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await sessionService.getSessions();
        setSessions(data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const totalSessions = sessions.length;
  const totalProcessed = sessions.reduce((sum, s) => sum + (s.total_processed || 0), 0);
  const activeAutomations = sessions.filter(s => s.auto_process).length;

  const stats = [
    { title: 'Total Sessions', value: totalSessions.toString(), icon: LayoutDashboard },
    { title: 'Docs Processed', value: totalProcessed.toString(), icon: FileText },
    { title: 'Active Automations', value: activeAutomations.toString(), icon: Activity },
    { title: 'Connected Services', value: '1', icon: LinkIcon },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Sessions</h2>
        </div>
        
        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No sessions yet</h3>
            <p className="mt-1 text-sm text-gray-500 mb-4">Get started by creating your first extraction session.</p>
            <Button icon={Plus} onClick={() => navigate('/sessions')}>Create Session</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <SessionCard 
                key={session.id} 
                session={{
                  id: session.id,
                  name: session.session_name,
                  templateName: session.template_name || 'Unknown',
                  status: session.is_active ? 'active' : 'inactive',
                  docCount: session.total_processed || 0,
                  lastProcessed: session.last_processed_at
                }} 
                onProcess={(id) => navigate(`/sessions/${id}`)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
