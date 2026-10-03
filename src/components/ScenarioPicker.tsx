import { useState } from 'react';
import { Icon } from './Icon';
import { Header } from './Header';
import type { StoryId } from '../types/game';

const scenarios = [
  { id: 'cafe', storyId: undefined, icon: '☕', title: 'Café', description: 'Order a coffee and a croissant.', available: false },
  { id: 'bakery', storyId: undefined, icon: '🥖', title: 'Boulangerie', description: 'Buy a baguette and pay.', available: false },
  { id: 'paris', storyId: 'paris', icon: '🥐', title: 'Lost in Paris', description: 'Find the best croissant using only your French.', available: true },
  { id: 'party', storyId: 'first_party', icon: '🎉', title: 'Go to my first party', description: 'Meet new people and join the conversation in French.', available: true },
  { id: 'club', storyId: 'club', icon: '🪩', title: 'Nightclub', description: 'Get past a bouncer who hates your outfit.', available: true },
  { id: 'station', storyId: undefined, icon: '🚆', title: 'Train station', description: 'Buy a ticket and find your platform.', available: false },
  { id: 'doctor', storyId: undefined, icon: '🩺', title: 'Doctor', description: 'Make an appointment in French.', available: false },
] as const;

const helpLevels = [
  { id: 'beginner', title: 'Beginner', description: 'Hints come quickly' },
  { id: 'intermediate', title: 'Intermediate', description: 'Hints on request' },
  { id: 'challenge', title: 'Challenge me', description: 'Fewer hints, odd questions' },
] as const;

export function ScenarioPicker({ onEnter, onBack }: { onEnter: (storyId: StoryId) => void; onBack:()=>void }) {
  const [selectedScenario, setSelectedScenario] = useState<StoryId>('paris');
  const [selectedHelp, setSelectedHelp] = useState('intermediate');

  return (
    <main className="scenario-page">
      <Header home onHome={onBack} onBack={onBack}/>

      <section className="scenario-content" aria-labelledby="scenario-title">
        <h1 id="scenario-title">Where will your Language take you?</h1>
        <p className="scenario-lead">Choose a little adventure. Meet the characters, find your words, and let the conversation lead the way.</p>

        <h2 className="scenario-question">1. Where are you going?</h2>
        <p className="scenario-note">You won&apos;t know who&apos;s working until you walk in.</p>
        <div className="scenario-cards" role="group" aria-label="Choose a scenario">
          {scenarios.map(scenario => (
            <button
              className="scenario-card"
              type="button"
              key={scenario.id}
              disabled={!scenario.available}
              aria-pressed={selectedScenario === scenario.storyId}
              onClick={() => {
                if (!scenario.storyId) return;
                setSelectedScenario(scenario.storyId);
                if (scenario.storyId === 'first_party') setSelectedHelp('beginner');
              }}
            >
              <span className="scenario-icon" aria-hidden="true">{scenario.icon}</span>
              <strong>{scenario.title}</strong>
              <span className="scenario-description">{scenario.description}</span>
              {!scenario.available && <span className="scenario-tag">Coming soon</span>}
              {scenario.id === 'paris' && <span className="scenario-tag">Voice adventure</span>}
              {scenario.id === 'club' && <span className="scenario-tag">Voice adventure</span>}
              {scenario.id === 'party' && <span className="scenario-tag">Beginner · A1</span>}
            </button>
          ))}
        </div>

        <h2 className="scenario-question">2. How much help do you want?</h2>
        <div className="scenario-help" role="group" aria-label="Choose your hint preference">
          {helpLevels.map(level => (
            <button
              type="button"
              key={level.id}
              aria-pressed={selectedHelp === level.id}
              onClick={() => setSelectedHelp(level.id)}
            >
              <strong>{level.title}</strong>
              <span>{level.description}</span>
            </button>
          ))}
        </div>

        <button className="primary-button scenario-enter" type="button" onClick={() => onEnter(selectedScenario)}>
          {selectedScenario === 'first_party' ? 'Go to the party' : 'Walk in'} <span aria-hidden="true">→</span>
        </button>


      </section>
    </main>
  );
}
