
export interface AadhaarDataRow {
  date: string;
  state: string;
  district: string;
  pincode: string;
  [key: string]: string | number;
}

export interface DetailedReason {
  feature: string;
  value: any;
  explanation: string;
  importance: number; // 0 to 1
}

export interface AnomalyResult {
  row: AadhaarDataRow;
  index: number;
  reasons: string[];
  detailedReasons: DetailedReason[];
  score: number; // 0 to 1, higher means more anomalous
}

export interface DatasetStats {
  totalRows: number;
  anomalyCount: number;
  anomalyRate: number;
  topStates: { name: string; value: number }[];
  pincodeHeatmap: { pincode: string; count: number }[];
  ageDistribution: { range: string; count: number }[];
  timeSeries: { date: string; count: number }[];
}

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

export interface SearchIntel {
  summary: string;
  links: GroundingChunk[];
}

export interface LocationVerification {
  summary: string;
  links: GroundingChunk[];
  district: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  UNAUTHENTICATED = 'UNAUTHENTICATED'
}

export interface LoginData {
  identifier: string; // Email or Mobile
  aadhaar: string;
}

export interface ActionRecord {
  id: string;
  person: AadhaarDataRow;
  actionType: 'message' | 'fix' | 'report';
  timestamp: string;
  notes: string;
  status: 'waiting' | 'fixed';
}
