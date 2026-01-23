"use client";
import { useState, useEffect, useRef } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

function BusinessForm() {
  const [businesses, setBusinesses] = useState([]); // Your fetched business data
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [filteredGST, setFilteredGST] = useState([]);
  const [businessName, setBusinessName] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showGSTDropdown, setShowGSTDropdown] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null); // Track selected business

  const businessRef = useRef(null);
  const gstRef = useRef(null);

  // Fetch businesses on component mount
  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const response = await fetch("/api/business");
        const data = await response.json();
        setBusinesses(data.businesses || []);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    }
    fetchBusinesses();
  }, []);

  // Handle click outside to close dropdowns and clear if no selection
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        businessRef.current &&
        !businessRef.current.contains(e.target) &&
        showBusinessDropdown
      ) {
        setShowBusinessDropdown(false);
        // Clear if no valid selection
        if (
          !selectedBusiness ||
          businessName !== selectedBusiness.businessName
        ) {
          setBusinessName("");
          setGstNo("");
          setSelectedBusiness(null);
        }
      }

      if (
        gstRef.current &&
        !gstRef.current.contains(e.target) &&
        showGSTDropdown
      ) {
        setShowGSTDropdown(false);
        // Clear if no valid selection
        if (!selectedBusiness || gstNo !== selectedBusiness.gstNo) {
          setBusinessName("");
          setGstNo("");
          setSelectedBusiness(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    showBusinessDropdown,
    showGSTDropdown,
    businessName,
    gstNo,
    selectedBusiness,
  ]);

  // Handle ESC key to close dropdowns and clear values
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        if (showBusinessDropdown || showGSTDropdown) {
          setShowBusinessDropdown(false);
          setShowGSTDropdown(false);
          setBusinessName("");
          setGstNo("");
          setSelectedBusiness(null);
        }
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showBusinessDropdown, showGSTDropdown]);

  // Filter business names based on input
  const handleBusinessNameChange = (value) => {
    setBusinessName(value);
    setSelectedBusiness(null); // Clear selection when manually typing

    if (value.trim()) {
      const filtered = businesses
        .filter((b) =>
          b.businessName.toLowerCase().includes(value.toLowerCase()),
        )
        .sort((a, b) => a.businessName.localeCompare(b.businessName));
      setFilteredBusinesses(filtered);
      setShowBusinessDropdown(true);
    } else {
      setFilteredBusinesses([]);
      setShowBusinessDropdown(false);
      setGstNo(""); // Clear GST when business name is cleared
    }
  };

  // Filter GST numbers based on input
  const handleGSTChange = (value) => {
    setGstNo(value);
    setSelectedBusiness(null); // Clear selection when manually typing

    if (value.trim()) {
      const filtered = businesses
        .filter((b) => b.gstNo.toLowerCase().includes(value.toLowerCase()))
        .sort((a, b) => a.gstNo.localeCompare(b.gstNo));
      setFilteredGST(filtered);
      setShowGSTDropdown(true);
    } else {
      setFilteredGST([]);
      setShowGSTDropdown(false);
      setBusinessName(""); // Clear business name when GST is cleared
    }
  };

  // Handle business name selection from dropdown
  const selectBusiness = (business) => {
    setBusinessName(business.businessName);
    setGstNo(business.gstNo); // Auto-fill GST
    setSelectedBusiness(business); // Mark as selected
    setShowBusinessDropdown(false);
  };

  // Handle GST selection from dropdown
  const selectGST = (business) => {
    setGstNo(business.gstNo);
    setBusinessName(business.businessName); // Auto-fill business name
    setSelectedBusiness(business); // Mark as selected
    setShowGSTDropdown(false);
  };

  // Show all businesses when input is focused
  const handleBusinessFocus = () => {
    if (!businessName) {
      const sorted = [...businesses].sort((a, b) =>
        a.businessName.localeCompare(b.businessName),
      );
      setFilteredBusinesses(sorted);
      setShowBusinessDropdown(true);
    } else if (businessName && !selectedBusiness) {
      // Re-show dropdown if there's text but no selection
      const filtered = businesses
        .filter((b) =>
          b.businessName.toLowerCase().includes(businessName.toLowerCase()),
        )
        .sort((a, b) => a.businessName.localeCompare(b.businessName));
      setFilteredBusinesses(filtered);
      setShowBusinessDropdown(true);
    }
  };

  const handleGSTFocus = () => {
    if (!gstNo) {
      const sorted = [...businesses].sort((a, b) =>
        a.gstNo.localeCompare(b.gstNo),
      );
      setFilteredGST(sorted);
      setShowGSTDropdown(true);
    } else if (gstNo && !selectedBusiness) {
      // Re-show dropdown if there's text but no selection
      const filtered = businesses
        .filter((b) => b.gstNo.toLowerCase().includes(gstNo.toLowerCase()))
        .sort((a, b) => a.gstNo.localeCompare(b.gstNo));
      setFilteredGST(filtered);
      setShowGSTDropdown(true);
    }
  };

  return (
    <div className="grid w-full max-w-sm gap-4">
      {/* Business Name Input */}
      <div className="relative" ref={businessRef}>
        <InputGroup>
          <InputGroupInput
            placeholder="Enter business name"
            value={businessName}
            onChange={(e) => handleBusinessNameChange(e.target.value)}
            onFocus={handleBusinessFocus}
            autoComplete="off"
          />
        </InputGroup>

        {showBusinessDropdown && filteredBusinesses.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
            {filteredBusinesses.map((business) => (
              <div
                key={business.uuid}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectBusiness(business)}
              >
                <div className="font-medium text-gray-500">{business.businessName}</div>
                <div className="text-sm text-gray-500">{business.gstNo}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GST Number Input */}
      <div className="relative" ref={gstRef}>
        <InputGroup>
          <InputGroupInput
            placeholder="Enter GST number"
            value={gstNo}
            onChange={(e) => handleGSTChange(e.target.value)}
            onFocus={handleGSTFocus}
            autoComplete="off"
          />
        </InputGroup>

        {showGSTDropdown && filteredGST.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
            {filteredGST.map((business) => (
              <div
                key={business.uuid}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectGST(business)}
              >
                <div className="font-medium text-gray-500">{business.gstNo}</div>
                <div className="text-sm text-gray-500">
                  {business.businessName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default BusinessForm;
