import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { templateService } from '../../services/templateService';

const EditSessionModal = ({ isOpen, onClose, session, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [autoProcess, setAutoProcess] = useState(false);
  const [interval, setInterval] = useState('daily');
  const [isActive, setIsActive] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (session) {
      setName(session.session_name || '');
      setTemplateId(session.fields_template_id || '');
      setAutoProcess(session.auto_process || false);
      setIsActive(session.is_active !== false);

      // Map minutes back to interval dropdown label
      const mins = session.schedule_minutes;
      if (mins <= 60) setInterval('hourly');
      else if (mins >= 10080) setInterval('weekly');
      else setInterval('daily');
    }
  }, [session, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const loadTemplates = async () => {
        try {
          setLoadingTemplates(true);
          const data = await templateService.getTemplates();
          setTemplates(data);
        } catch (e) {
          console.error("Failed to load templates", e);
        } finally {
          setLoadingTemplates(false);
        }
      };
      loadTemplates();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let scheduleMinutes = 1440;
    if (interval === 'hourly') scheduleMinutes = 60;
    if (interval === 'weekly') scheduleMinutes = 10080;

    onSave(session.id, {
      session_name: name,
      fields_template_id: parseInt(templateId, 10),
      auto_process: autoProcess,
      schedule_minutes: scheduleMinutes,
      is_active: isActive
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Settings">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Session Name" 
          placeholder="e.g. Monthly Invoices Processing" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
          <select 
            className="block w-full rounded-md border-gray-300 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-white"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            required
            disabled={loadingTemplates}
          >
            <option value="" disabled>Select a template</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input 
            type="checkbox" 
            id="edit-auto-process"
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            checked={autoProcess}
            onChange={(e) => setAutoProcess(e.target.checked)}
          />
          <label htmlFor="edit-auto-process" className="text-sm font-medium text-gray-700">
            Enable auto-processing from Gmail
          </label>
        </div>

        {autoProcess && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Interval</label>
            <select 
              className="block w-full rounded-md border-gray-300 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 bg-white"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <input 
            type="checkbox" 
            id="edit-is-active"
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="edit-is-active" className="text-sm font-medium text-gray-700">
            Session Active
          </label>
        </div>

        <div className="pt-4 flex justify-between gap-2 border-t border-gray-100 mt-6">
          <Button 
            type="button" 
            variant="danger" 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this session? This will remove all processed logs.")) {
                onDelete(session.id);
                onClose();
              }
            }}
          >
            Delete Session
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditSessionModal;
