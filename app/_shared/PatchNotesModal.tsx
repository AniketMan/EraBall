'use client'
// app/_shared/PatchNotesModal.tsx
// Shared modal: the "What's New" patch-notes overlay. The latest version renders expanded;
// older versions are collapsible. All version note data lives here as static arrays.

import React, { useState } from 'react'
import { G, BEBAS } from '../../src/components/tokens'

const V1_1_NOTES = [
  { section: 'NEW TAG: Shooting Star', items: [
    'New player tag with two tiers. Multiplies the player\'s contribution to team spacing.',
    'T1: Curry, Klay, Ray Allen, Reggie Miller, Korver, Lillard, Kerr, Bird, Redick.',
    'T2: Peja, Dell Curry, Joe Harris, THJ, Petrovic, Hodges, Glen Rice, MPJ, KAT, Duncan Robinson, Mike Miller, Dirk.',
  ]},
  { section: 'Simulation', items: [
    'Finals opponent difficulty reduced. I went overboard last time.',
    'Specialist shooters like Korver, Miller, Allen etc. now properly reward you for spacing.',
    'Increased difficulty of opponents each round of the playoffs.',
  ]},
  { section: 'Performance', items: [
    'Player headshots now load directly from NBA CDN, bypassing the server proxy. Significantly reduces backend load.',
  ]},
  { section: 'UI', items: [
    'Sandbox: Added an optional spin tab that is in the regular mode. In case you still wanted random players and liked that method.',
    'Footer links stay at the footer of the page. Do not follow your scroll.',
    'Sandbox: added ALL option to team picker. Loads all players from the selected era regardless of team.',
    'Tag effects panel: Shooting Star and Timeless now align side by side.',
  ]},
  { section: 'Compatibility', items: [
    'Supports iOS 13+',
  ]},
]

const V1_NOTES = [
  { section: 'Simulation', items: [
    'Regular season opponent baseline difficulty moderately improved, reflecting the stats of that era. Reducing regular season dominance that\'s not deserved.',
    'Elite Spacing bonus increased. Good to elite spacing was not rewarded enough (depending on the era).',
    'Defensive anchors now have more impact on overall team defense.',
    'Sim opponent defense baseline was reduced. I originally had them set based off era stats without taking into account 9 man rotations.',
  ]},
  { section: 'Era Modifiers', items: [
    'Backward travel reduced to a base 3%/decade. Making modern players going back more impactful. Older players\' larger penalty to modern eras stays the same.',
    '10s → 20s treated as the same modern era. 98% modifier in either direction.',
    'Tall centers and players (~6\'10"+) get reduced backward penalty. 1.5%/decade instead of 3%. Bam Adebayo and others are specific name exceptions.',
  ]},
  { section: 'Draft', items: [
    'Custom era range excluded from lifetime stats. Runs with a locked custom range no longer count toward your lifetime record.',
  ]},
]

