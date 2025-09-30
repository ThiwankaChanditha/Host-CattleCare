import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { FileTextIcon, DownloadIcon, BarChart3Icon, PieChartIcon } from 'lucide-react';

export default function ComprehensiveReportGenerator({ reportType, data, onGenerate }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Check if required libraries are available
      if (typeof jsPDF === 'undefined') {
        alert('PDF generation libraries not available. Please refresh the page and try again.');
        return;
      }

      switch (reportType) {
        case 'farm-production':
          await generateFarmProductionReport(data);
          break;
        case 'livestock-census':
          await generateLivestockCensusReport(data);
          break;
        case 'validation-summary':
          await generateValidationSummaryReport(data);
          break;
        default:
          alert('Invalid report type');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFarmProductionReport = async (data) => {
    const { farms, animals, milkData, aiData } = data;
    
    console.log('Generating farm production report with data:', { farms, animals, milkData, aiData });
    
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

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('COMPREHENSIVE FARM PRODUCTION REPORT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Government of Sri Lanka - Livestock Development Institute', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Summary Statistics
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SUMMARY STATISTICS', margin, yPosition);
    yPosition += 10;

    const totalFarms = farms.length;
    const totalAnimals = animals.length;
    const totalMilkProduction = milkData.reduce((sum, record) => sum + (record.total_milk_production || 0), 0);
    const totalAIRecords = aiData.length;
    const pregnantCount = aiData.filter(record => record.pregnancy_status === 'Pregnant').length;
    const successRate = totalAIRecords > 0 ? (pregnantCount / totalAIRecords) * 100 : 0;

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Farms', totalFarms.toString()],
      ['Total Animals', totalAnimals.toString()],
      ['Total Milk Production', `${totalMilkProduction.toLocaleString()} Liters`],
      ['Total AI Records', totalAIRecords.toString()],
      ['AI Success Rate', `${successRate.toFixed(1)}%`]
    ];

    yPosition = addTable(['Metric', 'Value'], summaryData.slice(1), yPosition);

    // Farm-wise Production Analysis
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FARM-WISE PRODUCTION ANALYSIS', margin, yPosition);
    yPosition += 10;

    const farmProductionData = farms.map(farm => {
      const farmAnimals = animals.filter(animal => animal.farm_id === farm._id);
      const farmMilkData = milkData.filter(record => record.farm_id === farm._id);
      const farmAIData = aiData.filter(record => record.farm_id === farm._id);
      
      const totalMilk = farmMilkData.reduce((sum, record) => sum + (record.total_milk_production || 0), 0);
      const aiSuccess = farmAIData.length > 0 ? 
        (farmAIData.filter(record => record.pregnancy_status === 'Pregnant').length / farmAIData.length) * 100 : 0;

      return [
        farm.farm_name || 'N/A',
        farmAnimals.length.toString(),
        `${totalMilk.toLocaleString()} L`,
        `${aiSuccess.toFixed(1)}%`
      ];
    });

    yPosition = addTable(['Farm Name', 'Animals', 'Milk Production', 'AI Success Rate'], farmProductionData, yPosition);

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This report is generated by the Cattle Care Management System', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('Livestock Development Institute - Government of Sri Lanka', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Download the PDF
    const fileName = `Comprehensive_Farm_Production_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const generateLivestockCensusReport = async (data) => {
    const { farms, animals } = data;
    
    console.log('Generating livestock census report with data:', { farms, animals });
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper functions (same as above)
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

    const addTable = (headers, data, startY) => {
      let y = startY;
      const colWidth = contentWidth / headers.length;
      const rowHeight = 8;

      pdf.setFillColor(243, 244, 246);
      pdf.rect(margin, y, contentWidth, rowHeight, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, margin + (index * colWidth) + 2, y + 6);
      });
      y += rowHeight;

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

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LIVESTOCK CENSUS REPORT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Government of Sri Lanka - Livestock Development Institute', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Overall Statistics
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OVERALL LIVESTOCK STATISTICS', margin, yPosition);
    yPosition += 10;

    const totalAnimals = animals.length;
    const cattleCount = animals.filter(animal => animal.animal_type === 'Cattle').length;
    const buffaloCount = animals.filter(animal => animal.animal_type === 'Buffalo').length;
    const maleCount = animals.filter(animal => animal.gender === 'Male').length;
    const femaleCount = animals.filter(animal => animal.gender === 'Female').length;
    const activeCount = animals.filter(animal => animal.current_status === 'Active').length;

    const overallStats = [
      ['Category', 'Count', 'Percentage'],
      ['Total Animals', totalAnimals.toString(), '100%'],
      ['Cattle', cattleCount.toString(), totalAnimals > 0 ? ((cattleCount / totalAnimals) * 100).toFixed(1) + '%' : '0%'],
      ['Buffalo', buffaloCount.toString(), totalAnimals > 0 ? ((buffaloCount / totalAnimals) * 100).toFixed(1) + '%' : '0%'],
      ['Male', maleCount.toString(), totalAnimals > 0 ? ((maleCount / totalAnimals) * 100).toFixed(1) + '%' : '0%'],
      ['Female', femaleCount.toString(), totalAnimals > 0 ? ((femaleCount / totalAnimals) * 100).toFixed(1) + '%' : '0%'],
      ['Active', activeCount.toString(), totalAnimals > 0 ? ((activeCount / totalAnimals) * 100).toFixed(1) + '%' : '0%']
    ];

    yPosition = addTable(['Category', 'Count', 'Percentage'], overallStats.slice(1), yPosition);

    // Category-wise Breakdown
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CATEGORY-WISE BREAKDOWN', margin, yPosition);
    yPosition += 10;

    const categories = ['Milking Cow', 'Dry Cow', 'Pregnant Heifer', 'Non-Pregnant Heifer', 'Female Calf (<3m)', 'Female Calf (3-12m)', 'Male Calf (<12m)', 'Bull'];
    const categoryData = categories.map(category => {
      const count = animals.filter(animal => animal.category === category).length;
      return [
        category,
        count.toString(),
        totalAnimals > 0 ? ((count / totalAnimals) * 100).toFixed(1) + '%' : '0%'
      ];
    });

    yPosition = addTable(['Category', 'Count', 'Percentage'], categoryData, yPosition);

    // Farm-wise Animal Distribution
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FARM-WISE ANIMAL DISTRIBUTION', margin, yPosition);
    yPosition += 10;

    const farmDistributionData = farms.map(farm => {
      const farmAnimals = animals.filter(animal => animal.farm_id === farm._id);
      const cattleCount = farmAnimals.filter(animal => animal.animal_type === 'Cattle').length;
      const buffaloCount = farmAnimals.filter(animal => animal.animal_type === 'Buffalo').length;
      
      return [
        farm.farm_name || 'N/A',
        farmAnimals.length.toString(),
        cattleCount.toString(),
        buffaloCount.toString()
      ];
    });

    yPosition = addTable(['Farm Name', 'Total Animals', 'Cattle', 'Buffalo'], farmDistributionData, yPosition);

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This report is generated by the Cattle Care Management System', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('Livestock Development Institute - Government of Sri Lanka', pageWidth / 2, pageHeight - 10, { align: 'center' });

    const fileName = `Livestock_Census_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const generateValidationSummaryReport = async (data) => {
    const { farms, milkData } = data;
    
    console.log('Generating validation summary report with data:', { farms, milkData });
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper functions (same as above)
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

    const addTable = (headers, data, startY) => {
      let y = startY;
      const colWidth = contentWidth / headers.length;
      const rowHeight = 8;

      pdf.setFillColor(243, 244, 246);
      pdf.rect(margin, y, contentWidth, rowHeight, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, margin + (index * colWidth) + 2, y + 6);
      });
      y += rowHeight;

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

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VALIDATION SUMMARY REPORT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Government of Sri Lanka - Livestock Development Institute', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Validation Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MONTHLY REPORTS VALIDATION SUMMARY', margin, yPosition);
    yPosition += 10;

    const totalReports = milkData.length;
    const validatedReports = milkData.filter(record => record.validation_date).length;
    const pendingReports = totalReports - validatedReports;
    const totalMilkProduction = milkData.reduce((sum, record) => sum + (record.total_milk_production || 0), 0);

    const validationStats = [
      ['Metric', 'Count'],
      ['Total Reports Submitted', totalReports.toString()],
      ['Reports Validated', validatedReports.toString()],
      ['Reports Pending', pendingReports.toString()],
      ['Total Milk Production', `${totalMilkProduction.toLocaleString()} Liters`]
    ];

    yPosition = addTable(['Metric', 'Count'], validationStats.slice(1), yPosition);

    // Farm-wise Validation Status
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FARM-WISE VALIDATION STATUS', margin, yPosition);
    yPosition += 10;

    const farmValidationData = farms.map(farm => {
      const farmReports = milkData.filter(record => record.farm_id === farm._id);
      const validatedCount = farmReports.filter(record => record.validation_date).length;
      const totalMilk = farmReports.reduce((sum, record) => sum + (record.total_milk_production || 0), 0);
      
      return [
        farm.farm_name || 'N/A',
        farmReports.length.toString(),
        validatedCount.toString(),
        `${totalMilk.toLocaleString()} L`
      ];
    });

    yPosition = addTable(['Farm Name', 'Reports Submitted', 'Validated', 'Total Milk'], farmValidationData, yPosition);

    // Recent Validations
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECENT VALIDATIONS', margin, yPosition);
    yPosition += 10;

    const recentValidations = milkData
      .filter(record => record.validation_date)
      .sort((a, b) => new Date(b.validation_date) - new Date(a.validation_date))
      .slice(0, 10);

    const recentValidationData = recentValidations.map(record => {
      const farm = farms.find(f => f._id === record.farm_id);
      return [
        farm?.farm_name || 'N/A',
        record.report_month ? new Date(record.report_month).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A',
        `${record.total_milk_production || 0} L`,
        record.validation_date ? new Date(record.validation_date).toLocaleDateString() : 'N/A'
      ];
    });

    yPosition = addTable(['Farm', 'Report Month', 'Milk Production', 'Validation Date'], recentValidationData, yPosition);

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This report is generated by the Cattle Care Management System', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('Livestock Development Institute - Government of Sri Lanka', pageWidth / 2, pageHeight - 10, { align: 'center' });

    const fileName = `Validation_Summary_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Generating...
        </>
      ) : (
        <>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Generate Report
        </>
      )}
    </button>
  );
} 