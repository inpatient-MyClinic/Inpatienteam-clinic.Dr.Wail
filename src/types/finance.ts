
export interface Transaction {
  id: string;
  patientName: string;
  serviceDescription: string;
  hospital: string;
  doctor: string;
  specialty: string;
  amount: string;
  status: string;
  date: string;
}

export interface StatusCounts {
  paid: number;
  pending: number;
  delayPayment: number;
}
