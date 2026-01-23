"use client";

import React, { Suspense, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!token) {
        setStatus("error");
        toast.error("Verification token not found in URL.");
        return;
      }

      try {
        await axios.post("/api/users/verifyemail", { token });
        setStatus("verified");
        toast.success("Email verified successfully!");
      } catch (err) {
        setStatus("error");
        toast.error(err?.response?.data?.message || "Verification failed.");
      }
    };

    verifyUserEmail();
  }, [token]);

  return (
    <Card className="w-full max-w-md mx-auto mt-20 text-center">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "loading" && (
          <>
            <Skeleton className="w-32 h-5 mx-auto bg-gray-300" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </>
        )}

        {status === "verified" && (
          <>
            <p className="text-green-600 font-medium">
              ✅ Your email has been verified!
            </p>
            <Link href="/login">
              <Button className="mt-2">Go to Login</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <p className="text-red-500 font-medium">
            ❌ Invalid or expired verification link.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
