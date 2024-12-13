document.addEventListener('DOMContentLoaded', () => {
    const destinations = [
                { name: 'Paris', country: 'FR', description: 'City of lights.', image: 'img/paris.jpg', lat: 48.8566, lon: 2.3522 },
                { name: 'Tokyo', country: 'JP', description: 'Modern and traditional.', image: 'img/tokyo.jpg', lat: 35.6895, lon: 139.6917 },
                { name: 'New York', country: 'US', description: 'City that never sleeps.', image: 'img/new_york.jpg', lat: 40.7128, lon: -74.0060 },
                { name: 'Dubai', country: 'AE', description: 'Luxury in the desert.', image: 'img/dubai.jpg', lat: 25.276987, lon: 55.296249 },
                { name: 'Sydney', country: 'AU', description: 'Landmarks by the water.', image: 'img/sydney.jpg', lat: -33.8688, lon: 151.2093 },
                { name: 'Athens', country: 'GR', description: 'Birthplace of democracy and ancient ruins.', image: 'img/athens.jpg', lat: 37.9838, lon: 23.7275 },
                { name: 'Banff', country: 'CA', description: 'Majestic mountains and crystal-clear lakes.', image: 'img/banff.jpg', lat: 51.1784, lon: -115.5708 },
                { name: 'Barcelona', country: 'ES', description: 'Gaudi architecture and Mediterranean vibes.', image: 'img/barcelona.jpg', lat: 41.3851, lon: 2.1734 },
                { name: 'Honolulu', country: 'US', description: 'Tropical paradise with pristine beaches.', image: 'img/honolulu.jpg', lat: 21.3069, lon: -157.8583 },
                { name: 'Edinburgh', country: 'GB', description: 'Historic castles and dramatic landscapes.', image: 'img/edinburgh.jpg', lat: 55.9533, lon: -3.1883 },
                { name: 'Maldives', country: 'MV', description: 'Luxurious overwater villas and turquoise waters.', image: 'img/maldives.jpg', lat: 3.2028, lon: 73.2207 },
                { name: 'Milford Sound', country: 'NZ', description: 'Breathtaking fjords and natural beauty.', image: 'img/milford.jpg', lat: -44.6167, lon: 167.8667 },
                { name: 'Kathmandu', country: 'NP', description: 'A rich blend of culture and history.', image: 'img/kathmandu.jpg', lat: 27.7172, lon: 85.3240 },
                { name: 'Berlin', country: 'DE', description: 'A city of history, culture, and modernity.', image: 'img/berlin.jpg', lat: 52.5200, lon: 13.4050 },
                { name: 'Reykjavik', country: 'IS', description: 'Land of fire and ice with geothermal spas.', image: 'img/reykjavik.jpg', lat: 64.1355, lon: -21.8954 },
                { name: 'Santorini', country: 'GR', description: 'Whitewashed houses and stunning sunsets.', image: 'img/santorini.jpg', lat: 36.3932, lon: 25.4615 }
            ];
        });
        

    const favorites = [];
    const destinationsContainer = document.getElementById('destinations-container');
    const favoritesContainer = document.getElementById('favorites-container');
    const flightCardsContainer = document.getElementById('flight-cards-container');

    // Render destinations
    const renderDestinations = async () => {
        destinationsContainer.innerHTML = '';
        for (const dest of destinations) {
            const weather = await fetchWeather(dest.lat, dest.lon);
            const destinationCard = `
                <div class="destination-card">
                    <img src="${dest.image}" alt="${dest.name}">
                    <h3>${dest.name}</h3>
                    <p>${dest.description}</p>
                    <p>Weather: ${weather}</p>
                    <button onclick="addToFavorites('${dest.name}')">Add to Favorites</button>
                </div>
            `;
            destinationsContainer.insertAdjacentHTML('beforeend', destinationCard);
        }
    };

    // Fetch weather data
    const fetchWeather = async (lat, lon) => {
        const url = `https://meteostat.p.rapidapi.com/point/monthly?lat=${lat}&lon=${lon}&start=2020-01-01&end=2020-12-31`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '25921a876dedb40050d925f95b200240',
                'x-rapidapi-host': 'meteostat.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            return data.data ? `Avg Temp: ${data.data[0].tavg}°C` : 'N/A';
        } catch (error) {
            console.error('Weather fetch error:', error);
            return 'N/A';
        }
    };

    // Add to favorites
    window.addToFavorites = (name) => {
        if (!favorites.includes(name)) {
            favorites.push(name);
            renderFavorites();
        }
    };

    // Render favorites
    const renderFavorites = () => {
        favoritesContainer.innerHTML = favorites.map(fav => `
            <div class="destination-card">
                <h3>${fav}</h3>
            </div>
        `).join('');
    };

    const fetchFlightSchedules = async (departureIATA, arrivalIATA, date) => {
        const url = `https://api.aviationstack.com/v1/timetable?access_key=4e0d66144a976d3e5e7046505c9b1c58&iataCode=${departureIATA}&type=departure`;
        const options = {
            method: 'GET'
        };
    
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();
    
            if (data && data.data) {
                // Filter flights based on the arrival IATA code and date
                const filteredFlights = data.data.filter(flight => {
                    return (
                        flight.arrival?.iataCode === arrivalIATA &&
                        new Date(flight.departure.scheduledTime).toISOString().split('T')[0] === date
                    );
                });
    
                return filteredFlights.map(flight => ({
                    airline: flight.airline?.name || 'Unknown Airline',
                    flightNumber: flight.flight?.iataNumber || 'Unknown Flight Number',
                    departureAirport: flight.departure?.iataCode || 'Unknown Departure Airport',
                    arrivalAirport: flight.arrival?.iataCode || 'Unknown Arrival Airport',
                    scheduledDeparture: flight.departure?.scheduledTime || 'No Scheduled Time',
                    scheduledArrival: flight.arrival?.scheduledTime || 'No Scheduled Time',
                    status: flight.status || 'Unknown Status'
                }));
            } else {
                console.error('No flight data found:', data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching flight schedules:', error);
            return [];
        }
    };
    
    // Render flight results
    const renderFlights = async () => {
        const fromLocation = document.getElementById('from-location').value.trim();
        const toLocation = document.getElementById('to-location').value.trim();
        const departureDate = document.getElementById('departure-date').value.trim();
    
        if (!fromLocation || !toLocation || !departureDate) {
            alert('Please fill in all fields to search for flights.');
            return;
        }
    
        const flightCardsContainer = document.getElementById('flight-cards-container');
        flightCardsContainer.innerHTML = '<p>Loading flight schedules...</p>';
    
        const flights = await fetchFlightSchedules(fromLocation, toLocation, departureDate);
    
        flightCardsContainer.innerHTML = '';
        if (flights.length > 0) {
            flights.forEach(flight => {
                const flightCard = `
                    <div class="flight-card">
                        <h4>Airline: ${flight.airline}</h4>
                        <p>Flight Number: ${flight.flightNumber}</p>
                        <p>From: ${flight.departureAirport}</p>
                        <p>To: ${flight.arrivalAirport}</p>
                        <p>Scheduled Departure: ${flight.scheduledDeparture}</p>
                        <p>Scheduled Arrival: ${flight.scheduledArrival}</p>
                        <p>Status: ${flight.status}</p>
                    </div>
                `;
                flightCardsContainer.insertAdjacentHTML('beforeend', flightCard);
            });
        } else {
            flightCardsContainer.innerHTML = '<p>No flights found for the selected criteria.</p>';
        }
    };
    
    // Attach the event listener to the search button
    document.getElementById('search-flights').addEventListener('click', renderFlights);    
        
    renderDestinations();
});



//handle onclick calls from html buttons
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.error(`Section with ID "${sectionId}" not found.`);
    }
}
