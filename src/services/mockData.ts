import { User, LoanApplication, Loan, Payment, NotificationItem, DashboardStats } from '../types';

// Mock Users (User Service)
export const mockUsers: User[] = [
  {
    id: 'USR001',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+91-9876543210',
    role: 'customer',
    creditScore: 750,
    createdAt: '2024-01-15T10:00:00Z',
    loanLimit: 5000000, // ₹50 Lakhs
    currentBorrowed: 2500000, // ₹25 Lakhs
    availableLimit: 2500000 // ₹25 Lakhs
  },
  {
    id: 'USR002',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+91-9876543211',
    role: 'customer',
    creditScore: 680,
    createdAt: '2024-02-20T10:00:00Z',
    loanLimit: 3000000, // ₹30 Lakhs
    currentBorrowed: 350000, // ₹3.5 Lakhs
    availableLimit: 2650000 // ₹26.5 Lakhs
  },
  {
    id: 'USR003',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91-9876543212',
    role: 'customer',
    creditScore: 720,
    createdAt: '2024-03-10T10:00:00Z',
    loanLimit: 4000000, // ₹40 Lakhs
    currentBorrowed: 0,
    availableLimit: 4000000 // ₹40 Lakhs
  },
  {
    id: 'ADM001',
    name: 'Admin User',
    email: 'admin@loanbank.com',
    phone: '+91-9876543200',
    role: 'admin',
    creditScore: 800,
    createdAt: '2023-01-01T10:00:00Z',
    loanLimit: 10000000, // ₹1 Crore
    currentBorrowed: 0,
    availableLimit: 10000000
  }
];

// Mock Loan Applications (Application Service)
export const mockApplications: LoanApplication[] = [
  {
    id: 'APP001',
    customerId: 'USR001',
    customerName: 'John Doe',
    loanType: 'home',
    amount: 2500000, // ₹25 Lakhs
    tenure: 240,
    interestRate: 7.5,
    status: 'approved',
    appliedDate: '2024-01-20T10:00:00Z',
    processedDate: '2024-01-25T10:00:00Z',
    purpose: 'Purchase new home in suburban area',
    monthlyIncome: 80000, // ₹80,000
    employmentType: 'salaried',
    creditScore: 750,
    documents: [
      { id: 'DOC001', name: 'Aadhaar Card', type: 'identity', status: 'verified', uploadedAt: '2024-01-20T10:00:00Z' },
      { id: 'DOC002', name: 'Salary Slips', type: 'income', status: 'verified', uploadedAt: '2024-01-20T10:05:00Z' }
    ]
  },
  {
    id: 'APP002',
    customerId: 'USR002',
    customerName: 'Jane Smith',
    loanType: 'auto',
    amount: 350000, // ₹3.5 Lakhs
    tenure: 60,
    interestRate: 8.5,
    status: 'disbursed',
    appliedDate: '2024-02-25T10:00:00Z',
    processedDate: '2024-03-01T10:00:00Z',
    purpose: 'Purchase SUV',
    monthlyIncome: 55000, // ₹55,000
    employmentType: 'salaried',
    creditScore: 680,
    documents: [
      { id: 'DOC003', name: 'PAN Card', type: 'identity', status: 'verified', uploadedAt: '2024-02-25T10:00:00Z' },
      { id: 'DOC004', name: 'Bank Statements', type: 'income', status: 'verified', uploadedAt: '2024-02-25T10:05:00Z' }
    ]
  },
  {
    id: 'APP003',
    customerId: 'USR003',
    customerName: 'Priya Sharma',
    loanType: 'personal',
    amount: 150000, // ₹1.5 Lakhs
    tenure: 36,
    interestRate: 12.5,
    status: 'pending',
    appliedDate: '2024-03-15T10:00:00Z',
    purpose: 'Home renovation',
    monthlyIncome: 45000, // ₹45,000
    employmentType: 'self-employed',
    creditScore: 720,
    documents: [
      { id: 'DOC005', name: 'Aadhaar Card', type: 'identity', status: 'uploaded', uploadedAt: '2024-03-15T10:00:00Z' },
      { id: 'DOC006', name: 'ITR Documents', type: 'income', status: 'uploaded', uploadedAt: '2024-03-15T10:05:00Z' }
    ]
  },
  {
    id: 'APP004',
    customerId: 'USR001',
    customerName: 'John Doe',
    loanType: 'business',
    amount: 1000000, // ₹10 Lakhs
    tenure: 120,
    interestRate: 10.5,
    status: 'rejected',
    appliedDate: '2024-02-10T10:00:00Z',
    processedDate: '2024-02-15T10:00:00Z',
    purpose: 'Business expansion',
    monthlyIncome: 80000, // ₹80,000
    employmentType: 'business',
    creditScore: 750,
    documents: [
      { id: 'DOC007', name: 'Business License', type: 'employment', status: 'rejected', uploadedAt: '2024-02-10T10:00:00Z' }
    ]
  }
];

