import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import type { TaskId } from '../types/game';
import type { SceneConfig } from '../types/game';

type LanguageLine = { french: string; english: string };
type HandbookContent = { vocabulary: LanguageLine[]; phrases: LanguageLine[]; tip: string };

const content: Record<TaskId, HandbookContent> = {
  street_recommendation: {
    vocabulary: [
      { french: 'un croissant', english: 'a croissant' },
      { french: 'une boulangerie', english: 'a bakery' },
      { french: 'où', english: 'where' },
      { french: 'trouver', english: 'to find' },
      { french: 'bon / bonne', english: 'good' },
    ],
    phrases: [
      { french: 'Excusez-moi.', english: 'Excuse me.' },
      { french: 'Où est-ce que je peux trouver un bon croissant ?', english: 'Where can I find a good croissant?' },
      { french: 'Merci beaucoup !', english: 'Thank you very much!' },
    ],
    tip: 'Start with “Excusez-moi” to politely get someone’s attention.',
  },
  street_directions: {
    vocabulary: [
      { french: 'tout droit', english: 'straight ahead' },
      { french: 'à gauche', english: 'to the left' },
      { french: 'à droite', english: 'to the right' },
      { french: 'à côté de', english: 'next to' },
      { french: 'la rue', english: 'the street' },
    ],
    phrases: [
      { french: 'Comment aller à Maison Lumière ?', english: 'How do I get to Maison Lumière?' },
      { french: 'Continuez tout droit, puis tournez à gauche.', english: 'Go straight ahead, then turn left.' },
      { french: 'La boulangerie est à côté du café.', english: 'The bakery is next to the café.' },
    ],
    tip: '“Excusez-moi” before your question makes asking for directions polite and natural.',
  },
  bakery_order: {
    vocabulary: [
      { french: 'je voudrais', english: 'I would like' },
      { french: 'un croissant', english: 'a croissant' },
      { french: 'un café', english: 'a coffee' },
      { french: 'sur place', english: 'to have it here' },
      { french: 'à emporter', english: 'to take away' },
    ],
    phrases: [
      { french: 'Je voudrais un croissant et un café, s’il vous plaît.', english: 'I would like a croissant and a coffee, please.' },
      { french: 'Sur place, s’il vous plaît.', english: 'For here, please.' },
      { french: 'À emporter, s’il vous plaît.', english: 'To take away, please.' },
    ],
    tip: 'After ordering, listen for “Sur place ou à emporter ?” and choose where you want to enjoy your order.',
  },
  bakery_smalltalk: {
    vocabulary: [
      { french: 'les vacances', english: 'the holidays' },
      { french: 'j’aime', english: 'I like' },
      { french: 'je viens de', english: 'I come from' },
      { french: 'le temps', english: 'the weather' },
      { french: 'et vous ?', english: 'and you? (polite)' },
    ],
    phrases: [
      { french: 'Je suis en vacances à Paris.', english: 'I’m on holiday in Paris.' },
      { french: 'J’aime beaucoup cette ville.', english: 'I really like this city.' },
      { french: 'Et vous, vous habitez à Paris ?', english: 'And you, do you live in Paris?' },
    ],
    tip: 'A short answer plus a question back is a great way to keep a conversation going.',
  },
};

export function Handbook({ scene }: { scene: SceneConfig }) {
  const [open, setOpen] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const guide = content[scene.id];

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.speechSynthesis?.cancel();
    };
  }, [open]);

  const close = () => {
    window.speechSynthesis?.cancel();
    setOpen(false);
    triggerRef.current?.focus();
  };

  const listen = (text: string) => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setAudioUnavailable(true);
      return;
    }
    setAudioUnavailable(false);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.85;
    const frenchVoice = window.speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase().startsWith('fr'));
    if (frenchVoice) utterance.voice = frenchVoice;
    window.speechSynthesis.speak(utterance);
  };

  const listenButton = (text: string, label: string) => (
    <button className="handbook-listen" type="button" aria-label={`Listen to ${label}`} onClick={() => listen(text)}>
      <Icon name="sound" size={16}/>
      <span>Listen</span>
    </button>
  );

  return (
    <>
      <button className="handbook-trigger" type="button" aria-label="Open the French handbook" ref={triggerRef} onClick={() => setOpen(true)}>
        <Icon name="book" size={18}/>
        <span><strong>Open your handbook</strong><small>Useful words and phrases for this encounter</small></span>
        <Icon name="arrow" size={17}/>
      </button>
      {open && (
        <div className="handbook-backdrop" onClick={close}>
          <section className="handbook-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="handbook-title" onClick={event => event.stopPropagation()}>
            <header className="handbook-dialog-header">
              <div>
                <div className="eyebrow">YOUR POCKET GUIDE</div>
                <h2 id="handbook-title">A little French for the way</h2>
                <p>{scene.title}<span>·</span>{scene.location}</p>
              </div>
              <button className="handbook-close" type="button" ref={closeRef} aria-label="Close handbook" onClick={close}>
                <Icon name="close" size={20}/>
              </button>
            </header>
            <div className="handbook-content">
              <section className="handbook-section" aria-labelledby="handbook-vocabulary">
                <div className="handbook-section-title"><span>01</span><h3 id="handbook-vocabulary">Useful words</h3></div>
                <div className="handbook-vocabulary">
                  {guide.vocabulary.map(item => (
                    <div className="handbook-word" key={item.french}>
                      <div><strong lang="fr">{item.french}</strong><span>{item.english}</span></div>
                      {listenButton(item.french, item.french)}
                    </div>
                  ))}
                </div>
              </section>
              <section className="handbook-section" aria-labelledby="handbook-phrases">
                <div className="handbook-section-title"><span>02</span><h3 id="handbook-phrases">Ready-to-use phrases</h3></div>
                <div className="handbook-phrases">
                  {guide.phrases.map(item => (
                    <article className="handbook-phrase" key={item.french}>
                      <div><p lang="fr">{item.french}</p><span>{item.english}</span></div>
                      {listenButton(item.french, item.french)}
                    </article>
                  ))}
                </div>
              </section>
              <aside className="handbook-tip"><Icon name="spark" size={17}/><p><strong>A small tip</strong>{guide.tip}</p></aside>
              {audioUnavailable && <p className="handbook-audio-message" role="status">Audio playback isn’t supported in this browser.</p>}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
