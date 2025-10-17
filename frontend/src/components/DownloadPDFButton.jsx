import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const DownloadPDFButton = () => {
  const handleSaveAsPDF = async () => {
    const element = document.body; // You can target specific parts of the page instead
    const canvas = await html2canvas(element, { scale: 2 }); // Higher scale for better quality
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4"); // Portrait orientation, millimeters, A4 paper
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("StudyMate_Progress_Analysis.pdf");
  };

  return<div className="relative">
  <button
    onClick={handleSaveAsPDF}
    className="
      absolute top-8       /* mobile: move down */
      sm:static sm:ml-auto           /* ≥640px: back to normal flow */
      flex items-center justify-center
      h-8 px-3 text-[12px] w-[120px]
      sm:h-9 sm:px-3.5 sm:text-[13px] sm:w-[140px]
      md:h-[34px] md:px-4 md:text-[16px] md:w-[160px]
      text-white font-semibold
      bg-gradient-to-b from-[#0570b2] to-[#0745a2]
      rounded-[100px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
      space-x-2
    "
  >
    <img src="/downloadIcon.png" alt="Save" className="w-4 h-4 md:w-5 md:h-5" />
    <span className="hidden sm:inline">Export Data</span>
  </button>
</div>


};

export default DownloadPDFButton;
