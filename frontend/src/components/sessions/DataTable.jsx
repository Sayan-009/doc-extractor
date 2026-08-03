import React, { useState } from 'react';
import Table from '../ui/Table';
import Button from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ columns, data, totalRows = 0 }) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Note: in a real app, pagination would trigger a data fetch
  const paginatedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <Table 
        columns={columns} 
        data={paginatedData} 
        emptyMessage="No documents processed yet."
      />
      
      {totalRows > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, totalRows)} of {totalRows} entries
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
