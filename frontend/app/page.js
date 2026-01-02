'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from backend API
    const fetchMetrics = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/metrics`
                : 'http://localhost:5000/api/metrics';

            const response = await fetch(apiUrl);
            const result = await response.json();

            if (result.success) {
                setMetrics(result.data);
                setError(null);
            } else {
                setError('Failed to fetch data');
            }
        } catch (err) {
            setError('Cannot connect to backend. Make sure it\'s running on port 5000.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Poll API every 2 seconds
    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 2000);
        return () => clearInterval(interval);
    }, []);

    // Get the most recent reading
    const latestReading = metrics.length > 0 ? metrics[0] : null;

    const formatTimestamp = (isoString) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return isoString;
        }
    };

    // BONUS FEATURE 1: Temperature Alert System (>30°C)
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (latestReading && latestReading.temperature > 30) {
            setShowAlert(true);
            // Optional: Play alert sound
            if (typeof window !== 'undefined' && window.Audio) {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLTiTYIFWa87eWeTRALT6Xk7rZkGwY4ktjxz3otBSV3yPDdkEAKFF613utqVBQLRqDf8bxsIQUrgc3y1Ig3CBJktO/mnE0PC1Co5O+0ZBwGN5LZ8NB5LAUld8nw0o9CCRRet+rsaFUUCkag4PK8bSEFK4HN8tOJNwgSZLXv5p1NEAtPque+1mMcBjiS2PHQeCwFJXfJ8NKPQgkUXrfu7GlWFApGoN/yv20hBSuBzvLTiTYIE2S17+SeThALT6vn77RlGwY4ktnx0HksBSZ3yfDSj0IJFF637uxpVhQKRqDf8r9tIQUrgc7y04k2CBNkte/knE4QC0+r5++0ZRsGOJLZ8dB5LAUmd8nw0o9CCRRet+7saVYUCkag3/K/bSEFK4HO8tOJNggTZLXv5JxOEAtPq+fvtGUbBjiS2fHQeSwFJnfJ8NKPQgkUXrfu7GlWFApGoN/yv20hBSuBzvLTiTYIE2S17+ScThALT6vn77RlGwY4ktnx0HksBSZ3yfDSj0IJFF637uxpVhQKRqDf8r9tIQUrgc7y04k2CBNkte/knE4QC0+r5++0ZRsGOJLZ8dB5LAUmd8nw0o9CCRRet+7saVYUCkag3/K/bSEFK4HO8tOJNggTZLXv5JxOEAtPq+fvtGUbBjiS2fHQeSwFJnfJ8NKPQgkUXrfu7GlWFApGoN/yv20hBSuBzvLTiTYIE2S17+ScThALT6vn77RlGwY4ktnx0HksBSZ3yfDSj0IJFF637uxpVhQKRqDf8r9tIQU=');
                audio.play().catch(() => { }); // Ignore errors
            }
        } else {
            setShowAlert(false);
        }
    }, [latestReading]);

    // BONUS FEATURE 2: Prepare Chart Data (last 20 readings)
    const chartData = metrics.slice(0, 20).reverse().map((reading) => ({
        time: new Date(reading.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        temperature: reading.temperature,
        humidity: reading.humidity,
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                IoT Sensor Dashboard
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Real-time environmental monitoring
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${metrics.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-sm font-medium text-gray-600">
                                {metrics.length > 0 ? 'Live' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* BONUS FEATURE 1: Temperature Alert (>30°C) */}
                {showAlert && latestReading && (
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 border-2 border-red-600 rounded-lg p-6 mb-6 shadow-lg animate-pulse">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                                <svg className="w-8 h-8 text-white mr-3 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        ⚠️ HIGH TEMPERATURE ALERT!
                                    </h3>
                                    <p className="text-white text-sm">
                                        Current temperature: <span className="font-bold text-2xl">{latestReading.temperature}°C</span> exceeds threshold of 30°C
                                    </p>
                                    <p className="text-white text-xs mt-1 opacity-90">
                                        Immediate action may be required to prevent equipment damage.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAlert(false)}
                                className="text-white hover:text-gray-200 transition-colors"
                                aria-label="Dismiss alert"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && !error && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                )}

                {/* Status Cards */}
                {!loading && latestReading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Temperature Card */}
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    Temperature
                                </h3>
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="text-5xl font-bold text-gray-900 mb-1">
                                {latestReading.temperature}°C
                            </p>
                            <p className="text-xs text-gray-500">
                                Updated: {formatTimestamp(latestReading.timestamp)}
                            </p>
                        </div>

                        {/* Humidity Card */}
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    Humidity
                                </h3>
                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <p className="text-5xl font-bold text-gray-900 mb-1">
                                {latestReading.humidity}%
                            </p>
                            <p className="text-xs text-gray-500">
                                Relative Humidity
                            </p>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                    Sensor Status
                                </h3>
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-3xl font-bold text-green-600 mb-1 capitalize">
                                {latestReading.status}
                            </p>
                            <p className="text-xs text-gray-500">
                                ID: {latestReading.sensor_id}
                            </p>
                        </div>
                    </div>
                )}

                {/* BONUS FEATURE 2: Line Chart Visualization */}
                {!loading && metrics.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                📊 Real-Time Trends
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Live visualization of temperature and humidity over time
                            </p>
                        </div>
                        <div className="p-6">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="temperature"
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        name="Temperature (°C)"
                                        dot={{ fill: '#f97316', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="humidity"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        name="Humidity (%)"
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Data Table */}
                {!loading && metrics.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Recent Measurements
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing last {metrics.length} readings
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Timestamp
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sensor ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Temperature
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Humidity
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {metrics.map((reading, index) => (
                                        <tr
                                            key={reading.id}
                                            className={`${index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatTimestamp(reading.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {reading.sensor_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {reading.temperature}°C
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {reading.humidity}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reading.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {reading.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* No Data State */}
                {!loading && !error && metrics.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Waiting for sensor data... Make sure the sensor and backend are running.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
