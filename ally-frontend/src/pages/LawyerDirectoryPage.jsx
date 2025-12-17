import React, { useState, useEffect } from 'react';
import { SearchPanel } from '../components/SearchPanel';
import { LawyerProfile } from '../components/LawyerProfile';
import { adminService } from '../services/adminService';

export const LawyerDirectoryPage = () => {
  // activeView removed; always show search view
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    specialty: 'All Specialties',
    location: '',
    experience: 'All Years',
    availability: 'Any Day',
    casesHandled: 'All Cases',
    rating: 'Any Rating'
  });
  const [fetchedLawyers, setFetchedLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const lawyersPerPage = 8;

  // Filtering logic moved here
  const filteredLawyers = fetchedLawyers.filter(lawyer => {
    // Exclude pending lawyers
    if (lawyer?.raw?.status === 'pending' || lawyer?.raw?.verificationStatus === 'pending') {
      return false;
    }
    // Search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      if (
        !(
          lawyer.name?.toLowerCase().includes(query) ||
          lawyer.specialty?.toLowerCase().includes(query) ||
          lawyer.location?.toLowerCase().includes(query) ||
          (lawyer.experience && lawyer.experience.toString().includes(query))
        )
      ) return false;
    }
    // Specialty
    if (filters.specialty && filters.specialty !== 'All Specialties' && !lawyer.specialty?.includes(filters.specialty)) return false;
    // Location
    if (filters.location && filters.location !== 'All Locations' && filters.location !== '' && !lawyer.location?.includes(filters.location)) return false;
    // Years of experience
    if (filters.experience && filters.experience !== 'All Years') {
      const years = Number(
        typeof lawyer.experience === 'string'
          ? lawyer.experience.replace(/\D/g, '')
          : lawyer.experience
      );
      if (filters.experience === '1-3' && !(years >= 1 && years <= 3)) return false;
      if (filters.experience === '4-7' && !(years >= 4 && years <= 7)) return false;
      if (filters.experience === '8+' && !(years >= 8)) return false;
    }
    // Cases handled
    if (filters.casesHandled && filters.casesHandled !== 'All Cases') {
      const cases = Number(lawyer.casesHandled);
      if (filters.casesHandled === '1-10' && !(cases >= 1 && cases <= 10)) return false;
      if (filters.casesHandled === '11-50' && !(cases >= 11 && cases <= 50)) return false;
      if (filters.casesHandled === '51+' && !(cases >= 51)) return false;
    }
    // Availability (if you have logic for this, add here)
    return true;
  });

  // Sort by cases handled, then experience (descending)
  filteredLawyers.sort((a, b) => {
    const aCases = Number(a.casesHandled) || 0;
    const bCases = Number(b.casesHandled) || 0;
    if (bCases !== aCases) {
      return bCases - aCases;
    }
    const aYears = Number(typeof a.experience === 'string' ? a.experience.replace(/\D/g, '') : a.experience) || 0;
    const bYears = Number(typeof b.experience === 'string' ? b.experience.replace(/\D/g, '') : b.experience) || 0;
    return bYears - aYears;
  });

  // Paginate the filtered lawyers
  const totalPages = Math.ceil(filteredLawyers.length / lawyersPerPage);
  const paginatedLawyers = filteredLawyers.slice(
    (currentPage - 1) * lawyersPerPage,
    currentPage * lawyersPerPage
  );

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        // Use adminService which aggregates verified and unverified lawyers
        const data = await adminService.getAllLawyers();

        const transformedData = data.map(lawyer => ({
          id: lawyer.userId || lawyer.id,
          name: `${lawyer.Fname || lawyer.firstName || lawyer.fname || ''} ${lawyer.Lname || lawyer.lastName || lawyer.lname || ''}`.trim(),
          specialty: lawyer.specialization && lawyer.specialization.length > 0 ? (Array.isArray(lawyer.specialization) ? lawyer.specialization.join(', ') : lawyer.specialization) : 'Not specified',
          location: [lawyer.city, lawyer.province].filter(Boolean).join(', '),
          rating: lawyer.rating || 0,
          experience: lawyer.experience ? (typeof lawyer.experience === 'string' && lawyer.experience.includes('year') ? lawyer.experience : `${lawyer.experience} years`) : 'N/A',
          fee: lawyer.consultationFee ? `₱${lawyer.consultationFee}/hour` : (lawyer.fee || 'N/A'),
          image: `${(lawyer.Fname || lawyer.firstName || lawyer.fname || '').charAt(0) || ''}${(lawyer.Lname || lawyer.lastName || lawyer.lname || '').charAt(0) || ''}`.toUpperCase(),
          profilePhotoUrl: lawyer.profilePhotoUrl || lawyer.profilePhoto || null,
          about: lawyer.bio || lawyer.about || 'No biography available.',
          education: lawyer.educationInstitution || lawyer.education || 'Not specified',
          areas: lawyer.specialization || lawyer.practiceAreas || [],
          casesHandled: lawyer.casesHandled || lawyer.casesHandled || 0,
          raw: lawyer
        }));

        setFetchedLawyers(transformedData);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch lawyers');
        setFetchedLawyers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, []);

  const handleLawyerSelect = (lawyer) => {
    setSelectedLawyer(lawyer);
  };

  // Reset to page 1 if filters/search change or lawyers list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, fetchedLawyers.length]);

  return (
    <div className="space-y-4">
      {selectedLawyer && (
        <LawyerProfile 
          lawyer={selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
        />
      )}

      <div className="container max-w-6xl px-4 py-8 mx-auto">        
        <div className="p-4 bg-white shadow-sm sm:p-6 md:p-8 rounded-xl">
          <h1 className="mb-2 text-xl font-bold text-gray-900 sm:mb-3 sm:text-2xl">Find the Right Lawyer for Your Case</h1>
          <p className="mb-6 text-sm text-gray-600 sm:mb-8 sm:text-base">Search our network of verified legal professionals and submit your case to get started with legal assistance</p>
          
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <p className="text-gray-600">Loading lawyers...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 mb-6 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading lawyers</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="transition-opacity duration-200 ease-in-out">
              <SearchPanel 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filters={filters}
                setFilters={setFilters}
                lawyers={paginatedLawyers}
                onLawyerSelect={handleLawyerSelect}
                totalLawyers={filteredLawyers.length}
              />
            </div>
          )}
          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                className="px-3 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};