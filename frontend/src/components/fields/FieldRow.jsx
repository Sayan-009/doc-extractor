import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import Input from '../ui/Input';

const FieldRow = ({ field, onChange, onRemove, index }) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm group">
      <div className="mt-2 text-gray-400 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4">
          <Input 
            placeholder="Field name (e.g. Total Amount)" 
            value={field.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
          />
        </div>
        
        <div className="md:col-span-4">
          <select 
            className="block w-full rounded-md border-gray-300 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
            value={field.type}
            onChange={(e) => onChange(index, 'type', e.target.value)}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="email">Email</option>
            <option value="currency">Currency</option>
            <option value="boolean">Boolean (Yes/No)</option>
          </select>
        </div>

        <div className="md:col-span-3 flex items-center h-10">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 w-4 h-4"
              checked={field.required}
              onChange={(e) => onChange(index, 'required', e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">Required</span>
          </label>
        </div>
      </div>

      <button 
        onClick={() => onRemove(index)}
        className="mt-2 text-gray-400 hover:text-red-500 transition-colors p-1"
        title="Remove field"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default FieldRow;
