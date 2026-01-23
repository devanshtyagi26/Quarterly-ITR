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
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronDownIcon, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BusinessForm from "./chooseBusiness";

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [newBusinessname, setNewBusinessname] = useState("");
  const [newGstin, setNewGstin] = useState("");

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

  const getBusinessList = async () => {
    try {
      const res = await axios.get("/api/business", {});
      setData(res.data.businesses);
      console.log(res.data.businesses);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
      setData(null);
    }
  };

  const insertBusiness = async (e) => {
    e.preventDefault();
    try {
      const businessName = newBusinessname;
      const gstNo = newGstin;
      console.log("Inserting business:", businessName, gstNo);
      const res = await axios.post("/api/business", {
        businessName,
        gstNo,
      });
      toast.success("Business added successfully");
      console.log(res.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
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
  getBusinessList();

  return (
    <>
      <Card className="w-full max-w-md mx-auto mt-10 shadow-md border-border rounded-xl">
        <Dialog>
          <form>
            <DialogTrigger asChild>
              <Button variant="outline">Add New Business</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Insert Business</DialogTitle>
                <DialogDescription>
                  Add new businesses here. Click add when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Pedro Duarte"
                    value={newBusinessname}
                    onChange={(e) => setNewBusinessname(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="gstin">Business GSTIN</Label>
                  <Input
                    id="gstin"
                    name="gstin"
                    placeholder="12ABCDE3456F7Z8"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={insertBusiness} type="submit">
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>

        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Select Business
          </CardTitle>

          <BusinessForm />
        </CardHeader>

        <Separator className="my-2" />

        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={logout} className="w-full">
            Logout
          </Button>
        </CardFooter>
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
