import { useState, useEffect } from 'react';

const words = [
  'curas',
  'libertações',
  'famílias',
  'trabalhos',
  'igrejas',
  'nações',
  'emoções',
  'relacionamentos',
  'finanças',
  'lideranças',
  'autoridades',
  'decisões',
  'sentimentos'
];

export function TypewriterText() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          // Wait before starting to delete
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex]);

  return (
    <span className="inline-block text-center">
      <span className="text-[hsl(190,100%,85%)] font-bold transition-opacity duration-150">
        {displayText}
      </span>
      <span className="text-[hsl(190,100%,85%)] ml-0.5 animate-pulse">
        |
      </span>
    </span>
  );
}
