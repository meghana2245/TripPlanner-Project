const fallbackUrl = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80";

const imageMap = [
  // Beaches & Coastal
  { keywords: ["goa", "puri"], url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" },
  { keywords: ["kovalam", "varkala", "thiruvananthapuram", "trivandrum"], url: "https://images.unsplash.com/photo-1590123715937-af3dc4c8b45c?w=800&q=80" },
  { keywords: ["andaman", "lakshadweep", "maldives", "sri lanka", "colombo"], url: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80" },
  { keywords: ["pondicherry", "mahabalipuram", "chennai", "hampi", "khajuraho", "mysore", "bhubaneswar", "vijayawada"], url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80" },
  
  // Spiritual & Temple Cities
  { keywords: ["varanasi", "banaras", "kashi", "haridwar", "ujjain", "ayodhya", "mathura", "vrindavan", "patna", "temple", "mandir", "shrine", "pilgrimage", "spiritual", "holy", "sacred"], url: "https://images.unsplash.com/photo-1561361058-c24e02aa3f96?w=800&q=80" },
  { keywords: ["kedarnath", "badrinath", "manali", "nepal", "kathmandu"], url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80" },
  { keywords: ["amritsar", "golden temple"], url: "https://images.unsplash.com/photo-1518050947974-4be8c7469f0c?w=800&q=80" },
  { keywords: ["rishikesh"], url: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80" },
  
  // Mountains & Hill Stations
  { keywords: ["shimla", "mussoorie", "nainital", "ooty", "darjeeling", "gangtok", "leh", "ladakh", "spiti", "kasauli", "dalhousie", "shillong", "bhutan", "switzerland", "mountain", "hill", "valley", "trek", "hiking"], url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80" },
  { keywords: ["munnar", "coorg", "kodaikanal", "kochi", "guwahati", "wayanad", "waterfall", "river", "lake", "backwater"], url: "https://images.unsplash.com/photo-1527766833261-b09c3163a791?w=800&q=80" },
  
  // Desert & Forts (Rajasthan)
  { keywords: ["rajasthan", "jaisalmer", "jodhpur", "jaipur", "udaipur", "pushkar", "bikaner", "ajmer", "ahmedabad", "surat", "indore", "desert", "dunes", "sand"], url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80" },
  
  // Heritage & Monuments
  { keywords: ["agra", "taj mahal", "fort", "palace", "castle", "heritage", "monument"], url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80" },
  { keywords: ["rome", "florence", "church", "cathedral", "monastery"], url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80" },
  { keywords: ["istanbul", "turkey", "mosque", "masjid"], url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80" },
  
  // Forests & Wildlife
  { keywords: ["ranthambore", "jim corbett", "kaziranga", "sundarbans", "bandipur", "africa", "safari", "forest", "jungle", "wildlife", "national park", "sanctuary"], url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80" },
  
  // Major Indian Metro Cities
  { keywords: ["mumbai"], url: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80" },
  { keywords: ["delhi", "lucknow", "bhopal"], url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80" },
  { keywords: ["bangalore", "bengaluru", "pune"], url: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80" },
  { keywords: ["hyderabad"], url: "https://images.unsplash.com/photo-1600697395543-ef7694ffd8b4?w=800&q=80" },
  { keywords: ["kolkata"], url: "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&q=80" },
  { keywords: ["visakhapatnam", "vizag", "miami", "beach", "coast", "island", "sea", "ocean"], url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" },
  
  // International Cities
  { keywords: ["paris"], url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80" },
  { keywords: ["london"], url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80" },
  { keywords: ["tokyo"], url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
  { keywords: ["new york"], url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80" },
  { keywords: ["dubai"], url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
  { keywords: ["bali"], url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" },
  { keywords: ["singapore"], url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80" },
  { keywords: ["bangkok", "thailand"], url: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80" },
  { keywords: ["sydney"], url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80" },
  { keywords: ["barcelona"], url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80" },
  { keywords: ["amsterdam"], url: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80" },
  { keywords: ["new zealand"], url: "https://images.unsplash.com/photo-1469521669194-babb45599def?w=800&q=80" },
  { keywords: ["santorini", "greece"], url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80" },
  { keywords: ["egypt", "cairo"], url: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80" },
  { keywords: ["prague"], url: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80" },
  { keywords: ["vienna"], url: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80" },
  { keywords: ["venice"], url: "https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&q=80" },
  { keywords: ["kyoto"], url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" },
  { keywords: ["osaka"], url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
  { keywords: ["seoul"], url: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80" },
  { keywords: ["beijing"], url: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80" },
  { keywords: ["shanghai"], url: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&q=80" },
  { keywords: ["hong kong"], url: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80" },
  { keywords: ["kuala lumpur", "malaysia"], url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80" },
  { keywords: ["phuket"], url: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80" },
  { keywords: ["vietnam", "hanoi", "ho chi minh"], url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { keywords: ["los angeles"], url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&q=80" },
  { keywords: ["las vegas"], url: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&q=80" },
  { keywords: ["san francisco"], url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80" },
  { keywords: ["toronto"], url: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=80" },
  { keywords: ["vancouver"], url: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&q=80" },
  { keywords: ["rio", "brazil"], url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80" },
  { keywords: ["cape town"], url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80" },
  { keywords: ["moscow", "russia"], url: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&q=80" },
  
  // Generic Vibe / Nature Types (Fallback)
  { keywords: ["snow", "glacier", "frozen", "adventure", "camping", "expedition"], url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80" },
  { keywords: ["city", "urban", "metro"], url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" },
  { keywords: ["village", "rural", "countryside"], url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80" },
  { keywords: ["cruise", "yacht", "sailing"], url: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80" }
];

export function getDestinationImage(destinationName) {
  if (!destinationName) return fallbackUrl;
  const name = destinationName.toLowerCase();
  const match = imageMap.find(entry => entry.keywords.some(k => name.includes(k)));
  return match ? match.url : fallbackUrl;
}
