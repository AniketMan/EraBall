import type { Player, Coach, CourtSlot, SlotPosition, Era, PlayerRating, PlayerSeasonStats, EraStats, PlayoffResult, PlayoffGame, SpecialPerformance } from './types'

const ERA_ORDER: Era[] = ['50s', '60s', '70s', '80s', '90s', '00s', '10s', '20s']

// ─── FLEX players ─────────────────────────────────────────────────────────────
// Lists the starter slots each player can occupy with zero fit penalty.
// Key = full_name as it appears in players_with_stats.json.
const FLEX_PLAYERS: Record<string, SlotPosition[]> = {
  'LeBron James':            ['PG', 'SG', 'SF', 'PF'],
  'Giannis Antetokounmpo':   ['PG', 'SG', 'SF', 'PF', 'C'],
  'Draymond Green':          ['PG', 'SF', 'PF', 'C'],
  'Ben Simmons':             ['PG', 'PF', 'C'],
  'Scottie Barnes':          ['PG', 'SG', 'SF', 'PF'],
  'Paolo Banchero':          ['PG', 'SG', 'SF', 'PF'],
  'Jimmy Butler':            ['PG', 'SG', 'SF', 'PF'],
  'Kawhi Leonard':           ['SG', 'SF', 'PF'],
  'Paul George':             ['SG', 'SF', 'PF'],

  'Nikola Jokic':            ['PG', 'PF', 'C'],

  'Larry Bird':              ['PG', 'SG', 'SF', 'PF'],

  'Magic Johnson':           ['PG', 'SG', 'SF', 'PF'],
  'Luka Doncic':             ['PG', 'SG', 'SF', 'PF'],
  'Jayson Tatum':            ['SG', 'SF', 'PF'],
  'Michael Jordan':          ['PG', 'SG', 'SF'],
}

// ─── Position lock ─────────────────────────────────────────────────────────────
// Hard positional constraints: 0 penalty only at listed slots.
// These players do NOT carry a flex tag — they are strictly these positions.
const POSITION_LOCK: Record<string, SlotPosition[]> = {
  'Tracy McGrady':       ['SG', 'SF'],
  'Peyton Watson':       ['SF', 'PF'],
  'Scottie Pippen':      ['SG', 'SF', 'PF'],
  'Kevin Durant':        ['SG', 'SF', 'PF'],
  'Joel Embiid':         ['PF', 'C'],
  'LaMarcus Aldridge':   ['PF', 'C'],
  'Tim Duncan':          ['PF', 'C'],
  'Karl Malone':         ['PF'],
  'Kevin Garnett':       ['PF', 'C'],
  'Shaquille O\'Neal':   ['PF', 'C'],
  'Hakeem Olajuwon':     ['PF', 'C'],
  'Dirk Nowitzki':       ['PF', 'C'],
  'Kareem Abdul-Jabbar': ['PF', 'C'],
  'Brandon Ingram':      ['SG', 'SF', 'PF'],
  'Josh Hart':           ['SG', 'SF'],
}

export function applyFlexTag(player: Player): Player {
  const flex = FLEX_PLAYERS[player.full_name]
  if (!flex) return player
  return { ...player, flexPositions: flex }
}

// ─── Championship rings ────────────────────────────────────────────────────────
const PLAYER_RINGS: Record<string, number> = {
  // 11
  'Bill Russell': 11,
  // 10
  'Sam Jones': 10,
  // 8
  'Tom Heinsohn': 8, 'K.C. Jones': 8, 'John Havlicek': 8, 'Tom Sanders': 8,
  // 7
  'Frank Ramsey': 7, 'Robert Horry': 7,
  // 6
  'Michael Jordan': 6, 'Scottie Pippen': 6, 'Kareem Abdul-Jabbar': 6, 'Bob Cousy': 6,
  // 5
  'Magic Johnson': 5, 'Kobe Bryant': 5, 'Tim Duncan': 5, 'Dennis Rodman': 5,
  'Derek Fisher': 5, 'Ron Harper': 5, 'Steve Kerr': 5, 'Michael Cooper': 5,
  'George Mikan': 5,
  // 4
  'Shaquille O\'Neal': 4, 'LeBron James': 4, 'Stephen Curry': 4, 'Draymond Green': 4,
  'Klay Thompson': 4, 'Robert Parish': 4, 'Tony Parker': 4, 'Manu Ginobili': 4,
  'Andre Iguodala': 4, 'Bill Sharman': 4, 'John Salley': 4,
  'Kevon Looney': 4, 'Horace Grant': 4,
  'Jamaal Wilkes': 4, 'Kurt Rambis': 4,
  'Vern Mikkelsen': 4,
  // 3
  'Larry Bird': 3, 'Kevin McHale': 3, 'James Worthy': 3, 'Byron Scott': 3,
  'Dwyane Wade': 3, 'Udonis Haslem': 3, 'A.C. Green': 3, 'Mychal Thompson': 3,
  'Danny Green': 3, 'Rick Fox': 3, 'Toni Kukoc': 3, 'Luc Longley': 3,
  'Dennis Johnson': 3, 'John Paxson': 3, 'Bill Cartwright': 3,
  'James Jones': 3,
  'Clyde Lovellette': 3,
  'Shaun Livingston': 3, 'Mario Elie': 3, 'JaVale McGee': 3, 'Patrick McCaw': 3,
  // 2
  'Hakeem Olajuwon': 2,
  'Wilt Chamberlain': 2, 'Isiah Thomas': 2, 'Joe Dumars': 2, 'Kevin Durant': 2,
  'Chris Bosh': 2, 'Bill Laimbeer': 2, 'Ray Allen': 2,
  'Kawhi Leonard': 2, 'Jrue Holiday': 2, 'Rajon Rondo': 2,
  'Kentavious Caldwell-Pope': 2, 'Alex Caruso': 2,
  'Pau Gasol': 2, 'Lamar Odom': 2, 'Andrew Bynum': 2,
  'David Robinson': 2, 'Shane Battier': 2, 'Mario Chalmers': 2,
  'Danny Ainge': 2,
  'Willis Reed': 2, 'Walt Frazier': 2, 'Dave DeBusschere': 2, 'Bill Bradley': 2,
  'Bob McAdoo': 2, 'Bob Dandridge': 2,
  'Mike Miller': 2, 'Norris Cole': 2,
  'Bailey Howell': 2, 'Jo Jo White': 2, 'Dave Cowens': 2, 'Bill Walton': 2,
  'Norm Nixon': 2, 'Mark Aguirre': 2,
  'Sam Cassell': 2, 'Kenny Smith': 2, 'Tyronn Lue': 2,
  'Luke Walton': 2, 'Jordan Farmar': 2, 'Sasha Vujacic': 2,
  'David West': 2, 'Zaza Pachulia': 2,
  // 1
  'Clyde Drexler': 1,
  'Jerry West': 1, 'Oscar Robertson': 1, 'Julius Erving': 1, 'Moses Malone': 1,
  'Paul Pierce': 1, 'Kevin Garnett': 1, 'Kyrie Irving': 1, 'Dirk Nowitzki': 1,
  'Jason Kidd': 1, 'Chauncey Billups': 1, 'Rasheed Wallace': 1, 'Ben Wallace': 1,
  'Rick Barry': 1, 'Nate Archibald': 1,
  'Earl Monroe': 1,
  // 50s champions
  'Paul Arizin': 1, 'Dolph Schayes': 1, 'Bob Pettit': 1,
  'Ed Macaulay': 1, 'Cliff Hagan': 1,
  // 60s–70s champions
  'Hal Greer': 1, 'Billy Cunningham': 1,
  'Jon McGlocklin': 1, 'Jerry Lucas': 1, 'Gail Goodrich': 1, 'Jim McMillan': 1,
  'Wes Unseld': 1, 'Elvin Hayes': 1,
  'Maurice Lucas': 1, 'Gus Williams': 1, 'Fred Brown': 1,
  // 80s champions
  'Spencer Haywood': 1,
  // 1982-83 76ers
  'Andrew Toney': 1,
  // 1993-94 Rockets
  'Vernon Maxwell': 1, 'Otis Thorpe': 1,
  // 1998-99 Spurs
  'Sean Elliott': 1,
  // 1999-00 Lakers
  'Glen Rice': 1,
  // 2001-02 Lakers
  'Mitch Richmond': 1,
  // 2025-26 Knicks
  'Jalen Brunson': 1, 'Mikal Bridges': 1, 'O.G. Anunoby': 1, 'Karl-Anthony Towns': 1,
  'Josh Hart': 1, 'Mitchell Robinson': 1, 'Jordan Clarkson': 1, 'Miles McBride': 1,
  'Landry Shamet': 1, 'Jose Alvarado': 1, 'Jeremy Sochan': 1, 'Ariel Hukporti': 1,
  'Pacôme Dadiet': 1, 'Mohamed Diawara': 1, 'Tyler Kolek': 1,
  // 2024-25 OKC
  'Shai Gilgeous-Alexander': 1, 'Jalen Williams': 1, 'Chet Holmgren': 1,
  'Luguentz Dort': 1, 'Isaiah Hartenstein': 1,
  'Aaron Wiggins': 1, 'Kenrich Williams': 1, 'Ajay Mitchell': 1,
  'Isaiah Joe': 1, 'Ousmane Dieng': 1, 'Nikola Topic': 1, 'Cason Wallace': 1,
  // 2023-24 Celtics
  'Jayson Tatum': 1, 'Jaylen Brown': 1, 'Al Horford': 1,
  'Kristaps Porzingis': 1, 'Derrick White': 1, 'Payton Pritchard': 1,
  'Sam Hauser': 1, 'Luke Kornet': 1, 'Neemias Queta': 1,
  // 2022-23 Nuggets
  'Nikola Jokic': 1, 'Jamal Murray': 1, 'Aaron Gordon': 1, 'Michael Porter Jr.': 1,
  'Bruce Brown': 1, 'Christian Braun': 1, 'Jeff Green': 1, 'DeAndre Jordan': 1,
  'Reggie Jackson': 1, 'Vlatko Cancar': 1, 'Zeke Nnaji': 1, 'Thomas Bryant': 1,
  // 2021-22 Warriors
  'Andrew Wiggins': 1, 'Jordan Poole': 1, 'Gary Payton II': 1, 'Otto Porter Jr.': 1,
  // 2020-21 Bucks
  'Giannis Antetokounmpo': 1, 'Khris Middleton': 1, 'Brook Lopez': 1,
  'Bobby Portis': 1, 'PJ Tucker': 1, 'Pat Connaughton': 1,
  // 2019-20 Lakers
  'Anthony Davis': 1, 'Kyle Kuzma': 1, 'Markieff Morris': 1, 'Dwight Howard': 1,
  'Jared Dudley': 1, 'Dion Waiters': 1, 'Avery Bradley': 1,
  // 2018-19 Raptors
  'Kyle Lowry': 1, 'Pascal Siakam': 1, 'Marc Gasol': 1,
  'Serge Ibaka': 1, 'Fred VanVleet': 1, 'Norman Powell': 1,
  // 2017-18 Warriors
  'Nick Young': 1,
  // 2016-17 Warriors
  'Matt Barnes': 1,
  // 2015-16 Cavs
  'Kevin Love': 1, 'Tristan Thompson': 1, 'J.R. Smith': 1,
  'Richard Jefferson': 1, 'Matthew Dellavedova': 1, 'Channing Frye': 1,
  'Iman Shumpert': 1,
  // 2014-15 Warriors
  'Andrew Bogut': 1, 'Harrison Barnes': 1, 'Leandro Barbosa': 1,
  'David Lee': 1, 'Festus Ezeli': 1,
  // 2013-14 Spurs
  'Boris Diaw': 1, 'Patty Mills': 1, 'Marco Belinelli': 1, 'Austin Daye': 1,
  // 2012-13 Heat
  'Chris Andersen': 1,
  // 2010-11 Mavs
  'Tyson Chandler': 1, 'Shawn Marion': 1, 'Jason Terry': 1,
  'J.J. Barea': 1, 'DeShawn Stevenson': 1, 'Peja Stojakovic': 1, 'Caron Butler': 1,
  // 2008-09 Lakers
  'Trevor Ariza': 1,
  // 2009-10 Lakers
  'Ron Artest': 1, 'Metta World Peace': 1,
  // 2007-08 Celtics
  'Tony Allen': 1, 'James Posey': 1,
  'Kendrick Perkins': 1, 'Glen Davis': 1, 'Scot Pollard': 1,
  // 2005-06 Heat
  'Gary Payton': 1, 'Antoine Walker': 1, 'Alonzo Mourning': 1, 'Jason Williams': 1,
  // 2003-04 Pistons
  'Tayshaun Prince': 1, 'Richard Hamilton': 1,
  // 1998-99 Spurs
  'Avery Johnson': 1,
}

