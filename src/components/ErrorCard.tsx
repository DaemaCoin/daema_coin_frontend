import React from 'react';
import Card from '@/components/ui/Card';
import { AlertCircle } from 'lucide-react';

interface ErrorCardProps {
  error: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ error }) => (
  <Card className="bg-red-50 border-red-200 p-4">
    <div className="flex items-center space-x-2">
      <AlertCircle className="w-5 h-5 text-red-600" />
      <span className="text-sm text-red-700">{error}</span>
    </div>
  </Card>
);

export default ErrorCard; 