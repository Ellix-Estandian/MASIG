import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";

const TestPDF = () => {
  const handleDownload = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["User", "Action", "Time"]],
      body: [["ellix@neu.edu", "added", "2025-05-21 13:45"]],
    });

    doc.save("test.pdf");
  };

  return <Button onClick={handleDownload}>Test PDF</Button>;
};

export default TestPDF;