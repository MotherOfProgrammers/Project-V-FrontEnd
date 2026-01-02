import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

/* =======================
   IMAGE IMPORTS
======================= */
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

/* =======================
   TYPES
======================= */
interface Answer {
  question: string;
  answer: string;
}

/* =======================
   ANIMATION
======================= */
const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

/* =======================
   IMAGE MAPPER
======================= */
const getImageForOption = (key: string, option: string) => {
  if (key === "time") {
    if (option.includes("Within")) return questionBeach;
    if (option.includes("1-3")) return interestWildlife;
    if (option.includes("3-6")) return interestCulture;
    if (option.includes("6-12")) return interestAdventure;
    return interestFood;
  }

  if (key === "duration") {
    if (option.includes("3-5")) return questionBeach;
    if (option.includes("5-7")) return interestWildlife;
    if (option.includes("7-10")) return interestAdventure;
    if (option.includes("10-14")) return interestCulture;
    return accommodationEco;
  }

  if (key === "traveler") {
    if (option.includes("Solo")) return travelerSolo;
    if (option.includes("Couple")) return travelerCouple;
    if (option.includes("Family")) return travelerFamily;
    if (option.includes("friends")) return travelerFriends;
    return accommodationLuxury;
  }

  if (key === "interests") {
    if (option.includes("Beaches")) return questionBeach;
    if (option.includes("Wildlife")) return interestWildlife;
    if (option.includes("Cultural")) return interestCulture;
    if (option.includes("Adventure")) return interestAdventure;
    return interestFood;
  }

  if (key === "stay") {
    if (option.includes("Luxury")) return accommodationLuxury;
    if (option.includes("Mid-range")) return accommodationBoutique;
    if (option.includes("Boutique")) return accommodationBoutique;
    if (option.includes("Eco")) return accommodationEco;
    return travelerSolo;
  }

  if (key === "budget") {
    if (option.includes("Under")) return travelerSolo;
    if (option.includes("$1,000")) return accommodationEco;
    if (option.includes("$2,000")) return accommodationBoutique;
    if (option.includes("$3,500")) return accommodationLuxury;
    return transportPrivate;
  }

  if (key === "transport") {
    if (option.includes("private")) return transportPrivate;
    if (option.includes("shared")) return travelerFriends;
    return questionBeach;
  }

  return questionBeach;
};

/* =======================
   COMPONENT
======================= */
export default function TravelQuestionnaire() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);

  const questions = useMemo(() => ([
    { key: "time", question: "When are you planning to visit Sri Lanka?", options: ["Within the next month", "1-3 months", "3-6 months", "6-12 months", "Just exploring options"] },
    { key: "duration", question: "How long do you plan to stay?", options: ["3-5 days", "5-7 days", "7-10 days", "10-14 days", "More than 2 weeks"] },
    { key: "traveler", question: "What type of traveler are you?", options: ["Solo traveler", "Couple", "Family with kids", "Group of friends", "Business traveler"] },
    { key: "interests", question: "What interests you most?", options: ["Beaches & Relaxation", "Wildlife & Nature", "Cultural & Historical Sites", "Adventure & Sports", "Food & Local Experiences"] },
    { key: "stay", question: "What's your accommodation preference?", options: ["Luxury Hotels & Resorts", "Mid-range Hotels", "Boutique Guesthouses", "Eco-lodges", "Budget-friendly options"] },
    { key: "budget", question: "What's your budget per person?", options: ["Under $1,000", "$1,000 - $2,000", "$2,000 - $3,500", "$3,500 - $5,000", "Above $5,000"] },
    { key: "transport", question: "Do you need transportation services?", options: ["Yes, private car with driver", "Yes, shared tours", "Yes, airport transfers only", "No, I'll arrange my own", "Not sure yet"] }
  ]), []);

  const progress = ((currentStep + 1) / questions.length) * 100;

  const next = () => {
    if (!selectedOption) return;
    const nextAnswers = [...answers];
    nextAnswers[currentStep] = {
      question: questions[currentStep].question,
      answer: selectedOption
    };
    setAnswers(nextAnswers);
    setSelectedOption(nextAnswers[currentStep + 1]?.answer || "");
    setCurrentStep(s => s + 1);
  };

  const back = () => {
    if (currentStep === 0) return;
    setCurrentStep(s => s - 1);
    setSelectedOption(answers[currentStep - 1]?.answer || "");
  };

  const submit = () => {
    const nextAnswers = [...answers];
    nextAnswers[currentStep] = {
      question: questions[currentStep].question,
      answer: selectedOption
    };
    navigate("/itinerary", { state: { answers: nextAnswers } });
  };

  return (
    <section className="min-h-screen py-20 bg-[#2d5f4d]">
      <div className="container mx-auto px-4 max-w-2xl">

        <header className="text-center mb-8 text-white">
          <h2 className="text-4xl font-serif font-bold">Create Your Journey</h2>
        </header>

        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Question {currentStep + 1}/{questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            {...fade}
            className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-2xl p-6"
          >
            <h3 className="text-2xl font-bold mb-4">
              {questions[currentStep].question}
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {questions[currentStep].options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`border-2 rounded-2xl overflow-hidden text-left transition
                    ${selectedOption === opt
                      ? "border-orange-500 ring-2 ring-orange-200"
                      : "border-gray-200 dark:border-zinc-700"}`}
                >
                  <img
                    src={getImageForOption(questions[currentStep].key, opt)}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-4 bg-white dark:bg-zinc-900">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{opt}</span>
                      {selectedOption === opt && (
                        <span className="bg-orange-500 text-white rounded-full p-1">
                          <Check size={14} />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={back} disabled={currentStep === 0}>
            <ChevronLeft /> Back
          </Button>

          {currentStep === questions.length - 1 ? (
            <Button className="bg-orange-500" onClick={submit}>
              Generate Itinerary
            </Button>
          ) : (
            <Button className="bg-orange-500" onClick={next}>
              Next <ChevronRight />
            </Button>
          )}
        </div>

      </div>
    </section>
  );
}