export function applyRings(player: Player): Player {
  const rings = PLAYER_RINGS[player.full_name]
  if (!rings) return player
  return { ...player, rings }
}

// ─── Player anchors ────────────────────────────────────────────────────────────
type AnchorType = 'def' | 'off'
const PLAYER_ANCHORS: Record<string, AnchorType> = {
  // Defensive Anchors — T1
  'Draymond Green':          'def',
  'Dennis Rodman':           'def',
  'Ben Wallace':             'def',
  'Gary Payton':             'def',
  'Dikembe Mutombo':         'def',
  'Rudy Gobert':             'def',
  'Tony Allen':              'def',
  'Scottie Pippen':          'def',
  'Kawhi Leonard':           'def',
  'Bill Russell':            'def',
  'Hakeem Olajuwon':         'def',
  'Kevin Garnett':           'def',
  'Dwight Howard':           'def',
  'Tim Duncan':              'def',
  'Giannis Antetokounmpo':   'def',
  'David Robinson':          'def',
  'Anthony Davis':           'def',
  'Patrick Ewing':           'def',
  'Yao Ming':                'def',
  // Defensive Anchors — T2
  'Marcus Smart':            'def',
  'Aaron Gordon':            'def',
  'Evan Mobley':             'def',
  'Bam Adebayo':             'def',
  'Victor Wembanyama':       'def',
  'Jaren Jackson Jr.':       'def',
  'Serge Ibaka':             'def',
  'Jimmy Butler':            'def',
  'Dennis Johnson':          'def',
  'Bruce Bowen':             'def',
  'Nate Thurmond':           'def',
  'Alvin Robertson':         'def',
  'Paul George':             'def',
  'Jrue Holiday':            'def',
  'Andre Iguodala':          'def',
  'Metta World Peace':       'def',
  'Joakim Noah':             'def',
  'Walt Frazier':            'def',
  'Marc Gasol':              'def',
  'Luguentz Dort':           'def',
  'Andrei Kirilenko':        'def',
  'Wes Unseld':              'def',
  'Dave DeBusschere':        'def',
  'Bill Walton':             'def',
  'Dave Cowens':             'def',
  'Elmore Smith':            'def',
  // Offensive Anchors — T1
  'Michael Jordan':          'off',
  'Nikola Jokic':            'off',
  'LeBron James':            'off',
  'Stephen Curry':           'off',
  'Steve Nash':              'off',
  'Chris Paul':              'off',
  'Magic Johnson':           'off',
  'Luka Doncic':             'off',
  'Kareem Abdul-Jabbar':     'off',
  'John Stockton':           'off',
  'James Harden':            'off',
  'Shai Gilgeous-Alexander': 'off',
  'Joel Embiid':             'off',
  'Kevin Durant':            'off',
  'Oscar Robertson':         'off',
  'Shaquille O\'Neal':       'off',
  'Wilt Chamberlain':        'off',
  'Elgin Baylor':            'off',
  'Larry Bird':              'off',
  // Offensive Anchors — T2
  'Rajon Rondo':             'off',
  'Tony Parker':             'off',
  'Isiah Thomas':            'off',
  'Allen Iverson':           'off',
  'Damian Lillard':          'off',
  'Russell Westbrook':       'off',
  'Jayson Tatum':            'off',
  'Kyrie Irving':            'off',
  'Klay Thompson':           'off',
  'Kobe Bryant':             'off',
  'Dwyane Wade':             'off',
  'Tracy McGrady':           'off',
  'Jerry West':              'off',
  'Dirk Nowitzki':           'off',
  'George Gervin':           'off',
  'Pete Maravich':           'off',
  'Julius Erving':           'off',
  'Moses Malone':            'off',
  'Bob Pettit':              'off',
}

// Era-specific anchor overrides — "name:era" takes priority over PLAYER_ANCHORS.
const ERA_PLAYER_ANCHORS: Record<string, AnchorType> = {
  'Carmelo Anthony:00s': 'off',
  'Carmelo Anthony:10s': 'off',
}

// Tier 2 anchor overrides — players listed here get half the anchor bonus (+6 def / +4 off).
// All anchors not listed here default to Tier 1.
const PLAYER_ANCHOR_TIERS: Record<string, 2> = {
  // Defensive T2
  'Marcus Smart':        2,
  'Aaron Gordon':        2,
  'Evan Mobley':         2,
  'Bam Adebayo':         2,
  'Victor Wembanyama':   2,
  'Jaren Jackson Jr.':   2,
  'Serge Ibaka':         2,
  'Jimmy Butler':        2,
  'Dennis Johnson':      2,
  'Bruce Bowen':         2,
  'Nate Thurmond':       2,
  'Alvin Robertson':     2,
  'Marc Gasol':          2,
  'Luguentz Dort':       2,
  'Andrei Kirilenko':    2,
  'Wes Unseld':          2,
  'Dave DeBusschere':    2,
  'Bill Walton':         2,
  'Dave Cowens':         2,
  'Elmore Smith':        2,
  // Offensive T2
  'Rajon Rondo':         2,
  'Tony Parker':         2,
  'Isiah Thomas':        2,
  'Allen Iverson':       2,
  'Damian Lillard':      2,
  'Russell Westbrook':   2,
  'Jayson Tatum':        2,
  'Kyrie Irving':        2,
  'Carmelo Anthony':     2,
  'Klay Thompson':       2,
  'Kobe Bryant':         2,
  'Dwyane Wade':         2,
  'Paul George':         2,
  'Jrue Holiday':        2,
  'Andre Iguodala':      2,
  'Metta World Peace':   2,
  'Joakim Noah':         2,
  'Walt Frazier':        2,
  'Tracy McGrady':       2,
  'Jerry West':          2,
  'Dirk Nowitzki':       2,
  'George Gervin':       2,
  'Pete Maravich':       2,
  'Julius Erving':       2,
  'Moses Malone':        2,
  'Bob Pettit':          2,
}

export function applyAnchors(player: Player): Player {
  const eraKey = player.era ? `${player.full_name}:${player.era}` : null
  const anchor = (eraKey && ERA_PLAYER_ANCHORS[eraKey]) ?? PLAYER_ANCHORS[player.full_name]
  if (!anchor) return player
  const tier: 1 | 2 = PLAYER_ANCHOR_TIERS[player.full_name] ?? 1
  return { ...player, defAnchor: anchor === 'def', offAnchor: anchor === 'off', anchorTier: tier }
}

export const DUO_PAIRS: Record<string, string[]> = {
  // 50s / 60s
  'Wilt Chamberlain':        ['Hal Greer'],
  'Hal Greer':               ['Wilt Chamberlain'],
  'Jerry West':              ['Elgin Baylor'],
  'Elgin Baylor':            ['Jerry West'],
  'Bill Russell':            ['John Havlicek', 'Bob Cousy'],
  'John Havlicek':           ['Bill Russell'],
  'Bob Cousy':               ['Bill Russell'],
  // 70s / 80s
  'Oscar Robertson':         ['Kareem Abdul-Jabbar'],
  'Julius Erving':           ['Moses Malone'],
  'Moses Malone':            ['Julius Erving'],
  'Elvin Hayes':             ['Wes Unseld'],
  'Wes Unseld':              ['Elvin Hayes'],
  'Gary Payton':             ['Shawn Kemp'],
  'Shawn Kemp':              ['Gary Payton'],
  'Walt Frazier':            ['Willis Reed'],
  'Willis Reed':             ['Walt Frazier'],
  'Alex English':            ['Kiki Vandeweghe'],
  'Kiki Vandeweghe':         ['Alex English'],
  'Magic Johnson':           ['Kareem Abdul-Jabbar'],
  'Kareem Abdul-Jabbar':     ['Magic Johnson', 'Oscar Robertson'],
  'Larry Bird':              ['Kevin McHale'],
  'Kevin McHale':            ['Larry Bird'],
  'Isiah Thomas':            ['Joe Dumars'],
  'Joe Dumars':              ['Isiah Thomas'],
  // 90s
  'Michael Jordan':          ['Scottie Pippen', 'Dennis Rodman'],
  'Scottie Pippen':          ['Michael Jordan', 'Dennis Rodman'],
  'Dennis Rodman':           ['Michael Jordan', 'Scottie Pippen'],
  'John Stockton':           ['Karl Malone'],
  'Karl Malone':             ['John Stockton'],
  'Hakeem Olajuwon':         ['Clyde Drexler'],
  'Clyde Drexler':           ['Hakeem Olajuwon'],
  "Shaquille O'Neal":        ['Kobe Bryant', 'Anfernee Hardaway', 'Dwyane Wade'],
  'Anfernee Hardaway':       ["Shaquille O'Neal"],
  'Alonzo Mourning':         ['Tim Hardaway'],
  'Tim Hardaway':            ['Alonzo Mourning'],
  'Charles Barkley':         ['Kevin Johnson'],
  'Kevin Johnson':           ['Charles Barkley'],
  'Patrick Ewing':           ['John Starks'],
  'John Starks':             ['Patrick Ewing'],
  // 00s
  'Kobe Bryant':             ["Shaquille O'Neal", 'Pau Gasol'],
  'Pau Gasol':               ['Kobe Bryant'],
  'Tracy McGrady':           ['Yao Ming'],
  'Yao Ming':                ['Tracy McGrady'],
  'Tim Duncan':              ['Tony Parker', 'David Robinson', 'Manu Ginobili'],
  'David Robinson':          ['Tim Duncan'],
  'Tony Parker':             ['Tim Duncan', 'Manu Ginobili'],
  'Manu Ginobili':           ['Tony Parker', 'Tim Duncan'],
  'Dirk Nowitzki':           ['Jason Terry', 'Jason Kidd'],
  'Jason Terry':             ['Dirk Nowitzki'],
  'Jason Kidd':              ['Dirk Nowitzki'],
  'Steve Nash':              ["Amar'e Stoudemire"],
  "Amar'e Stoudemire":       ['Steve Nash'],
  'Ray Allen':               ['Paul Pierce', 'Kevin Garnett'],
  'Paul Pierce':             ['Kevin Garnett', 'Ray Allen'],
  'Kevin Garnett':           ['Paul Pierce', 'Ray Allen'],
  // 10s
  'Kevin Durant':            ['Russell Westbrook', 'James Harden', 'Stephen Curry'],
  'Russell Westbrook':       ['Kevin Durant', 'James Harden', 'Paul George'],
  'Paul George':             ['Russell Westbrook', 'Kawhi Leonard'],
  'Kawhi Leonard':           ['Paul George', 'Kyle Lowry'],
  'LeBron James':            ['Dwyane Wade', 'Kyrie Irving', 'Kevin Love', 'Anthony Davis', 'Chris Bosh'],
  'Dwyane Wade':             ['LeBron James', "Shaquille O'Neal", 'Chris Bosh'],
  'Chris Bosh':              ['LeBron James', 'Dwyane Wade'],
  'Kyrie Irving':            ['LeBron James', 'Luka Doncic'],
  'Luka Doncic':             ['Kyrie Irving'],
  'Kevin Love':              ['LeBron James'],
  'Chris Paul':              ['Blake Griffin', 'Deandre Jordan', 'Devin Booker'],
  'Devin Booker':            ['Chris Paul'],
  'Blake Griffin':           ['Chris Paul'],
  'Deandre Jordan':          ['Chris Paul'],
  'James Harden':            ['Clint Capela', 'Russell Westbrook', 'Kevin Durant', 'Joel Embiid'],
  'Clint Capela':            ['James Harden'],
  'Stephen Curry':           ['Klay Thompson', 'Draymond Green', 'Andre Iguodala', 'Kevin Durant'],
  'Andre Iguodala':          ['Stephen Curry'],
  'Klay Thompson':           ['Stephen Curry', 'Draymond Green'],
  'Draymond Green':          ['Stephen Curry', 'Klay Thompson'],
  'DeMar DeRozan':           ['Kyle Lowry'],
  'Kyle Lowry':              ['DeMar DeRozan', 'Kawhi Leonard'],
  'Damian Lillard':          ['CJ McCollum'],
  'CJ McCollum':             ['Damian Lillard'],
  'Giannis Antetokounmpo':   ['Khris Middleton'],
  'Khris Middleton':         ['Giannis Antetokounmpo'],
  // 20s
  'Nikola Jokic':            ['Jamal Murray', 'Aaron Gordon'],
  'Jamal Murray':            ['Nikola Jokic', 'Aaron Gordon'],
  'Aaron Gordon':            ['Nikola Jokic', 'Jamal Murray'],
  'Anthony Davis':           ['LeBron James'],
  'Jayson Tatum':            ['Jaylen Brown'],
  'Jaylen Brown':            ['Jayson Tatum'],
  'Jalen Brunson':           ['Josh Hart', 'Mikal Bridges'],
  'Josh Hart':               ['Jalen Brunson', 'Mikal Bridges'],
  'Mikal Bridges':           ['Jalen Brunson', 'Josh Hart'],
  'Donovan Mitchell':        ['Rudy Gobert'],
  'Rudy Gobert':             ['Donovan Mitchell'],
  'Anthony Edwards':         ['Karl-Anthony Towns'],
  'Karl-Anthony Towns':      ['Anthony Edwards'],
  'Mike Conley':             ['Marc Gasol'],
  'Marc Gasol':              ['Mike Conley'],
  'Ben Simmons':             ['Joel Embiid'],
  'Joel Embiid':             ['Ben Simmons', 'James Harden', 'Tyrese Maxey'],
  'Tyrese Maxey':            ['Joel Embiid'],
  'Shai Gilgeous-Alexander': ['Jalen Williams'],
  'Jalen Williams':          ['Shai Gilgeous-Alexander'],
  'Christian Braun':         ['Bruce Brown'],
  'Bruce Brown':             ['Christian Braun'],
  'Jimmy Butler':            ['Bam Adebayo'],
  'Bam Adebayo':             ['Jimmy Butler'],
}

