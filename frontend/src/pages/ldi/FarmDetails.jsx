import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, HomeIcon, UserIcon, MapPinIcon, CalendarIcon, PlusIcon, DropletsIcon, HeartIcon, InfoIcon, EditIcon, FileTextIcon, PaperclipIcon, TrendingUpIcon, SearchIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AnimalModal from '../../components/AnimalModal';
import AnimalEditModal from '../../components/AnimalEditModal';
import AnimalInfoModal from '../../components/AnimalInfoModal';
import AIRecordModal from '../../components/AIRecordModal';
import PregnancyStatusModal from '../../components/PregnancyStatusModal';
import AIInfoModal from '../../components/AIInfoModal';
import AIEditModal from '../../components/AIEditModal';
import AIAttachmentModal from '../../components/AIAttachmentModal';
import FarmAnalytics from '../../components/FarmAnalytics';
import EditFarmModal from '../../components/EditFarmModal';
import FarmReportGenerator from '../../components/FarmReportGenerator';

export default function FarmDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [farm, setFarm] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [animalQuery, setAnimalQuery] = useState('');
  const [milkData, setMilkData] = useState([]);
  const [aiData, setAiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [showAnimalEditModal, setShowAnimalEditModal] = useState(false);
  const [showAnimalInfoModal, setShowAnimalInfoModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedAnimalAIRecords, setSelectedAnimalAIRecords] = useState([]);
  const [showAIRecordModal, setShowAIRecordModal] = useState(false);
  const [showPregnancyStatusModal, setShowPregnancyStatusModal] = useState(false);
  const [showAIInfoModal, setShowAIInfoModal] = useState(false);
  const [showAIEditModal, setShowAIEditModal] = useState(false);
  const [showAIAttachmentModal, setShowAIAttachmentModal] = useState(false);
  const [selectedAIRecord, setSelectedAIRecord] = useState(null);
  const [expandedAIActionIds, setExpandedAIActionIds] = useState({});
  const toggleAIAction = (id) => {
    setExpandedAIActionIds(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [activeSection, setActiveSection] = useState('animals'); // 'animals', 'milk', 'ai', 'analytics'
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredAnimals = useMemo(() => {
    const q = animalQuery.trim().toLowerCase();
    if (!q) return animals;
    return animals.filter(a => (a.animal_tag || '').toLowerCase().includes(q));
  }, [animals, animalQuery]);

  useEffect(() => {
    const fetchFarmDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch farm details
        const farmResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!farmResponse.ok) {
          throw new Error('Failed to fetch farm details');
        }

        const farmData = await farmResponse.json();
        setFarm(farmData.data);

        // Fetch animals for this farm
        const animalsResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${id}/animals`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (animalsResponse.ok) {
          const animalsData = await animalsResponse.json();
          setAnimals(animalsData.data || []);
        } else {
          console.warn('Failed to fetch animals:', animalsResponse.statusText);
          setAnimals([]);
        }

        // Fetch milk production data for this farm
        const milkResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${id}/milk`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (milkResponse.ok) {
          const milkData = await milkResponse.json();
          setMilkData(milkData.data || []);
        } else {
          console.warn('Failed to fetch milk data:', milkResponse.statusText);
          setMilkData([]);
        }

        // Fetch AI data for this farm
        const aiResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${id}/ai`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          setAiData(aiData.data || []);
        } else {
          console.warn('Failed to fetch AI data:', aiResponse.statusText);
          setAiData([]);
        }

      } catch (err) {
        console.error('Error fetching farm details:', err);
        setError(err.message || 'Failed to load farm details');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchFarmDetails();
    }
  }, [id, token]);

  const handleBack = () => {
    navigate('/ldi/farmers?tab=farms');
  };

  const handleAnimalMoreInfo = async (animal) => {
    try {
      setSelectedAnimal(animal);
      
      // Fetch AI records for this specific animal using the new endpoint
      const aiResponse = await fetch(`http://localhost:5000/api/animals/${animal._id}/ai-records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        setSelectedAnimalAIRecords(aiData.data || []);
      } else {
        setSelectedAnimalAIRecords([]);
      }
      
      setShowAnimalInfoModal(true);
    } catch (error) {
      console.error('Error fetching animal AI records:', error);
      setSelectedAnimalAIRecords([]);
      setShowAnimalInfoModal(true);
    }
  };

  const handleEditAnimal = (animal) => {
    setSelectedAnimal(animal);
    setShowAnimalEditModal(true);
  };

  const handleUpdateAnimal = async (animalId, animalData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/animals/update/${animalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(animalData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update animal');
      }

      const result = await response.json();
      
      // Refresh the animals list
      const animalsResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${id}/animals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (animalsResponse.ok) {
        const animalsData = await animalsResponse.json();
        setAnimals(animalsData.data || []);
      }

      return result;
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error;
    }
  };

  const handleAddAnimal = async (animalData) => {
    try {
      const response = await fetch('http://localhost:5000/api/animals/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(animalData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add animal');
      }

      const result = await response.json();
      
      // Refresh the animals list
      const animalsResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${id}/animals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (animalsResponse.ok) {
        const animalsData = await animalsResponse.json();
        setAnimals(animalsData.data || []);
      }

      return result;
    } catch (error) {
      console.error('Error adding animal:', error);
      throw error;
    }
  };

  const handleAddAIRecord = async (aiData) => {
    try {
      console.log('Adding AI record:', aiData);
      // Refresh the AI data list
      const aiResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${id}/ai`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (aiResponse.ok) {
        const aiDataResponse = await aiResponse.json();
        setAiData(aiDataResponse.data || []);
      }
    } catch (error) {
      console.error('Error refreshing AI data:', error);
    }
  };

  const handleUpdatePregnancyStatus = async (updatedRecord) => {
    try {
      // Refresh the AI data list
      const aiResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${id}/ai`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (aiResponse.ok) {
        const aiDataResponse = await aiResponse.json();
        setAiData(aiDataResponse.data || []);
      }
    } catch (error) {
      console.error('Error refreshing AI data:', error);
    }
  };

  const handleUpdateStatusClick = (record) => {
    setSelectedAIRecord(record);
    setShowPregnancyStatusModal(true);
  };

  const handleMoreInfoClick = (record) => {
    setSelectedAIRecord(record);
    setShowAIInfoModal(true);
  };

  const handleEditClick = (record) => {
    setSelectedAIRecord(record);
    setShowAIEditModal(true);
  };

  const handleAttachFilesClick = (record) => {
    setSelectedAIRecord(record);
    setShowAIAttachmentModal(true);
  };

  const handleSaveAIRecord = async (recordId, updatedData) => {
    try {
      // Refresh the AI data list
      const aiResponse = await fetch(`http://localhost:5000/api/ldi/farmdetails/${id}/ai`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (aiResponse.ok) {
        const aiDataResponse = await aiResponse.json();
        setAiData(aiDataResponse.data || []);
      }
    } catch (error) {
      console.error('Error refreshing AI data:', error);
    }
  };

  const handleEditFarm = () => {
    setShowEditModal(true);
  };

  const handleFarmUpdate = (updatedFarm) => {
    setFarm(updatedFarm);
  };

  // Group approved milk reports by month, assigning first validated as first half and next as second half
  const groupedMilkByMonth = useMemo(() => {
    if (!Array.isArray(milkData)) return [];

    const monthKeyToRecords = new Map();
    for (const record of milkData) {
      const baseDate = record.report_month || record.validation_date || record.submitted_date;
      if (!baseDate) continue;
      const d = new Date(baseDate);
      if (isNaN(d)) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthKeyToRecords.has(key)) monthKeyToRecords.set(key, []);
      monthKeyToRecords.get(key).push(record);
    }

    const groups = Array.from(monthKeyToRecords.entries()).map(([key, records]) => {
      // sort by validation date (fallback to submitted/report date) ascending so first validated comes first
      records.sort((a, b) => {
        const da = new Date(a.validation_date || a.submitted_date || a.report_month || 0).getTime();
        const db = new Date(b.validation_date || b.submitted_date || b.report_month || 0).getTime();
        return da - db;
      });
      const monthDate = new Date(`${key}-01T00:00:00`);
      return {
        key,
        monthDate,
        firstHalf: records[0] || null,
        secondHalf: records[1] || null,
        all: records
      };
    });

    // Sort months descending (latest first)
    groups.sort((a, b) => b.monthDate - a.monthDate);
    return groups;
  }, [milkData]);

  const renderEventsTags = (record) => {
    if (!record) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">None</span>;
    const ev = record.events_reported || {};
    const tags = [];
    if (ev.birth) tags.push(<span key="birth" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Birth</span>);
    if (ev.death) tags.push(<span key="death" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Death</span>);
    if (ev.purchase) tags.push(<span key="purchase" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Purchase</span>);
    if (ev.sale) tags.push(<span key="sale" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Sale</span>);
    if (ev.company_change) tags.push(<span key="company_change" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Company Change</span>);
    if (tags.length === 0) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">None</span>;
    return <div className="flex flex-wrap gap-1">{tags}</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-center">
          <p className="text-lg font-semibold mb-2">Farm Not Found</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Farms
          </button>
        </div>
        <button
          onClick={handleEditFarm}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center"
        >
          <EditIcon className="w-4 h-4 mr-2" />
          Edit Farm
        </button>
      </div>
      
      {/* Farm Information Card */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center mb-4">
          <HomeIcon className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-xl font-semibold text-green-700">{farm.farm_name || 'Unnamed Farm'}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <HomeIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Farm Registration</p>
              <p className="text-sm text-gray-900">{farm.farm_registration_number}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Owner</p>
              <p className="text-sm text-gray-900">{farm.farmer_id?.user_id?.full_name || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <MapPinIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-sm text-gray-900">{farm.location_address}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <HomeIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Farm Type</p>
              <p className="text-sm text-gray-900">{farm.farm_type}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Registration Date</p>
              <p className="text-sm text-gray-900">
                {new Date(farm.registration_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-gray-100 p-2 rounded-lg mr-3">
              <HomeIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                farm.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {farm.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Details Sections */}
      <div className="bg-white rounded-lg shadow-lg">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          {/* Mobile icon nav */}
          <div className="sm:hidden px-4 py-3">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setActiveSection('animals')}
                aria-label="Animals"
                className={`flex flex-col items-center p-2 rounded-lg text-xs ${
                  activeSection === 'animals' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'text-gray-600 bg-gray-50'
                }`}
              >
                <UserIcon className="w-5 h-5" />
                <span className="mt-1">Animals</span>
              </button>
              <button
                onClick={() => setActiveSection('milk')}
                aria-label="Milk"
                className={`flex flex-col items-center p-2 rounded-lg text-xs ${
                  activeSection === 'milk' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'text-gray-600 bg-gray-50'
                }`}
              >
                <DropletsIcon className="w-5 h-5" />
                <span className="mt-1">Milk</span>
              </button>
              <button
                onClick={() => setActiveSection('ai')}
                aria-label="AI"
                className={`flex flex-col items-center p-2 rounded-lg text-xs ${
                  activeSection === 'ai' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'text-gray-600 bg-gray-50'
                }`}
              >
                <HeartIcon className="w-5 h-5" />
                <span className="mt-1">AI</span>
              </button>
              <button
                onClick={() => setActiveSection('analytics')}
                aria-label="Analytics"
                className={`flex flex-col items-center p-2 rounded-lg text-xs ${
                  activeSection === 'analytics' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'text-gray-600 bg-gray-50'
                }`}
              >
                <TrendingUpIcon className="w-5 h-5" />
                <span className="mt-1">Analytics</span>
              </button>
            </div>
          </div>

          <nav className="-mb-px hidden sm:flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveSection('animals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSection === 'animals'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Animals ({animals.length})
            </button>
            <button
              onClick={() => setActiveSection('milk')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSection === 'milk'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DropletsIcon className="w-5 h-5 mr-2" />
              Milk Production ({milkData.length})
            </button>
            <button
              onClick={() => setActiveSection('ai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSection === 'ai'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HeartIcon className="w-5 h-5 mr-2" />
              AI Records ({aiData.length})
            </button>
            <button
              onClick={() => setActiveSection('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSection === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUpIcon className="w-5 h-5 mr-2" />
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6" style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'hidden' }}>
          {/* Animals Section */}
          {activeSection === 'animals' && (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="relative w-full sm:max-w-md">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={animalQuery}
                    onChange={(e) => setAnimalQuery(e.target.value)}
                    placeholder="Search by animal tag..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{animals.length} animals</span>
                  <button
                    onClick={() => setShowAnimalModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add New Animal
                  </button>
                </div>
              </div>

              {filteredAnimals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <HomeIcon className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No animals found in this farm</p>
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="sm:hidden grid gap-3">
                    {filteredAnimals.map((animal) => (
                      <div key={animal._id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs text-gray-500">Tag</p>
                            <p className="text-sm font-medium text-gray-900">{animal.animal_tag || 'N/A'}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            animal.current_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {animal.current_status || 'Unknown'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="text-sm font-medium text-gray-900">{animal.animal_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-medium text-gray-900">{animal.category || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Gender</p>
                            <p className="text-sm font-medium text-gray-900">{animal.gender || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Breed</p>
                            <p className="text-sm font-medium text-gray-900">{animal.breed || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                          <button 
                            onClick={() => handleAnimalMoreInfo(animal)}
                            className="w-full sm:w-auto justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                          >
                            <InfoIcon className="h-4 w-4" />
                            More Info
                          </button>
                          <button 
                            onClick={() => handleEditAnimal(animal)}
                            className="w-full sm:w-auto justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                          >
                            <EditIcon className="h-4 w-4" />
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Animal Tag
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAnimals.map((animal) => (
                          <tr key={animal._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {animal.animal_tag || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {animal.animal_type || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {animal.category || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {animal.gender || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${animal.current_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {animal.current_status || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleAnimalMoreInfo(animal)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                                >
                                  <InfoIcon className="h-4 w-4" />
                                  More Info
                                </button>
                                <button 
                                  onClick={() => handleEditAnimal(animal)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                                >
                                  <EditIcon className="h-4 w-4" />
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Milk Section */}
          {activeSection === 'milk' && (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              <div className="flex items-center justify-end mb-4">
                <span className="text-sm text-gray-500">{milkData.length} approved records</span>
              </div>

              {milkData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <DropletsIcon className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No approved monthly reports found</p>
                  <p className="text-sm text-gray-400 mt-2">Approved monthly reports will appear here</p>
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="sm:hidden grid gap-3">
                    {groupedMilkByMonth.map(group => (
                      <div key={group.key} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900">{group.monthDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="rounded-md bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">First Half</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-gray-500">Total (L)</p>
                                <p className="text-sm font-medium text-gray-900">{group.firstHalf?.total_milk_production ?? '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Submitted</p>
                                <p className="text-sm font-medium text-gray-900">{group.firstHalf?.submitted_date ? new Date(group.firstHalf.submitted_date).toLocaleDateString() : '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Validated</p>
                                <p className="text-sm font-medium text-gray-900">{group.firstHalf?.validation_date ? new Date(group.firstHalf.validation_date).toLocaleDateString() : '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Events</p>
                                <div className="mt-1">{renderEventsTags(group.firstHalf)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-md bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-600 mb-2">Second Half</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-gray-500">Total (L)</p>
                                <p className="text-sm font-medium text-gray-900">{group.secondHalf?.total_milk_production ?? '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Submitted</p>
                                <p className="text-sm font-medium text-gray-900">{group.secondHalf?.submitted_date ? new Date(group.secondHalf.submitted_date).toLocaleDateString() : '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Validated</p>
                                <p className="text-sm font-medium text-gray-900">{group.secondHalf?.validation_date ? new Date(group.secondHalf.validation_date).toLocaleDateString() : '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Events</p>
                                <div className="mt-1">{renderEventsTags(group.secondHalf)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Report Month
                          </th>
                          <th colSpan={4} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            First Half
                          </th>
                          <th colSpan={4} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Second Half
                          </th>
                        </tr>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (L)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (L)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupedMilkByMonth.map(group => (
                          <tr key={group.key} className="hover:bg-gray-50 align-top">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {group.monthDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {group.firstHalf?.total_milk_production ?? '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {group.firstHalf?.submitted_date ? new Date(group.firstHalf.submitted_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {group.firstHalf?.validation_date ? new Date(group.firstHalf.validation_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {renderEventsTags(group.firstHalf)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {group.secondHalf?.total_milk_production ?? '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {group.secondHalf?.submitted_date ? new Date(group.secondHalf.submitted_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {group.secondHalf?.validation_date ? new Date(group.secondHalf.validation_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {renderEventsTags(group.secondHalf)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* AI Section */}
          {activeSection === 'ai' && (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              <div className="flex items-center justify-end mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{aiData.length} records</span>
                  <button
                    onClick={() => setShowAIRecordModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add AI Record
                  </button>
                </div>
              </div>

              {aiData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <HeartIcon className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No AI records found</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {aiData.map((record) => (
                    <div key={record._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                      {/* Record Details */}
                      {/* Mobile compact summary */}
                      <div className="sm:hidden mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">AI Date</p>
                            <p className="text-sm font-medium text-gray-900">{record.ai_date ? new Date(record.ai_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.pregnancy_status === 'Pregnant' ? 'bg-green-100 text-green-800' : 
                            record.pregnancy_status === 'Not Pregnant' ? 'bg-red-100 text-red-800' : 
                            record.pregnancy_status === 'Aborted' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.pregnancy_status || 'Unknown'}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-xs text-gray-500">Animal</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{record.animal_tag || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Bull Breed</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{record.bull_breed || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      {/* Desktop detailed grid */}
                      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">AI Date</label>
                          <p className="text-sm font-medium text-gray-900">
                            {record.ai_date ? new Date(record.ai_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Animal</label>
                          <p className="text-sm font-medium text-gray-900">
                            {record.animal_tag || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Bull Breed</label>
                          <p className="text-sm font-medium text-gray-900">
                            {record.bull_breed || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Technician Name</label>
                          <p className="text-sm font-medium text-gray-900">
                            {record.technician_name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Technician Code</label>
                          <p className="text-sm font-medium text-gray-900">
                            {record.technician_code || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Semen Code</label>
                          <p className="text-sm font-medium text-gray-900">
                            {record.semen_code || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Pregnancy Status</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.pregnancy_status === 'Pregnant' ? 'bg-green-100 text-green-800' : 
                            record.pregnancy_status === 'Not Pregnant' ? 'bg-red-100 text-red-800' : 
                            record.pregnancy_status === 'Aborted' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.pregnancy_status || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Expected Calving</label>
                          <p className="text-sm font-medium text-gray-900">
                            {record.expected_calving_date ? new Date(record.expected_calving_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="hidden sm:flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleMoreInfoClick(record)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                            title="More Info"
                          >
                            <InfoIcon className="h-4 w-4" />
                            More Info
                          </button>
                          <button 
                            onClick={() => handleEditClick(record)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                            title="Edit"
                          >
                            <EditIcon className="h-4 w-4" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleUpdateStatusClick(record)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100"
                            title="Update Status"
                          >
                            <FileTextIcon className="h-4 w-4" />
                            Status
                          </button>
                          <button 
                            onClick={() => handleAttachFilesClick(record)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
                            title="Attach Files"
                          >
                            <PaperclipIcon className="h-4 w-4" />
                            Files
                          </button>
                        </div>
                      </div>
                      {/* Mobile actions: primary + collapsible more */}
                      <div className="sm:hidden pt-4 border-t border-gray-100">
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => handleMoreInfoClick(record)}
                            className="w-full justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                            title="More Info"
                          >
                            <InfoIcon className="h-4 w-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => toggleAIAction(record._id)}
                            className="w-full justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            aria-expanded={!!expandedAIActionIds[record._id]}
                            aria-controls={`ai-actions-${record._id}`}
                          >
                            {expandedAIActionIds[record._id] ? 'Hide Actions' : 'Show Actions'}
                          </button>
                          {expandedAIActionIds[record._id] && (
                            <div id={`ai-actions-${record._id}`} className="grid grid-cols-1 gap-2 mt-1">
                              <button 
                                onClick={() => handleEditClick(record)}
                                className="w-full justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                                title="Edit"
                              >
                                <EditIcon className="h-4 w-4" />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleUpdateStatusClick(record)}
                                className="w-full justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100"
                                title="Update Status"
                              >
                                <FileTextIcon className="h-4 w-4" />
                                Status
                              </button>
                              <button 
                                onClick={() => handleAttachFilesClick(record)}
                                className="w-full justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
                                title="Attach Files"
                              >
                                <PaperclipIcon className="h-4 w-4" />
                                Files
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              <div className="flex items-center justify-end mb-4">
                <FarmReportGenerator 
                  farm={farm}
                  animals={animals}
                  aiData={aiData}
                  milkData={milkData}
                />
              </div>
              <FarmAnalytics 
                animals={animals}
                aiData={aiData}
                milkData={milkData}
                farm={farm}
              />
            </div>
          )}
        </div>
      </div>

      {/* Animal Modal */}
      <AnimalModal
        isOpen={showAnimalModal}
        onClose={() => setShowAnimalModal(false)}
        onAddAnimal={handleAddAnimal}
        preSelectedFarmId={farm?._id}
      />

      {/* Animal Edit Modal */}
      <AnimalEditModal
        isOpen={showAnimalEditModal}
        onClose={() => setShowAnimalEditModal(false)}
        onUpdateAnimal={handleUpdateAnimal}
        animal={selectedAnimal}
      />

      {/* Animal Info Modal */}
      <AnimalInfoModal
        isOpen={showAnimalInfoModal}
        onClose={() => setShowAnimalInfoModal(false)}
        animal={selectedAnimal}
        aiRecords={selectedAnimalAIRecords}
      />

      {/* AI Record Modal */}
      <AIRecordModal
        isOpen={showAIRecordModal}
        onClose={() => setShowAIRecordModal(false)}
        farmId={id}
        animals={animals}
        onAddSuccess={handleAddAIRecord}
      />

      {/* Pregnancy Status Modal */}
      <PregnancyStatusModal
        isOpen={showPregnancyStatusModal}
        onClose={() => setShowPregnancyStatusModal(false)}
        aiRecord={selectedAIRecord}
        onUpdateSuccess={handleUpdatePregnancyStatus}
      />

      {/* AI Info Modal */}
      <AIInfoModal
        isOpen={showAIInfoModal}
        onClose={() => setShowAIInfoModal(false)}
        aiRecord={selectedAIRecord}
      />

      {/* AI Edit Modal */}
      <AIEditModal
        isOpen={showAIEditModal}
        onClose={() => setShowAIEditModal(false)}
        aiRecord={selectedAIRecord}
        onSave={handleSaveAIRecord}
      />

      {/* AI Attachment Modal */}
      <AIAttachmentModal
        isOpen={showAIAttachmentModal}
        onClose={() => setShowAIAttachmentModal(false)}
        aiRecord={selectedAIRecord}
      />

      {/* Edit Farm Modal */}
      <EditFarmModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        farm={farm}
        onUpdateSuccess={handleFarmUpdate}
      />
    </div>
  );
}
