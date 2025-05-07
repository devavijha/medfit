import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { DiseaseSearch } from './components/DiseaseSearch';
import { ChatBot } from './components/ChatBot';
import { Activity, LogOut, Plus, TrendingUp, BookOpen, Heart, MessageSquare } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'search':
        return <DiseaseSearch />;
      case 'chat':
        return <ChatBot />;
      case 'featured':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Featured Diseases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredDiseases.map((disease) => (
                <FeaturedDiseaseCard key={disease.title} {...disease} />
              ))}
            </div>
          </div>
        );
      case 'categories':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Disease Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.name} {...category} />
              ))}
            </div>
          </div>
        );
      default:
        return <DiseaseSearch />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                MedFit
              </span>
            </div>
            {session && (
              <div className="flex items-center">
                <span className="mr-4 text-gray-600">
                  {session.user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!session ? (
          <div className="flex justify-center items-center min-h-[80vh]">
            <Auth />
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to MedFit
              </h1>
              <p className="mt-2 text-gray-600">
                Your comprehensive guide to understanding diseases, diagnoses, and treatments.
              </p>
            </div>

            {/* Dashboard Navigation */}
            <div className="mb-8">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    activeTab === 'search'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Search Diseases
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    activeTab === 'chat'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chat Assistant
                </button>
                <button
                  onClick={() => setActiveTab('featured')}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    activeTab === 'featured'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Featured
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    activeTab === 'categories'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Categories
                </button>
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <QuickStatCard
                icon={<BookOpen className="h-8 w-8 text-blue-500" />}
                title="Total Diseases"
                value="1,000+"
              />
              <QuickStatCard
                icon={<Heart className="h-8 w-8 text-red-500" />}
                title="Treatment Options"
                value="2,500+"
              />
              <QuickStatCard
                icon={<Plus className="h-8 w-8 text-green-500" />}
                title="Medical Categories"
                value="50+"
              />
            </div>

            {/* Main Content */}
            {renderDashboardContent()}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Components
function QuickStatCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        {icon}
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-indigo-600">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedDiseaseCard({ title, description, imageUrl }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <img
          src={imageUrl}
          alt={title}
          className="w-16 h-16 rounded-full object-cover"
        />
        <h3 className="ml-4 text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function CategoryCard({ name, count, icon: Icon }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <Icon className="h-6 w-6 text-indigo-500" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{count} diseases</p>
        </div>
      </div>
    </div>
  );
}

// Sample Data
const featuredDiseases = [
  {
    title: "Type 2 Diabetes",
    description: "A chronic condition that affects how your body metabolizes sugar (glucose).",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&h=300"
  },
  {
    title: "Hypertension",
    description: "High blood pressure that can lead to severe health complications.",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&h=300"
  }
];

const categories = [
  { name: "Cardiovascular", count: 120, icon: Heart },
  { name: "Respiratory", count: 85, icon: Activity },
  { name: "Endocrine", count: 45, icon: Plus },
  { name: "Neurological", count: 95, icon: Activity },
];

export default App;