export function applyDuo(player: Player): Player {
  const partners = DUO_PAIRS[player.full_name]
  if (!partners) return player
  return { ...player, duoPartners: partners }
}

const TIMELESS_PLAYERS = new Set([
  'LeBron James',
  'Oscar Robertson',
  'Magic Johnson',
  'Kareem Abdul-Jabbar',
  'Kevin Durant',
  'Giannis Antetokounmpo',
  'Tim Duncan',
  'Nikola Jokic',
  'Michael Jordan',
  'Rudy Gobert',
  'Russell Westbrook',
  'Larry Bird',
  'Kobe Bryant',
  'Dwight Howard',
  'Shaquille O\'Neal',
  'Kevin Garnett',
  'Hakeem Olajuwon',
  'Kawhi Leonard',
  'Charles Barkley',
  'David Robinson',
  'Anthony Davis',
  'Moses Malone',
  'Pete Maravich',
  'Gary Payton',
  'Steve Nash',
  'Draymond Green',
  'Shai Gilgeous-Alexander',
])

export function applyTimeless(player: Player): Player {
  if (!TIMELESS_PLAYERS.has(player.full_name)) return player
  return { ...player, timeless: true }
}

const SHOOTING_STAR_T1 = new Set([
  'Stephen Curry',
  'Klay Thompson',
  'Ray Allen',
  'Reggie Miller',
  'Kyle Korver',
  'Damian Lillard',
  'Steve Kerr',
  'Larry Bird',
  'JJ Redick',
])

const SHOOTING_STAR_T2 = new Set([
  'Peja Stojakovic',
  'Dell Curry',
  'Joe Harris',
  'Tim Hardaway Jr.',
  'Drazen Petrovic',
  'Craig Hodges',
  'Glen Rice',
  'Michael Porter Jr.',
  'Karl-Anthony Towns',
  'Duncan Robinson',
  'Mike Miller',
  'Dirk Nowitzki',
  'Kentavious Caldwell-Pope',
  'Kon Knueppel',
])

export function applyShootingStar(player: Player): Player {
  if (SHOOTING_STAR_T1.has(player.full_name)) return { ...player, shootingStar: true, shootingStarTier: 1 }
  if (SHOOTING_STAR_T2.has(player.full_name)) return { ...player, shootingStar: true, shootingStarTier: 2 }
  return player
}

// ─── Glass Cleaner ─────────────────────────────────────────────────────────────
// Dominant rebounders whose glass work meaningfully lifts team rebFactor.
const GLASS_CLEANER_PLAYERS = new Set([
  'Dennis Rodman',
  'Ben Wallace',
  'Moses Malone',
  'Andre Drummond',
  'DeAndre Jordan',
  'Steven Adams',
  'Wes Unseld',
  'Bob Pettit',
  'Nate Thurmond',
  'Kevin Love',
  'Clint Capela',
])

export function applyGlassCleaner(player: Player): Player {
  if (!GLASS_CLEANER_PLAYERS.has(player.full_name)) return player
  return { ...player, glassClean: true }
}

function playoffRingBoost(rings: number): number {
  if (rings >= 9)  return 0.13
  if (rings >= 6)  return 0.10
  if (rings >= 3)  return 0.06
  if (rings >= 1)  return 0.03
  return 0
}
const THREE_PT_ERAS: Era[] = ['10s', '20s']
const PRE_THREE_PT_ERAS: Era[] = ['50s', '60s', '70s']

// League-average 3PT% by era — used to estimate pre-3PT guards in modern eras
const ERA_LEAGUE_AVG_3PT: Partial<Record<Era, number>> = {
  '80s': 0.278, '90s': 0.340, '00s': 0.350, '10s': 0.362, '20s': 0.362,
}

// Pre-3PT era guard with TS ≥ 52% and no 3PT data — would adapt and shoot some 3s in modern eras
function isEstimatedShooter(player: Player, simEra: Era): boolean {
  if (player.FG3_PCT != null) return false
  if (!PRE_THREE_PT_ERAS.includes(player.era)) return false
  if (PRE_THREE_PT_ERAS.includes(simEra)) return false
  const pos = (player.position ?? '').toUpperCase()
  const isGuard = pos.includes('GUARD') || pos.includes('PG') || pos.includes('SG') || pos === 'G'
  if (!isGuard) return false
  return calcTS(player) >= 0.52
}

// Returns the base estimated FG3_PCT before sim noise — 85% of era league average (capable but not natural)
function getEstimatedFG3PCT(player: Player, simEra: Era): number | null {
  if (!isEstimatedShooter(player, simEra)) return null
  const leagueAvg = ERA_LEAGUE_AVG_3PT[simEra]
  return leagueAvg != null ? leagueAvg * 0.85 : null
}

// Era-appropriate opponent scoring baseline (no 3s = lower opp scores in early eras)
const ERA_OPP_BASELINE: Record<Era, number> = {
  '50s': 88, '60s': 105, '70s': 100,
  '80s': 107, '90s': 98, '00s': 97, '10s': 108, '20s': 114,
}

// Modern eras have deeper, more competitive leagues — opponents are proportionally harder
const ERA_DIFFICULTY: Partial<Record<Era, number>> = {
  '50s': 1.04, '60s': 1.05, '70s': 1.05, '80s': 1.06,
  '90s': 1.10, '00s': 1.08, '10s': 1.08, '20s': 1.10,
}

// Era-appropriate score caps (elite teams in 50s/60s historically hit 120-130 PPG)
const ERA_SCORE_CAP: Record<Era, number> = {
  '50s': 130, '60s': 140, '70s': 130,
  '80s': 136, '90s': 124, '00s': 122, '10s': 138, '20s': 135,
}
const ERA_SCORE_FLOOR: Record<Era, number> = {
  '50s': 72, '60s': 80, '70s': 80,
  '80s': 82, '90s': 80, '00s': 80, '10s': 82, '20s': 85,
}

const ERA_DECADE_START: Record<Era, number> = {
  '50s': 1950, '60s': 1960, '70s': 1970, '80s': 1980,
  '90s': 1990, '00s': 2000, '10s': 2010, '20s': 2020,
}

export const ERA_SEASON_GAMES: Record<Era, number> = {
  '50s': 72, '60s': 72,
  '70s': 82, '80s': 82, '90s': 82, '00s': 82, '10s': 82, '20s': 82,
}

// Assigned minutes per slot (5 × 35 + 25 + 15 + 13 + 12 = 240 total)
export const SLOT_MPG: Record<SlotPosition, number> = {
  PG: 35, SG: 35, SF: 35, PF: 35, C: 35,
  B1: 25, B2: 15, B3: 13, B4: 12,
}

// Assumed historical baseline MPG for computing scale factor
const STARTER_BASELINE_MPG = 35
const BENCH_BASELINE_MPG   = 25

// Rating-only overrides: "name:era:team" → era:team key to use for rating calc only.
// Display stats are unchanged — only the tier/rating uses the redirected stat line.
// Use when a small sample inflates (or deflates) a player's apparent level.
const RATING_STAT_OVERRIDE: Record<string, string> = {
  'Nikola Vucevic:20s:ORL': '20s:CHI',
}

// Flat base rating overrides: "name:era:team" → exact base rating value.
// Use when the formula under/over-values a player and a manual correction is needed.
const BASE_RATING_OVERRIDE: Record<string, number> = {
  // 20s
  'Shai Gilgeous-Alexander:20s:OKC': 67,
  'Joel Embiid:20s:PHI':             67.7,
  'Giannis Antetokounmpo:20s:MIL':   70,

  'Damian Lillard:20s:POR':          61,
  'Jalen Brunson:20s:NYK':           55,
  'Anthony Edwards:20s:MIN':         53,
  'Jamal Murray:20s:DEN':            54,
  'Michael Porter Jr.:20s:DEN':      46.5,
  'Aaron Gordon:20s:DEN':            47,
  'Austin Reaves:20s:LAL':           44,
  'Christian Braun:20s:DEN':         32,
  'Jared McCain:20s:OKC':            35,
  'Peyton Watson:20s:DEN':           34,
  // 10s
  'LeBron James:10s:CLE':            72,
  'Stephen Curry:10s:GSW':           70,
  'James Harden:10s:HOU':            65,
  'Kevin Durant:10s:OKC':            70,
  'Kevin Durant:10s:GSW':            67,
  'Russell Westbrook:10s:OKC':       60,
  'Carmelo Anthony:10s:DEN':         57,
  'Tim Duncan:10s:SAS':              55,
  'Kyrie Irving:10s:CLE':            50,
  'Draymond Green:10s:GSW':          51,
  'Paul Millsap:10s:ATL':            46.5,
  'John Wall:10s:WAS':               46,
  'Derrick Rose:10s:CHI':            46,
  'Tony Parker:10s:SAS':             40,
  'DeAndre Jordan:10s:LAC':          39,
  // 00s
  "Shaquille O'Neal:00s:LAL":        69,
  'Tim Duncan:00s:SAS':              69,
  'Kobe Bryant:00s:LAL':             65,
  'Kevin Durant:00s:OKC':            57,
  'Kevin Durant:00s:SEA':            57,
  'Gary Payton:00s:SEA':             54,
  'Jason Kidd:00s:NJN':              46.8,
  'Jason Kidd:00s:PHX':              46.6,
  'Yao Ming:00s:HOU':                46.5,
  // 90s
  'Michael Jordan:90s:CHI':          72,
  'Hakeem Olajuwon:90s:HOU':         69,
  "Shaquille O'Neal:90s:ORL":        63,
  "Shaquille O'Neal:90s:LAL":        66,
  'David Robinson:90s:SAN':          65,
  'Magic Johnson:90s:LAL':           60,
  'Charles Barkley:90s:PHX':         57,
  'Kobe Bryant:90s:LAL':             55,
  // 80s
  'Larry Bird:80s:BOS':              66,
  'David Robinson:80s:SAN':          66,
  'Alex English:80s:DEN':            57,
  // 70s
  'Oscar Robertson:70s:MIL':         56,
  // 50s
  'Wilt Chamberlain:50s:PHW':        78.4,
}

// Returns the player with era-specific stats substituted in, falling back to
// career stats if no era data exists. Pass team when a player had multiple
// teams in the same era (key format: "era:team"). The player's native .era
// field is preserved — only counting/shooting stats change.
export function withEraStats(player: Player, era: Era, team?: string): Player {
  // Try era:team first (for players with per-team splits), then era alone.
  const eraData: EraStats | undefined =
    (team ? player.stats_by_era?.[`${era}:${team}`] : undefined) ??
    player.stats_by_era?.[era]
  if (!eraData) return { ...player, era }
  const { team: eraTeam, GP, ...stats } = eraData
  return { ...player, era, eraTeam, GP, ...stats }
}

export function playerMatchesEra(player: Player, era: Era): boolean {
  const start = ERA_DECADE_START[era]
  const end = start + 9
  const careerEnd = player.to_year ?? 2029
  return player.from_year <= end && careerEnd >= start
}

export function eraDistance(playerEra: Era, simEra: Era): number {
  return Math.abs(ERA_ORDER.indexOf(playerEra) - ERA_ORDER.indexOf(simEra))
}

export function calcTS(player: Player): number {
  if (player.TS_PCT != null) return player.TS_PCT
  // Fallback for pre-era-stats players (imputed/historical): approximate from FG%
  if (player.FG_PCT == null) return 0.45
  return player.FG_PCT * 0.9 + (player.FT_PCT ?? 0.7) * 0.1
}

export interface OppTeamStats {
  REB: number; AST: number; STL: number | null; BLK: number | null; TOV: number
  FG_PCT: number; FG3_PCT: number | null; FT_PCT: number; TS_PCT: number
}