const V1_5_NOTES = [
  { section: 'New Mode: Salary Cap', items: [
    'Build a team within tier limits. Draft 2 S – 2 A – 2 B – 2 C – 1 D tier players.',
    'Every spin guarantees at least one player from a tier you still need, but you can pick anyone from the roster. Build around your strengths.',
    'Only C or higher graded coaches.',
  ]},
  { section: 'Leaderboard', items: [
    'Added a leaderboard (no login required) for both game modes and each era.',
    'Once a season is complete you have the option to input a custom Team Name. If the score is high enough it will show on the leaderboard, and players can click on the team to see their roster.',
    'Score is based on Reg Season/Playoff win %, Team rating, Result, coach, and point differential.',
  ]},
  { section: 'Simulation', items: [
    'Less unrealistic stat showings in the playoffs (players sometimes would get 30 rebounds or assists in super rare special performances).',
    'Won\'t see insane 170+ games anymore in the 2020s.',
    'Players like Aaron Gordon, Zach Randolph, and Zion Williamson go back in time with less of an era penalty.',
  ]},
  { section: 'Lifetime Stats', items: [
    'Your simulated lifetime stats are broken up into the 2 game modes now: Normal Draft and Salary Cap draft.',
    'Added more player specific stats: Most Successful Player (Rings), Most benched player.',
  ]},
  { section: 'Achievements', items: [
    'New section on the home screen tracks your achievements. Specific challenges of different rarity. Try to get them all! Will be adding more as time goes on.',
  ]},
  { section: 'Visuals', items: [
    'PLAYOFFS: The playoffs visuals have been overhauled. Less scrolling is needed. You can click through the playoff rounds, and can open box scores for each game.',
    'In the 50s era theme only, the card tiers look different, more readable, and with the tier rank on them as well.',
    'Main Menu: "Begin Draft" → Normal Draft, "Salary Cap" → Salary Cap Draft.',
  ]},
  { section: 'Tags', items: [
    'NEW TAG – GLASS CLEANER: Highlights rebound specialists who were undervalued in the previous system. Gives a boost to the team\'s rebounding impact.',
    'NEW TAG – DYNAMIC DUO: Highlights dynamic duos through NBA history. They get a boost to their base rating (some players have multiple duos, the boosts stack). Getting big threes is a huge boost to some.',
    'Dynamic duos include players like Kobe/Shaq, LeBron/Wade, Bird/McHale, Isiah/Dumars and many more.',
    'Hakeem now correctly shows he has the Champions tag.',
    'Luka, Magic, and Tatum are now FLEX players.',
    'Yao Ming gets a Defensive Anchor T1.',
    'Pistol Pete is now TIMELESS.',
  ]},
  { section: 'Ratings', items: [
    '2010s CHI Derrick Rose gets a slight buff to Gold (A).',
    '2020s OKC Jared McCain gets a slight buff to Sapphire (C).',
  ]},
  { section: 'Positions', items: [
    'Kareem can play PF with no positional penalty (spacing still counts for modern eras, shooting bigs are huge).',
    'Brandon Ingram can play SG/SF/PF with no positional penalty.',
  ]},
  { section: 'Bugs', items: [
    'Stats now add up correctly in the playoffs with special performances.',
    'Fixed support for SEA countries.'
  ]},
  { section: 'Misc', items: [
    'Era themes are now off by default and save your chosen setting locally.',
  ]},
]

const V1_5_8_NOTES = [
  { section: 'Sixth Man', items: [
    'Sixth Man bench boost adjusted to +5 (from +6).',
    'OKC James Harden now carries the Sixth Man tag. Only applies to his Oklahoma City versions.',
  ]},
  { section: 'Drafting', items: [
    'You now get 3 random coaches to choose from and 1 respin.',
  ]},
  { section: 'Lifetime Stats', items: [
    'New stat: Leaderboard Appearances. Tracks how many times each player has appeared in a Top 50, Top 10, Top 3, or #1 leaderboard finish. Visible in the Lifetime Stats modal.',
  ]},
  { section: 'Sandbox', items: [
    'New "Fill Rest with Random" button. Fills all empty slots with random players at the correct position. No position penalty for starters. Appears at the bottom of the sandbox panel on all tabs.',
  ]},
  { section: 'Ratings and Stats', items: [
    'Julius Erving 70s PHL base rating increased to S tier.',
    'Pete Maravich correctly gets an estimated three point % in modern eras. Bug is fixed.',
  ]},
  { section: 'Tags', items: [
    'Steve Kerr moved from Shooting Star T1 → T2.',
    'Kevin Love added as Shooting Star T2.',
  ]},
  { section: 'Dynamic Duos', items: [
    'New duos: Kareem Abdul-Jabbar & Lucius Allen, Bill Russell & Sam Jones, Jack Twyman & Maurice Stokes.',
    'New family trio: Ron Harper, Ron Harper Jr., and Dylan Harper (father/son and brothers).',
  ]},
  { section: 'Positions', items: [
    'Victor Wembanyama and Jerry Lucas locked to PF/C, George Gervin SG/SF',
  ]},
  { section: 'Simulation', items: [
    '80s regular season difficulty increased.',
    '00s regular season difficulty increased.',
  ]},
  { section: 'Salary Cap', items: [
    'You can now always draft a D tier player even if you need one more C slot.'
  ]},
  { section: 'Draft', items: [
    'Save your player draft re-spin and it carries over as an extra re-spin during the coach draft.',
  ]},
  { section: 'Bug Fixes', items: [
    'Players with 0 scoring stats no longer absorb all team points. Scoring is now distributed proportionally across the roster based on minutes for horrible rosters.',
    'Bad teams now have a minimum realistic floor for rebounds and assists per game, scaled by era. Previously, rosters of poor rebounders or non-playmakers could produce impossible team totals.',
    'Supporters Hall of Fame fixed with the new supporters!',
  ]},
  { section: 'Achievements', items: [
    'Added 5 new achievements',
  ]},
]

