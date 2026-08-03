import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { FileText, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10">
          <SignupForm />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleAuthButton isLogin={false} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
