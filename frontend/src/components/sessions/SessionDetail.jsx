import React from 'react';
import { Download, Play, Settings, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const SessionDetail = ({ session, onProcess, onDownload, onDelete, onEdit }) => {
  return (
    <Card className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900 break-words">{session.name}</h2>
            <Badge variant={session.status === 'active' ? 'success' : 'neutral'} dot>
              {session.status}
            </Badge>
          </div>
          <p className="text-gray-500">Template: <span className="font-medium text-gray-700">{session.templateName}</span></p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" icon={Download} onClick={onDownload}>
            Download CSV
          </Button>
          <Button icon={Play} onClick={onProcess}>
            Process Emails Now
          </Button>
          {onEdit && (
            <Button variant="ghost" icon={Settings} className="px-2" title="Settings" onClick={onEdit} />
          )}
          {onDelete && (
            <Button variant="ghost" icon={Trash2} className="px-2 text-red-500 hover:text-red-700 hover:bg-red-50" title="Delete Session" onClick={onDelete} />
          )}
        </div>
      </div>
    </Card>
  );
};

export default SessionDetail;
