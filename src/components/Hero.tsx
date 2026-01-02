import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check, MapPin, Calendar, Users } from "lucide-react";
import DestinationMap from "./DestinationMap";

// Import images from local assets
import questionBeach from "@/assets/question-beach.jpg";
import travelerSolo from "@/assets/traveler-solo.jpg";
import travelerCouple from "@/assets/traveler-couple.jpg";
import travelerFamily from "@/assets/traveler-family.jpg";
import travelerFriends from "@/assets/traveler-friends.jpg";
import accommodationLuxury from "@/assets/accommodation-luxury.jpg";
import accommodationBoutique from "@/assets/accommodation-boutique.jpg";
import accommodationEco from "@/assets/accommodation-eco.jpg";
import interestWildlife from "@/assets/interest-wildlife.jpg";
import interestCulture from "@/assets/interest-culture.jpg";
import interestAdventure from "@/assets/interest-adventure.jpg";
import interestFood from "@/assets/interest-food.jpg";
import transportPrivate from "@/assets/transport-private.jpg";

interface Answer {
  question: string;
  answer: string;
}

interface TravelQuestionnaireProps {
  onClose?: () => void;
}

// --- Helpers ---
const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

// Helper to map specific options to specific images
const getImageForOption = (key: string, option: string) => {
  // 1. Time / Planning - Visual variety for timeline options
  if (key === 'time') {
    if (option.includes('Within')) return questionBeach;      // Ready -> Beach
    if (option.includes('1-3')) return interestWildlife;      // Short term -> Wildlife
    if (option.includes('3-6')) return interestCulture;       // Mid term -> Culture
    if (option.includes('6-12')) return interestAdventure;    // Long term -> Adventure
    if (option.includes('exploring')) return interestFood;    // Just looking -> Food
  }

  // 2. Duration - Short trips vs Deep dives
  if (key === 'duration') {
    if (option.includes('3-5')) return questionBeach;         // Quick getaway
    if (option.includes('5-7')) return interestWildlife;      // Standard trip
    if (option.includes('7-10')) return interestAdventure;    // Active trip
    if (option.includes('10-14')) return interestCulture;     // Deep dive
    if (option.includes('More than')) return accommodationEco;// Long stay/Lifestyle
  }

  // 3. Traveler Type
  if (key === 'traveler') {
    if (option.includes('Solo')) return travelerSolo;
    if (option.includes('Couple')) return travelerCouple;
    if (option.includes('Family')) return travelerFamily;
    if (option.includes('Friends')) return travelerFriends;
    if (option.includes('Business')) return accommodationLuxury;
  }
  
  // 4. Interests
  if (key === 'interests') {
    if (option.includes('Beach')) return questionBeach;
    if (option.includes('Wildlife')) return interestWildlife;
    if (option.includes('Cultural')) return interestCulture;
    if (option.includes('Adventure')) return interestAdventure;
    if (option.includes('Food')) return interestFood;
  }

  // 5. Accommodation
  if (key === 'stay') {
    if (option.includes('Luxury')) return accommodationLuxury;
    if (option.includes('Mid-range')) return accommodationBoutique;
    if (option.includes('Boutique')) return accommodationBoutique;
    if (option.includes('Eco')) return accommodationEco;
    if (option.includes('Budget')) return travelerSolo; // Simple/Backpacker vibe
  }

  // 6. Budget - Spending power visuals
  if (key === 'budget') {
    if (option.includes('Under')) return travelerSolo;           // Budget/Backpacker
    if (option.includes('$1,000')) return accommodationEco;      // Value/Eco
    if (option.includes('$2,000')) return accommodationBoutique; // Premium
    if (option.includes('$3,500')) return accommodationLuxury;   // Luxury
    if (option.includes('Above')) return transportPrivate;       // Ultra/Exclusive
  }
  
  // 7. Transportation
  if (key === 'transport') {
    if (option.includes('private car')) return transportPrivate;
    if (option.includes('shared')) return travelerFriends;
    if (option.includes('airport')) return transportPrivate;
    if (option.includes('own')) return questionBeach; // Freedom
  }

  // Fallback default
  return questionBeach;
};

