import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, PieChart, Activity, Download, DollarSign, RefreshCw } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const DiseaseChartsModal = ({ isOpen, onClose, diseaseData }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [chartData, setChartData] = useState({
        diseaseSummary: [],
        diseaseTrends: [],
        monthlyTrends: [],
        costAnalysis: [],
        recoveryRates: []
    });
    const [refreshKey, setRefreshKey] = useState(0);

    // Modern, consistent color palette
    const colors = {
        primary: '#2563eb',     // blue-600
        secondary: '#059669',   // emerald-600
        tertiary: '#d97706',    // amber-600
        danger: '#dc2626',      // red-600
        warning: '#ea580c',     // orange-600
        info: '#0891b2',        // cyan-600
        success: '#16a34a',     // green-600
        purple: '#7c3aed',      // violet-600
        pink: '#db2777',        // pink-600
        gradient: [
            '#2563eb', '#7c3aed', '#db2777', '#d97706',
            '#059669', '#0891b2', '#dc2626', '#ea580c',
            '#16a34a', '#8b5cf6'
        ],
        light: {
            primary: '#dbeafe',     // blue-100
            secondary: '#d1fae5',   // emerald-100
            tertiary: '#fef3c7',    // amber-100
            danger: '#fee2e2',      // red-100
            warning: '#fed7aa',     // orange-100
            info: '#cffafe',        // cyan-100
            success: '#dcfce7',     // green-100
            purple: '#ede9fe',      // violet-100
            pink: '#fce7f3',        // pink-100
        }
    };

    useEffect(() => {
        if (diseaseData) {
            const processedData = {
                diseaseSummary: diseaseData.diseaseSummary || [],
                diseaseTrends: diseaseData.diseaseTrends || [],
                monthlyTrends: diseaseData.monthlyTrends || diseaseData.diseaseTrends || [],
                costAnalysis: diseaseData.diseaseSummary?.map(item => ({
                    disease: item.disease,
                    totalCost: item.totalCost || 0,
                    averageCost: item.count > 0 ? (item.totalCost || 0) / item.count : 0
                })) || [],
                recoveryRates: diseaseData.diseaseSummary || []
            };
            setChartData(processedData);
        }
    }, [diseaseData, refreshKey]);

    if (!isOpen) return null;

    const getDiseaseSummaryChart = () => {
        const labels = chartData.diseaseSummary.map(item => item.disease);
        const data = chartData.diseaseSummary.map(item => item.count);

        return {
            labels,
            datasets: [
                {
                    label: 'Disease Cases',
                    data,
                    backgroundColor: colors.gradient.map((color) => color + '15'),
                    borderColor: colors.gradient,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                },
            ],
        };
    };

    const getDiseaseCostChart = () => {
        const labels = chartData.costAnalysis.map(item => item.disease);
        const data = chartData.costAnalysis.map(item => item.totalCost || 0);

        return {
            labels,
            datasets: [
                {
                    label: 'Total Treatment Cost ($)',
                    data,
                    backgroundColor: colors.gradient.map((color) => color + '15'),
                    borderColor: colors.gradient,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                },
            ],
        };
    };

    const getDiseaseTrendChart = () => {
        if (!chartData.diseaseTrends.length) return { labels: [], datasets: [] };

        const labels = chartData.diseaseTrends.map(item => item.month);
        const diseases = [...new Set(chartData.diseaseSummary.map(item => item.disease))];

        const datasets = diseases.map((disease, index) => ({
            label: disease,
            data: chartData.diseaseTrends.map(item => item[disease] || 0),
            borderColor: colors.gradient[index % colors.gradient.length],
            backgroundColor: colors.gradient[index % colors.gradient.length] + '08',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: colors.gradient[index % colors.gradient.length],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverBorderWidth: 3,
        }));

        return { labels, datasets };
    };

    const getRecoveryStatusChart = () => {
        const recoveryData = chartData.diseaseSummary.reduce((acc, item) => {
            Object.entries(item.recoveryStatus || {}).forEach(([status, count]) => {
                acc[status] = (acc[status] || 0) + count;
            });
            return acc;
        }, {});

        const labels = Object.keys(recoveryData);
        const data = Object.values(recoveryData);
        const statusColors = {
            'Recovered': colors.success,
            'Active': colors.warning,
            'Critical': colors.danger,
            'Deceased': colors.info,
            'Under Treatment': colors.purple
        };

        const chartColors = labels.map(label =>
            statusColors[label] || colors.gradient[labels.indexOf(label) % colors.gradient.length]
        );

        return {
            labels,
            datasets: [
                {
                    label: 'Recovery Status',
                    data,
                    backgroundColor: chartColors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverOffset: 4,
                },
            ],
        };
    };

    const getMonthlyCostTrendChart = () => {
        if (!chartData.diseaseTrends.length || !chartData.costAnalysis.length) {
            return { labels: [], datasets: [] };
        }

        const labels = chartData.diseaseTrends.map(item => item.month);
        const diseases = [...new Set(chartData.costAnalysis.map(item => item.disease))];

        const datasets = diseases.map((disease, index) => ({
            label: `${disease} Cost`,
            data: chartData.diseaseTrends.map(item => {
                const costData = chartData.costAnalysis.find(c => c.disease === disease);
                return (costData && item[disease]) ? (costData.averageCost * item[disease]) : 0;
            }),
            borderColor: colors.gradient[index % colors.gradient.length],
            backgroundColor: colors.gradient[index % colors.gradient.length] + '08',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: colors.gradient[index % colors.gradient.length],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
        }));

        return { labels, datasets };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 16,
                    font: {
                        size: 12,
                        weight: '500',
                        family: 'Inter, system-ui, sans-serif'
                    },
                    color: '#374151',
                    boxWidth: 8,
                    boxHeight: 8
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                borderColor: colors.primary,
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                titleFont: {
                    size: 13,
                    weight: '600',
                    family: 'Inter, system-ui, sans-serif'
                },
                bodyFont: {
                    size: 12,
                    family: 'Inter, system-ui, sans-serif'
                },
                padding: 12,
                caretSize: 6,
                titleSpacing: 8,
                bodySpacing: 4
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                        weight: '500',
                        family: 'Inter, system-ui, sans-serif'
                    },
                    color: '#64748b',
                    padding: 8
                },
                border: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11,
                        weight: '500',
                        family: 'Inter, system-ui, sans-serif'
                    },
                    color: '#64748b',
                    padding: 8
                },
                border: {
                    display: false
                }
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            }
        },
        plugins: {
            legend: {
                position: 'right',
                align: 'center',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 12,
                    font: {
                        size: 12,
                        weight: '500',
                        family: 'Inter, system-ui, sans-serif'
                    },
                    color: '#374151',
                    boxWidth: 10,
                    boxHeight: 10
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                borderColor: colors.primary,
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                titleFont: {
                    size: 13,
                    weight: '600',
                    family: 'Inter, system-ui, sans-serif'
                },
                bodyFont: {
                    size: 12,
                    family: 'Inter, system-ui, sans-serif'
                },
                padding: 12,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const renderChart = (type, data, options = chartOptions) => {
        if (!data.datasets || data.datasets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-base font-medium mb-1 text-slate-500">No data available</p>
                    <p className="text-sm text-slate-400">Charts will appear when data is loaded</p>
                </div>
            );
        }

        switch (type) {
            case 'bar':
                return <Bar data={data} options={options} />;
            case 'line':
                return <Line data={data} options={options} />;
            case 'pie':
                return <Pie data={data} options={pieChartOptions} />;
            case 'doughnut':
                return <Doughnut data={data} options={pieChartOptions} />;
            default:
                return null;
        }
    };

    const downloadChart = async (chartId, format = 'png') => {
        try {
            const canvas = document.querySelector(`#${chartId} canvas`);
            if (!canvas) {
                console.warn('Canvas not found for chart:', chartId);
                return;
            }

            const link = document.createElement('a');
            link.download = `disease-chart-${chartId}-${new Date().toISOString().split('T')[0]}.${format}`;
            link.href = canvas.toDataURL(`image/${format}`);
            link.click();
        } catch (error) {
            console.error('Error downloading chart:', error);
        }
    };

    const refreshCharts = () => {
        setRefreshKey(prev => prev + 1);
    };

    const tabs = [
        { id: 'overview', label: 'Disease Overview', icon: BarChart3, color: colors.primary },
        { id: 'costs', label: 'Cost Analysis', icon: DollarSign, color: colors.secondary },
        { id: 'trends', label: 'Disease Trends', icon: TrendingUp, color: colors.tertiary },
        { id: 'recovery', label: 'Recovery Status', icon: PieChart, color: colors.purple },
        { id: 'monthly-cost', label: 'Monthly Costs', icon: Activity, color: colors.info },
    ];

    return (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Disease Overview</h2>
                        <p className="text-sm text-slate-600 mt-1">Interactive analytics and insights</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={refreshCharts}
                            className="inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50 group"
                            title="Refresh Charts"
                        >
                            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-white border-b border-slate-200 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 ${activeTab === tab.id
                                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)] bg-slate-50/30">
                    {activeTab === 'overview' && (
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Disease Cases Overview</h3>
                                    <p className="text-sm text-slate-600">Distribution of disease cases across different conditions</p>
                                </div>
                                <button
                                    onClick={() => downloadChart('disease-overview')}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                >
                                    <Download className="w-4 h-4 mr-1.5" />
                                    Export
                                </button>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm" id="disease-overview">
                                <div className="h-96 p-6">
                                    {renderChart('bar', getDiseaseSummaryChart())}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'costs' && (
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Treatment Cost Analysis</h3>
                                    <p className="text-sm text-slate-600">Comprehensive cost breakdown by disease type</p>
                                </div>
                                <button
                                    onClick={() => downloadChart('disease-cost')}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 shadow-sm"
                                >
                                    <Download className="w-4 h-4 mr-1.5" />
                                    Export
                                </button>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm" id="disease-cost">
                                <div className="h-96 p-6">
                                    {renderChart('bar', getDiseaseCostChart())}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'trends' && (
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Disease Trends Over Time</h3>
                                    <p className="text-sm text-slate-600">Track disease progression and patterns across months</p>
                                </div>
                                <button
                                    onClick={() => downloadChart('disease-trends')}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 shadow-sm"
                                >
                                    <Download className="w-4 h-4 mr-1.5" />
                                    Export
                                </button>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm" id="disease-trends">
                                <div className="h-96 p-6">
                                    {renderChart('line', getDiseaseTrendChart())}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'recovery' && (
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Recovery Status Distribution</h3>
                                    <p className="text-sm text-slate-600">Visual breakdown of patient recovery outcomes</p>
                                </div>
                                <button
                                    onClick={() => downloadChart('recovery-status')}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 shadow-sm"
                                >
                                    <Download className="w-4 h-4 mr-1.5" />
                                    Export
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="recovery-status">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="p-4 border-b border-slate-200">
                                        <h4 className="font-medium text-slate-900">Pie Chart View</h4>
                                    </div>
                                    <div className="h-80 p-6">
                                        {renderChart('pie', getRecoveryStatusChart())}
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="p-4 border-b border-slate-200">
                                        <h4 className="font-medium text-slate-900">Doughnut Chart View</h4>
                                    </div>
                                    <div className="h-80 p-6">
                                        {renderChart('doughnut', getRecoveryStatusChart())}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'monthly-cost' && (
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Monthly Treatment Costs</h3>
                                    <p className="text-sm text-slate-600">Track treatment expenses and budget allocation over time</p>
                                </div>
                                <button
                                    onClick={() => downloadChart('monthly-costs')}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-200 shadow-sm"
                                >
                                    <Download className="w-4 h-4 mr-1.5" />
                                    Export
                                </button>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm" id="monthly-costs">
                                <div className="h-96 p-6">
                                    {renderChart('line', getMonthlyCostTrendChart())}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiseaseChartsModal;