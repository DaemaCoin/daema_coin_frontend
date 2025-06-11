import React from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface StepIndicatorProps {
  step: 'xquare' | 'github';
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step }) => (
  <div className="flex items-center justify-center space-x-4">
    <div className={`flex items-center space-x-2 ${step === 'xquare' ? 'text-blue-600' : 'text-green-600'}`}>
      {step === 'xquare' ? (
        <div className="w-6 h-6 border-2 border-blue-600 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
      ) : (
        <CheckCircle className="w-6 h-6" />
      )}
      <span className="text-sm font-medium">XQUARE 로그인</span>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-400" />
    <div className={`flex items-center space-x-2 ${step === 'github' ? 'text-blue-600' : 'text-gray-400'}`}>
      {step === 'github' ? (
        <div className="w-6 h-6 border-2 border-blue-600 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
      ) : (
        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
      )}
      <span className="text-sm font-medium">GitHub 연동</span>
    </div>
  </div>
);

export default StepIndicator; 