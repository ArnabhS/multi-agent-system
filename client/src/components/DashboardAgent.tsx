import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';

interface QueryResult {
  query: string;
  result: string;
  timestamp: Date;
}

const DashboardAgent: React.FC = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL
  const [results, setResults] = useState<QueryResult[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const exampleQueries = [
    'Show total revenue this month',
    'How many new clients joined this week?',
    'What are the most popular courses?',
    'Show payment statistics',
    'Give me attendance analytics',
    'Show orders by status',
    'Which classes have the highest attendance?',
    'Monthly revenue trend analysis',
    'Show active vs inactive client count',
    'Show clients with birthdays this month',
    'What are the top performing services?',
    'Show course completion rates',
    'Show attendance drop-off rates',
    'Show outstanding payments',
  ];

  const handleQuery = async () => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/agents/dashboard/query`, {
        query: inputText,
      });

      const newResult: QueryResult = {
        query: inputText,
        result: response.data.data,
        timestamp: new Date(),
      };

      setResults(prev => [newResult, ...prev]);
      setInputText('');
    } catch (error) {
      const errorResult: QueryResult = {
        query: inputText,
        result: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
      };

      setResults(prev => [errorResult, ...prev]);
      setInputText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (query: string) => {
    setInputText(query);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Dashboard Analytics Agent</h2>
            <p className="text-gray-600">Get business insights and analytics through natural language queries</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            placeholder="Ask for analytics like 'Show total revenue this month' or 'How many new clients?'"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleQuery}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Quick Analytics Queries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {exampleQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(query)}
              className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2 mt-1">
                  {query.includes('revenue') && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {query.includes('client') && <Users className="w-4 h-4 text-blue-500" />}
                  {query.includes('class') && <Calendar className="w-4 h-4 text-purple-500" />}
                  {query.includes('payment') && <BarChart3 className="w-4 h-4 text-orange-500" />}
                  {!query.includes('revenue') && !query.includes('client') && !query.includes('class') && !query.includes('payment') && (
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{query}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Analytics Results</h3>
        
        {results.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No analytics queries yet. Try asking about revenue, clients, or attendance!</p>
          </div>
        )}

        {results.map((result, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-800">{result.query}</h4>
              <span className="text-xs text-gray-500">{result.timestamp.toLocaleString()}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{result.result}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardAgent;
