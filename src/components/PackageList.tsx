import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MapPin, Download, BookOpen, Eye } from "lucide-react";
import { Package, Route } from '../types';

interface PackageListProps {
    onPackageSelect: (pkg: Package) => void;
    onBookNow: (pkg: Package) => void;
}

// Define types for image URLs
type ImageUrlData = string | string[] | null | undefined;

// Define types for routes data
type RoutesData = Route[] | string | object | null | undefined;

const PackageList = ({ onPackageSelect, onBookNow }: PackageListProps) => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper function to safely get image URL
    const getImageUrl = (imageUrls: ImageUrlData): string => {
        try {
            if (!imageUrls) return '/default-package.jpg';

            // If it's already a string URL, use it directly
            if (typeof imageUrls === 'string') {
                if (imageUrls.startsWith('http')) {
                    return imageUrls;
                }
                // If it's a JSON string array, parse it
                if (imageUrls.startsWith('[')) {
                    const parsed = JSON.parse(imageUrls);
                    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '/default-package.jpg';
                }
                return '/default-package.jpg';
            }

            // If it's an array, use the first item
            if (Array.isArray(imageUrls)) {
                return imageUrls.length > 0 ? imageUrls[0] : '/default-package.jpg';
            }

            return '/default-package.jpg';
        } catch (error) {
            console.error('Error parsing image URLs:', error);
            return '/default-package.jpg';
        }
    };

    // Helper function to safely parse routes
    const getRoutes = (routesData: RoutesData): Route[] => {
        if (!routesData) return [];

        try {
            // If it's already an array, return it
            if (Array.isArray(routesData)) {
                return routesData;
            }

            // If it's a string that looks like JSON, parse it
            if (typeof routesData === 'string') {
                if (routesData.startsWith('[') || routesData.startsWith('{')) {
                    const parsed = JSON.parse(routesData);
                    return Array.isArray(parsed) ? parsed : [];
                }
                return [];
            }

            // If it's an object, try to convert it to array
            if (typeof routesData === 'object' && routesData !== null) {
                // Check if it has route-like properties
                const routeLike = routesData as Partial<Route>;
                if (routeLike.day || routeLike.location) {
                    return [routesData as Route];
                }
            }

            return [];
        } catch (error) {
            console.error('Error parsing routes:', error);
            return [];
        }
    };

    // Rest of the component remains the same...
    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setError(null);
            const response = await fetch('http://localhost:5000/api/packages');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Fetched packages:', data);
            setPackages(data);
        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Failed to load packages. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (packageId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/generate-pdf/${packageId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.pdfUrl) {
                const link = document.createElement('a');
                link.href = `http://localhost:5000${data.pdfUrl}`;
                link.download = `itinerary-${packageId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    if (loading) {
        return (
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading packages...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Tour Packages
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8">{error}</p>
                        <Button onClick={fetchPackages} className="bg-accent hover:bg-accent/90">
                            Try Again
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    if (packages.length === 0) {
        return (
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Tour Packages
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8">
                            No packages available at the moment.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Tour Packages
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Discover our carefully curated Sri Lankan adventures
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {packages.map((pkg) => {
                        const routes = getRoutes(pkg.routes);
                        const imageUrl = getImageUrl(pkg.image_urls);
                        const displayPrice = pkg.per_person_cost || pkg.price_per_person_usd;

                        return (
                            <Card key={pkg.package_id} className="group overflow-hidden border-none shadow-elegant hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt={pkg.package_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/default-package.jpg';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                                    <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {pkg.duration_days} Days
                                    </div>
                                </div>

                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-serif text-2xl font-bold text-foreground">{pkg.package_name}</h3>

                                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                        {pkg.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-b border-border py-3">
                                        <div className="flex items-center space-x-2">
                                            <Calendar size={16} className="text-accent" />
                                            <span>{pkg.duration_days} days</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users size={16} className="text-accent" />
                                            <span>Max 20 people</span>
                                        </div>
                                    </div>

                                    {routes.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-start space-x-2">
                                                <MapPin size={18} className="text-accent mt-1 flex-shrink-0" />
                                                <div className="text-sm text-muted-foreground">
                                                    <strong>Route: </strong>
                                                    {routes.slice(0, 3).map((route: Route) => route.location).join(' → ')}
                                                    {routes.length > 3 && '...'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Starting from</p>
                                            <p className="text-2xl font-bold text-accent">${displayPrice}</p>
                                            <p className="text-xs text-muted-foreground">per person</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() => onPackageSelect(pkg)}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center space-x-2"
                                            >
                                                <Eye size={16} />
                                                <span>Details</span>
                                            </Button>
                                            <Button
                                                onClick={() => onBookNow(pkg)}
                                                className="bg-accent hover:bg-accent/90 text-white"
                                            >
                                                <BookOpen size={16} className="mr-2" />
                                                Book Now
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PackageList;