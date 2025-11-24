
import React, { useState, useRef } from 'react';
import { UploadIcon, ArtistIcon, TitleIcon, RequestIcon, SpotifyIcon } from './icons';

interface TrackInputFormProps {
  onAnalyze: (
    audioFile: File,
    artistName: string,
    songTitle: string,
    specificRequest: string,
    includeSpotifyPitch: boolean
  ) => void;
  isLoading: boolean;
}

const TrackInputForm: React.FC<TrackInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artistName, setArtistName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [specificRequest, setSpecificRequest] = useState('');
  const [includeSpotifyPitch, setIncludeSpotifyPitch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Please select an audio file.');
      return;
    }
    if (!artistName.trim()) {
      setError('Please enter the artist/band name.');
      return;
    }
    if (!songTitle.trim()) {
      setError('Please enter the song title.');
      return;
    }
    setError(null);
    onAnalyze(audioFile, artistName, songTitle, specificRequest, includeSpotifyPitch);
  };

  const isFormValid = audioFile && artistName.trim() && songTitle.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div 
        className="border-2 border-dashed border-brand-secondary rounded-lg p-6 text-center cursor-pointer hover:border-brand-primary hover:bg-white/5 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <div className="flex flex-col items-center justify-center text-brand-subtext">
            <UploadIcon className="w-12 h-12 mb-2"/>
            {audioFile ? (
                <span className="text-brand-text font-medium">{audioFile.name}</span>
            ) : (
                <>
                <p className="font-semibold text-brand-text">Click to upload audio file</p>
                <p className="text-sm">MP3, WAV, FLAC, etc.</p>
                </>
            )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <ArtistIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-secondary" />
          <input
            type="text"
            placeholder="Band/Artist Name"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            disabled={isLoading}
            className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
          />
        </div>
        <div className="relative">
          <TitleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-secondary" />
          <input
            type="text"
            placeholder="Song Title"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            disabled={isLoading}
            className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
          />
        </div>
      </div>

      <div className="relative">
          <RequestIcon className="absolute left-3 top-5 w-5 h-5 text-brand-secondary" />
          <textarea
            placeholder="Optional: Specific requests (e.g., 'evaluate the lyrics', 'translate description to Spanish')"
            value={specificRequest}
            onChange={(e) => setSpecificRequest(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="w-full bg-[#2a2a2a] border border-brand-secondary/50 rounded-md py-3 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition resize-y"
          />
      </div>

      <div className="flex items-center space-x-3 bg-[#2a2a2a] p-3 rounded-md border border-brand-secondary/30">
        <input
            type="checkbox"
            id="spotifyPitch"
            checked={includeSpotifyPitch}
            onChange={(e) => setIncludeSpotifyPitch(e.target.checked)}
            disabled={isLoading}
            className="w-5 h-5 text-brand-primary bg-brand-background border-brand-secondary rounded focus:ring-brand-primary focus:ring-offset-0"
        />
        <label htmlFor="spotifyPitch" className="flex items-center gap-2 text-brand-text cursor-pointer select-none">
            <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />
            Include Spotify Pitch
        </label>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      
      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105 disabled:bg-brand-secondary disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Track'}
      </button>
    </form>
  );
};

export default TrackInputForm;