export function calcTeamDefTotals(playerRatings: PlayerRating[]): { stl: number; blk: number } {
  let stl = 0, blk = 0
  for (const pr of playerRatings) {
    const isStarter = STARTER_SLOTS.includes(pr.slot)
    const minScale = SLOT_MPG[pr.slot] / (isStarter ? STARTER_BASELINE_MPG : BENCH_BASELINE_MPG)
    stl += imputeSTL(pr.player) * minScale
    blk += imputeBLK(pr.player) * minScale
  }
  return { stl, blk }
}

export function genOppTeamStats(avgOppScore: number, era: Era, teamSTL?: number, teamBLK?: number, teamRebFactor?: number): OppTeamStats {
  type B = { ppg: number; reb: number; ast: number; stl: number | null; blk: number | null; tov: number; fg: number; fg3: number | null; ft: number; ts: number }
  const BL: Record<Era, B> = {
    '50s': { ppg: 79,  reb: 65, ast: 14, stl: null, blk: null, tov: 18, fg: 0.372, fg3: null,  ft: 0.675, ts: 0.480 },
    '60s': { ppg: 107, reb: 58, ast: 18, stl: null, blk: null, tov: 17, fg: 0.440, fg3: null,  ft: 0.718, ts: 0.520 },
    '70s': { ppg: 105, reb: 46, ast: 24, stl: 8.0,  blk: 5.0,  tov: 17, fg: 0.458, fg3: null,  ft: 0.728, ts: 0.530 },
    '80s': { ppg: 110, reb: 43, ast: 26, stl: 8.5,  blk: 5.2,  tov: 15, fg: 0.477, fg3: 0.278, ft: 0.748, ts: 0.548 },
    '90s': { ppg: 99,  reb: 43, ast: 24, stl: 8.6,  blk: 5.3,  tov: 15, fg: 0.454, fg3: 0.340, ft: 0.742, ts: 0.540 },
    '00s': { ppg: 97,  reb: 42, ast: 22, stl: 7.8,  blk: 5.0,  tov: 13, fg: 0.450, fg3: 0.350, ft: 0.740, ts: 0.538 },
    '10s': { ppg: 105, reb: 43, ast: 24, stl: 7.8,  blk: 5.1,  tov: 14, fg: 0.460, fg3: 0.362, ft: 0.760, ts: 0.555 },
    '20s': { ppg: 114, reb: 44, ast: 28, stl: 8.0,  blk: 5.2,  tov: 14, fg: 0.470, fg3: 0.362, ft: 0.778, ts: 0.570 },
  }
  const b = BL[era]
  const scale = avgOppScore / b.ppg
  const cn = (r: number) => (Math.random() - 0.5) * r
  const pn = () => randn() * 0.018
  return {
    REB:     Math.min(75, Math.max(28, +(b.reb * scale * (teamRebFactor != null ? 2 - teamRebFactor : 1) + cn(5)).toFixed(1))),
    AST:     Math.max(10, +(b.ast * scale + cn(4)).toFixed(1)),
    STL:     b.stl != null ? Math.max(4,  +(b.stl + cn(1.5)).toFixed(1)) : null,
    BLK:     b.blk != null ? Math.max(2,  +(b.blk + cn(1.0)).toFixed(1)) : null,
    TOV:     (() => {
      const defTOVAdjust = b.stl != null
        ? (teamSTL != null ? (teamSTL - b.stl) * 1.0 : 0)
          + (teamBLK != null ? (teamBLK - (b.blk ?? 5.1)) * 0.3 : 0)
        : 0
      return Math.max(8, +(b.tov * scale + cn(3) + defTOVAdjust).toFixed(1))
    })(),
    FG_PCT:  Math.min(0.58, Math.max(0.35, b.fg + pn())),
    FG3_PCT: b.fg3 != null ? Math.min(0.48, Math.max(0.22, b.fg3 + pn())) : null,
    FT_PCT:  Math.min(0.88, Math.max(0.58, b.ft + pn())),
    TS_PCT:  Math.min(0.68, Math.max(0.42, b.ts + pn())),
  }
}

function isBigPosition(position: string): boolean {
  const pos = (position ?? '').toUpperCase()
  if (pos.includes('CENTER')) return true
  if (pos.includes('GUARD')) return false
  if (pos.includes('FORWARD')) return true  // Forward, Forward-Center, Power Forward → big
  return false
}

export function imputeBLK(player: Player): number {
  if (player.BLK != null) return player.BLK
  const is75 = player.greatest_75_flag === 'Y'
  const big = isBigPosition(player.position ?? '')
  return is75 ? (big ? 2.5 : 0.8) : (big ? 1.2 : 0.3)
}

export function imputeSTL(player: Player): number {
  if (player.STL != null) return player.STL
  return player.greatest_75_flag === 'Y' ? 1.8 : 0.9
}

export function imputeTOV(player: Player): number {
  if (player.TOV != null) return player.TOV
  return player.greatest_75_flag === 'Y' ? 2.5 : 1.5
}

export function playerBaseRating(player: Player, simEra?: Era): number {
  const duoBonus = (player.duoActiveCount ?? 0) * 5
  // Flat base rating override
  const flatKey = player.eraTeam ? `${player.full_name}:${player.era}:${player.eraTeam}` : null
  if (flatKey && BASE_RATING_OVERRIDE[flatKey] != null) return BASE_RATING_OVERRIDE[flatKey] + duoBonus

  // Check for a rating-only stat override (display stats unchanged)
  const overrideKey = player.eraTeam ? `${player.full_name}:${player.era}:${player.eraTeam}` : null
  const overrideTarget = overrideKey ? RATING_STAT_OVERRIDE[overrideKey] : null
  const ratingPlayer: Player = overrideTarget && player.stats_by_era?.[overrideTarget]
    ? { ...player, ...(() => { const { team: _t, GP: _g, ...s } = player.stats_by_era![overrideTarget]; return s })() }
    : player

  const ts = calcTS(ratingPlayer)
  const threePtBonus = (!simEra || PRE_THREE_PT_ERAS.includes(simEra))
    ? 0
    : (ratingPlayer.FG3M ?? 0) * 1.5
  const t1 = (player.anchorTier ?? 1) === 1
  const anchorBonus = player.defAnchor ? (t1 ? 12 : 6) : player.offAnchor ? (t1 ? 8 : 4) : 0
  const top75Bonus = player.greatest_75_flag === 'Y' ? 3 : 0
  return (
    (ratingPlayer.PTS ?? 0)     * 1.0 +
    (ratingPlayer.REB ?? 0)     * 0.7 +
    (ratingPlayer.AST ?? 0)     * 0.7 +
    ts                          * 25  +
    threePtBonus                      +
    imputeSTL(ratingPlayer)     * 1.5 +
    imputeBLK(ratingPlayer)     * 1.5 -
    imputeTOV(ratingPlayer)     * 1.0 +
    anchorBonus                       +
    top75Bonus                        +
    duoBonus
  )
}

export type PlayerTier = 's' | 'a' | 'b' | 'c' | 'd'
export const CAP_QUOTAS: Record<PlayerTier, number> = { s: 2, a: 2, b: 2, c: 2, d: 1 }
export function playerTier(base: number): PlayerTier {
  if (base >= 55) return 's'
  if (base >= 46) return 'a'
  if (base >= 38) return 'b'
  if (base >= 31) return 'c'
  return 'd'
}

export function calcFitPenalty(player: Player, slot: SlotPosition): { penalty: 0 | 0.10 | 0.25; label: CourtSlot['fitLabel'] } {
  if (slot.startsWith('B')) {
    return { penalty: 0, label: 'Position Fit' }
  }
  // Position lock: hard constraint — only listed slots are penalty-free
  const locked = POSITION_LOCK[player.full_name]
  if (locked) {
    if (locked.includes(slot)) return { penalty: 0, label: 'Position Fit' }
    const STARTER_ORDER: SlotPosition[] = ['PG', 'SG', 'SF', 'PF', 'C']
    const slotIdx = STARTER_ORDER.indexOf(slot)
    const minDist = Math.min(...locked
      .filter(p => STARTER_ORDER.includes(p))
      .map(p => Math.abs(STARTER_ORDER.indexOf(p) - slotIdx)))
    if (minDist <= 1) return { penalty: 0.10, label: 'Positional Penalty -10%' }
    return { penalty: 0.25, label: 'Major Penalty -25%' }
  }
  // FLEX tag: player can play this slot without penalty
  if (player.flexPositions?.includes(slot)) {
    return { penalty: 0, label: 'Position Fit' }
  }
  // Flex player at a non-flex slot: proximity penalty instead of raw position string logic
  if (player.flexPositions && player.flexPositions.length > 0) {
    const STARTER_ORDER: SlotPosition[] = ['PG', 'SG', 'SF', 'PF', 'C']
    const slotIdx = STARTER_ORDER.indexOf(slot)
    const minDist = Math.min(...player.flexPositions
      .filter(p => STARTER_ORDER.includes(p))
      .map(p => Math.abs(STARTER_ORDER.indexOf(p) - slotIdx)))
    if (minDist <= 1) return { penalty: 0.10, label: 'Positional Penalty -10%' }
    return { penalty: 0.25, label: 'Major Penalty -25%' }
  }

  const pos = player.position ?? ''
  const posUpper = pos.toUpperCase()

  // Normalize player positions
  const isGuard = posUpper.includes('GUARD') || posUpper.includes('PG') || posUpper.includes('SG') || posUpper === 'G'
  const isForward = posUpper.includes('FORWARD') || posUpper.includes('SF') || posUpper.includes('PF') || posUpper === 'F'
  const isCenter = posUpper.includes('CENTER') || posUpper.includes('C') || posUpper === 'C'
  const isGuardForward = posUpper.includes('G/F') || posUpper.includes('F/G') || posUpper.includes('GUARD-FORWARD') || posUpper.includes('FORWARD-GUARD')
  const isForwardCenter = posUpper.includes('F/C') || posUpper.includes('C/F') || posUpper.includes('FORWARD-CENTER') || posUpper.includes('CENTER-FORWARD')

  // Adjacent pairs: PG↔SG, SG↔SF, SF↔PF, PF↔C
  if (slot === 'PG') {
    if (isGuard || isGuardForward) return { penalty: 0, label: 'Position Fit' }
    if (isForward) return { penalty: 0.25, label: 'Major Penalty -25%' }
    if (isCenter) return { penalty: 0.25, label: 'Major Penalty -25%' }
  }
  if (slot === 'SG') {
    if (isGuard || isGuardForward) return { penalty: 0, label: 'Position Fit' }
    if (isForward) return { penalty: 0.10, label: 'Positional Penalty -10%' }
    if (isCenter) return { penalty: 0.25, label: 'Major Penalty -25%' }
  }
  if (slot === 'SF') {
    if (isForward || isGuardForward || isForwardCenter) return { penalty: 0, label: 'Position Fit' }
    if (isGuard) return { penalty: 0.10, label: 'Positional Penalty -10%' }
    if (isCenter) return { penalty: 0.25, label: 'Major Penalty -25%' }
  }
  if (slot === 'PF') {
    if (isForward || isForwardCenter) return { penalty: 0, label: 'Position Fit' }
    if (isGuardForward) return { penalty: 0.10, label: 'Positional Penalty -10%' }
    if (isCenter) return { penalty: 0.10, label: 'Positional Penalty -10%' }
    if (isGuard) return { penalty: 0.25, label: 'Major Penalty -25%' }
  }
  if (slot === 'C') {
    if (isCenter || isForwardCenter) return { penalty: 0, label: 'Position Fit' }
    if (isForward) return { penalty: 0.10, label: 'Positional Penalty -10%' }
    if (isGuard || isGuardForward) return { penalty: 0.25, label: 'Major Penalty -25%' }
  }
  return { penalty: 0.10, label: 'Positional Penalty -10%' }
}

// dist → modifier. Forward = old player in newer era (-5% per decade).
// Backward = modern player in older era (-3% per decade — training/athleticism advantage).
// Tall centers (6'10"+) going backward: -1.5% per decade (physical dominance translates).
// 10s↔20s: treated as the same modern era (only 2% apart) in either direction.
const ERA_MOD_FORWARD            = [1.00, 0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65]
const ERA_MOD_FORWARD_EST_SHOOTER = [1.00, 0.97, 0.93, 0.89, 0.86, 0.82, 0.78, 0.75]
const ERA_MOD_BACKWARD           = [1.00, 0.97, 0.94, 0.91, 0.88, 0.85, 0.82, 0.79]
const ERA_MOD_BACKWARD_TALL      = [1.00, 0.985, 0.97, 0.955, 0.94, 0.925, 0.91, 0.895]

function playerHeightInches(player: Player): number {
  const parts = (player.height ?? '').split('-').map(Number)
  return parts.length === 2 ? parts[0] * 12 + parts[1] : 0
}

