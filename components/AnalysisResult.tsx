
import React, { useState } from 'react';
import { AnalysisData } from '../types';
import { DownloadIcon, ClipboardIcon, CheckIcon, WaveformIcon, MegaphoneIcon, ChartBarIcon, RefreshIcon, VideoIcon, SpotifyIcon, SparklesIcon } from './icons';
import { convertFileToWav } from '../utils/fileUtils';
import RadarChart from './RadarChart';

interface AnalysisResultProps {
  data: AnalysisData;
  coverArtUrls: (string | null)[] | null;
  artistName: string;
  songTitle: string;
  audioFile: File;
  onRegenerate: (prompt: string, index: number) => void;
  onRefine: (prompt: string, index: number, refinementText?: string) => void;
}

const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-brand-primary mb-4 border-b-2 border-brand-primary/20 pb-2 flex items-center gap-3">
        {icon}
        {title}
      </h2>
      {children}
    </div>
);

const CopyButton: React.FC<{textToCopy: string, className?: string, children: React.ReactNode}> = ({ textToCopy, className = '', children}) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        if (copied) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 text-sm text-brand-secondary hover:text-white transition-colors disabled:opacity-50 ${className}`}
            disabled={copied}
        >
            {copied ? <CheckIcon className="w-4 h-4 text-brand-primary" /> : <ClipboardIcon className="w-4 h-4" />}
            {copied ? 'Copied!' : children}
        </button>
    );
}

const formatTime = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, coverArtUrls, artistName, songTitle, audioFile, onRegenerate, onRefine }) => {
    const { evaluation, soundcloudDetails, coverArtPrompts, promotionMaterial } = data;
    const [isConvertingWav, setIsConvertingWav] = useState(false);
    const [wavUrl, setWavUrl] = useState<string | null>(null);
    const [conversionError, setConversionError] = useState<string | null>(null);
    
    // State for Refine Modal
    const [refinementModal, setRefinementModal] = useState<{ index: number, prompt: string } | null>(null);
    const [refinementText, setRefinementText] = useState('');

    const generateDownloadFilename = (index: number, extension: string = 'png') => 
        `${artistName.replace(/[^a-z0-9]/gi, '_')}-${songTitle.replace(/[^a-z0-9]/gi, '_')}${index >= 0 ? `_v${index + 1}` : ''}.${extension}`;

    const handleConvertToWav = async () => {
        setIsConvertingWav(true);
        setConversionError(null);
        try {
            const wavBlob = await convertFileToWav(audioFile);
            const url = URL.createObjectURL(wavBlob);
            setWavUrl(url);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = generateDownloadFilename(-1, 'wav');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to convert to WAV:", error);
            setConversionError("Sorry, the file could not be converted to WAV.");
        } finally {
            setIsConvertingWav(false);
        }
    };

    const openRefinementModal = (prompt: string, index: number) => {
        setRefinementModal({ index, prompt });
        setRefinementText('');
    };

    const closeRefinementModal = () => {
        setRefinementModal(null);
        setRefinementText('');
    };

    const handleRefineSubmit = () => {
        if (refinementModal) {
            onRefine(refinementModal.prompt, refinementModal.index, refinementText);
            closeRefinementModal();
        }
    };

    return (
        <div>
             {refinementModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-brand-surface border border-brand-primary/30 rounded-lg p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-brand-primary" />
                            Refine Cover Art
                        </h3>
                        <p className="text-brand-subtext mb-4 text-sm">
                            Describe how you want to improve this cover art (e.g., "Make the colors darker", "Add a neon sun", "Remove the text").
                            <br/>
                            <span className="text-xs text-brand-primary mt-1 block">* The Artist Name and Song Title will be preserved.</span>
                        </p>
                        <textarea
                            className="w-full bg-brand-background border border-brand-secondary/50 rounded-md p-3 text-white focus:ring-2 focus:ring-brand-primary outline-none mb-6 placeholder-brand-secondary/50"
                            rows={4}
                            placeholder="e.g., Make it darker, add a neon sun..."
                            value={refinementText}
                            onChange={(e) => setRefinementText(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={closeRefinementModal}
                                className="px-4 py-2 rounded-md text-brand-subtext hover:text-white transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleRefineSubmit}
                                disabled={!refinementText.trim()}
                                className="bg-brand-primary text-white px-4 py-2 rounded-md font-bold hover:bg-green-500 transition-colors flex items-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                Update Image
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SectionCard title="Bewertung/Evaluation" icon={<ChartBarIcon className="w-6 h-6"/>}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <div className="flex items-baseline mb-4">
                            <span className="text-5xl font-bold text-white">{evaluation.rating}</span>
                            <span className="text-2xl font-light text-brand-subtext">/100</span>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-green-400 mb-2">Stärken (Positive Aspects)</h3>
                                <ul className="list-disc list-inside space-y-1 text-brand-text">
                                    {evaluation.strengths.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Potenzial/Kritik (Weaknesses/Potential)</h3>
                                <ul className="list-disc list-inside space-y-1 text-brand-text">
                                    {evaluation.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                     <div className="flex-shrink-0 w-full max-w-xs md:w-64 lg:w-80">
                        <RadarChart ratings={evaluation.detailedRatings} />
                    </div>
                </div>
            </SectionCard>
            
            <SectionCard title="Social Media & Promotion" icon={<MegaphoneIcon className="w-6 h-6"/>}>
                <div className="space-y-6">
                    {promotionMaterial.spotifyPitch && promotionMaterial.spotifyPitch.length > 0 && (
                        <div className="border-b border-brand-primary/20 pb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-[#1DB954] flex items-center gap-2">
                                    <SpotifyIcon className="w-5 h-5" />
                                    Spotify Playlist Pitch:
                                </h4>
                                <CopyButton textToCopy={promotionMaterial.spotifyPitch}>Copy</CopyButton>
                            </div>
                            <p className="bg-[#2a2a2a] p-4 rounded-md text-brand-text whitespace-pre-wrap border border-[#1DB954]/30">
                                {promotionMaterial.spotifyPitch}
                            </p>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-brand-subtext">Instagram Post:</h4>
                            <CopyButton textToCopy={promotionMaterial.instagramPost}>Copy</CopyButton>
                        </div>
                        <p className="bg-[#2a2a2a] p-3 rounded-md text-brand-text whitespace-pre-wrap">{promotionMaterial.instagramPost}</p>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-brand-subtext">Twitter/X Post:</h4>
                            <CopyButton textToCopy={promotionMaterial.twitterPost}>Copy</CopyButton>
                        </div>
                        <p className="bg-[#2a2a2a] p-3 rounded-md text-brand-text whitespace-pre-wrap">{promotionMaterial.twitterPost}</p>
                    </div>
                     <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-brand-subtext">"Behind the Song" Story:</h4>
                            <CopyButton textToCopy={promotionMaterial.behindTheSong}>Copy</CopyButton>
                        </div>
                        <p className="bg-[#2a2a2a] p-3 rounded-md text-brand-text whitespace-pre-wrap">{promotionMaterial.behindTheSong}</p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-brand-primary/20">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-brand-subtext flex items-center gap-2">
                                <VideoIcon className="w-5 h-5" />
                                Instagram Reel Idea (4 x 5s)
                            </h4>
                        </div>
                        <p className="text-sm text-brand-subtext mb-4">A concept for a 20-second reel based on your song's preview snippet. Use these prompts with a text-to-video AI.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {promotionMaterial.instagramReelPrompts.map((prompt, index) => (
                                <div key={index} className="bg-[#2a2a2a] p-4 rounded-lg flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className="font-bold text-white">Scene {index + 1}</h5>
                                        <CopyButton textToCopy={prompt}>Copy</CopyButton>
                                    </div>
                                    <p className="text-sm text-brand-text/80 whitespace-pre-wrap flex-1">{prompt}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </SectionCard>

            <SectionCard title="Songdetails für Soundcloud/Soundcloud Details">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        <div>
                            <strong className="text-brand-subtext block">Primary Genre</strong>
                            <span className="text-lg">{soundcloudDetails.primaryGenre}</span>
                        </div>
                        <div>
                            <strong className="text-brand-subtext block">Secondary Genre</strong>
                            <span className="text-lg">{soundcloudDetails.secondaryGenre}</span>
                        </div>
                        <div>
                            <strong className="text-brand-subtext block">Preview Start Time</strong>
                            <span className="text-lg">{formatTime(soundcloudDetails.previewStartTime)} ({soundcloudDetails.previewStartTime}s)</span>
                        </div>
                    </div>

                    {/* Similar Artists Section */}
                    <div>
                         <strong className="text-brand-subtext block mb-2">Sounds Like (Similar Artists):</strong>
                         <div className="flex flex-wrap gap-2">
                            {soundcloudDetails.similarArtists && soundcloudDetails.similarArtists.length > 0 ? (
                                soundcloudDetails.similarArtists.map((artist, index) => (
                                     <span key={index} className="bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-sm font-medium px-3 py-1 rounded-full">
                                        {artist}
                                     </span>
                                ))
                            ) : (
                                <span className="text-sm text-brand-subtext italic">None identified</span>
                            )}
                         </div>
                    </div>

                    <div>
                        <strong className="text-brand-subtext">Tags:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {soundcloudDetails.tags.map((tag, index) => (
                                <span key={index} className="bg-[#2a2a2a] text-brand-secondary text-sm font-medium px-3 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                         <CopyButton textToCopy={soundcloudDetails.tags.join(', ')} className="mt-3">
                            Copy All Tags
                        </CopyButton>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mt-4 mb-2">
                            <h4 className="font-semibold text-brand-subtext">Beschreibung (Deutsch):</h4>
                            <CopyButton textToCopy={soundcloudDetails.descriptionDE}>Copy</CopyButton>
                        </div>
                        <p className="bg-[#2a2a2a] p-3 rounded-md text-brand-text whitespace-pre-wrap">{soundcloudDetails.descriptionDE}</p>
                    </div>
                     <div>
                        <div className="flex items-center justify-between mt-4 mb-2">
                            <h4 className="font-semibold text-brand-subtext">Beschreibung (Englisch):</h4>
                            <CopyButton textToCopy={soundcloudDetails.descriptionEN}>Copy</CopyButton>
                        </div>
                        <p className="bg-[#2a2a2a] p-3 rounded-md text-brand-text whitespace-pre-wrap">{soundcloudDetails.descriptionEN}</p>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="KI Generierte Cover Art & Prompts">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {coverArtPrompts.map((prompt, index) => (
                        <div key={index}>
                            <h3 className="text-xl font-semibold text-white mb-3">Cover Art Option {index + 1}</h3>
                             <div className="aspect-square bg-black/50 rounded-lg flex items-center justify-center overflow-hidden relative group">
                                {coverArtUrls && coverArtUrls[index] ? (
                                    <img src={coverArtUrls[index]!} alt={`Generated cover art option ${index + 1} for ${artistName} - ${songTitle}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-brand-subtext p-4">
                                        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-brand-primary mx-auto mb-3"></div>
                                        <p>Generating image...</p>
                                    </div>
                                )}
                            </div>
                            
                            {coverArtUrls && coverArtUrls[index] && (
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <a
                                        href={coverArtUrls[index]!}
                                        download={generateDownloadFilename(index, 'png')}
                                        className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-colors text-sm col-span-2"
                                    >
                                        <DownloadIcon className="w-4 h-4" />
                                        <span>Download</span>
                                    </a>
                                    <button 
                                        onClick={() => onRegenerate(prompt, index)}
                                        className="flex items-center justify-center gap-2 bg-brand-secondary/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary/80 transition-colors text-sm"
                                        title="Regenerate randomly"
                                    >
                                        <RefreshIcon className="w-4 h-4"/>
                                        <span>Regenerate</span>
                                    </button>
                                    <button
                                        onClick={() => openRefinementModal(prompt, index)}
                                        className="flex items-center justify-center gap-2 bg-indigo-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                                        title="Refine with specific instructions"
                                    >
                                        <SparklesIcon className="w-4 h-4"/>
                                        <span>Refine</span>
                                    </button>
                                </div>
                            )}
                            
                            <div className="mt-6">
                                <h4 className="text-lg font-semibold text-white mb-2">Image Prompt {index + 1}</h4>
                                <div className="bg-black/50 p-4 rounded-md font-mono text-sm text-cyan-300 whitespace-pre-wrap selection:bg-cyan-300 selection:text-black">
                                    {prompt}
                                </div>
                                <CopyButton textToCopy={prompt} className="mt-4 bg-brand-secondary/20 hover:bg-brand-secondary/40 font-bold py-2 px-4 rounded-lg">
                                    Copy Prompt
                                </CopyButton>
                            </div>
                        </div>
                    ))}
                 </div>
            </SectionCard>

            {audioFile.type === 'audio/mpeg' && (
                 <SectionCard title="Audio Utilities" icon={<WaveformIcon className="w-6 h-6" />}>
                     <p className="text-brand-subtext mb-4">Need a different format? Convert your uploaded MP3 to a high-quality WAV file.</p>
                     <button
                        onClick={handleConvertToWav}
                        disabled={isConvertingWav || !!wavUrl}
                        className="flex items-center justify-center gap-2 bg-brand-secondary/50 text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isConvertingWav ? (
                            <>
                                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                                Converting...
                            </>
                        ) : wavUrl ? (
                            <>
                                <CheckIcon className="w-5 h-5"/>
                                Conversion Complete & Downloaded
                            </>
                        ) : (
                           'Convert & Download as WAV'
                        )}
                     </button>
                     {conversionError && <p className="text-red-400 text-sm mt-2">{conversionError}</p>}
                 </SectionCard>
            )}
        </div>
    );
};

export default AnalysisResult;
