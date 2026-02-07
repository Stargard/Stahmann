import React, { useMemo, useState } from 'react';

type WritingStyle = {
  id: string;
  name: string;
  description: string;
  source: 'default' | 'custom';
};

type ChapterData = {
  id: number;
  outline: string;
  beatSheet: string;
  deepSearchPrompt: string;
  researchNotes: string;
  qualityScore: number;
  translation: string;
  draft: string;
};

const defaultStyles: WritingStyle[] = [
  {
    id: 'hemingway',
    name: 'Ernest Hemingway',
    description:
      'Klare, knappe Sprache mit starkem Rhythmus, kurzen Sätzen und sichtbarer Subtext-Ebene.',
    source: 'default',
  },
  {
    id: 'boyle',
    name: 'T.C. Boyle',
    description:
      'Sinnliche Details, dynamische Szenen und eine ironisch-verspielte Tonlage.',
    source: 'default',
  },
  {
    id: 'morison',
    name: 'Toni Morrison',
    description:
      'Poetische Dichte, starke emotionale Perspektiven und lebendige Bilder.',
    source: 'default',
  },
];

const languages = [
  'Deutsch',
  'Englisch',
  'Französisch',
  'Spanisch',
  'Italienisch',
  'Portugiesisch',
  'Japanisch',
  'Koreanisch',
];

const buildDeepSearchPrompt = (idea: string, chapterNumber: number) =>
  `Deep Search: Kapitel ${chapterNumber}\n\nThema & Fokus:\n- ${idea || 'Leitidee ergänzen'}\n\nRecherche-Aufgaben:\n1) Zentrale Fakten, historische Daten oder technische Grundlagen verifizieren.\n2) Lokale Details: Orte, Klima, Gerüche, Geräusche, soziale Rituale.\n3) Konfliktquellen & Reibungspunkte, die authentisch sind.\n4) Gegensätze: kontroverse Sichtweisen, Debatten, offene Fragen.\n5) Primär- und Sekundärquellen benennen (mit Kurznotizen).\n\nOutput-Format:\n- 5–8 prägnante Fakten\n- 3–5 sensorische Details\n- 2–3 mögliche dramaturgische Wendungen\n- Quellenliste (Stichworte)`;

const buildBeatSheetTemplate = () =>
  `Beat Sheet (Beispielstruktur):\n- Einstieg (Ton, Tempo, Atmosphäre)\n- Auslöser (Konfliktmoment)\n- Emotionale Kurve (Spannung, Hoffnung, Zweifel)\n- Sinneseindrücke (Gerüche, Farben, Geräusche)\n- Historische / faktische Einbettung\n- Entscheidung / Wendepunkt\n- Offener Haken fürs nächste Kapitel`;

