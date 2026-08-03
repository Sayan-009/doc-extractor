import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionDetail from '../components/sessions/SessionDetail';
import DataTable from '../components/sessions/DataTable';
import Spinner from '../components/ui/Spinner';
import { useToast } from '../hooks/useToast';
import { sessionService } from '../services/sessionService';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const SessionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [session, setSession] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  useEffect(() => {
    fetchSessionData();
  }, [id, page, perPage]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const sessionData = await sessionService.getSession(id);
      setSession({
        id: sessionData.id,
        name: sessionData.session_name,
        templateName: sessionData.template_name || 'Unknown',
        status: sessionData.is_active ? 'active' : 'inactive',
      });
    } catch (error) {
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionData = async () => {
    try {
      const response = await sessionService.getSessionData(id, page, perPage);
      setData(response.rows || []);
      setTotalRows(response.total || 0);
    } catch (error) {
      toast.error('Failed to load extracted data');
    }
  };

  const handleProcess = async () => {
    try {
      setProcessing(true);
      toast.info('Processing', 'Scanning connected inbox...');
      await sessionService.processEmails(id);
      toast.success('Success', 'Emails processed successfully');
      fetchSessionData(); // Refresh data
    } catch (error) {
      toast.error('Error', 'Failed to process emails');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      toast.info('Downloading', 'Preparing your CSV...');
      await sessionService.downloadCsv(id);
      toast.success('Downloaded', 'CSV file generated successfully.');
    } catch (error) {
      toast.error('Error', 'Failed to download CSV');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this session? All extracted data will be lost.')) {
      try {
        await sessionService.deleteSession(id);
        toast.success('Deleted', 'Session deleted successfully');
        navigate('/sessions');
      } catch (error) {
        toast.error('Error', 'Failed to delete session');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Session not found</h3>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/sessions')}>Back to Sessions</Button>
      </div>
    );
  }

  // Generate dynamic columns based on data keys (excluding id, session_id, etc. if needed)
  const columns = data.length > 0 
    ? Object.keys(data[0])
        .filter(key => !['id', 'session_id'].includes(key))
        .map(key => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
        }))
    : [{ key: 'placeholder', label: 'No data yet' }];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="px-2" />
        <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
      </div>
      <SessionDetail 
        session={session} 
        onProcess={handleProcess} 
        onDownload={handleDownload}
        onDelete={handleDelete}
        processing={processing}
      />
      <DataTable 
        columns={columns} 
        data={data} 
        totalRows={totalRows}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
};

export default SessionDetailPage;
