
import React from 'react';
import { Copy, Check } from 'lucide-react';

interface RichCodeBlockProps {
  code: string;
  title?: string;
  language?: string;
  showCopyButton?: boolean;
}

// C/C++ keywords and their colors
const CPP_KEYWORDS = {
  keywords: [
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
    'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
    'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
    'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile',
    'while', 'bool', 'true', 'false', 'nullptr', 'class', 'public', 'private',
    'protected', 'virtual', 'override', 'final', 'namespace', 'using', 'template',
    'typename', 'this', 'new', 'delete', 'try', 'catch', 'throw', 'const_cast',
    'dynamic_cast', 'reinterpret_cast', 'static_cast', 'explicit', 'inline',
    'friend', 'operator', 'mutable', 'constexpr', 'decltype', 'noexcept'
  ],
  types: [
    'std::string', 'std::vector', 'std::map', 'std::set', 'std::array',
    'std::unique_ptr', 'std::shared_ptr', 'std::weak_ptr', 'std::function',
    'string', 'vector', 'map', 'set', 'array', 'unique_ptr', 'shared_ptr',
    'size_t', 'ptrdiff_t', 'nullptr_t', 'wchar_t', 'char16_t', 'char32_t'
  ]
};

interface Token {
  type: string;
  value: string;
  start: number;
  end: number;
  className: string;
}

const highlightCppCode = (code: string): JSX.Element[] => {
  const lines = code.split('\n');
  
  return lines.map((line, lineIndex) => {
    const tokens = tokenizeLine(line);
    
    return (
      <div key={lineIndex} className="flex group hover:bg-slate-800/30 transition-colors duration-150">
        {/* Line number */}
        <span className="text-slate-500 text-sm mr-6 select-none min-w-[3rem] text-right font-mono leading-6 pt-0.5">
          {lineIndex + 1}
        </span>
        {/* Code content */}
        <div className="flex-1 font-mono text-sm leading-6">
          {tokens.length > 0 ? (
            tokens.map((token, tokenIndex) => (
              <span key={tokenIndex} className={token.className}>
                {token.value}
              </span>
            ))
          ) : (
            <span className="text-slate-300">{line || ' '}</span>
          )}
        </div>
      </div>
    );
  });
};

const tokenizeLine = (line: string): Token[] => {
  const tokens: Token[] = [];
  let currentIndex = 0;
  
  // Define token patterns in order of priority
  const tokenPatterns = [
    // Single-line comments (highest priority)
    { regex: /\/\/.*$/g, type: 'comment', className: 'text-slate-500 italic' },
    // Multi-line comments
    { regex: /\/\*[\s\S]*?\*\//g, type: 'comment', className: 'text-slate-500 italic' },
    // String literals
    { regex: /"([^"\\]|\\.)*"/g, type: 'string', className: 'text-emerald-400' },
    { regex: /'([^'\\]|\\.)*'/g, type: 'string', className: 'text-emerald-400' },
    // Preprocessor directives
    { regex: /#\w+/g, type: 'preprocessor', className: 'text-purple-700 font-medium' },
    // Numbers
    { regex: /\b\d+(\.\d+)?([eE][+-]?\d+)?[fFlL]?\b/g, type: 'number', className: 'text-amber-700' },
    // Function calls (identifier followed by opening parenthesis)
    { regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, type: 'function', className: 'text-blue-400' },
    // Keywords
    { regex: new RegExp(`\\b(${CPP_KEYWORDS.keywords.join('|')})\\b`, 'g'), type: 'keyword', className: 'text-pink-400 font-medium' },
    // Types
    { regex: new RegExp(`\\b(${CPP_KEYWORDS.types.join('|')})\\b`, 'g'), type: 'type', className: 'text-cyan-400' },
    // Operators
    { regex: /[+\-*/%=<>!&|^~?:]/g, type: 'operator', className: 'text-orange-400' },
    // Brackets and braces
    { regex: /[(){}\[\]]/g, type: 'punctuation', className: 'text-yellow-600' },
    // Semicolons and commas
    { regex: /[;,]/g, type: 'punctuation', className: 'text-slate-400' }
  ];
  
  // Find all matches
  const allMatches: Array<{ match: RegExpMatchArray; pattern: any }> = [];
  
  tokenPatterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(line)) !== null) {
      allMatches.push({ match, pattern });
    }
  });
  
  // Sort matches by position, then by priority (earlier patterns have higher priority)
  allMatches.sort((a, b) => {
    if (a.match.index !== b.match.index) {
      return a.match.index! - b.match.index!;
    }
    // If same position, prioritize by pattern order
    return tokenPatterns.indexOf(a.pattern) - tokenPatterns.indexOf(b.pattern);
  });
  
  // Remove overlapping matches (keep higher priority ones)
  const filteredMatches = [];
  let lastEnd = 0;
  
  for (const { match, pattern } of allMatches) {
    const start = match.index!;
    const end = start + match[0].length;
    
    // Only keep non-overlapping matches
    if (start >= lastEnd) {
      filteredMatches.push({ match, pattern });
      lastEnd = end;
    }
  }
  
  // Create tokens
  let pos = 0;
  
  for (const { match, pattern } of filteredMatches) {
    const start = match.index!;
    const end = start + match[0].length;
    
    // Add plain text before this match
    if (start > pos) {
      tokens.push({
        type: 'text',
        value: line.slice(pos, start),
        start: pos,
        end: start,
        className: 'text-slate-300'
      });
    }
    
    // Add the matched token
    tokens.push({
      type: pattern.type,
      value: match[0],
      start: start,
      end: end,
      className: pattern.className
    });
    
    pos = end;
  }
  
  // Add remaining text
  if (pos < line.length) {
    tokens.push({
      type: 'text',
      value: line.slice(pos),
      start: pos,
      end: line.length,
      className: 'text-slate-300'
    });
  }
  
  return tokens;
};

const RichCodeBlock: React.FC<RichCodeBlockProps> = ({ 
  code, 
  title = "Code", 
  language = "cpp",
  showCopyButton = true 
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const isCppLanguage = language === 'cpp' || language === 'c' || language === 'c++';

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900">
      {/* Header */}
      <div className="bg-stone-200 backdrop-blur-sm px-6 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-text text-sm">{title}</span>
              {language && (
                <span className="text-xs bg-slate-700/60 px-2.5 py-1 rounded-md text-slate-300 font-medium border border-slate-600/50">
                  {language.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-lg p-2 transition-all duration-200 hover:bg-slate-700/50"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code content */}
      {/* <div className="relative bg-stone-100">
        <pre className="p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/40 hover:scrollbar-thumb-slate-500 transition-all duration-300">
          <code className="block">
            {isCppLanguage ? (
              <>{highlightCppCode(code)}</>
            ) : (
              <span className="text-slate-300 font-mono text-sm leading-6">
                {code}
              </span>
            )}
          </code>
        </pre>
      </div> */}

      <div className="relative bg-stone-100 border border-stone-300 rounded-md">
        <pre className="p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/40 hover:scrollbar-thumb-slate-500 transition-all duration-300">
          <code className="block">
            {isCppLanguage ? (
              <>{highlightCppCode(code)}</>
            ) : (
              <span className="text-pink-700 font-mono font-medium text-sm leading-6">
                {code}
              </span>
            )}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default RichCodeBlock;