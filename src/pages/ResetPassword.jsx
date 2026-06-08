import React, { useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { base44 } from '@/api/base44Client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Lock,
  Loader2,
} from 'lucide-react';

import AuthLayout from '@/components/AuthLayout';

export default function ResetPassword() {
  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get('token');

  const [newPassword, setNewPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        'Passwords do not match'
      );

      return;
    }

    setLoading(true);

    try {
      await base44.auth.resetPassword(
        token,
        newPassword
      );

      setSuccess(true);
    } catch (err) {
      setError(
        err.message ||
          'Failed to reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Lock}
      title="Reset Password"
      subtitle="Create a new password"
    >
      {success ? (
        <div className="text-center">
          <p className="text-green-500 mb-4">
            Password updated successfully
          </p>

          <Button
            onClick={() => {
              window.location.href =
                '/login';
            }}
          >
            Go to Login
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>
              New Password
            </Label>

            <Input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              Confirm Password
            </Label>

            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
