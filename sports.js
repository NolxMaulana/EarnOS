import cycleTLS from 'cycletls'; 
import Imap from 'node-imap'; 
import { simpleParser } from 'mailparser'; 
import fs from 'fs/promises'; 
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const VERIFICATION_LINK_REGEX = /https:\/\/sportsbet\.io\/id\/verify\/[a-zA-Z0-9\-_\.]+/g;


const baseEmail = "hoplahkumahasialamunkitumah@gmail.com";
const basePassword = "zudhzrgydnpxcewt"
const proxyUrl = null; // Format: "http://user:pass@host:port";


function generateUniqueDeviceId() {
    const timestampMs = Date.now();
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < 10; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `${timestampMs}-${randomString}`;
}

async function getRecaptchaToken() {
     try {
        console.log("[API Caller] Calling http://141.11.62.68:3002/getToken");
        const response = await fetch('http://141.11.62.68:3002/getToken');

        if (!response.ok) {
            // Handle HTTP errors (e.g., 404, 500)
            console.error(`[API Caller] HTTP error! status: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data) {
            console.log("[API Caller] Token received from local API:", data);
            return data;
        } else {
            console.error("[API Caller] API call failed or token not found in response:", data.message);
            return null;
        }
    } catch (error) {
        console.error(`[API Caller] Error calling local /getToken API: ${error.message}\n${error.stack}`);
        return null;
    }
}

class UsernameGenerator {
    constructor() {
        this.names = [
            "John", "Jane", "Alex", "Emily", "Michael", "Sophia", "Daniel", "Olivia",
            "William", "Ava", "James", "Isabella", "Benjamin", "Mia", "Jacob", "Charlotte",
            "Ethan", "Amelia", "Matthew", "Harper", "Joseph", "Evelyn", "David", "Abigail",
            "Lucas", "Ella", "Jackson", "Scarlett", "Sebastian", "Grace", "Oliver", "Chloe",
            "Samuel", "Victoria", "Henry", "Lily", "Andrew", "Zoe", "Gabriel", "Nora",
            "Anthony", "Hannah", "Christopher", "Layla", "Dylan", "Riley", "Julian", "Aria",
            "Grace", "Liam", "Emma", "Noah", "Olivia", "Ava", "Sophia", "Isabella", "Mason",
            "Logan", "Lucas", "Aiden", "Jackson", "Ethan",
            "Mateo", "Leo", "Ezra", "Milo",
            "Asher", "Elijah", "Caleb", "Levi", "Wyatt", "Owen", "Stella", "Hazel", "Aurora",
            "Violet", "Ruby", "Ivy", "Willow", "Juniper", "Daisy", "Rose", "Poppy", "Olive",
            "Luna", "Maya", "Nova", "Freya", "Anya", "Zara", "Elara", "Seraphina", "Thalia",
            "Jasmine", "Piper", "Willow", "Skylar", "River", "Forest", "Stone", "Sage",
            "Rain", "Brook", "Ocean", "Lake", "Sky", "Cloud", "Star", "Sun", "Moon",
            "Echo", "Phoenix", "Raven", "Falcon", "Hawk", "Wolf", "Bear", "Lion", "Tiger",
            "Fox", "Eagle", "Robin", "Sparrow", "Dove", "Wren", "Lark", "Jay", "Kestrel",
            "Griffin", "Basil", "Clover", "Dewdrop", "Fern", "Glimmer", "Haze", "Indigo",
            "Jubilee", "Kaleidoscope", "Lavender", "Misty", "Nimbus", "Opal", "Petrichor",
            "Quasar", "Rhapsody", "Solstice", "Terra", "Umbra", "Vesper", "Whisper", "Xenon",
            "Yarrow", "Zephyr", "Amber", "Coral", "Jade", "Pearl", "Sapphire", "Topaz",
            "Azure", "Crimson", "Emerald", "Gold", "Magenta", "Silver", "Teal", "Burgundy",
            "Cerulean", "Maroon", "Orchid", "Snow", "Storm", "Thunder", "Blaze", "Flash",
            "Spark", "Glow", "Radiant", "Shimmer", "Glimmer", "Halo", "Flare", "Comet",
            "Galaxy", "Nebula", "Cosmos", "Orbit", "Quasar", "Stardust", "Zenith", "Astral",
            "Celestial", "Horizon", "Mirage", "Oasis", "Peak", "Summit", "Valley", "Ridge",
            "Canyon", "Creek", "Delta", "Dune", "Fjord", "Glacier", "Island", "Lagoon",
            "Marsh", "Meadow", "Plateau", "Reef", "Savanna", "Spring", "Tundra", "Volcano",
            "Cliff", "Grotto", "Hollow", "Labyrinth", "Pinnacle", "Sanctuary", "Secret",
            "Whispering", "Ancient", "Forgotten", "Hidden", "Mystic", "Enchanted", "Eternal",
            "Evergreen", "Wildwood", "Shadow", "Spirit", "Dreamer", "Wanderer", "Explorer",
            "Navigator", "Voyager", "Trailblazer", "Pathfinder", "Sentinel", "Guardian",
            "Protector", "Pioneer", "Innovator", "Creator", "Builder", "Designer", "Engineer",
            "Architect", "Artisan", "Maestro", "Virtuoso", "Lyric", "Melody", "Harmony",
            "Cadence", "Rhythm", "Sonnet", "Ballad", "Anthem", "Chorus", "Symphony", "Overture",
            "Aria", "Crescendo", "Forte", "Legato", "Staccato", "Tempo", "Vibrato", "Allegro",
            "Andante", "Largo", "Presto", "Adagio", "Minuet", "Nocturne", "Prelude", "Sonata",
            "Serenade", "Rhapsody", "Ode", "Elegy", "Epic", "Saga", "Legend", "Myth", "Fable",
            "Tale", "Chronicle", "History", "Lore", "Wisdom", "Insight", "Veritas", "Alethea",
            "Sophos", "Philo", "Lexicon", "Grammar", "Syntax", "Logic", "Rhetoric", "Dialect",
            "Cognito", "Eureka", "Nexus", "Matrix", "Cipher", "Enigma", "Quantum", "Vector",
            "Pixel", "Byte", "Bit", "Chip", "Circuit", "Current", "Volta", "Ampere", "Tesla",
            "Faraday", "Ohm", "Joule", "Watt", "Hertz", "Flux", "Photon", "Electron", "Proton",
            "Neutron", "Atom", "Molecule", "Element", "Compound", "Structure", "Form", "Shape",
            "Pattern", "Sequence", "Pillar", "Keystone", "Anchor", "Foundation", "Beacon",
            "Lighthouse", "Compass", "Map", "Journey", "Quest", "Odyssey", "Expedition",
            "Pilgrim", "Nomad", "Vagabond", "Drifter", "Rover", "Seeker", "Scholar", "Sage",
            "Guru", "Mentor", "Adept", "Master", "Grandmaster", "Elder", "Sovereign", "Monarch",
            "Emperor", "Empress", "King", "Queen", "Prince", "Princess", "Duke", "Duchess",
            "Earl", "Countess", "Baron", "Baroness", "Knight", "Paladin", "Crusader", "Champion",
            "Hero", "Valiant", "Brave", "Courageous", "Fearless", "Bold", "Gallant", "Noble",
            "Royal", "Majestic", "Regal", "Imperial", "Divine", "Sacred", "Holy", "Blessed",
            "Pure", "Zenith", "Apex", "Climax", "Pinnacle", "Summit", "Acme", "Vertex",
            "Meridian", "Culminate", "Transcend", "Ascend",
            "Evolve", "Transform", "Innovate",
            "Invent", "Create", "Design", "Forge", "Sculpt", "Paint", "Draw", "Sketch",
            "Compose", "Write", "Read", "Learn", "Teach", "Guide", "Help", "Serve", "Protect",
            "Defend", "Cherish", "Nurture", "Grow", "Flourish", "Thrive", "Blossom", "Bloom",
            "Sparkle", "Glisten", "Shine", "Glow", "Radiate", "Illuminate", "Enlighten",
            "Inspire", "Motivate", "Uplift", "Empower", "Elevate", "Ascend", "Achieve",
            "Conquer", "Overcome", "Succeed", "Prevail", "Triumph", "Victory", "Champion",
            "Winner", "Victor", "Heroine", "Legendary", "Mythical", "Epic", "Iconic",
            "Classic", "Timeless", "Eternal", "Infinite", "Boundless", "Limitless", "Vast",
            "Grand", "Majestic", "Magnificent", "Splendid", "Glorious", "Sublime", "Divine",
            "Heavenly", "Angelic", "Serene", "Peaceful", "Tranquil", "Calm", "Still", "Quiet",
            "Silent", "Hush", "Mute", "Whisper", "Murmur", "Breeze", "Zephyr", "Gust", "Wind",
            "Storm", "Thunder", "Lightning", "Rain", "Snow", "Ice", "Frost", "Mist", "Fog",
            "Cloud", "Sky", "Sun", "Moon", "Star", "Planet", "Comet", "Asteroid", "Meteor",
            "Galaxy", "Universe", "Cosmos", "Nebula", "Orbit", "Constellation", "Aurora",
            "Mirage", "Echo", "Miracle", "Wonder", "Mystery", "Secret", "Enigma", "Puzzle",
            "Riddle", "Conundrum", "Paradox", "Illusion", "Dream", "Fantasy", "Imagination",
            "Vision", "Insight", "Wisdom", "Knowledge", "Truth", "Fact", "Logic", "Reason",
            "Thought", "Mind", "Spirit", "Soul", "Heart", "Embrace", "Kindness", "Compassion",
            "Empathy", "Generosity", "Charity", "Forgiveness", "Patience", "Hope", "Faith",
            "Love", "Joy", "Happiness", "Bliss", "Serenity", "Peace", "Harmony", "Unity",
            "Bond", "Connection", "Bridge", "Gateway", "Portal", "Nexus", "Core", "Center",
            "Heartland", "Homeland", "Sanctuary", "Refuge", "Haven", "Shelter", "Abode",
            "Dwelling", "Home", "Nest", "Den", "Lair", "Cave", "Cavern", "Grotto", "Hollow",
            "Alcove", "Nook", "Cranny", "Crevice", "Fissure", "Chasm", "Abyss", "Void", "Infinity",
            "Everest", "Fuji", "K2", "Alps", "Rockies", "Andes", "Himalaya", "Sahara", "Gobi",
            "Amazon", "Nile", "Mississippi", "Yangtze", "Danube", "Rhine", "Thames", "Seine",
            "Volga", "Colorado", "Columbia", "Yukon", "Mackenzie", "StLawrence", "Hudson",
            "Potomac", "RioGrande", "Ohio", "Missouri", "Arkansas", "RedRiver", "Platte",
            "SnakeRiver", "Yellowstone", "GrandCanyon", "Niagara", "VictoriaFalls", "AngelFalls",
            "Everglades", "Yosemite", "Yellowstone", "GrandTeton", "Zion", "Arches", "Bryce",
            "Acadia", "Denali", "Glacier", "Olympic", "Redwood", "Sequoia", "Shenandoah",
            "SmokyMountains", "Volcanoes", "EverestBaseCamp", "MachuPicchu", "Pyramids",
            "Stonehenge", "Colosseum", "EiffelTower", "BigBen", "StatueOfLiberty", "GoldenGate",
            "SydneyOpera", "TajMahal", "GreatWall", "ChristRedeemer", "Petra", "ChichenItza",
            "Borobudur", "AngkorWat", "MountFuji", "Santorini", "Venice", "Paris", "London",
            "Rome", "Tokyo", "NewYork", "Sydney", "Cairo", "Athens", "Beijing", "Moscow",
            "Berlin", "Madrid", "Barcelona", "Amsterdam", "Dublin", "Edinburgh", "Stockholm",
            "Oslo", "Copenhagen", "Helsinki", "Warsaw", "Prague", "Budapest", "Vienna",
            "Lisbon", "Brussels", "Geneva", "Zurich", "Montreal", "Vancouver", "MexicoCity",
            "BuenosAires", "RioDeJaneiro", "Santiago", "Lima", "Bogota", "Caracas", "Kingston",
            "Havana", "Nassau", "SanJuan", "PuntaCana", "Cancun", "Acapulco", "Dubai", "Istanbul",
            "Jerusalem", "Bangkok", "Singapore", "HongKong", "Seoul", "Kyoto", "Mumbai",
            "NewDelhi", "Karachi", "Dhaka", "Jakarta", "Manila", "Hanoi", "HoChiMinh", "KualaLumpur",
            "Melbourne", "Perth", "Brisbane", "Auckland", "Wellington", "Christchurch", "Fiji",
            "Bali", "Maldives", "Seychelles", "Mauritius", "Madagascar", "CapeTown", "Nairobi",
            "Marrakech", "Casablanca", "Cairo", "Luxor", "Aswan", "AddisAbaba", "Lagos", "Accra",
            "Dakar", "Kinshasa", "Johannesburg", "Pretoria", "Durban", "Gaborone", "Windhoek",
            "Lusaka", "Harare", "Maputo", "Antananarivo", "PortLouis", "Victoria", "Palau",
            "Vanuatu", "Samoa", "Tonga", "Tuvalu", "Kiribati", "Nauru", "Micronesia", "MarshallIslands",
            "SolomonIslands", "PapuaNewGuinea", "EastTimor", "Brunei", "Laos", "Cambodia",
            "Myanmar", "Bhutan", "Nepal", "SriLanka", "Bangladesh", "Pakistan", "Afghanistan",
            "Iran", "Iraq", "Syria", "Lebanon", "Jordan", "Israel", "Palestine", "SaudiArabia",
            "Yemen", "Oman", "UAE", "Qatar", "Kuwait", "Bahrain", "Turkey", "Greece", "Italy",
            "Spain", "Portugal", "France", "Germany", "UK", "Ireland", "Netherlands", "Belgium",
            "Switzerland", "Austria", "Poland", "CzechRepublic", "Slovakia", "Hungary", "Romania",
            "Bulgaria", "Serbia", "Croatia", "Slovenia", "Bosnia", "Albania", "Macedonia",
            "Montenegro", "Kosovo", "Ukraine", "Belarus", "Moldova", "BalticStates", "Finland",
            "Sweden", "Norway", "Denmark", "Iceland", "Greenland", "Canada", "USA", "Mexico",
            "Caribbean", "CentralAmerica", "SouthAmerica", "Africa", "Europe", "Asia",
            "Australia", "NewZealand", "Oceania", "Antarctica", "Arctic"
        ];
        this.passwordSpecialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];
    }

    getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getRandomNumber(maxLength = 4) {
        let num = '';
        for (let i = 0; i < maxLength; i++) {
            num += Math.floor(Math.random() * 10).toString();
        }
        return parseInt(num, 10).toString();
    }

    applyRandomCase(name) {
        const caseType = Math.random();
        if (caseType < 0.33) {
            return name.toLowerCase();
        } else if (caseType < 0.66) {
            return name.toUpperCase();
        } else {
            return name;
        }
    }

    generateUsername() {
        const name1 = this.applyRandomCase(this.getRandomElement(this.names));
        const number = this.getRandomNumber(4); 

        const formatType = Math.floor(Math.random() * 3); 
        let username = '';

        switch (formatType) {
            case 0:
                username = `${name1}${number}`;
                break;
            case 1:
                const name2 = this.applyRandomCase(this.getRandomElement(this.names));
                username = `${name1}${name2}${number}`;
                break;
            case 2:
                username = `${number}${name1}`;
                break;
            default:
                username = `${name1}${number}`;
        }
        return username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20); 
    }

    generatePassword(length = 10) {
        let password = '';
        const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numberChars = '0123456789';

        password += this.getRandomElement(upperCaseChars);
        password += this.getRandomElement(lowerCaseChars);
        password += this.getRandomElement(numberChars);
        password += this.getRandomElement(this.passwordSpecialChars);

        const allChars = lowerCaseChars + upperCaseChars + numberChars + this.passwordSpecialChars.join('');

        for (let i = password.length; i < length; i++) {
            password += this.getRandomElement(allChars);
        }

        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
}

const generateRandomBirthDate = () => {
    const maxYear = 1999;
    const minYear = 1950;
    const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'); 
    return `${day}/${month}/${year}`;
};

async function requestEmailVerification(token, httpClient, proxyUrl) {
    const maxRetries = 3; 
    const retryDelay = 5000; 
    let retries = 0;
    let response = null;

    while (retries < maxRetries) {
        console.log(`[Verification] Requesting email verification (Attempt ${retries + 1}/${maxRetries})...`);
        const verifyQuery = {
            operationName: "VerifyMutation",
            variables: {
                input: {
                    language: "en",
                    linkDomain: "sportsbet.io"
                }
            },
            query: `mutation VerifyMutation($input: UserManagementRequestEmailVerificationMutationInput!) {
                userManagementRequestEmailVerification(input: $input) {
                    success
                    userManagement {
                        id
                        currentProfile {
                            id
                            emailVerified
                            __typename
                        }
                        __typename
                    }
                    errors {
                        code
                        message
                        params {
                            name
                            value
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
            }`
        };

        const verifyHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://sportsbet.io',
            'Referer': 'https://sportsbet.io/id/signup', 
            'Authorization': `Bearer ${token}`, 
            'Sec-Ch-Ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'X-Unique-Device-Id': generateUniqueDeviceId(), 
        };

        const requestOptions = {
            headers: verifyHeaders,
            body: JSON.stringify(verifyQuery),
            insecureSkipVerify: true,
            timeout: 60000,
        };

        if (proxyUrl) {
            requestOptions.proxy = proxyUrl;
        }

        try {
            response = await httpClient("https://sportsbet.io/graphql", requestOptions, 'post');

            console.log("[Verification] Email verification request sent.");
            console.log("[Verification] Status:", response.status);
            console.log("[Verification] Body:", response.body);

            if (response.status === 200 && response.body && response.body.data && 
                response.body.data.userManagementRequestEmailVerification && 
                !response.body.data.userManagementRequestEmailVerification.errors) {
                return response; 
            } else {
                console.warn(`[Verification] Request failed with status ${response.status} or GraphQL errors. Retrying...`);
                retries++;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        } catch (error) {
            console.error(`[Verification] Error requesting email verification (Attempt ${retries + 1}):`, error);
            retries++;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }

    console.error("[Verification] Max retries reached. Failed to request email verification after multiple attempts.");
    return null; 
}

async function clickLinkWithBrowser(link, proxyUrl) {
    let browser;
    try {
        const browserArgs = ['--disable-setuid-sandbox', '--no-sandbox'];
        if (proxyUrl) {
            // Note: Puppeteer's --proxy-server argument does not directly support authenticated proxies.
            // For authenticated proxies, you might need to set environment variables or use a custom proxy agent.
            // This attempts to pass the proxy server, but authentication might still be an issue.
            browserArgs.push(`--proxy-server=${proxyUrl.replace('http://', '')}`);
        }

        browser = await puppeteer.launch({ headless: true, args: browserArgs });
        const page = await browser.newPage();

        if (proxyUrl && proxyUrl.includes('@')) {
            const [auth, hostPort] = proxyUrl.replace('http://', '').split('@');
            const [username, password] = auth.split(':');
            await page.authenticate({ username, password });
        }

        console.log(`[Browser] Navigating to verification link: ${link}`);
        await page.goto(link, { waitUntil: 'networkidle0', timeout: 60000 });
        console.log(`[Browser] Successfully navigated to ${link}`);
        return true;
    } catch (error) {
        console.error(`[Browser] Error clicking link with browser: ${error.message}`);
        