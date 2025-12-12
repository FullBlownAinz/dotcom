import React, { useState, useEffect } from 'react';
import { AppItem, ExternalLink } from '../../types/index.ts';
import Button from '../ui/Button.tsx';
import Input from '../ui/Input.tsx';
import Textarea from '../ui/Textarea.tsx';
import { X, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import FilePicker from '../ui/FilePicker.tsx';
import Portal from '../ui/Portal.tsx';

interface EditAppModalProps {
  app: AppItem | null;
  onClose: () => void;
  onSave: (updatedApp: AppItem) => void;
}

const EditAppModal: React.FC<EditAppModalProps> = ({ app, onClose, onSave }) => {
  const [editedApp, setEditedApp] = useState<AppItem | null>(null);
  
  // State for new link inputs
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    if (app) {
      setEditedApp(app);
    } else {
      setEditedApp(null);
    }
    setNewLinkLabel('');
    setNewLinkUrl('');
  }, [app]);

  if (!editedApp) return null;

  const handleGenericChange = (update: Partial<AppItem>) => {
    setEditedApp(prev => prev ? { ...prev, ...update } : null);
  };

  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) {
        toast.error("Label and URL are required.");
        return;
    }
    
    const newLink: ExternalLink = { label: newLinkLabel.trim(), url: newLinkUrl.trim() };
    const updatedLinks = [...(editedApp.links || []), newLink];
    handleGenericChange({ links: updatedLinks });
    
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = [...(editedApp.links || [])];
    updatedLinks.splice(index, 1);
    handleGenericChange({ links: updatedLinks });
  };

  const handleSave = () => {
    if (editedApp) {
        if (!editedApp.name || !editedApp.icon_url) {
            toast.error("Name and Icon URL are required.");
            return;
        }

        onSave(editedApp);
        onClose();
    }
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
              <h2 className="font-display text-lg uppercase">Edit App</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
              </button>
          </div>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <Input id="name" name="name" label="Name" value={editedApp.name} onChange={(e) => handleGenericChange({ name: e.target.value })} />
              <FilePicker
                label="Icon"
                currentUrl={editedApp.icon_url}
                onUrlChange={(url) => handleGenericChange({ icon_url: url })}
                bucket="media"
              />
              <Textarea id="short_desc" name="short_desc" label="Short Description" value={editedApp.short_desc} onChange={(e) => handleGenericChange({ short_desc: e.target.value })} rows={3} />
              
              {/* Links Editor */}
              <div>
                  <label className="font-display text-sm text-gray-400 mb-2 block">Links</label>
                  
                  {/* List of existing links */}
                  {editedApp.links && editedApp.links.length > 0 && (
                      <div className="space-y-2 mb-4">
                          {editedApp.links.map((link, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-gray-900 p-2 border border-gray-700">
                                  <div className="flex-grow flex flex-col sm:flex-row sm:gap-4 text-xs">
                                      <span className="font-display text-fba-red uppercase">{link.label}</span>
                                      <span className="font-mono text-gray-400 truncate">{link.url}</span>
                                  </div>
                                  <button 
                                      onClick={() => handleRemoveLink(idx)}
                                      className="p-1 hover:text-red-500 text-gray-500 transition-colors"
                                      title="Remove Link"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* Add new link inputs */}
                  <div className="bg-gray-900/50 p-3 border border-gray-800 space-y-3">
                      <p className="text-[10px] text-gray-500 uppercase font-display">Add New Link</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input 
                              placeholder="LABEL (e.g. APP STORE)" 
                              value={newLinkLabel}
                              onChange={(e) => setNewLinkLabel(e.target.value)}
                              className="bg-black border border-gray-700 p-2 text-sm text-white focus:border-fba-red focus:outline-none font-mono uppercase"
                          />
                          <input 
                              placeholder="URL (https://...)" 
                              value={newLinkUrl}
                              onChange={(e) => setNewLinkUrl(e.target.value)}
                              className="bg-black border border-gray-700 p-2 text-sm text-white focus:border-fba-red focus:outline-none font-mono"
                          />
                      </div>
                      <Button onClick={handleAddLink} variant="secondary" className="w-full text-xs py-2" type="button">
                          <Plus size={14} className="mr-1 inline" /> Add Link
                      </Button>
                  </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                  <input type="checkbox" id="hidden" name="hidden" checked={editedApp.hidden} onChange={(e) => handleGenericChange({ hidden: e.target.checked })} className="w-5 h-5 accent-fba-red" />
                  <label htmlFor="hidden" className="font-display uppercase text-sm">Hidden</label>
              </div>
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

export default EditAppModal;