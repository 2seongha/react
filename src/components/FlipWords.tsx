import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'

type FlipWordsProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  words: string[]
  duration?: number
  letterDelay?: number
  wordDelay?: number
  animation?: boolean
}

function FlipWords({
  ref,
  words,
  duration = 0,
  letterDelay = 0.1,
  wordDelay = 0.5,
  className,
  animation,
  ...props
}: FlipWordsProps) {
  const localRef = React.useRef<HTMLSpanElement>(null)
  React.useImperativeHandle(ref, () => localRef.current as HTMLSpanElement)

  const [currentWord, setCurrentWord] = React.useState(words[0])

  React.useEffect(() => {
    if (words[0] !== currentWord) {
      setCurrentWord(words[0])
    }
  }, [words[0]])

  if (!animation) return (
    <span ref={localRef} data-slot="flip-words" {...props}>{currentWord}</span>
  );

  return (
    <span ref={localRef} data-slot="flip-words" {...props}>
      <AnimatePresence>
        <motion.span
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 10,
          }}
          exit={{
            opacity: 0,
            y: -40,
            x: 40,
            filter: 'blur(8px)',
            scale: 2,
            position: 'absolute',
          }}
          style={{
            position: "relative",
            textAlign: "left",
            padding: "0 2px",
            willChange: "transform opacity filter"
          }}
          key={currentWord}
        >
          {currentWord.split(' ').map((word, wordIndex) => (
            <motion.span
              key={`${word}-${wordIndex}`}
              initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                delay: wordIndex * wordDelay,
                duration: 0.3,
              }}
              style={{
                whiteSpace: "nowrap"
              }}
            >
              {word.split('').map((letter, letterIndex) => (
                <motion.span
                  key={`${word}-${letterIndex}`}
                  initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: wordIndex * wordDelay + letterIndex * letterDelay,
                    duration: 0.2,
                  }}
                  style={{
                    willChange: "transform opacity filter"
                  }}
                >
                  {letter}
                </motion.span>
              ))}
              <span className="inline-block">&nbsp;</span>
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export { FlipWords, type FlipWordsProps }