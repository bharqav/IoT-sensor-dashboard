'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // fetch data from api
    const fetchMetrics = async () => {
        try {
            // localhost or prod url
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
            // backend probably dead if we get here
            setError('Is the backend server running? Check port 5000.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // poll every 2s, close enough to real-time
    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 2000);
        return () => clearInterval(interval);
    }, []);

    // latest reading
    const latestReading = metrics.length > 0 ? metrics[0] : null;

    // helper to make timestamps readable
    const formatTimestamp = (isoString) => {
        try {
            return new Date(isoString).toLocaleString('en-US', {
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

    // --- bonus feature: temp alert ---
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        // simple alert if temp is too high
        if (latestReading && latestReading.temperature > 30) {
            setShowAlert(true);

            // try to play a sound
            if (typeof window !== 'undefined' && window.Audio) {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLTiTYIFWa87eWeTRALT6Xk7rZkGwY4ktjxz3otBSV3yPDdkEAKFF613utqVBQLRqDf8bxsIQUrgc3y1Ig3CBJktO/mnE0PC1Co5O+0ZBwGN5LZ8NB5LAUld8nw0o9CCRRet+rsaFUUCkag4PK8bSEFK4HN8tOJNwgSZLXv5p1NEAtPque+1mMcBjiS2PHQeCwFJXfJ8NKPQgkUXrfu7GlWFApGoN/yv20hBSuBzvLTiTYIE2S17+SeThALT6vn77RlGwY4ktnx0HksBSZ3yfDSj0IJFF637uxpVhQKRqDf8r9tIQUrgc7y04k2CBNkte/knE4QC0+r5++0ZRsGOJLZ8dB5LAUmd8nw0o9CCRRet+7saVYUCkag3/K/bSEFK4HO8tOJNggTZLXv5JxOEAtPq+fvtGUbBjiS2fHQeSwFJnfJ8NKPQgkUXrfu7GlWFApGoN/yv20hBSuBzvLTiTYIE2S17+ScThALT6vn77RlGwY4ktnx0HksBSZ3yfDSj0IJFF637uxpVhQKRqDf8r9tIQUrgc7y04k2CBNkte/knE4QC0+r5++0ZRsGOJLZ8dB5LAUmd8nw0o9CCRRet+7saVYUCkag3/K/bSEFK4HO8tOJNggTZLXv5JxOEAtPq+fvtGUbBjiS2fHQeSwFJnfJ8NKPQgkUXrfu7GlWFApGoN/yv20hBSuBzvLTiTYIE2S17+ScThALT6vn77RlGwY4ktnx0HksBSZ3yfDSj0IJFF637uxpVhQKRqDf8r9tIQU=');
                audio.play().catch(() => { });
            }
        } else {
            setShowAlert(false);
        }
    }, [latestReading]);

    // --- bonus feature: chart config ---
    // chart needs data in a specific format
    const chartData = metrics.slice(0, 20).reverse().map((reading) => ({
        time: new Date(reading.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        temperature: reading.temperature,
        humidity: reading.humidity,
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Top Bar */}
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
                            {/* Blinking dot for live status */}
                            <div className={`w-3 h-3 rounded-full ${metrics.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-sm font-medium text-gray-600">
                                {metrics.length > 0 ? 'Live' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Banner */}
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

                {/* --- Alert Component (Toast) --- */}
                {showAlert && latestReading && (
                    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-gradient-to-r from-red-500 to-orange-500 border-l-4 border-red-700 rounded-r-lg shadow-2xl animate-pulse transform transition-all duration-300 ease-in-out">
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-bold text-white uppercase">
                                        High Temp Alert!
                                    </p>
                                    <p className="mt-1 text-sm text-white opacity-90">
                                        Current: <span className="font-bold">{latestReading.temperature}°C</span> (&gt;30°C)
                                    </p>
                                </div>
                                <div className="ml-4 flex-shrink-0 flex">
                                    <button
                                        onClick={() => setShowAlert(false)}
                                        className="bg-transparent rounded-md inline-flex text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Spinner */}
                {loading && !error && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                )}

                {/* Main Cards Grid */}
                {/* NEW LAYOUT: Grid Container for Top Section */}
                {!loading && latestReading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                        {/* LEFT COLUMN: Status Cards (Stacked Vertically) */}
                        <div className="lg:col-span-1 flex flex-col gap-6">

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

                            {/* Sensor Status Card */}
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

                        {/* RIGHT COLUMN: Chart (Takes up 2x space) */}
                        <div className="lg:col-span-2 h-full">
                            {metrics.length > 0 && (
                                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-full flex flex-col">
                                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            📊 Real-Time Trends
                                        </h2>
                                    </div>
                                    <div className="p-6 flex-grow">
                                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis
                                                    dataKey="time"
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                    interval={0}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
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
                                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
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
                        </div>
                    </div>
                )}

                {/* History Table */}
                {!loading && metrics.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Recent Measurements
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Last {metrics.length} readings
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sensor ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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

                {/* Initial Empty State */}
                {!loading && !error && metrics.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Waiting for the sensor to wake up...
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
