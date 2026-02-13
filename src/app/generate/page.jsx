"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Filter } from "lucide-react";

const QUARTERS = [
  { label: "Q1: Jan - Mar", value: 1 },
  { label: "Q2: Apr - Jun", value: 2 },
  { label: "Q3: Jul - Sep", value: 3 },
  { label: "Q4: Oct - Dec", value: 4 },
];

const handleExport = async () => {
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
};

function Generate() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Memoized Calculations for performance
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowQuarterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGenerate = async () => {
    if (!year || !selectedQuarter) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/generate?year=${year}&quarter=${selectedQuarter.value}`,
      );
      setReport(response.data.generatedQuarterReport || []);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
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
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Financial Year
                </Label>
                <Input
                  type="number"
                  value={year}
                  placeholder="2024"
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2 relative" ref={dropdownRef}>
                <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Period
                </Label>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal bg-slate-50 dark:bg-slate-900"
                  onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
                >
                  {selectedQuarter ? selectedQuarter.label : "Select Quarter"}
                  <Calendar className="ml-2 h-4 w-4 opacity-50" />
                </Button>

                {showQuarterDropdown && (
                  <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {QUARTERS.map((q) => (
                      <div
                        key={q.value}
                        className="px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedQuarter(q);
                          setShowQuarterDropdown(false);
                        }}
                      >
                        {q.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedQuarter}
                className="w-full shadow-md bg-blue-600 hover:bg-blue-700 transition-all active:scale-95"
              >
                {loading ? "Processing..." : "Generate Analysis"}
              </Button>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  Detailed Invoice Ledger
                </CardTitle>
                <CardDescription>
                  {report
                    ? `Showing ${report.length} entries for ${selectedQuarter?.label} ${year}`
                    : "No data generated"}
                </CardDescription>
              </div>
              {report?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" /> Export
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
                            Start by selecting a period and generating the
                            report.
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
