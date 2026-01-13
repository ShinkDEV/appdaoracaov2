import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = [
  'Cura',
  'Libertação',
  'Família',
  'Trabalho',
  'Igreja',
  'Nações',
  'Sabedoria',
  'Emoções',
  'Relacionamentos',
  'Finanças',
  'Liderança',
  'Autoridades',
  'Decisões',
  'Sentimentos'
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
    <span className="inline-block min-w-[140px] sm:min-w-[180px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={displayText}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="text-[hsl(190,100%,85%)] font-bold"
        >
          {displayText}
        </motion.span>
      </AnimatePresence>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="text-[hsl(190,100%,85%)] ml-0.5"
      >
        |
      </motion.span>
    </span>
  );
}