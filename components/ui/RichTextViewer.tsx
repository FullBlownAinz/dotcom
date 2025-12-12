import React, { useEffect, useRef } from 'react';
import { RichTextBlock } from '../../types/index.ts';

declare const Quill: any;

interface RichTextViewerProps {
    blocks: RichTextBlock[];
}

const fontSizes = ['10px', '12px', '14px', '16px', '18px', '24px', '36px', '48px'];

const RichTextViewer: React.FC<RichTextViewerProps> = ({ blocks }) => {
    const quillRef = useRef<HTMLDivElement>(null);
    const isQuillDelta = blocks && blocks[0]?.type === 'quill-delta' && blocks[0].delta;

    useEffect(() => {
        if (isQuillDelta && quillRef.current && typeof Quill !== 'undefined') {
            if (quillRef.current.innerHTML !== '') return;

            // Register custom font sizes so they render correctly in read-only mode
            const Size = Quill.import('attributors/style/size');
            Size.whitelist = fontSizes;
            Quill.register(Size, true);

            const quill = new Quill(quillRef.current, {
                theme: 'snow',
                readOnly: true,
                modules: { toolbar: false }
            });
            quill.setContents(blocks[0].delta);
            // Remove the toolbar as it's not needed for read-only view
            const toolbar = quillRef.current.querySelector('.ql-toolbar');
            if(toolbar) toolbar.remove();
        }
    }, [blocks, isQuillDelta]);

    if (isQuillDelta) {
        return <div ref={quillRef} className="prose prose-invert max-w-none prose-headings:font-display prose-headings:uppercase prose-a:text-fba-red" />;
    }

    // Fallback renderer for old data structure
    return (
        <div className="space-y-4 prose prose-invert prose-headings:font-display prose-headings:uppercase prose-a:text-fba-red">
            {blocks.map((block, index) => {
                switch (block.type) {
                    case 'heading':
                        const Tag = `h${block.level || 2}` as 'h1' | 'h2' | 'h3';
                        return <Tag key={index}>{block.content}</Tag>;
                    case 'paragraph':
                        return <p key={index}>{block.content}</p>;
                    case 'list':
                        return <ul key={index} className="list-disc list-inside">{block.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>;
                    case 'image':
                        return <img key={index} src={block.src} alt={block.alt || ''} className="max-w-full h-auto rounded-md" />;
                    case 'video':
                         return <video key={index} src={block.src} controls className="max-w-full h-auto rounded-md" />;
                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default RichTextViewer;