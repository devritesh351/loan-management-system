// Simulated API services for microservices architecture
import { 
  User, 
  LoanApplication, 
  Loan, 
  Payment, 
  NotificationItem, 
  DashboardStats 
} from '../types';
import {
  mockUsers,
  mockApplications,
  mockLoans,
  mockPayments,
  mockNotifications
} from './mockData';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// USER SERVICE
export const userService = {
  async getUsers(): Promise<User[]> {
    await delay();
    return mockUsers;
  },
  
  async getUserById(id: string): Promise<User | undefined> {
    await delay();
    return mockUsers.find(user => user.id === id);
  },
  
  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await delay();
    const newUser: User = {
      ...user,
      id: `USR${String(mockUsers.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }
};

// APPLICATION SERVICE
export const applicationService = {
  async getApplications(): Promise<LoanApplication[]> {
    await delay();
    return mockApplications;
  },
  
  async getApplicationById(id: string): Promise<LoanApplication | undefined> {
    await delay();
    return mockApplications.find(app => app.id === id);
  },
  
  async getApplicationsByCustomer(customerId: string): Promise<LoanApplication[]> {
    await delay();
    return mockApplications.filter(app => app.customerId === customerId);
  },
  
  async createApplication(app: Omit<LoanApplication, 'id' | 'appliedDate' | 'status'>): Promise<LoanApplication> {
    await delay();
    const newApp: LoanApplication = {
      ...app,
      id: `APP${String(mockApplications.length + 1).padStart(3, '0')}`,
      appliedDate: new Date().toISOString(),
      status: 'pending'
    };
    mockApplications.push(newApp);
    return newApp;
  },
  
  async updateApplicationStatus(id: string, status: LoanApplication['status']): Promise<LoanApplication | undefined> {
    await delay();
    const app = mockApplications.find(a => a.id === id);
    if (app) {
      app.status = status;
      app.processedDate = new Date().toISOString();
    }
    return app;
  }
};

// LOAN SERVICE
export const loanService = {
  async getLoans(): Promise<Loan[]> {
    await delay();
    return mockLoans;
  },
  
  async getLoanById(id: string): Promise<Loan | undefined> {
    await delay();
    return mockLoans.find(loan => loan.id === id);
  },
  
  async getLoansByCustomer(customerId: string): Promise<Loan[]> {
    await delay();
    return mockLoans.filter(loan => loan.customerId === customerId);
  },
  
  async createLoan(loan: Omit<Loan, 'id'>): Promise<Loan> {
    await delay();
    const newLoan: Loan = {
      ...loan,
      id: `LN${String(mockLoans.length + 1).padStart(3, '0')}`
    };
    mockLoans.push(newLoan);
    return newLoan;
  }
};

// PAYMENT SERVICE
export const paymentService = {
  async getPayments(): Promise<Payment[]> {
    await delay();
    return mockPayments;
  },
  
  async getPaymentsByLoan(loanId: string): Promise<Payment[]> {
    await delay();
    return mockPayments.filter(payment => payment.loanId === loanId);
  },
  
  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    await delay();
    return mockPayments.filter(payment => payment.customerId === customerId);
  },
  
  async createPayment(payment: Omit<Payment, 'id' | 'paymentDate' | 'status'>): Promise<Payment> {
    await delay();
    const newPayment: Payment = {
      ...payment,
      id: `PAY${String(mockPayments.length + 1).padStart(3, '0')}`,
      paymentDate: new Date().toISOString(),
      status: 'success'
    };
    mockPayments.push(newPayment);
    
    // Update loan outstanding amount
    const loan = mockLoans.find(l => l.id === payment.loanId);
    if (loan) {
      loan.outstandingAmount -= newPayment.principalPaid;
      loan.totalPaid += newPayment.amount;
    }
    
    return newPayment;
  }
};

// NOTIFICATION SERVICE
export const notificationService = {
  async getNotificationsByUser(userId: string): Promise<NotificationItem[]> {
    await delay();
    return mockNotifications.filter(notif => notif.userId === userId);
  },
  
  async markAsRead(id: string): Promise<void> {
    await delay();
    const notif = mockNotifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
    }
  },
  
  async createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): Promise<NotificationItem> {
    await delay();
    const newNotif: NotificationItem = {
      ...notif,
      id: `NOT${String(mockNotifications.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    mockNotifications.push(newNotif);
    return newNotif;
  }
};

// ANALYTICS SERVICE
export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    await delay();
    // Calculate real-time stats
    const stats: DashboardStats = {
      totalLoans: mockLoans.length,
      activeLoans: mockLoans.filter(l => l.status === 'active').length,
      totalDisbursed: mockLoans.reduce((sum, l) => sum + l.principalAmount, 0),
      totalCollected: mockPayments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0),
      pendingApplications: mockApplications.filter(a => a.status === 'pending').length,
      defaultedLoans: mockLoans.filter(l => l.status === 'defaulted').length
    };
    return stats;
  }
};
