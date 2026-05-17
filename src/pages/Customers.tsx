import { useEffect, useState } from 'react';
import { Users, Search, Award, TrendingUp, Wallet } from 'lucide-react';
import { userService, loanService } from '../services/api';
import { User, Loan } from '../types';
import { formatINR } from '../utils/currency';

export default function Customers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, loansData] = await Promise.all([
        userService.getUsers(),
        loanService.getLoans()
      ]);
      setCustomers(usersData.filter(u => u.role === 'customer'));
      setLoans(loansData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerLoans = (customerId: string) => {
    return loans.filter(loan => loan.customerId === customerId);
  };

  const getCustomerStats = (customerId: string) => {
    const customerLoans = getCustomerLoans(customerId);
    const totalBorrowed = customerLoans.reduce((sum, loan) => sum + loan.principalAmount, 0);
    const totalOutstanding = customerLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
    const activeLoans = customerLoans.filter(loan => loan.status === 'active').length;
    
    return { totalBorrowed, totalOutstanding, activeLoans };
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600 bg-green-100';
    if (score >= 650) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
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
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">Manage customer information and relationships</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const stats = getCustomerStats(customer.id);
          
          return (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">{customer.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Credit Score</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCreditScoreColor(customer.creditScore)}`}>
                    {customer.creditScore}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Loans</span>
                    <span className="font-semibold text-gray-900">{stats.activeLoans}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Borrowed</span>
                    <span className="font-semibold text-gray-900">{formatINR(stats.totalBorrowed)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Outstanding</span>
                    <span className="font-semibold text-orange-600">{formatINR(stats.totalOutstanding)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No customers found</p>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                    <p className="text-gray-600">{selectedCustomer.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Credit Score */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Credit Score</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedCustomer.creditScore}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCustomer.creditScore >= 750 ? 'Excellent' :
                       selectedCustomer.creditScore >= 650 ? 'Good' : 'Fair'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-600 font-medium">Active Loans</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getCustomerStats(selectedCustomer.id).activeLoans}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">Total Borrowed</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatINR(getCustomerStats(selectedCustomer.id).totalBorrowed)}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-orange-600 font-medium">Outstanding</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatINR(getCustomerStats(selectedCustomer.id).totalOutstanding)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Loans */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Loans</h3>
                <div className="space-y-3">
                  {getCustomerLoans(selectedCustomer.id).map((loan) => (
                    <div key={loan.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{loan.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          loan.status === 'active' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {loan.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Type: </span>
                          <span className="font-medium text-gray-900 capitalize">{loan.loanType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount: </span>
                          <span className="font-medium text-gray-900">{formatINR(loan.principalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Outstanding: </span>
                          <span className="font-medium text-orange-600">{formatINR(loan.outstandingAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">EMI: </span>
                          <span className="font-medium text-gray-900">{formatINR(loan.monthlyEMI)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getCustomerLoans(selectedCustomer.id).length === 0 && (
                    <p className="text-center text-gray-500 py-4">No active loans</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