export function calcEraModifier(player: Player, simEra: Era): number {
  const playerIdx = ERA_ORDER.indexOf(player.era)
  const simIdx = ERA_ORDER.indexOf(simEra)
  const dist = Math.abs(playerIdx - simIdx)
  if (player.timeless) return dist >= 6 ? 0.95 : 1.0
  // 10s and 20s are the same modern era — only 2% apart in either direction
  if ((player.era === '10s' && simEra === '20s') || (player.era === '20s' && simEra === '10s')) return 0.98
  // Chris Paul — elite fit in the 90s and any modern era forward
  if (player.full_name === 'Chris Paul' && (simEra === '90s' || simEra === '00s' || simEra === '10s' || simEra === '20s')) return 1.0
  // Zach Randolph — elite backward fit; physical low-post game translates to any older era
  if (player.full_name === 'Zach Randolph' && playerIdx > simIdx) return 1.0
  // Tall centers (6'10"+) or Bam Adebayo going back get reduced penalty (physical size translates)
  const isTallCenter = playerHeightInches(player) >= 82 || player.full_name === 'Bam Adebayo' || player.full_name === 'Zion Williamson' || player.full_name === 'Aaron Gordon'
  const table = playerIdx > simIdx
    ? (isTallCenter ? ERA_MOD_BACKWARD_TALL : ERA_MOD_BACKWARD)
    : (isEstimatedShooter(player, simEra) ? ERA_MOD_FORWARD_EST_SHOOTER : ERA_MOD_FORWARD)
  let mod = table[Math.min(dist, table.length - 1)]
  // Extra penalty for modern players (10s/20s) in the 50s/60s — style gap is too severe
  // for the normal backward table to capture (no 3PT, physical defense, different spacing).
  const modernInOldEra: Partial<Record<string, Partial<Record<string, number>>>> = {
    '20s': { '50s': 0.12, '60s': 0.09 },
    '10s': { '50s': 0.11, '60s': 0.08 },
  }
  const extraPenalty = modernInOldEra[player.era]?.[simEra] ?? 0
  mod = Math.max(mod - extraPenalty, 0.50)

  // Extra penalty for pre-3pt era players (50s/60s/70s) in eras where 3PT matters.
  // Estimated shooters (high-TS guards who'd adapt) are exempt from this penalty.
  if (PRE_THREE_PT_ERAS.includes(player.era) && !isEstimatedShooter(player, simEra)) {
    const fg3 = player.FG3_PCT ?? 0
    if (fg3 < 0.2) {
      if (THREE_PT_ERAS.includes(simEra) || simEra === '00s') mod -= 0.10
      else if (simEra === '90s') mod -= 0.05
    }
  }
  return Math.max(mod, 0.50)
}

export function calcPlayerAdjustedRating(
  player: Player,
  slot: SlotPosition,
  simEra: Era
): { base: number; adjusted: number; fitPenalty: 0 | 0.10 | 0.25; eraMod: number; fitLabel: CourtSlot['fitLabel'] } {
  const base = playerBaseRating(player, simEra)
  const { penalty, label } = calcFitPenalty(player, slot)
  const eraMod = calcEraModifier(player, simEra)
  const adjusted = base * (1 - penalty) * eraMod
  return { base, adjusted, fitPenalty: penalty, eraMod, fitLabel: label }
}

export function gradeFromPct(pct: number, thresholds: [number, number, number, number]): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (pct >= thresholds[0]) return 'A'
  if (pct >= thresholds[1]) return 'B'
  if (pct >= thresholds[2]) return 'C'
  if (pct >= thresholds[3]) return 'D'
  return 'F'
}

export function coachOffGrade(coach: Coach): 'A' | 'B' | 'C' | 'D' | 'F' {
  return gradeFromPct(coach.regWLPct, [0.600, 0.550, 0.500, 0.450])
}

export function coachDefGrade(coach: Coach): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (coach.playoffG === 0) return 'C'
  return gradeFromPct(coach.playoffWLPct, [0.550, 0.500, 0.450, 0.400])
}

export function gradeToNumber(g: 'A' | 'B' | 'C' | 'D' | 'F'): number {
  return { A: 4, B: 3, C: 2, D: 1, F: 0 }[g]
}

export function numberToGrade(n: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (n >= 3.5) return 'A'
  if (n >= 2.5) return 'B'
  if (n >= 1.5) return 'C'
  if (n >= 0.5) return 'D'
  return 'F'
}

export function coachOverallGrade(coach: Coach): 'A' | 'B' | 'C' | 'D' | 'F' {
  return numberToGrade((gradeToNumber(coach.offGrade) + gradeToNumber(coach.defGrade)) / 2)
}

export function coachBonus(grade: 'A' | 'B' | 'C' | 'D' | 'F'): number {
  return { A: 0.05, B: 0.025, C: 0, D: -0.025, F: -0.03 }[grade]
}

export function effectiveCoachBonus(coach: Coach, side: 'off' | 'def'): number {
  if (side === 'off' && coach.offGuru) return 0.06
  if (side === 'def' && coach.defGuru) return 0.06
  return coachBonus(side === 'off' ? coach.offGrade : coach.defGrade)
}

export function coachChampBonus(coach: Coach): number {
  return Math.min(coach.champ, 8) * 0.003
}

const STARTER_SLOTS: SlotPosition[] = ['PG', 'SG', 'SF', 'PF', 'C']
const BENCH_SLOTS: SlotPosition[] = ['B1', 'B2', 'B3', 'B4']

export function calcTeamRating(slots: CourtSlot[], coach: Coach, simEra: Era): {
  teamRating: number
  rawRating: number
  playerRatings: PlayerRating[]
} {
  const playerRatings: PlayerRating[] = []

  let starterSum = 0
  let starterCount = 0
  let benchWeightedSum = 0
  let benchTotalMinutes = 0

  for (const slot of slots) {
    if (!slot.player) continue
    const { base, adjusted, fitPenalty, eraMod, fitLabel } = calcPlayerAdjustedRating(slot.player, slot.position, simEra)
    playerRatings.push({ player: slot.player, slot: slot.position, base, adjusted, fitPenalty, eraMod, fitLabel })

    if (STARTER_SLOTS.includes(slot.position)) {
      starterSum += adjusted
      starterCount++
    } else {
      const mpg = SLOT_MPG[slot.position]
      benchWeightedSum += adjusted * mpg
      benchTotalMinutes += mpg
    }
  }

  const starterAvg = starterCount > 0 ? starterSum / starterCount : 0
  const benchAvg = benchTotalMinutes > 0 ? benchWeightedSum / benchTotalMinutes : 0
  const rawRating = starterAvg * 0.70 + benchAvg * 0.30

  const offBonus = effectiveCoachBonus(coach, 'off')
  const defBonus = effectiveCoachBonus(coach, 'def')
  const champBonus = coachChampBonus(coach)
  const teamRating = rawRating * (1 + (offBonus + defBonus) / 2 + champBonus)

  console.log('[Rating] --- Player breakdown ---')
  for (const pr of playerRatings) {
    const tag = STARTER_SLOTS.includes(pr.slot) ? 'START' : 'BENCH'
    console.log(
      `[Rating] ${tag} ${pr.slot} ${pr.player.full_name} | ` +
      `base=${pr.base.toFixed(1)} × era${(pr.eraMod * 100).toFixed(0)}% × fit${((1 - pr.fitPenalty) * 100).toFixed(0)}% ` +
      `= adjusted=${pr.adjusted.toFixed(1)}`
    )
  }
  console.log(
    `[Rating] starterAvg=${starterAvg.toFixed(1)} (×0.70=${( starterAvg * 0.70).toFixed(1)})  ` +
    `benchAvg=${benchAvg.toFixed(1)} (×0.30=${( benchAvg * 0.30).toFixed(1)})  ` +
    `rawRating=${rawRating.toFixed(1)}`
  )
  console.log(`[Rating] coach ${coach.name}: offBonus=${(offBonus*100).toFixed(0)}% defBonus=${(defBonus*100).toFixed(0)}% → teamRating=${teamRating.toFixed(1)}`)

  return { teamRating, rawRating, playerRatings }
}

