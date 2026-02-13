"use client";

import React, { useState, useMemo } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Filter, RotateCcw } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fullSchema } from "@/lib/schema/generateFileValidation";
import { Loader2 } from "lucide-react";

const QUARTERS = [
  { label: "Q1: Jan - Mar", value: "1" },
  { label: "Q2: Apr - Jun", value: "2" },
  { label: "Q3: Jul - Sep", value: "3" },
  { label: "Q4: Oct - Dec", value: "4" },
];

function Generate() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedParams, setGeneratedParams] = useState(null);
  const [exporting, setExporting] = useState(false);

  const form = useForm({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      year: "",
      quarter: "",
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = form;

  const isFormLocked = !!generatedParams;

  const handleExport = async () => {
    setExporting(true);
    const response = await fetch("/api/export", {
      method: "POST",
      body: JSON.stringify({
        /* your data */
      }),
    });

    if (response.ok) {
      // Convert response to a blob
      const blob = await response.blob();
      // Create a temporary link and click it to trigger the OS "Save As"
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "MyReport.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      console.log("Report exported successfully");
    } else {
      console.error("Failed to export report:", response.statusText);
    }
    setExporting(false);
  };

  // Memoized Calculations
  const totals = useMemo(() => {
    if (!report) return { bill: 0, taxable: 0, cgst: 0, sgst: 0 };
    return report.reduce(
      (acc, item) => ({
        bill: acc.bill + Number(item.totalBill || 0),
        taxable: acc.taxable + Number(item.taxableValue || 0),
        cgst: acc.cgst + Number(item.cgst || 0),
        sgst: acc.sgst + Number(item.sgst || 0),
      }),
      { bill: 0, taxable: 0, cgst: 0, sgst: 0 },
    );
  }, [report]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/generate?year=${data.year}&quarter=${data.quarter}`,
      );
      setReport(response.data.generatedQuarterReport || []);
      setGeneratedParams({
        year: data.year,
        quarter: data.quarter,
        quarterLabel: QUARTERS.find((q) => q.value === String(data.quarter))
          ?.label,
      });
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearReport = () => {
    setReport(null);
    setGeneratedParams(null);
    reset({ year: "", quarter: "" }); // Ensures the form visuals reset
  };

  return (
    <div className="page-container-full">
      <div className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto gap-6 h-full">
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4">
          <Card className="shadow-lg border-none ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl font-bold">Filters</CardTitle>
              </div>
              <CardDescription>
                Configure your report parameters
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-5">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Year Input */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                    Financial Year
                  </Label>
                  <Controller
                    name="year"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="e.g. 2024"
                        disabled={isFormLocked}
                        className={`bg-white dark:bg-slate-900 ${errors.year ? "border-destructive" : ""}`}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value, 10) : "",
                          )
                        }
                      />
                    )}
                  />
                  {errors.year && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.year.message}
                    </p>
                  )}
                </div>

                {/* Quarter Select */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                    Period
                  </Label>
                  <Controller
                    name="quarter"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={String(field.value)}
                        disabled={isFormLocked}
                      >
                        <SelectTrigger
                          className={`bg-white w-[100%] dark:bg-slate-900 ${errors.quarter ? "border-destructive" : ""}`}
                        >
                          <SelectValue placeholder="Select Quarter" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900">
                          {QUARTERS.map((q) => (
                            <SelectItem key={q.value} value={q.value}>
                              {q.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.quarter && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.quarter.message}
                    </p>
                  )}
                </div>

                {/* Action Button */}
                {isFormLocked ? (
                  <Button
                    type="button"
                    onClick={handleClearReport}
                    variant="outline"
                    className="w-full border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" /> Clear Report
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-[0.98]"
                  >
                    {loading ? "Processing..." : "Generate Analysis"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {/* Statistics Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            {[
              { label: "Total Bill", val: totals.bill, color: "text-blue-600" },
              {
                label: "Taxable Value",
                val: totals.taxable,
                color: "text-emerald-600",
              },
              {
                label: "Total CGST",
                val: totals.cgst,
                color: "text-indigo-600",
              },
              {
                label: "Total SGST",
                val: totals.sgst,
                color: "text-violet-600",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800"
              >
                <CardContent className="p-4 pt-6">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-tight mb-1">
                    {stat.label}
                  </p>
                  <h3 className={`text-xl font-bold ${stat.color}`}>
                    {stat.val.toLocaleString()}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="flex-1 min-h-0 border-none shadow-lg ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 shrink-0 ">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Detailed Invoice Ledger
                </CardTitle>
                <CardDescription>
                  {report
                    ? `Showing ${report.length} entries for ${generatedParams?.quarterLabel} ${generatedParams?.year}`
                    : "No data generated"}
                </CardDescription>
              </div>
              {report?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}{" "}
                  Export Word
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                <div className="h-full overflow-x-auto overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700 z-10">
                      <tr>
                        <th className="px-4 py-3">Particular/Supplier</th>
                        <th className="px-4 py-3">Invoice Details</th>
                        <th className="px-4 py-3 text-right">Bill Value</th>
                        <th className="px-4 py-3 text-center">Rate</th>
                        <th className="px-4 py-3 text-right">Taxable</th>
                        <th className="px-4 py-3 text-right">CGST</th>
                        <th className="px-4 py-3 text-right">SGST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {report?.length > 0 ? (
                        report.map((item) => (
                          <tr
                            key={item._id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                              <div className="flex flex-col">
                                <span>{item.businessName}</span>
                                <span className="text-[10px] text-slate-400 font-mono uppercase">
                                  {item.gstNo}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              <div className="flex flex-col">
                                <span>
                                  {new Date(
                                    item.invoiceDate,
                                  ).toLocaleDateString("en-IN")}
                                </span>
                                <span className="text-xs opacity-70">
                                  {item.invoiceNo}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">
                              {item.totalBill}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="secondary" className="font-mono">
                                {item.gstRate}%
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {item.taxableValue}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {item.cgst}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {item.sgst}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-4 py-12 text-center text-slate-400 italic"
                          >
                            {isFormLocked
                              ? "No data found for the selected period."
                              : "Start by selecting a period and generating the report."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Generate;