// Mock Loans (Loan Service)
export const mockLoans: Loan[] = [
  {
    id: 'LN001',
    applicationId: 'APP001',
    customerId: 'USR001',
    customerName: 'John Doe',
    loanType: 'home',
    principalAmount: 2500000, // ₹25 Lakhs
    outstandingAmount: 2350000, // ₹23.5 Lakhs
    interestRate: 7.5,
    tenure: 240,
    monthlyEMI: 20150, // ₹20,150
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2044-02-01T00:00:00Z',
    status: 'active',
    nextPaymentDate: '2024-04-01T00:00:00Z',
    totalPaid: 150000 // ₹1.5 Lakhs
  },
  {
    id: 'LN002',
    applicationId: 'APP002',
    customerId: 'USR002',
    customerName: 'Jane Smith',
    loanType: 'auto',
    principalAmount: 350000, // ₹3.5 Lakhs
    outstandingAmount: 325000, // ₹3.25 Lakhs
    interestRate: 8.5,
    tenure: 60,
    monthlyEMI: 7150, // ₹7,150
    startDate: '2024-03-05T00:00:00Z',
    endDate: '2029-03-05T00:00:00Z',
    status: 'active',
    nextPaymentDate: '2024-04-05T00:00:00Z',
    totalPaid: 25000 // ₹25,000
  }
];

// Mock Payments (Payment Service)
export const mockPayments: Payment[] = [
  {
    id: 'PAY001',
    loanId: 'LN001',
    customerId: 'USR001',
    amount: 2015,
    paymentDate: '2024-02-01T10:00:00Z',
    paymentMethod: 'bank_transfer',
    status: 'success',
    transactionId: 'TXN001',
    principalPaid: 1450,
    interestPaid: 565
  },
  {
    id: 'PAY002',
    loanId: 'LN001',
    customerId: 'USR001',
    amount: 2015,
    paymentDate: '2024-03-01T10:00:00Z',
    paymentMethod: 'bank_transfer',
    status: 'success',
    transactionId: 'TXN002',
    principalPaid: 1460,
    interestPaid: 555
  },
  {
    id: 'PAY003',
    loanId: 'LN002',
    customerId: 'USR002',
    amount: 715,
    paymentDate: '2024-03-05T10:00:00Z',
    paymentMethod: 'card',
    status: 'success',
    transactionId: 'TXN003',
    principalPaid: 525,
    interestPaid: 190
  },
  {
    id: 'PAY004',
    loanId: 'LN001',
    customerId: 'USR001',
    amount: 2015,
    paymentDate: '2024-04-01T10:00:00Z',
    paymentMethod: 'bank_transfer',
    status: 'pending',
    transactionId: 'TXN004',
    principalPaid: 1470,
    interestPaid: 545
  }
];

// Mock Notifications (Notification Service)
export const mockNotifications: NotificationItem[] = [
  {
    id: 'NOT001',
    userId: 'USR001',
    type: 'payment_due',
    title: 'Payment Due Soon',
    message: 'Your EMI of ₹20,150 is due on April 1, 2024',
    read: false,
    createdAt: '2024-03-25T10:00:00Z'
  },
  {
    id: 'NOT002',
    userId: 'USR002',
    type: 'payment_success',
    title: 'Payment Successful',
    message: 'Your payment of ₹7,150 has been processed successfully',
    read: true,
    createdAt: '2024-03-05T10:30:00Z'
  },
  {
    id: 'NOT003',
    userId: 'USR003',
    type: 'application_status',
    title: 'Application Under Review',
    message: 'Your loan application APP003 is being reviewed',
    read: false,
    createdAt: '2024-03-15T11:00:00Z'
  },
  {
    id: 'NOT004',
    userId: 'USR001',
    type: 'payment_success',
    title: 'Payment Received',
    message: 'Your EMI payment for March has been received',
    read: true,
    createdAt: '2024-03-01T10:30:00Z'
  }
];

// Mock Dashboard Stats (Analytics Service)
export const mockDashboardStats: DashboardStats = {
  totalLoans: 2,
  activeLoans: 2,
  totalDisbursed: 285000,
  totalCollected: 17500,
  pendingApplications: 1,
  defaultedLoans: 0
};
