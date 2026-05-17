import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { loanService, paymentService } from '../services/api';
import { Loan, Payment } from '../types';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';

export default function Loans() {
  const { user, isAdmin } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanPayments, setLoanPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoans();
  }, [user]);

  const loadLoans = async () => {
    if (!user) return;
    try {
      let data;
      if (isAdmin) {
        data = await loanService.getLoans();
      } else {
        data = await loanService.getLoansByCustomer(user.id);
      }
      setLoans(data);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLoanPayments = async (loanId: string) => {
    try {
      const payments = await paymentService.getPaymentsByLoan(loanId);
      setLoanPayments(payments);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleLoanClick = async (loan: Loan) => {
    setSelectedLoan(loan);
    await loadLoanPayments(loan.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'defaulted':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const calculateProgress = (loan: Loan) => {
    return ((loan.totalPaid / loan.principalAmount) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Active Loans</h1>
        <p className="text-gray-600 mt-1">Monitor and manage active loans</p>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loans.map((loan) => (
          <div
            key={loan.id}
            onClick={() => handleLoanClick(loan)}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{loan.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                    {loan.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600">{loan.customerName}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Principal Amount</p>
                  <p className="text-lg font-semibold text-gray-900">{formatINR(loan.principalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Outstanding</p>
                  <p className="text-lg font-semibold text-orange-600">{formatINR(loan.outstandingAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Monthly EMI</p>
                  <p className="text-sm font-medium text-gray-900">{formatINR(loan.monthlyEMI)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
                  <p className="text-sm font-medium text-gray-900">{loan.interestRate}%</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Payment Progress</span>
                  <span className="text-xs font-medium text-blue-600">{calculateProgress(loan)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${calculateProgress(loan)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Next Payment: {format(new Date(loan.nextPaymentDate), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loans.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No active loans found</p>
        </div>
      )}

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLoan.id}</h2>
                  <p className="text-gray-600 mt-1">{selectedLoan.customerName}</p>
                </div>
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-600 font-medium">Principal Amount</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatINR(selectedLoan.principalAmount)}</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Wallet className="h-5 w-5 text-orange-600" />
                    <p className="text-sm text-orange-600 font-medium">Outstanding</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatINR(selectedLoan.outstandingAmount)}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-600 font-medium">Total Paid</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatINR(selectedLoan.totalPaid)}</p>
                </div>
              </div>

              {/* Loan Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Loan Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedLoan.loanType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
                  <p className="font-semibold text-gray-900">{selectedLoan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tenure</p>
                  <p className="font-semibold text-gray-900">{selectedLoan.tenure} months</p>
                </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Monthly EMI</p>
                    <p className="font-semibold text-gray-900">{formatINR(selectedLoan.monthlyEMI)}</p>
                  </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(selectedLoan.startDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(selectedLoan.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(selectedLoan.nextPaymentDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedLoan.status)}`}>
                    {selectedLoan.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Payment Progress Chart */}
              {loanPayments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={loanPayments.map(p => ({
                      date: format(new Date(p.paymentDate), 'MMM dd'),
                      amount: p.amount
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Payment Transactions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-2">
                  {loanPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{payment.transactionId}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatINR(payment.amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          payment.status === 'success' ? 'bg-green-100 text-green-700' :
                          payment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
