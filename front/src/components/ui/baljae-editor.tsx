import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Code, Quote, Minus, Undo, Redo, Terminal,
} from 'lucide-react';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarBtn = ({ onClick, active, title, children }: ToolbarButtonProps) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`baljae-toolbar-btn${active ? ' baljae-toolbar-btn--active' : ''}`}
  >
    {children}
  </button>
);

interface BaljaeEditorProps {
  content: string;
  editable?: boolean;
  onUpdate?: (html: string) => void;
}

const BaljaeEditor = ({ content, editable = true, onUpdate }: BaljaeEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'baljae-code-block' } },
      }),
      Placeholder.configure({ placeholder: '내용을 입력하세요. "/" 로 블록을 삽입할 수 있습니다...' }),
      Typography,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => onUpdate?.(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="baljae-editor-wrap">
      {editable && (
        <div className="baljae-toolbar">
          {/* History */}
          <ToolbarBtn title="실행 취소" onClick={() => editor.chain().focus().undo().run()}>
            <Undo size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="다시 실행" onClick={() => editor.chain().focus().redo().run()}>
            <Redo size={14} />
          </ToolbarBtn>

          <div className="baljae-toolbar-sep" />

          {/* Headings */}
          {([1, 2, 3] as const).map(level => (
            <ToolbarBtn
              key={level}
              title={`제목 ${level}`}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              active={editor.isActive('heading', { level })}
            >
              <span style={{ fontSize: 12, fontWeight: 700 }}>H{level}</span>
            </ToolbarBtn>
          ))}

          <div className="baljae-toolbar-sep" />

          {/* Marks */}
          <ToolbarBtn title="굵게" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
            <Bold size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="기울임" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
            <Italic size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="취소선" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
            <Strikethrough size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="인라인 코드" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
            <Code size={14} />
          </ToolbarBtn>

          <div className="baljae-toolbar-sep" />

          {/* Blocks */}
          <ToolbarBtn title="불릿 목록" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
            <List size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="번호 목록" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
            <ListOrdered size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="인용문" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
            <Quote size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="코드 블록" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
            <Terminal size={14} />
          </ToolbarBtn>
          <ToolbarBtn title="구분선" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus size={14} />
          </ToolbarBtn>
        </div>
      )}

      <EditorContent editor={editor} className="baljae-editor-content" />
    </div>
  );
};

export default BaljaeEditor;
