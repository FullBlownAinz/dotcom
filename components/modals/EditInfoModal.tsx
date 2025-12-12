import React, { useState, useEffect } from 'react';
import { SiteInfo } from '../../types/index.ts';
import Button from '../ui/Button.tsx';
import { X } from 'lucide-react';
import QuillEditor from '../ui/QuillEditor.tsx';
import Portal from '../ui/Portal.tsx';

interface EditInfoModalProps {
  info: SiteInfo;
  onClose: () => void;
  onSave: (updatedInfo: SiteInfo) => void;
}

const EditInfoModal: React.FC<EditInfoModalProps> = ({ info, onClose, onSave }) => {
  const [editedInfo, setEditedInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
    if (info) {
      setEditedInfo(info);
    }
  }, [info]);

  if (!editedInfo) return null;

  const handleSave = () => {
    onSave(editedInfo);
    onClose();
  };

  return (
    <Portal>
      {/* TRUE MODAL */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 animate-fade-in overflow-y-auto"
      >
        <div
          className="bg-[#0A0A0A] border-2 border-gray-800 p-6 w-full max-w-2xl text-fba-white relative mt-16 mb-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg uppercase">Edit Info Content</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
              </button>
          </div>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <QuillEditor
                value={editedInfo.body_richtext}
                onChange={(body) => setEditedInfo(prev => prev ? { ...prev, body_richtext: body } : null)}
              />
          </div>

          <div className="pt-6 flex justify-end gap-4">
              <Button onClick={onClose} variant="secondary">Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default EditInfoModal;
