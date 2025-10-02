import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddUser = ({ editMode = false, initialData = {}, onEditComplete }) => {
  // const { t } = useTranslation(); // Not used in this component

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    role_name: '',
    is_active: true,
    division_id: '',
    nic: '',
    contact_number: '',
    address: '',
  });

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [vsDivisions, setVsDivisions] = useState([]);
  const [ldiDivisions, setLdiDivisions] = useState([]);
  const [gnDivisions, setGnDivisions] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVsDivision, setSelectedVsDivision] = useState('');
  const [selectedLdiDivision, setSelectedLdiDivision] = useState('');
  const [selectedGnDivision, setSelectedGnDivision] = useState('');

  const API_BASE_URL = "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Helper functions to determine visibility/enabled state of location selectors based on role
  const showProvince = () => {
    return ['Director General', 'Provincial Director', 'Regional Director', 'veterinarian', 'ldi_officer', 'Farmer'].includes(formData.role_name);
  };
  const showDistrict = () => {
    return ['Regional Director', 'veterinarian', 'ldi_officer', 'Farmer'].includes(formData.role_name);
  };

  const showVsDivision = () => {
    return ['veterinarian', 'ldi_officer', 'Farmer'].includes(formData.role_name);
  };

  const showLdiDivision = () => {
    return ['ldi_officer', 'Farmer'].includes(formData.role_name);
  };

  const showGnDivision = () => {
    return formData.role_name === 'Farmer';
  };

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`/api/admin/administrative_division/filter`, {
          params: { division_type: 'PD' }
        });
        setProvinces(response.data.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when selectedProvince changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict('');
      return;
    }
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`/api/admin/administrative_division/filter`, {
          params: { division_type: 'RD', parent_division_id: selectedProvince }
        });
        setDistricts(response.data.data);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Fetch VS divisions when selectedDistrict changes
  useEffect(() => {
    if (!selectedDistrict) {
      setVsDivisions([]);
      setSelectedVsDivision('');
      return;
    }
    const fetchVsDivisions = async () => {
      try {
        const response = await axios.get(`/api/admin/administrative_division/filter`, {
          params: { division_type: 'VS', parent_division_id: selectedDistrict }
        });
        setVsDivisions(response.data.data);
      } catch (error) {
        console.error('Error fetching VS divisions:', error);
      }
    };
    fetchVsDivisions();
  }, [selectedDistrict]);

  // Fetch LDI divisions when selectedVsDivision changes
  useEffect(() => {
    if (!selectedVsDivision) {
      setLdiDivisions([]);
      setSelectedLdiDivision('');
      return;
    }
    const fetchLdiDivisions = async () => {
      try {
        const response = await axios.get(`/api/admin/administrative_division/filter`, {
          params: { division_type: 'LDI', parent_division_id: selectedVsDivision }
        });
        setLdiDivisions(response.data.data);
      } catch (error) {
        console.error('Error fetching LDI divisions:', error);
      }
    };
    fetchLdiDivisions();
  }, [selectedVsDivision]);

  // Fetch GN divisions when selectedLdiDivision changes
  useEffect(() => {
    if (!selectedLdiDivision) {
      setGnDivisions([]);
      setSelectedGnDivision('');
      return;
    }
    const fetchGnDivisions = async () => {
      try {
        const response = await axios.get(`/api/admin/administrative_division/filter`, {
          params: { division_type: 'GN', parent_division_id: selectedLdiDivision }
        });
        setGnDivisions(response.data.data);
      } catch (error) {
        console.error('Error fetching GN divisions:', error);
      }
    };
    fetchGnDivisions();
  }, [selectedLdiDivision]);

  // Update formData.division_id when the final division is selected
  useEffect(() => {
    if (selectedGnDivision) {
      setFormData(prev => ({ ...prev, division_id: selectedGnDivision }));
    } else if (selectedLdiDivision) {
      setFormData(prev => ({ ...prev, division_id: selectedLdiDivision }));
    } else if (selectedVsDivision) {
      setFormData(prev => ({ ...prev, division_id: selectedVsDivision }));
    } else if (selectedDistrict) {
      setFormData(prev => ({ ...prev, division_id: selectedDistrict }));
    } else if (selectedProvince) {
      setFormData(prev => ({ ...prev, division_id: selectedProvince }));
    } else {
      setFormData(prev => ({ ...prev, division_id: '' }));
    }
  }, [selectedProvince, selectedDistrict, selectedVsDivision, selectedLdiDivision, selectedGnDivision]);

  // Handle selection changes for dropdowns
  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedDistrict('');
    setSelectedVsDivision('');
    setSelectedLdiDivision('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedVsDivision('');
    setSelectedLdiDivision('');
  };

  const handleVsDivisionChange = (e) => {
    setSelectedVsDivision(e.target.value);
    setSelectedLdiDivision('');
  };

  const handleLdiDivisionChange = (e) => {
    setSelectedLdiDivision(e.target.value);
  };

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        username: initialData.username || '',
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        role_name: initialData.role_name || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        division_id: initialData.division_id || '',
        nic: initialData.nic || '',
        contact_number: initialData.contact_number || '',
        address: initialData.address || '',
      });
      // Set selected divisions based on initialData.division_id if available
      const fetchInitialDivisions = async () => {
        if (!initialData.division_id) return;
        try {
          // Fetch the division and its parents to set selected values
          const response = await axios.get(`/api/admin/administrative_division/${initialData.division_id}`);
          const division = response.data.data;
          if (!division) return;
          // Set selected divisions based on division_type and parent_division_id
          if (division.division_type === 'PD') {
            setSelectedProvince(division._id);
          } else if (division.division_type === 'RD') {
            setSelectedProvince(division.parent_division_id);
            setSelectedDistrict(division._id);
          } else if (division.division_type === 'VS') {
            // Fetch district to get its parent province
            const districtResponse = await axios.get(`/api/admin/administrative_division/${division.parent_division_id}`);
            const district = districtResponse.data.data;
            setSelectedProvince(district.parent_division_id);
            setSelectedDistrict(division.parent_division_id);
            setSelectedVsDivision(division._id);
          } else if (division.division_type === 'LDI') {
            // Fetch VS division and district to get parents
            const vsResponse = await axios.get(`/api/admin/administrative_division/${division.parent_division_id}`);
            const vsDivision = vsResponse.data.data;
            const districtResponse = await axios.get(`/api/admin/administrative_division/${vsDivision.parent_division_id}`);
            const district = districtResponse.data.data;
            setSelectedProvince(district.parent_division_id);
            setSelectedDistrict(vsDivision.parent_division_id);
            setSelectedVsDivision(division.parent_division_id);
            setSelectedLdiDivision(division._id);
          } else if (division.division_type === 'GN') {
            // Fetch LDI division, VS division and district to get parents
            const ldiResponse = await axios.get(`/api/admin/administrative_division/${division.parent_division_id}`);
            const ldiDivision = ldiResponse.data.data;
            const vsResponse = await axios.get(`/api/admin/administrative_division/${ldiDivision.parent_division_id}`);
            const vsDivision = vsResponse.data.data;
            const districtResponse = await axios.get(`/api/admin/administrative_division/${vsDivision.parent_division_id}`);
            const district = districtResponse.data.data;
            setSelectedProvince(district.parent_division_id);
            setSelectedDistrict(vsDivision.parent_division_id);
            setSelectedVsDivision(ldiDivision.parent_division_id);
            setSelectedLdiDivision(division.parent_division_id);
            setSelectedGnDivision(division._id);
          }
        } catch (error) {
          console.error('Error fetching initial divisions:', error);
        }
      };
      fetchInitialDivisions();
    }
  }, [editMode, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editMode) {
        // Update existing user
        await axios.put(`/api/admin/users/${initialData._id}`, formData);
        setSuccess('User updated successfully!');
        if (onEditComplete) {
          onEditComplete();
        }
      } else {
        // Create new user
        await axios.post(`/api/admin`, formData);
        setSuccess('User added successfully!');
        setFormData({
          username: '',
          full_name: '',
          email: '',
          role_name: '',
          is_active: true,
          division_id: '',
          nic: '',
          contact_number: '',
          address: '',
        });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(editMode ? 'Failed to update user. Please try again.' : 'Failed to add user. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit User' : 'Add User'}</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <input
            type="text"
            name="full_name"
            placeholder="Enter Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            name="role_name"
            value={formData.role_name || ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="" disabled>Select Role</option>
            <option value="Director General">Assitant Director General(ADG)</option>
            <option value="Provincial Director">Provincial Director (PD)</option>
            <option value="Regional Director">Regional Director (RD)</option>
            <option value="veterinarian">Veterinary Surgeon</option>
            <option value="ldi_officer">LDI Officer</option>
            <option value="Farmer">Farmer</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Active Status</label>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="mr-2 leading-tight"
          />
          <span>Active</span>
        </div>
        {showProvince() && (
          <div>
            <label className="block mb-1 font-medium">Province</label>
            <select
              name="province"
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select Province</option>
              {provinces.map(province => (
                <option key={province._id} value={province._id}>{province.division_name}</option>
              ))}
            </select>
          </div>
        )}
        {showDistrict() && (
          <div>
            <label className="block mb-1 font-medium">District</label>
            <select
              name="district"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={!selectedProvince}
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district._id} value={district._id}>{district.division_name}</option>
              ))}
            </select>
          </div>
        )}
        {showVsDivision() && (
          <div>
            <label className="block mb-1 font-medium">VS Division</label>
            <select
              name="vsDivision"
              value={selectedVsDivision}
              onChange={handleVsDivisionChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={!selectedDistrict}
            >
              <option value="">Select VS Division</option>
              {vsDivisions.map(vs => (
                <option key={vs._id} value={vs._id}>{vs.division_name}</option>
              ))}
            </select>
          </div>
        )}
        {showLdiDivision() && (
          <div>
            <label className="block mb-1 font-medium">LDI Division</label>
            <select
              name="ldiDivision"
              value={selectedLdiDivision}
              onChange={handleLdiDivisionChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={!selectedVsDivision}
            >
              <option value="">Select LDI Division</option>
              {ldiDivisions.map(ldi => (
                <option key={ldi._id} value={ldi._id}>{ldi.division_name}</option>
              ))}
            </select>
          </div>
        )}
        {showGnDivision() && (
          <div>
            <label className="block mb-1 font-medium">GN Division</label>
            <select
              name="gnDivision"
              value={selectedGnDivision}
              onChange={(e) => setSelectedGnDivision(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={!selectedLdiDivision}
            >
              <option value="">Select GN Division</option>
              {gnDivisions.map(gn => (
                <option key={gn._id} value={gn._id}>{gn.division_name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block mb-1 font-medium">NIC</label>
          <input
            type="text"
            name="nic"
            placeholder="Enter NIC"
            value={formData.nic}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Contact Number</label>
          <input
            type="text"
            name="contact_number"
            placeholder="Enter Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Address</label>
          <input
            type="text"
            name="address"
            placeholder="Enter Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-green-900 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : editMode ? 'Update User' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default AddUser;