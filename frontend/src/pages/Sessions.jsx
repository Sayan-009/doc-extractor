import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import SessionCard from '../components/dashboard/SessionCard';
import CreateSessionModal from '../components/sessions/CreateSessionModal';
import EditSessionModal from '../components/sessions/EditSessionModal';
import { useToast } from '../hooks/useToast';
import { sessionService } from '../services/sessionService';

const Sessions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (error) {
      toast.error('Error', 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (data) => {
    try {
      await sessionService.createSession(data);
      toast.success('Session created', `${data.session_name} has been created successfully.`);
      setIsModalOpen(false);
      fetchSessions();
    } catch (error) {
      toast.error('Error', 'Failed to create session');
    }
  };

  const handleEditOpen = (session) => {
    // Map card session metadata back to database schema structure for modal pre-fill
    const fullSession = sessions.find(s => s.id === session.id);
    setSelectedSession(fullSession);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (id, updatedData) => {
    try {
      await sessionService.updateSession(id, updatedData);
      toast.success('Session updated', 'Changes saved successfully.');
      setIsEditOpen(false);
      fetchSessions();
    } catch (error) {
      toast.error('Error', 'Failed to update session');
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await sessionService.deleteSession(id);
      toast.success('Session deleted', 'Session has been removed.');
      setIsEditOpen(false);
      fetchSessions();
    } catch (error) {
      toast.error('Error', 'Failed to delete session');
    }
  };

  const handleProcess = (id) => {
    navigate(`/sessions/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Extraction Sessions</h1>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>New Session</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
          <p className="text-gray-500 mb-4">Create your first session to start extracting data.</p>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Create Session</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
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
              onProcess={handleProcess} 
              onEdit={handleEditOpen}
            />
          ))}
        </div>
      )}

      <CreateSessionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreate} 
      />

      <EditSessionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        session={selectedSession}
        onSave={handleSaveEdit}
        onDelete={handleDeleteSession}
      />
    </div>
  );
};

export default Sessions;
