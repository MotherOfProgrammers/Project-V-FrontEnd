const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/pdfs', express.static('pdfs'));

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Aabid2004@',
    database: 'lanka_vacations',
    charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// JWT Secret
const JWT_SECRET = 'your-secret-key';

// Utility function to calculate distances (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Helper function to parse tags/cities (handles both JSON arrays and comma-separated strings)
function parseTags(tagsData) {
    if (!tagsData) return [];

    try {
        // Try to parse as JSON first
        if (typeof tagsData === 'string' && tagsData.startsWith('[')) {
            return JSON.parse(tagsData);
        }
        // If it's a comma-separated string, split it
        if (typeof tagsData === 'string') {
            return tagsData.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        // If it's already an array, return it
        if (Array.isArray(tagsData)) {
            return tagsData;
        }
    } catch (error) {
        console.log('⚠️ Error parsing tags, using fallback:', tagsData);
        // If parsing fails, try to split by comma
        if (typeof tagsData === 'string') {
            return tagsData.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
    }

    return [];
}

// Helper function to parse cities (handles both JSON arrays and single strings)
function parseCities(citiesData) {
    if (!citiesData) return [];

    try {
        // Try to parse as JSON first
        if (typeof citiesData === 'string' && citiesData.startsWith('[')) {
            return JSON.parse(citiesData);
        }
        // If it's a single city name, return as array with one element
        if (typeof citiesData === 'string') {
            return [citiesData.trim()];
        }
        // If it's already an array, return it
        if (Array.isArray(citiesData)) {
            return citiesData;
        }
    } catch (error) {
        console.log('⚠️ Error parsing cities, using fallback:', citiesData);
        // If parsing fails, return as single item array
        if (typeof citiesData === 'string') {
            return [citiesData.trim()];
        }
    }

    return [];
}

// Routes

// Get all packages
app.get('/api/packages', async (req, res) => {
    try {
        const [packageData] = await pool.execute(`
            SELECT package_id, package_name, package_type, description, duration_days,
                   price_per_person_usd, per_person_cost, included_activities,
                   included_meal_plans, accommodation_type, transport_included,
                   transport_type, image_urls, routes
            FROM packages
        `);

        res.json(packageData);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get package by ID
app.get('/api/packages/:id', async (req, res) => {
    try {
        const [packageData] = await pool.execute(
            'SELECT * FROM packages WHERE package_id = ?',
            [req.params.id]
        );

        if (packageData.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.json(packageData[0]);
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add this with your other routes, before the test route

// Chatbot message endpoint
app.post('/api/chat/message', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        console.log('🤖 Chatbot received message:', message);

        // Simple response logic - you can expand this with AI integration
        const response = await generateChatResponse(message);

        res.json({
            response: response.text,
            data: response.data || null
        });
    } catch (error) {
        console.error('Error processing chat message:', error);
        res.status(500).json({
            response: "🤖 **AI Lanka Vacations Agent**\n\nI'm experiencing technical difficulties. Please try again later or contact our support team for assistance.",
            data: null
        });
    }
});

// Function to generate chatbot responses
async function generateChatResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();


    // Distance queries
    if ((lowerMessage.includes('distance') || lowerMessage.includes('how far') || lowerMessage.includes('travel time')) &&
        (lowerMessage.includes('from') || lowerMessage.includes('to') || lowerMessage.includes('between') || lowerMessage.includes('and'))) {
        console.log('🤖 Routing to distance query handler');
        return await handleDistanceQuery(userMessage);
    }

    // Package queries
    if (lowerMessage.includes('package') || lowerMessage.includes('budget') || lowerMessage.includes('tour')) {
        return await handlePackageQuery(userMessage);
    }

    // Hotel queries - ADD THIS NEW CONDITION
    if (lowerMessage.includes('hotel') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay') ||
        lowerMessage.includes('lodging') || lowerMessage.includes('resort') || lowerMessage.includes('villa')) {
        return await handleHotelQuery(userMessage);
    }

    // City/destination queries
    if (lowerMessage.includes('city') || lowerMessage.includes('cities') || lowerMessage.includes('destination')) {
        return await handleCityQuery(userMessage);
    }

    // Activity queries
    if (lowerMessage.includes('activity') || lowerMessage.includes('activities') || lowerMessage.includes('things to do')) {
        return await handleActivityQuery(userMessage);
    }

    // Cultural queries
    if (lowerMessage.includes('cultural') || lowerMessage.includes('temple') || lowerMessage.includes('historical')) {
        return await handleCulturalQuery(userMessage);
    }

    // Wildlife queries
    if (lowerMessage.includes('wildlife') || lowerMessage.includes('animal') || lowerMessage.includes('safari')) {
        return await handleWildlifeQuery(userMessage);
    }

    // Default response
    return {
        text: `🤖 **AI Lanka Vacations Agent**\n\nI understand you're asking about: "${userMessage}"\n\nI can help you with:\n\n• 🏨 Hotel & accommodation options\n• 📍 Distance calculations between cities\n• 📦 Tour packages & budget planning\n• 🏙️ City information & recommendations\n• 🎯 Activity suggestions\n• 🏛️ Cultural & historical sites\n• 🐘 Wildlife experiences\n\nCould you please be more specific about what you'd like to know?`,
        data: null
    };
}
// Fixed Distance query handler
async function handleDistanceQuery(message) {
    try {
        console.log('📍 Distance query received:', message);

        const lowerMessage = message.toLowerCase();

        // Extract cities from message with better parsing
        let fromCity, toCity;

        // Handle "distance from X to Y" pattern
        if (lowerMessage.includes('from') && lowerMessage.includes('to')) {
            const parts = lowerMessage.split('from')[1]?.split('to');
            if (parts && parts.length === 2) {
                fromCity = parts[0].trim();
                toCity = parts[1].trim();
            }
        }
        // Handle "distance between X and Y" pattern
        else if (lowerMessage.includes('between') && lowerMessage.includes('and')) {
            const parts = lowerMessage.split('between')[1]?.split('and');
            if (parts && parts.length === 2) {
                fromCity = parts[0].trim();
                toCity = parts[1].trim();
            }
        }
        // Handle "distance between X to Y" pattern (mixed pattern)
        else if (lowerMessage.includes('between') && lowerMessage.includes('to')) {
            const parts = lowerMessage.split('between')[1]?.split('to');
            if (parts && parts.length === 2) {
                fromCity = parts[0].trim();
                toCity = parts[1].trim();
            }
        }
        // Handle "X to Y distance" pattern
        else if (lowerMessage.includes(' to ') && lowerMessage.includes('distance')) {
            const parts = lowerMessage.split(' to ');
            if (parts && parts.length === 2) {
                fromCity = parts[0].replace('distance', '').trim();
                toCity = parts[1].replace('distance', '').trim();
            }
        }

        console.log('📍 Extracted cities:', { fromCity, toCity });

        if (!fromCity || !toCity) {
            return {
                text: "🤖 **AI Lanka Vacations Agent**\n\nI can help you calculate distances between Sri Lankan cities! Please specify your query like:\n\n• \"Distance from Colombo to Galle\"\n• \"Distance between Colombo and Kandy\"\n• \"How far is Galle from Mirissa\"\n• \"Travel time between Nuwara Eliya and Ella\"\n• \"Colombo to Kandy distance\"",
                data: null
            };
        }

        // Clean up city names (remove any extra words)
        fromCity = fromCity.replace(/distance|from|to|between|and|how far|travel time/gi, '').trim();
        toCity = toCity.replace(/distance|from|to|between|and|how far|travel time/gi, '').trim();

        console.log('📍 Cleaned cities:', { fromCity, toCity });

        const [destinations] = await pool.execute(`
            SELECT destination_name, latitude, longitude
            FROM destinations
            WHERE LOWER(destination_name) LIKE ? OR LOWER(destination_name) LIKE ?
        `, [`%${fromCity}%`, `%${toCity}%`]);

        console.log('📍 Found destinations:', destinations);

        if (destinations.length < 2) {
            return {
                text: `🤖 **AI Lanka Vacations Agent**\n\n📍 **Distance Information**\n\nI couldn't find both cities in my database.\n\n**From:** ${fromCity}\n**To:** ${toCity}\n\nAvailable cities: ${destinations.map(d => d.destination_name).join(', ')}\n\nPlease try with major Sri Lankan cities like Colombo, Kandy, Galle, Ella, etc.`,
                data: null
            };
        }

        // Find the best matches
        const fromDest = destinations.find(d =>
            d.destination_name.toLowerCase().includes(fromCity) ||
            fromCity.includes(d.destination_name.toLowerCase())
        );

        const toDest = destinations.find(d =>
            d.destination_name.toLowerCase().includes(toCity) ||
            toCity.includes(d.destination_name.toLowerCase())
        );

        console.log('📍 Matched destinations:', { fromDest, toDest });

        if (!fromDest || !toDest) {
            return {
                text: `🤖 **AI Lanka Vacations Agent**\n\n📍 **Distance Information**\n\nI couldn't find exact matches for both cities.\n\n**From:** ${fromCity}\n**To:** ${toCity}\n\nAvailable cities: ${destinations.map(d => d.destination_name).join(', ')}`,
                data: null
            };
        }

        // Calculate distance
        const distance = calculateDistance(
            parseFloat(fromDest.latitude),
            parseFloat(fromDest.longitude),
            parseFloat(toDest.latitude),
            parseFloat(toDest.longitude)
        );

        // Calculate travel time (average 40km/h for road travel)
        const travelTimeHours = distance / 40;
        const hours = Math.floor(travelTimeHours);
        const minutes = Math.round((travelTimeHours - hours) * 60);

        let travelTimeText = '';
        if (hours > 0) {
            travelTimeText = `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            travelTimeText += `${travelTimeText ? ' ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
        }

        return {
            text: `🤖 **AI Lanka Vacations Agent**\n\n📍 **Distance Information**\n\n🚗 **From:** ${fromDest.destination_name}\n🚗 **To:** ${toDest.destination_name}\n\n📏 **Distance:** ${distance.toFixed(1)} km\n⏱️ **Travel Time:** ~${travelTimeText}\n\n💡 *Based on road travel at average speed. Actual time may vary based on traffic and road conditions.*`,
            data: {
                from: fromDest,
                to: toDest,
                distance: distance.toFixed(1),
                travelTime: travelTimeText
            }
        };
    } catch (error) {
        console.error('Error handling distance query:', error);
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\nI can help with distance calculations! Try asking:\n\n• \"Distance from Colombo to Galle\"\n• \"Distance between Colombo and Kandy\"\n• \"How far is Galle from Mirissa\"\n• \"Travel time between Nuwara Eliya and Ella\"\n• \"Colombo to Kandy distance\"",
            data: null
        };
    }
}
// Improved Package query handler
async function handlePackageQuery(message) {
    try {
        const lowerMessage = message.toLowerCase();

        // Extract budget information from message
        let maxBudget = null;
        if (lowerMessage.includes('under $') || lowerMessage.includes('below $')) {
            const match = message.match(/\$(\d+)/);
            if (match) maxBudget = parseInt(match[1]);
        } else if (lowerMessage.includes('under') || lowerMessage.includes('below')) {
            const match = message.match(/(\d+)/);
            if (match) maxBudget = parseInt(match[1]);
        } else if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
            maxBudget = 500; // Default budget for general budget queries
        }

        let query;
        let params = [];

        if (maxBudget) {
            query = `
                SELECT package_name, duration_days, per_person_cost, description
                FROM packages
                WHERE per_person_cost <= ?
                ORDER BY per_person_cost ASC
            `;
            params = [maxBudget];
        } else {
            query = `
                SELECT package_name, duration_days, per_person_cost, description
                FROM packages
                ORDER BY per_person_cost ASC
                    LIMIT 5
            `;
        }

        const [packages] = await pool.execute(query, params);

        let responseText;

        if (packages.length > 0) {
            if (maxBudget) {
                responseText = `🤖 **AI Lanka Vacations Agent**\n\n📦 **Packages Under $${maxBudget}**\n\n`;
            } else {
                responseText = "🤖 **AI Lanka Vacations Agent**\n\n📦 **Available Tour Packages**\n\n";
            }

            packages.forEach(pkg => {
                responseText += `• **${pkg.package_name}**\n  ⏱️ ${pkg.duration_days} days | 💰 $${pkg.per_person_cost}\n  ${pkg.description.substring(0, 100)}...\n\n`;
            });

            if (maxBudget && packages.length === 0) {
                responseText += `💡 *No packages found under $${maxBudget}. Try increasing your budget or check out our other packages!*`;
            } else {
                responseText += "💡 *Use the 'Details' button on our packages page for more information!*";
            }
        } else {
            if (maxBudget) {
                responseText = `🤖 **AI Lanka Vacations Agent**\n\n📦 **Packages Under $${maxBudget}**\n\nNo packages found under $${maxBudget}. Here are our most affordable options:\n\n`;

                // Show cheapest packages as fallback
                const [cheapPackages] = await pool.execute(`
                    SELECT package_name, duration_days, per_person_cost, description
                    FROM packages
                    ORDER BY per_person_cost ASC
                        LIMIT 3
                `);

                cheapPackages.forEach(pkg => {
                    responseText += `• **${pkg.package_name}**\n  ⏱️ ${pkg.duration_days} days | 💰 $${pkg.per_person_cost}\n  ${pkg.description.substring(0, 100)}...\n\n`;
                });
            } else {
                responseText = "🤖 **AI Lanka Vacations Agent**\n\n📦 **Tour Packages**\n\nWe offer various packages ranging from $200 to $2000 per person!\n\n• 🏙️ **City Explorer** (3-5 days)\n• 🏞️ **Cultural Triangle** (5-7 days)  \n• 🏖️ **Beach Paradise** (4-6 days)\n• 🐘 **Wildlife Adventure** (6-8 days)\n• 🌴 **Complete Sri Lanka** (10-14 days)\n\nVisit our Packages section to see detailed itineraries!";
            }
        }

        return {
            text: responseText,
            data: { packages, maxBudget }
        };
    } catch (error) {
        console.error('Error handling package query:', error);
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\n📦 **Tour Packages**\n\nWe offer various packages ranging from $200 to $2000 per person!\n\n• 🏙️ **City Explorer** (3-5 days) - from $280\n• 🏞️ **Cultural Triangle** (5-7 days) - from $550  \n• 🏖️ **Beach Paradise** (4-6 days) - from $350\n• 🐘 **Wildlife Adventure** (6-8 days) - from $690\n• 🌴 **Complete Sri Lanka** (10-14 days) - from $980\n\nVisit our Packages section to see detailed itineraries!",
            data: null
        };
    }
}
// City query handler
async function handleCityQuery(message) {
    try {
        const [destinations] = await pool.execute(`
            SELECT destination_name, type, description, tags
            FROM destinations
            WHERE type = 'city' OR type = 'destination'
                LIMIT 6
        `);

        let responseText = "🤖 **AI Lanka Vacations Agent**\n\n🏙️ **Popular Sri Lankan Cities**\n\n";

        destinations.forEach(dest => {
            const tags = parseTags(dest.tags);
            responseText += `• **${dest.destination_name}**\n  🏷️ ${tags.slice(0, 3).join(', ')}\n  ${dest.description.substring(0, 80)}...\n\n`;
        });

        return {
            text: responseText,
            data: { destinations }
        };
    } catch (error) {
        console.error('Error handling city query:', error);
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\n🏙️ **Popular Sri Lankan Cities**\n\n• **Colombo** - Vibrant capital city\n• **Kandy** - Cultural heart with Temple of the Tooth\n• **Galle** - Historic Dutch fort city\n• **Ella** - Scenic hill country town\n• **Mirissa** - Beautiful beach destination\n• **Sigiriya** - Ancient rock fortress\n• **Nuwara Eliya** - Little England with tea plantations\n\nWhich city would you like to know more about?",
            data: null
        };
    }
}

// Activity query handler

// Improved Activity query handler
async function handleActivityQuery(message) {
    try {
        const lowerMessage = message.toLowerCase();

        // Extract location from message
        let location = null;
        if (lowerMessage.includes('in ')) {
            location = lowerMessage.split('in ')[1].split(' ')[0].trim();
        } else if (lowerMessage.includes('at ')) {
            location = lowerMessage.split('at ')[1].split(' ')[0].trim();
        } else if (lowerMessage.includes('near ')) {
            location = lowerMessage.split('near ')[1].split(' ')[0].trim();
        }

        let activities;
        let query;
        let params = [];

        if (location) {
            // Search for activities in specific location
            query = `
                SELECT activity_name, type, description, duration_hours, intensity, cities
                FROM activities
                WHERE cities LIKE ? OR description LIKE ? OR activity_name LIKE ?
                    LIMIT 6
            `;
            params = [`%${location}%`, `%${location}%`, `%${location}%`];
        } else {
            // General activities query
            query = `
                SELECT activity_name, type, description, duration_hours, intensity, cities
                FROM activities
                         LIMIT 6
            `;
        }

        [activities] = await pool.execute(query, params);

        let responseText;

        if (activities.length > 0) {
            if (location) {
                responseText = `🤖 **AI Lanka Vacations Agent**\n\n🎯 **Activities in ${location.charAt(0).toUpperCase() + location.slice(1)}**\n\n`;
            } else {
                responseText = "🤖 **AI Lanka Vacations Agent**\n\n🎯 **Popular Activities in Sri Lanka**\n\n";
            }

            activities.forEach(activity => {
                const cities = parseCities(activity.cities);
                const locationInfo = cities.length > 0 ? `📍 ${cities.join(', ')} | ` : '';
                responseText += `• **${activity.activity_name}**\n  ${locationInfo}⏱️ ${activity.duration_hours} hours | 💪 ${activity.intensity || 'medium'}\n  ${activity.description.substring(0, 80)}...\n\n`;
            });
        } else {
            if (location) {
                responseText = `🤖 **AI Lanka Vacations Agent**\n\n🎯 **Activities in ${location.charAt(0).toUpperCase() + location.slice(1)}**\n\nNo specific activities found for ${location}. Here are popular Sri Lankan activities instead:\n\n`;

                // Fallback to general activities
                const [generalActivities] = await pool.execute(`
                    SELECT activity_name, type, description, duration_hours, intensity, cities
                    FROM activities
                             LIMIT 6
                `);

                generalActivities.forEach(activity => {
                    const cities = parseCities(activity.cities);
                    const locationInfo = cities.length > 0 ? `📍 ${cities.join(', ')} | ` : '';
                    responseText += `• **${activity.activity_name}**\n  ${locationInfo}⏱️ ${activity.duration_hours} hours | 💪 ${activity.intensity || 'medium'}\n  ${activity.description.substring(0, 80)}...\n\n`;
                });
            } else {
                responseText = "🤖 **AI Lanka Vacations Agent**\n\n🎯 **Popular Activities**\n\n• 🐘 **Wildlife Safaris** - Yala, Udawalawe parks\n• 🏛️ **Cultural Tours** - Ancient cities & temples\n• 🚂 **Train Journeys** - Scenic hill country rides\n• 🏄 **Water Sports** - Surfing, snorkeling, diving\n• 🥾 **Trekking** - Waterfalls & mountain hikes\n• 🍵 **Tea Tasting** - Visit tea plantations\n• 🧘 **Ayurveda** - Traditional wellness treatments\n\nWhat type of activities interest you most?";
            }
        }

        return {
            text: responseText,
            data: { activities, location }
        };
    } catch (error) {
        console.error('Error handling activity query:', error);
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\n🎯 **Popular Activities**\n\n• 🐘 **Wildlife Safaris** - Yala, Udawalawe parks\n• 🏛️ **Cultural Tours** - Ancient cities & temples\n• 🚂 **Train Journeys** - Scenic hill country rides\n• 🏄 **Water Sports** - Surfing, snorkeling, diving\n• 🥾 **Trekking** - Waterfalls & mountain hikes\n• 🍵 **Tea Tasting** - Visit tea plantations\n• 🧘 **Ayurveda** - Traditional wellness treatments\n\nWhat type of activities interest you most?",
            data: null
        };
    }
}

// UPDATED Hotel query handler - REPLACED THE OLD ONE
async function handleHotelQuery(message) {
    try {
        const lowerMessage = message.toLowerCase();

        // Extract location from message
        let location = null;
        let hotelType = null;
        let budgetFilter = null;

        // Extract location
        if (lowerMessage.includes('in ')) {
            location = lowerMessage.split('in ')[1].split(' ')[0].trim();
        } else if (lowerMessage.includes('at ')) {
            location = lowerMessage.split('at ')[1].split(' ')[0].trim();
        } else if (lowerMessage.includes('near ')) {
            location = lowerMessage.split('near ')[1].split(' ')[0].trim();
        }

        // Extract hotel type/budget
        if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('economic')) {
            hotelType = 'economic';
            budgetFilter = 'low';
        } else if (lowerMessage.includes('luxury') || lowerMessage.includes('5 star') || lowerMessage.includes('deluxe')) {
            hotelType = '5_star_deluxe';
            budgetFilter = 'high';
        } else if (lowerMessage.includes('boutique')) {
            hotelType = 'boutique_villa';
        } else if (lowerMessage.includes('4 star')) {
            hotelType = '4_star_superior';
        } else if (lowerMessage.includes('3 star')) {
            hotelType = '3_star_standard';
        }

        let query;
        let params = [];

        if (location && hotelType) {
            // Search by both location and type
            query = `
                SELECT h.hotel_id, h.hotel_name, h.type, h.address, h.price_per_night_usd, 
                       h.amenities, h.image_urls, d.destination_name
                FROM hotels h
                LEFT JOIN destinations d ON h.destination_id = d.destination_id
                WHERE (h.address LIKE ? OR d.destination_name LIKE ?) 
                AND h.type = ?
                ORDER BY h.price_per_night_usd ASC
                LIMIT 6
            `;
            params = [`%${location}%`, `%${location}%`, hotelType];
        } else if (location) {
            // Search by location only
            query = `
                SELECT h.hotel_id, h.hotel_name, h.type, h.address, h.price_per_night_usd, 
                       h.amenities, h.image_urls, d.destination_name
                FROM hotels h
                LEFT JOIN destinations d ON h.destination_id = d.destination_id
                WHERE h.address LIKE ? OR d.destination_name LIKE ?
                ORDER BY h.price_per_night_usd ASC
                LIMIT 6
            `;
            params = [`%${location}%`, `%${location}%`];
        } else if (hotelType) {
            // Search by type only
            query = `
                SELECT h.hotel_id, h.hotel_name, h.type, h.address, h.price_per_night_usd, 
                       h.amenities, h.image_urls, d.destination_name
                FROM hotels h
                LEFT JOIN destinations d ON h.destination_id = d.destination_id
                WHERE h.type = ?
                ORDER BY h.price_per_night_usd ASC
                LIMIT 6
            `;
            params = [hotelType];
        } else if (lowerMessage.includes('cheap') || lowerMessage.includes('budget') || lowerMessage.includes('affordable')) {
            // Budget hotels query
            query = `
                SELECT h.hotel_id, h.hotel_name, h.type, h.address, h.price_per_night_usd, 
                       h.amenities, h.image_urls, d.destination_name
                FROM hotels h
                LEFT JOIN destinations d ON h.destination_id = d.destination_id
                WHERE h.price_per_night_usd <= 50
                ORDER BY h.price_per_night_usd ASC
                LIMIT 6
            `;
        } else {
            // General hotels query
            query = `
                SELECT h.hotel_id, h.hotel_name, h.type, h.address, h.price_per_night_usd, 
                       h.amenities, h.image_urls, d.destination_name
                FROM hotels h
                LEFT JOIN destinations d ON h.destination_id = d.destination_id
                ORDER BY h.price_per_night_usd ASC
                LIMIT 6
            `;
        }

        const [hotels] = await pool.execute(query, params);

        let responseText;

        if (hotels.length > 0) {
            if (location && hotelType) {
                responseText = `🤖 **AI Lanka Vacations Agent**\n\n🏨 **${hotelType.replace('_', ' ').toUpperCase()} Hotels in ${location.charAt(0).toUpperCase() + location.slice(1)}**\n\n`;
            } else if (location) {
                responseText = `🤖 **AI Lanka Vacations Agent**\n\n🏨 **Hotels in ${location.charAt(0).toUpperCase() + location.slice(1)}**\n\n`;
            } else if (hotelType) {
                responseText = `🤖 **AI Lanka Vacations Agent**\n\n🏨 **${hotelType.replace('_', ' ').toUpperCase()} Hotels in Sri Lanka**\n\n`;
            } else if (budgetFilter) {
                responseText = `🤖 **AI Lanka Vacations Agent**\n\n🏨 **Budget Hotels in Sri Lanka**\n\n`;
            } else {
                responseText = "🤖 **AI Lanka Vacations Agent**\n\n🏨 **Popular Hotels in Sri Lanka**\n\n";
            }

            hotels.forEach(hotel => {
                const amenities = parseTags(hotel.amenities);
                const amenityList = amenities.slice(0, 3).join(', ');
                const price = hotel.price_per_night_usd ? `$${hotel.price_per_night_usd}` : 'Price on request';

                responseText += `• **${hotel.hotel_name}**\n  📍 ${hotel.address || hotel.destination_name} | 🏷️ ${hotel.type.replace('_', ' ')} | 💰 ${price}/night\n  🛏️ ${amenityList || 'Standard amenities'}\n\n`;
            });

            responseText += "💡 *Contact us for bookings and special rates!*";
        } else {
            if (location) {
                responseText = `🤖 **AI Lanka Vacations Agent**\n\n🏨 **Hotels in ${location.charAt(0).toUpperCase() + location.slice(1)}**\n\nNo hotels found for "${location}". Here are popular hotels in Sri Lanka instead:\n\n`;

                // Fallback to general hotels
                const [generalHotels] = await pool.execute(`
                    SELECT h.hotel_id, h.hotel_name, h.type, h.address, h.price_per_night_usd, 
                           h.amenities, h.image_urls, d.destination_name
                    FROM hotels h
                    LEFT JOIN destinations d ON h.destination_id = d.destination_id
                    ORDER BY h.price_per_night_usd ASC
                    LIMIT 4
                `);

                generalHotels.forEach(hotel => {
                    const amenities = parseTags(hotel.amenities);
                    const amenityList = amenities.slice(0, 3).join(', ');
                    const price = hotel.price_per_night_usd ? `$${hotel.price_per_night_usd}` : 'Price on request';

                    responseText += `• **${hotel.hotel_name}**\n  📍 ${hotel.address || hotel.destination_name} | 🏷️ ${hotel.type.replace('_', ' ')} | 💰 ${price}/night\n  🛏️ ${amenityList || 'Standard amenities'}\n\n`;
                });
            } else {
                responseText = "🤖 **AI Lanka Vacations Agent**\n\n🏨 **Hotel Information**\n\nWe partner with various accommodation types across Sri Lanka:\n\n• 🏨 **Luxury Hotels** - 5-star properties with premium amenities\n• 🏡 **Boutique Villas** - Private & intimate stays\n• 💰 **Budget Hotels** - Comfortable & affordable options\n• 🌿 **Eco Lodges** - Sustainable tourism experiences\n• 🍵 **Tea Estates** - Plantation stays\n• 🏖️ **Beach Resorts** - Coastal properties\n\nTry asking: \"Hotels in Colombo\", \"Budget hotels in Kandy\", or \"Luxury hotels in Galle\"";
            }
        }

        return {
            text: responseText,
            data: { hotels, location, hotelType }
        };
    } catch (error) {
        console.error('Error handling hotel query:', error);
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\n🏨 **Hotel Information**\n\nWe partner with various accommodation types:\n\n• 🏨 **Luxury Hotels** - 5-star properties\n• 🏡 **Boutique Villas** - Private & intimate stays\n• 💰 **Budget Hotels** - Comfortable & affordable\n• 🌿 **Eco Lodges** - Sustainable tourism\n• 🍵 **Tea Estates** - Plantation stays\n• 🏖️ **Beach Resorts** - Coastal properties\n\nTry asking: \"Hotels in Colombo\", \"Budget hotels\", or \"Luxury hotels in Galle\"",
            data: null
        };
    }
}

