import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, AlertCircle } from 'lucide-react';

interface Disease {
  id: string;
  name: string;
  diagnosis: string;
  treatment: string;
}

export function DiseaseSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    sortBy: 'name',
    order: 'asc'
  });

  useEffect(() => {
    const fetchDiseases = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase.from('diseases').select('*');
        
        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }
        
        // Apply sorting
        query = query.order(filters.sortBy, { ascending: filters.order === 'asc' });
        
        const { data, error: supabaseError } = await query;
        
        if (supabaseError) throw supabaseError;
        setDiseases(data || []);
      } catch (error) {
        console.error('Error fetching diseases:', error);
        setError('Failed to fetch diseases. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchDiseases();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search diseases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Filter className="text-gray-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="created_at">Date Added</option>
            </select>
            <select
              value={filters.order}
              onChange={(e) => setFilters(prev => ({ ...prev, order: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        /* Results */
        <div className="grid gap-6">
          {diseases.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No diseases found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
            </div>
          ) : (
            diseases.map((disease) => (
              <div
                key={disease.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {disease.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">Diagnosis</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                      {disease.diagnosis}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">Treatment</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                      {disease.treatment}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}