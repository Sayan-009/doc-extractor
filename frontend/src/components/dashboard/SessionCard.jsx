import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Settings, Database, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';


const SessionCard = ({ session, onProcess, onEdit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card hover className="h-full flex flex-col">
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate" title={session.name}>
              {session.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Template: {session.templateName || 'None'}
            </p>
          </div>
          <Badge 
            variant={session.status === 'active' ? 'success' : 'neutral'} 
            dot
          >
            {session.status || 'Inactive'}
          </Badge>
        </div>

        <div className="flex-1">
          <div className="bg-gray-50 rounded-md p-3 flex justify-between items-center text-sm mb-4">
            <span className="text-gray-500">Documents Processed</span>
            <span className="font-semibold text-gray-900">{session.docCount || 0}</span>
          </div>
          
          <div className="text-xs text-gray-500 flex items-center gap-1 mb-4">
            <Clock className="w-3.5 h-3.5" />
            Last processed: {session.lastProcessed ? new Date(session.lastProcessed).toLocaleDateString() : 'Never'}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-auto border-t border-gray-100 pt-4">
          <Link to={`/sessions/${session.id}`} className="flex-1">
            <Button variant="outline" size="sm" fullWidth>
              View Data
            </Button>
          </Link>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Play}
            onClick={() => onProcess(session.id)}
            className="flex-1"
          >
            Process
          </Button>
          {onEdit && (
            <Button variant="ghost" size="sm" icon={Settings} className="px-2" onClick={() => onEdit(session)}>
              <span className="sr-only">Settings</span>
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default SessionCard;
