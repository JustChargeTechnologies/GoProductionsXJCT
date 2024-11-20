import React, { useState, useEffect } from 'react';
import { Pencil, Plus, X, Eye, EyeOff } from 'lucide-react';
import UploadModal from './UploadModal';
import AddCampaignModal from './AddCampaignModal';
import { getClients, getStills, updateStill, deleteStill } from '../firebase';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-black border border-gray-800 rounded-lg p-8 max-w-md w-full mx-4'>
        <h2 className='text-white text-xl font-bold text-center mb-6'>
          ARE YOU SURE YOU WANT TO REMOVE THIS STILL?
        </h2>
        <div className='flex justify-center gap-4'>
          <button
            onClick={onConfirm}
            className='px-8 py-2 bg-transparent border border-green-500 text-green-500 rounded hover:bg-green-500/10'
          >
            YES
          </button>
          <button
            onClick={onClose}
            className='px-8 py-2 bg-transparent border border-red-500 text-red-500 rounded hover:bg-red-500/10'
          >
            NO
          </button>
        </div>
      </div>
    </div>
  );
};

const StillDashboardComponent = () => {
  const [stills, setStills] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedStill, setSelectedStill] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stillToDelete, setStillToDelete] = useState(null);
  const [hoveredStill, setHoveredStill] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [showCreditDropdown, setShowCreditDropdown] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [hiddenFields, setHiddenFields] = useState({});
  const [visibleFields, setVisibleFields] = useState({});

  const creditOptions = ['PHOTOGRAPHER', 'BRAND', 'STYLIST', 'CREW MEMBERS'];

  useEffect(() => {
    fetchStills();
    fetchClients();
  }, []);

  const fetchStills = async () => {
    try {
      const fetchedStills = await getStills();
      setStills(fetchedStills);
      // Initialize visibility state based on fetched data
      if (fetchedStills.length > 0) {
        const initialVisibility = {};
        fetchedStills.forEach((still) => {
          initialVisibility[still.id] = still.visibleFields || {};
        });
        setVisibleFields(initialVisibility);
      }
    } catch (error) {
      console.error('Error fetching stills:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const fetchedClients = await getClients();
      setClients(fetchedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleStillClick = (still) => {
    setSelectedStill(still);
    setEditingField(null);
  };

  const handleAddNew = () => {
    setShowAddCampaignModal(true);
  };

  const handleUpload = async (files, urls) => {
    if (selectedStill) {
      try {
        let updatedStillData = { ...selectedStill };
        if (uploadType === 'main') {
          updatedStillData.image = urls[0];
        } else if (uploadType === 'grid') {
          const newInternalImages = { ...updatedStillData.internalImages };
          files.forEach((file, index) => {
            newInternalImages[
              `item${Object.keys(newInternalImages).length + 1}`
            ] = file;
          });
          updatedStillData.internalImages = newInternalImages;
          console.log('Updated still image', updatedStillData.internalImages);
        }
        const updatedStill = await updateStill(
          selectedStill.clientId,
          selectedStill.id,
          updatedStillData
        );
        setStills(
          stills.map((s) => (s.id === updatedStill.id ? updatedStill : s))
        );
        setSelectedStill(updatedStill);
      } catch (error) {
        console.error('Error updating still:', error);
      }
    }
    setShowUploadModal(false);
  };

  const handleDeleteClick = (e, still) => {
    e.stopPropagation();
    setStillToDelete(still);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (stillToDelete) {
      try {
        await deleteStill(stillToDelete.clientId, stillToDelete.id);
        setStills(stills.filter((s) => s.id !== stillToDelete.id));
        if (selectedStill && selectedStill.id === stillToDelete.id) {
          setSelectedStill(null);
        }
      } catch (error) {
        console.error('Error deleting still:', error);
      } finally {
        setShowDeleteModal(false);
        setStillToDelete(null);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('credits.')) {
      const creditKey = name.split('.')[1];
      setSelectedStill((prev) => ({
        ...prev,
        credits: { ...prev.credits, [creditKey]: value },
      }));
    } else {
      setSelectedStill((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      const updatedStill = await updateStill(
        selectedStill.clientId,
        selectedStill.id,
        {
          ...selectedStill,
          visibleFields: visibleFields[selectedStill.id] || {},
        }
      );
      setStills(
        stills.map((s) => (s.id === updatedStill.id ? updatedStill : s))
      );
      setEditingField(null);
    } catch (error) {
      console.error('Error saving still:', error);
    }
  };

  const handleAddCredit = (creditType) => {
    if (creditType === 'CREW MEMBERS') {
      const newKey = `CREW MEMBER ${
        Object.keys(selectedStill.credits).filter((k) =>
          k.startsWith('CREW MEMBER')
        ).length + 1
      }`;
      setSelectedStill((prev) => ({
        ...prev,
        credits: { ...prev.credits, [newKey]: '' },
      }));
    } else {
      setSelectedStill((prev) => ({
        ...prev,
        credits: { ...prev.credits, [creditType]: '' },
      }));
    }
    setShowCreditDropdown(false);
    handleSave();
  };

  const handleRemoveCredit = (creditKey) => {
    setSelectedStill((prev) => {
      const newCredits = { ...prev.credits };
      delete newCredits[creditKey];
      return { ...prev, credits: newCredits };
    });
    handleSave();
  };

  const toggleFieldVisibility = async (field) => {
    if (selectedStill) {
      const updatedVisibility = {
        ...visibleFields[selectedStill.id],
        [field]: !visibleFields[selectedStill.id]?.[field],
      };

      setVisibleFields((prev) => ({
        ...prev,
        [selectedStill.id]: updatedVisibility,
      }));

      try {
        // Update the still in Firestore
        await updateStill(selectedStill.clientId, selectedStill.id, {
          ...selectedStill,
          visibleFields: updatedVisibility,
        });
      } catch (error) {
        console.error('Error updating field visibility:', error);
        // Revert the local state if the update fails
        setVisibleFields((prev) => ({
          ...prev,
          [selectedStill.id]: visibleFields[selectedStill.id],
        }));
      }
    }
  };

  return (
    <div className='p-8 m-8'>
      <h2 className='text-2xl font-bold mb-4'>STILL CAMPAIGN</h2>

      {/* Campaign Thumbnails */}
      <div className='grid grid-cols-1 p-8 bg-[#1C1C1C] backdrop-blur-[84px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8'>
        {stills.map((still) => (
          <div
            key={still.id}
            className='relative cursor-pointer group'
            onClick={() => handleStillClick(still)}
            onMouseEnter={() => setHoveredStill(still.id)}
            onMouseLeave={() => setHoveredStill(null)}
          >
            <img
              src={still.image}
              alt={still.text}
              className='w-full h-40 object-cover'
            />
            <button
              onClick={(e) => handleDeleteClick(e, still)}
              className='absolute top-2 right-2 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10'
            >
              <X className='h-4 w-4 text-white' />
            </button>
            {hoveredStill === still.id && (
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                <span className='bg-white text-black px-2 py-1 rounded flex items-center'>
                  <Pencil className='h-4 w-4 mr-1' /> EDIT DETAILS
                </span>
              </div>
            )}
            <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2'>
              <p className='text-sm'>{still.text}</p>
            </div>
          </div>
        ))}
        <div
          className='flex items-center justify-center bg-zinc-800 h-40 cursor-pointer hover:bg-gray-700 transition-colors'
          onClick={handleAddNew}
        >
          <Plus className='h-8 w-8' />
        </div>
      </div>

      {/* Campaign Details */}
      {selectedStill && (
        <div className='relative'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-bold'>CAMPAIGN DETAILS</h3>
            <button
              onClick={() => setSelectedStill(null)}
              className='bg-white text-black rounded-full p-1'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='p-6 bg-[#1C1C1C] backdrop-blur-[84px] grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <img
                src={selectedStill.image}
                alt='Campaign'
                className='w-full h-64 object-cover'
              />
            </div>
            <div className='space-y-4'>
              <div className='flex items-center justify-between border border-white p-2 rounded'>
                <span>LOGO</span>
                <div className='flex flex-row'>
                  <img src={selectedStill.logo} alt='Logo' className='h-8' />
                </div>
              </div>
              <div className='border border-white p-2 rounded'>
                <div className='flex items-center justify-between'>
                  <span>TITLE</span>
                  <div>
                    <button
                      onClick={() => setEditingField('text')}
                      className='mr-2'
                    >
                      <Pencil className='h-4 w-4' />
                    </button>
                  </div>
                </div>
                {editingField === 'text' ? (
                  <input
                    type='text'
                    name='text'
                    value={selectedStill.text}
                    onChange={handleInputChange}
                    onBlur={handleSave}
                    className='w-full bg-transparent mt-2 focus:outline-none'
                    placeholder='Enter title'
                    autoFocus
                  />
                ) : (
                  <p
                    className={`mt-2 ${
                      hiddenFields['title'] ? 'opacity-50' : ''
                    }`}
                  >
                    {selectedStill.text}
                  </p>
                )}
              </div>
              <button
                className='border border-white p-2 rounded w-full text-left flex items-center justify-between'
                onClick={() => {
                  setUploadType('main');
                  setShowUploadModal(true);
                }}
              >
                <span>CHANGE PICTURE</span>
                <Pencil className='h-4 w-4' />
              </button>
            </div>
          </div>

          {/* Campaign Grid */}
          <h3 className='text-xl font-bold my-4'>CAMPAIGN GRID</h3>
          <div className='p-6 bg-[#1C1C1C] backdrop-blur-[84px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {selectedStill.internalImages &&
              Object.entries(selectedStill.internalImages).map(
                ([key, value]) => (
                  <div key={key} className='relative group'>
                    <img
                      src={value}
                      alt={`Grid ${key}`}
                      className='w-full h-32 object-cover'
                    />
                    <button
                      className='absolute top-2 right-2 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                      onClick={() => {
                        const updatedInternalImages = {
                          ...selectedStill.internalImages,
                        };
                        delete updatedInternalImages[key];
                        setSelectedStill((prev) => ({
                          ...prev,
                          internalImages: updatedInternalImages,
                        }));
                        handleSave();
                      }}
                    >
                      <X className='h-4 w-4 text-white' />
                    </button>
                  </div>
                )
              )}
            <div
              className='flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 h-32 cursor-pointer'
              onClick={() => {
                setUploadType('grid');
                setShowUploadModal(true);
              }}
            >
              <Plus className='h-8 w-8' />
            </div>
          </div>

          {/* Campaign Credits */}
          <h3 className='text-xl font-bold my-4'>CAMPAIGN CREDITS</h3>
          <div className='p-6 bg-[#1C1C1C] backdrop-blur-[84px] space-y-2'>
            <div className='flex items-center justify-between border border-white p-2 rounded'>
              <span>CLIENT</span>
              <select
                name='clientId'
                value={selectedStill.clientId}
                onChange={handleInputChange}
                className='bg-transparent text-white text-right'
                disabled
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            {Object.entries(selectedStill.credits).map(([key, value]) => (
              <div
                key={key}
                className='flex items-center justify-between border border-white p-3 rounded'
              >
                <div className='flex items-center flex-row'>
                  <span>{key}:</span>
                  <div className='flex items-center ml-3 space-x-2'>
                    {editingField === `credits.${key}` ? (
                      <input
                        type='text'
                        name={`credits.${key}`}
                        value={value}
                        onChange={handleInputChange}
                        onBlur={() => {
                          handleSave();
                          setEditingField(null);
                        }}
                        className='bg-transparent text-left focus:outline-none'
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`text-gray-400 ${
                          hiddenFields[`credits.${key}`] ? 'opacity-50' : ''
                        }`}
                      >
                        {value || 'Click pencil to edit...'}
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex items-center flex-row gap-2'>
                  <Pencil
                    className='h-4 w-4 cursor-pointer'
                    onClick={() => setEditingField(`credits.${key}`)}
                  />
                  {key !== 'PRODUCT TITLE' && (
                    <button
                      onClick={() => toggleFieldVisibility(`credits.${key}`)}
                    >
                      {visibleFields[selectedStill.id]?.[`credits.${key}`] ===
                      false ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className='relative'>
              <button
                className='flex items-center space-x-2 w-1/6 border border-white px-4 py-2 rounded justify-between'
                onClick={() => setShowCreditDropdown(!showCreditDropdown)}
              >
                <span>ADD</span>
                <Plus className='h-4 w-4' />
              </button>
              {showCreditDropdown && (
                <div className='absolute top-full left-0 w-1/6 bg-white text-black mt-1 rounded shadow-lg'>
                  {creditOptions.map((option) => (
                    <button
                      key={option}
                      className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                      onClick={() => handleAddCredit(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AddCampaignModal
        isOpen={showAddCampaignModal}
        onClose={() => setShowAddCampaignModal(false)}
        onAddStill={fetchStills}
        clients={clients}
      />

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        acceptVideo={false}
        multiple={uploadType === 'grid'}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStillToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default StillDashboardComponent;