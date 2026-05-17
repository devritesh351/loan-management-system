import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Clock,
  CheckCircle,
  ArrowRight,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loanService, applicationService, paymentService } from '../services/api';
import { Loan, LoanApplication, Payment } from '../types';
import { formatINR, formatCompactINR } from '../utils/currency';
import { format } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [loansData, appsData, paymentsData] = await Promise.all([
        loanService.getLoansByCustomer(user.id),
        applicationService.getApplicationsByCustomer(user.id),
        paymentService.getPaymentsByCustomer(user.id)
      ]);
      
      setLoans(loansData);
      setApplications(appsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBorrowed = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
  const nextPayment = loans.length > 0 ? loans[0].monthlyEMI : 0;
  const upcomingPaymentDate = loans.length > 0 ? loans[0].nextPaymentDate : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-blue-100">Here's your financial overview</p>
          </div>
          <Link
            to="/apply-loan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <PlusCircle className="h-5 w-5" />
            Apply for Loan
          </Link>
        </div>
      </div>

      {/* Loan Limit Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Available Loan Limit</p>
              <p className="text-3xl font-bold text-gray-900">{formatINR(user?.availableLimit || 0)}</p>
            </div>
            <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Limit Utilization</span>
              <span className="text-sm font-semibold text-gray-900">
                {((user?.currentBorrowed || 0) / (user?.loanLimit || 1) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                style={{ 
                  width: `${((user?.currentBorrowed || 0) / (user?.loanLimit || 1) * 100)}%` 
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 mb-1">Total Limit</p>
              <p className="text-lg font-bold text-gray-900">{formatCompactINR(user?.loanLimit || 0)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <p className="text-xs text-purple-600 mb-1">Used</p>
              <p className="text-lg font-bold text-gray-900">{formatCompactINR(user?.currentBorrowed || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Borrowed</p>
          <p className="text-2xl font-bold text-gray-900">{formatINR(totalBorrowed)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Wallet className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-gray-900">{formatINR(totalOutstanding)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Next Payment</p>
          <p className="text-2xl font-bold text-gray-900">{formatINR(nextPayment)}</p>
        </div>
      </div>

      {/* Upcoming Payment Alert */}
      {upcomingPaymentDate && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Due Soon</h3>
              <p className="text-gray-700 mb-3">
                Your next EMI of <span className="font-bold">{formatINR(nextPayment)}</span> is due on{' '}
                <span className="font-bold">{format(new Date(upcomingPaymentDate), 'MMMM dd, yyyy')}</span>
              </p>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Loans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Loans</h2>
          {loans.length > 0 && (
            <Link to="/loans" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {loans.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loans.map((loan) => (
              <div key={loan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">{loan.loanType} Loan</p>
                      <p className="text-sm text-gray-500">{loan.id}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {loan.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Principal</span>
                    <span className="text-sm font-semibold text-gray-900">{formatINR(loan.principalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Outstanding</span>
                    <span className="text-sm font-semibold text-orange-600">{formatINR(loan.outstandingAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly EMI</span>
                    <span className="text-sm font-semibold text-gray-900">{formatINR(loan.monthlyEMI)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-semibold text-blue-600">
                      {((loan.totalPaid / loan.principalAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(loan.totalPaid / loan.principalAmount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You don't have any active loans</p>
            <Link
              to="/apply-loan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusCircle className="h-5 w-5" />
              Apply for Your First Loan
            </Link>
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
          {applications.length > 0 && (
            <Link to="/applications" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {applications.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {applications.slice(0, 3).map((app, index) => (
              <div
                key={app.id}
                className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  index !== applications.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    app.status === 'approved' ? 'bg-green-100' :
                    app.status === 'pending' ? 'bg-orange-100' :
                    app.status === 'rejected' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {app.status === 'approved' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : app.status === 'rejected' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{app.loanType} Loan</p>
                    <p className="text-sm text-gray-500">{format(new Date(app.appliedDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatINR(app.amount)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    app.status === 'approved' ? 'bg-green-100 text-green-700' :
                    app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-600">No applications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
