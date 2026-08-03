import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import FieldBuilder from '../components/fields/FieldBuilder';
import TestExtraction from '../components/fields/TestExtraction';
import { useToast } from '../hooks/useToast';
import { templateService } from '../services/templateService';

const FieldBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchTemplate = async () => {
        try {
          setLoading(true);
          const data = await templateService.getTemplate(id);
          setTemplateName(data.name || '');
          
          // Safely format fields as an array
          if (data.fields) {
            if (Array.isArray(data.fields)) {
              setFields(data.fields);
            } else if (typeof data.fields === 'object') {
              // Convert object key-value pairs back to array format if saved as object
              const arrayFields = Object.entries(data.fields).map(([name, config]) => ({
                name,
                type: config.type || 'text',
                required: config.required || false
              }));
              setFields(arrayFields);
            } else {
              setFields([]);
            }
          } else {
            setFields([]);
          }
        } catch (error) {
          toast.error('Error', 'Failed to load template');
        } finally {
          setLoading(false);
        }
      };
      fetchTemplate();
    } else {
      // Initialize with default fields for new template
      setFields([
        { name: 'Invoice Number', type: 'text', required: true },
        { name: 'Total Amount', type: 'currency', required: true }
      ]);
    }
  }, [id]);

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Validation Error', 'Template name is required');
      return;
    }
    
    try {
      setSaving(true);
      const payload = {
        name: templateName,
        fields: fields
      };
      
      if (id) {
        await templateService.updateTemplate(id, payload);
        toast.success('Success', 'Template updated successfully');
      } else {
        const created = await templateService.createTemplate(payload);
        toast.success('Success', 'Template created! You can now test extraction.');
        // Navigate to the edit page for the newly created template so test extraction works
        navigate(`/templates/${created.id}`, { replace: true });
      }
    } catch (error) {
      toast.error('Error', 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (file) => {
    if (!id) {
      toast.error('Error', 'Please save the template first before testing');
      return;
    }
    setTesting(true);
    setTestResults(null);
    try {
      const result = await templateService.testExtraction(id, file);
      setTestResults(result.extracted_data || result);
      toast.success('Test complete', 'Extraction was successful');
    } catch (error) {
      toast.error('Test Failed', 'Could not extract data from the document');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="px-2" />
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Edit Template' : 'Create Template'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button icon={Save} onClick={handleSave} loading={saving}>Save Template</Button>
        </div>
      </div>

      <Card>
        <div className="max-w-md mb-8">
          <Input 
            label="Template Name" 
            placeholder="e.g. Monthly Invoices" 
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fields to Extract</h3>
            <FieldBuilder fields={fields} setFields={setFields} />
          </div>
          
          <div className="lg:col-span-1">
            <TestExtraction onTest={handleTest} loading={testing} results={testResults} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FieldBuilderPage;