const V1_5_6_NOTES = [
  { section: 'Dynamic Duos', items: [
    'New father/son duos: Dell Curry & Steph Curry, Dell Curry & Seth Curry, LeBron James & Bronny James, Kobe Bryant & Joe Bryant, Klay Thompson & Mychal Thompson, Rick Barry & Brent Barry, Gary Payton & Gary Payton II, Tim Hardaway & Tim Hardaway Jr., Bol Bol & Manute Bol.',
    'New duo: Jrue Holiday & Giannis Antetokounmpo.',
  ]},
  { section: 'Achievements', items: [
    'New Rare Achievement – LIKE FATHER, LIKE SON: Draft a father and son dynamic duo.',
    'New Legendary Achievement – BAND OF BROTHERS: Win a championship with a brother dynamic duo.',
    'New Legendary Achievement – DYNASTY BLOODLINE: Win a championship with a father and son dynamic duo.',
  ]},
  { section: 'Tags', items: [
    'Sandbox TAG filter: Sixth Man and Finals MVP are now searchable tags.',
    'Sixth Man players now correctly appear when sorting by Tagged in the draft roster.',
    'New Defensive Anchor T2: Roy Hibbert.',
  ]},
  { section: 'Positions', items: [
    'Moses Malone PF/C.',
  ]},
  { section: 'Bug Fixes', items: [
    'San Antonio: SAN and SAS merged into SAS. Tim Duncan and David Robinson now appear together when spinning 90s San Antonio.',
    'Jojo White Finals MVP tag now correctly applies.',
  ]},
]

const V1_5_5_NOTES = [
  { section: 'Leaderboard', items: [
    'Added WEEKLY leaderboards. Each week is its own fresh competition. Top 50 per era and mode are saved from each week. Browse past weeks in the leaderboard modal.',
    'Updated leaderboard bonus values: Finals +350, No S-tier starters +225, Trio +65, Duo Pair +30.',
    'Added "How is Score Calculated?" expandable tip in the leaderboard modal.',
  ]},
  { section: 'Tags', items: [
    'New TAG – FINALS MVP: Finals MVP players get a boost in Finals games. 1-2 awards = significant boost, 3+ awards = larger boost.',
    'New TAG – SIXTH MAN: Elite bench specialists get a +6 rating boost when playing off the bench. No effect when starting. Cap tier is calculated without the boost.',
    'Dynamic Duo: Jamal Murray and Aaron Gordon direct duo removed. The Jokic/Murray/Gordon trio still activates through Jokic.',
    'New Offensive Anchor T2: Karl Malone.',
    'New Defensive Anchor T2: Alonzo Mourning.',
  ]},
  { section: 'Achievements', items: [
    'New Epic Achievement – SIXTH MAN CHAMPION: Win a championship with a Sixth Man tagged player on the bench.',
  ]},
  { section: 'Ratings', items: [
    'Increased: 70s BOS Larry Bird.',
    'Decreased: 2020s DEN Michael Porter Jr.',
  ]},
  { section: 'Positions', items: [
    'Aaron Gordon PF/C',
    'Tim Hardaway Jr. SG/SF',
    'DeMarcus Cousins C/PF',
  ]},
]

const V1_5_3_NOTES = [
  { section: 'Achievements', items: [
    'Added 9 New achievements.',
  ]},
  { section: 'Tags', items: [
    'New Dynamic Duos: Jerry Lucas/Oscar, Nate Thurmond/Rick Barry, Dave Cowens/John Havlicek, Steph Curry/Seth Curry',
    'New Glass Cleaners: Dave Cowens, Artis Gilmore',
    'New Shooting Stars: Trae Young T2, Paul George T2, Sam Hauser T2, Detlef Schrempf T2',
  ]},
  { section: 'Ratings', items: [
    'Buffs: 2010s: Devin Booker, CLE: Lebron James/Kyrie Irving, LAC Chris Paul, OKC Russell Westbrook, CHI Jimmy Butler, Mike Conley',
    '2020s: BOS: Jrue Holiday/Derrick White, NYK Jalen Brunson, Devin Booker, IND Haliburton, Jaylen Brown, Tyrese Maxey',
    '2000s: Dwyane Wade, Carmelo Anthony',
    'Nerfs: 2020s LAC Paul George, 90s Kobe Bryant',
  ]},
  { section: 'Positions', items: [
    'Horace Grant PF/C',
    'Penny Hardaway PG/SG',
  ]},
  { section: 'Bugs', items: [
    'Submit bug fixed.',
    'No S tier starter achievement now works with dynamic duos active.',
  ]},
]

