'use client';
import InputField from 'components/fields/InputField';
import Default from 'components/auth/variants/DefaultAuthLayout';
import { FcGoogle } from 'react-icons/fc';
import Checkbox from 'components/checkbox';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function SignUpDefault() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessAddress: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBusinessFields, setShowBusinessFields] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      setError('Name, email, password, and phone are required');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          businessName: formData.businessName || null,
          businessAddress: formData.businessAddress || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      router.push('/admin'); 
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Sign-up error:', err);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/admin' });
  };

  return (
    <Default
      maincard={
        <div className="mb-16 mt-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          {/* Sign up section */}
          <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
            <h3 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
              Sign Up
            </h3>
            <p className="mb-9 ml-1 text-base text-gray-600">
              Enter your information to create an account!
            </p>

            {/* Google Sign In */}
            <div
              onClick={handleGoogleSignIn}
              className="mb-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary hover:cursor-pointer dark:bg-navy-800 dark:text-white"
            >
              <div className="rounded-full text-xl">
                <FcGoogle />
              </div>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                Sign Up with Google
              </p>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-full bg-gray-200 dark:!bg-navy-700" />
              <p className="text-base text-gray-600"> or </p>
              <div className="h-px w-full bg-gray-200 dark:!bg-navy-700" />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp}>
              {/* Name */}
              <InputField
                variant="auth"
                extra="mb-3"
                label="Full Name*"
                placeholder="John Doe"
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />

              {/* Email */}
              <InputField
                variant="auth"
                extra="mb-3"
                label="Email*"
                placeholder="mail@example.com"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />

              {/* Phone */}
              <InputField
                variant="auth"
                extra="mb-3"
                label="Phone*"
                placeholder="+1234567890"
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />

              {/* Password */}
              <InputField
                variant="auth"
                extra="mb-3"
                label="Password*"
                placeholder="Min. 8 characters"
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />

              {/* Confirm Password */}
              <InputField
                variant="auth"
                extra="mb-3"
                label="Confirm Password*"
                placeholder="Confirm your password"
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="linear mt-2 w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4">
              <span className="text-sm font-medium text-navy-700 dark:text-gray-500">
                Already have an account?
              </span>
              <Link
                href="/auth/sign-in/default"
                className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      }
    />
  );
}

export default SignUpDefault;
