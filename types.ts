
export enum CaseType {
  GUGATAN = 'Gugatan',
  PERMOHONAN = 'Permohonan'
}

export interface StorageLocation {
  roomNo: string;
  shelfNo: string;
  levelNo: string;
  boxNo: string;
}

export interface CaseData {
  id: string;
  caseNumber: string;
  caseType: CaseType;
  classification: string;
  parties: string;
  decisionDate: string;
  bhtDate?: string; // Optional, only for Gugatan
  isArchived: boolean;
  storage?: StorageLocation;
  pdfUrl?: string;
}

export interface SearchParams {
  caseNumber: string;
  caseType: CaseType;
  year: string;
}
