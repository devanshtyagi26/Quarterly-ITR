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
import axios from "axios";
import { toast } from "sonner";
import {
  formatDate,
  handleInvoiceNo,
  handleTaxManualChange,
  handleBillValueChange,
  handleTaxableValueChange,
  handleGstRateChange,
  handleDateChange,
} from "@/lib/addMoney";

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

  // Check if Taxable Value is valid to enable GST Rate
  const isTaxableValueValid =
    formData.taxableValue !== "" &&
    !isNaN(formData.taxableValue) &&
    parseFloat(formData.taxableValue) > 0;

  // Check if GST Rate is filled to enable Tax fields
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

  const sendData = (e) => {
    e.preventDefault();

    // 1. Centralized Validation Rules
    const errors = [
      { check: !business, msg: "No business selected." },
      { check: !date, msg: "Please enter a valid invoice date." },
      { check: !formData.invoiceNo, msg: "Please enter an invoice number." },
      {
        check: !isTaxableValueValid,
        msg: "Please enter a valid taxable value.",
      },
      { check: !isRateValid, msg: "Please enter a valid GST rate." },
      {
        check: formData.cgst === "" || isNaN(formData.cgst),
        msg: "Please enter a valid CGST amount.",
      },
      {
        check: formData.sgst === "" || isNaN(formData.sgst),
        msg: "Please enter a valid SGST amount.",
      },
      {
        check: formData.billValue === "" || isNaN(formData.billValue),
        msg: "Please enter a valid bill value.",
      },
      { check: !formData.year, msg: "Year is not set correctly." },
      { check: !formData.quarter, msg: "Quarter is not set correctly." },
    ];

    // 2. Iterate and Stop on First Error
    for (const { check, msg } of errors) {
      if (check) {
        toast.error(msg);
        return;
      }
    }

    // 3. Construct Data (Safe Parsing)
    // Using Number() or parseFloat() || 0 prevents NaN issues
    const dataToSend = {
      businessName: business.businessName,
      gstNo: business.gstNo,
      invoiceDate: formatDate(date),
      invoiceNo: formData.invoiceNo,
      taxableValue: Number(formData.taxableValue) || 0,
      gstRate: Number(formData.gstRate) || 0,
      cgst: Number(formData.cgst) || 0,
      sgst: Number(formData.sgst) || 0,
      totalBill: Number(formData.billValue) || 0,
      year: formData.year,
      quarter: formData.quarter,
    };

    console.log("Data to send:", dataToSend);
    // Implement API call here
  };
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Add Transaction Details</FieldLegend>
      <FieldDescription>
        We need the transaction details to process your request.
      </FieldDescription>
      <FieldGroup>
        {/* Row 1: Taxable Value & GST Rate */}
        <div className="grid grid-cols-2 gap-4">
          <Field className="mx-auto w-48">
            <FieldLabel htmlFor="invoiceDate">Invoice Date</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="invoiceDate"
                value={value}
                placeholder="DD-MM-YYYY"
                maxLength={10} // 10 chars = 8 digits + 2 dashes
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
                  // Open calendar on arrow down
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
                      id="date-picker"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Select date"
                    >
                      <CalendarIcon />
                      <span className="sr-only">Select date</span>
                    </InputGroupButton>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      month={month}
                      onMonthChange={setMonth}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setDate(selectedDate);
                          // Update input text with the new format
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
              type="text"
              placeholder="INV-00123"
              onChange={(e) => handleInvoiceNo(e, setFormData)}
              value={formData.invoiceNo}
              required
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
              placeholder="0.00"
              value={formData.taxableValue}
              onChange={(e) => handleTaxableValueChange(e, setFormData)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="gstRate">GST Rate (%)</FieldLabel>
            <Input
              id="gstRate"
              type="number"
              min="0"
              placeholder="18"
              value={formData.gstRate}
              onChange={(e) => handleGstRateChange(e, setFormData)}
              disabled={!isTaxableValueValid} // Condition 1: Disabled until Taxable Value is filled
              className={
                !isTaxableValueValid ? "opacity-50 cursor-not-allowed" : ""
              }
              required
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
              placeholder="0.00"
              value={formData.cgst}
              onChange={(e) => handleTaxManualChange(e, setFormData)}
              disabled={!isRateValid} // Condition 2: Disabled until Rate is filled
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="sgst">SGST</FieldLabel>
            <Input
              id="sgst"
              type="number"
              min="0"
              placeholder="0.00"
              value={formData.sgst}
              onChange={(e) => handleTaxManualChange(e, setFormData)}
              disabled={!isRateValid} // Condition 2: Disabled until Rate is filled
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
              placeholder="0.00"
              value={formData.billValue}
              onChange={(e) => handleBillValueChange(e, setFormData)}
              disabled={!isRateValid} // Condition 2: Disabled until Rate is filled
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
      </FieldGroup>
    </FieldSet>
  );
}

export default AddMoney;
