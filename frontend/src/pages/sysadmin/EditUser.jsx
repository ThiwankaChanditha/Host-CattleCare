import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EditUser = ({ editMode = false, initialData = {}, onEditComplete }) => {
  const { id } = useParams();
  const [userId, setUserId] = useState(initialData._id || id || '');
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
    rating: '',
  });

  const isEditMode = editMode || Boolean(id) || Boolean(initialData._id);

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [vsDivisions, setVsDivisions] = useState([]);
  const [ldiDivisions, setLdiDivisions] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVsDivision, setSelectedVsDivision] = useState('');
  const [selectedLdiDivision, setSelectedLdiDivision] = useState('');

  const API_BASE_URL = "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const showProvince = () => {
    return ['Provincial Director (PD)', 'Regional Director (RD)', 'Veterinary Surgeon (VS)', 'LDI Officer', 'Farmer'].includes(formData.role_name);
  };

  const showDistrict = () => {
    return ['Regional Director (RD)', 'Veterinary Surgeon (VS)', 'LDI Officer', 'Farmer'].includes(formData.role_name);
  };

  const showVsDivision = () => {
    return ['Veterinary Surgeon (VS)', 'LDI Officer', 'Farmer'].includes(formData.role_name);
  };

  const showLdiDivision = () => {
    return ['LDI Officer', 'Farmer'].includes(formData.role_name);
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

  // Update formData.division_id when the final division is selected
  useEffect(() => {
    const newDivisionId = selectedLdiDivision || selectedVsDivision || selectedDistrict || selectedProvince || '';
    setFormData(prev => {
      if (prev.division_id !== newDivisionId) {
        return { ...prev, division_id: newDivisionId };
      }
      return prev;
    });
  }, [selectedProvince, selectedDistrict, selectedVsDivision, selectedLdiDivision]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (editMode && id) {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`/api/admin/users/${id}`);
          const userData = response.data.data;
          setUserId(userData._id);
          setFormData({
            username: userData.username || '',
            full_name: userData.full_name || '',
            email: userData.email || '',
            role_name: userData.role_id ? userData.role_id.role_name : '',
            is_active: userData.is_active !== undefined ? userData.is_active : true,
            division_id: userData.division_id ? (typeof userData.division_id === 'object' ? userData.division_id._id : userData.division_id) : '',
            nic: userData.nic || '',
            contact_number: userData.contact_number || '',
            address: userData.address || '',
            rating: userData.rating || '',
          });

          const fetchInitialDivisions = async () => {
            if (!userData.division_id) return;
            const divisionId = typeof userData.division_id === 'object' ? userData.division_id._id : userData.division_id;
            try {
              const response = await axios.get(`/api/admin/administrative_division/${divisionId}`);
              const division = response.data.data;
              if (!division) return;
              if (division.division_type === 'PD') {
                setSelectedProvince(prev => prev !== division._id ? division._id : prev);
              } else if (division.division_type === 'RD') {
                setSelectedProvince(prev => prev !== division.parent_division_id ? division.parent_division_id : prev);
                setSelectedDistrict(prev => prev !== division._id ? division._id : prev);
              } else if (division.division_type === 'VS') {
                const districtResponse = await axios.get(`/api/admin/administrative_division/${division.parent_division_id}`);
                const district = districtResponse.data.data;
                setSelectedProvince(prev => prev !== district.parent_division_id ? district.parent_division_id : prev);
                setSelectedDistrict(prev => prev !== division.parent_division_id ? division.parent_division_id : prev);
                setSelectedVsDivision(prev => prev !== division._id ? division._id : prev);
              } else if (division.division_type === 'LDI') {
                const vsResponse = await axios.get(`/api/admin/administrative_division/${division.parent_division_id}`);
                const vsDivision = vsResponse.data.data;
                const districtResponse = await axios.get(`/api/admin/administrative_division/${vsDivision.parent_division_id}`);
                const district = districtResponse.data.data;
                setSelectedProvince(prev => prev !== district.parent_division_id ? district.parent_division_id : prev);
                setSelectedDistrict(prev => prev !== vsDivision.parent_division_id ? vsDivision.parent_division_id : prev);
                setSelectedVsDivision(prev => prev !== division.parent_division_id ? division.parent_division_id : prev);
                setSelectedLdiDivision(prev => prev !== division._id ? division._id : prev);
              }
            } catch (error) {
              console.error('Error fetching initial divisions:', error);
            }
          };
          fetchInitialDivisions();
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [editMode, id]);

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
        role_name: initialData.role_id ? initialData.role_id.role_name : '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        division_id: initialData.division_id ? (typeof initialData.division_id === 'object' ? initialData.division_id._id : initialData.division_id) : '',
        nic: initialData.nic || '',
        contact_number: initialData.contact_number || '',
        address: initialData.address || '',
        rating: initialData.rating || '',
      });

      const fetchInitialDivisions = async () => {
        if (!initialData.division_id) return;
        const divisionId = typeof initialData.division_id === 'object' ? initialData.division_id._id : initialData.division_id;
        try {
          const response = await axios.get(`/api/admin/administrative_division/${divisionId}`);
          const division = response.data.data;
          if (!division) return;
          if (division.division_type === 'PD') {
            setSelectedProvince(division._id);
          } else if (division.division_type === 'RD') {
            setSelectedProvince(division.parent_division_id);
            setSelectedDistrict(division._id);
          } else if (division.division_type === 'VS') {
            const districtResponse = await axios.get(`/api/admin/administrative_division/${division.parent_division_id}`);
            const district = districtResponse.data.data;
            setSelectedProvince(district.parent_division_id);
            setSelectedDistrict(division.parent_division_id);
            setSelectedVsDivision(division._id);
          } else if (division.division_type === 'LDI') {
            const vsResponse = await axios.get(`/api/admin/administrative_division/${division.parent_division_id}`);
            const vsDivision = vsResponse.data.data;
            const districtResponse = await axios.get(`/api/admin/administrative_division/${vsDivision.parent_division_id}`);
            const district = districtResponse.data.data;
            setSelectedProvince(district.parent_division_id);
            setSelectedDistrict(vsDivision.parent_division_id);
            setSelectedVsDivision(division.parent_division_id);
            setSelectedLdiDivision(division._id);
          }
        } catch (error) {
          console.error('Error fetching initial divisions:', error);
        }
      };
      fetchInitialDivisions();
    }
  }, [editMode, initialData._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editMode) {
        // Prepare data to send
        const dataToSend = { ...formData };
        if (dataToSend.division_id === '') {
          delete dataToSend.division_id;
        }
        // Update existing user using userId
        const userIdToUpdate = userId || initialData._id;
        await axios.put(`/api/admin/users/${userIdToUpdate}`, dataToSend);
        setSuccess('User updated successfully!');
        if (onEditComplete) {
          onEditComplete();
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update user. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">{isEditMode ? 'Edit User' : 'Add User'}</h2>
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
            <option value="Assitant Director General(ADG)">Assitant Director General(ADG)</option>
            <option value="Provincial Director (PD)">Provincial Director (PD)</option>
            <option value="Regional Director (RD)">Regional Director (RD)</option>
            <option value="Veterinary Surgeon (VS)">Veterinary Surgeon</option>
            <option value="LDI Officer">LDI Officer</option>
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
        <div>
          <label className="block mb-1 font-medium">Rating</label>
          <input
            type="number"
            name="rating"
            placeholder="Enter Rating"
            value={formData.rating}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="0"
            max="5"
            step="0.1"
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

export default EditUser;
