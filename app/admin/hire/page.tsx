"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronDown,
    Phone,
    Calendar,
    User,
    Mail,
    Music,
    Loader2,
    Check,
    X,
    Clock,
    RefreshCw,
    Filter,
    Search,
    Download
} from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface HireData {
    id: number;
    contactName: string;
    contactEmail: string;
    contactMobile?: string;
    lineup?: string;
    musicalOffering?: string;
    preferredDate: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    payment: boolean;
    imageName: string[];
    imageData: string[]; // This will contain base64 encoded image data
    user?: {
        name: string;
        email: string;
    };
}

const HireList = () => {
    const router = useRouter();
    const [hires, setHires] = useState<HireData[]>([]);
    const [filteredHires, setFilteredHires] = useState<HireData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState<{names: string[], urls: string[]}>({names: [], urls: []});    const [expandedHireId, setExpandedHireId] = useState<number | null>(null);
    const [selectedHire, setSelectedHire] = useState<HireData | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchHires();
    }, []);
    
    useEffect(() => {
        filterHires();
    }, [hires, statusFilter, searchTerm]);

    const filterHires = () => {
        let filtered = [...hires];
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(hire => hire.status === statusFilter);
        }
        
        // Apply search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(hire => 
                hire.contactName.toLowerCase().includes(term) ||
                hire.contactEmail.toLowerCase().includes(term) ||
                hire.contactMobile?.toLowerCase().includes(term) ||
                hire.id.toString().includes(term)
            );
        }
        
        setFilteredHires(filtered);
    };

    const fetchHires = async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);
            const response = await fetch('/api/hire');

            if (!response.ok) {
                throw new Error('Failed to fetch hire data');
            }

            const data = await response.json();
            
            // Process the image data for each hire
            const processedHires = data.hires?.map((hire: any) => {
                return hire;
            }) || [];

            setHires(processedHires);
            setFilteredHires(processedHires);
        } catch (err) {
            setError('Could not load hire requests');
            console.error(err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this hire request?')) {
            return;
        }

        try {
            const response = await fetch(`/api/hire/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete hire request');
            }

            // Remove the deleted hire from the state
            const updatedHires = hires.filter(hire => hire.id !== id);
            setHires(updatedHires);
            setFilteredHires(prevFiltered => prevFiltered.filter(hire => hire.id !== id));
            
            if (showDetailsModal && selectedHire?.id === id) {
                setShowDetailsModal(false);
            }
        } catch (err) {
            setError('Failed to delete hire request');
            console.error(err);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const response = await fetch(`/api/hire/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Update the hire status in both state arrays
            const updatedHires = hires.map(hire =>
                hire.id === id ? { ...hire, status: newStatus } : hire
            );
            
            setHires(updatedHires);
            
            // Also update in the selected hire if it's being displayed
            if (selectedHire && selectedHire.id === id) {
                setSelectedHire({...selectedHire, status: newStatus});
            }
        } catch (err) {
            setError('Failed to update status');
            console.error(err);
        }
    };

    const viewImages = async (id: number) => {
        try {
            // Fetch images for the specific hire record
            const response = await fetch(`/api/hire/${id}/images`);

            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }

            const data = await response.json();

            if (data.success && data.images) {
                setSelectedImages({
                    names: data.imageNames || [],
                    urls: data.images
                });
                setShowImageModal(true);
            } else {
                throw new Error('No images found');
            }
        } catch (err) {
            setError('Failed to load images');
            console.error(err);
        }
    };
    
    const viewHireDetails = (hire: HireData) => {
        setSelectedHire(hire);
        setShowDetailsModal(true);
    };
    
    const formatLineup = (lineup?: string) => {
        if (!lineup) return 'Not specified';
        
        const lineupMap: Record<string, string> = {
            'male_female_vocalists': 'Male & Female Vocalists',
            'strings': 'Violinist, Cellist',
            'wind': 'Saxophonist, Flutist',
            'keys': 'Pianist, Keyboardist',
            'percussion': 'Drummer, Live Percussionists',
            'dj': 'DJ Music',
            'custom': 'Custom Lineup'
        };
        
        return lineupMap[lineup] || lineup;
    };
    
    const formatMusicalOffering = (offering?: string) => {
        if (!offering) return 'Not specified';
        
        const offeringMap: Record<string, string> = {
            'classical': 'Classical Music',
            'pop': 'Pop',
            'jazz': 'Jazz',
            'sri_lankan': 'Sri Lankan Classics & Instrumentals',
            'background': 'Background Music',
            'party': 'High-Energy Party Sets',
            'themed': 'Themed Music Nights',
            'meditation': 'Meditation Music Therapy',
            'custom': 'Custom Style'
        };
        
        return offeringMap[offering] || offering;
    };
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Check className="h-5 w-5 text-green-600"/>;
            case 'cancelled':
                return <X className="h-5 w-5 text-red-600"/>;
            case 'pending':
            default:
                return <Clock className="h-5 w-5 text-yellow-600"/>;
        }
    };
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const ImageModal = () => {
        if (!showImageModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
                    <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-semibold">Payment Images</h3>
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {selectedImages.urls.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No images available.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedImages.urls.map((url, index) => (
                                <div key={index} className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 p-2 text-sm font-medium">
                                        {selectedImages.names[index] || `Image ${index + 1}`}
                                    </div>
                                    <img
                                        src={url}
                                        alt={selectedImages.names[index] || `Image ${index + 1}`}
                                        className="w-full object-contain max-h-80"
                                    />
                                    <div className="p-2 flex justify-end">
                                        <a
                                            href={url}
                                            download={selectedImages.names[index]}
                                            className="text-blue-600 hover:underline text-sm flex items-center"
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    const HireDetailsModal = () => {
        if (!showDetailsModal || !selectedHire) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-semibold">Hire Request Details</h3>
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">ID</h4>
                                <p className="font-medium">{selectedHire.id}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">Status</h4>
                                <div className="flex items-center">
                                    <select
                                        value={selectedHire.status}
                                        onChange={(e) => handleStatusChange(selectedHire.id, e.target.value)}
                                        className={`border rounded px-3 py-1.5 font-medium ${getStatusColor(selectedHire.status)}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">Payment Status</h4>
                                <p className={`rounded-full px-3 py-1 text-sm font-medium inline-flex ${selectedHire.payment ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {selectedHire.payment ? 'Paid' : 'Unpaid'}
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">Payment Slips</h4>
                                <button
                                    onClick={() => viewImages(selectedHire.id)}
                                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center"
                                    disabled={!selectedHire.imageName || selectedHire.imageName.length === 0}
                                >
                                    {selectedHire.imageName && selectedHire.imageName.length > 0
                                        ? `View Payment Images (${selectedHire.imageName.length})`
                                        : 'No payment images'}
                                </button>
                            </div>
                            
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">Created At</h4>
                                <p>{format(new Date(selectedHire.createdAt), "PPP p")}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">Last Updated</h4>
                                <p>{format(new Date(selectedHire.updatedAt), "PPP p")}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">Contact Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2 text-gray-400" />
                                        <p>{selectedHire.contactName}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                        <p>{selectedHire.contactEmail}</p>
                                    </div>
                                    {selectedHire.contactMobile && (
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                            <p>{selectedHire.contactMobile}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">Preferred Date</h4>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <p>{format(new Date(selectedHire.preferredDate), "PPP")}</p>
                                </div>
                            </div>
                            
                            {selectedHire.lineup && (
                                <div>
                                    <h4 className="text-sm text-gray-500 font-medium mb-1">Lineup</h4>
                                    <div className="flex items-center">
                                        <Music className="h-4 w-4 mr-2 text-gray-400" />
                                        <p>{formatLineup(selectedHire.lineup)}</p>
                                    </div>
                                </div>
                            )}
                            
                            {selectedHire.musicalOffering && (
                                <div>
                                    <h4 className="text-sm text-gray-500 font-medium mb-1">Musical Offering</h4>
                                    <p>{formatMusicalOffering(selectedHire.musicalOffering)}</p>
                                </div>
                            )}
                            
                            <div>
                                <h4 className="text-sm text-gray-500 font-medium mb-1">Description</h4>
                                <div className="p-3 bg-gray-50 rounded border border-gray-100 max-h-40 overflow-y-auto">
                                    <p className="text-sm whitespace-pre-wrap">{selectedHire.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => handleDelete(selectedHire.id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            Delete Request
                        </button>
                        <Link
                            href={`/hire/edit/${selectedHire.id}`}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                            Edit Request
                        </Link>
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && !isRefreshing) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                    <p className="mt-4">Loading hire requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <ImageModal />
            <HireDetailsModal />
            
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Hire Requests</h1>
                <p className="text-gray-500">Manage customer hire requests and update their status</p>
            </div>
            
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md"
                        />
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-md bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={fetchHires}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6 flex justify-between items-center">
                    <p>{error}</p>
                    <button 
                        onClick={() => setError('')}
                        className="text-red-700 hover:text-red-900"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}
            
            {(!filteredHires || filteredHires.length === 0) ? (
                <div className="text-center py-12 bg-gray-50 rounded-md">
                    <p className="text-gray-500 mb-4">No hire requests found matching your criteria.</p>
                    <button
                        onClick={fetchHires}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Refresh Data
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHires.map((hire) => (
                        <div 
                            key={hire.id} 
                            className="border rounded-lg shadow-sm overflow-hidden hover:shadow transition-shadow duration-200"
                        >
                            <div className="border-b bg-gray-50 p-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    {getStatusIcon(hire.status)}
                                    <span className="ml-2 font-medium">Request #{hire.id}</span>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(hire.status)}`}>
                                    {hire.status.charAt(0).toUpperCase() + hire.status.slice(1)}
                                </span>
                            </div>
                            
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{hire.contactName}</h3>
                                        <p className="text-sm text-gray-500">{hire.contactEmail}</p>
                                        {hire.contactMobile && (
                                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                                <Phone className="h-3 w-3 mr-1" />
                                                {hire.contactMobile}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`${hire.payment ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'} rounded-full px-2 py-1 text-xs font-medium`}>
                                        {hire.payment ? 'Paid' : 'Unpaid'}
                                    </span>
                                </div>
                                
                                <div className="text-sm">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        <span>{format(new Date(hire.preferredDate), "PPP")}</span>
                                    </div>
                                    
                                    {hire.lineup && (
                                        <div className="flex items-center mt-1">
                                            <Music className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="truncate">{formatLineup(hire.lineup)}</span>
                                        </div>
                                    )}
                                    
                                    {hire.musicalOffering && (
                                        <div className="flex items-center mt-1">
                                            <Music className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="truncate">{formatMusicalOffering(hire.musicalOffering)}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-2">
                                    <h4 className="text-xs text-gray-500 uppercase mb-1">Description</h4>
                                    <p className="text-sm line-clamp-2 text-gray-700">{hire.description}</p>
                                </div>
                            </div>
                            
                            <div className="border-t p-3 bg-gray-50 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    {format(new Date(hire.createdAt), "MMM d, yyyy")}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => viewImages(hire.id)}
                                        className="p-1.5 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                        disabled={!hire.imageName || hire.imageName.length === 0}
                                        title="View Payment Images"
                                    >
                                        {hire.imageName && hire.imageName.length > 0 ? (
                                            <span className="flex items-center">
                                                <Download className="h-4 w-4" />
                                                <span className="ml-1 text-xs">{hire.imageName.length}</span>
                                            </span>
                                        ) : (
                                            <Download className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDelete(hire.id)}
                                        className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                        title="Delete Request"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    
                                    <button
                                        onClick={() => viewHireDetails(hire)}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HireList;