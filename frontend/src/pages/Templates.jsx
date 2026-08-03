import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, Layers } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { templateService } from '../services/templateService';
import { useToast } from '../hooks/useToast';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error('Error', 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateService.deleteTemplate(id);
        toast.success('Deleted', 'Template deleted successfully');
        fetchTemplates();
      } catch (error) {
        toast.error('Error', 'Failed to delete template');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Field Templates</h1>
        <Button icon={Plus} onClick={() => navigate('/templates/new')}>New Template</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500 mb-4">Templates define which custom fields the AI should extract from documents.</p>
          <Button icon={Plus} onClick={() => navigate('/templates/new')}>Create Template</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tmpl => {
            const fieldsObj = tmpl.fields || {};
            const fieldCount = Array.isArray(fieldsObj) ? fieldsObj.length : Object.keys(fieldsObj).length;
            return (
              <Card key={tmpl.id} hover className="flex flex-col cursor-pointer" onClick={() => navigate(`/templates/${tmpl.id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate" title={tmpl.name}>
                      {tmpl.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {fieldCount} field{fieldCount !== 1 ? 's' : ''} defined
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-xs text-gray-500">
                    Created: {new Date(tmpl.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 border-t border-gray-100 pt-4 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    icon={Edit3}
                    onClick={() => navigate(`/templates/${tmpl.id}`)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={Trash2}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleDelete(tmpl.id, e)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Templates;
