"use strict";
(() => {
  // packages/engine/src/rng.ts
  var activeGenerator = null;
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function next() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function rng() {
    return activeGenerator !== null ? activeGenerator() : Math.random();
  }
  function seedRng(seed) {
    activeGenerator = mulberry32(seed);
  }
  function clearRng() {
    activeGenerator = null;
  }

  // packages/engine/src/gameLogic.ts
  var ERA_ORDER = ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"];
  var FLEX_PLAYERS = {
    "LeBron James": ["PG", "SG", "SF", "PF"],
    "Giannis Antetokounmpo": ["PG", "SG", "SF", "PF", "C"],
    "Draymond Green": ["PG", "SF", "PF", "C"],
    "Ben Simmons": ["PG", "PF", "C"],
    "Scottie Barnes": ["PG", "SG", "SF", "PF"],
    "Paolo Banchero": ["PG", "SG", "SF", "PF"],
    "Jimmy Butler": ["PG", "SG", "SF", "PF"],
    "Kawhi Leonard": ["SG", "SF", "PF"],
    "Paul George": ["SG", "SF", "PF"],
    "Nikola Jokic": ["PG", "PF", "C"],
    "Larry Bird": ["PG", "SG", "SF", "PF"],
    "Magic Johnson": ["PG", "SG", "SF", "PF"],
    "Luka Doncic": ["PG", "SG", "SF", "PF"],
    "Jayson Tatum": ["SG", "SF", "PF"],
    "Michael Jordan": ["PG", "SG", "SF"]
  };
  var POSITION_LOCK = {
    "Clyde Drexler": ["SG", "SF"],
    "Tracy McGrady": ["SG", "SF"],
    "Peyton Watson": ["SF", "PF"],
    "Scottie Pippen": ["SG", "SF", "PF"],
    "Kevin Durant": ["SG", "SF", "PF"],
    "Joel Embiid": ["PF", "C"],
    "LaMarcus Aldridge": ["PF", "C"],
    "Tim Duncan": ["PF", "C"],
    "Karl Malone": ["PF", "C"],
    "Kevin Garnett": ["PF", "C"],
    "Shaquille O'Neal": ["PF", "C"],
    "Hakeem Olajuwon": ["PF", "C"],
    "Dirk Nowitzki": ["PF", "C"],
    "Kareem Abdul-Jabbar": ["PF", "C"],
    "Victor Wembanyama": ["PF", "C"],
    "Jerry Lucas": ["PF", "C"],
    "George Gervin": ["SG", "SF"],
    "Brandon Ingram": ["SG", "SF", "PF"],
    "Josh Hart": ["SG", "SF"],
    "Luguentz Dort": ["SG", "SF"],
    "Dominique Wilkins": ["SG", "SF"],
    "Kevin McHale": ["PF", "C"],
    "Evan Mobley": ["PF", "C"],
    "Horace Grant": ["PF", "C"],
    "Anfernee Hardaway": ["PG", "SG"],
    "Aaron Gordon": ["PF", "C"],
    "Tim Hardaway Jr.": ["SG", "SF"],
    "DeMarcus Cousins": ["C", "PF"],
    "Bob Pettit": ["PF", "C"],
    "Elvin Hayes": ["PF", "C"],
    "Chris Bosh": ["PF", "C"],
    "Karl-Anthony Towns": ["PF", "C"],
    "Moses Malone": ["PF", "C"],
    "Kevon Looney": ["C"],
    "Ty Jerome": ["PG", "SG"],
    "Rudy Fernandez": ["SG", "SF"]
  };
  function applyFlexTag(player) {
    const flex = FLEX_PLAYERS[player.full_name];
    if (!flex)
      return player;
    return { ...player, flexPositions: flex };
  }
  var PLAYER_RINGS = {
    "Bill Russell": 11,
    "Sam Jones": 10,
    "Tom Heinsohn": 8,
    "K.C. Jones": 8,
    "John Havlicek": 8,
    "Tom Sanders": 8,
    "Thomas Sanders": 8,
    "Frank Ramsey": 7,
    "Robert Horry": 7,
    "Jim Loscutoff": 7,
    "Michael Jordan": 6,
    "Scottie Pippen": 6,
    "Kareem Abdul-Jabbar": 6,
    "Bob Cousy": 6,
    "Magic Johnson": 5,
    "Kobe Bryant": 5,
    "Tim Duncan": 5,
    "Dennis Rodman": 5,
    "Derek Fisher": 5,
    "Ron Harper": 5,
    "Steve Kerr": 5,
    "Michael Cooper": 5,
    "George Mikan": 5,
    "Slater Martin": 5,
    "Jim Pollard": 5,
    "Larry Siegfried": 5,
    "Shaquille O'Neal": 4,
    "LeBron James": 4,
    "Stephen Curry": 4,
    "Draymond Green": 4,
    "Klay Thompson": 4,
    "Robert Parish": 4,
    "Tony Parker": 4,
    "Manu Ginobili": 4,
    "Andre Iguodala": 4,
    "Bill Sharman": 4,
    "John Salley": 4,
    "Kevon Looney": 3,
    "Horace Grant": 4,
    "Jamaal Wilkes": 4,
    "Kurt Rambis": 4,
    "Vern Mikkelsen": 4,
    "Gene Guarilia": 4,
    "Will Perdue": 4,
    "Frank Saul": 4,
    "Larry Bird": 3,
    "Kevin McHale": 3,
    "James Worthy": 3,
    "Byron Scott": 3,
    "Dwyane Wade": 3,
    "Udonis Haslem": 3,
    "A.C. Green": 3,
    "Mychal Thompson": 2,
    "Danny Green": 3,
    "Rick Fox": 3,
    "Toni Kukoc": 3,
    "Luc Longley": 3,
    "Dennis Johnson": 3,
    "John Paxson": 3,
    "Bill Cartwright": 3,
    "James Jones": 3,
    "Clyde Lovellette": 3,
    "Shaun Livingston": 3,
    "Mario Elie": 3,
    "JaVale McGee": 3,
    "Patrick McCaw": 3,
    "B.J. Armstrong": 3,
    "Bruce Bowen": 3,
    "Brian Shaw": 3,
    "Devean George": 3,
    "James Edwards": 3,
    "Randy Brown": 3,
    "Jud Buechler": 3,
    "Gene Conley": 3,
    "Stacey King": 3,
    "Mitch Kupchak": 3,
    "Willie Naulls": 3,
    "Dickey Simpkins": 3,
    "Myer Skoog": 3,
    "Bill Wennington": 3,
    "Scott Williams": 3,
    "Bob Harrison": 3,
    "Hakeem Olajuwon": 2,
    "Wilt Chamberlain": 2,
    "Isiah Thomas": 2,
    "Joe Dumars": 2,
    "Kevin Durant": 2,
    "Chris Bosh": 2,
    "Bill Laimbeer": 2,
    "Ray Allen": 2,
    "Kawhi Leonard": 2,
    "Jrue Holiday": 2,
    "Rajon Rondo": 2,
    "Kentavious Caldwell-Pope": 2,
    "Alex Caruso": 2,
    "Pau Gasol": 2,
    "Lamar Odom": 2,
    "Andrew Bynum": 2,
    "David Robinson": 2,
    "Shane Battier": 2,
    "Mario Chalmers": 2,
    "Danny Ainge": 2,
    "Willis Reed": 2,
    "Walt Frazier": 2,
    "Dave DeBusschere": 2,
    "Bill Bradley": 2,
    "Bob McAdoo": 2,
    "Bob Dandridge": 2,
    "Mike Miller": 2,
    "Norris Cole": 2,
    "Bailey Howell": 2,
    "Jojo White": 2,
    "Dave Cowens": 2,
    "Bill Walton": 2,
    "Norm Nixon": 2,
    "Mark Aguirre": 2,
    "Sam Cassell": 3,
    "Kenny Smith": 2,
    "Tyronn Lue": 2,
    "Luke Walton": 2,
    "Jordan Farmar": 2,
    "Sasha Vujacic": 2,
    "David West": 2,
    "Zaza Pachulia": 2,
    "Clyde Drexler": 1,
    "Jerry West": 1,
    "Oscar Robertson": 1,
    "Julius Erving": 1,
    "Moses Malone": 1,
    "Paul Pierce": 1,
    "Kevin Garnett": 1,
    "Kyrie Irving": 1,
    "Dirk Nowitzki": 1,
    "Jason Kidd": 1,
    "Chauncey Billups": 1,
    "Rasheed Wallace": 1,
    "Ben Wallace": 1,
    "Rick Barry": 1,
    "Nate Archibald": 1,
    "Earl Monroe": 1,
    "Paul Arizin": 1,
    "Dolph Schayes": 1,
    "Bob Pettit": 1,
    "Ed Macaulay": 1,
    "Cliff Hagan": 1,
    "Hal Greer": 1,
    "Billy Cunningham": 1,
    "Jon McGlocklin": 1,
    "Jerry Lucas": 1,
    "Gail Goodrich": 1,
    "Jim McMillan": 1,
    "Wes Unseld": 1,
    "Elvin Hayes": 1,
    "Maurice Lucas": 1,
    "Gus Williams": 1,
    "Fred Brown": 1,
    "Don Nelson": 5,
    "Paul Silas": 3,
    "Paul Westphal": 1,
    "Cedric Maxwell": 2,
    "M.L. Carr": 2,
    "Gerald Henderson": 3,
    "Spencer Haywood": 1,
    "Andrew Toney": 1,
    "Vernon Maxwell": 1,
    "Otis Thorpe": 1,
    "Sean Elliott": 1,
    "Glen Rice": 1,
    "Mitch Richmond": 1,
    "Jalen Brunson": 1,
    "Mikal Bridges": 1,
    "O.G. Anunoby": 1,
    "Karl-Anthony Towns": 1,
    "Josh Hart": 1,
    "Mitchell Robinson": 1,
    "Jordan Clarkson": 1,
    "Miles McBride": 1,
    "Landry Shamet": 1,
    "Jose Alvarado": 1,
    "Jeremy Sochan": 1,
    "Ariel Hukporti": 1,
    "Pac\xF4me Dadiet": 1,
    "Mohamed Diawara": 1,
    "Tyler Kolek": 1,
    "Shai Gilgeous-Alexander": 1,
    "Jalen Williams": 1,
    "Chet Holmgren": 1,
    "Luguentz Dort": 1,
    "Isaiah Hartenstein": 1,
    "Aaron Wiggins": 1,
    "Kenrich Williams": 1,
    "Ajay Mitchell": 1,
    "Isaiah Joe": 1,
    "Ousmane Dieng": 1,
    "Nikola Topic": 1,
    "Cason Wallace": 1,
    "Jayson Tatum": 1,
    "Jaylen Brown": 1,
    "Al Horford": 1,
    "Kristaps Porzingis": 1,
    "Derrick White": 1,
    "Payton Pritchard": 1,
    "Sam Hauser": 1,
    "Luke Kornet": 1,
    "Neemias Queta": 1,
    "Nikola Jokic": 1,
    "Jamal Murray": 1,
    "Aaron Gordon": 1,
    "Michael Porter Jr.": 1,
    "Bruce Brown": 1,
    "Christian Braun": 1,
    "Jeff Green": 1,
    "DeAndre Jordan": 1,
    "Reggie Jackson": 1,
    "Vlatko Cancar": 1,
    "Zeke Nnaji": 1,
    "Thomas Bryant": 1,
    "Andrew Wiggins": 1,
    "Jordan Poole": 1,
    "Gary Payton II": 1,
    "Otto Porter Jr.": 1,
    "Giannis Antetokounmpo": 1,
    "Khris Middleton": 1,
    "Brook Lopez": 1,
    "Bobby Portis": 1,
    "PJ Tucker": 1,
    "Pat Connaughton": 1,
    "Anthony Davis": 1,
    "Kyle Kuzma": 1,
    "Markieff Morris": 1,
    "Dwight Howard": 1,
    "Jared Dudley": 1,
    "Dion Waiters": 1,
    "Avery Bradley": 1,
    "Kyle Lowry": 1,
    "Pascal Siakam": 1,
    "Marc Gasol": 1,
    "Serge Ibaka": 1,
    "Fred VanVleet": 1,
    "Norman Powell": 1,
    "Nick Young": 1,
    "Matt Barnes": 1,
    "Kevin Love": 1,
    "Tristan Thompson": 1,
    "JR Smith": 2,
    "Richard Jefferson": 1,
    "Matthew Dellavedova": 1,
    "Channing Frye": 1,
    "Iman Shumpert": 1,
    "Andrew Bogut": 1,
    "Harrison Barnes": 1,
    "Leandro Barbosa": 1,
    "David Lee": 1,
    "Festus Ezeli": 1,
    "Boris Diaw": 1,
    "Patty Mills": 1,
    "Marco Belinelli": 1,
    "Austin Daye": 1,
    "Chris Andersen": 1,
    "Tyson Chandler": 1,
    "Shawn Marion": 1,
    "Jason Terry": 1,
    "J.J. Barea": 1,
    "DeShawn Stevenson": 1,
    "Peja Stojakovic": 1,
    "Caron Butler": 1,
    "Trevor Ariza": 1,
    "Ron Artest": 1,
    "Metta World Peace": 1,
    "Tony Allen": 1,
    "James Posey": 1,
    "Kendrick Perkins": 1,
    "Glen Davis": 1,
    "Scot Pollard": 1,
    "Gary Payton": 1,
    "Antoine Walker": 1,
    "Alonzo Mourning": 1,
    "Jason Williams": 1,
    "Tayshaun Prince": 1,
    "Richard Hamilton": 1,
    "Avery Johnson": 1,
    "Phil Jackson": 2,
    "Pat Riley": 1
  };
  function applyRings(player) {
    const rings = PLAYER_RINGS[player.full_name];
    if (!rings)
      return player;
    return { ...player, rings };
  }
  var FINALS_MVP_PLAYERS = /* @__PURE__ */ new Map([
    ["Jerry West", 1],
    ["Willis Reed", 1],
    ["Kareem Abdul-Jabbar", 2],
    ["Wilt Chamberlain", 1],
    ["John Havlicek", 1],
    ["Rick Barry", 1],
    ["Jojo White", 1],
    ["Bill Walton", 1],
    ["Wes Unseld", 1],
    ["Dennis Johnson", 1],
    ["Magic Johnson", 3],
    ["Cedric Maxwell", 1],
    ["Moses Malone", 1],
    ["Larry Bird", 1],
    ["James Worthy", 1],
    ["Joe Dumars", 1],
    ["Isiah Thomas", 1],
    ["Michael Jordan", 6],
    ["Hakeem Olajuwon", 2],
    ["Tim Duncan", 3],
    ["Shaquille O'Neal", 3],
    ["Chauncey Billups", 1],
    ["Dwyane Wade", 1],
    ["Tony Parker", 1],
    ["Paul Pierce", 1],
    ["Kobe Bryant", 2],
    ["Dirk Nowitzki", 1],
    ["LeBron James", 4],
    ["Kawhi Leonard", 2],
    ["Andre Iguodala", 1],
    ["Kevin Durant", 2],
    ["Giannis Antetokounmpo", 1],
    ["Stephen Curry", 1],
    ["Nikola Jokic", 1],
    ["Jaylen Brown", 1],
    ["Shai Gilgeous-Alexander", 1],
    ["Jalen Brunson", 1]
  ]);
  function applyFinalsMVP(player) {
    const count = FINALS_MVP_PLAYERS.get(player.full_name);
    if (!count)
      return player;
    return { ...player, finalsMVP: count };
  }
  var SIXTH_MAN_PLAYERS = /* @__PURE__ */ new Set([
    "Jamal Crawford",
    "Lou Williams",
    "Ricky Pierce",
    "Detlef Schrempf",
    "Darrell Armstrong",
    "Leandro Barbosa",
    "Malcolm Brogdon",
    "Jordan Clarkson",
    "Dell Curry",
    "Manu Ginobili",
    "Ben Gordon",
    "Eric Gordon",
    "Montrezl Harrell",
    "Bobby Jackson",
    "Antawn Jamison",
    "Eddie Johnson",
    "Keldon Johnson",
    "Bobby Jones",
    "Toni Kukoc",
    "Danny Manning",
    "Anthony Mason",
    "Aaron McKie",
    "Mike Miller",
    "Lamar Odom",
    "Payton Pritchard",
    "Naz Reid",
    "Clifford Robinson",
    "Rodney Rogers",
    "JR Smith",
    "John Starks",
    "Roy Tarpley",
    "Jason Terry",
    "Bill Walton",
    "Corliss Williamson",
    "Vinnie Johnson",
    "Kevin McHale",
    "Steve Kerr",
    "Andre Iguodala",
    "Junior Bridgeman",
    "J.J. Barea",
    "Robert Horry",
    "Bruce Brown"
  ]);
  var SIXTH_MAN_TEAM_KEYS = {
    "James Harden": ["OKC"]
  };
  function applySixthMan(player) {
    if (SIXTH_MAN_PLAYERS.has(player.full_name))
      return { ...player, sixthMan: true };
    const teamOverrides = SIXTH_MAN_TEAM_KEYS[player.full_name];
    if (teamOverrides) {
      const team = player.eraTeam ?? player.teams_by_era?.[player.era];
      if (team && teamOverrides.includes(team))
        return { ...player, sixthMan: true };
    }
    return player;
  }
  var PLAYER_ANCHORS = {
    "Draymond Green": "def",
    "Dennis Rodman": "def",
    "Ben Wallace": "def",
    "Gary Payton": "def",
    "Dikembe Mutombo": "def",
    "Rudy Gobert": "def",
    "Tony Allen": "def",
    "Scottie Pippen": "def",
    "Kawhi Leonard": "def",
    "Bill Russell": "def",
    "Hakeem Olajuwon": "def",
    "Kevin Garnett": "def",
    "Dwight Howard": "def",
    "Tim Duncan": "def",
    "Giannis Antetokounmpo": "def",
    "David Robinson": "def",
    "Anthony Davis": "def",
    "Patrick Ewing": "def",
    "Yao Ming": "def",
    "Marcus Smart": "def",
    "Aaron Gordon": "def",
    "Evan Mobley": "def",
    "Bam Adebayo": "def",
    "Victor Wembanyama": "def",
    "Jaren Jackson Jr.": "def",
    "Serge Ibaka": "def",
    "Jimmy Butler": "def",
    "Dennis Johnson": "def",
    "Bruce Bowen": "def",
    "Nate Thurmond": "def",
    "Alvin Robertson": "def",
    "Paul George": "def",
    "Jrue Holiday": "def",
    "Andre Iguodala": "def",
    "Metta World Peace": "def",
    "Joakim Noah": "def",
    "Walt Frazier": "def",
    "Marc Gasol": "def",
    "Luguentz Dort": "def",
    "Andrei Kirilenko": "def",
    "Wes Unseld": "def",
    "Dave DeBusschere": "def",
    "Bill Walton": "def",
    "Dave Cowens": "def",
    "Elmore Smith": "def",
    "Alonzo Mourning": "def",
    "Roy Hibbert": "def",
    "Tyson Chandler": "def",
    "Marcus Camby": "def",
    "Mark Eaton": "def",
    "Michael Cooper": "def",
    "Sidney Moncrief": "def",
    "Mikal Bridges": "def",
    "Michael Jordan": "off",
    "Nikola Jokic": "off",
    "LeBron James": "off",
    "Stephen Curry": "off",
    "Luka Doncic": "off",
    "Kareem Abdul-Jabbar": "off",
    "James Harden": "off",
    "Shai Gilgeous-Alexander": "off",
    "Joel Embiid": "off",
    "Kevin Durant": "off",
    "Oscar Robertson": "off",
    "Shaquille O'Neal": "off",
    "Wilt Chamberlain": "off",
    "Elgin Baylor": "off",
    "Larry Bird": "off",
    "Allen Iverson": "off",
    "Damian Lillard": "off",
    "Russell Westbrook": "off",
    "Jayson Tatum": "off",
    "Kyrie Irving": "off",
    "Klay Thompson": "off",
    "Kobe Bryant": "off",
    "Dwyane Wade": "off",
    "Tracy McGrady": "off",
    "Dirk Nowitzki": "off",
    "George Gervin": "off",
    "Pete Maravich": "off",
    "Julius Erving": "off",
    "Moses Malone": "off",
    "Bob Pettit": "off",
    "Karl Malone": "off"
  };
  var ERA_PLAYER_ANCHORS = {
    "Carmelo Anthony:00s": "off",
    "Carmelo Anthony:10s": "off"
  };
  var PLAYER_ANCHOR_TIERS = {
    "Marcus Smart": 2,
    "Aaron Gordon": 2,
    "Evan Mobley": 2,
    "Bam Adebayo": 2,
    "Victor Wembanyama": 2,
    "Jaren Jackson Jr.": 2,
    "Serge Ibaka": 2,
    "Jimmy Butler": 2,
    "Dennis Johnson": 2,
    "Bruce Bowen": 2,
    "Nate Thurmond": 2,
    "Alvin Robertson": 2,
    "Patrick Ewing": 2,
    "Yao Ming": 2,
    "Marc Gasol": 2,
    "Luguentz Dort": 2,
    "Andrei Kirilenko": 2,
    "Wes Unseld": 2,
    "Dave DeBusschere": 2,
    "Bill Walton": 2,
    "Dave Cowens": 2,
    "Elmore Smith": 2,
    "Alonzo Mourning": 2,
    "Roy Hibbert": 2,
    "Tyson Chandler": 2,
    "Marcus Camby": 2,
    "Mark Eaton": 2,
    "Michael Cooper": 2,
    "Sidney Moncrief": 2,
    "Allen Iverson": 2,
    "Damian Lillard": 2,
    "Russell Westbrook": 2,
    "Jayson Tatum": 2,
    "Kyrie Irving": 2,
    "Carmelo Anthony": 2,
    "Klay Thompson": 2,
    "Kobe Bryant": 2,
    "Dwyane Wade": 2,
    "Paul George": 2,
    "Jrue Holiday": 2,
    "Andre Iguodala": 2,
    "Metta World Peace": 2,
    "Joakim Noah": 2,
    "Tracy McGrady": 2,
    "Dirk Nowitzki": 2,
    "George Gervin": 2,
    "Pete Maravich": 2,
    "Julius Erving": 2,
    "Moses Malone": 2,
    "Bob Pettit": 2,
    "Karl Malone": 2
  };
  function applyAnchors(player) {
    if (player.full_name === "Patrick Ewing" && player.era === "10s")
      return player;
    const eraKey = player.era ? `${player.full_name}:${player.era}` : null;
    const anchor = (eraKey && ERA_PLAYER_ANCHORS[eraKey]) ?? PLAYER_ANCHORS[player.full_name];
    if (!anchor)
      return player;
    const tier = PLAYER_ANCHOR_TIERS[player.full_name] ?? 1;
    return { ...player, defAnchor: anchor === "def", offAnchor: anchor === "off", anchorTier: tier };
  }
  var DUO_PAIRS = {
    "Wilt Chamberlain": ["Hal Greer"],
    "Hal Greer": ["Wilt Chamberlain"],
    "Jerry West": ["Elgin Baylor"],
    "Elgin Baylor": ["Jerry West"],
    "Bill Russell": ["John Havlicek", "Bob Cousy", "Sam Jones"],
    "Sam Jones": ["Bill Russell"],
    "Jack Twyman": ["Maurice Stokes"],
    "Maurice Stokes": ["Jack Twyman"],
    "John Havlicek": ["Bill Russell", "Dave Cowens"],
    "Bob Cousy": ["Bill Russell"],
    "Dave Cowens": ["John Havlicek"],
    "Oscar Robertson": ["Kareem Abdul-Jabbar", "Jerry Lucas"],
    "Jerry Lucas": ["Oscar Robertson"],
    "Nate Thurmond": ["Rick Barry"],
    "Rick Barry": ["Nate Thurmond", "Brent Barry"],
    "Brent Barry": ["Rick Barry"],
    "Julius Erving": ["Moses Malone"],
    "Moses Malone": ["Julius Erving"],
    "Elvin Hayes": ["Wes Unseld"],
    "Wes Unseld": ["Elvin Hayes"],
    "Gary Payton": ["Shawn Kemp", "Gary Payton II"],
    "Gary Payton II": ["Gary Payton"],
    "Shawn Kemp": ["Gary Payton"],
    "Walt Frazier": ["Willis Reed"],
    "Willis Reed": ["Walt Frazier"],
    "Alex English": ["Kiki Vandeweghe"],
    "Kiki Vandeweghe": ["Alex English"],
    "Magic Johnson": ["Kareem Abdul-Jabbar", "James Worthy"],
    "Kareem Abdul-Jabbar": ["Magic Johnson", "Oscar Robertson", "Lucius Allen"],
    "Lucius Allen": ["Kareem Abdul-Jabbar"],
    "James Worthy": ["Magic Johnson"],
    "Larry Bird": ["Kevin McHale"],
    "Kevin McHale": ["Larry Bird"],
    "Isiah Thomas": ["Joe Dumars"],
    "Joe Dumars": ["Isiah Thomas"],
    "Michael Jordan": ["Scottie Pippen", "Dennis Rodman"],
    "Scottie Pippen": ["Michael Jordan", "Dennis Rodman", "Scottie Pippen Jr."],
    "Scottie Pippen Jr.": ["Scottie Pippen"],
    "Dennis Rodman": ["Michael Jordan", "Scottie Pippen"],
    "John Stockton": ["Karl Malone"],
    "Karl Malone": ["John Stockton"],
    "Hakeem Olajuwon": ["Clyde Drexler"],
    "Clyde Drexler": ["Hakeem Olajuwon"],
    "Shaquille O'Neal": ["Kobe Bryant", "Anfernee Hardaway", "Dwyane Wade"],
    "Anfernee Hardaway": ["Shaquille O'Neal"],
    "Alonzo Mourning": ["Tim Hardaway"],
    "Tim Hardaway": ["Alonzo Mourning", "Tim Hardaway Jr."],
    "Tim Hardaway Jr.": ["Tim Hardaway"],
    "Charles Barkley": ["Kevin Johnson"],
    "Kevin Johnson": ["Charles Barkley"],
    "Patrick Ewing": ["John Starks"],
    "John Starks": ["Patrick Ewing"],
    "Kobe Bryant": ["Shaquille O'Neal", "Pau Gasol", "Joe Bryant"],
    "Joe Bryant": ["Kobe Bryant"],
    "Pau Gasol": ["Kobe Bryant", "Marc Gasol"],
    "Tracy McGrady": ["Yao Ming", "Vince Carter"],
    "Vince Carter": ["Tracy McGrady"],
    "Yao Ming": ["Tracy McGrady"],
    "Tim Duncan": ["Tony Parker", "David Robinson", "Manu Ginobili"],
    "David Robinson": ["Tim Duncan"],
    "Tony Parker": ["Tim Duncan", "Manu Ginobili"],
    "Manu Ginobili": ["Tony Parker", "Tim Duncan"],
    "Dirk Nowitzki": ["Jason Terry", "Jason Kidd"],
    "Jason Terry": ["Dirk Nowitzki"],
    "Jason Kidd": ["Dirk Nowitzki"],
    "Steve Nash": ["Amar'e Stoudemire"],
    "Amar'e Stoudemire": ["Steve Nash"],
    "Ray Allen": ["Paul Pierce", "Kevin Garnett"],
    "Paul Pierce": ["Kevin Garnett", "Ray Allen"],
    "Kevin Garnett": ["Paul Pierce", "Ray Allen"],
    "Kevin Durant": ["Russell Westbrook", "James Harden", "Stephen Curry", "Devin Booker"],
    "Russell Westbrook": ["Kevin Durant", "James Harden", "Paul George"],
    "Paul George": ["Russell Westbrook", "Kawhi Leonard"],
    "Kawhi Leonard": ["Paul George", "Kyle Lowry"],
    "LeBron James": ["Dwyane Wade", "Kyrie Irving", "Kevin Love", "Anthony Davis", "Chris Bosh", "Bronny James"],
    "Bronny James": ["LeBron James"],
    "Dwyane Wade": ["LeBron James", "Shaquille O'Neal", "Chris Bosh"],
    "Chris Bosh": ["LeBron James", "Dwyane Wade"],
    "Kyrie Irving": ["LeBron James", "Luka Doncic"],
    "Luka Doncic": ["Kyrie Irving"],
    "Kevin Love": ["LeBron James"],
    "Chris Paul": ["Blake Griffin", "DeAndre Jordan", "Devin Booker"],
    "Devin Booker": ["Chris Paul", "Kevin Durant"],
    "Blake Griffin": ["Chris Paul"],
    "DeAndre Jordan": ["Chris Paul"],
    "James Harden": ["Clint Capela", "Russell Westbrook", "Kevin Durant", "Joel Embiid"],
    "Clint Capela": ["James Harden"],
    "Stephen Curry": ["Klay Thompson", "Draymond Green", "Andre Iguodala", "Kevin Durant", "Seth Curry", "Dell Curry"],
    "Seth Curry": ["Stephen Curry", "Dell Curry"],
    "Dell Curry": ["Stephen Curry", "Seth Curry"],
    "Andre Iguodala": ["Stephen Curry"],
    "Klay Thompson": ["Stephen Curry", "Draymond Green", "Mychal Thompson"],
    "Mychal Thompson": ["Klay Thompson"],
    "Draymond Green": ["Stephen Curry", "Klay Thompson"],
    "DeMar DeRozan": ["Kyle Lowry"],
    "Kyle Lowry": ["DeMar DeRozan", "Kawhi Leonard"],
    "Damian Lillard": ["CJ McCollum"],
    "CJ McCollum": ["Damian Lillard"],
    "Giannis Antetokounmpo": ["Khris Middleton", "Thanasis Antetokounmpo", "Kostas Antetokounmpo", "Alex Antetokounmpo", "Jrue Holiday"],
    "Khris Middleton": ["Giannis Antetokounmpo"],
    "Jrue Holiday": ["Giannis Antetokounmpo"],
    "Thanasis Antetokounmpo": ["Giannis Antetokounmpo"],
    "Kostas Antetokounmpo": ["Giannis Antetokounmpo"],
    "Alex Antetokounmpo": ["Giannis Antetokounmpo"],
    "LaMelo Ball": ["Lonzo Ball"],
    "Lonzo Ball": ["LaMelo Ball"],
    "John Wall": ["Bradley Beal"],
    "Bradley Beal": ["John Wall"],
    "Nikola Jokic": ["Jamal Murray", "Aaron Gordon"],
    "Jamal Murray": ["Nikola Jokic"],
    "Aaron Gordon": ["Nikola Jokic"],
    "Anthony Davis": ["LeBron James"],
    "Jayson Tatum": ["Jaylen Brown"],
    "Jaylen Brown": ["Jayson Tatum"],
    "Jalen Brunson": ["Josh Hart", "Mikal Bridges", "Rick Brunson"],
    "Rick Brunson": ["Jalen Brunson"],
    "Josh Hart": ["Jalen Brunson", "Mikal Bridges"],
    "Mikal Bridges": ["Jalen Brunson", "Josh Hart"],
    "Donovan Mitchell": ["Rudy Gobert"],
    "Rudy Gobert": ["Donovan Mitchell"],
    "Anthony Edwards": ["Karl-Anthony Towns"],
    "Karl-Anthony Towns": ["Anthony Edwards"],
    "Mike Conley": ["Marc Gasol"],
    "Marc Gasol": ["Mike Conley", "Pau Gasol"],
    "Ben Simmons": ["Joel Embiid"],
    "Joel Embiid": ["Ben Simmons", "James Harden", "Tyrese Maxey"],
    "Tyrese Maxey": ["Joel Embiid"],
    "Shai Gilgeous-Alexander": ["Jalen Williams"],
    "Jalen Williams": ["Shai Gilgeous-Alexander"],
    "Christian Braun": ["Bruce Brown"],
    "Bruce Brown": ["Christian Braun"],
    "Jimmy Butler": ["Bam Adebayo"],
    "Bam Adebayo": ["Jimmy Butler"],
    "Brook Lopez": ["Robin Lopez"],
    "Robin Lopez": ["Brook Lopez"],
    "Amen Thompson": ["Ausar Thompson"],
    "Ausar Thompson": ["Amen Thompson"],
    "Bol Bol": ["Manute Bol"],
    "Manute Bol": ["Bol Bol"],
    "Arvydas Sabonis": ["Domantas Sabonis"],
    "Domantas Sabonis": ["Arvydas Sabonis"],
    "Gary Trent": ["Gary Trent Jr."],
    "Gary Trent Jr.": ["Gary Trent"],
    "Winston Garland": ["Darius Garland"],
    "Darius Garland": ["Winston Garland"],
    "Markieff Morris": ["Marcus Morris Sr."],
    "Marcus Morris Sr.": ["Markieff Morris"],
    "Ron Harper": ["Ron Harper Jr.", "Dylan Harper"],
    "Ron Harper Jr.": ["Ron Harper", "Dylan Harper"],
    "Dylan Harper": ["Ron Harper", "Ron Harper Jr."],
    "Gerald Henderson": ["Gerald Henderson Jr."],
    "Gerald Henderson Jr.": ["Gerald Henderson"],
    "Larry Nance": ["Larry Nance Jr."],
    "Larry Nance Jr.": ["Larry Nance"],
    "Doc Rivers": ["Austin Rivers"],
    "Austin Rivers": ["Doc Rivers"],
    "Jabari Smith": ["Jabari Smith Jr."],
    "Jabari Smith Jr.": ["Jabari Smith"],
    "Alex Sarr": ["Olivier Sarr"],
    "Olivier Sarr": ["Alex Sarr"],
    "Jaden McDaniels": ["Jalen McDaniels"],
    "Jalen McDaniels": ["Jaden McDaniels"],
    "Bill Walton": ["Luke Walton"],
    "Luke Walton": ["Bill Walton"]
  };
  function applyDuo(player) {
    if (player.full_name === "Patrick Ewing" && player.era === "10s") {
      return { ...player, duoPartners: ["Patrick Ewing"] };
    }
    const partners = DUO_PAIRS[player.full_name];
    if (!partners)
      return player;
    return { ...player, duoPartners: partners };
  }
  var TIMELESS_PLAYERS = /* @__PURE__ */ new Set([
    "LeBron James",
    "Oscar Robertson",
    "Magic Johnson",
    "Kareem Abdul-Jabbar",
    "Kevin Durant",
    "Giannis Antetokounmpo",
    "Tim Duncan",
    "Nikola Jokic",
    "Michael Jordan",
    "Russell Westbrook",
    "Larry Bird",
    "Kobe Bryant",
    "Shaquille O'Neal",
    "Kevin Garnett",
    "Hakeem Olajuwon",
    "Kawhi Leonard",
    "Charles Barkley",
    "David Robinson",
    "Anthony Davis",
    "Moses Malone",
    "Pete Maravich",
    "Gary Payton",
    "Jerry West"
  ]);
  var TIMELESS_T2_PLAYERS = /* @__PURE__ */ new Set([
    "Rudy Gobert",
    "Dwight Howard",
    "Draymond Green",
    "Shai Gilgeous-Alexander",
    "Steve Nash",
    "Julius Erving",
    "Elgin Baylor",
    "Scottie Pippen",
    "Bill Russell",
    "Clyde Drexler",
    "Tracy McGrady",
    "Penny Hardaway",
    "Bob Pettit",
    "Walt Frazier",
    "Dennis Rodman"
  ]);
  function applyTimeless(player) {
    if (TIMELESS_PLAYERS.has(player.full_name))
      return { ...player, timeless: true, timelessTier: 1 };
    if (TIMELESS_T2_PLAYERS.has(player.full_name))
      return { ...player, timeless: true, timelessTier: 2 };
    return player;
  }
  var FLOOR_GENERAL_T1 = /* @__PURE__ */ new Set([
    "Magic Johnson",
    "John Stockton",
    "Steve Nash",
    "Chris Paul",
    "Rajon Rondo",
    "Bob Cousy",
    "Jason Kidd"
  ]);
  var FLOOR_GENERAL_T2 = /* @__PURE__ */ new Set([
    "Tony Parker",
    "Isiah Thomas",
    "Kevin Johnson",
    "Ricky Rubio",
    "Mark Price",
    "Jerry West"
  ]);
  function applyFloorGeneral(player) {
    if (FLOOR_GENERAL_T1.has(player.full_name))
      return { ...player, floorGeneral: true, floorGeneralTier: 1 };
    if (FLOOR_GENERAL_T2.has(player.full_name))
      return { ...player, floorGeneral: true, floorGeneralTier: 2 };
    return player;
  }
  var SHOOTING_STAR_T1 = /* @__PURE__ */ new Set([
    "Stephen Curry",
    "Klay Thompson",
    "Ray Allen",
    "Reggie Miller",
    "Kyle Korver",
    "Damian Lillard",
    "Larry Bird",
    "JJ Redick",
    "Kevin Durant"
  ]);
  var SHOOTING_STAR_T2 = /* @__PURE__ */ new Set([
    "Steve Kerr",
    "Peja Stojakovic",
    "Dell Curry",
    "Joe Harris",
    "Tim Hardaway Jr.",
    "Drazen Petrovic",
    "Craig Hodges",
    "Glen Rice",
    "Michael Porter Jr.",
    "Karl-Anthony Towns",
    "Duncan Robinson",
    "Mike Miller",
    "Dirk Nowitzki",
    "Kentavious Caldwell-Pope",
    "Kon Knueppel",
    "Buddy Hield",
    "Mark Price",
    "Trae Young",
    "Paul George",
    "Sam Hauser",
    "Detlef Schrempf",
    "Kevin Love"
  ]);
  function applyShootingStar(player) {
    if (SHOOTING_STAR_T1.has(player.full_name))
      return { ...player, shootingStar: true, shootingStarTier: 1 };
    if (SHOOTING_STAR_T2.has(player.full_name))
      return { ...player, shootingStar: true, shootingStarTier: 2 };
    return player;
  }
  var GLASS_CLEANER_PLAYERS = /* @__PURE__ */ new Set([
    "Dennis Rodman",
    "Ben Wallace",
    "Moses Malone",
    "Andre Drummond",
    "DeAndre Jordan",
    "Steven Adams",
    "Wes Unseld",
    "Bob Pettit",
    "Nate Thurmond",
    "Kevin Love",
    "Clint Capela",
    "Bill Russell",
    "Charles Barkley",
    "Dave Cowens",
    "Artis Gilmore"
  ]);
  function applyGlassCleaner(player) {
    if (!GLASS_CLEANER_PLAYERS.has(player.full_name))
      return player;
    return { ...player, glassClean: true };
  }
  function playoffRingBoost(rings) {
    if (rings >= 9)
      return 0.14;
    if (rings >= 6)
      return 0.12;
    if (rings >= 3)
      return 0.09;
    if (rings >= 1)
      return 0.05;
    return 0;
  }
  var THREE_PT_ERAS = ["10s", "20s"];
  var PRE_THREE_PT_ERAS = ["50s", "60s", "70s"];
  var ERA_LEAGUE_AVG_3PT = {
    "80s": 0.278,
    "90s": 0.34,
    "00s": 0.35,
    "10s": 0.362,
    "20s": 0.362
  };
  var ESTIMATED_SHOOTER_OVERRIDES = /* @__PURE__ */ new Set(["Pete Maravich"]);
  function isEstimatedShooter(player, simEra2) {
    if (player.FG3_PCT != null)
      return false;
    if (!PRE_THREE_PT_ERAS.includes(player.era))
      return false;
    if (PRE_THREE_PT_ERAS.includes(simEra2))
      return false;
    if (ESTIMATED_SHOOTER_OVERRIDES.has(player.full_name))
      return true;
    const pos = (player.position ?? "").toUpperCase();
    const isGuard = pos.includes("GUARD") || pos.includes("PG") || pos.includes("SG") || pos === "G";
    if (!isGuard)
      return false;
    return calcTS(player) >= 0.52;
  }
  function getEstimatedFG3PCT(player, simEra2) {
    if (!isEstimatedShooter(player, simEra2))
      return null;
    const leagueAvg = ERA_LEAGUE_AVG_3PT[simEra2];
    return leagueAvg != null ? leagueAvg * 0.85 : null;
  }
  var ERA_OPP_BASELINE = {
    "50s": 88,
    "60s": 105,
    "70s": 100,
    "80s": 107,
    "90s": 98,
    "00s": 97,
    "10s": 108,
    "20s": 114
  };
  var ERA_DIFFICULTY = {
    "50s": 1.04,
    "60s": 1.05,
    "70s": 1.05,
    "80s": 1.08,
    "90s": 1.1,
    "00s": 1.06,
    "10s": 1.08,
    "20s": 1.1
  };
  var ERA_SCORE_CAP = {
    "50s": 130,
    "60s": 140,
    "70s": 130,
    "80s": 136,
    "90s": 124,
    "00s": 122,
    "10s": 138,
    "20s": 135
  };
  var ERA_SCORE_FLOOR = {
    "50s": 72,
    "60s": 80,
    "70s": 80,
    "80s": 82,
    "90s": 80,
    "00s": 80,
    "10s": 82,
    "20s": 85
  };
  var ERA_DECADE_START = {
    "50s": 1950,
    "60s": 1960,
    "70s": 1970,
    "80s": 1980,
    "90s": 1990,
    "00s": 2e3,
    "10s": 2010,
    "20s": 2020
  };
  var ERA_SEASON_GAMES = {
    "50s": 72,
    "60s": 72,
    "70s": 82,
    "80s": 82,
    "90s": 82,
    "00s": 82,
    "10s": 82,
    "20s": 82
  };
  var SLOT_MPG = {
    PG: 35,
    SG: 35,
    SF: 35,
    PF: 35,
    C: 35,
    B1: 25,
    B2: 15,
    B3: 13,
    B4: 12
  };
  var STARTER_BASELINE_MPG = 35;
  var BENCH_BASELINE_MPG = 25;
  var RATING_STAT_OVERRIDE = {
    "Nikola Vucevic:20s:ORL": "20s:CHI"
  };
  var BASE_RATING_OVERRIDE = {
    "Shai Gilgeous-Alexander:20s:OKC": 69,
    "Joel Embiid:20s:PHI": 67.7,
    "Giannis Antetokounmpo:20s:MIL": 70,
    "Nikola Jokic:20s:DEN": 70,
    "Luka Doncic:20s:LAL": 69.5,
    "Damian Lillard:20s:POR": 61,
    "Jalen Brunson:20s:NYK": 56,
    "Devin Booker:20s:PHX": 52.8,
    "Paul George:20s:LAC": 54.2,
    "Tyrese Haliburton:20s:IND": 51,
    "Jaylen Brown:20s:BOS": 50,
    "Tyrese Maxey:20s:PHI": 47.3,
    "Anthony Edwards:20s:MIN": 53,
    "Jamal Murray:20s:DEN": 54,
    "Michael Porter Jr.:20s:DEN": 44,
    "Aaron Gordon:20s:DEN": 47,
    "Austin Reaves:20s:LAL": 44,
    "Christian Braun:20s:DEN": 32,
    "Jrue Holiday:20s:BOS": 50,
    "Derrick White:20s:BOS": 43,
    "Jalen Williams:20s:OKC": 47.2,
    "Cason Wallace:20s:OKC": 34.6,
    "Jared McCain:20s:OKC": 35,
    "Peyton Watson:20s:DEN": 34,
    "LeBron James:10s:CLE": 72,
    "LeBron James:10s:MIA": 70,
    "LeBron James:10s:LAL": 68,
    "Dwight Howard:10s:ORL": 60,
    "Paul George:10s:IND": 55.1,
    "Stephen Curry:10s:GSW": 70,
    "James Harden:10s:HOU": 65,
    "Kevin Durant:10s:OKC": 70,
    "Kevin Durant:10s:GSW": 67,
    "Russell Westbrook:10s:OKC": 62,
    "Carmelo Anthony:10s:DEN": 57,
    "Tim Duncan:10s:SAS": 55,
    "Kyrie Irving:10s:CLE": 55.5,
    "Devin Booker:10s:PHX": 48,
    "Chris Paul:10s:LAC": 60,
    "Dwyane Wade:10s:MIA": 50,
    "Jimmy Butler:10s:CHI": 46.2,
    "Mike Conley:10s:MEM": 42,
    "Draymond Green:10s:GSW": 51,
    "Kevin Love:10s:CLE": 46.6,
    "Paul Millsap:10s:ATL": 46.5,
    "Tristan Thompson:10s:CLE": 32.6,
    "Richard Jefferson:10s:CLE": 28,
    "John Wall:10s:WAS": 46,
    "Derrick Rose:10s:CHI": 46,
    "Tony Parker:10s:SAS": 40,
    "DeAndre Jordan:10s:LAC": 39,
    "Shaquille O'Neal:00s:LAL": 69,
    "Tim Duncan:00s:SAS": 69,
    "Kobe Bryant:00s:LAL": 65,
    "Dwyane Wade:00s:MIA": 57.5,
    "Carmelo Anthony:00s:DEN": 55.1,
    "Kevin Durant:00s:OKC": 57,
    "Kevin Durant:00s:SEA": 57,
    "Gary Payton:00s:SEA": 54,
    "Jason Kidd:00s:NJN": 46.8,
    "Jason Kidd:00s:PHX": 46.6,
    "Yao Ming:00s:HOU": 46.5,
    "Michael Jordan:90s:CHI": 72,
    "Hakeem Olajuwon:90s:HOU": 69,
    "Shaquille O'Neal:90s:ORL": 63,
    "Shaquille O'Neal:90s:LAL": 66,
    "David Robinson:90s:SAN": 65,
    "Magic Johnson:90s:LAL": 63,
    "Magic Johnson:70s:LAL": 56,
    "Charles Barkley:90s:PHX": 57,
    "Kobe Bryant:90s:LAL": 45,
    "Larry Bird:80s:BOS": 68,
    "Larry Bird:70s:BOS": 60,
    "Hakeem Olajuwon:80s:HOU": 71,
    "David Robinson:80s:SAN": 66,
    "Alex English:80s:DEN": 57,
    "Isiah Thomas:80s:DET": 55.7,
    "Julius Erving:70s:PHL": 58,
    "Oscar Robertson:70s:MIL": 56,
    "Jojo White:70s:BOS": 44,
    "Wilt Chamberlain:60s:PHW": 88,
    "Wilt Chamberlain:60s:SFW": 85,
    "Wilt Chamberlain:50s:PHW": 78.4
  };
  function withEraStats(player, era, team) {
    const eraData = (team ? player.stats_by_era?.[`${era}:${team}`] : void 0) ?? player.stats_by_era?.[era];
    if (!eraData)
      return { ...player, era };
    const { team: eraTeam, GP, ...stats } = eraData;
    return { ...player, era, eraTeam: eraTeam ?? team, GP, ...stats };
  }
  function playerMatchesEra(player, era) {
    const start = ERA_DECADE_START[era];
    const end = start + 9;
    const careerEnd = player.to_year ?? 2029;
    return player.from_year <= end && careerEnd >= start;
  }
  function calcTS(player) {
    if (player.TS_PCT != null)
      return player.TS_PCT;
    if (player.FG_PCT == null)
      return 0.45;
    return player.FG_PCT * 0.9 + (player.FT_PCT ?? 0.7) * 0.1;
  }
  function calcTeamDefTotals(playerRatings) {
    let stl = 0, blk = 0;
    for (const pr of playerRatings) {
      const isStarter = STARTER_SLOTS.includes(pr.slot);
      const minScale = SLOT_MPG[pr.slot] / (isStarter ? STARTER_BASELINE_MPG : BENCH_BASELINE_MPG);
      stl += imputeSTL(pr.player) * minScale;
      blk += imputeBLK(pr.player) * minScale;
    }
    return { stl, blk };
  }
  function genOppTeamStats(avgOppScore, era, teamSTL, teamBLK, teamRebFactor) {
    const BL = {
      "50s": { ppg: 79, reb: 65, ast: 14, stl: null, blk: null, tov: 18, fg: 0.372, fg3: null, ft: 0.675, ts: 0.48 },
      "60s": { ppg: 107, reb: 58, ast: 18, stl: null, blk: null, tov: 17, fg: 0.44, fg3: null, ft: 0.718, ts: 0.52 },
      "70s": { ppg: 105, reb: 46, ast: 24, stl: 8, blk: 5, tov: 17, fg: 0.458, fg3: null, ft: 0.728, ts: 0.53 },
      "80s": { ppg: 110, reb: 43, ast: 26, stl: 8.5, blk: 5.2, tov: 15, fg: 0.477, fg3: 0.278, ft: 0.748, ts: 0.548 },
      "90s": { ppg: 99, reb: 43, ast: 24, stl: 8.6, blk: 5.3, tov: 15, fg: 0.454, fg3: 0.34, ft: 0.742, ts: 0.54 },
      "00s": { ppg: 97, reb: 42, ast: 22, stl: 7.8, blk: 5, tov: 13, fg: 0.45, fg3: 0.35, ft: 0.74, ts: 0.538 },
      "10s": { ppg: 105, reb: 43, ast: 24, stl: 7.8, blk: 5.1, tov: 14, fg: 0.46, fg3: 0.362, ft: 0.76, ts: 0.555 },
      "20s": { ppg: 114, reb: 44, ast: 28, stl: 8, blk: 5.2, tov: 14, fg: 0.47, fg3: 0.362, ft: 0.778, ts: 0.57 }
    };
    const b = BL[era];
    const scale = avgOppScore / b.ppg;
    const cn = (r) => (rng() - 0.5) * r;
    const pn = () => randn() * 0.018;
    return {
      REB: Math.min(75, Math.max(28, +(b.reb * scale * (teamRebFactor != null ? 2 - teamRebFactor : 1) + cn(5)).toFixed(1))),
      AST: Math.max(10, +(b.ast * scale + cn(4)).toFixed(1)),
      STL: b.stl != null ? Math.max(4, +(b.stl + cn(1.5)).toFixed(1)) : null,
      BLK: b.blk != null ? Math.max(2, +(b.blk + cn(1)).toFixed(1)) : null,
      TOV: (() => {
        const defTOVAdjust = b.stl != null ? (teamSTL != null ? (teamSTL - b.stl) * 1 : 0) + (teamBLK != null ? (teamBLK - (b.blk ?? 5.1)) * 0.3 : 0) : 0;
        return Math.max(8, +(b.tov * scale + cn(3) + defTOVAdjust).toFixed(1));
      })(),
      FG_PCT: Math.min(0.58, Math.max(0.35, b.fg + pn())),
      FG3_PCT: b.fg3 != null ? Math.min(0.48, Math.max(0.22, b.fg3 + pn())) : null,
      FT_PCT: Math.min(0.88, Math.max(0.58, b.ft + pn())),
      TS_PCT: Math.min(0.68, Math.max(0.42, b.ts + pn()))
    };
  }
  function isBigPosition(position) {
    const pos = (position ?? "").toUpperCase();
    if (pos.includes("CENTER"))
      return true;
    if (pos.includes("GUARD"))
      return false;
    if (pos.includes("FORWARD"))
      return true;
    return false;
  }
  function imputeBLK(player) {
    if (player.BLK != null)
      return player.BLK;
    const is75 = player.greatest_75_flag === "Y";
    const big = isBigPosition(player.position ?? "");
    return is75 ? big ? 2.5 : 0.8 : big ? 1.2 : 0.3;
  }
  function imputeSTL(player) {
    if (player.STL != null)
      return player.STL;
    return player.greatest_75_flag === "Y" ? 1.8 : 0.9;
  }
  function imputeTOV(player) {
    if (player.TOV != null)
      return player.TOV;
    return player.greatest_75_flag === "Y" ? 2.5 : 1.5;
  }
  function playerBaseRating(player, simEra2) {
    const duoBonus = (player.duoActiveCount ?? 0) * 5;
    const flatKey = player.eraTeam ? `${player.full_name}:${player.era}:${player.eraTeam}` : null;
    if (flatKey && BASE_RATING_OVERRIDE[flatKey] != null)
      return BASE_RATING_OVERRIDE[flatKey] + duoBonus;
    const overrideKey = player.eraTeam ? `${player.full_name}:${player.era}:${player.eraTeam}` : null;
    const overrideTarget = overrideKey ? RATING_STAT_OVERRIDE[overrideKey] : null;
    const ratingPlayer = overrideTarget && player.stats_by_era?.[overrideTarget] ? { ...player, ...(() => {
      const { team: _t, GP: _g, ...s } = player.stats_by_era[overrideTarget];
      return s;
    })() } : player;
    const ts = calcTS(ratingPlayer);
    const threePtBonus = !simEra2 || PRE_THREE_PT_ERAS.includes(simEra2) ? 0 : (ratingPlayer.FG3M ?? 0) * 1.5;
    const t1 = (player.anchorTier ?? 1) === 1;
    const fgT1 = (player.floorGeneralTier ?? 1) === 1;
    const anchorBonus = player.defAnchor ? t1 ? 12 : 6 : player.offAnchor ? t1 ? 8 : 4 : player.floorGeneral ? fgT1 ? 5 : 3 : 0;
    const top75Bonus = player.greatest_75_flag === "Y" ? 3 : 0;
    const sixthTeamOverrides = SIXTH_MAN_TEAM_KEYS[player.full_name];
    const sixthEffectiveTeam = player.eraTeam ?? player.teams_by_era?.[player.era];
    const isSixthMan = SIXTH_MAN_PLAYERS.has(player.full_name) || !!sixthTeamOverrides && !!sixthEffectiveTeam && sixthTeamOverrides.includes(sixthEffectiveTeam);
    const sixthManBonus = isSixthMan && player.sixthManActive ? 5 : 0;
    return (ratingPlayer.PTS ?? 0) * 1 + (ratingPlayer.REB ?? 0) * 0.7 + (ratingPlayer.AST ?? 0) * 0.7 + ts * 25 + threePtBonus + imputeSTL(ratingPlayer) * 1.5 + imputeBLK(ratingPlayer) * 1.5 - imputeTOV(ratingPlayer) * 1 + anchorBonus + top75Bonus + duoBonus + sixthManBonus;
  }
  var CAP_QUOTAS = { s: 2, a: 2, b: 2, c: 2, d: 1 };
  function playerTier(base) {
    if (base >= 55)
      return "s";
    if (base >= 46)
      return "a";
    if (base >= 38)
      return "b";
    if (base >= 31)
      return "c";
    return "d";
  }
  function calcFitPenalty(player, slot) {
    if (slot.startsWith("B")) {
      return { penalty: 0, label: "Position Fit" };
    }
    const locked = POSITION_LOCK[player.full_name];
    if (locked) {
      if (locked.includes(slot))
        return { penalty: 0, label: "Position Fit" };
      const STARTER_ORDER = ["PG", "SG", "SF", "PF", "C"];
      const slotIdx = STARTER_ORDER.indexOf(slot);
      const minDist = Math.min(...locked.filter((p) => STARTER_ORDER.includes(p)).map((p) => Math.abs(STARTER_ORDER.indexOf(p) - slotIdx)));
      if (minDist <= 1)
        return { penalty: 0.1, label: "Positional Penalty -10%" };
      return { penalty: 0.25, label: "Major Penalty -25%" };
    }
    if (player.flexPositions?.includes(slot)) {
      return { penalty: 0, label: "Position Fit" };
    }
    if (player.flexPositions && player.flexPositions.length > 0) {
      const STARTER_ORDER = ["PG", "SG", "SF", "PF", "C"];
      const slotIdx = STARTER_ORDER.indexOf(slot);
      const minDist = Math.min(...player.flexPositions.filter((p) => STARTER_ORDER.includes(p)).map((p) => Math.abs(STARTER_ORDER.indexOf(p) - slotIdx)));
      if (minDist <= 1)
        return { penalty: 0.1, label: "Positional Penalty -10%" };
      return { penalty: 0.25, label: "Major Penalty -25%" };
    }
    const pos = player.position ?? "";
    const posUpper = pos.toUpperCase();
    const isGuard = posUpper.includes("GUARD") || posUpper.includes("PG") || posUpper.includes("SG") || posUpper === "G";
    const isForward = posUpper.includes("FORWARD") || posUpper.includes("SF") || posUpper.includes("PF") || posUpper === "F";
    const isCenter = posUpper.includes("CENTER") || posUpper.includes("C") || posUpper === "C";
    const isGuardForward = posUpper.includes("G/F") || posUpper.includes("F/G") || posUpper.includes("GUARD-FORWARD") || posUpper.includes("FORWARD-GUARD");
    const isForwardCenter = posUpper.includes("F/C") || posUpper.includes("C/F") || posUpper.includes("FORWARD-CENTER") || posUpper.includes("CENTER-FORWARD");
    if (slot === "PG") {
      if (isGuard || isGuardForward)
        return { penalty: 0, label: "Position Fit" };
      if (isForward)
        return { penalty: 0.25, label: "Major Penalty -25%" };
      if (isCenter)
        return { penalty: 0.25, label: "Major Penalty -25%" };
    }
    if (slot === "SG") {
      if (isGuard || isGuardForward)
        return { penalty: 0, label: "Position Fit" };
      if (isForward)
        return { penalty: 0.1, label: "Positional Penalty -10%" };
      if (isCenter)
        return { penalty: 0.25, label: "Major Penalty -25%" };
    }
    if (slot === "SF") {
      if (isForward || isGuardForward || isForwardCenter)
        return { penalty: 0, label: "Position Fit" };
      if (isGuard)
        return { penalty: 0.1, label: "Positional Penalty -10%" };
      if (isCenter)
        return { penalty: 0.25, label: "Major Penalty -25%" };
    }
    if (slot === "PF") {
      if (isForward || isForwardCenter)
        return { penalty: 0, label: "Position Fit" };
      if (isGuardForward)
        return { penalty: 0.1, label: "Positional Penalty -10%" };
      if (isCenter)
        return { penalty: 0.1, label: "Positional Penalty -10%" };
      if (isGuard)
        return { penalty: 0.25, label: "Major Penalty -25%" };
    }
    if (slot === "C") {
      if (isCenter || isForwardCenter)
        return { penalty: 0, label: "Position Fit" };
      if (isForward)
        return { penalty: 0.1, label: "Positional Penalty -10%" };
      if (isGuard || isGuardForward)
        return { penalty: 0.25, label: "Major Penalty -25%" };
    }
    return { penalty: 0.1, label: "Positional Penalty -10%" };
  }
  var ERA_MOD_FORWARD = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65];
  var ERA_MOD_FORWARD_EST_SHOOTER = [1, 0.97, 0.93, 0.89, 0.86, 0.82, 0.78, 0.75];
  var ERA_MOD_BACKWARD = [1, 0.97, 0.94, 0.91, 0.88, 0.85, 0.82, 0.79];
  var ERA_MOD_BACKWARD_TALL = [1, 0.985, 0.97, 0.955, 0.94, 0.925, 0.91, 0.895];
  function playerHeightInches(player) {
    const parts = (player.height ?? "").split("-").map(Number);
    return parts.length === 2 ? parts[0] * 12 + parts[1] : 0;
  }
  function calcEraModifier(player, simEra2) {
    const playerIdx = ERA_ORDER.indexOf(player.era);
    const simIdx = ERA_ORDER.indexOf(simEra2);
    const dist = Math.abs(playerIdx - simIdx);
    if (player.timeless && (player.timelessTier ?? 1) === 1)
      return dist >= 6 ? 0.95 : 1;
    if (player.era === "10s" && simEra2 === "20s" || player.era === "20s" && simEra2 === "10s")
      return 0.98;
    if (player.full_name === "Chris Paul" && (simEra2 === "90s" || simEra2 === "00s" || simEra2 === "10s" || simEra2 === "20s"))
      return 1;
    if (player.full_name === "Zach Randolph" && playerIdx > simIdx)
      return 1;
    const isTallCenter = playerHeightInches(player) >= 82 || player.full_name === "Bam Adebayo" || player.full_name === "Zion Williamson" || player.full_name === "Aaron Gordon";
    const table = playerIdx > simIdx ? isTallCenter ? ERA_MOD_BACKWARD_TALL : ERA_MOD_BACKWARD : isEstimatedShooter(player, simEra2) ? ERA_MOD_FORWARD_EST_SHOOTER : ERA_MOD_FORWARD;
    let mod = table[Math.min(dist, table.length - 1)];
    const modernInOldEra = {
      "20s": { "50s": 0.12, "60s": 0.09 },
      "10s": { "50s": 0.11, "60s": 0.08 }
    };
    const extraPenalty = modernInOldEra[player.era]?.[simEra2] ?? 0;
    mod = Math.max(mod - extraPenalty, 0.5);
    if (PRE_THREE_PT_ERAS.includes(player.era) && !isEstimatedShooter(player, simEra2)) {
      const fg3 = player.FG3_PCT ?? 0;
      if (fg3 < 0.2) {
        if (THREE_PT_ERAS.includes(simEra2) || simEra2 === "00s")
          mod -= 0.1;
        else if (simEra2 === "90s")
          mod -= 0.05;
      }
    }
    const rawMod = Math.max(mod, 0.5);
    if (player.timeless && player.timelessTier === 2)
      return 1 - (1 - rawMod) * 0.5;
    return rawMod;
  }
  function calcPlayerAdjustedRating(player, slot, simEra2) {
    const base = playerBaseRating(player, simEra2);
    const { penalty, label } = calcFitPenalty(player, slot);
    const eraMod = calcEraModifier(player, simEra2);
    const adjusted = base * (1 - penalty) * eraMod;
    return { base, adjusted, fitPenalty: penalty, eraMod, fitLabel: label };
  }
  function coachBonus(grade) {
    return { S: 0.07, A: 0.05, B: 0.025, C: 0, D: -0.025, F: -0.03 }[grade];
  }
  function effectiveCoachBonus(coach, side) {
    if (side === "off" && coach.offGuru)
      return 0.06;
    if (side === "def" && coach.defGuru)
      return 0.06;
    return coachBonus(side === "off" ? coach.offGrade : coach.defGrade);
  }
  function upgradeGrade(grade) {
    const map = { S: "S", A: "S", B: "A", C: "B", D: "C", F: "D" };
    return map[grade];
  }
  var FRANCHISE_PAIRS = {
    "Phil Jackson": ["Michael Jordan", "Scottie Pippen", "Kobe Bryant", "Shaquille O'Neal"],
    "Gregg Popovich": ["Tim Duncan", "Tony Parker", "David Robinson", "Kawhi Leonard"],
    "Pat Riley": ["Magic Johnson", "Kareem Abdul-Jabbar", "LeBron James", "Dwyane Wade"],
    "Red Auerbach": ["Bill Russell", "Bob Cousy"],
    "Jerry Sloan": ["John Stockton", "Karl Malone"],
    "Chuck Daly": ["Isiah Thomas"],
    "Larry Brown*": ["Allen Iverson"],
    "Don Nelson": ["Steve Nash", "Dirk Nowitzki"],
    "Rick Carlisle": ["Dirk Nowitzki", "Luka Doncic"],
    "Scott Brooks": ["Kevin Durant", "Russell Westbrook"],
    "Doc Rivers": ["Kevin Garnett", "Paul Pierce", "Rajon Rondo"],
    "Billy Cunningham": ["Julius Erving", "Moses Malone"],
    "Red Holzman": ["Walt Frazier"],
    "Erik Spoelstra": ["LeBron James", "Dwyane Wade"]
  };
  function coachChampBonus(coach) {
    return Math.min(coach.champ, 8) * 3e-3;
  }
  var STARTER_SLOTS = ["PG", "SG", "SF", "PF", "C"];
  function calcTeamRating(slots2, coach, simEra2) {
    const playerRatings = [];
    let starterSum = 0;
    let starterCount = 0;
    let benchWeightedSum = 0;
    let benchTotalMinutes = 0;
    for (const slot of slots2) {
      if (!slot.player)
        continue;
      const { base, adjusted, fitPenalty, eraMod, fitLabel } = calcPlayerAdjustedRating(slot.player, slot.position, simEra2);
      playerRatings.push({ player: slot.player, slot: slot.position, base, adjusted, fitPenalty, eraMod, fitLabel });
      if (STARTER_SLOTS.includes(slot.position)) {
        starterSum += adjusted;
        starterCount++;
      } else {
        const mpg = SLOT_MPG[slot.position];
        benchWeightedSum += adjusted * mpg;
        benchTotalMinutes += mpg;
      }
    }
    const starterAvg = starterCount > 0 ? starterSum / starterCount : 0;
    const benchAvg = benchTotalMinutes > 0 ? benchWeightedSum / benchTotalMinutes : 0;
    const rawRating = starterAvg * 0.7 + benchAvg * 0.3;
    const offBonus = effectiveCoachBonus(coach, "off");
    const defBonus = effectiveCoachBonus(coach, "def");
    const champBonus = coachChampBonus(coach);
    const teamRating = rawRating * (1 + (offBonus + defBonus) / 2 + champBonus);
    console.log("[Rating] --- Player breakdown ---");
    for (const pr of playerRatings) {
      const tag = STARTER_SLOTS.includes(pr.slot) ? "START" : "BENCH";
      console.log(
        `[Rating] ${tag} ${pr.slot} ${pr.player.full_name} | base=${pr.base.toFixed(1)} \xD7 era${(pr.eraMod * 100).toFixed(0)}% \xD7 fit${((1 - pr.fitPenalty) * 100).toFixed(0)}% = adjusted=${pr.adjusted.toFixed(1)}`
      );
    }
    console.log(
      `[Rating] starterAvg=${starterAvg.toFixed(1)} (\xD70.70=${(starterAvg * 0.7).toFixed(1)})  benchAvg=${benchAvg.toFixed(1)} (\xD70.30=${(benchAvg * 0.3).toFixed(1)})  rawRating=${rawRating.toFixed(1)}`
    );
    console.log(`[Rating] coach ${coach.name}: offBonus=${(offBonus * 100).toFixed(0)}% defBonus=${(defBonus * 100).toFixed(0)}% \u2192 teamRating=${teamRating.toFixed(1)}`);
    return { teamRating, rawRating, playerRatings };
  }
  function randn() {
    let u = 0, v = 0;
    while (u === 0)
      u = rng();
    while (v === 0)
      v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function effNoise(sigma) {
    const n = randn() * sigma;
    const MIN = 0.02;
    return Math.abs(n) < MIN ? rng() < 0.5 ? -MIN : MIN : n;
  }
  function generateGameScore(expectedTeamScore, playerDefFactor, rebFactor, astFactor, coachDefBonus, coachOffBonus, win, simEra2, spacingWinFactor = 1) {
    const scoreCap = ERA_SCORE_CAP[simEra2];
    const scoreFloor = ERA_SCORE_FLOOR[simEra2];
    const oppBase = ERA_OPP_BASELINE[simEra2];
    const rawAdjTeamScore = expectedTeamScore * rebFactor * astFactor * spacingWinFactor * (1 + coachOffBonus * 0.5);
    const adjTeamScore = Math.min(rawAdjTeamScore, scoreCap - 15);
    let teamScore = Math.round(Math.min(scoreCap, Math.max(scoreFloor, adjTeamScore + randn() * 10)));
    const rebDefEffect = 1 + (1 - rebFactor) * 0.5;
    const oppBaseline = oppBase * playerDefFactor * rebDefEffect * (1 - coachDefBonus * 0.5);
    let oppScore = Math.round(Math.min(scoreCap - 5, Math.max(scoreFloor - 4, oppBaseline + randn() * 10)));
    if (win && teamScore <= oppScore) {
      teamScore = oppScore + 2 + Math.round(Math.abs(randn()) * 7);
    } else if (!win && oppScore <= teamScore) {
      oppScore = teamScore + 2 + Math.round(Math.abs(randn()) * 8);
    }
    let ts = Math.min(scoreCap, teamScore);
    let os = win ? Math.min(scoreCap, oppScore) : oppScore;
    if (ts === os) {
      if (win)
        ts += 1;
      else
        os += 1;
    }
    return { teamScore: ts, oppScore: os };
  }
  var LEAGUE_AVG_DEF_INDEX = 8;
  var LEAGUE_AVG_AST_INDEX = 22;
  var ERA_LEAGUE_AVG_REB = {
    "50s": 52,
    "60s": 47,
    "70s": 42,
    "80s": 40,
    "90s": 38,
    "00s": 36,
    "10s": 34,
    "20s": 34
  };
  var PG_REB_THRESHOLD = 2;
  var SG_REB_THRESHOLD = 2.5;
  function blkSlotMod(slot) {
    if (slot === "PG")
      return 0.4;
    if (slot === "SG")
      return 0.5;
    if (slot === "SF")
      return 0.8;
    return 1;
  }
  function rebSlotMod(slot) {
    if (slot === "PG")
      return 0.4;
    if (slot === "SG")
      return 0.55;
    if (slot === "SF")
      return 0.85;
    return 1;
  }
  function calcBlkScore(entries) {
    const raw = entries.reduce((s, { pr, minScale }) => s + imputeBLK(pr.player) * pr.eraMod * minScale * blkSlotMod(pr.slot), 0);
    const slotPenalty = ["C", "PF"].reduce((pen, slot) => {
      const entry = entries.find((ent) => ent.pr.slot === slot);
      if (!entry)
        return pen;
      const expected = slot === "C" ? 1.2 : 0.6;
      const contrib = imputeBLK(entry.pr.player) * entry.pr.eraMod * entry.minScale;
      return pen + Math.max(0, expected - contrib) * 0.7;
    }, 0);
    return Math.max(0, raw - slotPenalty);
  }
  function calcPlayerDefFactor(entries, simEra2) {
    const stlIndex = entries.reduce((s, { pr, minScale }) => s + imputeSTL(pr.player) * pr.eraMod * minScale, 0);
    const stlFactor = Math.max(0.94, Math.min(1.06, 1 + (LEAGUE_AVG_DEF_INDEX - stlIndex) / LEAGUE_AVG_DEF_INDEX * 0.06));
    const isPreThreePt = simEra2 === "50s" || simEra2 === "60s" || simEra2 === "70s";
    const blkScore = calcBlkScore(entries);
    const BLK_BASELINE = 3.5;
    const blkShortfall = BLK_BASELINE - blkScore;
    const blkEraScale = isPreThreePt ? 0.6 : 1;
    const blkRate = (blkShortfall > 0 ? 0.035 : 0.015) * blkEraScale;
    const rimFactor = Math.max(0.86, Math.min(1.08, 1 + blkShortfall * blkRate));
    const anchorAdj = entries.reduce((s, { pr, minScale }) => {
      if (!pr.player.defAnchor)
        return s;
      return s + ((pr.player.anchorTier ?? 1) === 1 ? 0.025 : 0.015) * minScale;
    }, 0);
    return Math.max(0.82, Math.min(1.15, stlFactor * rimFactor * (1 - anchorAdj)));
  }
  function calcRebFactor(entries, simEra2) {
    const leagueAvg = ERA_LEAGUE_AVG_REB[simEra2];
    const eraScale = leagueAvg / ERA_LEAGUE_AVG_REB["20s"];
    const rebIndex = entries.reduce((s, { pr, minScale }) => {
      const gcMult = pr.player.glassClean ? 1.5 : 1;
      const contrib = (pr.player.REB ?? 0) * pr.eraMod * minScale * rebSlotMod(pr.slot) * gcMult;
      if (pr.slot === "PG")
        return s + Math.max(0, contrib - PG_REB_THRESHOLD);
      if (pr.slot === "SG")
        return s + Math.max(0, contrib - SG_REB_THRESHOLD);
      return s + contrib;
    }, 0);
    const slotPenalty = ["C", "PF"].reduce((pen, slot) => {
      const entry = entries.find((ent) => ent.pr.slot === slot);
      if (!entry)
        return pen;
      const expected = (slot === "C" ? 7.5 : 5.5) * eraScale;
      const contrib = (entry.pr.player.REB ?? 0) * entry.pr.eraMod * entry.minScale;
      return pen + Math.max(0, expected - contrib);
    }, 0);
    const raw = 1 + (rebIndex - slotPenalty - leagueAvg) / leagueAvg * 0.15;
    return Math.max(0.91, Math.min(1.09, raw));
  }
  function spacingSlotWeight(slot, simEra2) {
    if (slot === "PG" || slot === "SG")
      return 1.2;
    if (slot === "SF")
      return 1.15;
    if (slot === "PF")
      return 0.9;
    if (slot === "C")
      return simEra2 === "20s" || simEra2 === "10s" ? 0.75 : 0.5;
    return 0.9;
  }
  function calcAstFactor(entries) {
    const astIndex = entries.reduce((s, { pr, minScale }) => s + (pr.player.AST ?? 0) * pr.eraMod * minScale, 0);
    const raw = 1 + (astIndex - LEAGUE_AVG_AST_INDEX) / LEAGUE_AVG_AST_INDEX * 0.1;
    const fgBoost = entries.reduce((sum, { pr }) => {
      if (!pr.player.floorGeneral)
        return sum;
      return sum + (pr.player.floorGeneralTier === 2 ? 0.03 : 0.06);
    }, 0);
    return Math.max(0.9, Math.min(1.15, raw + fgBoost));
  }
  function simulateSeason(rawRating, playerRatings, coachDefGrade2, coachOffGrade2, simEra2, coachDefBonus, coachOffBonus, difficultyMod) {
    const games = [];
    let wins = 0;
    let totalTeamScore = 0;
    let totalOppScore = 0;
    const eraDifficulty = ERA_DIFFICULTY[simEra2] ?? 1;
    const OPP_BASELINE = 43 * eraDifficulty * (difficultyMod ?? 1);
    const OPP_SPREAD = 6;
    const GAME_NOISE = 6;
    const entries = playerRatings.map((pr) => {
      const isStarter = STARTER_SLOTS.includes(pr.slot);
      const assignedMPG = SLOT_MPG[pr.slot];
      const minScale = assignedMPG / (isStarter ? STARTER_BASELINE_MPG : BENCH_BASELINE_MPG);
      return { pr, assignedMPG, minScale };
    });
    const preEff = entries.map(({ pr, assignedMPG }) => {
      const naturalMPG = Math.min(38, Math.max(10, (pr.player.PTS ?? 0) * 1.6));
      const stretchMax = Math.max(0, (assignedMPG - naturalMPG) / 28) * 0.06;
      const stretch = stretchMax > 0 ? -(stretchMax * rng()) : 0;
      return { fg: effNoise(0.035), ft: effNoise(0.03), fg3: effNoise(0.03), stretch };
    });
    const totalMinWeight = entries.reduce((s, { minScale }) => s + minScale, 0);
    const avgFGDelta = entries.reduce((s, { minScale }, i) => s + (preEff[i].fg + preEff[i].stretch) * minScale, 0) / totalMinWeight;
    const baseExpectedScore = entries.reduce((s, e) => s + (e.pr.player.PTS ?? 0) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty), 0);
    const expectedTeamScore = Math.max(85, Math.min(132, baseExpectedScore * (1 + avgFGDelta * 3)));
    const playerDefFactor = calcPlayerDefFactor(entries, simEra2);
    const rebFactor = calcRebFactor(entries, simEra2);
    const astFactor = calcAstFactor(entries);
    const defBonus = coachDefBonus ?? coachBonus(coachDefGrade2);
    const offBonus = coachOffBonus ?? coachBonus(coachOffGrade2);
    const rebWinFactor = 1 + (rebFactor - 1) * 0.5;
    const astWinFactor = 1 + (astFactor - 1) * 0.5;
    const rebOppFactor = 1 - (rebFactor - 1) * 0.25;
    const shooterCount = entries.reduce((s, e) => {
      const w = spacingSlotWeight(e.pr.slot, simEra2);
      const f = e.pr.player.FG3_PCT ?? 0;
      const fg3m = e.pr.player.FG3M ?? 0;
      if (fg3m < 0.5)
        return s;
      const ssm = e.pr.player.shootingStar ? e.pr.player.shootingStarTier === 1 ? 2.2 : 1.6 : 1.35;
      return s + (f >= 0.4 ? e.minScale * 1.25 : f >= 0.37 ? e.minScale * 1.12 : f >= 0.34 ? e.minScale : f >= 0.3 ? e.minScale * 0.5 : f >= 0.25 ? e.minScale * 0.25 : 0) * w * ssm;
    }, 0);
    const highVolumeShooterCount = entries.reduce((s, e) => {
      const w = spacingSlotWeight(e.pr.slot, simEra2);
      return s + ((e.pr.player.FG3M ?? 0) >= 2.9 ? e.minScale * w : 0);
    }, 0);
    const isPreThreePt = simEra2 === "50s" || simEra2 === "60s" || simEra2 === "70s";
    const spacingBaseline = simEra2 === "20s" ? 6 : simEra2 === "10s" ? 5 : simEra2 === "00s" ? 4 : simEra2 === "90s" ? 3 : simEra2 === "80s" ? 2 : 0;
    const spacingDev = isPreThreePt ? -highVolumeShooterCount : shooterCount - spacingBaseline;
    const spacingPerShooter = spacingDev < 0 ? isPreThreePt ? 0.035 : simEra2 === "20s" || simEra2 === "10s" ? 0.05 : simEra2 === "00s" ? 0.05 : simEra2 === "90s" ? 0.035 : 0.015 : simEra2 === "20s" || simEra2 === "10s" ? 0.022 : simEra2 === "00s" ? 0.014 : 9e-3;
    const spacingCapNeg = isPreThreePt ? 0.15 : simEra2 === "20s" ? 0.25 : simEra2 === "10s" ? 0.2 : simEra2 === "00s" ? 0.14 : simEra2 === "90s" ? 0.1 : 0.06;
    const spacingCapPos = simEra2 === "20s" ? 0.2 : simEra2 === "10s" ? 0.16 : simEra2 === "00s" ? 0.12 : simEra2 === "90s" ? 0.08 : 0.06;
    const spacingWinFactor = Math.max(1 - spacingCapNeg, Math.min(1 + spacingCapPos, 1 + spacingDev * spacingPerShooter));
    const eraOppAvg = ERA_OPP_BASELINE[simEra2];
    const expectedOppScore = eraOppAvg * playerDefFactor * (1 - defBonus * 0.5);
    const scoringDiffRatio = expectedTeamScore / Math.max(1, expectedOppScore);
    const scoringWinFactor = Math.max(0.93, Math.min(1.07, 1 + (scoringDiffRatio - 1) * 0.25));
    const seasonGames = ERA_SEASON_GAMES[simEra2];
    for (let i = 0; i < seasonGames; i++) {
      const oppBase = OPP_BASELINE * playerDefFactor * (1 - defBonus);
      const oppRating = oppBase + randn() * OPP_SPREAD;
      const teamRoll = rawRating * (1 + offBonus) * rebWinFactor * astWinFactor * spacingWinFactor * scoringWinFactor + randn() * GAME_NOISE;
      const oppRoll = oppRating * rebOppFactor + randn() * GAME_NOISE;
      const win = teamRoll > oppRoll;
      games.push(win);
      if (win)
        wins++;
      const { teamScore, oppScore } = generateGameScore(expectedTeamScore, playerDefFactor, rebFactor, astFactor, defBonus, offBonus, win, simEra2, spacingWinFactor);
      totalTeamScore += teamScore;
      totalOppScore += oppScore;
    }
    const avgTeamScore = totalTeamScore / seasonGames;
    const avgOppScore = totalOppScore / seasonGames;
    const weights = entries.map(({ pr, minScale }) => {
      const p = pr.player;
      const s = pr.eraMod * minScale * (1 - pr.fitPenalty);
      return {
        PTS: (p.PTS ?? 0) * s,
        REB: (p.REB ?? 0) * s,
        AST: (p.AST ?? 0) * s,
        STL: imputeSTL(p) * s,
        BLK: imputeBLK(p) * s,
        TOV: imputeTOV(p) * s
      };
    });
    const totalPTSWeight = weights.reduce((s, w) => s + w.PTS, 0);
    const seasonVar = entries.map(() => 0.85 + rng() * 0.3);
    const varPTSWeights = weights.map((w, i) => w.PTS * seasonVar[i]);
    const totalVarPTS = varPTSWeights.reduce((a, b) => a + b, 0);
    const varPTSAdj = varPTSWeights.map((w, i) => w + entries[i].assignedMPG * 0.08);
    const totalVarPTSAdj = varPTSAdj.reduce((a, b) => a + b, 0);
    const spacingMod = spacingDev * spacingPerShooter;
    const topAST = Math.max(...entries.map((e) => e.pr.player.AST ?? 0));
    const playmakingMod = Math.min(0.018, Math.max(-0.012, (topAST - 5) * 3e-3));
    const teamQualityMod = (rawRating - 70) * 8e-4;
    const seasonStats = entries.map(({ pr, assignedMPG }, i) => {
      const w = weights[i];
      const v = seasonVar[i];
      const rawFgCtx = spacingMod * 0.25 + playmakingMod + teamQualityMod + preEff[i].fg + preEff[i].stretch;
      const fgCtx = Math.max(-0.05, rawFgCtx);
      const fg3Ctx = playmakingMod + teamQualityMod + preEff[i].stretch;
      const ftCtx = preEff[i].ft + preEff[i].stretch * 0.4;
      return {
        player: pr.player,
        slot: pr.slot,
        GP: seasonGames,
        MPG: assignedMPG,
        PTS: varPTSAdj[i] / totalVarPTSAdj * avgTeamScore,
        REB: w.REB * v * rebSlotMod(pr.slot),
        AST: w.AST * v,
        STL: w.STL * v,
        BLK: w.BLK * v * blkSlotMod(pr.slot),
        TOV: w.TOV * v,
        FG_PCT: Math.min(0.8, Math.max(0.2, (pr.player.FG_PCT ?? 0.45) + fgCtx)),
        FG3_PCT: PRE_THREE_PT_ERAS.includes(simEra2) ? null : pr.player.FG3_PCT != null ? Math.min(0.6, Math.max(0.2, pr.player.FG3_PCT + fg3Ctx + preEff[i].fg3)) : (() => {
          const b = getEstimatedFG3PCT(pr.player, simEra2);
          return b != null ? Math.min(0.55, Math.max(0.18, b + fg3Ctx + preEff[i].fg3)) : null;
        })(),
        FT_PCT: Math.min(0.99, Math.max(0.3, (pr.player.FT_PCT ?? 0.7) + ftCtx))
      };
    });
    const rawTeamAST = seasonStats.reduce((s, p) => s + p.AST, 0);
    const seasonAstCap = avgTeamScore / 2.2 * 0.65;
    if (rawTeamAST > seasonAstCap) {
      const scale = seasonAstCap / rawTeamAST;
      for (const s of seasonStats)
        s.AST *= scale;
    }
    const ERA_TEAM_REB_FLOOR = {
      "50s": 52,
      "60s": 48,
      "70s": 43,
      "80s": 40,
      "90s": 38,
      "00s": 36,
      "10s": 35,
      "20s": 35
    };
    const ERA_TEAM_AST_FLOOR = {
      "50s": 18,
      "60s": 20,
      "70s": 22,
      "80s": 22,
      "90s": 20,
      "00s": 20,
      "10s": 20,
      "20s": 20
    };
    const teamREB = seasonStats.reduce((s, p) => s + p.REB, 0);
    const teamAST = seasonStats.reduce((s, p) => s + p.AST, 0);
    const rebFloor = ERA_TEAM_REB_FLOOR[simEra2] * (0.82 + rng() * 0.18);
    const astFloor = ERA_TEAM_AST_FLOOR[simEra2] * (0.82 + rng() * 0.18);
    if (teamREB < rebFloor) {
      const scale = rebFloor / teamREB;
      for (const s of seasonStats)
        s.REB *= scale;
    }
    if (teamAST < astFloor) {
      const scale = astFloor / teamAST;
      for (const s of seasonStats)
        s.AST *= scale;
    }
    const blkScore = calcBlkScore(entries);
    return {
      wins,
      losses: seasonGames - wins,
      games,
      seasonStats,
      avgTeamScore,
      avgOppScore,
      teamAnalysis: { spacingWinFactor, shooterCount, spacingBaseline, isPreThreePt, highVolumeShooterCount, rebFactor, blkScore, astFactor }
    };
  }
  var ALL_ERAS = ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"];
  var SLOT_POSITIONS = ["PG", "SG", "SF", "PF", "C", "B1", "B2", "B3", "B4"];
  var PLAYOFF_ROUND_NAMES = ["First Round", "Semifinals", "Conference Finals", "NBA Finals"];
  function firstRoundWinsNeeded(simEra2) {
    if (["50s", "60s", "70s"].includes(simEra2))
      return 2;
    if (["80s", "90s"].includes(simEra2))
      return 3;
    return 4;
  }
  function firstRoundLabel(simEra2) {
    const w = firstRoundWinsNeeded(simEra2);
    return w === 2 ? "Best of 3" : w === 3 ? "Best of 5" : "Best of 7";
  }
  function playoffOppRating(round, teamWins, teamRaw, simEra2, difficultyMod = 1) {
    const idx = round - 1;
    const winsBase = teamWins >= 60 ? [45, 49, 53, 52][idx] : teamWins >= 53 ? [46, 50, 53, 53][idx] : teamWins >= 47 ? [48, 51, 53, 53][idx] : [50, 52, 53, 55][idx];
    const baseRating = round === 4 ? Math.max(winsBase, Math.round(teamRaw * 0.88)) : winsBase;
    const eraDifficulty = ERA_DIFFICULTY[simEra2] ?? 1;
    const offRating = Math.round(baseRating * eraDifficulty * difficultyMod);
    const defFactor = [1, 0.97, 0.94, 0.89][idx];
    return { offRating, defFactor };
  }
  function simulatePlayoffs(rawRating, playerRatings, regularSeasonWins, coachDefGrade2, coachOffGrade2, simEra2, coachDefBonus, coachOffBonus, difficultyMod) {
    const OPP_SPREAD = 3;
    const GAME_NOISE = 5;
    const entries = playerRatings.map((pr) => {
      const isStarter = STARTER_SLOTS.includes(pr.slot);
      const assignedMPG = SLOT_MPG[pr.slot];
      const minScale = assignedMPG / (isStarter ? STARTER_BASELINE_MPG : BENCH_BASELINE_MPG);
      return { pr, assignedMPG, minScale };
    });
    const playerDefFactor = calcPlayerDefFactor(entries, simEra2);
    const rebFactor = calcRebFactor(entries, simEra2);
    const astFactor = calcAstFactor(entries);
    const defBonus = coachDefBonus ?? coachBonus(coachDefGrade2);
    const offBonus = coachOffBonus ?? coachBonus(coachOffGrade2);
    const rebWinFactor = 1 + (rebFactor - 1) * 0.5;
    const astWinFactor = 1 + (astFactor - 1) * 0.5;
    const rebOppFactor = 1 - (rebFactor - 1) * 0.25;
    const shooterCount = entries.reduce((s, e) => {
      const w = spacingSlotWeight(e.pr.slot, simEra2);
      const f = e.pr.player.FG3_PCT ?? 0;
      const fg3m = e.pr.player.FG3M ?? 0;
      if (fg3m < 0.5)
        return s;
      const ssm = e.pr.player.shootingStar ? e.pr.player.shootingStarTier === 1 ? 2.2 : 1.6 : 1;
      return s + (f >= 0.4 ? e.minScale * 1.25 : f >= 0.37 ? e.minScale * 1.12 : f >= 0.34 ? e.minScale : f >= 0.3 ? e.minScale * 0.5 : f >= 0.25 ? e.minScale * 0.25 : 0) * w * ssm;
    }, 0);
    const highVolumeShooterCountPO = entries.reduce((s, e) => {
      const w = spacingSlotWeight(e.pr.slot, simEra2);
      return s + ((e.pr.player.FG3M ?? 0) >= 2.9 ? e.minScale * w : 0);
    }, 0);
    const isPreThreePtPO = simEra2 === "50s" || simEra2 === "60s" || simEra2 === "70s";
    const spacingBaselinePO = simEra2 === "20s" ? 6 : simEra2 === "10s" ? 5 : simEra2 === "00s" ? 4 : simEra2 === "90s" ? 3 : simEra2 === "80s" ? 2 : 0;
    const spacingDevPO = isPreThreePtPO ? -highVolumeShooterCountPO : shooterCount - spacingBaselinePO;
    const spacingPerShooterPO = spacingDevPO < 0 ? isPreThreePtPO ? 0.035 : simEra2 === "20s" || simEra2 === "10s" ? 0.05 : simEra2 === "00s" ? 0.05 : simEra2 === "90s" ? 0.035 : 0.015 : simEra2 === "20s" || simEra2 === "10s" ? 0.022 : simEra2 === "00s" ? 0.014 : 9e-3;
    const spacingCapNegPO = isPreThreePtPO ? 0.15 : simEra2 === "20s" ? 0.25 : simEra2 === "10s" ? 0.2 : simEra2 === "00s" ? 0.14 : simEra2 === "90s" ? 0.1 : 0.06;
    const spacingCapPosPO = simEra2 === "20s" ? 0.2 : simEra2 === "10s" ? 0.16 : simEra2 === "00s" ? 0.12 : simEra2 === "90s" ? 0.08 : 0.06;
    const spacingWinFactor = Math.max(1 - spacingCapNegPO, Math.min(1 + spacingCapPosPO, 1 + spacingDevPO * spacingPerShooterPO));
    const totalAdjusted = entries.reduce((s, e) => s + e.pr.adjusted, 0);
    const avgRingBoost = totalAdjusted > 0 ? entries.reduce((s, e) => s + playoffRingBoost(e.pr.player.rings ?? 0) * e.pr.adjusted / totalAdjusted, 0) : 0;
    const effectiveRawRating = rawRating * (1 + avgRingBoost);
    const baseTeamScore = entries.reduce((s, e) => s + (e.pr.player.PTS ?? 0) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty), 0);
    const expectedTeamScore = Math.max(85, Math.min(138, baseTeamScore * (1 + avgRingBoost)));
    const poEraOppAvg = ERA_OPP_BASELINE[simEra2];
    const poExpectedOppScore = poEraOppAvg * playerDefFactor * (1 - defBonus * 0.5);
    const poScoringDiffRatio = expectedTeamScore / Math.max(1, poExpectedOppScore);
    const poScoringWinFactor = Math.max(0.93, Math.min(1.07, 1 + (poScoringDiffRatio - 1) * 0.25));
    const expPTS = entries.map((e) => (e.pr.player.PTS ?? 0) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty) * (1 + playoffRingBoost(e.pr.player.rings ?? 0) * 0.5));
    const expREB = entries.map((e) => (e.pr.player.REB ?? 0) * e.pr.eraMod * e.minScale * rebSlotMod(e.pr.slot) * (1 - e.pr.fitPenalty) * (1 + playoffRingBoost(e.pr.player.rings ?? 0) * 0.5));
    const expAST = entries.map((e) => (e.pr.player.AST ?? 0) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty) * (1 + playoffRingBoost(e.pr.player.rings ?? 0) * 0.5));
    const expSTL = entries.map((e) => imputeSTL(e.pr.player) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty));
    const expBLK = entries.map((e) => imputeBLK(e.pr.player) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty) * blkSlotMod(e.pr.slot));
    const expTOV = entries.map((e) => imputeTOV(e.pr.player) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty));
    const baseFG = entries.map((e) => Math.min(0.75, Math.max(0.25, (e.pr.player.FG_PCT ?? 0.45) * (0.9 + e.pr.eraMod * 0.1))));
    const baseFG3 = entries.map((e) => PRE_THREE_PT_ERAS.includes(simEra2) ? null : e.pr.player.FG3_PCT ?? getEstimatedFG3PCT(e.pr.player, simEra2));
    const baseFT = entries.map((e) => Math.min(0.95, Math.max(0.35, e.pr.player.FT_PCT ?? 0.7)));
    const totalExpPTS = expPTS.reduce((a, b) => a + b, 0);
    const accumPTS = new Array(entries.length).fill(0);
    const accumREB = new Array(entries.length).fill(0);
    const accumAST = new Array(entries.length).fill(0);
    const finalsPTS = new Array(entries.length).fill(0);
    const finalsREB = new Array(entries.length).fill(0);
    const finalsAST = new Array(entries.length).fill(0);
    let finalsGames = 0;
    const rounds = [];
    const allGames = [];
    let champion = false;
    for (let r = 0; r < 4; r++) {
      const { offRating: oppMean, defFactor: roundDefFactor } = playoffOppRating(r + 1, regularSeasonWins, rawRating, simEra2, difficultyMod ?? 1);
      const winsNeeded = r === 0 ? firstRoundWinsNeeded(simEra2) : 4;
      let sW = 0, sL = 0;
      const isFinals = r === 3;
      const fmvpBoost = (count) => (count ?? 0) >= 3 ? 0.1 : (count ?? 0) >= 1 ? 0.05 : 0;
      const avgFinalsMVPBoost = isFinals && totalAdjusted > 0 ? entries.reduce((s, e) => s + fmvpBoost(e.pr.player.finalsMVP) * e.pr.adjusted / totalAdjusted, 0) : 0;
      const finalsEffectiveRating = effectiveRawRating * (1 + avgFinalsMVPBoost);
      while (sW < winsNeeded && sL < winsNeeded) {
        const gameInSeries = sW + sL + 1;
        const totalRings = entries.reduce((s, e) => s + (e.pr.player.rings ?? 0), 0);
        const specialChance = Math.min(0.15 + totalRings * 0.01, 0.25);
        const specialTrigger = rng() < specialChance;
        const specialBoost = specialTrigger ? 2 + rng() * 4 : 0;
        const oppRating = oppMean * playerDefFactor * (1 - defBonus) + randn() * OPP_SPREAD;
        const win = finalsEffectiveRating * (1 + offBonus) * roundDefFactor * rebWinFactor * astWinFactor * spacingWinFactor * poScoringWinFactor + specialBoost + randn() * GAME_NOISE > oppRating * rebOppFactor + randn() * GAME_NOISE;
        const { teamScore, oppScore } = generateGameScore(expectedTeamScore, playerDefFactor, rebFactor, astFactor, defBonus, offBonus, win, simEra2, spacingWinFactor);
        const fmvpMult = (i) => isFinals ? 1 + fmvpBoost(entries[i].pr.player.finalsMVP) : 1;
        const gamePTS = expPTS.map((e, i) => Math.max(0, e * fmvpMult(i) * (0.6 + rng() * 0.8)));
        const gameREB = expREB.map((e, i) => Math.min(28, Math.max(0, Math.round(e * fmvpMult(i) * (0.6 + rng() * 0.8)))));
        const gameAST = expAST.map((e, i) => Math.min(20, Math.max(0, Math.round(e * fmvpMult(i) * (0.6 + rng() * 0.8)))));
        const rawGameAST = gameAST.reduce((s, a) => s + a, 0);
        const gameAstCap = teamScore / 2.2 * 0.65;
        if (rawGameAST > gameAstCap) {
          const scale = gameAstCap / rawGameAST;
          for (let i = 0; i < gameAST.length; i++)
            gameAST[i] = Math.max(0, Math.round(gameAST[i] * scale));
        }
        const gameSTL = expSTL.map((e) => +Math.max(0, e * (0.6 + rng() * 0.8)).toFixed(1));
        const gameBLK = expBLK.map((e) => +Math.max(0, e * (0.6 + rng() * 0.8)).toFixed(1));
        const gameTOV = expTOV.map((e) => +Math.max(0, e * (0.6 + rng() * 0.8)).toFixed(1));
        const lossPenalty = win ? 0 : 0.03;
        const gameFG = baseFG.map((b) => +Math.min(0.8, Math.max(0.2, b - lossPenalty + (rng() - 0.5) * 0.14)).toFixed(3));
        const gameFG3 = baseFG3.map((b) => b == null ? null : +Math.min(0.7, Math.max(0.1, b - lossPenalty + (rng() - 0.5) * 0.18)).toFixed(3));
        const gameFT = baseFT.map((b) => +Math.min(0.99, Math.max(0.3, b - (win ? 0 : 0.02) + (rng() - 0.5) * 0.12)).toFixed(3));
        const rawPTSTotal = gamePTS.reduce((a, b) => a + b, 0);
        const gamePTSAdj = gamePTS.map((p, i) => p + entries[i].assignedMPG * 0.08);
        const rawPTSTotalAdj = gamePTSAdj.reduce((a, b) => a + b, 0);
        const scaledPTS = gamePTSAdj.map((p) => Math.max(0, Math.round(p / rawPTSTotalAdj * teamScore)));
        let special;
        if (specialTrigger && entries.length > 0) {
          const ringWeights = entries.map((e) => e.pr.adjusted * (1 + (e.pr.player.rings ?? 0) * 0.2));
          const totalRingWeighted = ringWeights.reduce((s, w) => s + w, 0);
          let roll = rng() * totalRingWeighted;
          let starIdx = 0;
          for (let i = 0; i < entries.length; i++) {
            roll -= ringWeights[i];
            if (roll <= 0) {
              starIdx = i;
              break;
            }
          }
          const boostFactor = 1.6 + rng() * 0.9;
          const maxSpecialPTS = simEra2 === "50s" || simEra2 === "60s" ? 85 : 72;
          scaledPTS[starIdx] = Math.min(maxSpecialPTS, Math.round(scaledPTS[starIdx] * boostFactor));
          const maxSpecialREB = simEra2 === "50s" || simEra2 === "60s" || simEra2 === "70s" ? 35 : 22;
          gameREB[starIdx] = Math.min(maxSpecialREB, Math.round(gameREB[starIdx] * boostFactor));
          gameAST[starIdx] = Math.min(25, Math.round(gameAST[starIdx] * boostFactor));
          const capLimit = ERA_SCORE_CAP[simEra2];
          const boostedTotal = scaledPTS.reduce((a, b) => a + b, 0);
          if (boostedTotal > capLimit) {
            const excess = boostedTotal - capLimit;
            const nonStarTotal = scaledPTS.reduce((s, p, i) => i === starIdx ? s : s + p, 0);
            if (nonStarTotal > 0) {
              scaledPTS.forEach((_, i) => {
                if (i !== starIdx)
                  scaledPTS[i] = Math.max(0, Math.round(scaledPTS[i] - excess * (scaledPTS[i] / nonStarTotal)));
              });
            }
          }
          const sp = scaledPTS[starIdx], sr = gameREB[starIdx], sa = gameAST[starIdx];
          const isBench = entries[starIdx].pr.slot.startsWith("B");
          if (sp <= 25 && !isBench && sr < 10 && sa < 10) {
          } else {
            const label = sp >= 45 ? `${sp}-point scoring eruption` : sp >= 10 && sr >= 10 && sa >= 10 ? `Triple-double: ${sp}/${sr}/${sa}` : sp >= 35 ? `${sp}-point scoring takeover` : sr >= 18 ? `${sp}pts/${sr}reb dominant` : sa >= 14 ? `${sp}pts/${sa}ast playmaking` : isBench ? `${sp}-point showcase off the bench` : `${sp}-point showcase`;
            const starName = entries[starIdx].pr.player.full_name.split(" ").slice(-1)[0];
            special = { playerName: starName, pts: sp, reb: sr, ast: sa, label };
          }
        }
        const maxPTS = Math.max(...scaledPTS);
        const maxREB = Math.max(...gameREB);
        const maxAST = Math.max(...gameAST);
        const ptsIdx = scaledPTS.indexOf(maxPTS);
        const rebIdx = gameREB.indexOf(maxREB);
        const astIdx = gameAST.indexOf(maxAST);
        const lastName = (i) => entries[i].pr.player.full_name.split(" ").slice(-1)[0];
        const leaders = {
          pts: { name: lastName(ptsIdx), val: maxPTS },
          reb: { name: lastName(rebIdx), val: maxREB },
          ast: { name: lastName(astIdx), val: maxAST }
        };
        for (let i = 0; i < entries.length; i++) {
          accumPTS[i] += scaledPTS[i];
          accumREB[i] += gameREB[i];
          accumAST[i] += gameAST[i];
          if (r === 3) {
            finalsPTS[i] += scaledPTS[i];
            finalsREB[i] += gameREB[i];
            finalsAST[i] += gameAST[i];
          }
        }
        if (r === 3)
          finalsGames++;
        const playerLines = entries.map((e, i) => ({
          personId: e.pr.player.person_id,
          name: e.pr.player.full_name,
          slot: e.pr.slot,
          mpg: Math.round(e.assignedMPG),
          pts: scaledPTS[i],
          reb: gameREB[i],
          ast: gameAST[i],
          stl: gameSTL[i],
          blk: gameBLK[i],
          tov: gameTOV[i],
          fg: gameFG[i],
          fg3: gameFG3[i],
          ft: gameFT[i]
        }));
        const displayTeamScore = scaledPTS.reduce((a, b) => a + b, 0);
        let displayOppScore = !win && oppScore <= displayTeamScore ? displayTeamScore + 2 + Math.round(Math.abs(randn()) * 5) : oppScore;
        if (win && displayTeamScore <= displayOppScore)
          displayOppScore = displayTeamScore - 1;
        if (win)
          sW++;
        else
          sL++;
        allGames.push({ win, roundIndex: r, teamScore: displayTeamScore, oppScore: displayOppScore, gameInSeries, leaders, special, playerLines });
      }
      const advanced = sW === winsNeeded;
      rounds.push({ name: PLAYOFF_ROUND_NAMES[r], seriesWins: sW, seriesLosses: sL, advanced, winsNeeded });
      if (!advanced)
        break;
      if (r === 3)
        champion = true;
    }
    const numGames = allGames.length;
    const avgPlayoffTeamScore = numGames > 0 ? allGames.reduce((s, g) => s + g.teamScore, 0) / numGames : 0;
    const stlBlkTov = entries.map(({ pr, minScale }) => {
      const s = pr.eraMod * minScale * (1 - pr.fitPenalty);
      return { STL: imputeSTL(pr.player) * s, BLK: imputeBLK(pr.player) * s * blkSlotMod(pr.slot), TOV: imputeTOV(pr.player) * s };
    });
    const pShooterCount = entries.filter((e) => (e.pr.player.FG3_PCT ?? 0) >= 0.36).length;
    const pSpacingMod = (pShooterCount - 2) * 6e-3;
    const pTopAST = Math.max(...entries.map((e) => e.pr.player.AST ?? 0));
    const pPlaymakingMod = Math.min(0.018, Math.max(-0.012, (pTopAST - 5) * 3e-3));
    const pTeamQualityMod = (rawRating - 40) * 8e-4;
    const playoffStats = entries.map(({ pr, assignedMPG }, i) => {
      const effBoost = playoffRingBoost(pr.player.rings ?? 0) * 0.5;
      const naturalMPG = Math.min(38, Math.max(10, (pr.player.PTS ?? 0) * 1.6));
      const stretchMax = Math.max(0, (assignedMPG - naturalMPG) / 28) * 0.06;
      const stretchPenalty = stretchMax > 0 ? -(stretchMax * rng()) : 0;
      const fgCtx = pSpacingMod + pPlaymakingMod + pTeamQualityMod + stretchPenalty;
      const fg3Ctx = pPlaymakingMod + pTeamQualityMod + stretchPenalty;
      const ftCtx = stretchPenalty * 0.4;
      return {
        player: pr.player,
        slot: pr.slot,
        GP: numGames,
        MPG: assignedMPG,
        PTS: numGames > 0 ? accumPTS[i] / numGames : 0,
        REB: numGames > 0 ? accumREB[i] / numGames : 0,
        AST: numGames > 0 ? accumAST[i] / numGames : 0,
        STL: stlBlkTov[i].STL,
        BLK: stlBlkTov[i].BLK,
        TOV: stlBlkTov[i].TOV,
        FG_PCT: Math.min(0.8, Math.max(0.2, (pr.player.FG_PCT ?? 0.45) + effBoost + fgCtx + effNoise(0.035))),
        FG3_PCT: PRE_THREE_PT_ERAS.includes(simEra2) ? null : pr.player.FG3_PCT != null ? Math.min(0.6, Math.max(0.2, pr.player.FG3_PCT + effBoost + fg3Ctx + effNoise(0.03))) : (() => {
          const b = getEstimatedFG3PCT(pr.player, simEra2);
          return b != null ? Math.min(0.55, Math.max(0.18, b + effBoost + fg3Ctx + effNoise(0.03))) : null;
        })(),
        FT_PCT: Math.min(0.99, Math.max(0.3, (pr.player.FT_PCT ?? 0.7) + effBoost + ftCtx + effNoise(0.035)))
      };
    });
    const finalsStats = entries.map(({ pr, assignedMPG }, i) => {
      const effBoost = playoffRingBoost(pr.player.rings ?? 0) * 0.5;
      const naturalMPG = Math.min(38, Math.max(10, (pr.player.PTS ?? 0) * 1.6));
      const stretchMax = Math.max(0, (assignedMPG - naturalMPG) / 28) * 0.06;
      const stretchPenalty = stretchMax > 0 ? -(stretchMax * rng()) : 0;
      const fgCtx = pSpacingMod + pPlaymakingMod + pTeamQualityMod + stretchPenalty;
      const ftCtx = stretchPenalty * 0.4;
      return {
        player: pr.player,
        slot: pr.slot,
        GP: finalsGames,
        MPG: assignedMPG,
        PTS: finalsGames > 0 ? finalsPTS[i] / finalsGames : 0,
        REB: finalsGames > 0 ? finalsREB[i] / finalsGames : 0,
        AST: finalsGames > 0 ? finalsAST[i] / finalsGames : 0,
        STL: stlBlkTov[i].STL,
        BLK: stlBlkTov[i].BLK,
        TOV: stlBlkTov[i].TOV,
        FG_PCT: Math.min(0.8, Math.max(0.2, (pr.player.FG_PCT ?? 0.45) + effBoost + fgCtx + effNoise(0.035))),
        FG3_PCT: PRE_THREE_PT_ERAS.includes(simEra2) ? null : pr.player.FG3_PCT != null ? Math.min(0.6, Math.max(0.15, pr.player.FG3_PCT + effBoost + fgCtx + effNoise(0.03))) : (() => {
          const b = getEstimatedFG3PCT(pr.player, simEra2);
          return b != null ? Math.min(0.55, Math.max(0.15, b + effBoost + fgCtx + effNoise(0.03))) : null;
        })(),
        FT_PCT: Math.min(0.99, Math.max(0.3, (pr.player.FT_PCT ?? 0.7) + effBoost + ftCtx + effNoise(0.035)))
      };
    });
    return { rounds, champion, allGames, playoffStats, finalsStats };
  }

  // lib/achievements.ts
  var DEFS = [
    {
      id: "first_ring",
      title: "First Ring",
      description: "Win your first championship.",
      rarity: "common",
      check: (n, c) => n.championshipsTotal >= 1 || c.championshipsTotal >= 1
    },
    {
      id: "dynasty",
      title: "Dynasty",
      description: "Win 5 championships.",
      rarity: "rare",
      check: (n, c) => n.championshipsTotal + c.championshipsTotal >= 5
    },
    {
      id: "legend",
      title: "Legend",
      description: "Win 20 championships.",
      rarity: "epic",
      check: (n, c) => n.championshipsTotal + c.championshipsTotal >= 20
    },
    {
      id: "goat",
      title: "GOAT",
      description: "Win 50 championships.",
      rarity: "legendary",
      check: (n, c) => n.championshipsTotal + c.championshipsTotal >= 50
    },
    {
      id: "historian",
      title: "Historian",
      description: "Complete 30 drafts.",
      rarity: "common",
      check: (n, c) => n.draftsCompleted + c.draftsCompleted >= 30
    },
    {
      id: "veteran",
      title: "EraBall Veteran",
      description: "Complete 100 drafts.",
      rarity: "rare",
      check: (n, c) => n.draftsCompleted + c.draftsCompleted >= 100
    },
    {
      id: "old_school",
      title: "Old, Old School",
      description: "Win a championship in the 50s era.",
      rarity: "rare",
      check: (n, c) => (n.championshipsByEra?.["50s"] ?? 0) + (c.championshipsByEra?.["50s"] ?? 0) >= 1
    },
    {
      id: "all_era",
      title: "All-Time Ruler",
      description: "Win a championship in every era.",
      rarity: "legendary",
      check: (n, c) => ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"].every(
        (e) => (n.championshipsByEra?.[e] ?? 0) + (c.championshipsByEra?.[e] ?? 0) >= 1
      )
    },
    {
      id: "dominant",
      title: "Warriors who?",
      description: "Finish a regular season with 74 or more wins.",
      rarity: "rare",
      check: (n, c) => (n.bestRecord?.wins ?? 0) >= 75 || (c.bestRecord?.wins ?? 0) >= 74
    },
    {
      id: "seventy_two_zero",
      title: "72-0",
      description: "Go 72-0 in the regular season. (50s or 60s era.)",
      rarity: "epic",
      check: (_n, _c, run) => run.wins >= 72 && run.losses === 0 && run.wins < 82
    },
    {
      id: "perfect_season",
      title: "82-0",
      description: "Go 82-0 in the regular season.",
      rarity: "epic",
      check: (_n, _c, run) => run.wins >= 82 && run.losses === 0
    },
    {
      id: "perfect_season_cap",
      title: "82-0 (Cap)",
      description: "Go 82-0 in the regular season in Salary Cap mode.",
      rarity: "legendary",
      check: (_n, _c, run) => run.wins >= 82 && run.losses === 0 && run.mode === "salary_cap"
    },
    {
      id: "true_perfect",
      title: "Perfect Season",
      description: "Go undefeated in the regular season and win the championship.",
      rarity: "legendary",
      check: (_n, _c, run) => run.losses === 0 && run.champion
    },
    {
      id: "no_stars",
      title: "No Stars Needed",
      description: "Win a 20s era championship without an S-tier starter.",
      rarity: "epic",
      check: (_n, _c, run) => run.champion && run.era === "20s" && !run.hasSTierStarter
    },
    {
      id: "cap_champion",
      title: "Cap Champion",
      description: "Win a championship in Salary Cap Draft mode.",
      rarity: "rare",
      check: (_n, c) => c.championshipsTotal >= 1
    },
    {
      id: "loyal",
      title: "Loyal",
      description: "Draft the same player 10 times.",
      rarity: "common",
      check: (n, c) => Object.values(n.playerDraftCounts).some((p) => p.count >= 10) || Object.values(c.playerDraftCounts).some((p) => p.count >= 10)
    },
    {
      id: "rebuilder",
      title: "Rebuilder",
      description: "Win a championship with a team rating of 62 or under.",
      rarity: "legendary",
      check: (_n, _c, run) => run.champion && run.teamRating <= 62
    },
    {
      id: "loyal_coach",
      title: "Ride or Die",
      description: "Draft the same coach 10 times.",
      rarity: "common",
      check: (n, c) => Object.values(n.coachDraftCounts).some((p) => p.count >= 10) || Object.values(c.coachDraftCounts).some((p) => p.count >= 10)
    },
    {
      id: "cap_dynasty",
      title: "Cap Dynasty",
      description: "Win 5 championships in Salary Cap mode.",
      rarity: "epic",
      check: (_n, c) => c.championshipsTotal >= 5
    },
    {
      id: "era_traveler",
      title: "Era Traveler",
      description: "Spin every era at least once.",
      rarity: "common",
      check: (n, c) => ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"].every(
        (e) => (n.eraSpinCount?.[e] ?? 0) + (c.eraSpinCount?.[e] ?? 0) >= 1
      )
    },
    {
      id: "iron_man",
      title: "Iron Man",
      description: "Complete 250 drafts.",
      rarity: "rare",
      check: (n, c) => n.draftsCompleted + c.draftsCompleted >= 250
    },
    {
      id: "lifer",
      title: "Lifer",
      description: "Complete 500 drafts.",
      rarity: "epic",
      check: (n, c) => n.draftsCompleted + c.draftsCompleted >= 500
    },
    {
      id: "built_different",
      title: "Built Different",
      description: "Win a championship with a team rating of 80 or higher.",
      rarity: "legendary",
      check: (_n, _c, run) => run.champion && run.teamRating >= 80
    },
    {
      id: "bad_coach",
      title: "Bad Coach, Good Team",
      description: "Win a championship with a D-grade coach.",
      rarity: "epic",
      check: (_n, _c, run) => run.champion && run.coachGrade.startsWith("D")
    },
    {
      id: "hof_staff",
      title: "Hall of Fame Staff",
      description: "Win a championship with an A-grade coach.",
      rarity: "common",
      check: (_n, _c, run) => run.champion && run.coachGrade === "A"
    },
    {
      id: "miracle_worker",
      title: "Miracle Worker",
      description: "Win a championship with an F-grade coach.",
      rarity: "legendary",
      check: (_n, _c, run) => run.champion && run.coachGrade === "F"
    },
    {
      id: "obsessed",
      title: "Obsessed",
      description: "Complete 1,000 drafts.",
      rarity: "legendary",
      check: (n, c) => n.draftsCompleted + c.draftsCompleted >= 1e3
    },
    {
      id: "warming_up",
      title: "Warming Up",
      description: "Complete your first 10 drafts.",
      rarity: "common",
      check: (n, c) => n.draftsCompleted + c.draftsCompleted >= 10
    },
    {
      id: "dynamic_duo",
      title: "Dynamic Duo",
      description: "Draft two players with an active dynamic duo.",
      rarity: "rare",
      check: (_n, _c, run) => run.duo_pair === true
    },
    {
      id: "big_three",
      title: "Big Three",
      description: "Draft three players with connected dynamic duos.",
      rarity: "epic",
      check: (_n, _c, run) => run.duo_trio === true
    },
    {
      id: "brother_duo",
      title: "Brotherly Love",
      description: "Draft a brother dynamic duo.",
      rarity: "rare",
      check: (_n, _c, run) => run.brotherDuo === true
    },
    {
      id: "brother_duo_champion",
      title: "Band of Brothers",
      description: "Win a championship with a brother dynamic duo.",
      rarity: "legendary",
      check: (_n, _c, run) => !!run.champion && run.brotherDuo === true
    },
    {
      id: "father_son_duo",
      title: "Like Father, Like Son",
      description: "Draft a father and son dynamic duo.",
      rarity: "rare",
      check: (_n, _c, run) => run.fatherSonDuo === true
    },
    {
      id: "father_son_champion",
      title: "Dynasty Bloodline",
      description: "Win a championship with a father and son dynamic duo.",
      rarity: "legendary",
      check: (_n, _c, run) => !!run.champion && run.fatherSonDuo === true
    },
    {
      id: "family_ties",
      title: "Family Ties",
      description: "Win a championship with any brother pair and any father-son pair both active in the same run.",
      rarity: "legendary",
      check: (_n, _c, run) => !!run.champion && !!run.brotherDuo && !!run.fatherSonDuo
    },
    {
      id: "full_family",
      title: "Full Family",
      description: "Win a championship with all three members of the same family.",
      rarity: "legendary",
      check: (_n, _c, run) => !!run.champion && !!run.fullFamilyTrio
    },
    {
      id: "franchise_player",
      title: "Franchise Player",
      description: "Have one player appear in the Top 50 on any leaderboard 5 times across your career.",
      rarity: "legendary",
      check: (n, c) => Object.values(n.playerLeaderboardCounts ?? {}).some((e) => e.top50 >= 5) || Object.values(c.playerLeaderboardCounts ?? {}).some((e) => e.top50 >= 5)
    },
    {
      id: "favorite_son",
      title: "Favorite Son",
      description: "Draft the same player 40 times.",
      rarity: "epic",
      check: (n, c) => Object.values(n.playerDraftCounts).some((p) => p.count >= 40) || Object.values(c.playerDraftCounts).some((p) => p.count >= 40)
    },
    {
      id: "bench_loyalty",
      title: "Bench Loyalty",
      description: "Draft the same player to the bench 20 times.",
      rarity: "rare",
      check: (n, c) => Object.values(n.playerBenchCounts ?? {}).some((p) => p.count >= 20) || Object.values(c.playerBenchCounts ?? {}).some((p) => p.count >= 20)
    },
    {
      id: "sixth_man_champion",
      title: "Sixth Man Champion",
      description: "Win a championship with a Sixth Man tagged player on the bench.",
      rarity: "epic",
      check: (_n, _c, run) => !!run.champion && !!run.sixth_man_bench
    },
    {
      id: "board_room",
      title: "Board Room",
      description: "Have 2 or more Glass Cleaners on one roster.",
      rarity: "rare",
      check: (_n, _c, run) => (run.glassCleanerCount ?? 0) >= 2
    },
    {
      id: "splash_factory",
      title: "Splash Factory",
      description: "Have 3 or more Shooting Stars on one roster.",
      rarity: "epic",
      check: (_n, _c, run) => (run.shootingStarCount ?? 0) >= 3
    },
    {
      id: "first_submission",
      title: "First Entry",
      description: "Submit to the leaderboard for the first time.",
      rarity: "common",
      check: (_n, _c, run) => run.leaderboardRank != null
    },
    {
      id: "top_200",
      title: "Making Moves",
      description: "Finish top 200 on any leaderboard.",
      rarity: "common",
      check: (_n, _c, run) => (run.leaderboardRank ?? Infinity) <= 200
    },
    {
      id: "top_50",
      title: "On The Board",
      description: "Finish top 50 on any leaderboard.",
      rarity: "rare",
      check: (_n, _c, run) => (run.leaderboardRank ?? Infinity) <= 50
    },
    {
      id: "top_10",
      title: "Top 10",
      description: "Finish top 10 on any leaderboard.",
      rarity: "epic",
      check: (_n, _c, run) => (run.leaderboardRank ?? Infinity) <= 10
    },
    {
      id: "top_3",
      title: "Podium",
      description: "Finish top 3 on any leaderboard.",
      rarity: "legendary",
      check: (_n, _c, run) => (run.leaderboardRank ?? Infinity) <= 3
    },
    {
      id: "number_one",
      title: "#1",
      description: "Reach #1 on any leaderboard.",
      rarity: "legendary",
      check: (_n, _c, run) => run.leaderboardRank === 1
    },
    {
      id: "undefeated_all_eras",
      title: "Untouchable",
      description: "Go undefeated in the regular season in every era.",
      rarity: "legendary",
      check: (n, c) => ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"].every(
        (e) => n.bestRecordByEra?.[e]?.losses === 0 && (n.bestRecordByEra?.[e]?.wins ?? 0) > 0 || c.bestRecordByEra?.[e]?.losses === 0 && (c.bestRecordByEra?.[e]?.wins ?? 0) > 0
      )
    }
  ];
  var ACHIEVEMENTS_KEY = "eraball_achievements";
  function getUnlocked() {
    try {
      return new Set(JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) ?? "[]"));
    } catch {
      return /* @__PURE__ */ new Set();
    }
  }
  function saveUnlocked(set) {
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...set]));
    } catch {
    }
  }
  function checkAchievements(normalStats, capStats, run) {
    const unlocked = getUnlocked();
    const newlyUnlocked = [];
    for (const def of DEFS) {
      if (!unlocked.has(def.id) && def.check(normalStats, capStats, run)) {
        unlocked.add(def.id);
        newlyUnlocked.push({ id: def.id, title: def.title, description: def.description, rarity: def.rarity });
      }
    }
    if (newlyUnlocked.length > 0)
      saveUnlocked(unlocked);
    return newlyUnlocked;
  }
  function getAllAchievements() {
    const unlocked = getUnlocked();
    return DEFS.map(({ id, title, description, rarity }) => ({
      achievement: { id, title, description, rarity },
      unlocked: unlocked.has(id)
    }));
  }

  // lib/lifetimeStats.ts
  var KEYS = {
    normal: "eraball_lifetime_stats",
    salary_cap: "eraball_lifetime_stats_cap"
  };
  function defaults() {
    return {
      draftsCompleted: 0,
      totalWins: 0,
      totalLosses: 0,
      championshipsTotal: 0,
      recordByEra: {},
      championshipsByEra: {},
      bestRecord: null,
      bestRecordByEra: {},
      worstRecord: null,
      worstRecordByEra: {},
      playerDraftCounts: {},
      playerChampionshipCounts: {},
      playerBenchCounts: {},
      playerLeaderboardCounts: {},
      coachDraftCounts: {},
      eraSpinCount: {},
      highestTeamRating: null
    };
  }
  function getLifetimeStats(mode = "normal") {
    try {
      const raw = localStorage.getItem(KEYS[mode]);
      if (!raw)
        return defaults();
      return { ...defaults(), ...JSON.parse(raw) };
    } catch {
      return defaults();
    }
  }
  function save(s, mode) {
    try {
      localStorage.setItem(KEYS[mode], JSON.stringify(s));
    } catch {
    }
  }
  function recordRunComplete(params) {
    const { era, wins, losses, champion, teamRating, starters, bench, coach, mode = "normal" } = params;
    const s = getLifetimeStats(mode);
    const allPlayers = [...starters, ...bench];
    s.draftsCompleted++;
    s.totalWins += wins;
    s.totalLosses += losses;
    s.eraSpinCount[era] = (s.eraSpinCount[era] ?? 0) + 1;
    if (champion) {
      s.championshipsTotal++;
      s.championshipsByEra[era] = (s.championshipsByEra[era] ?? 0) + 1;
      for (const p of allPlayers) {
        const e = s.playerChampionshipCounts[p.personId] ?? { name: p.name, count: 0 };
        e.count++;
        s.playerChampionshipCounts[p.personId] = e;
      }
    }
    const eraRec = s.recordByEra[era] ?? { wins: 0, losses: 0 };
    eraRec.wins += wins;
    eraRec.losses += losses;
    s.recordByEra[era] = eraRec;
    if (!s.bestRecord || wins > s.bestRecord.wins)
      s.bestRecord = { wins, losses, era };
    const bestEra = s.bestRecordByEra[era];
    if (!bestEra || wins > bestEra.wins)
      s.bestRecordByEra[era] = { wins, losses };
    if (!s.worstRecord || losses > s.worstRecord.losses)
      s.worstRecord = { wins, losses, era };
    const worstEra = s.worstRecordByEra[era];
    if (!worstEra || losses > worstEra.losses)
      s.worstRecordByEra[era] = { wins, losses };
    if (!s.highestTeamRating || teamRating > s.highestTeamRating.rating)
      s.highestTeamRating = { rating: teamRating, era };
    for (const p of allPlayers) {
      const e = s.playerDraftCounts[p.personId] ?? { name: p.name, count: 0 };
      e.count++;
      s.playerDraftCounts[p.personId] = e;
    }
    for (const p of bench) {
      const e = s.playerBenchCounts[p.personId] ?? { name: p.name, count: 0 };
      e.count++;
      s.playerBenchCounts[p.personId] = e;
    }
    const existingCoach = s.coachDraftCounts[coach] ?? { name: coach, count: 0 };
    existingCoach.count++;
    s.coachDraftCounts[coach] = existingCoach;
    save(s, mode);
  }
  function clearLifetimeStats(mode = "normal") {
    try {
      localStorage.removeItem(KEYS[mode]);
    } catch {
    }
  }

  // ios/EngineSrc/engine-entry.ts
  if (typeof globalThis.console === "undefined") {
    const log = typeof globalThis.__nativeLog === "function" ? globalThis.__nativeLog : () => {
    };
    globalThis.console = { log, warn: log, error: log, info: log, debug: log };
  }
  if (typeof globalThis.localStorage === "undefined") {
    const native = globalThis.__nativeStorage;
    const mem = /* @__PURE__ */ new Map();
    globalThis.localStorage = native ? {
      getItem: (k) => {
        const v = native.getItem(k);
        return v == null ? null : String(v);
      },
      setItem: (k, v) => native.setItem(k, String(v)),
      removeItem: (k) => native.removeItem(k)
    } : {
      getItem: (k) => mem.has(k) ? mem.get(k) : null,
      setItem: (k, v) => {
        mem.set(k, String(v));
      },
      removeItem: (k) => {
        mem.delete(k);
      }
    };
  }
  var COACH_GURUS = {
    "Tom Thibodeau": { defGuru: true },
    "Hubie Brown": { offOverride: "C" },
    "Mike Fratello": { defGuru: true },
    "Dwane Casey": { defOverride: "B" },
    "Nate McMillan": { defOverride: "B" },
    "Jerry Sloan*": { defGuru: true },
    "Mike D'Antoni": { offGuru: true, defOverride: "D" },
    "Don Nelson*": { offGuru: true, defOverride: "C" },
    "Byron Scott": { defOverride: "C" },
    "Rick Carlisle": { offOverride: "B", defOverride: "B" },
    "George Karl*": { defOverride: "C" },
    "Phil Jackson*": { offGuru: true },
    "Danny Ainge": { defOverride: "B" },
    "Tex Winter": { offGuru: true },
    "Rick Adelman*": { offGuru: true },
    "Dick Motta": { defGuru: true },
    "Larry Brown*": { defGuru: true },
    "Chuck Daly*": { defGuru: true },
    "Jeff Van Gundy": { defGuru: true },
    "Gregg Popovich*": { offGuru: true, defGuru: true },
    "Erik Spoelstra": { offGuru: true, defGuru: true },
    "Pat Riley*": { offGuru: true, defGuru: true },
    "Red Auerbach*": { offGuru: true, defGuru: true },
    "Wes Unseld": { offOverride: "B", defOverride: "A" },
    "Wes Unseld Jr.": { offOverride: "B", defOverride: "A" },
    "Richie Guerin": { offOverride: "B", defOverride: "B" },
    "Cotton Fitzsimmons": { offOverride: "B", defOverride: "C" },
    "Michael Malone": { offOverride: "A", defOverride: "B" },
    "Stephen Silas": { offOverride: "F", defOverride: "F" },
    "Kenny Atkinson": { offOverride: "A", defOverride: "B" },
    "JJ Redick": { defOverride: "B" }
  };
  function parseCoachesCSV(text) {
    const lines = text.split("\n").filter((l) => l.trim());
    const dataLines = lines.slice(3);
    const coaches2 = [];
    for (const line of dataLines) {
      const cols = line.split(",");
      if (!cols[1]?.trim() || cols[1].trim() === "Coach")
        continue;
      const name = cols[1].trim();
      const from = parseInt(cols[2]) || 0;
      const to = parseInt(cols[3]) || 0;
      const regW = parseInt(cols[6]) || 0;
      const regL = parseInt(cols[7]) || 0;
      const regWLPct = parseFloat(cols[8]) || 0;
      const playoffG = parseInt(cols[10]) || 0;
      const playoffW = parseInt(cols[11]) || 0;
      const playoffL = parseInt(cols[12]) || 0;
      const playoffWLPct = parseFloat(cols[13]) || 0;
      const conf = parseInt(cols[14]) || 0;
      const champ = parseInt(cols[15]) || 0;
      const guru = COACH_GURUS[name] ?? {};
      const regG = regW + regL;
      const isHOF = name.endsWith("*");
      const capF = (g) => regG > 200 && g === "F" ? "C" : g;
      const hofFloor = (g) => isHOF && (g === "C" || g === "D" || g === "F") ? "B" : g;
      const rawOffGrade = guru.offGuru ? "A" : guru.offOverride ?? (regWLPct >= 0.6 ? "A" : regWLPct >= 0.55 ? "B" : regWLPct >= 0.5 ? "C" : regWLPct >= 0.45 ? "D" : "F");
      const rawDefGrade = guru.defGuru ? "A" : guru.defOverride ?? (playoffG === 0 ? "C" : playoffWLPct >= 0.55 ? "A" : playoffWLPct >= 0.5 ? "B" : playoffWLPct >= 0.45 ? "C" : playoffWLPct >= 0.4 ? "D" : "F");
      const offGrade = guru.offGuru || guru.offOverride ? rawOffGrade : hofFloor(capF(rawOffGrade));
      const defGrade = guru.defGuru || guru.defOverride ? rawDefGrade : hofFloor(capF(rawDefGrade));
      const gradeN = (g) => ({ S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 })[g];
      const avg = (gradeN(offGrade) + gradeN(defGrade)) / 2;
      const overallGrade = avg >= 3.5 ? "A" : avg >= 2.5 ? "B" : avg >= 1.5 ? "C" : avg >= 0.5 ? "D" : "F";
      if (name && (regG >= 100 || champ > 0))
        coaches2.push({ name, from, to, years: to - from, regG, regW, regL, regWLPct, playoffG, playoffW, playoffL, playoffWLPct, conf, champ, offGrade, defGrade, overallGrade, offGuru: !!guru.offGuru, defGuru: !!guru.defGuru });
    }
    return coaches2;
  }
  var TEAM_ALIAS = { "SAN": "SAS" };
  var normalizeTeam = (t) => TEAM_ALIAS[t] ?? t;
  var tagPlayer = (p, era, team) => applyDuo(applyGlassCleaner(applyShootingStar(applyTimeless(applyFloorGeneral(applyAnchors(applyFinalsMVP(applySixthMan(applyRings(applyFlexTag(withEraStats(p, era, team)))))))))));
  function playerTeamForEra(player, era) {
    return player.teams_by_era?.[era] ?? player.team_abbreviation;
  }
  var GRADE_RANK = { S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 };
  function calcLeaderboardScore(entry, flags) {
    const playoffBonus = { champion: 500, finals: 350, conf_finals: 175, second_round: 75, first_round: 25 };
    const bonus = entry.playoff_result ? playoffBonus[entry.playoff_result] ?? 0 : 0;
    const coachNum = entry.coach_grade ? GRADE_RANK[entry.coach_grade] ?? 0 : 0;
    const isChampion = entry.playoff_result === "champion";
    let challengeBonus = 0;
    if (isChampion) {
      if (flags?.no_timeless)
        challengeBonus += 75;
      if (flags?.no_s_tier)
        challengeBonus += 225;
      if (flags?.bad_coach)
        challengeBonus += 75;
    }
    let teamBonus = 0;
    if (flags?.elite_spacing)
      teamBonus += 40;
    if (flags?.elite_rim)
      teamBonus += 50;
    if (flags?.elite_playmaking)
      teamBonus += 40;
    if (flags?.reb_edge)
      teamBonus += 25;
    if (flags?.duo_pair)
      teamBonus += 30;
    if (flags?.duo_trio)
      teamBonus += 65;
    if (flags?.sixth_man_bench)
      teamBonus += 20;
    return entry.reg_win_pct * 500 + entry.playoff_win_pct * 400 + entry.avg_pt_diff * 8 + entry.team_rating * 3 + coachNum * 20 + bonus + challengeBonus + teamBonus;
  }
  var DEFAULT_THRESHOLDS = {
    mvpWins: 50,
    mvpBase: 55,
    mvpPPG: 24,
    allNBAAdj: 50,
    allNBAPPG: 24,
    allStarAdj: 48,
    allStarGPPG: 20,
    allStarFPPG: 20,
    allStarCPPG: 18,
    dpoyBase: 50,
    dpoySTL: 1.5,
    dpoyBLK: 1.5,
    sixthManPPG: 14,
    sixthManAdj: 48
  };
  function computeSeasonAwards(seasonStats, playerRatings, wins, t) {
    const awards = [];
    const ratingMap = new Map(playerRatings.map((pr) => [pr.player.person_id, pr]));
    const rated = seasonStats.map((s) => ({ s, adj: ratingMap.get(s.player.person_id)?.adjusted ?? 0, base: ratingMap.get(s.player.person_id)?.base ?? 0 }));
    const starterSlots = ["PG", "SG", "SF", "PF", "C"];
    if (wins >= 78) {
      const topScorer = rated.filter(({ s }) => starterSlots.includes(s.slot) && s.PTS > 22).sort((a, b) => b.s.PTS - a.s.PTS)[0];
      if (topScorer)
        awards.push({ award: "League MVP", player: topScorer.s, justification: `${topScorer.s.PTS.toFixed(1)} PPG - ${topScorer.s.REB.toFixed(1)} RPG - ${topScorer.s.AST.toFixed(1)} APG`, gold: true });
    } else if (wins >= t.mvpWins) {
      const ratedStarters = rated.filter(({ s }) => starterSlots.includes(s.slot));
      const tdCandidate = ratedStarters.find(({ s }) => s.PTS > 20 && s.REB > 10 && s.AST > 10 || s.PTS > 20 && s.AST > 10 && s.REB > 7);
      const mvpCandidate = tdCandidate ?? ratedStarters.filter(({ s, base }) => base > t.mvpBase && s.PTS > t.mvpPPG).sort((a, b) => b.base - a.base)[0];
      if (mvpCandidate)
        awards.push({ award: "League MVP", player: mvpCandidate.s, justification: `${mvpCandidate.s.PTS.toFixed(1)} PPG - ${mvpCandidate.s.REB.toFixed(1)} RPG - ${mvpCandidate.s.AST.toFixed(1)} APG`, gold: true });
    }
    for (const pos of starterSlots) {
      const best = rated.filter(({ s, adj }) => s.slot === pos && adj > t.allNBAAdj && s.PTS > t.allNBAPPG).sort((a, b) => b.adj - a.adj)[0];
      if (best)
        awards.push({ award: `All-NBA - ${pos}`, player: best.s, justification: `${best.s.PTS.toFixed(1)} PPG - ${best.s.REB.toFixed(1)} RPG - ${best.s.AST.toFixed(1)} APG`, gold: false });
    }
    const seasonGames = seasonStats[0]?.GP ?? 82;
    const winPct = wins / seasonGames;
    const badTeam = winPct <= 0.35;
    const ppgFloor = (s) => {
      if (!s.slot.startsWith("B")) {
        const sl = s.slot;
        return sl === "PG" || sl === "SG" ? t.allStarGPPG : sl === "C" ? t.allStarCPPG : t.allStarFPPG;
      }
      const pos = (s.player.position ?? "").toUpperCase();
      if (pos.includes("CENTER"))
        return t.allStarCPPG;
      if (pos.includes("GUARD"))
        return t.allStarGPPG;
      return t.allStarFPPG;
    };
    for (const { s } of rated) {
      if (badTeam && s.PTS < 30 && s.REB < 20 && s.AST < 18)
        continue;
      if (s.REB >= 18) {
        awards.push({ award: "All-Star", player: s, justification: `${s.PTS.toFixed(1)} PPG - ${s.REB.toFixed(1)} REB`, gold: false });
        continue;
      }
      if (s.PTS <= ppgFloor(s))
        continue;
      const isCenter = s.slot === "C" || (!s.slot.startsWith("B") ? false : (s.player.position ?? "").toUpperCase().includes("CENTER"));
      if (isCenter && s.PTS < 20 && s.REB < 10)
        continue;
      if (s.REB <= 7 && s.AST <= 7 && s.STL <= 1.8 && s.BLK <= 1.8)
        continue;
      awards.push({ award: "All-Star", player: s, justification: `${s.PTS.toFixed(1)} PPG - ${s.REB.toFixed(1)} REB - ${s.AST.toFixed(1)} AST`, gold: false });
    }
    for (const { s } of rated) {
      if (s.PTS >= 30) {
        const already = awards.some((a) => a.award === "All-Star" && a.player.player.person_id === s.player.person_id);
        if (!already)
          awards.push({ award: "All-Star", player: s, justification: `${s.PTS.toFixed(1)} PPG`, gold: false });
      }
    }
    if (wins > 65) {
      const topScorer = [...rated].sort((a, b) => b.s.PTS - a.s.PTS)[0];
      const alreadyAllStar = awards.some((a) => a.award === "All-Star" && a.player.player.person_id === topScorer?.s.player.person_id);
      if (topScorer && !alreadyAllStar)
        awards.push({ award: "All-Star", player: topScorer.s, justification: `${topScorer.s.PTS.toFixed(1)} PPG - ${topScorer.s.REB.toFixed(1)} RPG - ${topScorer.s.AST.toFixed(1)} APG`, gold: false });
    }
    if (wins >= 67) {
      for (const { s } of rated) {
        const alreadyAllStar = awards.some((a) => a.award === "All-Star" && a.player.player.person_id === s.player.person_id);
        if (alreadyAllStar)
          continue;
        const qualifies = s.PTS >= 19 && (s.AST >= 5 || s.STL >= 5 || s.BLK >= 5) || s.PTS >= 18 && s.REB >= 10;
        if (qualifies)
          awards.push({ award: "All-Star", player: s, justification: `${s.PTS.toFixed(1)} PPG - ${s.REB.toFixed(1)} RPG - ${s.AST.toFixed(1)} APG`, gold: false });
      }
    }
    const dpoy = rated.filter(({ s, base }) => base > t.dpoyBase && (s.STL > t.dpoySTL && s.BLK > t.dpoyBLK || s.STL > 2.2 || s.BLK > 2.8 || s.BLK >= 2.5 && s.REB >= 12)).sort((a, b) => b.s.STL + b.s.BLK + b.s.REB * 0.15 - (a.s.STL + a.s.BLK + a.s.REB * 0.15))[0];
    if (dpoy) {
      const isBigManPath = dpoy.s.BLK >= 2.5 && dpoy.s.REB >= 12;
      awards.push({ award: "Defensive POY", player: dpoy.s, justification: isBigManPath ? `${dpoy.s.BLK.toFixed(1)} BLK - ${dpoy.s.REB.toFixed(1)} REB - ${dpoy.s.STL.toFixed(1)} STL` : `${dpoy.s.STL.toFixed(1)} STL - ${dpoy.s.BLK.toFixed(1)} BLK`, gold: false });
    }
    const benchSorted = rated.filter(({ s }) => s.slot.startsWith("B")).sort((a, b) => b.adj - a.adj);
    const sixthMan = benchSorted.slice(0, 2).find(({ s, adj }) => s.PTS > t.sixthManPPG && adj > t.sixthManAdj);
    if (sixthMan)
      awards.push({ award: "6th Man of the Year", player: sixthMan.s, justification: `${sixthMan.s.PTS.toFixed(1)} PPG - ${sixthMan.s.REB.toFixed(1)} RPG - ${sixthMan.s.AST.toFixed(1)} APG`, gold: false });
    return awards;
  }
  function computeFinalsMVP(finalsStats) {
    if (!finalsStats.length)
      return null;
    const sorted = [...finalsStats].sort((a, b) => b.PTS !== a.PTS ? b.PTS - a.PTS : b.AST - a.AST);
    const eligible = sorted.filter((s) => !s.slot.startsWith("B") || s.PTS >= 28 || s.REB >= 20);
    return eligible[0] ?? sorted[0];
  }
  var players = [];
  var coaches = [];
  var allTeamsCache = [];
  var validCombosCache = [];
  var simEra = "20s";
  var salaryCapMode = false;
  var slots = emptySlots();
  var draftedIds = /* @__PURE__ */ new Set();
  var poolCache = [];
  var currentCoach = null;
  var lastRatings = null;
  var lastSimRaw = 0;
  var lastSeason = null;
  var lastPlayoffs = null;
  function emptySlots() {
    return SLOT_POSITIONS.map((p) => ({ position: p, player: null, fitPenalty: 0, fitLabel: null }));
  }
  var capTier = (player) => playerTier(playerBaseRating({ ...player, duoActiveCount: 0, sixthManActive: false }, simEra));
  function tierCounts() {
    const counts = { s: 0, a: 0, b: 0, c: 0, d: 0 };
    for (const s of slots)
      if (s.player)
        counts[capTier(s.player)]++;
    return counts;
  }
  function neededTiers() {
    if (!salaryCapMode)
      return [];
    const counts = tierCounts();
    return Object.entries(CAP_QUOTAS).filter(([t, q]) => counts[t] < q).map(([t]) => t);
  }
  function activatedSlots() {
    return slots.map((slot) => {
      if (!slot.player)
        return slot;
      const isSixthMan = SIXTH_MAN_PLAYERS.has(slot.player.full_name);
      if (!slot.player.duoPartners && !isSixthMan)
        return slot;
      const duoActiveCount = slot.player.duoPartners ? slots.filter((s) => s !== slot && s.player && slot.player.duoPartners.includes(s.player.full_name)).length : slot.player.duoActiveCount ?? 0;
      const sixthManActive = isSixthMan && slot.position.startsWith("B");
      return { ...slot, player: { ...slot.player, duoActiveCount, sixthManActive } };
    });
  }
  function playerView(p) {
    const base = playerBaseRating({ ...p, duoActiveCount: 0, sixthManActive: false }, simEra);
    return {
      personId: String(p.person_id),
      fullName: p.full_name,
      position: p.position ?? "",
      height: p.height ?? "",
      weight: p.weight ?? "",
      fromYear: p.from_year ?? 0,
      toYear: p.to_year ?? null,
      era: p.era,
      team: p.eraTeam ?? p.team_abbreviation ?? "",
      GP: p.GP ?? 0,
      PTS: p.PTS ?? 0,
      REB: p.REB ?? 0,
      AST: p.AST ?? 0,
      STL: p.STL,
      BLK: p.BLK,
      TOV: p.TOV,
      FG_PCT: p.FG_PCT,
      FG3_PCT: p.FG3_PCT,
      FT_PCT: p.FT_PCT,
      TS_PCT: calcTS(p),
      base,
      tier: playerTier(base),
      greatest75: p.greatest_75_flag === "Y",
      timeless: !!p.timeless,
      offAnchor: !!p.offAnchor,
      defAnchor: !!p.defAnchor,
      anchorTier: p.anchorTier ?? 1,
      shootingStar: !!p.shootingStar,
      shootingStarTier: p.shootingStarTier ?? 1,
      glassClean: !!p.glassClean,
      floorGeneral: !!p.floorGeneral,
      flexPositions: p.flexPositions ?? null,
      rings: p.rings ?? 0,
      finalsMVP: p.finalsMVP ?? 0,
      sixthMan: SIXTH_MAN_PLAYERS.has(p.full_name),
      duoPartners: p.duoPartners ?? null,
      eraModifier: calcEraModifier(p, simEra)
    };
  }
  function slotView(s, idx) {
    return { index: idx, position: s.position, player: s.player ? playerView(s.player) : null, fitPenalty: s.fitPenalty, fitLabel: s.fitLabel };
  }
  function stateView() {
    return { era: simEra, salaryCapMode, slots: slots.map(slotView), filledCount: slots.filter((s) => s.player !== null).length, tierCounts: tierCounts(), neededTiers: neededTiers(), capQuotas: CAP_QUOTAS };
  }
  function coachView(c) {
    const draftedNames = new Set(slots.filter((s) => s.player).map((s) => s.player.full_name));
    const fpPlayers = FRANCHISE_PAIRS[c.name] ?? [];
    const franchisePair = fpPlayers.some((n) => draftedNames.has(n));
    return {
      name: c.name.replace("*", ""),
      rawName: c.name,
      hof: c.name.endsWith("*"),
      from: c.from,
      to: c.to,
      years: c.years,
      regW: c.regW,
      regL: c.regL,
      regWLPct: c.regWLPct,
      playoffW: c.playoffW,
      playoffL: c.playoffL,
      playoffWLPct: c.playoffWLPct,
      playoffG: c.playoffG,
      conf: c.conf,
      champ: c.champ,
      offGrade: c.offGrade,
      defGrade: c.defGrade,
      overallGrade: c.overallGrade,
      offGuru: !!c.offGuru,
      defGuru: !!c.defGuru,
      franchisePair,
      effOffGrade: franchisePair ? upgradeGrade(c.offGrade) : c.offGrade,
      effDefGrade: franchisePair ? upgradeGrade(c.defGrade) : c.defGrade
    };
  }
  function ratingView(pr) {
    return { personId: String(pr.player.person_id), name: pr.player.full_name, slot: pr.slot, base: pr.base, adjusted: pr.adjusted, fitPenalty: pr.fitPenalty, eraMod: pr.eraMod, fitLabel: pr.fitLabel };
  }
  function seasonStatView(s) {
    return { personId: String(s.player.person_id), name: s.player.full_name, slot: s.slot, GP: s.GP, MPG: s.MPG, PTS: s.PTS, REB: s.REB, AST: s.AST, STL: s.STL, BLK: s.BLK, TOV: s.TOV, FG_PCT: s.FG_PCT, FG3_PCT: s.FG3_PCT, FT_PCT: s.FT_PCT };
  }
  function computeDuoFlags(draftedPlayers) {
    const draftedNames = new Set(draftedPlayers.map((p) => p.full_name));
    const duoAdj = {};
    for (const p of draftedPlayers)
      if (p.duoPartners)
        duoAdj[p.full_name] = p.duoPartners.filter((n) => draftedNames.has(n));
    const duo_pair = draftedPlayers.some((p) => (duoAdj[p.full_name]?.length ?? 0) > 0);
    let duo_trio = false;
    if (duo_pair) {
      const visited = /* @__PURE__ */ new Set();
      for (const p of draftedPlayers) {
        if (visited.has(p.full_name) || !duoAdj[p.full_name]?.length)
          continue;
        const queue = [p.full_name];
        visited.add(p.full_name);
        let size = 0;
        while (queue.length) {
          const curr = queue.shift();
          size++;
          for (const nb of duoAdj[curr] ?? [])
            if (!visited.has(nb)) {
              visited.add(nb);
              queue.push(nb);
            }
        }
        if (size >= 3) {
          duo_trio = true;
          break;
        }
      }
    }
    return { duo_pair, duo_trio };
  }
  var BROTHER_PAIRS = [
    ["Stephen Curry", "Seth Curry"],
    ["Lonzo Ball", "LaMelo Ball"],
    ["Giannis Antetokounmpo", "Thanasis Antetokounmpo"],
    ["Giannis Antetokounmpo", "Kostas Antetokounmpo"],
    ["Pau Gasol", "Marc Gasol"],
    ["Brook Lopez", "Robin Lopez"]
  ];
  var api = {
    loadPlayers(json) {
      players = JSON.parse(json);
      const teams = /* @__PURE__ */ new Set();
      for (const p of players) {
        for (const teamList of Object.values(p.all_teams_by_era ?? {}))
          for (const t of teamList)
            if (t)
              teams.add(normalizeTeam(t));
        for (const t of Object.values(p.teams_by_era ?? {}))
          if (t)
            teams.add(normalizeTeam(t));
        if (p.team_abbreviation)
          teams.add(normalizeTeam(p.team_abbreviation));
      }
      allTeamsCache = Array.from(teams).sort();
      const seen = /* @__PURE__ */ new Set();
      const combos = [];
      for (const p of players) {
        const allTeamsByEra = p.all_teams_by_era;
        if (allTeamsByEra && Object.keys(allTeamsByEra).length > 0) {
          for (const [era, teamList] of Object.entries(allTeamsByEra))
            for (const team of teamList) {
              if (!team)
                continue;
              const nt = normalizeTeam(team);
              const key = `${nt}:${era}`;
              if (!seen.has(key)) {
                seen.add(key);
                combos.push({ team: nt, era });
              }
            }
        } else {
          for (const [era, team] of Object.entries(p.teams_by_era ?? {})) {
            if (!team)
              continue;
            const nt = normalizeTeam(team);
            const key = `${nt}:${era}`;
            if (!seen.has(key)) {
              seen.add(key);
              combos.push({ team: nt, era });
            }
          }
        }
      }
      validCombosCache = combos;
      return players.length;
    },
    loadCoaches(csv) {
      coaches = parseCoachesCSV(csv);
      return JSON.stringify(coaches.map(coachView));
    },
    allTeams() {
      return JSON.stringify(allTeamsCache);
    },
    startGame(era, capMode) {
      simEra = era;
      salaryCapMode = capMode;
      slots = emptySlots();
      draftedIds = /* @__PURE__ */ new Set();
      poolCache = [];
      currentCoach = null;
      lastRatings = null;
      lastSeason = null;
      lastPlayoffs = null;
      return JSON.stringify(stateView());
    },
    seasonGames(era) {
      return ERA_SEASON_GAMES[era];
    },
    firstRoundLabel(era) {
      return firstRoundLabel(era);
    },
    spin(eraFilterJSON) {
      const spinEraFilter = new Set(JSON.parse(eraFilterJSON));
      const spinShouldFilter = spinEraFilter.size < ALL_ERAS.length;
      const filteredCombos = spinShouldFilter ? validCombosCache.filter((c) => spinEraFilter.has(c.era)) : validCombosCache;
      if (filteredCombos.length === 0)
        return JSON.stringify({ noPlayers: true });
      const TIER_PRIORITY = ["s", "a", "b", "c", "d"];
      const ids = draftedIds;
      let { team, era } = filteredCombos[Math.floor(Math.random() * filteredCombos.length)];
      const currentNeededTiers = neededTiers();
      const getPool = (t, e) => players.filter((p) => {
        const eraTeams = p.all_teams_by_era?.[e];
        const onTeam = eraTeams ? eraTeams.map(normalizeTeam).includes(t) : normalizeTeam(playerTeamForEra(p, e)) === t;
        return onTeam && playerMatchesEra(p, e) && !ids.has(String(p.person_id));
      });
      if (salaryCapMode && currentNeededTiers.length > 0) {
        const highestNeeded = TIER_PRIORITY.find((t) => currentNeededTiers.includes(t));
        const shuffled = [...filteredCombos].sort(() => Math.random() - 0.5);
        const checkTier = (p, e, t) => playerTier(playerBaseRating({ ...applyAnchors(withEraStats(p, e, t)), duoActiveCount: 0, sixthManActive: false }, simEra));
        let found = false;
        for (const combo of shuffled) {
          const pool2 = getPool(combo.team, combo.era);
          if (pool2.length >= 3 && pool2.some((p) => checkTier(p, combo.era, combo.team) === highestNeeded)) {
            team = combo.team;
            era = combo.era;
            found = true;
            break;
          }
        }
        if (!found)
          for (const combo of shuffled) {
            const pool2 = getPool(combo.team, combo.era);
            if (pool2.length >= 3 && pool2.some((p) => currentNeededTiers.includes(checkTier(p, combo.era, combo.team)))) {
              team = combo.team;
              era = combo.era;
              break;
            }
          }
      }
      const pool = getPool(team, era);
      if (pool.length < 3)
        return JSON.stringify({ noPlayers: true, team, era });
      poolCache = [...pool].map((p) => tagPlayer(p, era, team)).sort((a, b) => (b.PTS ?? 0) - (a.PTS ?? 0));
      return JSON.stringify({ noPlayers: false, team, era, pool: poolCache.map(playerView) });
    },
    fitPreview(personId) {
      const p = poolCache.find((x) => String(x.person_id) === personId);
      if (!p)
        return JSON.stringify({});
      const out = {};
      for (const pos of SLOT_POSITIONS) {
        const { penalty, label } = calcFitPenalty(p, pos);
        out[pos] = { penalty, label };
      }
      return JSON.stringify(out);
    },
    assign(slotIndex, personId) {
      const selected = poolCache.find((x) => String(x.person_id) === personId);
      if (!selected || slotIndex < 0 || slotIndex >= slots.length || slots[slotIndex].player)
        return JSON.stringify({ ok: false, error: "Invalid pick." });
      if (salaryCapMode) {
        const tier = capTier(selected);
        const counts = tierCounts();
        if (counts[tier] >= CAP_QUOTAS[tier])
          return JSON.stringify({ ok: false, error: `${tier.toUpperCase()} tier is full (${CAP_QUOTAS[tier]}/${CAP_QUOTAS[tier]}). Pick a different player.` });
      }
      const { penalty, label } = calcFitPenalty(selected, slots[slotIndex].position);
      slots = slots.map((s, i) => i === slotIndex ? { ...s, player: selected, fitPenalty: penalty, fitLabel: label } : s);
      draftedIds = /* @__PURE__ */ new Set([...draftedIds, String(selected.person_id)]);
      poolCache = [];
      return JSON.stringify({ ok: true, state: stateView() });
    },
    remove(slotIndex) {
      const p = slots[slotIndex]?.player;
      if (p) {
        slots = slots.map((s, i) => i === slotIndex ? { ...s, player: null, fitPenalty: 0, fitLabel: null } : s);
        draftedIds.delete(String(p.person_id));
      }
      return JSON.stringify({ ok: true, state: stateView() });
    },
    swap(fromIdx, toIdx) {
      if (fromIdx !== toIdx) {
        const next = [...slots];
        const fp = next[fromIdx].player;
        const tp = next[toIdx].player;
        const a = fp ? calcFitPenalty(fp, next[toIdx].position) : { penalty: 0, label: null };
        const b = tp ? calcFitPenalty(tp, next[fromIdx].position) : { penalty: 0, label: null };
        next[toIdx] = { ...next[toIdx], player: fp, fitPenalty: a.penalty, fitLabel: a.label };
        next[fromIdx] = { ...next[fromIdx], player: tp, fitPenalty: b.penalty, fitLabel: b.label };
        slots = next;
      }
      return JSON.stringify({ ok: true, state: stateView() });
    },
    state() {
      return JSON.stringify(stateView());
    },
    eligibleCoaches() {
      const eligible = salaryCapMode ? coaches.filter((c) => GRADE_RANK[c.overallGrade] >= 2) : coaches;
      return JSON.stringify(eligible.map(coachView));
    },
    setCoach(rawName, from) {
      const c = coaches.find((x) => x.name === rawName && x.from === from) ?? coaches.find((x) => x.name === rawName);
      if (!c)
        return JSON.stringify({ ok: false });
      currentCoach = c;
      return JSON.stringify({ ok: true, coach: coachView(c) });
    },
    rateTeam() {
      if (!currentCoach)
        return JSON.stringify({ ok: false });
      const { teamRating: tr, rawRating, playerRatings: pr } = calcTeamRating(activatedSlots(), currentCoach, simEra);
      lastRatings = { teamRating: tr, rawRating, playerRatings: pr };
      lastSimRaw = rawRating * (1 + coachChampBonus(currentCoach));
      return JSON.stringify({ ok: true, teamRating: tr, displayRating: Math.round(tr + 15), rawRating, playerRatings: pr.map(ratingView) });
    },
    runSeason() {
      if (!currentCoach || !lastRatings)
        return JSON.stringify({ ok: false });
      const coach = currentCoach, pr = lastRatings.playerRatings;
      const result = simulateSeason(lastSimRaw, pr, coach.defGrade, coach.offGrade, simEra, effectiveCoachBonus(coach, "def"), effectiveCoachBonus(coach, "off"), salaryCapMode ? 0.9 : 1);
      lastSeason = result;
      const { stl, blk } = calcTeamDefTotals(pr);
      const rebEntries = pr.map((r) => ({ pr: r, minScale: SLOT_MPG[r.slot] / 35 }));
      const oppStats = genOppTeamStats(result.avgOppScore, simEra, stl, blk, calcRebFactor(rebEntries, simEra));
      const playoffThreshold = Math.ceil(ERA_SEASON_GAMES[simEra] / 2);
      const awards = computeSeasonAwards(result.seasonStats, pr, result.wins, DEFAULT_THRESHOLDS);
      return JSON.stringify({
        ok: true,
        wins: result.wins,
        losses: result.losses,
        games: result.games,
        seasonStats: result.seasonStats.map(seasonStatView),
        avgTeamScore: result.avgTeamScore,
        avgOppScore: result.avgOppScore,
        teamAnalysis: result.teamAnalysis,
        oppStats,
        madePlayoffs: result.wins >= playoffThreshold,
        playoffThreshold,
        awards: awards.map((a) => ({ award: a.award, gold: a.gold, justification: a.justification, player: seasonStatView(a.player) }))
      });
    },
    runPlayoffs() {
      if (!currentCoach || !lastRatings || !lastSeason)
        return JSON.stringify({ ok: false });
      const coach = currentCoach, pr = lastRatings.playerRatings;
      const result = simulatePlayoffs(lastSimRaw, pr, lastSeason.wins, coach.defGrade, coach.offGrade, simEra, effectiveCoachBonus(coach, "def"), effectiveCoachBonus(coach, "off"), salaryCapMode ? 0.9 : 1);
      lastPlayoffs = result;
      const poAvgOpp = result.allGames.reduce((s, g) => s + g.oppScore, 0) / Math.max(1, result.allGames.length);
      const { stl, blk } = calcTeamDefTotals(pr);
      const rebEntries = pr.map((r) => ({ pr: r, minScale: SLOT_MPG[r.slot] / 35 }));
      const oppStats = genOppTeamStats(poAvgOpp, simEra, stl, blk, calcRebFactor(rebEntries, simEra));
      const fmvp = result.champion && result.finalsStats.length > 0 ? computeFinalsMVP(result.finalsStats) : null;
      return JSON.stringify({
        ok: true,
        rounds: result.rounds,
        champion: result.champion,
        allGames: result.allGames,
        playoffStats: result.playoffStats.map(seasonStatView),
        finalsStats: result.finalsStats.map(seasonStatView),
        oppStats,
        finalsMVP: fmvp ? seasonStatView(fmvp) : null
      });
    },
    finishRun(teamName) {
      if (!currentCoach || !lastRatings || !lastSeason)
        return JSON.stringify({ ok: false });
      const coach = currentCoach, tr = lastRatings.teamRating;
      const wins = lastSeason.wins, losses = lastSeason.losses, playoffResult = lastPlayoffs, teamAnalysis = lastSeason.teamAnalysis;
      const playoffThreshold = Math.ceil(ERA_SEASON_GAMES[simEra] / 2), madePlayoffs = wins >= playoffThreshold;
      const starters = slots.slice(0, 5).filter((s) => s.player).map((s) => ({ personId: String(s.player.person_id), name: s.player.full_name }));
      const bench = slots.slice(5).filter((s) => s.player).map((s) => ({ personId: String(s.player.person_id), name: s.player.full_name }));
      const hasSTierStarter = slots.slice(0, 5).some((s) => s.player && playerTier(playerBaseRating({ ...s.player, duoActiveCount: 0, sixthManActive: false }, simEra)) === "s");
      const runMode = salaryCapMode ? "salary_cap" : "normal";
      recordRunComplete({ era: simEra, wins, losses, champion: playoffResult?.champion ?? false, teamRating: Math.round(tr + 15), starters, bench, coach: coach.name, mode: runMode, hasSTierStarter });
      const draftedPlayers = slots.filter((s) => s.player).map((s) => s.player);
      const { duo_pair, duo_trio } = computeDuoFlags(draftedPlayers);
      const draftedSlots = slots.filter((s) => s.player);
      const glassCleanerCount = draftedSlots.filter((s) => s.player.glassClean).length;
      const shootingStarCount = draftedSlots.filter((s) => s.player.shootingStar).length;
      const draftedNameSet = new Set(draftedSlots.map((s) => s.player.full_name));
      const brotherDuo = BROTHER_PAIRS.some(([a, b]) => draftedNameSet.has(a) && draftedNameSet.has(b));
      const sixth_man_bench = slots.slice(5).some((s) => s.player && SIXTH_MAN_PLAYERS.has(s.player.full_name));
      const newAchievements = checkAchievements(
        getLifetimeStats("normal"),
        getLifetimeStats("salary_cap"),
        { era: simEra, mode: runMode, wins, losses, champion: playoffResult?.champion ?? false, teamRating: Math.round(tr + 15), coachGrade: coach.overallGrade, hasSTierStarter, duo_pair, duo_trio, glassCleanerCount, shootingStarCount, brotherDuo, sixth_man_bench }
      );
      const no_timeless = !draftedPlayers.some((p) => p.timeless);
      const no_s_tier = !draftedPlayers.some((p) => playerTier(playerBaseRating({ ...p, duoActiveCount: 0, sixthManActive: false }, simEra)) === "s");
      const BLK_BASELINE = 3.5;
      const elite_spacing = !teamAnalysis?.isPreThreePt && ((teamAnalysis?.spacingWinFactor ?? 1) - 1) * 100 >= 5;
      const elite_rim = (teamAnalysis?.blkScore ?? 0) >= BLK_BASELINE * 1.5;
      const elite_playmaking = ((teamAnalysis?.astFactor ?? 1) - 1) * 100 > 3;
      const reb_edge = ((teamAnalysis?.rebFactor ?? 1) - 1) * 100 > 5;
      const playoffWins = playoffResult ? playoffResult.rounds.reduce((s, r) => s + r.seriesWins, 0) : 0;
      const playoffLosses = playoffResult ? playoffResult.rounds.reduce((s, r) => s + r.seriesLosses, 0) : 0;
      const playoffTotal = playoffWins + playoffLosses;
      const roundName = playoffResult?.rounds[playoffResult.rounds.length - 1]?.name;
      const playoffResultKey = !madePlayoffs ? null : playoffResult?.champion ? "champion" : roundName === "NBA Finals" ? "finals" : roundName === "Conference Finals" ? "conf_finals" : roundName === "Semifinals" ? "second_round" : "first_round";
      const entry = {
        era: simEra,
        mode: runMode,
        team_name: teamName.trim() || null,
        reg_wins: wins,
        reg_losses: losses,
        reg_win_pct: wins / Math.max(wins + losses, 1),
        playoff_wins: playoffWins,
        playoff_losses: playoffLosses,
        playoff_win_pct: playoffTotal > 0 ? playoffWins / playoffTotal : 0,
        playoff_result: playoffResultKey,
        avg_pt_diff: Math.round((lastSeason.avgTeamScore - lastSeason.avgOppScore) * 100) / 100,
        team_rating: Math.round(tr),
        coach_name: coach.name.replace("*", ""),
        coach_grade: coach.overallGrade
      };
      const bad_coach = playoffResultKey === "champion" && entry.coach_grade === "F";
      const flags = { no_timeless, no_s_tier, elite_spacing, elite_rim, elite_playmaking, reb_edge, duo_pair, duo_trio, bad_coach, sixth_man_bench };
      return JSON.stringify({ ok: true, score: Math.round(calcLeaderboardScore(entry, flags)), entry, flags, playoffResultKey, newAchievements });
    },
    devFill() {
      const ids = draftedIds;
      for (let i = 0; i < slots.length; i++) {
        if (slots[i].player)
          continue;
        const shuffled = [...validCombosCache].sort(() => Math.random() - 0.5);
        for (const combo of shuffled) {
          const pool = players.filter((p) => {
            const et = p.all_teams_by_era?.[combo.era];
            const onTeam = et ? et.map(normalizeTeam).includes(combo.team) : normalizeTeam(playerTeamForEra(p, combo.era)) === combo.team;
            return onTeam && playerMatchesEra(p, combo.era) && !ids.has(String(p.person_id));
          });
          if (pool.length === 0)
            continue;
          const tagged = tagPlayer(pool.sort((a, b) => (b.PTS ?? 0) - (a.PTS ?? 0))[0], combo.era, combo.team);
          if (salaryCapMode) {
            const tier = capTier(tagged);
            if (tierCounts()[tier] >= CAP_QUOTAS[tier])
              continue;
          }
          const { penalty, label } = calcFitPenalty(tagged, slots[i].position);
          slots = slots.map((s, idx) => idx === i ? { ...s, player: tagged, fitPenalty: penalty, fitLabel: label } : s);
          ids.add(String(tagged.person_id));
          break;
        }
      }
      poolCache = [];
      return JSON.stringify(stateView());
    },
    lifetimeStats(mode) {
      return JSON.stringify(getLifetimeStats(mode === "salary_cap" ? "salary_cap" : "normal"));
    },
    clearAllLifetimeStats() {
      clearLifetimeStats("normal");
      clearLifetimeStats("salary_cap");
    },
    allAchievements() {
      return JSON.stringify(getAllAchievements());
    },
    seedRng(seed) {
      seedRng(seed);
    },
    clearRng() {
      clearRng();
    }
  };
  globalThis.EraBall = api;
  globalThis.EraBallEngine = {
    withEraStats,
    applyFlexTag,
    applyRings,
    applyAnchors,
    applyTimeless,
    applyShootingStar,
    applyGlassCleaner,
    applyDuo,
    calcTeamRating,
    coachChampBonus,
    effectiveCoachBonus,
    simulateSeason,
    simulatePlayoffs,
    seedRng,
    clearRng
  };
})();
