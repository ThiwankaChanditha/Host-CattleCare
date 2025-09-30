import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileTextIcon } from 'lucide-react';

export default function FarmReportGenerator({ farm, animals, aiData, milkData }) {
  const generatePDF = async () => {
    // Check if required libraries are available
    if (typeof jsPDF === 'undefined' || typeof html2canvas === 'undefined') {
      alert('PDF generation libraries not available. Please refresh the page and try again.');
      return;
    }

    // Calculate analytics data
    const totalAnimals = animals.length;
    const milkingCows = animals.filter(animal => 
      animal.category?.toLowerCase().includes('cow') && 
      !animal.category?.toLowerCase().includes('dry')
    ).length;
    const dryCows = animals.filter(animal => 
      animal.category?.toLowerCase().includes('cow') && 
      animal.category?.toLowerCase().includes('dry')
    ).length;
    const heifers = animals.filter(animal => 
      animal.category?.toLowerCase().includes('heifer')
    ).length;
    const bulls = animals.filter(animal => 
      animal.category?.toLowerCase().includes('bull')
    ).length;
    const calves = animals.filter(animal => 
      animal.category?.toLowerCase().includes('calf')
    ).length;

    const totalMilkProduction = milkData.reduce((sum, record) => 
      sum + (record.total_milk_production || 0), 0
    );
    const avgMilkPerCow = milkingCows > 0 ? totalMilkProduction / milkingCows : 0;

    const pregnantCount = aiData.filter(record => record.pregnancy_status === 'Pregnant').length;
    const notPregnantCount = aiData.filter(record => record.pregnancy_status === 'Not Pregnant').length;
    const abortedCount = aiData.filter(record => record.pregnancy_status === 'Aborted').length;
    const successRate = aiData.length > 0 ? (pregnantCount / aiData.length) * 100 : 0;

    // Create PDF directly using jsPDF (no html2canvas needed)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper function to add text with page break handling
    const addText = (text, x, y, options = {}) => {
      const { fontSize = 12, fontStyle = 'normal', maxWidth = contentWidth } = options;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      if (y + (lines.length * fontSize * 0.4) > pageHeight - margin) {
        pdf.addPage();
        return margin;
      }
      
      pdf.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4) + 5;
    };

    // Helper function to add table
    const addTable = (headers, data, startY) => {
      let y = startY;
      const colWidth = contentWidth / headers.length;
      const rowHeight = 8;

      // Add headers
      pdf.setFillColor(243, 244, 246);
      pdf.rect(margin, y, contentWidth, rowHeight, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, margin + (index * colWidth) + 2, y + 6);
      });
      y += rowHeight;

      // Add data rows
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      data.forEach(row => {
        if (y + rowHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        row.forEach((cell, index) => {
          pdf.text(cell, margin + (index * colWidth) + 2, y + 6);
        });
        y += rowHeight;
      });

      return y + 10;
    };

    // Page 1: Header and Farm Details
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CATTLE CARE FARM ANALYTICS REPORT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Government of Sri Lanka - Livestock Development Institute', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Farm Details Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FARM DETAILS', margin, yPosition);
    yPosition += 10;

    const farmDetails = [
      ['Farm Name:', farm.farm_name || 'N/A'],
      ['Farm Registration Number:', farm.farm_registration_number || 'N/A'],
      ['Farm Owner:', farm.farmer_id?.user_id?.full_name || 'N/A'],
      ['Farm Location:', farm.location_address || 'N/A'],
      ['Farm Type:', farm.farm_type || 'N/A'],
      ['Registration Date:', farm.registration_date ? new Date(farm.registration_date).toLocaleDateString() : 'N/A'],
      ['Farm Status:', farm.is_active ? 'Active' : 'Inactive']
    ];

    farmDetails.forEach(([label, value]) => {
      yPosition = addText(`${label} ${value}`, margin, yPosition, { fontSize: 10 });
    });

    yPosition += 10;

    // Herd Composition Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HERD COMPOSITION ANALYSIS', margin, yPosition);
    yPosition += 10;

    const herdData = [
      ['Category', 'Count', 'Percentage'],
      ['Total Animals', totalAnimals.toString(), '100%'],
      ['Milking Cows', milkingCows.toString(), totalAnimals > 0 ? ((milkingCows / totalAnimals) * 100).toFixed(1) + '%' : '0%'],
      ['Dry Cows', dryCows.toString(), totalAnimals > 0 ? ((dryCows / totalAnimals) * 100).toFixed(1) + '%' : '0%'],
      ['Heifers', heifers.toString(), totalAnimals > 0 ? ((heifers / totalAnimals) * 100).toFixed(1) + '%' : '0%'],
      ['Bulls', bulls.toString(), totalAnimals > 0 ? ((bulls / totalAnimals) * 100).toFixed(1) + '%' : '0%'],
      ['Calves', calves.toString(), totalAnimals > 0 ? ((calves / totalAnimals) * 100).toFixed(1) + '%' : '0%']
    ];

    yPosition = addTable(['Category', 'Count', 'Percentage'], herdData.slice(1), yPosition);

    // Milk Production Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MILK PRODUCTION ANALYSIS', margin, yPosition);
    yPosition += 10;

    const milkDataTable = [
      ['Metric', 'Value'],
      ['Total Milk Production', `${totalMilkProduction.toLocaleString()} Liters`],
      ['Average Milk per Cow', `${avgMilkPerCow.toFixed(0)} Liters`],
      ['Monthly Reports Submitted', milkData.length.toString()]
    ];

    yPosition = addTable(['Metric', 'Value'], milkDataTable.slice(1), yPosition);

    // Check if we need a page break before AI Analysis
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = margin;
    }

    // Page 2: AI Analysis and Performance Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ARTIFICIAL INSEMINATION ANALYSIS', margin, yPosition);
    yPosition += 10;

    const aiDataTable = [
      ['Status', 'Count', 'Percentage'],
      ['Total AI Records', aiData.length.toString(), '100%'],
      ['Pregnant', pregnantCount.toString(), aiData.length > 0 ? ((pregnantCount / aiData.length) * 100).toFixed(1) + '%' : '0%'],
      ['Not Pregnant', notPregnantCount.toString(), aiData.length > 0 ? ((notPregnantCount / aiData.length) * 100).toFixed(1) + '%' : '0%'],
      ['Aborted', abortedCount.toString(), aiData.length > 0 ? ((abortedCount / aiData.length) * 100).toFixed(1) + '%' : '0%'],
      ['Success Rate', `${successRate.toFixed(1)}%`, '']
    ];

    yPosition = addTable(['Status', 'Count', 'Percentage'], aiDataTable.slice(1), yPosition);

    // Performance Summary Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PERFORMANCE SUMMARY', margin, yPosition);
    yPosition += 10;

    const performanceRating = getPerformanceRating(successRate, avgMilkPerCow);
    const keyStrengths = getKeyStrengths(milkingCows, successRate, totalMilkProduction);
    const areasForImprovement = getAreasForImprovement(milkingCows, successRate, totalMilkProduction);
    const recommendations = getRecommendations(milkingCows, successRate, totalMilkProduction);

    yPosition = addText(`Farm Performance Rating: ${performanceRating}`, margin, yPosition, { fontSize: 12, fontStyle: 'bold' });
    yPosition = addText(`Key Strengths: ${keyStrengths}`, margin, yPosition, { fontSize: 10 });
    yPosition = addText(`Areas for Improvement: ${areasForImprovement}`, margin, yPosition, { fontSize: 10 });
    yPosition = addText(`Recommendations: ${recommendations}`, margin, yPosition, { fontSize: 10 });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This report is generated by the Cattle Care Management System', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('Livestock Development Institute - Government of Sri Lanka', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Download the PDF
    const fileName = `Farm_Analytics_Report_${farm.farm_name || 'Farm'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  // Helper functions for performance analysis
  const getPerformanceRating = (successRate, avgMilkPerCow) => {
    if (successRate >= 70 && avgMilkPerCow >= 15) return 'Excellent';
    if (successRate >= 60 && avgMilkPerCow >= 12) return 'Good';
    if (successRate >= 50 && avgMilkPerCow >= 10) return 'Average';
    return 'Needs Improvement';
  };

  const getKeyStrengths = (milkingCows, successRate, totalMilkProduction) => {
    const strengths = [];
    if (milkingCows > 0) strengths.push('Active milking herd');
    if (successRate >= 60) strengths.push('Good AI success rate');
    if (totalMilkProduction > 0) strengths.push('Regular milk production');
    return strengths.length > 0 ? strengths.join(', ') : 'None identified';
  };

  const getAreasForImprovement = (milkingCows, successRate, totalMilkProduction) => {
    const areas = [];
    if (milkingCows === 0) areas.push('Increase milking herd');
    if (successRate < 50) areas.push('Improve AI success rate');
    if (totalMilkProduction === 0) areas.push('Start milk production tracking');
    return areas.length > 0 ? areas.join(', ') : 'No major areas identified';
  };

  const getRecommendations = (milkingCows, successRate, totalMilkProduction) => {
    const recommendations = [];
    if (milkingCows === 0) recommendations.push('Consider adding milking cows to the herd');
    if (successRate < 60) recommendations.push('Review AI procedures and timing');
    if (totalMilkProduction === 0) recommendations.push('Implement regular milk production monitoring');
    recommendations.push('Maintain regular veterinary check-ups');
    recommendations.push('Continue with proper feeding and management practices');
    return recommendations.join('; ');
  };

  return (
    <button
      onClick={generatePDF}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
    >
      <FileTextIcon className="w-4 h-4 mr-2" />
      Generate Report
    </button>
  );
} 