const App: React.FC = () => {
  const [wordCount, setWordCount] = useState(50000);
  const [chapterCount, setChapterCount] = useState(10);
  const [styles, setStyles] = useState<WritingStyle[]>(defaultStyles);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleDescription, setNewStyleDescription] = useState('');
  const [newStyleSample, setNewStyleSample] = useState('');

  const [ideaInput, setIdeaInput] = useState('');
  const [ideaSuggestions, setIdeaSuggestions] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState('');
  const [ideaRefinement, setIdeaRefinement] = useState('');

  const [outlineChapters, setOutlineChapters] = useState<string[]>([]);
  const [chapterData, setChapterData] = useState<ChapterData[]>([]);
  const [activeChapter, setActiveChapter] = useState(1);

  const wordsPerChapter = useMemo(() => {
    if (!chapterCount) return 0;
    return Math.round(wordCount / chapterCount);
  }, [wordCount, chapterCount]);

  const ideaBase = selectedIdea || ideaInput || 'Idee hinzufügen';

  const handleAddStyle = () => {
    if (!newStyleName.trim()) return;
    setStyles(prev => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: newStyleName.trim(),
        description: [newStyleDescription, newStyleSample]
          .filter(Boolean)
          .join('\n\n')
          .trim(),
        source: 'custom',
      },
    ]);
    setNewStyleName('');
    setNewStyleDescription('');
    setNewStyleSample('');
  };

  const handleGenerateIdeas = () => {
    const base = ideaInput || 'Eine unerwartete Begegnung verändert das Leben.';
    setIdeaSuggestions([
      `${base} – erzählt aus zwei gegensätzlichen Perspektiven.`,
      `${base} – eingebettet in einen historischen Wendepunkt.`,
      `${base} – mit einer geheimen Verbindung zwischen den Figuren.`,
    ]);
  };

  const handleGenerateOutline = () => {
    const nextOutline = Array.from({ length: chapterCount }, (_, index) => {
      return `Kapitel ${index + 1}: ${ideaBase} – Fokus auf Wendung ${index + 1} und ein klares Ziel.`;
    });
    setOutlineChapters(nextOutline);

    const nextChapterData = Array.from({ length: chapterCount }, (_, index) => {
      const current = chapterData[index];
      const outline = nextOutline[index];
      return (
        current || {
          id: index + 1,
          outline,
          beatSheet: buildBeatSheetTemplate(),
          deepSearchPrompt: buildDeepSearchPrompt(ideaBase, index + 1),
          researchNotes: '',
          qualityScore: 75,
          translation: 'Deutsch',
          draft: '',
        }
      );
    });

    setChapterData(nextChapterData);
    if (activeChapter > chapterCount) {
      setActiveChapter(1);
    }
  };

  const updateChapterData = (chapterId: number, updates: Partial<ChapterData>) => {
    setChapterData(prev =>
      prev.map(item => (item.id === chapterId ? { ...item, ...updates } : item))
    );
  };

  const activeChapterData = chapterData.find(chapter => chapter.id === activeChapter);

  return (
    <div className="min-h-screen bg-brand-background text-brand-text font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="text-center mb-10">
          <p className="text-brand-secondary uppercase tracking-[0.3em] text-xs mb-3">
            Quality-first Writing Suite
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary mb-4">
            Roman- & Kurzgeschichten-Studio
          </h1>
          <p className="text-brand-subtext max-w-2xl mx-auto">
            Von der Werkplanung über Schreibstile bis zum Kapitel-Workflow: Halte Qualität, Recherche und
            literarischen Feinschliff in einem strukturierten Prozess zusammen.
          </p>
        </header>

        <main className="space-y-8">
          <section className="bg-brand-surface p-6 rounded-lg shadow-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">1. Werkumfang & Kapitelstruktur</h2>
              <span className="text-sm text-brand-subtext">
                {wordsPerChapter.toLocaleString('de-DE')} Wörter pro Kapitel
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="space-y-2">
                <span className="text-sm text-brand-subtext">Wortanzahl (Gesamt)</span>
                <input
                  type="number"
                  min={1000}
                  value={wordCount}
                  onChange={event => setWordCount(Number(event.target.value))}
                  className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-brand-subtext">Kapitelanzahl</span>
                <input
                  type="number"
                  min={1}
                  value={chapterCount}
                  onChange={event => setChapterCount(Number(event.target.value))}
                  className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                />
              </label>
            </div>
            <div className="rounded-md bg-[#232323] border border-brand-secondary/40 p-4 text-sm text-brand-subtext">
              Jedes Kapitel erhält automatisch ein Ziel von <strong>{wordsPerChapter.toLocaleString('de-DE')}</strong>{' '}
              Wörtern. Passe die Kapitelanzahl an, um das Schreibtempo zu steuern.
            </div>
          </section>

          <section className="bg-brand-surface p-6 rounded-lg shadow-lg space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">2. Schreibstile & Stilbibliothek</h2>
              <span className="text-sm text-brand-subtext">Mehrere Stile kombinierbar</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {styles.map(style => (
                <article
                  key={style.id}
                  className="rounded-md border border-brand-secondary/40 bg-[#1f1f1f] p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{style.name}</h3>
                    <span className="text-xs uppercase tracking-wide text-brand-secondary">
                      {style.source === 'default' ? 'Default' : 'Custom'}
                    </span>
                  </div>
                  <p className="text-sm text-brand-subtext whitespace-pre-line">{style.description}</p>
                </article>
              ))}
            </div>
            <div className="border-t border-brand-secondary/30 pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Neuen Stil hinzufügen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-brand-subtext">Stilname</span>
                  <input
                    type="text"
                    value={newStyleName}
                    onChange={event => setNewStyleName(event.target.value)}
                    placeholder="z. B. Minimalistische Gegenwartssprache"
                    className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-brand-subtext">Beschreibung</span>
                  <input
                    type="text"
                    value={newStyleDescription}
                    onChange={event => setNewStyleDescription(event.target.value)}
                    placeholder="Kurz beschreiben: Ton, Rhythmus, Perspektive"
                    className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                  />
                </label>
              </div>
              <label className="space-y-2 block">
                <span className="text-sm text-brand-subtext">Textbeispiel (optional)</span>
                <textarea
                  value={newStyleSample}
                  onChange={event => setNewStyleSample(event.target.value)}
                  rows={3}
                  placeholder="Ein kurzer Absatz, der den Stil zeigt."
                  className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-y"
                />
              </label>
              <button
                type="button"
                onClick={handleAddStyle}
                className="bg-brand-primary text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-green-500 transition"
              >
                Stil speichern
              </button>
            </div>
          </section>

          <section className="bg-brand-surface p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-2xl font-semibold">3. Ideenwerkstatt</h2>
            <label className="space-y-2 block">
              <span className="text-sm text-brand-subtext">Deine Ausgangsidee</span>
              <textarea
                value={ideaInput}
                onChange={event => setIdeaInput(event.target.value)}
                rows={3}
                placeholder="Skizziere deine Idee oder deinen Wunsch-Plot."
                className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-y"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerateIdeas}
                className="bg-brand-primary text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-green-500 transition"
              >
                Ideen-Vorschläge generieren
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdeaSuggestions([]);
                  setSelectedIdea('');
                }}
                className="border border-brand-secondary/40 text-brand-text py-2.5 px-5 rounded-lg hover:border-brand-primary transition"
              >
                Zurücksetzen
              </button>
            </div>
            {ideaSuggestions.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-brand-subtext">Wähle eine Idee zur Weiterentwicklung:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ideaSuggestions.map((idea, index) => (
                    <label
                      key={idea}
                      className="rounded-md border border-brand-secondary/40 bg-[#1f1f1f] p-4 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="idea"
                        value={idea}
                        checked={selectedIdea === idea}
                        onChange={() => setSelectedIdea(idea)}
                        className="mr-2 accent-brand-primary"
                      />
                      <span className="text-sm">{idea}</span>
                      <span className="block text-xs text-brand-secondary mt-3">Option {index + 1}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <label className="space-y-2 block">
              <span className="text-sm text-brand-subtext">Feinschliff mit dem Modell</span>
              <textarea
                value={ideaRefinement}
                onChange={event => setIdeaRefinement(event.target.value)}
                rows={2}
                placeholder="Was soll betont, verändert oder präzisiert werden?"
                className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-y"
              />
            </label>
            <div className="rounded-md bg-[#232323] border border-brand-secondary/40 p-4 text-sm text-brand-subtext">
              Aktiver Fokus: <strong>{ideaBase}</strong>
              {ideaRefinement && (
                <span className="block mt-2 text-brand-text">
                  Verfeinerung: {ideaRefinement}
                </span>
              )}
            </div>
          </section>

          <section className="bg-brand-surface p-6 rounded-lg shadow-lg space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">4. Outline & Kapitelpipeline</h2>
              <button
                type="button"
                onClick={handleGenerateOutline}
                className="bg-brand-primary text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-green-500 transition"
              >
                Outline erstellen
              </button>
            </div>
            {outlineChapters.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {outlineChapters.map((outline, index) => (
                  <label key={outline} className="space-y-2">
                    <span className="text-sm text-brand-subtext">Kapitel {index + 1}</span>
                    <textarea
                      value={outline}
                      onChange={event => {
                        const next = [...outlineChapters];
                        next[index] = event.target.value;
                        setOutlineChapters(next);
                        updateChapterData(index + 1, { outline: event.target.value });
                      }}
                      rows={2}
                      className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-y"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-subtext">
                Erstelle zuerst eine Outline, um Kapitelziele und den Workflow zu starten.
              </p>
            )}

            {chapterData.length > 0 && (
              <div className="mt-6 border-t border-brand-secondary/30 pt-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">Kapitel-Workflow</h3>
                  <select
                    value={activeChapter}
                    onChange={event => setActiveChapter(Number(event.target.value))}
                    className="bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-2 px-3"
                  >
                    {chapterData.map(chapter => (
                      <option key={chapter.id} value={chapter.id}>
                        Kapitel {chapter.id}
                      </option>
                    ))}
                  </select>
                </div>

                {activeChapterData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="rounded-md border border-brand-secondary/40 bg-[#1f1f1f] p-4 space-y-2">
                        <h4 className="font-semibold">Deep Search Prompt</h4>
                        <textarea
                          value={activeChapterData.deepSearchPrompt}
                          onChange={event =>
                            updateChapterData(activeChapter, { deepSearchPrompt: event.target.value })
                          }
                          rows={8}
                          className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-y"
                        />
                      </div>
                      <div className="rounded-md border border-brand-secondary/40 bg-[#1f1f1f] p-4 space-y-2">
                        <h4 className="font-semibold">Recherche-Notizen</h4>
                        <textarea
                          value={activeChapterData.researchNotes}
                          onChange={event =>
                            updateChapterData(activeChapter, { researchNotes: event.target.value })
                          }
                          rows={6}
                          placeholder="Deep-Search-Ergebnisse, Quellenlinks, Faktenchecks ..."
                          className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-y"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-md border border-brand-secondary/40 bg-[#1f1f1f] p-4 space-y-2">
                        <h4 className="font-semibold">Beat Sheet</h4>
                        <textarea
                          value={activeChapterData.beatSheet}
                          onChange={event => updateChapterData(activeChapter, { beatSheet: event.target.value })}
                          rows={8}
                          className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-y"
                        />
                      </div>
                      <div className="rounded-md border border-brand-secondary/40 bg-[#1f1f1f] p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Qualitäts-Score</h4>
                          <span className="text-sm text-brand-subtext">
                            Ziel: 100/100
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={activeChapterData.qualityScore}
                          onChange={event =>
                            updateChapterData(activeChapter, { qualityScore: Number(event.target.value) })
                          }
                          className="w-full accent-brand-primary"
                        />
                        <div className="flex items-center justify-between text-sm text-brand-subtext">
                          <span>{activeChapterData.qualityScore}/100</span>
                          {activeChapterData.qualityScore === 100 ? (
                            <span className="text-green-400 font-semibold">Kapitel freigegeben</span>
                          ) : (
                            <span className="text-amber-300">Noch verfeinern</span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-md border border-brand-secondary/40 bg-[#1f1f1f] p-4 space-y-2">
                        <h4 className="font-semibold">Übersetzung / literarische Übertragung</h4>
                        <select
                          value={activeChapterData.translation}
                          onChange={event =>
                            updateChapterData(activeChapter, { translation: event.target.value })
                          }
                          className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-2 px-3"
                        >
                          {languages.map(language => (
                            <option key={language} value={language}>
                              {language}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="lg:col-span-2 rounded-md border border-brand-secondary/40 bg-[#1f1f1f] p-4 space-y-2">
                      <h4 className="font-semibold">Kapitel-Entwurf</h4>
                      <textarea
                        value={activeChapterData.draft}
                        onChange={event => updateChapterData(activeChapter, { draft: event.target.value })}
                        rows={6}
                        placeholder="Hier entsteht der Kapiteltext."
                        className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 px-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-y"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-brand-subtext">
                        <span>Kapitel {activeChapter} von {chapterCount}</span>
                        <button
                          type="button"
                          className="border border-brand-secondary/40 text-brand-text py-2 px-4 rounded-lg hover:border-brand-primary transition"
                        >
                          Kapitel speichern
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>

        <footer className="text-center mt-12 text-brand-secondary text-sm">
          <p>Qualitätsgesicherter Workflow für langfristige Projekte.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