const V1_5_1_NOTES = [
  { section: 'Leaderboard', items: [
    'New score bonuses for drafting dynamic duos and trios.',
    'New score bonus for winning championships with F coaches.',
    'Personal Local stored leaderboard (entries prior to 6/27 wont be there)',
  ]},
  { section: 'Achievements', items: [
    'You can see all the legendary descriptions if you have not unlocked them.',
    'Added 5 new achievements.',
  ]},
  { section: 'Tags', items: [
    'New Timeless players: Draymond Green, Jerry West',
    'New Dynamic Duos: Lonzo Ball - Lamelo Ball, Giannis - Thanasis/Kostas, John Wall - Bradley Beal, Magic - James Worthy, Devin Booker - KD, Vince Carter - Tmac',
    'New Glass Cleaners: Bill Russell, Charles Barkley',
    'Champions tag fixes: Jojo White 2x',
    'New Shooting Stars: Buddy Hield T2, Mark Price T2',
    'Tier Changes: Patrick Ewing and Yao Ming downgraded to T2 Defensive Anchor. Walt Frazier Upgraded to T1 Defensive Anchor',
  ]},
  { section: 'Ratings', items: [
    'Buffs: Jo Jo White, 10s CLE: Kevin Love/Richard Jefferson/Kyrie Irving, 20s OKC: Jalen Williams/Cason Wallace',
    'Nerfs: 60s Wilt Chamberlain',
  ]},
  { section: 'Positions', items: [
    'Clyde Drexler SG/SF',
  ]},
  { section: 'Bugs', items: [
    'Box score displays sometimes would end up in a tie. Can no longer happen.',
    'In rare super team cases in sandbox, teams woud average double the record of assists and wouldnt add up realistically to the team score. Now the assists are scaled properly in those cases.',
  ]},
]

const V1_4_NOTES = [
  { section: 'Simulation', items: [
    'Pre-3pt era players who were eligible for an estimated three point rating in modern eras now get a slightly smaller era penalty going forward (like Pete Maravich).',
    'Zion Williamson gets less of an era penalty going backwards.',
    'Chris Paul gets less of an era penalty in the 90s through 2020s.',
    'Kevin Garnett can now play center without a penalty.',
    'Shaq can play PF with no positional penalty. (Keep in mind PF still matters for spacing in recent eras. He just won\'t take a positional penalty there.)',
  ]},
  { section: 'Tags', items: [
    'David Robinson, Moses Malone, and Anthony Davis are now TIMELESS players.',
  ]},
  { section: 'Sandbox', items: [
    'Added a sort-by-tag option, so you can see every player who carries each tag!',
  ]},
  { section: 'Ratings', items: [
    'HOF coaches now have a floor grade of B. Kenny Atkinson also got a boost.',
    'Don Nelson\'s defensive grade upgraded to a C.',
  ]},
  { section: 'Draft', items: [
    'Removed coaches with under 100 games played.',
  ]},
  { section: 'Music', items: [
    'Lowered the base music volume.',
    'Your volume and mute settings now save. No need to adjust them each time you restart.',
  ]},
]

const V1_3_NOTES = [
  { section: 'NEW ERA THEMES!', items: [
    'BRAND NEW themes for every era. On by default, can be turned off in the top bar.',
    '50s: Full greyscale. CRT scanlines, screen flicker, and a sweeping scan bar.',
    '60s: Desaturated. Warm yellow tint, CRT scanlines, and scan bar.',
    '70s: Slight desaturation with a faded film contrast grade.',
    '80s / 90s: CRT scanlines and vignette.',
    '2000s: Animated film grain, amber tint, and vignette.',
    '2010s: Light film grain and a subtle golden overlay.',
    '2020s: Default, no filter.',
    'Effects preview live on the home screen as you click over eras before confirming.',
  ]},
  { section: 'NEW ERA Music', items: [
    'Each era now has its own era specific background music. Starts the moment you click an era on the home screen.',
    'Speaker icon at the top bar controls volume.',
  ]},
  { section: 'Ratings', items: [
    'Increased the ratings of numerous players across eras to match their real life impact, and their ranking in that era. Players like 90s MJ, 10s CLE Lebron, Magic, Bird, Alex English, Tim Duncan, Dirk, 10s Draymond and more!',
  ]},
  { section: 'Playoffs', items: [
    'Fixed bug where your team would have more points in a loss in the box score.',
  ]},
]

