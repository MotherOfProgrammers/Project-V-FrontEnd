import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Calculator, User, Mail, Phone, MapPin, FileText } from "lucide-react";

interface Package {
  package_id: string;
  package_name: string;
  per_person_cost: number;
}

interface BookingModalProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
}

const BookingModal = ({ package: pkg, isOpen, onClose, onBookingComplete }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // User details form
  const [userDetails, setUserDetails] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    passport_number: '',
    emergency_contact: '',
    special_requirements: ''
  });

  if (!isOpen) return null;

  const calculatePrice = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: pkg.package_id,
          adults: parseInt(adults.toString()),
          children: parseInt(children.toString())
        })
      });

      const data = await response.json();
      setCalculation(data);
      setStep(2);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/book-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: pkg.package_id,
          user_details: userDetails,
          total_cost: calculation.totalCost,
          adults: adults,
          children: children
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep(3);
        onBookingComplete();
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {step === 1 && 'Book Package'}
            {step === 2 && 'Complete Your Booking'}
            {step === 3 && 'Booking Confirmed'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>

        {/* Step 1: Participant Calculation */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{pkg.package_name}</h3>
              <p className="text-muted-foreground">Calculate your package cost</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Adults</label>
                <Input
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Children</label>
                <Input
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> Children (under 12) pay 50% of adult price
              </p>
            </div>

            <Button
              onClick={calculatePrice}
              className="w-full bg-accent hover:bg-accent/90 text-white py-6"
            >
              <Calculator size={20} className="mr-2" />
              Calculate Price & Continue
            </Button>
          </div>
        )}

        {/* Step 2: User Details Form */}
        {step === 2 && calculation && (
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Price Summary</h4>
              <div className="space-y-1 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>{calculation.adults} Adults × ${calculation.perPersonCost}</span>
                  <span>${calculation.adultCost}</span>
                </div>
                {calculation.children > 0 && (
                  <div className="flex justify-between">
                    <span>{calculation.children} Children × ${calculation.perPersonCost / 2}</span>
                    <span>${calculation.childCost}</span>
                  </div>
                )}
                <div className="border-t border-green-200 pt-1 mt-1 font-semibold">
                  <span>Total Cost:</span>
                  <span>${calculation.totalCost}</span>
                </div>
              </div>
            </div>

            {/* User Details Form */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Personal Information</h4>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <User size={16} className="mr-2 text-accent" />
                    Full Name *
                  </label>
                  <Input
                    name="full_name"
                    value={userDetails.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Mail size={16} className="mr-2 text-accent" />
                    Email *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={userDetails.email}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Phone size={16} className="mr-2 text-accent" />
                    Phone Number *
                  </label>
                  <Input
                    name="phone"
                    value={userDetails.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <MapPin size={16} className="mr-2 text-accent" />
                    Country *
                  </label>
                  <Input
                    name="country"
                    value={userDetails.country}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <FileText size={16} className="mr-2 text-accent" />
                  Passport Number
                </label>
                <Input
                  name="passport_number"
                  value={userDetails.passport_number}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Emergency Contact</label>
                <Input
                  name="emergency_contact"
                  value={userDetails.emergency_contact}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Special Requirements</label>
                <Textarea
                  name="special_requirements"
                  value={userDetails.special_requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitBooking}
                disabled={loading || !userDetails.full_name || !userDetails.email || !userDetails.phone || !userDetails.country}
                className="flex-1 bg-accent hover:bg-accent/90 text-white"
              >
                {loading ? 'Submitting...' : 'Submit Booking'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground">Booking Submitted Successfully!</h3>

            <p className="text-muted-foreground">
              Thank you for your booking. We have received your details and our travel experts will contact you within 24 hours to confirm your package and discuss next steps.
            </p>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong><br />
                1. Our agent will contact you to verify details<br />
                2. We'll customize your itinerary if needed<br />
                3. You'll receive the final confirmation and payment details
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-accent hover:bg-accent/90 text-white"
                disabled
              >
                Pay Advance (Coming Soon)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;