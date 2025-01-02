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

  return <button className=" flex items-center w-[160px]  text-white font-semibold text-[16px] h-[34px] bg-gradient-to-b from-[#0570b2] to-[#0745a2] rounded-[100px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] px-4 space-x-2"
   onClick={handleSaveAsPDF}>
   <img 
      src="/downloadIcon.png" // Replace with your icon's path
      alt="Save Icon" 
      className="w-5 h-5" // Adjust width and height as needed
    />
 <span>Export Data</span>
 </button>;
};

export default DownloadPDFButton;
