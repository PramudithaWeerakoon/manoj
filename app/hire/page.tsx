"use client";
import { getStripe } from '@/lib/stripe-client';
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Separator} from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
    Loader2,
    Calendar,
    User,
    Mail,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Clock,
    PlusCircle,
    Trash2,
    CalendarIcon,
    CreditCard,
    UploadCloud,
    AlertCircle,
    Phone
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {format} from "date-fns";
import {Calendar as CalendarComponent} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface HireData {
    id: number;
    userId: number;
    date: string;
    payment: boolean;
    status: string;
    contactName: string;
    contactEmail: string;
    contactMobile?: string;
    lineup?: string;
    musicalOffering?: string;
    preferredDate: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    imageName?: string[];
    user?: {
        name: string;
        email: string;
    };
}

export default function HirePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [hires, setHires] = useState<HireData[]>([]);
    const [activeHire, setActiveHire] = useState<HireData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // For the payment processing
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [bankSlipFile, setBankSlipFile] = useState<File | null>(null);
    const [fileUploading, setFileUploading] = useState(false);

    // For the new hire form
    const [formOpen, setFormOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [hireForm, setHireForm] = useState({
        contactName: "",
        contactEmail: "",
        contactMobile: "",
        lineup: "",
        musicalOffering: "",
        description: ""
    });

    // For viewing details
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Check if user is authenticated
    useEffect(() => {
        async function checkAuth() {
            try {
                setIsLoading(true);
                const response = await fetch('/api/auth/me');

                if (!response.ok) {
                    // Redirect to login if not authenticated
                    router.push('/auth/login?redirect=/hire');
                    return;
                }

                const data = await response.json();
                setUser(data.user);

                // After authentication, fetch user's hires
                fetchUserHires();
            } catch (error) {
                console.error('Authentication error:', error);
                router.push('/auth/login?redirect=/hire');
            } finally {
                setIsLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    // Reset payment method and file when dialog opens/closes
    useEffect(() => {
        if (!detailsOpen) {
            setPaymentMethod("");
            setBankSlipFile(null);
        }
    }, [detailsOpen]);

    const fetchUserHires = async () => {
        try {
            const response = await fetch(`/api/hire/mine`);
            if (response.ok) {
                const data = await response.json();
                setHires(data.hire || []);
            } else {
                throw new Error('Failed to fetch hires');
            }
        } catch (error) {
            console.error('Error fetching hires:', error);
            toast({
                title: "Error",
                description: "Failed to load your hire requests",
                variant: "destructive"
            });
        }
    };

    const handleCreateHire = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate) {
            toast({
                title: "Error",
                description: "Please select a preferred date",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/hire/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contactName: hireForm.contactName,
                    contactEmail: hireForm.contactEmail,
                    contactMobile: hireForm.contactMobile,
                    lineup: hireForm.lineup,
                    musicalOffering: hireForm.musicalOffering,
                    preferredDate: selectedDate.toISOString(),
                    description: hireForm.description
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create hire request');
            }

            toast({
                title: "Success",
                description: "Your hire request has been submitted."
            });

            // Close the form and refresh hire requests
            setFormOpen(false);
            resetForm();
            fetchUserHires();

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to submit hire request",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelHire = async (hireId: number) => {
        try {
            const response = await fetch(`/api/hire/${hireId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel hire request');
            }

            toast({
                title: "Success",
                description: "Your hire request has been cancelled."
            });

            // Refresh hire requests
            fetchUserHires();
            setDetailsOpen(false);

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to cancel hire request",
                variant: "destructive"
            });
        }
    };

    const handlePayment = async (hireId: number) => {
        if (!paymentMethod) {
            toast({
                title: "Error",
                description: "Please select a payment method",
                variant: "destructive"
            });
            return;
        }

        if (paymentMethod === "bank_transfer" && !bankSlipFile) {
            toast({
                title: "Error",
                description: "Please upload your bank transfer slip",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            if (paymentMethod === "online") {
                // Handle Stripe payment
                const response = await fetch('/api/stripe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        hireId
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();

                if (!data.id) {
                    throw new Error('Missing session ID in response');
                }

                const stripe = await getStripe();
                if (!stripe) {
                    throw new Error('Stripe not loaded');
                }

                const result = await stripe.redirectToCheckout({
                    sessionId: data.id
                });

                if (result.error) {
                    throw new Error(result.error.message);
                }
            } else if (paymentMethod === "bank_transfer" && bankSlipFile) {
                // Handle bank transfer
                const formData = new FormData();
                formData.append('file', bankSlipFile);
                formData.append('hireId', hireId.toString());

                setFileUploading(true);

                const response = await fetch(`/api/hire/${hireId}/payment`, {
                    method: 'PATCH',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to process bank transfer');
                }

                toast({
                    title: "Success",
                    description: "Bank transfer slip uploaded successfully. Your payment is being processed."
                });

                // Refresh hire requests and close dialog
                fetchUserHires();
                setDetailsOpen(false);
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            toast({
                title: "Payment Error",
                description: error.message || "Failed to process payment",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
            setFileUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBankSlipFile(e.target.files[0]);
        }
    };

    const resetForm = () => {
        setHireForm({
            contactName: "",
            contactEmail: "",
            contactMobile: "",
            lineup: "",
            musicalOffering: "",
            description: ""
        });
        setSelectedDate(new Date());
    };

    const viewHireDetails = (hire: HireData) => {
        setActiveHire(hire);
        setDetailsOpen(true);
        // Reset payment method and file
        setPaymentMethod("");
        setBankSlipFile(null);
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle2 className="h-4 w-4 text-green-600"/>;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-600"/>;
            case 'pending':
            default:
                return <Clock className="h-4 w-4 text-yellow-600"/>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <p className="mt-2">Loading hire requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">My Hire Requests</h1>
                <Button onClick={() => setFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    New Hire Request
                </Button>
            </div>

            <Tabs defaultValue="all" className="space-y-8">
                <TabsList>
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                {['all', 'pending', 'confirmed', 'cancelled'].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {tab === 'all' ? 'All Hire Requests' :
                                        tab === 'pending' ? 'Pending Requests' :
                                            tab === 'confirmed' ? 'Confirmed Requests' :
                                                'Cancelled Requests'}
                                </CardTitle>
                                <CardDescription>
                                    {tab === 'all' ? 'View all of your hire requests' :
                                        tab === 'pending' ? 'Requests awaiting confirmation' :
                                            tab === 'confirmed' ? 'Approved hire requests' :
                                                'Hire requests that have been cancelled'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {hires.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>
                                        <p className="text-muted-foreground">You don&apos;t have any hire requests yet.</p>
                                        <Button className="mt-4" onClick={() => setFormOpen(true)}>
                                            Create a Hire Request
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {hires
                                            .filter(hire => tab === 'all' || hire.status === tab)
                                            .map((hire) => (
                                                <div
                                                    key={hire.id}
                                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                                                    onClick={() => viewHireDetails(hire)}
                                                >
                                                    <div className="flex items-start sm:items-center w-full sm:w-auto mb-2 sm:mb-0">
                                                        <div className="mr-4">
                                                            {getStatusIcon(hire.status)}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                                                <h3 className="font-medium">{hire.contactName}</h3>
                                                                <span className="text-xs text-muted-foreground sm:ml-2">ID: {hire.id}</span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row text-sm text-muted-foreground gap-2 sm:gap-4">
                                                                <p className="flex items-center">
                                                                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0"/>
                                                                    {format(new Date(hire.preferredDate), "PPP")}
                                                                </p>
                                                                {hire.lineup && (
                                                                    <p className="flex items-center">
                                                                        {hire.lineup === 'male_female_vocalists' ? 'Vocalists' :
                                                                         hire.lineup === 'strings' ? 'Strings' :
                                                                         hire.lineup === 'wind' ? 'Wind' :
                                                                         hire.lineup === 'keys' ? 'Keys' :
                                                                         hire.lineup === 'percussion' ? 'Percussion' :
                                                                         hire.lineup === 'dj' ? 'DJ' :
                                                                         'Custom'}
                                                                    </p>
                                                                )}
                                                                {hire.contactMobile && (
                                                                    <p className="flex items-center">
                                                                        <Phone className="h-3 w-3 mr-1 flex-shrink-0"/>
                                                                        {hire.contactMobile}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 self-end sm:self-center">
                                                        {hire.payment ? (
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                Paid
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                Unpaid
                                                            </span>
                                                        )}
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(hire.status)}`}>
                                                          {hire.status.charAt(0).toUpperCase() + hire.status.slice(1)}
                                                        </span>
                                                        <Button variant="ghost" size="icon" className="ml-2">
                                                            <span className="sr-only">View details</span>
                                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                                                <path
                                                                    d="M8.625 3.75L12.375 7.5L8.625 11.25M2.625 7.5H12.375"
                                                                    stroke="currentColor" strokeWidth="1.5"
                                                                    strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>

            {/* New Hire Request Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New Hire Request</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to submit a new hire request.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateHire}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="contactName">Contact Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="contactName"
                                        className="pl-10"
                                        placeholder="Your name"
                                        value={hireForm.contactName}
                                        onChange={(e) => setHireForm({...hireForm, contactName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        className="pl-10"
                                        placeholder="your.email@example.com"
                                        value={hireForm.contactEmail}
                                        onChange={(e) => setHireForm({...hireForm, contactEmail: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contactMobile">Contact Mobile Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="contactMobile"
                                        type="tel"
                                        className="pl-10"
                                        placeholder="Your mobile number"
                                        value={hireForm.contactMobile}
                                        onChange={(e) => setHireForm({...hireForm, contactMobile: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lineup">Our Lineup</Label>
                                <Select
                                    value={hireForm.lineup}
                                    onValueChange={(value) => setHireForm({...hireForm, lineup: value})}
                                    required
                                >
                                    <SelectTrigger id="lineup">
                                        <SelectValue placeholder="Select lineup options" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male_female_vocalists">Male & Female Vocalists</SelectItem>
                                        <SelectItem value="strings">Violinist, Cellist</SelectItem>
                                        <SelectItem value="wind">Saxophonist, Flutist</SelectItem>
                                        <SelectItem value="keys">Pianist, Keyboardist</SelectItem>
                                        <SelectItem value="percussion">Drummer, Live Percussionists</SelectItem>
                                        <SelectItem value="dj">DJ Music</SelectItem>
                                        <SelectItem value="custom">Custom Lineup</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="musicalOffering">Our Musical Offering</Label>
                                <Select
                                    value={hireForm.musicalOffering}
                                    onValueChange={(value) => setHireForm({...hireForm, musicalOffering: value})}
                                    required
                                >
                                    <SelectTrigger id="musicalOffering">
                                        <SelectValue placeholder="Select musical style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="classical">Classical Music</SelectItem>
                                        <SelectItem value="pop">Pop</SelectItem>
                                        <SelectItem value="jazz">Jazz</SelectItem>
                                        <SelectItem value="sri_lankan">Sri Lankan Classics & Instrumentals</SelectItem>
                                        <SelectItem value="background">Background Music</SelectItem>
                                        <SelectItem value="party">High-Energy Party Sets</SelectItem>
                                        <SelectItem value="themed">Themed Music Nights</SelectItem>
                                        <SelectItem value="meditation">Meditation Music Therapy</SelectItem>
                                        <SelectItem value="custom">Custom Style</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="preferredDate">Preferred Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="justify-start text-left font-normal"
                                        >
                                            <Calendar className="mr-2 h-4 w-4"/>
                                            {selectedDate ? (
                                                format(selectedDate, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <CalendarComponent
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide details about your hire request"
                                    value={hireForm.description}
                                    onChange={(e) => setHireForm({...hireForm, description: e.target.value})}
                                    className="min-h-[100px]"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setFormOpen(false);
                                resetForm();
                            }} type="button">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Submitting...
                                    </>
                                ) : "Submit Request"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Hire Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                    {activeHire && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Hire Request Details</DialogTitle>
                                <DialogDescription>
                                    View the details of your hire request.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Status</h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(activeHire.status)}`}>
                    {activeHire.status.charAt(0).toUpperCase() + activeHire.status.slice(1)}
                  </span>
                                </div>
                                <Separator/>
                                <div>
                                    <h3 className="font-medium mb-1">Contact Information</h3>
                                    <p className="flex items-center text-sm">
                                        <User className="h-4 w-4 mr-2"/>
                                        {activeHire.contactName}
                                    </p>
                                    <p className="flex items-center text-sm mt-1">
                                        <Mail className="h-4 w-4 mr-2"/>
                                        {activeHire.contactEmail}
                                    </p>
                                    {activeHire.contactMobile && (
                                        <p className="flex items-center text-sm mt-1">
                                            <Phone className="h-4 w-4 mr-2"/>
                                            {activeHire.contactMobile}
                                        </p>
                                    )}
                                </div>
                                <Separator/>
                                {/* Display lineup information if available */}
                                {activeHire.lineup && (
                                    <>
                                        <div>
                                            <h3 className="font-medium mb-1">Lineup</h3>
                                            <p className="text-sm">
                                                {activeHire.lineup === 'male_female_vocalists' ? 'Male & Female Vocalists' :
                                                 activeHire.lineup === 'strings' ? 'Violinist, Cellist' :
                                                 activeHire.lineup === 'wind' ? 'Saxophonist, Flutist' :
                                                 activeHire.lineup === 'keys' ? 'Pianist, Keyboardist' :
                                                 activeHire.lineup === 'percussion' ? 'Drummer, Live Percussionists' :
                                                 activeHire.lineup === 'dj' ? 'DJ Music' :
                                                 activeHire.lineup}
                                            </p>
                                        </div>
                                        <Separator/>
                                    </>
                                )}
                                {/* Display musical offering information if available */}
                                {activeHire.musicalOffering && (
                                    <>
                                        <div>
                                            <h3 className="font-medium mb-1">Musical Offering</h3>
                                            <p className="text-sm">
                                                {activeHire.musicalOffering === 'classical' ? 'Classical Music' :
                                                 activeHire.musicalOffering === 'pop' ? 'Pop' :
                                                 activeHire.musicalOffering === 'jazz' ? 'Jazz' :
                                                 activeHire.musicalOffering === 'sri_lankan' ? 'Sri Lankan Classics & Instrumentals' :
                                                 activeHire.musicalOffering === 'background' ? 'Background Music' :
                                                 activeHire.musicalOffering === 'party' ? 'High-Energy Party Sets' :
                                                 activeHire.musicalOffering === 'themed' ? 'Themed Music Nights' :
                                                 activeHire.musicalOffering === 'meditation' ? 'Meditation Music Therapy' :
                                                 activeHire.musicalOffering}
                                            </p>
                                        </div>
                                        <Separator/>
                                    </>
                                )}
                                <div>
                                    <h3 className="font-medium mb-1">Preferred Date</h3>
                                    <p className="flex items-center text-sm">
                                        <Calendar className="h-4 w-4 mr-2"/>
                                        {format(new Date(activeHire.preferredDate), "PPP")}
                                    </p>
                                </div>
                                <Separator/>
                                <div>
                                    <h3 className="font-medium mb-1">Description</h3>
                                    <p className="text-sm whitespace-pre-wrap">{activeHire.description}</p>
                                </div>
                                {activeHire.payment && (
                                    <>
                                        <Separator/>
                                        <div>
                                            <h3 className="font-medium mb-1">Payment</h3>
                                            <p className="flex items-center text-sm">
                                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>
                                                Payment received
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Payment Options Section */}
                                {!activeHire.payment && activeHire.status !== 'cancelled' && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h3 className="font-medium mb-3">Payment Method</h3>

                                            <RadioGroup
                                                value={paymentMethod}
                                                onValueChange={setPaymentMethod}
                                                className="space-y-3"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="online" id="online" />
                                                    <Label htmlFor="online" className="flex items-center">
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        Pay Online
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                                                    <Label htmlFor="bank_transfer" className="flex items-center">
                                                        <UploadCloud className="h-4 w-4 mr-2" />
                                                        Bank Transfer
                                                    </Label>
                                                </div>
                                            </RadioGroup>

                                            {paymentMethod === 'bank_transfer' && (
                                                <div className="mt-4 space-y-3">
                                                    <Alert>
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertTitle>Bank Transfer Instructions</AlertTitle>
                                                        <AlertDescription>
                                                            Please transfer the amount to our bank account and upload the transfer slip.
                                                            <div className="mt-2">
                                                                <p className="text-sm">Bank: Example Bank</p>
                                                                <p className="text-sm">Account Name: Example Company</p>
                                                                <p className="text-sm">Account Number: 123-456-789</p>
                                                                <p className="text-sm">Reference: Hire-{activeHire.id}</p>
                                                            </div>
                                                        </AlertDescription>
                                                    </Alert>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="bankSlip">Upload Transfer Slip</Label>
                                                        <div className="grid gap-2">
                                                            <Input
                                                                id="bankSlip"
                                                                type="file"
                                                                accept="image/png, image/jpeg, application/pdf"
                                                                onChange={handleFileChange}
                                                                className="cursor-pointer"
                                                            />
                                                            {bankSlipFile && (
                                                                <p className="text-sm text-green-600 flex items-center">
                                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                    {bankSlipFile.name} selected
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            <DialogFooter>
                                {activeHire.status === 'pending' && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleCancelHire(activeHire.id)}
                                        className="mr-auto"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4"/>
                                        Cancel Request
                                    </Button>
                                )}
                                {!activeHire.payment && activeHire.status !== 'cancelled' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handlePayment(activeHire.id)}
                                        disabled={!paymentMethod || (paymentMethod === 'bank_transfer' && !bankSlipFile) || isSubmitting}
                                        className={`${activeHire.status === 'pending' ? '' : 'mr-auto'}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-4 w-4"/>
                                                Pay Now
                                            </>
                                        )}
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}