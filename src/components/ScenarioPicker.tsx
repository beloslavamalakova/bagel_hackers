import { useState } from 'react';
import { Icon } from './Icon';

const scenarios = [
  { id: 'cafe', icon: '☕', title: 'Café', description: 'Order a coffee and a croissant.', available: false },
  { id: 'bakery', icon: '🥖', title: 'Boulangerie', description: 'Buy a baguette and pay.', available: false },
  { id: 'paris', icon: '🥐', title: 'Lost in Paris', description: 'Find the best croissant using only your French.', available: true },
  { id: 'station', icon: '🚆', title: 'Train station', description: 'Buy a ticket and find your platform.', available: false },
  { id: 'doctor', icon: '🩺', title: 'Doctor', description: 'Make an appointment in French.', available: false },
] as const;

const helpLevels = [
  { id: 'beginner', title: 'Beginner', description: 'Hints come quickly' },
  { id: 'intermediate', title: 'Intermediate', description: 'Hints on request' },
  { id: 'challenge', title: 'Challenge me', description: 'Fewer hints, odd questions' },
] as const;

export function ScenarioPicker({ onEnter }: { onEnter: () => void }) {
  const [selectedScenario, setSelectedScenario] = useState('paris');
  const [selectedHelp, setSelectedHelp] = useState('intermediate');
  const [customSituation, setCustomSituation] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  return (
    <main className="scenario-page">
      <header className="scenario-header">
        <div className="scenario-brand"><Icon name="croissant" size={24}/><strong>Le Comptoir</strong></div>
        <div className="scenario-header-right">
          <span className="scenario-tagline">FRENCH · EVERYDAY COUNTERS</span>
          <span className="scenario-language">🇫🇷 French <span>A1</span></span>
        </div>
      </header>

      <section className="scenario-content" aria-labelledby="scenario-title">
        <h1 id="scenario-title">Rehearse the conversation you&apos;re afraid of.</h1>
        <p className="scenario-lead">Apps teach words. Real people talk fast, sigh and don&apos;t wait. Practice French with someone who feels real.</p>

        <h2 className="scenario-question">1. Where are you going?</h2>
        <p className="scenario-note">You won&apos;t know who&apos;s working until you walk in.</p>
        <div className="scenario-cards" role="group" aria-label="Choose a scenario">
          {scenarios.map(scenario => (
            <button
              className="scenario-card"
              type="button"
              key={scenario.id}
              disabled={!scenario.available}
              aria-pressed={selectedScenario === scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <span className="scenario-icon" aria-hidden="true">{scenario.icon}</span>
              <strong>{scenario.title}</strong>
              <span className="scenario-description">{scenario.description}</span>
              {!scenario.available && <span className="scenario-tag">Coming soon</span>}
              {scenario.id === 'paris' && <span className="scenario-tag">Voice adventure</span>}
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

        <button className="primary-button scenario-enter" type="button" onClick={onEnter} disabled={selectedScenario !== 'paris'}>
          Walk in <span aria-hidden="true">→</span>
        </button>

        <form className="scenario-custom" onSubmit={event => {
          event.preventDefault();
          setCustomMessage(customSituation.trim() ? 'Custom scenarios are coming soon.' : 'Type a situation first.');
        }}>
          <strong>Dreading something else?</strong>
          <input
            aria-label="Describe your own situation"
            placeholder="e.g. Call my landlord about a leak"
            value={customSituation}
            onChange={event => { setCustomSituation(event.target.value); setCustomMessage(''); }}
          />
          <button type="submit">Build it</button>
          {customMessage && <span className="scenario-custom-message" role="status">{customMessage}</span>}
        </form>
      </section>
    </main>
  );
}