const TravelQuestionnaire = ({ onClose }: TravelQuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [showItinerary, setShowItinerary] = useState(false);

  const questions = useMemo(() => ([
    { id: 1, key: "time", question: "When are you planning to visit Sri Lanka?", options: ["Within the next month","1-3 months","3-6 months","6-12 months","Just exploring options"] },
    { id: 2, key: "duration", question: "How long do you plan to stay?", options: ["3-5 days","5-7 days","7-10 days","10-14 days","More than 2 weeks"] },
    { id: 3, key: "traveler", question: "What type of traveler are you?", options: ["Solo traveler","Couple","Family with kids","Group of friends","Business traveler"] },
    { id: 4, key: "interests", question: "What interests you most?", options: ["Beaches & Relaxation","Wildlife & Nature","Cultural & Historical Sites","Adventure & Sports","Food & Local Experiences"] },
    { id: 5, key: "stay", question: "What's your accommodation preference?", options: ["Luxury Hotels & Resorts","Mid-range Hotels","Boutique Guesthouses","Eco-lodges","Budget-friendly options"] },
    { id: 6, key: "budget", question: "What's your budget per person?", options: ["Under $1,000","$1,000 - $2,000","$2,000 - $3,500","$3,500 - $5,000","Above $5,000"] },
    { id: 7, key: "transport", question: "Do you need transportation services?", options: ["Yes, private car with driver","Yes, shared tours","Yes, airport transfers only","No, I'll arrange my own","Not sure yet"] },
  ]), []);

  const handleNext = () => {
    if (!selectedOption) return;
    const next = [...answers];
    next[currentStep] = { question: questions[currentStep].question, answer: selectedOption };
    setAnswers(next);
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedOption(next[currentStep + 1]?.answer || "");
    }
  };

  const handleBack = () => {
    if (currentStep === 0) return;
    setCurrentStep(s => s - 1);
    setSelectedOption(answers[currentStep - 1]?.answer || "");
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    const next = [...answers];
    next[currentStep] = { question: questions[currentStep].question, answer: selectedOption };
    setAnswers(next);
    setCurrentStep(questions.length);
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  // --- Itinerary generation ---
  const generateItinerary = () => {
    const interests = answers.find(a => a.question.includes("interests"))?.answer || "Cultural & Historical Sites";
    const base = [
      { day: 1, title: "Arrival in Colombo", description: "Airport pickup and city intro", location: "Colombo", coords: { lat: 6.9271, lng: 79.8612 } },
      { day: 2, title: "Sigiriya", description: "Rock fortress & gardens", location: "Sigiriya", coords: { lat: 7.9570, lng: 80.7603 } },
      { day: 3, title: "Kandy", description: "Temple of the Tooth", location: "Kandy", coords: { lat: 7.2906, lng: 80.6337 } },
      { day: 4, title: "Nuwara Eliya", description: "Tea country", location: "Nuwara Eliya", coords: { lat: 6.9497, lng: 80.7891 } },
      { day: 5, title: "Galle", description: "Dutch Fort", location: "Galle", coords: { lat: 6.0329, lng: 80.2168 } },
      { day: 6, title: "Mirissa", description: "Beach time", location: "Mirissa", coords: { lat: 5.9467, lng: 80.4686 } },
      { day: 7, title: "Departure", description: "Return to Colombo", location: "Colombo", coords: { lat: 6.9271, lng: 79.8612 } },
    ];
    return interests ? base : base;
  };

  // --- Itinerary Page ---
  if (currentStep === questions.length && showItinerary) {
    const itinerary = generateItinerary();
    const centerLat = itinerary.reduce((s, d) => s + d.coords.lat, 0) / itinerary.length;
    const centerLng = itinerary.reduce((s, d) => s + d.coords.lng, 0) / itinerary.length;

    return (
      <section className="py-12 bg-[#2d5f4d] min-h-screen">
        <div className="container mx-auto px-4">
          <motion.div {...fade} className="max-w-7xl mx-auto">
            <header className="text-center mb-10">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">Your Personalized Sri Lanka Journey</h2>
              <p className="text-white/90">A visual route + day-by-day plan crafted for you</p>
            </header>

            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-[#f97a1f]" size={28} />
                <h3 className="font-bold text-2xl text-gray-800">Route Map</h3>
              </div>
              <div className="h-[420px] rounded-2xl overflow-hidden">
                <DestinationMap
                  destinations={itinerary.map((d, i) => ({ id: `day-${d.day}`, name: `${d.location} (Day ${d.day})`, lat: d.coords.lat + i * 0.001, lng: d.coords.lng + i * 0.001, type: 'destination', description: d.title, day: d.day }))}
                  showRoute
                  center={[centerLat, centerLng]}
                  zoom={8}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6"><Calendar className="text-[#f97a1f]" size={28} /><h3 className="font-bold text-2xl">Day-by-Day</h3></div>
                <div className="space-y-5">
                  {itinerary.map(d => (
                    <motion.div key={d.day} {...fade} className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#f97a1f] text-white grid place-items-center font-bold">{d.day}</div>
                      <div className="flex-1 bg-gradient-to-br from-orange-50 to-green-50 rounded-xl p-5">
                        <h4 className="font-bold">{d.title}</h4>
                        <p className="text-gray-600">{d.description}</p>
                        <span className="inline-flex items-center gap-2 text-sm text-[#f97a1f] mt-2"><MapPin size={14}/> {d.location}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <aside className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4"><Users className="text-[#f97a1f]" size={24}/><h3 className="font-bold text-xl">Summary</h3></div>
                <div className="space-y-3">
                  {answers.map((a, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{a.question}</p>
                      <p className="font-semibold">{a.answer}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 mt-6 flex gap-4 justify-center">
              <Button onClick={() => setShowItinerary(false)} variant="outline">Customize</Button>
              <Button onClick={onClose} variant="outline">Return Home</Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // --- Thank You ---
  if (currentStep === questions.length) {
    return (
      <section className="py-20 bg-[#2d5f4d] min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <motion.div {...fade} className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full grid place-items-center mx-auto mb-4"><Check className="text-green-600" size={36}/></div>
            <h2 className="font-serif text-4xl font-bold mb-3">All Set!</h2>
            <p className="text-gray-600 mb-6">Your preferences are saved. Generate a visual itinerary next.</p>
            <div className="flex gap-3">
              <Button className="flex-1 bg-[#f97a1f]" onClick={() => setShowItinerary(true)}>Generate Itinerary</Button>
              <Button className="flex-1" variant="outline" onClick={onClose}>Return Home</Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // --- Questionnaire ---
  return (
    <section className="py-20 bg-[#2d5f4d] min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        {onClose && (
          <button onClick={onClose} className="mb-4 text-white/90 hover:text-orange-300 flex items-center gap-2" aria-label="Back to home"><ChevronLeft size={18}/>Back</button>
        )}

        <header className="text-center mb-8">
          <p className="text-white/80 uppercase text-xs tracking-widest">Plan Your Trip</p>
          <h2 className="font-serif text-4xl text-white font-bold">Create Your Journey</h2>
        </header>

        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2"><span>Question {currentStep + 1}/{questions.length}</span><span>{Math.round(progress)}%</span></div>
          <div className="h-2 bg-white/20 rounded-full"><div className="h-full bg-[#f97a1f] rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} {...fade} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            <h3 className="font-serif text-2xl font-bold mb-4">{questions[currentStep].question}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {questions[currentStep].options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedOption(opt)}
                  aria-pressed={selectedOption === opt}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition-all text-left ${selectedOption === opt ? 'border-[#f97a1f] ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'}`}
                >
                  <img 
                    src={getImageForOption(questions[currentStep].key, opt)} 
                    alt={opt} 
                    className="h-28 w-full object-cover" 
                  />
                  <div className="p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{opt}</span>
                      {selectedOption === opt && <span className="w-6 h-6 rounded-full bg-[#f97a1f] grid place-items-center"><Check className="text-white" size={14}/></span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center gap-4 mt-6">
          <Button onClick={handleBack} disabled={currentStep === 0} variant="outline" className="px-6 py-5"><ChevronLeft size={18}/>Back</Button>
          {currentStep === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={!selectedOption} className="bg-[#f97a1f] px-8 py-5">Submit<Check className="ml-2" size={18}/></Button>
          ) : (
            <Button onClick={handleNext} disabled={!selectedOption} className="bg-[#f97a1f] px-8 py-5">Next<ChevronRight className="ml-2" size={18}/></Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TravelQuestionnaire;