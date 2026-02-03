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
    <>
      <Card className="w-full max-w-md mx-auto mt-20 shadow-md border-border rounded-xl">
        {chooseBusiness && (
          <>
            <CardHeader>
              <BusinessForm />
            </CardHeader>

            <Separator className="my-2" />

            <CardFooter className="flex flex-col space-y-2">
              <AddNewBusiness />
            </CardFooter>
          </>
        )}
        {addMoney && (
          <>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Add Money to Wallet
              </CardTitle>
            </CardHeader>
            <Separator className="my-2" />
            <CardContent>
              <p className="text-center">Add Money Feature Coming Soon!</p>
            </CardContent>
          </>
        )}
      </Card>
      <Card className="w-full max-w-md mx-auto mt-10 shadow-md border-border rounded-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Your Profile</CardTitle>
        </CardHeader>

        <Separator className="my-2" />

        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={logout} className="w-full">
            Logout
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
