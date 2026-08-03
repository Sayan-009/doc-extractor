import React, { useState } from 'react';
import GmailConnect from '../components/settings/GmailConnect';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Validation Error', 'New passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const detail = error.response?.data?.detail || '';
      let msg = 'Failed to update password. Please try again.';
      if (detail.toLowerCase().includes('current password is incorrect')) {
        msg = 'The current password you entered is incorrect.';
      } else if (detail.toLowerCase().includes('at least 6 characters')) {
        msg = 'Your new password must be at least 6 characters long.';
      } else if (detail.toLowerCase().includes('google accounts')) {
        msg = 'Google accounts use Google Sign-In and cannot change password here.';
      }
      toast.error('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your integrations and account preferences.</p>
      </div>

      <GmailConnect />

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Profile</h3>
        <p className="text-sm text-gray-500 mb-6">
          Update your email address or change your password.
        </p>
        
        <div className="space-y-4 max-w-md">
          <Input 
            label="Email Address" 
            defaultValue={user?.email || ''} 
            disabled 
          />
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Change Password</h4>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input 
                label="Current Password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input 
                label="New Password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input 
                label="Confirm New Password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" loading={loading}>Update Password</Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
