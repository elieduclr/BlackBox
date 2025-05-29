import React from 'react';
import { Eye } from 'lucide-react';

interface StealthModeProps {
  setIsStealthMode: (isStealthMode: boolean) => void;
}

const StealthMode: React.FC<StealthModeProps> = ({ setIsStealthMode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-bold">Cloud Document Management</h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold mb-4">Welcome to your document workspace</h2>
            <p className="text-gray-600 mb-4">
              This platform helps you manage and organize your documents securely in the cloud.
              Get started by creating a new folder or uploading a document.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                New Folder
              </button>
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded">
                Upload Document
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">Recent Documents</h3>
              <button className="text-blue-600 text-sm">View All</button>
            </div>
            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                <p>No documents found</p>
                <p className="text-sm mt-2">Upload a document to get started</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 text-gray-600 text-sm">
          <div className="flex justify-between items-center">
            <p>© 2025 Document Cloud. All rights reserved.</p>
            <button 
              onClick={() => setIsStealthMode(false)}
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-300"
              title="Exit stealth mode (Ctrl+Alt+S)"
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Toggle View</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StealthMode;