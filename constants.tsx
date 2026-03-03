
import { CaseType, CaseData } from './types';

export const MOCK_CASES: CaseData[] = [
  {
    id: '1',
    caseNumber: '123/Pdt.G/2023/PA.Pbm',
    caseType: CaseType.GUGATAN,
    classification: 'Cerai Gugat',
    parties: 'Ahmad vs Siti',
    decisionDate: '2023-10-15',
    bhtDate: '2023-10-29',
    isArchived: true,
    storage: {
      roomNo: 'A1',
      shelfNo: 'L-05',
      levelNo: '3',
      boxNo: 'B-102'
    }
  },
  {
    id: '2',
    caseNumber: '45/Pdt.P/2024/PA.Pbm',
    caseType: CaseType.PERMOHONAN,
    classification: 'Dispensasi Kawin',
    parties: 'Budi Santoso',
    decisionDate: '2024-01-20',
    isArchived: false
  }
];