const V1_2_NOTES = [
  { section: 'Simulation', items: [
    'Increased the 2000s era difficulty in the regular season. It was the weakest before.',
    'Slightly increased difficulty of the 80s.',
    '90s negative spacing penalty increased for the regular season and playoffs to be more realistic for the time.',
    'Finals opponents play better defense in all eras. More difficulty.',
    'Decreased coaching impact. Closed the gap between guru and F/D coaches to be more realistic.',
    'Reduced championship bonus for coaches, capped at 8 championships. Phil Jackson is no longer an easy 70+ win season regardless of roster quality.',
    'Pre-3pt era rim protection: Reduced the defensive impact of shot blocking in the 50s/60s/70s. Elite shot blockers gave too high a boost when opponents didn\'t have the same.',
  ]},
  { section: 'Playoffs', items: [
    'Click any playoff game card to open a full box score. See how each one of your players performed (MIN, PTS, REB, AST, STL, BLK, TOV, FG%, 3P%, FT%).',
  ]},
  { section: 'UI', items: [
    'Added a game-by-game advance button to the playoffs. Go one game at a time, or hit Auto Sim to let it run.',
  ]},
  { section: 'Coming Soon', items: [
    'Real team opponents in the playoffs.',
    'More player-specific lifetime stat tracking.',
  ]},
]

export function PatchNotesModal({ onClose }: { onClose: () => void }) {
  const [showV1_5_6, setShowV1_5_6] = useState(false)
  const [showV1_5_5, setShowV1_5_5] = useState(false)
  const [showV1_5_3, setShowV1_5_3] = useState(false)
  const [showV1_5_2, setShowV1_5_2] = useState(false)
  const [showV1_5, setShowV1_5] = useState(false)
  const [showV1_4, setShowV1_4] = useState(false)
  const [showV1_3, setShowV1_3] = useState(false)
  const [showV1_2, setShowV1_2] = useState(false)
  const [showV1_1, setShowV1_1] = useState(false)
  const [showV1, setShowV1] = useState(false)

  const renderNotes = (notes: { section: string; items: string[] }[]) => notes.map(({ section, items }) => (
    <div key={section} className="mb-4">
      <div style={{ fontSize: 11, color: G.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{section}</div>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 13, color: G.greyDark, marginBottom: 8, display: 'flex', gap: 8 }}>
          <span style={{ color: G.greyDark, flexShrink: 0 }}>—</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  ))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
      <div style={{ background: G.surface, border: `1px solid ${G.border}`, maxWidth: 520, width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: '28px 32px' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ ...BEBAS, fontSize: 24, color: G.white, letterSpacing: '0.05em' }}>What's New</div>
            <div style={{ fontSize: 11, color: G.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>v1.5.8 · July 2</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: G.greyDark, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {renderNotes(V1_5_8_NOTES)}

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1_5_6(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1.5.6 · June 30</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1_5_6 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1_5_6 && <div style={{ marginTop: 12 }}>{renderNotes(V1_5_6_NOTES)}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1_5_5(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1.5.5 · June 29</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1_5_5 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1_5_5 && <div style={{ marginTop: 12 }}>{renderNotes(V1_5_5_NOTES)}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1_5_3(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1.5.3 · June 28</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1_5_3 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1_5_3 && <div style={{ marginTop: 12 }}>{renderNotes(V1_5_3_NOTES)}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1_5_2(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1.5.2 · June 27</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1_5_2 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1_5_2 && <div style={{ marginTop: 12 }}>{renderNotes(V1_5_1_NOTES)}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1_5(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1.5 · June 24</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1_5 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1_5 && <div style={{ marginTop: 12 }}>{renderNotes(V1_5_NOTES)}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1_4(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1.4 · June 21</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1_4 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1_4 && <div style={{ marginTop: 12 }}>{renderNotes(V1_4_NOTES)}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1_3(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1.3 · June 19</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1_3 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1_3 && <div style={{ marginTop: 12 }}>{renderNotes(V1_3_NOTES)}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1_2(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1.2 · June 18</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1_2 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1_2 && <div style={{ marginTop: 12 }}>{renderNotes(V1_2_NOTES)}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1_1(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1.1 · June 16</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1_1 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1_1 && <div style={{ marginTop: 12 }}>{renderNotes(V1_1_NOTES)}</div>}
        </div>

        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 8, paddingTop: 12 }}>
          <button onClick={() => setShowV1(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
            <span style={{ fontSize: 11, color: G.greyDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>V1 · June 12</span>
            <span style={{ fontSize: 10, color: G.greyDark, display: 'inline-block', transform: showV1 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {showV1 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: G.greyDark, marginBottom: 12, fontStyle: 'italic' }}>Post beta!</div>
              {renderNotes(V1_NOTES)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
