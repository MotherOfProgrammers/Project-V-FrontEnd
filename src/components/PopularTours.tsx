import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Star, ArrowRight } from "lucide-react";
import beachImage from "@/assets/beach-scene.jpg";
import templeImage from "@/assets/temple-heritage.jpg";
import teaImage from "@/assets/tea-plantations.jpg";
import sigiriyaImage from "@/assets/sigiriya-rock.jpg";
import trainImage from "@/assets/train-bridge.jpg";
import wildlifeImage from "@/assets/wildlife-safari.jpg";

const tours = [
  {
    id: 1,
    title: "Coastal Paradise Tour",
    duration: "7 Days",
    image: beachImage,
    price: "$1,299",
    rating: 4.9,
    description: "Experience pristine beaches, water sports, and coastal cuisine along Sri Lanka's stunning southern coast.",
    highlights: ["Beach Resorts", "Water Activities", "Seafood Tours"],
  },
  {
    id: 2,
    title: "Cultural Heritage Journey",
    duration: "5 Days",
    image: templeImage,
    price: "$999",
    rating: 4.8,
    description: "Discover ancient temples, royal palaces, and traditional crafts in the cultural triangle.",
    highlights: ["Ancient Cities", "Temple Tours", "Cultural Shows"],
  },
  {
    id: 3,
    title: "Hill Country Adventure",
    duration: "6 Days",
    image: teaImage,
    price: "$1,149",
    rating: 4.9,
    description: "Explore lush tea plantations, misty mountains, and scenic train rides through breathtaking landscapes.",
    highlights: ["Tea Estates", "Mountain Hiking", "Train Journey"],
  },
  {
    id: 4,
    title: "Sigiriya Rock Expedition",
    duration: "4 Days",
    image: sigiriyaImage,
    price: "$899",
    rating: 5.0,
    description: "Climb the iconic Lion Rock fortress and explore ancient frescoes and royal gardens.",
    highlights: ["UNESCO Site", "Ancient Fortress", "Royal Gardens"],
  },
  {
    id: 5,
    title: "Scenic Rail Journey",
    duration: "3 Days",
    image: trainImage,
    price: "$699",
    rating: 4.9,
    description: "Experience the world-famous train journey through Ella, crossing the iconic Nine Arch Bridge.",
    highlights: ["Nine Arch Bridge", "Ella Rock", "Local Villages"],
  },
  {
    id: 6,
    title: "Wildlife Safari Adventure",
    duration: "5 Days",
    image: wildlifeImage,
    price: "$1,199",
    rating: 4.8,
    description: "Witness majestic elephants, leopards, and exotic birds at Sri Lanka's premier national parks.",
    highlights: ["Yala Safari", "Elephants", "Bird Watching"],
  },
];

const PopularTours = () => {
  return (
    <section id="tours" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-accent font-medium mb-4 tracking-widest text-sm uppercase">
            Curated Experiences
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6">
            Popular Retreats
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked tours showcasing the best of Sri Lanka's natural beauty and rich cultural heritage
          </p>
        </div>

        {/* Tour Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tours.map((tour, idx) => (
            <Card 
              key={tour.id} 
              className="group overflow-hidden border-none shadow-elegant hover:shadow-hover transition-all duration-500 hover:-translate-y-2 bg-card animate-fade-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={tour.image} 
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-soft">
                  <Star size={14} className="text-accent fill-accent" />
                  <span className="text-sm font-semibold text-foreground">{tour.rating}</span>
                </div>
                
                {/* Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-serif text-2xl font-bold text-primary-foreground mb-1">
                    {tour.title}
                  </h3>
                  <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                    <Calendar size={14} />
                    <span>{tour.duration}</span>
                    <span className="mx-2">•</span>
                    <Users size={14} />
                    <span>2-12 people</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {tour.description}
                </p>
                
                {/* Highlights */}
                <div className="flex flex-wrap gap-2">
                  {tour.highlights.map((highlight, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent/10 text-accent"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Starting from</p>
                    <p className="text-2xl font-bold text-accent">{tour.price}</p>
                  </div>
                  <Button variant="default" size="sm" className="group/btn">
                    View Details
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="xl">
            View All Tours
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularTours;
