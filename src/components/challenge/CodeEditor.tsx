import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
}

const extensions = [javascript()];

export function CodeEditor({ value, onChange, readOnly }: CodeEditorProps) {
  return (
    <div className="code-editor">
      <div className="code-label">💻 Tu hechizo</div>
      <CodeMirror
        value={value}
        onChange={onChange}
        editable={!readOnly}
        theme={tokyoNight}
        extensions={extensions}
        basicSetup={{ lineNumbers: true, foldGutter: false, closeBrackets: false }}
        height="220px"
      />
    </div>
  );
}