function randn(): number {
  // Box-Muller approximation
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Efficiency noise — guarantees at least ±1pp so simulated % never matches the card exactly
function effNoise(sigma: number): number {
  const n = randn() * sigma
  const MIN = 0.020
  return Math.abs(n) < MIN ? (Math.random() < 0.5 ? -MIN : MIN) : n
}

// playerDefFactor: derived from roster STL+BLK — primary driver of opponent scoring
// rebFactor: high REB boosts team scoring (2nd-chance pts) and reduces opp scoring (def boards)
// astFactor: high AST boosts team scoring only (better shot quality)
// coachDefBonus / coachOffBonus: small ±2% nudge on top of player-driven baselines
function generateGameScore(
  expectedTeamScore: number,
  playerDefFactor: number,
  rebFactor: number,
  astFactor: number,
  coachDefBonus: number,
  coachOffBonus: number,
  win: boolean,
  simEra: Era,
  spacingWinFactor: number = 1.0
): { teamScore: number; oppScore: number } {
  const scoreCap   = ERA_SCORE_CAP[simEra]
  const scoreFloor = ERA_SCORE_FLOOR[simEra]
  const oppBase    = ERA_OPP_BASELINE[simEra]

  const rawAdjTeamScore = expectedTeamScore * rebFactor * astFactor * spacingWinFactor * (1 + coachOffBonus * 0.5)
  // Clamp distribution center at (cap - 15) so elite teams still get natural variance
  // instead of piling up at the ceiling every game
  const adjTeamScore = Math.min(rawAdjTeamScore, scoreCap - 15)
  let teamScore = Math.round(Math.min(scoreCap, Math.max(scoreFloor, adjTeamScore + randn() * 10)))

  // rebFactor inverted at half weight for defensive rebound effect on opp possessions
  const rebDefEffect = 1.0 + (1.0 - rebFactor) * 0.5
  const oppBaseline = oppBase * playerDefFactor * rebDefEffect * (1 - coachDefBonus * 0.5)
  let oppScore = Math.round(Math.min(scoreCap - 5, Math.max(scoreFloor - 4, oppBaseline + randn() * 10)))

  if (win && teamScore <= oppScore) {
    teamScore = oppScore + 2 + Math.round(Math.abs(randn()) * 7)
  } else if (!win && oppScore <= teamScore) {
    oppScore = teamScore + 2 + Math.round(Math.abs(randn()) * 8)
  }

  let ts = Math.min(scoreCap, teamScore)
  // Don't re-cap corrected oppScore — avoids the cap-tie-break → identical-loss-score loop
  let os = win ? Math.min(scoreCap, oppScore) : oppScore
  if (ts === os) { if (win) ts += 1; else os += 1 }
  return { teamScore: ts, oppScore: os }
}

// League-average indices for normalisation (calibrated to typical 9-man roster)
const LEAGUE_AVG_DEF_INDEX = 8.0
const LEAGUE_AVG_AST_INDEX = 22

// Era-specific rebounding baselines — earlier eras had lower FG% (more misses = more boards).
// Guards (PG/SG) are now neutral by default — only their excess above average counts —
// so baselines are reduced ~4 pts vs the raw weighted sum to compensate.
const ERA_LEAGUE_AVG_REB: Record<Era, number> = {
  '50s': 52, '60s': 47, '70s': 42, '80s': 40, '90s': 38, '00s': 36, '10s': 34, '20s': 34,
}
// Fixed guard baselines (post-rebSlotMod). Average guards score exactly at these thresholds → neutral.
// Only guards who rebound well above their position average (Westbrook, Oscar, Magic) add anything.
const PG_REB_THRESHOLD = 2.0
const SG_REB_THRESHOLD = 2.5

// Guards rarely protect the rim regardless of their natural BLK rate
function blkSlotMod(slot: string): number {
  if (slot === 'PG') return 0.40
  if (slot === 'SG') return 0.50
  if (slot === 'SF') return 0.80
  return 1.0  // PF, C, B1-B4 (bench already discounted by minScale)
}

// Guards/wings playing out of position contribute less to rebounding than bigs
function rebSlotMod(slot: string): number {
  if (slot === 'PG') return 0.40
  if (slot === 'SG') return 0.55
  if (slot === 'SF') return 0.85
  return 1.0  // PF, C, B1-B4
}

// C and PF necessity: a guard at C with 0.5 BPG can't be offset by bench shotblockers
function calcBlkScore(entries: { pr: PlayerRating; minScale: number }[]): number {
  const raw = entries.reduce((s, { pr, minScale }) => s + imputeBLK(pr.player) * pr.eraMod * minScale * blkSlotMod(pr.slot), 0)
  const slotPenalty = (['C', 'PF'] as SlotPosition[]).reduce((pen, slot) => {
    const entry = entries.find(ent => ent.pr.slot === slot)
    if (!entry) return pen
    const expected = slot === 'C' ? 1.2 : 0.6
    const contrib = imputeBLK(entry.pr.player) * entry.pr.eraMod * entry.minScale
    return pen + Math.max(0, expected - contrib) * 0.7
  }, 0)
  return Math.max(0, raw - slotPenalty)
}

function calcPlayerDefFactor(entries: { pr: PlayerRating; minScale: number }[], simEra: Era): number {
  // Perimeter defense: STL-based, normalized ±6%
  const stlIndex  = entries.reduce((s, { pr, minScale }) => s + imputeSTL(pr.player) * pr.eraMod * minScale, 0)
  const stlFactor = Math.max(0.94, Math.min(1.06, 1.0 + (LEAGUE_AVG_DEF_INDEX - stlIndex) / LEAGUE_AVG_DEF_INDEX * 0.06))

  // Rim protection: BLK-based, slot-discounted, with C/PF necessity penalty
  // Pre-3pt eras: blocks were barely tracked and less strategically central — reduce weight
  const isPreThreePt = simEra === '50s' || simEra === '60s' || simEra === '70s'
  const blkScore    = calcBlkScore(entries)
  const BLK_BASELINE = 3.5
  const blkShortfall = BLK_BASELINE - blkScore  // positive = below average = bad defense
  const blkEraScale  = isPreThreePt ? 0.6 : 1.0
  const blkRate      = (blkShortfall > 0 ? 0.035 : 0.015) * blkEraScale
  const rimFactor    = Math.max(0.86, Math.min(1.08, 1.0 + blkShortfall * blkRate))

  // Defensive anchors reduce opponent scoring directly (T1: -2.5%, T2: -1.5%, weighted by minutes)
  const anchorAdj = entries.reduce((s, { pr, minScale }) => {
    if (!pr.player.defAnchor) return s
    return s + ((pr.player.anchorTier ?? 1) === 1 ? 0.025 : 0.015) * minScale
  }, 0)
  return Math.max(0.82, Math.min(1.15, stlFactor * rimFactor * (1 - anchorAdj)))
}

// High REB → more team possessions (+score) and fewer opp second chances (−opp score)
export function calcRebFactor(entries: { pr: PlayerRating; minScale: number }[], simEra: Era): number {
  const leagueAvg = ERA_LEAGUE_AVG_REB[simEra]
  const eraScale  = leagueAvg / ERA_LEAGUE_AVG_REB['20s']  // scale C/PF expectations relative to modern
  const rebIndex  = entries.reduce((s, { pr, minScale }) => {
    const gcMult = pr.player.glassClean ? 1.50 : 1.0
    const contrib = (pr.player.REB ?? 0) * pr.eraMod * minScale * rebSlotMod(pr.slot) * gcMult
    // Guards are neutral by default — only surplus above positional average contributes
    if (pr.slot === 'PG') return s + Math.max(0, contrib - PG_REB_THRESHOLD)
    if (pr.slot === 'SG') return s + Math.max(0, contrib - SG_REB_THRESHOLD)
    return s + contrib
  }, 0)
  // C and PF necessity: weak rebounders at key slots can't be offset by perimeter boards.
  // Slot expectations scale with era — a 10 RPG center is fine in the 20s but below par in the 60s.
  const slotPenalty = (['C', 'PF'] as SlotPosition[]).reduce((pen, slot) => {
    const entry = entries.find(ent => ent.pr.slot === slot)
    if (!entry) return pen
    const expected = (slot === 'C' ? 7.5 : 5.5) * eraScale
    const contrib = (entry.pr.player.REB ?? 0) * entry.pr.eraMod * entry.minScale
    return pen + Math.max(0, expected - contrib)
  }, 0)
  const raw = 1.0 + (rebIndex - slotPenalty - leagueAvg) / leagueAvg * 0.15
  return Math.max(0.91, Math.min(1.09, raw))
}

// Per-slot spacing weight: guards are primary spacers, C matters less and only in modern eras
function spacingSlotWeight(slot: SlotPosition, simEra: Era): number {
  if (slot === 'PG' || slot === 'SG') return 1.20
  if (slot === 'SF') return 1.15
  if (slot === 'PF') return 0.90
  if (slot === 'C') return (simEra === '20s' || simEra === '10s') ? 0.75 : 0.50
  return 0.90  // B1–B4
}

// High AST → better shot quality → scoring efficiency boost (offense only)
function calcAstFactor(entries: { pr: PlayerRating; minScale: number }[]): number {
  const astIndex = entries.reduce((s, { pr, minScale }) =>
    s + (pr.player.AST ?? 0) * pr.eraMod * minScale, 0)
  const raw = 1.0 + (astIndex - LEAGUE_AVG_AST_INDEX) / LEAGUE_AVG_AST_INDEX * 0.10
  return Math.max(0.90, Math.min(1.15, raw))
}


export function simulateSeason(
  rawRating: number,
  playerRatings: PlayerRating[],
  coachDefGrade: 'A' | 'B' | 'C' | 'D' | 'F',
  coachOffGrade: 'A' | 'B' | 'C' | 'D' | 'F',
  simEra: Era,
  coachDefBonus?: number,
  coachOffBonus?: number,
  difficultyMod?: number,
): { wins: number; losses: number; games: boolean[]; seasonStats: PlayerSeasonStats[]; avgTeamScore: number; avgOppScore: number; teamAnalysis: { spacingWinFactor: number; shooterCount: number; spacingBaseline: number; isPreThreePt: boolean; highVolumeShooterCount: number; rebFactor: number; blkScore: number; astFactor: number } } {
  const games: boolean[] = []
  let wins = 0
  let totalTeamScore = 0
  let totalOppScore = 0

  const eraDifficulty = ERA_DIFFICULTY[simEra] ?? 1.00
  const OPP_BASELINE = 43 * eraDifficulty * (difficultyMod ?? 1.0)
  const OPP_SPREAD   = 6
  const GAME_NOISE   = 6

  // Per-player entries with minutes info (no stat accumulation needed)
  const entries = playerRatings.map(pr => {
    const isStarter  = STARTER_SLOTS.includes(pr.slot)
    const assignedMPG = SLOT_MPG[pr.slot]
    const minScale    = assignedMPG / (isStarter ? STARTER_BASELINE_MPG : BENCH_BASELINE_MPG)
    return { pr, assignedMPG, minScale }
  })

  // Pre-generate per-player efficiency components so scoring and displayed stats stay in sync
  const preEff = entries.map(({ pr, assignedMPG }) => {
    const naturalMPG     = Math.min(38, Math.max(10, (pr.player.PTS ?? 0) * 1.6))
    const stretchMax     = Math.max(0, (assignedMPG - naturalMPG) / 28) * 0.06
    const stretch        = stretchMax > 0 ? -(stretchMax * Math.random()) : 0
    return { fg: effNoise(0.035), ft: effNoise(0.030), fg3: effNoise(0.030), stretch }
  })
  // Weighted average FG delta → shifts expectedTeamScore (±3-4 wins impact)
  const totalMinWeight = entries.reduce((s, { minScale }) => s + minScale, 0)
  const avgFGDelta     = entries.reduce((s, { minScale }, i) => s + (preEff[i].fg + preEff[i].stretch) * minScale, 0) / totalMinWeight

  const baseExpectedScore = entries.reduce((s, e) => s + (e.pr.player.PTS ?? 0) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty), 0)
  const expectedTeamScore = Math.max(85, Math.min(132, baseExpectedScore * (1 + avgFGDelta * 3)))
  const playerDefFactor = calcPlayerDefFactor(entries, simEra)
  const rebFactor = calcRebFactor(entries, simEra)
  const astFactor = calcAstFactor(entries)
  const defBonus = coachDefBonus ?? coachBonus(coachDefGrade)
  const offBonus = coachOffBonus ?? coachBonus(coachOffGrade)

  // Blend reb/ast/spacing into win probability at half their score-gen weight
  const rebWinFactor     = 1.0 + (rebFactor - 1.0) * 0.5                                          // ±3% on team roll
  const astWinFactor     = 1.0 + (astFactor - 1.0) * 0.5                                          // ±2.5% on team roll
  const rebOppFactor     = 1.0 - (rebFactor - 1.0) * 0.25                                         // ±2.25% on opp roll (def boards)
  // Tiered: 40%+ = elite (1.25×), 37–40% = good (1.12×), 34–37% = solid (1.0×), below 34% = 0
  const shooterCount           = entries.reduce((s, e) => { const w = spacingSlotWeight(e.pr.slot, simEra); const f = e.pr.player.FG3_PCT ?? 0; const fg3m = e.pr.player.FG3M ?? 0; if (fg3m < 0.5) return s; const ssm = e.pr.player.shootingStar ? (e.pr.player.shootingStarTier === 1 ? 2.2 : 1.6) : 1.35; return s + (f >= 0.40 ? e.minScale * 1.25 : f >= 0.37 ? e.minScale * 1.12 : f >= 0.34 ? e.minScale : f >= 0.30 ? e.minScale * 0.5 : f >= 0.25 ? e.minScale * 0.25 : 0) * w * ssm }, 0)
  const highVolumeShooterCount = entries.reduce((s, e) => { const w = spacingSlotWeight(e.pr.slot, simEra); return s + ((e.pr.player.FG3M ?? 0) >= 2.9 ? e.minScale * w : 0) }, 0)
  const isPreThreePt      = simEra === '50s' || simEra === '60s' || simEra === '70s'
  const spacingBaseline   = simEra === '20s' ? 6 : simEra === '10s' ? 5 : simEra === '00s' ? 4 : simEra === '90s' ? 3 : simEra === '80s' ? 2 : 0
  // Pre-3PT eras: high-volume shooters hurt (anachronistic). Modern eras: below baseline hurts more than above helps.
  const spacingDev        = isPreThreePt ? -highVolumeShooterCount : shooterCount - spacingBaseline
  const spacingPerShooter = spacingDev < 0
    ? (isPreThreePt ? 0.035 : simEra === '20s' || simEra === '10s' ? 0.050 : simEra === '00s' ? 0.050 : simEra === '90s' ? 0.035 : 0.015)
    : (simEra === '20s' || simEra === '10s' ? 0.022 : simEra === '00s' ? 0.014 : 0.009)
  const spacingCapNeg     = isPreThreePt ? 0.15 : simEra === '20s' ? 0.25 : simEra === '10s' ? 0.20 : simEra === '00s' ? 0.14 : simEra === '90s' ? 0.10 : 0.06
  const spacingCapPos     = simEra === '20s' ? 0.20 : simEra === '10s' ? 0.16 : simEra === '00s' ? 0.12 : simEra === '90s' ? 0.08 : 0.06
  const spacingWinFactor  = Math.max(1 - spacingCapNeg, Math.min(1 + spacingCapPos, 1.0 + spacingDev * spacingPerShooter))

  // Scoring win factor: ties win probability to offensive output vs era baseline.
  // Mainly lifts out-of-era teams whose scoring exceeds what their raw rating predicts
  // (e.g. modern stars in the 50s score 114 PPG but were going .500 on rating alone).
  // Blended at 25% so it nudges without dominating the rating-based signal.
  const eraOppAvg        = ERA_OPP_BASELINE[simEra]
  const expectedOppScore = eraOppAvg * playerDefFactor * (1 - defBonus * 0.5)
  const scoringDiffRatio = expectedTeamScore / Math.max(1, expectedOppScore)
  const scoringWinFactor = Math.max(0.93, Math.min(1.07, 1.0 + (scoringDiffRatio - 1.0) * 0.25)) // ±7% cap

  const seasonGames = ERA_SEASON_GAMES[simEra]

  for (let i = 0; i < seasonGames; i++) {
    const oppBase   = OPP_BASELINE * playerDefFactor * (1 - defBonus)
    const oppRating = oppBase + randn() * OPP_SPREAD
    const teamRoll  = rawRating * (1 + offBonus) * rebWinFactor * astWinFactor * spacingWinFactor * scoringWinFactor + randn() * GAME_NOISE
    const oppRoll   = oppRating * rebOppFactor + randn() * GAME_NOISE
    const win       = teamRoll > oppRoll
    games.push(win)
    if (win) wins++
    const { teamScore, oppScore } = generateGameScore(expectedTeamScore, playerDefFactor, rebFactor, astFactor, defBonus, offBonus, win, simEra, spacingWinFactor)
    totalTeamScore += teamScore
    totalOppScore += oppScore
  }

  const avgTeamScore = totalTeamScore / seasonGames
  const avgOppScore = totalOppScore / seasonGames

  // Weights: era_stat × eraMod × minScale × fitPenalty — proportional share per player
  const weights = entries.map(({ pr, minScale }) => {
    const p = pr.player
    const s = pr.eraMod * minScale * (1 - pr.fitPenalty)
    return {
      PTS: (p.PTS ?? 0) * s,
      REB: (p.REB ?? 0) * s,
      AST: (p.AST ?? 0) * s,
      STL: imputeSTL(p) * s,
      BLK: imputeBLK(p) * s,
      TOV: imputeTOV(p) * s,
    }
  })

  const totalPTSWeight = weights.reduce((s, w) => s + w.PTS, 0)

  // Per-player season variance (±15%) — makes each run look different
  const seasonVar = entries.map(() => 0.85 + Math.random() * 0.30)
  // Re-normalize so PTS shares still sum correctly after variance
  const varPTSWeights = weights.map((w, i) => w.PTS * seasonVar[i])
  const totalVarPTS = varPTSWeights.reduce((a, b) => a + b, 0)

  // ── Team context efficiency modifiers ──────────────────────────────────
  const spacingMod    = spacingDev * spacingPerShooter  // used for win factor only — excluded from displayed FG% (spacing already penalizes PPG via generateGameScore)
  // Playmaking: top AST on team lifts shot quality for everyone
  const topAST        = Math.max(...entries.map(e => e.pr.player.AST ?? 0))
  const playmakingMod = Math.min(0.018, Math.max(-0.012, (topAST - 5) * 0.003))
  // Team quality: stronger teams create slightly better shots (neutral at rawRating ~40)
  const teamQualityMod = (rawRating - 70) * 0.0008

  const seasonStats: PlayerSeasonStats[] = entries.map(({ pr, assignedMPG }, i) => {
    const w = weights[i]
    const v = seasonVar[i]
    // FG% includes a muted spacing signal (×0.25) so poor spacing shows in the stat sheet;
    // floored at −0.05 so stacked negatives (spacing + teamQuality + noise) can't crater a player's line
    const rawFgCtx = spacingMod * 0.25 + playmakingMod + teamQualityMod + preEff[i].fg + preEff[i].stretch
    const fgCtx  = Math.max(-0.05, rawFgCtx)
    const fg3Ctx = playmakingMod + teamQualityMod + preEff[i].stretch
    const ftCtx  = preEff[i].ft + preEff[i].stretch * 0.4
    return {
      player:  pr.player,
      slot:    pr.slot,
      GP:      seasonGames,
      MPG:     assignedMPG,
      PTS:     totalVarPTS > 0 ? (varPTSWeights[i] / totalVarPTS) * avgTeamScore : 0,
      REB:     w.REB * v * rebSlotMod(pr.slot),
      AST:     w.AST * v,
      STL:     w.STL * v,
      BLK:     w.BLK * v * blkSlotMod(pr.slot),
      TOV:     w.TOV * v,
      FG_PCT:  Math.min(0.80, Math.max(0.20, (pr.player.FG_PCT ?? 0.45) + fgCtx)),
      FG3_PCT: PRE_THREE_PT_ERAS.includes(simEra) ? null
        : pr.player.FG3_PCT != null
          ? Math.min(0.60, Math.max(0.20, pr.player.FG3_PCT + fg3Ctx + preEff[i].fg3))
          : (() => { const b = getEstimatedFG3PCT(pr.player, simEra); return b != null ? Math.min(0.55, Math.max(0.18, b + fg3Ctx + preEff[i].fg3)) : null })(),
      FT_PCT:  Math.min(0.99, Math.max(0.30, (pr.player.FT_PCT ?? 0.70) + ftCtx)),
    }
  })

  const blkScore = calcBlkScore(entries)
  return {
    wins, losses: seasonGames - wins, games, seasonStats, avgTeamScore, avgOppScore,
    teamAnalysis: { spacingWinFactor, shooterCount, spacingBaseline, isPreThreePt, highVolumeShooterCount, rebFactor, blkScore, astFactor },
  }
}

