import React, { useEffect, useState } from 'react';
import { GripVertical, Plus, Trash2, X } from 'lucide-react';
import { RichTextBlock, SiteInfo } from '../../types/index.ts';
import Button from '../ui/Button.tsx';
import Input from '../ui/Input.tsx';
import QuillEditor from '../ui/QuillEditor.tsx';
import Portal from '../ui/Portal.tsx';
import FilePicker from '../ui/FilePicker.tsx';
import LoadingImage from '../ui/LoadingImage.tsx';
import { useSortable } from '../../hooks/useSortable.ts';
import toast from 'react-hot-toast';

interface EditInfoModalProps { info: SiteInfo; onClose: () => void; onSave: (updatedInfo: SiteInfo) => void; }

const EditInfoModal: React.FC<EditInfoModalProps> = ({ info, onClose, onSave }) => {
  const initialImages = (info.body_richtext || []).filter(block => block.type === 'linked-image');
  const [mode, setMode] = useState<'html' | 'images'>(initialImages.length ? 'images' : 'html');
  const [htmlBlocks, setHtmlBlocks] = useState<RichTextBlock[]>(initialImages.length ? [] : info.body_richtext || []);
  const [imageBlocks, setImageBlocks] = useState<RichTextBlock[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const sortableRef = useSortable(imageBlocks, setImageBlocks, true);

  useEffect(() => {
    const images = (info.body_richtext || []).filter(block => block.type === 'linked-image');
    setMode(images.length ? 'images' : 'html');
    setImageBlocks(images);
    if (!images.length) setHtmlBlocks(info.body_richtext || []);
  }, [info]);

  const addImage = () => {
    if (!newImageUrl.trim()) return toast.error('Upload an image or enter its URL first.');
    setImageBlocks(items => [...items, { type: 'linked-image', src: newImageUrl.trim(), url: newLinkUrl.trim(), alt: 'FBA information link' }]);
    setNewImageUrl('');
    setNewLinkUrl('');
  };

  return <Portal>
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative mb-8 mt-16 w-full max-w-2xl border-2 border-gray-800 bg-[#0A0A0A] p-6 text-fba-white">
        <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-lg uppercase">Edit Info Content</h2><button onClick={onClose} className="text-gray-500 hover:text-white"><X size={24} /></button></div>
        <div className="mb-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setMode('html')} className={`border p-3 font-display text-xs uppercase ${mode === 'html' ? 'border-fba-red bg-fba-red' : 'border-gray-700 bg-black'}`}>HTML / Rich Text</button>
          <button type="button" onClick={() => setMode('images')} className={`border p-3 font-display text-xs uppercase ${mode === 'images' ? 'border-fba-red bg-fba-red' : 'border-gray-700 bg-black'}`}>Image Stack</button>
        </div>
        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {mode === 'html' ? <QuillEditor value={htmlBlocks} onChange={setHtmlBlocks} /> : <>
            <p className="text-xs text-gray-400">Drag the handles to reorder panels. Each image can have its own destination link.</p>
            <div ref={sortableRef as React.RefObject<HTMLDivElement>} className="space-y-2">
              {imageBlocks.map((block, index) => <div key={`${block.src}-${index}`} className="flex items-center gap-2 border border-gray-700 bg-black p-2">
                <GripVertical size={18} className="cursor-grab flex-shrink-0 text-gray-500" />
                <LoadingImage src={block.src || ''} alt={block.alt || ''} containerClassName="h-16 w-24 flex-shrink-0" className="h-full w-full object-contain" />
                <div className="min-w-0 flex-1 font-mono text-xs text-gray-400"><div className="truncate">{block.src}</div><div className="truncate text-fba-red">{block.url || 'No link'}</div></div>
                <button type="button" onClick={() => setImageBlocks(items => items.filter((_, i) => i !== index))} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
              </div>)}
            </div>
            <div className="space-y-3 border border-gray-800 bg-black/40 p-3">
              <FilePicker label="Info Panel Image" currentUrl={newImageUrl} onUrlChange={setNewImageUrl} bucket="media" />
              <Input id="info-panel-link" label="Panel Destination URL" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." />
              <Button type="button" variant="secondary" fullWidth onClick={addImage}><Plus size={14} className="mr-1" /> Add Panel</Button>
            </div>
          </>}
        </div>
        <div className="flex justify-end gap-4 pt-6"><Button onClick={onClose} variant="secondary">Cancel</Button><Button onClick={() => { onSave({ ...info, body_richtext: mode === 'images' ? imageBlocks : htmlBlocks }); onClose(); }}>Save Changes</Button></div>
      </div>
    </div>
  </Portal>;
};

export default EditInfoModal;
