import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, Home, Car, Briefcase, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { applicationService } from '../services/api';
import { formatINR } from '../utils/currency';

export default function ApplyLoan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    loanType: 'personal' as 'personal' | 'home' | 'auto' | 'business',
    amount: '',
    tenure: '',
    purpose: '',
    monthlyIncome: '',
    employmentType: 'salaried' as 'salaried' | 'self-employed' | 'business'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loanTypes = [
    { value: 'personal', label: 'Personal Loan', icon: User, interestRate: 12.5, color: 'blue' },
    { value: 'home', label: 'Home Loan', icon: Home, interestRate: 7.5, color: 'green' },
    { value: 'auto', label: 'Auto Loan', icon: Car, interestRate: 8.5, color: 'purple' },
    { value: 'business', label: 'Business Loan', icon: Briefcase, interestRate: 10.5, color: 'orange' }
  ];

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (Number(formData.amount) > (user?.availableLimit || 0)) {
      newErrors.amount = `Amount exceeds your available limit of ${formatINR(user?.availableLimit || 0)}`;
    }

    if (!formData.tenure) {
      newErrors.tenure = 'Tenure is required';
    } else if (Number(formData.tenure) < 6 || Number(formData.tenure) > 360) {
      newErrors.tenure = 'Tenure must be between 6 and 360 months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    if (!formData.monthlyIncome) {
      newErrors.monthlyIncome = 'Monthly income is required';
    } else if (Number(formData.monthlyIncome) <= 0) {
      newErrors.monthlyIncome = 'Monthly income must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedLoanType = loanTypes.find(lt => lt.value === formData.loanType);
      
      await applicationService.createApplication({
        customerId: user!.id,
        customerName: user!.name,
        loanType: formData.loanType,
        amount: Number(formData.amount),
        tenure: Number(formData.tenure),
        interestRate: selectedLoanType!.interestRate,
        purpose: formData.purpose,
        monthlyIncome: Number(formData.monthlyIncome),
        employmentType: formData.employmentType,
        creditScore: user!.creditScore,
        documents: []
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedLoanType = loanTypes.find(lt => lt.value === formData.loanType);
  const emi = formData.amount && formData.tenure ? calculateEMI(
    Number(formData.amount),
    selectedLoanType!.interestRate,
    Number(formData.tenure)
  ) : 0;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your loan application has been submitted successfully. We'll review it and get back to you soon.
          </p>
          <div className="animate-pulse text-sm text-gray-500">Redirecting to applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Apply for Loan</h1>
        <p className="text-gray-600 mt-2">Available Limit: {formatINR(user?.availableLimit || 0)}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                s === step ? 'bg-blue-600 text-white' :
                s < step ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {s < step ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  s < step ? 'bg-green-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm font-medium text-gray-600">Loan Details</span>
          <span className="text-sm font-medium text-gray-600">Personal Info</span>
          <span className="text-sm font-medium text-gray-600">Review</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Select Loan Type & Amount</h2>
            
            {/* Loan Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Loan Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {loanTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, loanType: type.value as any })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.loanType === type.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-8 w-8 mx-auto mb-2 ${
                        formData.loanType === type.value ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        formData.loanType === type.value ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{type.interestRate}% p.a.</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (₹)
              </label>
              <input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Tenure */}
            <div>
              <label htmlFor="tenure" className="block text-sm font-medium text-gray-700 mb-2">
                Tenure (Months)
              </label>
              <input
                id="tenure"
                type="number"
                value={formData.tenure}
                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.tenure ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter tenure in months"
              />
              {errors.tenure && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.tenure}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">Minimum 6 months, Maximum 360 months</p>
            </div>

            {/* EMI Preview */}
            {emi > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-600 mb-1">Estimated Monthly EMI</p>
                <p className="text-2xl font-bold text-gray-900">{formatINR(emi)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Interest Rate: {selectedLoanType?.interestRate}% p.a.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Personal & Employment Information</h2>

            {/* Purpose */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                Loan Purpose
              </label>
              <textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.purpose ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe the purpose of the loan"
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.purpose}
                </p>
              )}
            </div>

            {/* Monthly Income */}
            <div>
              <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Income (₹)
              </label>
              <input
                id="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.monthlyIncome ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your monthly income"
              />
              {errors.monthlyIncome && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.monthlyIncome}
                </p>
              )}
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Employment Type</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'salaried', label: 'Salaried' },
                  { value: 'self-employed', label: 'Self-Employed' },
                  { value: 'business', label: 'Business' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, employmentType: type.value as any })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.employmentType === type.value
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <p className="font-medium">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Review Your Application</h2>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Loan Type</span>
                <span className="font-semibold text-gray-900 capitalize">{formData.loanType} Loan</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-semibold text-gray-900">{formatINR(Number(formData.amount))}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Tenure</span>
                <span className="font-semibold text-gray-900">{formData.tenure} months</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-semibold text-gray-900">{selectedLoanType?.interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Monthly EMI</span>
                <span className="font-semibold text-gray-900">{formatINR(emi)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Purpose</span>
                <span className="font-semibold text-gray-900 text-right max-w-md">{formData.purpose}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Monthly Income</span>
                <span className="font-semibold text-gray-900">{formatINR(Number(formData.monthlyIncome))}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Employment Type</span>
                <span className="font-semibold text-gray-900 capitalize">{formData.employmentType}</span>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                ⚠️ Please ensure all information is correct before submitting. Once submitted, the application will be reviewed by our team.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}
