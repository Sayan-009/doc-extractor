import React from 'react';
import { Loader2 } from 'lucide-react';

const Table = ({ columns, data, loading = false, emptyMessage = 'No data available' }) => {
  if (loading) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <span className="text-sm">Loading data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
