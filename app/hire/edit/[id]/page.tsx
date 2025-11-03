"use client";

import {useState, useEffect, useRef} from 'react';
import {useParams} from 'next/navigation';
import Link from 'next/link';

interface HireFormData {
    contactName: string;
    contactEmail: string;
    preferredDate: string;
    description: string;
    status: string;
    payment: boolean;
}

interface ImageData {
    name: string;
    url: string;
}

const EditHireForm = () => {
    const params = useParams();
    const id = params?.id;
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [images, setImages] = useState<ImageData[]>([]);
    const [showImageModal, setShowImageModal] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<HireFormData>({
        contactName: '',
        contactEmail: '',
        preferredDate: '',
        description: '',
        status: 'pending',
        payment: false,
    });

    useEffect(() => {
        if (id) {
            fetchHireData();
            fetchImages();
        }
    }, [id]);

    const fetchHireData = async () => {
        fetch(`/api/hire/${id}`).then(async (response: Response) => await response.json())
            .then((data) => {
                data = data.hire;
                let formattedDate = '';
                try {
                    if (data.preferredDate) {
                        const date = new Date(data.preferredDate);
                        if (!isNaN(date.getTime())) {
                            formattedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                                .toISOString()
                                .slice(0, 16);
                        }
                    }
                } catch (dateError) {
                    console.error("Error formatting date:", dateError);
                }

                setFormData({
                    contactName: data.contactName || '',
                    contactEmail: data.contactEmail || '',
                    preferredDate: formattedDate,
                    description: data.description || '',
                    status: data.status || 'pending',
                    payment: !!data.payment,
                });
            })
            .catch((error) => {
                setError('Could not load hire data');
                console.error(error);
            }).finally(() => {
            setIsLoading(false);
        });
    };

    const fetchImages = async () => {
        try {
            const response = await fetch(`/api/hire/${id}/images`);

            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }

            const data = await response.json();

            if (data.success && data.images) {
                const imageData = data.imageNames.map((name: string, index: number) => ({
                    name,
                    url: data.images[index]
                }));
                setImages(imageData);
            }
        } catch (err) {
            console.error('Error fetching images:', err);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const {name, value, type} = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const {checked} = e.target as HTMLInputElement;
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError('');

            // Safely handle the date conversion
            let dateToSubmit;
            try {
                dateToSubmit = formData.preferredDate ? new Date(formData.preferredDate).toISOString() : null;
            } catch (dateError) {
                console.error("Error converting date:", dateError);
                setError('Invalid date format. Please check your date input.');
                setIsSubmitting(false);
                return;
            }

            const response = await fetch(`/api/hire/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    preferredDate: dateToSubmit,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update hire request');
            }

            // Success message or redirect
            alert('Hire request updated successfully!');
            // Optionally redirect:
            // window.location.href = '/hire';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploadingImages(true);
            const formData = new FormData();

            // Append each file to the FormData
            for (let i = 0; i < e.target.files.length; i++) {
                formData.append('file', e.target.files[i]);
            }

            const response = await fetch(`/api/hire/${id}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload images');
            }

            // Refresh images
            await fetchImages();

            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (err) {
            setError('Failed to upload images');
            console.error(err);
        } finally {
            setUploadingImages(false);
        }
    };

    const handleDeleteImage = async (index: number) => {
        try {
            setDeletingImageIndex(index);

            const response = await fetch(`/api/hire/${id}/images/${encodeURIComponent(images[index].name)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            // Update local state
            setImages(images.filter((_, i) => i !== index));
        } catch (err) {
            setError('Failed to delete image');
            console.error(err);
        } finally {
            setDeletingImageIndex(null);
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
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    {images.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No images available.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="border rounded-lg overflow-hidden">
                                    <img
                                        src={image.url}
                                        alt={image.name || `Image ${index + 1}`}
                                        className="w-full object-contain max-h-80"
                                    />
                                    <div className="p-2 flex justify-end">
                                        <a
                                            href={image.url}
                                            download={image.name}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
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

    if (isLoading) {
        return (
            <div className="max-w-lg mx-auto p-6 text-center">
                <p>Loading hire data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Edit Hire Request</h1>
            <ImageModal/>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                    </label>
                    <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                    </label>
                    <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Date
                    </label>
                    <input
                        type="datetime-local"
                        id="preferredDate"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="mb-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="payment"
                            name="payment"
                            checked={formData.payment}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="payment" className="ml-2 block text-sm text-gray-700">
                            Payment Received
                        </label>
                    </div>
                </div>

                {/* Payment Images Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Payment Images</h3>
                        <button
                            type="button"
                            onClick={() => setShowImageModal(true)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            {images.length > 0 ? `View Images (${images.length})` : 'Manage Images'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">
                        {images.length === 0
                            ? 'No payment images uploaded.'
                            : `${images.length} image${images.length === 1 ? '' : 's'} uploaded.`}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <Link
                        href="/hire"
                        className="text-blue-600 hover:underline"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditHireForm;