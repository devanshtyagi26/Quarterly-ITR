"use client";

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
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
import BusinessForm from "./chooseBusiness";
import AddNewBusiness from "./addNewBusiness";

export default function ProfilePage() {
  const router = useRouter();
  const [chooseBusiness, setChooseBusiness] = useState(true);
  const [addMoney, setAddMoney] = useState(false);

  const getUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/users/me",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setData(res.data.data.uuid);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
      setData(null);
    }
  };

  const handleNext = () => {
    setChooseBusiness(false);
    setAddMoney(true);
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
  // getBusinessList();

  return (
    <div className="page-container-top relative">
      <div className="w-[45%] max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Business Card - Takes 2 columns on large screens */}
          <Card className="lg:col-span-2 shadow-md border-border rounded-xl">
            {chooseBusiness && (
              <>
                <CardHeader>
                  <BusinessForm />
                </CardHeader>
              </>
            )}
          </Card>

          {/* Actions Card - Takes 1 column on large screens */}
          <Card className="shadow-md border-border rounded-xl h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-3">
              <AddNewBusiness />
              <Button asChild variant="outline" className="w-full">
                <Link href="/generate">Generate Report</Link>
              </Button>
              <Button onClick={logout} className="w-full" variant="destructive">
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