export const ALL_ERAS: Era[] = ['50s', '60s', '70s', '80s', '90s', '00s', '10s', '20s']

export const SLOT_POSITIONS: SlotPosition[] = ['PG', 'SG', 'SF', 'PF', 'C', 'B1', 'B2', 'B3', 'B4']

const PLAYOFF_ROUND_NAMES = ['First Round', 'Semifinals', 'Conference Finals', 'NBA Finals']

export function firstRoundWinsNeeded(simEra: Era): number {
  if (['50s', '60s', '70s'].includes(simEra)) return 2  // Best of 3
  if (['80s', '90s'].includes(simEra))        return 3  // Best of 5
  return 4                                               // Best of 7
}

export function firstRoundLabel(simEra: Era): string {
  const w = firstRoundWinsNeeded(simEra)
  return w === 2 ? 'Best of 3' : w === 3 ? 'Best of 5' : 'Best of 7'
}

// Opponent profile per round based on team's regular season wins.
// offRating: raw opponent strength (then scaled by user's playerDefFactor)
// defFactor: how well the opponent defends — multiplied against effectiveTeamRating each round
// Finals (round 4): scales with team's raw rating so stronger teams face proportionally harder opponents.
function playoffOppRating(round: number, teamWins: number, teamRaw: number, simEra: Era, difficultyMod = 1.0): { offRating: number; defFactor: number } {
  const idx = round - 1
  const winsBase = teamWins >= 60 ? [45, 49, 53, 52][idx]
                 : teamWins >= 53 ? [46, 50, 53, 53][idx]
                 : teamWins >= 47 ? [48, 51, 53, 53][idx]
                 :                  [50, 52, 53, 55][idx]
  // Finals opponent scales with team strength — slightly weaker than user's raw rating
  const baseRating = round === 4 ? Math.max(winsBase, Math.round(teamRaw * 0.88)) : winsBase
  const eraDifficulty = ERA_DIFFICULTY[simEra] ?? 1.00
  const offRating = Math.round(baseRating * eraDifficulty * difficultyMod)
  // Later rounds face better defenses — mild progressive reduction to team's effective rating
  const defFactor = [1.00, 0.97, 0.94, 0.89][idx]
  return { offRating, defFactor }
}

