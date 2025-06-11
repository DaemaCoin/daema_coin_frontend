import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AlertCircle, X } from 'lucide-react';

interface GithubWarningModalProps {
  open: boolean;
  confirmationText: string;
  confirmationError: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const GithubWarningModal: React.FC<GithubWarningModalProps> = ({
  open, confirmationText, confirmationError, onChange, onConfirm, onCancel
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">중요한 안내사항</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-900 font-medium mb-2">Organization 선택 관련 안내</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                다음 GitHub 로그인에서 선택한 Organization들에 대한 커밋만 수집되며, 
                이후 Organization을 추가로 선택하려면 관리자의 조치가 필요합니다.
              </p>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              신중하게 선택해주세요. 나중에 변경하기 어렵습니다.
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              위 내용을 확인했다면 아래에 입력해주세요
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={e => onChange(e.target.value)}
              placeholder="확인했습니다"
              className="toss-input"
              autoFocus
            />
            {confirmationError && (
              <p className="text-sm text-red-600">{confirmationError}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={onConfirm} variant="primary" className="flex-1" disabled={!confirmationText.trim()}>
              확인하고 계속하기
            </Button>
            <Button onClick={onCancel} variant="secondary" className="flex-1">
              취소
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GithubWarningModal; 