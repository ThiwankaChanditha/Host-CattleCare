/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
    FileText,
    BarChart3,
    Calendar,
    Users,
    MapPin,
    Heart,
    TrendingUpIcon,
    FileTextIcon,
    CalendarIcon,
    FilterIcon,
    Pill,
    Download as FilePdf,
    FileSpreadsheetIcon,
    RefreshCwIcon,
    User,
    Building,
    Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastNotification';
import axios from 'axios';
import MedicalHistoryModal from './components/MedicalHistoryModal';
import DiseaseChartsModal from '../../components/DiseaseChartsModal';

const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '', fullWidth = false }) => {
    const baseClasses = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500',
        secondary: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md focus:ring-gray-500',
        success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500',
        export: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500'
    };
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${widthClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
};

const Card = ({ title, children, className = '', icon: IconComponent }) => (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
                {IconComponent && <IconComponent className="h-6 w-6 text-gray-600 mr-3" />}
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const StatCard = ({ title, value, icon: IconComponent, color = 'blue', trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value || 0}</p>
                {trend && (
                    <div className="flex items-center mt-2">
                        <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">{trend}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-full bg-gradient-to-br from-${color}-100 to-${color}-200`}>
                <IconComponent className={`h-8 w-8 text-${color}-600`} />
            </div>
        </div>
    </div>
);

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const { token, user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const [vsId, setVsId] = useState(null);
    const [farmers, setFarmers] = useState([]);
    const [summary, setSummary] = useState({});
    const [selectedFarmer, setSelectedFarmer] = useState('');
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('');
    const [animals, setAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState('');
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [farmerDetails, setFarmerDetails] = useState(null);
    const [farmDetails, setFarmDetails] = useState(null);
    const [animalDetails, setAnimalDetails] = useState(null);
    const [isMedicalHistoryModalOpen, setIsMedicalHistoryModalOpen] = useState(false);
    const [isDiseaseChartsModalOpen, setIsDiseaseChartsModalOpen] = useState(false);
    const [comprehensiveReportData, setComprehensiveReportData] = useState(null);
    const [isGeneratingFullReport, setIsGeneratingFullReport] = useState(false);
    const [diseaseReportData, setDiseaseReportData] = useState(null);
    const [isGeneratingDiseaseReport, setIsGeneratingDiseaseReport] = useState(false);

    const api = axios.create({
        baseURL: '/api/vs/reports',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    useEffect(() => {
        if (token) {
            api.defaults.headers['Authorization'] = `Bearer ${token}`;
        }
    }, [token]);

    useEffect(() => {
        if (authUser && authUser.id) {
            setVsId(authUser.id);
        }
    }, [authUser]);

    const handleFarmerChange = (e) => {
        const farmerId = e.target.value;
        setSelectedFarmer(farmerId);
        setSelectedFarm('');
        setAnimals([]);
        setSelectedAnimal('');
        setMedicalHistory([]);
        setFarmDetails(null);
        setAnimalDetails(null);

        if (farmerId) {
            const farmer = farmers.find(f => f._id === farmerId);
            setFarmerDetails(farmer);
        } else {
            setFarmerDetails(null);
        }
    };

    const handleFarmChange = (e) => {
        const farmId = e.target.value;
        setSelectedFarm(farmId);
        setSelectedAnimal('');
        setMedicalHistory([]);
        setAnimalDetails(null);

        if (farmId) {
            const farm = farms.find(f => f._id === farmId);
            setFarmDetails(farm);
        } else {
            setFarmDetails(null);
        }
    };

    const handleAnimalChange = (e) => {
        const animalId = e.target.value;
        setSelectedAnimal(animalId);
        if (animalId) {
            const animal = animals.find(a => a._id === animalId);
            setAnimalDetails(animal);
        } else {
            setAnimalDetails(null);
        }
    };

    const getFarmerName = (farmerId) => {
        const farmer = farmers.find(f => f._id === farmerId);
        return farmer ? farmer.full_name : 'N/A';
    };

    const getFarmName = (farmId) => {
        const farm = farms.find(f => f._id === farmId);
        return farm ? (farm.farm_name || 'N/A') : 'N/A';
    };

    const getAnimalName = (animalId) => {
        const animal = animals.find(a => a._id === animalId);
        return animal ? (animal.animal_tag || animal.tag_number || 'N/A') : 'N/A';
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error("Error formatting date:", isoString, error);
            return 'Invalid Date';
        }
    };


    const getDisplayValue = (key, record) => {
        let value = record[key];

        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }

        if (key.toLowerCase().includes('animalhealthrecordid') ||
            key.toLowerCase().includes('animal_health_record_id') ||
            key.toLowerCase().includes('healthrecordid') ||
            key.toLowerCase().includes('recordid')) {
            if (typeof value === 'string' && value.length >= 5) {
                return `M-${value.slice(-5)}`;
            }
            return `M-${String(value).slice(-5)}`;
        }

        if (key.includes('date') && typeof value === 'string') {
            return formatDate(value);
        }

        if (key.toLowerCase().includes('medication')) {
            if (Array.isArray(value)) {
                return value.map(med => {
                    if (typeof med === 'object' && med !== null) {
                        const parts = [];
                        if (med.medication_name || med.name) parts.push(med.medication_name || med.name);
                        if (med.dosage) parts.push(`${med.dosage}`);
                        if (med.frequency) parts.push(`${med.frequency}`);
                        if (med.administration_method) parts.push(`${med.administration_method}`);
                        if (med.start_date) parts.push(`Start: ${formatDate(med.start_date)}`);
                        if (med.end_date) parts.push(`End: ${formatDate(med.end_date)}`);
                        if (med.notes) parts.push(`Notes: ${med.notes}`);
                        return parts.length > 0 ? parts.join(' - ') : 'Medication';
                    }
                    return String(med);
                }).join('; ') || 'N/A';
            }

            if (typeof value === 'string') {
                if (value.startsWith('[') || value.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(value);
                        if (Array.isArray(parsed)) {
                            return parsed.map(med => {
                                if (typeof med === 'object' && med !== null) {
                                    const parts = [];
                                    if (med.medication_name || med.name) parts.push(med.medication_name || med.name);
                                    if (med.dosage) parts.push(`${med.dosage}`);
                                    if (med.frequency) parts.push(`${med.frequency}`);
                                    if (med.administration_method) parts.push(`${med.administration_method}`);
                                    if (med.start_date) parts.push(`Start: ${formatDate(med.start_date)}`);
                                    if (med.end_date) parts.push(`End: ${formatDate(med.end_date)}`);
                                    if (med.notes) parts.push(`Notes: ${med.notes}`);
                                    return parts.length > 0 ? parts.join(' - ') : 'Medication';
                                }
                                return String(med);
                            }).join('; ') || 'N/A';
                        } else if (typeof parsed === 'object' && parsed !== null) {
                            const parts = [];
                            if (parsed.medication_name || parsed.name) parts.push(parsed.medication_name || parsed.name);
                            if (parsed.dosage) parts.push(`${parsed.dosage}`);
                            if (parsed.frequency) parts.push(`${parsed.frequency}`);
                            if (parsed.administration_method) parts.push(`${parsed.administration_method}`);
                            if (parsed.start_date) parts.push(`Start: ${formatDate(parsed.start_date)}`);
                            if (parsed.end_date) parts.push(`End: ${formatDate(parsed.end_date)}`);
                            if (parsed.notes) parts.push(`Notes: ${parsed.notes}`);
                            return parts.length > 0 ? parts.join(' - ') : 'Medication';
                        }
                    } catch (e) {
                        console.log('Failed to parse medication JSON:', e);
                    }
                }

                if (value.includes('[object Object]')) {
                    return 'Medication data available';
                }

                return value;
            }

            if (typeof value === 'object' && value !== null) {
                const parts = [];
                if (value.medication_name || value.name) parts.push(value.medication_name || value.name);
                if (value.dosage) parts.push(`${value.dosage}`);
                if (value.frequency) parts.push(`${value.frequency}`);
                if (value.administration_method) parts.push(`${value.administration_method}`);
                if (value.start_date) parts.push(`Start: ${formatDate(value.start_date)}`);
                if (value.end_date) parts.push(`End: ${formatDate(value.end_date)}`);
                if (value.notes) parts.push(`Notes: ${value.notes}`);
                return parts.length > 0 ? parts.join(' - ') : 'Medication';
            }
        }

        if (key.toLowerCase().includes('vitals') && typeof value === 'object' && value !== null) {
            return Object.entries(value).map(([vk, vv]) => `${vk}: ${vv}`).join(', ');
        }

        if (key === 'farmer_id') return getFarmerName(value);
        if (key === 'farm_id') return getFarmName(value);
        if (key === 'animal_id') return getAnimalName(value);

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        return String(value);
    };

    const exportToCSV = () => {
        if (!medicalHistory.length) {
            showWarning('No medical history data to export');
            return;
        }

        const dataToExport = medicalHistory.map(record => {
            const newRecord = {};
            Object.keys(record).forEach(key => {
                newRecord[key.replace(/_/g, ' ')] = getDisplayValue(key, record);
            });
            return newRecord;
        });

        const headers = Object.keys(dataToExport[0]);
        const csvRows = [
            headers.join(','),
            ...dataToExport.map(row => headers.map(field => JSON.stringify(row[field] || '')).join(','))
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const filename = `medical_history_${timestamp}.csv`;

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('CSV exported successfully');
    };

    const exportToExcel = () => {
        if (!medicalHistory.length) {
            showWarning('No medical history data to export');
            return;
        }

        const dataToExport = medicalHistory.map(record => {
            const newRecord = {};
            Object.keys(record).forEach(key => {
                newRecord[key.replace(/_/g, ' ')] = getDisplayValue(key, record);
            });
            return newRecord;
        });

        const headers = Object.keys(dataToExport[0]);
        const csvRows = [
            headers.join('\t'),
            ...dataToExport.map(row => headers.map(field => String(row[field] || '').replace(/\n/g, '\\n').replace(/\t/g, ' ').replace(/"/g, '""')).join('\t'))
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const filename = `medical_history_${timestamp}.xls`;

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('Excel file exported successfully');
    };

    const exportToPDF = async () => {
        if (!medicalHistory?.length) {
            showWarning('No medical history data to export');
            return;
        }

        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF('landscape', 'mm', 'a4');
            const TITLE = 'Medical History Report';
            const GENERATED_ON = `Generated on: ${new Date().toLocaleDateString()}`;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(33, 37, 41);
            doc.text(TITLE, 20, 25);

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(85, 85, 85);
            doc.text(GENERATED_ON, 20, 35);

            let contextY = 45;
            const addContextInfo = (label, value) => {
                if (value) {
                    doc.text(`${label}: ${value}`, 20, contextY);
                    contextY += 10;
                }
            };

            addContextInfo('Animal', animalDetails?.animal_tag || animalDetails?.tag_number || 'N/A');
            addContextInfo('Farm', farmDetails?.farm_name || 'N/A');
            addContextInfo('Farmer', farmerDetails?.full_name || 'N/A');

            const hiddenColumns = ['_id', 'farmer_id', 'farm_id', 'animal_id', '__v'];

            const getVisibleColumns = (record) =>
                Object.keys(record).filter((key) => !hiddenColumns.includes(key));

            const visibleColumns = getVisibleColumns(medicalHistory[0]);

            const headers = visibleColumns.map((key) => {
                const formatted = key.replace(/_/g, ' ').toUpperCase();
                if (formatted.length > 15) {
                    return formatted.replace(/\s+/g, '\n');
                }
                return formatted;
            });

            const tableData = medicalHistory.map((record) =>
                visibleColumns.map((key) => formatCellValue(record[key], key))
            );

            function formatCellValue(value, key) {
                if (!value) return 'N/A';

                if (typeof value === 'object') {
                    if (Array.isArray(value)) {
                        return value.map(item => {
                            if (typeof item === 'object') {
                                return formatObjectForDisplay(item, key);
                            }
                            return item;
                        }).join(', ');
                    }

                    return formatObjectForDisplay(value, key);
                }

                if (typeof value === 'string') {
                    return value;
                }

                return String(value);
            }

            function formatObjectForDisplay(obj, key) {
                if (!obj || typeof obj !== 'object') return 'N/A';

                if (key && key.toLowerCase().includes('medication')) {
                    const parts = [];

                    if (obj.name || obj.medication_name) {
                        parts.push(`Name: ${obj.name || obj.medication_name}`);
                    }
                    if (obj.dosage) {
                        parts.push(`Dosage: ${obj.dosage}`);
                    }
                    if (obj.frequency) {
                        parts.push(`Frequency: ${obj.frequency}`);
                    }
                    if (obj.duration) {
                        parts.push(`Duration: ${obj.duration}`);
                    }
                    if (obj.instructions || obj.notes) {
                        parts.push(`Instructions: ${obj.instructions || obj.notes}`);
                    }
                    if (obj.route) {
                        parts.push(`Route: ${obj.route}`);
                    }
                    if (obj.batch_number) {
                        parts.push(`Batch: ${obj.batch_number}`);
                    }

                    return parts.length > 0 ? parts.join('\n') : 'N/A';
                }

                if (key && key.toLowerCase().includes('treatment')) {
                    const parts = [];

                    if (obj.treatment_type || obj.type) {
                        parts.push(`Type: ${obj.treatment_type || obj.type}`);
                    }
                    if (obj.description) {
                        parts.push(`Description: ${obj.description}`);
                    }
                    if (obj.date || obj.treatment_date) {
                        parts.push(`Date: ${new Date(obj.date || obj.treatment_date).toLocaleDateString()}`);
                    }
                    if (obj.status) {
                        parts.push(`Status: ${obj.status}`);
                    }

                    return parts.length > 0 ? parts.join('\n') : 'N/A';
                }

                if (key && key.toLowerCase().includes('vitals')) {
                    const parts = [];

                    if (obj.temperature) {
                        parts.push(`Temp: ${obj.temperature}°`);
                    }
                    if (obj.pulse || obj.heart_rate) {
                        parts.push(`Pulse: ${obj.pulse || obj.heart_rate}`);
                    }
                    if (obj.respiratory_rate) {
                        parts.push(`Resp: ${obj.respiratory_rate}`);
                    }
                    if (obj.blood_pressure) {
                        parts.push(`BP: ${obj.blood_pressure}`);
                    }
                    if (obj.weight) {
                        parts.push(`Weight: ${obj.weight}`);
                    }

                    return parts.length > 0 ? parts.join('\n') : 'N/A';
                }

                if (key && key.toLowerCase().includes('cost')) {
                    const parts = [];

                    if (obj.amount || obj.total) {
                        parts.push(`Amount: ${obj.currency || ''}${obj.amount || obj.total}`);
                    }
                    if (obj.medication_cost) {
                        parts.push(`Medication: ${obj.currency || ''}${obj.medication_cost}`);
                    }
                    if (obj.consultation_cost) {
                        parts.push(`Consultation: ${obj.currency || ''}${obj.consultation_cost}`);
                    }
                    if (obj.treatment_cost) {
                        parts.push(`Treatment: ${obj.currency || ''}${obj.treatment_cost}`);
                    }

                    return parts.length > 0 ? parts.join('\n') : 'N/A';
                }

                const parts = [];
                Object.entries(obj).forEach(([objKey, objValue]) => {
                    if (objKey === '_id' || objKey === '__v') return;

                    const formattedKey = objKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    let formattedValue = objValue;

                    if (objValue instanceof Date) {
                        formattedValue = objValue.toLocaleDateString();
                    } else if (typeof objValue === 'object') {
                        formattedValue = JSON.stringify(objValue);
                    }

                    parts.push(`${formattedKey}: ${formattedValue}`);
                });

                return parts.length > 0 ? parts.join('\n') : 'N/A';
            }

            autoTable(doc, {
                head: [headers],
                body: tableData,
                startY: contextY + 10,
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 8,
                    cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
                    overflow: 'linebreak',
                    lineWidth: 0.1,
                    lineColor: [200, 200, 200]
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 9,
                    cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
                    minCellHeight: 10
                },
                bodyStyles: {
                    fontSize: 8,
                    cellPadding: { top: 2, right: 2, bottom: 2, left: 2 }
                },
                alternateRowStyles: {
                    fillColor: [248, 249, 250]
                },
                columnStyles: visibleColumns.reduce((styles, key, index) => {
                    styles[index] = {
                        cellWidth: 'auto',
                        overflow: 'linebreak',
                        minCellWidth: 15,
                        ...(key.includes('medication') && {
                            cellWidth: 'auto',
                            minCellWidth: 25
                        }),
                        ...(key.includes('date') && {
                            cellWidth: 'auto',
                            minCellWidth: 20
                        })
                    };
                    return styles;
                }, {}),
                margin: { top: 20, left: 20, right: 20, bottom: 20 },
                tableWidth: 'auto',
                showHead: 'everyPage',
                didDrawPage: (data) => {
                    const pageCount = doc.internal.getNumberOfPages();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const pageWidth = doc.internal.pageSize.getWidth();

                    doc.setFontSize(9);
                    doc.setTextColor(128, 128, 128);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount}`,
                        20,
                        pageHeight - 10
                    );

                    doc.text(
                        new Date().toLocaleString(),
                        pageWidth - 60,
                        pageHeight - 10
                    );
                },
                didParseCell: (data) => {
                    if (data.row.index >= 0) {
                        data.cell.styles.minCellHeight = 8;
                    }
                }
            });

            doc.save('medical_history_report.pdf');
            showSuccess('PDF exported successfully');

        } catch (error) {
            console.error('PDF Export Error:', error);
            showError('Failed to generate PDF. Please try again.');
        }
    };

    const fetchComprehensiveReport = async () => {
        if (!vsId || !token) {
            showWarning('Please ensure you are logged in');
            return;
        }

        setIsGeneratingFullReport(true);
        try {
            const response = await api.get(`/comprehensive/${vsId}`);
            console.log('Comprehensive report response:', response.data);
            setComprehensiveReportData(response.data);
            showSuccess('Full area report generated successfully');
        } catch (error) {
            console.error('Error fetching comprehensive report:', error);
            showError('Failed to generate full area report');
        } finally {
            setIsGeneratingFullReport(false);
        }
    };

    const exportComprehensiveReportToCSV = async () => {
        if (!comprehensiveReportData) {
            showWarning('No comprehensive report data available');
            return;
        }

        try {
            const { farmers, farms, animals } = comprehensiveReportData;

            let csvContent = 'Farmers Report\n';
            csvContent += 'Farmer Name,Email,Contact Number,Farms Count,Animals Count,NIC,Address,Registration Date\n';

            // Calculate farm and animal counts per farmer
            const farmersWithCounts = farmers.map(farmer => {
                const farmerFarms = farms.filter(farm => farm.farmer_id === farmer._id);
                const farmerFarmIds = farmerFarms.map(farm => farm._id);
                const farmerAnimals = animals.filter(animal => farmerFarmIds.includes(animal.farm_id));
                return {
                    ...farmer,
                    farmCount: farmerFarms.length,
                    animalCount: farmerAnimals.length
                };
            });

            farmersWithCounts.forEach(farmer => {
                const user = farmer.user_id || {};
                csvContent += `"${user.full_name || ''}","${user.email || ''}","${user.contact_number || ''}",${farmer.farmCount},${farmer.animalCount},"${user.nic || ''}","${user.address || ''}","${formatDate(user.created_at) || ''}"\n`;
            });

            csvContent += '\nFarms Report\n';
            csvContent += 'Farm Name,Farmer Name,Location,Farm Type,Registration Date,Animals Count\n';

            farms.forEach(farm => {
                const farmer = farmers.find(f => f._id === farm.farmer_id);
                const farmerUser = farmer ? farmer.user_id || {} : {};
                const farmAnimals = animals.filter(animal => animal.farm_id === farm._id);
                csvContent += `"${farm.farm_name || ''}","${farmerUser.full_name || ''}","${farm.location_address || ''}","${farm.farm_type || ''}","${formatDate(farm.registration_date) || ''}",${farmAnimals.length}\n`;
            });

            csvContent += '\nAnimals Report\n';
            csvContent += 'Animal Tag,Species,Category,Gender,Date of Birth,Age,Farm Name,Status\n';

            animals.forEach(animal => {
                const farm = farms.find(f => f._id === animal.farm_id);
                const birthDate = formatDate(animal.birth_date);
                const age = animal.birth_date
                    ? Math.floor((new Date() - new Date(animal.birth_date)) / (365.25 * 24 * 60 * 60 * 1000))
                    : 'N/A';
                csvContent += `"${animal.animal_tag || animal.tag_number || ''}","${animal.animal_type || ''}","${animal.category || ''}","${animal.gender || ''}","${birthDate}","${age}","${farm ? farm.farm_name : ''}","${animal.current_status || ''}"\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'full_area_report.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showSuccess('Full area CSV report exported successfully');
        } catch (error) {
            console.error('Error exporting comprehensive report to CSV:', error);
            showError('Failed to export full area CSV report');
        }
    };

    const exportComprehensiveReportToExcel = async () => {
        if (!comprehensiveReportData) {
            showWarning('No comprehensive report data available');
            return;
        }

        try {
            const { farmers, farms, animals } = comprehensiveReportData;
            let excelContent = 'Farmers Report\n';
            excelContent += 'Farmer Name\tEmail\tContact Number\tFarms Count\tAnimals Count\tNIC\tAddress\tRegistration Date\n';

            // Calculate farm and animal counts per farmer
            const farmersWithCounts = farmers.map(farmer => {
                const farmerFarms = farms.filter(farm => farm.farmer_id === farmer._id);
                const farmerFarmIds = farmerFarms.map(farm => farm._id);
                const farmerAnimals = animals.filter(animal => farmerFarmIds.includes(animal.farm_id));
                return {
                    ...farmer,
                    farmCount: farmerFarms.length,
                    animalCount: farmerAnimals.length
                };
            });

            farmersWithCounts.forEach(farmer => {
                const user = farmer.user_id || {};
                excelContent += `"${user.full_name || ''}"\t"${user.email || ''}"\t"${user.contact_number || ''}"\t${farmer.farmCount}\t${farmer.animalCount}\t"${user.nic || ''}"\t"${user.address || ''}"\t"${formatDate(user.created_at) || ''}"\n`;
            });

            excelContent += '\nFarms Report\n';
            excelContent += 'Farm Name\tFarmer Name\tLocation\tFarm Type\tRegistration Date\tAnimals Count\n';

            farms.forEach(farm => {
                const farmer = farmers.find(f => f._id === farm.farmer_id);
                const farmerUser = farmer ? farmer.user_id || {} : {};
                // Calculate animal count for this farm
                const farmAnimals = animals.filter(animal => animal.farm_id === farm._id);
                excelContent += `"${farm.farm_name || ''}"\t"${farmerUser.full_name || ''}"\t"${farm.location_address || ''}"\t"${farm.farm_type || ''}"\t"${formatDate(farm.registration_date) || ''}"\t${farmAnimals.length}\n`;
            });


            excelContent += '\nAnimals Report\n';
            excelContent += 'Animal Tag\tSpecies\tCategory\tGender\tDate of Birth\tAge\tFarm Name\tStatus\n';

            animals.forEach(animal => {
                const farm = farms.find(f => f._id === animal.farm_id);
                const birthDate = formatDate(animal.birth_date);
                const age = animal.birth_date
                    ? Math.floor((new Date() - new Date(animal.birth_date)) / (365.25 * 24 * 60 * 60 * 1000))
                    : 'N/A';
                excelContent += `"${animal.animal_tag || animal.tag_number || ''}"\t"${animal.animal_type || ''}"\t"${animal.category || ''}"\t"${animal.gender || ''}"\t"${birthDate}"\t"${age}"\t"${farm ? farm.farm_name : ''}"\t"${animal.current_status || ''}"\n`;
            });

            const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'full_area_report.xls');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showSuccess('Full area Excel report exported successfully');
        } catch (error) {
            console.error('Error exporting comprehensive report to Excel:', error);
            showError('Failed to export full area Excel report');
        }
    };

    const exportComprehensiveReportToPDF = async () => {
        if (!comprehensiveReportData) {
            showWarning('No comprehensive report data available');
            return;
        }

        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            // Create a new PDF document
            const doc = new jsPDF('landscape', 'mm', 'a4');
            const TITLE = 'Full Area Report';
            const GENERATED_ON = `Generated on: ${new Date().toLocaleDateString()}`;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(33, 37, 41);
            doc.text(TITLE, 20, 25);

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(85, 85, 85);
            doc.text(GENERATED_ON, 20, 35);

            let startY = 45;

            // Add Farmers Table
            const { farmers, farms, animals } = comprehensiveReportData;

            if (farmers && farmers.length > 0) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Farmers Report', 20, startY);

                const farmerHeaders = [
                    'Farmer Name', 'Email', 'Contact', 'Farms', 'Animals', 'NIC', 'Address', 'Registration Date'
                ];

                // Calculate farm and animal counts per farmer
                const farmersWithCounts = farmers.map(farmer => {
                    const farmerFarms = farms.filter(farm => farm.farmer_id === farmer._id);
                    const farmerFarmIds = farmerFarms.map(farm => farm._id);
                    const farmerAnimals = animals.filter(animal => farmerFarmIds.includes(animal.farm_id));
                    return {
                        ...farmer,
                        farmCount: farmerFarms.length,
                        animalCount: farmerAnimals.length
                    };
                });

                const farmerData = farmersWithCounts.map(farmer => {
                    const user = farmer.user_id || {};
                    return [
                        user.full_name || '',
                        user.email || '',
                        user.contact_number || '',
                        farmer.farmCount || 0,
                        farmer.animalCount || 0,
                        user.nic || '',
                        user.address || '',
                        formatDate(user.created_at) || ''
                    ];
                });

                autoTable(doc, {
                    head: [farmerHeaders],
                    body: farmerData,
                    startY: startY + 10,
                    theme: 'grid',
                    styles: {
                        font: 'helvetica',
                        fontSize: 8,
                        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
                        overflow: 'linebreak',
                        lineWidth: 0.1,
                        lineColor: [200, 200, 200]
                    },
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 9,
                        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
                        minCellHeight: 10
                    },
                    bodyStyles: {
                        fontSize: 8,
                        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 }
                    },
                    alternateRowStyles: {
                        fillColor: [248, 249, 250]
                    },
                    margin: { top: 20, left: 20, right: 20, bottom: 20 },
                    tableWidth: 'auto',
                    showHead: 'everyPage',
                    didDrawPage: (data) => {
                        const pageCount = doc.internal.getNumberOfPages();
                        const pageHeight = doc.internal.pageSize.getHeight();

                        doc.setFontSize(9);
                        doc.setTextColor(128, 128, 128);
                        doc.text(
                            `Page ${data.pageNumber} of ${pageCount}`,
                            20,
                            pageHeight - 10
                        );
                    }
                });

                startY = doc.lastAutoTable.finalY + 10;
            }

            // Add Farms Table
            if (farms && farms.length > 0) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Farms Report', 20, startY);

                const farmHeaders = [
                    'Farm Name', 'Farmer Name', 'Location', 'Farm Type', 'Registration Date', 'Animals Count'
                ];

                const farmData = farms.map(farm => {
                    const farmer = farmers.find(f => f._id === farm.farmer_id);
                    const farmerUser = farmer ? farmer.user_id || {} : {};
                    const farmAnimals = animals.filter(animal => animal.farm_id === farm._id);
                    return [
                        farm.farm_name || '',
                        farmerUser.full_name || '',
                        farm.location_address || '',
                        farm.farm_type || '',
                        formatDate(farm.registration_date) || '',
                        farmAnimals.length
                    ];
                });

                autoTable(doc, {
                    head: [farmHeaders],
                    body: farmData,
                    startY: startY + 10,
                    theme: 'grid',
                    styles: {
                        font: 'helvetica',
                        fontSize: 8,
                        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
                        overflow: 'linebreak',
                        lineWidth: 0.1,
                        lineColor: [200, 200, 200]
                    },
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 9,
                        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
                        minCellHeight: 10
                    },
                    bodyStyles: {
                        fontSize: 8,
                        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 }
                    },
                    alternateRowStyles: {
                        fillColor: [248, 249, 250]
                    },
                    margin: { top: 20, left: 20, right: 20, bottom: 20 },
                    tableWidth: 'auto',
                    showHead: 'everyPage'
                });

                startY = doc.lastAutoTable.finalY + 10;
            }

            // Add Animals Table
            if (animals && animals.length > 0) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Animals Report', 20, startY);

                const animalHeaders = [
                    'Animal Tag', 'Species', 'Category', 'Gender', 'Date of Birth', 'Age', 'Farm Name', 'Status'
                ];

                const animalData = animals.map(animal => {
                    const farm = farms.find(f => f._id === animal.farm_id);
                    const age = animal.birth_date
                        ? Math.floor((new Date() - new Date(animal.birth_date)) / (365.25 * 24 * 60 * 60 * 1000))
                        : 'N/A';
                    return [
                        animal.animal_tag || animal.tag_number || '',
                        animal.animal_type || '',
                        animal.category || '',
                        animal.gender || '',
                        formatDate(animal.birth_date) || '',
                        age,
                        farm ? farm.farm_name : '',
                        animal.current_status || ''
                    ];
                });

                autoTable(doc, {
                    head: [animalHeaders],
                    body: animalData,
                    startY: startY + 10,
                    theme: 'grid',
                    styles: {
                        font: 'helvetica',
                        fontSize: 8,
                        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
                        overflow: 'linebreak',
                        lineWidth: 0.1,
                        lineColor: [200, 200, 200]
                    },
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 9,
                        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
                        minCellHeight: 10
                    },
                    bodyStyles: {
                        fontSize: 8,
                        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 }
                    },
                    alternateRowStyles: {
                        fillColor: [248, 249, 250]
                    },
                    margin: { top: 20, left: 20, right: 20, bottom: 20 },
                    tableWidth: 'auto',
                    showHead: 'everyPage'
                });
            }

            doc.save('full_area_report.pdf');
            showSuccess('Full area PDF report exported successfully');
        } catch (error) {
            console.error('PDF Export Error:', error);
            showError('Failed to generate full area PDF report. Please try again.');
        }
    };

    const resetFilters = () => {
        setSelectedFarmer('');
        setSelectedFarm('');
        setSelectedAnimal('');
        setMedicalHistory([]);
        setFarmerDetails(null);
        setFarmDetails(null);
        setAnimalDetails(null);
    };

    const fetchDiseaseReport = async () => {
        if (!vsId || !token) {
            showWarning('Please ensure you are logged in');
            return;
        }

        setIsGeneratingDiseaseReport(true);
        try {
            const response = await api.get(`/disease-report/${vsId}`);
            console.log('Disease report response:', response.data);
            setDiseaseReportData(response.data);
            showSuccess('Disease report generated successfully');
        } catch (error) {
            console.error('Error fetching disease report:', error);
            showError('Failed to generate disease report');
        } finally {
            setIsGeneratingDiseaseReport(false);
        }
    };

    const exportDiseaseReportToCSV = async () => {
        if (!diseaseReportData) {
            showWarning('No disease report data available');
            return;
        }

        try {
            let csvContent = 'Disease Summary Report\n';
            csvContent += 'Disease,Count,Total Cost,Recovery Rate,Ongoing,Critical,Healthy,Deceased\n';

            diseaseReportData.diseaseSummary.forEach(item => {
                const recoveryRate = item.count > 0 ? ((item.recoveryStatus.Healthy || 0) / item.count * 100).toFixed(1) : 0;
                csvContent += `"${item.disease}",${item.count},${item.totalCost || 0},${recoveryRate}%,${item.recoveryStatus.Ongoing || 0},${item.recoveryStatus.Critical || 0},${item.recoveryStatus.Healthy || 0},${item.recoveryStatus.Deceased || 0}\n`;
            });

            csvContent += '\nMonthly Disease Trends\n';
            csvContent += 'Month,Disease,Count\n';

            diseaseReportData.diseaseTrends.forEach(trend => {
                Object.entries(trend).forEach(([key, value]) => {
                    if (key !== 'month') {
                        csvContent += `"${trend.month}","${key}",${value}\n`;
                    }
                });
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'disease_report.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showSuccess('Disease CSV report exported successfully');
        } catch (error) {
            console.error('Error exporting disease report to CSV:', error);
            showError('Failed to export disease CSV report');
        }
    };

    const exportDiseaseReportToExcel = async () => {
        if (!diseaseReportData) {
            showWarning('No disease report data available');
            return;
        }

        try {
            let excelContent = 'Disease Summary Report\n';
            excelContent += 'Disease\tCount\tTotal Cost\tRecovery Rate\tOngoing\tCritical\tHealthy\tDeceased\n';

            diseaseReportData.diseaseSummary.forEach(item => {
                const recoveryRate = item.count > 0 ? ((item.recoveryStatus.Healthy || 0) / item.count * 100).toFixed(1) : 0;
                excelContent += `"${item.disease}"\t${item.count}\t${item.totalCost || 0}\t${recoveryRate}%\t${item.recoveryStatus.Ongoing || 0}\t${item.recoveryStatus.Critical || 0}\t${item.recoveryStatus.Healthy || 0}\t${item.recoveryStatus.Deceased || 0}\n`;
            });

            excelContent += '\nMonthly Disease Trends\n';
            excelContent += 'Month\tDisease\tCount\n';

            diseaseReportData.diseaseTrends.forEach(trend => {
                Object.entries(trend).forEach(([key, value]) => {
                    if (key !== 'month') {
                        excelContent += `"${trend.month}"\t"${key}"\t${value}\n`;
                    }
                });
            });

            const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'disease_report.xls');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showSuccess('Disease Excel report exported successfully');
        } catch (error) {
            console.error('Error exporting disease report to Excel:', error);
            showError('Failed to export disease Excel report');
        }
    };

    const exportDiseaseReportToPDF = async () => {
        if (!diseaseReportData) {
            showWarning('No disease report data available');
            return;
        }

        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF('landscape', 'mm', 'a4');
            const TITLE = 'Disease Analysis Report';
            const GENERATED_ON = `Generated on: ${new Date().toLocaleDateString()}`;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(33, 37, 41);
            doc.text(TITLE, 20, 25);

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(85, 85, 85);
            doc.text(GENERATED_ON, 20, 35);

            let startY = 45;

            // Summary Statistics
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Summary Statistics', 20, startY);

            const summaryData = [
                ['Total Cases', diseaseReportData.summary?.totalCases || 0],
                ['Active Cases', diseaseReportData.summary?.activeCases || 0],
                ['Recovered Cases', diseaseReportData.summary?.recoveredCases || 0],
                ['Critical Cases', diseaseReportData.summary?.criticalCases || 0],
                ['Deceased Cases', diseaseReportData.summary?.deceasedCases || 0],
                ['Total Cost', `$${(diseaseReportData.summary?.totalCost || 0).toFixed(2)}`]
            ];

            autoTable(doc, {
                head: [['Metric', 'Value']],
                body: summaryData,
                startY: startY + 10,
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 10,
                    cellPadding: { top: 3, right: 3, bottom: 3, left: 3 }
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold'
                }
            });

            startY = doc.lastAutoTable.finalY + 15;

            // Disease Summary Table
            if (diseaseReportData.diseaseSummary && diseaseReportData.diseaseSummary.length > 0) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Disease Summary', 20, startY);

                const diseaseData = diseaseReportData.diseaseSummary.map(item => [
                    item.disease,
                    item.count,
                    `$${(item.totalCost || 0).toFixed(2)}`,
                    `${((item.recoveryStatus.Healthy || 0) / item.count * 100).toFixed(1)}%`,
                    item.recoveryStatus.Ongoing || 0,
                    item.recoveryStatus.Critical || 0,
                    item.recoveryStatus.Healthy || 0,
                    item.recoveryStatus.Deceased || 0
                ]);

                autoTable(doc, {
                    head: [['Disease', 'Count', 'Total Cost', 'Recovery Rate', 'Ongoing', 'Critical', 'Healthy', 'Deceased']],
                    body: diseaseData,
                    startY: startY + 10,
                    theme: 'grid',
                    styles: {
                        font: 'helvetica',
                        fontSize: 8,
                        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 }
                    },
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: 255,
                        fontStyle: 'bold'
                    }
                });
            }

            doc.save('disease_report.pdf');
            showSuccess('Disease PDF report exported successfully');
        } catch (error) {
            console.error('PDF Export Error:', error);
            showError('Failed to generate disease PDF report. Please try again.');
        }
    };

    useEffect(() => {
        const fetchFarmers = async () => {
            if (!vsId || !token) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/farmers/${vsId}`);
                setFarmers(response.data.farmers || []);
                setSummary(response.data.summary || {});
            } catch (error) {
                console.error('Error fetching farmers:', error);
                showError('Failed to fetch farmers data');
                setFarmers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFarmers();
    }, [vsId, token]);

    useEffect(() => {
        const fetchFarms = async () => {
            if (!selectedFarmer || !token) {
                setFarms([]);
                return;
            }
            try {
                const response = await api.get(`/farms/${selectedFarmer}`);
                setFarms(response.data.farms || []);
            } catch (error) {
                console.error('Error fetching farms:', error);
                showError('Failed to fetch farms data');
                setFarms([]);
            }
        };
        fetchFarms();
    }, [selectedFarmer, token]);

    useEffect(() => {
        const fetchAnimals = async () => {
            if (!selectedFarm || !token) {
                setAnimals([]);
                return;
            }
            try {
                const response = await api.get(`/animals/${selectedFarm}`);
                console.log('Fetched animals:', response.data.animals);
                setAnimals(response.data.animals || []);
            } catch (error) {
                console.error('Error fetching animals:', error);
                showError('Failed to fetch animals data');
                setAnimals([]);
            }
        };
        fetchAnimals();
    }, [selectedFarm, token]);

    useEffect(() => {
        const fetchMedicalHistory = async () => {
            if (!selectedAnimal || !token) {
                setMedicalHistory([]);
                return;
            }
            try {
                const response = await api.get(`/medical-history/${selectedAnimal}`);
                setMedicalHistory(response.data.medicalHistories || []);
            } catch (error) {
                console.error('Error fetching medical history:', error);
                showError('Failed to fetch medical history');
                setMedicalHistory([]);
            }
        };
        fetchMedicalHistory();
    }, [selectedAnimal, token]);

    if (authLoading || (loading && !vsId)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading reports dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
                <div className="text-center">
                    <p className="text-red-600 font-medium">Please log in to access reports.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 w-full">
            <div className="max-w-full mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Farmers"
                        value={summary.totalFarmers}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Total Farms"
                        value={summary.totalFarms}
                        icon={MapPin}
                        color="green"
                    />
                    <StatCard
                        title="Total Animals"
                        value={summary.totalAnimals}
                        icon={BarChart3}
                        color="purple"
                    />
                    <StatCard
                        title="Health Records"
                        value={summary.totalHealthRecords}
                        icon={Heart}
                        color="red"
                    />
                </div>

                {/* Full Area Report Section */}
                <Card title="Full Area Report" icon={FileText}>
                    <div className="bg-blue-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 mb-4">
                            Generate a hensive report of all farmers, farms, and animals in your area.
                            This report can be exported in multiple formats for your records.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                variant="primary"
                                onClick={fetchComprehensiveReport}
                                disabled={isGeneratingFullReport}
                            >
                                {isGeneratingFullReport ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generating Report...
                                    </>
                                ) : (
                                    <>
                                        <FileTextIcon className="h-4 w-4 mr-2" />
                                        Get Full Area Report
                                    </>
                                )}
                            </Button>

                            {comprehensiveReportData && (
                                <>
                                    <Button variant="export" onClick={exportComprehensiveReportToCSV}>
                                        <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>
                                    <Button variant="export" onClick={exportComprehensiveReportToExcel}>
                                        <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
                                        Export Excel
                                    </Button>
                                    <Button variant="export" onClick={exportComprehensiveReportToPDF}>
                                        <FilePdf className="h-4 w-4 mr-2" />
                                        Export PDF
                                    </Button>
                                </>
                            )}
                        </div>
                        {comprehensiveReportData && (
                            <div className="mt-4 p-4 bg-white rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Farmers</p>
                                        <p className="text-xl font-bold text-blue-800">{comprehensiveReportData.summary?.farmerCount || 0}</p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Farms</p>
                                        <p className="text-xl font-bold text-green-800">{comprehensiveReportData.summary?.farmCount || 0}</p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Total Animals</p>
                                        <p className="text-xl font-bold text-purple-800">{comprehensiveReportData.summary?.animalCount || 0}</p>
                                    </div>
                                    <div className="bg-red-100 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600">Health Records</p>
                                        <p className="text-xl font-bold text-red-800">{comprehensiveReportData.summary?.recordCount || 0}</p>
                                    </div>
                                </div>
                                {/* Farmer Details List */}
                                <div className="mt-6">
                                    <h4 className="text-lg font-semibold mb-3">Farmer Details</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Name</th>
                                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Email</th>
                                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Contact</th>
                                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Address</th>
                                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">NIC</th>
                                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Created At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comprehensiveReportData.farmers.map(farmer => {
                                                    const user = farmer.user_id || {};
                                                    return (
                                                        <tr key={farmer._id} className="hover:bg-gray-50">
                                                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-900">{user.full_name || 'N/A'}</td>
                                                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-900">{user.email || 'N/A'}</td>
                                                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-900">{user.contact_number || 'N/A'}</td>
                                                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-900">{user.address || 'N/A'}</td>
                                                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-900">{user.nic || 'N/A'}</td>
                                                            <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-900">{formatDate(user.created_at)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Disease Report Section */}
                <Card title="Disease Analysis Report" icon={Pill}>
                    <div className="bg-red-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 mb-4">
                            Generate a comprehensive disease analysis report for all animals in your area.
                            This includes disease trends, recovery rates, and cost analysis.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                variant="primary"
                                onClick={fetchDiseaseReport}
                                disabled={isGeneratingDiseaseReport}
                            >
                                {isGeneratingDiseaseReport ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generating Disease Report...
                                    </>
                                ) : (
                                    <>
                                        <Activity className="h-4 w-4 mr-2" />
                                        Generate Disease Report
                                    </>
                                )}
                            </Button>

                            {diseaseReportData && (
                                <>
                                    <Button
                                        variant="success"
                                        onClick={() => setIsDiseaseChartsModalOpen(true)}
                                        className="gap-2"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        View Charts
                                    </Button>

                                    <Button variant="export" onClick={exportDiseaseReportToCSV}>
                                        <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>

                                    <Button variant="export" onClick={exportDiseaseReportToExcel}>
                                        <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
                                        Export Excel
                                    </Button>

                                    <Button variant="export" onClick={exportDiseaseReportToPDF}>
                                        <FilePdf className="h-4 w-4 mr-2" />
                                        Export PDF
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {diseaseReportData && (
                        <div className="mt-6 space-y-6">
                            {/* Summary Statistics */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Cases</p>
                                    <p className="text-2xl font-bold text-blue-800">{diseaseReportData.summary?.totalCases || 0}</p>
                                </div>
                                <div className="bg-yellow-100 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Active Cases</p>
                                    <p className="text-2xl font-bold text-yellow-800">{diseaseReportData.summary?.activeCases || 0}</p>
                                </div>
                                <div className="bg-green-100 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Recovered</p>
                                    <p className="text-2xl font-bold text-green-800">{diseaseReportData.summary?.recoveredCases || 0}</p>
                                </div>
                                <div className="bg-red-100 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Critical</p>
                                    <p className="text-2xl font-bold text-red-800">{diseaseReportData.summary?.criticalCases || 0}</p>
                                </div>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Deceased</p>
                                    <p className="text-2xl font-bold text-gray-800">{diseaseReportData.summary?.deceasedCases || 0}</p>
                                </div>
                                <div className="bg-purple-100 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Cost</p>
                                    <p className="text-2xl font-bold text-purple-800">${(diseaseReportData.summary?.totalCost || 0).toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Disease Summary Table */}
                            {diseaseReportData.diseaseSummary && diseaseReportData.diseaseSummary.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Disease Summary</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Disease</th>
                                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Cases</th>
                                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Total Cost</th>
                                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Recovery Rate</th>
                                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Ongoing</th>
                                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Critical</th>
                                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Healthy</th>
                                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Deceased</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {diseaseReportData.diseaseSummary.map((item, index) => {
                                                    const recoveryRate = item.count > 0
                                                        ? ((item.recoveryStatus.Healthy || 0) / item.count * 100).toFixed(1)
                                                        : 0;
                                                    return (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-900">{item.disease}</td>
                                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-900">{item.count}</td>
                                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-900">${item.totalCost?.toFixed(2) || '0.00'}</td>
                                                            <td className="py-3 px-4 border-b border-gray-200 text-sm">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${recoveryRate >= 80 ? 'bg-green-100 text-green-800' :
                                                                    recoveryRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                                        recoveryRate >= 40 ? 'bg-orange-100 text-orange-800' :
                                                                            'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {recoveryRate}%
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-orange-600 font-medium">{item.recoveryStatus.Ongoing || 0}</td>
                                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-red-600 font-medium">{item.recoveryStatus.Critical || 0}</td>
                                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-green-600 font-medium">{item.recoveryStatus.Healthy || 0}</td>
                                                            <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-600 font-medium">{item.recoveryStatus.Deceased || 0}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Monthly Disease Trends */}
                            {diseaseReportData.diseaseTrends && diseaseReportData.diseaseTrends.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Monthly Disease Trends</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Month</th>
                                                    {Object.keys(diseaseReportData.diseaseTrends[0] || {}).filter(key => key !== 'month').map(disease => (
                                                        <th key={disease} className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">{disease}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {diseaseReportData.diseaseTrends.map((trend, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-900 font-medium">{trend.month}</td>
                                                        {Object.keys(trend).filter(key => key !== 'month').map(disease => (
                                                            <td key={disease} className="py-3 px-4 border-b border-gray-200 text-sm text-gray-900">{trend[disease] || 0}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                <Card title="Selection Panel" icon={FilterIcon}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Farmer
                            </label>
                            <select
                                value={selectedFarmer}
                                onChange={handleFarmerChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">-- Select Farmer --</option>
                                {farmers.map(farmer => (
                                    <option key={farmer._id} value={farmer._id}>
                                        {farmer.full_name || farmer.farmer_name || 'Unnamed Farmer'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Farm
                            </label>
                            <select
                                value={selectedFarm}
                                onChange={handleFarmChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={!selectedFarmer}
                            >
                                <option value="">-- Select Farm --</option>
                                {farms.map(farm => (
                                    <option key={farm._id} value={farm._id}>
                                        {farm.farm_name || 'Unnamed Farm'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Animal
                            </label>
                            <select
                                value={selectedAnimal}
                                onChange={handleAnimalChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={!selectedFarm}
                            >
                                <option value="">-- Select Animal --</option>
                                {animals.map(animal => (
                                    <option key={animal._id} value={animal._id}>
                                        {animal.animal_tag || animal.tag_number || 'Unnamed Animal'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6">
                        <Button
                            variant="secondary"
                            onClick={resetFilters}
                        >
                            <RefreshCwIcon className="h-4 w-4 mr-2" />
                            Reset Filters
                        </Button>

                        {medicalHistory.length > 0 && (
                            <>
                                <Button variant="export" onClick={exportToCSV}>
                                    <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                                <Button variant="export" onClick={exportToExcel}>
                                    <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
                                    Export Excel
                                </Button>
                                <Button variant="export" onClick={exportToPDF}>
                                    <FilePdf className="h-4 w-4 mr-2" />
                                    Export PDF
                                </Button>
                                <Button variant="primary" onClick={() => setIsMedicalHistoryModalOpen(true)}>
                                    <FileTextIcon className="h-4 w-4 mr-2" />
                                    Preview Medical History
                                </Button>
                            </>
                        )}
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {farmerDetails && (
                        <Card title="Farmer Details" icon={User}>
                            <div className="space-y-4">
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Name:</span>
                                            <span className="font-medium">{farmerDetails.full_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium">{farmerDetails.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Animals Owned:</span>
                                            <span className="font-medium">{farmerDetails.animalCount || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">NIC:</span>
                                            <span className="font-medium">{farmerDetails.nic_number || '20051241521'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Contact:</span>
                                            <span className="font-medium">{farmerDetails.contact_number || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Location:</span>
                                            <span className="font-medium">{farmerDetails.address || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Registration Date:</span>
                                            <span className="font-medium">{formatDate(farmerDetails.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {farmDetails && (
                        <Card title="Farm Details" icon={Building}>
                            <div className="space-y-4">
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Farm Information</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Farm Name:</span>
                                            <span className="font-medium">{farmDetails.farm_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Owner:</span>
                                            <span className="font-medium">{getFarmerName(farmDetails.farmer_id)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Location:</span>
                                            <span className="font-medium">{farmDetails.location_address || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Farm Type:</span>
                                            <span className="font-medium">{farmDetails.farm_type || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Registration Date:</span>
                                            <span className="font-medium">{formatDate(farmDetails.registration_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Animals:</span>
                                            <span className="font-medium">{animals.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {animalDetails && (
                        <Card title="Animal Details" icon={Activity}>
                            <div className="space-y-4">
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Animal Information</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Animal Tag/Number:</span>
                                            <span className="font-medium">{animalDetails.animal_tag || animalDetails.tag_number || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Species:</span>
                                            <span className="font-medium">{animalDetails.animal_type || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Category:</span>
                                            <span className="font-medium">{animalDetails.category || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Gender:</span>
                                            <span className="font-medium">{animalDetails.gender || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date of Birth:</span>
                                            <span className="font-medium">{formatDate(animalDetails.birth_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Age:</span>
                                            <span className="font-medium">
                                                {animalDetails.birth_date
                                                    ? Math.floor((new Date() - new Date(animalDetails.birth_date)) / (365.25 * 24 * 60 * 60 * 1000)) + ' years'
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="font-medium">{animalDetails.current_status}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Farm:</span>
                                            <span className="font-medium">{getFarmName(animalDetails.farm_id)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Disease Charts Modal - Add this at the end of your component's return JSX */}
                {isDiseaseChartsModalOpen && diseaseReportData && (
                    <DiseaseChartsModal
                        isOpen={isDiseaseChartsModalOpen}
                        onClose={() => setIsDiseaseChartsModalOpen(false)}
                        diseaseData={diseaseReportData}
                    />
                )}

                <MedicalHistoryModal
                    isOpen={isMedicalHistoryModalOpen}
                    onClose={() => setIsMedicalHistoryModalOpen(false)}
                    medicalHistory={medicalHistory}
                    getDisplayValue={getDisplayValue}
                    formatDate={formatDate}
                    animalDetails={animalDetails}
                />
            </div>
        </div>
    );
};

export default Reports;


