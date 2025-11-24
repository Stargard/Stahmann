
export interface DetailedRatings {
  melody: number;
  rhythm: number;
  vocals: number;
  production: number;
  originality: number;
  atmosphere: number;
}

export interface Evaluation {
  rating: number;
  strengths: string[];
  weaknesses: string[];
  detailedRatings: DetailedRatings;
}

export interface SoundcloudDetails {
  primaryGenre: string;
  secondaryGenre: string;
  tags: string[];
  descriptionDE: string;
  descriptionEN: string;
  previewStartTime: number;
  similarArtists: string[];
}

export interface PromotionMaterial {
  instagramPost: string;
  twitterPost: string;
  behindTheSong: string;
  instagramReelPrompts: string[];
  spotifyPitch?: string;
}

export interface AnalysisData {
  evaluation: Evaluation;
  soundcloudDetails: SoundcloudDetails;
  coverArtPrompts: string[];
  promotionMaterial: PromotionMaterial;
}

export interface HistoryItem {
    id: string;
    analysisData: AnalysisData;
    coverArtUrls: (string | null)[];
    trackInfo: {
        artist: string;
        title: string;
        file: File;
    };
}