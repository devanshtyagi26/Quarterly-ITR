"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    level: "",
    endpoint: "",
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/logs?${params.toString()}`);
      setLogs(response.data.logs);
      setStatistics(response.data.statistics);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const getLevelColor = (level) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-100";
      case "warn":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
      return "text-green-700 bg-green-100 border-green-300";
    } else if (statusCode >= 300 && statusCode < 400) {
      return "text-blue-700 bg-blue-100 border-blue-300";
    } else if (statusCode >= 400 && statusCode < 500) {
      return "text-orange-700 bg-orange-100 border-orange-300";
    } else if (statusCode >= 500) {
      return "text-red-700 bg-red-100 border-red-300";
    }
    return "text-gray-700 bg-gray-100 border-gray-300";
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "text-blue-700 bg-blue-100 border-blue-300";
      case "POST":
        return "text-green-700 bg-green-100 border-green-300";
      case "PUT":
      case "PATCH":
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "DELETE":
        return "text-red-700 bg-red-100 border-red-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  return (
    <div className="container mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6">API Monitoring Logs</h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Requests</h3>
          <p className="text-2xl font-bold dark:text-black">
            {statistics.total || 0}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="text-green-600 text-sm">Success</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics.info || 0}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <h3 className="text-yellow-600 text-sm">Warnings</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {statistics.warn || 0}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <h3 className="text-red-600 text-sm">Errors</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {statistics.error || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-lg mb-6 dark:bg-card bg-card border-b shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.level}
            onChange={(e) =>
              setFilters({ ...filters, level: e.target.value, page: 1 })
            }
            className="rounded p-2 dark:bg-card bg-card border border-border"
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>

          <input
            type="text"
            placeholder="Filter by endpoint"
            value={filters.endpoint}
            onChange={(e) =>
              setFilters({ ...filters, endpoint: e.target.value, page: 1 })
            }
            className="border rounded p-2"
          />

          <select
            value={filters.limit}
            onChange={(e) =>
              setFilters({
                ...filters,
                limit: parseInt(e.target.value),
                page: 1,
              })
            }
            className="rounded p-2 dark:bg-card bg-card border border-border"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="dark:bg-card bg-card border-b shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="dark:bg-card bg-card border-b shadow-md">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 border-b shadow-md divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50 hover:dark:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getLevelColor(log.level)}`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{log.endpoint}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded border ${getMethodColor(log.method)}`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(log.statusCode)}`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.duration}
                    </td>
                    <td className="px-6 py-4 text-sm">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page === pagination.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