// Cultural query handler
async function handleCulturalQuery(message) {
    try {
        const [culturalSites] = await pool.execute(`
            SELECT destination_name, description, tags
            FROM destinations
            WHERE type = 'cultural' OR tags LIKE '%cultural%' OR tags LIKE '%historical%'
                LIMIT 5
        `);

        let responseText = "🤖 **AI Lanka Vacations Agent**\n\n🏛️ **Cultural & Historical Sites**\n\n";

        culturalSites.forEach(site => {
            responseText += `• **${site.destination_name}**\n  ${site.description.substring(0, 100)}...\n\n`;
        });

        return {
            text: responseText,
            data: { culturalSites }
        };
    } catch (error) {
        console.error('Error handling cultural query:', error);
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\n🏛️ **Cultural & Historical Sites**\n\n• **Sigiriya Rock Fortress** - Ancient palace complex\n• **Temple of the Tooth** - Sacred Buddhist temple in Kandy\n• **Anuradhapura** - Ancient capital with sacred Bodhi tree\n• **Polonnaruwa** - Medieval capital with ancient ruins\n• **Dambulla Cave Temple** - Magnificent rock temple\n• **Galle Fort** - UNESCO World Heritage Dutch fort\n\nThese sites are included in our cultural tour packages!",
            data: null
        };
    }
}

