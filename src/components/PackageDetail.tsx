import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MapPin, Star, Download, BookOpen, ChevronRight, Phone, Mail } from "lucide-react";
import { Package, Route } from '../types';
import DestinationMap from './DestinationMap';

interface PackageDetailProps {
    packageId: string;
    onBookNow: (packageData: Package) => void;
    onBack: () => void;
}

// Define types for routes data
type RoutesData = Route[] | string | object | null | undefined;

const PackageDetail = ({ packageId, onBookNow, onBack }: PackageDetailProps) => {
    const [packageData, setPackageData] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [routeCoordinates, setRouteCoordinates] = useState<Array<{id: string, name: string, lat: number, lng: number, type: string, day: number}>>([]);
    const [totalDistance, setTotalDistance] = useState<number>(0);

    useEffect(() => {
        fetchPackageDetail();
        fetchRouteCoordinates();
    }, [packageId]);

    const fetchPackageDetail = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/packages/${packageId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('📦 Package detail data:', data);
            setPackageData(data);
        } catch (error) {
            console.error('Error fetching package details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRouteCoordinates = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/map/package/${packageId}/route`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.success && data.route) {
                setRouteCoordinates(data.route.map((r: any, index: number) => {
                    const locationCount = data.route.slice(0, index).filter((d: any) => d.location === r.location).length;
                    const offset = locationCount * 0.001;
                    return {
                        id: `${r.destination_id || r.location}-day-${r.day}`,
                        name: `${r.location} (Day ${r.day})`,
                        lat: r.lat + offset,
                        lng: r.lng + offset,
                        type: r.type || 'destination',
                        day: r.day
                    };
                }));
                setTotalDistance(data.totalDistance || 0);
            }
        } catch (error) {
            console.error('Error fetching route coordinates:', error);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/generate-pdf/${packageId}`);
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
        }
    };

    // Safe routes parsing function
    const getRoutes = (routesData: RoutesData): Route[] => {
        if (!routesData) return [];

        console.log('🛣️ Routes data type:', typeof routesData, routesData);

        try {
            // If it's already an array, return it
            if (Array.isArray(routesData)) {
                return routesData;
            }

            // If it's a string that looks like JSON, parse it
            if (typeof routesData === 'string') {
                // Check if it's a JSON string
                if (routesData.startsWith('[') || routesData.startsWith('{')) {
                    const parsed = JSON.parse(routesData);
                    return Array.isArray(parsed) ? parsed : [];
                }
                // If it's just a string, return empty array
                return [];
            }

            // If it's an object, try to convert it to array
            if (typeof routesData === 'object' && routesData !== null) {
                // Check if it has route-like properties
                const routeLike = routesData as Partial<Route>;
                if (routeLike.day || routeLike.location) {
                    return [routesData as Route];
                }
                // If it's a plain object but we can't identify the structure, return empty
                return [];
            }

            return [];
        } catch (error) {
            console.error('❌ Error parsing routes:', error);
            console.log('❌ Routes data that caused error:', routesData);
            return [];
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading package details...</p>
            </div>
        );
    }

    if (!packageData) {
        return <div className="text-center py-8">Package not found</div>;
    }

    // Use the safe routes parsing function
    const routes: Route[] = getRoutes(packageData.routes);
    console.log('✅ Parsed routes:', routes);
    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Button variant="ghost" onClick={onBack} className="mb-6">
                    ← Back to Packages
                </Button>

                {/* Package Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
                                {packageData.package_name}
                            </h1>
                            <p className="text-muted-foreground text-lg mb-6">
                                {packageData.description}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <Calendar className="text-accent mx-auto mb-2" size={24} />
                                    <p className="font-semibold">{packageData.duration_days} Days</p>
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                </div>
                                <div className="text-center">
                                    <Users className="text-accent mx-auto mb-2" size={24} />
                                    <p className="font-semibold">Max 20 people</p>
                                    <p className="text-sm text-muted-foreground">Group Size</p>
                                </div>
                                <div className="text-center">
                                    <Star className="text-accent mx-auto mb-2" size={24} />
                                    <p className="font-semibold">{packageData.package_type}</p>
                                    <p className="text-sm text-muted-foreground">Tour Type</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-xl p-6">
                            <h3 className="font-semibold text-xl mb-4">Tour Highlights</h3>
                            {routes.slice(0, 5).map((route: Route, index: number) => (
                                <div key={index} className="flex items-center space-x-3 mb-3">
                                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {index + 1}
                                    </div>
                                    <span className="text-foreground">{route.location}</span>
                                </div>
                            ))}
                            {routes.length === 0 && (
                                <p className="text-muted-foreground">No route information available</p>
                            )}
                            <div className="flex space-x-4 mt-6">
                                <Button
                                    onClick={handleDownloadPDF}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Download size={16} className="mr-2" />
                                    Download PDF
                                </Button>
                                <Button
                                    onClick={() => onBookNow(packageData)}
                                    className="flex-1 bg-accent hover:bg-accent/90 text-white"
                                >
                                    <BookOpen size={16} className="mr-2" />
                                    Book Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tour Route Map */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-4 flex items-center">
                                    <MapPin className="text-accent mr-2" size={24} />
                                    Tour Route Map
                                </h3>
                                {routeCoordinates.length > 0 ? (
                                    <>
                                        <DestinationMap 
                                            destinations={routeCoordinates}
                                            showRoute={true}
                                            center={[routeCoordinates[0].lat, routeCoordinates[0].lng]}
                                            zoom={8}
                                        />
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg">
                                                <span className="text-sm font-semibold text-foreground">Route Chain:</span>
                                                <span className="text-sm text-muted-foreground">{routes.map((r: Route) => r.location).join(' → ')}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                                <span className="text-sm font-semibold text-foreground">Estimated Distance:</span>
                                                <span className="text-lg font-bold text-accent">{totalDistance} km</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                                        <div className="text-center text-muted-foreground">
                                            <MapPin size={48} className="mx-auto mb-2 text-gray-400" />
                                            <p>Loading route map...</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Day by Day Itinerary */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-6">Day by Day Itinerary</h3>
                                <div className="space-y-6">
                                    {routes.length > 0 ? (
                                        routes.map((route: Route, index: number) => (
                                            <div key={index} className="flex space-x-4 group">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                                                        {route.day || index + 1}
                                                    </div>
                                                    {index < routes.length - 1 && (
                                                        <div className="w-0.5 h-8 bg-accent/20 mx-auto mt-2"></div>
                                                    )}
                                                </div>
                                                <div className="flex-grow pb-6">
                                                    <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-xl p-5 border-l-4 border-accent hover:shadow-md transition-shadow">
                                                        <h4 className="font-bold text-lg text-foreground mb-2">
                                                            Day {route.day || index + 1}: {route.location}
                                                        </h4>
                                                        <p className="text-muted-foreground leading-relaxed mb-3">
                                                            {route.description}
                                                        </p>
                                                        {route.activities && Array.isArray(route.activities) && route.activities.length > 0 && (
                                                            <div className="bg-white rounded-lg p-3">
                                                                <p className="font-semibold text-sm mb-2">Activities:</p>
                                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                                    {route.activities.map((activity: string, activityIndex: number) => (
                                                                        <li key={activityIndex} className="flex items-center">
                                                                            <ChevronRight size={16} className="text-accent mr-2" />
                                                                            {activity}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No itinerary details available for this package.</p>
                                            <p className="text-sm mt-2">Please contact us for more information.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-4">Package Price</h3>
                                <div className="text-center mb-4">
                                    <p className="text-3xl font-bold text-accent">${packageData.per_person_cost || packageData.price_per_person_usd}</p>
                                    <p className="text-muted-foreground">per person</p>
                                </div>
                                <Button
                                    onClick={() => onBookNow(packageData)}
                                    className="w-full bg-accent hover:bg-accent/90 text-white py-6 text-lg font-semibold"
                                >
                                    <BookOpen size={20} className="mr-2" />
                                    Book Now
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Tour Information */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-4">Tour Information</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">Duration</span>
                                        <span className="font-semibold">{packageData.duration_days} Days</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">Tour Type</span>
                                        <span className="font-semibold">{packageData.package_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">Group Size</span>
                                        <span className="font-semibold">Flexible</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-4">Need help planning?</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Phone size={18} className="text-accent" />
                                        <span className="text-sm">+94 11 2 555 888</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail size={18} className="text-accent" />
                                        <span className="text-sm">info@lankavacations.com</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PackageDetail;