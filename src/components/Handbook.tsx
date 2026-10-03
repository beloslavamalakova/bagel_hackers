import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import type { TaskId } from '../types/game';
import type { SceneConfig } from '../types/game';

type LanguageLine = { french: string; english: string };
type HandbookContent = { vocabulary: LanguageLine[]; phrases: LanguageLine[]; tip: string };
const understandingPhrases: LanguageLine[] = [
  {
    french: 'En anglais, s’il vous plaît ?',
    english: 'In English, please?',
  },
  {
    french: 'Ça veut dire quoi ?',
    english: 'What does that mean?',
  },
];
const understandingWords: LanguageLine[] = [
  { french: 'anglais', english: 'English' },
  { french: 'ça veut dire', english: 'that means' },
  { french: 's’il vous plaît', english: 'please' },
];

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
  party_arrival: {
    vocabulary: [
      { french: 'bonsoir', english: 'good evening' },
      { french: 'bienvenue', english: 'welcome' },
      { french: 'je m’appelle', english: 'my name is' },
      { french: 'enchanté(e)', english: 'nice to meet you' },
    ],
    phrases: [
      { french: 'Bonsoir ! Je m’appelle…', english: 'Good evening! My name is…' },
      { french: 'Merci pour l’invitation.', english: 'Thank you for the invitation.' },
      { french: 'Enchanté(e) !', english: 'Nice to meet you!' },
    ],
    tip: 'A smile and “Bonsoir !” are a perfect way to arrive. You only need to say your name to start.',
  },
  party_meet_someone: {
    vocabulary: [
      { french: 'comment', english: 'what / how' },
      { french: 'vous appelez-vous ?', english: 'are you called?' },
      { french: 'je viens de', english: 'I come from' },
      { french: 'et vous ?', english: 'and you?' },
    ],
    phrases: [
      { french: 'Comment vous appelez-vous ?', english: 'What is your name?' },
      { french: 'Vous venez d’où ?', english: 'Where are you from?' },
      { french: 'Je viens de…', english: 'I come from…' },
    ],
    tip: 'At a party you can use “tu” with people your age, but “vous” is always a polite choice when you first meet.',
  },
  party_join_chat: {
    vocabulary: [
      { french: 'j’aime', english: 'I like' },
      { french: 'la musique', english: 'the music' },
      { french: 'danser', english: 'to dance' },
      { french: 'un jus', english: 'a juice' },
      { french: 'c’est délicieux', english: 'it’s delicious' },
    ],
    phrases: [
      { french: 'J’aime bien cette musique.', english: 'I like this music.' },
      { french: 'C’est délicieux !', english: 'It’s delicious!' },
      { french: 'Et toi, tu aimes danser ?', english: 'And you, do you like dancing?' },
    ],
    tip: 'You don’t need a perfect sentence to join in. Share one thing you like, then ask “Et toi ?”',
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
              <section className="handbook-understanding" aria-labelledby="handbook-understanding-title">
                <div className="handbook-section-title"><span>HELP</span><h3 id="handbook-understanding-title">Didn’t understand?</h3></div>
                <p className="handbook-understanding-note">Keep it simple. Try one of these:</p>
                {understandingPhrases.map(item => (
                  <article className="handbook-phrase" key={item.french}>
                    <div><p lang="fr">{item.french}</p><span>{item.english}</span></div>
                    {listenButton(item.french, item.french)}
                  </article>
                ))}
                <div className="handbook-understanding-words" aria-label="Helpful words">
                  {understandingWords.map(item => (
                    <div className="handbook-understanding-word" key={item.french}>
                      <span><strong lang="fr">{item.french}</strong><small>{item.english}</small></span>
                      {listenButton(item.french, item.french)}
                    </div>
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
