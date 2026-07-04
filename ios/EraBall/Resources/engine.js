"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // packages/engine/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    ALL_ERAS: () => ALL_ERAS,
    CAP_QUOTAS: () => CAP_QUOTAS,
    DUO_PAIRS: () => DUO_PAIRS,
    ERA_SEASON_GAMES: () => ERA_SEASON_GAMES,
    FRANCHISE_PAIRS: () => FRANCHISE_PAIRS,
    SIXTH_MAN_PLAYERS: () => SIXTH_MAN_PLAYERS,
    SLOT_MPG: () => SLOT_MPG,
    SLOT_POSITIONS: () => SLOT_POSITIONS,
    applyAnchors: () => applyAnchors,
    applyDuo: () => applyDuo,
    applyFinalsMVP: () => applyFinalsMVP,
    applyFlexTag: () => applyFlexTag,
    applyFloorGeneral: () => applyFloorGeneral,
    applyGlassCleaner: () => applyGlassCleaner,
    applyRings: () => applyRings,
    applyShootingStar: () => applyShootingStar,
    applySixthMan: () => applySixthMan,
    applyTimeless: () => applyTimeless,
    calcEraModifier: () => calcEraModifier,
    calcFitPenalty: () => calcFitPenalty,
    calcRebFactor: () => calcRebFactor,
    calcTS: () => calcTS,
    calcTeamDefTotals: () => calcTeamDefTotals,
    calcTeamRating: () => calcTeamRating,
    clearRng: () => clearRng,
    coachBonus: () => coachBonus,
    coachChampBonus: () => coachChampBonus,
    coachDefGrade: () => coachDefGrade,
    coachOffGrade: () => coachOffGrade,
    coachOverallGrade: () => coachOverallGrade,
    effectiveCoachBonus: () => effectiveCoachBonus,
    firstRoundLabel: () => firstRoundLabel,
    firstRoundWinsNeeded: () => firstRoundWinsNeeded,
    genOppTeamStats: () => genOppTeamStats,
    gradeFromPct: () => gradeFromPct,
    gradeToNumber: () => gradeToNumber,
    isSeeded: () => isSeeded,
    numberToGrade: () => numberToGrade,
    playerBaseRating: () => playerBaseRating,
    playerMatchesEra: () => playerMatchesEra,
    playerTier: () => playerTier,
    rateTeam: () => rateTeam,
    rng: () => rng,
    runGame: () => runGame,
    seedRng: () => seedRng,
    simulatePlayoffs: () => simulatePlayoffs,
    simulateSeason: () => simulateSeason,
    upgradeGrade: () => upgradeGrade,
    withEraStats: () => withEraStats
  });

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
  function isSeeded() {
    return activeGenerator !== null;
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
  function isEstimatedShooter(player, simEra) {
    if (player.FG3_PCT != null)
      return false;
    if (!PRE_THREE_PT_ERAS.includes(player.era))
      return false;
    if (PRE_THREE_PT_ERAS.includes(simEra))
      return false;
    if (ESTIMATED_SHOOTER_OVERRIDES.has(player.full_name))
      return true;
    const pos = (player.position ?? "").toUpperCase();
    const isGuard = pos.includes("GUARD") || pos.includes("PG") || pos.includes("SG") || pos === "G";
    if (!isGuard)
      return false;
    return calcTS(player) >= 0.52;
  }
  function getEstimatedFG3PCT(player, simEra) {
    if (!isEstimatedShooter(player, simEra))
      return null;
    const leagueAvg = ERA_LEAGUE_AVG_3PT[simEra];
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
  function playerBaseRating(player, simEra) {
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
    const threePtBonus = !simEra || PRE_THREE_PT_ERAS.includes(simEra) ? 0 : (ratingPlayer.FG3M ?? 0) * 1.5;
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
  function calcEraModifier(player, simEra) {
    const playerIdx = ERA_ORDER.indexOf(player.era);
    const simIdx = ERA_ORDER.indexOf(simEra);
    const dist = Math.abs(playerIdx - simIdx);
    if (player.timeless && (player.timelessTier ?? 1) === 1)
      return dist >= 6 ? 0.95 : 1;
    if (player.era === "10s" && simEra === "20s" || player.era === "20s" && simEra === "10s")
      return 0.98;
    if (player.full_name === "Chris Paul" && (simEra === "90s" || simEra === "00s" || simEra === "10s" || simEra === "20s"))
      return 1;
    if (player.full_name === "Zach Randolph" && playerIdx > simIdx)
      return 1;
    const isTallCenter = playerHeightInches(player) >= 82 || player.full_name === "Bam Adebayo" || player.full_name === "Zion Williamson" || player.full_name === "Aaron Gordon";
    const table = playerIdx > simIdx ? isTallCenter ? ERA_MOD_BACKWARD_TALL : ERA_MOD_BACKWARD : isEstimatedShooter(player, simEra) ? ERA_MOD_FORWARD_EST_SHOOTER : ERA_MOD_FORWARD;
    let mod = table[Math.min(dist, table.length - 1)];
    const modernInOldEra = {
      "20s": { "50s": 0.12, "60s": 0.09 },
      "10s": { "50s": 0.11, "60s": 0.08 }
    };
    const extraPenalty = modernInOldEra[player.era]?.[simEra] ?? 0;
    mod = Math.max(mod - extraPenalty, 0.5);
    if (PRE_THREE_PT_ERAS.includes(player.era) && !isEstimatedShooter(player, simEra)) {
      const fg3 = player.FG3_PCT ?? 0;
      if (fg3 < 0.2) {
        if (THREE_PT_ERAS.includes(simEra) || simEra === "00s")
          mod -= 0.1;
        else if (simEra === "90s")
          mod -= 0.05;
      }
    }
    const rawMod = Math.max(mod, 0.5);
    if (player.timeless && player.timelessTier === 2)
      return 1 - (1 - rawMod) * 0.5;
    return rawMod;
  }
  function calcPlayerAdjustedRating(player, slot, simEra) {
    const base = playerBaseRating(player, simEra);
    const { penalty, label } = calcFitPenalty(player, slot);
    const eraMod = calcEraModifier(player, simEra);
    const adjusted = base * (1 - penalty) * eraMod;
    return { base, adjusted, fitPenalty: penalty, eraMod, fitLabel: label };
  }
  function gradeFromPct(pct, thresholds) {
    if (pct >= thresholds[0])
      return "A";
    if (pct >= thresholds[1])
      return "B";
    if (pct >= thresholds[2])
      return "C";
    if (pct >= thresholds[3])
      return "D";
    return "F";
  }
  function coachOffGrade(coach) {
    return gradeFromPct(coach.regWLPct, [0.6, 0.55, 0.5, 0.45]);
  }
  function coachDefGrade(coach) {
    if (coach.playoffG === 0)
      return "C";
    return gradeFromPct(coach.playoffWLPct, [0.55, 0.5, 0.45, 0.4]);
  }
  function gradeToNumber(g) {
    return { S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 }[g];
  }
  function numberToGrade(n) {
    if (n >= 4.5)
      return "S";
    if (n >= 3.5)
      return "A";
    if (n >= 2.5)
      return "B";
    if (n >= 1.5)
      return "C";
    if (n >= 0.5)
      return "D";
    return "F";
  }
  function coachOverallGrade(coach) {
    return numberToGrade((gradeToNumber(coach.offGrade) + gradeToNumber(coach.defGrade)) / 2);
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
  function calcTeamRating(slots, coach, simEra) {
    const playerRatings = [];
    let starterSum = 0;
    let starterCount = 0;
    let benchWeightedSum = 0;
    let benchTotalMinutes = 0;
    for (const slot of slots) {
      if (!slot.player)
        continue;
      const { base, adjusted, fitPenalty, eraMod, fitLabel } = calcPlayerAdjustedRating(slot.player, slot.position, simEra);
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
  function generateGameScore(expectedTeamScore, playerDefFactor, rebFactor, astFactor, coachDefBonus, coachOffBonus, win, simEra, spacingWinFactor = 1) {
    const scoreCap = ERA_SCORE_CAP[simEra];
    const scoreFloor = ERA_SCORE_FLOOR[simEra];
    const oppBase = ERA_OPP_BASELINE[simEra];
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
  function calcPlayerDefFactor(entries, simEra) {
    const stlIndex = entries.reduce((s, { pr, minScale }) => s + imputeSTL(pr.player) * pr.eraMod * minScale, 0);
    const stlFactor = Math.max(0.94, Math.min(1.06, 1 + (LEAGUE_AVG_DEF_INDEX - stlIndex) / LEAGUE_AVG_DEF_INDEX * 0.06));
    const isPreThreePt = simEra === "50s" || simEra === "60s" || simEra === "70s";
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
  function calcRebFactor(entries, simEra) {
    const leagueAvg = ERA_LEAGUE_AVG_REB[simEra];
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
  function spacingSlotWeight(slot, simEra) {
    if (slot === "PG" || slot === "SG")
      return 1.2;
    if (slot === "SF")
      return 1.15;
    if (slot === "PF")
      return 0.9;
    if (slot === "C")
      return simEra === "20s" || simEra === "10s" ? 0.75 : 0.5;
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
  function simulateSeason(rawRating, playerRatings, coachDefGrade2, coachOffGrade2, simEra, coachDefBonus, coachOffBonus, difficultyMod) {
    const games = [];
    let wins = 0;
    let totalTeamScore = 0;
    let totalOppScore = 0;
    const eraDifficulty = ERA_DIFFICULTY[simEra] ?? 1;
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
    const playerDefFactor = calcPlayerDefFactor(entries, simEra);
    const rebFactor = calcRebFactor(entries, simEra);
    const astFactor = calcAstFactor(entries);
    const defBonus = coachDefBonus ?? coachBonus(coachDefGrade2);
    const offBonus = coachOffBonus ?? coachBonus(coachOffGrade2);
    const rebWinFactor = 1 + (rebFactor - 1) * 0.5;
    const astWinFactor = 1 + (astFactor - 1) * 0.5;
    const rebOppFactor = 1 - (rebFactor - 1) * 0.25;
    const shooterCount = entries.reduce((s, e) => {
      const w = spacingSlotWeight(e.pr.slot, simEra);
      const f = e.pr.player.FG3_PCT ?? 0;
      const fg3m = e.pr.player.FG3M ?? 0;
      if (fg3m < 0.5)
        return s;
      const ssm = e.pr.player.shootingStar ? e.pr.player.shootingStarTier === 1 ? 2.2 : 1.6 : 1.35;
      return s + (f >= 0.4 ? e.minScale * 1.25 : f >= 0.37 ? e.minScale * 1.12 : f >= 0.34 ? e.minScale : f >= 0.3 ? e.minScale * 0.5 : f >= 0.25 ? e.minScale * 0.25 : 0) * w * ssm;
    }, 0);
    const highVolumeShooterCount = entries.reduce((s, e) => {
      const w = spacingSlotWeight(e.pr.slot, simEra);
      return s + ((e.pr.player.FG3M ?? 0) >= 2.9 ? e.minScale * w : 0);
    }, 0);
    const isPreThreePt = simEra === "50s" || simEra === "60s" || simEra === "70s";
    const spacingBaseline = simEra === "20s" ? 6 : simEra === "10s" ? 5 : simEra === "00s" ? 4 : simEra === "90s" ? 3 : simEra === "80s" ? 2 : 0;
    const spacingDev = isPreThreePt ? -highVolumeShooterCount : shooterCount - spacingBaseline;
    const spacingPerShooter = spacingDev < 0 ? isPreThreePt ? 0.035 : simEra === "20s" || simEra === "10s" ? 0.05 : simEra === "00s" ? 0.05 : simEra === "90s" ? 0.035 : 0.015 : simEra === "20s" || simEra === "10s" ? 0.022 : simEra === "00s" ? 0.014 : 9e-3;
    const spacingCapNeg = isPreThreePt ? 0.15 : simEra === "20s" ? 0.25 : simEra === "10s" ? 0.2 : simEra === "00s" ? 0.14 : simEra === "90s" ? 0.1 : 0.06;
    const spacingCapPos = simEra === "20s" ? 0.2 : simEra === "10s" ? 0.16 : simEra === "00s" ? 0.12 : simEra === "90s" ? 0.08 : 0.06;
    const spacingWinFactor = Math.max(1 - spacingCapNeg, Math.min(1 + spacingCapPos, 1 + spacingDev * spacingPerShooter));
    const eraOppAvg = ERA_OPP_BASELINE[simEra];
    const expectedOppScore = eraOppAvg * playerDefFactor * (1 - defBonus * 0.5);
    const scoringDiffRatio = expectedTeamScore / Math.max(1, expectedOppScore);
    const scoringWinFactor = Math.max(0.93, Math.min(1.07, 1 + (scoringDiffRatio - 1) * 0.25));
    const seasonGames = ERA_SEASON_GAMES[simEra];
    for (let i = 0; i < seasonGames; i++) {
      const oppBase = OPP_BASELINE * playerDefFactor * (1 - defBonus);
      const oppRating = oppBase + randn() * OPP_SPREAD;
      const teamRoll = rawRating * (1 + offBonus) * rebWinFactor * astWinFactor * spacingWinFactor * scoringWinFactor + randn() * GAME_NOISE;
      const oppRoll = oppRating * rebOppFactor + randn() * GAME_NOISE;
      const win = teamRoll > oppRoll;
      games.push(win);
      if (win)
        wins++;
      const { teamScore, oppScore } = generateGameScore(expectedTeamScore, playerDefFactor, rebFactor, astFactor, defBonus, offBonus, win, simEra, spacingWinFactor);
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
        FG3_PCT: PRE_THREE_PT_ERAS.includes(simEra) ? null : pr.player.FG3_PCT != null ? Math.min(0.6, Math.max(0.2, pr.player.FG3_PCT + fg3Ctx + preEff[i].fg3)) : (() => {
          const b = getEstimatedFG3PCT(pr.player, simEra);
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
    const rebFloor = ERA_TEAM_REB_FLOOR[simEra] * (0.82 + rng() * 0.18);
    const astFloor = ERA_TEAM_AST_FLOOR[simEra] * (0.82 + rng() * 0.18);
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
  function firstRoundWinsNeeded(simEra) {
    if (["50s", "60s", "70s"].includes(simEra))
      return 2;
    if (["80s", "90s"].includes(simEra))
      return 3;
    return 4;
  }
  function firstRoundLabel(simEra) {
    const w = firstRoundWinsNeeded(simEra);
    return w === 2 ? "Best of 3" : w === 3 ? "Best of 5" : "Best of 7";
  }
  function playoffOppRating(round, teamWins, teamRaw, simEra, difficultyMod = 1) {
    const idx = round - 1;
    const winsBase = teamWins >= 60 ? [45, 49, 53, 52][idx] : teamWins >= 53 ? [46, 50, 53, 53][idx] : teamWins >= 47 ? [48, 51, 53, 53][idx] : [50, 52, 53, 55][idx];
    const baseRating = round === 4 ? Math.max(winsBase, Math.round(teamRaw * 0.88)) : winsBase;
    const eraDifficulty = ERA_DIFFICULTY[simEra] ?? 1;
    const offRating = Math.round(baseRating * eraDifficulty * difficultyMod);
    const defFactor = [1, 0.97, 0.94, 0.89][idx];
    return { offRating, defFactor };
  }
  function simulatePlayoffs(rawRating, playerRatings, regularSeasonWins, coachDefGrade2, coachOffGrade2, simEra, coachDefBonus, coachOffBonus, difficultyMod) {
    const OPP_SPREAD = 3;
    const GAME_NOISE = 5;
    const entries = playerRatings.map((pr) => {
      const isStarter = STARTER_SLOTS.includes(pr.slot);
      const assignedMPG = SLOT_MPG[pr.slot];
      const minScale = assignedMPG / (isStarter ? STARTER_BASELINE_MPG : BENCH_BASELINE_MPG);
      return { pr, assignedMPG, minScale };
    });
    const playerDefFactor = calcPlayerDefFactor(entries, simEra);
    const rebFactor = calcRebFactor(entries, simEra);
    const astFactor = calcAstFactor(entries);
    const defBonus = coachDefBonus ?? coachBonus(coachDefGrade2);
    const offBonus = coachOffBonus ?? coachBonus(coachOffGrade2);
    const rebWinFactor = 1 + (rebFactor - 1) * 0.5;
    const astWinFactor = 1 + (astFactor - 1) * 0.5;
    const rebOppFactor = 1 - (rebFactor - 1) * 0.25;
    const shooterCount = entries.reduce((s, e) => {
      const w = spacingSlotWeight(e.pr.slot, simEra);
      const f = e.pr.player.FG3_PCT ?? 0;
      const fg3m = e.pr.player.FG3M ?? 0;
      if (fg3m < 0.5)
        return s;
      const ssm = e.pr.player.shootingStar ? e.pr.player.shootingStarTier === 1 ? 2.2 : 1.6 : 1;
      return s + (f >= 0.4 ? e.minScale * 1.25 : f >= 0.37 ? e.minScale * 1.12 : f >= 0.34 ? e.minScale : f >= 0.3 ? e.minScale * 0.5 : f >= 0.25 ? e.minScale * 0.25 : 0) * w * ssm;
    }, 0);
    const highVolumeShooterCountPO = entries.reduce((s, e) => {
      const w = spacingSlotWeight(e.pr.slot, simEra);
      return s + ((e.pr.player.FG3M ?? 0) >= 2.9 ? e.minScale * w : 0);
    }, 0);
    const isPreThreePtPO = simEra === "50s" || simEra === "60s" || simEra === "70s";
    const spacingBaselinePO = simEra === "20s" ? 6 : simEra === "10s" ? 5 : simEra === "00s" ? 4 : simEra === "90s" ? 3 : simEra === "80s" ? 2 : 0;
    const spacingDevPO = isPreThreePtPO ? -highVolumeShooterCountPO : shooterCount - spacingBaselinePO;
    const spacingPerShooterPO = spacingDevPO < 0 ? isPreThreePtPO ? 0.035 : simEra === "20s" || simEra === "10s" ? 0.05 : simEra === "00s" ? 0.05 : simEra === "90s" ? 0.035 : 0.015 : simEra === "20s" || simEra === "10s" ? 0.022 : simEra === "00s" ? 0.014 : 9e-3;
    const spacingCapNegPO = isPreThreePtPO ? 0.15 : simEra === "20s" ? 0.25 : simEra === "10s" ? 0.2 : simEra === "00s" ? 0.14 : simEra === "90s" ? 0.1 : 0.06;
    const spacingCapPosPO = simEra === "20s" ? 0.2 : simEra === "10s" ? 0.16 : simEra === "00s" ? 0.12 : simEra === "90s" ? 0.08 : 0.06;
    const spacingWinFactor = Math.max(1 - spacingCapNegPO, Math.min(1 + spacingCapPosPO, 1 + spacingDevPO * spacingPerShooterPO));
    const totalAdjusted = entries.reduce((s, e) => s + e.pr.adjusted, 0);
    const avgRingBoost = totalAdjusted > 0 ? entries.reduce((s, e) => s + playoffRingBoost(e.pr.player.rings ?? 0) * e.pr.adjusted / totalAdjusted, 0) : 0;
    const effectiveRawRating = rawRating * (1 + avgRingBoost);
    const baseTeamScore = entries.reduce((s, e) => s + (e.pr.player.PTS ?? 0) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty), 0);
    const expectedTeamScore = Math.max(85, Math.min(138, baseTeamScore * (1 + avgRingBoost)));
    const poEraOppAvg = ERA_OPP_BASELINE[simEra];
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
    const baseFG3 = entries.map((e) => PRE_THREE_PT_ERAS.includes(simEra) ? null : e.pr.player.FG3_PCT ?? getEstimatedFG3PCT(e.pr.player, simEra));
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
      const { offRating: oppMean, defFactor: roundDefFactor } = playoffOppRating(r + 1, regularSeasonWins, rawRating, simEra, difficultyMod ?? 1);
      const winsNeeded = r === 0 ? firstRoundWinsNeeded(simEra) : 4;
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
        const { teamScore, oppScore } = generateGameScore(expectedTeamScore, playerDefFactor, rebFactor, astFactor, defBonus, offBonus, win, simEra, spacingWinFactor);
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
          const maxSpecialPTS = simEra === "50s" || simEra === "60s" ? 85 : 72;
          scaledPTS[starIdx] = Math.min(maxSpecialPTS, Math.round(scaledPTS[starIdx] * boostFactor));
          const maxSpecialREB = simEra === "50s" || simEra === "60s" || simEra === "70s" ? 35 : 22;
          gameREB[starIdx] = Math.min(maxSpecialREB, Math.round(gameREB[starIdx] * boostFactor));
          gameAST[starIdx] = Math.min(25, Math.round(gameAST[starIdx] * boostFactor));
          const capLimit = ERA_SCORE_CAP[simEra];
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
        FG3_PCT: PRE_THREE_PT_ERAS.includes(simEra) ? null : pr.player.FG3_PCT != null ? Math.min(0.6, Math.max(0.2, pr.player.FG3_PCT + effBoost + fg3Ctx + effNoise(0.03))) : (() => {
          const b = getEstimatedFG3PCT(pr.player, simEra);
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
        FG3_PCT: PRE_THREE_PT_ERAS.includes(simEra) ? null : pr.player.FG3_PCT != null ? Math.min(0.6, Math.max(0.15, pr.player.FG3_PCT + effBoost + fgCtx + effNoise(0.03))) : (() => {
          const b = getEstimatedFG3PCT(pr.player, simEra);
          return b != null ? Math.min(0.55, Math.max(0.15, b + effBoost + fgCtx + effNoise(0.03))) : null;
        })(),
        FT_PCT: Math.min(0.99, Math.max(0.3, (pr.player.FT_PCT ?? 0.7) + effBoost + ftCtx + effNoise(0.035)))
      };
    });
    return { rounds, champion, allGames, playoffStats, finalsStats };
  }

  // packages/engine/src/orchestrator.ts
  var CAP_MODE_DIFFICULTY = 0.9;
  var NORMAL_DIFFICULTY = 1;
  function rateTeam(slots, coach, era) {
    const { teamRating, rawRating, playerRatings } = calcTeamRating(slots, coach, era);
    const simRaw = rawRating * (1 + coachChampBonus(coach));
    return { teamRating, rawRating, simRaw, playerRatings };
  }
  function runGame(slots, coach, era, options = {}) {
    const difficulty = options.capMode ? CAP_MODE_DIFFICULTY : NORMAL_DIFFICULTY;
    const rating = rateTeam(slots, coach, era);
    const defBonus = effectiveCoachBonus(coach, "def");
    const offBonus = effectiveCoachBonus(coach, "off");
    const season = simulateSeason(
      rating.simRaw,
      rating.playerRatings,
      coach.defGrade,
      coach.offGrade,
      era,
      defBonus,
      offBonus,
      difficulty
    );
    const regularSeasonWins = season.games.filter(Boolean).length;
    const playoffs = simulatePlayoffs(
      rating.simRaw,
      rating.playerRatings,
      regularSeasonWins,
      coach.defGrade,
      coach.offGrade,
      era,
      defBonus,
      offBonus,
      difficulty
    );
    return { rating, season, regularSeasonWins, playoffs };
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

  // node_modules/tslib/tslib.es6.mjs
  function __rest(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  // node_modules/@supabase/functions-js/dist/module/helper.js
  var resolveFetch = (customFetch) => {
    if (customFetch) {
      return (...args) => customFetch(...args);
    }
    return (...args) => fetch(...args);
  };

  // node_modules/@supabase/functions-js/dist/module/types.js
  var FunctionsError = class extends Error {
    constructor(message, name = "FunctionsError", context) {
      super(message);
      this.name = name;
      this.context = context;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        context: this.context
      };
    }
  };
  var FunctionsFetchError = class extends FunctionsError {
    constructor(context) {
      super("Failed to send a request to the Edge Function", "FunctionsFetchError", context);
    }
  };
  var FunctionsRelayError = class extends FunctionsError {
    constructor(context) {
      super("Relay Error invoking the Edge Function", "FunctionsRelayError", context);
    }
  };
  var FunctionsHttpError = class extends FunctionsError {
    constructor(context) {
      super("Edge Function returned a non-2xx status code", "FunctionsHttpError", context);
    }
  };
  var FunctionRegion;
  (function(FunctionRegion2) {
    FunctionRegion2["Any"] = "any";
    FunctionRegion2["ApNortheast1"] = "ap-northeast-1";
    FunctionRegion2["ApNortheast2"] = "ap-northeast-2";
    FunctionRegion2["ApSouth1"] = "ap-south-1";
    FunctionRegion2["ApSoutheast1"] = "ap-southeast-1";
    FunctionRegion2["ApSoutheast2"] = "ap-southeast-2";
    FunctionRegion2["CaCentral1"] = "ca-central-1";
    FunctionRegion2["EuCentral1"] = "eu-central-1";
    FunctionRegion2["EuWest1"] = "eu-west-1";
    FunctionRegion2["EuWest2"] = "eu-west-2";
    FunctionRegion2["EuWest3"] = "eu-west-3";
    FunctionRegion2["SaEast1"] = "sa-east-1";
    FunctionRegion2["UsEast1"] = "us-east-1";
    FunctionRegion2["UsWest1"] = "us-west-1";
    FunctionRegion2["UsWest2"] = "us-west-2";
  })(FunctionRegion || (FunctionRegion = {}));

  // node_modules/@supabase/functions-js/dist/module/FunctionsClient.js
  var FunctionsClient = class {
    constructor(url, { headers = {}, customFetch, region = FunctionRegion.Any } = {}) {
      this.url = url;
      this.headers = headers;
      this.region = region;
      this.fetch = resolveFetch(customFetch);
    }
    setAuth(token) {
      this.headers.Authorization = `Bearer ${token}`;
    }
    invoke(functionName_1) {
      return __awaiter(this, arguments, void 0, function* (functionName, options = {}) {
        var _a;
        let timeoutId;
        let timeoutController;
        try {
          const { headers, method, body: functionArgs, signal, timeout } = options;
          let _headers = {};
          let { region } = options;
          if (!region) {
            region = this.region;
          }
          const url = new URL(`${this.url}/${functionName}`);
          if (region && region !== "any") {
            _headers["x-region"] = region;
            url.searchParams.set("forceFunctionRegion", region);
          }
          let body;
          if (functionArgs && (headers && !Object.prototype.hasOwnProperty.call(headers, "Content-Type") || !headers)) {
            if (typeof Blob !== "undefined" && functionArgs instanceof Blob || functionArgs instanceof ArrayBuffer) {
              _headers["Content-Type"] = "application/octet-stream";
              body = functionArgs;
            } else if (typeof functionArgs === "string") {
              _headers["Content-Type"] = "text/plain";
              body = functionArgs;
            } else if (typeof FormData !== "undefined" && functionArgs instanceof FormData) {
              body = functionArgs;
            } else {
              _headers["Content-Type"] = "application/json";
              body = JSON.stringify(functionArgs);
            }
          } else {
            if (functionArgs && typeof functionArgs !== "string" && !(typeof Blob !== "undefined" && functionArgs instanceof Blob) && !(functionArgs instanceof ArrayBuffer) && !(typeof FormData !== "undefined" && functionArgs instanceof FormData)) {
              body = JSON.stringify(functionArgs);
            } else {
              body = functionArgs;
            }
          }
          let effectiveSignal = signal;
          if (timeout) {
            timeoutController = new AbortController();
            timeoutId = setTimeout(() => timeoutController.abort(), timeout);
            if (signal) {
              effectiveSignal = timeoutController.signal;
              signal.addEventListener("abort", () => timeoutController.abort());
            } else {
              effectiveSignal = timeoutController.signal;
            }
          }
          const response = yield this.fetch(url.toString(), {
            method: method || "POST",
            headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
            body,
            signal: effectiveSignal
          }).catch((fetchError) => {
            throw new FunctionsFetchError(fetchError);
          });
          const isRelayError = response.headers.get("x-relay-error");
          if (isRelayError && isRelayError === "true") {
            throw new FunctionsRelayError(response);
          }
          if (!response.ok) {
            throw new FunctionsHttpError(response);
          }
          let responseType = ((_a = response.headers.get("Content-Type")) !== null && _a !== void 0 ? _a : "text/plain").split(";")[0].trim();
          let data;
          if (responseType === "application/json") {
            data = yield response.json();
          } else if (responseType === "application/octet-stream" || responseType === "application/pdf") {
            data = yield response.blob();
          } else if (responseType === "text/event-stream") {
            data = response;
          } else if (responseType === "multipart/form-data") {
            data = yield response.formData();
          } else {
            data = yield response.text();
          }
          return { data, error: null, response };
        } catch (error) {
          return {
            data: null,
            error,
            response: error instanceof FunctionsHttpError || error instanceof FunctionsRelayError ? error.context : void 0
          };
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }
      });
    }
  };

  // node_modules/@supabase/postgrest-js/dist/index.mjs
  var DEFAULT_MAX_RETRIES = 3;
  var getRetryDelay = (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 3e4);
  var RETRYABLE_STATUS_CODES = [520, 503];
  var RETRYABLE_METHODS = [
    "GET",
    "HEAD",
    "OPTIONS"
  ];
  var PostgrestError = class extends Error {
    constructor(context) {
      super(context.message);
      this.name = "PostgrestError";
      this.details = context.details;
      this.hint = context.hint;
      this.code = context.code;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        details: this.details,
        hint: this.hint,
        code: this.code
      };
    }
  };
  function sleep(ms, signal) {
    return new Promise((resolve) => {
      if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
        resolve();
        return;
      }
      const id = setTimeout(() => {
        signal === null || signal === void 0 || signal.removeEventListener("abort", onAbort);
        resolve();
      }, ms);
      function onAbort() {
        clearTimeout(id);
        resolve();
      }
      signal === null || signal === void 0 || signal.addEventListener("abort", onAbort);
    });
  }
  function shouldRetry(method, status, attemptCount, retryEnabled) {
    if (!retryEnabled || attemptCount >= DEFAULT_MAX_RETRIES)
      return false;
    if (!RETRYABLE_METHODS.includes(method))
      return false;
    if (!RETRYABLE_STATUS_CODES.includes(status))
      return false;
    return true;
  }
  var PostgrestBuilder = class {
    constructor(builder) {
      var _builder$shouldThrowO, _builder$isMaybeSingl, _builder$shouldStripN, _builder$urlLengthLim, _builder$retry;
      this.shouldThrowOnError = false;
      this.retryEnabled = true;
      this.method = builder.method;
      this.url = builder.url;
      this.headers = new Headers(builder.headers);
      this.schema = builder.schema;
      this.body = builder.body;
      this.shouldThrowOnError = (_builder$shouldThrowO = builder.shouldThrowOnError) !== null && _builder$shouldThrowO !== void 0 ? _builder$shouldThrowO : false;
      this.signal = builder.signal;
      this.isMaybeSingle = (_builder$isMaybeSingl = builder.isMaybeSingle) !== null && _builder$isMaybeSingl !== void 0 ? _builder$isMaybeSingl : false;
      this.shouldStripNulls = (_builder$shouldStripN = builder.shouldStripNulls) !== null && _builder$shouldStripN !== void 0 ? _builder$shouldStripN : false;
      this.urlLengthLimit = (_builder$urlLengthLim = builder.urlLengthLimit) !== null && _builder$urlLengthLim !== void 0 ? _builder$urlLengthLim : 8e3;
      this.retryEnabled = (_builder$retry = builder.retry) !== null && _builder$retry !== void 0 ? _builder$retry : true;
      if (builder.fetch)
        this.fetch = builder.fetch;
      else
        this.fetch = fetch;
    }
    throwOnError() {
      this.shouldThrowOnError = true;
      return this;
    }
    stripNulls() {
      if (this.headers.get("Accept") === "text/csv")
        throw new Error("stripNulls() cannot be used with csv()");
      this.shouldStripNulls = true;
      return this;
    }
    setHeader(name, value) {
      this.headers = new Headers(this.headers);
      this.headers.set(name, value);
      return this;
    }
    retry(enabled) {
      this.retryEnabled = enabled;
      return this;
    }
    then(onfulfilled, onrejected) {
      var _this = this;
      if (this.schema === void 0) {
      } else if (["GET", "HEAD"].includes(this.method))
        this.headers.set("Accept-Profile", this.schema);
      else
        this.headers.set("Content-Profile", this.schema);
      if (this.method !== "GET" && this.method !== "HEAD")
        this.headers.set("Content-Type", "application/json");
      if (this.shouldStripNulls) {
        const currentAccept = this.headers.get("Accept");
        if (currentAccept === "application/vnd.pgrst.object+json")
          this.headers.set("Accept", "application/vnd.pgrst.object+json;nulls=stripped");
        else if (!currentAccept || currentAccept === "application/json")
          this.headers.set("Accept", "application/vnd.pgrst.array+json;nulls=stripped");
      }
      const _fetch = this.fetch;
      const executeWithRetry = async () => {
        let attemptCount = 0;
        while (true) {
          const headers = {};
          _this.headers.forEach((value, key) => {
            headers[key] = value;
          });
          if (attemptCount > 0)
            headers["X-Retry-Count"] = String(attemptCount);
          let res$1;
          try {
            res$1 = await _fetch(_this.url.toString(), {
              method: _this.method,
              headers,
              body: JSON.stringify(_this.body, (_, value) => typeof value === "bigint" ? value.toString() : value),
              signal: _this.signal
            });
          } catch (fetchError) {
            if ((fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) === "AbortError" || (fetchError === null || fetchError === void 0 ? void 0 : fetchError.code) === "ABORT_ERR")
              throw fetchError;
            if (!RETRYABLE_METHODS.includes(_this.method))
              throw fetchError;
            if (_this.retryEnabled && attemptCount < DEFAULT_MAX_RETRIES) {
              const delay = getRetryDelay(attemptCount);
              attemptCount++;
              await sleep(delay, _this.signal);
              continue;
            }
            throw fetchError;
          }
          if (shouldRetry(_this.method, res$1.status, attemptCount, _this.retryEnabled)) {
            var _res$headers$get, _res$headers;
            const retryAfterHeader = (_res$headers$get = (_res$headers = res$1.headers) === null || _res$headers === void 0 ? void 0 : _res$headers.get("Retry-After")) !== null && _res$headers$get !== void 0 ? _res$headers$get : null;
            const delay = retryAfterHeader !== null ? Math.max(0, parseInt(retryAfterHeader, 10) || 0) * 1e3 : getRetryDelay(attemptCount);
            await res$1.text();
            attemptCount++;
            await sleep(delay, _this.signal);
            continue;
          }
          return await _this.processResponse(res$1);
        }
      };
      let res = executeWithRetry();
      if (!this.shouldThrowOnError)
        res = res.catch((fetchError) => {
          var _fetchError$name2;
          let errorDetails = "";
          let hint = "";
          let code = "";
          const cause = fetchError === null || fetchError === void 0 ? void 0 : fetchError.cause;
          if (cause) {
            var _cause$message, _cause$code, _fetchError$name, _cause$name;
            const causeMessage = (_cause$message = cause === null || cause === void 0 ? void 0 : cause.message) !== null && _cause$message !== void 0 ? _cause$message : "";
            const causeCode = (_cause$code = cause === null || cause === void 0 ? void 0 : cause.code) !== null && _cause$code !== void 0 ? _cause$code : "";
            errorDetails = `${(_fetchError$name = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name !== void 0 ? _fetchError$name : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`;
            errorDetails += `

Caused by: ${(_cause$name = cause === null || cause === void 0 ? void 0 : cause.name) !== null && _cause$name !== void 0 ? _cause$name : "Error"}: ${causeMessage}`;
            if (causeCode)
              errorDetails += ` (${causeCode})`;
            if (cause === null || cause === void 0 ? void 0 : cause.stack)
              errorDetails += `
${cause.stack}`;
          } else {
            var _fetchError$stack;
            errorDetails = (_fetchError$stack = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _fetchError$stack !== void 0 ? _fetchError$stack : "";
          }
          const urlLength = this.url.toString().length;
          if ((fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) === "AbortError" || (fetchError === null || fetchError === void 0 ? void 0 : fetchError.code) === "ABORT_ERR") {
            code = "";
            hint = "Request was aborted (timeout or manual cancellation)";
            if (urlLength > this.urlLengthLimit)
              hint += `. Note: Your request URL is ${urlLength} characters, which may exceed server limits. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [many IDs])), consider using an RPC function to pass values server-side.`;
          } else if ((cause === null || cause === void 0 ? void 0 : cause.name) === "HeadersOverflowError" || (cause === null || cause === void 0 ? void 0 : cause.code) === "UND_ERR_HEADERS_OVERFLOW") {
            code = "";
            hint = "HTTP headers exceeded server limits (typically 16KB)";
            if (urlLength > this.urlLengthLimit)
              hint += `. Your request URL is ${urlLength} characters. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [200+ IDs])), consider using an RPC function instead.`;
          }
          return {
            success: false,
            error: {
              message: `${(_fetchError$name2 = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name2 !== void 0 ? _fetchError$name2 : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
              details: errorDetails,
              hint,
              code
            },
            data: null,
            count: null,
            status: 0,
            statusText: ""
          };
        });
      return res.then(onfulfilled, onrejected);
    }
    async processResponse(res) {
      var _this2 = this;
      let error = null;
      let data = null;
      let count = null;
      let status = res.status;
      let statusText = res.statusText;
      if (res.ok) {
        var _this$headers$get2, _res$headers$get2;
        if (_this2.method !== "HEAD") {
          var _this$headers$get;
          const body = await res.text();
          if (body === "") {
          } else if (_this2.headers.get("Accept") === "text/csv")
            data = body;
          else if (_this2.headers.get("Accept") && ((_this$headers$get = _this2.headers.get("Accept")) === null || _this$headers$get === void 0 ? void 0 : _this$headers$get.includes("application/vnd.pgrst.plan+text")))
            data = body;
          else
            try {
              data = JSON.parse(body);
            } catch (_unused) {
              error = { message: body };
              data = null;
              if (_this2.shouldThrowOnError)
                throw new PostgrestError({
                  message: body,
                  details: "",
                  hint: "",
                  code: ""
                });
            }
        }
        const countHeader = (_this$headers$get2 = _this2.headers.get("Prefer")) === null || _this$headers$get2 === void 0 ? void 0 : _this$headers$get2.match(/count=(exact|planned|estimated)/);
        const contentRange = (_res$headers$get2 = res.headers.get("content-range")) === null || _res$headers$get2 === void 0 ? void 0 : _res$headers$get2.split("/");
        if (countHeader && contentRange && contentRange.length > 1)
          count = parseInt(contentRange[1]);
        if (_this2.isMaybeSingle && Array.isArray(data))
          if (data.length > 1) {
            error = {
              code: "PGRST116",
              details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
              hint: null,
              message: "JSON object requested, multiple (or no) rows returned"
            };
            data = null;
            count = null;
            status = 406;
            statusText = "Not Acceptable";
          } else if (data.length === 1)
            data = data[0];
          else
            data = null;
      } else {
        const body = await res.text();
        try {
          error = JSON.parse(body);
          if (Array.isArray(error) && res.status === 404) {
            data = [];
            error = null;
            status = 200;
            statusText = "OK";
          }
        } catch (_unused2) {
          if (res.status === 404 && body === "") {
            status = 204;
            statusText = "No Content";
          } else
            error = { message: body };
        }
        if (error && _this2.shouldThrowOnError)
          throw new PostgrestError(error);
      }
      return {
        success: error === null,
        error,
        data,
        count,
        status,
        statusText
      };
    }
    returns() {
      return this;
    }
    overrideTypes() {
      return this;
    }
  };
  var PostgrestTransformBuilder = class extends PostgrestBuilder {
    throwOnError() {
      return super.throwOnError();
    }
    select(columns) {
      let quoted = false;
      const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
        if (/\s/.test(c) && !quoted)
          return "";
        if (c === '"')
          quoted = !quoted;
        return c;
      }).join("");
      this.url.searchParams.set("select", cleanedColumns);
      this.headers.append("Prefer", "return=representation");
      return this;
    }
    order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable } = {}) {
      const key = referencedTable ? `${referencedTable}.order` : "order";
      const existingOrder = this.url.searchParams.get(key);
      this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
      return this;
    }
    limit(rows, { foreignTable, referencedTable = foreignTable } = {}) {
      const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
      this.url.searchParams.set(key, `${rows}`);
      return this;
    }
    range(from, to, { foreignTable, referencedTable = foreignTable } = {}) {
      const keyOffset = typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`;
      const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
      this.url.searchParams.set(keyOffset, `${from}`);
      this.url.searchParams.set(keyLimit, `${to - from + 1}`);
      return this;
    }
    abortSignal(signal) {
      this.signal = signal;
      return this;
    }
    single() {
      this.headers.set("Accept", "application/vnd.pgrst.object+json");
      return this;
    }
    maybeSingle() {
      this.isMaybeSingle = true;
      return this;
    }
    csv() {
      this.headers.set("Accept", "text/csv");
      return this;
    }
    geojson() {
      this.headers.set("Accept", "application/geo+json");
      return this;
    }
    explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = "text" } = {}) {
      var _this$headers$get;
      const options = [
        analyze ? "analyze" : null,
        verbose ? "verbose" : null,
        settings ? "settings" : null,
        buffers ? "buffers" : null,
        wal ? "wal" : null
      ].filter(Boolean).join("|");
      const forMediatype = (_this$headers$get = this.headers.get("Accept")) !== null && _this$headers$get !== void 0 ? _this$headers$get : "application/json";
      this.headers.set("Accept", `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`);
      if (format === "json")
        return this;
      else
        return this;
    }
    rollback() {
      this.headers.append("Prefer", "tx=rollback");
      return this;
    }
    returns() {
      return this;
    }
    maxAffected(rows) {
      this.headers.append("Prefer", "handling=strict");
      this.headers.append("Prefer", `max-affected=${rows}`);
      return this;
    }
  };
  var PostgrestReservedCharsRegexp = /* @__PURE__ */ new RegExp("[,()]");
  var PostgrestFilterBuilder = class extends PostgrestTransformBuilder {
    throwOnError() {
      return super.throwOnError();
    }
    eq(column, value) {
      this.url.searchParams.append(column, `eq.${value}`);
      return this;
    }
    neq(column, value) {
      this.url.searchParams.append(column, `neq.${value}`);
      return this;
    }
    gt(column, value) {
      this.url.searchParams.append(column, `gt.${value}`);
      return this;
    }
    gte(column, value) {
      this.url.searchParams.append(column, `gte.${value}`);
      return this;
    }
    lt(column, value) {
      this.url.searchParams.append(column, `lt.${value}`);
      return this;
    }
    lte(column, value) {
      this.url.searchParams.append(column, `lte.${value}`);
      return this;
    }
    like(column, pattern) {
      this.url.searchParams.append(column, `like.${pattern}`);
      return this;
    }
    likeAllOf(column, patterns) {
      this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`);
      return this;
    }
    likeAnyOf(column, patterns) {
      this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`);
      return this;
    }
    ilike(column, pattern) {
      this.url.searchParams.append(column, `ilike.${pattern}`);
      return this;
    }
    ilikeAllOf(column, patterns) {
      this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`);
      return this;
    }
    ilikeAnyOf(column, patterns) {
      this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`);
      return this;
    }
    regexMatch(column, pattern) {
      this.url.searchParams.append(column, `match.${pattern}`);
      return this;
    }
    regexIMatch(column, pattern) {
      this.url.searchParams.append(column, `imatch.${pattern}`);
      return this;
    }
    is(column, value) {
      this.url.searchParams.append(column, `is.${value}`);
      return this;
    }
    isDistinct(column, value) {
      this.url.searchParams.append(column, `isdistinct.${value}`);
      return this;
    }
    in(column, values) {
      const cleanedValues = Array.from(new Set(values)).map((s) => {
        if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s))
          return `"${s}"`;
        else
          return `${s}`;
      }).join(",");
      this.url.searchParams.append(column, `in.(${cleanedValues})`);
      return this;
    }
    notIn(column, values) {
      const cleanedValues = Array.from(new Set(values)).map((s) => {
        if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s))
          return `"${s}"`;
        else
          return `${s}`;
      }).join(",");
      this.url.searchParams.append(column, `not.in.(${cleanedValues})`);
      return this;
    }
    contains(column, value) {
      if (typeof value === "string")
        this.url.searchParams.append(column, `cs.${value}`);
      else if (Array.isArray(value))
        this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
      else
        this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
      return this;
    }
    containedBy(column, value) {
      if (typeof value === "string")
        this.url.searchParams.append(column, `cd.${value}`);
      else if (Array.isArray(value))
        this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
      else
        this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
      return this;
    }
    rangeGt(column, range) {
      this.url.searchParams.append(column, `sr.${range}`);
      return this;
    }
    rangeGte(column, range) {
      this.url.searchParams.append(column, `nxl.${range}`);
      return this;
    }
    rangeLt(column, range) {
      this.url.searchParams.append(column, `sl.${range}`);
      return this;
    }
    rangeLte(column, range) {
      this.url.searchParams.append(column, `nxr.${range}`);
      return this;
    }
    rangeAdjacent(column, range) {
      this.url.searchParams.append(column, `adj.${range}`);
      return this;
    }
    overlaps(column, value) {
      if (typeof value === "string")
        this.url.searchParams.append(column, `ov.${value}`);
      else
        this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
      return this;
    }
    textSearch(column, query, { config, type } = {}) {
      let typePart = "";
      if (type === "plain")
        typePart = "pl";
      else if (type === "phrase")
        typePart = "ph";
      else if (type === "websearch")
        typePart = "w";
      const configPart = config === void 0 ? "" : `(${config})`;
      this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
      return this;
    }
    match(query) {
      Object.entries(query).filter(([_, value]) => value !== void 0).forEach(([column, value]) => {
        this.url.searchParams.append(column, `eq.${value}`);
      });
      return this;
    }
    not(column, operator, value) {
      this.url.searchParams.append(column, `not.${operator}.${value}`);
      return this;
    }
    or(filters, { foreignTable, referencedTable = foreignTable } = {}) {
      const key = referencedTable ? `${referencedTable}.or` : "or";
      this.url.searchParams.append(key, `(${filters})`);
      return this;
    }
    filter(column, operator, value) {
      this.url.searchParams.append(column, `${operator}.${value}`);
      return this;
    }
  };
  var PostgrestQueryBuilder = class {
    constructor(url, { headers = {}, schema, fetch: fetch$1, urlLengthLimit = 8e3, retry }) {
      this.url = url;
      this.headers = new Headers(headers);
      this.schema = schema;
      this.fetch = fetch$1;
      this.urlLengthLimit = urlLengthLimit;
      this.retry = retry;
    }
    cloneRequestState() {
      return {
        url: new URL(this.url.toString()),
        headers: new Headers(this.headers)
      };
    }
    select(columns, options) {
      const { head: head2 = false, count } = options !== null && options !== void 0 ? options : {};
      const method = head2 ? "HEAD" : "GET";
      let quoted = false;
      const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
        if (/\s/.test(c) && !quoted)
          return "";
        if (c === '"')
          quoted = !quoted;
        return c;
      }).join("");
      const { url, headers } = this.cloneRequestState();
      url.searchParams.set("select", cleanedColumns);
      if (count)
        headers.append("Prefer", `count=${count}`);
      return new PostgrestFilterBuilder({
        method,
        url,
        headers,
        schema: this.schema,
        fetch: this.fetch,
        urlLengthLimit: this.urlLengthLimit,
        retry: this.retry
      });
    }
    insert(values, { count, defaultToNull = true } = {}) {
      var _this$fetch;
      const method = "POST";
      const { url, headers } = this.cloneRequestState();
      if (count)
        headers.append("Prefer", `count=${count}`);
      if (!defaultToNull)
        headers.append("Prefer", `missing=default`);
      if (Array.isArray(values)) {
        const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
        if (columns.length > 0) {
          const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
          url.searchParams.set("columns", uniqueColumns.join(","));
        }
      }
      return new PostgrestFilterBuilder({
        method,
        url,
        headers,
        schema: this.schema,
        body: values,
        fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch,
        urlLengthLimit: this.urlLengthLimit,
        retry: this.retry
      });
    }
    upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true } = {}) {
      var _this$fetch2;
      const method = "POST";
      const { url, headers } = this.cloneRequestState();
      headers.append("Prefer", `resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`);
      if (onConflict !== void 0)
        url.searchParams.set("on_conflict", onConflict);
      if (count)
        headers.append("Prefer", `count=${count}`);
      if (!defaultToNull)
        headers.append("Prefer", "missing=default");
      if (Array.isArray(values)) {
        const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
        if (columns.length > 0) {
          const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
          url.searchParams.set("columns", uniqueColumns.join(","));
        }
      }
      return new PostgrestFilterBuilder({
        method,
        url,
        headers,
        schema: this.schema,
        body: values,
        fetch: (_this$fetch2 = this.fetch) !== null && _this$fetch2 !== void 0 ? _this$fetch2 : fetch,
        urlLengthLimit: this.urlLengthLimit,
        retry: this.retry
      });
    }
    update(values, { count } = {}) {
      var _this$fetch3;
      const method = "PATCH";
      const { url, headers } = this.cloneRequestState();
      if (count)
        headers.append("Prefer", `count=${count}`);
      return new PostgrestFilterBuilder({
        method,
        url,
        headers,
        schema: this.schema,
        body: values,
        fetch: (_this$fetch3 = this.fetch) !== null && _this$fetch3 !== void 0 ? _this$fetch3 : fetch,
        urlLengthLimit: this.urlLengthLimit,
        retry: this.retry
      });
    }
    delete({ count } = {}) {
      var _this$fetch4;
      const method = "DELETE";
      const { url, headers } = this.cloneRequestState();
      if (count)
        headers.append("Prefer", `count=${count}`);
      return new PostgrestFilterBuilder({
        method,
        url,
        headers,
        schema: this.schema,
        fetch: (_this$fetch4 = this.fetch) !== null && _this$fetch4 !== void 0 ? _this$fetch4 : fetch,
        urlLengthLimit: this.urlLengthLimit,
        retry: this.retry
      });
    }
  };
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
      return typeof o$1;
    } : function(o$1) {
      return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, _typeof(o);
  }
  function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t)
      return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof(i))
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r$1) {
        return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r$1) {
        _defineProperty(e, r$1, t[r$1]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r$1) {
        Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
      });
    }
    return e;
  }
  var PostgrestClient = class PostgrestClient2 {
    constructor(url, { headers = {}, schema, fetch: fetch$1, timeout, urlLengthLimit = 8e3, retry } = {}) {
      this.url = url;
      this.headers = new Headers(headers);
      this.schemaName = schema;
      this.urlLengthLimit = urlLengthLimit;
      const originalFetch = fetch$1 !== null && fetch$1 !== void 0 ? fetch$1 : globalThis.fetch;
      if (timeout !== void 0 && timeout > 0)
        this.fetch = (input, init) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          const existingSignal = init === null || init === void 0 ? void 0 : init.signal;
          if (existingSignal) {
            if (existingSignal.aborted) {
              clearTimeout(timeoutId);
              return originalFetch(input, init);
            }
            const abortHandler = () => {
              clearTimeout(timeoutId);
              controller.abort();
            };
            existingSignal.addEventListener("abort", abortHandler, { once: true });
            return originalFetch(input, _objectSpread2(_objectSpread2({}, init), {}, { signal: controller.signal })).finally(() => {
              clearTimeout(timeoutId);
              existingSignal.removeEventListener("abort", abortHandler);
            });
          }
          return originalFetch(input, _objectSpread2(_objectSpread2({}, init), {}, { signal: controller.signal })).finally(() => clearTimeout(timeoutId));
        };
      else
        this.fetch = originalFetch;
      this.retry = retry;
    }
    from(relation) {
      if (!relation || typeof relation !== "string" || relation.trim() === "")
        throw new Error("Invalid relation name: relation must be a non-empty string.");
      return new PostgrestQueryBuilder(new URL(`${this.url}/${relation}`), {
        headers: new Headers(this.headers),
        schema: this.schemaName,
        fetch: this.fetch,
        urlLengthLimit: this.urlLengthLimit,
        retry: this.retry
      });
    }
    schema(schema) {
      return new PostgrestClient2(this.url, {
        headers: this.headers,
        schema,
        fetch: this.fetch,
        urlLengthLimit: this.urlLengthLimit,
        retry: this.retry
      });
    }
    rpc(fn, args = {}, { head: head2 = false, get: get2 = false, count } = {}) {
      var _this$fetch;
      let method;
      const url = new URL(`${this.url}/rpc/${fn}`);
      let body;
      const _isObject = (v) => v !== null && typeof v === "object" && (!Array.isArray(v) || v.some(_isObject));
      const _hasObjectArg = head2 && Object.values(args).some(_isObject);
      if (_hasObjectArg) {
        method = "POST";
        body = args;
      } else if (head2 || get2) {
        method = head2 ? "HEAD" : "GET";
        Object.entries(args).filter(([_, value]) => value !== void 0).map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(",")}}` : `${value}`]).forEach(([name, value]) => {
          url.searchParams.append(name, value);
        });
      } else {
        method = "POST";
        body = args;
      }
      const headers = new Headers(this.headers);
      if (_hasObjectArg)
        headers.set("Prefer", count ? `count=${count},return=minimal` : "return=minimal");
      else if (count)
        headers.set("Prefer", `count=${count}`);
      return new PostgrestFilterBuilder({
        method,
        url,
        headers,
        schema: this.schemaName,
        body,
        fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch,
        urlLengthLimit: this.urlLengthLimit,
        retry: this.retry
      });
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
  var WebSocketFactory = class {
    constructor() {
    }
    static detectEnvironment() {
      var _a;
      if (typeof WebSocket !== "undefined") {
        return { type: "native", wsConstructor: WebSocket };
      }
      const gt = globalThis;
      if (typeof globalThis !== "undefined" && typeof gt.WebSocket !== "undefined") {
        return { type: "native", wsConstructor: gt.WebSocket };
      }
      const gl = typeof global !== "undefined" ? global : void 0;
      if (gl && typeof gl.WebSocket !== "undefined") {
        return { type: "native", wsConstructor: gl.WebSocket };
      }
      if (typeof globalThis !== "undefined" && typeof gt.WebSocketPair !== "undefined" && typeof globalThis.WebSocket === "undefined") {
        return {
          type: "cloudflare",
          error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",
          workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."
        };
      }
      if (typeof globalThis !== "undefined" && gt.EdgeRuntime || typeof navigator !== "undefined" && ((_a = navigator.userAgent) === null || _a === void 0 ? void 0 : _a.includes("Vercel-Edge"))) {
        return {
          type: "unsupported",
          error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",
          workaround: "Use serverless functions or a different deployment target for WebSocket functionality."
        };
      }
      const _process = globalThis["process"];
      if (_process) {
        const processVersions = _process["versions"];
        if (processVersions && processVersions["node"]) {
          const versionString = processVersions["node"];
          const nodeVersion = parseInt(versionString.replace(/^v/, "").split(".")[0]);
          if (nodeVersion >= 22) {
            if (typeof globalThis.WebSocket !== "undefined") {
              return { type: "native", wsConstructor: globalThis.WebSocket };
            }
            return {
              type: "unsupported",
              error: `Node.js ${nodeVersion} detected but native WebSocket not found.`,
              workaround: "Provide a WebSocket implementation via the transport option."
            };
          }
          return {
            type: "unsupported",
            error: `Node.js ${nodeVersion} detected without native WebSocket support.`,
            workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\nimport ws from "ws"\nnew RealtimeClient(url, { transport: ws })'
          };
        }
      }
      return {
        type: "unsupported",
        error: "Unknown JavaScript runtime without WebSocket support.",
        workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
      };
    }
    static getWebSocketConstructor() {
      const env = this.detectEnvironment();
      if (env.wsConstructor) {
        return env.wsConstructor;
      }
      let errorMessage = env.error || "WebSocket not supported in this environment.";
      if (env.workaround) {
        errorMessage += `

Suggested solution: ${env.workaround}`;
      }
      throw new Error(errorMessage);
    }
    static isWebSocketSupported() {
      try {
        const env = this.detectEnvironment();
        return env.type === "native" || env.type === "ws";
      } catch (_a) {
        return false;
      }
    }
  };
  var websocket_factory_default = WebSocketFactory;

  // node_modules/@supabase/realtime-js/dist/module/lib/version.js
  var version = "2.108.2";

  // node_modules/@supabase/realtime-js/dist/module/lib/constants.js
  var DEFAULT_VERSION = `realtime-js/${version}`;
  var VSN_1_0_0 = "1.0.0";
  var VSN_2_0_0 = "2.0.0";
  var DEFAULT_VSN = VSN_2_0_0;
  var DEFAULT_TIMEOUT = 1e4;
  var MAX_PUSH_BUFFER_SIZE = 100;
  var CHANNEL_STATES = {
    closed: "closed",
    errored: "errored",
    joined: "joined",
    joining: "joining",
    leaving: "leaving"
  };
  var CHANNEL_EVENTS = {
    close: "phx_close",
    error: "phx_error",
    join: "phx_join",
    reply: "phx_reply",
    leave: "phx_leave",
    access_token: "access_token"
  };
  var CONNECTION_STATE = {
    connecting: "connecting",
    open: "open",
    closing: "closing",
    closed: "closed"
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/serializer.js
  var Serializer = class {
    constructor(allowedMetadataKeys) {
      this.HEADER_LENGTH = 1;
      this.USER_BROADCAST_PUSH_META_LENGTH = 6;
      this.KINDS = { userBroadcastPush: 3, userBroadcast: 4 };
      this.BINARY_ENCODING = 0;
      this.JSON_ENCODING = 1;
      this.BROADCAST_EVENT = "broadcast";
      this.allowedMetadataKeys = [];
      this.allowedMetadataKeys = allowedMetadataKeys !== null && allowedMetadataKeys !== void 0 ? allowedMetadataKeys : [];
    }
    encode(msg, callback) {
      if (msg.event === this.BROADCAST_EVENT && !(msg.payload instanceof ArrayBuffer) && typeof msg.payload.event === "string") {
        return callback(this._binaryEncodeUserBroadcastPush(msg));
      }
      let payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload];
      return callback(JSON.stringify(payload));
    }
    _binaryEncodeUserBroadcastPush(message) {
      var _a;
      if (this._isArrayBuffer((_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload)) {
        return this._encodeBinaryUserBroadcastPush(message);
      } else {
        return this._encodeJsonUserBroadcastPush(message);
      }
    }
    _encodeBinaryUserBroadcastPush(message) {
      var _a, _b;
      const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : new ArrayBuffer(0);
      return this._encodeUserBroadcastPush(message, this.BINARY_ENCODING, userPayload);
    }
    _encodeJsonUserBroadcastPush(message) {
      var _a, _b;
      const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : {};
      const encoder = new TextEncoder();
      const encodedUserPayload = encoder.encode(JSON.stringify(userPayload)).buffer;
      return this._encodeUserBroadcastPush(message, this.JSON_ENCODING, encodedUserPayload);
    }
    _encodeUserBroadcastPush(message, encodingType, encodedPayload) {
      var _a, _b;
      const topic = message.topic;
      const ref = (_a = message.ref) !== null && _a !== void 0 ? _a : "";
      const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : "";
      const userEvent = message.payload.event;
      const rest = this.allowedMetadataKeys ? this._pick(message.payload, this.allowedMetadataKeys) : {};
      const metadata = Object.keys(rest).length === 0 ? "" : JSON.stringify(rest);
      if (joinRef.length > 255) {
        throw new Error(`joinRef length ${joinRef.length} exceeds maximum of 255`);
      }
      if (ref.length > 255) {
        throw new Error(`ref length ${ref.length} exceeds maximum of 255`);
      }
      if (topic.length > 255) {
        throw new Error(`topic length ${topic.length} exceeds maximum of 255`);
      }
      if (userEvent.length > 255) {
        throw new Error(`userEvent length ${userEvent.length} exceeds maximum of 255`);
      }
      if (metadata.length > 255) {
        throw new Error(`metadata length ${metadata.length} exceeds maximum of 255`);
      }
      const metaLength = this.USER_BROADCAST_PUSH_META_LENGTH + joinRef.length + ref.length + topic.length + userEvent.length + metadata.length;
      const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
      let view = new DataView(header);
      let offset = 0;
      view.setUint8(offset++, this.KINDS.userBroadcastPush);
      view.setUint8(offset++, joinRef.length);
      view.setUint8(offset++, ref.length);
      view.setUint8(offset++, topic.length);
      view.setUint8(offset++, userEvent.length);
      view.setUint8(offset++, metadata.length);
      view.setUint8(offset++, encodingType);
      Array.from(joinRef, (char) => view.setUint8(offset++, char.charCodeAt(0)));
      Array.from(ref, (char) => view.setUint8(offset++, char.charCodeAt(0)));
      Array.from(topic, (char) => view.setUint8(offset++, char.charCodeAt(0)));
      Array.from(userEvent, (char) => view.setUint8(offset++, char.charCodeAt(0)));
      Array.from(metadata, (char) => view.setUint8(offset++, char.charCodeAt(0)));
      var combined = new Uint8Array(header.byteLength + encodedPayload.byteLength);
      combined.set(new Uint8Array(header), 0);
      combined.set(new Uint8Array(encodedPayload), header.byteLength);
      return combined.buffer;
    }
    decode(rawPayload, callback) {
      if (this._isArrayBuffer(rawPayload)) {
        let result = this._binaryDecode(rawPayload);
        return callback(result);
      }
      if (typeof rawPayload === "string") {
        const jsonPayload = JSON.parse(rawPayload);
        const [join_ref, ref, topic, event, payload] = jsonPayload;
        return callback({ join_ref, ref, topic, event, payload });
      }
      return callback({});
    }
    _binaryDecode(buffer) {
      const view = new DataView(buffer);
      const kind = view.getUint8(0);
      const decoder = new TextDecoder();
      switch (kind) {
        case this.KINDS.userBroadcast:
          return this._decodeUserBroadcast(buffer, view, decoder);
      }
    }
    _decodeUserBroadcast(buffer, view, decoder) {
      const topicSize = view.getUint8(1);
      const userEventSize = view.getUint8(2);
      const metadataSize = view.getUint8(3);
      const payloadEncoding = view.getUint8(4);
      let offset = this.HEADER_LENGTH + 4;
      const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
      offset = offset + topicSize;
      const userEvent = decoder.decode(buffer.slice(offset, offset + userEventSize));
      offset = offset + userEventSize;
      const metadata = decoder.decode(buffer.slice(offset, offset + metadataSize));
      offset = offset + metadataSize;
      const payload = buffer.slice(offset, buffer.byteLength);
      const parsedPayload = payloadEncoding === this.JSON_ENCODING ? JSON.parse(decoder.decode(payload)) : payload;
      const data = {
        type: this.BROADCAST_EVENT,
        event: userEvent,
        payload: parsedPayload
      };
      if (metadataSize > 0) {
        data["meta"] = JSON.parse(metadata);
      }
      return { join_ref: null, ref: null, topic, event: this.BROADCAST_EVENT, payload: data };
    }
    _isArrayBuffer(buffer) {
      var _a;
      return buffer instanceof ArrayBuffer || ((_a = buffer === null || buffer === void 0 ? void 0 : buffer.constructor) === null || _a === void 0 ? void 0 : _a.name) === "ArrayBuffer";
    }
    _pick(obj, keys) {
      if (!obj || typeof obj !== "object") {
        return {};
      }
      return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/transformers.js
  var PostgresTypes;
  (function(PostgresTypes2) {
    PostgresTypes2["abstime"] = "abstime";
    PostgresTypes2["bool"] = "bool";
    PostgresTypes2["date"] = "date";
    PostgresTypes2["daterange"] = "daterange";
    PostgresTypes2["float4"] = "float4";
    PostgresTypes2["float8"] = "float8";
    PostgresTypes2["int2"] = "int2";
    PostgresTypes2["int4"] = "int4";
    PostgresTypes2["int4range"] = "int4range";
    PostgresTypes2["int8"] = "int8";
    PostgresTypes2["int8range"] = "int8range";
    PostgresTypes2["json"] = "json";
    PostgresTypes2["jsonb"] = "jsonb";
    PostgresTypes2["money"] = "money";
    PostgresTypes2["numeric"] = "numeric";
    PostgresTypes2["oid"] = "oid";
    PostgresTypes2["reltime"] = "reltime";
    PostgresTypes2["text"] = "text";
    PostgresTypes2["time"] = "time";
    PostgresTypes2["timestamp"] = "timestamp";
    PostgresTypes2["timestamptz"] = "timestamptz";
    PostgresTypes2["timetz"] = "timetz";
    PostgresTypes2["tsrange"] = "tsrange";
    PostgresTypes2["tstzrange"] = "tstzrange";
  })(PostgresTypes || (PostgresTypes = {}));
  var convertChangeData = (columns, record, options = {}) => {
    var _a;
    const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
    if (!record) {
      return {};
    }
    return Object.keys(record).reduce((acc, rec_key) => {
      acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
      return acc;
    }, {});
  };
  var convertColumn = (columnName, columns, record, skipTypes) => {
    const column = columns.find((x) => x.name === columnName);
    const colType = column === null || column === void 0 ? void 0 : column.type;
    const value = record[columnName];
    if (colType && !skipTypes.includes(colType)) {
      return convertCell(colType, value);
    }
    return noop(value);
  };
  var convertCell = (type, value) => {
    if (type.charAt(0) === "_") {
      const dataType = type.slice(1, type.length);
      return toArray(value, dataType);
    }
    switch (type) {
      case PostgresTypes.bool:
        return toBoolean(value);
      case PostgresTypes.float4:
      case PostgresTypes.float8:
      case PostgresTypes.int2:
      case PostgresTypes.int4:
      case PostgresTypes.int8:
      case PostgresTypes.numeric:
      case PostgresTypes.oid:
        return toNumber(value);
      case PostgresTypes.json:
      case PostgresTypes.jsonb:
        return toJson(value);
      case PostgresTypes.timestamp:
        return toTimestampString(value);
      case PostgresTypes.abstime:
      case PostgresTypes.date:
      case PostgresTypes.daterange:
      case PostgresTypes.int4range:
      case PostgresTypes.int8range:
      case PostgresTypes.money:
      case PostgresTypes.reltime:
      case PostgresTypes.text:
      case PostgresTypes.time:
      case PostgresTypes.timestamptz:
      case PostgresTypes.timetz:
      case PostgresTypes.tsrange:
      case PostgresTypes.tstzrange:
        return noop(value);
      default:
        return noop(value);
    }
  };
  var noop = (value) => {
    return value;
  };
  var toBoolean = (value) => {
    switch (value) {
      case "t":
        return true;
      case "f":
        return false;
      default:
        return value;
    }
  };
  var toNumber = (value) => {
    if (typeof value === "string") {
      const parsedValue = parseFloat(value);
      if (!Number.isNaN(parsedValue)) {
        return parsedValue;
      }
    }
    return value;
  };
  var toJson = (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (_a) {
        return value;
      }
    }
    return value;
  };
  var toArray = (value, type) => {
    if (typeof value !== "string") {
      return value;
    }
    const lastIdx = value.length - 1;
    const closeBrace = value[lastIdx];
    const openBrace = value[0];
    if (openBrace === "{" && closeBrace === "}") {
      let arr;
      const valTrim = value.slice(1, lastIdx);
      try {
        arr = JSON.parse("[" + valTrim + "]");
      } catch (_) {
        arr = valTrim ? valTrim.split(",") : [];
      }
      return arr.map((val) => convertCell(type, val));
    }
    return value;
  };
  var toTimestampString = (value) => {
    if (typeof value === "string") {
      return value.replace(" ", "T");
    }
    return value;
  };
  var httpEndpointURL = (socketUrl) => {
    const wsUrl = new URL(socketUrl);
    wsUrl.protocol = wsUrl.protocol.replace(/^ws/i, "http");
    wsUrl.pathname = wsUrl.pathname.replace(/\/+$/, "").replace(/\/socket\/websocket$/i, "").replace(/\/socket$/i, "").replace(/\/websocket$/i, "");
    if (wsUrl.pathname === "" || wsUrl.pathname === "/") {
      wsUrl.pathname = "/api/broadcast";
    } else {
      wsUrl.pathname = wsUrl.pathname + "/api/broadcast";
    }
    return wsUrl.href;
  };

  // node_modules/@supabase/phoenix/priv/static/phoenix.mjs
  var closure = (value) => {
    if (typeof value === "function") {
      return value;
    } else {
      let closure2 = function() {
        return value;
      };
      return closure2;
    }
  };
  var globalSelf = typeof self !== "undefined" ? self : null;
  var phxWindow = typeof window !== "undefined" ? window : null;
  var global2 = globalSelf || phxWindow || globalThis;
  var DEFAULT_VSN2 = "2.0.0";
  var DEFAULT_TIMEOUT2 = 1e4;
  var WS_CLOSE_NORMAL = 1e3;
  var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
  var CHANNEL_STATES2 = {
    closed: "closed",
    errored: "errored",
    joined: "joined",
    joining: "joining",
    leaving: "leaving"
  };
  var CHANNEL_EVENTS2 = {
    close: "phx_close",
    error: "phx_error",
    join: "phx_join",
    reply: "phx_reply",
    leave: "phx_leave"
  };
  var TRANSPORTS = {
    longpoll: "longpoll",
    websocket: "websocket"
  };
  var XHR_STATES = {
    complete: 4
  };
  var AUTH_TOKEN_PREFIX = "base64url.bearer.phx.";
  var Push = class {
    constructor(channel, event, payload, timeout) {
      this.channel = channel;
      this.event = event;
      this.payload = payload || function() {
        return {};
      };
      this.receivedResp = null;
      this.timeout = timeout;
      this.timeoutTimer = null;
      this.recHooks = [];
      this.sent = false;
      this.ref = void 0;
    }
    resend(timeout) {
      this.timeout = timeout;
      this.reset();
      this.send();
    }
    send() {
      if (this.hasReceived("timeout")) {
        return;
      }
      this.startTimeout();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload(),
        ref: this.ref,
        join_ref: this.channel.joinRef()
      });
    }
    receive(status, callback) {
      if (this.hasReceived(status)) {
        callback(this.receivedResp.response);
      }
      this.recHooks.push({ status, callback });
      return this;
    }
    reset() {
      this.cancelRefEvent();
      this.ref = null;
      this.refEvent = null;
      this.receivedResp = null;
      this.sent = false;
    }
    destroy() {
      this.cancelRefEvent();
      this.cancelTimeout();
    }
    matchReceive({ status, response, _ref }) {
      this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response));
    }
    cancelRefEvent() {
      if (!this.refEvent) {
        return;
      }
      this.channel.off(this.refEvent);
    }
    cancelTimeout() {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    startTimeout() {
      if (this.timeoutTimer) {
        this.cancelTimeout();
      }
      this.ref = this.channel.socket.makeRef();
      this.refEvent = this.channel.replyEventName(this.ref);
      this.channel.on(this.refEvent, (payload) => {
        this.cancelRefEvent();
        this.cancelTimeout();
        this.receivedResp = payload;
        this.matchReceive(payload);
      });
      this.timeoutTimer = setTimeout(() => {
        this.trigger("timeout", {});
      }, this.timeout);
    }
    hasReceived(status) {
      return this.receivedResp && this.receivedResp.status === status;
    }
    trigger(status, response) {
      this.channel.trigger(this.refEvent, { status, response });
    }
  };
  var Timer = class {
    constructor(callback, timerCalc) {
      this.callback = callback;
      this.timerCalc = timerCalc;
      this.timer = void 0;
      this.tries = 0;
    }
    reset() {
      this.tries = 0;
      clearTimeout(this.timer);
    }
    scheduleTimeout() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.tries = this.tries + 1;
        this.callback();
      }, this.timerCalc(this.tries + 1));
    }
  };
  var Channel = class {
    constructor(topic, params, socket) {
      this.state = CHANNEL_STATES2.closed;
      this.topic = topic;
      this.params = closure(params || {});
      this.socket = socket;
      this.bindings = [];
      this.bindingRef = 0;
      this.timeout = this.socket.timeout;
      this.joinedOnce = false;
      this.joinPush = new Push(this, CHANNEL_EVENTS2.join, this.params, this.timeout);
      this.pushBuffer = [];
      this.stateChangeRefs = [];
      this.rejoinTimer = new Timer(() => {
        if (this.socket.isConnected()) {
          this.rejoin();
        }
      }, this.socket.rejoinAfterMs);
      this.stateChangeRefs.push(this.socket.onError(() => this.rejoinTimer.reset()));
      this.stateChangeRefs.push(
        this.socket.onOpen(() => {
          this.rejoinTimer.reset();
          if (this.isErrored()) {
            this.rejoin();
          }
        })
      );
      this.joinPush.receive("ok", () => {
        this.state = CHANNEL_STATES2.joined;
        this.rejoinTimer.reset();
        this.pushBuffer.forEach((pushEvent) => pushEvent.send());
        this.pushBuffer = [];
      });
      this.joinPush.receive("error", (reason) => {
        this.state = CHANNEL_STATES2.errored;
        if (this.socket.hasLogger())
          this.socket.log("channel", `error ${this.topic}`, reason);
        if (this.socket.isConnected()) {
          this.rejoinTimer.scheduleTimeout();
        }
      });
      this.onClose(() => {
        this.rejoinTimer.reset();
        if (this.socket.hasLogger())
          this.socket.log("channel", `close ${this.topic}`);
        this.state = CHANNEL_STATES2.closed;
        this.socket.remove(this);
      });
      this.onError((reason) => {
        if (this.socket.hasLogger())
          this.socket.log("channel", `error ${this.topic}`, reason);
        if (this.isJoining()) {
          this.joinPush.reset();
        }
        this.state = CHANNEL_STATES2.errored;
        if (this.socket.isConnected()) {
          this.rejoinTimer.scheduleTimeout();
        }
      });
      this.joinPush.receive("timeout", () => {
        if (this.socket.hasLogger())
          this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout);
        let leavePush = new Push(this, CHANNEL_EVENTS2.leave, closure({}), this.timeout);
        leavePush.send();
        this.state = CHANNEL_STATES2.errored;
        this.joinPush.reset();
        if (this.socket.isConnected()) {
          this.rejoinTimer.scheduleTimeout();
        }
      });
      this.on(CHANNEL_EVENTS2.reply, (payload, ref) => {
        this.trigger(this.replyEventName(ref), payload);
      });
    }
    join(timeout = this.timeout) {
      if (this.joinedOnce) {
        throw new Error("tried to join multiple times. 'join' can only be called a single time per channel instance");
      } else {
        this.timeout = timeout;
        this.joinedOnce = true;
        this.rejoin();
        return this.joinPush;
      }
    }
    teardown() {
      this.pushBuffer.forEach((push) => push.destroy());
      this.pushBuffer = [];
      this.rejoinTimer.reset();
      this.joinPush.destroy();
      this.state = CHANNEL_STATES2.closed;
      this.bindings = [];
    }
    onClose(callback) {
      this.on(CHANNEL_EVENTS2.close, callback);
    }
    onError(callback) {
      return this.on(CHANNEL_EVENTS2.error, (reason) => callback(reason));
    }
    on(event, callback) {
      let ref = this.bindingRef++;
      this.bindings.push({ event, ref, callback });
      return ref;
    }
    off(event, ref) {
      this.bindings = this.bindings.filter((bind) => {
        return !(bind.event === event && (typeof ref === "undefined" || ref === bind.ref));
      });
    }
    canPush() {
      return this.socket.isConnected() && this.isJoined();
    }
    push(event, payload, timeout = this.timeout) {
      payload = payload || {};
      if (!this.joinedOnce) {
        throw new Error(`tried to push '${event}' to '${this.topic}' before joining. Use channel.join() before pushing events`);
      }
      let pushEvent = new Push(this, event, function() {
        return payload;
      }, timeout);
      if (this.canPush()) {
        pushEvent.send();
      } else {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
      }
      return pushEvent;
    }
    leave(timeout = this.timeout) {
      this.rejoinTimer.reset();
      this.joinPush.cancelTimeout();
      this.state = CHANNEL_STATES2.leaving;
      let onClose = () => {
        if (this.socket.hasLogger())
          this.socket.log("channel", `leave ${this.topic}`);
        this.trigger(CHANNEL_EVENTS2.close, "leave");
      };
      let leavePush = new Push(this, CHANNEL_EVENTS2.leave, closure({}), timeout);
      leavePush.receive("ok", () => onClose()).receive("timeout", () => onClose());
      leavePush.send();
      if (!this.canPush()) {
        leavePush.trigger("ok", {});
      }
      return leavePush;
    }
    onMessage(_event, payload, _ref) {
      return payload;
    }
    filterBindings(_binding, _payload, _ref) {
      return true;
    }
    isMember(topic, event, payload, joinRef) {
      if (this.topic !== topic) {
        return false;
      }
      if (joinRef && joinRef !== this.joinRef()) {
        if (this.socket.hasLogger())
          this.socket.log("channel", "dropping outdated message", { topic, event, payload, joinRef });
        return false;
      } else {
        return true;
      }
    }
    joinRef() {
      return this.joinPush.ref;
    }
    rejoin(timeout = this.timeout) {
      if (this.isLeaving()) {
        return;
      }
      this.socket.leaveOpenTopic(this.topic);
      this.state = CHANNEL_STATES2.joining;
      this.joinPush.resend(timeout);
    }
    trigger(event, payload, ref, joinRef) {
      let handledPayload = this.onMessage(event, payload, ref, joinRef);
      if (payload && !handledPayload) {
        throw new Error("channel onMessage callbacks must return the payload, modified or unmodified");
      }
      let eventBindings = this.bindings.filter((bind) => bind.event === event && this.filterBindings(bind, payload, ref));
      for (let i = 0; i < eventBindings.length; i++) {
        let bind = eventBindings[i];
        bind.callback(handledPayload, ref, joinRef || this.joinRef());
      }
    }
    replyEventName(ref) {
      return `chan_reply_${ref}`;
    }
    isClosed() {
      return this.state === CHANNEL_STATES2.closed;
    }
    isErrored() {
      return this.state === CHANNEL_STATES2.errored;
    }
    isJoined() {
      return this.state === CHANNEL_STATES2.joined;
    }
    isJoining() {
      return this.state === CHANNEL_STATES2.joining;
    }
    isLeaving() {
      return this.state === CHANNEL_STATES2.leaving;
    }
  };
  var Ajax = class {
    static request(method, endPoint, headers, body, timeout, ontimeout, callback) {
      if (global2.XDomainRequest) {
        let req = new global2.XDomainRequest();
        return this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
      } else if (global2.XMLHttpRequest) {
        let req = new global2.XMLHttpRequest();
        return this.xhrRequest(req, method, endPoint, headers, body, timeout, ontimeout, callback);
      } else if (global2.fetch && global2.AbortController) {
        return this.fetchRequest(method, endPoint, headers, body, timeout, ontimeout, callback);
      } else {
        throw new Error("No suitable XMLHttpRequest implementation found");
      }
    }
    static fetchRequest(method, endPoint, headers, body, timeout, ontimeout, callback) {
      let options = {
        method,
        headers,
        body
      };
      let controller = null;
      if (timeout) {
        controller = new AbortController();
        const _timeoutId = setTimeout(() => controller.abort(), timeout);
        options.signal = controller.signal;
      }
      global2.fetch(endPoint, options).then((response) => response.text()).then((data) => this.parseJSON(data)).then((data) => callback && callback(data)).catch((err) => {
        if (err.name === "AbortError" && ontimeout) {
          ontimeout();
        } else {
          callback && callback(null);
        }
      });
      return controller;
    }
    static xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
      req.timeout = timeout;
      req.open(method, endPoint);
      req.onload = () => {
        let response = this.parseJSON(req.responseText);
        callback && callback(response);
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }
      req.onprogress = () => {
      };
      req.send(body);
      return req;
    }
    static xhrRequest(req, method, endPoint, headers, body, timeout, ontimeout, callback) {
      req.open(method, endPoint, true);
      req.timeout = timeout;
      for (let [key, value] of Object.entries(headers)) {
        req.setRequestHeader(key, value);
      }
      req.onerror = () => callback && callback(null);
      req.onreadystatechange = () => {
        if (req.readyState === XHR_STATES.complete && callback) {
          let response = this.parseJSON(req.responseText);
          callback(response);
        }
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }
      req.send(body);
      return req;
    }
    static parseJSON(resp) {
      if (!resp || resp === "") {
        return null;
      }
      try {
        return JSON.parse(resp);
      } catch {
        console && console.log("failed to parse JSON response", resp);
        return null;
      }
    }
    static serialize(obj, parentKey) {
      let queryStr = [];
      for (var key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
          continue;
        }
        let paramKey = parentKey ? `${parentKey}[${key}]` : key;
        let paramVal = obj[key];
        if (typeof paramVal === "object") {
          queryStr.push(this.serialize(paramVal, paramKey));
        } else {
          queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
        }
      }
      return queryStr.join("&");
    }
    static appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }
      let prefix = url.match(/\?/) ? "&" : "?";
      return `${url}${prefix}${this.serialize(params)}`;
    }
  };
  var arrayBufferToBase64 = (buffer) => {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };
  var LongPoll = class {
    constructor(endPoint, protocols) {
      if (protocols && protocols.length === 2 && protocols[1].startsWith(AUTH_TOKEN_PREFIX)) {
        this.authToken = atob(protocols[1].slice(AUTH_TOKEN_PREFIX.length));
      }
      this.endPoint = null;
      this.token = null;
      this.skipHeartbeat = true;
      this.reqs = /* @__PURE__ */ new Set();
      this.awaitingBatchAck = false;
      this.currentBatch = null;
      this.currentBatchTimer = null;
      this.batchBuffer = [];
      this.onopen = function() {
      };
      this.onerror = function() {
      };
      this.onmessage = function() {
      };
      this.onclose = function() {
      };
      this.pollEndpoint = this.normalizeEndpoint(endPoint);
      this.readyState = SOCKET_STATES.connecting;
      setTimeout(() => this.poll(), 0);
    }
    normalizeEndpoint(endPoint) {
      return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
    }
    endpointURL() {
      return Ajax.appendParams(this.pollEndpoint, { token: this.token });
    }
    closeAndRetry(code, reason, wasClean) {
      this.close(code, reason, wasClean);
      this.readyState = SOCKET_STATES.connecting;
    }
    ontimeout() {
      this.onerror("timeout");
      this.closeAndRetry(1005, "timeout", false);
    }
    isActive() {
      return this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting;
    }
    poll() {
      const headers = { "Accept": "application/json" };
      if (this.authToken) {
        headers["X-Phoenix-AuthToken"] = this.authToken;
      }
      this.ajax("GET", headers, null, () => this.ontimeout(), (resp) => {
        if (resp) {
          var { status, token, messages } = resp;
          if (status === 410 && this.token !== null) {
            this.onerror(410);
            this.closeAndRetry(3410, "session_gone", false);
            return;
          }
          this.token = token;
        } else {
          status = 0;
        }
        switch (status) {
          case 200:
            messages.forEach((msg) => {
              setTimeout(() => this.onmessage({ data: msg }), 0);
            });
            this.poll();
            break;
          case 204:
            this.poll();
            break;
          case 410:
            this.readyState = SOCKET_STATES.open;
            this.onopen({});
            this.poll();
            break;
          case 403:
            this.onerror(403);
            this.close(1008, "forbidden", false);
            break;
          case 0:
          case 500:
            this.onerror(500);
            this.closeAndRetry(1011, "internal server error", 500);
            break;
          default:
            throw new Error(`unhandled poll status ${status}`);
        }
      });
    }
    send(body) {
      if (typeof body !== "string") {
        body = arrayBufferToBase64(body);
      }
      if (this.currentBatch) {
        this.currentBatch.push(body);
      } else if (this.awaitingBatchAck) {
        this.batchBuffer.push(body);
      } else {
        this.currentBatch = [body];
        this.currentBatchTimer = setTimeout(() => {
          this.batchSend(this.currentBatch);
          this.currentBatch = null;
        }, 0);
      }
    }
    batchSend(messages) {
      this.awaitingBatchAck = true;
      this.ajax("POST", { "Content-Type": "application/x-ndjson" }, messages.join("\n"), () => this.onerror("timeout"), (resp) => {
        this.awaitingBatchAck = false;
        if (!resp || resp.status !== 200) {
          this.onerror(resp && resp.status);
          this.closeAndRetry(1011, "internal server error", false);
        } else if (this.batchBuffer.length > 0) {
          this.batchSend(this.batchBuffer);
          this.batchBuffer = [];
        }
      });
    }
    close(code, reason, wasClean) {
      for (let req of this.reqs) {
        req.abort();
      }
      this.readyState = SOCKET_STATES.closed;
      let opts = Object.assign({ code: 1e3, reason: void 0, wasClean: true }, { code, reason, wasClean });
      this.batchBuffer = [];
      clearTimeout(this.currentBatchTimer);
      this.currentBatchTimer = null;
      if (typeof CloseEvent !== "undefined") {
        this.onclose(new CloseEvent("close", opts));
      } else {
        this.onclose(opts);
      }
    }
    ajax(method, headers, body, onCallerTimeout, callback) {
      let req;
      let ontimeout = () => {
        this.reqs.delete(req);
        onCallerTimeout();
      };
      req = Ajax.request(method, this.endpointURL(), headers, body, this.timeout, ontimeout, (resp) => {
        this.reqs.delete(req);
        if (this.isActive()) {
          callback(resp);
        }
      });
      this.reqs.add(req);
    }
  };
  var Presence = class _Presence {
    constructor(channel, opts = {}) {
      let events = opts.events || { state: "presence_state", diff: "presence_diff" };
      this.state = {};
      this.pendingDiffs = [];
      this.channel = channel;
      this.joinRef = null;
      this.caller = {
        onJoin: function() {
        },
        onLeave: function() {
        },
        onSync: function() {
        }
      };
      this.channel.on(events.state, (newState) => {
        let { onJoin, onLeave, onSync } = this.caller;
        this.joinRef = this.channel.joinRef();
        this.state = _Presence.syncState(this.state, newState, onJoin, onLeave);
        this.pendingDiffs.forEach((diff) => {
          this.state = _Presence.syncDiff(this.state, diff, onJoin, onLeave);
        });
        this.pendingDiffs = [];
        onSync();
      });
      this.channel.on(events.diff, (diff) => {
        let { onJoin, onLeave, onSync } = this.caller;
        if (this.inPendingSyncState()) {
          this.pendingDiffs.push(diff);
        } else {
          this.state = _Presence.syncDiff(this.state, diff, onJoin, onLeave);
          onSync();
        }
      });
    }
    onJoin(callback) {
      this.caller.onJoin = callback;
    }
    onLeave(callback) {
      this.caller.onLeave = callback;
    }
    onSync(callback) {
      this.caller.onSync = callback;
    }
    list(by) {
      return _Presence.list(this.state, by);
    }
    inPendingSyncState() {
      return !this.joinRef || this.joinRef !== this.channel.joinRef();
    }
    static syncState(currentState, newState, onJoin, onLeave) {
      let state = this.clone(currentState);
      let joins = {};
      let leaves = {};
      this.map(state, (key, presence) => {
        if (!newState[key]) {
          leaves[key] = presence;
        }
      });
      this.map(newState, (key, newPresence) => {
        let currentPresence = state[key];
        if (currentPresence) {
          let newRefs = newPresence.metas.map((m) => m.phx_ref);
          let curRefs = currentPresence.metas.map((m) => m.phx_ref);
          let joinedMetas = newPresence.metas.filter((m) => curRefs.indexOf(m.phx_ref) < 0);
          let leftMetas = currentPresence.metas.filter((m) => newRefs.indexOf(m.phx_ref) < 0);
          if (joinedMetas.length > 0) {
            joins[key] = newPresence;
            joins[key].metas = joinedMetas;
          }
          if (leftMetas.length > 0) {
            leaves[key] = this.clone(currentPresence);
            leaves[key].metas = leftMetas;
          }
        } else {
          joins[key] = newPresence;
        }
      });
      return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
    }
    static syncDiff(state, diff, onJoin, onLeave) {
      let { joins, leaves } = this.clone(diff);
      if (!onJoin) {
        onJoin = function() {
        };
      }
      if (!onLeave) {
        onLeave = function() {
        };
      }
      this.map(joins, (key, newPresence) => {
        let currentPresence = state[key];
        state[key] = this.clone(newPresence);
        if (currentPresence) {
          let joinedRefs = state[key].metas.map((m) => m.phx_ref);
          let curMetas = currentPresence.metas.filter((m) => joinedRefs.indexOf(m.phx_ref) < 0);
          state[key].metas.unshift(...curMetas);
        }
        onJoin(key, currentPresence, newPresence);
      });
      this.map(leaves, (key, leftPresence) => {
        let currentPresence = state[key];
        if (!currentPresence) {
          return;
        }
        let refsToRemove = leftPresence.metas.map((m) => m.phx_ref);
        currentPresence.metas = currentPresence.metas.filter((p) => {
          return refsToRemove.indexOf(p.phx_ref) < 0;
        });
        onLeave(key, currentPresence, leftPresence);
        if (currentPresence.metas.length === 0) {
          delete state[key];
        }
      });
      return state;
    }
    static list(presences, chooser) {
      if (!chooser) {
        chooser = function(key, pres) {
          return pres;
        };
      }
      return this.map(presences, (key, presence) => {
        return chooser(key, presence);
      });
    }
    static map(obj, func) {
      return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
    }
    static clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
  };
  var serializer_default = {
    HEADER_LENGTH: 1,
    META_LENGTH: 4,
    KINDS: { push: 0, reply: 1, broadcast: 2 },
    encode(msg, callback) {
      if (msg.payload.constructor === ArrayBuffer) {
        return callback(this.binaryEncode(msg));
      } else {
        let payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload];
        return callback(JSON.stringify(payload));
      }
    },
    decode(rawPayload, callback) {
      if (rawPayload.constructor === ArrayBuffer) {
        return callback(this.binaryDecode(rawPayload));
      } else {
        let [join_ref, ref, topic, event, payload] = JSON.parse(rawPayload);
        return callback({ join_ref, ref, topic, event, payload });
      }
    },
    binaryEncode(message) {
      let { join_ref, ref, event, topic, payload } = message;
      let metaLength = this.META_LENGTH + join_ref.length + ref.length + topic.length + event.length;
      let header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
      let view = new DataView(header);
      let offset = 0;
      view.setUint8(offset++, this.KINDS.push);
      view.setUint8(offset++, join_ref.length);
      view.setUint8(offset++, ref.length);
      view.setUint8(offset++, topic.length);
      view.setUint8(offset++, event.length);
      Array.from(join_ref, (char) => view.setUint8(offset++, char.charCodeAt(0)));
      Array.from(ref, (char) => view.setUint8(offset++, char.charCodeAt(0)));
      Array.from(topic, (char) => view.setUint8(offset++, char.charCodeAt(0)));
      Array.from(event, (char) => view.setUint8(offset++, char.charCodeAt(0)));
      var combined = new Uint8Array(header.byteLength + payload.byteLength);
      combined.set(new Uint8Array(header), 0);
      combined.set(new Uint8Array(payload), header.byteLength);
      return combined.buffer;
    },
    binaryDecode(buffer) {
      let view = new DataView(buffer);
      let kind = view.getUint8(0);
      let decoder = new TextDecoder();
      switch (kind) {
        case this.KINDS.push:
          return this.decodePush(buffer, view, decoder);
        case this.KINDS.reply:
          return this.decodeReply(buffer, view, decoder);
        case this.KINDS.broadcast:
          return this.decodeBroadcast(buffer, view, decoder);
      }
    },
    decodePush(buffer, view, decoder) {
      let joinRefSize = view.getUint8(1);
      let topicSize = view.getUint8(2);
      let eventSize = view.getUint8(3);
      let offset = this.HEADER_LENGTH + this.META_LENGTH - 1;
      let joinRef = decoder.decode(buffer.slice(offset, offset + joinRefSize));
      offset = offset + joinRefSize;
      let topic = decoder.decode(buffer.slice(offset, offset + topicSize));
      offset = offset + topicSize;
      let event = decoder.decode(buffer.slice(offset, offset + eventSize));
      offset = offset + eventSize;
      let data = buffer.slice(offset, buffer.byteLength);
      return { join_ref: joinRef, ref: null, topic, event, payload: data };
    },
    decodeReply(buffer, view, decoder) {
      let joinRefSize = view.getUint8(1);
      let refSize = view.getUint8(2);
      let topicSize = view.getUint8(3);
      let eventSize = view.getUint8(4);
      let offset = this.HEADER_LENGTH + this.META_LENGTH;
      let joinRef = decoder.decode(buffer.slice(offset, offset + joinRefSize));
      offset = offset + joinRefSize;
      let ref = decoder.decode(buffer.slice(offset, offset + refSize));
      offset = offset + refSize;
      let topic = decoder.decode(buffer.slice(offset, offset + topicSize));
      offset = offset + topicSize;
      let event = decoder.decode(buffer.slice(offset, offset + eventSize));
      offset = offset + eventSize;
      let data = buffer.slice(offset, buffer.byteLength);
      let payload = { status: event, response: data };
      return { join_ref: joinRef, ref, topic, event: CHANNEL_EVENTS2.reply, payload };
    },
    decodeBroadcast(buffer, view, decoder) {
      let topicSize = view.getUint8(1);
      let eventSize = view.getUint8(2);
      let offset = this.HEADER_LENGTH + 2;
      let topic = decoder.decode(buffer.slice(offset, offset + topicSize));
      offset = offset + topicSize;
      let event = decoder.decode(buffer.slice(offset, offset + eventSize));
      offset = offset + eventSize;
      let data = buffer.slice(offset, buffer.byteLength);
      return { join_ref: null, ref: null, topic, event, payload: data };
    }
  };
  var Socket = class {
    constructor(endPoint, opts = {}) {
      this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
      this.channels = [];
      this.sendBuffer = [];
      this.ref = 0;
      this.fallbackRef = null;
      this.timeout = opts.timeout || DEFAULT_TIMEOUT2;
      this.transport = opts.transport || global2.WebSocket || LongPoll;
      this.conn = void 0;
      this.primaryPassedHealthCheck = false;
      this.longPollFallbackMs = opts.longPollFallbackMs;
      this.fallbackTimer = null;
      let envSessionStorage = null;
      try {
        envSessionStorage = global2 && global2.sessionStorage;
      } catch {
      }
      this.sessionStore = opts.sessionStorage || envSessionStorage;
      this.establishedConnections = 0;
      this.defaultEncoder = serializer_default.encode.bind(serializer_default);
      this.defaultDecoder = serializer_default.decode.bind(serializer_default);
      this.closeWasClean = true;
      this.disconnecting = false;
      this.binaryType = opts.binaryType || "arraybuffer";
      this.connectClock = 1;
      this.pageHidden = false;
      this.encode = void 0;
      this.decode = void 0;
      if (this.transport !== LongPoll) {
        this.encode = opts.encode || this.defaultEncoder;
        this.decode = opts.decode || this.defaultDecoder;
      } else {
        this.encode = this.defaultEncoder;
        this.decode = this.defaultDecoder;
      }
      let awaitingConnectionOnPageShow = null;
      if (phxWindow && phxWindow.addEventListener) {
        phxWindow.addEventListener("pagehide", (_e) => {
          if (this.conn) {
            this.disconnect();
            awaitingConnectionOnPageShow = this.connectClock;
          }
        });
        phxWindow.addEventListener("pageshow", (_e) => {
          if (awaitingConnectionOnPageShow === this.connectClock) {
            awaitingConnectionOnPageShow = null;
            this.connect();
          }
        });
        phxWindow.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            this.pageHidden = true;
          } else {
            this.pageHidden = false;
            if (!this.isConnected() && !this.closeWasClean) {
              this.teardown(() => this.connect());
            }
          }
        });
      }
      this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 3e4;
      this.autoSendHeartbeat = opts.autoSendHeartbeat ?? true;
      this.heartbeatCallback = opts.heartbeatCallback ?? (() => {
      });
      this.rejoinAfterMs = (tries) => {
        if (opts.rejoinAfterMs) {
          return opts.rejoinAfterMs(tries);
        } else {
          return [1e3, 2e3, 5e3][tries - 1] || 1e4;
        }
      };
      this.reconnectAfterMs = (tries) => {
        if (opts.reconnectAfterMs) {
          return opts.reconnectAfterMs(tries);
        } else {
          return [10, 50, 100, 150, 200, 250, 500, 1e3, 2e3][tries - 1] || 5e3;
        }
      };
      this.logger = opts.logger || null;
      if (!this.logger && opts.debug) {
        this.logger = (kind, msg, data) => {
          console.log(`${kind}: ${msg}`, data);
        };
      }
      this.longpollerTimeout = opts.longpollerTimeout || 2e4;
      this.params = closure(opts.params || {});
      this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
      this.vsn = opts.vsn || DEFAULT_VSN2;
      this.heartbeatTimeoutTimer = null;
      this.heartbeatTimer = null;
      this.heartbeatSentAt = null;
      this.pendingHeartbeatRef = null;
      this.reconnectTimer = new Timer(() => {
        if (this.pageHidden) {
          this.log("Not reconnecting as page is hidden!");
          this.teardown();
          return;
        }
        this.teardown(async () => {
          if (opts.beforeReconnect)
            await opts.beforeReconnect();
          this.connect();
        });
      }, this.reconnectAfterMs);
      this.authToken = opts.authToken;
    }
    getLongPollTransport() {
      return LongPoll;
    }
    replaceTransport(newTransport) {
      this.connectClock++;
      this.closeWasClean = true;
      clearTimeout(this.fallbackTimer);
      this.reconnectTimer.reset();
      if (this.conn) {
        this.conn.close();
        this.conn = null;
      }
      this.transport = newTransport;
    }
    protocol() {
      return location.protocol.match(/^https/) ? "wss" : "ws";
    }
    endPointURL() {
      let uri = Ajax.appendParams(
        Ajax.appendParams(this.endPoint, this.params()),
        { vsn: this.vsn }
      );
      if (uri.charAt(0) !== "/") {
        return uri;
      }
      if (uri.charAt(1) === "/") {
        return `${this.protocol()}:${uri}`;
      }
      return `${this.protocol()}://${location.host}${uri}`;
    }
    disconnect(callback, code, reason) {
      this.connectClock++;
      this.disconnecting = true;
      this.closeWasClean = true;
      clearTimeout(this.fallbackTimer);
      this.reconnectTimer.reset();
      this.teardown(() => {
        this.disconnecting = false;
        callback && callback();
      }, code, reason);
    }
    connect(params) {
      if (params) {
        console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
        this.params = closure(params);
      }
      if (this.conn && !this.disconnecting) {
        return;
      }
      if (this.longPollFallbackMs && this.transport !== LongPoll) {
        this.connectWithFallback(LongPoll, this.longPollFallbackMs);
      } else {
        this.transportConnect();
      }
    }
    log(kind, msg, data) {
      this.logger && this.logger(kind, msg, data);
    }
    hasLogger() {
      return this.logger !== null;
    }
    onOpen(callback) {
      let ref = this.makeRef();
      this.stateChangeCallbacks.open.push([ref, callback]);
      return ref;
    }
    onClose(callback) {
      let ref = this.makeRef();
      this.stateChangeCallbacks.close.push([ref, callback]);
      return ref;
    }
    onError(callback) {
      let ref = this.makeRef();
      this.stateChangeCallbacks.error.push([ref, callback]);
      return ref;
    }
    onMessage(callback) {
      let ref = this.makeRef();
      this.stateChangeCallbacks.message.push([ref, callback]);
      return ref;
    }
    onHeartbeat(callback) {
      this.heartbeatCallback = callback;
    }
    ping(callback) {
      if (!this.isConnected()) {
        return false;
      }
      let ref = this.makeRef();
      let startTime = Date.now();
      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref });
      let onMsgRef = this.onMessage((msg) => {
        if (msg.ref === ref) {
          this.off([onMsgRef]);
          callback(Date.now() - startTime);
        }
      });
      return true;
    }
    transportName(transport) {
      switch (transport) {
        case LongPoll:
          return "LongPoll";
        default:
          return transport.name;
      }
    }
    transportConnect() {
      this.connectClock++;
      this.closeWasClean = false;
      let protocols = void 0;
      if (this.authToken) {
        protocols = ["phoenix", `${AUTH_TOKEN_PREFIX}${btoa(this.authToken).replace(/=/g, "")}`];
      }
      this.conn = new this.transport(this.endPointURL(), protocols);
      this.conn.binaryType = this.binaryType;
      this.conn.timeout = this.longpollerTimeout;
      this.conn.onopen = () => this.onConnOpen();
      this.conn.onerror = (error) => this.onConnError(error);
      this.conn.onmessage = (event) => this.onConnMessage(event);
      this.conn.onclose = (event) => this.onConnClose(event);
    }
    getSession(key) {
      return this.sessionStore && this.sessionStore.getItem(key);
    }
    storeSession(key, val) {
      this.sessionStore && this.sessionStore.setItem(key, val);
    }
    connectWithFallback(fallbackTransport, fallbackThreshold = 2500) {
      clearTimeout(this.fallbackTimer);
      let established = false;
      let primaryTransport = true;
      let openRef, errorRef;
      let fallbackTransportName = this.transportName(fallbackTransport);
      let fallback = (reason) => {
        this.log("transport", `falling back to ${fallbackTransportName}...`, reason);
        this.off([openRef, errorRef]);
        primaryTransport = false;
        this.replaceTransport(fallbackTransport);
        this.transportConnect();
      };
      if (this.getSession(`phx:fallback:${fallbackTransportName}`)) {
        return fallback("memorized");
      }
      this.fallbackTimer = setTimeout(fallback, fallbackThreshold);
      errorRef = this.onError((reason) => {
        this.log("transport", "error", reason);
        if (primaryTransport && !established) {
          clearTimeout(this.fallbackTimer);
          fallback(reason);
        }
      });
      if (this.fallbackRef) {
        this.off([this.fallbackRef]);
      }
      this.fallbackRef = this.onOpen(() => {
        established = true;
        if (!primaryTransport) {
          let fallbackTransportName2 = this.transportName(fallbackTransport);
          if (!this.primaryPassedHealthCheck) {
            this.storeSession(`phx:fallback:${fallbackTransportName2}`, "true");
          }
          return this.log("transport", `established ${fallbackTransportName2} fallback`);
        }
        clearTimeout(this.fallbackTimer);
        this.fallbackTimer = setTimeout(fallback, fallbackThreshold);
        this.ping((rtt) => {
          this.log("transport", "connected to primary after", rtt);
          this.primaryPassedHealthCheck = true;
          clearTimeout(this.fallbackTimer);
        });
      });
      this.transportConnect();
    }
    clearHeartbeats() {
      clearTimeout(this.heartbeatTimer);
      clearTimeout(this.heartbeatTimeoutTimer);
    }
    onConnOpen() {
      if (this.hasLogger())
        this.log("transport", `connected to ${this.endPointURL()}`);
      this.closeWasClean = false;
      this.disconnecting = false;
      this.establishedConnections++;
      this.flushSendBuffer();
      this.reconnectTimer.reset();
      if (this.autoSendHeartbeat) {
        this.resetHeartbeat();
      }
      this.triggerStateCallbacks("open");
    }
    heartbeatTimeout() {
      if (this.pendingHeartbeatRef) {
        this.pendingHeartbeatRef = null;
        this.heartbeatSentAt = null;
        if (this.hasLogger()) {
          this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
        }
        try {
          this.heartbeatCallback("timeout");
        } catch (e) {
          this.log("error", "error in heartbeat callback", e);
        }
        this.triggerChanError(new Error("heartbeat timeout"));
        this.closeWasClean = false;
        this.teardown(() => this.reconnectTimer.scheduleTimeout(), WS_CLOSE_NORMAL, "heartbeat timeout");
      }
    }
    resetHeartbeat() {
      if (this.conn && this.conn.skipHeartbeat) {
        return;
      }
      this.pendingHeartbeatRef = null;
      this.clearHeartbeats();
      this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
    }
    teardown(callback, code, reason) {
      if (!this.conn) {
        return callback && callback();
      }
      const connToClose = this.conn;
      this.waitForBufferDone(connToClose, () => {
        if (code) {
          connToClose.close(code, reason || "");
        } else {
          connToClose.close();
        }
        this.waitForSocketClosed(connToClose, () => {
          if (this.conn === connToClose) {
            this.conn.onopen = function() {
            };
            this.conn.onerror = function() {
            };
            this.conn.onmessage = function() {
            };
            this.conn.onclose = function() {
            };
            this.conn = null;
          }
          callback && callback();
        });
      });
    }
    waitForBufferDone(conn, callback, tries = 1) {
      if (tries === 5 || !conn.bufferedAmount) {
        callback();
        return;
      }
      setTimeout(() => {
        this.waitForBufferDone(conn, callback, tries + 1);
      }, 150 * tries);
    }
    waitForSocketClosed(conn, callback, tries = 1) {
      if (tries === 5 || conn.readyState === SOCKET_STATES.closed) {
        callback();
        return;
      }
      setTimeout(() => {
        this.waitForSocketClosed(conn, callback, tries + 1);
      }, 150 * tries);
    }
    onConnClose(event) {
      if (this.conn)
        this.conn.onclose = () => {
        };
      if (this.hasLogger())
        this.log("transport", "close", event);
      this.triggerChanError(event);
      this.clearHeartbeats();
      if (!this.closeWasClean) {
        this.reconnectTimer.scheduleTimeout();
      }
      this.triggerStateCallbacks("close", event);
    }
    onConnError(error) {
      if (this.hasLogger())
        this.log("transport", "error", error);
      let transportBefore = this.transport;
      let establishedBefore = this.establishedConnections;
      this.triggerStateCallbacks("error", error, transportBefore, establishedBefore);
      if (transportBefore === this.transport || establishedBefore > 0) {
        this.triggerChanError(error);
      }
    }
    triggerChanError(reason) {
      this.channels.forEach((channel) => {
        if (!(channel.isErrored() || channel.isLeaving() || channel.isClosed())) {
          channel.trigger(CHANNEL_EVENTS2.error, reason);
        }
      });
    }
    connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return "connecting";
        case SOCKET_STATES.open:
          return "open";
        case SOCKET_STATES.closing:
          return "closing";
        default:
          return "closed";
      }
    }
    isConnected() {
      return this.connectionState() === "open";
    }
    remove(channel) {
      this.off(channel.stateChangeRefs);
      this.channels = this.channels.filter((c) => c !== channel);
    }
    off(refs) {
      for (let key in this.stateChangeCallbacks) {
        this.stateChangeCallbacks[key] = this.stateChangeCallbacks[key].filter(([ref]) => {
          return refs.indexOf(ref) === -1;
        });
      }
    }
    channel(topic, chanParams = {}) {
      let chan = new Channel(topic, chanParams, this);
      this.channels.push(chan);
      return chan;
    }
    push(data) {
      if (this.hasLogger()) {
        let { topic, event, payload, ref, join_ref } = data;
        this.log("push", `${topic} ${event} (${join_ref}, ${ref})`, payload);
      }
      if (this.isConnected()) {
        this.encode(data, (result) => this.conn.send(result));
      } else {
        this.sendBuffer.push(() => this.encode(data, (result) => this.conn.send(result)));
      }
    }
    makeRef() {
      let newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }
      return this.ref.toString();
    }
    sendHeartbeat() {
      if (!this.isConnected()) {
        try {
          this.heartbeatCallback("disconnected");
        } catch (e) {
          this.log("error", "error in heartbeat callback", e);
        }
        return;
      }
      if (this.pendingHeartbeatRef) {
        this.heartbeatTimeout();
        return;
      }
      this.pendingHeartbeatRef = this.makeRef();
      this.heartbeatSentAt = Date.now();
      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.pendingHeartbeatRef });
      try {
        this.heartbeatCallback("sent");
      } catch (e) {
        this.log("error", "error in heartbeat callback", e);
      }
      this.heartbeatTimeoutTimer = setTimeout(() => this.heartbeatTimeout(), this.heartbeatIntervalMs);
    }
    flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach((callback) => callback());
        this.sendBuffer = [];
      }
    }
    onConnMessage(rawMessage) {
      this.decode(rawMessage.data, (msg) => {
        let { topic, event, payload, ref, join_ref } = msg;
        if (ref && ref === this.pendingHeartbeatRef) {
          const latency = this.heartbeatSentAt ? Date.now() - this.heartbeatSentAt : void 0;
          this.clearHeartbeats();
          try {
            this.heartbeatCallback(payload.status === "ok" ? "ok" : "error", latency);
          } catch (e) {
            this.log("error", "error in heartbeat callback", e);
          }
          this.pendingHeartbeatRef = null;
          this.heartbeatSentAt = null;
          if (this.autoSendHeartbeat) {
            this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
          }
        }
        if (this.hasLogger())
          this.log("receive", `${payload.status || ""} ${topic} ${event} ${ref && "(" + ref + ")" || ""}`.trim(), payload);
        for (let i = 0; i < this.channels.length; i++) {
          const channel = this.channels[i];
          if (!channel.isMember(topic, event, payload, join_ref)) {
            continue;
          }
          channel.trigger(event, payload, ref, join_ref);
        }
        this.triggerStateCallbacks("message", msg);
      });
    }
    triggerStateCallbacks(event, ...args) {
      try {
        this.stateChangeCallbacks[event].forEach(([_, callback]) => {
          try {
            callback(...args);
          } catch (e) {
            this.log("error", `error in ${event} callback`, e);
          }
        });
      } catch (e) {
        this.log("error", `error triggering ${event} callbacks`, e);
      }
    }
    leaveOpenTopic(topic) {
      let dupChannel = this.channels.find((c) => c.topic === topic && (c.isJoined() || c.isJoining()));
      if (dupChannel) {
        if (this.hasLogger())
          this.log("transport", `leaving duplicate topic "${topic}"`);
        dupChannel.leave();
      }
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/phoenix/presenceAdapter.js
  var PresenceAdapter = class {
    constructor(channel, opts) {
      const phoenixOptions = phoenixPresenceOptions(opts);
      this.presence = new Presence(channel.getChannel(), phoenixOptions);
      this.presence.onJoin((key, currentPresence, newPresence) => {
        const onJoinPayload = PresenceAdapter.onJoinPayload(key, currentPresence, newPresence);
        channel.getChannel().trigger("presence", onJoinPayload);
      });
      this.presence.onLeave((key, currentPresence, leftPresence) => {
        const onLeavePayload = PresenceAdapter.onLeavePayload(key, currentPresence, leftPresence);
        channel.getChannel().trigger("presence", onLeavePayload);
      });
      this.presence.onSync(() => {
        channel.getChannel().trigger("presence", { event: "sync" });
      });
    }
    get state() {
      return PresenceAdapter.transformState(this.presence.state);
    }
    static transformState(state) {
      state = cloneState(state);
      return Object.getOwnPropertyNames(state).reduce((newState, key) => {
        const presences = state[key];
        newState[key] = transformState(presences);
        return newState;
      }, {});
    }
    static onJoinPayload(key, currentPresence, newPresence) {
      const currentPresences = parseCurrentPresences(currentPresence);
      const newPresences = transformState(newPresence);
      return {
        event: "join",
        key,
        currentPresences,
        newPresences
      };
    }
    static onLeavePayload(key, currentPresence, leftPresence) {
      const currentPresences = parseCurrentPresences(currentPresence);
      const leftPresences = transformState(leftPresence);
      return {
        event: "leave",
        key,
        currentPresences,
        leftPresences
      };
    }
  };
  function transformState(presences) {
    return presences.metas.map((presence) => {
      presence["presence_ref"] = presence["phx_ref"];
      delete presence["phx_ref"];
      delete presence["phx_ref_prev"];
      return presence;
    });
  }
  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }
  function phoenixPresenceOptions(opts) {
    return (opts === null || opts === void 0 ? void 0 : opts.events) && { events: opts.events };
  }
  function parseCurrentPresences(currentPresences) {
    return (currentPresences === null || currentPresences === void 0 ? void 0 : currentPresences.metas) ? transformState(currentPresences) : [];
  }

  // node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js
  var REALTIME_PRESENCE_LISTEN_EVENTS;
  (function(REALTIME_PRESENCE_LISTEN_EVENTS2) {
    REALTIME_PRESENCE_LISTEN_EVENTS2["SYNC"] = "sync";
    REALTIME_PRESENCE_LISTEN_EVENTS2["JOIN"] = "join";
    REALTIME_PRESENCE_LISTEN_EVENTS2["LEAVE"] = "leave";
  })(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
  var RealtimePresence = class {
    get state() {
      return this.presenceAdapter.state;
    }
    constructor(channel, opts) {
      this.channel = channel;
      this.presenceAdapter = new PresenceAdapter(this.channel.channelAdapter, opts);
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/normalizeChannelError.js
  function normalizeChannelError(reason) {
    if (reason instanceof Error) {
      return reason;
    }
    if (typeof reason === "string") {
      return new Error(reason);
    }
    if (reason && typeof reason === "object") {
      const obj = reason;
      if (typeof obj.code === "number") {
        const detail = typeof obj.reason === "string" && obj.reason ? ` (${obj.reason})` : "";
        return new Error(`socket closed: ${obj.code}${detail}`, { cause: reason });
      }
      return new Error("channel error: transport failure", { cause: reason });
    }
    return new Error("channel error: connection lost");
  }

  // node_modules/@supabase/realtime-js/dist/module/phoenix/channelAdapter.js
  var ChannelAdapter = class {
    constructor(socket, topic, params) {
      const phoenixParams = phoenixChannelParams(params);
      this.channel = socket.getSocket().channel(topic, phoenixParams);
      this.socket = socket;
    }
    get state() {
      return this.channel.state;
    }
    set state(state) {
      this.channel.state = state;
    }
    get joinedOnce() {
      return this.channel.joinedOnce;
    }
    get joinPush() {
      return this.channel.joinPush;
    }
    get rejoinTimer() {
      return this.channel.rejoinTimer;
    }
    on(event, callback) {
      return this.channel.on(event, callback);
    }
    off(event, refNumber) {
      this.channel.off(event, refNumber);
    }
    subscribe(timeout) {
      return this.channel.join(timeout);
    }
    unsubscribe(timeout) {
      return this.channel.leave(timeout);
    }
    teardown() {
      this.channel.teardown();
    }
    onClose(callback) {
      this.channel.onClose(callback);
    }
    onError(callback) {
      return this.channel.onError(callback);
    }
    push(event, payload, timeout) {
      let push;
      try {
        push = this.channel.push(event, payload, timeout);
      } catch (error) {
        throw new Error(`tried to push '${event}' to '${this.channel.topic}' before joining. Use channel.subscribe() before pushing events`);
      }
      if (this.channel.pushBuffer.length > MAX_PUSH_BUFFER_SIZE) {
        const removedPush = this.channel.pushBuffer.shift();
        removedPush.cancelTimeout();
        this.socket.log("channel", `discarded push due to buffer overflow: ${removedPush.event}`, removedPush.payload());
      }
      return push;
    }
    updateJoinPayload(payload) {
      const oldPayload = this.channel.joinPush.payload();
      this.channel.joinPush.payload = () => Object.assign(Object.assign({}, oldPayload), payload);
    }
    canPush() {
      return this.socket.isConnected() && this.state === CHANNEL_STATES.joined;
    }
    isJoined() {
      return this.state === CHANNEL_STATES.joined;
    }
    isJoining() {
      return this.state === CHANNEL_STATES.joining;
    }
    isClosed() {
      return this.state === CHANNEL_STATES.closed;
    }
    isLeaving() {
      return this.state === CHANNEL_STATES.leaving;
    }
    updateFilterBindings(filterBindings) {
      this.channel.filterBindings = filterBindings;
    }
    updatePayloadTransform(callback) {
      this.channel.onMessage = callback;
    }
    getChannel() {
      return this.channel;
    }
  };
  function phoenixChannelParams(options) {
    return {
      config: Object.assign({
        broadcast: { ack: false, self: false },
        presence: { key: "", enabled: false },
        private: false
      }, options.config)
    };
  }

  // node_modules/@supabase/realtime-js/dist/module/RealtimeChannel.js
  var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
  (function(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2) {
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["ALL"] = "*";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["INSERT"] = "INSERT";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["UPDATE"] = "UPDATE";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["DELETE"] = "DELETE";
  })(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
  var REALTIME_LISTEN_TYPES;
  (function(REALTIME_LISTEN_TYPES2) {
    REALTIME_LISTEN_TYPES2["BROADCAST"] = "broadcast";
    REALTIME_LISTEN_TYPES2["PRESENCE"] = "presence";
    REALTIME_LISTEN_TYPES2["POSTGRES_CHANGES"] = "postgres_changes";
    REALTIME_LISTEN_TYPES2["SYSTEM"] = "system";
  })(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
  var REALTIME_SUBSCRIBE_STATES;
  (function(REALTIME_SUBSCRIBE_STATES2) {
    REALTIME_SUBSCRIBE_STATES2["SUBSCRIBED"] = "SUBSCRIBED";
    REALTIME_SUBSCRIBE_STATES2["TIMED_OUT"] = "TIMED_OUT";
    REALTIME_SUBSCRIBE_STATES2["CLOSED"] = "CLOSED";
    REALTIME_SUBSCRIBE_STATES2["CHANNEL_ERROR"] = "CHANNEL_ERROR";
  })(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
  var RealtimeChannel = class {
    get state() {
      return this.channelAdapter.state;
    }
    set state(state) {
      this.channelAdapter.state = state;
    }
    get joinedOnce() {
      return this.channelAdapter.joinedOnce;
    }
    get timeout() {
      return this.socket.timeout;
    }
    get joinPush() {
      return this.channelAdapter.joinPush;
    }
    get rejoinTimer() {
      return this.channelAdapter.rejoinTimer;
    }
    constructor(topic, params = { config: {} }, socket) {
      var _a, _b;
      this.topic = topic;
      this.params = params;
      this.socket = socket;
      this.bindings = {};
      this.subTopic = topic.replace(/^realtime:/i, "");
      this.params.config = Object.assign({
        broadcast: { ack: false, self: false },
        presence: { key: "", enabled: false },
        private: false
      }, params.config);
      this.channelAdapter = new ChannelAdapter(this.socket.socketAdapter, topic, this.params);
      this.presence = new RealtimePresence(this);
      this._onClose(() => {
        this.socket._remove(this);
      });
      this._updateFilterTransform();
      this.broadcastEndpointURL = httpEndpointURL(this.socket.socketAdapter.endPointURL());
      this.private = this.params.config.private || false;
      if (!this.private && ((_b = (_a = this.params.config) === null || _a === void 0 ? void 0 : _a.broadcast) === null || _b === void 0 ? void 0 : _b.replay)) {
        throw new Error(`tried to use replay on public channel '${this.topic}'. It must be a private channel.`);
      }
    }
    subscribe(callback, timeout = this.timeout) {
      var _a, _b, _c;
      if (!this.socket.isConnected()) {
        this.socket.connect();
      }
      if (this.channelAdapter.isClosed()) {
        const { config: { broadcast, presence, private: isPrivate } } = this.params;
        const postgres_changes = (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [];
        const presence_enabled = !!this.bindings[REALTIME_LISTEN_TYPES.PRESENCE] && this.bindings[REALTIME_LISTEN_TYPES.PRESENCE].length > 0 || ((_c = this.params.config.presence) === null || _c === void 0 ? void 0 : _c.enabled) === true;
        const accessTokenPayload = {};
        const config = {
          broadcast,
          presence: Object.assign(Object.assign({}, presence), { enabled: presence_enabled }),
          postgres_changes,
          private: isPrivate
        };
        if (this.socket.accessTokenValue) {
          accessTokenPayload.access_token = this.socket.accessTokenValue;
        }
        this._onError((reason) => {
          callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, normalizeChannelError(reason));
        });
        this._onClose(() => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CLOSED));
        this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
        this._updateFilterMessage();
        this.channelAdapter.subscribe(timeout).receive("ok", async ({ postgres_changes: postgres_changes2 }) => {
          if (!this.socket._isManualToken()) {
            this.socket.setAuth();
          }
          if (postgres_changes2 === void 0) {
            callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
            return;
          }
          this._updatePostgresBindings(postgres_changes2, callback);
        }).receive("error", (error) => {
          this.state = CHANNEL_STATES.errored;
          const message = Object.values(error).join(", ") || "error";
          callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error(message, { cause: error }));
        }).receive("timeout", () => {
          callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT);
        });
      }
      return this;
    }
    _updatePostgresBindings(postgres_changes, callback) {
      var _a;
      const clientPostgresBindings = this.bindings.postgres_changes;
      const bindingsLen = (_a = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a !== void 0 ? _a : 0;
      const newPostgresBindings = [];
      for (let i = 0; i < bindingsLen; i++) {
        const clientPostgresBinding = clientPostgresBindings[i];
        const { filter: { event, schema, table, filter } } = clientPostgresBinding;
        const serverPostgresFilter = postgres_changes && postgres_changes[i];
        if (serverPostgresFilter && serverPostgresFilter.event === event && RealtimeChannel.isFilterValueEqual(serverPostgresFilter.schema, schema) && RealtimeChannel.isFilterValueEqual(serverPostgresFilter.table, table) && RealtimeChannel.isFilterValueEqual(serverPostgresFilter.filter, filter)) {
          newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
        } else {
          this.unsubscribe();
          this.state = CHANNEL_STATES.errored;
          callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error("mismatch between server and client bindings for postgres changes"));
          return;
        }
      }
      this.bindings.postgres_changes = newPostgresBindings;
      if (this.state != CHANNEL_STATES.errored && callback) {
        callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
      }
    }
    presenceState() {
      return this.presence.state;
    }
    async track(payload, opts = {}) {
      return await this.send({
        type: "presence",
        event: "track",
        payload
      }, opts.timeout || this.timeout);
    }
    async untrack(opts = {}) {
      return await this.send({
        type: "presence",
        event: "untrack"
      }, opts);
    }
    on(type, filter, callback) {
      const stateCheck = this.channelAdapter.isJoined() || this.channelAdapter.isJoining();
      const typeCheck = type === REALTIME_LISTEN_TYPES.PRESENCE || type === REALTIME_LISTEN_TYPES.POSTGRES_CHANGES;
      if (stateCheck && typeCheck) {
        this.socket.log("channel", `cannot add \`${type}\` callbacks for ${this.topic} after \`subscribe()\`.`);
        throw new Error(`cannot add \`${type}\` callbacks for ${this.topic} after \`subscribe()\`.`);
      }
      return this._on(type, filter, callback);
    }
    async httpSend(event, payload, opts = {}) {
      var _a;
      if (payload === void 0 || payload === null) {
        return Promise.reject(new Error("Payload is required for httpSend()"));
      }
      const isBinary = payload instanceof ArrayBuffer || ArrayBuffer.isView(payload);
      const headers = {
        apikey: this.socket.apiKey ? this.socket.apiKey : "",
        "Content-Type": isBinary ? "application/octet-stream" : "application/json"
      };
      if (this.socket.accessTokenValue) {
        headers["Authorization"] = `Bearer ${this.socket.accessTokenValue}`;
      }
      const url = new URL(this.broadcastEndpointURL);
      url.pathname += `/${encodeURIComponent(this.subTopic)}/events/${encodeURIComponent(event)}`;
      if (this.private) {
        url.searchParams.set("private", "true");
      }
      const options = {
        method: "POST",
        headers,
        body: isBinary ? payload : JSON.stringify(payload)
      };
      const response = await this._fetchWithTimeout(url.toString(), options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
      if (response.status === 202) {
        return { success: true };
      }
      if (response.status === 404) {
        return Promise.reject(new Error("httpSend() requires Realtime server v2.97.0 or newer; the endpoint returned 404. Update your Supabase CLI to a recent version, or upgrade the Realtime server in your self-hosted setup. See https://github.com/supabase/supabase-js/blob/master/packages/core/realtime-js/migrations/httpsend-server-version.md"));
      }
      let errorMessage = response.statusText;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error || errorBody.message || errorMessage;
      } catch (_b) {
      }
      return Promise.reject(new Error(errorMessage));
    }
    async send(args, opts = {}) {
      var _a, _b;
      if (!this.channelAdapter.canPush() && args.type === "broadcast") {
        console.warn("Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.");
        const { event, payload: endpoint_payload } = args;
        const headers = {
          apikey: this.socket.apiKey ? this.socket.apiKey : "",
          "Content-Type": "application/json"
        };
        if (this.socket.accessTokenValue) {
          headers["Authorization"] = `Bearer ${this.socket.accessTokenValue}`;
        }
        const options = {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: [
              {
                topic: this.subTopic,
                event,
                payload: endpoint_payload,
                private: this.private
              }
            ]
          })
        };
        try {
          const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
          await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
          return response.ok ? "ok" : "error";
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return "timed out";
          } else {
            return "error";
          }
        }
      } else {
        return new Promise((resolve) => {
          var _a2, _b2, _c;
          const push = this.channelAdapter.push(args.type, args, opts.timeout || this.timeout);
          if (args.type === "broadcast" && !((_c = (_b2 = (_a2 = this.params) === null || _a2 === void 0 ? void 0 : _a2.config) === null || _b2 === void 0 ? void 0 : _b2.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
            resolve("ok");
          }
          push.receive("ok", () => resolve("ok"));
          push.receive("error", () => resolve("error"));
          push.receive("timeout", () => resolve("timed out"));
        });
      }
    }
    updateJoinPayload(payload) {
      this.channelAdapter.updateJoinPayload(payload);
    }
    async unsubscribe(timeout = this.timeout) {
      return new Promise((resolve) => {
        this.channelAdapter.unsubscribe(timeout).receive("ok", () => resolve("ok")).receive("timeout", () => resolve("timed out")).receive("error", () => resolve("error"));
      });
    }
    teardown() {
      this.channelAdapter.teardown();
    }
    async _fetchWithTimeout(url, options, timeout) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
      clearTimeout(id);
      return response;
    }
    _on(type, filter, callback) {
      const typeLower = type.toLocaleLowerCase();
      const ref = this.channelAdapter.on(type, callback);
      const binding = {
        type: typeLower,
        filter,
        callback,
        ref
      };
      if (this.bindings[typeLower]) {
        this.bindings[typeLower].push(binding);
      } else {
        this.bindings[typeLower] = [binding];
      }
      this._updateFilterMessage();
      return this;
    }
    _onClose(callback) {
      this.channelAdapter.onClose(callback);
    }
    _onError(callback) {
      this.channelAdapter.onError(callback);
    }
    _updateFilterMessage() {
      this.channelAdapter.updateFilterBindings((binding, payload, ref) => {
        var _a, _b, _c, _d, _e, _f, _g;
        const typeLower = binding.event.toLocaleLowerCase();
        if (this._notThisChannelEvent(typeLower, ref)) {
          return false;
        }
        const bind = (_a = this.bindings[typeLower]) === null || _a === void 0 ? void 0 : _a.find((bind2) => bind2.ref === binding.ref);
        if (!bind) {
          return true;
        }
        if (["broadcast", "presence", "postgres_changes"].includes(typeLower)) {
          if ("id" in bind) {
            const bindId = bind.id;
            const bindEvent = (_b = bind.filter) === null || _b === void 0 ? void 0 : _b.event;
            return bindId && ((_c = payload.ids) === null || _c === void 0 ? void 0 : _c.includes(bindId)) && (bindEvent === "*" || (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_d = payload.data) === null || _d === void 0 ? void 0 : _d.type.toLocaleLowerCase()));
          } else {
            const bindEvent = (_f = (_e = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _e === void 0 ? void 0 : _e.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase();
            return bindEvent === "*" || bindEvent === ((_g = payload === null || payload === void 0 ? void 0 : payload.event) === null || _g === void 0 ? void 0 : _g.toLocaleLowerCase());
          }
        } else {
          return bind.type.toLocaleLowerCase() === typeLower;
        }
      });
    }
    _notThisChannelEvent(event, ref) {
      const { close, error, leave, join } = CHANNEL_EVENTS;
      const events = [close, error, leave, join];
      return ref && events.includes(event) && ref !== this.joinPush.ref;
    }
    _updateFilterTransform() {
      this.channelAdapter.updatePayloadTransform((event, payload, ref) => {
        if (typeof payload === "object" && "ids" in payload) {
          const postgresChanges = payload.data;
          const { schema, table, commit_timestamp, type, errors } = postgresChanges;
          const enrichedPayload = {
            schema,
            table,
            commit_timestamp,
            eventType: type,
            new: {},
            old: {},
            errors
          };
          return Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
        }
        return payload;
      });
    }
    copyBindings(other) {
      if (this.joinedOnce) {
        throw new Error("cannot copy bindings into joined channel");
      }
      for (const kind in other.bindings) {
        for (const binding of other.bindings[kind]) {
          this._on(binding.type, binding.filter, binding.callback);
        }
      }
    }
    static isFilterValueEqual(serverValue, clientValue) {
      const normalizedServer = serverValue !== null && serverValue !== void 0 ? serverValue : void 0;
      const normalizedClient = clientValue !== null && clientValue !== void 0 ? clientValue : void 0;
      return normalizedServer === normalizedClient;
    }
    _getPayloadRecords(payload) {
      const records = {
        new: {},
        old: {}
      };
      if (payload.type === "INSERT" || payload.type === "UPDATE") {
        records.new = convertChangeData(payload.columns, payload.record);
      }
      if (payload.type === "UPDATE" || payload.type === "DELETE") {
        records.old = convertChangeData(payload.columns, payload.old_record);
      }
      return records;
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/phoenix/socketAdapter.js
  var SocketAdapter = class {
    constructor(endPoint, options) {
      this.socket = new Socket(endPoint, options);
    }
    get timeout() {
      return this.socket.timeout;
    }
    get endPoint() {
      return this.socket.endPoint;
    }
    get transport() {
      return this.socket.transport;
    }
    get heartbeatIntervalMs() {
      return this.socket.heartbeatIntervalMs;
    }
    get heartbeatCallback() {
      return this.socket.heartbeatCallback;
    }
    set heartbeatCallback(callback) {
      this.socket.heartbeatCallback = callback;
    }
    get heartbeatTimer() {
      return this.socket.heartbeatTimer;
    }
    get pendingHeartbeatRef() {
      return this.socket.pendingHeartbeatRef;
    }
    get reconnectTimer() {
      return this.socket.reconnectTimer;
    }
    get vsn() {
      return this.socket.vsn;
    }
    get encode() {
      return this.socket.encode;
    }
    get decode() {
      return this.socket.decode;
    }
    get reconnectAfterMs() {
      return this.socket.reconnectAfterMs;
    }
    get sendBuffer() {
      return this.socket.sendBuffer;
    }
    get stateChangeCallbacks() {
      return this.socket.stateChangeCallbacks;
    }
    connect() {
      this.socket.connect();
    }
    disconnect(callback, code, reason, timeout = 1e4) {
      return new Promise((resolve) => {
        setTimeout(() => resolve("timeout"), timeout);
        this.socket.disconnect(() => {
          callback();
          resolve("ok");
        }, code, reason);
      });
    }
    push(data) {
      this.socket.push(data);
    }
    log(kind, msg, data) {
      this.socket.log(kind, msg, data);
    }
    makeRef() {
      return this.socket.makeRef();
    }
    onOpen(callback) {
      this.socket.onOpen(callback);
    }
    onClose(callback) {
      this.socket.onClose(callback);
    }
    onError(callback) {
      this.socket.onError(callback);
    }
    onMessage(callback) {
      this.socket.onMessage(callback);
    }
    isConnected() {
      return this.socket.isConnected();
    }
    isConnecting() {
      return this.socket.connectionState() == CONNECTION_STATE.connecting;
    }
    isDisconnecting() {
      return this.socket.connectionState() == CONNECTION_STATE.closing;
    }
    connectionState() {
      return this.socket.connectionState();
    }
    endPointURL() {
      return this.socket.endPointURL();
    }
    sendHeartbeat() {
      this.socket.sendHeartbeat();
    }
    getSocket() {
      return this.socket;
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js
  var CONNECTION_TIMEOUTS = {
    HEARTBEAT_INTERVAL: 25e3,
    RECONNECT_DELAY: 10,
    HEARTBEAT_TIMEOUT_FALLBACK: 100
  };
  var RECONNECT_INTERVALS = [1e3, 2e3, 5e3, 1e4];
  var DEFAULT_RECONNECT_FALLBACK = 1e4;
  function createMemorySessionStorage() {
    const store = /* @__PURE__ */ new Map();
    return {
      get length() {
        return store.size;
      },
      clear() {
        store.clear();
      },
      getItem(key) {
        return store.has(key) ? store.get(key) : null;
      },
      key(index) {
        var _a;
        return (_a = Array.from(store.keys())[index]) !== null && _a !== void 0 ? _a : null;
      },
      removeItem(key) {
        store.delete(key);
      },
      setItem(key, value) {
        store.set(key, String(value));
      }
    };
  }
  function resolveSessionStorage() {
    try {
      if (typeof globalThis !== "undefined" && globalThis.sessionStorage) {
        return globalThis.sessionStorage;
      }
    } catch (_a) {
    }
    return createMemorySessionStorage();
  }
  var WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
  var RealtimeClient = class {
    get endPoint() {
      return this.socketAdapter.endPoint;
    }
    get timeout() {
      return this.socketAdapter.timeout;
    }
    get transport() {
      return this.socketAdapter.transport;
    }
    get heartbeatCallback() {
      return this.socketAdapter.heartbeatCallback;
    }
    get heartbeatIntervalMs() {
      return this.socketAdapter.heartbeatIntervalMs;
    }
    get heartbeatTimer() {
      if (this.worker) {
        return this._workerHeartbeatTimer;
      }
      return this.socketAdapter.heartbeatTimer;
    }
    get pendingHeartbeatRef() {
      if (this.worker) {
        return this._pendingWorkerHeartbeatRef;
      }
      return this.socketAdapter.pendingHeartbeatRef;
    }
    get reconnectTimer() {
      return this.socketAdapter.reconnectTimer;
    }
    get vsn() {
      return this.socketAdapter.vsn;
    }
    get encode() {
      return this.socketAdapter.encode;
    }
    get decode() {
      return this.socketAdapter.decode;
    }
    get reconnectAfterMs() {
      return this.socketAdapter.reconnectAfterMs;
    }
    get sendBuffer() {
      return this.socketAdapter.sendBuffer;
    }
    get stateChangeCallbacks() {
      return this.socketAdapter.stateChangeCallbacks;
    }
    constructor(endPoint, options) {
      var _a;
      this.channels = new Array();
      this.accessTokenValue = null;
      this.accessToken = null;
      this.apiKey = null;
      this.httpEndpoint = "";
      this.headers = {};
      this.params = {};
      this.ref = 0;
      this.serializer = new Serializer();
      this._manuallySetToken = false;
      this._authPromise = null;
      this._workerHeartbeatTimer = void 0;
      this._pendingWorkerHeartbeatRef = null;
      this._pendingDisconnectTimer = null;
      this._disconnectOnEmptyChannelsAfterMs = 0;
      this._resolveFetch = (customFetch) => {
        if (customFetch) {
          return (...args) => customFetch(...args);
        }
        return (...args) => fetch(...args);
      };
      if (!((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey)) {
        throw new Error("API key is required to connect to Realtime");
      }
      this.apiKey = options.params.apikey;
      const socketAdapterOptions = this._initializeOptions(options);
      this.socketAdapter = new SocketAdapter(endPoint, socketAdapterOptions);
      this.httpEndpoint = httpEndpointURL(endPoint);
      this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
    }
    connect() {
      if (this.isConnecting() || this.isDisconnecting() || this.isConnected()) {
        return;
      }
      if (this.accessToken && !this._authPromise) {
        this._setAuthSafely("connect");
      }
      this._setupConnectionHandlers();
      try {
        this.socketAdapter.connect();
      } catch (error) {
        const errorMessage = error.message;
        if (errorMessage.includes("Node.js")) {
          throw new Error(`${errorMessage}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`);
        }
        throw new Error(`WebSocket not available: ${errorMessage}`);
      }
      this._handleNodeJsRaceCondition();
    }
    endpointURL() {
      return this.socketAdapter.endPointURL();
    }
    async disconnect(code, reason) {
      this._cancelPendingDisconnect();
      if (this.isDisconnecting()) {
        return "ok";
      }
      return await this.socketAdapter.disconnect(() => {
        clearInterval(this._workerHeartbeatTimer);
        this._terminateWorker();
      }, code, reason);
    }
    getChannels() {
      return this.channels;
    }
    async removeChannel(channel) {
      const status = await channel.unsubscribe();
      if (status === "ok") {
        channel.teardown();
      }
      return status;
    }
    async removeAllChannels() {
      const promises = this.channels.map(async (channel) => {
        const result2 = await channel.unsubscribe();
        channel.teardown();
        return result2;
      });
      const result = await Promise.all(promises);
      await this.disconnect();
      return result;
    }
    log(kind, msg, data) {
      this.socketAdapter.log(kind, msg, data);
    }
    connectionState() {
      return this.socketAdapter.connectionState() || CONNECTION_STATE.closed;
    }
    isConnected() {
      return this.socketAdapter.isConnected();
    }
    isConnecting() {
      return this.socketAdapter.isConnecting();
    }
    isDisconnecting() {
      return this.socketAdapter.isDisconnecting();
    }
    channel(topic, params = { config: {} }) {
      const realtimeTopic = `realtime:${topic}`;
      const exists = this.getChannels().find((c) => c.topic === realtimeTopic);
      if (!exists) {
        const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
        this._cancelPendingDisconnect();
        this.channels.push(chan);
        return chan;
      } else {
        return exists;
      }
    }
    push(data) {
      this.socketAdapter.push(data);
    }
    async setAuth(token = null) {
      this._authPromise = this._performAuth(token);
      try {
        await this._authPromise;
      } finally {
        this._authPromise = null;
      }
    }
    _isManualToken() {
      return this._manuallySetToken;
    }
    async sendHeartbeat() {
      this.socketAdapter.sendHeartbeat();
    }
    onHeartbeat(callback) {
      this.socketAdapter.heartbeatCallback = this._wrapHeartbeatCallback(callback);
    }
    _makeRef() {
      return this.socketAdapter.makeRef();
    }
    _remove(channel) {
      this.channels = this.channels.filter((c) => c.topic !== channel.topic);
      if (this.channels.length === 0) {
        this.log("transport", "no channels remaining, scheduling disconnect");
        this._schedulePendingDisconnect();
      }
    }
    _schedulePendingDisconnect() {
      this._cancelPendingDisconnect();
      if (this._disconnectOnEmptyChannelsAfterMs === 0) {
        this.log("transport", "disconnecting immediately - no channels");
        this.disconnect();
        return;
      }
      this._pendingDisconnectTimer = setTimeout(() => {
        this._pendingDisconnectTimer = null;
        if (this.channels.length === 0) {
          this.log("transport", "deferred disconnect fired - no channels, disconnecting");
          this.disconnect();
        }
      }, this._disconnectOnEmptyChannelsAfterMs);
      this.log("transport", `deferred disconnect scheduled in ${this._disconnectOnEmptyChannelsAfterMs}ms`);
    }
    _cancelPendingDisconnect() {
      if (this._pendingDisconnectTimer !== null) {
        this.log("transport", "pending disconnect cancelled - channel activity detected");
        clearTimeout(this._pendingDisconnectTimer);
        this._pendingDisconnectTimer = null;
      }
    }
    async _performAuth(token = null) {
      let tokenToSend;
      let isManualToken = false;
      if (token) {
        tokenToSend = token;
        isManualToken = true;
      } else if (this.accessToken) {
        try {
          tokenToSend = await this.accessToken();
        } catch (e) {
          this.log("error", "Error fetching access token from callback", e);
          tokenToSend = this.accessTokenValue;
        }
      } else {
        tokenToSend = this.accessTokenValue;
      }
      if (isManualToken) {
        this._manuallySetToken = true;
      } else if (this.accessToken) {
        this._manuallySetToken = false;
      }
      if (this.accessTokenValue != tokenToSend) {
        this.accessTokenValue = tokenToSend;
        this.channels.forEach((channel) => {
          const payload = {
            access_token: tokenToSend,
            version: DEFAULT_VERSION
          };
          tokenToSend && channel.updateJoinPayload(payload);
          if (channel.joinedOnce && channel.channelAdapter.isJoined()) {
            channel.channelAdapter.push(CHANNEL_EVENTS.access_token, {
              access_token: tokenToSend
            });
          }
        });
      }
    }
    async _waitForAuthIfNeeded() {
      if (this._authPromise) {
        await this._authPromise;
      }
    }
    _setAuthSafely(context = "general") {
      if (!this._isManualToken()) {
        this.setAuth().catch((e) => {
          this.log("error", `Error setting auth in ${context}`, e);
        });
      }
    }
    _setupConnectionHandlers() {
      this.socketAdapter.onOpen(() => {
        const authPromise = this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve());
        authPromise.catch((e) => {
          this.log("error", "error waiting for auth on connect", e);
        });
        if (this.worker && !this.workerRef) {
          this._startWorkerHeartbeat();
        }
      });
      this.socketAdapter.onClose(() => {
        if (this.worker && this.workerRef) {
          this._terminateWorker();
        }
      });
      this.socketAdapter.onMessage((message) => {
        if (message.ref && message.ref === this._pendingWorkerHeartbeatRef) {
          this._pendingWorkerHeartbeatRef = null;
        }
      });
    }
    _handleNodeJsRaceCondition() {
      if (this.socketAdapter.isConnected()) {
        this.socketAdapter.getSocket().onConnOpen();
      }
    }
    _wrapHeartbeatCallback(heartbeatCallback) {
      return (status, latency) => {
        if (status == "sent")
          this._setAuthSafely();
        if (heartbeatCallback)
          heartbeatCallback(status, latency);
      };
    }
    _startWorkerHeartbeat() {
      if (this.workerUrl) {
        this.log("worker", `starting worker for from ${this.workerUrl}`);
      } else {
        this.log("worker", `starting default worker`);
      }
      const objectUrl = this._workerObjectUrl(this.workerUrl);
      this.workerRef = new Worker(objectUrl);
      this.workerRef.onerror = (error) => {
        this.log("worker", "worker error", error.message);
        this._terminateWorker();
        this.disconnect();
      };
      this.workerRef.onmessage = (event) => {
        if (event.data.event === "keepAlive") {
          this.sendHeartbeat();
        }
      };
      this.workerRef.postMessage({
        event: "start",
        interval: this.heartbeatIntervalMs
      });
    }
    _terminateWorker() {
      if (this.workerRef) {
        this.log("worker", "terminating worker");
        this.workerRef.terminate();
        this.workerRef = void 0;
      }
    }
    _workerObjectUrl(url) {
      let result_url;
      if (url) {
        result_url = url;
      } else {
        const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
        result_url = URL.createObjectURL(blob);
      }
      return result_url;
    }
    _initializeOptions(options) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
      this.worker = (_a = options === null || options === void 0 ? void 0 : options.worker) !== null && _a !== void 0 ? _a : false;
      this.accessToken = (_b = options === null || options === void 0 ? void 0 : options.accessToken) !== null && _b !== void 0 ? _b : null;
      const result = {};
      result.timeout = (_c = options === null || options === void 0 ? void 0 : options.timeout) !== null && _c !== void 0 ? _c : DEFAULT_TIMEOUT;
      result.heartbeatIntervalMs = (_d = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _d !== void 0 ? _d : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
      this._disconnectOnEmptyChannelsAfterMs = (_e = options === null || options === void 0 ? void 0 : options.disconnectOnEmptyChannelsAfterMs) !== null && _e !== void 0 ? _e : 2 * ((_f = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _f !== void 0 ? _f : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL);
      result.transport = (_g = options === null || options === void 0 ? void 0 : options.transport) !== null && _g !== void 0 ? _g : websocket_factory_default.getWebSocketConstructor();
      result.params = options === null || options === void 0 ? void 0 : options.params;
      result.logger = options === null || options === void 0 ? void 0 : options.logger;
      result.heartbeatCallback = this._wrapHeartbeatCallback(options === null || options === void 0 ? void 0 : options.heartbeatCallback);
      result.sessionStorage = (_h = options === null || options === void 0 ? void 0 : options.sessionStorage) !== null && _h !== void 0 ? _h : resolveSessionStorage();
      result.reconnectAfterMs = (_j = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _j !== void 0 ? _j : (tries) => {
        return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK;
      };
      let defaultEncode;
      let defaultDecode;
      const vsn = (_k = options === null || options === void 0 ? void 0 : options.vsn) !== null && _k !== void 0 ? _k : DEFAULT_VSN;
      switch (vsn) {
        case VSN_1_0_0:
          defaultEncode = (payload, callback) => {
            return callback(JSON.stringify(payload));
          };
          defaultDecode = (payload, callback) => {
            return callback(JSON.parse(payload));
          };
          break;
        case VSN_2_0_0:
          defaultEncode = this.serializer.encode.bind(this.serializer);
          defaultDecode = this.serializer.decode.bind(this.serializer);
          break;
        default:
          throw new Error(`Unsupported serializer version: ${result.vsn}`);
      }
      result.vsn = vsn;
      result.encode = (_l = options === null || options === void 0 ? void 0 : options.encode) !== null && _l !== void 0 ? _l : defaultEncode;
      result.decode = (_m = options === null || options === void 0 ? void 0 : options.decode) !== null && _m !== void 0 ? _m : defaultDecode;
      result.beforeReconnect = this._reconnectAuth.bind(this);
      if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
        this.logLevel = options.logLevel || options.log_level;
        result.params = Object.assign(Object.assign({}, result.params), { log_level: this.logLevel });
      }
      if (this.worker) {
        if (typeof window !== "undefined" && !window.Worker) {
          throw new Error("Web Worker is not supported");
        }
        this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
        result.autoSendHeartbeat = !this.worker;
      }
      return result;
    }
    async _reconnectAuth() {
      await this._waitForAuthIfNeeded();
      if (!this.isConnected()) {
        this.connect();
      }
    }
  };

  // node_modules/iceberg-js/dist/index.mjs
  var IcebergError = class extends Error {
    constructor(message, opts) {
      super(message);
      this.name = "IcebergError";
      this.status = opts.status;
      this.icebergType = opts.icebergType;
      this.icebergCode = opts.icebergCode;
      this.details = opts.details;
      this.isCommitStateUnknown = opts.icebergType === "CommitStateUnknownException" || [500, 502, 504].includes(opts.status) && opts.icebergType?.includes("CommitState") === true;
    }
    isNotFound() {
      return this.status === 404;
    }
    isConflict() {
      return this.status === 409;
    }
    isAuthenticationTimeout() {
      return this.status === 419;
    }
  };
  function buildUrl(baseUrl, path, query) {
    const url = new URL(path, baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== void 0) {
          url.searchParams.set(key, value);
        }
      }
    }
    return url.toString();
  }
  async function buildAuthHeaders(auth) {
    if (!auth || auth.type === "none") {
      return {};
    }
    if (auth.type === "bearer") {
      return { Authorization: `Bearer ${auth.token}` };
    }
    if (auth.type === "header") {
      return { [auth.name]: auth.value };
    }
    if (auth.type === "custom") {
      return await auth.getHeaders();
    }
    return {};
  }
  function createFetchClient(options) {
    const fetchFn = options.fetchImpl ?? globalThis.fetch;
    return {
      async request({
        method,
        path,
        query,
        body,
        headers
      }) {
        const url = buildUrl(options.baseUrl, path, query);
        const authHeaders = await buildAuthHeaders(options.auth);
        const res = await fetchFn(url, {
          method,
          headers: {
            ...body ? { "Content-Type": "application/json" } : {},
            ...authHeaders,
            ...headers
          },
          body: body ? JSON.stringify(body) : void 0
        });
        const text = await res.text();
        const isJson = (res.headers.get("content-type") || "").includes("application/json");
        const data = isJson && text ? JSON.parse(text) : text;
        if (!res.ok) {
          const errBody = isJson ? data : void 0;
          const errorDetail = errBody?.error;
          throw new IcebergError(
            errorDetail?.message ?? `Request failed with status ${res.status}`,
            {
              status: res.status,
              icebergType: errorDetail?.type,
              icebergCode: errorDetail?.code,
              details: errBody
            }
          );
        }
        return { status: res.status, headers: res.headers, data };
      }
    };
  }
  function namespaceToPath(namespace) {
    return namespace.join("");
  }
  var NamespaceOperations = class {
    constructor(client, prefix = "") {
      this.client = client;
      this.prefix = prefix;
    }
    async listNamespaces(parent) {
      const query = parent ? { parent: namespaceToPath(parent.namespace) } : void 0;
      const response = await this.client.request({
        method: "GET",
        path: `${this.prefix}/namespaces`,
        query
      });
      return response.data.namespaces.map((ns) => ({ namespace: ns }));
    }
    async createNamespace(id, metadata) {
      const request = {
        namespace: id.namespace,
        properties: metadata?.properties
      };
      const response = await this.client.request({
        method: "POST",
        path: `${this.prefix}/namespaces`,
        body: request
      });
      return response.data;
    }
    async dropNamespace(id) {
      await this.client.request({
        method: "DELETE",
        path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
      });
    }
    async loadNamespaceMetadata(id) {
      const response = await this.client.request({
        method: "GET",
        path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
      });
      return {
        properties: response.data.properties
      };
    }
    async namespaceExists(id) {
      try {
        await this.client.request({
          method: "HEAD",
          path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
        });
        return true;
      } catch (error) {
        if (error instanceof IcebergError && error.status === 404) {
          return false;
        }
        throw error;
      }
    }
    async createNamespaceIfNotExists(id, metadata) {
      try {
        return await this.createNamespace(id, metadata);
      } catch (error) {
        if (error instanceof IcebergError && error.status === 409) {
          return;
        }
        throw error;
      }
    }
  };
  function namespaceToPath2(namespace) {
    return namespace.join("");
  }
  var TableOperations = class {
    constructor(client, prefix = "", accessDelegation) {
      this.client = client;
      this.prefix = prefix;
      this.accessDelegation = accessDelegation;
    }
    async listTables(namespace) {
      const response = await this.client.request({
        method: "GET",
        path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`
      });
      return response.data.identifiers;
    }
    async createTable(namespace, request) {
      const headers = {};
      if (this.accessDelegation) {
        headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
      }
      const response = await this.client.request({
        method: "POST",
        path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`,
        body: request,
        headers
      });
      return response.data.metadata;
    }
    async updateTable(id, request) {
      const response = await this.client.request({
        method: "POST",
        path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
        body: request
      });
      return {
        "metadata-location": response.data["metadata-location"],
        metadata: response.data.metadata
      };
    }
    async dropTable(id, options) {
      await this.client.request({
        method: "DELETE",
        path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
        query: { purgeRequested: String(options?.purge ?? false) }
      });
    }
    async loadTable(id) {
      const headers = {};
      if (this.accessDelegation) {
        headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
      }
      const response = await this.client.request({
        method: "GET",
        path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
        headers
      });
      return response.data.metadata;
    }
    async tableExists(id) {
      const headers = {};
      if (this.accessDelegation) {
        headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
      }
      try {
        await this.client.request({
          method: "HEAD",
          path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
          headers
        });
        return true;
      } catch (error) {
        if (error instanceof IcebergError && error.status === 404) {
          return false;
        }
        throw error;
      }
    }
    async createTableIfNotExists(namespace, request) {
      try {
        return await this.createTable(namespace, request);
      } catch (error) {
        if (error instanceof IcebergError && error.status === 409) {
          return await this.loadTable({ namespace: namespace.namespace, name: request.name });
        }
        throw error;
      }
    }
  };
  var IcebergRestCatalog = class {
    constructor(options) {
      let prefix = "v1";
      if (options.catalogName) {
        prefix += `/${options.catalogName}`;
      }
      const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : `${options.baseUrl}/`;
      this.client = createFetchClient({
        baseUrl,
        auth: options.auth,
        fetchImpl: options.fetch
      });
      this.accessDelegation = options.accessDelegation?.join(",");
      this.namespaceOps = new NamespaceOperations(this.client, prefix);
      this.tableOps = new TableOperations(this.client, prefix, this.accessDelegation);
    }
    async listNamespaces(parent) {
      return this.namespaceOps.listNamespaces(parent);
    }
    async createNamespace(id, metadata) {
      return this.namespaceOps.createNamespace(id, metadata);
    }
    async dropNamespace(id) {
      await this.namespaceOps.dropNamespace(id);
    }
    async loadNamespaceMetadata(id) {
      return this.namespaceOps.loadNamespaceMetadata(id);
    }
    async listTables(namespace) {
      return this.tableOps.listTables(namespace);
    }
    async createTable(namespace, request) {
      return this.tableOps.createTable(namespace, request);
    }
    async updateTable(id, request) {
      return this.tableOps.updateTable(id, request);
    }
    async dropTable(id, options) {
      await this.tableOps.dropTable(id, options);
    }
    async loadTable(id) {
      return this.tableOps.loadTable(id);
    }
    async namespaceExists(id) {
      return this.namespaceOps.namespaceExists(id);
    }
    async tableExists(id) {
      return this.tableOps.tableExists(id);
    }
    async createNamespaceIfNotExists(id, metadata) {
      return this.namespaceOps.createNamespaceIfNotExists(id, metadata);
    }
    async createTableIfNotExists(namespace, request) {
      return this.tableOps.createTableIfNotExists(namespace, request);
    }
  };

  // node_modules/@supabase/storage-js/dist/index.mjs
  function _typeof2(o) {
    "@babel/helpers - typeof";
    return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
      return typeof o$1;
    } : function(o$1) {
      return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, _typeof2(o);
  }
  function toPrimitive2(t, r) {
    if ("object" != _typeof2(t) || !t)
      return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof2(i))
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function toPropertyKey2(t) {
    var i = toPrimitive2(t, "string");
    return "symbol" == _typeof2(i) ? i : i + "";
  }
  function _defineProperty2(e, r, t) {
    return (r = toPropertyKey2(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function ownKeys2(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r$1) {
        return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread22(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys2(Object(t), true).forEach(function(r$1) {
        _defineProperty2(e, r$1, t[r$1]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys2(Object(t)).forEach(function(r$1) {
        Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
      });
    }
    return e;
  }
  var StorageError = class extends Error {
    constructor(message, namespace = "storage", status, statusCode) {
      super(message);
      this.__isStorageError = true;
      this.namespace = namespace;
      this.name = namespace === "vectors" ? "StorageVectorsError" : "StorageError";
      this.status = status;
      this.statusCode = statusCode;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        status: this.status,
        statusCode: this.statusCode
      };
    }
  };
  function isStorageError(error) {
    return typeof error === "object" && error !== null && "__isStorageError" in error;
  }
  var StorageApiError = class extends StorageError {
    constructor(message, status, statusCode, namespace = "storage") {
      super(message, namespace, status, statusCode);
      this.name = namespace === "vectors" ? "StorageVectorsApiError" : "StorageApiError";
      this.status = status;
      this.statusCode = statusCode;
    }
    toJSON() {
      return _objectSpread22({}, super.toJSON());
    }
  };
  var StorageUnknownError = class extends StorageError {
    constructor(message, originalError, namespace = "storage") {
      super(message, namespace);
      this.name = namespace === "vectors" ? "StorageVectorsUnknownError" : "StorageUnknownError";
      this.originalError = originalError;
    }
  };
  function setHeader(headers, name, value) {
    const result = _objectSpread22({}, headers);
    const nameLower = name.toLowerCase();
    for (const key of Object.keys(result))
      if (key.toLowerCase() === nameLower)
        delete result[key];
    result[nameLower] = value;
    return result;
  }
  function normalizeHeaders(headers) {
    const result = {};
    for (const [key, value] of Object.entries(headers))
      result[key.toLowerCase()] = value;
    return result;
  }
  var resolveFetch2 = (customFetch) => {
    if (customFetch)
      return (...args) => customFetch(...args);
    return (...args) => fetch(...args);
  };
  var isPlainObject = (value) => {
    if (typeof value !== "object" || value === null)
      return false;
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
  };
  var recursiveToCamel = (item) => {
    if (Array.isArray(item))
      return item.map((el) => recursiveToCamel(el));
    else if (typeof item === "function" || item !== Object(item))
      return item;
    const result = {};
    Object.entries(item).forEach(([key, value]) => {
      const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ""));
      result[newKey] = recursiveToCamel(value);
    });
    return result;
  };
  var isValidBucketName = (bucketName) => {
    if (!bucketName || typeof bucketName !== "string")
      return false;
    if (bucketName.length === 0 || bucketName.length > 100)
      return false;
    if (bucketName.trim() !== bucketName)
      return false;
    if (bucketName.includes("/") || bucketName.includes("\\"))
      return false;
    return /^[\w!.\*'() &$@=;:+,?-]+$/.test(bucketName);
  };
  var _getErrorMessage = (err) => {
    if (typeof err === "object" && err !== null) {
      const e = err;
      if (typeof e.msg === "string")
        return e.msg;
      if (typeof e.message === "string")
        return e.message;
      if (typeof e.error_description === "string")
        return e.error_description;
      if (typeof e.error === "string")
        return e.error;
      if (typeof e.error === "object" && e.error !== null) {
        const nested = e.error;
        if (typeof nested.message === "string")
          return nested.message;
      }
    }
    return JSON.stringify(err);
  };
  var handleError = async (error, reject, options, namespace) => {
    if (error !== null && typeof error === "object" && "json" in error && typeof error.json === "function") {
      const responseError = error;
      let status = parseInt(String(responseError.status), 10);
      if (!Number.isFinite(status))
        status = 500;
      responseError.json().then((err) => {
        const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || (err === null || err === void 0 ? void 0 : err.code) || status + "";
        reject(new StorageApiError(_getErrorMessage(err), status, statusCode, namespace));
      }).catch(() => {
        const statusCode = status + "";
        reject(new StorageApiError(responseError.statusText || `HTTP ${status} error`, status, statusCode, namespace));
      });
    } else
      reject(new StorageUnknownError(_getErrorMessage(error), error, namespace));
  };
  var _getRequestParams = (method, options, parameters, body) => {
    const params = {
      method,
      headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
    };
    if (method === "GET" || method === "HEAD" || !body)
      return _objectSpread22(_objectSpread22({}, params), parameters);
    if (isPlainObject(body)) {
      var _contentType;
      const headers = (options === null || options === void 0 ? void 0 : options.headers) || {};
      let contentType;
      for (const [key, value] of Object.entries(headers))
        if (key.toLowerCase() === "content-type")
          contentType = value;
      params.headers = setHeader(headers, "Content-Type", (_contentType = contentType) !== null && _contentType !== void 0 ? _contentType : "application/json");
      params.body = JSON.stringify(body);
    } else
      params.body = body;
    if (options === null || options === void 0 ? void 0 : options.duplex)
      params.duplex = options.duplex;
    return _objectSpread22(_objectSpread22({}, params), parameters);
  };
  async function _handleRequest(fetcher, method, url, options, parameters, body, namespace) {
    return new Promise((resolve, reject) => {
      fetcher(url, _getRequestParams(method, options, parameters, body)).then((result) => {
        if (!result.ok)
          throw result;
        if (options === null || options === void 0 ? void 0 : options.noResolveJson)
          return result;
        if (namespace === "vectors") {
          const contentType = result.headers.get("content-type");
          if (result.headers.get("content-length") === "0" || result.status === 204)
            return {};
          if (!contentType || !contentType.includes("application/json"))
            return {};
        }
        return result.json();
      }).then((data) => resolve(data)).catch((error) => handleError(error, reject, options, namespace));
    });
  }
  function createFetchApi(namespace = "storage") {
    return {
      get: async (fetcher, url, options, parameters) => {
        return _handleRequest(fetcher, "GET", url, options, parameters, void 0, namespace);
      },
      post: async (fetcher, url, body, options, parameters) => {
        return _handleRequest(fetcher, "POST", url, options, parameters, body, namespace);
      },
      put: async (fetcher, url, body, options, parameters) => {
        return _handleRequest(fetcher, "PUT", url, options, parameters, body, namespace);
      },
      head: async (fetcher, url, options, parameters) => {
        return _handleRequest(fetcher, "HEAD", url, _objectSpread22(_objectSpread22({}, options), {}, { noResolveJson: true }), parameters, void 0, namespace);
      },
      remove: async (fetcher, url, body, options, parameters) => {
        return _handleRequest(fetcher, "DELETE", url, options, parameters, body, namespace);
      }
    };
  }
  var defaultApi = createFetchApi("storage");
  var { get, post, put, head, remove } = defaultApi;
  var vectorsApi = createFetchApi("vectors");
  var BaseApiClient = class {
    constructor(url, headers = {}, fetch$1, namespace = "storage") {
      this.shouldThrowOnError = false;
      this.url = url;
      this.headers = normalizeHeaders(headers);
      this.fetch = resolveFetch2(fetch$1);
      this.namespace = namespace;
    }
    throwOnError() {
      this.shouldThrowOnError = true;
      return this;
    }
    setHeader(name, value) {
      this.headers = setHeader(this.headers, name, value);
      return this;
    }
    async handleOperation(operation) {
      var _this = this;
      try {
        return {
          data: await operation(),
          error: null
        };
      } catch (error) {
        if (_this.shouldThrowOnError)
          throw error;
        if (isStorageError(error))
          return {
            data: null,
            error
          };
        throw error;
      }
    }
  };
  var _Symbol$toStringTag$1;
  _Symbol$toStringTag$1 = Symbol.toStringTag;
  var StreamDownloadBuilder = class {
    constructor(downloadFn, shouldThrowOnError) {
      this.downloadFn = downloadFn;
      this.shouldThrowOnError = shouldThrowOnError;
      this[_Symbol$toStringTag$1] = "StreamDownloadBuilder";
      this.promise = null;
    }
    then(onfulfilled, onrejected) {
      return this.getPromise().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
      return this.getPromise().catch(onrejected);
    }
    finally(onfinally) {
      return this.getPromise().finally(onfinally);
    }
    getPromise() {
      if (!this.promise)
        this.promise = this.execute();
      return this.promise;
    }
    async execute() {
      var _this = this;
      try {
        return {
          data: (await _this.downloadFn()).body,
          error: null
        };
      } catch (error) {
        if (_this.shouldThrowOnError)
          throw error;
        if (isStorageError(error))
          return {
            data: null,
            error
          };
        throw error;
      }
    }
  };
  var _Symbol$toStringTag;
  _Symbol$toStringTag = Symbol.toStringTag;
  var BlobDownloadBuilder = class {
    constructor(downloadFn, shouldThrowOnError) {
      this.downloadFn = downloadFn;
      this.shouldThrowOnError = shouldThrowOnError;
      this[_Symbol$toStringTag] = "BlobDownloadBuilder";
      this.promise = null;
    }
    asStream() {
      return new StreamDownloadBuilder(this.downloadFn, this.shouldThrowOnError);
    }
    then(onfulfilled, onrejected) {
      return this.getPromise().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
      return this.getPromise().catch(onrejected);
    }
    finally(onfinally) {
      return this.getPromise().finally(onfinally);
    }
    getPromise() {
      if (!this.promise)
        this.promise = this.execute();
      return this.promise;
    }
    async execute() {
      var _this = this;
      try {
        return {
          data: await (await _this.downloadFn()).blob(),
          error: null
        };
      } catch (error) {
        if (_this.shouldThrowOnError)
          throw error;
        if (isStorageError(error))
          return {
            data: null,
            error
          };
        throw error;
      }
    }
  };
  var DEFAULT_SEARCH_OPTIONS = {
    limit: 100,
    offset: 0,
    sortBy: {
      column: "name",
      order: "asc"
    }
  };
  var DEFAULT_FILE_OPTIONS = {
    cacheControl: "3600",
    contentType: "text/plain;charset=UTF-8",
    upsert: false
  };
  var StorageFileApi = class extends BaseApiClient {
    constructor(url, headers = {}, bucketId, fetch$1) {
      super(url, headers, fetch$1, "storage");
      this.bucketId = bucketId;
    }
    async uploadOrUpdate(method, path, fileBody, fileOptions) {
      var _this = this;
      return _this.handleOperation(async () => {
        let body;
        const options = _objectSpread22(_objectSpread22({}, DEFAULT_FILE_OPTIONS), fileOptions);
        let headers = _objectSpread22(_objectSpread22({}, _this.headers), method === "POST" && { "x-upsert": String(options.upsert) });
        const metadata = options.metadata;
        if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
          body = new FormData();
          body.append("cacheControl", options.cacheControl);
          if (metadata)
            body.append("metadata", _this.encodeMetadata(metadata));
          body.append("", fileBody);
        } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
          body = fileBody;
          if (!body.has("cacheControl"))
            body.append("cacheControl", options.cacheControl);
          if (metadata && !body.has("metadata"))
            body.append("metadata", _this.encodeMetadata(metadata));
        } else {
          body = fileBody;
          headers["cache-control"] = `max-age=${options.cacheControl}`;
          headers["content-type"] = options.contentType;
          if (metadata)
            headers["x-metadata"] = _this.toBase64(_this.encodeMetadata(metadata));
          if ((typeof ReadableStream !== "undefined" && body instanceof ReadableStream || body && typeof body === "object" && "pipe" in body && typeof body.pipe === "function") && !options.duplex)
            options.duplex = "half";
        }
        if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers)
          for (const [key, value] of Object.entries(fileOptions.headers))
            headers = setHeader(headers, key, value);
        const cleanPath = _this._removeEmptyFolders(path);
        const _path = _this._getFinalPath(cleanPath);
        const data = await (method == "PUT" ? put : post)(_this.fetch, `${_this.url}/object/${_path}`, body, _objectSpread22({ headers }, (options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {}));
        return {
          path: cleanPath,
          id: data.Id,
          fullPath: data.Key
        };
      });
    }
    async upload(path, fileBody, fileOptions) {
      return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
    }
    async uploadToSignedUrl(path, token, fileBody, fileOptions) {
      var _this3 = this;
      const cleanPath = _this3._removeEmptyFolders(path);
      const _path = _this3._getFinalPath(cleanPath);
      const url = new URL(_this3.url + `/object/upload/sign/${_path}`);
      url.searchParams.set("token", token);
      return _this3.handleOperation(async () => {
        let body;
        const options = _objectSpread22(_objectSpread22({}, DEFAULT_FILE_OPTIONS), fileOptions);
        let headers = _objectSpread22(_objectSpread22({}, _this3.headers), { "x-upsert": String(options.upsert) });
        const metadata = options.metadata;
        if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
          body = new FormData();
          body.append("cacheControl", options.cacheControl);
          if (metadata)
            body.append("metadata", _this3.encodeMetadata(metadata));
          body.append("", fileBody);
        } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
          body = fileBody;
          if (!body.has("cacheControl"))
            body.append("cacheControl", options.cacheControl);
          if (metadata && !body.has("metadata"))
            body.append("metadata", _this3.encodeMetadata(metadata));
        } else {
          body = fileBody;
          headers["cache-control"] = `max-age=${options.cacheControl}`;
          headers["content-type"] = options.contentType;
          if (metadata)
            headers["x-metadata"] = _this3.toBase64(_this3.encodeMetadata(metadata));
          if ((typeof ReadableStream !== "undefined" && body instanceof ReadableStream || body && typeof body === "object" && "pipe" in body && typeof body.pipe === "function") && !options.duplex)
            options.duplex = "half";
        }
        if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers)
          for (const [key, value] of Object.entries(fileOptions.headers))
            headers = setHeader(headers, key, value);
        return {
          path: cleanPath,
          fullPath: (await put(_this3.fetch, url.toString(), body, _objectSpread22({ headers }, (options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {}))).Key
        };
      });
    }
    async createSignedUploadUrl(path, options) {
      var _this4 = this;
      return _this4.handleOperation(async () => {
        let _path = _this4._getFinalPath(path);
        const headers = _objectSpread22({}, _this4.headers);
        if (options === null || options === void 0 ? void 0 : options.upsert)
          headers["x-upsert"] = "true";
        const data = await post(_this4.fetch, `${_this4.url}/object/upload/sign/${_path}`, {}, { headers });
        const url = new URL(_this4.url + data.url);
        const token = url.searchParams.get("token");
        if (!token)
          throw new StorageError("No token returned by API");
        return {
          signedUrl: url.toString(),
          path,
          token
        };
      });
    }
    async update(path, fileBody, fileOptions) {
      return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
    }
    async move(fromPath, toPath, options) {
      var _this6 = this;
      return _this6.handleOperation(async () => {
        return await post(_this6.fetch, `${_this6.url}/object/move`, {
          bucketId: _this6.bucketId,
          sourceKey: fromPath,
          destinationKey: toPath,
          destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
        }, { headers: _this6.headers });
      });
    }
    async copy(fromPath, toPath, options) {
      var _this7 = this;
      return _this7.handleOperation(async () => {
        return { path: (await post(_this7.fetch, `${_this7.url}/object/copy`, {
          bucketId: _this7.bucketId,
          sourceKey: fromPath,
          destinationKey: toPath,
          destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
        }, { headers: _this7.headers })).Key };
      });
    }
    async createSignedUrl(path, expiresIn, options) {
      var _this8 = this;
      return _this8.handleOperation(async () => {
        let _path = _this8._getFinalPath(path);
        const hasTransform = typeof (options === null || options === void 0 ? void 0 : options.transform) === "object" && options.transform !== null && Object.keys(options.transform).length > 0;
        let data = await post(_this8.fetch, `${_this8.url}/object/sign/${_path}`, _objectSpread22({ expiresIn }, hasTransform ? { transform: options.transform } : {}), { headers: _this8.headers });
        const query = new URLSearchParams();
        if (options === null || options === void 0 ? void 0 : options.download)
          query.set("download", options.download === true ? "" : options.download);
        if ((options === null || options === void 0 ? void 0 : options.cacheNonce) != null)
          query.set("cacheNonce", String(options.cacheNonce));
        const queryString = query.toString();
        return { signedUrl: encodeURI(`${_this8.url}${data.signedURL}${queryString ? `&${queryString}` : ""}`) };
      });
    }
    async createSignedUrls(paths, expiresIn, options) {
      var _this9 = this;
      return _this9.handleOperation(async () => {
        const data = await post(_this9.fetch, `${_this9.url}/object/sign/${_this9.bucketId}`, {
          expiresIn,
          paths
        }, { headers: _this9.headers });
        const query = new URLSearchParams();
        if (options === null || options === void 0 ? void 0 : options.download)
          query.set("download", options.download === true ? "" : options.download);
        if ((options === null || options === void 0 ? void 0 : options.cacheNonce) != null)
          query.set("cacheNonce", String(options.cacheNonce));
        const queryString = query.toString();
        return data.map((datum) => _objectSpread22(_objectSpread22({}, datum), {}, { signedUrl: datum.signedURL ? encodeURI(`${_this9.url}${datum.signedURL}${queryString ? `&${queryString}` : ""}`) : null }));
      });
    }
    download(path, options, parameters) {
      const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) === "object" && options.transform !== null && Object.keys(options.transform).length > 0 ? "render/image/authenticated" : "object";
      const query = new URLSearchParams();
      if (options === null || options === void 0 ? void 0 : options.transform)
        this.applyTransformOptsToQuery(query, options.transform);
      if ((options === null || options === void 0 ? void 0 : options.cacheNonce) != null)
        query.set("cacheNonce", String(options.cacheNonce));
      const queryString = query.toString();
      const _path = this._getFinalPath(path);
      const downloadFn = () => get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString ? `?${queryString}` : ""}`, {
        headers: this.headers,
        noResolveJson: true
      }, parameters);
      return new BlobDownloadBuilder(downloadFn, this.shouldThrowOnError);
    }
    async info(path) {
      var _this10 = this;
      const _path = _this10._getFinalPath(path);
      return _this10.handleOperation(async () => {
        return recursiveToCamel(await get(_this10.fetch, `${_this10.url}/object/info/${_path}`, { headers: _this10.headers }));
      });
    }
    async exists(path) {
      var _this11 = this;
      const _path = _this11._getFinalPath(path);
      try {
        await head(_this11.fetch, `${_this11.url}/object/${_path}`, { headers: _this11.headers });
        return {
          data: true,
          error: null
        };
      } catch (error) {
        if (_this11.shouldThrowOnError)
          throw error;
        if (isStorageError(error)) {
          var _error$originalError;
          const status = error instanceof StorageApiError ? error.status : error instanceof StorageUnknownError ? (_error$originalError = error.originalError) === null || _error$originalError === void 0 ? void 0 : _error$originalError.status : void 0;
          if (status !== void 0 && [400, 404].includes(status))
            return {
              data: false,
              error
            };
        }
        throw error;
      }
    }
    getPublicUrl(path, options) {
      const _path = this._getFinalPath(path);
      const query = new URLSearchParams();
      if (options === null || options === void 0 ? void 0 : options.download)
        query.set("download", options.download === true ? "" : options.download);
      if (options === null || options === void 0 ? void 0 : options.transform)
        this.applyTransformOptsToQuery(query, options.transform);
      if ((options === null || options === void 0 ? void 0 : options.cacheNonce) != null)
        query.set("cacheNonce", String(options.cacheNonce));
      const queryString = query.toString();
      const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) === "object" && options.transform !== null && Object.keys(options.transform).length > 0 ? "render/image" : "object";
      return { data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}`) + (queryString ? `?${queryString}` : "") } };
    }
    async remove(paths) {
      var _this12 = this;
      return _this12.handleOperation(async () => {
        return await remove(_this12.fetch, `${_this12.url}/object/${_this12.bucketId}`, { prefixes: paths }, { headers: _this12.headers });
      });
    }
    async list(path, options, parameters) {
      var _this13 = this;
      return _this13.handleOperation(async () => {
        const body = _objectSpread22(_objectSpread22(_objectSpread22({}, DEFAULT_SEARCH_OPTIONS), options), {}, { prefix: path || "" });
        return await post(_this13.fetch, `${_this13.url}/object/list/${_this13.bucketId}`, body, { headers: _this13.headers }, parameters);
      });
    }
    async listV2(options, parameters) {
      var _this14 = this;
      return _this14.handleOperation(async () => {
        const body = _objectSpread22({}, options);
        return await post(_this14.fetch, `${_this14.url}/object/list-v2/${_this14.bucketId}`, body, { headers: _this14.headers }, parameters);
      });
    }
    encodeMetadata(metadata) {
      return JSON.stringify(metadata);
    }
    toBase64(data) {
      if (typeof Buffer !== "undefined")
        return Buffer.from(data).toString("base64");
      return btoa(data);
    }
    _getFinalPath(path) {
      return `${this.bucketId}/${path.replace(/^\/+/, "")}`;
    }
    _removeEmptyFolders(path) {
      return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
    }
    applyTransformOptsToQuery(query, transform) {
      if (transform.width)
        query.set("width", transform.width.toString());
      if (transform.height)
        query.set("height", transform.height.toString());
      if (transform.resize)
        query.set("resize", transform.resize);
      if (transform.format)
        query.set("format", transform.format);
      if (transform.quality)
        query.set("quality", transform.quality.toString());
      return query;
    }
  };
  var version2 = "2.108.2";
  var DEFAULT_HEADERS = { "X-Client-Info": `storage-js/${version2}` };
  var StorageBucketApi = class extends BaseApiClient {
    constructor(url, headers = {}, fetch$1, opts) {
      const baseUrl = new URL(url);
      if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
        if (/supabase\.(co|in|red)$/.test(baseUrl.hostname) && !baseUrl.hostname.includes("storage.supabase."))
          baseUrl.hostname = baseUrl.hostname.replace("supabase.", "storage.supabase.");
      }
      const finalUrl = baseUrl.href.replace(/\/$/, "");
      const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), headers);
      super(finalUrl, finalHeaders, fetch$1, "storage");
    }
    async listBuckets(options) {
      var _this = this;
      return _this.handleOperation(async () => {
        const queryString = _this.listBucketOptionsToQueryString(options);
        return await get(_this.fetch, `${_this.url}/bucket${queryString}`, { headers: _this.headers });
      });
    }
    async getBucket(id) {
      var _this2 = this;
      return _this2.handleOperation(async () => {
        return await get(_this2.fetch, `${_this2.url}/bucket/${id}`, { headers: _this2.headers });
      });
    }
    async createBucket(id, options = { public: false }) {
      var _this3 = this;
      return _this3.handleOperation(async () => {
        return await post(_this3.fetch, `${_this3.url}/bucket`, {
          id,
          name: id,
          type: options.type,
          public: options.public,
          file_size_limit: options.fileSizeLimit,
          allowed_mime_types: options.allowedMimeTypes
        }, { headers: _this3.headers });
      });
    }
    async updateBucket(id, options) {
      var _this4 = this;
      return _this4.handleOperation(async () => {
        return await put(_this4.fetch, `${_this4.url}/bucket/${id}`, {
          id,
          name: id,
          public: options.public,
          file_size_limit: options.fileSizeLimit,
          allowed_mime_types: options.allowedMimeTypes
        }, { headers: _this4.headers });
      });
    }
    async emptyBucket(id) {
      var _this5 = this;
      return _this5.handleOperation(async () => {
        return await post(_this5.fetch, `${_this5.url}/bucket/${id}/empty`, {}, { headers: _this5.headers });
      });
    }
    async deleteBucket(id) {
      var _this6 = this;
      return _this6.handleOperation(async () => {
        return await remove(_this6.fetch, `${_this6.url}/bucket/${id}`, {}, { headers: _this6.headers });
      });
    }
    listBucketOptionsToQueryString(options) {
      const params = {};
      if (options) {
        if ("limit" in options)
          params.limit = String(options.limit);
        if ("offset" in options)
          params.offset = String(options.offset);
        if (options.search)
          params.search = options.search;
        if (options.sortColumn)
          params.sortColumn = options.sortColumn;
        if (options.sortOrder)
          params.sortOrder = options.sortOrder;
      }
      return Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : "";
    }
  };
  var StorageAnalyticsClient = class extends BaseApiClient {
    constructor(url, headers = {}, fetch$1) {
      const finalUrl = url.replace(/\/$/, "");
      const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), headers);
      super(finalUrl, finalHeaders, fetch$1, "storage");
    }
    async createBucket(name) {
      var _this = this;
      return _this.handleOperation(async () => {
        return await post(_this.fetch, `${_this.url}/bucket`, { name }, { headers: _this.headers });
      });
    }
    async listBuckets(options) {
      var _this2 = this;
      return _this2.handleOperation(async () => {
        const queryParams = new URLSearchParams();
        if ((options === null || options === void 0 ? void 0 : options.limit) !== void 0)
          queryParams.set("limit", options.limit.toString());
        if ((options === null || options === void 0 ? void 0 : options.offset) !== void 0)
          queryParams.set("offset", options.offset.toString());
        if (options === null || options === void 0 ? void 0 : options.sortColumn)
          queryParams.set("sortColumn", options.sortColumn);
        if (options === null || options === void 0 ? void 0 : options.sortOrder)
          queryParams.set("sortOrder", options.sortOrder);
        if (options === null || options === void 0 ? void 0 : options.search)
          queryParams.set("search", options.search);
        const queryString = queryParams.toString();
        const url = queryString ? `${_this2.url}/bucket?${queryString}` : `${_this2.url}/bucket`;
        return await get(_this2.fetch, url, { headers: _this2.headers });
      });
    }
    async deleteBucket(bucketName) {
      var _this3 = this;
      return _this3.handleOperation(async () => {
        return await remove(_this3.fetch, `${_this3.url}/bucket/${bucketName}`, {}, { headers: _this3.headers });
      });
    }
    from(bucketName) {
      var _this4 = this;
      if (!isValidBucketName(bucketName))
        throw new StorageError("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
      const catalog = new IcebergRestCatalog({
        baseUrl: this.url,
        catalogName: bucketName,
        auth: {
          type: "custom",
          getHeaders: async () => _this4.headers
        },
        fetch: this.fetch
      });
      const shouldThrowOnError = this.shouldThrowOnError;
      return new Proxy(catalog, { get(target, prop) {
        const value = target[prop];
        if (typeof value !== "function")
          return value;
        return async (...args) => {
          try {
            return {
              data: await value.apply(target, args),
              error: null
            };
          } catch (error) {
            if (shouldThrowOnError)
              throw error;
            return {
              data: null,
              error
            };
          }
        };
      } });
    }
  };
  var VectorIndexApi = class extends BaseApiClient {
    constructor(url, headers = {}, fetch$1) {
      const finalUrl = url.replace(/\/$/, "");
      const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), {}, { "Content-Type": "application/json" }, headers);
      super(finalUrl, finalHeaders, fetch$1, "vectors");
    }
    async createIndex(options) {
      var _this = this;
      return _this.handleOperation(async () => {
        return await vectorsApi.post(_this.fetch, `${_this.url}/CreateIndex`, options, { headers: _this.headers }) || {};
      });
    }
    async getIndex(vectorBucketName, indexName) {
      var _this2 = this;
      return _this2.handleOperation(async () => {
        return await vectorsApi.post(_this2.fetch, `${_this2.url}/GetIndex`, {
          vectorBucketName,
          indexName
        }, { headers: _this2.headers });
      });
    }
    async listIndexes(options) {
      var _this3 = this;
      return _this3.handleOperation(async () => {
        return await vectorsApi.post(_this3.fetch, `${_this3.url}/ListIndexes`, options, { headers: _this3.headers });
      });
    }
    async deleteIndex(vectorBucketName, indexName) {
      var _this4 = this;
      return _this4.handleOperation(async () => {
        return await vectorsApi.post(_this4.fetch, `${_this4.url}/DeleteIndex`, {
          vectorBucketName,
          indexName
        }, { headers: _this4.headers }) || {};
      });
    }
  };
  var VectorDataApi = class extends BaseApiClient {
    constructor(url, headers = {}, fetch$1) {
      const finalUrl = url.replace(/\/$/, "");
      const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), {}, { "Content-Type": "application/json" }, headers);
      super(finalUrl, finalHeaders, fetch$1, "vectors");
    }
    async putVectors(options) {
      var _this = this;
      if (options.vectors.length < 1 || options.vectors.length > 500)
        throw new Error("Vector batch size must be between 1 and 500 items");
      return _this.handleOperation(async () => {
        return await vectorsApi.post(_this.fetch, `${_this.url}/PutVectors`, options, { headers: _this.headers }) || {};
      });
    }
    async getVectors(options) {
      var _this2 = this;
      return _this2.handleOperation(async () => {
        return await vectorsApi.post(_this2.fetch, `${_this2.url}/GetVectors`, options, { headers: _this2.headers });
      });
    }
    async listVectors(options) {
      var _this3 = this;
      if (options.segmentCount !== void 0) {
        if (options.segmentCount < 1 || options.segmentCount > 16)
          throw new Error("segmentCount must be between 1 and 16");
        if (options.segmentIndex !== void 0) {
          if (options.segmentIndex < 0 || options.segmentIndex >= options.segmentCount)
            throw new Error(`segmentIndex must be between 0 and ${options.segmentCount - 1}`);
        }
      }
      return _this3.handleOperation(async () => {
        return await vectorsApi.post(_this3.fetch, `${_this3.url}/ListVectors`, options, { headers: _this3.headers });
      });
    }
    async queryVectors(options) {
      var _this4 = this;
      return _this4.handleOperation(async () => {
        return await vectorsApi.post(_this4.fetch, `${_this4.url}/QueryVectors`, options, { headers: _this4.headers });
      });
    }
    async deleteVectors(options) {
      var _this5 = this;
      if (options.keys.length < 1 || options.keys.length > 500)
        throw new Error("Keys batch size must be between 1 and 500 items");
      return _this5.handleOperation(async () => {
        return await vectorsApi.post(_this5.fetch, `${_this5.url}/DeleteVectors`, options, { headers: _this5.headers }) || {};
      });
    }
  };
  var VectorBucketApi = class extends BaseApiClient {
    constructor(url, headers = {}, fetch$1) {
      const finalUrl = url.replace(/\/$/, "");
      const finalHeaders = _objectSpread22(_objectSpread22({}, DEFAULT_HEADERS), {}, { "Content-Type": "application/json" }, headers);
      super(finalUrl, finalHeaders, fetch$1, "vectors");
    }
    async createBucket(vectorBucketName) {
      var _this = this;
      return _this.handleOperation(async () => {
        return await vectorsApi.post(_this.fetch, `${_this.url}/CreateVectorBucket`, { vectorBucketName }, { headers: _this.headers }) || {};
      });
    }
    async getBucket(vectorBucketName) {
      var _this2 = this;
      return _this2.handleOperation(async () => {
        return await vectorsApi.post(_this2.fetch, `${_this2.url}/GetVectorBucket`, { vectorBucketName }, { headers: _this2.headers });
      });
    }
    async listBuckets(options = {}) {
      var _this3 = this;
      return _this3.handleOperation(async () => {
        return await vectorsApi.post(_this3.fetch, `${_this3.url}/ListVectorBuckets`, options, { headers: _this3.headers });
      });
    }
    async deleteBucket(vectorBucketName) {
      var _this4 = this;
      return _this4.handleOperation(async () => {
        return await vectorsApi.post(_this4.fetch, `${_this4.url}/DeleteVectorBucket`, { vectorBucketName }, { headers: _this4.headers }) || {};
      });
    }
  };
  var StorageVectorsClient = class extends VectorBucketApi {
    constructor(url, options = {}) {
      super(url, options.headers || {}, options.fetch);
    }
    from(vectorBucketName) {
      return new VectorBucketScope(this.url, this.headers, vectorBucketName, this.fetch);
    }
    async createBucket(vectorBucketName) {
      var _superprop_getCreateBucket = () => super.createBucket, _this = this;
      return _superprop_getCreateBucket().call(_this, vectorBucketName);
    }
    async getBucket(vectorBucketName) {
      var _superprop_getGetBucket = () => super.getBucket, _this2 = this;
      return _superprop_getGetBucket().call(_this2, vectorBucketName);
    }
    async listBuckets(options = {}) {
      var _superprop_getListBuckets = () => super.listBuckets, _this3 = this;
      return _superprop_getListBuckets().call(_this3, options);
    }
    async deleteBucket(vectorBucketName) {
      var _superprop_getDeleteBucket = () => super.deleteBucket, _this4 = this;
      return _superprop_getDeleteBucket().call(_this4, vectorBucketName);
    }
  };
  var VectorBucketScope = class extends VectorIndexApi {
    constructor(url, headers, vectorBucketName, fetch$1) {
      super(url, headers, fetch$1);
      this.vectorBucketName = vectorBucketName;
    }
    async createIndex(options) {
      var _superprop_getCreateIndex = () => super.createIndex, _this5 = this;
      return _superprop_getCreateIndex().call(_this5, _objectSpread22(_objectSpread22({}, options), {}, { vectorBucketName: _this5.vectorBucketName }));
    }
    async listIndexes(options = {}) {
      var _superprop_getListIndexes = () => super.listIndexes, _this6 = this;
      return _superprop_getListIndexes().call(_this6, _objectSpread22(_objectSpread22({}, options), {}, { vectorBucketName: _this6.vectorBucketName }));
    }
    async getIndex(indexName) {
      var _superprop_getGetIndex = () => super.getIndex, _this7 = this;
      return _superprop_getGetIndex().call(_this7, _this7.vectorBucketName, indexName);
    }
    async deleteIndex(indexName) {
      var _superprop_getDeleteIndex = () => super.deleteIndex, _this8 = this;
      return _superprop_getDeleteIndex().call(_this8, _this8.vectorBucketName, indexName);
    }
    index(indexName) {
      return new VectorIndexScope(this.url, this.headers, this.vectorBucketName, indexName, this.fetch);
    }
  };
  var VectorIndexScope = class extends VectorDataApi {
    constructor(url, headers, vectorBucketName, indexName, fetch$1) {
      super(url, headers, fetch$1);
      this.vectorBucketName = vectorBucketName;
      this.indexName = indexName;
    }
    async putVectors(options) {
      var _superprop_getPutVectors = () => super.putVectors, _this9 = this;
      return _superprop_getPutVectors().call(_this9, _objectSpread22(_objectSpread22({}, options), {}, {
        vectorBucketName: _this9.vectorBucketName,
        indexName: _this9.indexName
      }));
    }
    async getVectors(options) {
      var _superprop_getGetVectors = () => super.getVectors, _this10 = this;
      return _superprop_getGetVectors().call(_this10, _objectSpread22(_objectSpread22({}, options), {}, {
        vectorBucketName: _this10.vectorBucketName,
        indexName: _this10.indexName
      }));
    }
    async listVectors(options = {}) {
      var _superprop_getListVectors = () => super.listVectors, _this11 = this;
      return _superprop_getListVectors().call(_this11, _objectSpread22(_objectSpread22({}, options), {}, {
        vectorBucketName: _this11.vectorBucketName,
        indexName: _this11.indexName
      }));
    }
    async queryVectors(options) {
      var _superprop_getQueryVectors = () => super.queryVectors, _this12 = this;
      return _superprop_getQueryVectors().call(_this12, _objectSpread22(_objectSpread22({}, options), {}, {
        vectorBucketName: _this12.vectorBucketName,
        indexName: _this12.indexName
      }));
    }
    async deleteVectors(options) {
      var _superprop_getDeleteVectors = () => super.deleteVectors, _this13 = this;
      return _superprop_getDeleteVectors().call(_this13, _objectSpread22(_objectSpread22({}, options), {}, {
        vectorBucketName: _this13.vectorBucketName,
        indexName: _this13.indexName
      }));
    }
  };
  var StorageClient = class extends StorageBucketApi {
    constructor(url, headers = {}, fetch$1, opts) {
      super(url, headers, fetch$1, opts);
    }
    from(id) {
      return new StorageFileApi(this.url, this.headers, id, this.fetch);
    }
    get vectors() {
      return new StorageVectorsClient(this.url + "/vector", {
        headers: this.headers,
        fetch: this.fetch
      });
    }
    get analytics() {
      return new StorageAnalyticsClient(this.url + "/iceberg", this.headers, this.fetch);
    }
  };

  // node_modules/@supabase/auth-js/dist/module/lib/version.js
  var version3 = "2.108.2";

  // node_modules/@supabase/auth-js/dist/module/lib/constants.js
  var AUTO_REFRESH_TICK_DURATION_MS = 30 * 1e3;
  var AUTO_REFRESH_TICK_THRESHOLD = 3;
  var EXPIRY_MARGIN_MS = AUTO_REFRESH_TICK_THRESHOLD * AUTO_REFRESH_TICK_DURATION_MS;
  var REFRESH_FAILURE_COOLDOWN_MS = 2 * AUTO_REFRESH_TICK_DURATION_MS;
  var GOTRUE_URL = "http://localhost:9999";
  var STORAGE_KEY = "supabase.auth.token";
  var DEFAULT_HEADERS2 = { "X-Client-Info": `gotrue-js/${version3}` };
  var API_VERSION_HEADER_NAME = "X-Supabase-Api-Version";
  var API_VERSIONS = {
    "2024-01-01": {
      timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
      name: "2024-01-01"
    }
  };
  var BASE64URL_REGEX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
  var JWKS_TTL = 10 * 60 * 1e3;

  // node_modules/@supabase/auth-js/dist/module/lib/errors.js
  var AuthError = class extends Error {
    constructor(message, status, code) {
      super(message);
      this.__isAuthError = true;
      this.name = "AuthError";
      this.status = status;
      this.code = code;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        status: this.status,
        code: this.code
      };
    }
  };
  function isAuthError(error) {
    return typeof error === "object" && error !== null && "__isAuthError" in error;
  }
  var AuthApiError = class extends AuthError {
    constructor(message, status, code) {
      super(message, status, code);
      this.name = "AuthApiError";
      this.status = status;
      this.code = code;
    }
  };
  function isAuthApiError(error) {
    return isAuthError(error) && error.name === "AuthApiError";
  }
  var AuthUnknownError = class extends AuthError {
    constructor(message, originalError) {
      super(message);
      this.name = "AuthUnknownError";
      this.originalError = originalError;
    }
  };
  var CustomAuthError = class extends AuthError {
    constructor(message, name, status, code) {
      super(message, status, code);
      this.name = name;
      this.status = status;
    }
  };
  var AuthSessionMissingError = class extends CustomAuthError {
    constructor() {
      super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
    }
  };
  function isAuthSessionMissingError(error) {
    return isAuthError(error) && error.name === "AuthSessionMissingError";
  }
  var AuthInvalidTokenResponseError = class extends CustomAuthError {
    constructor() {
      super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
    }
  };
  var AuthInvalidCredentialsError = class extends CustomAuthError {
    constructor(message) {
      super(message, "AuthInvalidCredentialsError", 400, void 0);
    }
  };
  var AuthImplicitGrantRedirectError = class extends CustomAuthError {
    constructor(message, details = null) {
      super(message, "AuthImplicitGrantRedirectError", 500, void 0);
      this.details = null;
      this.details = details;
    }
    toJSON() {
      return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
    }
  };
  function isAuthImplicitGrantRedirectError(error) {
    return isAuthError(error) && error.name === "AuthImplicitGrantRedirectError";
  }
  var AuthPKCEGrantCodeExchangeError = class extends CustomAuthError {
    constructor(message, details = null) {
      super(message, "AuthPKCEGrantCodeExchangeError", 500, void 0);
      this.details = null;
      this.details = details;
    }
    toJSON() {
      return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
    }
  };
  var AuthPKCECodeVerifierMissingError = class extends CustomAuthError {
    constructor() {
      super("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.", "AuthPKCECodeVerifierMissingError", 400, "pkce_code_verifier_not_found");
    }
  };
  var AuthRetryableFetchError = class extends CustomAuthError {
    constructor(message, status) {
      super(message, "AuthRetryableFetchError", status, void 0);
    }
  };
  function isAuthRetryableFetchError(error) {
    return isAuthError(error) && error.name === "AuthRetryableFetchError";
  }
  var AuthRefreshDiscardedError = class extends CustomAuthError {
    constructor(message = "Refresh result discarded: session state changed mid-flight (e.g., concurrent signOut)") {
      super(message, "AuthRefreshDiscardedError", 409, void 0);
    }
  };
  function isAuthRefreshDiscardedError(error) {
    return isAuthError(error) && error.name === "AuthRefreshDiscardedError";
  }
  var AuthWeakPasswordError = class extends CustomAuthError {
    constructor(message, status, reasons) {
      super(message, "AuthWeakPasswordError", status, "weak_password");
      this.reasons = reasons;
    }
    toJSON() {
      return Object.assign(Object.assign({}, super.toJSON()), { reasons: this.reasons });
    }
  };
  var AuthInvalidJwtError = class extends CustomAuthError {
    constructor(message) {
      super(message, "AuthInvalidJwtError", 400, "invalid_jwt");
    }
  };

  // node_modules/@supabase/auth-js/dist/module/lib/base64url.js
  var TO_BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");
  var IGNORE_BASE64URL = " 	\n\r=".split("");
  var FROM_BASE64URL = (() => {
    const charMap = new Array(128);
    for (let i = 0; i < charMap.length; i += 1) {
      charMap[i] = -1;
    }
    for (let i = 0; i < IGNORE_BASE64URL.length; i += 1) {
      charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
    }
    for (let i = 0; i < TO_BASE64URL.length; i += 1) {
      charMap[TO_BASE64URL[i].charCodeAt(0)] = i;
    }
    return charMap;
  })();
  function byteToBase64URL(byte, state, emit) {
    if (byte !== null) {
      state.queue = state.queue << 8 | byte;
      state.queuedBits += 8;
      while (state.queuedBits >= 6) {
        const pos = state.queue >> state.queuedBits - 6 & 63;
        emit(TO_BASE64URL[pos]);
        state.queuedBits -= 6;
      }
    } else if (state.queuedBits > 0) {
      state.queue = state.queue << 6 - state.queuedBits;
      state.queuedBits = 6;
      while (state.queuedBits >= 6) {
        const pos = state.queue >> state.queuedBits - 6 & 63;
        emit(TO_BASE64URL[pos]);
        state.queuedBits -= 6;
      }
    }
  }
  function byteFromBase64URL(charCode, state, emit) {
    const bits = FROM_BASE64URL[charCode];
    if (bits > -1) {
      state.queue = state.queue << 6 | bits;
      state.queuedBits += 6;
      while (state.queuedBits >= 8) {
        emit(state.queue >> state.queuedBits - 8 & 255);
        state.queuedBits -= 8;
      }
    } else if (bits === -2) {
      return;
    } else {
      throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`);
    }
  }
  function stringFromBase64URL(str) {
    const conv = [];
    const utf8Emit = (codepoint) => {
      conv.push(String.fromCodePoint(codepoint));
    };
    const utf8State = {
      utf8seq: 0,
      codepoint: 0
    };
    const b64State = { queue: 0, queuedBits: 0 };
    const byteEmit = (byte) => {
      stringFromUTF8(byte, utf8State, utf8Emit);
    };
    for (let i = 0; i < str.length; i += 1) {
      byteFromBase64URL(str.charCodeAt(i), b64State, byteEmit);
    }
    return conv.join("");
  }
  function codepointToUTF8(codepoint, emit) {
    if (codepoint <= 127) {
      emit(codepoint);
      return;
    } else if (codepoint <= 2047) {
      emit(192 | codepoint >> 6);
      emit(128 | codepoint & 63);
      return;
    } else if (codepoint <= 65535) {
      emit(224 | codepoint >> 12);
      emit(128 | codepoint >> 6 & 63);
      emit(128 | codepoint & 63);
      return;
    } else if (codepoint <= 1114111) {
      emit(240 | codepoint >> 18);
      emit(128 | codepoint >> 12 & 63);
      emit(128 | codepoint >> 6 & 63);
      emit(128 | codepoint & 63);
      return;
    }
    throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
  }
  function stringToUTF8(str, emit) {
    for (let i = 0; i < str.length; i += 1) {
      let codepoint = str.charCodeAt(i);
      if (codepoint > 55295 && codepoint <= 56319) {
        const highSurrogate = (codepoint - 55296) * 1024 & 65535;
        const lowSurrogate = str.charCodeAt(i + 1) - 56320 & 65535;
        codepoint = (lowSurrogate | highSurrogate) + 65536;
        i += 1;
      }
      codepointToUTF8(codepoint, emit);
    }
  }
  function stringFromUTF8(byte, state, emit) {
    if (state.utf8seq === 0) {
      if (byte <= 127) {
        emit(byte);
        return;
      }
      for (let leadingBit = 1; leadingBit < 6; leadingBit += 1) {
        if ((byte >> 7 - leadingBit & 1) === 0) {
          state.utf8seq = leadingBit;
          break;
        }
      }
      if (state.utf8seq === 2) {
        state.codepoint = byte & 31;
      } else if (state.utf8seq === 3) {
        state.codepoint = byte & 15;
      } else if (state.utf8seq === 4) {
        state.codepoint = byte & 7;
      } else {
        throw new Error("Invalid UTF-8 sequence");
      }
      state.utf8seq -= 1;
    } else if (state.utf8seq > 0) {
      if (byte <= 127) {
        throw new Error("Invalid UTF-8 sequence");
      }
      state.codepoint = state.codepoint << 6 | byte & 63;
      state.utf8seq -= 1;
      if (state.utf8seq === 0) {
        emit(state.codepoint);
      }
    }
  }
  function base64UrlToUint8Array(str) {
    const result = [];
    const state = { queue: 0, queuedBits: 0 };
    const onByte = (byte) => {
      result.push(byte);
    };
    for (let i = 0; i < str.length; i += 1) {
      byteFromBase64URL(str.charCodeAt(i), state, onByte);
    }
    return new Uint8Array(result);
  }
  function stringToUint8Array(str) {
    const result = [];
    stringToUTF8(str, (byte) => result.push(byte));
    return new Uint8Array(result);
  }
  function bytesToBase64URL(bytes) {
    const result = [];
    const state = { queue: 0, queuedBits: 0 };
    const onChar = (char) => {
      result.push(char);
    };
    bytes.forEach((byte) => byteToBase64URL(byte, state, onChar));
    byteToBase64URL(null, state, onChar);
    return result.join("");
  }

  // node_modules/@supabase/auth-js/dist/module/lib/helpers.js
  function expiresAt(expiresIn) {
    const timeNow = Math.round(Date.now() / 1e3);
    return timeNow + expiresIn;
  }
  function generateCallbackId() {
    return Symbol("auth-callback");
  }
  var isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";
  var localStorageWriteTests = {
    tested: false,
    writable: false
  };
  var supportsLocalStorage = () => {
    if (!isBrowser()) {
      return false;
    }
    try {
      if (typeof globalThis.localStorage !== "object") {
        return false;
      }
    } catch (e) {
      return false;
    }
    if (localStorageWriteTests.tested) {
      return localStorageWriteTests.writable;
    }
    const randomKey = `lswt-${Math.random()}${Math.random()}`;
    try {
      globalThis.localStorage.setItem(randomKey, randomKey);
      globalThis.localStorage.removeItem(randomKey);
      localStorageWriteTests.tested = true;
      localStorageWriteTests.writable = true;
    } catch (e) {
      localStorageWriteTests.tested = true;
      localStorageWriteTests.writable = false;
    }
    return localStorageWriteTests.writable;
  };
  function parseParametersFromURL(href) {
    const result = {};
    const url = new URL(href);
    if (url.hash && url.hash[0] === "#") {
      try {
        const hashSearchParams = new URLSearchParams(url.hash.substring(1));
        hashSearchParams.forEach((value, key) => {
          result[key] = value;
        });
      } catch (_e) {
      }
    }
    url.searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  var resolveFetch3 = (customFetch) => {
    if (customFetch) {
      return (...args) => customFetch(...args);
    }
    return (...args) => fetch(...args);
  };
  var looksLikeFetchResponse = (maybeResponse) => {
    return typeof maybeResponse === "object" && maybeResponse !== null && "status" in maybeResponse && "ok" in maybeResponse && "json" in maybeResponse && typeof maybeResponse.json === "function";
  };
  var setItemAsync = async (storage, key, data) => {
    await storage.setItem(key, JSON.stringify(data));
  };
  var getItemAsync = async (storage, key) => {
    const value = await storage.getItem(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (_a) {
      return null;
    }
  };
  var removeItemAsync = async (storage, key) => {
    await storage.removeItem(key);
  };
  var Deferred = class {
    constructor() {
      ;
      this.promise = new Deferred.promiseConstructor((res, rej) => {
        ;
        this.resolve = res;
        this.reject = rej;
      });
    }
  };
  Deferred.promiseConstructor = Promise;
  function decodeJWT(token) {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new AuthInvalidJwtError("Invalid JWT structure");
    }
    for (let i = 0; i < parts.length; i++) {
      if (!BASE64URL_REGEX.test(parts[i])) {
        throw new AuthInvalidJwtError("JWT not in base64url format");
      }
    }
    const data = {
      header: JSON.parse(stringFromBase64URL(parts[0])),
      payload: JSON.parse(stringFromBase64URL(parts[1])),
      signature: base64UrlToUint8Array(parts[2]),
      raw: {
        header: parts[0],
        payload: parts[1]
      }
    };
    return data;
  }
  async function sleep2(time) {
    return await new Promise((accept) => {
      setTimeout(() => accept(null), time);
    });
  }
  function retryable(fn, isRetryable) {
    const promise = new Promise((accept, reject) => {
      ;
      (async () => {
        for (let attempt = 0; attempt < Infinity; attempt++) {
          try {
            const result = await fn(attempt);
            if (!isRetryable(attempt, null, result)) {
              accept(result);
              return;
            }
          } catch (e) {
            if (!isRetryable(attempt, e)) {
              reject(e);
              return;
            }
          }
        }
      })();
    });
    return promise;
  }
  function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
  }
  function generatePKCEVerifier() {
    const verifierLength = 56;
    const array = new Uint32Array(verifierLength);
    if (typeof crypto === "undefined") {
      const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
      const charSetLen = charSet.length;
      let verifier = "";
      for (let i = 0; i < verifierLength; i++) {
        verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
      }
      return verifier;
    }
    crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join("");
  }
  async function sha256(randomString) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(randomString);
    const hash = await crypto.subtle.digest("SHA-256", encodedData);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map((c) => String.fromCharCode(c)).join("");
  }
  async function generatePKCEChallenge(verifier) {
    const hasCryptoSupport = typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined" && typeof TextEncoder !== "undefined";
    if (!hasCryptoSupport) {
      console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.");
      return verifier;
    }
    const hashed = await sha256(verifier);
    return btoa(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
    const codeVerifier = generatePKCEVerifier();
    let storedCodeVerifier = codeVerifier;
    if (isPasswordRecovery) {
      storedCodeVerifier += "/recovery";
    }
    await setItemAsync(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
    const codeChallenge = await generatePKCEChallenge(codeVerifier);
    const codeChallengeMethod = codeVerifier === codeChallenge ? "plain" : "s256";
    return [codeChallenge, codeChallengeMethod];
  }
  var API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
  function parseResponseAPIVersion(response) {
    const apiVersion = response.headers.get(API_VERSION_HEADER_NAME);
    if (!apiVersion) {
      return null;
    }
    if (!apiVersion.match(API_VERSION_REGEX)) {
      return null;
    }
    try {
      const date = new Date(`${apiVersion}T00:00:00.0Z`);
      return date;
    } catch (_e) {
      return null;
    }
  }
  function validateExp(exp) {
    if (!exp) {
      throw new Error("Missing exp claim");
    }
    const timeNow = Math.floor(Date.now() / 1e3);
    if (exp <= timeNow) {
      throw new Error("JWT has expired");
    }
  }
  function getAlgorithm(alg) {
    switch (alg) {
      case "RS256":
        return {
          name: "RSASSA-PKCS1-v1_5",
          hash: { name: "SHA-256" }
        };
      case "ES256":
        return {
          name: "ECDSA",
          namedCurve: "P-256",
          hash: { name: "SHA-256" }
        };
      default:
        throw new Error("Invalid alg claim");
    }
  }
  var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  function validateUUID(str) {
    if (!UUID_REGEX.test(str)) {
      throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not");
    }
  }
  function assertPasskeyExperimentalEnabled(experimental) {
    if (!experimental.passkey) {
      throw new Error("@supabase/auth-js: the passkey API is experimental and disabled by default. Enable it by passing `auth: { experimental: { passkey: true } }` to createClient (or to the GoTrueClient constructor).");
    }
  }
  function userNotAvailableProxy() {
    const proxyTarget = {};
    return new Proxy(proxyTarget, {
      get: (target, prop) => {
        if (prop === "__isUserNotAvailableProxy") {
          return true;
        }
        if (typeof prop === "symbol") {
          const sProp = prop.toString();
          if (sProp === "Symbol(Symbol.toPrimitive)" || sProp === "Symbol(Symbol.toStringTag)" || sProp === "Symbol(util.inspect.custom)") {
            return void 0;
          }
        }
        throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${prop}" property of the session object is not supported. Please use getUser() instead.`);
      },
      set: (_target, prop) => {
        throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
      },
      deleteProperty: (_target, prop) => {
        throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
      }
    });
  }
  function insecureUserWarningProxy(user, suppressWarningRef) {
    return new Proxy(user, {
      get: (target, prop, receiver) => {
        if (prop === "__isInsecureUserWarningProxy") {
          return true;
        }
        if (typeof prop === "symbol") {
          const sProp = prop.toString();
          if (sProp === "Symbol(Symbol.toPrimitive)" || sProp === "Symbol(Symbol.toStringTag)" || sProp === "Symbol(util.inspect.custom)" || sProp === "Symbol(nodejs.util.inspect.custom)") {
            return Reflect.get(target, prop, receiver);
          }
        }
        if (!suppressWarningRef.value && typeof prop === "string") {
          console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.");
          suppressWarningRef.value = true;
        }
        return Reflect.get(target, prop, receiver);
      }
    });
  }
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // node_modules/@supabase/auth-js/dist/module/lib/fetch.js
  var _getErrorMessage2 = (err) => {
    if (typeof err === "object" && err !== null) {
      const e = err;
      if (typeof e.msg === "string")
        return e.msg;
      if (typeof e.message === "string")
        return e.message;
      if (typeof e.error_description === "string")
        return e.error_description;
      if (typeof e.error === "string")
        return e.error;
    }
    return JSON.stringify(err);
  };
  var NETWORK_ERROR_CODES = [
    500,
    501,
    502,
    503,
    504,
    520,
    521,
    522,
    523,
    524,
    525,
    526,
    527,
    528,
    529,
    530
  ];
  async function handleError2(error) {
    var _a;
    if (!looksLikeFetchResponse(error)) {
      throw new AuthRetryableFetchError(_getErrorMessage2(error), 0);
    }
    if (NETWORK_ERROR_CODES.includes(error.status)) {
      throw new AuthRetryableFetchError(_getErrorMessage2(error), error.status);
    }
    let data;
    try {
      data = await error.json();
    } catch (e) {
      throw new AuthUnknownError(_getErrorMessage2(e), e);
    }
    let errorCode = void 0;
    const responseAPIVersion = parseResponseAPIVersion(error);
    if (responseAPIVersion && responseAPIVersion.getTime() >= API_VERSIONS["2024-01-01"].timestamp && typeof data === "object" && data && typeof data.code === "string") {
      errorCode = data.code;
    } else if (typeof data === "object" && data && typeof data.error_code === "string") {
      errorCode = data.error_code;
    }
    if (!errorCode) {
      if (typeof data === "object" && data && typeof data.weak_password === "object" && data.weak_password && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
        throw new AuthWeakPasswordError(_getErrorMessage2(data), error.status, data.weak_password.reasons);
      }
    } else if (errorCode === "weak_password") {
      throw new AuthWeakPasswordError(_getErrorMessage2(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
    } else if (errorCode === "session_not_found") {
      throw new AuthSessionMissingError();
    }
    throw new AuthApiError(_getErrorMessage2(data), error.status || 500, errorCode);
  }
  var _getRequestParams2 = (method, options, parameters, body) => {
    const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
    if (method === "GET") {
      return params;
    }
    params.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, options === null || options === void 0 ? void 0 : options.headers);
    params.body = JSON.stringify(body);
    return Object.assign(Object.assign({}, params), parameters);
  };
  async function _request(fetcher, method, url, options) {
    var _a;
    const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
    if (!headers[API_VERSION_HEADER_NAME]) {
      headers[API_VERSION_HEADER_NAME] = API_VERSIONS["2024-01-01"].name;
    }
    if (options === null || options === void 0 ? void 0 : options.jwt) {
      headers["Authorization"] = `Bearer ${options.jwt}`;
    }
    const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
    if (options === null || options === void 0 ? void 0 : options.redirectTo) {
      qs["redirect_to"] = options.redirectTo;
    }
    const queryString = Object.keys(qs).length ? "?" + new URLSearchParams(qs).toString() : "";
    const data = await _handleRequest2(fetcher, method, url + queryString, {
      headers,
      noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson
    }, {}, options === null || options === void 0 ? void 0 : options.body);
    return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
  }
  async function _handleRequest2(fetcher, method, url, options, parameters, body) {
    const requestParams = _getRequestParams2(method, options, parameters, body);
    let result;
    try {
      result = await fetcher(url, Object.assign({}, requestParams));
    } catch (e) {
      console.error(e);
      throw new AuthRetryableFetchError(_getErrorMessage2(e), 0);
    }
    if (!result.ok) {
      await handleError2(result);
    }
    if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
      return result;
    }
    try {
      return await result.json();
    } catch (e) {
      await handleError2(e);
    }
  }
  function _sessionResponse(data) {
    var _a;
    let session = null;
    if (hasSession(data)) {
      session = Object.assign({}, data);
      if (!data.expires_at) {
        session.expires_at = expiresAt(data.expires_in);
      }
    }
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : typeof (data === null || data === void 0 ? void 0 : data.id) === "string" ? data : null;
    return { data: { session, user }, error: null };
  }
  function _sessionResponsePassword(data) {
    const response = _sessionResponse(data);
    if (!response.error && data.weak_password && typeof data.weak_password === "object" && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.message && typeof data.weak_password.message === "string" && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
      response.data.weak_password = data.weak_password;
    }
    return response;
  }
  function _userResponse(data) {
    var _a;
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return { data: { user }, error: null };
  }
  function _ssoResponse(data) {
    return { data, error: null };
  }
  function _generateLinkResponse(data) {
    const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
    const properties = {
      action_link,
      email_otp,
      hashed_token,
      redirect_to,
      verification_type
    };
    const user = Object.assign({}, rest);
    return {
      data: {
        properties,
        user
      },
      error: null
    };
  }
  function _noResolveJsonResponse(data) {
    return data;
  }
  function hasSession(data) {
    return !!data.access_token && !!data.refresh_token && !!data.expires_in;
  }

  // node_modules/@supabase/auth-js/dist/module/lib/types.js
  var SIGN_OUT_SCOPES = ["global", "local", "others"];

  // node_modules/@supabase/auth-js/dist/module/GoTrueAdminApi.js
  var GoTrueAdminApi = class {
    constructor({ url = "", headers = {}, fetch: fetch2, experimental }) {
      this.url = url;
      this.headers = headers;
      this.fetch = resolveFetch3(fetch2);
      this.experimental = experimental !== null && experimental !== void 0 ? experimental : {};
      this.mfa = {
        listFactors: this._listFactors.bind(this),
        deleteFactor: this._deleteFactor.bind(this)
      };
      this.oauth = {
        listClients: this._listOAuthClients.bind(this),
        createClient: this._createOAuthClient.bind(this),
        getClient: this._getOAuthClient.bind(this),
        updateClient: this._updateOAuthClient.bind(this),
        deleteClient: this._deleteOAuthClient.bind(this),
        regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this)
      };
      this.customProviders = {
        listProviders: this._listCustomProviders.bind(this),
        createProvider: this._createCustomProvider.bind(this),
        getProvider: this._getCustomProvider.bind(this),
        updateProvider: this._updateCustomProvider.bind(this),
        deleteProvider: this._deleteCustomProvider.bind(this)
      };
      this.passkey = {
        listPasskeys: this._adminListPasskeys.bind(this),
        deletePasskey: this._adminDeletePasskey.bind(this)
      };
    }
    async signOut(jwt, scope = SIGN_OUT_SCOPES[0]) {
      if (SIGN_OUT_SCOPES.indexOf(scope) < 0) {
        throw new Error(`@supabase/auth-js: Parameter scope must be one of ${SIGN_OUT_SCOPES.join(", ")}`);
      }
      try {
        await _request(this.fetch, "POST", `${this.url}/logout?scope=${scope}`, {
          headers: this.headers,
          jwt,
          noResolveJson: true
        });
        return { data: null, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async inviteUserByEmail(email, options = {}) {
      try {
        return await _request(this.fetch, "POST", `${this.url}/invite`, {
          body: { email, data: options.data },
          headers: this.headers,
          redirectTo: options.redirectTo,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    async generateLink(params) {
      try {
        const { options } = params, rest = __rest(params, ["options"]);
        const body = Object.assign(Object.assign({}, rest), options);
        if ("newEmail" in rest) {
          body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
          delete body["newEmail"];
        }
        return await _request(this.fetch, "POST", `${this.url}/admin/generate_link`, {
          body,
          headers: this.headers,
          xform: _generateLinkResponse,
          redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo
        });
      } catch (error) {
        if (isAuthError(error)) {
          return {
            data: {
              properties: null,
              user: null
            },
            error
          };
        }
        throw error;
      }
    }
    async createUser(attributes) {
      try {
        return await _request(this.fetch, "POST", `${this.url}/admin/users`, {
          body: attributes,
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    async listUsers(params) {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const pagination = { nextPage: null, lastPage: 0, total: 0 };
        const response = await _request(this.fetch, "GET", `${this.url}/admin/users`, {
          headers: this.headers,
          noResolveJson: true,
          query: {
            page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
            per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
          },
          xform: _noResolveJsonResponse
        });
        if (response.error)
          throw response.error;
        const users = await response.json();
        const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
        const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
        if (links.length > 0) {
          links.forEach((link) => {
            const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
            const rel = JSON.parse(link.split(";")[1].split("=")[1]);
            pagination[`${rel}Page`] = page;
          });
          pagination.total = parseInt(total);
        }
        return { data: Object.assign(Object.assign({}, users), pagination), error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { users: [] }, error };
        }
        throw error;
      }
    }
    async getUserById(uid) {
      validateUUID(uid);
      try {
        return await _request(this.fetch, "GET", `${this.url}/admin/users/${uid}`, {
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    async updateUserById(uid, attributes) {
      validateUUID(uid);
      try {
        return await _request(this.fetch, "PUT", `${this.url}/admin/users/${uid}`, {
          body: attributes,
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    async deleteUser(id, shouldSoftDelete = false) {
      validateUUID(id);
      try {
        return await _request(this.fetch, "DELETE", `${this.url}/admin/users/${id}`, {
          headers: this.headers,
          body: {
            should_soft_delete: shouldSoftDelete
          },
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    async _listFactors(params) {
      validateUUID(params.userId);
      try {
        const { data, error } = await _request(this.fetch, "GET", `${this.url}/admin/users/${params.userId}/factors`, {
          headers: this.headers,
          xform: (factors) => {
            return { data: { factors }, error: null };
          }
        });
        return { data, error };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _deleteFactor(params) {
      validateUUID(params.userId);
      validateUUID(params.id);
      try {
        const data = await _request(this.fetch, "DELETE", `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
          headers: this.headers
        });
        return { data, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _listOAuthClients(params) {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const pagination = { nextPage: null, lastPage: 0, total: 0 };
        const response = await _request(this.fetch, "GET", `${this.url}/admin/oauth/clients`, {
          headers: this.headers,
          noResolveJson: true,
          query: {
            page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
            per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
          },
          xform: _noResolveJsonResponse
        });
        if (response.error)
          throw response.error;
        const clients = await response.json();
        const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
        const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
        if (links.length > 0) {
          links.forEach((link) => {
            const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
            const rel = JSON.parse(link.split(";")[1].split("=")[1]);
            pagination[`${rel}Page`] = page;
          });
          pagination.total = parseInt(total);
        }
        return { data: Object.assign(Object.assign({}, clients), pagination), error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { clients: [] }, error };
        }
        throw error;
      }
    }
    async _createOAuthClient(params) {
      try {
        return await _request(this.fetch, "POST", `${this.url}/admin/oauth/clients`, {
          body: params,
          headers: this.headers,
          xform: (client) => {
            return { data: client, error: null };
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _getOAuthClient(clientId) {
      try {
        return await _request(this.fetch, "GET", `${this.url}/admin/oauth/clients/${clientId}`, {
          headers: this.headers,
          xform: (client) => {
            return { data: client, error: null };
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _updateOAuthClient(clientId, params) {
      try {
        return await _request(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${clientId}`, {
          body: params,
          headers: this.headers,
          xform: (client) => {
            return { data: client, error: null };
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _deleteOAuthClient(clientId) {
      try {
        await _request(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${clientId}`, {
          headers: this.headers,
          noResolveJson: true
        });
        return { data: null, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _regenerateOAuthClientSecret(clientId) {
      try {
        return await _request(this.fetch, "POST", `${this.url}/admin/oauth/clients/${clientId}/regenerate_secret`, {
          headers: this.headers,
          xform: (client) => {
            return { data: client, error: null };
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _listCustomProviders(params) {
      try {
        const query = {};
        if (params === null || params === void 0 ? void 0 : params.type) {
          query.type = params.type;
        }
        return await _request(this.fetch, "GET", `${this.url}/admin/custom-providers`, {
          headers: this.headers,
          query,
          xform: (data) => {
            var _a;
            return { data: { providers: (_a = data === null || data === void 0 ? void 0 : data.providers) !== null && _a !== void 0 ? _a : [] }, error: null };
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { providers: [] }, error };
        }
        throw error;
      }
    }
    async _createCustomProvider(params) {
      try {
        return await _request(this.fetch, "POST", `${this.url}/admin/custom-providers`, {
          body: params,
          headers: this.headers,
          xform: (provider) => {
            return { data: provider, error: null };
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _getCustomProvider(identifier) {
      try {
        return await _request(this.fetch, "GET", `${this.url}/admin/custom-providers/${identifier}`, {
          headers: this.headers,
          xform: (provider) => {
            return { data: provider, error: null };
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _updateCustomProvider(identifier, params) {
      try {
        return await _request(this.fetch, "PUT", `${this.url}/admin/custom-providers/${identifier}`, {
          body: params,
          headers: this.headers,
          xform: (provider) => {
            return { data: provider, error: null };
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _deleteCustomProvider(identifier) {
      try {
        await _request(this.fetch, "DELETE", `${this.url}/admin/custom-providers/${identifier}`, {
          headers: this.headers,
          noResolveJson: true
        });
        return { data: null, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _adminListPasskeys(params) {
      assertPasskeyExperimentalEnabled(this.experimental);
      validateUUID(params.userId);
      try {
        return await _request(this.fetch, "GET", `${this.url}/admin/users/${params.userId}/passkeys`, { headers: this.headers, xform: (data) => ({ data, error: null }) });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _adminDeletePasskey(params) {
      assertPasskeyExperimentalEnabled(this.experimental);
      validateUUID(params.userId);
      validateUUID(params.passkeyId);
      try {
        await _request(this.fetch, "DELETE", `${this.url}/admin/users/${params.userId}/passkeys/${params.passkeyId}`, { headers: this.headers, noResolveJson: true });
        return { data: null, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
  };

  // node_modules/@supabase/auth-js/dist/module/lib/local-storage.js
  function memoryLocalStorageAdapter(store = {}) {
    return {
      getItem: (key) => {
        return store[key] || null;
      },
      setItem: (key, value) => {
        store[key] = value;
      },
      removeItem: (key) => {
        delete store[key];
      }
    };
  }

  // node_modules/@supabase/auth-js/dist/module/lib/locks.js
  var internals = {
    debug: !!(globalThis && supportsLocalStorage() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
  };
  var LockAcquireTimeoutError = class extends Error {
    constructor(message) {
      super(message);
      this.isAcquireTimeout = true;
    }
  };

  // node_modules/@supabase/auth-js/dist/module/lib/polyfills.js
  function polyfillGlobalThis() {
    if (typeof globalThis === "object")
      return;
    try {
      Object.defineProperty(Object.prototype, "__magic__", {
        get: function() {
          return this;
        },
        configurable: true
      });
      __magic__.globalThis = __magic__;
      delete Object.prototype.__magic__;
    } catch (e) {
      if (typeof self !== "undefined") {
        self.globalThis = self;
      }
    }
  }

  // node_modules/@supabase/auth-js/dist/module/lib/web3/ethereum.js
  function getAddress(address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error(`@supabase/auth-js: Address "${address}" is invalid.`);
    }
    return address.toLowerCase();
  }
  function fromHex(hex) {
    return parseInt(hex, 16);
  }
  function toHex(value) {
    const bytes = new TextEncoder().encode(value);
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return "0x" + hex;
  }
  function createSiweMessage(parameters) {
    var _a;
    const { chainId, domain, expirationTime, issuedAt = new Date(), nonce, notBefore, requestId, resources, scheme, uri, version: version5 } = parameters;
    {
      if (!Number.isInteger(chainId))
        throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${chainId}`);
      if (!domain)
        throw new Error(`@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.`);
      if (nonce && nonce.length < 8)
        throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${nonce}`);
      if (!uri)
        throw new Error(`@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.`);
      if (version5 !== "1")
        throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${version5}`);
      if ((_a = parameters.statement) === null || _a === void 0 ? void 0 : _a.includes("\n"))
        throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${parameters.statement}`);
    }
    const address = getAddress(parameters.address);
    const origin = scheme ? `${scheme}://${domain}` : domain;
    const statement = parameters.statement ? `${parameters.statement}
` : "";
    const prefix = `${origin} wants you to sign in with your Ethereum account:
${address}

${statement}`;
    let suffix = `URI: ${uri}
Version: ${version5}
Chain ID: ${chainId}${nonce ? `
Nonce: ${nonce}` : ""}
Issued At: ${issuedAt.toISOString()}`;
    if (expirationTime)
      suffix += `
Expiration Time: ${expirationTime.toISOString()}`;
    if (notBefore)
      suffix += `
Not Before: ${notBefore.toISOString()}`;
    if (requestId)
      suffix += `
Request ID: ${requestId}`;
    if (resources) {
      let content = "\nResources:";
      for (const resource of resources) {
        if (!resource || typeof resource !== "string")
          throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${resource}`);
        content += `
- ${resource}`;
      }
      suffix += content;
    }
    return `${prefix}
${suffix}`;
  }

  // node_modules/@supabase/auth-js/dist/module/lib/webauthn.errors.js
  var WebAuthnError = class extends Error {
    constructor({ message, code, cause, name }) {
      var _a;
      super(message, { cause });
      this.__isWebAuthnError = true;
      this.name = (_a = name !== null && name !== void 0 ? name : cause instanceof Error ? cause.name : void 0) !== null && _a !== void 0 ? _a : "Unknown Error";
      this.code = code;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        code: this.code
      };
    }
  };
  var WebAuthnUnknownError = class extends WebAuthnError {
    constructor(message, originalError) {
      super({
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: originalError,
        message
      });
      this.name = "WebAuthnUnknownError";
      this.originalError = originalError;
    }
  };
  function identifyRegistrationError({ error, options }) {
    var _a, _b, _c;
    const { publicKey } = options;
    if (!publicKey) {
      throw Error("options was missing required publicKey property");
    }
    if (error.name === "AbortError") {
      if (options.signal instanceof AbortSignal) {
        return new WebAuthnError({
          message: "Registration ceremony was sent an abort signal",
          code: "ERROR_CEREMONY_ABORTED",
          cause: error
        });
      }
    } else if (error.name === "ConstraintError") {
      if (((_a = publicKey.authenticatorSelection) === null || _a === void 0 ? void 0 : _a.requireResidentKey) === true) {
        return new WebAuthnError({
          message: "Discoverable credentials were required but no available authenticator supported it",
          code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
          cause: error
        });
      } else if (options.mediation === "conditional" && ((_b = publicKey.authenticatorSelection) === null || _b === void 0 ? void 0 : _b.userVerification) === "required") {
        return new WebAuthnError({
          message: "User verification was required during automatic registration but it could not be performed",
          code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
          cause: error
        });
      } else if (((_c = publicKey.authenticatorSelection) === null || _c === void 0 ? void 0 : _c.userVerification) === "required") {
        return new WebAuthnError({
          message: "User verification was required but no available authenticator supported it",
          code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
          cause: error
        });
      }
    } else if (error.name === "InvalidStateError") {
      return new WebAuthnError({
        message: "The authenticator was previously registered",
        code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        cause: error
      });
    } else if (error.name === "NotAllowedError") {
      return new WebAuthnError({
        message: error.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: error
      });
    } else if (error.name === "NotSupportedError") {
      const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param) => param.type === "public-key");
      if (validPubKeyCredParams.length === 0) {
        return new WebAuthnError({
          message: 'No entry in pubKeyCredParams was of type "public-key"',
          code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
          cause: error
        });
      }
      return new WebAuthnError({
        message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
        code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
        cause: error
      });
    } else if (error.name === "SecurityError") {
      const effectiveDomain = window.location.hostname;
      if (!isValidDomain(effectiveDomain)) {
        return new WebAuthnError({
          message: `${window.location.hostname} is an invalid domain`,
          code: "ERROR_INVALID_DOMAIN",
          cause: error
        });
      } else if (publicKey.rp.id !== effectiveDomain) {
        return new WebAuthnError({
          message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
          code: "ERROR_INVALID_RP_ID",
          cause: error
        });
      }
    } else if (error.name === "TypeError") {
      if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
        return new WebAuthnError({
          message: "User ID was not between 1 and 64 characters",
          code: "ERROR_INVALID_USER_ID_LENGTH",
          cause: error
        });
      }
    } else if (error.name === "UnknownError") {
      return new WebAuthnError({
        message: "The authenticator was unable to process the specified options, or could not create a new credential",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: error
      });
    }
    return new WebAuthnError({
      message: "a Non-Webauthn related error has occurred",
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  }
  function identifyAuthenticationError({ error, options }) {
    const { publicKey } = options;
    if (!publicKey) {
      throw Error("options was missing required publicKey property");
    }
    if (error.name === "AbortError") {
      if (options.signal instanceof AbortSignal) {
        return new WebAuthnError({
          message: "Authentication ceremony was sent an abort signal",
          code: "ERROR_CEREMONY_ABORTED",
          cause: error
        });
      }
    } else if (error.name === "NotAllowedError") {
      return new WebAuthnError({
        message: error.message,
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: error
      });
    } else if (error.name === "SecurityError") {
      const effectiveDomain = window.location.hostname;
      if (!isValidDomain(effectiveDomain)) {
        return new WebAuthnError({
          message: `${window.location.hostname} is an invalid domain`,
          code: "ERROR_INVALID_DOMAIN",
          cause: error
        });
      } else if (publicKey.rpId !== effectiveDomain) {
        return new WebAuthnError({
          message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
          code: "ERROR_INVALID_RP_ID",
          cause: error
        });
      }
    } else if (error.name === "UnknownError") {
      return new WebAuthnError({
        message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
        code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
        cause: error
      });
    }
    return new WebAuthnError({
      message: "a Non-Webauthn related error has occurred",
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  }

  // node_modules/@supabase/auth-js/dist/module/lib/webauthn.js
  var WebAuthnAbortService = class {
    createNewAbortSignal() {
      if (this.controller) {
        const abortError = new Error("Cancelling existing WebAuthn API call for new one");
        abortError.name = "AbortError";
        this.controller.abort(abortError);
      }
      const newController = new AbortController();
      this.controller = newController;
      return newController.signal;
    }
    cancelCeremony() {
      if (this.controller) {
        const abortError = new Error("Manually cancelling existing WebAuthn API call");
        abortError.name = "AbortError";
        this.controller.abort(abortError);
        this.controller = void 0;
      }
    }
  };
  var webAuthnAbortService = new WebAuthnAbortService();
  function deserializeCredentialCreationOptions(options) {
    if (!options) {
      throw new Error("Credential creation options are required");
    }
    if (typeof PublicKeyCredential !== "undefined" && "parseCreationOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseCreationOptionsFromJSON === "function") {
      return PublicKeyCredential.parseCreationOptionsFromJSON(
        options
      );
    }
    const { challenge: challengeStr, user: userOpts, excludeCredentials } = options, restOptions = __rest(
      options,
      ["challenge", "user", "excludeCredentials"]
    );
    const challenge = base64UrlToUint8Array(challengeStr).buffer;
    const user = Object.assign(Object.assign({}, userOpts), { id: base64UrlToUint8Array(userOpts.id).buffer });
    const result = Object.assign(Object.assign({}, restOptions), {
      challenge,
      user
    });
    if (excludeCredentials && excludeCredentials.length > 0) {
      result.excludeCredentials = new Array(excludeCredentials.length);
      for (let i = 0; i < excludeCredentials.length; i++) {
        const cred = excludeCredentials[i];
        result.excludeCredentials[i] = Object.assign(Object.assign({}, cred), {
          id: base64UrlToUint8Array(cred.id).buffer,
          type: cred.type || "public-key",
          transports: cred.transports
        });
      }
    }
    return result;
  }
  function deserializeCredentialRequestOptions(options) {
    if (!options) {
      throw new Error("Credential request options are required");
    }
    if (typeof PublicKeyCredential !== "undefined" && "parseRequestOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseRequestOptionsFromJSON === "function") {
      return PublicKeyCredential.parseRequestOptionsFromJSON(options);
    }
    const { challenge: challengeStr, allowCredentials } = options, restOptions = __rest(
      options,
      ["challenge", "allowCredentials"]
    );
    const challenge = base64UrlToUint8Array(challengeStr).buffer;
    const result = Object.assign(Object.assign({}, restOptions), { challenge });
    if (allowCredentials && allowCredentials.length > 0) {
      result.allowCredentials = new Array(allowCredentials.length);
      for (let i = 0; i < allowCredentials.length; i++) {
        const cred = allowCredentials[i];
        result.allowCredentials[i] = Object.assign(Object.assign({}, cred), {
          id: base64UrlToUint8Array(cred.id).buffer,
          type: cred.type || "public-key",
          transports: cred.transports
        });
      }
    }
    return result;
  }
  function serializeCredentialCreationResponse(credential) {
    var _a;
    if ("toJSON" in credential && typeof credential.toJSON === "function") {
      return credential.toJSON();
    }
    const credentialWithAttachment = credential;
    return {
      id: credential.id,
      rawId: credential.id,
      response: {
        attestationObject: bytesToBase64URL(new Uint8Array(credential.response.attestationObject)),
        clientDataJSON: bytesToBase64URL(new Uint8Array(credential.response.clientDataJSON))
      },
      type: "public-key",
      clientExtensionResults: credential.getClientExtensionResults(),
      authenticatorAttachment: (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : void 0
    };
  }
  function serializeCredentialRequestResponse(credential) {
    var _a;
    if ("toJSON" in credential && typeof credential.toJSON === "function") {
      return credential.toJSON();
    }
    const credentialWithAttachment = credential;
    const clientExtensionResults = credential.getClientExtensionResults();
    const assertionResponse = credential.response;
    return {
      id: credential.id,
      rawId: credential.id,
      response: {
        authenticatorData: bytesToBase64URL(new Uint8Array(assertionResponse.authenticatorData)),
        clientDataJSON: bytesToBase64URL(new Uint8Array(assertionResponse.clientDataJSON)),
        signature: bytesToBase64URL(new Uint8Array(assertionResponse.signature)),
        userHandle: assertionResponse.userHandle ? bytesToBase64URL(new Uint8Array(assertionResponse.userHandle)) : void 0
      },
      type: "public-key",
      clientExtensionResults,
      authenticatorAttachment: (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : void 0
    };
  }
  function isValidDomain(hostname) {
    return hostname === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname);
  }
  function browserSupportsWebAuthn() {
    var _a, _b;
    return !!(isBrowser() && "PublicKeyCredential" in window && window.PublicKeyCredential && "credentials" in navigator && typeof ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _a === void 0 ? void 0 : _a.create) === "function" && typeof ((_b = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _b === void 0 ? void 0 : _b.get) === "function");
  }
  async function createCredential(options) {
    try {
      const response = await navigator.credentials.create(
        options
      );
      if (!response) {
        return {
          data: null,
          error: new WebAuthnUnknownError("Empty credential response", response)
        };
      }
      if (!(response instanceof PublicKeyCredential)) {
        return {
          data: null,
          error: new WebAuthnUnknownError("Browser returned unexpected credential type", response)
        };
      }
      return { data: response, error: null };
    } catch (err) {
      return {
        data: null,
        error: identifyRegistrationError({
          error: err,
          options
        })
      };
    }
  }
  async function getCredential(options) {
    try {
      const response = await navigator.credentials.get(
        options
      );
      if (!response) {
        return {
          data: null,
          error: new WebAuthnUnknownError("Empty credential response", response)
        };
      }
      if (!(response instanceof PublicKeyCredential)) {
        return {
          data: null,
          error: new WebAuthnUnknownError("Browser returned unexpected credential type", response)
        };
      }
      return { data: response, error: null };
    } catch (err) {
      return {
        data: null,
        error: identifyAuthenticationError({
          error: err,
          options
        })
      };
    }
  }
  var DEFAULT_CREATION_OPTIONS = {
    hints: ["security-key"],
    authenticatorSelection: {
      authenticatorAttachment: "cross-platform",
      requireResidentKey: false,
      userVerification: "preferred",
      residentKey: "discouraged"
    },
    attestation: "direct"
  };
  var DEFAULT_REQUEST_OPTIONS = {
    userVerification: "preferred",
    hints: ["security-key"],
    attestation: "direct"
  };
  function deepMerge(...sources) {
    const isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    const isArrayBufferLike = (val) => val instanceof ArrayBuffer || ArrayBuffer.isView(val);
    const result = {};
    for (const source of sources) {
      if (!source)
        continue;
      for (const key in source) {
        const value = source[key];
        if (value === void 0)
          continue;
        if (Array.isArray(value)) {
          result[key] = value;
        } else if (isArrayBufferLike(value)) {
          result[key] = value;
        } else if (isObject(value)) {
          const existing = result[key];
          if (isObject(existing)) {
            result[key] = deepMerge(existing, value);
          } else {
            result[key] = deepMerge(value);
          }
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }
  function mergeCredentialCreationOptions(baseOptions, overrides) {
    return deepMerge(DEFAULT_CREATION_OPTIONS, baseOptions, overrides || {});
  }
  function mergeCredentialRequestOptions(baseOptions, overrides) {
    return deepMerge(DEFAULT_REQUEST_OPTIONS, baseOptions, overrides || {});
  }
  var WebAuthnApi = class {
    constructor(client) {
      this.client = client;
      this.enroll = this._enroll.bind(this);
      this.challenge = this._challenge.bind(this);
      this.verify = this._verify.bind(this);
      this.authenticate = this._authenticate.bind(this);
      this.register = this._register.bind(this);
    }
    async _enroll(params) {
      return this.client.mfa.enroll(Object.assign(Object.assign({}, params), { factorType: "webauthn" }));
    }
    async _challenge({ factorId, webauthn, friendlyName, signal }, overrides) {
      var _a;
      try {
        const { data: challengeResponse, error: challengeError } = await this.client.mfa.challenge({
          factorId,
          webauthn
        });
        if (!challengeResponse) {
          return { data: null, error: challengeError };
        }
        const abortSignal = signal !== null && signal !== void 0 ? signal : webAuthnAbortService.createNewAbortSignal();
        if (challengeResponse.webauthn.type === "create") {
          const { user } = challengeResponse.webauthn.credential_options.publicKey;
          if (!user.name) {
            const nameToUse = friendlyName;
            if (!nameToUse) {
              const currentUser = await this.client.getUser();
              const userData = currentUser.data.user;
              const fallbackName = ((_a = userData === null || userData === void 0 ? void 0 : userData.user_metadata) === null || _a === void 0 ? void 0 : _a.name) || (userData === null || userData === void 0 ? void 0 : userData.email) || (userData === null || userData === void 0 ? void 0 : userData.id) || "User";
              user.name = `${user.id}:${fallbackName}`;
            } else {
              user.name = `${user.id}:${nameToUse}`;
            }
          }
          if (!user.displayName) {
            user.displayName = user.name;
          }
        }
        switch (challengeResponse.webauthn.type) {
          case "create": {
            const options = mergeCredentialCreationOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.create);
            const { data, error } = await createCredential({
              publicKey: options,
              signal: abortSignal
            });
            if (data) {
              return {
                data: {
                  factorId,
                  challengeId: challengeResponse.id,
                  webauthn: {
                    type: challengeResponse.webauthn.type,
                    credential_response: data
                  }
                },
                error: null
              };
            }
            return { data: null, error };
          }
          case "request": {
            const options = mergeCredentialRequestOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.request);
            const { data, error } = await getCredential(Object.assign(Object.assign({}, challengeResponse.webauthn.credential_options), { publicKey: options, signal: abortSignal }));
            if (data) {
              return {
                data: {
                  factorId,
                  challengeId: challengeResponse.id,
                  webauthn: {
                    type: challengeResponse.webauthn.type,
                    credential_response: data
                  }
                },
                error: null
              };
            }
            return { data: null, error };
          }
        }
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        return {
          data: null,
          error: new AuthUnknownError("Unexpected error in challenge", error)
        };
      }
    }
    async _verify({ challengeId, factorId, webauthn }) {
      return this.client.mfa.verify({
        factorId,
        challengeId,
        webauthn
      });
    }
    async _authenticate({ factorId, webauthn: { rpId = typeof window !== "undefined" ? window.location.hostname : void 0, rpOrigins = typeof window !== "undefined" ? [window.location.origin] : void 0, signal } = {} }, overrides) {
      if (!rpId) {
        return {
          data: null,
          error: new AuthError("rpId is required for WebAuthn authentication")
        };
      }
      try {
        if (!browserSupportsWebAuthn()) {
          return {
            data: null,
            error: new AuthUnknownError("Browser does not support WebAuthn", null)
          };
        }
        const { data: challengeResponse, error: challengeError } = await this.challenge({
          factorId,
          webauthn: { rpId, rpOrigins },
          signal
        }, { request: overrides });
        if (!challengeResponse) {
          return { data: null, error: challengeError };
        }
        const { webauthn } = challengeResponse;
        return this._verify({
          factorId,
          challengeId: challengeResponse.challengeId,
          webauthn: {
            type: webauthn.type,
            rpId,
            rpOrigins,
            credential_response: webauthn.credential_response
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        return {
          data: null,
          error: new AuthUnknownError("Unexpected error in authenticate", error)
        };
      }
    }
    async _register({ friendlyName, webauthn: { rpId = typeof window !== "undefined" ? window.location.hostname : void 0, rpOrigins = typeof window !== "undefined" ? [window.location.origin] : void 0, signal } = {} }, overrides) {
      if (!rpId) {
        return {
          data: null,
          error: new AuthError("rpId is required for WebAuthn registration")
        };
      }
      try {
        if (!browserSupportsWebAuthn()) {
          return {
            data: null,
            error: new AuthUnknownError("Browser does not support WebAuthn", null)
          };
        }
        const { data: factor, error: enrollError } = await this._enroll({
          friendlyName
        });
        if (!factor) {
          await this.client.mfa.listFactors().then((factors) => {
            var _a;
            return (_a = factors.data) === null || _a === void 0 ? void 0 : _a.all.find((v) => v.factor_type === "webauthn" && v.friendly_name === friendlyName && v.status !== "unverified");
          }).then((factor2) => factor2 ? this.client.mfa.unenroll({ factorId: factor2 === null || factor2 === void 0 ? void 0 : factor2.id }) : void 0);
          return { data: null, error: enrollError };
        }
        const { data: challengeResponse, error: challengeError } = await this._challenge({
          factorId: factor.id,
          friendlyName: factor.friendly_name,
          webauthn: { rpId, rpOrigins },
          signal
        }, {
          create: overrides
        });
        if (!challengeResponse) {
          return { data: null, error: challengeError };
        }
        return this._verify({
          factorId: factor.id,
          challengeId: challengeResponse.challengeId,
          webauthn: {
            rpId,
            rpOrigins,
            type: challengeResponse.webauthn.type,
            credential_response: challengeResponse.webauthn.credential_response
          }
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        return {
          data: null,
          error: new AuthUnknownError("Unexpected error in register", error)
        };
      }
    }
  };

  // node_modules/@supabase/auth-js/dist/module/GoTrueClient.js
  polyfillGlobalThis();
  var DEFAULT_OPTIONS = {
    url: GOTRUE_URL,
    storageKey: STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    headers: DEFAULT_HEADERS2,
    flowType: "implicit",
    debug: false,
    hasCustomAuthorizationHeader: false,
    throwOnError: false,
    lockAcquireTimeout: 5e3,
    skipAutoInitialize: false,
    experimental: {}
  };
  var GLOBAL_JWKS = {};
  var GoTrueClient = class {
    get jwks() {
      var _a, _b;
      return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.jwks) !== null && _b !== void 0 ? _b : { keys: [] };
    }
    set jwks(value) {
      GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { jwks: value });
    }
    get jwks_cached_at() {
      var _a, _b;
      return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.cachedAt) !== null && _b !== void 0 ? _b : Number.MIN_SAFE_INTEGER;
    }
    set jwks_cached_at(value) {
      GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { cachedAt: value });
    }
    constructor(options) {
      var _a, _b, _c;
      this.userStorage = null;
      this.memoryStorage = null;
      this.stateChangeEmitters = /* @__PURE__ */ new Map();
      this.autoRefreshTicker = null;
      this.autoRefreshTickTimeout = null;
      this.visibilityChangedCallback = null;
      this.refreshingDeferred = null;
      this.lastRefreshFailure = null;
      this._sessionRemovalEpoch = 0;
      this.initializePromise = null;
      this.detectSessionInUrl = true;
      this.hasCustomAuthorizationHeader = false;
      this.suppressGetSessionWarning = false;
      this.lock = null;
      this.lockAcquired = false;
      this.pendingInLock = [];
      this.broadcastChannel = null;
      this.logger = console.log;
      const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
      this.storageKey = settings.storageKey;
      this.instanceID = (_a = GoTrueClient.nextInstanceID[this.storageKey]) !== null && _a !== void 0 ? _a : 0;
      GoTrueClient.nextInstanceID[this.storageKey] = this.instanceID + 1;
      this.logDebugMessages = !!settings.debug;
      if (typeof settings.debug === "function") {
        this.logger = settings.debug;
      }
      if (this.instanceID > 0 && isBrowser()) {
        const message = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
        console.warn(message);
        if (this.logDebugMessages) {
          console.trace(message);
        }
      }
      this.persistSession = settings.persistSession;
      this.autoRefreshToken = settings.autoRefreshToken;
      this.experimental = (_b = settings.experimental) !== null && _b !== void 0 ? _b : {};
      this.admin = new GoTrueAdminApi({
        url: settings.url,
        headers: settings.headers,
        fetch: settings.fetch,
        experimental: this.experimental
      });
      this.url = settings.url;
      this.headers = settings.headers;
      this.fetch = resolveFetch3(settings.fetch);
      this.detectSessionInUrl = settings.detectSessionInUrl;
      this.flowType = settings.flowType;
      this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
      this.throwOnError = settings.throwOnError;
      this.lockAcquireTimeout = settings.lockAcquireTimeout;
      if (settings.lock != null) {
        this.lock = settings.lock;
      }
      if (!this.jwks) {
        this.jwks = { keys: [] };
        this.jwks_cached_at = Number.MIN_SAFE_INTEGER;
      }
      this.mfa = {
        verify: this._verify.bind(this),
        enroll: this._enroll.bind(this),
        unenroll: this._unenroll.bind(this),
        challenge: this._challenge.bind(this),
        listFactors: this._listFactors.bind(this),
        challengeAndVerify: this._challengeAndVerify.bind(this),
        getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
        webauthn: new WebAuthnApi(this)
      };
      this.oauth = {
        getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
        approveAuthorization: this._approveAuthorization.bind(this),
        denyAuthorization: this._denyAuthorization.bind(this),
        listGrants: this._listOAuthGrants.bind(this),
        revokeGrant: this._revokeOAuthGrant.bind(this)
      };
      this.passkey = {
        startRegistration: this._startPasskeyRegistration.bind(this),
        verifyRegistration: this._verifyPasskeyRegistration.bind(this),
        startAuthentication: this._startPasskeyAuthentication.bind(this),
        verifyAuthentication: this._verifyPasskeyAuthentication.bind(this),
        list: this._listPasskeys.bind(this),
        update: this._updatePasskey.bind(this),
        delete: this._deletePasskey.bind(this)
      };
      if (this.persistSession) {
        if (settings.storage) {
          this.storage = settings.storage;
        } else {
          if (supportsLocalStorage()) {
            this.storage = globalThis.localStorage;
          } else {
            this.memoryStorage = {};
            this.storage = memoryLocalStorageAdapter(this.memoryStorage);
          }
        }
        if (settings.userStorage) {
          this.userStorage = settings.userStorage;
        }
      } else {
        this.memoryStorage = {};
        this.storage = memoryLocalStorageAdapter(this.memoryStorage);
      }
      if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
        try {
          this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
        } catch (e) {
          console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", e);
        }
        (_c = this.broadcastChannel) === null || _c === void 0 ? void 0 : _c.addEventListener("message", async (event) => {
          this._debug("received broadcast notification from other tab or client", event);
          if (event.data.event === "TOKEN_REFRESHED" || event.data.event === "SIGNED_IN") {
            this.lastRefreshFailure = null;
          }
          try {
            await this._notifyAllSubscribers(event.data.event, event.data.session, false);
          } catch (error) {
            this._debug("#broadcastChannel", "error", error);
          }
        });
      }
      if (!settings.skipAutoInitialize) {
        this.initialize().catch((error) => {
          this._debug("#initialize()", "error", error);
        });
      }
    }
    isThrowOnErrorEnabled() {
      return this.throwOnError;
    }
    _returnResult(result) {
      if (this.throwOnError && result && result.error) {
        throw result.error;
      }
      return result;
    }
    _logPrefix() {
      return `GoTrueClient@${this.storageKey}:${this.instanceID} (${version3}) ${new Date().toISOString()}`;
    }
    _debug(...args) {
      if (this.logDebugMessages) {
        this.logger(this._logPrefix(), ...args);
      }
      return this;
    }
    async initialize() {
      if (this.initializePromise) {
        return await this.initializePromise;
      }
      this.initializePromise = (async () => {
        if (this.lock != null) {
          return await this._acquireLock(this.lockAcquireTimeout, async () => {
            return await this._initialize();
          });
        }
        return await this._initialize();
      })();
      return await this.initializePromise;
    }
    async _initialize() {
      var _a;
      try {
        let params = {};
        let callbackUrlType = "none";
        if (isBrowser()) {
          params = parseParametersFromURL(window.location.href);
          if (this._isImplicitGrantCallback(params)) {
            callbackUrlType = "implicit";
          } else if (await this._isPKCECallback(params)) {
            callbackUrlType = "pkce";
          }
        }
        if (isBrowser() && this.detectSessionInUrl && callbackUrlType !== "none") {
          const { data, error } = await this._getSessionFromURL(params, callbackUrlType);
          if (error) {
            this._debug("#_initialize()", "error detecting session from URL", error);
            if (isAuthImplicitGrantRedirectError(error)) {
              const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code;
              if (errorCode === "identity_already_exists" || errorCode === "identity_not_found" || errorCode === "single_identity_not_deletable") {
                return { error };
              }
            }
            return { error };
          }
          const { session, redirectType } = data;
          this._debug("#_initialize()", "detected session in URL", session, "redirect type", redirectType);
          await this._saveSession(session);
          setTimeout(async () => {
            if (redirectType === "recovery") {
              await this._notifyAllSubscribers("PASSWORD_RECOVERY", session);
            } else {
              await this._notifyAllSubscribers("SIGNED_IN", session);
            }
          }, 0);
          return { error: null };
        }
        await this._recoverAndRefresh();
        return { error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ error });
        }
        return this._returnResult({
          error: new AuthUnknownError("Unexpected error during initialization", error)
        });
      } finally {
        await this._handleVisibilityChange();
        this._debug("#_initialize()", "end");
      }
    }
    async signInAnonymously(credentials) {
      var _a, _b, _c;
      try {
        const res = await _request(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          body: {
            data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
            gotrue_meta_security: { captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken }
          },
          xform: _sessionResponse
        });
        const { data, error } = res;
        if (error || !data) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        const session = data.session;
        const user = data.user;
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return this._returnResult({ data: { user, session }, error: null });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async signUp(credentials) {
      var _a, _b, _c;
      try {
        let res;
        if ("email" in credentials) {
          const { email, password, options } = credentials;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce") {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          res = await _request(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
            body: {
              email,
              password,
              data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod
            },
            xform: _sessionResponse
          });
        } else if ("phone" in credentials) {
          const { phone, password, options } = credentials;
          res = await _request(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            body: {
              phone,
              password,
              data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
              channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : "sms",
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponse
          });
        } else {
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
        }
        const { data, error } = res;
        if (error || !data) {
          await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        const session = data.session;
        const user = data.user;
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return this._returnResult({ data: { user, session }, error: null });
      } catch (error) {
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async signInWithPassword(credentials) {
      try {
        let res;
        if ("email" in credentials) {
          const { email, password, options } = credentials;
          res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
            headers: this.headers,
            body: {
              email,
              password,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponsePassword
          });
        } else if ("phone" in credentials) {
          const { phone, password, options } = credentials;
          res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
            headers: this.headers,
            body: {
              phone,
              password,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponsePassword
          });
        } else {
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
        }
        const { data, error } = res;
        if (error) {
          return this._returnResult({ data: { user: null, session: null }, error });
        } else if (!data || !data.session || !data.user) {
          const invalidTokenError = new AuthInvalidTokenResponseError();
          return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return this._returnResult({
          data: Object.assign({ user: data.user, session: data.session }, data.weak_password ? { weakPassword: data.weak_password } : null),
          error
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async signInWithOAuth(credentials) {
      var _a, _b, _c, _d;
      return await this._handleProviderSignIn(credentials.provider, {
        redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
        scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
        queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
        skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect
      });
    }
    async exchangeCodeForSession(authCode) {
      await this.initializePromise;
      if (this.lock != null) {
        return this._acquireLock(this.lockAcquireTimeout, async () => {
          return this._exchangeCodeForSession(authCode);
        });
      }
      return this._exchangeCodeForSession(authCode);
    }
    async signInWithWeb3(credentials) {
      const { chain } = credentials;
      switch (chain) {
        case "ethereum":
          return await this.signInWithEthereum(credentials);
        case "solana":
          return await this.signInWithSolana(credentials);
        default:
          throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`);
      }
    }
    async signInWithEthereum(credentials) {
      var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m;
      let message;
      let signature;
      if ("message" in credentials) {
        message = credentials.message;
        signature = credentials.signature;
      } else {
        const { chain, wallet, statement, options } = credentials;
        let resolvedWallet;
        if (!isBrowser()) {
          if (typeof wallet !== "object" || !(options === null || options === void 0 ? void 0 : options.url)) {
            throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
          }
          resolvedWallet = wallet;
        } else if (typeof wallet === "object") {
          resolvedWallet = wallet;
        } else {
          const windowAny = window;
          if ("ethereum" in windowAny && typeof windowAny.ethereum === "object" && "request" in windowAny.ethereum && typeof windowAny.ethereum.request === "function") {
            resolvedWallet = windowAny.ethereum;
          } else {
            throw new Error(`@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.`);
          }
        }
        const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
        const accounts = await resolvedWallet.request({
          method: "eth_requestAccounts"
        }).then((accs) => accs).catch(() => {
          throw new Error(`@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid`);
        });
        if (!accounts || accounts.length === 0) {
          throw new Error(`@supabase/auth-js: No accounts available. Please ensure the wallet is connected.`);
        }
        const address = getAddress(accounts[0]);
        let chainId = (_b = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _b === void 0 ? void 0 : _b.chainId;
        if (!chainId) {
          const chainIdHex = await resolvedWallet.request({
            method: "eth_chainId"
          });
          chainId = fromHex(chainIdHex);
        }
        const siweMessage = {
          domain: url.host,
          address,
          statement,
          uri: url.href,
          version: "1",
          chainId,
          nonce: (_c = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _c === void 0 ? void 0 : _c.nonce,
          issuedAt: (_f = (_d = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _d === void 0 ? void 0 : _d.issuedAt) !== null && _f !== void 0 ? _f : new Date(),
          expirationTime: (_g = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _g === void 0 ? void 0 : _g.expirationTime,
          notBefore: (_h = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _h === void 0 ? void 0 : _h.notBefore,
          requestId: (_j = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _j === void 0 ? void 0 : _j.requestId,
          resources: (_k = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _k === void 0 ? void 0 : _k.resources
        };
        message = createSiweMessage(siweMessage);
        signature = await resolvedWallet.request({
          method: "personal_sign",
          params: [toHex(message), address]
        });
      }
      try {
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
          headers: this.headers,
          body: Object.assign({
            chain: "ethereum",
            message,
            signature
          }, ((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken) ? { gotrue_meta_security: { captcha_token: (_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken } } : null),
          xform: _sessionResponse
        });
        if (error) {
          throw error;
        }
        if (!data || !data.session || !data.user) {
          const invalidTokenError = new AuthInvalidTokenResponseError();
          return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return this._returnResult({ data: Object.assign({}, data), error });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async signInWithSolana(credentials) {
      var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o;
      let message;
      let signature;
      if ("message" in credentials) {
        message = credentials.message;
        signature = credentials.signature;
      } else {
        const { chain, wallet, statement, options } = credentials;
        let resolvedWallet;
        if (!isBrowser()) {
          if (typeof wallet !== "object" || !(options === null || options === void 0 ? void 0 : options.url)) {
            throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
          }
          resolvedWallet = wallet;
        } else if (typeof wallet === "object") {
          resolvedWallet = wallet;
        } else {
          const windowAny = window;
          if ("solana" in windowAny && typeof windowAny.solana === "object" && ("signIn" in windowAny.solana && typeof windowAny.solana.signIn === "function" || "signMessage" in windowAny.solana && typeof windowAny.solana.signMessage === "function")) {
            resolvedWallet = windowAny.solana;
          } else {
            throw new Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`);
          }
        }
        const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
        if ("signIn" in resolvedWallet && resolvedWallet.signIn) {
          const output = await resolvedWallet.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: new Date().toISOString() }, options === null || options === void 0 ? void 0 : options.signInWithSolana), {
            version: "1",
            domain: url.host,
            uri: url.href
          }), statement ? { statement } : null));
          let outputToProcess;
          if (Array.isArray(output) && output[0] && typeof output[0] === "object") {
            outputToProcess = output[0];
          } else if (output && typeof output === "object" && "signedMessage" in output && "signature" in output) {
            outputToProcess = output;
          } else {
            throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
          }
          if ("signedMessage" in outputToProcess && "signature" in outputToProcess && (typeof outputToProcess.signedMessage === "string" || outputToProcess.signedMessage instanceof Uint8Array) && outputToProcess.signature instanceof Uint8Array) {
            message = typeof outputToProcess.signedMessage === "string" ? outputToProcess.signedMessage : new TextDecoder().decode(outputToProcess.signedMessage);
            signature = outputToProcess.signature;
          } else {
            throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
          }
        } else {
          if (!("signMessage" in resolvedWallet) || typeof resolvedWallet.signMessage !== "function" || !("publicKey" in resolvedWallet) || typeof resolvedWallet !== "object" || !resolvedWallet.publicKey || !("toBase58" in resolvedWallet.publicKey) || typeof resolvedWallet.publicKey.toBase58 !== "function") {
            throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
          }
          message = [
            `${url.host} wants you to sign in with your Solana account:`,
            resolvedWallet.publicKey.toBase58(),
            ...statement ? ["", statement, ""] : [""],
            "Version: 1",
            `URI: ${url.href}`,
            `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : new Date().toISOString()}`,
            ...((_d = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _d === void 0 ? void 0 : _d.notBefore) ? [`Not Before: ${options.signInWithSolana.notBefore}`] : [],
            ...((_f = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _f === void 0 ? void 0 : _f.expirationTime) ? [`Expiration Time: ${options.signInWithSolana.expirationTime}`] : [],
            ...((_g = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _g === void 0 ? void 0 : _g.chainId) ? [`Chain ID: ${options.signInWithSolana.chainId}`] : [],
            ...((_h = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _h === void 0 ? void 0 : _h.nonce) ? [`Nonce: ${options.signInWithSolana.nonce}`] : [],
            ...((_j = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _j === void 0 ? void 0 : _j.requestId) ? [`Request ID: ${options.signInWithSolana.requestId}`] : [],
            ...((_l = (_k = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _k === void 0 ? void 0 : _k.resources) === null || _l === void 0 ? void 0 : _l.length) ? [
              "Resources",
              ...options.signInWithSolana.resources.map((resource) => `- ${resource}`)
            ] : []
          ].join("\n");
          const maybeSignature = await resolvedWallet.signMessage(new TextEncoder().encode(message), "utf8");
          if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) {
            throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
          }
          signature = maybeSignature;
        }
      }
      try {
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
          headers: this.headers,
          body: Object.assign({ chain: "solana", message, signature: bytesToBase64URL(signature) }, ((_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken) ? { gotrue_meta_security: { captcha_token: (_o = credentials.options) === null || _o === void 0 ? void 0 : _o.captchaToken } } : null),
          xform: _sessionResponse
        });
        if (error) {
          throw error;
        }
        if (!data || !data.session || !data.user) {
          const invalidTokenError = new AuthInvalidTokenResponseError();
          return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return this._returnResult({ data: Object.assign({}, data), error });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async _exchangeCodeForSession(authCode) {
      const storageItem = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : "").split("/");
      try {
        if (!codeVerifier && this.flowType === "pkce") {
          throw new AuthPKCECodeVerifierMissingError();
        }
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
          headers: this.headers,
          body: {
            auth_code: authCode,
            code_verifier: codeVerifier
          },
          xform: _sessionResponse
        });
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (error) {
          throw error;
        }
        if (!data || !data.session || !data.user) {
          const invalidTokenError = new AuthInvalidTokenResponseError();
          return this._returnResult({
            data: { user: null, session: null, redirectType: null },
            error: invalidTokenError
          });
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers(redirectType === "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", data.session);
        }
        return this._returnResult({ data: Object.assign(Object.assign({}, data), { redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null }), error });
      } catch (error) {
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (isAuthError(error)) {
          return this._returnResult({
            data: { user: null, session: null, redirectType: null },
            error
          });
        }
        throw error;
      }
    }
    async signInWithIdToken(credentials) {
      try {
        const { options, provider, token, access_token, nonce } = credentials;
        const res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
          headers: this.headers,
          body: {
            provider,
            id_token: token,
            access_token,
            nonce,
            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
          },
          xform: _sessionResponse
        });
        const { data, error } = res;
        if (error) {
          return this._returnResult({ data: { user: null, session: null }, error });
        } else if (!data || !data.session || !data.user) {
          const invalidTokenError = new AuthInvalidTokenResponseError();
          return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return this._returnResult({ data, error });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async signInWithOtp(credentials) {
      var _a, _b, _c, _d, _f;
      try {
        if ("email" in credentials) {
          const { email, options } = credentials;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce") {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          const { error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
            headers: this.headers,
            body: {
              email,
              data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
              create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod
            },
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
          });
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        if ("phone" in credentials) {
          const { phone, options } = credentials;
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
            headers: this.headers,
            body: {
              phone,
              data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
              create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              channel: (_f = options === null || options === void 0 ? void 0 : options.channel) !== null && _f !== void 0 ? _f : "sms"
            }
          });
          return this._returnResult({
            data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
            error
          });
        }
        throw new AuthInvalidCredentialsError("You must provide either an email or phone number.");
      } catch (error) {
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async verifyOtp(params) {
      var _a, _b;
      try {
        let redirectTo = void 0;
        let captchaToken = void 0;
        if ("options" in params) {
          redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
          captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
        }
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/verify`, {
          headers: this.headers,
          body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: captchaToken } }),
          redirectTo,
          xform: _sessionResponse
        });
        if (error) {
          throw error;
        }
        if (!data) {
          const tokenVerificationError = new Error("An error occurred on token verification.");
          throw tokenVerificationError;
        }
        const session = data.session;
        const user = data.user;
        if (session === null || session === void 0 ? void 0 : session.access_token) {
          await this._saveSession(session);
          await this._notifyAllSubscribers(params.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", session);
        }
        return this._returnResult({ data: { user, session }, error: null });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async signInWithSSO(params) {
      var _a, _b, _c, _d, _f;
      try {
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === "pkce") {
          ;
          [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
        }
        const result = await _request(this.fetch, "POST", `${this.url}/sso`, {
          body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in params ? { provider_id: params.providerId } : null), "domain" in params ? { domain: params.domain } : null), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : void 0 }), ((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken) ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } } : null), { skip_http_redirect: true, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
          headers: this.headers,
          xform: _ssoResponse
        });
        if (((_d = result.data) === null || _d === void 0 ? void 0 : _d.url) && isBrowser() && !((_f = params.options) === null || _f === void 0 ? void 0 : _f.skipBrowserRedirect)) {
          window.location.assign(result.data.url);
        }
        return this._returnResult(result);
      } catch (error) {
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async reauthenticate() {
      await this.initializePromise;
      if (this.lock != null) {
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
          return await this._reauthenticate();
        });
      }
      return await this._reauthenticate();
    }
    async _reauthenticate() {
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError)
            throw sessionError;
          if (!session)
            throw new AuthSessionMissingError();
          const { error } = await _request(this.fetch, "GET", `${this.url}/reauthenticate`, {
            headers: this.headers,
            jwt: session.access_token
          });
          return this._returnResult({ data: { user: null, session: null }, error });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async resend(credentials) {
      try {
        const endpoint = `${this.url}/resend`;
        if ("email" in credentials) {
          const { email, type, options } = credentials;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce") {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          const { error } = await _request(this.fetch, "POST", endpoint, {
            headers: this.headers,
            body: {
              email,
              type,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod
            },
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
          });
          if (error) {
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          }
          return this._returnResult({ data: { user: null, session: null }, error });
        } else if ("phone" in credentials) {
          const { phone, type, options } = credentials;
          const { data, error } = await _request(this.fetch, "POST", endpoint, {
            headers: this.headers,
            body: {
              phone,
              type,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            }
          });
          return this._returnResult({
            data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
            error
          });
        }
        throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a type");
      } catch (error) {
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async getSession() {
      await this.initializePromise;
      if (this.lock != null) {
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
          return this._useSession(async (result) => {
            return result;
          });
        });
      }
      return await this._useSession(async (result) => {
        return result;
      });
    }
    async _acquireLock(acquireTimeout, fn) {
      this._debug("#_acquireLock", "begin", acquireTimeout);
      try {
        if (this.lockAcquired) {
          const last = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve();
          const result = (async () => {
            await last;
            return await fn();
          })();
          this.pendingInLock.push((async () => {
            try {
              await result;
            } catch (_e) {
            }
          })());
          return result;
        }
        return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
          this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
          try {
            this.lockAcquired = true;
            const result = fn();
            this.pendingInLock.push((async () => {
              try {
                await result;
              } catch (e) {
              }
            })());
            await result;
            while (this.pendingInLock.length) {
              const waitOn = [...this.pendingInLock];
              await Promise.all(waitOn);
              this.pendingInLock.splice(0, waitOn.length);
            }
            return await result;
          } finally {
            this._debug("#_acquireLock", "lock released for storage key", this.storageKey);
            this.lockAcquired = false;
          }
        });
      } finally {
        this._debug("#_acquireLock", "end");
      }
    }
    async _useSession(fn) {
      this._debug("#_useSession", "begin");
      try {
        const result = await this.__loadSession();
        return await fn(result);
      } finally {
        this._debug("#_useSession", "end");
      }
    }
    async __loadSession() {
      this._debug("#__loadSession()", "begin");
      if (this.lock != null && !this.lockAcquired) {
        this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
      }
      try {
        let currentSession = null;
        const maybeSession = await getItemAsync(this.storage, this.storageKey);
        this._debug("#getSession()", "session from storage", maybeSession);
        if (maybeSession !== null) {
          if (this._isValidSession(maybeSession)) {
            currentSession = maybeSession;
          } else {
            this._debug("#getSession()", "session from storage is not valid");
            await this._removeSession();
          }
        }
        if (!currentSession) {
          return { data: { session: null }, error: null };
        }
        const hasExpired = currentSession.expires_at ? currentSession.expires_at * 1e3 - Date.now() < EXPIRY_MARGIN_MS : false;
        this._debug("#__loadSession()", `session has${hasExpired ? "" : " not"} expired`, "expires_at", currentSession.expires_at);
        if (!hasExpired) {
          if (this.userStorage) {
            const maybeUser = await getItemAsync(this.userStorage, this.storageKey + "-user");
            if (maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) {
              currentSession.user = maybeUser.user;
            } else {
              currentSession.user = userNotAvailableProxy();
            }
          }
          if (this.storage.isServer && currentSession.user && !currentSession.user.__isUserNotAvailableProxy) {
            const suppressWarningRef = { value: this.suppressGetSessionWarning };
            currentSession.user = insecureUserWarningProxy(currentSession.user, suppressWarningRef);
            if (suppressWarningRef.value) {
              this.suppressGetSessionWarning = true;
            }
          }
          return { data: { session: currentSession }, error: null };
        }
        const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
        if (error) {
          const accessTokenStillValid = !!(currentSession.expires_at && currentSession.expires_at * 1e3 > Date.now());
          if (accessTokenStillValid) {
            const stillStored = await getItemAsync(this.storage, this.storageKey);
            if (stillStored && stillStored.refresh_token === currentSession.refresh_token) {
              return this._returnResult({ data: { session: currentSession }, error: null });
            }
          }
          return this._returnResult({ data: { session: null }, error });
        }
        return this._returnResult({ data: { session }, error: null });
      } finally {
        this._debug("#__loadSession()", "end");
      }
    }
    async getUser(jwt) {
      if (jwt) {
        return await this._getUser(jwt);
      }
      await this.initializePromise;
      let result;
      if (this.lock != null) {
        result = await this._acquireLock(this.lockAcquireTimeout, async () => {
          return await this._getUser();
        });
      } else {
        result = await this._getUser();
      }
      if (result.data.user) {
        this.suppressGetSessionWarning = true;
      }
      return result;
    }
    async _getUser(jwt) {
      try {
        if (jwt) {
          return await _request(this.fetch, "GET", `${this.url}/user`, {
            headers: this.headers,
            jwt,
            xform: _userResponse
          });
        }
        return await this._useSession(async (result) => {
          var _a, _b, _c;
          const { data, error } = result;
          if (error) {
            throw error;
          }
          if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) {
            return { data: { user: null }, error: new AuthSessionMissingError() };
          }
          return await _request(this.fetch, "GET", `${this.url}/user`, {
            headers: this.headers,
            jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : void 0,
            xform: _userResponse
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          if (isAuthSessionMissingError(error)) {
            await this._removeSession();
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          }
          return this._returnResult({ data: { user: null }, error });
        }
        throw error;
      }
    }
    async updateUser(attributes, options = {}) {
      await this.initializePromise;
      if (this.lock != null) {
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
          return await this._updateUser(attributes, options);
        });
      }
      return await this._updateUser(attributes, options);
    }
    async _updateUser(attributes, options = {}) {
      try {
        return await this._useSession(async (result) => {
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            throw sessionError;
          }
          if (!sessionData.session) {
            throw new AuthSessionMissingError();
          }
          const session = sessionData.session;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce" && attributes.email != null) {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          const { data, error: userError } = await _request(this.fetch, "PUT", `${this.url}/user`, {
            headers: this.headers,
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
            body: Object.assign(Object.assign({}, attributes), { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
            jwt: session.access_token,
            xform: _userResponse
          });
          if (userError) {
            throw userError;
          }
          session.user = data.user;
          await this._saveSession(session);
          await this._notifyAllSubscribers("USER_UPDATED", session);
          return this._returnResult({ data: { user: session.user }, error: null });
        });
      } catch (error) {
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null }, error });
        }
        throw error;
      }
    }
    async setSession(currentSession) {
      await this.initializePromise;
      if (this.lock != null) {
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
          return await this._setSession(currentSession);
        });
      }
      return await this._setSession(currentSession);
    }
    async _setSession(currentSession) {
      try {
        if (!currentSession.access_token || !currentSession.refresh_token) {
          throw new AuthSessionMissingError();
        }
        const timeNow = Date.now() / 1e3;
        let expiresAt2 = timeNow;
        let hasExpired = true;
        let session = null;
        const { payload } = decodeJWT(currentSession.access_token);
        if (payload.exp) {
          expiresAt2 = payload.exp;
          hasExpired = expiresAt2 <= timeNow;
        }
        if (hasExpired) {
          const { data: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          if (!refreshedSession) {
            return { data: { user: null, session: null }, error: null };
          }
          session = refreshedSession;
        } else {
          const { data, error } = await this._getUser(currentSession.access_token);
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          session = {
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token,
            user: data.user,
            token_type: "bearer",
            expires_in: expiresAt2 - timeNow,
            expires_at: expiresAt2
          };
          await this._saveSession(session);
          await this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return this._returnResult({ data: { user: session.user, session }, error: null });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { session: null, user: null }, error });
        }
        throw error;
      }
    }
    async refreshSession(currentSession) {
      await this.initializePromise;
      if (this.lock != null) {
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
          return await this._refreshSession(currentSession);
        });
      }
      return await this._refreshSession(currentSession);
    }
    async _refreshSession(currentSession) {
      try {
        return await this._useSession(async (result) => {
          var _a;
          if (!currentSession) {
            const { data, error: error2 } = result;
            if (error2) {
              throw error2;
            }
            currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : void 0;
          }
          if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
            throw new AuthSessionMissingError();
          }
          const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          if (!session) {
            return this._returnResult({ data: { user: null, session: null }, error: null });
          }
          return this._returnResult({ data: { user: session.user, session }, error: null });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { user: null, session: null }, error });
        }
        throw error;
      }
    }
    async _getSessionFromURL(params, callbackUrlType) {
      var _a;
      try {
        if (!isBrowser())
          throw new AuthImplicitGrantRedirectError("No browser detected.");
        if (params.error || params.error_description || params.error_code) {
          throw new AuthImplicitGrantRedirectError(params.error_description || "Error in URL with unspecified error_description", {
            error: params.error || "unspecified_error",
            code: params.error_code || "unspecified_code"
          });
        }
        switch (callbackUrlType) {
          case "implicit":
            if (this.flowType === "pkce") {
              throw new AuthPKCEGrantCodeExchangeError("Not a valid PKCE flow url.");
            }
            break;
          case "pkce":
            if (this.flowType === "implicit") {
              throw new AuthImplicitGrantRedirectError("Not a valid implicit grant flow url.");
            }
            break;
          default:
        }
        if (callbackUrlType === "pkce") {
          this._debug("#_initialize()", "begin", "is PKCE flow", true);
          if (!params.code)
            throw new AuthPKCEGrantCodeExchangeError("No code detected.");
          const { data: data2, error: error2 } = await this._exchangeCodeForSession(params.code);
          if (error2)
            throw error2;
          const url = new URL(window.location.href);
          url.searchParams.delete("code");
          window.history.replaceState(window.history.state, "", url.toString());
          return {
            data: { session: data2.session, redirectType: (_a = data2.redirectType) !== null && _a !== void 0 ? _a : null },
            error: null
          };
        }
        const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type } = params;
        if (!access_token || !expires_in || !refresh_token || !token_type) {
          throw new AuthImplicitGrantRedirectError("No session defined in URL");
        }
        const timeNow = Math.round(Date.now() / 1e3);
        const expiresIn = parseInt(expires_in);
        let expiresAt2 = timeNow + expiresIn;
        if (expires_at) {
          expiresAt2 = parseInt(expires_at);
        }
        const actuallyExpiresIn = expiresAt2 - timeNow;
        if (actuallyExpiresIn * 1e3 <= AUTO_REFRESH_TICK_DURATION_MS) {
          console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
        }
        const issuedAt = expiresAt2 - expiresIn;
        if (timeNow - issuedAt >= 120) {
          console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", issuedAt, expiresAt2, timeNow);
        } else if (timeNow - issuedAt < 0) {
          console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", issuedAt, expiresAt2, timeNow);
        }
        const { data, error } = await this._getUser(access_token);
        if (error)
          throw error;
        const session = {
          provider_token,
          provider_refresh_token,
          access_token,
          expires_in: expiresIn,
          expires_at: expiresAt2,
          refresh_token,
          token_type,
          user: data.user
        };
        window.location.hash = "";
        this._debug("#_getSessionFromURL()", "clearing window.location.hash");
        return this._returnResult({ data: { session, redirectType: params.type }, error: null });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { session: null, redirectType: null }, error });
        }
        throw error;
      }
    }
    _isImplicitGrantCallback(params) {
      if (typeof this.detectSessionInUrl === "function") {
        return this.detectSessionInUrl(new URL(window.location.href), params);
      }
      return Boolean(params.access_token || params.error || params.error_description || params.error_code);
    }
    async _isPKCECallback(params) {
      const currentStorageContent = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      return !!(params.code && currentStorageContent);
    }
    async signOut(options = { scope: "global" }) {
      await this.initializePromise;
      if (this.lock != null) {
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
          return await this._signOut(options);
        });
      }
      return await this._signOut(options);
    }
    async _signOut({ scope } = { scope: "global" }) {
      return await this._useSession(async (result) => {
        var _a;
        const { data, error: sessionError } = result;
        if (sessionError && !isAuthSessionMissingError(sessionError)) {
          return this._returnResult({ error: sessionError });
        }
        const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
        if (accessToken) {
          const { error } = await this.admin.signOut(accessToken, scope);
          if (error) {
            if (!(isAuthApiError(error) && (error.status === 404 || error.status === 401 || error.status === 403) || isAuthSessionMissingError(error))) {
              return this._returnResult({ error });
            }
          }
        }
        if (scope !== "others") {
          await this._removeSession();
          await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        }
        return this._returnResult({ error: null });
      });
    }
    onAuthStateChange(callback) {
      const id = generateCallbackId();
      const subscription = {
        id,
        callback,
        unsubscribe: () => {
          this._debug("#unsubscribe()", "state change callback with id removed", id);
          this.stateChangeEmitters.delete(id);
        }
      };
      this._debug("#onAuthStateChange()", "registered callback with id", id);
      this.stateChangeEmitters.set(id, subscription);
      (async () => {
        await this.initializePromise;
        if (this.lock != null) {
          await this._acquireLock(this.lockAcquireTimeout, async () => {
            this._emitInitialSession(id);
          });
        } else {
          await this._emitInitialSession(id);
        }
      })();
      return { data: { subscription } };
    }
    async _emitInitialSession(id) {
      return await this._useSession(async (result) => {
        var _a, _b;
        try {
          const { data: { session }, error } = result;
          if (error)
            throw error;
          await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback("INITIAL_SESSION", session));
          this._debug("INITIAL_SESSION", "callback id", id, "session", session);
        } catch (err) {
          await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback("INITIAL_SESSION", null));
          this._debug("INITIAL_SESSION", "callback id", id, "error", err);
          if (isAuthSessionMissingError(err)) {
            console.warn(err);
          } else {
            console.error(err);
          }
        }
      });
    }
    async resetPasswordForEmail(email, options = {}) {
      let codeChallenge = null;
      let codeChallengeMethod = null;
      if (this.flowType === "pkce") {
        ;
        [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(
          this.storage,
          this.storageKey,
          true
        );
      }
      try {
        return await _request(this.fetch, "POST", `${this.url}/recover`, {
          body: {
            email,
            code_challenge: codeChallenge,
            code_challenge_method: codeChallengeMethod,
            gotrue_meta_security: { captcha_token: options.captchaToken }
          },
          headers: this.headers,
          redirectTo: options.redirectTo
        });
      } catch (error) {
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async getUserIdentities() {
      var _a;
      try {
        const { data, error } = await this.getUser();
        if (error)
          throw error;
        return this._returnResult({ data: { identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : [] }, error: null });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async linkIdentity(credentials) {
      if ("token" in credentials) {
        return this.linkIdentityIdToken(credentials);
      }
      return this.linkIdentityOAuth(credentials);
    }
    async linkIdentityOAuth(credentials) {
      var _a;
      try {
        const { data, error } = await this._useSession(async (result) => {
          var _a2, _b, _c, _d, _f;
          const { data: data2, error: error2 } = result;
          if (error2)
            throw error2;
          const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
            redirectTo: (_a2 = credentials.options) === null || _a2 === void 0 ? void 0 : _a2.redirectTo,
            scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
            queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
            skipBrowserRedirect: true
          });
          return await _request(this.fetch, "GET", url, {
            headers: this.headers,
            jwt: (_f = (_d = data2.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _f !== void 0 ? _f : void 0
          });
        });
        if (error)
          throw error;
        if (isBrowser() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) {
          window.location.assign(data === null || data === void 0 ? void 0 : data.url);
        }
        return this._returnResult({
          data: { provider: credentials.provider, url: data === null || data === void 0 ? void 0 : data.url },
          error: null
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: { provider: credentials.provider, url: null }, error });
        }
        throw error;
      }
    }
    async linkIdentityIdToken(credentials) {
      return await this._useSession(async (result) => {
        var _a;
        try {
          const { error: sessionError, data: { session } } = result;
          if (sessionError)
            throw sessionError;
          const { options, provider, token, access_token, nonce } = credentials;
          const res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
            headers: this.headers,
            jwt: (_a = session === null || session === void 0 ? void 0 : session.access_token) !== null && _a !== void 0 ? _a : void 0,
            body: {
              provider,
              id_token: token,
              access_token,
              nonce,
              link_identity: true,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponse
          });
          const { data, error } = res;
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error });
          } else if (!data || !data.session || !data.user) {
            return this._returnResult({
              data: { user: null, session: null },
              error: new AuthInvalidTokenResponseError()
            });
          }
          if (data.session) {
            await this._saveSession(data.session);
            await this._notifyAllSubscribers("USER_UPDATED", data.session);
          }
          return this._returnResult({ data, error });
        } catch (error) {
          await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          if (isAuthError(error)) {
            return this._returnResult({ data: { user: null, session: null }, error });
          }
          throw error;
        }
      });
    }
    async unlinkIdentity(identity) {
      try {
        return await this._useSession(async (result) => {
          var _a, _b;
          const { data, error } = result;
          if (error) {
            throw error;
          }
          return await _request(this.fetch, "DELETE", `${this.url}/user/identities/${identity.identity_id}`, {
            headers: this.headers,
            jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : void 0
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _refreshAccessToken(refreshToken) {
      const debugName = `#_refreshAccessToken()`;
      this._debug(debugName, "begin");
      try {
        const startedAt = Date.now();
        return await retryable(async (attempt) => {
          if (attempt > 0) {
            await sleep2(200 * Math.pow(2, attempt - 1));
          }
          this._debug(debugName, "refreshing attempt", attempt);
          return await _request(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
            body: { refresh_token: refreshToken },
            headers: this.headers,
            xform: _sessionResponse
          });
        }, (attempt, error) => {
          const nextBackOffInterval = 200 * Math.pow(2, attempt);
          return error && isAuthRetryableFetchError(error) && Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION_MS;
        });
      } catch (error) {
        this._debug(debugName, "error", error);
        if (isAuthError(error)) {
          return this._returnResult({ data: { session: null, user: null }, error });
        }
        throw error;
      } finally {
        this._debug(debugName, "end");
      }
    }
    _isValidSession(maybeSession) {
      const isValidSession = typeof maybeSession === "object" && maybeSession !== null && "access_token" in maybeSession && "refresh_token" in maybeSession && "expires_at" in maybeSession;
      return isValidSession;
    }
    async _handleProviderSignIn(provider, options) {
      const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
        redirectTo: options.redirectTo,
        scopes: options.scopes,
        queryParams: options.queryParams
      });
      this._debug("#_handleProviderSignIn()", "provider", provider, "options", options, "url", url);
      if (isBrowser() && !options.skipBrowserRedirect) {
        window.location.assign(url);
      }
      return { data: { provider, url }, error: null };
    }
    async _recoverAndRefresh() {
      var _a, _b;
      const debugName = "#_recoverAndRefresh()";
      this._debug(debugName, "begin");
      try {
        const currentSession = await getItemAsync(this.storage, this.storageKey);
        if (currentSession && this.userStorage) {
          let maybeUser = await getItemAsync(this.userStorage, this.storageKey + "-user");
          if (!this.storage.isServer && Object.is(this.storage, this.userStorage) && !maybeUser) {
            maybeUser = { user: currentSession.user };
            await setItemAsync(this.userStorage, this.storageKey + "-user", maybeUser);
          }
          currentSession.user = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) !== null && _a !== void 0 ? _a : userNotAvailableProxy();
        } else if (currentSession && !currentSession.user) {
          if (!currentSession.user) {
            const separateUser = await getItemAsync(this.storage, this.storageKey + "-user");
            if (separateUser && (separateUser === null || separateUser === void 0 ? void 0 : separateUser.user)) {
              currentSession.user = separateUser.user;
              await removeItemAsync(this.storage, this.storageKey + "-user");
              await setItemAsync(this.storage, this.storageKey, currentSession);
            } else {
              currentSession.user = userNotAvailableProxy();
            }
          }
        }
        this._debug(debugName, "session from storage", currentSession);
        if (!this._isValidSession(currentSession)) {
          this._debug(debugName, "session is not valid");
          if (currentSession !== null) {
            await this._removeSession();
          }
          return;
        }
        const expiresWithMargin = ((_b = currentSession.expires_at) !== null && _b !== void 0 ? _b : Infinity) * 1e3 - Date.now() < EXPIRY_MARGIN_MS;
        this._debug(debugName, `session has${expiresWithMargin ? "" : " not"} expired with margin of ${EXPIRY_MARGIN_MS}s`);
        if (expiresWithMargin) {
          if (this.autoRefreshToken && currentSession.refresh_token) {
            const { error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) {
              if (isAuthRefreshDiscardedError(error)) {
                this._debug(debugName, "refresh discarded by commit guard", error);
              } else {
                this._debug(debugName, "refresh failed", error);
              }
            }
          }
        } else if (currentSession.user && currentSession.user.__isUserNotAvailableProxy === true) {
          try {
            const { data, error: userError } = await this._getUser(currentSession.access_token);
            if (!userError && (data === null || data === void 0 ? void 0 : data.user)) {
              currentSession.user = data.user;
              await this._saveSession(currentSession);
              await this._notifyAllSubscribers("SIGNED_IN", currentSession);
            } else {
              this._debug(debugName, "could not get user data, skipping SIGNED_IN notification");
            }
          } catch (getUserError) {
            console.error("Error getting user data:", getUserError);
            this._debug(debugName, "error getting user data, skipping SIGNED_IN notification", getUserError);
          }
        } else {
          await this._notifyAllSubscribers("SIGNED_IN", currentSession);
        }
      } catch (err) {
        this._debug(debugName, "error", err);
        console.error(err);
        return;
      } finally {
        this._debug(debugName, "end");
      }
    }
    async _callRefreshToken(refreshToken) {
      var _a, _b;
      if (!refreshToken) {
        throw new AuthSessionMissingError();
      }
      if (this.refreshingDeferred) {
        return this.refreshingDeferred.promise;
      }
      if (this.lastRefreshFailure && this.lastRefreshFailure.refreshToken === refreshToken && Date.now() < this.lastRefreshFailure.expiresAt) {
        this._debug("#_callRefreshToken()", "returning cached failure (cooldown active)");
        return this.lastRefreshFailure.result;
      }
      const debugName = `#_callRefreshToken()`;
      this._debug(debugName, "begin");
      try {
        this.refreshingDeferred = new Deferred();
        const storedAtStart = await getItemAsync(this.storage, this.storageKey);
        const { data, error } = await this._refreshAccessToken(refreshToken);
        if (error)
          throw error;
        if (!data.session)
          throw new AuthSessionMissingError();
        const storedAfter = await getItemAsync(this.storage, this.storageKey);
        const storageChangedUnderUs = storedAtStart !== null && (storedAfter === null || storedAfter.refresh_token !== storedAtStart.refresh_token);
        if (storageChangedUnderUs) {
          this._debug(debugName, "commit guard: storage changed since refresh started, discarding rotated tokens", {
            startedWith: "present",
            nowHolds: storedAfter ? "replaced" : "cleared"
          });
          const discarded = {
            data: null,
            error: new AuthRefreshDiscardedError()
          };
          this.refreshingDeferred.resolve(discarded);
          return discarded;
        }
        const epochBeforeSave = this._sessionRemovalEpoch;
        await this._saveSession(data.session);
        if (this._sessionRemovalEpoch !== epochBeforeSave) {
          this._debug(debugName, "commit guard (post-save): _removeSession ran during _saveSession, undoing write");
          await removeItemAsync(this.storage, this.storageKey);
          if (this.userStorage) {
            await removeItemAsync(this.userStorage, this.storageKey + "-user");
          }
          const discarded = {
            data: null,
            error: new AuthRefreshDiscardedError()
          };
          this.refreshingDeferred.resolve(discarded);
          return discarded;
        }
        await this._notifyAllSubscribers("TOKEN_REFRESHED", data.session);
        const result = { data: data.session, error: null };
        this.lastRefreshFailure = null;
        this.refreshingDeferred.resolve(result);
        return result;
      } catch (error) {
        this._debug(debugName, "error", error);
        if (isAuthError(error)) {
          const result = { data: null, error };
          if (!isAuthRetryableFetchError(error)) {
            const storedNow = await getItemAsync(this.storage, this.storageKey);
            const accessTokenStillValid = !!((storedNow === null || storedNow === void 0 ? void 0 : storedNow.expires_at) && storedNow.expires_at * 1e3 > Date.now());
            if (accessTokenStillValid) {
              this._debug(debugName, "proactive refresh failed, access token still valid \u2014 preserving session");
            } else {
              await this._removeSession();
            }
          }
          this.lastRefreshFailure = {
            refreshToken,
            result,
            expiresAt: Date.now() + REFRESH_FAILURE_COOLDOWN_MS
          };
          (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
          return result;
        }
        (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
        throw error;
      } finally {
        this.refreshingDeferred = null;
        this._debug(debugName, "end");
      }
    }
    async _notifyAllSubscribers(event, session, broadcast = true) {
      const debugName = `#_notifyAllSubscribers(${event})`;
      this._debug(debugName, "begin", session, `broadcast = ${broadcast}`);
      try {
        if (this.broadcastChannel && broadcast) {
          this.broadcastChannel.postMessage({ event, session });
        }
        const errors = [];
        const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
          try {
            await x.callback(event, session);
          } catch (e) {
            errors.push(e);
          }
        });
        await Promise.all(promises);
        if (errors.length > 0) {
          for (let i = 0; i < errors.length; i += 1) {
            console.error(errors[i]);
          }
          throw errors[0];
        }
      } finally {
        this._debug(debugName, "end");
      }
    }
    async _saveSession(session) {
      this._debug("#_saveSession()", session);
      this.suppressGetSessionWarning = true;
      await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      const sessionToProcess = Object.assign({}, session);
      const userIsProxy = sessionToProcess.user && sessionToProcess.user.__isUserNotAvailableProxy === true;
      if (this.userStorage) {
        if (!userIsProxy && sessionToProcess.user) {
          await setItemAsync(this.userStorage, this.storageKey + "-user", {
            user: sessionToProcess.user
          });
        } else if (userIsProxy) {
        }
        const mainSessionData = Object.assign({}, sessionToProcess);
        delete mainSessionData.user;
        const clonedMainSessionData = deepClone(mainSessionData);
        await setItemAsync(this.storage, this.storageKey, clonedMainSessionData);
      } else {
        const clonedSession = deepClone(sessionToProcess);
        await setItemAsync(this.storage, this.storageKey, clonedSession);
      }
    }
    async _removeSession() {
      this._sessionRemovalEpoch += 1;
      this._debug("#_removeSession()");
      this.lastRefreshFailure = null;
      this.suppressGetSessionWarning = false;
      await removeItemAsync(this.storage, this.storageKey);
      await removeItemAsync(this.storage, this.storageKey + "-code-verifier");
      await removeItemAsync(this.storage, this.storageKey + "-user");
      if (this.userStorage) {
        await removeItemAsync(this.userStorage, this.storageKey + "-user");
      }
      await this._notifyAllSubscribers("SIGNED_OUT", null);
    }
    _removeVisibilityChangedCallback() {
      this._debug("#_removeVisibilityChangedCallback()");
      const callback = this.visibilityChangedCallback;
      this.visibilityChangedCallback = null;
      try {
        if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
          window.removeEventListener("visibilitychange", callback);
        }
      } catch (e) {
        console.error("removing visibilitychange callback failed", e);
      }
    }
    async _startAutoRefresh() {
      await this._stopAutoRefresh();
      this._debug("#_startAutoRefresh()");
      const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION_MS);
      this.autoRefreshTicker = ticker;
      if (ticker && typeof ticker === "object" && typeof ticker.unref === "function") {
        ticker.unref();
      } else if (typeof Deno !== "undefined" && typeof Deno.unrefTimer === "function") {
        Deno.unrefTimer(ticker);
      }
      const timeout = setTimeout(async () => {
        await this.initializePromise;
        await this._autoRefreshTokenTick();
      }, 0);
      this.autoRefreshTickTimeout = timeout;
      if (timeout && typeof timeout === "object" && typeof timeout.unref === "function") {
        timeout.unref();
      } else if (typeof Deno !== "undefined" && typeof Deno.unrefTimer === "function") {
        Deno.unrefTimer(timeout);
      }
    }
    async _stopAutoRefresh() {
      this._debug("#_stopAutoRefresh()");
      const ticker = this.autoRefreshTicker;
      this.autoRefreshTicker = null;
      if (ticker) {
        clearInterval(ticker);
      }
      const timeout = this.autoRefreshTickTimeout;
      this.autoRefreshTickTimeout = null;
      if (timeout) {
        clearTimeout(timeout);
      }
    }
    async startAutoRefresh() {
      this._removeVisibilityChangedCallback();
      await this._startAutoRefresh();
    }
    async stopAutoRefresh() {
      this._removeVisibilityChangedCallback();
      await this._stopAutoRefresh();
    }
    async dispose() {
      var _a;
      this._removeVisibilityChangedCallback();
      await this._stopAutoRefresh();
      (_a = this.broadcastChannel) === null || _a === void 0 ? void 0 : _a.close();
      this.broadcastChannel = null;
      this.stateChangeEmitters.clear();
    }
    async _autoRefreshTokenTick() {
      this._debug("#_autoRefreshTokenTick()", "begin");
      if (this.lock != null) {
        try {
          await this._acquireLock(0, async () => {
            try {
              const now = Date.now();
              try {
                return await this._useSession(async (result) => {
                  const { data: { session } } = result;
                  if (!session || !session.refresh_token || !session.expires_at) {
                    this._debug("#_autoRefreshTokenTick()", "no session");
                    return;
                  }
                  const expiresInTicks = Math.floor((session.expires_at * 1e3 - now) / AUTO_REFRESH_TICK_DURATION_MS);
                  this._debug("#_autoRefreshTokenTick()", `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
                  if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
                    await this._callRefreshToken(session.refresh_token);
                  }
                });
              } catch (e) {
                console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
              }
            } finally {
              this._debug("#_autoRefreshTokenTick()", "end");
            }
          });
        } catch (e) {
          if (e instanceof LockAcquireTimeoutError) {
            this._debug("auto refresh token tick lock not available");
          } else {
            throw e;
          }
        }
        return;
      }
      if (this.refreshingDeferred !== null) {
        this._debug("#_autoRefreshTokenTick()", "refresh already in flight, skipping");
        return;
      }
      try {
        const now = Date.now();
        try {
          await this._useSession(async (result) => {
            const { data: { session } } = result;
            if (!session || !session.refresh_token || !session.expires_at) {
              this._debug("#_autoRefreshTokenTick()", "no session");
              return;
            }
            const expiresInTicks = Math.floor((session.expires_at * 1e3 - now) / AUTO_REFRESH_TICK_DURATION_MS);
            this._debug("#_autoRefreshTokenTick()", `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
            if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
              await this._callRefreshToken(session.refresh_token);
            }
          });
        } catch (e) {
          console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
        }
      } finally {
        this._debug("#_autoRefreshTokenTick()", "end");
      }
    }
    async _handleVisibilityChange() {
      this._debug("#_handleVisibilityChange()");
      if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
        if (this.autoRefreshToken) {
          this.startAutoRefresh();
        }
        return false;
      }
      try {
        this.visibilityChangedCallback = async () => {
          try {
            await this._onVisibilityChanged(false);
          } catch (error) {
            this._debug("#visibilityChangedCallback", "error", error);
          }
        };
        window === null || window === void 0 ? void 0 : window.addEventListener("visibilitychange", this.visibilityChangedCallback);
        await this._onVisibilityChanged(true);
      } catch (error) {
        console.error("_handleVisibilityChange", error);
      }
    }
    async _onVisibilityChanged(calledFromInitialize) {
      const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
      this._debug(methodName, "visibilityState", document.visibilityState);
      if (document.visibilityState === "visible") {
        if (this.autoRefreshToken) {
          this._startAutoRefresh();
        }
        if (!calledFromInitialize) {
          await this.initializePromise;
          if (this.lock != null) {
            await this._acquireLock(this.lockAcquireTimeout, async () => {
              if (document.visibilityState !== "visible") {
                this._debug(methodName, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
                return;
              }
              await this._recoverAndRefresh();
            });
          } else {
            if (document.visibilityState !== "visible") {
              this._debug(methodName, "visibilityState is no longer visible, skipping recovery");
              return;
            }
            await this._recoverAndRefresh();
          }
        }
      } else if (document.visibilityState === "hidden") {
        if (this.autoRefreshToken) {
          this._stopAutoRefresh();
        }
      }
    }
    async _getUrlForProvider(url, provider, options) {
      const urlParams = [`provider=${encodeURIComponent(provider)}`];
      if (options === null || options === void 0 ? void 0 : options.redirectTo) {
        urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
      }
      if (options === null || options === void 0 ? void 0 : options.scopes) {
        urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
      }
      if (this.flowType === "pkce") {
        const [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
        const flowParams = new URLSearchParams({
          code_challenge: `${encodeURIComponent(codeChallenge)}`,
          code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`
        });
        urlParams.push(flowParams.toString());
      }
      if (options === null || options === void 0 ? void 0 : options.queryParams) {
        const query = new URLSearchParams(options.queryParams);
        urlParams.push(query.toString());
      }
      if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
        urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
      }
      return `${url}?${urlParams.join("&")}`;
    }
    async _unenroll(params) {
      try {
        return await this._useSession(async (result) => {
          var _a;
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          return await _request(this.fetch, "DELETE", `${this.url}/factors/${params.factorId}`, {
            headers: this.headers,
            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _enroll(params) {
      try {
        return await this._useSession(async (result) => {
          var _a, _b;
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          const body = Object.assign({ friendly_name: params.friendlyName, factor_type: params.factorType }, params.factorType === "phone" ? { phone: params.phone } : params.factorType === "totp" ? { issuer: params.issuer } : {});
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors`, {
            body,
            headers: this.headers,
            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
          });
          if (error) {
            return this._returnResult({ data: null, error });
          }
          if (params.factorType === "totp" && data.type === "totp" && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
            data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
          }
          return this._returnResult({ data, error: null });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _verify(params) {
      const run = async () => {
        try {
          return await this._useSession(async (result) => {
            var _a;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            const body = Object.assign({ challenge_id: params.challengeId }, "webauthn" in params ? {
              webauthn: Object.assign(Object.assign({}, params.webauthn), { credential_response: params.webauthn.type === "create" ? serializeCredentialCreationResponse(params.webauthn.credential_response) : serializeCredentialRequestResponse(params.webauthn.credential_response) })
            } : { code: params.code });
            const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/verify`, {
              body,
              headers: this.headers,
              jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
            });
            if (error) {
              return this._returnResult({ data: null, error });
            }
            await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + data.expires_in }, data));
            await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", data);
            return this._returnResult({ data, error });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      };
      if (this.lock != null) {
        return this._acquireLock(this.lockAcquireTimeout, run);
      }
      return run();
    }
    async _challenge(params) {
      const run = async () => {
        try {
          return await this._useSession(async (result) => {
            var _a;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError });
            }
            const response = await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/challenge`, {
              body: params,
              headers: this.headers,
              jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
            });
            if (response.error) {
              return response;
            }
            const { data } = response;
            if (data.type !== "webauthn") {
              return { data, error: null };
            }
            switch (data.webauthn.type) {
              case "create":
                return {
                  data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: deserializeCredentialCreationOptions(data.webauthn.credential_options.publicKey) }) }) }),
                  error: null
                };
              case "request":
                return {
                  data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: deserializeCredentialRequestOptions(data.webauthn.credential_options.publicKey) }) }) }),
                  error: null
                };
            }
          });
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      };
      if (this.lock != null) {
        return this._acquireLock(this.lockAcquireTimeout, run);
      }
      return run();
    }
    async _challengeAndVerify(params) {
      const { data: challengeData, error: challengeError } = await this._challenge({
        factorId: params.factorId
      });
      if (challengeError) {
        return this._returnResult({ data: null, error: challengeError });
      }
      return await this._verify({
        factorId: params.factorId,
        challengeId: challengeData.id,
        code: params.code
      });
    }
    async _listFactors() {
      var _a;
      const { data: { user }, error: userError } = await this.getUser();
      if (userError) {
        return { data: null, error: userError };
      }
      const data = {
        all: [],
        phone: [],
        totp: [],
        webauthn: []
      };
      for (const factor of (_a = user === null || user === void 0 ? void 0 : user.factors) !== null && _a !== void 0 ? _a : []) {
        data.all.push(factor);
        if (factor.status === "verified") {
          ;
          data[factor.factor_type].push(factor);
        }
      }
      return {
        data,
        error: null
      };
    }
    async _getAuthenticatorAssuranceLevel(jwt) {
      var _a, _b, _c, _d;
      if (jwt) {
        try {
          const { payload: payload2 } = decodeJWT(jwt);
          let currentLevel2 = null;
          if (payload2.aal) {
            currentLevel2 = payload2.aal;
          }
          let nextLevel2 = currentLevel2;
          const { data: { user }, error: userError } = await this.getUser(jwt);
          if (userError) {
            return this._returnResult({ data: null, error: userError });
          }
          const verifiedFactors2 = (_b = (_a = user === null || user === void 0 ? void 0 : user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === "verified")) !== null && _b !== void 0 ? _b : [];
          if (verifiedFactors2.length > 0) {
            nextLevel2 = "aal2";
          }
          const currentAuthenticationMethods2 = payload2.amr || [];
          return { data: { currentLevel: currentLevel2, nextLevel: nextLevel2, currentAuthenticationMethods: currentAuthenticationMethods2 }, error: null };
        } catch (error) {
          if (isAuthError(error)) {
            return this._returnResult({ data: null, error });
          }
          throw error;
        }
      }
      const { data: { session }, error: sessionError } = await this.getSession();
      if (sessionError) {
        return this._returnResult({ data: null, error: sessionError });
      }
      if (!session) {
        return {
          data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
          error: null
        };
      }
      const { payload } = decodeJWT(session.access_token);
      let currentLevel = null;
      if (payload.aal) {
        currentLevel = payload.aal;
      }
      let nextLevel = currentLevel;
      const verifiedFactors = (_d = (_c = session.user.factors) === null || _c === void 0 ? void 0 : _c.filter((factor) => factor.status === "verified")) !== null && _d !== void 0 ? _d : [];
      if (verifiedFactors.length > 0) {
        nextLevel = "aal2";
      }
      const currentAuthenticationMethods = payload.amr || [];
      return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
    }
    async _getAuthorizationDetails(authorizationId) {
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          return await _request(this.fetch, "GET", `${this.url}/oauth/authorizations/${authorizationId}`, {
            headers: this.headers,
            jwt: session.access_token,
            xform: (data) => ({ data, error: null })
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _approveAuthorization(authorizationId, options) {
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          const response = await _request(this.fetch, "POST", `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
            headers: this.headers,
            jwt: session.access_token,
            body: { action: "approve" },
            xform: (data) => ({ data, error: null })
          });
          if (response.data && response.data.redirect_url) {
            if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
              window.location.assign(response.data.redirect_url);
            }
          }
          return response;
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _denyAuthorization(authorizationId, options) {
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          const response = await _request(this.fetch, "POST", `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
            headers: this.headers,
            jwt: session.access_token,
            body: { action: "deny" },
            xform: (data) => ({ data, error: null })
          });
          if (response.data && response.data.redirect_url) {
            if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
              window.location.assign(response.data.redirect_url);
            }
          }
          return response;
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _listOAuthGrants() {
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          return await _request(this.fetch, "GET", `${this.url}/user/oauth/grants`, {
            headers: this.headers,
            jwt: session.access_token,
            xform: (data) => ({ data, error: null })
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _revokeOAuthGrant(options) {
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          await _request(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, {
            headers: this.headers,
            jwt: session.access_token,
            query: { client_id: options.clientId },
            noResolveJson: true
          });
          return { data: {}, error: null };
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async fetchJwk(kid, jwks = { keys: [] }) {
      let jwk = jwks.keys.find((key) => key.kid === kid);
      if (jwk) {
        return jwk;
      }
      const now = Date.now();
      jwk = this.jwks.keys.find((key) => key.kid === kid);
      if (jwk && this.jwks_cached_at + JWKS_TTL > now) {
        return jwk;
      }
      const { data, error } = await _request(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, {
        headers: this.headers
      });
      if (error) {
        throw error;
      }
      if (!data.keys || data.keys.length === 0) {
        return null;
      }
      this.jwks = data;
      this.jwks_cached_at = now;
      jwk = data.keys.find((key) => key.kid === kid);
      if (!jwk) {
        return null;
      }
      return jwk;
    }
    async getClaims(jwt, options = {}) {
      try {
        let token = jwt;
        if (!token) {
          const { data, error } = await this.getSession();
          if (error || !data.session) {
            return this._returnResult({ data: null, error });
          }
          token = data.session.access_token;
        }
        const { header, payload, signature, raw: { header: rawHeader, payload: rawPayload } } = decodeJWT(token);
        if (!(options === null || options === void 0 ? void 0 : options.allowExpired)) {
          try {
            validateExp(payload.exp);
          } catch (e) {
            throw new AuthInvalidJwtError(e instanceof Error ? e.message : "JWT validation failed");
          }
        }
        const signingKey = !header.alg || header.alg.startsWith("HS") || !header.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(header.kid, (options === null || options === void 0 ? void 0 : options.keys) ? { keys: options.keys } : options === null || options === void 0 ? void 0 : options.jwks);
        if (!signingKey) {
          const { error } = await this.getUser(token);
          if (error) {
            throw error;
          }
          return {
            data: {
              claims: payload,
              header,
              signature
            },
            error: null
          };
        }
        const algorithm = getAlgorithm(header.alg);
        const publicKey = await crypto.subtle.importKey("jwk", signingKey, algorithm, true, [
          "verify"
        ]);
        const isValid = await crypto.subtle.verify(algorithm, publicKey, signature, stringToUint8Array(`${rawHeader}.${rawPayload}`));
        if (!isValid) {
          throw new AuthInvalidJwtError("Invalid JWT signature");
        }
        return {
          data: {
            claims: payload,
            header,
            signature
          },
          error: null
        };
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async signInWithPasskey(credentials) {
      var _a, _b, _c;
      assertPasskeyExperimentalEnabled(this.experimental);
      try {
        if (!browserSupportsWebAuthn()) {
          return this._returnResult({
            data: null,
            error: new AuthUnknownError("Browser does not support WebAuthn", null)
          });
        }
        const { data: options, error: optionsError } = await this._startPasskeyAuthentication({
          options: { captchaToken: (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.captchaToken }
        });
        if (optionsError || !options) {
          return this._returnResult({ data: null, error: optionsError });
        }
        const publicKeyOptions = deserializeCredentialRequestOptions(options.options);
        const signal = (_c = (_b = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _b === void 0 ? void 0 : _b.signal) !== null && _c !== void 0 ? _c : webAuthnAbortService.createNewAbortSignal();
        const { data: credential, error: credentialError } = await getCredential({
          publicKey: publicKeyOptions,
          signal
        });
        if (credentialError || !credential) {
          return this._returnResult({
            data: null,
            error: credentialError !== null && credentialError !== void 0 ? credentialError : new AuthUnknownError("WebAuthn ceremony failed", null)
          });
        }
        const serialized = serializeCredentialRequestResponse(credential);
        return this._verifyPasskeyAuthentication({
          challengeId: options.challenge_id,
          credential: serialized
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async registerPasskey(credentials) {
      var _a, _b;
      assertPasskeyExperimentalEnabled(this.experimental);
      try {
        if (!browserSupportsWebAuthn()) {
          return this._returnResult({
            data: null,
            error: new AuthUnknownError("Browser does not support WebAuthn", null)
          });
        }
        const { data: options, error: optionsError } = await this._startPasskeyRegistration();
        if (optionsError || !options) {
          return this._returnResult({ data: null, error: optionsError });
        }
        const publicKeyOptions = deserializeCredentialCreationOptions(options.options);
        const signal = (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.signal) !== null && _b !== void 0 ? _b : webAuthnAbortService.createNewAbortSignal();
        const { data: credential, error: credentialError } = await createCredential({
          publicKey: publicKeyOptions,
          signal
        });
        if (credentialError || !credential) {
          return this._returnResult({
            data: null,
            error: credentialError !== null && credentialError !== void 0 ? credentialError : new AuthUnknownError("WebAuthn ceremony failed", null)
          });
        }
        const serialized = serializeCredentialCreationResponse(credential);
        return this._verifyPasskeyRegistration({
          challengeId: options.challenge_id,
          credential: serialized
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _startPasskeyRegistration() {
      assertPasskeyExperimentalEnabled(this.experimental);
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/passkeys/registration/options`, {
            headers: this.headers,
            jwt: session.access_token,
            body: {}
          });
          if (error) {
            return this._returnResult({ data: null, error });
          }
          return this._returnResult({ data, error: null });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _verifyPasskeyRegistration(params) {
      assertPasskeyExperimentalEnabled(this.experimental);
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/passkeys/registration/verify`, {
            headers: this.headers,
            jwt: session.access_token,
            body: {
              challenge_id: params.challengeId,
              credential: params.credential
            }
          });
          if (error) {
            return this._returnResult({ data: null, error });
          }
          return this._returnResult({ data, error: null });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _startPasskeyAuthentication(params) {
      var _a;
      assertPasskeyExperimentalEnabled(this.experimental);
      try {
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/passkeys/authentication/options`, {
          headers: this.headers,
          body: {
            gotrue_meta_security: { captcha_token: (_a = params === null || params === void 0 ? void 0 : params.options) === null || _a === void 0 ? void 0 : _a.captchaToken }
          }
        });
        if (error) {
          return this._returnResult({ data: null, error });
        }
        return this._returnResult({ data, error: null });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _verifyPasskeyAuthentication(params) {
      assertPasskeyExperimentalEnabled(this.experimental);
      try {
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/passkeys/authentication/verify`, {
          headers: this.headers,
          body: {
            challenge_id: params.challengeId,
            credential: params.credential
          },
          xform: _sessionResponse
        });
        if (error) {
          return this._returnResult({ data: null, error });
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return this._returnResult({ data, error: null });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _listPasskeys() {
      assertPasskeyExperimentalEnabled(this.experimental);
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          const { data, error } = await _request(this.fetch, "GET", `${this.url}/passkeys`, {
            headers: this.headers,
            jwt: session.access_token,
            xform: (data2) => ({ data: data2, error: null })
          });
          if (error) {
            return this._returnResult({ data: null, error });
          }
          return this._returnResult({ data, error: null });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _updatePasskey(params) {
      assertPasskeyExperimentalEnabled(this.experimental);
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          const { data, error } = await _request(this.fetch, "PATCH", `${this.url}/passkeys/${params.passkeyId}`, {
            headers: this.headers,
            jwt: session.access_token,
            body: { friendly_name: params.friendlyName }
          });
          if (error) {
            return this._returnResult({ data: null, error });
          }
          return this._returnResult({ data, error: null });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
    async _deletePasskey(params) {
      assertPasskeyExperimentalEnabled(this.experimental);
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
          }
          if (!session) {
            return this._returnResult({ data: null, error: new AuthSessionMissingError() });
          }
          const { error } = await _request(this.fetch, "DELETE", `${this.url}/passkeys/${params.passkeyId}`, {
            headers: this.headers,
            jwt: session.access_token,
            noResolveJson: true
          });
          if (error) {
            return this._returnResult({ data: null, error });
          }
          return this._returnResult({ data: null, error: null });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return this._returnResult({ data: null, error });
        }
        throw error;
      }
    }
  };
  GoTrueClient.nextInstanceID = {};
  var GoTrueClient_default = GoTrueClient;

  // node_modules/@supabase/auth-js/dist/module/AuthClient.js
  var AuthClient = GoTrueClient_default;
  var AuthClient_default = AuthClient;

  // node_modules/@supabase/supabase-js/dist/index.mjs
  var version4 = "2.108.2";
  var JS_ENV = "";
  var JS_RUNTIME_VERSION;
  if (typeof Deno !== "undefined") {
    JS_ENV = "deno";
    JS_RUNTIME_VERSION = (_Deno$version = Deno.version) === null || _Deno$version === void 0 ? void 0 : _Deno$version.deno;
  } else if (typeof document !== "undefined")
    JS_ENV = "web";
  else if (typeof navigator !== "undefined" && navigator.product === "ReactNative")
    JS_ENV = "react-native";
  else {
    JS_ENV = "node";
    JS_RUNTIME_VERSION = typeof process !== "undefined" ? (_process$version = process.version) === null || _process$version === void 0 ? void 0 : _process$version.replace(/^v/, "") : void 0;
  }
  var _Deno$version;
  var _process$version;
  var _runtimeMeta = [`runtime=${JS_ENV}`];
  if (JS_RUNTIME_VERSION)
    _runtimeMeta.push(`runtime-version=${JS_RUNTIME_VERSION}`);
  var DEFAULT_HEADERS3 = { "X-Client-Info": `supabase-js/${version4}; ${_runtimeMeta.join("; ")}` };
  var DEFAULT_GLOBAL_OPTIONS = { headers: DEFAULT_HEADERS3 };
  var DEFAULT_DB_OPTIONS = { schema: "public" };
  var DEFAULT_AUTH_OPTIONS = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "implicit"
  };
  var DEFAULT_REALTIME_OPTIONS = {};
  var DEFAULT_TRACE_PROPAGATION_OPTIONS = {
    enabled: false,
    respectSamplingDecision: true
  };
  function __awaiter2(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  var otelModulePromise = null;
  var OTEL_PKG = "@opentelemetry/api";
  function loadOtel() {
    if (otelModulePromise === null)
      otelModulePromise = import(
        /* webpackIgnore: true */
        OTEL_PKG
      ).catch(() => null);
    return otelModulePromise;
  }
  function extractTraceContext() {
    return __awaiter2(this, void 0, void 0, function* () {
      try {
        const otel = yield loadOtel();
        if (!otel || !otel.propagation || !otel.context)
          return null;
        const carrier = {};
        otel.propagation.inject(otel.context.active(), carrier);
        const traceparent = carrier["traceparent"];
        if (!traceparent)
          return null;
        return {
          traceparent,
          tracestate: carrier["tracestate"],
          baggage: carrier["baggage"]
        };
      } catch (_a) {
        return null;
      }
    });
  }
  function parseTraceParent(traceparent) {
    if (!traceparent || typeof traceparent !== "string")
      return null;
    const parts = traceparent.split("-");
    if (parts.length !== 4)
      return null;
    const [version$1, traceId, parentId, traceFlags] = parts;
    if (version$1.length !== 2 || traceId.length !== 32 || parentId.length !== 16 || traceFlags.length !== 2)
      return null;
    const hexRegex = /^[0-9a-f]+$/i;
    if (!hexRegex.test(version$1) || !hexRegex.test(traceId) || !hexRegex.test(parentId) || !hexRegex.test(traceFlags))
      return null;
    if (traceId === "00000000000000000000000000000000" || parentId === "0000000000000000")
      return null;
    return {
      version: version$1,
      traceId,
      parentId,
      traceFlags,
      isSampled: (parseInt(traceFlags, 16) & 1) === 1
    };
  }
  function shouldPropagateToTarget(targetUrl, targets) {
    if (!targetUrl || !targets || targets.length === 0)
      return false;
    let url;
    if (targetUrl instanceof URL)
      url = targetUrl;
    else
      try {
        url = new URL(targetUrl);
      } catch (error) {
        return false;
      }
    for (const target of targets)
      try {
        if (typeof target === "string") {
          if (matchStringTarget(url.hostname, target))
            return true;
        } else if (target instanceof RegExp) {
          if (target.test(url.hostname))
            return true;
        } else if (typeof target === "function") {
          if (target(url))
            return true;
        }
      } catch (error) {
        continue;
      }
    return false;
  }
  function matchStringTarget(hostname, target) {
    if (target === hostname)
      return true;
    if (target.startsWith("*.")) {
      const domain = target.slice(2);
      if (hostname.endsWith(domain)) {
        if (hostname === domain || hostname.endsWith("." + domain))
          return true;
      }
    }
    return false;
  }
  function getDefaultPropagationTargets(supabaseUrl) {
    const targets = [];
    try {
      const url = new URL(supabaseUrl);
      targets.push(url.hostname);
    } catch (error) {
    }
    targets.push("*.supabase.co", "*.supabase.in");
    targets.push("localhost", "127.0.0.1", "[::1]");
    return targets;
  }
  function _typeof3(o) {
    "@babel/helpers - typeof";
    return _typeof3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
      return typeof o$1;
    } : function(o$1) {
      return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, _typeof3(o);
  }
  function toPrimitive3(t, r) {
    if ("object" != _typeof3(t) || !t)
      return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != _typeof3(i))
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function toPropertyKey3(t) {
    var i = toPrimitive3(t, "string");
    return "symbol" == _typeof3(i) ? i : i + "";
  }
  function _defineProperty3(e, r, t) {
    return (r = toPropertyKey3(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t, e;
  }
  function ownKeys3(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r$1) {
        return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread23(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys3(Object(t), true).forEach(function(r$1) {
        _defineProperty3(e, r$1, t[r$1]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys3(Object(t)).forEach(function(r$1) {
        Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
      });
    }
    return e;
  }
  var resolveFetch4 = (customFetch) => {
    if (customFetch)
      return (...args) => customFetch(...args);
    return (...args) => fetch(...args);
  };
  var resolveHeadersConstructor = () => {
    return Headers;
  };
  var fetchWithAuth = (supabaseKey, supabaseUrl, getAccessToken, customFetch, tracePropagationOptions) => {
    const fetch$1 = resolveFetch4(customFetch);
    const HeadersConstructor = resolveHeadersConstructor();
    const traceEnabled = (tracePropagationOptions === null || tracePropagationOptions === void 0 ? void 0 : tracePropagationOptions.enabled) === true;
    const respectSampling = (tracePropagationOptions === null || tracePropagationOptions === void 0 ? void 0 : tracePropagationOptions.respectSamplingDecision) !== false;
    const traceTargets = traceEnabled ? getDefaultPropagationTargets(supabaseUrl) : null;
    return async (input, init) => {
      var _await$getAccessToken;
      const accessToken = (_await$getAccessToken = await getAccessToken()) !== null && _await$getAccessToken !== void 0 ? _await$getAccessToken : supabaseKey;
      let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
      if (!headers.has("apikey"))
        headers.set("apikey", supabaseKey);
      if (!headers.has("Authorization"))
        headers.set("Authorization", `Bearer ${accessToken}`);
      if (traceTargets) {
        const traceHeaders = await getTraceHeaders(input, traceTargets, respectSampling);
        if (traceHeaders) {
          if (traceHeaders.traceparent && !headers.has("traceparent"))
            headers.set("traceparent", traceHeaders.traceparent);
          if (traceHeaders.tracestate && !headers.has("tracestate"))
            headers.set("tracestate", traceHeaders.tracestate);
          if (traceHeaders.baggage && !headers.has("baggage"))
            headers.set("baggage", traceHeaders.baggage);
        }
      }
      return fetch$1(input, _objectSpread23(_objectSpread23({}, init), {}, { headers }));
    };
  };
  async function getTraceHeaders(input, targets, respectSampling) {
    if (!shouldPropagateToTarget(typeof input === "string" ? input : input instanceof URL ? input : input.url, targets))
      return null;
    const traceContext = await extractTraceContext();
    if (!traceContext || !traceContext.traceparent)
      return null;
    if (respectSampling) {
      const parsed = parseTraceParent(traceContext.traceparent);
      if (parsed && !parsed.isSampled)
        return null;
    }
    return traceContext;
  }
  function normalizeTracePropagation(value) {
    return typeof value === "boolean" ? { enabled: value } : value;
  }
  function ensureTrailingSlash(url) {
    return url.endsWith("/") ? url : url + "/";
  }
  function applySettingDefaults(options, defaults2) {
    var _DEFAULT_GLOBAL_OPTIO, _globalOptions$header, _ref, _tracePropagationOpti, _ref2, _tracePropagationOpti2;
    const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
    const { db: DEFAULT_DB_OPTIONS$1, auth: DEFAULT_AUTH_OPTIONS$1, realtime: DEFAULT_REALTIME_OPTIONS$1, global: DEFAULT_GLOBAL_OPTIONS$1 } = defaults2;
    const tracePropagationOptions = normalizeTracePropagation(options.tracePropagation);
    const DEFAULT_TRACE_PROPAGATION_OPTIONS$1 = normalizeTracePropagation(defaults2.tracePropagation);
    const result = {
      db: _objectSpread23(_objectSpread23({}, DEFAULT_DB_OPTIONS$1), dbOptions),
      auth: _objectSpread23(_objectSpread23({}, DEFAULT_AUTH_OPTIONS$1), authOptions),
      realtime: _objectSpread23(_objectSpread23({}, DEFAULT_REALTIME_OPTIONS$1), realtimeOptions),
      storage: {},
      global: _objectSpread23(_objectSpread23(_objectSpread23({}, DEFAULT_GLOBAL_OPTIONS$1), globalOptions), {}, { headers: _objectSpread23(_objectSpread23({}, (_DEFAULT_GLOBAL_OPTIO = DEFAULT_GLOBAL_OPTIONS$1 === null || DEFAULT_GLOBAL_OPTIONS$1 === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS$1.headers) !== null && _DEFAULT_GLOBAL_OPTIO !== void 0 ? _DEFAULT_GLOBAL_OPTIO : {}), (_globalOptions$header = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _globalOptions$header !== void 0 ? _globalOptions$header : {}) }),
      tracePropagation: {
        enabled: (_ref = (_tracePropagationOpti = tracePropagationOptions === null || tracePropagationOptions === void 0 ? void 0 : tracePropagationOptions.enabled) !== null && _tracePropagationOpti !== void 0 ? _tracePropagationOpti : DEFAULT_TRACE_PROPAGATION_OPTIONS$1 === null || DEFAULT_TRACE_PROPAGATION_OPTIONS$1 === void 0 ? void 0 : DEFAULT_TRACE_PROPAGATION_OPTIONS$1.enabled) !== null && _ref !== void 0 ? _ref : false,
        respectSamplingDecision: (_ref2 = (_tracePropagationOpti2 = tracePropagationOptions === null || tracePropagationOptions === void 0 ? void 0 : tracePropagationOptions.respectSamplingDecision) !== null && _tracePropagationOpti2 !== void 0 ? _tracePropagationOpti2 : DEFAULT_TRACE_PROPAGATION_OPTIONS$1 === null || DEFAULT_TRACE_PROPAGATION_OPTIONS$1 === void 0 ? void 0 : DEFAULT_TRACE_PROPAGATION_OPTIONS$1.respectSamplingDecision) !== null && _ref2 !== void 0 ? _ref2 : true
      },
      accessToken: async () => ""
    };
    if (options.accessToken)
      result.accessToken = options.accessToken;
    else
      delete result.accessToken;
    return result;
  }
  function validateSupabaseUrl(supabaseUrl) {
    const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim();
    if (!trimmedUrl)
      throw new Error("supabaseUrl is required.");
    if (!trimmedUrl.match(/^https?:\/\//i))
      throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
    try {
      return new URL(ensureTrailingSlash(trimmedUrl));
    } catch (_unused) {
      throw Error("Invalid supabaseUrl: Provided URL is malformed.");
    }
  }
  var SupabaseAuthClient = class extends AuthClient_default {
    constructor(options) {
      super(options);
    }
  };
  var SupabaseClient = class {
    constructor(supabaseUrl, supabaseKey, options) {
      var _settings$auth$storag, _settings$global$head;
      this.supabaseUrl = supabaseUrl;
      this.supabaseKey = supabaseKey;
      const baseUrl = validateSupabaseUrl(supabaseUrl);
      if (!supabaseKey)
        throw new Error("supabaseKey is required.");
      this.realtimeUrl = new URL("realtime/v1", baseUrl);
      this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws");
      this.authUrl = new URL("auth/v1", baseUrl);
      this.storageUrl = new URL("storage/v1", baseUrl);
      this.functionsUrl = new URL("functions/v1", baseUrl);
      const defaultStorageKey = `sb-${baseUrl.hostname.split(".")[0]}-auth-token`;
      const DEFAULTS = {
        db: DEFAULT_DB_OPTIONS,
        realtime: DEFAULT_REALTIME_OPTIONS,
        auth: _objectSpread23(_objectSpread23({}, DEFAULT_AUTH_OPTIONS), {}, { storageKey: defaultStorageKey }),
        global: DEFAULT_GLOBAL_OPTIONS,
        tracePropagation: DEFAULT_TRACE_PROPAGATION_OPTIONS
      };
      const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
      this.settings = settings;
      this.storageKey = (_settings$auth$storag = settings.auth.storageKey) !== null && _settings$auth$storag !== void 0 ? _settings$auth$storag : "";
      this.headers = (_settings$global$head = settings.global.headers) !== null && _settings$global$head !== void 0 ? _settings$global$head : {};
      if (!settings.accessToken) {
        var _settings$auth;
        this.auth = this._initSupabaseAuthClient((_settings$auth = settings.auth) !== null && _settings$auth !== void 0 ? _settings$auth : {}, this.headers, settings.global.fetch);
      } else {
        this.accessToken = settings.accessToken;
        this.auth = new Proxy({}, { get: (_, prop) => {
          throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
        } });
      }
      this.fetch = fetchWithAuth(supabaseKey, supabaseUrl, this._getAccessToken.bind(this), settings.global.fetch, settings.tracePropagation);
      this.realtime = this._initRealtimeClient(_objectSpread23({
        headers: this.headers,
        accessToken: this._getAccessToken.bind(this),
        fetch: this.fetch
      }, settings.realtime));
      if (this.accessToken)
        Promise.resolve(this.accessToken()).then((token) => this.realtime.setAuth(token)).catch((e) => console.warn("Failed to set initial Realtime auth token:", e));
      this.rest = new PostgrestClient(new URL("rest/v1", baseUrl).href, {
        headers: this.headers,
        schema: settings.db.schema,
        fetch: this.fetch,
        timeout: settings.db.timeout,
        urlLengthLimit: settings.db.urlLengthLimit
      });
      this.storage = new StorageClient(this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
      if (!settings.accessToken)
        this._listenForAuthEvents();
    }
    get functions() {
      return new FunctionsClient(this.functionsUrl.href, {
        headers: this.headers,
        customFetch: this.fetch
      });
    }
    from(relation) {
      return this.rest.from(relation);
    }
    schema(schema) {
      return this.rest.schema(schema);
    }
    rpc(fn, args = {}, options = {
      head: false,
      get: false,
      count: void 0
    }) {
      return this.rest.rpc(fn, args, options);
    }
    channel(name, opts = { config: {} }) {
      return this.realtime.channel(name, opts);
    }
    getChannels() {
      return this.realtime.getChannels();
    }
    removeChannel(channel) {
      return this.realtime.removeChannel(channel);
    }
    removeAllChannels() {
      return this.realtime.removeAllChannels();
    }
    async _getAccessToken() {
      var _this = this;
      var _data$session$access_, _data$session;
      if (_this.accessToken)
        return await _this.accessToken();
      const { data } = await _this.auth.getSession();
      return (_data$session$access_ = (_data$session = data.session) === null || _data$session === void 0 ? void 0 : _data$session.access_token) !== null && _data$session$access_ !== void 0 ? _data$session$access_ : _this.supabaseKey;
    }
    _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, userStorage, storageKey, flowType, lock, debug, throwOnError, experimental, lockAcquireTimeout, skipAutoInitialize }, headers, fetch$1) {
      const authHeaders = {
        Authorization: `Bearer ${this.supabaseKey}`,
        apikey: `${this.supabaseKey}`
      };
      return new SupabaseAuthClient({
        url: this.authUrl.href,
        headers: _objectSpread23(_objectSpread23({}, authHeaders), headers),
        storageKey,
        autoRefreshToken,
        persistSession,
        detectSessionInUrl,
        storage,
        userStorage,
        flowType,
        lock,
        debug,
        throwOnError,
        experimental,
        fetch: fetch$1,
        lockAcquireTimeout,
        skipAutoInitialize,
        hasCustomAuthorizationHeader: Object.keys(this.headers).some((key) => key.toLowerCase() === "authorization")
      });
    }
    _initRealtimeClient(options) {
      return new RealtimeClient(this.realtimeUrl.href, _objectSpread23(_objectSpread23({}, options), {}, { params: _objectSpread23(_objectSpread23({}, { apikey: this.supabaseKey }), options === null || options === void 0 ? void 0 : options.params) }));
    }
    _listenForAuthEvents() {
      return this.auth.onAuthStateChange((event, session) => {
        this._handleTokenChanged(event, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
      });
    }
    _handleTokenChanged(event, source, token) {
      if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && this.changedAccessToken !== token) {
        this.changedAccessToken = token;
        this.realtime.setAuth(token);
      } else if (event === "SIGNED_OUT") {
        this.realtime.setAuth();
        if (source == "STORAGE")
          this.auth.signOut();
        this.changedAccessToken = void 0;
      }
    }
  };
  var createClient = (supabaseUrl, supabaseKey, options) => {
    return new SupabaseClient(supabaseUrl, supabaseKey, options);
  };
  function shouldShowDeprecationWarning() {
    if (typeof window !== "undefined")
      return false;
    const _process = globalThis["process"];
    if (!_process)
      return false;
    const processVersion = _process["version"];
    if (processVersion === void 0 || processVersion === null)
      return false;
    const versionMatch = processVersion.match(/^v(\d+)\./);
    if (!versionMatch)
      return false;
    return parseInt(versionMatch[1], 10) <= 18;
  }
  if (shouldShowDeprecationWarning())
    console.warn("\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");

  // lib/supabase.ts
  var SUPABASE_URL = "https://prwdkaffzphfqlhlaiab.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByd2RrYWZmenBoZnFsaGxhaWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjA4MzYsImV4cCI6MjA5Nzg5NjgzNn0.K5tN3I2kGQFS_XZovCYN8qfd7aD-cROMMQQaI-CsmwU";
  var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  var GRADE_RANK = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  function calcLeaderboardScore(entry, flags) {
    const playoffBonus = {
      champion: 500,
      finals: 350,
      conf_finals: 175,
      second_round: 75,
      first_round: 25
    };
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
      teamBonus += 15;
    return entry.reg_win_pct * 500 + entry.playoff_win_pct * 400 + entry.avg_pt_diff * 8 + entry.team_rating * 3 + coachNum * 20 + bonus + challengeBonus + teamBonus;
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
  globalThis.EraBallEngine = {
    ...src_exports,
    checkAchievements,
    getAllAchievements,
    recordRunComplete,
    getLifetimeStats,
    clearLifetimeStats,
    calcLeaderboardScore
  };
})();
