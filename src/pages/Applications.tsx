import { useEffect, useState } from 'react';
import { FileText, Filter, Search, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { applicationService } from '../services/api';
import { LoanApplication } from '../types';
import { format } from 'date-fns';
import { formatINR } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';

export default function Applications() {
  const { user, isAdmin } = useAuth();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filteredApps, setFilteredApps] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);

  useEffect(() => {
    loadApplications();
  }, [user]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const loadApplications = async () => {
    if (!user) return;
    try {
      let data;
      if (isAdmin) {
        data = await applicationService.getApplications();
      } else {
        data = await applicationService.getApplicationsByCustomer(user.id);
      }
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApps(filtered);
  };

  const handleStatusUpdate = async (id: string, status: LoanApplication['status']) => {
    try {
      await applicationService.updateApplicationStatus(id, status);
      await loadApplications();
      setSelectedApp(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-700 border-orange-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      disbursed: 'bg-blue-100 text-blue-700 border-blue-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      disbursed: CheckCircle,
      closed: FileText,
    };

    const Icon = icons[status as keyof typeof icons];
    const style = styles[status as keyof typeof styles];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${style}`}>
        <Icon className="h-3.5 w-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">Loan Applications</h1>
        <p className="text-gray-600 mt-1">Manage and review loan applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="disbursed">Disbursed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredApps.map((app) => (
          <div key={app.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{app.id}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-gray-600">{app.customerName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Loan Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{app.loanType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-sm font-medium text-gray-900">{formatINR(app.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tenure</p>
                    <p className="text-sm font-medium text-gray-900">{app.tenure} months</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Applied Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(app.appliedDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedApp(app)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No applications found</p>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Application ID</p>
                  <p className="font-semibold text-gray-900">{selectedApp.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                  <p className="font-semibold text-gray-900">{selectedApp.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Credit Score</p>
                  <p className="font-semibold text-gray-900">{selectedApp.creditScore}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Loan Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedApp.loanType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount</p>
                  <p className="font-semibold text-gray-900">{formatINR(selectedApp.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tenure</p>
                  <p className="font-semibold text-gray-900">{selectedApp.tenure} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
                  <p className="font-semibold text-gray-900">{selectedApp.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Monthly Income</p>
                  <p className="font-semibold text-gray-900">{formatINR(selectedApp.monthlyIncome)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Employment Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedApp.employmentType}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Purpose</p>
                <p className="text-gray-900">{selectedApp.purpose}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Documents</p>
                <div className="space-y-2">
                  {selectedApp.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{doc.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                        doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApp.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'approved')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
