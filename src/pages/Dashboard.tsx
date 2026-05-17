import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { analyticsService, applicationService, loanService } from '../services/api';
import { DashboardStats, LoanApplication, Loan } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCompactINR, formatINR } from '../utils/currency';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<LoanApplication[]>([]);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, applications, loans] = await Promise.all([
        analyticsService.getDashboardStats(),
        applicationService.getApplications(),
        loanService.getLoans()
      ]);
      
      setStats(statsData);
      setRecentApplications(applications.slice(0, 5));
      setActiveLoans(loans.filter(l => l.status === 'active'));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loanTypeData = activeLoans.reduce((acc, loan) => {
    const existing = acc.find(item => item.name === loan.loanType);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: loan.loanType, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const monthlyData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Loan Management System</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Loans"
            value={stats.totalLoans}
            icon={Wallet}
            color="blue"
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Active Loans"
            value={stats.activeLoans}
            icon={TrendingUp}
            color="green"
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Total Disbursed"
            value={formatCompactINR(stats.totalDisbursed)}
            icon={DollarSign}
            color="purple"
            trend={{ value: 15, positive: true }}
          />
          <StatCard
            title="Pending Applications"
            value={stats.pendingApplications}
            icon={FileText}
            color="orange"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Disbursements */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Disbursements</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Type Distribution</h2>
          {loanTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={loanTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {loanTypeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No active loans
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/applications" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {app.loanType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatINR(app.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(app.status)}
                      <span className={`text-sm font-medium capitalize ${
                        app.status === 'approved' ? 'text-green-600' :
                        app.status === 'pending' ? 'text-orange-600' :
                        app.status === 'rejected' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Microservices Architecture Demo
            </h3>
            <p className="text-gray-700 mb-3">
              This is a frontend-only demonstration of a Spring Boot microservices-based loan management system.
              The application simulates the following services:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <li className="flex items-center gap-2 text-gray-700">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                User Service
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Application Service
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Loan Service
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Payment Service
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Notification Service
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Analytics Service
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
