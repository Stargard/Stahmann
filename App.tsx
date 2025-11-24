
import React, { useState } from 'react';
import { AnalysisData, HistoryItem } from './types';
import { analyzeTrack, generateCoverArts, generateSingleCoverArt, regenerateCoverArtPrompt, refineCoverArtPrompt } from './services/geminiService';
import TrackInputForm from './components/TrackInputForm';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';
import { MusicIcon } from './components/icons';
import HistorySidebar from './components/HistorySidebar';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAnalyze = async (
    audioFile: File,
    artistName: string,
    songTitle: string,
    specificRequest: string,
    includeSpotifyPitch: boolean
  ) => {
    setIsLoading(true);
    setError(null);
    setCurrentAnalysisId(null); // Clear current view to show loader

    try {
      // Step 1: Get analysis and prompts
      const result = await analyzeTrack(audioFile, artistName, songTitle, specificRequest, includeSpotifyPitch);
      
      // Step 2: Generate cover arts using the prompts
      let imageUrls: (string | null)[] = [];
      if (result.coverArtPrompts && result.coverArtPrompts.length > 0) {
        imageUrls = await generateCoverArts(result.coverArtPrompts);
      }

      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        analysisData: result,
        coverArtUrls: imageUrls,
        trackInfo: { artist: artistName, title: songTitle, file: audioFile }
      };

      setHistory(prev => [newHistoryItem, ...prev]);
      setCurrentAnalysisId(newHistoryItem.id);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (id: string) => {
    setError(null);
    setCurrentAnalysisId(id);
  }

  const handleRegenerateCoverArt = async (prompt: string, index: number) => {
    const currentItemId = currentAnalysisId;
    if (!currentItemId) return;

    const originalItem = history.find(item => item.id === currentItemId);
    if (!originalItem) return;

    // Immediately set loading state for the image.
    setHistory(prevHistory => prevHistory.map(item => {
        if (item.id === currentItemId) {
            const newUrls = [...item.coverArtUrls];
            newUrls[index] = null; // Set this specific image to loading
            return { ...item, coverArtUrls: newUrls };
        }
        return item;
    }));

    try {
        // Regenerate the prompt using the original prompt and track info.
        const newPrompt = await regenerateCoverArtPrompt(
            prompt,
            originalItem.trackInfo.artist,
            originalItem.trackInfo.title
        );

        // Generate the new image using the newly created prompt.
        const newImageUrl = await generateSingleCoverArt(newPrompt);
        
        // Update the state with both the new prompt and the new image URL.
        setHistory(prevHistory => prevHistory.map(item => {
            if (item.id === currentItemId) {
                const newUrls = [...item.coverArtUrls];
                newUrls[index] = newImageUrl;

                const newPrompts = [...item.analysisData.coverArtPrompts];
                newPrompts[index] = newPrompt;

                return {
                    ...item,
                    coverArtUrls: newUrls,
                    analysisData: {
                        ...item.analysisData,
                        coverArtPrompts: newPrompts,
                    },
                };
            }
            return item;
        }));

    } catch (err) {
        console.error("Failed to regenerate cover art:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred during regeneration.');
        // On error, restore the original item state.
        setHistory(prevHistory => prevHistory.map(item => item.id === currentItemId ? originalItem : item));
    }
  };

  const handleRefineCoverArt = async (prompt: string, index: number, refinementText?: string) => {
      const currentItemId = currentAnalysisId;
      if (!currentItemId) return;

      const originalItem = history.find(item => item.id === currentItemId);
      if (!originalItem) return;

      // Set loading
      setHistory(prevHistory => prevHistory.map(item => {
          if (item.id === currentItemId) {
              const newUrls = [...item.coverArtUrls];
              newUrls[index] = null;
              return { ...item, coverArtUrls: newUrls };
          }
          return item;
      }));

      try {
          let promptToUse = prompt;

          // If refinement text is provided, refine the prompt first
          if (refinementText && refinementText.trim() !== "") {
              try {
                  promptToUse = await refineCoverArtPrompt(
                      prompt, 
                      refinementText,
                      originalItem.trackInfo.artist,
                      originalItem.trackInfo.title
                    );
              } catch (e) {
                  console.error("Prompt refinement failed, continuing with original prompt", e);
              }
          }

          // Generate using standard model (high quality was removed)
          const newImageUrl = await generateSingleCoverArt(promptToUse);

          setHistory(prevHistory => prevHistory.map(item => {
              if (item.id === currentItemId) {
                  const newUrls = [...item.coverArtUrls];
                  newUrls[index] = newImageUrl;
                  
                  // Update the prompt as well since it might have been refined
                  const newPrompts = [...item.analysisData.coverArtPrompts];
                  newPrompts[index] = promptToUse;

                  return { 
                    ...item, 
                    coverArtUrls: newUrls,
                    analysisData: {
                        ...item.analysisData,
                        coverArtPrompts: newPrompts
                    }
                  };
              }
              return item;
          }));
      } catch (err) {
          console.error("Failed to refine:", err);
          setError('Failed to refine image.');
          setHistory(prevHistory => prevHistory.map(item => item.id === currentItemId ? originalItem : item));
      }
  };
  
  const currentAnalysis = history.find(item => item.id === currentAnalysisId);

  return (
    <div className="min-h-screen bg-brand-background text-brand-text font-sans">
      <div className="flex">
        <HistorySidebar history={history} onSelect={handleSelectHistory} currentId={currentAnalysisId} />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{ height: '100vh' }}>
          <div className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary mb-2 flex items-center justify-center gap-3">
                <MusicIcon className="w-8 h-8"/>
                Music Track Analyzer
              </h1>
              <p className="text-brand-subtext">
                Upload a track to get AI analysis, metadata, social media posts, and regenerative cover art.
              </p>
            </header>

            <main>
              <div className="bg-brand-surface p-6 rounded-lg shadow-lg mb-8">
                <TrackInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              </div>

              {isLoading && <Loader />}
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg text-center">
                  <h3 className="font-bold text-lg mb-2">Analysis Failed</h3>
                  <p>{error}</p>
                </div>
              )}
              {currentAnalysis && (
                <div className="animate-fade-in">
                  <AnalysisResult 
                    key={currentAnalysis.id} // Add key to force re-mount on change
                    data={currentAnalysis.analysisData} 
                    coverArtUrls={currentAnalysis.coverArtUrls}
                    artistName={currentAnalysis.trackInfo.artist}
                    songTitle={currentAnalysis.trackInfo.title}
                    audioFile={currentAnalysis.trackInfo.file}
                    onRegenerate={handleRegenerateCoverArt}
                    onRefine={handleRefineCoverArt}
                  />
                </div>
              )}
               {!isLoading && !currentAnalysis && !error && (
                  <div className="text-center py-10 px-6 bg-brand-surface rounded-lg">
                    <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
                    <p className="text-brand-subtext">Your analysis results will appear here once you upload a track.</p>
                  </div>
              )}
            </main>
            
            <footer className="text-center mt-12 text-brand-secondary text-sm">
                <p>Powered by Gemini AI</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
