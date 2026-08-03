import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

const TestExtraction = ({ onTest, loading, results }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Extraction</h3>
      
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          onChange={handleChange}
          accept=".pdf,.png,.jpg,.jpeg" 
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          {file ? (
            <>
              <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
            </>
          )}
        </label>
      </div>

      <Button 
        fullWidth 
        disabled={!file || loading} 
        loading={loading}
        onClick={() => onTest(file)}
      >
        Test Extract
      </Button>

      {results && (
        <div className="mt-6 flex-1 flex flex-col">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Results</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-auto flex-1 max-h-[300px]">
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestExtraction;
