"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useRef, useState } from "react";

interface Props {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function WysiwygEditor({ content, onChange, placeholder = "Start writing…" }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit, ImageExtension, LinkExtension.configure({ openOnClick: false })],
        content,
        onUpdate({ editor }) { onChange(editor.getHTML()); },
        editorProps: { attributes: { class: "tiptap-content" } },
        immediatelyRender: false,
    });

    if (!editor) return null;

    const setLink = () => { const url = window.prompt("Enter URL:"); if (!url) return; editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run(); };

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !editor) return;
        setUploading(true);
        try { onChange(`<img src="${await uploadToCloudinary(file)}" alt="" />`); }
        catch (err) { alert(err instanceof Error ? err.message : "Image upload failed."); }
        finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    }

    const ToolBtn = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
        <button type="button" onClick={onClick} title={title}>{children}</button>
    );

    return (
        <div className="tiptap-editor">
            <div className="tiptap-toolbar">
                <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><strong>B</strong></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">UL</ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List">OL</ToolBtn>
                <ToolBtn onClick={setLink} title="Add Link">Link</ToolBtn>
                <ToolBtn onClick={() => { if (!fileInputRef.current) return; fileInputRef.current.click(); }} title="Insert Image">{uploading ? "…" : "Img"}</ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolBtn>
                <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolBtn>
            </div>
            <EditorContent editor={editor} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
    );
}
