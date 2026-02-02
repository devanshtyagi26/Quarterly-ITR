"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import your helper functions
import {
  formatDate,
  handleInvoiceNo,
  handleTaxManualChange,
  handleBillValueChange,
  handleTaxableValueChange,
  handleGstRateChange,
  handleDateChange,
} from "@/lib/addMoney";

// IMPORT THE SCHEMA HERE (or define it locally as shown below)
import { fullSchema } from "@/lib/schema/sendMoneyValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

function AddMoney({ business }) {
  // State for form values
  const [formData, setFormData] = useState({
    taxableValue: "",
    gstRate: "",
    cgst: "",
    sgst: "",
    billValue: "",
    invoiceNo: "",
    year: "",
    quarter: "",
  });

  const [date, setDate] = useState(null);
  const [month, setMonth] = useState(new Date());
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  // Derived state for UI disabling logic
  const isTaxableValueValid =
    formData.taxableValue !== "" &&
    !isNaN(formData.taxableValue) &&
    parseFloat(formData.taxableValue) > 0;

  const isRateValid = formData.gstRate !== "" && !isNaN(formData.gstRate);

  const clearForm = () => {
    setFormData({
      taxableValue: "",
      gstRate: "",
      cgst: "",
      sgst: "",
      invoiceNo: "",
      year: "",
      quarter: "",
      billValue: "",
    });
    setDate(null);
    setValue("");
  };

  const form = useForm({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      taxableValue: "",
      gstRate: "",
      cgst: "",
      sgst: "",
      billValue: "",
      invoiceNo: "",
      year: "",
      quarter: "",
    },
    mode: "onChange", // Validates as you type
  });

  const onSubmit = (data) => {
    // Data is ALREADY validated and transformed by Zod here!
    console.log("Ready to send:", data);

    // Math Check (Non-blocking warning)
    const calcTotal = data.taxableValue + data.cgst + data.sgst;
    if (Math.abs(calcTotal - data.totalBill) > 1.0) {
      toast.warning("Total bill mismatch detected");
    }

    // API Call...
  };

  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Add Transaction Details</FieldLegend>
      <FieldDescription>
        We need the transaction details to process your request.
      </FieldDescription>
      <FieldGroup>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Row 1: Taxable Value & GST Rate */}
          <div className="grid grid-cols-2 gap-4">
            <Field className="mx-auto w-48">
              <FieldLabel htmlFor="invoiceDate">Invoice Date</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="invoiceDate"
                  value={value}
                  placeholder="DD-MM-YYYY"
                  maxLength={10}
                  onChange={(e) =>
                    handleDateChange(
                      e,
                      setValue,
                      setDate,
                      setMonth,
                      setFormData,
                      date,
                    )
                  }
                  required
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpen(true);
                    }
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <InputGroupButton
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Select date"
                      >
                        <CalendarIcon />
                      </InputGroupButton>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="end"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        month={month}
                        onMonthChange={setMonth}
                        onSelect={(selectedDate) => {
                          if (selectedDate) {
                            setDate(selectedDate);
                            setValue(formatDate(selectedDate));
                            setOpen(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="invoiceNo">Invoice Number</FieldLabel>
              <Input
                id="invoiceNo"
                placeholder="INV-00123"
                value={formData.invoiceNo}
                onChange={(e) => handleInvoiceNo(e, setFormData)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="taxableValue">Taxable Value</FieldLabel>
              <Input
                id="taxableValue"
                type="number"
                min="0"
                value={formData.taxableValue}
                onChange={(e) => handleTaxableValueChange(e, setFormData)}
              />
              {form.formState.errors.taxableValue && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.taxableValue.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="gstRate">GST Rate (%)</FieldLabel>
              <Input
                id="gstRate"
                type="number"
                min="0"
                value={formData.gstRate}
                onChange={(e) => handleGstRateChange(e, setFormData)}
                disabled={!isTaxableValueValid}
                className={
                  !isTaxableValueValid ? "opacity-50 cursor-not-allowed" : ""
                }
              />
            </Field>
          </div>

          {/* Row 2: CGST & SGST */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="cgst">CGST</FieldLabel>
              <Input
                id="cgst"
                type="number"
                min="0"
                value={formData.cgst}
                onChange={(e) => handleTaxManualChange(e, setFormData)}
                disabled={!isRateValid}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="sgst">SGST</FieldLabel>
              <Input
                id="sgst"
                type="number"
                min="0"
                value={formData.sgst}
                onChange={(e) => handleTaxManualChange(e, setFormData)}
                disabled={!isRateValid}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 ml-[50%]">
            <Field>
              <FieldLabel htmlFor="billValue">Bill Value</FieldLabel>
              <Input
                id="billValue"
                type="number"
                min="0"
                value={formData.billValue}
                onChange={(e) => handleBillValueChange(e, setFormData)}
                disabled={!isRateValid}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 ml-[50%]">
            <Button
              type="button"
              onClick={sendData}
              className="mt-4 bg-green-500 text-white rounded px-4 py-2"
            >
              Submit
            </Button>
            <Button
              type="button"
              onClick={clearForm}
              className="mt-4 bg-red-500 text-white rounded px-4 py-2"
            >
              Clear
            </Button>
          </div>
        </form>
      </FieldGroup>
    </FieldSet>
  );
}

export default AddMoney;
