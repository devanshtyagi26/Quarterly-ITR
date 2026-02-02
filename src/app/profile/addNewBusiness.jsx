import React from "react";
import { useForm, Controller } from "react-hook-form"; // Added Controller
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
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
import axios from "axios";
import { toast } from "sonner";
import { fullSchema } from "@/lib/schema/businessValidation";
import { Field, FieldGroup } from "@/components/ui/field";

function AddNewBusiness() {
  const [open, setOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      businessName: "",
      gstNo: "",
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = form;

  const onSubmit = async (data) => {
    try {
      await axios.post("/api/business", data);
      toast.success("Business added successfully");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Business</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Insert Business</DialogTitle>
            <DialogDescription>
              Add new businesses here. Click add when you're done.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            {/* Business Name Field */}
            <Controller
              name="businessName"
              control={control}
              render={({ field }) => (
                <Field className="grid gap-2 mb-4">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    {...field} // This replaces register
                    id="businessName"
                    placeholder="Tech Solutions Pvt Ltd"
                    className={errors.businessName ? "border-destructive" : ""}
                  />
                  {errors.businessName && (
                    <p className="text-destructive text-sm">
                      {errors.businessName.message}
                    </p>
                  )}
                </Field>
              )}
            />

            {/* GST Number Field */}
            <Controller
              name="gstNo"
              control={control}
              render={({ field }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="gstNo">Business GSTIN</Label>
                  <Input
                    {...field} // This replaces register
                    id="gstNo"
                    placeholder="12ABCDE3456F7Z8"
                    className={errors.gstNo ? "border-destructive" : ""}
                  />
                  {errors.gstNo && (
                    <p className="text-destructive text-sm">
                      {errors.gstNo.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewBusiness;
