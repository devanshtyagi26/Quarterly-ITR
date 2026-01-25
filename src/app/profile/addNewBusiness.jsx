import React, { useState } from "react";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AddNewBusiness() {
  const [newBusinessname, setNewBusinessname] = useState("");
  const [newGstin, setNewGstin] = useState("");

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

  return (
    <>
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
    </>
  );
}

export default AddNewBusiness;
