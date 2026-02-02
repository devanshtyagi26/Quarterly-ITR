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
import axios from "axios";

// Import your helper functions
import { formatDate, calculateTaxes, calculateBillValue } from "@/lib/addMoney";

// IMPORT THE SCHEMA HERE
import { fullSchema as MoneyValidate } from "@/lib/schema/sendMoneyValidation";
import { fullSchema as BusinessValidate } from "@/lib/schema/businessValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

function AddMoney({ business }) {
  const { businessName, gstNo } = business;

  const [date, setDate] = useState(null);
  const [month, setMonth] = useState(new Date());
  const [dateValue, setDateValue] = useState("");
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(MoneyValidate.and(BusinessValidate)),
    defaultValues: {
      businessName,
      gstNo,
      taxableValue: 0,
      gstRate: 0,
      cgst: 0,
      sgst: 0,
      billValue: 0,
      invoiceNo: "",
      year: 0,
      quarter: 0,
      invoiceDate: "",
    },
    mode: "onSubmit",
  });

  const taxableValue = form.watch("taxableValue");
  const gstRate = form.watch("gstRate");

  // Derived state for UI disabling logic
  const isTaxableValueValid = taxableValue > 0;
  const isRateValid = gstRate > 0;

  const clearForm = () => {
    setDate(null);
    setDateValue("");
    form.reset({
      businessName,
      gstNo,
      taxableValue: 0,
      gstRate: 0,
      cgst: 0,
      sgst: 0,
      billValue: 0,
      invoiceNo: "",
      year: 0,
      quarter: 0,
      invoiceDate: "",
    });
  };

  const handleDateChange = (e, field) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 8) input = input.slice(0, 8);

    let formatted = input;
    if (input.length >= 3) {
      formatted = `${input.slice(0, 2)}-${input.slice(2)}`;
    }
    if (input.length >= 5) {
      formatted = `${input.slice(0, 2)}-${input.slice(2, 4)}-${input.slice(4)}`;
    }

    setDateValue(formatted);
    field.onChange(formatted);

    if (input.length === 8) {
      const day = parseInt(input.slice(0, 2), 10);
      const mth = parseInt(input.slice(2, 4), 10);
      const year = parseInt(input.slice(4, 8), 10);

      const dateObj = new Date(year, mth - 1, day);

      if (
        dateObj.getFullYear() === year &&
        dateObj.getMonth() === mth - 1 &&
        dateObj.getDate() === day
      ) {
        setDate(dateObj);
        setMonth(dateObj);
        form.setValue("year", year);
        form.setValue("quarter", Math.floor((mth - 1) / 3 + 1));
      }
    } else {
      if (date) setDate(null);
    }
  };

  const handleTaxableValueChange = (e, field) => {
    const value = e.target.value;
    const numValue = value === "" ? 0 : parseFloat(value);

    if (numValue < 0) return;

    field.onChange(numValue);

    // Recalculate taxes if rate exists
    if (gstRate > 0 && numValue > 0) {
      const taxes = calculateTaxes(numValue, gstRate);
      form.setValue("cgst", taxes.cgst);
      form.setValue("sgst", taxes.sgst);
      form.setValue(
        "billValue",
        calculateBillValue(numValue, taxes.cgst, taxes.sgst),
      );
    }
  };

  const handleGstRateChange = (e, field) => {
    const value = e.target.value;
    const numValue = value === "" ? 0 : parseFloat(value);

    if (numValue < 0) return;

    field.onChange(numValue);

    // Recalculate taxes if taxable value exists
    if (taxableValue > 0 && numValue > 0) {
      const { cgst, sgst } = calculateTaxes(taxableValue, numValue);
      form.setValue("cgst", cgst);
      form.setValue("sgst", sgst);
      form.setValue("billValue", calculateBillValue(taxableValue, cgst, sgst));
    }
  };

  const handleTaxManualChange = (e, field, fieldName) => {
    const value = e.target.value;
    const numValue = value === "" ? 0 : parseFloat(value);

    if (numValue < 0) return;

    field.onChange(numValue);

    // Get the other tax value
    const cgst = fieldName === "cgst" ? numValue : form.getValues("cgst");
    const sgst = fieldName === "sgst" ? numValue : form.getValues("sgst");

    // Recalculate bill value
    form.setValue("billValue", calculateBillValue(taxableValue, cgst, sgst));
  };

  const handleBillValueChange = (e, field) => {
    const value = e.target.value;
    const numValue = value === "" ? 0 : parseFloat(value);

    if (numValue < 0) return;

    field.onChange(numValue);
  };

  function onSubmit(data) {
    console.log("FORM SUBMITTED SUCCESSFULLY");

    const calcTotal = data.taxableValue + data.cgst + data.sgst;
    const totalBill = data.billValue;

    if (Math.abs(calcTotal - totalBill) > 1.0) {
      toast.warning("Total bill mismatch detected");
    }

    const payload = {
      ...data,
    };

    axios
      .post("/api/business/create", payload)
      .then((response) => {
        console.log("API response:", response.data);
        toast.success("Invoice created successfully");
      })
      .catch((error) => {
        console.error("API error:", error);
        toast.error(error.response?.data?.error || "Failed to create invoice");
      });

    clearForm();
  }

  const onError = (errors) => {
    toast.error(errors[Object.keys(errors)[0]].message);
  };

  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Add Transaction Details</FieldLegend>
      <FieldDescription>
        We need the transaction details to process your request.
      </FieldDescription>
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
        <FieldGroup>
          {/* Row 1: Invoice Date & Invoice Number */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="invoiceDate"
              control={form.control}
              render={({ field }) => (
                <Field className="mx-auto w-48">
                  <FieldLabel htmlFor="invoiceDate">Invoice Date</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="invoiceDate"
                      value={dateValue}
                      placeholder="DD-MM-YYYY"
                      maxLength={10}
                      onChange={(e) => handleDateChange(e, field)}
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
                                const formatted = formatDate(selectedDate);
                                setDateValue(formatted);
                                field.onChange(formatted);
                                setOpen(false);

                                form.setValue(
                                  "year",
                                  selectedDate.getFullYear(),
                                );
                                form.setValue(
                                  "quarter",
                                  Math.floor(selectedDate.getMonth() / 3 + 1),
                                );
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </InputGroupAddon>
                  </InputGroup>
                  {form.formState.errors.invoiceDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.invoiceDate.message}
                    </p>
                  )}
                </Field>
              )}
            />

            <Controller
              name="invoiceNo"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="invoiceNo">Invoice Number</FieldLabel>
                  <Input
                    {...field}
                    id="invoiceNo"
                    placeholder="INV-00123"
                    autoComplete="off"
                  />
                  {form.formState.errors.invoiceNo && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.invoiceNo.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>

          {/* Row 2: Taxable Value & GST Rate */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="taxableValue"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="taxableValue">Taxable Value</FieldLabel>
                  <Input
                    value={field.value || ""}
                    id="taxableValue"
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(e) => handleTaxableValueChange(e, field)}
                    autoComplete="off"
                  />
                  {form.formState.errors.taxableValue && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.taxableValue.message}
                    </p>
                  )}
                </Field>
              )}
            />

            <Controller
              name="gstRate"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="gstRate">GST Rate (%)</FieldLabel>
                  <Input
                    value={field.value || ""}
                    id="gstRate"
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(e) => handleGstRateChange(e, field)}
                    disabled={!isTaxableValueValid}
                    className={
                      !isTaxableValueValid
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                    autoComplete="off"
                  />
                  {form.formState.errors.gstRate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.gstRate.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>

          {/* Row 3: CGST & SGST */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="cgst"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="cgst">CGST</FieldLabel>
                  <Input
                    value={field.value || ""}
                    id="cgst"
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(e) => handleTaxManualChange(e, field, "cgst")}
                    disabled={!isRateValid}
                    className={
                      !isRateValid ? "opacity-50 cursor-not-allowed" : ""
                    }
                    autoComplete="off"
                  />
                  {form.formState.errors.cgst && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.cgst.message}
                    </p>
                  )}
                </Field>
              )}
            />

            <Controller
              name="sgst"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="sgst">SGST</FieldLabel>
                  <Input
                    value={field.value || ""}
                    id="sgst"
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(e) => handleTaxManualChange(e, field, "sgst")}
                    disabled={!isRateValid}
                    className={
                      !isRateValid ? "opacity-50 cursor-not-allowed" : ""
                    }
                    autoComplete="off"
                  />
                  {form.formState.errors.sgst && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.sgst.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>

          {/* Row 4: Bill Value */}
          <div className="grid grid-cols-2 gap-4 ml-[50%]">
            <Controller
              name="billValue"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="billValue">Bill Value</FieldLabel>
                  <Input
                    value={field.value || ""}
                    id="billValue"
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(e) => handleBillValueChange(e, field)}
                    disabled={!isRateValid}
                    className={
                      !isRateValid ? "opacity-50 cursor-not-allowed" : ""
                    }
                    autoComplete="off"
                  />
                  {form.formState.errors.billValue && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.billValue.message}
                    </p>
                  )}
                </Field>
              )}
            />
          </div>

          {/* Debug: Show all errors */}
          {/* {Object.keys(form.formState.errors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded mt-4">
              <p className="font-bold text-red-700 mb-2">Form has errors:</p>
              <ul className="list-disc list-inside text-red-600 text-sm">
                {Object.entries(form.formState.errors).map(([key, error]) => (
                  <li key={key}>
                    {key}: {error?.message || "Invalid"}
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* Row 5: Action Buttons */}
          <div className="grid grid-cols-2 gap-4 ml-[50%]">
            <Button
              type="button"
              onClick={clearForm}
              variant="outline"
              className="mt-4"
            >
              Clear
            </Button>
            <Button
              type="submit"
              className="mt-4 bg-green-500 hover:bg-green-600 text-white"
            >
              Submit
            </Button>
          </div>
        </FieldGroup>
      </form>
    </FieldSet>
  );
}

export default AddMoney;
