import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ConnectionStatus from './ConnectionStatus';
import { gmailService } from '../../services/gmailService';
import { useToast } from '../../hooks/useToast';

const GmailConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await gmailService.getGmailStatus();
      setIsConnected(data.connected);
      setAccountName(data.email || '');
    } catch (e) {
      console.error("Failed to query Gmail connection status", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    try {
      const response = await gmailService.getConnectUrl();
      if (response && response.auth_url) {
        window.location.href = response.auth_url;
      } else {
        toast.error('Error', 'Invalid authentication URL returned');
      }
    } catch (e) {
      toast.error('Error', 'Failed to retrieve connection link');
    }
  };

  const handleDisconnect = async () => {
    try {
      await gmailService.disconnectGmail();
      setIsConnected(false);
      setAccountName('');
      toast.success('Disconnected', 'Gmail account has been disconnected');
    } catch (e) {
      toast.error('Error', 'Failed to disconnect Gmail');
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="py-6 text-center text-sm text-gray-500">
          Loading Gmail settings...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gmail Integration</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xl">
            Connect your Gmail account to automatically extract data from incoming emails and their attachments. We only read emails that match your session criteria.
          </p>
          <ConnectionStatus 
            isConnected={isConnected} 
            provider="Gmail" 
            accountName={accountName} 
          />
        </div>
        <div className="mt-4 sm:mt-0">
          {isConnected ? (
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button icon={Mail} onClick={handleConnect}>
              Connect Gmail
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GmailConnect;
