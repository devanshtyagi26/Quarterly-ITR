"use client";

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getUserDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/users/me",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data.data.uuid);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logout successful");
      router.push("/login");
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 shadow-md border-border rounded-xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Your Profile</CardTitle>
      </CardHeader>

      <Separator className="my-2" />

      <CardContent className="space-y-4 text-center">
        {loading ? (
          <Skeleton className="h-5 w-80 mx-auto bg-gray-300" />
        ) : data === null ? (
          <p className="text-sm text-muted-foreground">
            Click “Get User Details” to load your profile.
          </p>
        ) : data === "0" ? (
          <p className="text-sm text-muted-foreground">No user ID found.</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            User ID:{" "}
            <Link
              href={`/profile/${data}`}
              className="text-primary hover:underline break-all"
            >
              {data}
            </Link>
          </p>
        )}
      </CardContent>

      <Separator className="my-2" />

      <CardFooter className="flex flex-col space-y-2">
        <Button onClick={logout} className="w-full">
          Logout
        </Button>
        <Button
          onClick={getUserDetails}
          variant="secondary"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get User Details"}
        </Button>
      </CardFooter>
    </Card>
  );
}
