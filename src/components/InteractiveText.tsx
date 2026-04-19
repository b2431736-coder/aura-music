import React from 'react';

export function InteractiveText({ text, mode = 'word', active = false }: { text: string; mode?: 'word' | 'letter'; active?: boolean }) {
  if (!text) return null;

  const colorClass = active ? 'text-accent drop-shadow-[0_0_12px_rgba(250,36,60,0.4)] brightness-125' : 'text-glow';

  if (mode === 'letter') {
    return (
      <span className="inline-flex flex-wrap">
        {text.split('').map((char, index) => (
          char === ' ' ? <span key={index}>&nbsp;</span> :
          <span key={index} className={`interactive-pop ${colorClass}`}>
            {char}
          </span>
        ))}
      </span>
    );
  }

  // Word mode
  const words = text.split(' ');
  return (
    <>
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <span className={`interactive-pop ${colorClass}`}>{word}</span>
          {index < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </>
  );
}
