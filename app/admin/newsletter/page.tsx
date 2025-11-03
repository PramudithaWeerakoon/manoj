"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Search, 
  Loader2, 
  Mail, 
  Send, 
  User, 
  CalendarDays,
  Download,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface Subscriber {
  id: number;
  email: string;
  name?: string;
  subscribed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NewsletterAdminPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('subscribed');
  const [isSending, setIsSending] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    subject: '',
    content: ''
  });
  
  // Fetch subscribers
  useEffect(() => {
    async function fetchSubscribers() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/subscribers');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscribers');
        }
        
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      } catch (error) {
        console.error('Error fetching subscribers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscribers',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSubscribers();
  }, [toast]);
  
  // Filter subscribers based on search and active tab
  useEffect(() => {
    let result = [...subscribers];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(sub => 
        sub.email.toLowerCase().includes(query) || 
        (sub.name && sub.name.toLowerCase().includes(query))
      );
    }
    
    if (activeTab === 'subscribed') {
      result = result.filter(sub => sub.subscribed);
    } else if (activeTab === 'unsubscribed') {
      result = result.filter(sub => !sub.subscribed);
    }
    
    setFilteredSubscribers(result);
  }, [subscribers, searchQuery, activeTab]);
  
  // Toggle subscriber status
  const toggleSubscriberStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscribed: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update subscriber');
      }
      
      // Update state
      setSubscribers(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, subscribed: !currentStatus } : sub
        )
      );
      
      toast({
        title: 'Success',
        description: `Subscriber ${!currentStatus ? 'resubscribed' : 'unsubscribed'} successfully`,
      });
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscriber status',
        variant: 'destructive',
      });
    }
  };
  
  // Handle broadcast form changes
  const handleBroadcastChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBroadcastForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Send broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!broadcastForm.subject || !broadcastForm.content) {
      toast({
        title: 'Validation Error',
        description: 'Subject and content are required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const response = await fetch('/api/newsletter/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(broadcastForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send newsletter');
      }
      
      toast({
        title: 'Success',
        description: data.message || 'Newsletter sent successfully',
      });
      
      // Reset form
      setBroadcastForm({
        subject: '',
        content: ''
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send newsletter',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Export subscribers to CSV
  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(sub => sub.subscribed);
    if (activeSubscribers.length === 0) {
      toast({
        title: 'No subscribers',
        description: 'There are no active subscribers to export',
      });
      return;
    }
    
    // Create CSV content
    const headers = ['Email', 'Name', 'Subscribed Date'];
    const rows = activeSubscribers.map(sub => [
      sub.email,
      sub.name || '',
      new Date(sub.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Newsletter Management</h1>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Subscribers</TabsTrigger>
            <TabsTrigger value="subscribed">Active</TabsTrigger>
            <TabsTrigger value="unsubscribed">Unsubscribed</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportSubscribers}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Subscriber List</CardTitle>
              <div className="relative w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search subscribers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <CardDescription>
              {filteredSubscribers.length} subscribers found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading subscribers...</span>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No subscribers found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>{subscriber.name || '-'}</TableCell>
                        <TableCell>
                          {subscriber.subscribed ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Subscribed
                            </span>
                          ) : (
                            <span className="flex items-center text-muted-foreground">
                              <XCircle className="h-4 w-4 mr-1" />
                              Unsubscribed
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center text-muted-foreground">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            {new Date(subscriber.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`status-${subscriber.id}`} className="text-sm">
                                {subscriber.subscribed ? 'Active' : 'Inactive'}
                              </Label>
                              <Switch
                                id={`status-${subscriber.id}`}
                                checked={subscriber.subscribed}
                                onCheckedChange={() => toggleSubscriberStatus(subscriber.id, subscriber.subscribed)}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Send Newsletter</CardTitle>
            <CardDescription>
              Create and send a newsletter to all active subscribers
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSendBroadcast}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Newsletter subject line"
                  value={broadcastForm.subject}
                  onChange={handleBroadcastChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your newsletter content here..."
                  rows={10}
                  value={broadcastForm.content}
                  onChange={handleBroadcastChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This will be sent to {subscribers.filter(s => s.subscribed).length} active subscribers.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSending || subscribers.filter(s => s.subscribed).length === 0}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Newsletter
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Tabs>
    </div>
  );
}
