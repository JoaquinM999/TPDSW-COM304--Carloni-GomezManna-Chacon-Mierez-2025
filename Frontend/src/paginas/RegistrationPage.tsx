import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react';
import { RegistrationProvider } from '../context/RegistrationContext';
import Step1 from '../componentes/Step1';
import Step2 from '../componentes/Step2';
import Step3 from '../componentes/Step3';

const RegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    navigate('/');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            onNext={handleNext}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            error={error}
            setError={setError}
          />
        );
      case 2:
        return (
          <Step2
            onNext={handleNext}
            onPrev={handlePrev}
            error={error}
            setError={setError}
          />
        );
      case 3:
        return (
          <Step3
            onPrev={handlePrev}
            onComplete={handleComplete}
            setError={setError}
            setSuccess={setSuccess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <RegistrationProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              <Book className="w-8 h-8" />
              <span>BookCode</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Crea tu cuenta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Paso {currentStep} de 3
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>

          {/* Mostrar éxito */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4" role="alert">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Registro exitoso
                  </h3>
                  <div className="mt-1 text-sm text-green-700">
                    {success}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            {renderStep()}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <Link to="/LoginPage" className="hover:text-blue-600 transition-colors duration-200">
              ← Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </RegistrationProvider>
  );
};

export default RegistrationPage;
