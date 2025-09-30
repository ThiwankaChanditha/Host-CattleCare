import React, { useState, useEffect } from "react";
import { SearchIcon, CalendarIcon, UsersIcon, MapPinIcon, InfoIcon, EditIcon, PaperclipIcon, PlusIcon, FilterIcon } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ProgramInfoModal from "../../components/ProgramInfoModal";
import ProgramEditModal from "../../components/ProgramEditModal";
import ProgramAttachmentModal from "../../components/ProgramAttachmentModal";
import AddPortfolioModal from "../../components/AddPortfolioModal";

export default function Portfolio() {
  const { token } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showNewPortfolioModal, setShowNewPortfolioModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:5000/api/programs", {
          params: filterType === "all" ? {} : { type: filterType },
        });
        setPrograms(response.data);
      } catch (err) {
        setError("Failed to load extension programs");
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [filterType]);

  // Unique program types for filter dropdown
  const uniqueTypes = [
    "all",
    ...Array.from(new Set(programs.map((p) => p.program_type))).filter(Boolean),
  ];

  // Filter and search logic
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program.description && program.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (program.location && program.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleMoreInfo = (program) => {
    setSelectedProgram(program);
    setShowInfoModal(true);
  };

  const handleEdit = (program) => {
    setSelectedProgram(program);
    setShowEditModal(true);
  };

  const handleAttachments = (program) => {
    setSelectedProgram(program);
    setShowAttachmentModal(true);
  };

  const handleAddNewPortfolio = () => {
    setShowNewPortfolioModal(true);
  };

  const handlePortfolioCreated = (newProgram) => {
    // Add the new program to the beginning of the programs list
    setPrograms(prevPrograms => [newProgram, ...prevPrograms]);
  };

  const handleSaveProgram = async (programId, updatedData) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/programs/${programId}`, updatedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update the programs list with the updated program
      setPrograms(prevPrograms => 
        prevPrograms.map(program => 
          program._id === programId ? response.data : program
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <button
          onClick={handleAddNewPortfolio}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Portfolio
        </button>
      </div>

      {/* Mobile filters toggle */}
      <div className="sm:hidden mb-2">
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
        >
          <span className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4" /> Filters
          </span>
          <span className="text-sm text-gray-500">{filtersOpen ? 'Hide' : 'Show'}</span>
        </button>
      </div>

      <div className="mb-6">
        <div className={`mt-2 sm:mt-0 ${filtersOpen ? 'block' : 'hidden'} sm:block`}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full sm:w-56 border border-gray-300 rounded-lg px-3 py-2"
            >
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading programs...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : filteredPrograms.length === 0 ? (
        <p className="text-gray-500 text-center text-lg mt-10">No programs found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 max-h-[70vh] overflow-y-auto pr-2">
  {filteredPrograms.map(program => (
    <div 
      key={program._id} 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
    >
      {/* Card Content */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">{program.program_name}</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-1">{program.program_type}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 mt-2 md:mt-0">
            <span className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {program.program_date ? new Date(program.program_date).toLocaleDateString() : "-"}
            </span>
            <span className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {program.location || "-"}
            </span>
            <span className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-1" />
              {program.participants_count || 0} participants
            </span>
          </div>
        </div>

        <div className="mb-2">
          <span className="font-medium text-gray-700">Conducted by: </span>
          {program.conducted_by?.name || program.conducted_by?.username || "N/A"}
        </div>
        <div className="mb-2">
          <span className="font-medium text-gray-700">Description: </span>
          {program.description || <span className="italic text-gray-400">No description</span>}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Created: {program.created_at ? new Date(program.created_at).toLocaleString() : "-"}
        </div>
      </div>

      {/* Action Buttons fixed at bottom */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => handleMoreInfo(program)}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          <InfoIcon className="h-4 w-4" />
          More Info
        </button>
        <button
          onClick={() => handleEdit(program)}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
        >
          <EditIcon className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={() => handleAttachments(program)}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
        >
          <PaperclipIcon className="h-4 w-4" />
          Attach Files
        </button>
      </div>
    </div>
  ))}
</div>

      )}

      {/* Program Info Modal */}
      <ProgramInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        program={selectedProgram}
      />

      {/* Program Edit Modal */}
      <ProgramEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        program={selectedProgram}
        onSave={handleSaveProgram}
      />

      {/* Program Attachment Modal */}
      <ProgramAttachmentModal
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        program={selectedProgram}
      />

      {/* Add Portfolio Modal */}
      <AddPortfolioModal
        isOpen={showNewPortfolioModal}
        onClose={() => setShowNewPortfolioModal(false)}
        onSuccess={handlePortfolioCreated}
      />
    </>
  );
}