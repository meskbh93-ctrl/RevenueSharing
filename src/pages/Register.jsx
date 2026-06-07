import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";

import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";

import AuthLayout from "@/components/AuthLayout.jsx";

export default function Register() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create account"
      subtitle="Register a new account"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>

          <Input
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <Label>Password</Label>

          <Input
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <Button className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
