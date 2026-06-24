export type RecordHealthResult = {
  fullyVerified: number;
  withCertificates: number;
  missingVerification: number;
  unresolvedSales: number;
  staleRecords: number;
};