// Wildlife query handler
async function handleWildlifeQuery(message) {
    return {
        text: "🤖 **AI Lanka Vacations Agent**\n\n🐘 **Wildlife Experiences**\n\nSri Lanka offers incredible wildlife:\n\n• **Yala National Park** - Leopards, elephants, sloth bears\n• **Udawalawe National Park** - Elephant gatherings\n• **Minneriya National Park** - The Gathering (300+ elephants)\n• **Wilpattu National Park** - Leopards & natural lakes\n• **Sinharaja Forest** - UNESCO rainforest with endemic species\n• **Whale Watching** - Mirissa & Kalpitiya (Nov-Apr)\n• **Turtle Hatcheries** - Kosgoda & Rekawa\n\nOur wildlife packages include safari experiences with expert guides!",
        data: null
    };
}

// Get all destinations - FIXED with proper tag parsing
app.get('/api/destinations', async (req, res) => {
    try {
        const [destinations] = await pool.execute(`
            SELECT
                destination_id,
                destination_name,
                type,
                description,
                latitude,
                longitude,
                best_visit_start,
                best_visit_end,
                image_url,
                tags
            FROM destinations
        `);

        console.log('✅ Destinations fetched successfully:', destinations.length);

        // Transform data to match frontend expectations
        const transformedDestinations = destinations.map(dest => ({
            destination_id: dest.destination_id,
            destination_name: dest.destination_name,
            type: dest.type,
            latitude: parseFloat(dest.latitude),
            longitude: parseFloat(dest.longitude),
            best_season_start: dest.best_visit_start || 'jan',
            best_season_end: dest.best_visit_end || 'dec',
            tags: parseTags(dest.tags) // Use the helper function
        }));

        console.log('🏙️ First destination sample:', transformedDestinations[0]);
        res.json(transformedDestinations);
    } catch (error) {
        console.error('❌ Error fetching destinations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all activities - FIXED with proper parsing
app.get('/api/activities', async (req, res) => {
    try {
        // Get all activities
        const [allActivities] = await pool.execute(`
            SELECT
                activity_id,
                activity_name,
                type,
                description,
                duration_hours,
                intensity,
                price_range,
                tags,
                cities
            FROM activities
        `);

        console.log('✅ All activities fetched:', allActivities.length);

        // Transform data to match frontend expectations
        const transformedActivities = allActivities.map(activity => ({
            activity_id: activity.activity_id,
            activity_name: activity.activity_name,
            type: activity.type,
            description: activity.description,
            duration: activity.duration_hours || 2,
            intensity: activity.intensity || 'medium',
            price_range: activity.price_range || 'moderate',
            tags: parseTags(activity.tags), // Use the helper function
            cities: parseCities(activity.cities) // Use the helper function
        }));

        console.log('🎯 First activity sample:', transformedActivities[0]);
        res.json(transformedActivities);
    } catch (error) {
        console.error('❌ Error fetching activities:', error);
        // Return empty array instead of error
        res.json([]);
    }
});

// Submit questionnaire
app.post('/api/questionnaire', async (req, res) => {
    try {
        const {
            session_id,
            travel_timing,
            travel_duration_range,
            budget,
            accommodation_type,
            num_travelers,
            traveler_composition,
            room_type_preference,
            meal_plan_preference,
            travel_ideas,
            preferred_destinations,
            exact_dates,
            flight_details,
            travel_intention,
            transport_preference,
            transport_method,
            extra_transport_desires,
            exact_days,
            starting_point,
            interests
        } = req.body;

        console.log('📝 Questionnaire received:', {
            session_id,
            preferred_destinations,
            num_travelers,
            exact_days
        });

        const [result] = await pool.execute(
            `INSERT INTO questionnaire_responses
             (response_id, session_id, travel_timing, travel_duration_range, budget,
              accommodation_type, num_travelers, traveler_composition,
              room_type_preference, meal_plan_preference, travel_ideas,
              preferred_destinations, exact_dates, flight_details, travel_intention,
              transport_preference, transport_method, extra_transport_desires,
              exact_days, starting_point, interests)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                session_id,
                travel_timing,
                travel_duration_range,
                budget,
                accommodation_type,
                num_travelers,
                JSON.stringify(traveler_composition),
                room_type_preference,
                meal_plan_preference,
                travel_ideas,
                JSON.stringify(preferred_destinations),
                JSON.stringify(exact_dates),
                JSON.stringify(flight_details),
                JSON.stringify(travel_intention),
                transport_preference,
                transport_method,
                extra_transport_desires,
                exact_days,
                starting_point,
                JSON.stringify(interests)
            ]
        );

        res.json({
            success: true,
            response_id: result.insertId,
            message: 'Questionnaire submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting questionnaire:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Calculate package price
app.post('/api/calculate-price', async (req, res) => {
    try {
        const { package_id, adults, children } = req.body;

        const [packageData] = await pool.execute(
            'SELECT per_person_cost FROM packages WHERE package_id = ?',
            [package_id]
        );

        if (packageData.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const perPersonCost = packageData[0].per_person_cost;
        const adultCost = adults * perPersonCost;
        const childCost = children * (perPersonCost / 2);
        const totalCost = adultCost + childCost;

        res.json({
            adultCost,
            childCost,
            totalCost,
            perPersonCost,
            adults,
            children
        });
    } catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate PDF itinerary
app.get('/api/generate-pdf/:packageId', async (req, res) => {
    try {
        const packageId = req.params.packageId;

        const [packageData] = await pool.execute(
            'SELECT * FROM packages WHERE package_id = ?',
            [packageId]
        );

        if (packageData.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const packageItem = packageData[0];
        const doc = new PDFDocument();

        // Create pdfs directory if it doesn't exist
        if (!fs.existsSync('pdfs')) {
            fs.mkdirSync('pdfs');
        }

        const filename = `itinerary-${packageId}-${Date.now()}.pdf`;
        const filepath = path.join(__dirname, 'pdfs', filename);

        doc.pipe(fs.createWriteStream(filepath));

        // PDF content
        doc.fontSize(20).text(packageItem.package_name, 100, 100);
        doc.fontSize(12).text(`Duration: ${packageItem.duration_days} days`, 100, 130);
        doc.text(`Price per person: $${packageItem.per_person_cost}`, 100, 150);

        if (packageItem.routes) {
            const routes = JSON.parse(packageItem.routes);
            doc.text('Itinerary:', 100, 180);

            routes.forEach((route, index) => {
                doc.text(`Day ${route.day}: ${route.location} - ${route.description}`, 100, 200 + (index * 20));
            });
        }

        doc.end();

        doc.on('end', () => {
            res.json({
                pdfUrl: `/pdfs/${filename}`,
                message: 'PDF generated successfully'
            });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Book package
app.post('/api/book-package', async (req, res) => {
    try {
        const {
            package_id,
            user_details,
            questionnaire_responses,
            total_cost,
            adults,
            children
        } = req.body;

        // Create user if doesn't exist
        const [users] = await pool.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [user_details.email]
        );

        let userId;
        if (users.length === 0) {
            const [result] = await pool.execute(
                `INSERT INTO users (user_id, email, full_name, phone_number, country, passport_number, emergency_contact, special_requirements)
                 VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_details.email,
                    user_details.full_name,
                    user_details.phone,
                    user_details.country,
                    user_details.passport_number,
                    user_details.emergency_contact,
                    user_details.special_requirements
                ]
            );
            userId = result.insertId;
        } else {
            userId = users[0].user_id;
        }

        // Create booking
        const [bookingResult] = await pool.execute(
            `INSERT INTO bookings (booking_id, user_id, full_name, email, phone, country, passport_number,
                                   emergency_contact, special_requirements, total_booking_amount, booking_status)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                userId,
                user_details.full_name,
                user_details.email,
                user_details.phone,
                user_details.country,
                user_details.passport_number,
                user_details.emergency_contact,
                user_details.special_requirements,
                total_cost
            ]
        );

        res.json({
            success: true,
            booking_id: bookingResult.insertId,
            message: 'Booking submitted successfully. We will contact you soon.'
        });

    } catch (error) {
        console.error('Error booking package:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user bookings
app.get('/api/bookings/:email', async (req, res) => {
    try {
        const [bookings] = await pool.execute(
            `SELECT b.*, p.package_name
             FROM bookings b
                      JOIN users u ON b.user_id = u.user_id
                      LEFT JOIN packages p ON b.itinerary_id = p.package_id
             WHERE u.email = ?`,
            [req.params.email]
        );

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API endpoints available:`);
    console.log(`   GET  http://localhost:${PORT}/api/destinations`);
    console.log(`   GET  http://localhost:${PORT}/api/activities`);
    console.log(`   POST http://localhost:${PORT}/api/questionnaire`);
});