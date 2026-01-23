"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
// import { toast } from "react-hot-toast";
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
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

function SignUpPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
    userName: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSignup = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/signup", user);
      console.log("Signup Success", response.data);

      toast.success("Verification email sent", {
        description: "Please check your inbox to verify your account.",
        duration: 6000, // optional: in milliseconds
      });

      router.push("/login");
    } catch (error) {
      console.log("Signup Failed");
      console.log(error);
      toast.error("Signup failed", {
        description: error?.response?.data?.error || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { email, password, userName } = user;
    setButtonDisabled(!(email && password && userName));
  }, [user]);

  return (
    <Card
      className="w-full max-w-sm border border-border shadow-sm rounded-xl"
      aria-busy={loading}
    >
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-xl font-semibold text-foreground">
          {loading ? "Creating your account..." : "Create an Account"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to get started
        </p>
      </CardHeader>
      <Separator className="my-2" />
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSignup();
          }}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1">
            <Label htmlFor="userName">Username</Label>
            <Input
              id="userName"
              name="userName"
              type="text"
              placeholder="johnDoe"
              value={user.userName}
              onChange={(e) => {
                setUser({ ...user, userName: e.target.value });
              }}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={user.email}
              onChange={(e) => {
                setUser({ ...user, email: e.target.value });
              }}
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
                value={user.password}
                onChange={(e) => {
                  setUser({ ...user, password: e.target.value });
                }}
                disabled={loading}
                required
                autoComplete="new-password"
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
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <span className="text-muted-foreground mr-1">
          Already have an account?
        </span>
        <Link
          href="/login"
          className="text-primary hover:underline transition-colors"
        >
          Log In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default SignUpPage;
