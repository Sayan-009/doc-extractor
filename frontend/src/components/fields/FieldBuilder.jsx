import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import FieldRow from './FieldRow';
import Button from '../ui/Button';

const FieldBuilder = ({ fields, setFields }) => {
  const addField = () => {
    setFields([...fields, { name: '', type: 'text', required: false }]);
  };

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const removeField = (index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No fields defined yet.</p>
          <Button variant="outline" icon={Plus} onClick={addField}>
            Add First Field
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <FieldRow 
              key={index} 
              field={field} 
              index={index} 
              onChange={updateField} 
              onRemove={removeField} 
            />
          ))}
          
          <Button variant="ghost" icon={Plus} onClick={addField} className="mt-4">
            Add Field
          </Button>
        </div>
      )}
    </div>
  );
};

export default FieldBuilder;
