export interface MOISReportEntry {
  patientToken: string;
  patientName: string;
  testName: string;
  department: string;
  resultStatus: 'pending' | 'partial' | 'completed';
  reportedAt?: string;
  reviewedBy?: string;
}

export interface MOISDailyReport {
  date: string;
  hospitalName: string;
  totalReports: number;
  pendingReports: number;
  completedReports: number;
  entries: MOISReportEntry[];
}

export function getMOISReport(): MOISDailyReport {
  const today = new Date().toISOString().split('T')[0];
  return {
    date: today,
    hospitalName: 'HealthFirst360 Hospital',
    totalReports: 18,
    pendingReports: 5,
    completedReports: 13,
    entries: [
      { patientToken: 'HC20260624-0001', patientName: 'Rajesh Kumar', testName: 'Complete Blood Count', department: 'Lab', resultStatus: 'completed', reportedAt: `${today}T09:45:00`, reviewedBy: 'Dr. Lab Head' },
      { patientToken: 'HC20260624-0001', patientName: 'Rajesh Kumar', testName: 'ECG Report', department: 'ECG', resultStatus: 'completed', reportedAt: `${today}T10:15:00`, reviewedBy: 'Dr. Priya Nair' },
      { patientToken: 'HC20260624-0001', patientName: 'Rajesh Kumar', testName: 'Chest X-Ray', department: 'X-Ray', resultStatus: 'partial', reportedAt: `${today}T10:40:00` },
      { patientToken: 'HC20260624-0002', patientName: 'Priya Sharma', testName: 'USG Abdomen', department: 'USG', resultStatus: 'pending' },
      { patientToken: 'HC20260624-0002', patientName: 'Priya Sharma', testName: 'Mammography', department: 'Mammography', resultStatus: 'pending' },
      { patientToken: 'HC20260624-0003', patientName: 'Amit Patel', testName: '2D Echo', department: '2D Echo', resultStatus: 'completed', reportedAt: `${today}T11:00:00`, reviewedBy: 'Dr. Priya Nair' },
      { patientToken: 'HC20260624-0003', patientName: 'Amit Patel', testName: 'TMT', department: 'TMT', resultStatus: 'pending' },
      { patientToken: 'HC20260624-0004', patientName: 'Sneha Reddy', testName: 'Dental Examination', department: 'Dental', resultStatus: 'completed', reportedAt: `${today}T12:30:00`, reviewedBy: 'Dr. Sneha Gupta' },
    ],
  };
}
