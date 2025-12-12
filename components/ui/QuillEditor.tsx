import React, { useEffect, useRef, useMemo } from 'react';
import { RichTextBlock } from '../../types/index.ts';
import { uploadFile } from '../../utils/storage.ts';
import toast from 'react-hot-toast';
import { useAdmin } from '../../hooks/useAdmin.ts';

declare const Quill: any;

interface QuillEditorProps {
    value: RichTextBlock[];
    onChange: (value: RichTextBlock[]) => void;
}

const fontSizes = ['10px', '12px', '14px', '16px', '18px', '24px', '36px', '48px'];

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillInstance = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { supabaseClient } = useAdmin();
    
    const initialValue = useMemo(() => value, []);

    useEffect(() => {
        if (editorRef.current && typeof Quill !== 'undefined' && !quillInstance.current) {
            // Register custom font sizes using inline styles
            const Size = Quill.import('attributors/style/size');
            Size.whitelist = fontSizes;
            Quill.register(Size, true);

            const quill = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    [{ 'size': fontSizes }],
                    ['bold', 'italic', 'underline'],
                    [
                        { 'align': '' }, 
                        { 'align': 'center' }, 
                        { 'align': 'right' }, 
                        { 'align': 'justify' }
                    ],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image', 'code-block'],
                    ['clean']
                  ]
                }
            });
            quillInstance.current = quill;
            
            const toolbar = quill.getModule('toolbar');
            toolbar.addHandler('image', () => {
                fileInputRef.current?.click();
            });

            const block = Array.isArray(initialValue) ? initialValue[0] : null;
            if (block && block.type === 'quill-delta' && block.delta) {
                quill.setContents(block.delta);
            }

            quill.on('text-change', () => {
                const newContent: RichTextBlock[] = [{ type: 'quill-delta', delta: quill.getContents() }];
                onChange(newContent);
            });
        }
    }, [initialValue, onChange]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !quillInstance.current) return;
        
        const toastId = toast.loading('Uploading image...');
        try {
            const url = await uploadFile(file, supabaseClient, 'media');
            const range = quillInstance.current.getSelection(true);
            quillInstance.current.insertEmbed(range.index, 'image', url, 'user');
            quillInstance.current.setSelection(range.index + 1, 'silent');
            toast.success('Image inserted!', { id: toastId });
        } catch (err: any) {
             toast.error(`Upload failed. Check console.`, { id: toastId });
        } finally {
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-black text-fba-white">
            <div ref={editorRef} />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
              accept="image/*" 
            />
        </div>
    );
};

export default QuillEditor;