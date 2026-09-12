export type Venue = {
  id: string;
  groupName: string;
  venueName: string;
  theme: string;
  location: string;
  description?: string;
  motif: string;
  participatingClasses?: string[];
  isLocked: boolean;
  tribeCount: number;
};

export type LeaderboardRow = {
  id: string;
  tribeCode: string;
  tribeName: string;
  groupName?: string;
  theme: string;
  venueId: string;
  venueName: string;
  venueTheme: string;
  location: string;
  motif: string;
  totalScore: number;
  rank: number;
};

export type TribeSummary = {
  id: string;
  tribeCode: string;
  tribeName: string;
  groupName?: string;
  theme: string;
  venueId: string;
  venueTheme: string;
  location: string;
  motif: string;
  rank: number | null;
  totalScore: number;
};

export type TribeProfile = {
  id: string;
  tribeCode: string;
  tribeName: string;
  theme: string;
  status: string;
  venue: {
    id: string;
    theme: string;
    location: string;
    venueName: string;
    motif: string;
  };
  overallRank: number | null;
  venueRank: number | null;
  totalScore: number;
  events: { id: string; eventName: string; maximumScore: number; score: number | null; remarks: string }[];
  members: { id: string; name: string; department: string; classSection: string; isLeader?: boolean }[];
};
