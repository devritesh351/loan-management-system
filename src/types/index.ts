// Types for Loan Management System

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'loan_officer';
  creditScore: number;
  createdAt: string;
  loanLimit: number; // Maximum loan amount in Rupees
  currentBorrowed: number; // Current total borrowed amount
  availableLimit: number; // Remaining loan limit
}

export interface LoanApplication {
  id: string;
  customerId: string;
  customerName: string;
  loanType: 'personal' | 'home' | 'auto' | 'business';
  amount: number;
  tenure: number; // in months
  interestRate: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'closed';
  appliedDate: string;
  processedDate?: string;
  purpose: string;
  monthlyIncome: number;
  employmentType: 'salaried' | 'self-employed' | 'business';
  creditScore: number;
  documents: Document[];
}

export interface Loan {
  id: string;
  applicationId: string;
  customerId: string;
  customerName: string;
  loanType: 'personal' | 'home' | 'auto' | 'business';
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  tenure: number;
  monthlyEMI: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'defaulted';
  nextPaymentDate: string;
  totalPaid: number;
}

export interface Payment {
  id: string;
  loanId: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'card' | 'cash' | 'check';
  status: 'success' | 'pending' | 'failed';
  transactionId: string;
  principalPaid: number;
  interestPaid: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'identity' | 'income' | 'address' | 'employment';
  status: 'uploaded' | 'verified' | 'rejected';
  uploadedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'payment_due' | 'payment_success' | 'application_status' | 'document_required';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalLoans: number;
  activeLoans: number;
  totalDisbursed: number;
  totalCollected: number;
  pendingApplications: number;
  defaultedLoans: number;
}