export function simulatePlayoffs(
  rawRating: number,
  playerRatings: PlayerRating[],
  regularSeasonWins: number,
  coachDefGrade: 'A' | 'B' | 'C' | 'D' | 'F',
  coachOffGrade: 'A' | 'B' | 'C' | 'D' | 'F',
  simEra: Era,
  coachDefBonus?: number,
  coachOffBonus?: number,
  difficultyMod?: number,
): PlayoffResult {
  const OPP_SPREAD = 3
  const GAME_NOISE = 5

  const entries = playerRatings.map(pr => {
    const isStarter  = STARTER_SLOTS.includes(pr.slot)
    const assignedMPG = SLOT_MPG[pr.slot]
    const minScale    = assignedMPG / (isStarter ? STARTER_BASELINE_MPG : BENCH_BASELINE_MPG)
    return { pr, assignedMPG, minScale }
  })

  const playerDefFactor = calcPlayerDefFactor(entries, simEra)
  const rebFactor = calcRebFactor(entries, simEra)
  const astFactor = calcAstFactor(entries)
  const defBonus = coachDefBonus ?? coachBonus(coachDefGrade)
  const offBonus = coachOffBonus ?? coachBonus(coachOffGrade)

  const rebWinFactor     = 1.0 + (rebFactor - 1.0) * 0.5
  const astWinFactor     = 1.0 + (astFactor - 1.0) * 0.5
  const rebOppFactor     = 1.0 - (rebFactor - 1.0) * 0.25
  const shooterCount             = entries.reduce((s, e) => { const w = spacingSlotWeight(e.pr.slot, simEra); const f = e.pr.player.FG3_PCT ?? 0; const fg3m = e.pr.player.FG3M ?? 0; if (fg3m < 0.5) return s; const ssm = e.pr.player.shootingStar ? (e.pr.player.shootingStarTier === 1 ? 2.2 : 1.6) : 1.0; return s + (f >= 0.40 ? e.minScale * 1.25 : f >= 0.37 ? e.minScale * 1.12 : f >= 0.34 ? e.minScale : f >= 0.30 ? e.minScale * 0.5 : f >= 0.25 ? e.minScale * 0.25 : 0) * w * ssm }, 0)
  const highVolumeShooterCountPO = entries.reduce((s, e) => { const w = spacingSlotWeight(e.pr.slot, simEra); return s + ((e.pr.player.FG3M ?? 0) >= 2.9 ? e.minScale * w : 0) }, 0)
  const isPreThreePtPO      = simEra === '50s' || simEra === '60s' || simEra === '70s'
  const spacingBaselinePO   = simEra === '20s' ? 6 : simEra === '10s' ? 5 : simEra === '00s' ? 4 : simEra === '90s' ? 3 : simEra === '80s' ? 2 : 0
  const spacingDevPO        = isPreThreePtPO ? -highVolumeShooterCountPO : shooterCount - spacingBaselinePO
  const spacingPerShooterPO = spacingDevPO < 0
    ? (isPreThreePtPO ? 0.035 : simEra === '20s' || simEra === '10s' ? 0.050 : simEra === '00s' ? 0.050 : simEra === '90s' ? 0.035 : 0.015)
    : (simEra === '20s' || simEra === '10s' ? 0.022 : simEra === '00s' ? 0.014 : 0.009)
  const spacingCapNegPO     = isPreThreePtPO ? 0.15 : simEra === '20s' ? 0.25 : simEra === '10s' ? 0.20 : simEra === '00s' ? 0.14 : simEra === '90s' ? 0.10 : 0.06
  const spacingCapPosPO     = simEra === '20s' ? 0.20 : simEra === '10s' ? 0.16 : simEra === '00s' ? 0.12 : simEra === '90s' ? 0.08 : 0.06
  const spacingWinFactor    = Math.max(1 - spacingCapNegPO, Math.min(1 + spacingCapPosPO, 1.0 + spacingDevPO * spacingPerShooterPO))

  // Ring-boosted effective team rating for playoff win determination
  const totalAdjusted = entries.reduce((s, e) => s + e.pr.adjusted, 0)
  const avgRingBoost = totalAdjusted > 0
    ? entries.reduce((s, e) => s + playoffRingBoost(e.pr.player.rings ?? 0) * e.pr.adjusted / totalAdjusted, 0)
    : 0
  const effectiveRawRating = rawRating * (1 + avgRingBoost)

  // Ring boost also raises the score ceiling so champions actually put up bigger numbers
  const baseTeamScore = entries.reduce((s, e) => s + (e.pr.player.PTS ?? 0) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty), 0)
  const expectedTeamScore = Math.max(85, Math.min(138, baseTeamScore * (1 + avgRingBoost)))

  // Scoring win factor — same logic as regular season (see simulateSeason)
  const poEraOppAvg        = ERA_OPP_BASELINE[simEra]
  const poExpectedOppScore = poEraOppAvg * playerDefFactor * (1 - defBonus * 0.5)
  const poScoringDiffRatio = expectedTeamScore / Math.max(1, poExpectedOppScore)
  const poScoringWinFactor = Math.max(0.93, Math.min(1.07, 1.0 + (poScoringDiffRatio - 1.0) * 0.25))

  // Per-player expected averages for game leader generation
  const expPTS = entries.map(e => (e.pr.player.PTS ?? 0) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty) * (1 + playoffRingBoost(e.pr.player.rings ?? 0)))
  const expREB = entries.map(e => (e.pr.player.REB ?? 0) * e.pr.eraMod * e.minScale * rebSlotMod(e.pr.slot) * (1 - e.pr.fitPenalty) * (1 + playoffRingBoost(e.pr.player.rings ?? 0)))
  const expAST = entries.map(e => (e.pr.player.AST ?? 0) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty) * (1 + playoffRingBoost(e.pr.player.rings ?? 0)))
  const expSTL = entries.map(e => imputeSTL(e.pr.player) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty))
  const expBLK = entries.map(e => imputeBLK(e.pr.player) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty) * blkSlotMod(e.pr.slot))
  const expTOV = entries.map(e => imputeTOV(e.pr.player) * e.pr.eraMod * e.minScale * (1 - e.pr.fitPenalty))
  const baseFG  = entries.map(e => Math.min(0.75, Math.max(0.25, (e.pr.player.FG_PCT ?? 0.45) * (0.9 + e.pr.eraMod * 0.1))))
  const baseFG3 = entries.map(e => PRE_THREE_PT_ERAS.includes(simEra) ? null : e.pr.player.FG3_PCT ?? getEstimatedFG3PCT(e.pr.player, simEra))
  const baseFT  = entries.map(e => Math.min(0.95, Math.max(0.35, e.pr.player.FT_PCT ?? 0.70)))
  const totalExpPTS = expPTS.reduce((a, b) => a + b, 0)

  // Accumulators — filled per-game from actual generated lines
  const accumPTS = new Array(entries.length).fill(0)
  const accumREB = new Array(entries.length).fill(0)
  const accumAST = new Array(entries.length).fill(0)
  const finalsPTS = new Array(entries.length).fill(0)
  const finalsREB = new Array(entries.length).fill(0)
  const finalsAST = new Array(entries.length).fill(0)
  let finalsGames = 0

  const rounds: PlayoffResult['rounds'] = []
  const allGames: PlayoffGame[] = []
  let champion = false

  for (let r = 0; r < 4; r++) {
    const { offRating: oppMean, defFactor: roundDefFactor } = playoffOppRating(r + 1, regularSeasonWins, rawRating, simEra, difficultyMod ?? 1.0)
    const winsNeeded = r === 0 ? firstRoundWinsNeeded(simEra) : 4
    let sW = 0, sL = 0

    while (sW < winsNeeded && sL < winsNeeded) {
      const gameInSeries = sW + sL + 1

      // Special performance: base 15% + 1% per ring across the roster (cap 25%)
      const totalRings = entries.reduce((s, e) => s + (e.pr.player.rings ?? 0), 0)
      const specialChance = Math.min(0.15 + totalRings * 0.01, 0.25)
      const specialTrigger = Math.random() < specialChance
      const specialBoost = specialTrigger ? 2 + Math.random() * 4 : 0

      const oppRating = oppMean * playerDefFactor * (1 - defBonus) + randn() * OPP_SPREAD
      const win = effectiveRawRating * (1 + offBonus) * roundDefFactor * rebWinFactor * astWinFactor * spacingWinFactor * poScoringWinFactor + specialBoost + randn() * GAME_NOISE > oppRating * rebOppFactor + randn() * GAME_NOISE
      const { teamScore, oppScore } = generateGameScore(expectedTeamScore, playerDefFactor, rebFactor, astFactor, defBonus, offBonus, win, simEra, spacingWinFactor)

      // Per-game individual stat lines (high variance — 60–140% of expected)
      const gamePTS = expPTS.map(e => Math.max(0, e * (0.6 + Math.random() * 0.8)))
      const gameREB = expREB.map(e => Math.min(28, Math.max(0, Math.round(e * (0.6 + Math.random() * 0.8)))))
      const gameAST = expAST.map(e => Math.min(20, Math.max(0, Math.round(e * (0.6 + Math.random() * 0.8)))))
      const gameSTL = expSTL.map(e => +Math.max(0, e * (0.6 + Math.random() * 0.8)).toFixed(1))
      const gameBLK = expBLK.map(e => +Math.max(0, e * (0.6 + Math.random() * 0.8)).toFixed(1))
      const gameTOV = expTOV.map(e => +Math.max(0, e * (0.6 + Math.random() * 0.8)).toFixed(1))
      const lossPenalty = win ? 0 : 0.03
      const gameFG  = baseFG.map(b => +Math.min(0.80, Math.max(0.20, b - lossPenalty + (Math.random() - 0.5) * 0.14)).toFixed(3))
      const gameFG3 = baseFG3.map(b => b == null ? null : +Math.min(0.70, Math.max(0.10, b - lossPenalty + (Math.random() - 0.5) * 0.18)).toFixed(3))
      const gameFT  = baseFT.map(b => +Math.min(0.99, Math.max(0.30, b - (win ? 0 : 0.02) + (Math.random() - 0.5) * 0.12)).toFixed(3))

      // Scale PTS so they sum to teamScore
      const rawPTSTotal = gamePTS.reduce((a, b) => a + b, 0)
      const scaledPTS = gamePTS.map(p => Math.max(0, Math.round(totalExpPTS > 0 ? (p / rawPTSTotal) * teamScore : 0)))

      // Special performance: inflate one player's stats
      let special: SpecialPerformance | undefined
      if (specialTrigger && entries.length > 0) {
        // Pick player weighted by adjusted rating × ring multiplier (champions more likely to star)
        const ringWeights = entries.map(e => e.pr.adjusted * (1 + (e.pr.player.rings ?? 0) * 0.20))
        const totalRingWeighted = ringWeights.reduce((s, w) => s + w, 0)
        let roll = Math.random() * totalRingWeighted
        let starIdx = 0
        for (let i = 0; i < entries.length; i++) {
          roll -= ringWeights[i]
          if (roll <= 0) { starIdx = i; break }
        }
        const boostFactor = 1.6 + Math.random() * 0.9
        scaledPTS[starIdx] = Math.round(scaledPTS[starIdx] * boostFactor)
        gameREB[starIdx] = Math.min(35, Math.round(gameREB[starIdx] * boostFactor))
        gameAST[starIdx] = Math.min(25, Math.round(gameAST[starIdx] * boostFactor))
        // Scale non-star players down to keep total within era score cap
        const capLimit = ERA_SCORE_CAP[simEra]
        const boostedTotal = scaledPTS.reduce((a, b) => a + b, 0)
        if (boostedTotal > capLimit) {
          const excess = boostedTotal - capLimit
          const nonStarTotal = scaledPTS.reduce((s, p, i) => i === starIdx ? s : s + p, 0)
          if (nonStarTotal > 0) {
            scaledPTS.forEach((_, i) => {
              if (i !== starIdx) scaledPTS[i] = Math.max(0, Math.round(scaledPTS[i] - excess * (scaledPTS[i] / nonStarTotal)))
            })
          }
        }
        const sp = scaledPTS[starIdx], sr = gameREB[starIdx], sa = gameAST[starIdx]
        const isBench = entries[starIdx].pr.slot.startsWith('B')
        // 20-25 pts on a starter is within normal range — not a special performance
        if (sp <= 25 && !isBench && sr < 10 && sa < 10) {
          // suppress — leave boosted stats but don't flag as special
        } else {
          const label =
            sp >= 45                           ? `${sp}-point scoring eruption` :
            sp >= 10 && sr >= 10 && sa >= 10   ? `Triple-double: ${sp}/${sr}/${sa}` :
            sp >= 35                           ? `${sp}-point scoring takeover` :
            sr >= 18                           ? `${sp}pts/${sr}reb dominant` :
            sa >= 14                           ? `${sp}pts/${sa}ast playmaking` :
            isBench                            ? `${sp}-point showcase off the bench` :
                                                 `${sp}-point showcase`
          const starName = entries[starIdx].pr.player.full_name.split(' ').slice(-1)[0]
          special = { playerName: starName, pts: sp, reb: sr, ast: sa, label }
        }
      }

      // Identify leaders
      const maxPTS = Math.max(...scaledPTS)
      const maxREB = Math.max(...gameREB)
      const maxAST = Math.max(...gameAST)
      const ptsIdx = scaledPTS.indexOf(maxPTS)
      const rebIdx = gameREB.indexOf(maxREB)
      const astIdx = gameAST.indexOf(maxAST)
      const lastName = (i: number) => entries[i].pr.player.full_name.split(' ').slice(-1)[0]
      const leaders = {
        pts: { name: lastName(ptsIdx), val: maxPTS },
        reb: { name: lastName(rebIdx), val: maxREB },
        ast: { name: lastName(astIdx), val: maxAST },
      }

      for (let i = 0; i < entries.length; i++) {
        accumPTS[i] += scaledPTS[i]
        accumREB[i] += gameREB[i]
        accumAST[i] += gameAST[i]
        if (r === 3) {
          finalsPTS[i] += scaledPTS[i]
          finalsREB[i] += gameREB[i]
          finalsAST[i] += gameAST[i]
        }
      }
      if (r === 3) finalsGames++

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
        ft: gameFT[i],
      }))
      const displayTeamScore = scaledPTS.reduce((a, b) => a + b, 0)
      const displayOppScore = (!win && oppScore <= displayTeamScore) ? displayTeamScore + 2 + Math.round(Math.abs(randn()) * 5) : oppScore
      if (win) sW++; else sL++
      allGames.push({ win, roundIndex: r, teamScore: displayTeamScore, oppScore: displayOppScore, gameInSeries, leaders, special, playerLines })
    }

    const advanced = sW === winsNeeded
    rounds.push({ name: PLAYOFF_ROUND_NAMES[r], seriesWins: sW, seriesLosses: sL, advanced, winsNeeded })
    if (!advanced) break
    if (r === 3) champion = true
  }

  const numGames = allGames.length
  const avgPlayoffTeamScore = numGames > 0
    ? allGames.reduce((s, g) => s + g.teamScore, 0) / numGames
    : 0

  // STL/BLK/TOV still from weights (not tracked per-game)
  const stlBlkTov = entries.map(({ pr, minScale }) => {
    const s = pr.eraMod * minScale * (1 - pr.fitPenalty)
    return { STL: imputeSTL(pr.player) * s, BLK: imputeBLK(pr.player) * s * blkSlotMod(pr.slot), TOV: imputeTOV(pr.player) * s }
  })

  // ── Team context for playoff efficiency ──────────────────────────────────
  const pShooterCount  = entries.filter(e => (e.pr.player.FG3_PCT ?? 0) >= 0.36).length
  const pSpacingMod    = (pShooterCount - 2) * 0.006
  const pTopAST        = Math.max(...entries.map(e => e.pr.player.AST ?? 0))
  const pPlaymakingMod = Math.min(0.018, Math.max(-0.012, (pTopAST - 5) * 0.003))
  const pTeamQualityMod = (rawRating - 40) * 0.0008

  const playoffStats: PlayerSeasonStats[] = entries.map(({ pr, assignedMPG }, i) => {
    const effBoost       = playoffRingBoost(pr.player.rings ?? 0) * 0.5
    const naturalMPG     = Math.min(38, Math.max(10, (pr.player.PTS ?? 0) * 1.6))
    const stretchMax     = Math.max(0, (assignedMPG - naturalMPG) / 28) * 0.06
    const stretchPenalty = stretchMax > 0 ? -(stretchMax * Math.random()) : 0
    const fgCtx  = pSpacingMod + pPlaymakingMod + pTeamQualityMod + stretchPenalty
    const fg3Ctx = pPlaymakingMod + pTeamQualityMod + stretchPenalty
    const ftCtx  = stretchPenalty * 0.4
    return {
      player:  pr.player,
      slot:    pr.slot,
      GP:      numGames,
      MPG:     assignedMPG,
      PTS:     numGames > 0 ? accumPTS[i] / numGames : 0,
      REB:     numGames > 0 ? accumREB[i] / numGames : 0,
      AST:     numGames > 0 ? accumAST[i] / numGames : 0,
      STL:     stlBlkTov[i].STL,
      BLK:     stlBlkTov[i].BLK,
      TOV:     stlBlkTov[i].TOV,
      FG_PCT:  Math.min(0.80, Math.max(0.20, (pr.player.FG_PCT ?? 0.45) + effBoost + fgCtx + effNoise(0.035))),
      FG3_PCT: PRE_THREE_PT_ERAS.includes(simEra) ? null
        : pr.player.FG3_PCT != null
          ? Math.min(0.60, Math.max(0.20, pr.player.FG3_PCT + effBoost + fg3Ctx + effNoise(0.030)))
          : (() => { const b = getEstimatedFG3PCT(pr.player, simEra); return b != null ? Math.min(0.55, Math.max(0.18, b + effBoost + fg3Ctx + effNoise(0.030))) : null })(),
      FT_PCT:  Math.min(0.99, Math.max(0.30, (pr.player.FT_PCT ?? 0.70) + effBoost + ftCtx + effNoise(0.035))),
    }
  })

  const finalsStats: PlayerSeasonStats[] = entries.map(({ pr, assignedMPG }, i) => {
    const effBoost       = playoffRingBoost(pr.player.rings ?? 0) * 0.5
    const naturalMPG     = Math.min(38, Math.max(10, (pr.player.PTS ?? 0) * 1.6))
    const stretchMax     = Math.max(0, (assignedMPG - naturalMPG) / 28) * 0.06
    const stretchPenalty = stretchMax > 0 ? -(stretchMax * Math.random()) : 0
    const fgCtx  = pSpacingMod + pPlaymakingMod + pTeamQualityMod + stretchPenalty
    const ftCtx  = stretchPenalty * 0.4
    return {
      player:  pr.player,
      slot:    pr.slot,
      GP:      finalsGames,
      MPG:     assignedMPG,
      PTS:     finalsGames > 0 ? finalsPTS[i] / finalsGames : 0,
      REB:     finalsGames > 0 ? finalsREB[i] / finalsGames : 0,
      AST:     finalsGames > 0 ? finalsAST[i] / finalsGames : 0,
      STL:     stlBlkTov[i].STL,
      BLK:     stlBlkTov[i].BLK,
      TOV:     stlBlkTov[i].TOV,
      FG_PCT:  Math.min(0.80, Math.max(0.20, (pr.player.FG_PCT ?? 0.45) + effBoost + fgCtx + effNoise(0.035))),
      FG3_PCT: PRE_THREE_PT_ERAS.includes(simEra) ? null
        : pr.player.FG3_PCT != null
          ? Math.min(0.60, Math.max(0.15, pr.player.FG3_PCT + effBoost + fgCtx + effNoise(0.030)))
          : (() => { const b = getEstimatedFG3PCT(pr.player, simEra); return b != null ? Math.min(0.55, Math.max(0.15, b + effBoost + fgCtx + effNoise(0.030))) : null })(),
      FT_PCT:  Math.min(0.99, Math.max(0.30, (pr.player.FT_PCT ?? 0.70) + effBoost + ftCtx + effNoise(0.035))),
    }
  })

  return { rounds, champion, allGames, playoffStats, finalsStats }
}
