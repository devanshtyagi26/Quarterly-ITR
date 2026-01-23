"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const LoginPage = () => {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = user;

  useEffect(() => {
    setButtonDisabled(!(email && password));
  }, [email, password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const onLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post("/api/users/login", user);
      toast.success("Login successful!");
      router.push("/profile");
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="w-full max-w-sm border border-border shadow-sm rounded-xl"
      aria-busy={loading}
    >
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-xl font-semibold text-foreground">
          Sign In
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to continue
        </p>
      </CardHeader>
      <Separator className="my-2" />

      <CardContent>
        {error && (
          <p
            className="text-red-500 text-sm mb-2"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleInputChange}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={handleInputChange}
                disabled={loading}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={buttonDisabled || loading}
            className="w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center text-sm">
        <span className="text-muted-foreground mr-1">New here?</span>
        <Link
          href="/signup"
          className="text-primary hover:underline transition-colors"
        >
          Create an account
        </Link>
      </CardFooter>
    </Card>
  );
};

export default LoginPage;
