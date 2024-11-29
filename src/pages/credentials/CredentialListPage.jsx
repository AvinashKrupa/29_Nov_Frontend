import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMemo } from 'react';
import {server} from '../../sever'
const CredentialListPage = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [credentials, setCredentials] = useState([]); // Start with an empty array
  const [editingId, setEditingId] = useState(null);
  const [editedCredential, setEditedCredential] = useState(null);

  // Fetch credentials function
  const fetchCredentials = async () => {
    try {
      const response = await axios.get(`${server}/credentials/${type}`, { withCredentials: true });
      if (response.data.success) {
        setCredentials(response.data.credential); // Set the fetched credentials to state
      } else {
        toast.error('Error fetching credentials');
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Error fetching credentials');
    }
  };

  // Fetch credentials on mount and when type changes
  useEffect(() => {
    fetchCredentials();
  }, [type]); // Re-run the effect if 'type' changes

  const handleEdit = (credential) => {
    setEditingId(credential._id);
    setEditedCredential({ ...credential });
  };

  const handleSave = async (_id) => {
    try {
      // Optimistically update the local state
      setCredentials((prevCredentials) =>
        prevCredentials.map((cred) =>
          cred._id === _id
            ? { ...editedCredential, lastUpdated: new Date().toISOString() }
            : cred
        )
      );
  
      // Call the API to save the updated credential
      const response = await axios.put(
        `${server}/credentials/${_id}`,
        editedCredential, // Send the updated credential data
        { withCredentials: true }
      );
  
      if (response.data.success) {
        toast.success('Credential updated successfully');
        // Optionally re-fetch credentials to ensure consistency
        fetchCredentials();
      } else {
        toast.error('Failed to update credential');
      }
    } catch (error) {
      console.error('Error updating credential:', error);
      toast.error('Error updating credential');
      // Re-fetch to restore state if an error occurs
      fetchCredentials();
    }
  
    // Reset editing state
    setEditingId(null);
    setEditedCredential(null);
  };

  const handleDelete = async (_id) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      setCredentials((prevCredentials) =>
        prevCredentials.filter((cred) => cred._id !== _id)
      );

      try {
        const response = await axios.delete(`${server}/credentials/${_id}`, { withCredentials: true });

        if (response.data.success) {
          toast.success('Credential deleted successfully');
          fetchCredentials();
        } else {
          toast.error('Failed to delete credential');
          fetchCredentials();
        }
      } catch (error) {
        console.error('Error deleting credential:', error);
        toast.error('Error deleting credential');
        fetchCredentials();
      }
    }
  };

  const handleInputChange = (field, value) => {
    setEditedCredential((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredCredentials = useMemo(() => {
    return credentials.filter((cred) =>
      cred.bankName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [credentials, searchQuery]);
  return (
    <div className="pt-24 min-h-screen bg-dark-100">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-accent-100 hover:text-accent-200 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {type.charAt(0).toUpperCase() + type.slice(1)} Credentials
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/credentials/${type}/add`)}
              className="flex items-center px-4 py-2 rounded-lg bg-accent-100 text-dark-100 hover:bg-accent-200 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New
            </motion.button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-200 border border-dark-300 text-white focus:outline-none focus:border-accent-100"
            />
          </div>

          <div className="space-y-4">
            {filteredCredentials.map((credential) => (
              <motion.div
                key={credential.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-lg bg-dark-200 hover:bg-dark-300 transition-colors"
              >
                {editingId === credential._id ? (
                  <div className="space-y-4">
                    {/* Input fields for editing */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editedCredential.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-300 border border-dark-400 text-white focus:outline-none focus:border-accent-100"
                      />
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={editedCredential.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-300 border border-dark-400 text-white focus:outline-none focus:border-accent-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={editedCredential.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-300 border border-dark-400 text-white focus:outline-none focus:border-accent-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Account Type
                      </label>
                      <input
                        type="text"
                        value={editedCredential.accountType}
                        onChange={(e) => handleInputChange('accountType', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-300 border border-dark-400 text-white focus:outline-none focus:border-accent-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                       Username
                      </label>
                      <input
                        type="text"
                        value={editedCredential.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-300 border border-dark-400 text-white focus:outline-none focus:border-accent-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                       Password
                      </label>
                      <input
                        type="text"
                        value={editedCredential.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-300 border border-dark-400 text-white focus:outline-none focus:border-accent-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                       IFSC code
                      </label>
                      <input
                        type="text"
                        value={editedCredential.ifscCode}
                        onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-300 border border-dark-400 text-white focus:outline-none focus:border-accent-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                       Branch Name
                      </label>
                      <input
                        type="text"
                        value={editedCredential.branchName}
                        onChange={(e) => handleInputChange('branchName', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-dark-300 border border-dark-400 text-white focus:outline-none focus:border-accent-100"
                      />
                    </div>
                    {/* Additional input fields for bank name, account number, notes */}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-lg border border-accent-100 text-accent-100 hover:bg-accent-100/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(credential._id)}
                        className="px-4 py-2 rounded-lg bg-accent-100 text-dark-100 hover:bg-accent-200 flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {credential.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {credential.bankName} • {credential.accountNumber}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Last updated: {new Date(credential.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(credential)}
                          className="p-2 rounded-lg bg-dark-300 hover:bg-dark-400 transition-colors text-accent-100"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(credential._id)}
                          className="p-2 rounded-lg bg-dark-300 hover:bg-dark-400 transition-colors text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {credential.notes && (
                      <p className="mt-4 text-gray-300">
                        {credential.notes}
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            ))}

            {filteredCredentials.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No credentials found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CredentialListPage;
