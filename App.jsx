import React, { useState, useEffect, useRef, useReducer, useCallback } from 'react';
import { Radio, Trophy, Zap, Shield, Target, Crosshair, Award, RotateCcw, ChevronRight, Plus, X, Volume2, Hammer, Flag, Lock, Skull, ChevronDown, ChevronUp, Play, ArrowRight, Beer, Flame, Plus as PlusIcon, TrendingUp, AlertCircle, Snowflake, Star, User, Check } from 'lucide-react';

/* ============================================================
   THE RADIO DRAFT — V3
   Rule corrections + UI cleanup
   ============================================================ */

/* V12.12: Reverted to the V12.7 slate palette.

   After five aesthetic swings (slate → slate refined → vinyl → light/
   white-card → light/palette-discipline), readability kept failing
   in real-world use. Going back to slate because:
     - That version had the cleanest contrast audit (every text color
       passed WCAG AA across all surfaces)
     - The Whalers identity colors read correctly as themselves
     - Cards lifted cleanly off the page with a single mid-tone shift
     - The industrial equipment identity worked

   No backdrop texture. No vinyl. No gradient. Just slate page,
   lighter slate cards, white text, bright textDim, lifted Whalers
   blue/green for legibility on dark.

   V12.12.1: Contrast audit revealed blue/green/red text variants
   were borderline or failing on slate. Added text-safe brighter
   variants (blueLight, greenLight, redLight) that hit WCAG AA for
   text use. The base `blue` `green` `red` are reserved for BACKGROUND
   color (white text on blue/green/red button is fine). When you need
   COLORED TEXT on slate, use the *Light variant.

   Page    #3A4250  medium slate gray
   Cards   #454E5C  lighter slate (cards lift off page)
   cardHi  #525B6B  active card state
   darker  #2C333F  recessed inside cards
   Text    #FFFFFF  white
   textDim #C4C9D2  bright secondary text
   Borders #5C6573  visible
   Blue    #1E40AF  background/icon use; whiteText-on-blue OK
   BlueLgt #60A5FA  TEXT use only (large text or accents)
   Green   #10B981  background/icon use; large text only on slate
   GrnLgt  #34D399  TEXT use (passes AA on slate)
   Silver  #D8DCE2  bright silver for player-2 identity
   Amber   #F59E0B  bonus / championship moments
   AmbDk   #B45309  background only (don't use as text on slate)
   Red     #EF4444  background/icon use; whiteText-on-red OK
   RedLgt  #FCA5A5  TEXT use (passes AA on slate) */
const C = {
  blue: '#1E40AF', blueLight: '#60A5FA',
  green: '#10B981', greenLight: '#34D399',
  silver: '#D8DCE2', dark: '#3A4250', darker: '#2C333F',
  card: '#454E5C', cardHi: '#525B6B',
  border: '#5C6573', borderHi: '#76808E',
  red: '#EF4444', redLight: '#FCA5A5', amber: '#F59E0B', amberDark: '#B45309',
  text: '#FFFFFF', textDim: '#C4C9D2',
};

const BONUS_VALUES = {
  PLAY: 1, BONUS_SONG: 2, WALKOFF: 2,
  BACK_TO_BACK: 1, RETALIATION: 1,
  FIRST_PLAY: 1,
  SHOT_TEAM: 3, SHOT_ARTIST: 5, SHOT_SONG: 7,
};

const SHOT_LEVELS = ['team', 'artist', 'song'];
const SHOT_POINTS = { team: 3, artist: 5, song: 7 };
const SHOT_LABEL = { team: 'TEAM', artist: 'ARTIST', song: 'SONG' };

const INITIAL_BONUSES = { block: 1, steal: 1, shotCall: 1 };

// ============================================================
// STATION DIRECTORY
// ============================================================
// A station entry carries enough metadata that the app can pick draft
// pools, route playlist provider requests, and display station identity.
// Backward compat: old saved stations (just { id, name, genre }) are
// upgraded at load time via upgradeStation().
//
// providerPriority defines the order playlist providers are tried.
// Today only 'manual' and 'mock' are wired; the rest are placeholders
// for future scraping/API work. format MUST match a key in STATION_FORMATS.

const STATION_DIRECTORY = [
  {
    id: 'krfx-denver',
    callSign: 'KRFX',
    frequency: '103.5',
    name: '103.5 THE FOX',
    market: 'Denver, CO',
    format: 'Classic Rock',
    genres: ['Classic Rock', 'Rock'],
    providerPriority: ['stationWebsite', 'iheart', 'onlineRadioBox', 'mock', 'manual'],
    playlistSources: {
      stationWebsite: 'https://www.krfx.com/listen/last-played',
      iheart: 'iheart://station/krfx',
      onlineRadioBox: 'https://onlineradiobox.com/us/krfx/playlist/',
    },
    draftPoolStrategy: 'formatBased',
  },
  {
    id: 'kxkl-denver',
    callSign: 'KXKL',
    frequency: '105.1',
    name: 'KOOL 105.1',
    market: 'Denver, CO',
    format: 'Classic Hits',
    genres: ['Classic Hits', 'Oldies'],
    providerPriority: ['stationWebsite', 'iheart', 'onlineRadioBox', 'mock', 'manual'],
    playlistSources: {
      stationWebsite: 'https://www.koolden.com/listen/last-played',
    },
    draftPoolStrategy: 'formatBased',
  },
  {
    id: 'kosi-denver',
    callSign: 'KOSI',
    frequency: '101.1',
    name: 'KOSI 101.1',
    market: 'Denver, CO',
    format: 'Adult Contemporary',
    genres: ['Adult Contemporary', 'Pop'],
    providerPriority: ['stationWebsite', 'iheart', 'onlineRadioBox', 'mock', 'manual'],
    playlistSources: {},
    draftPoolStrategy: 'formatBased',
  },
  {
    id: 'kygo-denver',
    callSign: 'KYGO',
    frequency: '98.5',
    name: 'KYGO 98.5',
    market: 'Denver, CO',
    format: 'Country',
    genres: ['Country'],
    providerPriority: ['stationWebsite', 'iheart', 'onlineRadioBox', 'mock', 'manual'],
    playlistSources: {},
    draftPoolStrategy: 'formatBased',
  },
  {
    id: 'kqks-denver',
    callSign: 'KQKS',
    frequency: '107.5',
    name: 'KS 107.5',
    market: 'Denver, CO',
    format: 'Hip-Hop/R&B',
    genres: ['Hip-Hop', 'R&B'],
    providerPriority: ['stationWebsite', 'iheart', 'onlineRadioBox', 'mock', 'manual'],
    playlistSources: {},
    draftPoolStrategy: 'formatBased',
  },
  {
    id: 'kjmn-denver',
    callSign: 'KJMN',
    frequency: '95.7',
    name: 'JAMMIN\' 95.7',
    market: 'Denver, CO',
    format: 'Throwback',
    genres: ['Throwback', '90s', '2000s'],
    providerPriority: ['stationWebsite', 'iheart', 'onlineRadioBox', 'mock', 'manual'],
    playlistSources: {},
    draftPoolStrategy: 'formatBased',
  },
  // Sentinel — opens the "add station" flow when picked.
  { id: 'custom', name: 'CUSTOM STATION', market: 'Add your own', format: null, isSentinel: true },
];

// Default seed for users with no saved stations. Just the directory.
const DEFAULT_STATIONS = STATION_DIRECTORY;

// Upgrade a station saved by an older app version. Old shape was just
// { id, name, genre }. We map genre → format if it matches one of the
// known formats, otherwise fall back to a sensible default.
function upgradeStation(s) {
  if (!s || typeof s !== 'object') return s;
  if (s.format !== undefined && s.market !== undefined) return s; // already new shape
  // Find best-fit format from old genre string
  let format = null;
  if (s.genre) {
    const g = s.genre.trim();
    if (STATION_FORMATS[g]) format = g;
    else {
      // partial match
      const lower = g.toLowerCase();
      const guess = FORMAT_KEYS.find(k => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower));
      if (guess) format = guess;
    }
  }
  if (!format && s.id !== 'custom') format = 'Classic Rock'; // safe default
  return {
    id: s.id,
    name: s.name,
    callSign: s.callSign || null,
    frequency: s.frequency || null,
    market: s.market || (s.genre ? s.genre : 'Custom'),
    format,
    genres: s.genres || (format ? [format] : []),
    providerPriority: s.providerPriority || ['mock', 'manual'],
    playlistSources: s.playlistSources || {},
    draftPoolStrategy: s.draftPoolStrategy || 'formatBased',
    isSentinel: s.id === 'custom',
    // preserve original genre string for display fallback
    legacyGenre: s.genre || null,
  };
}

// Canonicalize for matching. Lowercases, strips punctuation, collapses
// whitespace. Used by Bonus Song, Song Shot Call, and provider matching.
function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "'") // smart quotes
    .replace(/[^\w\s'&-]/g, '')                    // drop most punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

// Artist -> popular songs. Master catalog spans multiple radio formats so
// the app can support nationwide station selection (Classic Rock, Country,
// Pop, etc). FORMAT_ARTIST_POOLS below partitions this into per-format
// draft pools. Users can also add custom artists at draft time.
const ARTIST_SONG_CATALOG = {
  // ---- Rock / Classic Rock / Active Rock ----
  'Pearl Jam': ['Alive', 'Even Flow', 'Jeremy', 'Better Man', 'Black', 'Yellow Ledbetter'],
  'Metallica': ['Enter Sandman', 'Master of Puppets', 'One', 'Nothing Else Matters', 'Fade to Black'],
  'AC/DC': ['Back in Black', 'Highway to Hell', 'You Shook Me All Night Long', 'Thunderstruck', 'TNT'],
  'Led Zeppelin': ['Stairway to Heaven', 'Black Dog', 'Kashmir', 'Whole Lotta Love', 'Rock and Roll'],
  "Guns N' Roses": ['Sweet Child o\' Mine', 'Welcome to the Jungle', 'November Rain', 'Paradise City'],
  'Nirvana': ['Smells Like Teen Spirit', 'Come As You Are', 'In Bloom', 'Lithium', 'Heart-Shaped Box'],
  'Foo Fighters': ['Everlong', 'The Pretender', 'Best of You', 'Learn to Fly', 'Times Like These'],
  'Red Hot Chili Peppers': ['Under the Bridge', 'Californication', 'Scar Tissue', 'Otherside', 'Dani California'],
  'Tool': ['Schism', 'Sober', 'Stinkfist', 'Forty Six & 2'],
  'Soundgarden': ['Black Hole Sun', 'Spoonman', 'Fell on Black Days', 'Outshined'],
  'Van Halen': ['Jump', 'Panama', 'Runnin\' with the Devil', 'Hot for Teacher', 'Eruption'],
  'Aerosmith': ['Dream On', 'Walk This Way', 'Sweet Emotion', 'Janie\'s Got a Gun'],
  'The Rolling Stones': ['Paint It Black', 'Satisfaction', 'Gimme Shelter', 'Start Me Up', 'Brown Sugar'],
  'The Who': ['Baba O\'Riley', 'Won\'t Get Fooled Again', 'My Generation', 'Pinball Wizard'],
  'Bruce Springsteen': ['Born to Run', 'Thunder Road', 'Dancing in the Dark', 'Born in the USA'],
  'Tom Petty': ['Free Fallin\'', 'American Girl', 'Refugee', 'Mary Jane\'s Last Dance', 'Runnin\' Down a Dream'],
  'Eagles': ['Hotel California', 'Take It Easy', 'Life in the Fast Lane', 'Desperado'],
  'Fleetwood Mac': ['Go Your Own Way', 'Dreams', 'The Chain', 'Landslide', 'Rhiannon'],
  'Queen': ['Bohemian Rhapsody', 'We Will Rock You', 'Don\'t Stop Me Now', 'Somebody to Love', 'Under Pressure'],
  'David Bowie': ['Heroes', 'Space Oddity', 'Let\'s Dance', 'Under Pressure'],
  'Bon Jovi': ['Livin\' on a Prayer', 'You Give Love a Bad Name', 'Wanted Dead or Alive', 'It\'s My Life'],
  'Def Leppard': ['Pour Some Sugar on Me', 'Photograph', 'Rock of Ages', 'Hysteria'],
  'Journey': ['Don\'t Stop Believin\'', 'Any Way You Want It', 'Faithfully', 'Wheel in the Sky'],
  'Boston': ['More Than a Feeling', 'Foreplay/Long Time', 'Peace of Mind'],
  'Kansas': ['Carry On Wayward Son', 'Dust in the Wind', 'Point of Know Return'],
  'Rush': ['Tom Sawyer', 'YYZ', 'Limelight', 'The Spirit of Radio'],
  'Black Sabbath': ['Iron Man', 'Paranoid', 'War Pigs', 'N.I.B.'],
  'Iron Maiden': ['The Trooper', 'Run to the Hills', 'Fear of the Dark', 'Number of the Beast'],
  'Motley Crue': ['Kickstart My Heart', 'Dr. Feelgood', 'Girls, Girls, Girls'],
  'Poison': ['Every Rose Has Its Thorn', 'Talk Dirty to Me', 'Nothin\' but a Good Time'],
  'Stone Temple Pilots': ['Plush', 'Interstate Love Song', 'Vasoline', 'Big Empty'],
  'Alice in Chains': ['Man in the Box', 'Would?', 'Rooster', 'Down in a Hole'],
  'Rage Against the Machine': ['Killing in the Name', 'Bulls on Parade', 'Guerrilla Radio'],
  'System of a Down': ['Chop Suey!', 'Toxicity', 'B.Y.O.B.', 'Aerials'],
  'Green Day': ['American Idiot', 'Basket Case', 'Good Riddance (Time of Your Life)', 'When I Come Around', 'Boulevard of Broken Dreams'],
  'Linkin Park': ['In the End', 'Numb', 'Crawling', 'One Step Closer'],
  'Disturbed': ['Down with the Sickness', 'Stricken', 'The Sound of Silence'],
  'Godsmack': ['I Stand Alone', 'Awake', 'Voodoo'],
  'Shinedown': ['Second Chance', 'Sound of Madness', 'Simple Man'],
  'Three Days Grace': ['I Hate Everything About You', 'Animal I Have Become', 'Pain'],
  'Nickelback': ['How You Remind Me', 'Photograph', 'Rockstar'],
  'Creed': ['Higher', 'My Sacrifice', 'With Arms Wide Open'],
  'Staind': ['It\'s Been Awhile', 'Outside', 'So Far Away'],
  'Seether': ['Fake It', 'Broken', 'Remedy'],
  'Breaking Benjamin': ['I Will Not Bow', 'The Diary of Jane', 'So Cold'],
  'The Black Keys': ['Lonely Boy', 'Tighten Up', 'Howlin\' for You'],
  'Kings of Leon': ['Sex on Fire', 'Use Somebody', 'Closer'],
  'Cage the Elephant': ['Ain\'t No Rest for the Wicked', 'Cigarette Daydreams', 'Trouble'],
  'My Chemical Romance': ['Welcome to the Black Parade', 'Helena', 'Teenagers'],
  'Weezer': ['Buddy Holly', 'Say It Ain\'t So', 'Island in the Sun', 'Beverly Hills'],

  // ---- Pop / Top 40 / Hot AC ----
  'Taylor Swift': ['Anti-Hero', 'Shake It Off', 'Blank Space', 'Cruel Summer', 'Bad Blood', 'The Fate of Ophelia'],
  'Bruno Mars': ['Uptown Funk', '24K Magic', 'Just the Way You Are', 'Grenade', 'Locked Out of Heaven'],
  'Adele': ['Hello', 'Rolling in the Deep', 'Someone Like You', 'Easy on Me', 'Set Fire to the Rain'],
  'Ed Sheeran': ['Shape of You', 'Perfect', 'Thinking Out Loud', 'Bad Habits', 'Photograph'],
  'Maroon 5': ['Sugar', 'Memories', 'Girls Like You', 'Moves Like Jagger', 'Payphone'],
  'Dua Lipa': ['Levitating', 'Don\'t Start Now', 'New Rules', 'Physical', 'Houdini'],
  'The Weeknd': ['Blinding Lights', 'Save Your Tears', 'Starboy', 'Can\'t Feel My Face', 'The Hills'],
  'Harry Styles': ['As It Was', 'Watermelon Sugar', 'Adore You', 'Sign of the Times', 'Late Night Talking'],
  'Billie Eilish': ['Bad Guy', 'Lovely', 'Happier Than Ever', 'Birds of a Feather', 'What Was I Made For?'],
  'Olivia Rodrigo': ['Drivers License', 'Good 4 U', 'Vampire', 'Deja Vu', 'Brutal'],
  'Doja Cat': ['Say So', 'Kiss Me More', 'Woman', 'Paint the Town Red', 'Agora Hills'],
  'Post Malone': ['Circles', 'Sunflower', 'Rockstar', 'Better Now', 'I Had Some Help'],
  'Justin Bieber': ['Sorry', 'Love Yourself', 'Ghost', 'Stay', 'Peaches'],
  'Ariana Grande': ['Thank U, Next', '7 Rings', 'Positions', 'No Tears Left to Cry', 'Yes, And?'],
  'Sabrina Carpenter': ['Espresso', 'Please Please Please', 'Feather', 'Nonsense'],

  // ---- Country ----
  'Luke Combs': ['Beautiful Crazy', 'Hurricane', 'Forever After All', 'Fast Car', 'When It Rains It Pours'],
  'Morgan Wallen': ['Last Night', 'Wasted on You', 'You Proof', 'Whiskey Glasses', 'Thinkin\' Bout Me'],
  'Zach Bryan': ['Something in the Orange', 'I Remember Everything', 'Pink Skies', 'Heading South'],
  'Miranda Lambert': ['The House That Built Me', 'Mama\'s Broken Heart', 'Bluebird', 'Tin Man'],
  'Chris Stapleton': ['Tennessee Whiskey', 'Broken Halos', 'Starting Over', 'White Horse'],
  'Carrie Underwood': ['Before He Cheats', 'Jesus, Take the Wheel', 'Cry Pretty', 'Blown Away'],
  'Kenny Chesney': ['Summertime', 'No Shoes No Shirt No Problems', 'When the Sun Goes Down'],
  'Jason Aldean': ['Big Green Tractor', 'Dirt Road Anthem', 'You Make It Easy', 'Try That in a Small Town'],
  'Eric Church': ['Springsteen', 'Drink in My Hand', 'Record Year', 'Hell of a View'],
  'Garth Brooks': ['Friends in Low Places', 'The Dance', 'The Thunder Rolls', 'Callin\' Baton Rouge'],
  'Tim McGraw': ['Live Like You Were Dying', 'Humble and Kind', 'Don\'t Take the Girl', 'Highway Don\'t Care'],
  'Kacey Musgraves': ['Rainbow', 'Slow Burn', 'Space Cowboy', 'Butterflies'],
  'Lainey Wilson': ['Heart Like a Truck', 'Watermelon Moonshine', 'Things a Man Oughta Know'],

  // ---- Hip-Hop / R&B ----
  'Drake': ['God\'s Plan', 'Hotline Bling', 'In My Feelings', 'One Dance', 'Rich Flex'],
  'Kendrick Lamar': ['HUMBLE.', 'DNA.', 'Not Like Us', 'Money Trees', 'Alright'],
  'Travis Scott': ['Sicko Mode', 'Goosebumps', 'Antidote', 'Highest in the Room', 'Fein'],
  'Beyoncé': ['Crazy in Love', 'Halo', 'Single Ladies', 'Texas Hold \'Em', 'Cuff It'],
  'Rihanna': ['Umbrella', 'Diamonds', 'We Found Love', 'Work', 'Lift Me Up'],
  'SZA': ['Kill Bill', 'Snooze', 'Good Days', 'Saturn', 'Nobody Gets Me'],
  'Future': ['Mask Off', 'Life Is Good', 'Wait for U', 'Like That'],
  'J. Cole': ['No Role Modelz', 'MIDDLE CHILD', 'Work Out', 'Family Matters'],
  '21 Savage': ['Bank Account', 'A Lot', 'Rich Flex', 'Redrum'],
  'Cardi B': ['Bodak Yellow', 'WAP', 'I Like It', 'Up'],
  'Megan Thee Stallion': ['Savage', 'Body', 'WAP', 'Hiss'],
  'Tyler, The Creator': ['EARFQUAKE', 'See You Again', 'Yonkers', 'Sticky'],

  // ---- Adult Contemporary / Soft Hits ----
  'Coldplay': ['Yellow', 'Fix You', 'Viva la Vida', 'The Scientist', 'Paradise'],
  'OneRepublic': ['Counting Stars', 'I Ain\'t Worried', 'Apologize', 'Good Life'],
  'Imagine Dragons': ['Believer', 'Thunder', 'Radioactive', 'Demons', 'Bones'],
  'P!nk': ['So What', 'Just Give Me a Reason', 'What About Us', 'TRUSTFALL'],
  'Sam Smith': ['Stay With Me', 'Unholy', 'Too Good at Goodbyes', 'I\'m Not the Only One'],
  'John Mayer': ['Gravity', 'Daughters', 'Waiting on the World to Change', 'Your Body Is a Wonderland'],
  'James Arthur': ['Say You Won\'t Let Go', 'Impossible', 'Train Wreck'],
  'Lewis Capaldi': ['Someone You Loved', 'Before You Go', 'Wish You the Best'],

  // ---- 80s/90s nostalgia (overlaps with classic rock; included for Throwback formats) ----
  'Michael Jackson': ['Billie Jean', 'Thriller', 'Beat It', 'Don\'t Stop \'Til You Get Enough', 'P.Y.T. (Pretty Young Thing)', 'Smooth Criminal', 'Bad', 'The Way You Make Me Feel', 'Man in the Mirror', 'Rock with You', 'Wanna Be Startin\' Somethin\''],
  'Madonna': ['Like a Prayer', 'Material Girl', 'Vogue', 'Like a Virgin'],
  'Prince': ['Purple Rain', 'When Doves Cry', '1999', 'Little Red Corvette'],
  'Whitney Houston': ['I Wanna Dance with Somebody', 'I Will Always Love You', 'How Will I Know'],
  'Mariah Carey': ['All I Want for Christmas Is You', 'Fantasy', 'We Belong Together', 'Hero', 'Always Be My Baby'],
  'TLC': ['Waterfalls', 'No Scrubs', 'Creep', 'Unpretty'],
  'Backstreet Boys': ['I Want It That Way', 'Everybody', 'Quit Playing Games', 'As Long as You Love Me'],
  'NSYNC': ['Bye Bye Bye', 'It\'s Gonna Be Me', 'Tearin\' Up My Heart'],

  // ---- Classic Hits / Throwback rotation (Kool 105 / KOSI scrapes) ----
  '3 Doors Down': ['Kryptonite', 'When I\'m Gone', 'Here Without You', 'Loser'],
  '4 Non Blondes': ['What\'s Up'],
  'A Flock of Seagulls': ['I Ran (So Far Away)', 'Space Age Love Song'],
  'A-ha': ['Take On Me', 'The Sun Always Shines on TV'],
  'Ace of Base': ['All That She Wants', 'The Sign', 'Don\'t Turn Around'],
  'Alanis Morissette': ['Ironic', 'You Oughta Know', 'Hand in My Pocket'],
  'All-American Rejects': ['Gives You Hell', 'Dirty Little Secret', 'Move Along'],
  'Bangles': ['Manic Monday', 'Walk Like an Egyptian', 'Eternal Flame'],
  'Beastie Boys': ['(You Gotta) Fight for Your Right', 'Sabotage', 'Intergalactic'],
  'Belinda Carlisle': ['Heaven Is a Place on Earth', 'Circle in the Sand'],
  'Berlin': ['Take My Breath Away'],
  'Billy Idol': ['Dancing With Myself', 'Rebel Yell', 'White Wedding'],
  'Billy Joel': ['Uptown Girl', 'Piano Man', 'We Didn\'t Start the Fire', 'Vienna'],
  'Black Eyed Peas': ['Let\'s Get It Started', 'Where Is the Love', 'I Gotta Feeling', 'Boom Boom Pow'],
  'Blackstreet': ['No Diggity'],
  'Blind Melon': ['No Rain'],
  'Blink-182': ['All the Small Things', 'I Miss You', 'What\'s My Age Again?'],
  'Blondie': ['Call Me', 'Heart of Glass', 'One Way or Another'],
  'Blue Oyster Cult': ['Burnin\' for You', '(Don\'t Fear) The Reaper'],
  'Bryan Adams': ['Summer of \'69', 'Heaven', 'Cuts Like a Knife', '(Everything I Do) I Do It for You'],
  'C+C Music Factory': ['Gonna Make You Sweat (Everybody Dance Now)'],
  'Cardigans': ['Lovefool'],
  'Carly Rae Jepsen': ['Call Me Maybe'],
  'Cher': ['Believe', 'If I Could Turn Back Time'],
  'Christina Aguilera': ['Genie in a Bottle', 'Beautiful', 'Dirrty'],
  'Chumbawamba': ['Tubthumping'],
  'Corey Hart': ['Sunglasses at Night'],
  'Counting Crows': ['Big Yellow Taxi', 'Mr. Jones', 'Round Here'],
  'Cranberries': ['Dreams', 'Linger', 'Zombie'],
  'Crazy Town': ['Butterfly'],
  'Cutting Crew': ['(I Just) Died in Your Arms Tonight'],
  'Cyndi Lauper': ['Girls Just Want to Have Fun', 'Time After Time', 'True Colors'],
  'Daft Punk': ['One More Time', 'Get Lucky', 'Around the World'],
  'Dasha': ['Austin'],
  'David Guetta': ['Titanium', 'When Love Takes Over', 'Memories'],
  'Daughtry': ['It\'s Not Over', 'Home'],
  'Dead or Alive': ['You Spin Me Round (Like a Record)'],
  'DeBarge': ['Rhythm of the Night'],
  'Dexy\'s Midnight Runners': ['Come On Eileen'],
  'Dido': ['Thank You', 'White Flag'],
  'Donna Lewis': ['I Love You Always Forever'],
  'Earth, Wind & Fire': ['September', 'Let\'s Groove', 'Boogie Wonderland'],
  'Edwin McCain': ['I\'ll Be'],
  'Ellie Goulding': ['Lights', 'Love Me Like You Do', 'Burn'],
  'Eurythmics': ['Sweet Dreams (Are Made of This)', 'Here Comes the Rain Again'],
  'Eve 6': ['Inside Out'],
  'Everlast': ['What It\'s Like'],
  'Fine Young Cannibals': ['She Drives Me Crazy', 'Good Thing'],
  'Foreigner': ['I Want to Know What Love Is', 'Juke Box Hero', 'Cold as Ice', 'Hot Blooded', 'Urgent'],
  'Frankie Goes to Hollywood': ['Relax', 'Two Tribes'],
  'Genesis': ['That\'s All', 'Invisible Touch', 'Land of Confusion'],
  'Gnarls Barkley': ['Crazy'],
  'Goo Goo Dolls': ['Iris', 'Name', 'Slide'],
  'Gotye': ['Somebody That I Used to Know'],
  'Gwen Stefani': ['Cool', 'Hollaback Girl', 'The Sweet Escape'],
  'Hall & Oates': ['Maneater', 'You Make My Dreams', 'Rich Girl', 'Out of Touch'],
  'Halsey': ['Without Me', 'Bad at Love'],
  'Harvey Danger': ['Flagpole Sitta'],
  'Hoobastank': ['The Reason'],
  'Hozier': ['Take Me to Church', 'Too Sweet'],
  'Huey Lewis & The News': ['The Power of Love', 'Heart of Rock and Roll', 'If This Is It', 'Heart and Soul'],
  'INXS': ['Need You Tonight', 'Never Tear Us Apart'],
  'Incubus': ['Drive', 'Wish You Were Here'],
  'Irene Cara': ['Flashdance (What a Feeling)', 'Fame'],
  'Iyaz': ['Replay'],
  'Janet Jackson': ['What Have You Done for Me Lately', 'Rhythm Nation', 'Together Again'],
  'Jason Derulo': ['Whatcha Say', 'Talk Dirty', 'Want to Want Me'],
  'Jennifer Lopez': ['Love Don\'t Cost a Thing', 'On the Floor'],
  'Jewel': ['You Were Meant for Me', 'Foolish Games'],
  'Jimmy Cliff': ['I Can See Clearly Now', 'The Harder They Come'],
  'Jimmy Eat World': ['The Middle', 'Sweetness'],
  'Joan Jett & The Blackhearts': ['I Love Rock \'N Roll', 'Bad Reputation'],
  'John Mellencamp': ['Jack & Diane', 'Pink Houses', 'Hurts So Good'],
  'John Waite': ['Missing You'],
  'Jonas Brothers': ['Sucker', 'Burnin\' Up'],
  'Justin Timberlake': ['Rock Your Body', 'SexyBack', 'Cry Me a River', 'What Goes Around...Comes Around'],
  'Katrina & The Waves': ['Walking on Sunshine'],
  'Katy Perry': ['Teenage Dream', 'I Kissed a Girl', 'Firework', 'Hot N Cold', 'Roar'],
  'Kelly Clarkson': ['Since U Been Gone', 'Behind These Hazel Eyes', 'Stronger'],
  'Kenny Loggins': ['Footloose', 'Danger Zone', 'I\'m Alright'],
  'Kid Rock': ['All Summer Long', 'Cowboy', 'Bawitdaba'],
  'Kim Carnes': ['Bette Davis Eyes'],
  'Kim Wilde': ['You Keep Me Hangin\' On', 'Kids in America'],
  'Kylie Minogue': ['Can\'t Get You Out of My Head', 'Love at First Sight'],
  'Lady A': ['Need You Now'],
  'Lady Gaga': ['Bad Romance', 'Poker Face', 'Just Dance', 'Shallow', 'Born This Way'],
  'LeAnn Rimes': ['Can\'t Fight the Moonlight', 'How Do I Live'],
  'Lenny Kravitz': ['Fly Away', 'Are You Gonna Go My Way', 'American Woman'],
  'Leona Lewis': ['Bleeding Love'],
  'Lifehouse': ['Hanging by a Moment', 'You and Me'],
  'Lionel Richie': ['All Night Long', 'Hello', 'Easy'],
  'Lit': ['My Own Worst Enemy'],
  'Lorde': ['Royals', 'Team'],
  'MC Hammer': ['U Can\'t Touch This'],
  'Magic!': ['Rude'],
  'Marvin Gaye': ['Sexual Healing', 'What\'s Going On', 'Let\'s Get It On'],
  'Matchbox Twenty': ['Unwell', 'If You\'re Gone', 'Bent', 'Push', '3AM'],
  'Matthew Wilder': ['Break My Stride'],
  'Meghan Trainor': ['All About That Bass', 'Dear Future Husband'],
  'Men at Work': ['Down Under', 'Who Can It Be Now?'],
  'Miley Cyrus': ['Party in the U.S.A.', 'Flowers', 'Wrecking Ball'],
  'Modern English': ['I Melt with You'],
  'Montell Jordan': ['This Is How We Do It'],
  'Mr. Big': ['To Be with You'],
  'Mr. Mister': ['Broken Wings', 'Kyrie'],
  'Mumford & Sons': ['Little Lion Man', 'I Will Wait'],
  'Myles Smith': ['Stargazing'],
  'Naked Eyes': ['Always Something There to Remind Me'],
  'Natalie Imbruglia': ['Torn'],
  'Natasha Bedingfield': ['Unwritten', 'Pocketful of Sunshine'],
  'Nelly Furtado': ['I\'m Like a Bird', 'Say It Right', 'Maneater'],
  'Nena': ['99 Red Balloons'],
  'New Radicals': ['You Get What You Give'],
  'No Doubt': ['It\'s My Life', 'Spiderwebs', 'Hollaback Girl', 'Underneath It All'],
  'OMD': ['If You Leave', 'Enola Gay'],
  'Olivia Dean': ['Man I Need', 'So Easy (To Fall in Love)'],
  'OutKast': ['Hey Ya!', 'Ms. Jackson', 'Roses'],
  'Owl City': ['Fireflies'],
  'Panic! At The Disco': ['I Write Sins Not Tragedies', 'High Hopes'],
  'Paramore': ['That\'s What You Get', 'Misery Business'],
  'Passenger': ['Let Her Go'],
  'Pat Benatar': ['We Belong', 'Love Is a Battlefield', 'Hit Me with Your Best Shot', 'Heartbreaker'],
  'Paul Russell': ['Lil Boo Thang'],
  'Paula Abdul': ['Straight Up', 'Cold Hearted', 'Opposites Attract'],
  'Pet Shop Boys': ['West End Girls', 'It\'s a Sin'],
  'Phil Collins': ['You Can\'t Hurry Love', 'In the Air Tonight', 'Sussudio', 'Against All Odds'],
  'Plain White T\'s': ['Hey There Delilah'],
  'Portugal. The Man': ['Feel It Still'],
  'Quarterflash': ['Harden My Heart'],
  'R.E.M.': ['It\'s the End of the World as We Know It', 'Losing My Religion', 'The One I Love', 'Everybody Hurts'],
  'REO Speedwagon': ['Take It on the Run', 'Keep On Loving You', 'Can\'t Fight This Feeling'],
  'Rachel Platten': ['Fight Song'],
  'Radiohead': ['Creep', 'Karma Police'],
  'Rascal Flatts': ['Life Is a Highway', 'Bless the Broken Road'],
  'Real McCoy': ['Another Night'],
  'Rick Springfield': ['Jessie\'s Girl'],
  'Robert Palmer': ['Addicted to Love', 'Simply Irresistible'],
  'Rockwell': ['Somebody\'s Watching Me'],
  'Romantics': ['What I Like About You'],
  'Roxette': ['Listen to Your Heart', 'It Must Have Been Love'],
  'Santana': ['Smooth', 'Maria Maria', 'Black Magic Woman'],
  'Scorpions': ['No One Like You', 'Rock You Like a Hurricane', 'Wind of Change'],
  'Seal': ['Kiss from a Rose'],
  'Semisonic': ['Closing Time'],
  'Shaboozey': ['A Bar Song (Tipsy)'],
  'Shakira': ['Hips Don\'t Lie', 'Whenever, Wherever', 'Waka Waka'],
  'Shania Twain': ['That Don\'t Impress Me Much', 'Man! I Feel Like a Woman', 'You\'re Still the One'],
  'Shawn Mendes': ['There\'s Nothing Holdin\' Me Back', 'Stitches', 'Treat You Better'],
  'Sia': ['Chandelier', 'Cheap Thrills', 'Unstoppable'],
  'Simple Minds': ['Don\'t You (Forget About Me)'],
  'Smash Mouth': ['All Star', 'I\'m a Believer', 'Walkin\' on the Sun'],
  'Snow Patrol': ['Chasing Cars'],
  'Soft Cell': ['Tainted Love'],
  'Spice Girls': ['Wannabe', 'Say You\'ll Be There'],
  'Spin Doctors': ['Two Princes'],
  'Starship': ['Nothing\'s Gonna Stop Us Now', 'We Built This City'],
  'Steve Miller Band': ['Abracadabra', 'The Joker', 'Fly Like an Eagle'],
  'Steve Winwood': ['Higher Love', 'Roll with It'],
  'Stevie Nicks': ['Edge of Seventeen', 'Stand Back'],
  'Sublime': ['Santeria', 'What I Got'],
  'Sugar Ray': ['Someday', 'Fly', 'Every Morning'],
  'Survivor': ['Eye of the Tiger'],
  'Suzanne Vega': ['Tom\'s Diner', 'Luka'],
  'Taio Cruz': ['Dynamite'],
  'Tal Bachman': ['She\'s So High'],
  'Talk Talk': ['It\'s My Life'],
  'Tears For Fears': ['Everybody Wants to Rule the World', 'Shout', 'Head Over Heels'],
  'Teddy Swims': ['Lose Control'],
  'The Beach Boys': ['Kokomo', 'Good Vibrations', 'California Girls'],
  'The Chainsmokers': ['Something Just Like This', 'Closer'],
  'The Fray': ['How to Save a Life', 'Over My Head (Cable Car)'],
  'The Killers': ['Mr. Brightside', 'Somebody Told Me', 'Human'],
  'The Outfield': ['Your Love'],
  'The Police': ['Every Breath You Take', 'Every Little Thing She Does Is Magic', 'Roxanne', 'Wrapped Around Your Finger'],
  'The Verve': ['Bittersweet Symphony'],
  'Third Eye Blind': ['Semi-Charmed Life', 'Jumper'],
  'Tiffany': ['I Think We\'re Alone Now'],
  'Tina Turner': ['What\'s Love Got to Do with It', 'Proud Mary', 'The Best'],
  'Toto': ['Africa', 'Hold the Line', 'Rosanna'],
  'Tracy Chapman': ['Fast Car', 'Give Me One Reason'],
  'Train': ['Hey, Soul Sister', 'Drops of Jupiter'],
  'Twisted Sister': ['We\'re Not Gonna Take It', 'I Wanna Rock'],
  'UB40': ['Red Red Wine', 'Can\'t Help Falling in Love'],
  'Uncle Kracker': ['Drift Away', 'Follow Me'],
  'Usher': ['DJ Got Us Fallin\' in Love', 'Yeah!', 'OMG'],
  'Vance Joy': ['Riptide'],
  'Vanessa Carlton': ['A Thousand Miles'],
  'Vertical Horizon': ['Everything You Want'],
  'Violent Femmes': ['Blister in the Sun'],
  'Wang Chung': ['Dance Hall Days', 'Everybody Have Fun Tonight'],
  'Wham!': ['Careless Whisper', 'Wake Me Up Before You Go-Go', 'Last Christmas'],
  'Whitesnake': ['Here I Go Again', 'Is This Love'],
  'ZZ Top': ['Sharp Dressed Man', 'Legs', 'Gimme All Your Lovin\'', 'La Grange'],
  // Stragglers caught by validation pass — referenced in format pools
  'Alex Warren': ['Ordinary'],
  'Avicii': ['Wake Me Up', 'Hey Brother', 'Levels'],
  'Benson Boone': ['Beautiful Things', 'Mystical Magical'],
  'Britney Spears': ['Toxic', '...Baby One More Time', 'Oops!...I Did It Again'],
  'Charlie Puth': ['See You Again', 'Attention', 'We Don\'t Talk Anymore'],
  'Daniel Powter': ['Bad Day'],
  'Tom Cochrane': ['Life Is a Highway'],

  // ---- V12.14: catalog additions for the rebuilt format pools.
  // Three to five seed songs each — enough to drive autocomplete on the
  // live screen and stat-track the artist. Lists can be expanded later
  // from real airplay via the station-artist pool editor.

  // Classic Rock additions
  'Cheap Trick': ['I Want You to Want Me', 'Surrender', 'The Flame'],
  // V12.18: KRFX additions from user-curated 50-artist Classic Rock list.
  // These nine artists were missing from the catalog entirely.
  'Bob Seger': ['Old Time Rock and Roll', 'Night Moves', 'Against the Wind', 'Turn the Page', 'Like a Rock'],
  'Creedence Clearwater Revival': ['Fortunate Son', 'Bad Moon Rising', 'Down on the Corner', 'Have You Ever Seen the Rain', 'Born on the Bayou'],
  'Collective Soul': ['Shine', 'December', 'The World I Know', 'Run'],
  'Rob Zombie': ['Dragula', 'Living Dead Girl', 'Thunder Kiss \'65'],
  'Smashing Pumpkins': ['1979', 'Bullet with Butterfly Wings', 'Today', 'Tonight, Tonight'],
  'Alice In Chains': ['Man in the Box', 'Would?', 'Rooster', 'Down in a Hole', 'No Excuses'],
  'Bush': ['Everything Zen', 'Glycerine', 'Comedown', 'Machinehead'],
  'Ozzy Osbourne': ['Crazy Train', 'Mr. Crowley', 'Bark at the Moon', 'No More Tears', 'Mama, I\'m Coming Home'],
  'The Offspring': ['Pretty Fly (For a White Guy)', 'Self Esteem', 'You\'re Gonna Go Far, Kid', 'Come Out and Play'],
  'Eric Clapton': ['Layla', 'Tears in Heaven', 'Wonderful Tonight', 'Cocaine'],
  'Heart': ['Barracuda', 'Magic Man', 'Crazy on You', 'Alone'],
  'Jimi Hendrix': ['Purple Haze', 'All Along the Watchtower', 'Voodoo Child', 'Hey Joe'],
  'Lynyrd Skynyrd': ['Sweet Home Alabama', 'Free Bird', 'Simple Man', 'Gimme Three Steps'],
  'Pink Floyd': ['Another Brick in the Wall', 'Wish You Were Here', 'Money', 'Comfortably Numb', 'Time'],
  'Styx': ['Come Sail Away', 'Renegade', 'Mr. Roboto', 'Lady'],
  'The Doors': ['Light My Fire', 'Break on Through', 'Riders on the Storm', 'Hello, I Love You'],
  'U2': ['One', 'With or Without You', 'Beautiful Day', 'Where the Streets Have No Name', 'Sunday Bloody Sunday', 'I Still Haven\'t Found What I\'m Looking For'],

  // V12.23: KXKL Kool 105 additions from user-curated 77-artist Classic
  // Hits list. These 20 artists were missing from the catalog entirely.
  // Seed songs chosen to favor the tracks most likely to actually air
  // on Kool 105 — the user's specifically-named tracks (when given)
  // are always seeded first.
  'Sting': ['Englishman in New York', 'Fields of Gold', 'If You Love Somebody Set Them Free', 'Desert Rose'],
  'Beck': ['Loser', 'Where It\'s At', 'E-Pro', 'Devils Haircut'],
  'The Cars': ['Just What I Needed', 'Drive', 'You Might Think', 'Shake It Up'],
  'Tommy Tutone': ['867-5309/Jenny'],
  'George Michael': ['Faith', 'Careless Whisper', 'Father Figure', 'Freedom! \'90'],
  'Culture Club': ['Karma Chameleon', 'Do You Really Want to Hurt Me', 'Time (Clock of the Heart)'],
  'Chicago': ['25 or 6 to 4', 'Saturday in the Park', 'You\'re the Inspiration', 'Hard to Say I\'m Sorry'],
  'Duran Duran': ['Hungry Like the Wolf', 'Rio', 'Notorious', 'Ordinary World', 'Girls on Film'],
  'Don Henley': ['The Boys of Summer', 'Dirty Laundry', 'The End of the Innocence', 'All She Wants to Do Is Dance'],
  'The Clash': ['Rock the Casbah', 'Should I Stay or Should I Go', 'London Calling', 'Train in Vain'],
  'The Bangles': ['Manic Monday', 'Walk Like an Egyptian', 'Eternal Flame', 'Hazy Shade of Winter'],
  'Tone Loc': ['Funky Cold Medina', 'Wild Thing'],
  'Sir Mix-a-Lot': ['Baby Got Back', 'Posse on Broadway'],
  'House of Pain': ['Jump Around', 'Shamrocks and Shenanigans'],
  '3rd Eye Blind': ['Semi-Charmed Life', 'Jumper', 'How\'s It Going to Be', 'Never Let You Go'],
  // a-ha: catalog already has 'A-ha' — skipped here, would dupe
  'Toni Basil': ['Mickey'],
  'John Parr': ['St. Elmo\'s Fire (Man in Motion)', 'Naughty Naughty'],
  'Eddy Grant': ['Electric Avenue', 'I Don\'t Wanna Dance'],
  'Elton John': ['Rocket Man', 'Tiny Dancer', 'Bennie and the Jets', 'Crocodile Rock', 'Your Song', 'Don\'t Let the Sun Go Down on Me'],

  // V12.24: KOSI 101.1 additions from user-curated 55-artist Adult
  // Contemporary list. Only one artist was missing — HUNTR/X is the
  // fictional K-pop trio from the Netflix animated film "KPop Demon
  // Hunters" (2025). The voice actors who actually sing the tracks
  // (EJAE, Audrey Nuna, Rei Ami) credit as HUNTR/X. "Golden" hit
  // Billboard Hot 100 and is getting real adult-contemporary airplay.
  'HUNTR/X': ['Golden', 'How It\'s Done', 'What It Sounds Like'],

  // V12.25: KYGO 98.5 Denver Country airplay scrape additions.
  // Real onlineradiobox playlist data — 30 country artists that weren't
  // in the catalog. Seed songs picked from the actual airplay window
  // (the track that played) + 2-3 well-known hits to give autocomplete
  // some breadth.
  'Blake Shelton': ['Sure Be Cool If You Did', 'God\'s Country', 'Boys \'Round Here', 'Honey Bee', 'Some Beach'],
  'Brantley Gilbert': ['Good Damn', 'Bottoms Up', 'You Don\'t Know Her Like I Do', 'One Hell of an Amen'],
  'Brothers Osborne': ['Stay A Little Longer', 'It Ain\'t My Fault', 'I\'m Not for Everyone'],
  'Bryan Martin': ['Tug O\' War', 'We Ride', 'Coal Dust'],
  'Carin Leon': ['Lighter', 'Primera Cita', 'Que Vuelvas'],
  'Chase Matthew': ['Darlin\'', 'County Line', 'Love You Again'],
  'Chris Janson': ['Fix A Drink', 'Buy Me a Boat', 'Drunk Girl'],
  'Cole Swindell': ['How Is She', 'You Should Be Here', 'She Had Me at Heads Carolina', 'Single Saturday Night'],
  'Corey Kent': ['Empty Words', 'Wild as Her', 'Something\'s Gonna Kill Me'],
  'Dan + Shay': ['Say So', 'Tequila', '10,000 Hours', 'Speechless'],
  'Dylan Scott': ['My Girl', 'New Truck', 'Nobody'],
  'Ella Langley': ['Choosin\' Texas', 'Be Her', 'You Look Like You Love Me', 'I Can\'t Love You Anymore'],
  'Elle King': ['Drunk (And I Don\'t Wanna Go Home)', 'Ex\'s & Oh\'s', 'Worth a Shot'],
  'Flatland Cavalry': ['Never Comin\' Back', 'Mornings With You', 'A Life Where We Work Out'],
  'Jake Owen': ['Made For You', 'Barefoot Blue Jean Night', 'Beachin\'', 'I Was Jack (You Were Diane)'],
  'Jon Pardi': ['Boots Off', 'Your Heart Or Mine', 'Heartache Medication', 'Dirt on My Boots'],
  'Kane Brown': ['Thank God', 'Heaven', 'What Ifs', 'One Mississippi'],
  'Katelyn Brown': ['Thank God'],
  'Kevin Powers': ['Move On'],
  'Kip Moore': ['Somethin\' \'Bout A Truck', 'Beer Money', 'Hey Pretty Girl'],
  'Lauren Alaina': ['All My Exes', 'Road Less Traveled', 'What Ifs'],
  'Maren Morris': ['The Bones', 'My Church', 'I Could Use a Love Song'],
  'Max McNown': ['Better Me For You (Brown Eyes)', 'Wrong For Me', 'Beautiful Things'],
  'Randy Houser': ['Back In The Bottle', 'How Country Feels', 'We Went'],
  'Stella Lefty': ['Boston'],
  'The Band Perry': ['Better Dig Two', 'If I Die Young', 'Done.'],
  'Toby Keith': ['As Good As I Once Was', 'Should\'ve Been a Cowboy', 'How Do You Like Me Now?!', 'Red Solo Cup'],
  'Tucker Wetmore': ['Brunette', 'Wind Up Missin\' You', 'What Would You Do'],
  'Tyler Hubbard': ['Park', '5 Foot 9', 'Dancin\' in the Country'],
  'Vincent Mason': ['Wish You Well', 'Hummingbird'],

  // V12.25: KQKS 107.5 KS Denver Rhythmic Hot AC airplay scrape additions.
  // Real onlineradiobox playlist data — 42 hip-hop/R&B/rhythmic-pop
  // artists that weren't in the catalog. Includes featured artists
  // (Krayzie Bone, Kandi, Swae Lee, etc.) per the rule: if they
  // appeared on airplay, they're draftable.
  '2Pac': ['Changes', 'California Love', 'Dear Mama', 'Hit \'Em Up'],
  'Ashanti': ['What\'s Luv', 'Foolish', 'Always on Time', 'Happy'],
  'Bubba Sparxx': ['Ms. New Booty', 'Deliverance', 'Ugly'],
  'Chamillionaire': ['Ridin\'', 'Turn It Up', 'Hip Hop Police'],
  'Ciara': ['Goodies', '1, 2 Step', 'Level Up', 'Love Sex Magic'],
  'Coolio': ['Gangsta\'s Paradise', 'Fantastic Voyage', 'C U When U Get There'],
  'Disclosure': ['Latch', 'You & Me', 'Omen'],
  'Dr. Dre': ['Still D.R.E.', 'Nuthin\' But a \'G\' Thang', 'The Next Episode', 'California Love'],
  'E-40': ['U And Dat', 'Tell Me When to Go', 'Choices (Yup)'],
  'Faith Evans': ['One More Chance', 'Love Like This', 'I\'ll Be Missing You'],
  'Fat Joe': ['What\'s Luv', 'Lean Back', 'All the Way Up'],
  'French Montana': ['Ever Since You Left Me', 'Unforgettable', 'Pop That'],
  'Fugees': ['Killing Me Softly', 'Ready or Not', 'Fu-Gee-La'],
  'Ghost Town DJ\'s': ['My Boo'],
  'Ginuwine': ['Differences', 'Pony', 'So Anxious', 'In Those Jeans'],
  'Jeremih': ['Don\'t Tell \'Em', 'Birthday Sex', 'Down on Me'],
  'Juvenile': ['Slow Motion', 'Back That Azz Up', 'Ha'],
  'Kandi': ['U And Dat', 'Don\'t Think I\'m Not'],
  'Kehlani': ['Folded', 'Honey', 'Distraction', 'After Hours'],
  'Kelly Rowland': ['Dilemma', 'Motivation', 'When Love Takes Over'],
  'Khalid': ['Better', 'Location', 'Talk', 'Young Dumb & Broke'],
  'Krayzie Bone': ['Ridin\'', 'Tha Crossroads', 'Notorious Thugs'],
  'Lauryn Hill': ['Can\'t Take My Eyes Off Of You', 'Doo Wop (That Thing)', 'Ex-Factor'],
  'Leon Thomas': ['Mutt', 'Yes It Is', 'Breaking Point'],
  'Mario': ['Let Me Love You', 'How Do I Breathe', 'Just a Friend 2002'],
  'Mase': ['What You Want', 'Feel So Good', 'Lookin\' at Me'],
  'Miguel': ['Sure Thing', 'Adorn', 'Coffee'],
  'Naughty By Nature': ['Hip Hop Hooray', 'O.P.P.', 'Feel Me Flow'],
  'Ne-Yo': ['Give Me Everything', 'Closer', 'So Sick', 'Miss Independent'],
  'Notorious B.I.G.': ['One More Chance', 'Juicy', 'Hypnotize', 'Big Poppa'],
  'Pitbull': ['Give Me Everything', 'DJ Got Us Fallin\' In Love', 'Timber', 'Hotel Room Service'],
  'Rema': ['Calm Down', 'Charm', 'Holiday'],
  'Roddy Ricch': ['The Box', 'High Fashion', 'Ricch Forever'],
  'Sean Paul': ['Gimme Tha Light', 'Temperature', 'Get Busy'],
  'Selena Gomez': ['Calm Down', 'Lose You to Love Me', 'Same Old Love', 'Hands to Myself'],
  'Swae Lee': ['Sunflower', 'Unforgettable', 'Won\'t Be Late'],
  'T-Pain': ['U And Dat', 'Buy U a Drank', 'Bartender', 'I\'m N Luv (Wit a Stripper)'],
  'Terror Squad': ['Lean Back'],
  'The Game': ['Hate It Or Love It', 'How We Do', 'Dreams'],
  'Total': ['What You Want', 'Can\'t You See', 'Kissin\' You'],
  'Twista': ['Slow Jamz', 'Overnight Celebrity', 'Wetter'],
  'YG': ['Don\'t Tell \'Em', 'My Hitta', 'Big Bank'],

  // Country additions
  'Bailey Zimmerman': ['Rock and a Hard Place', 'Religiously', 'Where It Ends'],
  'Brad Paisley': ['Whiskey Lullaby', 'She\'s Everything', 'Mud on the Tires'],
  'Brooks & Dunn': ['Boot Scootin\' Boogie', 'Neon Moon', 'Believe'],
  'Cody Johnson': ['\'Til You Can\'t', 'The Painter', 'Dirt Cheap'],
  'Dustin Lynch': ['Small Town Boy', 'Thinking \'Bout You', 'Stars Like Confetti'],
  'Florida Georgia Line': ['Cruise', 'H.O.L.Y.', 'Meant to Be', 'May We All'],
  'HARDY': ['Wait in the Truck', 'One Beer', 'TRUCK BED'],
  'Jelly Roll': ['Need a Favor', 'Save Me', 'Son of a Sinner', 'Halfway to Hell'],
  'Jordan Davis': ['Buy Dirt', 'Next Thing You Know', 'Singles You Up'],
  'Keith Urban': ['Blue Ain\'t Your Color', 'Somebody Like You', 'Stupid Boy'],
  'Luke Bryan': ['Country Girl (Shake It for Me)', 'Drink a Beer', 'Play It Again', 'Most People Are Good'],
  'Megan Moroney': ['Tennessee Orange', 'I\'m Not Pretty', 'No Caller ID'],
  'Old Dominion': ['One Man Band', 'Snapback', 'I Was on a Boat That Day'],
  'Parker McCollum': ['Pretty Heart', 'To Be Loved by You', 'Burn It Down'],
  'Riley Green': ['I Wish Grandpas Never Died', 'Different \'Round Here', 'Worst Way'],
  'Russell Dickerson': ['Yours', 'Love You Like I Used To', 'God Gave Me a Girl'],
  'Sam Hunt': ['Body Like a Back Road', 'House Party', 'Take Your Time'],
  'Thomas Rhett': ['Die a Happy Man', 'Marry Me', 'Craving You', 'Life Changes'],
  'Zach Top': ['Sounds Like the Radio', 'Cold Beer & Country Music', 'I Never Lie'],

  // Hip-Hop / R&B additions
  '6lack': ['PRBLMS', 'Calling My Phone', 'Worst Luck'],
  'Bryson Tiller': ['Don\'t', 'Exchange', 'Whatever She Wants'],
  'Chris Brown': ['No Guidance', 'Run It!', 'With You', 'Forever'],
  'Coco Jones': ['ICU', 'Caliber', 'Most Beautiful Design'],
  'GiveOn': ['Heartbreak Anniversary', 'For Tonight', 'Stuck on You'],
  'GloRilla': ['F.N.F. (Let\'s Go)', 'Tomorrow 2', 'Yeah Glo!'],
  'Ice Spice': ['Munch (Feelin\' U)', 'Princess Diana', 'Think U the S**t (Fart)'],
  'Jack Harlow': ['Industry Baby', 'First Class', 'Lovin On Me'],
  'Kanye West': ['Stronger', 'Heartless', 'Flashing Lights', 'Gold Digger'],
  'Latto': ['Big Energy', 'Put It on da Floor', 'Sunday Service'],
  'Lil Baby': ['Drip Too Hard', 'Yes Indeed', 'On Me'],
  'Lil Wayne': ['Lollipop', 'A Milli', 'Mrs. Officer', '6 Foot 7 Foot'],
  'Muni Long': ['Hrs and Hrs', 'Made for Me'],
  'Nicki Minaj': ['Super Bass', 'Anaconda', 'Starships', 'FTCU'],
  'Sexyy Red': ['Pound Town', 'SkeeYee', 'Get It Sexyy'],
  'Summer Walker': ['Girls Need Love', 'Playing Games', 'Body'],
  'Tate McRae': ['Greedy', 'You Broke Me First', 'It\'s Ok I\'m Ok'],
  'Tyla': ['Water', 'Truth or Dare', 'Jump'],
  'Victoria Monét': ['On My Mama', 'Smoke', 'Coastin\''],

  // Throwback additions
  '50 Cent': ['In da Club', 'Candy Shop', '21 Questions', 'P.I.M.P.'],
  'Aaliyah': ['Try Again', 'Are You That Somebody', 'More Than a Woman'],
  'Alicia Keys': ['Fallin\'', 'No One', 'If I Ain\'t Got You', 'Girl on Fire'],
  'Boyz II Men': ['End of the Road', 'I\'ll Make Love to You', 'Motownphilly'],
  'Brandy': ['The Boy Is Mine', 'Have You Ever?', 'Sittin\' Up in My Room'],
  'Destiny\'s Child': ['Say My Name', 'Survivor', 'Bootylicious', 'Independent Women'],
  'Eminem': ['Lose Yourself', 'Stan', 'Without Me', 'The Real Slim Shady', 'Not Afraid'],
  'Jay-Z': ['99 Problems', 'Empire State of Mind', 'Big Pimpin\'', 'Hard Knock Life'],
  'Ludacris': ['Move Bitch', 'Stand Up', 'Money Maker', 'What\'s Your Fantasy'],
  'Mary J. Blige': ['Family Affair', 'Real Love', 'Be Without You'],
  'Missy Elliott': ['Work It', 'Get Ur Freak On', 'Lose Control'],
  'Nelly': ['Hot in Herre', 'Dilemma', 'Ride Wit Me', 'Country Grammar'],
  'Snoop Dogg': ['Drop It Like It\'s Hot', 'Gin and Juice', 'Young, Wild & Free'],
  'Tupac': ['California Love', 'Changes', 'Dear Mama', 'Hit \'Em Up'],
};

const ARTIST_POOL = Object.keys(ARTIST_SONG_CATALOG);

// ============================================================
// STATION FORMATS + FORMAT-AWARE ARTIST POOLS
// ============================================================
// Each format identifies a subset of artists from the master catalog that
// realistically play on a station of that format. The Draft Pool builder
// uses these as the 40% "format defaults" bucket, then layers in recent
// plays, custom artists, and historical favorites.
//
// Format keys are STABLE — they're persisted on stations and referenced
// by the Mock provider. Adding a format = add a key here + (ideally) at
// least 8-12 artists for credible drafts.

// V12.11: Format accents collapsed to Whalers palette + neutrals.
// Previously each format had its own color (12+ distinct hues including
// pink, purple, cyan). The result was a palette explosion that hurt
// cohesion. Now: blue, green, amber, red, and silver — the same five
// colors used everywhere else in the app. Stations are still visually
// distinguishable through their format LABEL and station name, not
// through unique color identity.
const STATION_FORMATS = {
  'Classic Rock':         { id: 'classic_rock',     accent: '#046A38' },
  'Active Rock':          { id: 'active_rock',      accent: '#B91C1C' },
  'Alternative':          { id: 'alternative',      accent: '#5A6268' },
  'Pop':                  { id: 'pop',              accent: '#00205B' },
  'Top 40':               { id: 'top_40',           accent: '#00205B' },
  'Hot AC':               { id: 'hot_ac',           accent: '#B45309' },
  'Adult Contemporary':   { id: 'adult_contemp',    accent: '#B45309' },
  'Country':              { id: 'country',          accent: '#B45309' },
  'Hip-Hop/R&B':          { id: 'hiphop_rnb',       accent: '#5A6268' },
  'Throwback':            { id: 'throwback',        accent: '#00205B' },
  'Classic Hits':         { id: 'classic_hits',     accent: '#00205B' },
  'AAA':                  { id: 'aaa',              accent: '#046A38' },
};

const FORMAT_KEYS = Object.keys(STATION_FORMATS);

const FORMAT_ARTIST_POOLS = {
  'Classic Rock': [
    // V12.18: rebuilt from user-curated KRFX 103.5 "The Fox" Denver list.
    // 50 artists — the actual rotation as captured by the user on their
    // iPhone notes. Replaces the V12.14 training-data inference. Sorted
    // alphabetically for predictable draft-screen scrolling.
    '3 Doors Down', 'AC/DC', 'Aerosmith', 'Alice In Chains', 'Black Sabbath',
    'Billy Idol', 'Bob Seger', 'Bon Jovi', 'Boston', 'Bush',
    'Collective Soul', 'Creedence Clearwater Revival', 'Def Leppard', 'Eric Clapton',
    'Fleetwood Mac', 'Foo Fighters', 'Genesis', 'Green Day',
    "Guns N' Roses", 'Heart', 'John Mellencamp', 'Journey', 'Led Zeppelin',
    'Linkin Park', 'Lit', 'Lynyrd Skynyrd', 'Metallica', 'Motley Crue',
    'Nickelback', 'Nirvana', 'Ozzy Osbourne', 'Pearl Jam', 'Pink Floyd',
    'Poison', 'Queen', 'Red Hot Chili Peppers', 'Rob Zombie', 'Rush',
    'Scorpions', 'Smashing Pumpkins', 'Steve Miller Band', 'Stevie Nicks',
    'Stone Temple Pilots', 'The Doors', 'The Offspring', 'The Rolling Stones',
    'The Who', 'Tom Petty', 'U2', 'Van Halen', 'ZZ Top',
  ],
  'Active Rock': [
    'Metallica', 'Foo Fighters', 'Tool', 'Soundgarden', 'Stone Temple Pilots',
    'Alice in Chains', 'Rage Against the Machine', 'System of a Down',
    'Disturbed', 'Godsmack', 'Shinedown', 'Three Days Grace', 'Linkin Park',
    'Nickelback', 'Creed', 'Staind', 'Seether', 'Breaking Benjamin',
    'Iron Maiden',
  ],
  'Alternative': [
    'Foo Fighters', 'Red Hot Chili Peppers', 'Nirvana', 'Pearl Jam',
    'Stone Temple Pilots', 'The Black Keys', 'Kings of Leon',
    'Cage the Elephant', 'My Chemical Romance', 'Weezer', 'Green Day',
    'Imagine Dragons',
  ],
  'Pop': [
    'Taylor Swift', 'Bruno Mars', 'Adele', 'Ed Sheeran', 'Maroon 5',
    'Dua Lipa', 'The Weeknd', 'Harry Styles', 'Billie Eilish',
    'Olivia Rodrigo', 'Doja Cat', 'Post Malone', 'Justin Bieber',
    'Ariana Grande', 'Sabrina Carpenter', 'OneRepublic',
  ],
  'Top 40': [
    'Taylor Swift', 'Bruno Mars', 'The Weeknd', 'Dua Lipa', 'Post Malone',
    'Harry Styles', 'Olivia Rodrigo', 'Doja Cat', 'Sabrina Carpenter',
    'Drake', 'SZA', 'Travis Scott', 'Ed Sheeran', 'Billie Eilish',
    'Justin Bieber', 'Ariana Grande',
  ],
  'Hot AC': [
    // V12.2: Rebuilt from KOSI 101.1 24-hour playlist scrape — a real
    // Denver Hot AC/Adult Contemporary station. Mixes modern hits with
    // 80s/90s/2000s. The list below reflects actual rotation depth.
    'Taylor Swift', 'Bruno Mars', 'Ed Sheeran', 'Maroon 5', 'Adele',
    'P!nk', 'Coldplay', 'Sam Smith', 'Imagine Dragons', 'Harry Styles',
    'Lewis Capaldi', 'OneRepublic', 'Lady Gaga', 'Katy Perry', 'Sabrina Carpenter',
    'Justin Bieber', 'Post Malone', 'The Weeknd', 'Olivia Dean', 'Alex Warren',
    'Bryan Adams', 'Rachel Platten', 'Train', 'Matchbox Twenty', 'Lifehouse',
    'The Fray', 'Hozier', 'Vance Joy', 'Avicii', 'Charlie Puth',
    'Shawn Mendes', 'Benson Boone', 'Teddy Swims', 'Myles Smith',
  ],
  'Adult Contemporary': [
    // V12.24: augmented from user-curated KOSI 101.1 list (55 artists)
    // merged with V12.2 scrape (39 artists). Deduped and alpha-sorted.
    // 71 unique artists. Heavily current-leaning — modern AC stations
    // like KOSI have drifted from pure 90s/2000s into a mix of today's
    // hits + adult standards. List spans 80s pop pillars, 90s/2000s
    // adult contemporary, modern pop, and 2024-2026 current hits.
    'Ace of Base', 'Adele', 'Aerosmith', 'Alex Warren', 'Backstreet Boys',
    'Benson Boone', 'Billy Joel', 'Bon Jovi', 'Britney Spears', 'Bruno Mars',
    'Bryan Adams', 'Carrie Underwood', 'Christina Aguilera', 'Coldplay',
    'Cyndi Lauper', 'Dasha', 'Dua Lipa', 'Ed Sheeran', 'Edwin McCain',
    'Ellie Goulding', 'Goo Goo Dolls', 'Green Day', 'HUNTR/X', 'Harry Styles',
    'Hozier', 'Imagine Dragons', 'James Arthur', 'John Mellencamp', 'Journey',
    'Justin Bieber', 'Justin Timberlake', 'Katy Perry', 'Kelly Clarkson',
    'Kenny Loggins', 'Lady A', 'Lady Gaga', 'Lewis Capaldi', 'Lifehouse',
    'Lorde', 'Luke Combs', 'Madonna', 'Maroon 5', 'Matchbox Twenty',
    'Men at Work', 'Michael Jackson', 'Miley Cyrus', 'NSYNC', 'OneRepublic',
    'P!nk', 'Pat Benatar', 'Phil Collins', 'Prince', 'Queen', 'Rihanna',
    'Sabrina Carpenter', 'Sam Smith', 'Shaboozey', 'Shakira', 'Sia',
    'Simple Minds', 'Stevie Nicks', 'Taylor Swift', 'Tears For Fears',
    'Teddy Swims', 'The Bangles', 'The Fray', 'The Weeknd', 'Tina Turner',
    'Toto', 'Train', 'Whitney Houston',
  ],
  'Country': [
    // V12.25: augmented from real KYGO 98.5 Denver airplay scrape
    // (48 artists) merged with V12.14 training-data Country pool
    // (35 artists). Deduped and alpha-sorted — 66 unique artists span
    // current Nashville mainstream, established legends, newer acts,
    // and country crossovers (Post Malone, Elle King).
    'Bailey Zimmerman', 'Blake Shelton', 'Brad Paisley', 'Brantley Gilbert',
    'Brooks & Dunn', 'Brothers Osborne', 'Bryan Martin', 'Carin Leon',
    'Carrie Underwood', 'Chase Matthew', 'Chris Janson', 'Chris Stapleton',
    'Cody Johnson', 'Cole Swindell', 'Corey Kent', 'Dan + Shay', 'Dasha',
    'Dustin Lynch', 'Dylan Scott', 'Ella Langley', 'Elle King', 'Eric Church',
    'Flatland Cavalry', 'Florida Georgia Line', 'Garth Brooks', 'HARDY',
    'Jake Owen', 'Jason Aldean', 'Jelly Roll', 'Jon Pardi', 'Jordan Davis',
    'Kacey Musgraves', 'Kane Brown', 'Katelyn Brown', 'Keith Urban',
    'Kenny Chesney', 'Kevin Powers', 'Kip Moore', 'Lady A', 'Lainey Wilson',
    'Lauren Alaina', 'Luke Bryan', 'Luke Combs', 'Maren Morris', 'Max McNown',
    'Megan Moroney', 'Miranda Lambert', 'Morgan Wallen', 'Old Dominion',
    'Parker McCollum', 'Post Malone', 'Randy Houser', 'Riley Green',
    'Russell Dickerson', 'Sam Hunt', 'Shaboozey', 'Stella Lefty',
    'The Band Perry', 'Thomas Rhett', 'Tim McGraw', 'Toby Keith',
    'Tucker Wetmore', 'Tyler Hubbard', 'Vincent Mason', 'Zach Bryan', 'Zach Top',
  ],
  'Hip-Hop/R&B': [
    // V12.25: augmented from real KQKS 107.5 KS Denver airplay scrape
    // (74 artists) merged with V12.14 training-data pool (34 artists).
    // Deduped and alpha-sorted — 94 unique artists span current rhythmic
    // CHR, golden-era hip-hop pillars, 2000s R&B, and crossover pop hits
    // (Justin Bieber, Selena Gomez, Daft Punk) that KQKS actually airs.
    '21 Savage', '2Pac', '50 Cent', '6lack', 'Aaliyah', 'Alicia Keys',
    'Ariana Grande', 'Ashanti', 'Beyoncé', 'Bruno Mars', 'Bryson Tiller',
    'Bubba Sparxx', 'Cardi B', 'Chamillionaire', 'Chris Brown', 'Ciara',
    'Coco Jones', 'Coolio', 'Daft Punk', 'Disclosure', 'Doja Cat', 'Dr. Dre',
    'Drake', 'E-40', 'Eminem', 'Faith Evans', 'Fat Joe', 'French Montana',
    'Fugees', 'Future', 'Ghost Town DJ\'s', 'Ginuwine', 'GiveOn', 'GloRilla',
    'Ice Spice', 'J. Cole', 'Jack Harlow', 'Jay-Z', 'Jeremih', 'Justin Bieber',
    'Justin Timberlake', 'Juvenile', 'Kandi', 'Kanye West', 'Katy Perry',
    'Kehlani', 'Kelly Rowland', 'Kendrick Lamar', 'Khalid', 'Krayzie Bone',
    'Latto', 'Lauryn Hill', 'Leon Thomas', 'Lil Baby', 'Lil Wayne',
    'Mariah Carey', 'Mario', 'Mary J. Blige', 'Mase', 'Megan Thee Stallion',
    'Miguel', 'Missy Elliott', 'Muni Long', 'Naughty By Nature', 'Ne-Yo',
    'Nelly', 'Nicki Minaj', 'Notorious B.I.G.', 'Pitbull', 'Post Malone',
    'Rema', 'Rihanna', 'Roddy Ricch', 'SZA', 'Sam Smith', 'Sean Paul',
    'Selena Gomez', 'Sexyy Red', 'Snoop Dogg', 'Summer Walker', 'Swae Lee',
    'T-Pain', 'Tate McRae', 'Terror Squad', 'The Game', 'The Weeknd', 'Total',
    'Travis Scott', 'Twista', 'Tyla', 'Tyler, The Creator', 'Usher',
    'Victoria Monét', 'YG',
  ],
  'Throwback': [
    // V12.14: rebuilt for KJMN "Jammin' 95.7" Denver — 90s/2000s rhythmic
    // throwback station. Heavy on old-school hip-hop, R&B classics, and
    // turn-of-millennium pop hits. Mix is roughly 60% hip-hop/R&B, 30%
    // pop, 10% dance/freestyle.
    '50 Cent', 'Aaliyah', 'Alicia Keys', 'Backstreet Boys', 'Beyoncé',
    'Black Eyed Peas', 'Blackstreet', 'Boyz II Men', 'Britney Spears',
    'Brandy', 'Christina Aguilera', 'Destiny\'s Child', 'Eminem',
    'Janet Jackson', 'Jay-Z', 'Justin Timberlake', 'Kanye West', 'Ludacris',
    'Madonna', 'Mariah Carey', 'Mary J. Blige', 'Michael Jackson',
    'Missy Elliott', 'Nelly', 'No Doubt', 'NSYNC', 'OutKast', 'Prince',
    'Rihanna', 'Snoop Dogg', 'Spice Girls', 'TLC', 'Tupac', 'Usher',
    'Whitney Houston',
  ],
  'Classic Hits': [
    // V12.23: augmented from user-curated KXKL Kool 105 list (77 artists)
    // merged with the existing V12.2 scrape (32 artists). Deduped and
    // alpha-sorted. 83 unique artists span 80s pop pillars, 80s/90s rock,
    // 90s alternative, dance-pop, and modern crossovers — matches the
    // actual eclectic rotation Kool 105 plays today.
    '3rd Eye Blind', 'A-ha', 'AC/DC', 'Ace of Base', 'Aerosmith',
    'Alanis Morissette', 'Beck', 'Belinda Carlisle', 'Billy Idol', 'Billy Joel',
    'Bon Jovi', 'Bruce Springsteen', 'Bruno Mars', 'Bryan Adams', 'Chicago',
    'Corey Hart', 'Culture Club', 'Cyndi Lauper', 'Def Leppard', 'Don Henley',
    'Duran Duran', 'Eagles', 'Earth, Wind & Fire', 'Eddy Grant', 'Elton John',
    'Eurythmics', 'Fleetwood Mac', 'Foreigner', 'Genesis', 'George Michael',
    'Goo Goo Dolls', 'Green Day', 'Gwen Stefani', 'Hall & Oates', 'House of Pain',
    'Huey Lewis & The News', 'INXS', 'John Mellencamp', 'John Parr', 'Journey',
    'Katy Perry', 'Kenny Loggins', 'Lady Gaga', 'Lionel Richie', 'Madonna',
    'Matchbox Twenty', 'Men at Work', 'Michael Jackson', 'Nena', 'No Doubt',
    'Pat Benatar', 'Pet Shop Boys', 'Phil Collins', 'Prince', 'Queen',
    'R.E.M.', 'REO Speedwagon', 'Red Hot Chili Peppers', 'Rick Springfield',
    'Scorpions', 'Shakira', 'Shania Twain', 'Simple Minds', 'Sir Mix-a-Lot',
    'Starship', 'Sting', 'Survivor', 'Tears For Fears', 'The Bangles',
    'The Cars', 'The Clash', 'The Outfield', 'The Police', 'Tina Turner',
    'Tom Petty', 'Tommy Tutone', 'Tone Loc', 'Toni Basil', 'Toto',
    'U2', 'Van Halen', 'Wham!', 'Whitney Houston',
  ],
  'AAA': [
    'The Black Keys', 'Kings of Leon', 'Cage the Elephant', 'Foo Fighters',
    'Coldplay', 'Imagine Dragons', 'John Mayer', 'Red Hot Chili Peppers',
    'Hozier', 'Mumford & Sons', 'Vance Joy',
  ],
};

// ============================================================
// DRAFT POOL BUILDER
// ============================================================
// Pure function. Produces an ordered, deduplicated artist list for the
// given station context. Priority buckets:
//
//   1. FORMAT     — artists that match this station's format
//   2. RECENT     — artists recently played on this station (provider data)
//   3. CUSTOM     — user-added artists from previous drafts
//   4. HISTORICAL — artists this user has drafted often before
//   5. FALLBACK   — universal pool (alphabetical), only if buckets thin
//
// The 40/40/10/10 ratio is a soft target; actual ordering is by bucket
// priority so the most-relevant artists surface first. Caller can pass
// `recentPlays` from a provider; if omitted, we skip that bucket.

// V12: station-owned draft pool. Reads exclusively from this station's
// own artist ecosystem (stationArtists[stationId]). Does NOT bleed
// artists from other stations or from historical favorites that don't
// belong to this station. If the station has no pool yet, falls back
// to the format defaults (the same data that would seed it).
//
// Filters out:
//   - deleted records
//   - inactive (hidden) records
//
// Sort priority (per V12 spec):
//   1. recently played on station (lastPlayedAt desc)
//   2. draft success rate (high to low; null = lowest)
//   3. manual additions (source === 'manual') after success-sorted ones
//   4. alphabetical
//
// We don't truncate aggressively — users expect to see their full pool
// in the draft picker. The component can paginate if pools grow huge.
// V12.26: Tier-based draft pool ranking.
// Replaces the previous flat "recency then success" sort. Each artist
// is assigned a TIER (HOT > RELIABLE > recently drafted > UNTESTED >
// DEEP CUT > COLD > TRAP) and sorted within tier by lastDraftedAt
// descending. The returned entries carry a small LABEL the draft UI
// surfaces inline so the player can see WHY an artist sits where it does.
//
// Tier order priority (lower = higher in the pool):
//   1 HOT        — 3+ drafts, success ≥ 67%, played recently
//   2 RELIABLE   — 3+ drafts, success ≥ 50%
//   3 RECENT     — drafted in the last 30 days but not enough sample for HOT/RELIABLE
//   4 UNTESTED   — never drafted but exists in the pool (default state)
//   5 DEEP CUT   — never drafted AND never seen on the radio
//   6 COLD       — 3+ drafts, no plays in last 14 days
//   7 TRAP       — 4+ drafts, success < 25%
//
// Returns [{ name, label, tier, accent }] — accent is a color hint
// the UI can use for the tier label chip.
function buildDraftPool({ station, stationArtists }) {
  if (!station || !station.id) return [];
  let pool = stationArtists && stationArtists[station.id];
  // Defensive fallback for unseeded stations (e.g. a game saved before
  // V12 with a station that didn't go through ensureSeeded).
  if (!pool || Object.keys(pool).length === 0) {
    if (station.format && FORMAT_ARTIST_POOLS[station.format]) {
      pool = {};
      for (const name of FORMAT_ARTIST_POOLS[station.format]) {
        pool[name] = stationArtistsEngine.emptyRecord(name, 'seed');
      }
    } else {
      return [];
    }
  }

  const now = Date.now();
  const daysAgo = (iso) => iso ? (now - new Date(iso).getTime()) / 86400000 : null;

  // V12.26: short relative-time formatter for the inline label.
  const rel = (iso) => {
    if (!iso) return null;
    const d = daysAgo(iso);
    if (d === null) return null;
    if (d < 1) return 'TODAY';
    if (d < 2) return 'YESTERDAY';
    if (d < 14) return `${Math.round(d)}D AGO`;
    if (d < 60) return `${Math.round(d / 7)}W AGO`;
    if (d < 365) return `${Math.round(d / 30)}MO AGO`;
    return `${Math.round(d / 365)}Y AGO`;
  };

  // Tier constants for sort priority — lower numbers float higher.
  const TIER = {
    HOT: 1, RELIABLE: 2, RECENT: 3,
    UNTESTED: 4, DEEPCUT: 5, COLD: 6, TRAP: 7,
  };

  // Active, non-deleted records only.
  const entries = Object.entries(pool)
    .filter(([_, rec]) => rec.active && !rec.deleted)
    .map(([name, rec]) => {
      const drafted = rec.stats?.draftedCount || 0;
      const played = rec.stats?.playedWhenDraftedCount || 0;
      const totalPlays = rec.stats?.timesPlayedTotal || 0;
      const successRate = drafted > 0 ? (played / drafted) : null;
      const lastDraftedDays = daysAgo(rec.lastDraftedAt);
      const lastPlayedDays = daysAgo(rec.lastPlayedAt);
      const lastDraftedRel = rel(rec.lastDraftedAt);
      const lastPlayedRel = rel(rec.lastPlayedAt);

      // Tier assignment, in priority order (most specific first).
      let tier, label, accent;

      if (drafted >= 4 && successRate !== null && successRate < 0.25) {
        // TRAP — proven to disappoint
        tier = TIER.TRAP;
        label = `TRAP · ${played}/${drafted} HITS`;
        accent = C.red;
      } else if (drafted >= 3 && lastPlayedDays !== null && lastPlayedDays > 14 && successRate < 0.5) {
        // COLD — went quiet on the radio AND hasn't been hitting
        tier = TIER.COLD;
        label = `COLD · LAST PLAY ${lastPlayedRel}`;
        accent = C.blueLight;
      } else if (drafted >= 3 && successRate >= 0.67) {
        // HOT — proven, hitting often
        tier = TIER.HOT;
        label = lastDraftedRel
          ? `HOT · DRAFTED ${lastDraftedRel}`
          : `HOT · ${Math.round(successRate * 100)}% HIT`;
        accent = '#EF4444';
      } else if (drafted >= 3 && successRate >= 0.5) {
        // RELIABLE — solid track record
        tier = TIER.RELIABLE;
        label = lastDraftedRel
          ? `RELIABLE · DRAFTED ${lastDraftedRel}`
          : `RELIABLE · ${Math.round(successRate * 100)}% HIT`;
        accent = C.green;
      } else if (drafted >= 1 && lastDraftedDays !== null && lastDraftedDays < 30) {
        // RECENT — drafted recently, jury still out
        tier = TIER.RECENT;
        label = `DRAFTED ${lastDraftedRel}`;
        accent = C.amber;
      } else if (drafted === 0 && totalPlays === 0) {
        // DEEP CUT — never drafted, never heard
        tier = TIER.DEEPCUT;
        label = 'DEEP CUT';
        accent = C.textDim;
      } else if (drafted === 0) {
        // UNTESTED — never drafted but the radio has played them
        tier = TIER.UNTESTED;
        label = lastPlayedRel ? `UNDRAFTED · LAST PLAY ${lastPlayedRel}` : 'UNTESTED';
        accent = C.silver;
      } else {
        // Catchall — drafted in distant past, no other signal
        tier = TIER.UNTESTED;
        label = lastDraftedRel ? `LAST DRAFTED ${lastDraftedRel}` : 'UNTESTED';
        accent = C.silver;
      }

      return { name, label, tier, accent, lastDraftedAt: rec.lastDraftedAt || null };
    });

  // Sort: tier ascending, then by lastDraftedAt descending (most recent
  // first inside the tier), then alpha tiebreaker.
  entries.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    const tA = a.lastDraftedAt ? new Date(a.lastDraftedAt).getTime() : 0;
    const tB = b.lastDraftedAt ? new Date(b.lastDraftedAt).getTime() : 0;
    if (tA !== tB) return tB - tA;
    return a.name.localeCompare(b.name);
  });

  return entries.map(e => ({ name: e.name, label: e.label, tier: e.tier, accent: e.accent }));
}

const RULES_SECTIONS = [
  { title: 'DAILY DRAFT', icon: '📋', content: 'Each day starts with a 5-pick draft (10 picks total). Picks STRICTLY ALTERNATE — A, B, A, B, A, B, A, B, A, B — not snake. On day 1, player 1 picks first. On day 2 onward, the LOSER of the previous day gets the first overall pick (and therefore the third, fifth, seventh, and ninth as well). If a day was skipped, the most recent day that had a winner is used to determine the next day\'s first picker. Artists eliminated earlier in the week cannot be drafted again.' },
  { title: 'BASE SCORING', icon: '+1', content: 'Each drafted artist scores +1 when one of their songs plays. The same artist CAN score multiple times in the same day. However, once an artist plays on a given day, they are eliminated from being drafted on future days that same week.' },
  { title: 'FIRST PLAY OF THE DAY', icon: '+1', content: 'The first scored song of the day earns the scoring player +1 bonus on top of the +1 play point. Awarded once per day to whoever lands the first drafted-artist play. Blocked songs do NOT consume this bonus — it stays available until a play actually scores. Stolen plays count, with the bonus going to the stealer.' },
  { title: 'BONUS SONG', icon: '+2', content: 'Each player declares ONE bonus song (artist + specific song title) before play begins. Every time that exact song plays, you get +2 bonus points ON TOP of the +1 play point, for 3 points per play. The bonus scores EVERY time the song plays — it is not one-shot.' },
  { title: 'WALK-OFF', icon: '+2', content: 'A Walk-Off triggers when (1) you turn on the radio and your artist is ALREADY playing, OR (2) your artist is the first song immediately after a commercial break. Walk-Off adds +2 bonus points to the +1 play point, totaling 3 points.' },
  { title: 'BACK-TO-BACK', icon: '🔥', content: 'Two consecutive scoring songs from your artists adds +1 bonus on the second song.' },
  { title: 'THREE IN A ROW', icon: '🍺', content: 'Three consecutive scoring songs from your artists ends the work day immediately. The current score is locked. The daily winner is still decided by the score (and the ½-point rule if tied). Go drink beer and play Golden Tee.' },
  { title: 'RETALIATION', icon: '⚔️', content: "If your opponent's artist plays and the very next song is yours, you earn +1 retaliation bonus on top of the +1 play point." },
  { title: 'SHOT CALLS', icon: '🎯', content: 'Once per day a player may make a Shot Call before the next song. You\'re predicting that one of YOUR OWN drafted artists will play next. Team Call = +3 (any artist on your roster hits). Artist Call = +5 (a specific artist from your roster). Song Call = +7 (a specific song from your roster). When called, your opponent MUST counter one level harder (Team forces Artist, Artist forces Song) — they pick from THEIR roster. The forced counter does NOT consume the countering player\'s daily Shot Call — they were forced into it and can still call their own proactive shot later in the day. Song Call cannot be countered. Both shots resolve on the same upcoming song.' },
  { title: 'BLOCK', icon: '🛡️', content: 'Each player has ONE Block per day. Block resolves on the VERY NEXT song that plays — drafted or not. If the song is your opponent\'s, they score nothing. If the song is neutral or your own, the Block is wasted. Block locks out if a Shot Call has been declared.' },
  { title: 'STEAL', icon: '💀', content: 'Each player has ONE Steal per day. Steal resolves on the VERY NEXT song that plays — drafted or not. If the next song is your opponent\'s, you receive all the points and bonuses they would have earned. If the song is neutral or your own, the Steal is wasted. Steal locks out if a Shot Call has been declared, and is overridden by a Block from the opponent.' },
  { title: 'COUNTER-STEAL', icon: '⚡', content: 'The instant a Steal is armed against you, you may immediately Counter-Steal ONE artist from the opponent\'s CURRENT roster. If the next song that plays is your counter pick, YOU get the scoring outcome instead of them — even though it\'s their drafted artist. Counter-Steal only matters for that one resolving song. After it plays (or wastes on a neutral), both arms clear. Counter-stolen plays do not advance ANYONE\'s 5-for-5.' },
  { title: 'HALF POINT RULE', icon: '½', content: 'No ties. If scores are equal at end of day, the player whose artist played the FINAL song of the day wins by half a point. The app will require you to pick — there is no default.' },
  { title: 'WINNING THE WEEK', icon: '👑', content: 'Best of five Monday–Friday. First to 3 day-wins clinches the week. Loser buys the first round Friday after work.' },
];

// ============================================================
// PLAYLIST PROVIDER LAYER
// ============================================================
// The scoring engine consumes normalized Track objects only.
// A Track is the canonical, source-agnostic representation of
// something that played on the radio:
//
//   {
//     artist:     "Pearl Jam",           // canonical artist name
//     song:       "Alive" | null,        // optional, providers may not know
//     playedAt:   Date,                  // when it played (or was ingested)
//     stationId:  "wmrq",                // station this track came from
//     source:     "manual" | "mock" | "onlineradiobox",
//     raw:        {...} | null,          // original payload for debugging
//     id:         string,                // stable id, used for dedupe
//   }
//
// Providers implement this interface:
//   - getRecentTracks(stationId): Promise<Track[]>
//   - normalizeTrack(raw, stationId): Track
//   - dedupeTracks(trackList): Track[]
//
// The base PlaylistProvider gives all implementations:
//   - normalizeTrack: applies artist canonicalization + id generation
//   - dedupeTracks: removes consecutive duplicates and id collisions
//
// Subclasses override getRecentTracks() and parseRaw() only.
// ============================================================

// Canonical artist names: "the rolling stones" -> "The Rolling Stones".
// Used by all providers so engine sees consistent strings.
function canonicalizeArtist(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Find a case-insensitive match in the pool; if found, use the pool's casing
  const match = ARTIST_POOL.find(a => a.toLowerCase() === trimmed.toLowerCase());
  return match || trimmed;
}

function trackId(track) {
  // Stable across re-fetches from the same source for the same artist+timestamp
  const ts = track.playedAt instanceof Date ? track.playedAt.getTime() : new Date(track.playedAt).getTime();
  return `${track.source}:${track.stationId}:${track.artist}:${ts}`;
}

class PlaylistProvider {
  constructor(name) {
    this.name = name; // "manual" | "mock" | "onlineradiobox"
  }

  // Subclasses override.
  async getRecentTracks(_stationId) {
    return [];
  }

  // Default normalization. Subclasses may override parseRaw() instead.
  normalizeTrack(raw, stationId) {
    const parsed = this.parseRaw(raw);
    if (!parsed || !parsed.artist) return null;
    const artist = canonicalizeArtist(parsed.artist);
    if (!artist) return null;
    const playedAt = parsed.playedAt instanceof Date
      ? parsed.playedAt
      : parsed.playedAt
        ? new Date(parsed.playedAt)
        : new Date();
    const song = parsed.song ? String(parsed.song).trim() : null;
    const t = {
      artist,
      song,
      // Pre-normalized strings for cheap matching downstream.
      normalizedArtist: normalizeText(artist),
      normalizedSong: normalizeText(song),
      playedAt,
      stationId,
      source: this.name,
      // confidence ∈ [0, 1]. Real provider feeds (when implemented) should
      // assign higher confidence than mocks. Used for ranking when multiple
      // providers return overlapping tracks.
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 1.0,
      raw: raw,
    };
    t.id = trackId(t);
    return t;
  }

  // Subclasses override to convert their wire format to {artist, song, playedAt}.
  parseRaw(raw) {
    return raw; // by default, assume already in normalized shape
  }

  // Remove duplicates by id, AND collapse consecutive same-artist plays
  // that fall inside a small window (some sources double-publish the
  // "now playing" track as it transitions to "just played").
  dedupeTracks(tracks) {
    if (!tracks || tracks.length === 0) return [];
    const seen = new Set();
    const out = [];
    // Sort newest-first
    const sorted = [...tracks].sort((a, b) => b.playedAt - a.playedAt);
    for (const t of sorted) {
      if (seen.has(t.id)) continue;
      // Collapse: same artist within 90 seconds of the previous kept track from same source
      const prev = out[out.length - 1];
      if (prev
          && prev.source === t.source
          && prev.artist === t.artist
          && Math.abs(prev.playedAt - t.playedAt) < 90_000) {
        continue;
      }
      seen.add(t.id);
      out.push(t);
    }
    return out;
  }
}

// 1. MANUAL — used by the existing tap-an-artist UX. Tracks are created
//    on demand from a user action, not fetched. We expose makeTrack() so
//    the dispatch layer can build a Track without going through a fetch.
class ManualPlaylistProvider extends PlaylistProvider {
  constructor() { super('manual'); }
  async getRecentTracks() { return []; } // manual mode never auto-fetches

  // Helper for the UI: build a Track from a user tap.
  makeTrack({ artist, stationId, song = null, scoreType = 'play' }) {
    const t = this.normalizeTrack({ artist, song, playedAt: new Date() }, stationId);
    if (!t) return null;
    t.scoreType = scoreType; // walkoff vs play — manual-only modifier
    return t;
  }
}

// 2. MOCK LIVE — generates a deterministic-ish stream of fake tracks
//    drawn from a station's likely artists. Useful for playtesting the
//    pipeline without needing the radio on. Advances on demand (no timers).
class MockLivePlaylistProvider extends PlaylistProvider {
  constructor(opts = {}) {
    super('mock');
    // Default seed pool — used when no station context is provided.
    this.pool = opts.pool && opts.pool.length ? opts.pool : ARTIST_POOL.slice(0, 24);
    this.history = []; // tracks emitted so far, newest-first
    // Deterministic pseudo-random so playtests are reproducible if you want
    this._seed = opts.seed ?? Date.now();
  }

  _rand() {
    // Mulberry32
    let t = (this._seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Internal: resolve the artist pool to draw from for a given station.
  // Format-aware: if the station has a known format, use that bucket;
  // otherwise fall back to the constructor pool.
  _poolForStation(station) {
    if (station?.format && FORMAT_ARTIST_POOLS[station.format]) {
      return FORMAT_ARTIST_POOLS[station.format];
    }
    return this.pool;
  }

  // Generate one new track and append. Caller chooses when this fires.
  // If `station` is passed (the full station object, not just an id),
  // we pick artists from that station's format bucket.
  emitNext(stationOrId, opts = {}) {
    const station = typeof stationOrId === 'object' ? stationOrId : null;
    const stationId = station?.id || stationOrId;
    const pool = this._poolForStation(station);
    const artist = pool[Math.floor(this._rand() * pool.length)];
    // Pick a song for this artist if the catalog has one — supports the
    // Bonus Song / Song Shot Call matching in the engine.
    const songs = ARTIST_SONG_CATALOG[artist] || [];
    const song = songs.length > 0 ? songs[Math.floor(this._rand() * songs.length)] : null;
    const raw = {
      artist, song,
      playedAt: new Date(),
      // Mocks are slightly less trustworthy than real provider feeds —
      // hint at this with a sub-1.0 confidence so any future ranking layer
      // can prefer real sources when both are present.
      confidence: 0.7,
    };
    if (opts.scoreType) raw.scoreType = opts.scoreType;
    const t = this.normalizeTrack(raw, stationId);
    if (t) this.history = [t, ...this.history].slice(0, 50);
    return t;
  }

  async getRecentTracks(_stationId) {
    return this.dedupeTracks(this.history);
  }

  parseRaw(raw) {
    return {
      artist: raw.artist,
      song: raw.song,
      playedAt: raw.playedAt,
      confidence: raw.confidence,
    };
  }
}

// 3. ONLINE RADIO BOX — text-paste parser.
//    V12.27: Promoted from inert stub to a real provider that PARSES
//    pasted text from onlineradiobox.com/<country>/<station>/playlist/.
//    Does NOT do runtime HTTP fetch — that's blocked by CORS for this
//    domain in the browser. The user pastes the page text (or me
//    fetching it during a conversation and handing back a formatted
//    block); this provider parses it.
//
//    Two recognized line formats:
//      A. Markdown table row from the onlineradiobox page:
//           | 04:35 | [Elle King - Drunk](https://...)  |
//         or without link wrapping:
//           | 04:35 | Elle King - Drunk |
//      B. Loose text line:
//           04:35 Elle King - Drunk
//           4:35 PM   Elle King — Drunk
//
//    Ad/jingle filter: rows containing only station-ID text (e.g.
//    "KYGO-FM - KYGO", "ADWTAG1 -", "98.5 KYGO") are dropped.
class OnlineRadioBoxProvider extends PlaylistProvider {
  constructor() { super('onlineradiobox'); }

  // Runtime fetch is intentionally not implemented. CORS blocks
  // onlineradiobox.com from the browser. The user pastes text instead.
  async getRecentTracks(_stationId) {
    throw new Error('OnlineRadioBoxProvider does not auto-fetch in the browser. Paste playlist text via the Playlist Ingest screen.');
  }

  // V12.27: split a multi-line paste into one raw row per detected track.
  // Returns an array of { rawLine, time, artist, song } shapes for the
  // ingestion pipeline to feed back through this.normalizeTrack().
  parseText(text) {
    if (typeof text !== 'string' || !text.trim()) return [];
    const rows = [];
    const lines = text.split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      const parsed = this._parseLine(line);
      if (parsed) rows.push(parsed);
    }
    return rows;
  }

  // Parse a single line. Returns { rawLine, time, artist, song } or null.
  _parseLine(line) {
    if (this._isJunk(line)) return null;

    // Strip markdown-table cells. The onlineradiobox HTML-to-md export
    // produces rows like:
    //   | 04:35 | [Elle King - Drunk](https://...) |
    // We extract the cells, then process them.
    let time = null;
    let payload = line;
    const tableMatch = line.match(/^\|\s*([^|]*?)\s*\|\s*(.+?)\s*\|?\s*$/);
    if (tableMatch) {
      time = tableMatch[1].trim();
      payload = tableMatch[2].trim();
    }

    // Strip markdown link wrapper:  [text](url)  -> text
    const linkMatch = payload.match(/^\[(.+?)\]\([^)]*\)\s*$/);
    if (linkMatch) payload = linkMatch[1].trim();

    // Strip bold markdown:  **Artist** Song  ->  Artist Song
    payload = payload.replace(/\*\*/g, '').trim();

    // If no time was captured from the table, look for a leading time on
    // the loose-text line ("04:35  Elle King - Drunk", "4:35 PM  Elle King").
    if (!time) {
      const tm = payload.match(/^(\d{1,2}:\d{2}(?:\s*[AaPp][Mm])?)\s+(.+)$/);
      if (tm) {
        time = tm[1];
        payload = tm[2];
      }
    }

    // Now payload should be "Artist - Song" (preferred) or just "Artist".
    if (!payload || this._isJunk(payload)) return null;

    // The onlineradiobox snippets use " - " as separator. Some tracks
    // include " - " inside the artist name (e.g. "Bell Biv DeVoe").
    // Real-world heuristic: split on the FIRST occurrence of " - " and
    // also accept " — " (em-dash) and " – " (en-dash).
    let artist = payload;
    let song = null;
    const sepMatch = payload.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    if (sepMatch) {
      artist = sepMatch[1].trim();
      song = sepMatch[2].trim();
    }

    if (!artist || this._isJunk(artist)) return null;
    return { rawLine: line, time, artist, song };
  }

  // Detect ad spots, station IDs, and other non-music rows.
  // V12.27: kept narrow on purpose — false positives drop real tracks.
  _isJunk(s) {
    if (!s) return true;
    const u = s.toUpperCase();
    if (u.startsWith('ADWTAG')) return true;
    if (u.includes('- KYGO') && u.length < 25) return true;
    if (u.includes('- KOSI') && u.length < 25) return true;
    if (u.includes('- KQKS') && u.length < 25) return true;
    if (u.includes('- KRFX') && u.length < 25) return true;
    if (u.includes('- KXKL') && u.length < 25) return true;
    if (u.includes('- KJMN') && u.length < 25) return true;
    // Pure station-ID rows: "98.5 KYGO", "KOSI 101.1", etc.
    if (/^\d{2,3}\.\d\s*[A-Z]{2,5}$/.test(s)) return true;
    if (/^[A-Z]{2,5}\s*\d{2,3}\.\d$/.test(s)) return true;
    // "Win <something> Tix!"
    if (u.includes('WIN ') && u.includes('TIX')) return true;
    // .com promos
    if (u.endsWith('.COM') || u.includes('.COM -')) return true;
    return false;
  }

  parseRaw(raw) {
    // Called per row from normalizeTrack. raw is { rawLine, time, artist, song }.
    if (!raw || !raw.artist) return null;
    // Reuse the future-style time-of-day parser: treat HH:MM as TODAY
    // unless the parsed time is in the future (then yesterday).
    let playedAt = new Date();
    if (raw.time && typeof raw.time === 'string') {
      const m = raw.time.match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])?/);
      if (m) {
        let hr = parseInt(m[1], 10);
        const min = parseInt(m[2], 10);
        const ampm = (m[3] || '').toUpperCase();
        if (ampm === 'PM' && hr < 12) hr += 12;
        if (ampm === 'AM' && hr === 12) hr = 0;
        const d = new Date();
        d.setHours(hr, min, 0, 0);
        // If the parsed time is in the future relative to now (e.g.
        // it's 02:00 now and the row says 23:45), assume yesterday.
        if (d.getTime() > Date.now() + 60_000) {
          d.setDate(d.getDate() - 1);
        }
        playedAt = d;
      }
    }
    return { artist: raw.artist, song: raw.song, playedAt, confidence: 0.85 };
  }
}

// Singletons (cheap; provider classes are stateless except for mock history)
const PROVIDERS = {
  manual: new ManualPlaylistProvider(),
  mock: new MockLivePlaylistProvider(),
  onlineradiobox: new OnlineRadioBoxProvider(),
};

// ============================================================
// PURE ENGINE
// ============================================================

const engine = {
  createDayState(firstPicker = 0) {
    return {
      drafts: [[], []],
      draftTurn: firstPicker,
      // V12.17: the loser of the previous day gets the first overall
      // pick. From there picks STRICTLY ALTERNATE (not snake) — so the
      // first picker also picks 3rd, 5th, 7th, 9th. The order array
      // is derived from firstPicker so we don't have to special-case
      // the snake constants.
      draftOrder: [
        firstPicker,     1 - firstPicker,
        firstPicker,     1 - firstPicker,
        firstPicker,     1 - firstPicker,
        firstPicker,     1 - firstPicker,
        firstPicker,     1 - firstPicker,
      ],
      draftComplete: false,
      // Bonus song now carries both artist and song title (and a customSong flag)
      // Shape per player: { artist: string, song: string, customSong: boolean } | null
      bonusSongs: [null, null],
      bonusSongsSet: [false, false],
      scores: [0, 0],
      halfPoint: [false, false],
      playedToday: [],
      // Per-player set of unique artists scored today (for 5-for-5 tracking).
      // Distinct from playedToday: blocked songs don't count here because
      // they didn't actually score; playedToday includes blocked plays for
      // future-day elimination purposes.
      playedByPlayer: [[], []],
      // Boolean: has each player been awarded their 5-for-5 bonus today?
      // Prevents double-payout if a 6th unique somehow happened (it can't,
      // since players only draft 5, but the guard is cheap insurance).
      // V12.1: First scoring play of the day awards +1 to the scoring
      // player. Set to true the moment any drafted artist scores cleanly
      // (or via Steal) — consumed for the rest of the day. Blocked plays
      // don't burn this flag because they didn't actually score.
      firstPlayAwarded: false,
      fiveForFiveAwarded: [false, false],
      lastScorer: null,
      consecutiveCount: 0,
      blocks: [INITIAL_BONUSES.block, INITIAL_BONUSES.block],
      steals: [INITIAL_BONUSES.steal, INITIAL_BONUSES.steal],
      shotCalls: [INITIAL_BONUSES.shotCall, INITIAL_BONUSES.shotCall],
      // How many times each player's bonus song has paid out today (rules: every play scores)
      bonusSongPlayCount: [0, 0],
      blockArmedBy: null,
      stealArmedBy: null,
      // V12.15: COUNTER-STEAL. When a player arms STEAL, the victim
      // immediately picks 1 artist from the stealer's CURRENT roster.
      // For the next song that plays:
      //   - if it belongs to the victim's roster → original steal hits
      //     (stealer gets the points)
      //   - if it's the counter-stolen artist (stealer's roster) →
      //     counter-steal hits (victim gets the points)
      //   - if it's any other artist or neutral → both effects waste
      // Both arms clear together on the next song or at day end.
      // counterStealArtist === null means the victim either hasn't
      // picked yet OR explicitly declined.
      counterStealArtist: null,
      counterStealBy: null, // 0 or 1 — the player who will receive the counter-stolen points
      pendingShots: [],
      events: [],
      dayEndedByTriple: null,
      dayComplete: false,
      winner: null,
      lastEventPoints: null,
    };
  },

  createGame(p1, p2, station, startDate) {
    return {
      players: [{ name: p1, weeklyWins: 0 }, { name: p2, weeklyWins: 0 }],
      station, startDate,
      currentDay: 1,
      currentDayState: engine.createDayState(),
      weekHistory: [],
      weekEliminated: [],
      createdAt: Date.now(),
      undoStack: [],
    };
  },

  draftPick(ds, weekEliminated, artist) {
    if (ds.draftComplete) return ds;
    const turn = ds.draftTurn;
    const all = [...ds.drafts[0], ...ds.drafts[1]];
    if (all.includes(artist)) return ds;
    if (weekEliminated.includes(artist)) return ds;
    const drafts = [[...ds.drafts[0]], [...ds.drafts[1]]];
    drafts[turn].push(artist);
    const total = drafts[0].length + drafts[1].length;
    const complete = drafts[0].length === 5 && drafts[1].length === 5;
    // V12.17: use the per-day draftOrder set at createDayState time.
    // Fallback to the legacy snake order for any savefile created
    // before V12.17 (its dayState won't have draftOrder).
    const order = ds.draftOrder || [0, 1, 1, 0, 0, 1, 1, 0, 0, 1];
    return { ...ds, drafts, draftTurn: complete ? turn : order[total], draftComplete: complete };
  },

  // V12.17: figure out who picks first on the next day.
  // Rule: the loser of the previous day gets the #1 overall pick.
  // - If today has a clear winner → loser of today picks first tomorrow.
  // - If today was skipped → walk back through weekHistory for the last
  //   day that had a real winner; loser of THAT day picks first.
  // - If no day in history has a winner yet (e.g. day 1, or every prior
  //   day was skipped) → default to player 0.
  // `justEndedHist` is the just-built hist entry for the day that's
  // ending (or null if we're at the start of a week). `weekHistory` is
  // the prior history array, ordered oldest → newest.
  firstPickerForNextDay(justEndedHist, weekHistory) {
    const stack = [];
    if (justEndedHist) stack.push(justEndedHist);
    for (let i = (weekHistory?.length || 0) - 1; i >= 0; i--) {
      stack.unshift(weekHistory[i]);
    }
    // Walk newest → oldest looking for a clear winner.
    for (let i = stack.length - 1; i >= 0; i--) {
      const h = stack[i];
      if (h && !h.skipped && (h.winner === 0 || h.winner === 1)) {
        return 1 - h.winner;
      }
    }
    return 0;
  },

  // bonusSong = { artist, song, customSong }
  setBonusSong(ds, playerIdx, bonusSong) {
    const bonusSongs = [...ds.bonusSongs];
    const bonusSongsSet = [...ds.bonusSongsSet];
    bonusSongs[playerIdx] = bonusSong;
    bonusSongsSet[playerIdx] = true;
    return { ...ds, bonusSongs, bonusSongsSet };
  },

  // Resolve which player (if any) owns this artist today.
  // Returns 0, 1, or null (no scorer — e.g. a track from the radio that
  // nobody drafted).
  findOwner(ds, artist) {
    if (ds.drafts[0].includes(artist)) return 0;
    if (ds.drafts[1].includes(artist)) return 1;
    return null;
  },

  // NEW track-based entry point. The scoring engine consumes normalized
  // Tracks. This is the function provider-driven UIs should call.
  //
  // Per rules:
  //   - Block/Steal/Shot Calls resolve on the VERY NEXT song that plays,
  //     drafted or not. Neutral songs WASTE armed power-ups.
  //   - Bonus Song matches require exact artist AND exact song title
  //     (normalizeText comparison).
  //   - Bonus Song pays out every time the matching song plays.
  //   - 5-FOR-5 bonus fires once per player per day when their 5th unique
  //     drafted artist scores. Day-of-week multiplier: Mon=1 ... Fri=5.
  scoreTrack(ds, track, currentDay = 1) {
    if (!track || !track.artist) return { ds, event: null };
    const owner = engine.findOwner(ds, track.artist);
    const timestamp = track.playedAt instanceof Date ? track.playedAt : new Date(track.playedAt || Date.now());
    // Pass song through for Bonus Song and Song Shot Call matching
    const song = track.song || null;

    // Neutral song path: nobody drafted this artist, but power-ups still
    // resolve (wasted). Shot Calls also resolve — they may have predicted
    // an artist or song that doesn't match, so they miss and burn anyway.
    if (owner === null) {
      return engine.scoreNeutralSong(ds, track, timestamp);
    }

    return engine.scoreArtist(ds, owner, track.artist, song, track.scoreType || 'play', timestamp, currentDay);
  },

  // Resolve armed Block / Steal / Shot Calls against a song that nobody
  // drafted. All armed power-ups are consumed (wasted).
  scoreNeutralSong(ds, track, timestamp) {
    const artist = track.artist;
    const parts = [artist.toUpperCase(), 'NOT DRAFTED'];
    let scoreDeltas = [0, 0];
    const shotResolutions = [];

    // Shot calls: a neutral song means every predictedArtist/predictedSong
    // miss. Team-level always misses (since team match needs a drafted song).
    for (const shot of ds.pendingShots) {
      const hit = false; // neutral song can never satisfy any shot
      const points = 0;
      shotResolutions.push({ ...shot, hit, points });
      parts.push(`${SHOT_LABEL[shot.level]} SHOT MISSED`);
    }

    const wasArmed = ds.blockArmedBy !== null || ds.stealArmedBy !== null;
    if (ds.blockArmedBy !== null) parts.push(`BLOCK WASTED`);
    if (ds.stealArmedBy !== null) parts.push(`STEAL WASTED`);

    // Neutral songs interrupt streaks (rules: only consecutive *scoring*
    // songs count, but the streak resets on any drafted-not-yours song,
    // and a neutral song equally interrupts because the chain is broken).
    return {
      ds: {
        ...ds,
        blockArmedBy: null,
        stealArmedBy: null,
        counterStealArtist: null,
        counterStealBy: null,
        pendingShots: [],
        lastScorer: null,
        consecutiveCount: 0,
        scores: [ds.scores[0] + scoreDeltas[0], ds.scores[1] + scoreDeltas[1]],
        lastEventPoints: null,
      },
      event: {
        id: Date.now() + Math.random(),
        timestamp,
        owner: null,
        effectivePlayer: null,
        artist,
        song: track.song || null,
        totalPoints: 0,
        parts,
        meta: !wasArmed && ds.pendingShots.length === 0,
        neutral: true,
        shotResolutions,
        source: track.source,
      },
    };
  },

  // Core scoring. Artist is NOT removed from drafts — can score again today.
  // song parameter is optional (null when caller doesn't know it).
  // currentDay (1-5, Mon-Fri) drives the 5-for-5 weekday bonus multiplier.
  scoreArtist(ds, owner, artist, song, scoreType, timestamp, currentDay = 1) {
    const opp = 1 - owner;
    const hasPendingShots = ds.pendingShots.length > 0;
    // Priority: Shot Call > Block > Steal. When shots are pending, Block
    // and Steal don't trigger. Per updated rules, Block also overrides
    // Steal: if opp armed Block AND own steal is somehow armed, Block wins.
    // (In practice the engine only allows one of Block/Steal per opponent
    // because each player has 1, but the precedence is defined.)
    const blocking = !hasPendingShots && ds.blockArmedBy === opp;
    const stealing = !hasPendingShots && !blocking && ds.stealArmedBy === opp;
    // V12.15: COUNTER-STEAL HIT.
    // The song that plays is on the STEALER's roster (owner = stealer)
    // AND it's the specific artist the victim picked as their
    // counter-steal target. In that case the victim gets the scoring
    // outcome instead of the stealer.
    //
    // Conditions (all must hold):
    //   - the opponent (victim of original steal) had armed a counter
    //   - their counter-stolen artist matches the song that played
    //   - the original Steal is still armed against them (which means
    //     this song is resolving the steal/counter-steal moment)
    //   - we're not blocking and we're not in pending-shot territory
    //   - and "stealing" is FALSE (because stealing requires the song
    //     to be on the victim's roster — counter-steal requires the
    //     opposite, song on the stealer's roster)
    const counterStealing = !hasPendingShots && !blocking && !stealing
      && ds.counterStealArtist === artist
      && ds.counterStealBy === opp
      && ds.stealArmedBy === owner;

    // Resolve shot calls first (independently). Song shots need an exact
    // (normalized) song-title match in addition to artist.
    const shotResolutions = [];
    const scoreDeltas = [0, 0];
    if (hasPendingShots) {
      const playedSongNorm = normalizeText(song);
      for (const shot of ds.pendingShots) {
        let hit = false;
        if (shot.level === 'team') {
          hit = ds.drafts[shot.player].includes(artist);
        } else if (shot.level === 'artist') {
          hit = shot.predictedArtist === artist;
        } else if (shot.level === 'song') {
          const predArtistMatch = shot.predictedArtist === artist;
          const predSongNorm = normalizeText(shot.predictedSong);
          // Song match requires both an artist match AND a non-empty song
          // title that matches normalized.
          hit = predArtistMatch && predSongNorm && playedSongNorm && predSongNorm === playedSongNorm;
        }
        const points = hit ? SHOT_POINTS[shot.level] : 0;
        scoreDeltas[shot.player] += points;
        shotResolutions.push({ ...shot, hit, points });
      }
    }

    // BLOCK PATH — opponent's song is fully negated for the owner
    if (blocking) {
      const newScores = [ds.scores[0] + scoreDeltas[0], ds.scores[1] + scoreDeltas[1]];
      const newPlayedToday = ds.playedToday.includes(artist) ? ds.playedToday : [...ds.playedToday, artist];
      const parts = [artist.toUpperCase(), 'BLOCKED'];
      for (const r of shotResolutions) parts.push(r.hit ? `${SHOT_LABEL[r.level]} SHOT HIT +${r.points}` : `${SHOT_LABEL[r.level]} SHOT MISSED`);
      return {
        ds: {
          ...ds,
          scores: newScores,
          playedToday: newPlayedToday,
          blockArmedBy: null,
          stealArmedBy: null,
          counterStealArtist: null,
          counterStealBy: null,
          pendingShots: [],
          lastScorer: null,
          consecutiveCount: 0,
          lastEventPoints: null,
        },
        event: {
          id: Date.now() + Math.random(), timestamp,
          owner, effectivePlayer: null, artist, song,
          totalPoints: 0, parts,
          blocked: true, stolen: false, shotResolutions, big: false,
        },
      };
    }

    let effectivePlayer = (stealing || counterStealing) ? opp : owner;
    let total = 0;
    const parts = [artist.toUpperCase()];
    if (song) parts.push(`"${song}"`);
    parts.push(`+${BONUS_VALUES.PLAY}`);
    total += BONUS_VALUES.PLAY;

    // BONUS SONG: requires both exact artist AND exact (normalized) song match.
    // Scores EVERY time it plays (no one-shot restriction).
    // V12.15: when counter-stealing, the song is on the STEALER's
    // roster — so the relevant bonus song to check is the OWNER's
    // (which is the stealer's bonus song). The counter-stealer
    // collects the bonus too.
    const bonus = ds.bonusSongs[owner];
    const isBonusSong = bonus
      && bonus.artist === artist
      && normalizeText(bonus.song)
      && normalizeText(bonus.song) === normalizeText(song);
    if (isBonusSong) {
      total += BONUS_VALUES.BONUS_SONG;
      parts.push(
        stealing ? `STOLEN BONUS +${BONUS_VALUES.BONUS_SONG}`
        : counterStealing ? `COUNTER-STOLEN BONUS +${BONUS_VALUES.BONUS_SONG}`
        : `BONUS SONG +${BONUS_VALUES.BONUS_SONG}`
      );
    }

    if (scoreType === 'walkoff') {
      total += BONUS_VALUES.WALKOFF;
      parts.push(`WALK-OFF +${BONUS_VALUES.WALKOFF}`);
    }

    // V12.1: First scoring play of the day. Awarded once per day to the
    // scoring player (the one actually getting the points — stealer if
    // stolen, counter-stealer if counter-stolen). Blocked plays earlier
    // in this function return before reaching here, so they correctly
    // don't consume the flag.
    const isFirstPlay = !ds.firstPlayAwarded;
    if (isFirstPlay) {
      total += BONUS_VALUES.FIRST_PLAY;
      parts.push(`FIRST PLAY OF DAY +${BONUS_VALUES.FIRST_PLAY}`);
    }

    let newConsec = 0, newLastScorer = effectivePlayer;
    let isB2B = false, isTriple = false, isRetal = false;
    // V12.15: skip streak/retal evaluation on stolen AND counter-stolen
    // plays — the lastScorer chain doesn't apply when the scoring
    // outcome was hijacked by a steal mechanic.
    if (!stealing && !counterStealing) {
      if (ds.lastScorer === owner) {
        newConsec = ds.consecutiveCount + 1;
        if (newConsec === 2) {
          total += BONUS_VALUES.BACK_TO_BACK;
          parts.push(`BACK-TO-BACK +${BONUS_VALUES.BACK_TO_BACK}`);
          isB2B = true;
        } else if (newConsec >= 3) {
          parts.push('THREE IN A ROW — DAY OVER');
          isTriple = true;
        }
      } else if (ds.lastScorer === opp) {
        total += BONUS_VALUES.RETALIATION;
        parts.push(`RETALIATION +${BONUS_VALUES.RETALIATION}`);
        newConsec = 1;
        isRetal = true;
      } else {
        newConsec = 1;
      }
    } else {
      newLastScorer = opp;
      newConsec = 1;
      parts.push(counterStealing ? 'COUNTER-STOLEN' : 'STOLEN');
    }

    scoreDeltas[effectivePlayer] += total;

    // ---- 5-FOR-5 logic ----
    // Per rules (v7 clarification):
    //  - Blocked artists DO NOT count (block returns earlier; this code
    //    is only reached on a successful score).
    //  - Stolen artists DO NOT count toward the owner's 5-for-5 progress.
    //    The owner's roster did not "successfully score" for them — the
    //    points went to the opponent. They don't get progress credit.
    //  - Neutral songs DO NOT count (no owner).
    //  - Repeat plays DO NOT count (Set semantics — already-included artist
    //    isn't added again).
    //
    // The artist IS still added to playedToday (for future-day elimination),
    // but playedByPlayer[owner] only grows on a clean, owner-scored play.
    const newPlayedByPlayer = [
      [...ds.playedByPlayer[0]],
      [...ds.playedByPlayer[1]],
    ];
    // V12.15: counter-stolen plays also do NOT count toward owner's
    // 5-for-5 progress (owner's roster artist played, but the scoring
    // outcome went to the counter-stealer — same logic as stealing).
    if (!stealing && !counterStealing && !newPlayedByPlayer[owner].includes(artist)) {
      newPlayedByPlayer[owner].push(artist);
    }
    const newFiveForFive = [...ds.fiveForFiveAwarded];
    let fiveForFiveJustFired = false;
    let fiveForFiveBonus = 0;
    if (!stealing && !counterStealing
        && !ds.fiveForFiveAwarded[owner]
        && newPlayedByPlayer[owner].length === 5
        && ds.drafts[owner].length === 5) {
      fiveForFiveBonus = Math.max(1, Math.min(5, currentDay));
      scoreDeltas[owner] += fiveForFiveBonus;
      newFiveForFive[owner] = true;
      fiveForFiveJustFired = true;
      parts.push(`5-FOR-5 COMPLETE +${fiveForFiveBonus}`);
    }

    const newScores = [ds.scores[0] + scoreDeltas[0], ds.scores[1] + scoreDeltas[1]];
    const newPlayedToday = ds.playedToday.includes(artist) ? ds.playedToday : [...ds.playedToday, artist];
    const newBonusPlayCount = [...ds.bonusSongPlayCount];
    if (isBonusSong) newBonusPlayCount[owner] += 1;

    for (const r of shotResolutions) parts.push(r.hit ? `${SHOT_LABEL[r.level]} SHOT HIT +${r.points}` : `${SHOT_LABEL[r.level]} SHOT MISSED`);

    const ownShot = shotResolutions.find(r => r.player === effectivePlayer);
    // Flash points: total + own-shot points + 5-for-5 bonus (all to one
    // player — effectivePlayer equals owner whenever 5-for-5 can fire,
    // because stolen plays no longer advance the owner's 5-for-5).
    const flashPlayer = effectivePlayer;
    const flashPoints = total + (ownShot?.points || 0) + (fiveForFiveJustFired ? fiveForFiveBonus : 0);

    return {
      ds: {
        ...ds,
        scores: newScores,
        playedToday: newPlayedToday,
        playedByPlayer: newPlayedByPlayer,
        fiveForFiveAwarded: newFiveForFive,
        firstPlayAwarded: true,
        bonusSongPlayCount: newBonusPlayCount,
        lastScorer: newLastScorer,
        consecutiveCount: newConsec,
        blockArmedBy: null,
        stealArmedBy: null,
        // V12.15: clear counter-steal state after any scoring play —
        // counter-steal lives only for the single song that resolves
        // the steal moment.
        counterStealArtist: null,
        counterStealBy: null,
        pendingShots: [],
        dayEndedByTriple: isTriple ? effectivePlayer : ds.dayEndedByTriple,
        lastEventPoints: flashPoints > 0 ? { player: flashPlayer, points: flashPoints } : null,
      },
      event: {
        id: Date.now() + Math.random(), timestamp,
        owner, effectivePlayer, artist, song,
        totalPoints: total + (fiveForFiveJustFired ? fiveForFiveBonus : 0),
        parts,
        blocked: false, stolen: stealing,
        counterStolen: counterStealing,
        isB2B, isTriple, isRetal, isBonus: isBonusSong, isWalkoff: scoreType === 'walkoff',
        isFirstPlay,
        is5for5: fiveForFiveJustFired,
        fiveForFiveBonus,
        fiveForFiveOwner: fiveForFiveJustFired ? owner : null,
        shotResolutions, big: total >= 3 || fiveForFiveJustFired,
      },
    };
  },

  canArmBlock(ds, playerIdx) { return ds.blocks[playerIdx] > 0 && ds.pendingShots.length === 0; },
  canArmSteal(ds, playerIdx) { return ds.steals[playerIdx] > 0 && ds.pendingShots.length === 0; },

  armBlock(ds, playerIdx) {
    if (!engine.canArmBlock(ds, playerIdx)) return { ds, event: null };
    const blocks = [...ds.blocks];
    blocks[playerIdx] -= 1;
    return {
      ds: {
        ...ds, blocks, blockArmedBy: playerIdx,
        stealArmedBy: ds.stealArmedBy === playerIdx ? null : ds.stealArmedBy,
        // V12.15: arming Block clears any pending counter-steal — a
        // Block invalidates the prior Steal's setup entirely.
        counterStealArtist: null,
        counterStealBy: null,
      },
      event: metaEvent(playerIdx, 'BLOCK ARMED'),
    };
  },

  armSteal(ds, playerIdx) {
    if (!engine.canArmSteal(ds, playerIdx)) return { ds, event: null };
    const steals = [...ds.steals];
    steals[playerIdx] -= 1;
    return {
      ds: {
        ...ds, steals, stealArmedBy: playerIdx,
        blockArmedBy: ds.blockArmedBy === playerIdx ? null : ds.blockArmedBy,
        // V12.15: reset any prior counter-steal selection. Each new
        // Steal arming starts the counter-selection flow fresh.
        counterStealArtist: null,
        counterStealBy: null,
      },
      event: metaEvent(playerIdx, 'STEAL ARMED'),
    };
  },

  // V12.15: COUNTER-STEAL — the victim of an armed Steal picks ONE
  // artist from the stealer's CURRENT roster. If the next song that
  // plays matches that artist, the victim gets the scoring outcome
  // (with all bonus modifiers) instead of the stealer.
  // Pure function; refuses if no Steal is armed against this player
  // or if the artist isn't currently on the opponent's roster.
  selectCounterSteal(ds, victimIdx, artist) {
    const opp = 1 - victimIdx;
    if (ds.stealArmedBy !== opp) return { ds, event: null };
    if (!ds.drafts[opp]?.includes(artist)) return { ds, event: null };
    return {
      ds: { ...ds, counterStealArtist: artist, counterStealBy: victimIdx },
      event: metaEvent(victimIdx, `COUNTER-STEAL: ${artist.toUpperCase()}`),
    };
  },

  declareShotCall(ds, playerIdx, level, predictedArtist, predictedSong, isCounter = false) {
    if (ds.shotCalls[playerIdx] <= 0 && !isCounter) return { ds, event: null, mustCounter: null };
    if (ds.pendingShots.some(s => s.player === playerIdx)) return { ds, event: null, mustCounter: null };
    // V12.1: Shot calls target the caller's OWN drafted artists only.
    // Validate at the engine boundary so any path (UI, future API)
    // is constrained by the same rule. Team-level shots don't carry
    // a specific artist so they're exempt from this check.
    if (level !== 'team' && predictedArtist) {
      if (!ds.drafts[playerIdx].includes(predictedArtist)) {
        return { ds, event: null, mustCounter: null };
      }
    }
    // V12.16: Counter shots do NOT consume the countering player's
    // daily Shot Call. They were forced into the counter — penalizing
    // them for being forced is incorrect. Proactive shot calls still
    // decrement as before.
    const shotCalls = [...ds.shotCalls];
    if (!isCounter) shotCalls[playerIdx] -= 1;
    const newDs = {
      ...ds,
      shotCalls,
      blockArmedBy: null,
      stealArmedBy: null,
      counterStealArtist: null,
      counterStealBy: null,
      pendingShots: [...ds.pendingShots, { player: playerIdx, level, predictedArtist, predictedSong }],
    };
    const opp = 1 - playerIdx;
    const levelIdx = SHOT_LEVELS.indexOf(level);
    const nextLevel = SHOT_LEVELS[levelIdx + 1];
    const oppHasShot = newDs.shotCalls[opp] > 0;
    const oppAlreadyCalled = newDs.pendingShots.some(s => s.player === opp);
    // V12.16: only the FIRST shot in a chain triggers a forced counter.
    // A counter itself never spawns another forced counter — otherwise
    // a Team → Artist counter would force a Song counter back from the
    // original caller, infinite-loop style. The brief is clear: each
    // proactive call forces ONE counter, period.
    let mustCounter = null;
    if (!isCounter && nextLevel && oppHasShot && !oppAlreadyCalled) {
      mustCounter = { player: opp, forcedLevel: nextLevel };
    }
    const targetParts = [
      `${SHOT_LABEL[level]} SHOT ${isCounter ? 'COUNTERED' : 'CALLED'}`,
    ];
    if (level === 'team') targetParts.push('OWN TEAM');
    else if (level === 'artist') targetParts.push(predictedArtist ? predictedArtist.toUpperCase() : '?');
    else if (level === 'song') {
      targetParts.push(predictedArtist ? predictedArtist.toUpperCase() : '?');
      if (predictedSong) targetParts.push(`"${predictedSong}"`);
    }
    return {
      ds: newDs,
      event: {
        id: Date.now() + Math.random(), timestamp: new Date(),
        owner: playerIdx, effectivePlayer: playerIdx, artist: null,
        totalPoints: 0,
        parts: targetParts,
        isShot: true,
        isShotCounter: isCounter,
      },
      mustCounter,
    };
  },

  cancelShotCalls(ds) {
    if (ds.pendingShots.length === 0) return { ds, event: null };
    return {
      ds: { ...ds, pendingShots: [] },
      event: { id: Date.now() + Math.random(), timestamp: new Date(), owner: 0, effectivePlayer: null, artist: null, totalPoints: 0, parts: ['SHOT CALLS CANCELLED'], meta: true },
    };
  },

  // V12.3: Soft-remove an event from the day. Used when the user
  // realizes they tapped the wrong artist (or the same song twice).
  // Behavior:
  //   - The event stays in ds.events but gains `removed: true` (audit trail)
  //   - Its totalPoints are subtracted from the scoring player
  //   - bonusSongPlayCount is decremented if the event was a bonus song
  //   - Derived fields (playedToday, playedByPlayer, lastScorer,
  //     consecutiveCount, firstPlayAwarded, fiveForFiveAwarded) are
  //     recomputed from the remaining non-removed, non-meta events
  //   - dayEndedByTriple / dayComplete / winner are PRESERVED — if the
  //     day has ended, removing an event doesn't un-end it. The user can
  //     hit RESET if they need a full restart.
  //
  // We don't recompute the B2B/Triple/5-for-5 flags on the kept events —
  // those stay as historical labels of what happened at the time. The
  // engine state, though, accurately reflects "if no more songs played,
  // here's where we stand."
  removeEvent(ds, eventId) {
    const idx = ds.events.findIndex(e => e.id === eventId);
    if (idx < 0) return { ds, event: null };
    const target = ds.events[idx];
    if (target.removed || target.meta) return { ds, event: null };

    // Mark removed
    const newEvents = ds.events.map((e, i) =>
      i === idx ? { ...e, removed: true } : e
    );

    // Subtract points from the player who received them.
    const newScores = [...ds.scores];
    if (target.effectivePlayer === 0 || target.effectivePlayer === 1) {
      newScores[target.effectivePlayer] -= (target.totalPoints || 0);
      if (newScores[target.effectivePlayer] < 0) newScores[target.effectivePlayer] = 0;
    }

    // Decrement bonusSongPlayCount if this was a bonus hit.
    const newBonusPlayCount = [...ds.bonusSongPlayCount];
    if (target.isBonus && (target.owner === 0 || target.owner === 1)) {
      newBonusPlayCount[target.owner] = Math.max(0, newBonusPlayCount[target.owner] - 1);
    }

    // Walk remaining live events (newest-first) to recompute derived state.
    const liveEvents = newEvents.filter(e => !e.removed && !e.meta && !e.blocked);
    // playedToday: any non-removed non-meta event's artist
    const playedToday = [];
    const seenArtist = new Set();
    for (const e of newEvents) {
      if (e.removed || e.meta) continue;
      if (!e.artist) continue;
      if (!seenArtist.has(e.artist)) {
        seenArtist.add(e.artist);
        playedToday.push(e.artist);
      }
    }
    // playedByPlayer: per-player unique artists scored cleanly (not blocked, not stolen, owner = self)
    const playedByPlayer = [[], []];
    const seenByPlayer = [new Set(), new Set()];
    for (const e of newEvents) {
      if (e.removed || e.meta || e.blocked) continue;
      if (e.stolen) continue;
      if (e.owner === 0 || e.owner === 1) {
        if (e.artist && !seenByPlayer[e.owner].has(e.artist)) {
          seenByPlayer[e.owner].add(e.artist);
          playedByPlayer[e.owner].push(e.artist);
        }
      }
    }
    // lastScorer + consecutiveCount: scan newest-first (events[0] is newest),
    // find the most recent live scoring event, then count the trailing run
    // of same-player consecutives.
    let lastScorer = null;
    let consecutiveCount = 0;
    for (const e of newEvents) {
      if (e.removed || e.meta) continue;
      if (e.blocked) {
        // a blocked play breaks the streak
        break;
      }
      const ep = e.effectivePlayer;
      if (ep !== 0 && ep !== 1) break;
      if (lastScorer === null) {
        lastScorer = ep;
        consecutiveCount = 1;
      } else if (ep === lastScorer) {
        consecutiveCount += 1;
      } else {
        break;
      }
    }
    // firstPlayAwarded: true if any live scoring event remains
    const firstPlayAwarded = liveEvents.length > 0;
    // fiveForFiveAwarded: per player, true if playedByPlayer.length >= 5
    const fiveForFiveAwarded = [
      playedByPlayer[0].length >= 5 && ds.drafts[0].length === 5,
      playedByPlayer[1].length >= 5 && ds.drafts[1].length === 5,
    ];
    // Re-credit 5-for-5 bonuses if applicable — actually, no. The 5-for-5
    // bonus points are baked into the event that triggered them
    // (event.fiveForFiveBonus). When we subtracted target.totalPoints
    // above, that bonus is already accounted for if target WAS the
    // trigger event. If the trigger event is still live, the bonus
    // remains credited via that event's totalPoints (which we didn't
    // touch). So scoring math is correct.

    return {
      ds: {
        ...ds,
        events: newEvents,
        scores: newScores,
        playedToday,
        playedByPlayer,
        lastScorer,
        consecutiveCount,
        firstPlayAwarded,
        fiveForFiveAwarded,
        bonusSongPlayCount: newBonusPlayCount,
      },
      event: {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        owner: target.owner,
        effectivePlayer: null,
        artist: null,
        totalPoints: 0,
        parts: [`REMOVED: ${target.artist || '?'} -${target.totalPoints || 0}`],
        meta: true,
      },
    };
  },

  // Returns { ...ds, dayComplete, winner }. If tied and halfPointWinnerIdx
  // is null/undefined, throws — callers MUST resolve ties explicitly.
  // Three-in-a-row does NOT automatically award the day; the day ends but
  // the winner is still determined by score (with ½-point tie resolution).
  //
  // ½-POINT RULE: when scores are tied, the player who scored the final
  // song wins the day. The visible score IS NOT MODIFIED — 22-22 stays
  // 22-22. The halfPoint[] flag marks which side won the tiebreak so the
  // UI can display a ½ marker beside their score.
  endDay(ds, halfPointWinnerIdx) {
    const s0 = ds.scores[0], s1 = ds.scores[1];
    const halfPoint = [false, false];
    const tied = s0 === s1;
    let winner;

    if (tied) {
      if (halfPointWinnerIdx === null || halfPointWinnerIdx === undefined) {
        throw new Error('endDay called with tied score and no halfPointWinnerIdx. ½-point rule requires explicit selection.');
      }
      halfPoint[halfPointWinnerIdx] = true;
      winner = halfPointWinnerIdx;
    } else {
      winner = s0 > s1 ? 0 : 1;
    }

    return { ...ds, scores: [s0, s1], halfPoint, dayComplete: true, winner };
  },

  // V12.19: Bulk rename of an artist across the entire current game.
  // Touches every place an artist name lives on the game / dayState:
  //   - drafts[0], drafts[1]
  //   - playedToday, playedByPlayer[0..1]
  //   - bonusSongs[0..1].artist
  //   - events[].artist + events[].parts (string contents)
  //   - pendingShots[].predictedArtist
  //   - counterStealArtist
  //   - weekEliminated
  //   - weekHistory[].drafts, .bonusSongs, .playedToday, .artistPlays,
  //                  .bigPlay.artist, .blockedBonus.artist
  //
  // Pure function: returns the rewritten game. Caller must persist.
  //
  // If oldName === newName or oldName is missing nowhere, returns the
  // original game unchanged.
  renameArtistInGame(game, oldName, newName) {
    if (!oldName || !newName || oldName === newName) return game;
    const swap = (a) => (a === oldName ? newName : a);
    const swapArr = (arr) => (arr || []).map(swap);
    // Also rewrite occurrences inside parts strings (case-sensitive token).
    // We only swap whole-token matches inside parts because parts strings
    // are joined like ['ARTIST NAME', '"Song"', '+1', 'BONUS SONG +2'] —
    // the artist appears as a standalone uppercase entry.
    const oldUpper = oldName.toUpperCase();
    const newUpper = newName.toUpperCase();
    const swapParts = (parts) => (parts || []).map(p => {
      if (typeof p !== 'string') return p;
      if (p === oldUpper) return newUpper;
      // Some parts are quoted song lines like 'ARTIST NAME — "Song"' — we
      // don't try to splice mid-string; the artist field on the event is
      // what counts for analytics. Parts are decorative.
      return p;
    });

    const renameDayState = (ds) => {
      if (!ds) return ds;
      const drafts = [swapArr(ds.drafts?.[0]), swapArr(ds.drafts?.[1])];
      const playedByPlayer = [
        swapArr(ds.playedByPlayer?.[0]),
        swapArr(ds.playedByPlayer?.[1]),
      ];
      const playedToday = swapArr(ds.playedToday);
      const bonusSongs = (ds.bonusSongs || [null, null]).map(bs =>
        bs && bs.artist === oldName ? { ...bs, artist: newName } : bs
      );
      const events = (ds.events || []).map(e => ({
        ...e,
        artist: swap(e.artist),
        parts: swapParts(e.parts),
      }));
      const pendingShots = (ds.pendingShots || []).map(s =>
        s.predictedArtist === oldName ? { ...s, predictedArtist: newName } : s
      );
      const counterStealArtist = ds.counterStealArtist === oldName ? newName : ds.counterStealArtist;
      return {
        ...ds, drafts, playedByPlayer, playedToday, bonusSongs,
        events, pendingShots, counterStealArtist,
      };
    };

    const weekHistory = (game.weekHistory || []).map(h => {
      if (!h) return h;
      const drafts = h.drafts ? [swapArr(h.drafts[0]), swapArr(h.drafts[1])] : h.drafts;
      const bonusSongs = h.bonusSongs ? h.bonusSongs.map(bs =>
        bs && bs.artist === oldName ? { ...bs, artist: newName } : bs
      ) : h.bonusSongs;
      const playedToday = h.playedToday ? swapArr(h.playedToday) : h.playedToday;
      const artistPlays = h.artistPlays ? Object.fromEntries(
        Object.entries(h.artistPlays).map(([k, v]) => [swap(k), v])
      ) : h.artistPlays;
      const bigPlay = h.bigPlay && h.bigPlay.artist === oldName
        ? { ...h.bigPlay, artist: newName } : h.bigPlay;
      const blockedBonus = h.blockedBonus && h.blockedBonus.artist === oldName
        ? { ...h.blockedBonus, artist: newName } : h.blockedBonus;
      return { ...h, drafts, bonusSongs, playedToday, artistPlays, bigPlay, blockedBonus };
    });

    return {
      ...game,
      currentDayState: renameDayState(game.currentDayState),
      weekEliminated: swapArr(game.weekEliminated),
      weekHistory,
    };
  },
};

// V12.19: rename an artist across the persisted stationArtists map.
// stationArtists shape: { [stationId]: { [artistName]: record } }
// Returns a new stationArtists map with the rename applied. Merges
// records if both old and new names exist at the same station (sums
// drafted/played/successful, takes most recent lastPlayedAt, etc).
function renameArtistInStationArtists(stationArtists, oldName, newName) {
  if (!oldName || !newName || oldName === newName) return stationArtists;
  if (!stationArtists) return stationArtists;
  const out = {};
  for (const [stationId, pool] of Object.entries(stationArtists)) {
    if (!pool || typeof pool !== 'object') { out[stationId] = pool; continue; }
    if (!(oldName in pool)) { out[stationId] = pool; continue; }
    const oldRec = pool[oldName];
    const newRec = pool[newName];
    const merged = newRec ? {
      ...newRec,
      drafted: (newRec.drafted || 0) + (oldRec.drafted || 0),
      played: (newRec.played || 0) + (oldRec.played || 0),
      successful: (newRec.successful || 0) + (oldRec.successful || 0),
      blocked: (newRec.blocked || 0) + (oldRec.blocked || 0),
      stolen: (newRec.stolen || 0) + (oldRec.stolen || 0),
      lastPlayedAt: Math.max(newRec.lastPlayedAt || 0, oldRec.lastPlayedAt || 0) || null,
      source: newRec.source || oldRec.source,
      songs: Array.from(new Set([...(newRec.songs || []), ...(oldRec.songs || [])])),
    } : { ...oldRec };
    const newPool = { ...pool };
    delete newPool[oldName];
    newPool[newName] = merged;
    out[stationId] = newPool;
  }
  return out;
}

// V12.19: rename across the career stats blob.
// stats shape includes topArtists{}, bonusSongHallOfFame[], perBonusSong{}
function renameArtistInStats(stats, oldName, newName) {
  if (!oldName || !newName || oldName === newName) return stats;
  if (!stats) return stats;
  const out = { ...stats };
  if (stats.topArtists && typeof stats.topArtists === 'object') {
    const ta = { ...stats.topArtists };
    if (oldName in ta) {
      const oldEntry = ta[oldName] || { plays: 0, successful: 0 };
      const newEntry = ta[newName] || { plays: 0, successful: 0 };
      ta[newName] = {
        ...newEntry,
        plays: (newEntry.plays || 0) + (oldEntry.plays || 0),
        successful: (newEntry.successful || 0) + (oldEntry.successful || 0),
      };
      delete ta[oldName];
    }
    out.topArtists = ta;
  }
  if (Array.isArray(stats.bonusSongHallOfFame)) {
    out.bonusSongHallOfFame = stats.bonusSongHallOfFame.map(e =>
      e && e.artist === oldName ? { ...e, artist: newName } : e
    );
  }
  if (stats.perBonusSong && typeof stats.perBonusSong === 'object') {
    const pbs = {};
    for (const [k, v] of Object.entries(stats.perBonusSong)) {
      const swapped = v && v.artist === oldName ? { ...v, artist: newName } : v;
      // The KEY of perBonusSong is artist|song — rewrite if it starts
      // with the old artist token.
      let newKey = k;
      if (typeof k === 'string' && k.startsWith(oldName + '|')) {
        newKey = newName + k.substring(oldName.length);
      }
      pbs[newKey] = swapped;
    }
    out.perBonusSong = pbs;
  }
  return out;
}

function metaEvent(playerIdx, label) {
  return {
    id: Date.now() + Math.random(), timestamp: new Date(),
    owner: playerIdx, effectivePlayer: playerIdx,
    artist: null, totalPoints: 0, parts: [label], meta: true,
  };
}

// ============================================================
// HISTORICAL STATS + BADGES
// ============================================================
// Stats are cross-week, cross-game. Persisted under STATS_KEY.
// Badges are unlock-once flags; first unlock timestamp is preserved.
//
// Two entry points:
//   - statsEngine.absorbDay(stats, gameAtEndOfDay) -> { stats, newBadges }
//   - statsEngine.absorbWeek(stats, completedGame) -> { stats, newBadges }
//
// The reducer calls these in END_DAY / ADVANCE_DAY paths. Pure functions.

const BADGES = {
  walk_off_king:        { id: 'walk_off_king', title: 'WALK-OFF KING', subtitle: 'Five career Walk-Offs', icon: 'trophy' },
  retaliation_spec:     { id: 'retaliation_spec', title: 'RETALIATION SPECIALIST', subtitle: 'Five career Retaliations', icon: 'zap' },
  bonus_song_assassin:  { id: 'bonus_song_assassin', title: 'BONUS SONG ASSASSIN', subtitle: 'Bonus song hit three times in one day', icon: 'award' },
  shot_caller:          { id: 'shot_caller', title: 'SHOT CALLER', subtitle: 'Three successful Shot Calls', icon: 'crosshair' },
  triple_threat:        { id: 'triple_threat', title: 'TRIPLE THREAT', subtitle: 'Ended a day on three straight songs', icon: 'beer' },
  golden_tee_legend:    { id: 'golden_tee_legend', title: 'GOLDEN TEE LEGEND', subtitle: 'Three career Triple Threats', icon: 'flag' },
  radio_sniper:         { id: 'radio_sniper', title: 'RADIO SNIPER', subtitle: 'Hit a Song Shot Call', icon: 'target' },
  block_party:          { id: 'block_party', title: 'BLOCK PARTY', subtitle: 'Five career Blocks landed', icon: 'shield' },
  ice_in_veins:         { id: 'ice_in_veins', title: 'ICE IN THE VEINS', subtitle: 'Won the day on a ½-point', icon: 'half' },
  comeback_kid:         { id: 'comeback_kid', title: 'COMEBACK KID', subtitle: 'Won a week after trailing 0–2', icon: 'flame' },
  undefeated_week:      { id: 'undefeated_week', title: 'UNDEFEATED WEEK', subtitle: 'Won 3 days without losing one', icon: 'trophy' },
  blocked_bonus_song:   { id: 'blocked_bonus_song', title: 'PARTY POOPER', subtitle: 'Blocked an opponent\'s Bonus Song', icon: 'shield' },
  clean_sweep:          { id: 'clean_sweep', title: 'CLEAN SWEEP', subtitle: 'All 5 of your artists scored in one day', icon: 'trophy' },
  friday_miracle:       { id: 'friday_miracle', title: 'FRIDAY MIRACLE', subtitle: 'Pulled off a 5-for-5 on Friday', icon: 'radio' },
};

// Resolve a badge icon key to a rendered lucide element (or a ½ glyph
// for the half-point badge). Engraved-metal aesthetic — single accent
// color, no emoji, no full-color icons.
function BadgeIcon({ iconKey, size = 18, color = '#2a1c05' }) {
  const props = { size, style: { color, strokeWidth: 2.5 } };
  switch (iconKey) {
    case 'trophy':   return <Trophy {...props} />;
    case 'zap':      return <Zap {...props} />;
    case 'award':    return <Award {...props} />;
    case 'crosshair':return <Crosshair {...props} />;
    case 'beer':     return <Beer {...props} />;
    case 'flag':     return <Flag {...props} />;
    case 'target':   return <Target {...props} />;
    case 'shield':   return <Shield {...props} />;
    case 'flame':    return <Flame {...props} />;
    case 'radio':    return <Radio {...props} />;
    case 'half':     return <span style={{
      fontFamily: '"Oswald", sans-serif', fontWeight: 700,
      fontSize: size, color, lineHeight: 1,
    }}>½</span>;
    default:         return <Trophy {...props} />;
  }
}

const BADGE_ORDER = Object.keys(BADGES);

function emptyStats() {
  return {
    totals: {
      weeksPlayed: 0, weeksWon: 0,
      daysPlayed: 0, daysWon: 0,
      walkOffs: 0, retaliations: 0,
      blocks: 0, steals: 0,
      shotCallsHit: 0, songShotsHit: 0,
      bonusSongHits: 0,
      halfPointWins: 0, tripleWins: 0,
      blockedBonusSongs: 0,
      fiveForFiveDays: 0,
      highestDayScore: 0,
      highestWeekScore: 0,
      highestSongPayout: 0,
      longestStreak: 0,
    },
    perPlayer: {},     // { [name]: { weeksWon, daysWon, walkOffs, ... } }
    perArtist: {},     // { [artist]: { plays } }
    perBonusSong: {},  // { ["Artist::Song"]: { hits } }
    perStation: {},    // { [stationId]: { games, name } }
    badges: {},        // { [id]: { firstUnlockedAt, owner: name|'shared' } }
    weekHistory: [],   // [{ date, station, p1, p2, scores: [w0,w1], winner, dailies: [...] }]
  };
}

function ensurePlayer(stats, name) {
  if (!stats.perPlayer[name]) {
    stats.perPlayer[name] = {
      weeksWon: 0, daysWon: 0,
      walkOffs: 0, retaliations: 0,
      blocks: 0, steals: 0,
      shotCallsHit: 0, songShotsHit: 0,
      bonusSongHits: 0,
      halfPointWins: 0, tripleWins: 0,
      blockedBonusSongs: 0,
      fiveForFiveDays: 0,
      fridayFiveForFives: 0,
    };
  }
}

const statsEngine = {
  // Called at END_DAY (after engine.endDay has resolved scores/winner).
  // game = the game object post-endDay reducer step (winner credited).
  absorbDay(stats, game) {
    const next = JSON.parse(JSON.stringify(stats));
    const ds = game.currentDayState;
    const p0 = game.players[0].name;
    const p1 = game.players[1].name;
    ensurePlayer(next, p0);
    ensurePlayer(next, p1);

    // V12.8: skipped days (winner === null) shouldn't contribute to
    // any per-day stats — nothing was played. Bail before any of the
    // winner-keyed counters fire.
    if (ds.winner !== 0 && ds.winner !== 1) {
      return { stats: next, newBadges: [] };
    }

    next.totals.daysPlayed += 1;
    const winnerName = game.players[ds.winner].name;
    next.totals.daysWon += 1;
    next.perPlayer[winnerName].daysWon += 1;

    if (ds.dayEndedByTriple !== null) {
      next.totals.tripleWins += 1;
      const triplePlayerName = game.players[ds.dayEndedByTriple].name;
      next.perPlayer[triplePlayerName].tripleWins += 1;
    }
    if (ds.halfPoint?.[0] || ds.halfPoint?.[1]) {
      const halfWinner = ds.halfPoint[0] ? p0 : p1;
      next.totals.halfPointWins += 1;
      next.perPlayer[halfWinner].halfPointWins += 1;
    }

    // High-water scores
    const dayMax = Math.max(ds.scores[0], ds.scores[1]);
    if (dayMax > next.totals.highestDayScore) next.totals.highestDayScore = dayMax;

    // Walk through events for per-event stats
    let maxStreak = 0;
    let curStreak = 0;
    let lastScorer = null;
    // Events are stored newest-first; iterate oldest-first for streak math
    const ordered = [...ds.events].reverse();
    for (const ev of ordered) {
      if (ev.meta || ev.neutral) continue;
      const scorerName = ev.effectivePlayer !== null && ev.effectivePlayer !== undefined
        ? game.players[ev.effectivePlayer].name : null;
      if (scorerName) {
        ensurePlayer(next, scorerName);
      }
      if (ev.isWalkoff && scorerName) {
        next.totals.walkOffs += 1;
        next.perPlayer[scorerName].walkOffs += 1;
      }
      if (ev.is5for5 && ev.fiveForFiveOwner !== null && ev.fiveForFiveOwner !== undefined) {
        const ownerName = game.players[ev.fiveForFiveOwner].name;
        ensurePlayer(next, ownerName);
        next.totals.fiveForFiveDays += 1;
        next.perPlayer[ownerName].fiveForFiveDays += 1;
        // Friday Miracle: 5-for-5 on day 5 (Friday)
        if (game.currentDay === 5) {
          next.perPlayer[ownerName].fridayFiveForFives = (next.perPlayer[ownerName].fridayFiveForFives || 0) + 1;
        }
      }
      if (ev.isRetal && scorerName) {
        next.totals.retaliations += 1;
        next.perPlayer[scorerName].retaliations += 1;
      }
      if (ev.isBonus && scorerName) {
        next.totals.bonusSongHits += 1;
        next.perPlayer[scorerName].bonusSongHits += 1;
        // Track per-bonus-song. The owner's bonusSong object has the canonical title.
        const ownerName = game.players[ev.owner]?.name;
        const owner = game.players[ev.owner];
        const bs = ds.bonusSongs[ev.owner];
        if (bs && owner) {
          const key = `${bs.artist}::${bs.song}`;
          if (!next.perBonusSong[key]) next.perBonusSong[key] = { hits: 0, artist: bs.artist, song: bs.song };
          next.perBonusSong[key].hits += 1;
        }
      }
      if (ev.blocked) {
        // Block was used (by the opponent of `ev.owner`)
        const blockerIdx = 1 - ev.owner;
        const blockerName = game.players[blockerIdx]?.name;
        if (blockerName) {
          next.totals.blocks += 1;
          next.perPlayer[blockerName].blocks += 1;
          // Did we block a bonus song? owner's bonus matches ev.artist
          const oppBonus = ds.bonusSongs[ev.owner];
          if (oppBonus && oppBonus.artist === ev.artist) {
            next.totals.blockedBonusSongs += 1;
            next.perPlayer[blockerName].blockedBonusSongs += 1;
          }
        }
      }
      if (ev.stolen && scorerName) {
        next.totals.steals += 1;
        next.perPlayer[scorerName].steals += 1;
      }
      if (ev.shotResolutions && ev.shotResolutions.length) {
        for (const sr of ev.shotResolutions) {
          if (sr.hit) {
            const sn = game.players[sr.player]?.name;
            if (sn) {
              ensurePlayer(next, sn);
              next.totals.shotCallsHit += 1;
              next.perPlayer[sn].shotCallsHit += 1;
              if (sr.level === 'song') {
                next.totals.songShotsHit += 1;
                next.perPlayer[sn].songShotsHit += 1;
              }
            }
          }
        }
      }
      if (ev.artist && !ev.blocked && !ev.meta) {
        if (!next.perArtist[ev.artist]) next.perArtist[ev.artist] = { plays: 0 };
        next.perArtist[ev.artist].plays += 1;
      }
      if (ev.totalPoints > next.totals.highestSongPayout) next.totals.highestSongPayout = ev.totalPoints;

      // Streak math
      if (scorerName) {
        if (lastScorer === scorerName) curStreak += 1;
        else curStreak = 1;
        lastScorer = scorerName;
        if (curStreak > maxStreak) maxStreak = curStreak;
      } else {
        lastScorer = null; curStreak = 0;
      }
    }
    if (maxStreak > next.totals.longestStreak) next.totals.longestStreak = maxStreak;

    // Badge evaluation (day-scoped)
    const newBadges = statsEngine._evaluateBadges(next, game, { scope: 'day', maxBonusSongHitsThisDay: Math.max(ds.bonusSongPlayCount?.[0] || 0, ds.bonusSongPlayCount?.[1] || 0) });

    return { stats: next, newBadges };
  },

  // Called at week completion (when one player reaches 3 wins or after day 5).
  absorbWeek(stats, game) {
    const next = JSON.parse(JSON.stringify(stats));
    const p0 = game.players[0].name;
    const p1 = game.players[1].name;
    ensurePlayer(next, p0);
    ensurePlayer(next, p1);

    next.totals.weeksPlayed += 1;
    // V12.5/V12.8: when wins are tied (a 2-2 draw or all-skipped week),
    // there's no champion to crown. We still increment weeksPlayed for
    // record-keeping but skip the winner-specific stat updates entirely.
    const w0 = game.players[0].weeklyWins;
    const w1 = game.players[1].weeklyWins;
    const noWinner = w0 === w1;
    const winnerIdx = noWinner ? null : w0 > w1 ? 0 : 1;
    const winnerName = winnerIdx !== null ? game.players[winnerIdx].name : null;
    if (winnerName) {
      next.totals.weeksWon += 1;
      next.perPlayer[winnerName].weeksWon += 1;
    }

    // Per-station tally
    if (game.station?.id) {
      if (!next.perStation[game.station.id]) {
        next.perStation[game.station.id] = { games: 0, name: game.station.name };
      }
      next.perStation[game.station.id].games += 1;
    }

    // Compute weekly score (sum of all daily scores for winner)
    const weeklyScores = [0, 0];
    for (const h of game.weekHistory) {
      weeklyScores[0] += h.scores[0];
      weeklyScores[1] += h.scores[1];
    }
    // Include the last (current) day too
    weeklyScores[0] += game.currentDayState.scores[0];
    weeklyScores[1] += game.currentDayState.scores[1];
    const weekMax = Math.max(weeklyScores[0], weeklyScores[1]);
    if (weekMax > next.totals.highestWeekScore) next.totals.highestWeekScore = weekMax;

    // Snapshot the week into history
    next.weekHistory.unshift({
      date: new Date().toISOString(),
      station: game.station?.name || 'Unknown',
      players: [p0, p1],
      weeklyWins: [game.players[0].weeklyWins, game.players[1].weeklyWins],
      weeklyScores,
      winner: winnerName,
    });
    next.weekHistory = next.weekHistory.slice(0, 50); // cap

    // Comeback Kid: winner trailed 0-2 at some point
    let trailedDeep = false;
    let runningWins = [0, 0];
    for (const h of game.weekHistory) {
      // V12.5: skipped days don't affect the comeback narrative.
      if (h.skipped || h.winner === null || h.winner === undefined) continue;
      runningWins[h.winner] += 1;
      if (winnerIdx !== null && runningWins[1 - winnerIdx] === 2 && runningWins[winnerIdx] === 0) {
        trailedDeep = true;
      }
    }
    // Also include current day
    if (!trailedDeep && (game.currentDayState.winner === 0 || game.currentDayState.winner === 1)) {
      runningWins[game.currentDayState.winner] += 1;
      // Already counted, this is intentionally double-evaluated above
    }

    // Undefeated Week: winner has all the wins, opponent has zero
    const undefeated = winnerIdx !== null
      && game.players[1 - winnerIdx].weeklyWins === 0
      && game.players[winnerIdx].weeklyWins >= 3;

    const newBadges = statsEngine._evaluateBadges(next, game, {
      scope: 'week',
      winnerName,
      undefeated,
      trailedDeep,
    });

    return { stats: next, newBadges };
  },

  // Internal: badge-unlock checks. Returns array of newly-unlocked badge IDs.
  _evaluateBadges(stats, game, ctx) {
    const unlocked = [];
    const tryUnlock = (id, owner) => {
      if (stats.badges[id]) return; // already earned
      stats.badges[id] = {
        firstUnlockedAt: new Date().toISOString(),
        owner: owner || 'shared',
      };
      unlocked.push(id);
    };

    // Per-player career thresholds
    for (const name of Object.keys(stats.perPlayer)) {
      const p = stats.perPlayer[name];
      if (p.walkOffs >= 5) tryUnlock('walk_off_king', name);
      if (p.retaliations >= 5) tryUnlock('retaliation_spec', name);
      if (p.shotCallsHit >= 3) tryUnlock('shot_caller', name);
      if (p.songShotsHit >= 1) tryUnlock('radio_sniper', name);
      if (p.blocks >= 5) tryUnlock('block_party', name);
      if (p.tripleWins >= 1) tryUnlock('triple_threat', name);
      if (p.tripleWins >= 3) tryUnlock('golden_tee_legend', name);
      if (p.halfPointWins >= 1) tryUnlock('ice_in_veins', name);
      if (p.blockedBonusSongs >= 1) tryUnlock('blocked_bonus_song', name);
      if (p.fiveForFiveDays >= 1) tryUnlock('clean_sweep', name);
      if (p.fridayFiveForFives >= 1) tryUnlock('friday_miracle', name);
    }

    // Day-scoped one-shots
    if (ctx.scope === 'day') {
      if ((ctx.maxBonusSongHitsThisDay || 0) >= 3) {
        // Whoever owns the high count
        const ds = game.currentDayState;
        const idx = (ds.bonusSongPlayCount?.[0] || 0) >= 3 ? 0 : 1;
        tryUnlock('bonus_song_assassin', game.players[idx].name);
      }
    }

    // Week-scoped
    if (ctx.scope === 'week') {
      if (ctx.undefeated) tryUnlock('undefeated_week', ctx.winnerName);
      if (ctx.trailedDeep) tryUnlock('comeback_kid', ctx.winnerName);
    }

    return unlocked;
  },
};

// ============================================================
// V12.21: PROFILES
// ============================================================
// Local profiles let coworkers share a phone without polluting each
// other's career stats. Each profile owns its own stats blob (same
// shape as the device-global stats from before V12.21). One profile
// is "active" at a time, but EVERY game updates BOTH players' profiles
// — the active profile only determines which one you VIEW by default.

function newProfileId() {
  return 'prof_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function emptyProfile(name, opts = {}) {
  const ts = Date.now();
  return {
    id: opts.id || newProfileId(),
    name: name || 'PLAYER',
    createdAt: opts.createdAt || ts,
    lastPlayedAt: opts.lastPlayedAt || null,
    isLegacy: !!opts.isLegacy,
    stats: opts.stats || emptyStats(),
    // V12.21: profile-level derived counters that don't fit cleanly in
    // the legacy stats shape. headToHead[opponentProfileId] = { wins, losses }.
    // perStationProfile[stationId] = { games, wins } — wins from THIS
    // profile's perspective, not just games-played.
    headToHead: opts.headToHead || {},
    perStationProfile: opts.perStationProfile || {},
    // Day-win streaks: tracked at game-day boundary so they cross weeks.
    currentDayWinStreak: opts.currentDayWinStreak || 0,
    currentDayLossStreak: opts.currentDayLossStreak || 0,
    longestDayWinStreak: opts.longestDayWinStreak || 0,
    longestDayLossStreak: opts.longestDayLossStreak || 0,
  };
}

// V12.21: derived helpers — read-only, computed on demand for the
// profile detail screen. Kept pure so they can also be unit-tested.
const profileEngine = {
  // Compute averages and win-rates from the underlying stats blob.
  derive(profile) {
    const t = profile.stats?.totals || {};
    const daysPlayed = t.daysPlayed || 0;
    const weeksPlayed = t.weeksPlayed || 0;
    const totalPoints = profile.stats?.perPlayer?.[profile.name]?.totalPointsScored || 0;
    return {
      memberSinceMs: profile.createdAt,
      lastPlayedMs: profile.lastPlayedAt,
      daysPlayed,
      daysWon: t.daysWon || 0,
      weeksPlayed,
      weeksWon: t.weeksWon || 0,
      dayWinPct: daysPlayed > 0 ? Math.round((t.daysWon || 0) / daysPlayed * 100) : null,
      weekWinPct: weeksPlayed > 0 ? Math.round((t.weeksWon || 0) / weeksPlayed * 100) : null,
      avgDailyPoints: daysPlayed > 0 ? Math.round((totalPoints / daysPlayed) * 10) / 10 : null,
      currentDayWinStreak: profile.currentDayWinStreak || 0,
      currentDayLossStreak: profile.currentDayLossStreak || 0,
      longestDayWinStreak: profile.longestDayWinStreak || 0,
      longestDayLossStreak: profile.longestDayLossStreak || 0,
    };
  },
  // Head-to-head: { opponentId, opponentName, wins, losses, totalDays }.
  // opponentName is resolved from a profiles list passed by the caller.
  headToHeadList(profile, profilesList) {
    const out = [];
    const h2h = profile.headToHead || {};
    for (const [oppId, rec] of Object.entries(h2h)) {
      const opp = profilesList.find(p => p.id === oppId);
      out.push({
        opponentId: oppId,
        opponentName: opp ? opp.name : '(deleted profile)',
        wins: rec.wins || 0,
        losses: rec.losses || 0,
        totalDays: (rec.wins || 0) + (rec.losses || 0),
      });
    }
    out.sort((a, b) => b.totalDays - a.totalDays);
    return out;
  },
  // Per-station from profile's PoV: { stationId, name, games, wins, winPct }.
  perStationList(profile) {
    const out = [];
    const ps = profile.perStationProfile || {};
    for (const [sid, rec] of Object.entries(ps)) {
      const games = rec.games || 0;
      out.push({
        stationId: sid,
        stationName: rec.name || sid,
        games,
        wins: rec.wins || 0,
        winPct: games > 0 ? Math.round((rec.wins || 0) / games * 100) : null,
      });
    }
    out.sort((a, b) => b.games - a.games);
    return out;
  },
  // Apply a single day's outcome to a profile. dayResult shape:
  //   { wonDay: boolean, opponentId: string|null, stationId: string,
  //     stationName: string }
  absorbDayResult(profile, dayResult) {
    const next = { ...profile, lastPlayedAt: Date.now() };
    // Streaks
    if (dayResult.wonDay) {
      next.currentDayWinStreak = (profile.currentDayWinStreak || 0) + 1;
      next.currentDayLossStreak = 0;
      next.longestDayWinStreak = Math.max(profile.longestDayWinStreak || 0, next.currentDayWinStreak);
    } else {
      next.currentDayLossStreak = (profile.currentDayLossStreak || 0) + 1;
      next.currentDayWinStreak = 0;
      next.longestDayLossStreak = Math.max(profile.longestDayLossStreak || 0, next.currentDayLossStreak);
    }
    // Head-to-head (only when opponent is a real profile, not legacy/null)
    if (dayResult.opponentId) {
      const h2h = { ...(profile.headToHead || {}) };
      const cur = h2h[dayResult.opponentId] || { wins: 0, losses: 0 };
      h2h[dayResult.opponentId] = {
        wins: cur.wins + (dayResult.wonDay ? 1 : 0),
        losses: cur.losses + (dayResult.wonDay ? 0 : 1),
      };
      next.headToHead = h2h;
    }
    // Per-station from profile's PoV
    if (dayResult.stationId) {
      const ps = { ...(profile.perStationProfile || {}) };
      const cur = ps[dayResult.stationId] || { games: 0, wins: 0, name: dayResult.stationName };
      ps[dayResult.stationId] = {
        games: cur.games + 1,
        wins: cur.wins + (dayResult.wonDay ? 1 : 0),
        name: dayResult.stationName || cur.name,
      };
      next.perStationProfile = ps;
    }
    return next;
  },
};

// ============================================================
// STATION ARTISTS ENGINE (V12)
// ============================================================
// Each station owns its own artist ecosystem. The shape:
//
//   stationArtists: {
//     [stationId]: {
//       [canonicalArtistName]: StationArtistRecord
//     }
//   }
//
// StationArtistRecord:
//   {
//     name: string,                    // canonical display name
//     source: 'seed' | 'manual' | 'playlist' | 'historical',
//     active: boolean,                 // visible in drafts
//     deleted: boolean,                // soft-deleted; can be restored
//     addedAt: ISO string,
//     songs: string[],                 // per-station custom songs
//     lastDraftedAt: ISO string | null,
//     lastPlayedAt: ISO string | null,
//     stats: {
//       draftedCount: number,
//       playedWhenDraftedCount: number,
//       timesPlayedTotal: number,
//       bonusSongCount: number,
//       fiveForFiveContributionCount: number,
//       blockedCount: number,
//       stolenCount: number,
//     }
//   }
//
// Why one blob keyed by stationId? Each station is independent — its
// pool can't "bleed" into another's. We dedupe artist keys via
// normalizeText() so "Pearl Jam" and "pearl jam" collide correctly.

const stationArtistsEngine = {
  emptyRecord(name, source = 'manual') {
    return {
      name,
      source,
      active: true,
      deleted: false,
      addedAt: new Date().toISOString(),
      songs: [],
      lastDraftedAt: null,
      lastPlayedAt: null,
      stats: {
        draftedCount: 0,
        playedWhenDraftedCount: 0,
        timesPlayedTotal: 0,
        bonusSongCount: 0,
        fiveForFiveContributionCount: 0,
        blockedCount: 0,
        stolenCount: 0,
        // V12.22: extended analytics. All cumulative across the
        // artist's lifetime at this station. Backfilled to zero for
        // pre-V12.22 records (the spread in bumpStat handles missing
        // keys gracefully).
        //
        // draftPositions: array of pick numbers (1-10) every time
        // the artist was drafted. Lets us compute avg/min/best pick.
        // We cap at 200 entries so the array doesn't grow unbounded.
        draftPositions: [],
        // pointsScoredWhenDrafted: total points generated for the
        // drafting player across every day this artist was drafted.
        // Excludes bonus song bonus points (those are counted in the
        // bonus song hall of fame separately) — actually we INCLUDE
        // them here because from a draft-value standpoint, the total
        // points is what matters.
        pointsScoredWhenDrafted: 0,
        // bestSingleDay: { points, dateISO, stationId } — the best
        // day this artist ever had for a drafter.
        bestSingleDay: null,
        // Granular event-type breakdowns (subset of timesPlayedTotal)
        walkOffCount: 0,
        retaliationCount: 0,
        b2bCount: 0,
        tripleEndCount: 0,
      },
    };
  },

  // Look up a canonical artist name in a station's pool by normalized
  // match. Returns the canonical name (existing key) or null.
  findCanonical(stationPool, rawName) {
    if (!stationPool) return null;
    const norm = normalizeText(rawName);
    if (!norm) return null;
    for (const key of Object.keys(stationPool)) {
      if (normalizeText(key) === norm) return key;
    }
    return null;
  },

  // Seed a brand-new station's pool from its format defaults. If the
  // station has no format, returns an empty object so the user can build
  // it up by hand.
  seedFromFormat(station) {
    if (!station || !station.format) return {};
    const defaults = FORMAT_ARTIST_POOLS[station.format] || [];
    const pool = {};
    for (const name of defaults) {
      pool[name] = stationArtistsEngine.emptyRecord(name, 'seed');
    }
    return pool;
  },

  // Ensure a station has a populated pool. If the user just created the
  // station (no entry in stationArtists) we seed from format. If the
  // station already exists, we leave it alone — the user owns it.
  ensureSeeded(stationArtists, station) {
    if (!station || !station.id || station.isSentinel) return stationArtists;
    if (stationArtists[station.id]) return stationArtists; // already owned
    return {
      ...stationArtists,
      [station.id]: stationArtistsEngine.seedFromFormat(station),
    };
  },

  // V12.2: additive merge of format defaults into an EXISTING station
  // pool. Preserves all existing records (their stats, songs, deleted/
  // hidden state stay intact). Only adds artists not currently present.
  // Used by the "RESEED FROM FORMAT" action to pull in newly-added
  // catalog entries (e.g. after we expand FORMAT_ARTIST_POOLS) without
  // wiping the user's customizations or play history.
  //
  // Returns { stationArtists, addedCount } so the UI can confirm.
  mergeFromFormat(stationArtists, station) {
    if (!station || !station.id || station.isSentinel) {
      return { stationArtists, addedCount: 0 };
    }
    if (!station.format || !FORMAT_ARTIST_POOLS[station.format]) {
      return { stationArtists, addedCount: 0 };
    }
    const existing = stationArtists[station.id] || {};
    const pool = { ...existing };
    let added = 0;
    for (const name of FORMAT_ARTIST_POOLS[station.format]) {
      const canonical = stationArtistsEngine.findCanonical(pool, name);
      if (!canonical) {
        pool[name] = stationArtistsEngine.emptyRecord(name, 'seed');
        added += 1;
      }
    }
    if (added === 0) return { stationArtists, addedCount: 0 };
    return {
      stationArtists: { ...stationArtists, [station.id]: pool },
      addedCount: added,
    };
  },

  // Pure: returns updated station pool with the artist added (or
  // restored if previously deleted/hidden). Idempotent.
  addArtist(stationPool, rawName, source = 'manual') {
    const trimmed = String(rawName || '').trim();
    if (!trimmed) return stationPool;
    const existing = stationArtistsEngine.findCanonical(stationPool, trimmed);
    if (existing) {
      // Re-activate if soft-deleted or hidden
      const rec = stationPool[existing];
      if (rec.deleted || !rec.active) {
        return {
          ...stationPool,
          [existing]: { ...rec, deleted: false, active: true },
        };
      }
      return stationPool;
    }
    return {
      ...stationPool,
      [trimmed]: stationArtistsEngine.emptyRecord(trimmed, source),
    };
  },

  // Pure: returns updated station pool with the artist soft-deleted.
  deleteArtist(stationPool, name) {
    if (!stationPool[name]) return stationPool;
    return {
      ...stationPool,
      [name]: { ...stationPool[name], deleted: true, active: false },
    };
  },

  // Pure: toggle the active flag (hide/restore distinct from delete).
  setActive(stationPool, name, active) {
    if (!stationPool[name]) return stationPool;
    return {
      ...stationPool,
      [name]: { ...stationPool[name], active, deleted: active ? false : stationPool[name].deleted },
    };
  },

  // Pure: replace songs list for a (station, artist).
  setSongs(stationPool, name, songs) {
    if (!stationPool[name]) return stationPool;
    const cleaned = (songs || []).map(s => String(s).trim()).filter(Boolean).slice(0, 20);
    return {
      ...stationPool,
      [name]: { ...stationPool[name], songs: cleaned },
    };
  },

  // Increment a counter on a specific (station, artist). Used by absorbDay
  // and by reducer dispatch wrappers.
  bumpStat(stationPool, name, field, delta = 1) {
    if (!stationPool[name]) return stationPool;
    const rec = stationPool[name];
    return {
      ...stationPool,
      [name]: {
        ...rec,
        stats: { ...rec.stats, [field]: (rec.stats[field] || 0) + delta },
      },
    };
  },

  setTimestamp(stationPool, name, field, iso) {
    if (!stationPool[name]) return stationPool;
    return {
      ...stationPool,
      [name]: { ...stationPool[name], [field]: iso },
    };
  },

  // Day-end absorption — invoked when a day completes. Walks the day's
  // drafts + events and increments per-(station, artist) stats. Pure:
  // takes current stationArtists and returns updated.
  //
  // We treat "drafted today" as the entire drafts array for both players
  // (artists were drafted on this station today). For each one:
  //   - draftedCount += 1
  //   - lastDraftedAt = now
  //   - If they scored cleanly today: playedWhenDraftedCount += 1
  //
  // For event-driven counts, we walk events:
  //   - timesPlayedTotal += 1 for every non-meta event with that artist
  //   - blockedCount / stolenCount on flagged events
  //   - bonusSongCount on bonus-song matches
  //
  // 5-for-5 contribution: when fiveForFiveAwarded[playerIdx] is true,
  // every UNIQUE drafted artist of that player gets contributionCount++.
  absorbDay(stationArtists, game) {
    const stationId = game?.station?.id;
    if (!stationId) return stationArtists;
    const ds = game.currentDayState;
    if (!ds || !ds.dayComplete) return stationArtists;
    // Auto-seed if missing — defensive; should already be seeded by now.
    let pool = (stationArtists[stationId] && { ...stationArtists[stationId] })
      || stationArtistsEngine.seedFromFormat(game.station);
    const now = new Date().toISOString();

    // Track which artists were drafted today (across both players, deduped)
    const draftedToday = new Set();
    for (const idx of [0, 1]) {
      for (const artist of ds.drafts[idx] || []) {
        draftedToday.add(artist);
      }
    }

    // Apply draftedCount/lastDraftedAt for every artist drafted today.
    // V12.22: also capture the PICK POSITION (1-10) for each drafted
    // artist. We rebuild the draft order from the dayState — pick N's
    // owner is draftOrder[N-1], and we walk drafts[0]/drafts[1] in
    // parallel to figure out who picked what when. Pre-V12.17 saves
    // without draftOrder fall through to snake order.
    const draftOrder = ds.draftOrder || [0, 1, 1, 0, 0, 1, 1, 0, 0, 1];
    const pickPositionOf = {}; // artist -> pick number (1-10)
    {
      const slotCursors = [0, 0]; // index into drafts[0] / drafts[1]
      for (let i = 0; i < draftOrder.length; i++) {
        const owner = draftOrder[i];
        const slot = slotCursors[owner];
        const artist = ds.drafts[owner]?.[slot];
        if (artist && !(artist in pickPositionOf)) {
          pickPositionOf[artist] = i + 1;
        }
        slotCursors[owner] += 1;
      }
    }

    for (const artist of draftedToday) {
      // Auto-add if a player drafted a custom artist that isn't in pool yet
      if (!pool[artist]) {
        pool[artist] = stationArtistsEngine.emptyRecord(artist, 'manual');
      }
      pool = stationArtistsEngine.bumpStat(pool, artist, 'draftedCount', 1);
      pool = stationArtistsEngine.setTimestamp(pool, artist, 'lastDraftedAt', now);
      // V12.22: record pick position (capped array to avoid unbounded growth)
      const pickNum = pickPositionOf[artist];
      if (pickNum) {
        const rec = pool[artist];
        const positions = [...(rec.stats?.draftPositions || []), pickNum].slice(-200);
        pool = {
          ...pool,
          [artist]: {
            ...rec,
            stats: { ...rec.stats, draftPositions: positions },
          },
        };
      }
    }

    // V12.22: walk events to also tally per-artist per-day points (for
    // the drafting player), best-day records, and granular event types.
    // Per-day-points uses the drafter's effective score from each event:
    // if event.effectivePlayer is the owner, points go to owner; if the
    // play was stolen/counter-stolen, the points went to the OTHER
    // player, so they DON'T count toward the artist's draft value for
    // the original drafter. We only credit points the drafter actually
    // collected.
    const perArtistPointsToday = {}; // artist -> points the drafter collected today
    // Walk events for play/block/steal/bonus tallies + lastPlayedAt
    const playedCleanly = new Set(); // artists that scored a clean play today
    const events = (ds.events || []).filter(e => !e.meta);
    for (const ev of events) {
      const artist = ev.artist;
      if (!artist) continue;
      if (!pool[artist]) {
        // First time we've seen this artist on this station — seed it as
        // playlist-derived. Future hook for real provider data.
        pool[artist] = stationArtistsEngine.emptyRecord(artist, 'playlist');
      }
      pool = stationArtistsEngine.bumpStat(pool, artist, 'timesPlayedTotal', 1);
      pool = stationArtistsEngine.setTimestamp(pool, artist, 'lastPlayedAt', now);
      if (ev.blocked) {
        pool = stationArtistsEngine.bumpStat(pool, artist, 'blockedCount', 1);
      } else if (ev.stolen || ev.counterStolen) {
        pool = stationArtistsEngine.bumpStat(pool, artist, 'stolenCount', 1);
      } else if (draftedToday.has(artist)) {
        // Clean play of a drafted artist counts toward draft success.
        // Multiple plays in one day still only count once for success
        // rate (drafted-and-played is a binary outcome per day).
        if (!playedCleanly.has(artist)) {
          playedCleanly.add(artist);
          pool = stationArtistsEngine.bumpStat(pool, artist, 'playedWhenDraftedCount', 1);
        }
        // Accumulate today's points for the drafter (clean plays only —
        // blocked or stolen events don't credit the drafter).
        const pts = ev.totalPoints || 0;
        perArtistPointsToday[artist] = (perArtistPointsToday[artist] || 0) + pts;
      }
      if (ev.isBonus) {
        pool = stationArtistsEngine.bumpStat(pool, artist, 'bonusSongCount', 1);
      }
      // V12.22: granular event-type tallies (only count for the drafter's
      // benefit — stolen/blocked plays don't get credited here).
      if (!ev.blocked && !ev.stolen && !ev.counterStolen) {
        if (ev.isWalkoff) pool = stationArtistsEngine.bumpStat(pool, artist, 'walkOffCount', 1);
        if (ev.isRetal)   pool = stationArtistsEngine.bumpStat(pool, artist, 'retaliationCount', 1);
        if (ev.isB2B)     pool = stationArtistsEngine.bumpStat(pool, artist, 'b2bCount', 1);
        if (ev.isTriple)  pool = stationArtistsEngine.bumpStat(pool, artist, 'tripleEndCount', 1);
      }
    }

    // V12.22: apply per-day points totals + best-day check.
    for (const [artist, pts] of Object.entries(perArtistPointsToday)) {
      if (pts <= 0) continue;
      const rec = pool[artist];
      const prevTotal = rec.stats?.pointsScoredWhenDrafted || 0;
      const prevBest = rec.stats?.bestSingleDay;
      const isNewBest = !prevBest || pts > prevBest.points;
      pool = {
        ...pool,
        [artist]: {
          ...rec,
          stats: {
            ...rec.stats,
            pointsScoredWhenDrafted: prevTotal + pts,
            bestSingleDay: isNewBest
              ? { points: pts, dateISO: now, stationId }
              : prevBest,
          },
        },
      };
    }

    // 5-for-5 contribution: for any player who achieved 5-for-5 today,
    // every unique artist on their roster gets +1.
    for (const idx of [0, 1]) {
      if (ds.fiveForFiveAwarded?.[idx]) {
        const unique = new Set(ds.drafts[idx] || []);
        for (const artist of unique) {
          if (pool[artist]) {
            pool = stationArtistsEngine.bumpStat(pool, artist, 'fiveForFiveContributionCount', 1);
          }
        }
      }
    }

    return { ...stationArtists, [stationId]: pool };
  },
};

// Helper: compute draft success rate from a record. Returns null when
// the artist was never drafted (so callers can display "Never drafted"
// instead of 0%).
function draftSuccessRate(record) {
  if (!record || !record.stats) return null;
  const d = record.stats.draftedCount || 0;
  if (d === 0) return null;
  return (record.stats.playedWhenDraftedCount || 0) / d;
}

// V12.4: classify an artist record into a heat/reliability tag for the
// Station Artist Pool view. Returns null when not enough signal to label.
// Tag IDs (and their visual treatment lives in StationArtistRow):
//   - 'undiscovered' : never drafted (zero signal — could be value pick)
//   - 'untested'     : 1-2 drafts, not enough sample size
//   - 'hot'          : 3+ drafts, success rate >= 0.67, played recently
//   - 'reliable'     : 3+ drafts, success rate >= 0.50
//   - 'cold'         : 3+ drafts, no plays in last 14 days
//   - 'trap'         : 4+ drafts, success rate < 0.25 (drafts disappoint)
function artistHeatTag(record) {
  if (!record || !record.stats) return null;
  const drafted = record.stats.draftedCount || 0;
  const played = record.stats.playedWhenDraftedCount || 0;
  const totalPlays = record.stats.timesPlayedTotal || 0;
  if (drafted === 0) return 'undiscovered';
  if (drafted < 3) return 'untested';
  const rate = played / drafted;
  // Trap: been drafted enough, almost never delivers.
  if (drafted >= 4 && rate < 0.25) return 'trap';
  // Cold: no plays in the recent window (radio rotation moved on).
  const lastPlayed = record.lastPlayedAt ? new Date(record.lastPlayedAt) : null;
  if (lastPlayed) {
    const daysSince = (Date.now() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 14 && rate < 0.5) return 'cold';
  } else if (totalPlays === 0) {
    return 'cold';
  }
  // Hot: high success rate, played recently
  if (rate >= 0.67) return 'hot';
  if (rate >= 0.5) return 'reliable';
  return null;
}

// Visual mapping for heat tags. Returns { label, color, icon } so the
// row component stays declarative.
function heatTagDisplay(tag) {
  switch (tag) {
    case 'hot':         return { label: 'HOT', color: '#EF4444', icon: 'flame' };
    case 'reliable':    return { label: 'RELIABLE', color: C.green, icon: 'shield' };
    case 'cold':        return { label: 'COLD STREAK', color: '#60A5FA', icon: 'snowflake' };
    case 'trap':        return { label: 'TRAP ARTIST', color: C.red, icon: 'alert' };
    case 'untested':    return { label: 'UNTESTED', color: C.silver, icon: 'plus' };
    case 'undiscovered':return { label: 'DEEP CUT', color: C.silver, icon: 'star' };
    default:            return null;
  }
}

// V12.22: derived analytics for the scouting report.
// Returns null entries when the sample size is too small (< 3 drafts)
// so the UI can show "needs more games" instead of misleading data.
// All metrics are pure derivations from the record's stats blob.
function deriveArtistAnalytics(record) {
  const s = record?.stats || {};
  const drafted = s.draftedCount || 0;
  const played = s.playedWhenDraftedCount || 0;
  const positions = s.draftPositions || [];
  const totalPoints = s.pointsScoredWhenDrafted || 0;
  const hasEnough = drafted >= 3;
  const avgDraftPosition = positions.length > 0
    ? (positions.reduce((a, b) => a + b, 0) / positions.length)
    : null;
  const earliestPick = positions.length > 0 ? Math.min(...positions) : null;
  const latestPick = positions.length > 0 ? Math.max(...positions) : null;
  const avgPointsWhenDrafted = drafted > 0 ? (totalPoints / drafted) : null;
  // Avg points PER successful day (excludes the duds entirely — answers
  // "when this artist DOES play, what's the typical haul")
  const avgPointsWhenHits = played > 0 ? (totalPoints / played) : null;
  const hitRate = drafted > 0 ? (played / drafted) : null;
  return {
    drafted,
    hasEnough,
    played,
    hitRate,                // 0..1, or null
    avgDraftPosition,       // 1..10, or null (no min-sample gate; positions are factual)
    earliestPick,
    latestPick,
    avgPointsWhenDrafted,   // total / drafted
    avgPointsWhenHits,      // total / played
    totalPoints,
    bestSingleDay: s.bestSingleDay || null,
    walkOffCount: s.walkOffCount || 0,
    retaliationCount: s.retaliationCount || 0,
    b2bCount: s.b2bCount || 0,
    tripleEndCount: s.tripleEndCount || 0,
    bonusSongCount: s.bonusSongCount || 0,
    blockedCount: s.blockedCount || 0,
    stolenCount: s.stolenCount || 0,
    fiveForFiveContributionCount: s.fiveForFiveContributionCount || 0,
  };
}

// ============================================================
// V12.27 PLAYLIST INGESTION
// ============================================================
// Pure helper. Takes a dayState + a sequence of normalized tracks and
// runs each one through scoreTrack in chronological order. Returns
// the final dayState along with a summary the UI can show.
//
// All ingested events get tagged `ev.backfilled = true` so the event
// feed can render them with a "BACKFILLED" footnote. Walk-offs, blocks,
// steals, and shot calls are NOT triggered by ingestion — only clean
// play / neutral scoring runs. This matches the rule that tactical
// power-ups require a real-time decision at the moment a song plays.
function ingestTracks(initialDs, tracks, currentDay = 1) {
  let ds = initialDs;
  const events = [];
  let scored = 0;
  let neutral = 0;
  let skipped = 0;
  // Sort chronologically — paste order from onlineradiobox is newest
  // first, so we reverse to oldest-first for correct B2B/Retal/Shot
  // sequencing.
  const ordered = [...(tracks || [])].sort((a, b) => {
    const tA = a.playedAt instanceof Date ? a.playedAt.getTime() : new Date(a.playedAt).getTime();
    const tB = b.playedAt instanceof Date ? b.playedAt.getTime() : new Date(b.playedAt).getTime();
    return tA - tB;
  });
  for (const track of ordered) {
    if (!track || !track.artist) { skipped++; continue; }
    const { ds: nextDs, event } = engine.scoreTrack(ds, track, currentDay);
    if (!event) { skipped++; continue; }
    // Tag the event for UI rendering
    const taggedEvent = { ...event, backfilled: true };
    // Replace the most recent event in nextDs with the tagged version
    const evs = nextDs.events.length > 0
      ? [taggedEvent, ...nextDs.events.slice(1)]
      : [taggedEvent];
    ds = { ...nextDs, events: evs };
    events.push(taggedEvent);
    if (engine.findOwner(initialDs, track.artist) === null) {
      neutral++;
    } else {
      scored++;
    }
  }
  return { ds, events, summary: { totalParsed: tracks.length, scored, neutral, skipped } };
}

// ============================================================
// REDUCER
// ============================================================

const MAX_UNDO = 12;
const MAX_EVENTS = 100;

function pushUndo(game) {
  const snap = { day: game.currentDay, ds: JSON.parse(JSON.stringify(game.currentDayState)) };
  return { ...game, undoStack: [...(game.undoStack || []), snap].slice(-MAX_UNDO) };
}

function reducer(game, action) {
  if (action.type === 'NEW_GAME') return action.game;
  if (action.type === 'RESET') return null;
  if (!game) return game;

  switch (action.type) {
    case 'DRAFT': {
      const g = pushUndo(game);
      return { ...g, currentDayState: engine.draftPick(game.currentDayState, game.weekEliminated || [], action.artist) };
    }
    case 'SET_BONUS':
      return { ...game, currentDayState: engine.setBonusSong(game.currentDayState, action.player, action.bonusSong) };
    case 'SCORE': {
      // Existing UX entry point. Tap on an artist button -> player is known,
      // we build a manual Track and feed it through the canonical pipeline.
      //
      // V12.3: If action.breakStreakFirst is true, the user has confirmed
      // that the LAST scoring song was NOT adjacent on the radio (something
      // else played between the previous scoring event and this one). We
      // clear streak state before invoking scoreTrack so the engine won't
      // mistakenly award BACK-TO-BACK or fire THREE IN A ROW based on a
      // chain that doesn't reflect actual radio adjacency.
      //
      // V12.6: Same flag also suppresses RETALIATION when the opponent
      // scored last but their song wasn't actually immediately before
      // this one. Clearing lastScorer to null causes the retaliation
      // branch in scoreArtist to fall through to the no-bonus case.
      const g = pushUndo(game);
      let priorDs = game.currentDayState;
      if (action.breakStreakFirst) {
        priorDs = { ...priorDs, lastScorer: null, consecutiveCount: 0 };
      }
      const track = PROVIDERS.manual.makeTrack({
        artist: action.artist,
        song: action.song || null,
        stationId: game.station?.id || 'unknown',
        scoreType: action.scoreType || 'play',
      });
      if (!track) return game;
      const { ds, event } = engine.scoreTrack(priorDs, track, game.currentDay);
      if (!event) return game;
      return { ...g, currentDayState: { ...ds, events: [event, ...ds.events].slice(0, MAX_EVENTS) } };
    }
    case 'INGEST_TRACK': {
      // New provider-driven entry point. action.track is already a
      // normalized Track from any PlaylistProvider.
      const g = pushUndo(game);
      const { ds, event } = engine.scoreTrack(game.currentDayState, action.track, game.currentDay);
      if (!event) return game;
      return { ...g, currentDayState: { ...ds, events: [event, ...ds.events].slice(0, MAX_EVENTS) } };
    }
    case 'INGEST_BATCH': {
      // V12.27: batch ingestion from playlist paste. action.tracks is
      // an array of already-normalized Track objects. Each runs through
      // scoreTrack in chronological order. One undo snapshot for the
      // whole batch (so you can revert the entire import in one tap).
      const g = pushUndo(game);
      const tracks = action.tracks || [];
      if (tracks.length === 0) return game;
      const result = ingestTracks(game.currentDayState, tracks, game.currentDay);
      return { ...g, currentDayState: result.ds };
    }
    case 'NEUTRAL_TRACK': {
      // User marks "a neutral song just played" — used to resolve armed
      // Block/Steal/Shot Calls against songs nobody drafted.
      const g = pushUndo(game);
      const track = {
        artist: '(NEUTRAL)',
        song: null,
        playedAt: new Date(),
        stationId: game.station?.id || 'unknown',
        source: 'manual',
        id: `manual:neutral:${Date.now()}`,
      };
      const { ds, event } = engine.scoreNeutralSong(game.currentDayState, track, new Date());
      if (!event) return game;
      return { ...g, currentDayState: { ...ds, events: [event, ...ds.events].slice(0, MAX_EVENTS) } };
    }
    case 'ARM_BLOCK': {
      const g = pushUndo(game);
      const { ds, event } = engine.armBlock(game.currentDayState, action.player);
      if (!event) return game;
      return { ...g, currentDayState: { ...ds, events: [event, ...ds.events].slice(0, MAX_EVENTS) } };
    }
    case 'ARM_STEAL': {
      const g = pushUndo(game);
      const { ds, event } = engine.armSteal(game.currentDayState, action.player);
      if (!event) return game;
      return { ...g, currentDayState: { ...ds, events: [event, ...ds.events].slice(0, MAX_EVENTS) } };
    }
    // V12.15: COUNTER-STEAL selection. action.player is the VICTIM
    // (the one whose roster is being stolen from). action.artist is
    // the artist they're picking from the opponent's current roster.
    case 'SELECT_COUNTER_STEAL': {
      const g = pushUndo(game);
      const { ds, event } = engine.selectCounterSteal(
        game.currentDayState, action.player, action.artist
      );
      if (!event) return game;
      return { ...g, currentDayState: { ...ds, events: [event, ...ds.events].slice(0, MAX_EVENTS) } };
    }
    // V12.15: victim explicitly declines the counter-steal. Original
    // Steal stays armed; victim just gives up the counter opportunity.
    case 'DISMISS_COUNTER_STEAL': {
      const ds = game.currentDayState;
      const ev = metaEvent(action.player, 'COUNTER-STEAL DECLINED');
      return {
        ...game,
        currentDayState: {
          ...ds,
          counterStealArtist: null,
          counterStealBy: null,
          events: [ev, ...ds.events].slice(0, MAX_EVENTS),
        },
      };
    }
    case 'SHOT_CALL': {
      const g = pushUndo(game);
      const { ds, event, mustCounter } = engine.declareShotCall(
        game.currentDayState, action.player, action.level,
        action.predictedArtist, action.predictedSong, !!action.isCounter
      );
      if (!event) return game;
      return { ...g, currentDayState: { ...ds, events: [event, ...ds.events].slice(0, MAX_EVENTS) }, pendingMustCounter: mustCounter };
    }
    case 'CLEAR_COUNTER':
      return { ...game, pendingMustCounter: null };
    case 'CANCEL_SHOTS': {
      const g = pushUndo(game);
      const { ds, event } = engine.cancelShotCalls(game.currentDayState);
      if (!event) return game;
      return { ...g, currentDayState: { ...ds, events: [event, ...ds.events].slice(0, MAX_EVENTS) }, pendingMustCounter: null };
    }
    case 'REMOVE_EVENT': {
      // V12.3: user is correcting a mis-tap. Soft-remove the targeted
      // event and rebuild derived state. See engine.removeEvent for
      // the exact semantics.
      const g = pushUndo(game);
      const { ds, event } = engine.removeEvent(game.currentDayState, action.eventId);
      if (!event) return game; // event not found or already removed
      return { ...g, currentDayState: { ...ds, events: [event, ...ds.events].slice(0, MAX_EVENTS) } };
    }
    case 'CORRECT_EVENT': {
      // V12.4: replay-review style correction. Currently restricted by
      // the UI to the MOST RECENT live event ("the call that just
      // happened"). Implementation:
      //   1. Remove the targeted event via engine.removeEvent (subtracts
      //      its points, rebuilds derived state)
      //   2. Re-score with the corrected artist/song through the normal
      //      scoreTrack pipeline (gets fresh B2B/Retal/Bonus evaluation
      //      against the rebuilt state)
      // Note: the corrected event lands at the head of the events list
      // with a current timestamp. For the most-recent-event case this is
      // effectively the same position. We don't try to preserve the
      // original timestamp because timestamps are derived from current
      // wall time at log time, not a user-facing identity.
      const g = pushUndo(game);
      const { ds: dsAfterRemove, event: removeEvt } = engine.removeEvent(
        game.currentDayState, action.eventId
      );
      if (!removeEvt) return game;
      const track = PROVIDERS.manual.makeTrack({
        artist: action.artist,
        song: action.song || null,
        stationId: game.station?.id || 'unknown',
        scoreType: action.scoreType || 'play',
      });
      if (!track) return game;
      const { ds: dsFinal, event: newEvt } = engine.scoreTrack(dsAfterRemove, track, game.currentDay);
      if (!newEvt) return game;
      // Tag the new event so the feed can label it as a correction
      const taggedEvent = { ...newEvt, isCorrection: true };
      return {
        ...g,
        currentDayState: {
          ...dsFinal,
          events: [taggedEvent, ...dsFinal.events].slice(0, MAX_EVENTS),
        },
      };
    }
    case 'CLEAR_FLASH':
      return { ...game, currentDayState: { ...game.currentDayState, lastEventPoints: null } };
    case 'TRIPLE_END_DAY': {
      const ds0 = game.currentDayState;
      // If tied at triple-time, the player whose third song just played
      // scored the FINAL song of the day (their triple was the last play),
      // so the ½-point rule awards the half to them.
      let half = null;
      if (ds0.scores[0] === ds0.scores[1]) {
        half = ds0.dayEndedByTriple;
      }
      const ds = engine.endDay(ds0, half);
      const players = game.players.map((p, i) => i === ds.winner ? { ...p, weeklyWins: p.weeklyWins + 1 } : p);
      return { ...game, players, currentDayState: ds };
    }
    case 'END_DAY': {
      const ds = engine.endDay(game.currentDayState, action.halfPointWinner);
      const players = game.players.map((p, i) => i === ds.winner ? { ...p, weeklyWins: p.weeklyWins + 1 } : p);
      return { ...game, players, currentDayState: ds };
    }
    case 'ADVANCE_DAY': {
      // V12.8: hard cap at day 5. The work week is Mon-Fri; no advancing
      // into a phantom day 6. The UI hides the advance button past the
      // boundary, but we also enforce it here as a safety net.
      if (game.currentDay >= 5) return game;
      const ds0 = game.currentDayState;
      // Day-level highlights for the weekly recap. Cheap to compute now,
      // expensive to reconstruct later.
      const allEvents = (ds0.events || []).filter(e => !e.meta);
      const bigPlay = allEvents
        .filter(e => !e.blocked && e.totalPoints >= 3)
        .sort((a, b) => b.totalPoints - a.totalPoints)[0] || null;
      const blockedBonus = allEvents.find(e => {
        if (!e.blocked) return false;
        const oppBonus = ds0.bonusSongs[e.owner];
        return oppBonus && oppBonus.artist === e.artist;
      }) || null;
      const fiveForFive = ds0.fiveForFiveAwarded?.[0] || ds0.fiveForFiveAwarded?.[1] || false;
      const fiveForFivePlayer = ds0.fiveForFiveAwarded?.[0] ? 0
                              : ds0.fiveForFiveAwarded?.[1] ? 1 : null;
      // Per-artist play tallies for this day
      const artistPlays = {};
      for (const ev of allEvents) {
        if (ev.blocked || !ev.artist) continue;
        artistPlays[ev.artist] = (artistPlays[ev.artist] || 0) + 1;
      }
      const hist = {
        day: game.currentDay,
        scores: ds0.scores,
        winner: ds0.winner,
        drafts: ds0.drafts,
        bonusSongs: ds0.bonusSongs,
        playedToday: ds0.playedToday,
        halfPoint: ds0.halfPoint,
        bonusPlayCount: ds0.bonusSongPlayCount,
        dayEndedByTriple: ds0.dayEndedByTriple,
        // Highlights — keep slim, only what the recap needs
        bigPlay: bigPlay ? {
          artist: bigPlay.artist, song: bigPlay.song,
          totalPoints: bigPlay.totalPoints,
          player: bigPlay.effectivePlayer,
          isBonus: !!bigPlay.isBonus, is5for5: !!bigPlay.is5for5,
          isWalkoff: !!bigPlay.isWalkoff, isTriple: !!bigPlay.isTriple,
        } : null,
        blockedBonus: blockedBonus ? {
          artist: blockedBonus.artist,
          blocker: 1 - blockedBonus.owner,
          victim: blockedBonus.owner,
        } : null,
        fiveForFive, fiveForFivePlayer,
        artistPlays,
      };
      const weekEliminated = Array.from(new Set([
        ...(game.weekEliminated || []),
        ...game.currentDayState.playedToday,
      ]));
      // V12.17: loser of the day just finished picks first tomorrow.
      const nextFirstPicker = engine.firstPickerForNextDay(hist, game.weekHistory);
      return {
        ...game,
        currentDay: game.currentDay + 1,
        currentDayState: engine.createDayState(nextFirstPicker),
        weekHistory: [...game.weekHistory, hist],
        weekEliminated,
        undoStack: [],
      };
    }
    case 'SKIP_DAY': {
      // V12.5: skip the current day without declaring a winner. Used
      // when a workday doesn't happen (sick day, weekend pulled
      // forward, jobsite shutdown). Behavior:
      //   - No END_DAY fires, no weeklyWins changes
      //   - Current dayState (including any partial drafts / scores) is
      //     discarded
      //   - A "skipped" history entry is added so the weekly recap
      //     reflects the actual week shape
      //   - currentDay advances by 1
      //   - weekEliminated is NOT updated (nothing played, nothing
      //     eliminated)
      //   - pushUndo is called so a single UNDO restores the day
      //
      // V12.8: on day 5 we DON'T increment currentDay (there is no day
      // 6) but we still record the skipped history entry. We also mark
      // the new empty dayState as dayComplete so the weekDone gate fires
      // and the user lands on the recap path.
      const g = pushUndo(game);
      const isLastDay = game.currentDay >= 5;
      const skippedHist = {
        day: game.currentDay,
        skipped: true,
        // Carry zero-shaped fields so recap-row code doesn't crash on
        // missing values. Match the rough shape of a normal hist entry.
        scores: [0, 0],
        winner: null,
        drafts: game.currentDayState.drafts,
        bonusSongs: game.currentDayState.bonusSongs,
        playedToday: [],
        halfPoint: [false, false],
        bonusPlayCount: [0, 0],
        dayEndedByTriple: null,
        bigPlay: null,
        blockedBonus: null,
        fiveForFive: false,
        fiveForFivePlayer: null,
        artistPlays: {},
      };
      // V12.17: when a day is skipped, the next day's first picker is
      // determined by the most recent day in history that had a real
      // winner. The skipped day itself contributes no information.
      const nextFirstPicker = engine.firstPickerForNextDay(skippedHist, game.weekHistory);
      const freshDs = engine.createDayState(nextFirstPicker);
      return {
        ...g,
        currentDay: isLastDay ? game.currentDay : game.currentDay + 1,
        currentDayState: isLastDay
          ? { ...freshDs, dayComplete: true, winner: null }
          : freshDs,
        weekHistory: [...game.weekHistory, skippedHist],
        // weekEliminated unchanged — a skipped day eliminates nobody
      };
    }
    case 'UNDO': {
      if (!game.undoStack || game.undoStack.length === 0) return game;
      const stack = [...game.undoStack];
      const snap = stack.pop();
      return { ...game, currentDay: snap.day, currentDayState: snap.ds, undoStack: stack };
    }
    // V12.19: RENAME_ARTIST applies the rename to the GAME portion only.
    // The accompanying side-effect updates to stationArtists, stats,
    // catalog, and customArtists happen at the App level where those
    // stores live. Undo is pushed so a single UNDO reverts the rename
    // on game state. Stats/catalog/stationArtists changes are NOT in the
    // undo stack — they're separate persistence layers — but they're
    // structurally additive (merging into a canonical name), so an
    // accidental rename is recoverable manually if needed.
    case 'RENAME_ARTIST': {
      const { oldName, newName } = action;
      if (!oldName || !newName || oldName === newName) return game;
      const g = pushUndo(game);
      const renamed = engine.renameArtistInGame(g, oldName, newName);
      return renamed;
    }
    default:
      return game;
  }
}

// ============================================================
// STORAGE
// ============================================================

const STORAGE_KEY = 'radio_draft_v4';
const STATIONS_KEY = 'radio_draft_stations_v4';
const CUSTOM_SONGS_KEY = 'radio_draft_custom_songs_v4';
const CUSTOM_ARTISTS_KEY = 'radio_draft_custom_artists_v4';
// V12 station-owned artist ecosystems. Shape:
//   { [stationId]: { [canonicalArtistName]: StationArtistRecord } }
// One blob, one read/write. See StationArtistRecord shape near the
// stationArtistsEngine definition for field details.
const STATION_ARTISTS_KEY = 'radio_draft_station_artists_v4';
const STATS_KEY = 'radio_draft_stats_v4';
// V12.21: per-profile career data. Shape:
//   {
//     profiles: [{ id, name, createdAt, stats, isLegacy, lastPlayedAt }],
//     activeProfileId: string | null,
//   }
// Stats are now PER PROFILE. The legacy device-global stats blob
// (STATS_KEY) is migrated on first launch into a profile named
// "LEGACY" so no career history is lost.
const PROFILES_KEY = 'radio_draft_profiles_v1';

// V12.29: Storage adapter — works in both Claude's artifact runtime
// (which exposes window.storage as an async key-value store) and a
// regular browser environment (which has localStorage as a sync API).
// In both cases, the loadStored/saveStored/deleteStored signatures
// stay async so the rest of the app doesn't care which backend is in
// use. localStorage limits (~5-10MB depending on browser) are well
// above this app's data footprint (a few hundred KB even after years
// of play).
const _storageAdapter = (() => {
  // Claude artifact mode — window.storage exists and is async.
  if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
    return {
      mode: 'claude',
      async get(key) {
        const r = await window.storage.get(key);
        return r ? r.value : null;
      },
      async set(key, value) { await window.storage.set(key, value); },
      async delete(key) { await window.storage.delete(key); },
    };
  }
  // Browser mode — localStorage exists synchronously. We wrap each
  // call in a resolved promise so the public API stays async.
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      mode: 'localStorage',
      async get(key) {
        const v = window.localStorage.getItem(key);
        return v == null ? null : v;
      },
      async set(key, value) {
        try { window.localStorage.setItem(key, value); } catch (e) {
          // Quota or private-mode failures fall through silently.
          // We log once so the user can see it in devtools if needed.
          console.warn('localStorage.setItem failed:', e?.message || e);
        }
      },
      async delete(key) { window.localStorage.removeItem(key); },
    };
  }
  // No storage available (SSR or sandboxed iframe) — return a no-op
  // adapter so the app still renders without crashing.
  return {
    mode: 'none',
    async get() { return null; },
    async set() {},
    async delete() {},
  };
})();

async function loadStored(key) {
  try {
    const raw = await _storageAdapter.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
async function saveStored(key, value) {
  try { await _storageAdapter.set(key, JSON.stringify(value)); } catch {}
}
async function deleteStored(key) {
  try { await _storageAdapter.delete(key); } catch {}
}

// ============================================================
// UI ATOMS
// ============================================================

// V12.10: 'white' / '#fff' / '#ffffff' references from the dark-theme
// era are now auto-remapped to the theme's primary text color so old
// `<Stencil color="#fff">` calls automatically become near-black on
// the light theme. Buttons set their color via raw style attributes
// (not through Stencil/Mono), so button text stays the intentional
// white on colored backgrounds.
const _remapTextColor = (c) => {
  if (c === '#fff' || c === '#FFF' || c === '#ffffff' || c === '#FFFFFF' || c === 'white') return C.text;
  return c;
};

const Stencil = ({ children, size = 16, color = C.text, weight = 700, tracking = '0.05em', style = {}, className = '' }) => {
  // V12.7: enforce a readability floor of 10px. Oswald is a condensed
  // font and below this size it starts to lose definition on small
  // phone screens.
  const renderSize = Math.max(10, size);
  return (
    <span className={className} style={{
      fontFamily: '"Oswald", "Arial Narrow", sans-serif',
      fontWeight: weight, fontSize: renderSize, letterSpacing: tracking, color: _remapTextColor(color), ...style,
    }}>{children}</span>
  );
};

const Mono = ({ children, size = 11, color = C.silver, style = {}, className = '' }) => {
  // V12.7: enforce a readability floor. Many "tag" usages still want a
  // visually small look, but anything below 9px monospace becomes hard
  // to read on a phone screen regardless of palette. We clamp the
  // rendered font-size to 9 while leaving the call sites unchanged.
  const renderSize = Math.max(9, size);
  return (
    <span className={className} style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: renderSize, color: _remapTextColor(color), letterSpacing: '0.05em', ...style,
    }}>{children}</span>
  );
};

// RadioLogo: inline SVG of the brand mark — green body, navy detail,
// tilted antenna, white dial + smaller dial, three white speaker bars on
// a navy inset panel. Scales crisply at any size. The `size` prop sets
// the pixel width; height is preserved at 2:3 ratio of the artwork.
//
// Colors deliberately mirror the existing Whalers palette. Default outline
// uses silver instead of pure navy so the mark stays legible on the
// dark backdrop without losing identity.
const RadioLogo = ({ size = 96, className = '', style = {} }) => {
  const body = C.green;        // green body
  const detail = '#1B2A5E';     // navy — same as C.blue family, slightly brighter
  const accent = '#E8EAEC';     // near-white for the dial + speaker bars
  // Outline color tuned for dark backdrops — adds a subtle ring so the
  // navy elements don't disappear into deep backgrounds.
  const ring = C.silver;
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size * (2 / 3)}
      viewBox="0 0 300 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="The Radio Draft"
    >
      {/* Antenna — drawn first so the body covers its base */}
      <line
        x1="110" y1="78" x2="240" y2="32"
        stroke={detail} strokeWidth="9" strokeLinecap="round"
      />
      <line
        x1="110" y1="78" x2="240" y2="32"
        stroke={ring} strokeWidth="1.5" strokeLinecap="round" opacity="0.35"
      />

      {/* Body shadow lip (the navy strip at the bottom of the original) */}
      <rect x="42" y="155" width="216" height="22" rx="10" fill={detail} />

      {/* Main body */}
      <rect x="40" y="60" width="220" height="105" rx="14" fill={body} />
      {/* Subtle inner highlight on top for tactility */}
      <rect x="40" y="60" width="220" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
      {/* Outer ring for dark-backdrop legibility */}
      <rect
        x="40" y="60" width="220" height="105" rx="14"
        fill="none" stroke={ring} strokeWidth="1.5" opacity="0.4"
      />

      {/* Speaker panel (navy inset on the left) */}
      <rect x="62" y="82" width="106" height="62" rx="8" fill={detail} />
      {/* Three speaker bars */}
      <rect x="76" y="93"  width="78" height="8" rx="2" fill={accent} />
      <rect x="76" y="109" width="78" height="8" rx="2" fill={accent} />
      <rect x="76" y="125" width="78" height="8" rx="2" fill={accent} />

      {/* Large dial */}
      <circle cx="212" cy="100" r="20" fill={accent} stroke={detail} strokeWidth="3" />
      <circle cx="212" cy="100" r="20" fill="none" stroke={ring} strokeWidth="0.8" opacity="0.5" />

      {/* Small dial */}
      <circle cx="212" cy="135" r="9" fill={accent} stroke={detail} strokeWidth="2.5" />
      <circle cx="212" cy="135" r="9" fill="none" stroke={ring} strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
};

// Hazard: amber/black 45° stripe. Kept ONLY for moments that should feel
// genuinely chaotic and construction-y — currently just the triple-in-a-row
// cinematic takeover. Everywhere else uses TrimBar (audio-equipment vibe).
const Hazard = ({ thickness = 6, className = '' }) => (
  <div className={className} style={{
    height: thickness,
    background: `repeating-linear-gradient(45deg, ${C.amber} 0px, ${C.amber} 10px, ${C.darker} 10px, ${C.darker} 20px)`,
  }} />
);

// TrimBar: brushed-aluminum gradient with a thin colored accent line.
// Replaces hazard as the default divider — feels like a stereo-deck seam.
// Variants pick the accent color; thickness controls overall height.
const TrimBar = ({ accent = 'amber', thickness = 8, className = '', style = {} }) => {
  const lineColor =
    accent === 'green' ? C.green :
    accent === 'red' ? C.red :
    accent === 'silver' ? C.silver :
    accent === 'blue' ? C.blueLight :
    C.amber;
  return (
    <div className={className} style={{
      height: thickness,
      position: 'relative',
      // brushed-aluminum: subtle vertical gradient + faint horizontal sheen
      // V12.12: dark brushed metal — equipment edge on slate
      background: `linear-gradient(180deg, #5C6573 0%, #4A5260 50%, #3A4250 100%)`,
      borderTop: `1px solid #6E7886`,
      borderBottom: `1px solid #2C333F`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.5)`,
      overflow: 'hidden',
      ...style,
    }}>
      {/* Thin colored trim line dead-center */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: '50%', transform: 'translateY(-50%)',
        height: 1.5,
        background: lineColor,
        boxShadow: `0 0 6px ${lineColor}88`,
      }} />
    </div>
  );
};

const Btn = ({ onClick, children, variant = 'primary', disabled = false, size = 'lg', style = {}, className = '' }) => {
  const variants = {
    primary: { bg: C.green, fg: '#fff', border: C.greenLight, shadow: '#022D17' },
    secondary: { bg: C.blue, fg: '#fff', border: C.blueLight, shadow: '#001138' },
    danger: { bg: C.red, fg: '#fff', border: '#FCA5A5', shadow: '#7F1D1D' },
    amber: { bg: C.amber, fg: '#1A1A1A', border: '#FBBF24', shadow: C.amberDark },
    ghost: { bg: 'transparent', fg: C.silver, border: C.border, shadow: 'transparent' },
    dark: { bg: C.cardHi, fg: '#fff', border: C.borderHi, shadow: C.darker },
  };
  const v = variants[variant];
  const pad = size === 'lg' ? '17px 18px' : size === 'md' ? '13px 14px' : '9px 12px';
  const fs = size === 'lg' ? 17 : size === 'md' ? 14 : 12;
  return (
    <button onClick={onClick} disabled={disabled}
      className={`relative w-full active:translate-y-0.5 transition-all duration-75 ${className}`}
      style={{
        background: disabled ? C.darker : v.bg,
        color: disabled ? C.textDim : v.fg,
        border: `2px solid ${disabled ? C.border : v.border}`,
        padding: pad,
        fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: fs,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        boxShadow: disabled ? 'none' : `0 3px 0 ${v.shadow}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}>{children}</button>
  );
};

const SectionDivider = ({ children, accent = C.silver }) => (
  <div className="flex items-center gap-2 my-3">
    <div style={{ height: 2, background: accent, width: 14 }} />
    <Stencil size={10} color={accent} tracking="0.3em">{children}</Stencil>
    <div style={{ height: 1, background: C.border, flex: 1 }} />
  </div>
);

const Backdrop = () => (
  <div className="fixed inset-0 pointer-events-none" style={{
    zIndex: 0,
    // V12.10: flat gray. No gradient, no grain, no layers. The page
    // is a solid sheet so white cards have maximum contrast against it.
    background: C.dark,
  }} />
);

// ============================================================
// FLASH
// ============================================================

function ScoreFlash({ event, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, [event.id, onDone]);
  const color = event.player === 0 ? C.green : C.silver;
  return (
    <div className="fixed pointer-events-none" style={{
      top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 100, animation: 'scoreFlash 1.2s cubic-bezier(0.16,1,0.3,1) forwards',
    }}>
      <div style={{
        fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 96,
        color: color, lineHeight: 1,
        textShadow: `0 0 30px ${color}, 0 0 60px ${color}aa, 4px 4px 0 rgba(0,0,0,0.2)`,
        WebkitTextStroke: `2px ${color}`,
      }}>+{event.points}</div>
    </div>
  );
}

// ============================================================
// APP
// ============================================================

export default function RadioDraftApp() {
  const [game, dispatch] = useReducer(reducer, null);
  const [screen, setScreen] = useState('landing');
  const [loaded, setLoaded] = useState(false);
  const [stations, setStations] = useState(DEFAULT_STATIONS);
  // customSongs: { [artist]: string[] } — user-added songs per artist, persists across weeks
  const [customSongs, setCustomSongs] = useState({});
  // customArtists: { [canonicalName]: { firstAddedAt, draftCount } }
  // Stored separately from ARTIST_SONG_CATALOG so the built-in catalog can
  // evolve without conflicting with user additions.
  // V12: now mostly legacy — new flows write to stationArtists. Kept for
  // backwards-compat reads and as a fallback for ungoverned shot-call /
  // bonus-song artist lookups.
  const [customArtists, setCustomArtists] = useState({});
  // V12: station-owned artist ecosystems (the new primary data source).
  // { [stationId]: { [artistName]: StationArtistRecord } }
  const [stationArtists, setStationArtists] = useState({});
  // Persistent cross-game statistics + earned badges
  const [stats, setStats] = useState(emptyStats());
  // Queue of badge IDs to announce via toast. UI shifts as it shows them.
  const [badgeQueue, setBadgeQueue] = useState([]);
  // V12.21: local profiles. profiles[] is the list; activeProfileId is
  // the profile considered "you" (whose stats are surfaced by default).
  // banner is dismissed after first interaction. Empty profiles list
  // means we haven't migrated yet (handled in load effect below).
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await loadStored(STORAGE_KEY);
      const customStations = await loadStored(STATIONS_KEY);
      const savedSongs = await loadStored(CUSTOM_SONGS_KEY);
      const savedArtists = await loadStored(CUSTOM_ARTISTS_KEY);
      const savedStationArtists = await loadStored(STATION_ARTISTS_KEY);
      const savedStats = await loadStored(STATS_KEY);
      const savedProfiles = await loadStored(PROFILES_KEY);
      if (saved) dispatch({ type: 'NEW_GAME', game: saved });
      if (customStations && Array.isArray(customStations)) {
        setStations(customStations.map(upgradeStation));
      }
      if (savedSongs && typeof savedSongs === 'object') setCustomSongs(savedSongs);
      if (savedArtists && typeof savedArtists === 'object') setCustomArtists(savedArtists);
      if (savedStationArtists && typeof savedStationArtists === 'object') {
        setStationArtists(savedStationArtists);
      } else if (savedArtists && typeof savedArtists === 'object') {
        // V12 migration: see note above (intentionally a no-op).
      }
      if (savedStats && typeof savedStats === 'object' && savedStats.totals) setStats(savedStats);

      // V12.21: profile load + migration. If we have a saved profiles
      // bundle, restore it. If not but we have existing stats, migrate
      // those into a "LEGACY" profile so no career history is lost.
      // If we have neither, start with an empty profiles list.
      if (savedProfiles && Array.isArray(savedProfiles.profiles) && savedProfiles.profiles.length > 0) {
        setProfiles(savedProfiles.profiles);
        setActiveProfileId(savedProfiles.activeProfileId || savedProfiles.profiles[0].id);
        setProfileBannerDismissed(true); // already onboarded
      } else if (savedStats && typeof savedStats === 'object' && savedStats.totals) {
        const legacy = emptyProfile('LEGACY', { isLegacy: true, stats: savedStats });
        setProfiles([legacy]);
        setActiveProfileId(legacy.id);
        // banner stays visible until first user interaction
      } else {
        setProfiles([]);
        setActiveProfileId(null);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (game) saveStored(STORAGE_KEY, game);
    else deleteStored(STORAGE_KEY);
  }, [game, loaded]);

  useEffect(() => { if (loaded) saveStored(STATIONS_KEY, stations); }, [stations, loaded]);
  useEffect(() => { if (loaded) saveStored(CUSTOM_SONGS_KEY, customSongs); }, [customSongs, loaded]);
  useEffect(() => { if (loaded) saveStored(CUSTOM_ARTISTS_KEY, customArtists); }, [customArtists, loaded]);
  useEffect(() => { if (loaded) saveStored(STATION_ARTISTS_KEY, stationArtists); }, [stationArtists, loaded]);
  useEffect(() => { if (loaded) saveStored(STATS_KEY, stats); }, [stats, loaded]);
  // V12.21: persist profiles + active profile id together.
  useEffect(() => {
    if (!loaded) return;
    saveStored(PROFILES_KEY, { profiles, activeProfileId });
  }, [profiles, activeProfileId, loaded]);

  const addCustomSong = useCallback((artist, song) => {
    if (!artist || !song) return;
    setCustomSongs(cs => {
      const existing = cs[artist] || [];
      // Dedupe (case-insensitive)
      const exists = existing.some(s => normalizeText(s) === normalizeText(song));
      if (exists) return cs;
      return { ...cs, [artist]: [...existing, song].slice(0, 20) };
    });
  }, []);

  // Canonicalize a user-typed artist name. Trims, title-cases each word
  // (preserving short conjunctions in lowercase if present), and returns
  // the polished form. We do NOT alphabet-only filter — artists like
  // "Guns N' Roses" or "AC/DC" need their punctuation.
  const titleCaseArtist = (raw) => {
    const cleaned = String(raw || '').trim().replace(/\s+/g, ' ');
    if (!cleaned) return '';
    // Acronym preserve: if input is all-uppercase and 2-4 chars (AC/DC, U2),
    // keep as-is.
    if (/^[A-Z0-9/&'.-]{1,5}$/.test(cleaned)) return cleaned;
    return cleaned.split(' ').map((w, i) => {
      if (i > 0 && /^(and|of|the|in|on|a|an|to|for|by|&)$/i.test(w)) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  };

  const addCustomArtist = useCallback((rawName) => {
    const name = titleCaseArtist(rawName);
    if (!name) return null;
    // Dedupe against the built-in catalog AND existing custom additions.
    // Returns the canonical name (existing or newly-added) so the caller
    // can immediately use it to draft / score.
    const norm = normalizeText(name);
    const builtIn = Object.keys(ARTIST_SONG_CATALOG).find(a => normalizeText(a) === norm);
    let canonical = builtIn || name;
    if (!builtIn) {
      setCustomArtists(ca => {
        const existing = Object.keys(ca).find(a => normalizeText(a) === norm);
        if (existing) {
          canonical = existing;
          return ca;
        }
        return { ...ca, [name]: { firstAddedAt: new Date().toISOString(), draftCount: 0 } };
      });
    }
    return canonical;
  }, []);

  // V12.19: Rename an artist EVERYWHERE. Updates:
  //   - Game state via RENAME_ARTIST action (events, drafts, bonusSongs,
  //     playedToday, weekHistory, weekEliminated, etc)
  //   - customArtists map (key rename, merging draftCount if both exist)
  //   - stationArtists across every station (records merged if both exist)
  //   - Career stats (topArtists, bonusSongHallOfFame, perBonusSong keys)
  // Built-in ARTIST_SONG_CATALOG entries (the in-code constants) are NOT
  // touched — they're shipped with the app. The user can ADD a corrected
  // spelling via customArtists, and the rename will then point future
  // events at the corrected name. If the user renames TO a built-in
  // catalog entry, the merge naturally consolidates.
  //
  // Returns the canonical newName on success, or null if the rename
  // refused (same name, empty input, etc).
  const renameArtistGlobally = useCallback((oldName, rawNewName) => {
    const newName = titleCaseArtist(rawNewName);
    if (!oldName || !newName || oldName === newName) return null;
    // Update game (via reducer)
    dispatch({ type: 'RENAME_ARTIST', oldName, newName });
    // Update customArtists
    setCustomArtists(ca => {
      if (!(oldName in ca)) return ca;
      const oldEntry = ca[oldName];
      const newEntry = ca[newName];
      const merged = newEntry ? {
        ...newEntry,
        draftCount: (newEntry.draftCount || 0) + (oldEntry.draftCount || 0),
      } : { ...oldEntry };
      const next = { ...ca };
      delete next[oldName];
      next[newName] = merged;
      return next;
    });
    // Update stationArtists
    setStationArtists(sa => renameArtistInStationArtists(sa, oldName, newName));
    // Update stats
    setStats(s => renameArtistInStats(s, oldName, newName));
    return newName;
  }, [dispatch]);

  // V12: add (or restore) an artist into a specific station's pool. This
  // is what the Draft screen and Station Artist Pool screen should use —
  // it ensures the artist becomes immediately visible in that station's
  // draft picker on next render. Returns the canonical name on success.
  const addArtistToStation = useCallback((stationId, rawName, source = 'manual') => {
    if (!stationId) return null;
    const name = titleCaseArtist(rawName);
    if (!name) return null;
    let canonical = name;
    setStationArtists(sa => {
      const pool = sa[stationId] || {};
      // Detect existing record (active, hidden, or deleted)
      const existing = stationArtistsEngine.findCanonical(pool, name);
      if (existing) {
        canonical = existing;
        // If it's deleted/hidden, addArtist will reactivate it.
        const updated = stationArtistsEngine.addArtist(pool, existing, source);
        return { ...sa, [stationId]: updated };
      }
      const updated = stationArtistsEngine.addArtist(pool, name, source);
      return { ...sa, [stationId]: updated };
    });
    return canonical;
  }, []);

  // V12: delete/hide/restore wrappers around stationArtistsEngine.
  const deleteArtistFromStation = useCallback((stationId, name) => {
    setStationArtists(sa => {
      const pool = sa[stationId];
      if (!pool) return sa;
      return { ...sa, [stationId]: stationArtistsEngine.deleteArtist(pool, name) };
    });
  }, []);

  const setArtistActive = useCallback((stationId, name, active) => {
    setStationArtists(sa => {
      const pool = sa[stationId];
      if (!pool) return sa;
      return { ...sa, [stationId]: stationArtistsEngine.setActive(pool, name, active) };
    });
  }, []);

  const setArtistSongs = useCallback((stationId, name, songs) => {
    setStationArtists(sa => {
      const pool = sa[stationId];
      if (!pool) return sa;
      return { ...sa, [stationId]: stationArtistsEngine.setSongs(pool, name, songs) };
    });
  }, []);

  // V12.2: pull in any newly-added format defaults into this station's
  // pool. Existing records preserved. Reports the added count back via
  // the optional callback so the UI can confirm "Added N new artists".
  const mergeStationFromFormat = useCallback((station, onComplete) => {
    setStationArtists(sa => {
      const { stationArtists: next, addedCount } = stationArtistsEngine.mergeFromFormat(sa, station);
      if (onComplete) onComplete(addedCount);
      return next;
    });
  }, []);

  // Called by the UI after END_DAY/TRIPLE_END_DAY reducer steps complete.
  // Pure function over the game post-end-day; stats updated in place via setStats.
  const absorbDayIntoStats = useCallback((gameSnapshot) => {
    // V12.21: legacy device-global stats absorb is preserved so any UI
    // reading from `stats` still works for pre-profile games. Profile
    // absorption is additive on top: each linked profile gets the day's
    // outcome applied to its own stats blob.
    setStats(prev => {
      const { stats: next, newBadges } = statsEngine.absorbDay(prev, gameSnapshot);
      if (newBadges.length) setBadgeQueue(q => [...q, ...newBadges]);
      return next;
    });
    // Per-profile absorption
    const playerProfileIds = gameSnapshot.playerProfileIds || [null, null];
    const winnerIdx = gameSnapshot.currentDayState?.winner;
    const station = gameSnapshot.station;
    const stationId = station?.id;
    const stationName = station?.name;
    if (!playerProfileIds[0] && !playerProfileIds[1]) return;
    setProfiles(list => list.map(prof => {
      const slot = playerProfileIds[0] === prof.id ? 0
        : playerProfileIds[1] === prof.id ? 1
        : null;
      if (slot === null) return prof;
      const opponentId = playerProfileIds[1 - slot] || null;
      const wonDay = winnerIdx === slot;
      // Absorb the stats blob update for this profile (using the existing
      // engine — it doesn't know about profiles, so we just hand it our
      // copy of the prior stats and let it compute the delta).
      const { stats: nextStats } = statsEngine.absorbDay(prof.stats || emptyStats(), gameSnapshot);
      let nextProf = { ...prof, stats: nextStats };
      // Apply profile-specific derived counters (streaks, h2h, per-station).
      nextProf = profileEngine.absorbDayResult(nextProf, {
        wonDay,
        opponentId,
        stationId,
        stationName,
      });
      return nextProf;
    }));
  }, []);

  const absorbWeekIntoStats = useCallback((gameSnapshot) => {
    setStats(prev => {
      const { stats: next, newBadges } = statsEngine.absorbWeek(prev, gameSnapshot);
      if (newBadges.length) setBadgeQueue(q => [...q, ...newBadges]);
      return next;
    });
    // Per-profile week absorb
    const playerProfileIds = gameSnapshot.playerProfileIds || [null, null];
    if (!playerProfileIds[0] && !playerProfileIds[1]) return;
    setProfiles(list => list.map(prof => {
      const slot = playerProfileIds[0] === prof.id ? 0
        : playerProfileIds[1] === prof.id ? 1
        : null;
      if (slot === null) return prof;
      const { stats: nextStats } = statsEngine.absorbWeek(prof.stats || emptyStats(), gameSnapshot);
      return { ...prof, stats: nextStats, lastPlayedAt: Date.now() };
    }));
  }, []);

  // V12.21: profile CRUD
  const createProfile = useCallback((name) => {
    const clean = (name || '').trim().toUpperCase().slice(0, 24);
    if (!clean) return null;
    const profile = emptyProfile(clean);
    setProfiles(list => [...list, profile]);
    return profile.id;
  }, []);

  const renameProfile = useCallback((profileId, newName) => {
    const clean = (newName || '').trim().toUpperCase().slice(0, 24);
    if (!clean) return;
    setProfiles(list => list.map(p =>
      p.id === profileId ? { ...p, name: clean, isLegacy: false } : p
    ));
  }, []);

  const deleteProfile = useCallback((profileId) => {
    setProfiles(list => {
      const remaining = list.filter(p => p.id !== profileId);
      // If the deleted profile was active, switch to the first remaining
      // (or null if no profiles left).
      setActiveProfileId(curr => curr === profileId ? (remaining[0]?.id || null) : curr);
      return remaining;
    });
  }, []);

  const setActiveProfile = useCallback((profileId) => {
    setActiveProfileId(profileId);
  }, []);

  const dismissProfileBanner = useCallback(() => {
    setProfileBannerDismissed(true);
  }, []);

  const dismissBadge = useCallback(() => {
    setBadgeQueue(q => q.slice(1));
  }, []);

  const startNewGame = useCallback((p1, p2, station, startDate, playerProfileIds = [null, null]) => {
    // V12.21: playerProfileIds links each player slot to a profile.
    // If null, that slot is unlinked (no profile gets credit). p1/p2
    // strings are still the display names used for the scoreboard UI.
    const game = engine.createGame(p1, p2, station, startDate);
    dispatch({ type: 'NEW_GAME', game: { ...game, playerProfileIds } });
    // V12: ensure this station has a seeded artist pool.
    setStationArtists(sa => stationArtistsEngine.ensureSeeded(sa, station));
    setScreen('draft');
  }, []);

  const resetGame = useCallback(async (nextScreen = 'landing') => {
    dispatch({ type: 'RESET' });
    await deleteStored(STORAGE_KEY);
    setScreen(nextScreen);
  }, []);

  // Triple-in-a-row: pause briefly on the live screen, then end day
  useEffect(() => {
    if (game?.currentDayState?.dayEndedByTriple !== null
        && game?.currentDayState?.dayEndedByTriple !== undefined
        && !game?.currentDayState?.dayComplete
        && screen === 'live') {
      const t = setTimeout(() => dispatch({ type: 'TRIPLE_END_DAY' }), 1100);
      return () => clearTimeout(t);
    }
  }, [game?.currentDayState?.dayEndedByTriple, game?.currentDayState?.dayComplete, screen]);

  // Stats absorption: each completed day absorbs into stats exactly once.
  // We tag the dayComplete event with a stable ID (day number + game createdAt)
  // and skip if we've already absorbed it.
  const absorbedDaysRef = useRef(new Set());
  const absorbedWeeksRef = useRef(new Set());

  useEffect(() => {
    if (!game || !game.currentDayState?.dayComplete) return;
    const dayKey = `${game.createdAt}::${game.currentDay}`;
    if (absorbedDaysRef.current.has(dayKey)) return;
    absorbedDaysRef.current.add(dayKey);
    absorbDayIntoStats(game);
    // V12: also absorb into station-specific artist records.
    setStationArtists(sa => stationArtistsEngine.absorbDay(sa, game));

    // Check for week completion
    const weekDone = game.currentDay >= 5 || game.players.some(p => p.weeklyWins >= 3);
    if (weekDone) {
      const weekKey = `${game.createdAt}`;
      if (!absorbedWeeksRef.current.has(weekKey)) {
        absorbedWeeksRef.current.add(weekKey);
        absorbWeekIntoStats(game);
      }
    }
  }, [game?.currentDayState?.dayComplete, game?.currentDay, game?.createdAt, absorbDayIntoStats, absorbWeekIntoStats]);

  // Combined artist pool = built-in catalog + user-added customs.
  // Recomputed only when customArtists changes. Sorted alphabetically so
  // search results are predictable. canonicalizeArtist (used by playlist
  // providers) reads from window-level ARTIST_POOL — we don't try to keep
  // Combined artist pool = built-in catalog + user-added customs.
  // Universal fallback when no station is selected. Per-station draft
  // pools are derived separately via buildDraftPool() below.
  const combinedArtistPool = React.useMemo(() => {
    const builtIn = Object.keys(ARTIST_SONG_CATALOG);
    const customs = Object.keys(customArtists);
    const seen = new Set();
    const out = [];
    for (const a of [...builtIn, ...customs]) {
      const k = normalizeText(a);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(a);
    }
    return out.sort((a, b) => a.localeCompare(b));
  }, [customArtists]);

  // Station-aware draft pool. Targets ~32 artists ordered by relevance:
  //   1. Format defaults (artists that match the station's format)
  //   2. Recently played on this station (from mock provider history)
  //   3. User-added custom artists
  //   4. Historical favorites (artists this user has drafted often)
  //
  // We deduplicate via normalizeText. Buckets fill in priority order until
  // the target is reached; if buckets are sparse (new user, no history),
  // we fall back to the universal pool so the draft is never empty.
  // V12: station-aware draft pool. Reads strictly from the active
  // station's ecosystem. No cross-bleed. If the station has no pool yet
  // (edge case for old saves), buildDraftPool falls back to seeding from
  // format defaults inline.
  const stationDraftPool = React.useMemo(() => {
    if (!game?.station) return [];
    return buildDraftPool({
      station: game.station,
      stationArtists,
    });
  }, [game?.station, stationArtists]);

  // V12.21: derived active profile from id + list
  const activeProfile = React.useMemo(
    () => profiles.find(p => p.id === activeProfileId) || null,
    [profiles, activeProfileId]
  );

  if (!loaded) {
    return (
      <div style={{ background: C.dark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stencil size={20} color={C.blue} tracking="0.3em">LOADING…</Stencil>
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div style={{
        minHeight: '100vh', background: C.dark, color: C.text,
        fontFamily: '"Oswald", system-ui, sans-serif',
        position: 'relative', overflowX: 'hidden',
      }}>
        <Backdrop />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', minHeight: '100vh' }}>
          {screen === 'landing' && (
            <Landing
              game={game}
              setScreen={setScreen}
              resetGame={resetGame}
              stats={activeProfile?.stats || stats}
              profiles={profiles}
              activeProfile={activeProfile}
              profileBannerDismissed={profileBannerDismissed}
              dismissProfileBanner={dismissProfileBanner}
            />
          )}
          {screen === 'newWeek' && <NewWeek
            stations={stations}
            setStations={setStations}
            onStart={startNewGame}
            setScreen={setScreen}
            profiles={profiles}
            activeProfileId={activeProfileId}
            createProfile={createProfile}
          />}
          {screen === 'dashboard' && game && <Dashboard game={game} setScreen={setScreen} stats={activeProfile?.stats || stats} />}
          {screen === 'draft' && game && (
            <Draft
              game={game}
              dispatch={dispatch}
              setScreen={setScreen}
              artistPool={stationDraftPool}
              addArtist={(name) => addArtistToStation(game.station?.id, name, 'manual')}
            />
          )}
          {screen === 'live' && game && <Live game={game} dispatch={dispatch} setScreen={setScreen} customSongs={customSongs} addCustomSong={addCustomSong} artistPool={combinedArtistPool} addCustomArtist={addCustomArtist} />}
          {screen === 'endDay' && game && <EndDay game={game} dispatch={dispatch} setScreen={setScreen} resetGame={resetGame} />}
          {screen === 'rules' && <Rules setScreen={setScreen} hasGame={!!game} />}
          {screen === 'trophyCase' && <TrophyCase stats={activeProfile?.stats || stats} setScreen={setScreen} hasGame={!!game} />}
          {screen === 'weekRecap' && game && <WeekRecap game={game} stats={activeProfile?.stats || stats} setScreen={setScreen} resetGame={resetGame} />}
          {screen === 'profiles' && (
            <ProfilesScreen
              profiles={profiles}
              activeProfileId={activeProfileId}
              onCreate={createProfile}
              onRename={renameProfile}
              onDelete={deleteProfile}
              onSetActive={setActiveProfile}
              setScreen={setScreen}
            />
          )}
          {screen === 'stationPool' && game && (
            <StationArtistPool
              station={game.station}
              stationPool={stationArtists[game.station?.id] || {}}
              onAdd={(name) => addArtistToStation(game.station?.id, name, 'manual')}
              onDelete={(name) => deleteArtistFromStation(game.station?.id, name)}
              onSetActive={(name, active) => setArtistActive(game.station?.id, name, active)}
              onSetSongs={(name, songs) => setArtistSongs(game.station?.id, name, songs)}
              onReseed={(cb) => mergeStationFromFormat(game.station, cb)}
              onRename={renameArtistGlobally}
              setScreen={setScreen}
            />
          )}
        </div>
        {/* Badge unlock toast — sits above everything */}
        {badgeQueue.length > 0 && (
          <BadgeToast
            badgeId={badgeQueue[0]}
            owner={stats.badges[badgeQueue[0]]?.owner}
            onDismiss={dismissBadge}
          />
        )}
      </div>
    </>
  );
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    body, html { background: ${C.darker}; margin: 0; padding: 0; overscroll-behavior: none; }

    @keyframes scoreFlash {
      0%   { opacity: 0; transform: translate(-50%, -30%) scale(0.4) rotate(-3deg); }
      15%  { opacity: 1; transform: translate(-50%, -50%) scale(1.25) rotate(2deg); }
      40%  { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-1deg); }
      85%  { opacity: 1; transform: translate(-50%, -55%) scale(0.95); }
      100% { opacity: 0; transform: translate(-50%, -90%) scale(0.8); }
    }
    @keyframes slideInRight {
      from { transform: translateX(20px); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    @keyframes pulseBorder {
      0%, 100% { box-shadow: 0 0 0 0 currentColor; }
      50%      { box-shadow: 0 0 0 5px transparent; }
    }
    @keyframes scoreboardPop {
      0%   { transform: scale(1); }
      25%  { transform: scale(1.2); color: ${C.amber}; }
      100% { transform: scale(1); }
    }
    @keyframes flicker {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.45; }
    }
    @keyframes tripleScreen {
      0%   { opacity: 0; transform: scale(0.6); }
      50%  { opacity: 1; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes badgeIn {
      0%   { opacity: 0; transform: translate(-50%, -100%); }
      60%  { opacity: 1; transform: translate(-50%, 8px); }
      100% { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes ledFlicker {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.96; }
    }
    @keyframes ledWindowFlash {
      0%   { box-shadow: inset 0 3px 8px rgba(0,0,0,0.9), 0 0 0 0 currentColor, inset 0 0 0 0 currentColor; }
      30%  { box-shadow: inset 0 3px 8px rgba(0,0,0,0.9), 0 0 18px 4px currentColor, inset 0 0 8px 1px currentColor; }
      100% { box-shadow: inset 0 3px 8px rgba(0,0,0,0.9), 0 0 0 0 currentColor, inset 0 0 0 0 currentColor; }
    }
    @keyframes ledDigitRoll {
      0%   { transform: translateY(-30%); opacity: 0; }
      40%  { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .event-enter { animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    .armed { animation: pulseBorder 1.2s infinite; }
    .pop { animation: scoreboardPop 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .flicker { animation: flicker 0.8s infinite; }
    .led { animation: ledFlicker 4s infinite; }
    .led-flash { animation: ledWindowFlash 0.7s ease-out; }
    .led-roll { animation: ledDigitRoll 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.6; }
    select option { background: ${C.darker} !important; color: white; }
  `}</style>
);

const iconBtn = {
  background: 'transparent', border: 'none', color: C.silver, cursor: 'pointer',
  padding: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const inputStyle = {
  width: '100%', background: C.card, border: `2px solid ${C.borderHi}`, color: C.text,
  padding: '13px 14px',
  fontFamily: '"Oswald", sans-serif', fontSize: 20, fontWeight: 700,
  letterSpacing: '0.04em', textTransform: 'uppercase', outline: 'none',
};

// ============================================================
// LANDING
// ============================================================

function Landing({ game, setScreen, resetGame, stats, profiles, activeProfile, profileBannerDismissed, dismissProfileBanner }) {
  const hasGame = !!game;
  const earnedBadges = stats ? Object.keys(stats.badges || {}).length : 0;
  const careerWeeks = stats?.totals?.weeksWon || 0;
  const hasProfiles = profiles && profiles.length > 0;
  const hasOnlyLegacy = hasProfiles && profiles.length === 1 && profiles[0].isLegacy;
  // V12.21: banner shows on first launch after migration. If user has
  // no profiles at all (fresh install), it nudges them to create one.
  // If user has only the auto-migrated LEGACY profile, it nudges them
  // to rename. Dismissed permanently after user interacts.
  const showProfileBanner = !profileBannerDismissed && (hasOnlyLegacy || !hasProfiles);
  // V12.8: in-app confirmation instead of window.confirm() which is
  // blocked or silently ignored in many embedded/webview contexts —
  // that was the "START NEW WEEK button does nothing" bug.
  const [confirmNew, setConfirmNew] = useState(false);
  const handleNew = () => {
    if (hasGame) {
      setConfirmNew(true);
    } else {
      setScreen('newWeek');
    }
  };
  const acceptNew = async () => {
    setConfirmNew(false);
    // Reset and navigate to newWeek in a single transition — no
    // landing-flash, no setScreen race.
    await resetGame('newWeek');
  };

  return (
    <div className="px-5 py-8 flex flex-col" style={{ minHeight: '100vh' }}>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div style={{ marginBottom: 16 }}>
          <RadioLogo size={140} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ border: `2px solid ${C.silver}`, padding: '3px 12px', background: C.blue, transform: 'rotate(-2deg)' }}>
            <Stencil size={11} color={C.silver} tracking="0.35em">EST. ON SITE</Stencil>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <Stencil size={56} color="#fff" style={{ display: 'block', lineHeight: 0.9, textShadow: `4px 4px 0 ${C.blue}` }}>THE RADIO</Stencil>
          <Stencil size={92} color={C.green} style={{
            display: 'block', lineHeight: 0.85, letterSpacing: '-0.03em',
            textShadow: `4px 4px 0 ${C.darker}, 0 0 40px ${C.green}66`,
          }}>DRAFT</Stencil>
        </div>
        <div className="my-5 w-full max-w-xs"><TrimBar accent="amber" thickness={8} /></div>
        <Stencil size={17} color={C.silver} tracking="0.25em">WIN THE DAY.</Stencil>
        <Stencil size={17} color={C.amber} tracking="0.25em" style={{ marginTop: 4 }}>WIN THE WEEK.</Stencil>
        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Hammer size={12} style={{ color: C.silver }} />
          <Mono size={10} color={C.silver}>JOBSITE EDITION • V5.0</Mono>
          <Hammer size={12} style={{ color: C.silver }} />
        </div>
        {hasGame && (
          <div style={{
            marginTop: 24, padding: '8px 14px', background: C.cardHi,
            border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 6, height: 6, background: C.green, borderRadius: '50%' }} className="flicker" />
            <Mono size={10} color={C.silver}>
              WEEK IN PROGRESS • {game.players[0].name} {game.players[0].weeklyWins} – {game.players[1].weeklyWins} {game.players[1].name}
            </Mono>
          </div>
        )}
        {(earnedBadges > 0 || careerWeeks > 0) && (
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            {careerWeeks > 0 && (
              <Mono size={10} color={C.silver}>
                <span style={{ color: C.amber, fontWeight: 700 }}>{careerWeeks}</span> WEEKS WON
              </Mono>
            )}
            {earnedBadges > 0 && (
              <Mono size={10} color={C.silver}>
                <span style={{ color: C.amber, fontWeight: 700 }}>{earnedBadges}</span> BADGES
              </Mono>
            )}
          </div>
        )}
        {/* V12.21: active profile pill — small, unobtrusive, tappable */}
        {activeProfile && (
          <button
            onClick={() => setScreen('profiles')}
            style={{
              marginTop: 14,
              padding: '5px 12px',
              background: 'transparent',
              border: `1px dashed ${C.border}`,
              color: C.silver,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}
          >
            <User size={11} />
            <Mono size={9} color={C.silver} style={{ letterSpacing: '0.2em', fontWeight: 700 }}>
              {activeProfile.name}
            </Mono>
            <Mono size={8} color={C.textDim} style={{ letterSpacing: '0.15em' }}>
              · SWITCH
            </Mono>
          </button>
        )}
      </div>
      <div className="space-y-3 pb-4">
        {/* V12.21: soft, dismissible profile banner. Shows only when
            the user hasn't engaged with profiles yet — either no
            profiles exist or only the auto-migrated LEGACY one. */}
        {showProfileBanner && (
          <div style={{
            padding: '10px 12px',
            background: `${C.blue}33`,
            border: `2px solid ${C.blueLight}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <User size={18} style={{ color: C.blueLight, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Mono size={9} color={C.blueLight} style={{
                letterSpacing: '0.2em', fontWeight: 700, display: 'block', marginBottom: 2,
              }}>
                NEW · PROFILES
              </Mono>
              <Mono size={9} color="#fff" style={{ letterSpacing: '0.04em', lineHeight: 1.4 }}>
                {hasOnlyLegacy
                  ? 'Your career stats are now in a LEGACY profile. Tap to rename it to yourself, or add a second profile for a coworker.'
                  : 'Profiles keep your career stats separate from your opponents. Tap to set one up.'}
              </Mono>
            </div>
            <button
              onClick={() => { dismissProfileBanner(); setScreen('profiles'); }}
              style={{
                padding: '6px 10px',
                background: C.blue,
                border: `1px solid ${C.blueLight}`,
                color: '#fff',
                fontFamily: '"Oswald", sans-serif',
                fontWeight: 700, fontSize: 10,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                cursor: 'pointer', flexShrink: 0,
              }}
            >SET UP</button>
            <button
              onClick={dismissProfileBanner}
              style={{
                background: 'transparent', border: 'none',
                color: C.silver, cursor: 'pointer',
                padding: 4, display: 'flex', alignItems: 'center',
              }}
              aria-label="Dismiss"
            ><X size={14} /></button>
          </div>
        )}
        {hasGame && (
          <Btn onClick={() => setScreen('dashboard')} variant="primary">
            <span className="inline-flex items-center gap-2"><Play size={18} fill="currentColor" /> CONTINUE — DAY {game.currentDay}</span>
          </Btn>
        )}
        <Btn onClick={handleNew} variant={hasGame ? 'secondary' : 'primary'}>
          <span className="inline-flex items-center gap-2"><Radio size={18} /> START NEW WEEK</span>
        </Btn>
        <div className="grid grid-cols-3 gap-2">
          <Btn onClick={() => setScreen('profiles')} variant="ghost" size="sm">
            <span className="inline-flex items-center gap-1"><User size={14} /> PROFILES</span>
          </Btn>
          <Btn onClick={() => setScreen('trophyCase')} variant="ghost" size="sm">
            <span className="inline-flex items-center gap-1"><Trophy size={14} /> STATS</span>
          </Btn>
          <Btn onClick={() => setScreen('rules')} variant="ghost" size="sm">
            <span className="inline-flex items-center gap-1"><Flag size={14} /> RULES</span>
          </Btn>
        </div>
      </div>

      {confirmNew && (
        <Modal title="START NEW WEEK?" onClose={() => setConfirmNew(false)}>
          <Mono size={11} color="#fff" className="block" style={{ marginBottom: 14, lineHeight: 1.5 }}>
            Starting a new week will <span style={{ color: C.amber, fontWeight: 700 }}>end the current one</span> and
            discard any unfinalized progress. The career stats and badges you've already earned are kept.
          </Mono>
          <div className="space-y-2">
            <Btn onClick={acceptNew} variant="danger">
              <span className="inline-flex items-center gap-2"><Radio size={16} /> YES — START FRESH</span>
            </Btn>
            <Btn onClick={() => setConfirmNew(false)} variant="ghost" size="md">CANCEL</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// NEW WEEK
// ============================================================

function NewWeek({ stations, setStations, onStart, setScreen, profiles, activeProfileId, createProfile }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  // V12.21: per-player profile IDs. Default Player 1 to the active
  // profile (the device owner) when one exists. Player 2 starts unlinked.
  const [p1ProfileId, setP1ProfileId] = useState(activeProfileId || null);
  const [p2ProfileId, setP2ProfileId] = useState(null);
  const [stationId, setStationId] = useState(stations[0].id);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [addingStation, setAddingStation] = useState(false);
  const [newStName, setNewStName] = useState('');
  // New station entry now captures format (one of FORMAT_KEYS) and market.
  const [newStFormat, setNewStFormat] = useState('Classic Rock');
  const [newStMarket, setNewStMarket] = useState('');

  // V12.21: when a profile is selected for a slot, auto-populate the
  // player name from the profile. Manual override still possible.
  React.useEffect(() => {
    if (p1ProfileId) {
      const prof = profiles?.find(p => p.id === p1ProfileId);
      if (prof && !p1) setP1(prof.name);
    }
  }, [p1ProfileId]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (p2ProfileId) {
      const prof = profiles?.find(p => p.id === p2ProfileId);
      if (prof && !p2) setP2(prof.name);
    }
  }, [p2ProfileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const canStart = p1.trim() && p2.trim()
    && p1.trim().toLowerCase() !== p2.trim().toLowerCase()
    && stationId !== 'custom'
    // V12.21: also block if both slots are linked to the same profile.
    && !(p1ProfileId && p2ProfileId && p1ProfileId === p2ProfileId);

  const addStation = () => {
    if (!newStName.trim()) return;
    const newSt = {
      id: 'custom_' + Date.now(),
      callSign: null,
      frequency: null,
      name: newStName.trim().toUpperCase(),
      market: newStMarket.trim() || 'Custom',
      format: newStFormat,
      genres: [newStFormat],
      providerPriority: ['mock', 'manual'],
      playlistSources: {},
      draftPoolStrategy: 'formatBased',
    };
    const updated = [newSt, ...stations].slice(0, 12);
    setStations(updated);
    setStationId(newSt.id);
    setNewStName(''); setNewStMarket(''); setNewStFormat('Classic Rock');
    setAddingStation(false);
  };

  return (
    <div className="px-5 py-6 pb-24">
      <button onClick={() => setScreen('landing')} className="mb-4 flex items-center gap-2" style={iconBtn}>
        <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        <Stencil size={12} color={C.silver} tracking="0.2em">BACK</Stencil>
      </button>
      <div className="mb-5">
        <Stencil size={34} color="#fff" style={{ display: 'block', lineHeight: 1 }}>NEW WEEK</Stencil>
        <Stencil size={34} color={C.green} style={{ display: 'block', lineHeight: 1 }}>NEW BLOOD</Stencil>
      </div>
      <TrimBar accent="green" thickness={8} className="mb-5" />
      <div className="space-y-4">
        {/* V12.21: Player 1 — profile picker + name field */}
        <div>
          <ProfilePicker
            label="PLAYER 1 PROFILE"
            profiles={profiles || []}
            value={p1ProfileId}
            onChange={setP1ProfileId}
            onCreate={createProfile}
            excludeId={p2ProfileId}
          />
          <Field label="PLAYER 1 NAME" value={p1} onChange={setP1} placeholder="e.g. MIKE" />
        </div>
        <div style={{ textAlign: 'center' }}><Stencil size={22} color={C.red} tracking="0.35em">VS</Stencil></div>
        {/* V12.21: Player 2 — profile picker + name field */}
        <div>
          <ProfilePicker
            label="PLAYER 2 PROFILE"
            profiles={profiles || []}
            value={p2ProfileId}
            onChange={setP2ProfileId}
            onCreate={createProfile}
            excludeId={p1ProfileId}
          />
          <Field label="PLAYER 2 NAME" value={p2} onChange={setP2} placeholder="e.g. RICK" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Stencil size={11} color={C.silver} tracking="0.25em">RADIO STATION</Stencil>
            <button onClick={() => setAddingStation(!addingStation)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 4, color: C.amber,
            }}>
              <PlusIcon size={12} />
              <Mono size={9} color={C.amber}>{addingStation ? 'CANCEL' : 'ADD CUSTOM'}</Mono>
            </button>
          </div>
          {addingStation ? (
            <div style={{ background: C.card, border: `2px dashed ${C.amber}`, padding: 12 }} className="space-y-2">
              <input value={newStName} onChange={e => setNewStName(e.target.value)} placeholder="STATION NAME (e.g. WMRQ 104.1)" maxLength={28} style={inputStyle} />
              <input value={newStMarket} onChange={e => setNewStMarket(e.target.value)} placeholder="MARKET (e.g. Hartford, CT)" maxLength={28} style={{ ...inputStyle, fontSize: 14 }} />
              <div style={{ background: C.card, border: `2px solid ${C.border}`, padding: 10 }}>
                <Mono size={9} color={C.silver} style={{ letterSpacing: '0.2em', display: 'block', marginBottom: 6 }}>
                  FORMAT
                </Mono>
                <select value={newStFormat} onChange={e => setNewStFormat(e.target.value)} style={{
                  width: '100%', background: 'transparent', color: C.text, border: 'none',
                  fontFamily: '"Oswald", sans-serif', fontSize: 15, fontWeight: 600,
                  letterSpacing: '0.05em', outline: 'none', textTransform: 'uppercase',
                }}>
                  {FORMAT_KEYS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <Btn onClick={addStation} variant="amber" size="md" disabled={!newStName.trim()}>SAVE STATION</Btn>
            </div>
          ) : (
            <div className="space-y-2">
              {stations.map(s => {
                const isSelected = s.id === stationId;
                const isSentinel = s.isSentinel || s.id === 'custom';
                const fmt = s.format;
                const fmtAccent = fmt && STATION_FORMATS[fmt] ? STATION_FORMATS[fmt].accent : C.silver;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (isSentinel) setAddingStation(true);
                      else setStationId(s.id);
                    }}
                    style={{
                      width: '100%',
                      background: isSelected ? C.cardHi : C.card,
                      border: `2px solid ${isSelected ? C.amber : isSentinel ? C.amberDark : C.border}`,
                      padding: '11px 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 12,
                      borderStyle: isSentinel ? 'dashed' : 'solid',
                    }}
                  >
                    {/* Frequency block / sentinel icon */}
                    <div style={{
                      flexShrink: 0,
                      minWidth: 52,
                      padding: '5px 8px',
                      background: C.darker,
                      border: `1px solid ${isSentinel ? C.amberDark : C.borderHi}`,
                      textAlign: 'center',
                    }}>
                      {isSentinel ? (
                        <Plus size={20} style={{ color: C.amber, margin: '0 auto', display: 'block' }} />
                      ) : (
                        <>
                          <Mono size={14} color={fmtAccent} style={{ fontWeight: 700, letterSpacing: '0.02em', display: 'block', lineHeight: 1 }}>
                            {s.frequency || '—'}
                          </Mono>
                          <Mono size={7} color={C.silver} style={{ letterSpacing: '0.2em', display: 'block', marginTop: 2 }}>
                            {s.callSign || 'STN'}
                          </Mono>
                        </>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Stencil size={14} color="#fff" tracking="0.04em" style={{ display: 'block', lineHeight: 1.1 }}>
                        {s.name}
                      </Stencil>
                      <div style={{ marginTop: 3, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {!isSentinel && fmt && (
                          <span style={{
                            padding: '1px 5px',
                            background: `${fmtAccent}33`,
                            border: `1px solid ${fmtAccent}88`,
                            fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                            fontSize: 8, color: fmtAccent, letterSpacing: '0.15em',
                          }}>{fmt.toUpperCase()}</span>
                        )}
                        {s.market && (
                          <Mono size={9} color={C.silver} style={{ letterSpacing: '0.05em' }}>
                            {s.market}
                          </Mono>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ flexShrink: 0, width: 8, height: 8, background: C.amber, borderRadius: '50%', boxShadow: `0 0 8px ${C.amber}` }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <Stencil size={11} color={C.silver} tracking="0.25em" style={{ display: 'block', marginBottom: 8 }}>START DATE</Stencil>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, fontSize: 16 }} />
        </div>
      </div>
      <div className="mt-7">
        <Btn onClick={() => {
          const st = stations.find(s => s.id === stationId);
          canStart && onStart(
            p1.trim().toUpperCase(),
            p2.trim().toUpperCase(),
            st,
            startDate,
            [p1ProfileId, p2ProfileId]
          );
        }} disabled={!canStart} variant="primary">
          <span className="inline-flex items-center gap-2">START THE WEEK <ArrowRight size={18} /></span>
        </Btn>
        {p1ProfileId && p2ProfileId && p1ProfileId === p2ProfileId && (
          <Mono size={9} color={C.redLight} style={{
            display: 'block', textAlign: 'center', marginTop: 8,
            letterSpacing: '0.15em', fontWeight: 700,
          }}>
            BOTH SLOTS LINKED TO THE SAME PROFILE — PICK DIFFERENT ONES
          </Mono>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, maxLength = 14 }) {
  return (
    <div>
      <Stencil size={11} color={C.silver} tracking="0.25em" style={{ display: 'block', marginBottom: 8 }}>{label}</Stencil>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} style={inputStyle} />
    </div>
  );
}

// V12.21: profile picker dropdown for the New Week screen. Shows a
// list of existing profiles plus options to leave unlinked or create
// new inline. excludeId is the other player's selection (so we don't
// allow linking both slots to the same profile).
function ProfilePicker({ label, profiles, value, onChange, onCreate, excludeId }) {
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const handleCreate = () => {
    const id = onCreate(draftName);
    if (id) {
      onChange(id);
      setDraftName('');
      setAdding(false);
    }
  };
  const available = profiles.filter(p => p.id !== excludeId);
  const selected = value ? profiles.find(p => p.id === value) : null;
  return (
    <div style={{ marginBottom: 10 }}>
      <Mono size={9} color={C.textDim} style={{
        letterSpacing: '0.2em', display: 'block', marginBottom: 5, fontWeight: 700,
      }}>
        {label}
      </Mono>
      {!adding ? (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button
            onClick={() => onChange(null)}
            style={{
              padding: '6px 10px',
              background: !value ? C.silver : C.darker,
              border: `2px solid ${!value ? C.silver : C.border}`,
              color: !value ? C.darker : C.silver,
              fontFamily: '"Oswald", sans-serif',
              fontWeight: 700, fontSize: 11, letterSpacing: '0.15em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >NO PROFILE</button>
          {available.map(p => {
            const active = p.id === value;
            return (
              <button
                key={p.id}
                onClick={() => onChange(p.id)}
                style={{
                  padding: '6px 10px',
                  background: active ? C.green : C.darker,
                  border: `2px solid ${active ? C.green : C.border}`,
                  color: active ? '#fff' : C.silver,
                  fontFamily: '"Oswald", sans-serif',
                  fontWeight: 700, fontSize: 11, letterSpacing: '0.05em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}
              ><User size={11} /> {p.name}</button>
            );
          })}
          <button
            onClick={() => setAdding(true)}
            style={{
              padding: '6px 10px',
              background: 'transparent',
              border: `2px dashed ${C.blueLight}`,
              color: C.blueLight,
              fontFamily: '"Oswald", sans-serif',
              fontWeight: 700, fontSize: 11, letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          ><Plus size={11} /> NEW</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 5 }}>
          <input
            type="text"
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            placeholder="NEW PROFILE NAME"
            autoFocus
            maxLength={24}
            style={{ ...inputStyle, fontSize: 13, padding: '7px 10px', flex: 1 }}
          />
          <button
            onClick={handleCreate}
            disabled={!draftName.trim()}
            style={{
              padding: '7px 12px',
              background: C.green, border: `2px solid ${C.green}`,
              color: '#fff', fontFamily: '"Oswald", sans-serif',
              fontWeight: 700, fontSize: 11, letterSpacing: '0.15em',
              textTransform: 'uppercase', cursor: 'pointer',
              opacity: draftName.trim() ? 1 : 0.4,
            }}
          >ADD</button>
          <button
            onClick={() => { setAdding(false); setDraftName(''); }}
            style={{
              padding: '7px 12px',
              background: 'transparent', border: `2px solid ${C.border}`,
              color: C.silver, fontFamily: '"Oswald", sans-serif',
              fontWeight: 700, fontSize: 11, letterSpacing: '0.15em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >X</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================

function Dashboard({ game, setScreen }) {
  const ds = game.currentDayState;
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const p1 = game.players[0], p2 = game.players[1];
  const seriesNeed = 3;
  const seriesWinner = p1.weeklyWins >= seriesNeed ? 0 : p2.weeklyWins >= seriesNeed ? 1 : null;

  const status = !ds.draftComplete ? { label: 'DRAFT PENDING', color: C.amber }
    : ds.dayComplete ? { label: 'DAY COMPLETE', color: C.silver }
    : { label: 'LIVE', color: C.red };

  const dayResults = [1, 2, 3, 4, 5].map(d => {
    const hist = game.weekHistory.find(h => h.day === d);
    if (hist) {
      // V12.8: surface skipped days explicitly so the dashboard strip
      // doesn't paint them as a player-1 or player-2 win.
      if (hist.skipped) return { d, type: 'skipped' };
      return { d, type: 'done', winner: hist.winner, score: hist.scores, halfPoint: hist.halfPoint };
    }
    // V12.8: if this is the current day AND it's already marked
    // dayComplete (e.g. day 5 just ended or was skipped — END_DAY/
    // SKIP_DAY don't push to weekHistory until ADVANCE_DAY runs, but
    // ADVANCE_DAY is blocked on day 5), treat it as done or skipped.
    if (d === game.currentDay) {
      const cds = game.currentDayState;
      if (cds?.dayComplete) {
        if (cds.winner === 0 || cds.winner === 1) {
          return { d, type: 'done', winner: cds.winner, score: cds.scores, halfPoint: cds.halfPoint };
        }
        return { d, type: 'skipped' };
      }
      return { d, type: 'current' };
    }
    return { d, type: 'future' };
  });

  return (
    <div className="px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setScreen('landing')} style={iconBtn}><Radio size={20} /></button>
        <div style={{ textAlign: 'center' }}>
          <Mono size={10} color={C.silver} style={{ display: 'block', letterSpacing: '0.2em' }}>{game.station.name}</Mono>
          <Stencil size={13} tracking="0.2em">BEST OF 5 • DAY {game.currentDay}/5</Stencil>
        </div>
        <button onClick={() => setScreen('rules')} style={iconBtn}><Flag size={18} /></button>
      </div>
      <TrimBar accent="silver" thickness={8} className="mb-4" />

      <div className="flex gap-1 mb-4">
        {dayResults.map(r => {
          let bg = C.darker, border = C.border, fg = C.textDim, label = '—';
          let isHalf = false;
          if (r.type === 'done') {
            bg = r.winner === 0 ? `${C.green}33` : `${C.silver}22`;
            border = r.winner === 0 ? C.green : C.silver;
            fg = '#fff';
            label = `${r.score[0]}–${r.score[1]}`;
            isHalf = r.halfPoint && (r.halfPoint[0] || r.halfPoint[1]);
          } else if (r.type === 'skipped') {
            bg = `${C.silver}22`; border = C.silver; fg = C.silver; label = 'SKIP';
          } else if (r.type === 'current') {
            bg = C.blue; border = C.blue; fg = '#fff'; label = 'LIVE';
          }
          return (
            <div key={r.d} style={{ flex: 1, padding: '7px 2px', textAlign: 'center', background: bg, border: `2px solid ${border}` }} className={r.type === 'current' ? 'armed' : ''}>
              <Stencil size={9} color={r.type === 'current' ? '#fff' : C.textDim} tracking="0.2em" style={{ display: 'block' }}>{dayNames[r.d - 1]}</Stencil>
              <Mono size={9} color={fg} style={{ display: 'block', marginTop: 2, fontWeight: 700 }}>
                {label}{isHalf && <span style={{ color: C.silver, marginLeft: 2 }}>½</span>}
              </Mono>
            </div>
          );
        })}
      </div>

      <SeriesBanner p1={p1} p2={p2} seriesNeed={seriesNeed} winner={seriesWinner} />

      <div style={{
        position: 'relative',
        // V12.10: flat white scoreboard tile, no equipment-frame metaphor
        background: C.card,
        border: `2px solid ${C.borderHi}`,
        marginTop: 12, marginBottom: 14, padding: '20px 14px 18px',
        overflow: 'hidden',
        boxShadow: `0 2px 0 ${C.border}, 0 4px 12px rgba(0,0,0,0.08)`,
      }}>
        {/* Top label strip */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 16,
          background: C.cardHi,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mono size={8} color={C.blue} style={{ letterSpacing: '0.4em', fontWeight: 700 }}>
            ◆ THE RADIO DRAFT — JOBSITE DECK ◆
          </Mono>
        </div>
        {/* Status pill (LIVE/DRAFT/DAY COMPLETE) */}
        <div style={{ position: 'absolute', top: 22, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div className="inline-flex items-center gap-2" style={{ padding: '2px 8px', background: C.cardHi, border: `1px solid ${status.color}` }}>
            <div style={{ width: 6, height: 6, background: status.color, borderRadius: '50%' }} className={status.label === 'LIVE' ? 'flicker' : ''} />
            <Mono size={9} color={status.color} style={{ letterSpacing: '0.25em', fontWeight: 700 }}>{status.label}</Mono>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end" style={{
          marginTop: 26,
          // V12.11 / V12.12: recessed inner panel so the LED displays
          // sit in a "well" carved into the card. Uses C.darker so the
          // well reads darker than the surrounding card on slate.
          padding: '14px 12px 10px',
          background: C.darker,
          border: `1px solid ${C.border}`,
          boxShadow: `inset 0 2px 5px rgba(0,0,0,0.4)`,
        }}>
          <PlayerScoreBlock player={p1} score={ds.scores[0]} idx={0} seriesWins={p1.weeklyWins} seriesNeed={seriesNeed} />
          <Stencil size={26} color={C.silver} tracking="0.1em" style={{ paddingBottom: 14 }}>VS</Stencil>
          <PlayerScoreBlock player={p2} score={ds.scores[1]} idx={1} seriesWins={p2.weeklyWins} seriesNeed={seriesNeed} />
        </div>
        {ds.consecutiveCount >= 2 && ds.lastScorer !== null && (
          <div style={{
            position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
            padding: '2px 10px', background: C.amber, border: `1px solid ${C.amberDark}`,
            color: '#1A1A1A', display: 'inline-flex', alignItems: 'center', gap: 4,
          }} className="flicker">
            <Flame size={12} />
            <Stencil size={10} color="#1A1A1A" tracking="0.15em">
              {game.players[ds.lastScorer].name} ON {ds.consecutiveCount}
            </Stencil>
          </div>
        )}
      </div>

      {/* Momentum indicator — sits under the scoreboard frame.
          Only shows once there are actual scoring events to evaluate. */}
      {ds.events && ds.events.filter(e => !e.meta && e.totalPoints > 0).length > 0 && (
        <div style={{
          background: C.darker, border: `2px solid ${C.border}`,
          marginBottom: 14,
        }}>
          <MomentumBar ds={ds} players={game.players} />
        </div>
      )}

      <div className="space-y-2.5 mb-5">
        {[0, 1].map(idx => <RosterCard key={idx} player={game.players[idx]} ds={ds} idx={idx} currentDay={game.currentDay} />)}
      </div>

      <div className="space-y-2.5">
        {!ds.draftComplete && (
          <Btn onClick={() => setScreen('draft')} variant="amber">
            <span className="inline-flex items-center gap-2"><Target size={18} /> GO TO DRAFT</span>
          </Btn>
        )}
        {ds.draftComplete && !ds.dayComplete && (
          <Btn onClick={() => setScreen('live')} variant="primary">
            <span className="inline-flex items-center gap-2"><Volume2 size={18} /> GO LIVE</span>
          </Btn>
        )}
        {ds.dayComplete && (
          <Btn onClick={() => setScreen('endDay')} variant="secondary">VIEW DAY RECAP</Btn>
        )}
      </div>
    </div>
  );
}

function SeriesBanner({ p1, p2, seriesNeed, winner }) {
  if (winner !== null) {
    return (
      <div style={{ padding: '10px 14px', background: `${C.amber}22`, border: `2px solid ${C.amber}`, textAlign: 'center' }}>
        <Trophy size={16} style={{ color: C.amber, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
        <Stencil size={13} color={C.amber} tracking="0.15em">{(winner === 0 ? p1 : p2).name} CLINCHED THE WEEK</Stencil>
      </div>
    );
  }
  const p1Need = seriesNeed - p1.weeklyWins;
  const p2Need = seriesNeed - p2.weeklyWins;
  const closest = Math.min(p1Need, p2Need);
  let msg = `FIRST TO ${seriesNeed} WINS`;
  if (closest === 1) {
    const leader = p1Need < p2Need ? p1 : p2Need < p1Need ? p2 : null;
    msg = leader ? `${leader.name} CAN CLINCH TODAY` : 'EITHER PLAYER CAN CLINCH';
  } else if (p1Need === p2Need && p1.weeklyWins > 0) {
    msg = `ALL SQUARE — ${p1.weeklyWins} APIECE`;
  }
  return (
    <div style={{
      padding: '8px 12px', background: C.card,
      borderLeft: `4px solid ${closest === 1 ? C.amber : C.silver}`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <TrendingUp size={14} style={{ color: closest === 1 ? C.amber : C.silver }} />
      <Stencil size={12} color={closest === 1 ? C.amber : '#fff'} tracking="0.12em">{msg}</Stencil>
    </div>
  );
}

function PlayerScoreBlock({ player, score, idx, seriesWins, seriesNeed }) {
  const color = idx === 0 ? C.green : C.silver;
  const align = idx === 0 ? 'left' : 'right';
  return (
    <div style={{ textAlign: align }}>
      <Stencil size={12} color={color} tracking="0.18em" style={{ display: 'block', textShadow: `0 0 8px ${color}66` }}>{player.name}</Stencil>
      <div style={{ marginTop: 4, marginBottom: 6 }}>
        <LEDDisplay value={score} color={color} size="lg" align={align} />
      </div>
      <div className="flex gap-1" style={{ justifyContent: idx === 0 ? 'flex-start' : 'flex-end' }}>
        {Array.from({ length: seriesNeed }).map((_, i) => (
          <div key={i} style={{
            width: 18, height: 6,
            background: i < seriesWins ? color : 'transparent',
            border: `1.5px solid ${color}`,
            boxShadow: i < seriesWins ? `0 0 6px ${color}66` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
}

// LED-style score display. Recessed dark window with a glowing segment-feel
// number. We don't use a real 7-segment font (genuinely ugly at all sizes);
// instead we lean on monospaced bold + a strong inner shadow + tight tracking
// for a control-panel readout vibe.
function LEDDisplay({ value, color, size = 'lg', align = 'left' }) {
  // V12.10: LEDs are physically dark recessed windows even on a light
  // theme — that's how real equipment looks. But that means dark text
  // colors (Whalers forest green, gunmetal silver) disappear inside.
  // Translate to a brighter LED equivalent so the digits glow.
  const ledColor =
    color === C.green ? '#22D3A1' :
    color === C.silver ? '#D8DCE2' :
    color === C.blue ? '#60A5FA' :
    color === C.red ? '#FCA5A5' :
    color === C.amber ? '#FCD34D' :
    color;
  const fs = size === 'lg' ? 56 : size === 'md' ? 40 : 28;
  const pad = size === 'lg' ? '4px 12px' : size === 'md' ? '3px 9px' : '2px 7px';
  // Detect score changes: when `value` increases, briefly play the window
  // flash + digit roll animation. We track the previous value in a ref so
  // that a second update doesn't get suppressed by the now-stale animation.
  const prevRef = useRef(value);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setTick(t => t + 1); // re-key animations so they restart
    }
  }, [value]);
  return (
    <div
      key={`window-${tick}`}
      className={tick > 0 ? 'led-flash' : ''}
      style={{
        display: 'inline-block',
        padding: pad,
        background: `linear-gradient(180deg, #15191F 0%, #1F242C 100%)`,
        border: `2px solid #1A1E25`,
        // recessed effect: dark outer + inner shadow + slight inset highlight
        boxShadow: `inset 0 3px 8px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(255,255,255,0.04), 0 1px 0 ${C.cardHi}`,
        borderRadius: 2,
        minWidth: size === 'lg' ? 80 : 56,
        textAlign: align === 'right' ? 'right' : 'left',
        // currentColor drives the flash animation's box-shadow ring
        color: ledColor,
        overflow: 'hidden',
      }}>
      <span
        key={`digit-${tick}`}
        className={tick > 0 ? 'led led-roll' : 'led'}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          fontSize: fs,
          color: ledColor,
          lineHeight: 1,
          letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
          textShadow: `0 0 10px ${ledColor}cc, 0 0 22px ${ledColor}66`,
          display: 'inline-block',
        }}
      >
        {String(value).padStart(2, '0')}
      </span>
    </div>
  );
}

// 5-for-5 progress meter. Five segments, fills as the player's unique
// drafted artists score that day. Glows amber when complete.
// `size` = 'sm' | 'md' (sm for live screen column headers, md for dashboard cards)
function FiveForFiveMeter({ played, total = 5, color, size = 'md', awarded = false, day = 1 }) {
  const segH = size === 'sm' ? 5 : 7;
  const segW = size === 'sm' ? 11 : 14;
  const complete = played >= total;
  const dayBonus = Math.max(1, Math.min(5, day));
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'inline-flex', gap: 2 }}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < played;
          return (
            <div key={i} style={{
              width: segW, height: segH,
              background: filled ? (complete ? C.amber : color) : 'transparent',
              border: `1.5px solid ${complete ? C.amber : color}`,
              boxShadow: filled ? `0 0 4px ${complete ? C.amber : color}aa` : 'none',
            }} className={complete && awarded ? 'flicker' : ''} />
          );
        })}
      </div>
      <Mono size={size === 'sm' ? 8 : 9} color={complete ? C.amber : color} style={{ fontWeight: 700, letterSpacing: '0.1em' }}>
        {complete ? `+${dayBonus}` : `${played}/${total}`}
      </Mono>
    </div>
  );
}

// InfoTip: lightweight onboarding helper. Renders a `(?)` icon next to
// section headers; tap toggles a small inline tooltip with the rule text.
// We deliberately do NOT use full modals — too heavy for casual reference.
function InfoTip({ title, body, color = C.silver }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        aria-label={`Info: ${title}`}
        style={{
          background: 'transparent', border: 'none', padding: 0, marginLeft: 4,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        }}
      >
        <span style={{
          width: 13, height: 13, borderRadius: '50%',
          border: `1px solid ${color}`, color, fontSize: 9, fontWeight: 700,
          fontFamily: '"JetBrains Mono", monospace',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          opacity: open ? 1 : 0.6,
          lineHeight: 1,
        }}>?</span>
      </button>
      {open && (
        <>
          {/* Tap-outside to close */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 30 }}
          />
          <div style={{
            position: 'absolute', top: '110%', left: '50%',
            transform: 'translateX(-50%)',
            width: 240, zIndex: 31,
            background: C.darker, border: `2px solid ${color}`,
            padding: '8px 10px',
            boxShadow: `0 4px 12px rgba(0,0,0,0.7)`,
          }}>
            <Mono size={9} color={color} style={{ letterSpacing: '0.2em', display: 'block', marginBottom: 4 }}>
              {title}
            </Mono>
            <Mono size={9} color="#fff" style={{ lineHeight: 1.5, display: 'block' }}>
              {body}
            </Mono>
          </div>
        </>
      )}
    </span>
  );
}

// MomentumBar: a horizontal indicator that swings between the two players
// based on RECENT scoring activity (last ~8 events). Pure display — does
// not feed into scoring. Computes a momentum value in [-1, +1] where
// negative leans P1 and positive leans P2, then draws the bar with the
// "needle" position interpolated.
//
// Weighting: each non-meta event contributes its totalPoints with an
// exponential decay (most recent = full weight). Sign depends on which
// player scored.
function MomentumBar({ ds, players }) {
  if (!ds || !ds.events) return null;
  // Engine stores events newest-first.
  const events = ds.events.filter(e => !e.meta && e.totalPoints > 0).slice(0, 8);
  if (events.length === 0) return null;
  let weight = 0;
  let total = 0;
  events.forEach((ev, i) => {
    const w = Math.pow(0.78, i); // decay
    const side = ev.effectivePlayer === 0 ? -1 : ev.effectivePlayer === 1 ? 1 : 0;
    weight += w * ev.totalPoints * side;
    total += w * ev.totalPoints;
  });
  const momentum = total > 0 ? weight / total : 0; // [-1, +1]
  const pct = 50 + momentum * 45; // needle position in %, clamped to 5-95
  const leaderIdx = momentum < -0.15 ? 0 : momentum > 0.15 ? 1 : null;
  const leaderColor = leaderIdx === 0 ? C.green : leaderIdx === 1 ? C.silver : C.textDim;
  const leaderName = leaderIdx !== null ? players[leaderIdx].name : 'EVEN';

  return (
    <div style={{ padding: '8px 12px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
        <Mono size={8} color={C.textDim} style={{ letterSpacing: '0.3em', fontWeight: 700 }}>MOMENTUM</Mono>
        <Stencil size={11} color={leaderColor} tracking="0.18em">
          {leaderName}
        </Stencil>
      </div>
      {/* Track */}
      <div style={{
        position: 'relative',
        height: 8,
        background: `linear-gradient(90deg, ${C.green}33 0%, ${C.darker} 50%, ${C.silver}33 100%)`,
        border: `1px solid ${C.border}`,
        boxShadow: `inset 0 2px 3px rgba(0,0,0,0.5)`,
      }}>
        {/* Center dividing line */}
        <div style={{
          position: 'absolute', top: -2, bottom: -2, left: '50%',
          width: 1, background: C.borderHi, opacity: 0.6,
        }} />
        {/* Needle */}
        <div style={{
          position: 'absolute', top: -3, bottom: -3,
          left: `${pct}%`, transform: 'translateX(-50%)',
          width: 4,
          background: leaderColor,
          boxShadow: `0 0 6px ${leaderColor}88`,
          transition: 'left 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
    </div>
  );
}

function RosterCard({ player, ds, idx, currentDay = 1 }) {
  const color = idx === 0 ? C.green : C.silver;
  const drafts = ds.drafts[idx];
  const bonusSong = ds.bonusSongs[idx]; // { artist, song, customSong } | null
  const bonusArtist = bonusSong?.artist;
  const bonusPlays = ds.bonusSongPlayCount?.[idx] || 0;
  const played = (ds.playedByPlayer?.[idx] || []).length;
  const awarded = ds.fiveForFiveAwarded?.[idx] || false;
  return (
    <div style={{ background: C.card, borderLeft: `4px solid ${color}`, border: `2px solid ${color}33`, padding: '10px 12px' }}>
      <div className="flex items-center justify-between mb-2">
        <Stencil size={16} color="#fff" tracking="0.1em">{player.name}</Stencil>
        <div className="flex gap-1">
          <Pip count={ds.blocks[idx]} icon={<Shield size={10} />} color={C.blueLight} />
          <Pip count={ds.steals[idx]} icon={<Skull size={10} />} color={C.red} />
          <Pip count={ds.shotCalls[idx]} icon={<Crosshair size={10} />} color={C.amber} />
        </div>
      </div>
      {drafts.length === 0 ? (
        <Mono size={10} color={C.textDim}>NO ARTISTS DRAFTED YET</Mono>
      ) : (
        <div className="flex flex-wrap gap-1">
          {drafts.map(a => {
            const playedAlready = ds.playedToday.includes(a);
            const isBonus = bonusArtist === a;
            return (
              <div key={a} style={{
                fontSize: 10, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                padding: '2px 6px',
                background: isBonus ? `${C.amber}33` : `${color}22`,
                color: C.text,
                border: `1px solid ${isBonus ? C.amber : color}`,
                letterSpacing: '0.04em',
                display: 'inline-flex', alignItems: 'center', gap: 3,
                opacity: playedAlready ? 0.75 : 1,
              }}>
                {isBonus && <Award size={8} style={{ color: C.amber }} />}
                {a.toUpperCase()}
                {playedAlready && <span style={{ color: C.amber, marginLeft: 2 }}>•</span>}
              </div>
            );
          })}
        </div>
      )}
      {drafts.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: `1px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Mono size={8} color={color} style={{ letterSpacing: '0.2em', fontWeight: 700 }}>5-FOR-5</Mono>
            <InfoTip
              title="5-FOR-5 BONUS"
              body="When all 5 of your drafted artists successfully score in the same day, you get a weekday-scaled bonus: Mon +1, Tue +2, Wed +3, Thu +4, Fri +5. Blocked and stolen songs don't count toward progress."
              color={color}
            />
          </span>
          <FiveForFiveMeter played={played} color={color} size="md" awarded={awarded} day={currentDay} />
        </div>
      )}
      {bonusSong && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px dashed ${C.border}` }}>
          <div className="flex items-center justify-between">
            <Mono size={9} color={C.amber} style={{ letterSpacing: '0.15em' }}>
              ★ {bonusSong.artist.toUpperCase()} — "{bonusSong.song}"
            </Mono>
            {bonusPlays > 0 && (
              <Mono size={9} color={C.amber} style={{ fontWeight: 700 }}>×{bonusPlays}</Mono>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Pip({ count, icon, color }) {
  const on = count > 0;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 5px',
      background: on ? `${color}22` : C.darker,
      border: `1px solid ${on ? color : C.border}`,
      color: on ? color : C.textDim,
    }}>
      {icon}
      <Mono size={9} color={on ? color : C.textDim} style={{ fontWeight: 700 }}>{count}</Mono>
    </div>
  );
}

// ============================================================
// DRAFT
// ============================================================

function Draft({ game, dispatch, setScreen, artistPool, addArtist }) {
  const ds = game.currentDayState;
  const allDrafted = [...ds.drafts[0], ...ds.drafts[1]];
  const weekElim = game.weekEliminated || [];
  const [search, setSearch] = useState('');
  const [skipModal, setSkipModal] = useState(false);
  // V12.26: artistPool is now an array of entries { name, label, tier, accent }.
  // Defensive: tolerate the legacy string[] shape (older saves still routing
  // through pre-V12.26 code paths) by promoting strings to bare entries.
  const rawPool = artistPool || ARTIST_POOL;
  const pool = rawPool.map(e =>
    typeof e === 'string' ? { name: e, label: null, tier: 99, accent: C.silver } : e
  );
  const searchNorm = normalizeText(search);
  const filtered = search
    ? pool.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    : pool;
  // True when the search term doesn't exactly match any existing artist —
  // we then offer "Add new artist: <typed>" as a virtual option.
  const exactMatch = search && pool.some(e => normalizeText(e.name) === searchNorm);
  const canAddCustom = search.trim().length >= 2 && !exactMatch;
  const currentPlayer = game.players[ds.draftTurn];
  const isComplete = ds.draftComplete;

  const handleAddCustom = () => {
    if (!addArtist) return;
    const canonical = addArtist(search);
    if (canonical) {
      dispatch({ type: 'DRAFT', artist: canonical });
      setSearch('');
    }
  };

  return (
    <div className="px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setScreen('dashboard')} style={iconBtn}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <Stencil size={18} tracking="0.2em">DAILY DRAFT</Stencil>
        <button onClick={() => setScreen('stationPool')} style={iconBtn} aria-label="Manage station artist pool">
          <Radio size={18} style={{ color: C.silver }} />
        </button>
      </div>
      <TrimBar accent="green" thickness={8} className="mb-4" />

      {weekElim.length > 0 && (
        <div style={{
          padding: '8px 11px', marginBottom: 12, background: `${C.red}11`,
          border: `1px solid ${C.red}66`, display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <AlertCircle size={14} style={{ color: C.red, flexShrink: 0, marginTop: 1 }} />
          <div>
            <Mono size={9} color={C.redLight} style={{ letterSpacing: '0.15em', display: 'block', fontWeight: 700 }}>
              ELIMINATED THIS WEEK ({weekElim.length})
            </Mono>
            <Mono size={9} color={C.silver} style={{ marginTop: 2, lineHeight: 1.4 }}>
              {weekElim.map(a => a.toUpperCase()).join(' • ')}
            </Mono>
          </div>
        </div>
      )}

      {!isComplete ? (
        <div style={{
          background: C.darker, border: `2px solid ${C.amber}`,
          padding: '10px 14px', marginBottom: 14, textAlign: 'center',
        }} className="armed">
          <Mono size={10} color={C.silver} style={{ letterSpacing: '0.25em' }}>ON THE CLOCK</Mono>
          <Stencil size={28} color={C.amber} tracking="0.1em" style={{ display: 'block', lineHeight: 1, marginTop: 4 }}>
            {currentPlayer.name}
          </Stencil>
          <Mono size={10} color={C.silver} style={{ letterSpacing: '0.25em', marginTop: 4 }}>
            PICK {ds.drafts[ds.draftTurn].length + 1} OF 5
          </Mono>
          {/* V12.17: surface WHY this player picks first. Only on pick #1
              of day 2+, and only if there's a real previous-day loser
              who earned the first overall pick. */}
          {(() => {
            const totalPicked = ds.drafts[0].length + ds.drafts[1].length;
            if (totalPicked !== 0) return null;
            if (game.currentDay <= 1) return null;
            // Find the most recent winning day in history
            const hist = game.weekHistory || [];
            let lastWinDay = null;
            for (let i = hist.length - 1; i >= 0; i--) {
              if (!hist[i].skipped && (hist[i].winner === 0 || hist[i].winner === 1)) {
                lastWinDay = hist[i];
                break;
              }
            }
            if (!lastWinDay) return null;
            const loserIdx = 1 - lastWinDay.winner;
            if (ds.draftTurn !== loserIdx) return null;
            return (
              <Mono size={9} color={C.redLight} style={{
                letterSpacing: '0.15em', marginTop: 6, display: 'block', fontWeight: 700,
              }}>
                FIRST PICK · LOST DAY {lastWinDay.day}
              </Mono>
            );
          })()}
        </div>
      ) : (
        <div style={{ background: `${C.green}22`, border: `2px solid ${C.green}`, padding: 14, marginBottom: 14, textAlign: 'center' }}>
          <Stencil size={22} color={C.green} tracking="0.1em">DRAFT COMPLETE</Stencil>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[0, 1].map(idx => {
          const color = idx === 0 ? C.green : C.silver;
          const active = ds.draftTurn === idx && !isComplete;
          return (
            <div key={idx} style={{ background: C.card, border: `2px solid ${active ? C.amber : C.border}`, padding: 9 }} className={active ? 'armed' : ''}>
              <Stencil size={12} color={color} tracking="0.12em" style={{ display: 'block', marginBottom: 6 }}>{game.players[idx].name}</Stencil>
              <div className="space-y-1">
                {[0, 1, 2, 3, 4].map(slot => {
                  const artist = ds.drafts[idx][slot];
                  return (
                    <div key={slot} style={{
                      padding: '5px 7px', fontSize: 10,
                      fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                      background: artist ? C.darker : 'transparent',
                      border: `1px solid ${artist ? color : C.border}`,
                      color: artist ? '#fff' : C.textDim,
                      letterSpacing: '0.03em', minHeight: 22,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{artist ? artist.toUpperCase() : `— SLOT ${slot + 1} —`}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!isComplete && (
        <>
          <div className="flex gap-2 mb-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH ARTISTS…"
              style={{ ...inputStyle, fontSize: 15, flex: 1 }}
            />
          </div>
          {canAddCustom && (
            <button
              onClick={handleAddCustom}
              style={{
                width: '100%', padding: '10px 12px',
                background: `${C.amber}22`,
                border: `2px dashed ${C.amber}`,
                color: C.text,
                fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 13,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Plus size={14} style={{ color: C.amber }} />
              ADD &amp; DRAFT: <span style={{ color: C.amber }}>{search.trim().toUpperCase()}</span>
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(entry => {
              const artist = entry.name;
              const drafted = allDrafted.includes(artist);
              const wasElim = weekElim.includes(artist);
              const disabled = drafted || wasElim;
              const labelColor = entry.accent || C.silver;
              return (
                <button key={artist} onClick={() => !disabled && dispatch({ type: 'DRAFT', artist })} disabled={disabled} style={{
                  padding: '9px 8px 8px',
                  background: drafted ? C.darker : wasElim ? '#5C2A2A' : C.card,
                  border: `2px solid ${drafted ? C.green : wasElim ? '#8C4A4A' : C.border}`,
                  color: drafted ? C.silver : wasElim ? '#D4A8A8' : '#fff',
                  fontFamily: '"Oswald", sans-serif', fontWeight: 600, fontSize: 12,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  textDecoration: wasElim ? 'line-through' : 'none',
                  position: 'relative', minHeight: 44,
                  textAlign: 'left',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2,
                }}>
                  {drafted && <Lock size={9} style={{ position: 'absolute', top: 3, right: 3, color: C.green }} />}
                  <span style={{ lineHeight: 1.15 }}>{artist}</span>
                  {/* V12.26: tier label — hidden when disabled to reduce visual noise on rows you can't pick */}
                  {entry.label && !disabled && (
                    <span style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 700, fontSize: 8,
                      color: labelColor, letterSpacing: '0.12em',
                      lineHeight: 1.1, opacity: 0.95,
                    }}>{entry.label}</span>
                  )}
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && !canAddCustom && (
            <Mono size={10} color={C.silver} style={{ textAlign: 'center', padding: 24, display: 'block' }}>
              NO MATCHES — TYPE A NEW ARTIST NAME TO ADD ONE
            </Mono>
          )}
        </>
      )}

      {isComplete && (
        <div className="mt-4">
          <Btn onClick={() => setScreen('live')} variant="primary">
            <span className="inline-flex items-center gap-2"><Volume2 size={18} /> GO LIVE <ArrowRight size={18} /></span>
          </Btn>
        </div>
      )}

      {/* V12.5: low-key skip-day link. Always visible so it can rescue
          a day that started but won't really happen. Confirmation modal
          handles the destructive part. */}
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <button
          onClick={() => setSkipModal(true)}
          style={{
            background: 'transparent', border: 'none',
            color: C.textDim, cursor: 'pointer',
            padding: '8px 12px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
          }}
        >
          NO WORK TODAY? <span style={{ color: C.amber, textDecoration: 'underline', textUnderlineOffset: 3 }}>SKIP THIS DAY →</span>
        </button>
      </div>

      {skipModal && (
        <SkipDayModal
          game={game}
          onClose={() => setSkipModal(false)}
          onConfirm={() => {
            const wasLastDay = game.currentDay >= 5;
            setSkipModal(false);
            dispatch({ type: 'SKIP_DAY' });
            // V12.8: on day 5 the skip ends the week — route to endDay.
            // Otherwise stay on draft; currentDay has advanced and the
            // draft screen will show the new empty day.
            if (wasLastDay) setScreen('endDay');
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// LIVE
// ============================================================

function Live({ game, dispatch, setScreen, customSongs, addCustomSong, artistPool, addCustomArtist }) {
  const ds = game.currentDayState;
  const [pendingScore, setPendingScore] = useState(null);
  const [shotModal, setShotModal] = useState(null);
  const [endDayModal, setEndDayModal] = useState(false);
  const [skipModal, setSkipModal] = useState(false);
  const [bonusModal, setBonusModal] = useState(null);
  const [flashEvent, setFlashEvent] = useState(null);
  const [bumpScore, setBumpScore] = useState({ 0: 0, 1: 0 });
  // V12.3: when a score WOULD trigger a Back-to-Back or Triple-in-a-Row,
  // we pause and ask the user whether the prior scoring song was actually
  // played consecutively on the radio (no other song in between). This
  // corrects the previous behavior where B2B/Triple could fire even
  // though the radio had played unrelated songs between the two taps.
  const [adjacencyConfirm, setAdjacencyConfirm] = useState(null);
  // V12.3: tap an event to inspect / remove. Set to event object.
  const [editEvent, setEditEvent] = useState(null);
  // V12.15: counter-steal modal. Opens automatically whenever a Steal
  // is armed by one player AND no counter-steal selection has been
  // made yet AND the victim hasn't dismissed THIS particular steal arm.
  // We track which steal-event ID we've already handled so re-opening
  // the modal after a deliberate dismiss doesn't keep prompting.
  const [counterStealDismissedFor, setCounterStealDismissedFor] = useState(null);
  // V12.27: playlist ingest modal
  const [ingestModal, setIngestModal] = useState(false);
  const [ingestResult, setIngestResult] = useState(null); // last commit summary, brief flash
  const eventScrollRef = useRef(null);

  useEffect(() => {
    if (ds.lastEventPoints) {
      const fe = { id: Date.now(), player: ds.lastEventPoints.player, points: ds.lastEventPoints.points };
      setFlashEvent(fe);
      setBumpScore(b => ({ ...b, [fe.player]: b[fe.player] + 1 }));
      dispatch({ type: 'CLEAR_FLASH' });
    }
  }, [ds.lastEventPoints, dispatch]);

  useEffect(() => {
    if (!ds.draftComplete) return;
    if (!ds.bonusSongsSet[0]) setBonusModal({ playerIdx: 0 });
    else if (!ds.bonusSongsSet[1]) setBonusModal({ playerIdx: 1 });
    else setBonusModal(null);
  }, [ds.draftComplete, ds.bonusSongsSet[0], ds.bonusSongsSet[1]]);

  useEffect(() => {
    if (game.pendingMustCounter) {
      setShotModal({
        player: game.pendingMustCounter.player,
        forcedLevel: game.pendingMustCounter.forcedLevel,
        isCounter: true,
      });
      dispatch({ type: 'CLEAR_COUNTER' });
    }
  }, [game.pendingMustCounter, dispatch]);

  const handleScore = (player, artist, scoreType = 'play', song = null) => {
    // V12.3: If this play would trigger a Back-to-Back (lastScorer ===
    // player and consecCount === 1) or a Triple (consecCount === 2),
    // pause and confirm radio adjacency. The B2B/Triple bonus only
    // applies when the songs played back-to-back on the radio with
    // nothing else in between — not when the user simply tapped two
    // scoring events without logging the radio's actual intermediate
    // songs.
    //
    // V12.6: Same prompt for RETALIATION — when the opponent scored
    // last, the +1 retaliation only applies if your song followed
    // theirs immediately on the radio. Same modal, different copy.
    //
    // Exceptions: a Stealing play uses opponent's last scorer trick,
    // which is fine — we only ask when this play would actually
    // benefit from a streak/retaliation bonus.
    const wouldExtendOwnStreak = ds.lastScorer === player && ds.consecutiveCount >= 1;
    const wouldRetaliate = ds.lastScorer === (1 - player);
    const opp = 1 - player;
    // Don't ask if a Steal is armed against this player (the play
    // outcome won't credit them anyway).
    const stealerWillStealThis = ds.stealArmedBy === opp && ds.pendingShots.length === 0 && ds.blockArmedBy !== opp;
    const willBeBlocked = ds.blockArmedBy === opp && ds.pendingShots.length === 0;
    if ((wouldExtendOwnStreak || wouldRetaliate) && !stealerWillStealThis && !willBeBlocked) {
      setAdjacencyConfirm({
        player, artist, scoreType, song,
        // Tag the kind so the modal can render the right copy
        kind: wouldExtendOwnStreak
          ? (ds.consecutiveCount >= 2 ? 'triple' : 'b2b')
          : 'retaliation',
      });
      setPendingScore(null);
      return;
    }
    dispatch({ type: 'SCORE', player, artist, scoreType, song });
    setPendingScore(null);
  };

  // V12.3: dispatched once the user answers the adjacency prompt.
  // adjacent === true means apply B2B/Triple as the engine normally would.
  // adjacent === false means break the streak before scoring so no bonus
  // fires from this play.
  const handleAdjacencyAnswer = (adjacent) => {
    const ac = adjacencyConfirm;
    if (!ac) return;
    dispatch({
      type: 'SCORE',
      player: ac.player, artist: ac.artist, scoreType: ac.scoreType, song: ac.song,
      breakStreakFirst: !adjacent,
    });
    setAdjacencyConfirm(null);
  };

  if (ds.dayEndedByTriple !== null && !ds.dayComplete) {
    return <TripleScreenAnim />;
  }
  if (ds.dayComplete && ds.dayEndedByTriple !== null) {
    return <TripleScreen game={game} winner={ds.dayEndedByTriple} setScreen={setScreen} />;
  }

  const hasPendingShots = ds.pendingShots.length > 0;

  return (
    <div className="pb-32" style={{ position: 'relative' }}>
      <StickyScoreboard game={game} ds={ds} bumpScore={bumpScore}
        onBack={() => setScreen('dashboard')}
        onUndo={() => dispatch({ type: 'UNDO' })}
        canUndo={(game.undoStack || []).length > 0} />

      {flashEvent && <ScoreFlash event={flashEvent} onDone={() => setFlashEvent(null)} />}

      {hasPendingShots && (
        <div className="px-3 pt-3">
          <PendingShotsBanner ds={ds} game={game} onCancel={() => dispatch({ type: 'CANCEL_SHOTS' })} />
        </div>
      )}

      <div className="px-3 pt-3">
        <SectionDivider>TAP WHEN A SONG PLAYS</SectionDivider>
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map(idx => (
            <ArtistColumn key={idx} idx={idx} player={game.players[idx]} ds={ds}
              currentDay={game.currentDay}
              onArtistTap={(artist) => setPendingScore({ player: idx, artist })} />
          ))}
        </div>
      </div>

      <div className="px-3 pt-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionDivider>POWER-UPS</SectionDivider>
          <InfoTip
            title="POWER-UPS"
            body="BLOCK and STEAL resolve on the very next song played (drafted or not). A neutral song wastes them. SHOT CALL locks out both — and forces the opponent into a counter at one tier harder."
            color={C.red}
          />
        </div>
        {hasPendingShots && (
          <Mono size={9} color={C.amber} className="block text-center" style={{ marginBottom: 6, letterSpacing: '0.15em' }}>
            BLOCK / STEAL LOCKED — SHOT CALL ACTIVE
          </Mono>
        )}
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map(idx => (
            <div key={idx} className="space-y-1.5">
              <PowerBtn icon={<Shield size={14} />} label="BLOCK" count={ds.blocks[idx]} color={C.blueLight}
                armed={ds.blockArmedBy === idx} disabled={hasPendingShots || !engine.canArmBlock(ds, idx)}
                onClick={() => dispatch({ type: 'ARM_BLOCK', player: idx })} />
              <PowerBtn icon={<Skull size={14} />} label="STEAL" count={ds.steals[idx]} color={C.red}
                armed={ds.stealArmedBy === idx} disabled={hasPendingShots || !engine.canArmSteal(ds, idx)}
                onClick={() => dispatch({ type: 'ARM_STEAL', player: idx })} />
              <PowerBtn icon={<Crosshair size={14} />} label="SHOT CALL" count={ds.shotCalls[idx]} color={C.amber}
                armed={false}
                disabled={ds.shotCalls[idx] <= 0 || ds.pendingShots.some(s => s.player === idx)}
                onClick={() => setShotModal({ player: idx })} />
            </div>
          ))}
        </div>
      </div>

      {/* Neutral song button — only when a Block/Steal/Shot is in play. */}
      {(ds.blockArmedBy !== null || ds.stealArmedBy !== null || hasPendingShots) && (
        <div className="px-3 pt-3">
          <button
            onClick={() => dispatch({ type: 'NEUTRAL_TRACK' })}
            style={{
              width: '100%', padding: '11px',
              background: C.darker,
              border: `2px dashed ${C.silver}`,
              color: C.silver,
              fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            NEUTRAL SONG PLAYED · BURNS ARMED POWER-UPS
          </button>
        </div>
      )}

      <div className="px-3 pt-4">
        {/* V12.27: Playlist Ingest button — sits above LIVE FEED so it
            reads as a scoring action, not a settings cog. */}
        <button
          onClick={() => setIngestModal(true)}
          style={{
            width: '100%', padding: '9px 11px',
            background: C.darker, border: `1px solid ${C.border}`,
            color: C.silver, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            marginBottom: 14,
          }}
        >
          <span style={{
            fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>
            ↳ PASTE PLAYLIST · BACKFILL SCORES
          </span>
          <ChevronRight size={14} color={C.silver} />
        </button>
        {ingestResult && (
          <Mono size={9} color={C.green} style={{
            display: 'block', textAlign: 'center', letterSpacing: '0.15em',
            marginTop: -8, marginBottom: 10, padding: '6px 0',
            background: `${C.green}11`, border: `1px solid ${C.green}33`,
          }}>
            INGESTED {ingestResult.scored} SCORING + {ingestResult.neutral} NEUTRAL
          </Mono>
        )}
        <SectionDivider>LIVE FEED</SectionDivider>
        {/* V12.4: Undo Last Play — prominent, sports-replay framing.
            Only renders when there's something undoable. Shows the
            artist that will be reverted so the user can confirm before
            tapping. */}
        {(game.undoStack || []).length > 0 && ds.events.length > 0 && (() => {
          const lastLive = ds.events.find(e => !e.removed && !e.meta);
          if (!lastLive) return null;
          return (
            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              style={{
                width: '100%',
                padding: '7px 10px',
                marginBottom: 8,
                background: C.cardHi,
                border: `1px dashed ${C.border}`,
                color: C.text,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: '"Oswald", sans-serif',
              }}
            >
              <RotateCcw size={14} style={{ color: C.silver, flexShrink: 0 }} />
              <Mono size={9} color={C.silver} style={{ letterSpacing: '0.25em', flexShrink: 0, fontWeight: 700 }}>
                UNDO LAST PLAY
              </Mono>
              <Mono size={9} color={C.textDim} style={{ letterSpacing: '0.05em', flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lastLive.artist || '(meta)'}
                {lastLive.totalPoints ? ` · -${lastLive.totalPoints}` : ''}
              </Mono>
            </button>
          );
        })()}
        <div ref={eventScrollRef} style={{
          background: C.darker, border: `2px solid ${C.border}`, padding: 5,
          maxHeight: 260, overflowY: 'auto',
        }} className="scrollbar-hide">
          {ds.events.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center' }}>
              <Mono size={10} color={C.textDim}>NO ACTIVITY YET • TAP A SONG WHEN IT PLAYS</Mono>
            </div>
          ) : (
            <>
              <BroadcasterCallout callout={deriveCallout(ds.events, game)} game={game} />
              {ds.events.map((e, i) => <EventRow key={e.id} event={e} game={game} isLatest={i === 0} onTap={() => setEditEvent(e)} />)}
            </>
          )}
        </div>
      </div>

      <div className="px-3 pt-4">
        <DevProviderPanel game={game} dispatch={dispatch} />
      </div>

      <div className="px-3 pt-4">
        <Btn onClick={() => setEndDayModal(true)} variant="danger">
          <span className="inline-flex items-center gap-2"><Flag size={18} /> END THE DAY</span>
        </Btn>
      </div>

      {pendingScore && (
        <PendingScoreModal
          ds={ds}
          game={game}
          pending={pendingScore}
          onClose={() => setPendingScore(null)}
          onSubmit={(scoreType, song) => handleScore(pendingScore.player, pendingScore.artist, scoreType, song)}
        />
      )}

      {adjacencyConfirm && (
        <AdjacencyConfirmModal
          ds={ds}
          game={game}
          pending={adjacencyConfirm}
          onYes={() => handleAdjacencyAnswer(true)}
          onNo={() => handleAdjacencyAnswer(false)}
          onCancel={() => setAdjacencyConfirm(null)}
        />
      )}

      {/* V12.15: COUNTER-STEAL modal. Opens automatically when:
           - a STEAL is currently armed (ds.stealArmedBy !== null)
           - no counter-steal artist has been picked yet
           - the victim has not just dismissed THIS particular steal arm
          The "this particular steal arm" token combines the stealer's
          player index with their remaining-steal count, so a future
          NEW arming (after this one is consumed or undone) gets a
          fresh modal opportunity. */}
      {ds.stealArmedBy !== null
        && ds.counterStealArtist === null
        && counterStealDismissedFor !== `${ds.stealArmedBy}:${ds.steals[ds.stealArmedBy]}`
        && (() => {
          const stealerIdx = ds.stealArmedBy;
          const victimIdx = 1 - stealerIdx;
          const stealerDrafts = ds.drafts[stealerIdx] || [];
          // If the stealer has zero drafted artists, there's nothing
          // for the victim to counter-steal — auto-close.
          if (stealerDrafts.length === 0) return null;
          return (
            <CounterStealModal
              game={game}
              ds={ds}
              stealerIdx={stealerIdx}
              victimIdx={victimIdx}
              stealerDrafts={stealerDrafts}
              onPick={(artist) => {
                dispatch({ type: 'SELECT_COUNTER_STEAL', player: victimIdx, artist });
              }}
              onDecline={() => {
                setCounterStealDismissedFor(`${stealerIdx}:${ds.steals[stealerIdx]}`);
                dispatch({ type: 'DISMISS_COUNTER_STEAL', player: victimIdx });
              }}
            />
          );
        })()}

      {editEvent && (() => {
        // canCorrect is true when this event is the MOST RECENT live
        // (non-removed, non-meta) event in the day. Correction effectively
        // means "I just tapped wrong, fix it" — limited to the latest play
        // so we don't have to deal with mid-list rescoring.
        const mostRecentLive = ds.events.find(e => !e.removed && !e.meta);
        const canCorrect = !!mostRecentLive && mostRecentLive.id === editEvent.id;
        return (
          <EditEventModal
            event={editEvent}
            game={game}
            canCorrect={canCorrect}
            customSongs={customSongs}
            onClose={() => setEditEvent(null)}
            onRemove={() => {
              dispatch({ type: 'REMOVE_EVENT', eventId: editEvent.id });
              setEditEvent(null);
            }}
            onCorrect={({ artist, song }) => {
              dispatch({
                type: 'CORRECT_EVENT',
                eventId: editEvent.id,
                artist,
                song,
                scoreType: editEvent.isWalkoff ? 'walkoff' : 'play',
              });
              setEditEvent(null);
            }}
          />
        );
      })()}

      {shotModal && (
        <ShotCallModal
          player={game.players[shotModal.player]}
          playerIdx={shotModal.player}
          forcedLevel={shotModal.forcedLevel}
          isCounter={shotModal.isCounter}
          drafts={ds.drafts[shotModal.player]}
          allArtists={artistPool || ARTIST_POOL}
          addCustomArtist={addCustomArtist}
          customSongs={customSongs}
          onAddCustomSong={addCustomSong}
          onClose={() => setShotModal(null)}
          onSubmit={(level, predictedArtist, predictedSong) => {
            dispatch({
              type: 'SHOT_CALL',
              player: shotModal.player,
              level, predictedArtist, predictedSong,
              isCounter: !!shotModal.isCounter,
            });
            setShotModal(null);
          }}
        />
      )}

      {bonusModal && (
        <BonusSongModal
          key={`bonus-${bonusModal.playerIdx}`}
          player={game.players[bonusModal.playerIdx]}
          drafts={ds.drafts[bonusModal.playerIdx]}
          customSongs={customSongs}
          onAddCustomSong={addCustomSong}
          onSelect={(bonusSong) => dispatch({ type: 'SET_BONUS', player: bonusModal.playerIdx, bonusSong })}
        />
      )}

      {endDayModal && (
        <EndDayModal
          game={game}
          onClose={() => setEndDayModal(false)}
          onEndDay={(half) => {
            setEndDayModal(false);
            dispatch({ type: 'END_DAY', halfPointWinner: half });
            setScreen('endDay');
          }}
          onSkip={() => {
            setEndDayModal(false);
            setSkipModal(true);
          }}
        />
      )}

      {skipModal && (
        <SkipDayModal
          game={game}
          onClose={() => setSkipModal(false)}
          onConfirm={() => {
            const wasLastDay = game.currentDay >= 5;
            setSkipModal(false);
            dispatch({ type: 'SKIP_DAY' });
            // V12.8: on day 5, skip ends the week — go to endDay recap.
            setScreen(wasLastDay ? 'endDay' : 'draft');
          }}
        />
      )}
      {ingestModal && (
        <PlaylistIngestModal
          game={game}
          stationId={game.station?.id || 'unknown'}
          onClose={() => setIngestModal(false)}
          onCommit={(tracks) => {
            dispatch({ type: 'INGEST_BATCH', tracks });
            // Quick summary for the banner. Recompute by walking the
            // tracks to count scored vs neutral against the CURRENT
            // (pre-ingest) day state, since after dispatch the engine
            // has already credited each one.
            const drafted = new Set([
              ...(game.currentDayState.drafts[0] || []),
              ...(game.currentDayState.drafts[1] || []),
            ].map(a => normalizeText(a)));
            let scored = 0, neutral = 0;
            for (const t of tracks) {
              if (drafted.has(normalizeText(t.artist))) scored++;
              else neutral++;
            }
            setIngestResult({ scored, neutral, total: tracks.length });
            setIngestModal(false);
            // Auto-clear the banner after a few seconds
            setTimeout(() => setIngestResult(null), 5000);
          }}
        />
      )}
    </div>
  );
}

function PendingShotsBanner({ ds, game, onCancel }) {
  return (
    <div style={{ background: `${C.amber}22`, border: `2px solid ${C.amber}`, padding: 9 }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Crosshair size={14} style={{ color: C.amber }} className="flicker" />
          <Stencil size={11} color={C.amber} tracking="0.2em">SHOT CALLS PENDING</Stencil>
        </div>
        <button onClick={onCancel} style={{ ...iconBtn, color: C.silver }}>
          <X size={14} />
        </button>
      </div>
      <div className="space-y-1">
        {ds.pendingShots.map((s, i) => {
          let target;
          if (s.level === 'team') target = 'OWN TEAM';
          else if (s.level === 'song' && s.predictedSong) target = `${s.predictedArtist.toUpperCase()} — "${s.predictedSong}"`;
          else target = s.predictedArtist ? s.predictedArtist.toUpperCase() : '?';
          return (
            <Mono key={i} size={10} color="#fff" style={{ display: 'block', letterSpacing: '0.05em' }}>
              <span style={{ color: s.player === 0 ? C.green : C.silver, fontWeight: 700 }}>{game.players[s.player].name}</span>
              {' • '}{SHOT_LABEL[s.level]} → {target} · +{SHOT_POINTS[s.level]}
            </Mono>
          );
        })}
      </div>
    </div>
  );
}

function StickyScoreboard({ game, ds, bumpScore, onBack, onUndo, canUndo }) {
  return (
    <div style={{
      position: 'sticky', top: 0, background: C.darker, zIndex: 20,
      borderBottom: `2px solid ${C.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
    }}>
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} style={iconBtn}>
            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div className="inline-flex items-center gap-2">
            <div style={{ width: 7, height: 7, background: C.red, borderRadius: '50%' }} className="flicker" />
            <Stencil size={11} color={C.red} tracking="0.25em">LIVE</Stencil>
            <Mono size={9} color={C.silver}>• DAY {game.currentDay}</Mono>
          </div>
          <button onClick={onUndo} disabled={!canUndo} style={{ ...iconBtn, opacity: canUndo ? 1 : 0.3 }}>
            <RotateCcw size={16} />
          </button>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <PlayerCompactScore player={game.players[0]} score={ds.scores[0]} idx={0} bump={bumpScore[0]} align="right" />
          <Stencil size={14} color={C.red} tracking="0.2em">VS</Stencil>
          <PlayerCompactScore player={game.players[1]} score={ds.scores[1]} idx={1} bump={bumpScore[1]} align="left" />
        </div>
        {(ds.blockArmedBy !== null || ds.stealArmedBy !== null) && (
          <div className="mt-2 flex gap-2 flex-wrap justify-center">
            {ds.blockArmedBy !== null && <ArmedBadge label={`${game.players[ds.blockArmedBy].name} BLOCK ARMED`} color={C.blueLight} />}
            {ds.stealArmedBy !== null && <ArmedBadge label={`${game.players[ds.stealArmedBy].name} STEAL ARMED`} color={C.red} />}
            {ds.counterStealArtist !== null && ds.counterStealBy !== null && (
              <ArmedBadge
                label={`${game.players[ds.counterStealBy].name} COUNTER: ${ds.counterStealArtist.toUpperCase()}`}
                color={C.redLight}
              />
            )}
          </div>
        )}
        {ds.consecutiveCount >= 2 && ds.lastScorer !== null && (
          <div className="mt-2 flex justify-center">
            <div style={{
              padding: '3px 10px', background: ds.consecutiveCount >= 3 ? C.green : C.amber,
              border: `1px solid ${C.darker}`, color: C.darker,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }} className="flicker">
              <Flame size={11} />
              <Stencil size={10} color={C.darker} tracking="0.15em">
                {game.players[ds.lastScorer].name} ON {ds.consecutiveCount} STRAIGHT
              </Stencil>
            </div>
          </div>
        )}
        {ds.events && ds.events.filter(e => !e.meta && e.totalPoints > 0).length >= 2 && (
          <div style={{ marginTop: 6, marginLeft: -12, marginRight: -12 }}>
            <MomentumBar ds={ds} players={game.players} />
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerCompactScore({ player, score, idx, bump, align }) {
  const color = idx === 0 ? C.green : C.silver;
  return (
    <div style={{ textAlign: align }}>
      <Stencil size={10} color={color} tracking="0.18em" style={{ display: 'block' }}>{player.name}</Stencil>
      <div key={bump} className="pop" style={{ marginTop: 4, display: 'inline-block' }}>
        <LEDDisplay value={score} color={color} size="md" align={align} />
      </div>
    </div>
  );
}

function ArtistColumn({ idx, player, ds, onArtistTap, currentDay = 1 }) {
  const color = idx === 0 ? C.green : C.silver;
  const played = (ds.playedByPlayer?.[idx] || []).length;
  const awarded = ds.fiveForFiveAwarded?.[idx] || false;

  // V12.28: compute per-artist hit count for THIS player. A "hit" =
  // clean scoring event credited to this player (owner === idx,
  // effectivePlayer === idx, not blocked, not stolen, not removed).
  // Bonus, walk-off, B2B, retal all count — they're all clean hits.
  // Counter-stolen events score for the OTHER player, so the artist's
  // owner (this player) doesn't get a hit on their roster card.
  const hitCount = {};
  for (const ev of ds.events || []) {
    if (ev.removed || ev.meta || ev.blocked || ev.stolen || ev.counterStolen) continue;
    if (ev.owner === idx && ev.effectivePlayer === idx && ev.artist) {
      hitCount[ev.artist] = (hitCount[ev.artist] || 0) + 1;
    }
  }

  return (
    <div style={{ background: C.card, border: `2px solid ${color}33`, padding: 7 }}>
      <Stencil size={10} color={color} tracking="0.15em" style={{ display: 'block', marginBottom: 4, textAlign: 'center' }}>
        {player.name}
      </Stencil>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <FiveForFiveMeter played={played} color={color} size="sm" awarded={awarded} day={currentDay} />
      </div>
      <div className="space-y-1.5">
        {ds.drafts[idx].map(artist => {
          const hits = hitCount[artist] || 0;
          const playedAlready = hits > 0;
          const isBonus = ds.bonusSongs[idx]?.artist === artist;
          // V12.28: when an artist has hit, brighten the card slightly so
          // the row reads as "delivered" at a glance. Bonus song treatment
          // (amber) takes precedence — bonus is orthogonal.
          const baseBg = isBonus ? `${C.amber}33`
            : playedAlready ? (idx === 0 ? `${C.green}55` : `${C.silver}55`)
            : (idx === 0 ? `${C.green}33` : `${C.silver}33`);
          const baseBorder = isBonus ? C.amber
            : playedAlready ? (idx === 0 ? C.green : C.silver)
            : color;
          const shadowColor = idx === 0
            ? (playedAlready ? '#0A8E6E' : '#0A6E55')
            : (playedAlready ? '#7A838F' : '#5A6373');
          return (
            <button key={artist} onClick={() => onArtistTap(artist)} style={{
              width: '100%', padding: '14px 7px',
              background: baseBg,
              border: `2px solid ${baseBorder}`,
              color: C.text,
              fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 12,
              letterSpacing: '0.04em', textAlign: 'left', textTransform: 'uppercase',
              position: 'relative', cursor: 'pointer', minHeight: 52,
              boxShadow: `0 2px 0 ${shadowColor}`,
              opacity: 1,
            }} className="active:translate-y-0.5 transition-transform">
              {isBonus && (
                <Award size={11} style={{ position: 'absolute', top: 3, right: 3, color: C.amber }} />
              )}
              {/* V12.28: hit badge — replaces the small amber dot with a
                  proper check + count chip. Sits top-right except when
                  bonus star is there, in which case it sits below it. */}
              {playedAlready && (
                <div style={{
                  position: 'absolute',
                  top: isBonus ? 17 : 3,
                  right: 3,
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                  padding: '1px 4px',
                  background: idx === 0 ? C.green : C.silver,
                  border: `1px solid ${idx === 0 ? '#0A6E55' : '#5A6373'}`,
                  color: C.bg,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 800, fontSize: 9,
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                }}>
                  <Check size={8} strokeWidth={3.5} />
                  {hits > 1 && <span>×{hits}</span>}
                </div>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus size={13} style={{ color, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.1 }}>{artist}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PowerBtn({ icon, label, count, color, armed, disabled, onClick }) {
  const isDisabled = disabled || count <= 0;
  return (
    <button onClick={() => !isDisabled && onClick()} disabled={isDisabled} className={armed ? 'armed' : ''} style={{
      width: '100%', padding: '10px 9px',
      background: armed ? `${color}44` : isDisabled ? C.darker : C.card,
      border: `2px solid ${armed ? color : isDisabled ? C.border : `${color}88`}`,
      color: isDisabled ? '#8E96A4' : '#fff',
      fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 12,
      letterSpacing: '0.08em',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: isDisabled ? 'not-allowed' : 'pointer', minHeight: 38,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: isDisabled ? C.textDim : color, display: 'inline-flex' }}>{icon}</span>
        {label}
      </span>
      <Mono size={12} color={isDisabled ? C.textDim : color} style={{ fontWeight: 700 }}>{count}</Mono>
    </button>
  );
}

function ArmedBadge({ label, color }) {
  return (
    <div className="flicker" style={{
      padding: '3px 8px', background: `${color}33`, border: `1px solid ${color}`,
      fontFamily: '"Oswald", sans-serif', fontSize: 10, fontWeight: 700,
      color, letterSpacing: '0.15em',
    }}>{label}</div>
  );
}

// BroadcasterCallout: derived banner that appears above the latest event
// when something dramatic just happened. Pure render-layer — events array
// stays clean. Returns null when nothing of note is happening.
function deriveCallout(events, game) {
  if (!events || events.length < 2) return null;
  const scoring = events.filter(e => !e.meta && e.totalPoints > 0);

  // Momentum swing: in the last 4 scoring events, one player has 5+ pts
  // and the other has 0. Don't fire on the trivial case (first 4 plays of
  // the day with no opposition yet) — require both players to have scored
  // at SOME point today.
  const recent4 = scoring.slice(0, 4);
  if (recent4.length >= 3) {
    const sums = [0, 0];
    for (const e of recent4) {
      if (e.effectivePlayer === 0 || e.effectivePlayer === 1) {
        sums[e.effectivePlayer] += e.totalPoints;
      }
    }
    const totalScoredEver = [0, 0];
    for (const e of scoring) {
      if (e.effectivePlayer === 0 || e.effectivePlayer === 1) {
        totalScoredEver[e.effectivePlayer] += e.totalPoints;
      }
    }
    const bothHaveScored = totalScoredEver[0] > 0 && totalScoredEver[1] > 0;
    if (bothHaveScored) {
      if (sums[0] >= 5 && sums[1] === 0) {
        return { type: 'momentum', player: 0, points: sums[0] };
      }
      if (sums[1] >= 5 && sums[0] === 0) {
        return { type: 'momentum', player: 1, points: sums[1] };
      }
    }
  }

  // V12.15: COUNTER-STEAL HIT — the most recent scoring event was a
  // counter-stolen play. Surface it dramatically since the moment is
  // brief (single song) and the player who set the trap should feel
  // it land.
  const mostRecentScore = events.find(e => !e.meta && e.totalPoints > 0);
  if (mostRecentScore && mostRecentScore.counterStolen) {
    return {
      type: 'counterSteal',
      stealer: mostRecentScore.owner,   // the original stealer (got hijacked)
      victim: mostRecentScore.effectivePlayer, // who collected the points
      artist: mostRecentScore.artist,
      points: mostRecentScore.totalPoints,
    };
  }

  // Retaliation chain: 2+ consecutive retaliation events at the top of
  // the stack (events are newest-first).
  let chain = 0;
  for (const e of events) {
    if (e.meta) continue;
    if (e.isRetal) chain += 1;
    else break;
  }
  if (chain >= 2) {
    return { type: 'retalChain', count: chain };
  }

  return null;
}

function BroadcasterCallout({ callout, game }) {
  if (!callout) return null;
  if (callout.type === 'momentum') {
    const pColor = callout.player === 0 ? C.green : C.silver;
    return (
      <div className="event-enter" style={{
        margin: '2px 0',
        padding: '8px 11px',
        background: `linear-gradient(90deg, ${pColor}33, ${pColor}11 60%, transparent)`,
        borderLeft: `3px solid ${pColor}`,
        borderTop: `1px solid ${pColor}44`,
        borderBottom: `1px solid ${pColor}44`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <TrendingUp size={18} style={{ color: pColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Mono size={8} color={pColor} style={{ letterSpacing: '0.4em', display: 'block' }}>
            MOMENTUM SWING
          </Mono>
          <Stencil size={13} color="#fff" tracking="0.05em" style={{ display: 'block', marginTop: 2 }}>
            {game.players[callout.player].name} +{callout.points} IN LAST 4 SONGS
          </Stencil>
        </div>
      </div>
    );
  }
  if (callout.type === 'retalChain') {
    return (
      <div className="event-enter" style={{
        margin: '2px 0',
        padding: '8px 11px',
        background: `linear-gradient(90deg, ${C.red}33, ${C.red}11 60%, transparent)`,
        borderLeft: `3px solid ${C.red}`,
        borderTop: `1px solid ${C.red}44`,
        borderBottom: `1px solid ${C.red}44`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Zap size={18} style={{ color: C.redLight, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Mono size={8} color={C.redLight} style={{ letterSpacing: '0.4em', display: 'block', fontWeight: 700 }}>
            RETALIATION CHAIN
          </Mono>
          <Stencil size={13} color="#fff" tracking="0.05em" style={{ display: 'block', marginTop: 2 }}>
            ×{callout.count} — EVERY SHOT ANSWERED
          </Stencil>
        </div>
      </div>
    );
  }
  if (callout.type === 'counterSteal') {
    const vName = callout.victim !== null && callout.victim !== undefined
      ? game.players[callout.victim].name : '?';
    const sName = callout.stealer !== null && callout.stealer !== undefined
      ? game.players[callout.stealer].name : '?';
    return (
      <div className="event-enter" style={{
        margin: '2px 0',
        padding: '8px 11px',
        background: `linear-gradient(90deg, ${C.red}44, ${C.red}11 60%, transparent)`,
        borderLeft: `4px solid ${C.red}`,
        borderTop: `1px solid ${C.red}66`,
        borderBottom: `1px solid ${C.red}66`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Skull size={18} style={{ color: C.redLight, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Mono size={8} color={C.redLight} style={{ letterSpacing: '0.4em', display: 'block', fontWeight: 700 }}>
            COUNTER-STEAL HIT
          </Mono>
          <Stencil size={13} color="#fff" tracking="0.05em" style={{ display: 'block', marginTop: 2 }}>
            {vName.toUpperCase()} HIJACKED {callout.artist.toUpperCase()} +{callout.points}
          </Stencil>
          <Mono size={8} color={C.silver} style={{ display: 'block', marginTop: 2, letterSpacing: '0.1em' }}>
            ↳ {sName.toUpperCase()} GOT BURNED
          </Mono>
        </div>
      </div>
    );
  }
  return null;
}

function EventRow({ event, game, isLatest, onTap }) {
  const playerColor = event.effectivePlayer === 0 ? C.green : event.effectivePlayer === 1 ? C.silver : C.blue;
  // V12.3: removed events stay in the feed for auditability but render
  // dimmed + struck through.
  const isRemoved = !!event.removed;
  // V12.11: simplified palette. Green = positive, red = destructive,
  // light gray = neutral default. Amber reserved for the bonus song
  // and 5-for-5 / triple-in-a-row moments only. Big plays (3+ pts)
  // get visual weight from TYPOGRAPHY (size, color of the player tint,
  // the +N badge), not from background color. This stops the feed
  // from constantly cycling through accent tints.
  const bg = isRemoved ? `${C.red}11`
    : event.blocked ? `${C.red}22`
    : event.isTriple ? `${C.green}44`
    : event.is5for5 ? `${C.amber}33`
    : event.counterStolen ? `${C.red}22`
    : event.stolen ? `${C.red}1A`
    : event.bonusSongPlay || event.isBonus ? `${C.amber}22`
    : isLatest ? `${playerColor}22`
    : 'transparent';
  const borderColor = isRemoved ? `${C.red}66`
    : event.blocked ? C.red
    : event.isTriple ? C.green
    : event.is5for5 ? C.amber
    : event.counterStolen ? C.red
    : event.stolen ? C.red
    : event.bonusSongPlay || event.isBonus ? C.amber
    : playerColor;

  const ts = typeof event.timestamp === 'object'
    ? event.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : new Date(event.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // V12.15.1: a neutral song event has both effectivePlayer AND owner
  // null. Pre-V12.15 this could already happen (e.g. neutral fired
  // when a Steal was armed) but the crash was latent because nothing
  // commonly triggered the path. The counter-steal flow exposed it.
  // Fall through to a tiny gray "neutral" row instead of crashing.
  const player = event.effectivePlayer !== null && event.effectivePlayer !== undefined
    ? game.players[event.effectivePlayer]
    : (event.owner !== null && event.owner !== undefined ? game.players[event.owner] : null);
  if (!player) {
    return (
      <div style={{
        padding: '6px 10px', marginBottom: 2,
        background: 'transparent',
        borderLeft: `3px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
        opacity: 0.85,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'baseline' }}>
            <Mono size={9} color={C.textDim}>{ts}</Mono>
            <Mono size={9} color={C.silver} style={{ letterSpacing: '0.18em', fontWeight: 700 }}>
              NEUTRAL
            </Mono>
          </div>
          <Mono size={10} color={C.textDim} style={{
            marginTop: 1, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', letterSpacing: '0.04em',
          }}>{(event.parts || []).join(' • ')}</Mono>
        </div>
      </div>
    );
  }

  // Dramatic multi-line layout for "big" events. parts[] from the engine
  // looks like: [ARTIST, optionally "SONG", "+1", MOD1, MOD2, ...].
  // We split it into title line(s) + a list of modifier lines + total.
  const wantsBigLayout = event.big || event.is5for5 || event.isTriple
    || event.blocked || (event.shotResolutions && event.shotResolutions.length > 0);

  const renderBig = () => {
    // Parse parts. First element is artist (uppercase already). Second
    // might be a quoted song. Then +N base. Then mods like "BONUS SONG +2".
    const parts = event.parts || [];
    let artist = parts[0] || '';
    let song = null;
    let modIdx = 1;
    if (parts[1] && parts[1].startsWith('"')) {
      song = parts[1];
      modIdx = 2;
    }
    const mods = parts.slice(modIdx);
    return (
      <>
        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 4 }}>
          <Mono size={9} color={C.textDim} style={{ flexShrink: 0 }}>{ts}</Mono>
          <Stencil size={11} color={playerColor} tracking="0.15em" style={{ flexShrink: 0 }}>
            {player.name}
          </Stencil>
          <div style={{ display: 'inline-flex', gap: 3, alignItems: 'center', marginLeft: 'auto' }}>
            {/* V12.27: ingested-from-playlist events show a subtle tag so
                the user knows these weren't real-time scoring */}
            {event.backfilled && (
              <Mono size={7} color={C.textDim} style={{
                letterSpacing: '0.15em', marginRight: 2,
                padding: '1px 4px', border: `1px solid ${C.border}`,
              }}>BACKFILL</Mono>
            )}
            {event.isBonus && <Award size={10} style={{ color: C.amber }} />}
            {event.isB2B && <Flame size={10} style={{ color: C.textDim }} />}
            {event.isRetal && <Zap size={10} style={{ color: C.blue }} />}
            {event.stolen && <Skull size={10} style={{ color: C.red }} />}
            {event.counterStolen && <Skull size={10} style={{ color: C.red }} />}
            {event.is5for5 && <Trophy size={10} style={{ color: C.amber }} />}
            {event.blocked && <Shield size={11} style={{ color: C.red }} />}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Stencil size={14} color={event.blocked ? C.red : '#fff'} tracking="0.05em" style={{
              display: 'block', lineHeight: 1.1, marginBottom: song ? 2 : 4,
            }}>
              {artist}
            </Stencil>
            {song && (
              <Mono size={9} color={C.silver} style={{ display: 'block', marginBottom: 4, letterSpacing: '0.05em' }}>
                {song}
              </Mono>
            )}
            {/* Modifier lines — stacked vertically */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {mods.map((m, i) => (
                <Mono key={i} size={9} color={
                  m.includes('MISSED') ? C.textDim
                  : m.includes('HIT') ? C.amber
                  : m.includes('BLOCKED') ? C.red
                  : m.includes('STOLEN') ? C.red
                  : m === 'THREE IN A ROW — DAY OVER' ? C.green
                  : C.text
                } style={{ letterSpacing: '0.06em' }}>
                  {m}
                </Mono>
              ))}
            </div>
            {event.blocked && (
              <Mono size={8} color={C.silver} style={{ display: 'block', marginTop: 4, letterSpacing: '0.1em', opacity: 0.75 }}>
                ↳ Does not count toward 5-FOR-5
              </Mono>
            )}
            {event.stolen && event.owner !== null && event.owner !== undefined && (
              <Mono size={8} color={C.silver} style={{ display: 'block', marginTop: 4, letterSpacing: '0.1em', opacity: 0.75 }}>
                ↳ Does not advance {game.players[event.owner].name}'s 5-FOR-5
              </Mono>
            )}
            {event.counterStolen && event.owner !== null && event.owner !== undefined && (
              <Mono size={8} color={C.redLight} style={{ display: 'block', marginTop: 4, letterSpacing: '0.1em', fontWeight: 700 }}>
                ↳ COUNTER-STEAL HIT — Hijacked from {game.players[event.owner].name}
              </Mono>
            )}
          </div>
          {event.totalPoints > 0 && !event.blocked && (
            <div style={{
              fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 28,
              color: event.isTriple ? C.green : playerColor,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1, flexShrink: 0,
            }}>+{event.totalPoints}</div>
          )}
        </div>
      </>
    );
  };

  const renderCompact = () => (
    <>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'baseline' }}>
          <Mono size={9} color={C.textDim}>{ts}</Mono>
          <Stencil size={11} color={playerColor} tracking="0.1em">{player.name}</Stencil>
          {event.isBonus && <Award size={10} style={{ color: C.amber }} />}
          {event.isShot && <Crosshair size={10} style={{ color: C.amber }} />}
        </div>
        <Mono size={10} color="#fff" style={{
          marginTop: 1, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', letterSpacing: '0.04em',
        }}>{event.parts.join(' • ')}</Mono>
      </div>
      {event.totalPoints > 0 && (
        <div style={{
          fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 20,
          color: C.text,
          fontVariantNumeric: 'tabular-nums',
        }}>+{event.totalPoints}</div>
      )}
    </>
  );

  return (
    <div
      className={isLatest && !isRemoved ? 'event-enter' : ''}
      onClick={onTap && !event.meta ? onTap : undefined}
      style={{
        padding: wantsBigLayout ? '10px 11px' : '7px 9px',
        marginBottom: 2, background: bg,
        borderLeft: `3px solid ${borderColor}`,
        display: wantsBigLayout ? 'block' : 'flex',
        justifyContent: 'space-between', alignItems: 'center', gap: 8,
        opacity: isRemoved ? 0.45 : 1,
        textDecoration: isRemoved ? 'line-through' : 'none',
        cursor: onTap && !event.meta ? 'pointer' : 'default',
        position: 'relative',
      }}
    >
      {wantsBigLayout ? renderBig() : renderCompact()}
      {isRemoved && (
        <Mono size={7} color={C.redLight} style={{
          position: 'absolute', right: 11, top: 6,
          letterSpacing: '0.3em',
          padding: '1px 4px',
          background: `${C.red}33`,
          border: `1px solid ${C.red}55`,
          textDecoration: 'none',
        }}>REMOVED</Mono>
      )}
    </div>
  );
}

// ============================================================
// DEV PROVIDER PANEL
// ============================================================
// Hidden behind a "DEV" toggle. Lets you exercise the Mock provider
// without needing a radio. Not intended for jobsite use — production
// scoring still happens via the artist tap UX above.

function DevProviderPanel({ game, dispatch }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);

  const station = game.station || { id: 'unknown' };

  const emit = () => {
    const t = PROVIDERS.mock.emitNext(station);
    if (t) setHistory(h => [t, ...h].slice(0, 8));
  };

  const ingest = (track) => {
    dispatch({ type: 'INGEST_TRACK', track });
  };

  const emitFromDraft = (playerIdx) => {
    // Force the next mock track to be one of this player's drafted artists.
    // Useful for testing back-to-back / triple / bonus song flows quickly.
    const pool = game.currentDayState.drafts[playerIdx];
    if (!pool || pool.length === 0) return;
    const artist = pool[Math.floor(Math.random() * pool.length)];
    const t = PROVIDERS.manual.makeTrack({ artist, stationId: station.id });
    if (!t) return;
    // Re-tag as mock so the event feed shows it came from the dev panel
    const mockTrack = { ...t, source: 'mock' };
    mockTrack.id = `mock:${station.id}:${artist}:${Date.now()}`;
    setHistory(h => [mockTrack, ...h].slice(0, 8));
    ingest(mockTrack);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          ...iconBtn,
          width: '100%',
          padding: '6px',
          border: `1px dashed ${C.border}`,
          opacity: 0.5,
        }}
      >
        <Mono size={9} color={C.textDim} style={{ letterSpacing: '0.3em' }}>DEV</Mono>
      </button>
    );
  }

  return (
    <div style={{
      background: C.darker,
      border: `1px dashed ${C.amber}66`,
      padding: 10,
    }}>
      <div className="flex items-center justify-between mb-2">
        <Mono size={9} color={C.amber} style={{ letterSpacing: '0.25em' }}>
          DEV • MOCK PROVIDER
        </Mono>
        <button onClick={() => setOpen(false)} style={{ ...iconBtn, color: C.textDim }}>
          <X size={12} />
        </button>
      </div>
      <Mono size={9} color={C.textDim} style={{ lineHeight: 1.5, marginBottom: 8, display: 'block' }}>
        SIMULATES THE PIPELINE FROM A LIVE PROVIDER. ENGINE PATH IS IDENTICAL TO PRODUCTION.
      </Mono>

      <div className="grid grid-cols-3 gap-1 mb-2">
        <button onClick={emit} style={devBtnStyle}>RANDOM</button>
        <button onClick={() => emitFromDraft(0)} style={{ ...devBtnStyle, color: C.green, borderColor: C.green }}>
          {game.players[0].name}
        </button>
        <button onClick={() => emitFromDraft(1)} style={{ ...devBtnStyle, color: C.silver, borderColor: C.silver }}>
          {game.players[1].name}
        </button>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <Mono size={8} color={C.textDim} style={{ letterSpacing: '0.2em', display: 'block', marginBottom: 4 }}>
            RECENT TRACKS (DEDUPED)
          </Mono>
          {PROVIDERS.mock.dedupeTracks(history).slice(0, 4).map(t => (
            <div key={t.id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '3px 6px',
              background: C.card,
              marginBottom: 2,
              fontSize: 9,
              fontFamily: '"JetBrains Mono", monospace',
              color: C.text,
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.artist.toUpperCase()}
              </span>
              <span style={{ color: C.textDim }}>{t.source}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const devBtnStyle = {
  padding: '7px 4px',
  background: C.card,
  border: `1px solid ${C.border}`,
  color: C.text,
  fontFamily: '"Oswald", sans-serif',
  fontWeight: 700,
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

// ============================================================
// MODALS
// ============================================================

function Modal({ title, onClose, children, dismissible = true }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
    }}>
      <div style={{
        background: C.card, border: `2px solid ${C.borderHi}`,
        width: '100%', maxWidth: 420, maxHeight: '92vh', overflowY: 'auto',
        boxShadow: `0 12px 30px rgba(0,0,0,0.5)`,
      }}>
        <TrimBar accent="amber" thickness={6} />
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Stencil size={17} tracking="0.1em">{title}</Stencil>
            {dismissible && <button onClick={onClose} style={iconBtn}><X size={18} /></button>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// V12.27: Playlist Ingest modal. Paste raw playlist text (onlineradiobox
// markdown table or loose "HH:MM Artist - Song" lines), preview parsed
// tracks, uncheck unwanted ones, commit. Each kept track runs through
// the existing scoreTrack pipeline — no engine surgery, no scoring
// bypass. Tactical events (blocks, steals, walk-offs, shot calls) are
// NOT triggered by ingestion since they need real-time decisions; the
// event feed marks ingested events as BACKFILLED.
function PlaylistIngestModal({ game, stationId, onClose, onCommit }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null); // null = not yet parsed
  const [keepFlags, setKeepFlags] = useState({}); // index -> boolean
  const [committing, setCommitting] = useState(false);

  const handleParse = () => {
    const provider = PROVIDERS.onlineradiobox;
    const rawRows = provider.parseText(text);
    // Run each row through normalizeTrack to get fully-canonical Tracks.
    const tracks = rawRows
      .map(row => provider.normalizeTrack(row, stationId))
      .filter(Boolean);
    // Dedupe — within a single paste, the same artist+song within 5
    // minutes is almost certainly a parse artifact.
    const deduped = provider.dedupeTracks ? provider.dedupeTracks(tracks) : tracks;
    setParsed(deduped);
    const flags = {};
    deduped.forEach((_, i) => { flags[i] = true; });
    setKeepFlags(flags);
  };

  const handleToggle = (i) => {
    setKeepFlags(f => ({ ...f, [i]: !f[i] }));
  };

  const handleToggleAll = (val) => {
    if (!parsed) return;
    const flags = {};
    parsed.forEach((_, i) => { flags[i] = val; });
    setKeepFlags(flags);
  };

  const keptTracks = parsed ? parsed.filter((_, i) => keepFlags[i]) : [];

  const handleCommit = () => {
    if (keptTracks.length === 0) return;
    setCommitting(true);
    onCommit(keptTracks);
  };

  // Detect drafted artists so the preview can mark which rows will
  // actually score vs. just resolve neutrally.
  const draftedSet = new Set([
    ...(game?.currentDayState?.drafts?.[0] || []),
    ...(game?.currentDayState?.drafts?.[1] || []),
  ]);
  const draftedNorm = new Set([...draftedSet].map(a => normalizeText(a)));

  return (
    <Modal title="PLAYLIST INGEST" onClose={onClose}>
      <Mono size={9} color={C.textDim} style={{
        letterSpacing: '0.12em', display: 'block', marginBottom: 8, lineHeight: 1.45,
      }}>
        PASTE A PLAYLIST FROM ONLINERADIOBOX OR ANY "HH:MM ARTIST - SONG"<br/>
        FORMAT. EACH KEPT TRACK WILL SCORE THROUGH THE NORMAL ENGINE.<br/>
        TACTICAL EVENTS (BLOCK · STEAL · WALK-OFF · SHOT CALL) ARE NOT<br/>
        TRIGGERED BY INGESTION.
      </Mono>
      {parsed === null && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="| 04:35 | Elle King - Drunk |&#10;| 04:32 | Morgan Wallen - I Got Better |&#10;&#10;or:&#10;&#10;04:35 Elle King - Drunk&#10;04:32 Morgan Wallen - I Got Better"
            style={{
              width: '100%', minHeight: 220,
              background: C.darker, border: `1px solid ${C.border}`,
              color: '#fff', fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11, padding: 10, lineHeight: 1.4,
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Btn onClick={onClose} variant="ghost" style={{ flex: 1 }}>CANCEL</Btn>
            <Btn onClick={handleParse} variant="primary" disabled={!text.trim()} style={{ flex: 1 }}>
              PARSE
            </Btn>
          </div>
        </>
      )}
      {parsed !== null && parsed.length === 0 && (
        <>
          <Mono size={10} color={C.red} style={{ display: 'block', textAlign: 'center', padding: '20px 0', letterSpacing: '0.15em' }}>
            NO TRACKS PARSED. CHECK FORMAT AND TRY AGAIN.
          </Mono>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Btn onClick={() => { setParsed(null); }} variant="ghost" style={{ flex: 1 }}>BACK</Btn>
          </div>
        </>
      )}
      {parsed !== null && parsed.length > 0 && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}`,
          }}>
            <Mono size={9} color={C.silver} style={{ letterSpacing: '0.15em' }}>
              {keptTracks.length}/{parsed.length} TRACKS SELECTED
            </Mono>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => handleToggleAll(true)} style={{
                background: 'transparent', border: `1px solid ${C.border}`, color: C.silver,
                fontFamily: '"JetBrains Mono", monospace', fontSize: 8, letterSpacing: '0.15em',
                padding: '3px 6px', cursor: 'pointer',
              }}>ALL</button>
              <button onClick={() => handleToggleAll(false)} style={{
                background: 'transparent', border: `1px solid ${C.border}`, color: C.silver,
                fontFamily: '"JetBrains Mono", monospace', fontSize: 8, letterSpacing: '0.15em',
                padding: '3px 6px', cursor: 'pointer',
              }}>NONE</button>
            </div>
          </div>
          <div style={{ maxHeight: '45vh', overflowY: 'auto', marginBottom: 10 }}>
            {parsed.map((track, i) => {
              const drafted = draftedNorm.has(normalizeText(track.artist));
              const checked = !!keepFlags[i];
              const time = track.playedAt instanceof Date
                ? track.playedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';
              return (
                <button key={i} onClick={() => handleToggle(i)} style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 6px', marginBottom: 4,
                  background: checked ? C.darker : 'transparent',
                  border: `1px solid ${checked ? (drafted ? C.green : C.border) : C.border}`,
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 16, height: 16, flexShrink: 0,
                    border: `2px solid ${checked ? C.green : C.silver}`,
                    background: checked ? C.green : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {checked && <Check size={10} color={C.bg} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: '"Oswald", sans-serif', fontWeight: 600, fontSize: 12,
                      color: drafted ? C.green : '#fff', letterSpacing: '0.03em',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {track.artist}{drafted && ' ★'}
                    </div>
                    {track.song && (
                      <div style={{
                        fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
                        color: C.textDim, letterSpacing: '0.05em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {track.song.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {time && (
                    <Mono size={9} color={C.silver} style={{ letterSpacing: '0.1em', flexShrink: 0 }}>
                      {time}
                    </Mono>
                  )}
                </button>
              );
            })}
          </div>
          <Mono size={8} color={C.textDim} style={{
            letterSpacing: '0.1em', display: 'block', marginBottom: 10, lineHeight: 1.4,
          }}>
            ★ = ARTIST IS ON A DRAFT ROSTER · WILL SCORE POINTS<br/>
            UNMARKED ARTISTS RESOLVE NEUTRALLY (NO POINTS)
          </Mono>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={() => setParsed(null)} variant="ghost" style={{ flex: 1 }} disabled={committing}>
              BACK
            </Btn>
            <Btn onClick={handleCommit} variant="primary" style={{ flex: 1 }}
              disabled={keptTracks.length === 0 || committing}>
              {committing ? 'INGESTING...' : `INGEST ${keptTracks.length}`}
            </Btn>
          </div>
        </>
      )}
    </Modal>
  );
}

function PendingScoreModal({ ds, game, pending, onClose, onSubmit }) {
  const { player: playerIdx, artist } = pending;

  // Does the song title matter for this tap?
  // YES if: (a) this artist is the owner's bonus artist (so we need to
  // know if the song matches the bonus song), or (b) there's a pending
  // Song-level shot call against this artist.
  const bonus = ds.bonusSongs[playerIdx];
  const isBonusArtist = bonus?.artist === artist;
  const songShotPending = ds.pendingShots.some(s => s.level === 'song' && s.predictedArtist === artist);
  const songMatters = isBonusArtist || songShotPending;

  // Suggested songs: bonus first, then catalog
  const catalogSongs = ARTIST_SONG_CATALOG[artist] || [];
  const suggestions = [];
  if (isBonusArtist && bonus?.song) suggestions.push(bonus.song);
  for (const s of catalogSongs) {
    if (!suggestions.some(x => normalizeText(x) === normalizeText(s))) suggestions.push(s);
  }

  const [song, setSong] = useState('');
  const [phase, setPhase] = useState(songMatters ? 'song' : 'type');

  // Phase 1: select song (only when it matters)
  if (phase === 'song') {
    return (
      <Modal title={`${artist.toUpperCase()} PLAYED`} onClose={onClose}>
        <Mono size={10} color={C.silver} className="block" style={{ marginBottom: 10, lineHeight: 1.5 }}>
          {isBonusArtist && (
            <>BONUS SONG IS <span style={{ color: C.amber, fontWeight: 700 }}>"{bonus.song}"</span>.{' '}</>
          )}
          WHICH SONG PLAYED?
        </Mono>
        <div className="space-y-1.5 mb-3" style={{ maxHeight: 210, overflowY: 'auto' }}>
          {suggestions.map(s => {
            const isBonusMatch = isBonusArtist && normalizeText(s) === normalizeText(bonus.song);
            return (
              <button key={s} onClick={() => setSong(s) || setPhase('type')} style={{
                width: '100%', padding: '10px 12px',
                background: isBonusMatch ? `${C.amber}33` : C.darker,
                border: `2px solid ${isBonusMatch ? C.amber : C.border}`,
                color: C.text,
                fontFamily: '"Oswald", sans-serif', fontWeight: 600, fontSize: 13,
                letterSpacing: '0.04em', textAlign: 'left',
                cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>{s}</span>
                {isBonusMatch && <Mono size={9} color={C.amber} style={{ fontWeight: 700 }}>BONUS</Mono>}
              </button>
            );
          })}
        </div>
        <input
          value={song}
          onChange={e => setSong(e.target.value)}
          placeholder="OR TYPE SONG TITLE"
          maxLength={40}
          style={{ ...inputStyle, fontSize: 13, padding: '10px 12px', marginBottom: 8 }}
        />
        <div className="space-y-2">
          <Btn onClick={() => setPhase('type')} disabled={!song.trim()} variant="primary">
            CONTINUE
          </Btn>
          <Btn onClick={() => { setSong(''); setPhase('type'); }} variant="ghost" size="md">
            SKIP — DON'T KNOW THE SONG
          </Btn>
        </div>
      </Modal>
    );
  }

  // Phase 2: regular play vs walk-off
  return (
    <Modal title={`${artist.toUpperCase()}${song ? ` — "${song}"` : ''}`} onClose={onClose}>
      <Mono size={11} color={C.silver} className="block" style={{ marginBottom: 14 }}>
        {game.players[playerIdx].name} — HOW DID IT HIT?
      </Mono>
      <div className="space-y-2">
        <Btn onClick={() => onSubmit('play', song || null)} variant="primary">
          REGULAR PLAY · +1
        </Btn>
        <Btn onClick={() => onSubmit('walkoff', song || null)} variant="amber">
          WALK-OFF · +1 +2 BONUS
        </Btn>
        <Mono size={9} color={C.textDim} className="block text-center" style={{ marginTop: 4, lineHeight: 1.4 }}>
          WALK-OFF: RADIO TURNED ON + ARTIST ALREADY PLAYING,<br />OR FIRST SONG AFTER COMMERCIAL
        </Mono>
      </div>
    </Modal>
  );
}

function ShotCallModal({ player, playerIdx, forcedLevel, isCounter, drafts, allArtists, addCustomArtist, customSongs, onAddCustomSong, onClose, onSubmit }) {
  const [level, setLevel] = useState(forcedLevel || null);
  const [predictedArtist, setPredictedArtist] = useState(null);
  const [predictedSong, setPredictedSong] = useState(null);
  const [artistSearch, setArtistSearch] = useState('');
  const [songInput, setSongInput] = useState('');

  // V12.20: defensive — if forcedLevel changes after mount (e.g. modal
  // re-used between proactive call and counter), force level to match.
  // useState only respects forcedLevel on first mount; this useEffect
  // keeps it in sync. Without this, a stale level could persist if the
  // same modal instance handled two different shot calls.
  useEffect(() => {
    if (forcedLevel && level !== forcedLevel) {
      setLevel(forcedLevel);
      setPredictedArtist(null);
      setPredictedSong(null);
    }
  }, [forcedLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const title = isCounter
    ? `${player.name} • FORCED COUNTER — ${SHOT_LABEL[forcedLevel] || '?'} CALL`
    : `${player.name} SHOT CALL`;

  if (!level) {
    return (
      <Modal title={title} onClose={onClose} dismissible={!isCounter}>
        <Mono size={10} color={C.silver} className="block" style={{ marginBottom: 12, lineHeight: 1.5 }}>
          CALL YOUR SHOT BEFORE THE NEXT SONG. OPPONENT MUST COUNTER ONE LEVEL HARDER.
        </Mono>
        <div className="space-y-2">
          {SHOT_LEVELS.map(lv => (
            <Btn key={lv} onClick={() => setLevel(lv)} variant="secondary" size="md">
              <span className="flex justify-between items-center">
                <span>{SHOT_LABEL[lv]} CALL</span>
                <Mono size={12} color={C.amber} style={{ fontWeight: 700 }}>+{SHOT_POINTS[lv]}</Mono>
              </span>
            </Btn>
          ))}
        </div>
        <Mono size={9} color={C.textDim} className="block" style={{ marginTop: 10, lineHeight: 1.5, textAlign: 'center' }}>
          TEAM = ANY OF YOUR DRAFTED ARTISTS · ARTIST = EXACT ARTIST · SONG = EXACT SONG (HONOR SYSTEM)
        </Mono>
      </Modal>
    );
  }

  // Step: pick artist (Artist call submits here; Song call moves to song step)
  if (level !== 'team' && !predictedArtist) {
    // V12.1: Shot calls target YOUR OWN drafted artists. The artist
    // picker is restricted to the caller's roster — no global pool,
    // no "add new" affordance. Search still works within the roster.
    const ownRoster = drafts || [];
    const searchNorm = normalizeText(artistSearch);
    const filtered = artistSearch
      ? ownRoster.filter(a => a.toLowerCase().includes(artistSearch.toLowerCase()))
      : ownRoster;
    return (
      <Modal title={title} onClose={onClose} dismissible={!isCounter}>
        <div style={{ padding: 10, background: `${C.amber}22`, border: `2px solid ${C.amber}`, marginBottom: 10 }}>
          <Stencil size={13} color={C.amber} tracking="0.1em" style={{ display: 'block' }}>
            {SHOT_LABEL[level]} CALL · +{SHOT_POINTS[level]}
          </Stencil>
          <Mono size={9} color="#fff" style={{ marginTop: 3, display: 'block', lineHeight: 1.4 }}>
            {level === 'song'
              ? 'STEP 1 OF 2 — PICK THE ARTIST. NEXT YOU\'LL PICK ONE OF THEIR SONGS.'
              : 'PICK ONE OF YOUR DRAFTED ARTISTS.'}
          </Mono>
        </div>
        {ownRoster.length > 4 && (
          <input value={artistSearch} onChange={e => setArtistSearch(e.target.value)} placeholder="SEARCH YOUR ROSTER…"
            style={{ ...inputStyle, fontSize: 13, marginBottom: 8 }} />
        )}
        <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 12 }} className="scrollbar-hide">
          {ownRoster.length === 0 ? (
            <Mono size={10} color={C.textDim} style={{ textAlign: 'center', padding: 24, display: 'block', letterSpacing: '0.15em' }}>
              NO ARTISTS DRAFTED YET — DRAFT BEFORE CALLING A SHOT
            </Mono>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {filtered.map(a => (
                <button key={a} onClick={() => setPredictedArtist(a)} style={{
                  padding: '8px 6px', background: C.darker,
                  border: `2px solid ${C.border}`, color: C.text,
                  fontFamily: '"Oswald", sans-serif', fontWeight: 600, fontSize: 11,
                  letterSpacing: '0.03em', textTransform: 'uppercase',
                  cursor: 'pointer', minHeight: 36, textAlign: 'left',
                }}>{a}</button>
              ))}
            </div>
          )}
        </div>
        {!isCounter && <Btn onClick={() => { setLevel(null); }} variant="ghost" size="md">BACK</Btn>}
      </Modal>
    );
  }

  // Step: pick song (Song level only)
  if (level === 'song' && predictedArtist && !predictedSong) {
    const catalogSongs = [
      ...(ARTIST_SONG_CATALOG[predictedArtist] || []),
      ...((customSongs?.[predictedArtist]) || []),
    ];
    const seen = new Set();
    const deduped = catalogSongs.filter(s => {
      const k = normalizeText(s);
      if (seen.has(k)) return false; seen.add(k); return true;
    });
    return (
      <Modal title={title} onClose={onClose} dismissible={!isCounter}>
        <div style={{ padding: 10, background: `${C.amber}22`, border: `2px solid ${C.amber}`, marginBottom: 10 }}>
          <Stencil size={13} color={C.amber} tracking="0.1em" style={{ display: 'block' }}>
            SONG CALL · {predictedArtist.toUpperCase()} · +{SHOT_POINTS.song}
          </Stencil>
          <Mono size={9} color="#fff" style={{ marginTop: 3, display: 'block', lineHeight: 1.4 }}>
            STEP 2 OF 2 — PICK THE EXACT SONG.
          </Mono>
        </div>
        {deduped.length > 0 && (
          <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 10 }} className="scrollbar-hide">
            <div className="space-y-1.5">
              {deduped.map(s => (
                <button key={s} onClick={() => setPredictedSong(s)} style={{
                  width: '100%', padding: '9px 11px',
                  background: C.darker, border: `2px solid ${C.border}`, color: C.text,
                  fontFamily: '"Oswald", sans-serif', fontWeight: 600, fontSize: 12,
                  letterSpacing: '0.03em', textAlign: 'left', cursor: 'pointer',
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        <input
          value={songInput}
          onChange={e => setSongInput(e.target.value)}
          placeholder="OR TYPE CUSTOM SONG TITLE"
          maxLength={40}
          style={{ ...inputStyle, fontSize: 13, padding: '10px 12px', marginBottom: 8 }}
        />
        <div className="space-y-2">
          <Btn
            onClick={() => {
              const finalSong = songInput.trim() || null;
              if (finalSong && !deduped.some(s => normalizeText(s) === normalizeText(finalSong))) {
                onAddCustomSong && onAddCustomSong(predictedArtist, finalSong);
              }
              if (finalSong) setPredictedSong(finalSong);
            }}
            disabled={!songInput.trim()}
            variant="primary"
          >
            USE CUSTOM
          </Btn>
          <Btn onClick={() => setPredictedArtist(null)} variant="ghost" size="md">BACK</Btn>
        </div>
      </Modal>
    );
  }

  // Final confirm step (Team always lands here directly; Artist/Song after their picks)
  return (
    <Modal title={title} onClose={onClose} dismissible={!isCounter}>
      <div style={{ padding: 12, background: `${C.amber}22`, border: `2px solid ${C.amber}`, marginBottom: 12 }}>
        <Stencil size={14} color={C.amber} tracking="0.1em" style={{ display: 'block', marginBottom: 4 }}>
          {SHOT_LABEL[level]} CALL · +{SHOT_POINTS[level]}
        </Stencil>
        <Mono size={10} color="#fff" style={{ lineHeight: 1.5 }}>
          {level === 'team' && 'HITS IF ANY OF YOUR DRAFTED ARTISTS PLAYS NEXT.'}
          {level === 'artist' && `HITS IF ${predictedArtist?.toUpperCase()} PLAYS NEXT.`}
          {level === 'song' && (
            <>HITS IF <span style={{ color: C.amber }}>{predictedArtist?.toUpperCase()}</span> — <span style={{ color: C.amber }}>"{predictedSong}"</span> PLAYS NEXT.</>
          )}
        </Mono>
      </div>
      <div className="space-y-2">
        <Btn
          onClick={() => {
            if (level === 'team') onSubmit('team', null, null);
            else if (level === 'artist') onSubmit('artist', predictedArtist, null);
            else onSubmit('song', predictedArtist, predictedSong);
          }}
          disabled={
            (level === 'artist' && !predictedArtist) ||
            (level === 'song' && (!predictedArtist || !predictedSong))
          }
          variant="primary"
        >LOCK IT IN</Btn>
        {!isCounter && (
          <Btn onClick={() => {
            if (level === 'song' && predictedSong) setPredictedSong(null);
            else if (level !== 'team') setPredictedArtist(null);
            else setLevel(null);
          }} variant="ghost" size="md">BACK</Btn>
        )}
      </div>
    </Modal>
  );
}

function BonusSongModal({ player, drafts, customSongs, onAddCustomSong, onSelect }) {
  const [pickedArtist, setPickedArtist] = useState(null);
  const [songInput, setSongInput] = useState('');

  // For the picked artist: predefined + previously-saved custom songs
  const artistSongs = pickedArtist
    ? [
        ...(ARTIST_SONG_CATALOG[pickedArtist] || []),
        ...((customSongs?.[pickedArtist]) || []),
      ]
    : [];
  // Dedupe (case-insensitive)
  const seen = new Set();
  const dedupedSongs = artistSongs.filter(s => {
    const k = normalizeText(s);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const submit = (song, customSong) => {
    if (customSong && pickedArtist && song) {
      onAddCustomSong(pickedArtist, song);
    }
    onSelect({ artist: pickedArtist, song, customSong: !!customSong });
  };

  if (!pickedArtist) {
    return (
      <Modal title={`${player.name} — BONUS SONG`} dismissible={false}>
        <Mono size={10} color={C.silver} className="block" style={{ marginBottom: 12, lineHeight: 1.5 }}>
          STEP 1 OF 2 — PICK YOUR BONUS ARTIST.
        </Mono>
        <div className="space-y-2">
          {drafts.map(artist => (
            <button key={artist} onClick={() => setPickedArtist(artist)} style={{
              width: '100%', padding: '13px 14px',
              background: C.darker, border: `2px solid ${C.amber}`, color: C.text,
              fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 14,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Award size={16} style={{ color: C.amber }} />{artist}
            </button>
          ))}
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`${player.name} — PICK THE SONG`} dismissible={false}>
      <div style={{
        padding: 10, background: `${C.amber}22`, border: `2px solid ${C.amber}`, marginBottom: 12,
      }}>
        <Stencil size={13} color={C.amber} tracking="0.1em" style={{ display: 'block' }}>
          {pickedArtist.toUpperCase()}
        </Stencil>
        <Mono size={9} color="#fff" style={{ marginTop: 3, display: 'block', lineHeight: 1.4 }}>
          STEP 2 OF 2 — PICK A SONG OR ENTER A CUSTOM ONE.
          BONUS PAYS +2 EVERY TIME THIS EXACT SONG PLAYS.
        </Mono>
      </div>

      {dedupedSongs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Mono size={9} color={C.silver} className="block" style={{ marginBottom: 6, letterSpacing: '0.2em' }}>
            POPULAR
          </Mono>
          <div className="space-y-1.5">
            {dedupedSongs.map(s => (
              <button key={s} onClick={() => submit(s, false)} style={{
                width: '100%', padding: '10px 12px',
                background: C.darker, border: `2px solid ${C.border}`,
                color: C.text,
                fontFamily: '"Oswald", sans-serif', fontWeight: 600, fontSize: 13,
                letterSpacing: '0.04em', textAlign: 'left',
                cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>{s}</span>
                <Mono size={9} color={C.amber}>+2</Mono>
              </button>
            ))}
          </div>
        </div>
      )}

      <Mono size={9} color={C.silver} className="block" style={{ marginBottom: 6, letterSpacing: '0.2em' }}>
        OR CUSTOM SONG
      </Mono>
      <div className="flex gap-2 mb-2">
        <input
          value={songInput}
          onChange={e => setSongInput(e.target.value)}
          placeholder="SONG TITLE"
          maxLength={40}
          style={{
            ...inputStyle, fontSize: 14, padding: '11px 12px', flex: 1,
          }}
        />
      </div>
      <div className="space-y-2">
        <Btn
          onClick={() => songInput.trim() && submit(songInput.trim(), true)}
          disabled={!songInput.trim()}
          variant="primary"
        >
          USE CUSTOM SONG
        </Btn>
        <Btn onClick={() => setPickedArtist(null)} variant="ghost" size="md">BACK</Btn>
      </div>
    </Modal>
  );
}

function EndDayModal({ game, onClose, onEndDay, onSkip }) {
  const ds = game.currentDayState;
  const tied = ds.scores[0] === ds.scores[1];
  const [halfPick, setHalfPick] = useState(null);

  return (
    <Modal title="END THE DAY" onClose={onClose}>
      <Mono size={10} color={C.silver} className="block" style={{ marginBottom: 12, lineHeight: 1.5 }}>
        FINAL: {game.players[0].name} {ds.scores[0]} — {game.players[1].name} {ds.scores[1]}
      </Mono>
      {tied && (
        <div style={{ background: `${C.amber}22`, border: `2px solid ${C.amber}`, padding: 11, marginBottom: 12 }}>
          <Stencil size={13} color={C.amber} tracking="0.1em" style={{ display: 'block', marginBottom: 6 }}>TIED — HALF POINT RULE</Stencil>
          <Mono size={10} color="#fff" className="block" style={{ marginBottom: 8 }}>WHO SCORED THE LAST SONG?</Mono>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map(idx => (
              <button key={idx} onClick={() => setHalfPick(idx)} style={{
                padding: '9px 6px',
                background: halfPick === idx ? (idx === 0 ? C.green : C.silver) : C.darker,
                border: `2px solid ${idx === 0 ? C.green : C.silver}`,
                color: halfPick === idx ? C.darker : '#fff',
                fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 13,
                letterSpacing: '0.08em', cursor: 'pointer',
              }}>{game.players[idx].name}</button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Btn onClick={() => onEndDay(tied ? halfPick : null)} disabled={tied && halfPick === null} variant="primary">CONFIRM END DAY</Btn>
        {onSkip && (
          <Btn onClick={onSkip} variant="ghost" size="md">
            <span className="inline-flex items-center gap-2">
              SKIP — NO WINNER
            </span>
          </Btn>
        )}
        <Btn onClick={onClose} variant="ghost" size="md">KEEP PLAYING</Btn>
      </div>
    </Modal>
  );
}

// ============================================================
// TRIPLE
// ============================================================

function TripleScreenAnim() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: C.green, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Stencil size={48} color="#fff" tracking="0.1em" style={{ textShadow: `4px 4px 0 ${C.darker}` }} className="flicker">
        WORK IS OVER
      </Stencil>
    </div>
  );
}

function TripleScreen({ game, winner, setScreen }) {
  const [flash, setFlash] = useState(true);
  useEffect(() => {
    const i = setInterval(() => setFlash(f => !f), 380);
    return () => clearInterval(i);
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: flash ? C.green : C.blue,
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 18, textAlign: 'center', transition: 'background 0.1s',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><Hazard thickness={12} /></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}><Hazard thickness={12} /></div>
      <div style={{ animation: 'tripleScreen 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <Beer size={72} style={{ color: C.text, margin: '0 auto 14px', filter: `drop-shadow(0 0 24px ${C.amber})` }} />
        <Stencil size={42} color="#fff" style={{
          display: 'block', lineHeight: 1, letterSpacing: '-0.02em',
          textShadow: `4px 4px 0 ${C.darker}, 0 0 30px ${C.amber}`,
        }}>WORK IS</Stencil>
        <Stencil size={72} color={C.amber} style={{
          display: 'block', lineHeight: 0.95, letterSpacing: '-0.03em', marginTop: 4,
          textShadow: `4px 4px 0 ${C.darker}, 0 0 40px ${C.amber}`,
        }}>OVER.</Stencil>
        <div style={{ margin: '20px auto', maxWidth: 280 }}><Hazard thickness={6} /></div>
        <Stencil size={22} color="#fff" tracking="0.06em" style={{ display: 'block', lineHeight: 1.15 }}>GO DRINK BEER</Stencil>
        <Stencil size={22} color="#fff" tracking="0.06em" style={{ display: 'block', lineHeight: 1.15 }}>AND PLAY</Stencil>
        <Stencil size={36} color={C.amber} tracking="0.04em" style={{
          display: 'block', lineHeight: 1.1, marginTop: 4,
          textShadow: `3px 3px 0 ${C.darker}`,
        }}>GOLDEN TEE.</Stencil>
        <div style={{ marginTop: 24, padding: '12px 18px', background: C.darker, border: `3px solid ${C.amber}`, display: 'inline-block' }}>
          <Stencil size={11} color={C.silver} tracking="0.3em" style={{ display: 'block' }}>3 IN A ROW</Stencil>
          <Stencil size={26} color={C.amber} tracking="0.05em" style={{ display: 'block', marginTop: 4 }}>
            {game.players[winner].name} TAKES THE DAY
          </Stencil>
        </div>
        <div style={{ marginTop: 28, maxWidth: 280, margin: '28px auto 0' }}>
          <Btn onClick={() => setScreen('endDay')} variant="dark">VIEW THE CARNAGE</Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// END DAY
// ============================================================

function EndDay({ game, dispatch, setScreen, resetGame }) {
  const ds = game.currentDayState;
  const winnerIdx = ds.winner;
  // V12.8: winnerIdx is null when the day was skipped (no winner declared).
  const winner = winnerIdx === 0 || winnerIdx === 1 ? game.players[winnerIdx] : null;
  const weekDone = game.currentDay >= 5 || game.players.some(p => p.weeklyWins >= 3);
  // V12.8: weekly champion is genuinely null when wins are tied — the
  // week ended in a draw. Old logic defaulted to player 1 on a 2-2
  // (because 0 > 0 is false), which silently crowned the wrong player.
  const w0 = game.players[0].weeklyWins;
  const w1 = game.players[1].weeklyWins;
  const weeklyChamp = !weekDone ? null
    : w0 > w1 ? 0
    : w1 > w0 ? 1
    : null; // tied → no champion
  const weekTied = weekDone && w0 === w1;

  return (
    <div className="px-5 py-6 pb-24">
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <Stencil size={12} color={C.silver} tracking="0.3em" style={{ display: 'block' }}>DAY {game.currentDay} RESULT</Stencil>
        <div className="my-3"><TrimBar accent="amber" thickness={6} /></div>
        {winner ? (
          <>
            <Stencil size={52} color={winnerIdx === 0 ? C.green : '#fff'} style={{
              display: 'block', lineHeight: 1,
              textShadow: `3px 3px 0 ${C.darker}, 0 0 30px ${winnerIdx === 0 ? C.green : C.silver}88`,
            }}>{winner.name}</Stencil>
            <Stencil size={20} tracking="0.2em" style={{ marginTop: 4, display: 'block' }}>WINS THE DAY</Stencil>
          </>
        ) : (
          <>
            <Stencil size={36} color={C.amber} style={{ display: 'block', lineHeight: 1 }}>
              SKIPPED
            </Stencil>
            <Stencil size={14} color={C.silver} tracking="0.2em" style={{ marginTop: 6, display: 'block' }}>
              NO WINNER DECLARED
            </Stencil>
          </>
        )}
        {ds.dayEndedByTriple !== null && (
          <div className="mt-3 inline-flex items-center gap-2" style={{
            padding: '6px 12px', background: `${C.amber}22`, border: `2px solid ${C.amber}`,
          }}>
            <Beer size={14} style={{ color: C.amber }} />
            <Stencil size={11} color={C.amber} tracking="0.15em">3 IN A ROW — DAY ENDED EARLY</Stencil>
          </div>
        )}
      </div>

      <div style={{ background: C.card, border: `2px solid ${C.border}`, padding: 14, marginBottom: 14 }}>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map(idx => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <Stencil size={11} color={idx === 0 ? C.green : C.silver} tracking="0.15em" style={{ display: 'block' }}>
                {game.players[idx].name}
              </Stencil>
              <div style={{
                fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 52,
                color: idx === winnerIdx ? '#fff' : C.silver,
                lineHeight: 1, margin: '4px 0', fontVariantNumeric: 'tabular-nums',
              }}>
                {ds.scores[idx]}
                {ds.halfPoint[idx] && <span style={{ fontSize: 22, color: C.amber }}>½</span>}
              </div>
              <Mono size={10} color={C.silver}>WK WINS: {game.players[idx].weeklyWins}</Mono>
            </div>
          ))}
        </div>
      </div>

      {ds.playedToday.length > 0 && (
        <>
          <SectionDivider accent={C.red}>ELIMINATED FROM FUTURE DRAFTS</SectionDivider>
          <div style={{ background: C.darker, border: `1px solid ${C.red}44`, padding: 10, marginBottom: 14 }}>
            <Mono size={10} color="#fff" style={{ lineHeight: 1.6, letterSpacing: '0.04em' }}>
              {ds.playedToday.map(a => a.toUpperCase()).join(' · ')}
            </Mono>
          </div>
        </>
      )}

      <SectionDivider>DAILY RECAP</SectionDivider>
      <div style={{ background: C.darker, border: `2px solid ${C.border}`, padding: 12, marginBottom: 14 }}>
        <RecapRow label="TOTAL EVENTS" value={ds.events.filter(e => !e.meta).length} />
        <RecapRow label="UNIQUE ARTISTS PLAYED" value={ds.playedToday.length} />
        {ds.fiveForFiveAwarded?.[0] && (
          <RecapRow label={`${game.players[0].name} 5-FOR-5`} value={`+${Math.max(1, Math.min(5, game.currentDay))}`} />
        )}
        {ds.fiveForFiveAwarded?.[1] && (
          <RecapRow label={`${game.players[1].name} 5-FOR-5`} value={`+${Math.max(1, Math.min(5, game.currentDay))}`} />
        )}
        {ds.bonusSongPlayCount?.[0] > 0 && (
          <RecapRow label={`${game.players[0].name} BONUS SONG HITS`} value={`×${ds.bonusSongPlayCount[0]}`} />
        )}
        {ds.bonusSongPlayCount?.[1] > 0 && (
          <RecapRow label={`${game.players[1].name} BONUS SONG HITS`} value={`×${ds.bonusSongPlayCount[1]}`} />
        )}
        <RecapRow label={`${game.players[0].name} POWER-UPS USED`} value={3 - ds.blocks[0] - ds.steals[0] - ds.shotCalls[0]} />
        <RecapRow label={`${game.players[1].name} POWER-UPS USED`} value={3 - ds.blocks[1] - ds.steals[1] - ds.shotCalls[1]} />
      </div>

      {ds.events.filter(e => e.totalPoints >= 3).length > 0 && (
        <>
          <SectionDivider>NOTABLE PLAYS</SectionDivider>
          <div className="space-y-1 mb-4">
            {ds.events.filter(e => e.totalPoints >= 3).slice(0, 5).map(e => (
              <div key={e.id} style={{
                padding: '8px 10px', background: C.darker,
                borderLeft: `3px solid ${e.effectivePlayer === 0 ? C.green : C.silver}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              }}>
                <Mono size={10} color="#fff" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {game.players[e.effectivePlayer].name} • {e.parts.join(' ')}
                </Mono>
                <Stencil size={16} color={C.amber}>+{e.totalPoints}</Stencil>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="space-y-2.5 mt-5">
        {!weekDone && (
          <Btn onClick={() => { dispatch({ type: 'ADVANCE_DAY' }); setScreen('draft'); }} variant="primary">
            <span className="inline-flex items-center gap-2">ADVANCE TO DAY {game.currentDay + 1} <ArrowRight size={18} /></span>
          </Btn>
        )}
        {weekDone && (
          <>
            {weeklyChamp !== null ? (
              <div style={{ padding: 14, background: `${C.amber}22`, border: `2px solid ${C.amber}`, textAlign: 'center' }}>
                <Trophy size={28} style={{ color: C.amber, margin: '0 auto 6px', display: 'block' }} />
                <Stencil size={14} color={C.amber} tracking="0.15em" style={{ display: 'block' }}>WEEKLY CHAMPION</Stencil>
                <Stencil size={28} tracking="0.05em" style={{ display: 'block', marginTop: 4 }}>{game.players[weeklyChamp].name}</Stencil>
                <Mono size={10} color={C.silver} className="block" style={{ marginTop: 8 }}>
                  {game.players[1 - weeklyChamp].name} BUYS FIRST ROUND
                </Mono>
              </div>
            ) : weekTied ? (
              // V12.8: a tied week (e.g. 2-2 with one day skipped) is a
              // genuine draw — no champion, no winner declared.
              <div style={{ padding: 14, background: C.card, border: `2px solid ${C.border}`, textAlign: 'center' }}>
                <Stencil size={14} color={C.silver} tracking="0.2em" style={{ display: 'block', marginBottom: 6 }}>
                  WEEK ENDS
                </Stencil>
                <Stencil size={28} color={C.amber} tracking="0.05em" style={{ display: 'block' }}>
                  {w0}–{w1} TIE
                </Stencil>
                <Mono size={10} color={C.silver} className="block" style={{ marginTop: 8, letterSpacing: '0.15em' }}>
                  NO CHAMPION — SETTLE IT ON THE NEXT WEEK
                </Mono>
              </div>
            ) : (
              // All days skipped — no champion at all
              <div style={{ padding: 14, background: C.card, border: `2px solid ${C.border}`, textAlign: 'center' }}>
                <Stencil size={14} color={C.silver} tracking="0.2em" style={{ display: 'block' }}>
                  WEEK ENDS — NO CHAMPION
                </Stencil>
              </div>
            )}
            <Btn onClick={() => setScreen('weekRecap')} variant="amber">
              <span className="inline-flex items-center gap-2"><Trophy size={18} /> VIEW WEEKLY RECAP <ArrowRight size={18} /></span>
            </Btn>
          </>
        )}
        <Btn onClick={() => setScreen('dashboard')} variant="ghost" size="md">BACK TO DASHBOARD</Btn>
      </div>
    </div>
  );
}

function RecapRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px dashed ${C.border}` }}>
      <Mono size={10} color={C.silver} style={{ letterSpacing: '0.1em' }}>{label}</Mono>
      <Stencil size={13}>{value}</Stencil>
    </div>
  );
}

// ============================================================
// V12.21: PROFILES SCREEN
// ============================================================
// Lists every local profile. The active one is highlighted. Each row
// shows name, member-since, and quick stats. Tap a row to make it
// active. Each row has a kebab-style edit affordance for rename and
// delete (delete confirmed via modal). At the bottom: ADD PROFILE form.
function ProfilesScreen({ profiles, activeProfileId, onCreate, onRename, onDelete, onSetActive, setScreen }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdd = () => {
    const id = onCreate(newName);
    if (id) {
      // If this is the first profile, set it active automatically.
      if (profiles.length === 0) onSetActive(id);
      setNewName('');
      setAdding(false);
    }
  };

  const handleSaveRename = () => {
    if (renamingId && renameDraft.trim()) {
      onRename(renamingId, renameDraft);
    }
    setRenamingId(null);
    setRenameDraft('');
  };

  return (
    <div className="px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setScreen('landing')} style={iconBtn}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <Stencil size={18} tracking="0.2em">PROFILES</Stencil>
        <div style={{ width: 28 }} />
      </div>
      <TrimBar accent="silver" thickness={8} className="mb-4" />

      <Mono size={9} color={C.silver} style={{
        letterSpacing: '0.15em', display: 'block', marginBottom: 12, lineHeight: 1.5,
      }}>
        EACH PROFILE TRACKS ITS OWN CAREER STATS. SWITCH PROFILES TO VIEW DIFFERENT HISTORIES.
        TAP A PROFILE TO MAKE IT ACTIVE.
      </Mono>

      {/* Profile list */}
      {profiles.length === 0 ? (
        <div style={{
          padding: 18, textAlign: 'center',
          background: C.darker, border: `1px dashed ${C.border}`,
          marginBottom: 14,
        }}>
          <Mono size={10} color={C.textDim} style={{ letterSpacing: '0.15em' }}>
            NO PROFILES YET — ADD ONE BELOW
          </Mono>
        </div>
      ) : (
        <div className="space-y-2" style={{ marginBottom: 14 }}>
          {profiles.map(p => {
            const isActive = p.id === activeProfileId;
            const deriv = profileEngine.derive(p);
            const isRenaming = renamingId === p.id;
            return (
              <div key={p.id} style={{
                background: isActive ? `${C.green}22` : C.card,
                border: `2px solid ${isActive ? C.green : C.border}`,
                padding: 11,
              }}>
                {isRenaming ? (
                  <div>
                    <input
                      type="text"
                      value={renameDraft}
                      onChange={e => setRenameDraft(e.target.value)}
                      autoFocus
                      style={{
                        ...inputStyle, fontSize: 14, padding: '8px 10px', marginBottom: 8,
                      }}
                      maxLength={24}
                    />
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={handleSaveRename} style={poolActionBtnText(C.green)}>
                        SAVE
                      </button>
                      <button onClick={() => { setRenamingId(null); setRenameDraft(''); }} style={poolActionBtnText(C.silver)}>
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onSetActive(p.id)}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        textAlign: 'left', color: 'inherit', cursor: 'pointer', padding: 0,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <User size={14} style={{ color: isActive ? C.green : C.silver }} />
                        <Stencil size={16} color={isActive ? C.green : '#fff'} tracking="0.05em" style={{ flex: 1 }}>
                          {p.name}
                        </Stencil>
                        {isActive && (
                          <Mono size={8} color={C.green} style={{ letterSpacing: '0.25em', fontWeight: 700 }}>
                            ACTIVE
                          </Mono>
                        )}
                        {p.isLegacy && !isActive && (
                          <Mono size={8} color={C.amber} style={{ letterSpacing: '0.25em', fontWeight: 700 }}>
                            LEGACY
                          </Mono>
                        )}
                      </div>
                      {/* Compact stat strip */}
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
                        <Mono size={9} color={C.textDim} style={{ letterSpacing: '0.1em' }}>
                          <span style={{ color: '#fff', fontWeight: 700 }}>{deriv.weeksWon}</span>
                          {' '}WK · <span style={{ color: '#fff', fontWeight: 700 }}>{deriv.daysWon}</span>
                          {' '}DAYS{deriv.dayWinPct !== null && <> · <span style={{ color: C.amber, fontWeight: 700 }}>{deriv.dayWinPct}%</span></>}
                        </Mono>
                        {deriv.longestDayWinStreak > 0 && (
                          <Mono size={9} color={C.textDim} style={{ letterSpacing: '0.1em' }}>
                            BEST <span style={{ color: C.amber, fontWeight: 700 }}>{deriv.longestDayWinStreak}</span> STREAK
                          </Mono>
                        )}
                      </div>
                      <Mono size={8} color={C.textDim} style={{
                        letterSpacing: '0.1em', display: 'block', marginTop: 4,
                      }}>
                        MEMBER SINCE {new Date(p.createdAt).toLocaleDateString()}
                      </Mono>
                    </button>
                    {/* Row actions */}
                    <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameDraft(p.name);
                          setRenamingId(p.id);
                        }}
                        style={poolActionBtnText(C.blueLight)}
                      >
                        RENAME
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(p); }}
                        style={poolActionBtnText(C.red)}
                      >
                        DELETE
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add profile */}
      {adding ? (
        <div style={{
          padding: 11, background: C.card, border: `2px solid ${C.blueLight}`,
        }}>
          <Mono size={9} color={C.blueLight} style={{
            letterSpacing: '0.2em', display: 'block', marginBottom: 6, fontWeight: 700,
          }}>
            NEW PROFILE
          </Mono>
          <input
            type="text"
            placeholder="PLAYER NAME"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
            maxLength={24}
            style={{ ...inputStyle, fontSize: 14, padding: '8px 10px', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 5 }}>
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              style={{
                ...poolActionBtnText(C.green),
                opacity: newName.trim() ? 1 : 0.4,
                cursor: newName.trim() ? 'pointer' : 'not-allowed',
              }}
            >ADD</button>
            <button onClick={() => { setAdding(false); setNewName(''); }} style={poolActionBtnText(C.silver)}>
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <Btn onClick={() => setAdding(true)} variant="secondary">
          <span className="inline-flex items-center gap-2"><Plus size={16} /> ADD PROFILE</span>
        </Btn>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal title="DELETE PROFILE?" onClose={() => setConfirmDelete(null)} dismissible={true}>
          <div style={{ padding: 12 }}>
            <Mono size={10} color="#fff" style={{ lineHeight: 1.5, display: 'block', marginBottom: 10 }}>
              Delete <span style={{ color: C.amber, fontWeight: 700 }}>{confirmDelete.name}</span>?
              All career stats, badges, and history for this profile will be erased.
              Games already played won't change, but they won't update any profile going forward.
            </Mono>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn
                onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null); }}
                variant="danger"
              >
                DELETE
              </Btn>
              <Btn onClick={() => setConfirmDelete(null)} variant="ghost">CANCEL</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Profile detail / extended stats — only when an active profile is selected */}
      {activeProfileId && profiles.find(p => p.id === activeProfileId) && (
        <ActiveProfileDetail
          profile={profiles.find(p => p.id === activeProfileId)}
          allProfiles={profiles}
        />
      )}
    </div>
  );
}

// V12.21: extended stats display for the active profile.
function ActiveProfileDetail({ profile, allProfiles }) {
  const d = profileEngine.derive(profile);
  const h2h = profileEngine.headToHeadList(profile, allProfiles);
  const ps = profileEngine.perStationList(profile);
  return (
    <div style={{ marginTop: 18 }}>
      <SectionDivider>CAREER · {profile.name}</SectionDivider>

      {/* Headline numbers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10,
      }}>
        <ProfileStatCell label="WEEKS WON" value={d.weeksWon} accent={C.amber} />
        <ProfileStatCell label="DAYS WON" value={d.daysWon} accent={C.green} />
        <ProfileStatCell label="DAY WIN %" value={d.dayWinPct !== null ? `${d.dayWinPct}%` : '—'} accent={C.silver} />
        <ProfileStatCell label="WEEKS PLAYED" value={d.weeksPlayed} />
        <ProfileStatCell label="DAYS PLAYED" value={d.daysPlayed} />
        <ProfileStatCell label="AVG/DAY" value={d.avgDailyPoints !== null ? d.avgDailyPoints : '—'} accent={C.amber} />
        <ProfileStatCell label="CURR WIN" value={d.currentDayWinStreak} accent={d.currentDayWinStreak > 0 ? C.green : C.silver} />
        <ProfileStatCell label="LONGEST" value={d.longestDayWinStreak} accent={C.amber} />
        <ProfileStatCell label="WORST" value={d.longestDayLossStreak} accent={d.longestDayLossStreak > 0 ? C.red : C.silver} />
      </div>

      {/* Head-to-head */}
      {h2h.length > 0 && (
        <>
          <SectionDivider>HEAD-TO-HEAD</SectionDivider>
          <div className="space-y-1.5" style={{ marginBottom: 10 }}>
            {h2h.map(rec => {
              const winning = rec.wins > rec.losses;
              return (
                <div key={rec.opponentId} style={{
                  padding: '7px 10px', background: C.card,
                  border: `2px solid ${C.border}`,
                  borderLeft: `5px solid ${winning ? C.green : rec.wins < rec.losses ? C.red : C.silver}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                }}>
                  <Stencil size={12} color="#fff" tracking="0.04em">{rec.opponentName}</Stencil>
                  <Mono size={11} color={C.silver} style={{ letterSpacing: '0.1em' }}>
                    <span style={{ color: C.green, fontWeight: 700 }}>{rec.wins}</span>
                    {' – '}
                    <span style={{ color: C.red, fontWeight: 700 }}>{rec.losses}</span>
                  </Mono>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Per-station */}
      {ps.length > 0 && (
        <>
          <SectionDivider>BY STATION</SectionDivider>
          <div className="space-y-1.5" style={{ marginBottom: 10 }}>
            {ps.map(rec => (
              <div key={rec.stationId} style={{
                padding: '7px 10px', background: C.card,
                border: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <Stencil size={11} color="#fff" tracking="0.04em">{rec.stationName}</Stencil>
                <Mono size={10} color={C.silver} style={{ letterSpacing: '0.1em' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{rec.wins}</span>
                  /<span style={{ color: '#fff', fontWeight: 700 }}>{rec.games}</span>
                  {rec.winPct !== null && <> · <span style={{ color: C.amber, fontWeight: 700 }}>{rec.winPct}%</span></>}
                </Mono>
              </div>
            ))}
          </div>
        </>
      )}

      <Mono size={8} color={C.textDim} style={{
        letterSpacing: '0.15em', display: 'block', textAlign: 'center', marginTop: 14,
      }}>
        MEMBER SINCE {new Date(profile.createdAt).toLocaleDateString()}
        {profile.lastPlayedAt && (
          <> · LAST PLAYED {new Date(profile.lastPlayedAt).toLocaleDateString()}</>
        )}
      </Mono>
    </div>
  );
}

function ProfileStatCell({ label, value, accent }) {
  const color = accent || C.silver;
  return (
    <div style={{
      background: C.darker, border: `1px solid ${C.border}`,
      padding: '6px 4px', textAlign: 'center',
    }}>
      <Mono size={7} color={C.textDim} style={{ letterSpacing: '0.22em', display: 'block', marginBottom: 2, fontWeight: 700 }}>
        {label}
      </Mono>
      <Stencil size={16} color={color} style={{ fontVariantNumeric: 'tabular-nums', display: 'block', lineHeight: 1 }}>
        {value}
      </Stencil>
    </div>
  );
}

// ============================================================
// RULES
// ============================================================

function Rules({ setScreen, hasGame }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="px-4 py-5 pb-24">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setScreen(hasGame ? 'dashboard' : 'landing')} style={iconBtn}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <Stencil size={18} tracking="0.2em">THE RULEBOOK</Stencil>
        <div style={{ width: 20 }} />
      </div>
      <TrimBar accent="amber" thickness={8} className="mb-4" />
      <div style={{ padding: 12, background: `${C.blue}44`, border: `2px solid ${C.blue}`, marginBottom: 14 }}>
        <Stencil size={12} color={C.silver} tracking="0.15em" style={{ display: 'block', marginBottom: 5 }}>OFFICIAL RULES</Stencil>
        <Mono size={10} color="#fff" style={{ lineHeight: 1.6 }}>
          Two players. One radio. Five days. The Radio Draft is a live scorekeeping game played on the clock — when a drafted artist plays, you score. Honor system. The app keeps you honest.
        </Mono>
      </div>
      <div className="space-y-2">
        {RULES_SECTIONS.map((rule, i) => (
          <div key={i} style={{ background: C.card, border: `2px solid ${open === i ? C.green : C.border}` }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} style={{
              width: '100%', padding: '11px 13px', background: 'transparent', color: C.text,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', border: 'none',
            }}>
              <div className="flex items-center gap-3">
                <div style={{
                  width: 36, height: 36,
                  background: open === i ? C.green : C.darker,
                  border: `2px solid ${open === i ? C.green : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Oswald", sans-serif', fontWeight: 700,
                  fontSize: rule.icon.length > 2 ? 13 : 16,
                  color: open === i ? '#fff' : C.silver,
                }}>{rule.icon}</div>
                <Stencil size={14} tracking="0.1em">{rule.title}</Stencil>
              </div>
              {open === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {open === i && (
              <div style={{ padding: '0 13px 12px', borderTop: `1px dashed ${C.border}`, paddingTop: 11 }}>
                <Mono size={11} color={C.silver} style={{ lineHeight: 1.6, letterSpacing: '0.02em' }}>{rule.content}</Mono>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, padding: 12, background: C.darker, border: `2px dashed ${C.border}`, textAlign: 'center' }}>
        <Hammer size={18} style={{ color: C.silver, margin: '0 auto 5px', display: 'block' }} />
        <Stencil size={10} color={C.silver} tracking="0.25em">WIN THE DAY • WIN THE WEEK</Stencil>
        <Mono size={9} color={C.textDim} className="block" style={{ marginTop: 4 }}>
          THE RADIO DRAFT — JOBSITE EDITION V5
        </Mono>
      </div>
    </div>
  );
}

// ============================================================
// BADGE TOAST
// ============================================================
// Slides in from the top when a badge is unlocked. Auto-dismisses
// after a few seconds; tap to dismiss immediately. Industrial medal
// aesthetic — engraved circle on dark plate, no neon.

function BadgeToast({ badgeId, owner, onDismiss }) {
  const badge = BADGES[badgeId];
  useEffect(() => {
    const t = setTimeout(onDismiss, 4200);
    return () => clearTimeout(t);
  }, [badgeId, onDismiss]);

  if (!badge) return null;

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        top: 12, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: C.darker,
        border: `2px solid ${C.amber}`,
        padding: '10px 14px',
        cursor: 'pointer',
        boxShadow: `0 6px 0 ${C.amberDark}, 0 12px 28px rgba(0,0,0,0.6), inset 0 0 0 1px ${C.amber}33`,
        animation: 'badgeIn 0.5s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', alignItems: 'center', gap: 12,
        maxWidth: 360, width: 'calc(100% - 24px)',
      }}
    >
      {/* Medal: engraved circle */}
      <div style={{
        width: 48, height: 48, flexShrink: 0,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, ${C.amber}, ${C.amberDark} 70%, #5a3a08)`,
        border: `2px solid ${C.amberDark}`,
        boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <BadgeIcon iconKey={badge.icon} size={22} color="#2a1c05" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Mono size={8} color={C.amber} style={{ letterSpacing: '0.3em', display: 'block' }}>
          BADGE UNLOCKED
        </Mono>
        <Stencil size={15} color="#fff" tracking="0.1em" style={{ display: 'block', marginTop: 2 }}>
          {badge.title}
        </Stencil>
        <Mono size={9} color={C.silver} style={{ display: 'block', marginTop: 2, lineHeight: 1.3 }}>
          {owner !== 'shared' ? `${owner} • ` : ''}{badge.subtitle}
        </Mono>
      </div>
    </div>
  );
}

// ============================================================
// TROPHY CASE
// ============================================================
// Shows career stats, badges (earned + locked), and recent weeks.
// Reached from the landing screen.

function TrophyCase({ stats, setScreen, hasGame }) {
  const earned = BADGE_ORDER.filter(id => stats.badges[id]);
  const locked = BADGE_ORDER.filter(id => !stats.badges[id]);

  // Top artists by plays
  const topArtists = Object.entries(stats.perArtist || {})
    .sort((a, b) => b[1].plays - a[1].plays)
    .slice(0, 5);

  // Top bonus songs by hits
  const topBonusSongs = Object.entries(stats.perBonusSong || {})
    .sort((a, b) => b[1].hits - a[1].hits)
    .slice(0, 3);

  return (
    <div className="px-4 py-5 pb-24">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setScreen(hasGame ? 'dashboard' : 'landing')} style={iconBtn}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <Stencil size={18} tracking="0.2em">TROPHY CASE</Stencil>
        <div style={{ width: 20 }} />
      </div>

      <TrimBar accent="amber" thickness={8} className="mb-4" />

      {/* Career totals */}
      <SectionDivider>CAREER TOTALS</SectionDivider>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatTile label="WEEKS WON" value={stats.totals.weeksWon} accent={C.amber} />
        <StatTile label="DAYS WON" value={stats.totals.daysWon} accent={C.green} />
        <StatTile label="WALK-OFFS" value={stats.totals.walkOffs} accent={C.amber} />
        <StatTile label="RETALIATIONS" value={stats.totals.retaliations} accent={C.red} />
        <StatTile label="SHOT CALLS HIT" value={stats.totals.shotCallsHit} accent={C.amber} />
        <StatTile label="BONUS HITS" value={stats.totals.bonusSongHits} accent={C.amber} />
        <StatTile label="BLOCKS" value={stats.totals.blocks} accent={C.blueLight} />
        <StatTile label="STEALS" value={stats.totals.steals} accent={C.red} />
        <StatTile label="½-PT WINS" value={stats.totals.halfPointWins} accent={C.silver} />
        <StatTile label="TRIPLES" value={stats.totals.tripleWins} accent={C.green} />
        <StatTile label="HIGH DAY" value={stats.totals.highestDayScore} accent={C.amber} />
        <StatTile label="HIGH WEEK" value={stats.totals.highestWeekScore} accent={C.amber} />
        <StatTile label="5-FOR-5 DAYS" value={stats.totals.fiveForFiveDays || 0} accent={C.amber} />
      </div>

      {/* Badges */}
      <SectionDivider accent={C.amber}>BADGES — {earned.length}/{BADGE_ORDER.length}</SectionDivider>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {earned.map(id => (
          <BadgeTile key={id} badge={BADGES[id]} earned owner={stats.badges[id]?.owner} />
        ))}
        {locked.map(id => (
          <BadgeTile key={id} badge={BADGES[id]} earned={false} />
        ))}
      </div>

      {/* Top artists */}
      {topArtists.length > 0 && (
        <>
          <SectionDivider>TOP ARTISTS</SectionDivider>
          <div className="space-y-1 mb-4">
            {topArtists.map(([artist, info]) => (
              <div key={artist} style={{
                padding: '7px 10px',
                background: C.darker,
                borderLeft: `3px solid ${C.green}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <Stencil size={12} color="#fff" tracking="0.05em">{artist.toUpperCase()}</Stencil>
                <Mono size={11} color={C.green} style={{ fontWeight: 700 }}>{info.plays}×</Mono>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Top bonus songs */}
      {topBonusSongs.length > 0 && (
        <>
          <SectionDivider accent={C.amber}>BONUS SONG HALL OF FAME</SectionDivider>
          <div className="space-y-1 mb-4">
            {topBonusSongs.map(([k, info]) => (
              <div key={k} style={{
                padding: '7px 10px',
                background: C.darker,
                borderLeft: `3px solid ${C.amber}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <Stencil size={11} color="#fff" tracking="0.05em" style={{ display: 'block' }}>
                    {info.artist.toUpperCase()}
                  </Stencil>
                  <Mono size={9} color={C.silver} style={{ display: 'block', marginTop: 1 }}>
                    "{info.song}"
                  </Mono>
                </div>
                <Mono size={11} color={C.amber} style={{ fontWeight: 700 }}>×{info.hits}</Mono>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent weeks */}
      {stats.weekHistory && stats.weekHistory.length > 0 && (
        <>
          <SectionDivider>RECENT WEEKS</SectionDivider>
          <div className="space-y-1 mb-4">
            {stats.weekHistory.slice(0, 6).map((w, i) => (
              <div key={i} style={{
                padding: '8px 10px',
                background: C.darker,
                borderLeft: `3px solid ${C.silver}`,
              }}>
                <div className="flex justify-between items-center">
                  <Stencil size={11} color="#fff" tracking="0.05em">
                    {w.players[0]} {w.weeklyWins[0]}–{w.weeklyWins[1]} {w.players[1]}
                  </Stencil>
                  <Mono size={9} color={C.amber}>{w.winner}</Mono>
                </div>
                <Mono size={9} color={C.textDim} style={{ display: 'block', marginTop: 2 }}>
                  {w.station} • {new Date(w.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Mono>
              </div>
            ))}
          </div>
        </>
      )}

      {earned.length === 0 && stats.totals.daysPlayed === 0 && (
        <div style={{
          marginTop: 20, padding: 18, background: C.darker,
          border: `2px dashed ${C.border}`, textAlign: 'center',
        }}>
          <Mono size={10} color={C.textDim} style={{ lineHeight: 1.6 }}>
            NO STATS YET • PLAY A WEEK TO EARN BADGES
          </Mono>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, accent }) {
  return (
    <div style={{
      background: C.darker,
      border: `2px solid ${C.border}`,
      borderTop: `3px solid ${accent}`,
      padding: '8px 10px',
      textAlign: 'center',
    }}>
      <Mono size={9} color={C.silver} style={{ letterSpacing: '0.2em', display: 'block' }}>{label}</Mono>
      <Stencil size={20} color="#fff" style={{ display: 'block', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{value}</Stencil>
    </div>
  );
}

function BadgeTile({ badge, earned, owner }) {
  // V12.13: redesigned as an industrial stamp / OSHA-tag, not a coin.
  // Earned badges show as a small steel plate with a stamped ink mark —
  // flat amber field, hard edges, slight rotation to feel hand-applied.
  // Unearned tiles look like blank pressed metal tags awaiting their mark.
  // The slight rotation is deterministic per-badge so the same badge always
  // hangs at the same angle across renders.
  const seed = (badge.id || badge.title || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rot = ((seed % 5) - 2) * 0.7; // -1.4° to +1.4°
  return (
    <div style={{
      background: earned ? C.darker : C.card,
      border: `2px solid ${earned ? C.amberDark : C.border}`,
      padding: '10px 6px 8px',
      textAlign: 'center',
      opacity: earned ? 1 : 0.55,
      position: 'relative',
      // Earned tiles get a subtle "bolted-on" depth shadow
      boxShadow: earned ? `0 2px 0 ${C.darker}, inset 0 1px 0 rgba(255,255,255,0.04)` : 'none',
    }}>
      {/* Stamp plate — flat color, hard edges, slight rotation */}
      <div style={{
        width: 42, height: 42, margin: '0 auto 6px',
        background: earned ? C.amber : C.cardHi,
        border: `2px solid ${earned ? '#1A1A1A' : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `rotate(${rot}deg)`,
        position: 'relative',
        // Inner ink-impression shadow — a stamped mark sits in a slight
        // depression of the metal it's stamped on
        boxShadow: earned
          ? `inset 0 2px 3px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(255,255,255,0.15)`
          : `inset 0 1px 2px rgba(0,0,0,0.3)`,
      }}>
        {earned
          ? <BadgeIcon iconKey={badge.icon} size={20} color="#1A1A1A" />
          : <Lock size={14} style={{ color: C.textDim, opacity: 0.5 }} />}
        {/* Tiny corner notch — gives the plate a manufactured-tag feel */}
        {earned && (
          <div style={{
            position: 'absolute', top: -1, left: -1,
            width: 5, height: 5,
            borderRight: `2px solid ${C.darker}`,
            borderBottom: `2px solid ${C.darker}`,
            background: C.darker,
          }} />
        )}
      </div>
      <Stencil size={9} color={earned ? '#fff' : C.textDim} tracking="0.12em" style={{ display: 'block', lineHeight: 1.15 }}>
        {badge.title}
      </Stencil>
      <Mono size={7} color={earned ? C.silver : C.textDim} style={{
        display: 'block', marginTop: 3, lineHeight: 1.3, letterSpacing: '0.05em',
      }}>
        {badge.subtitle}
      </Mono>
      {earned && owner && owner !== 'shared' && (
        <div style={{
          marginTop: 5,
          display: 'inline-block',
          padding: '1px 6px',
          background: C.cardHi,
          border: `1px solid ${C.border}`,
        }}>
          <Mono size={7} color={C.silver} style={{ letterSpacing: '0.2em', fontWeight: 700 }}>
            {owner}
          </Mono>
        </div>
      )}
    </div>
  );
}

// ============================================================
// WEEKLY RECAP
// ============================================================
// Cinematic post-week presentation. Pure render layer — reads from
// game.weekHistory + the final day's currentDayState. No engine impact.
// Designed to feel like the back of a sports box: clean, hierarchical,
// screenshot-worthy.

function WeekRecap({ game, stats, setScreen, resetGame }) {
  const p0 = game.players[0], p1 = game.players[1];
  // V12.5: when every day was skipped, no champion exists.
  // V12.8: same when wins are tied (e.g. a 2-2 week with one skipped
  // day). A tied weekly score is a genuine draw, not a fake coronation.
  const noChampion = p0.weeklyWins === p1.weeklyWins;
  const winnerIdx = noChampion ? null
    : p0.weeklyWins > p1.weeklyWins ? 0
    : 1;
  const winner = winnerIdx !== null ? game.players[winnerIdx] : null;
  const loser = winnerIdx !== null ? game.players[1 - winnerIdx] : null;
  // Distinguish "everyone got zero" from "tied at >0" for copy.
  const weekTied = noChampion && (p0.weeklyWins > 0 || p1.weeklyWins > 0);

  // Build a complete picture of all days played this week. weekHistory
  // contains finalized days; the final (last-played) day is in currentDayState.
  // Synthesize a hist-shaped object for it so we can iterate uniformly.
  const allDays = React.useMemo(() => {
    const days = [...(game.weekHistory || [])];
    const lastInHistory = days[days.length - 1];
    if (!lastInHistory || lastInHistory.day !== game.currentDay) {
      const ds = game.currentDayState;
      const events = (ds.events || []).filter(e => !e.meta);
      const bigPlay = events
        .filter(e => !e.blocked && e.totalPoints >= 3)
        .sort((a, b) => b.totalPoints - a.totalPoints)[0] || null;
      const blockedBonus = events.find(e => {
        if (!e.blocked) return false;
        const oppBonus = ds.bonusSongs[e.owner];
        return oppBonus && oppBonus.artist === e.artist;
      }) || null;
      const fiveForFive = ds.fiveForFiveAwarded?.[0] || ds.fiveForFiveAwarded?.[1] || false;
      const fiveForFivePlayer = ds.fiveForFiveAwarded?.[0] ? 0
                              : ds.fiveForFiveAwarded?.[1] ? 1 : null;
      const artistPlays = {};
      for (const ev of events) {
        if (ev.blocked || !ev.artist) continue;
        artistPlays[ev.artist] = (artistPlays[ev.artist] || 0) + 1;
      }
      days.push({
        day: game.currentDay,
        // V12.8: a dayComplete current day with no winner came from a
        // SKIP_DAY on day 5 — surface that so the recap row renders
        // "SKIPPED" instead of an empty 0-0 row.
        skipped: ds.dayComplete && ds.winner !== 0 && ds.winner !== 1,
        scores: ds.scores,
        winner: ds.winner,
        drafts: ds.drafts,
        bonusSongs: ds.bonusSongs,
        halfPoint: ds.halfPoint,
        bonusPlayCount: ds.bonusSongPlayCount,
        dayEndedByTriple: ds.dayEndedByTriple,
        bigPlay: bigPlay ? {
          artist: bigPlay.artist, song: bigPlay.song,
          totalPoints: bigPlay.totalPoints,
          player: bigPlay.effectivePlayer,
          isBonus: !!bigPlay.isBonus, is5for5: !!bigPlay.is5for5,
          isWalkoff: !!bigPlay.isWalkoff, isTriple: !!bigPlay.isTriple,
        } : null,
        blockedBonus: blockedBonus ? {
          artist: blockedBonus.artist,
          blocker: 1 - blockedBonus.owner,
          victim: blockedBonus.owner,
        } : null,
        fiveForFive, fiveForFivePlayer,
        artistPlays,
      });
    }
    return days;
  }, [game]);

  const summary = React.useMemo(() => {
    const totals = { 0: 0, 1: 0 };
    const artistCounts = {};
    const bonusHits = {};
    let topBigPlay = null;
    let bestBlock = null;
    let fiveForFiveDays = 0;

    for (const d of allDays) {
      totals[0] += d.scores[0];
      totals[1] += d.scores[1];
      for (const [a, n] of Object.entries(d.artistPlays || {})) {
        artistCounts[a] = (artistCounts[a] || 0) + n;
      }
      for (const idx of [0, 1]) {
        const bs = d.bonusSongs?.[idx];
        const hits = d.bonusPlayCount?.[idx] || 0;
        if (bs && hits > 0) {
          const key = `${bs.artist}::${bs.song}`;
          if (!bonusHits[key]) bonusHits[key] = { artist: bs.artist, song: bs.song, hits: 0, owner: idx };
          bonusHits[key].hits += hits;
        }
      }
      if (d.bigPlay && (!topBigPlay || d.bigPlay.totalPoints > topBigPlay.totalPoints)) {
        topBigPlay = { ...d.bigPlay, day: d.day };
      }
      if (d.blockedBonus && !bestBlock) {
        bestBlock = { ...d.blockedBonus, day: d.day };
      }
      if (d.fiveForFive) fiveForFiveDays += 1;
    }

    const topArtist = Object.entries(artistCounts).sort((a, b) => b[1] - a[1])[0] || null;
    const topBonus = Object.entries(bonusHits).sort((a, b) => b[1].hits - a[1].hits)[0] || null;
    return { totals, topArtist, topBonus, topBigPlay, bestBlock, fiveForFiveDays };
  }, [allDays]);

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const winnerColor = winnerIdx === 0 ? C.green : C.silver;

  return (
    <div className="px-4 py-5 pb-24">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setScreen('endDay')} style={iconBtn}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <Stencil size={14} tracking="0.3em">WEEKLY RECAP</Stencil>
        <div style={{ width: 20 }} />
      </div>
      <TrimBar accent="amber" thickness={8} className="mb-5" />

      {/* CHAMPIONSHIP CARD — the hero moment.
          V12.5/V12.8: When wins are tied (or every day skipped), render
          a quiet "no champion" card instead of a fake coronation. */}
      {noChampion ? (
        <div style={{
          background: C.card,
          border: `2px solid ${C.border}`,
          padding: '24px 16px',
          marginBottom: 18,
          textAlign: 'center',
        }}>
          {weekTied ? (
            <>
              <Stencil size={11} color={C.silver} tracking="0.3em" style={{ display: 'block', marginBottom: 10 }}>
                WEEK ENDS — TIED
              </Stencil>
              <div style={{ display: 'inline-flex', gap: 18, alignItems: 'baseline', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <Stencil size={11} color={C.green} tracking="0.18em" style={{ display: 'block', marginBottom: 4 }}>
                    {p0.name}
                  </Stencil>
                  <Stencil size={42} color="#fff" style={{ display: 'block', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {p0.weeklyWins}
                  </Stencil>
                </div>
                <Stencil size={20} color={C.silver} tracking="0.1em">—</Stencil>
                <div style={{ textAlign: 'center' }}>
                  <Stencil size={11} color={C.silver} tracking="0.18em" style={{ display: 'block', marginBottom: 4 }}>
                    {p1.name}
                  </Stencil>
                  <Stencil size={42} color="#fff" style={{ display: 'block', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {p1.weeklyWins}
                  </Stencil>
                </div>
              </div>
              <Mono size={10} color={C.textDim} style={{ display: 'block', lineHeight: 1.5, letterSpacing: '0.08em' }}>
                NO CHAMPION — SETTLE IT NEXT WEEK
              </Mono>
            </>
          ) : (
            <>
              <Stencil size={11} color={C.silver} tracking="0.3em" style={{ display: 'block', marginBottom: 8 }}>
                NO CHAMPION
              </Stencil>
              <Mono size={10} color={C.textDim} style={{ display: 'block', lineHeight: 1.5, letterSpacing: '0.08em' }}>
                EVERY DAY THIS WEEK WAS SKIPPED.<br />NO WORK, NO WINS.
              </Mono>
            </>
          )}
          <Mono size={9} color={C.silver} style={{ display: 'block', marginTop: 12, letterSpacing: '0.2em' }}>
            {game.station?.name || 'THE RADIO DRAFT'}
          </Mono>
        </div>
      ) : (
      <div style={{
        position: 'relative',
        background: C.card,
        border: `3px solid ${C.amber}`,
        padding: '28px 18px 22px',
        marginBottom: 18,
        boxShadow: `0 2px 0 ${C.amberDark}, 0 8px 20px rgba(0,0,0,0.1)`,
        textAlign: 'center', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 18,
          background: `${C.amber}22`,
          borderBottom: `1px solid ${C.amber}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mono size={8} color={C.amberDark} style={{ letterSpacing: '0.45em', fontWeight: 700 }}>
            ◆ CHAMPIONSHIP OF THE WEEK ◆
          </Mono>
        </div>
        <Trophy size={42} style={{ color: C.amber, margin: '14px auto 6px', display: 'block' }} />
        <Mono size={9} color={C.blue} style={{ letterSpacing: '0.35em', display: 'block', marginBottom: 8, fontWeight: 700 }}>
          {game.station?.name || 'THE RADIO DRAFT'}
        </Mono>
        <Stencil size={44} color={winnerColor} tracking="0.04em" style={{
          display: 'block', lineHeight: 1,
        }}>{winner.name}</Stencil>
        <Stencil size={13} color={C.text} tracking="0.3em" style={{ display: 'block', marginTop: 6 }}>
          DEFEATS
        </Stencil>
        <Stencil size={22} color={C.silver} tracking="0.05em" style={{ display: 'block', marginTop: 3 }}>
          {loser.name}
        </Stencil>
        <div style={{ marginTop: 14, display: 'inline-flex', gap: 12, alignItems: 'baseline' }}>
          <LEDDisplay value={winner.weeklyWins} color={winnerColor} size="md" align="center" />
          <Stencil size={26} color={C.red} tracking="0.1em">—</Stencil>
          <LEDDisplay value={loser.weeklyWins} color={C.silver} size="md" align="center" />
        </div>
        <Mono size={9} color={C.blue} style={{ marginTop: 10, letterSpacing: '0.3em', display: 'block', fontWeight: 700 }}>
          {loser.name} BUYS FIRST ROUND
        </Mono>
      </div>
      )}

      {/* DAY-BY-DAY BREAKDOWN */}
      <SectionDivider>DAY BY DAY</SectionDivider>
      <div style={{ background: C.darker, border: `2px solid ${C.border}`, padding: 10, marginBottom: 18 }}>
        {allDays.map((d, i) => {
          // V12.5: skipped days render as a single-line "SKIPPED" row
          // with no winner.
          if (d.skipped) {
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 4px',
                borderBottom: i < allDays.length - 1 ? `1px dashed ${C.border}` : 'none',
                opacity: 0.55,
              }}>
                <Stencil size={11} color={C.silver} tracking="0.2em" style={{ width: 40, flexShrink: 0 }}>
                  {dayNames[d.day - 1]}
                </Stencil>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Mono size={10} color={C.silver} style={{ letterSpacing: '0.3em', fontWeight: 700 }}>
                    — SKIPPED —
                  </Mono>
                </div>
                <Mono size={9} color={C.textDim} tracking="0.15em" style={{ width: 56, textAlign: 'right', flexShrink: 0, letterSpacing: '0.2em' }}>
                  NO WINNER
                </Mono>
              </div>
            );
          }
          const dWinnerColor = d.winner === 0 ? C.green : C.silver;
          const isHalf = d.halfPoint && (d.halfPoint[0] || d.halfPoint[1]);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 4px',
              borderBottom: i < allDays.length - 1 ? `1px dashed ${C.border}` : 'none',
            }}>
              <Stencil size={11} color={C.silver} tracking="0.2em" style={{ width: 40, flexShrink: 0 }}>
                {dayNames[d.day - 1]}
              </Stencil>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Stencil size={16} color={d.winner === 0 ? '#fff' : C.silver} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {d.scores[0]}
                </Stencil>
                <Mono size={9} color={C.textDim}>—</Mono>
                <Stencil size={16} color={d.winner === 1 ? '#fff' : C.silver} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {d.scores[1]}
                </Stencil>
                {isHalf && <Mono size={10} color={C.amber} style={{ marginLeft: 4 }}>½</Mono>}
                {d.dayEndedByTriple !== null && d.dayEndedByTriple !== undefined && (
                  <Beer size={11} style={{ color: C.green, marginLeft: 2 }} />
                )}
                {d.fiveForFive && (
                  <Trophy size={10} style={{ color: C.amber, marginLeft: 2 }} />
                )}
              </div>
              <Stencil size={11} color={dWinnerColor} tracking="0.15em" style={{ width: 56, textAlign: 'right', flexShrink: 0 }}>
                {d.winner === 0 || d.winner === 1 ? game.players[d.winner].name : '—'}
              </Stencil>
            </div>
          );
        })}
        <div style={{
          marginTop: 8, paddingTop: 8, borderTop: `2px solid ${C.borderHi}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Mono size={9} color={C.amber} style={{ width: 40, flexShrink: 0, letterSpacing: '0.25em' }}>
            TOTAL
          </Mono>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Stencil size={18} color="#fff" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {summary.totals[0]}
            </Stencil>
            <Mono size={10} color={C.textDim}>—</Mono>
            <Stencil size={18} color="#fff" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {summary.totals[1]}
            </Stencil>
          </div>
          <Mono size={9} color={C.amber} tracking="0.15em" style={{ width: 56, textAlign: 'right', flexShrink: 0 }}>
            PTS
          </Mono>
        </div>
      </div>

      {/* HIGHLIGHTS */}
      <SectionDivider>HIGHLIGHTS</SectionDivider>
      <div className="space-y-2 mb-5">
        {summary.topArtist && (
          <HighlightCard
            icon={<Radio size={16} style={{ color: C.green }} />}
            label="TOP ARTIST"
            primary={summary.topArtist[0]}
            secondary={`${summary.topArtist[1]} play${summary.topArtist[1] === 1 ? '' : 's'}`}
            accent={C.green}
          />
        )}
        {summary.topBonus && (
          <HighlightCard
            icon={<Award size={16} style={{ color: C.amber }} />}
            label="BEST BONUS SONG"
            primary={summary.topBonus[1].artist}
            secondary={`"${summary.topBonus[1].song}" — ${summary.topBonus[1].hits} hit${summary.topBonus[1].hits === 1 ? '' : 's'}`}
            accent={C.amber}
          />
        )}
        {summary.topBigPlay && (
          <HighlightCard
            icon={summary.topBigPlay.is5for5 ? <Trophy size={16} style={{ color: C.amber }} /> :
                   summary.topBigPlay.isTriple ? <Beer size={16} style={{ color: C.green }} /> :
                   summary.topBigPlay.isBonus ? <Award size={16} style={{ color: C.amber }} /> :
                   <Flame size={16} style={{ color: C.amber }} />}
            label="BIGGEST MOMENT"
            primary={`${game.players[summary.topBigPlay.player]?.name || '?'} • ${summary.topBigPlay.artist}`}
            secondary={`+${summary.topBigPlay.totalPoints} on ${dayNames[summary.topBigPlay.day - 1]}${summary.topBigPlay.song ? ` — "${summary.topBigPlay.song}"` : ''}`}
            accent={C.amber}
          />
        )}
        {summary.bestBlock && (
          <HighlightCard
            icon={<Shield size={16} style={{ color: C.red }} />}
            label="MOST RUTHLESS BLOCK"
            primary={`${game.players[summary.bestBlock.blocker]?.name || '?'} denied ${summary.bestBlock.artist}`}
            secondary={`Bonus Song killed — ${dayNames[summary.bestBlock.day - 1]}`}
            accent={C.red}
          />
        )}
        {summary.fiveForFiveDays > 0 && (
          <HighlightCard
            icon={<Trophy size={16} style={{ color: C.amber }} />}
            label="CLEAN SWEEPS"
            primary={`${summary.fiveForFiveDays} 5-for-5 day${summary.fiveForFiveDays === 1 ? '' : 's'}`}
            secondary="Full roster scored"
            accent={C.amber}
          />
        )}
        {!summary.topArtist && !summary.topBonus && !summary.topBigPlay && !summary.bestBlock && (
          <Mono size={10} color={C.textDim} style={{ textAlign: 'center', padding: 20, display: 'block' }}>
            NOT ENOUGH ACTIVITY TO PRODUCE HIGHLIGHTS
          </Mono>
        )}
      </div>

      <div className="space-y-3">
        <Btn onClick={() => resetGame('newWeek')} variant="primary">
          <span className="inline-flex items-center gap-2"><Radio size={18} /> START A FRESH WEEK</span>
        </Btn>
        <Btn onClick={() => setScreen('trophyCase')} variant="ghost">
          <span className="inline-flex items-center gap-2"><Trophy size={16} /> VIEW ALL-TIME STATS</span>
        </Btn>
      </div>
    </div>
  );
}

function HighlightCard({ icon, label, primary, secondary, accent }) {
  return (
    <div style={{
      background: C.darker,
      borderLeft: `4px solid ${accent}`,
      border: `2px solid ${C.border}`,
      borderLeftWidth: 4,
      padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 30, height: 30, flexShrink: 0,
        background: C.card, border: `1px solid ${accent}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Mono size={8} color={accent} style={{ letterSpacing: '0.3em', display: 'block', marginBottom: 2 }}>
          {label}
        </Mono>
        <Stencil size={13} color="#fff" tracking="0.05em" style={{ display: 'block', lineHeight: 1.1 }}>
          {primary}
        </Stencil>
        <Mono size={9} color={C.silver} style={{ display: 'block', marginTop: 2, letterSpacing: '0.05em' }}>
          {secondary}
        </Mono>
      </div>
    </div>
  );
}

// ============================================================
// STATION ARTIST POOL (V12)
// ============================================================
// Per-station artist ecosystem viewer / editor. Filters: All / Active /
// Hidden / Never Drafted / Most Drafted / Highest Success Rate /
// Recently Played. Inline add. Per-card hide/restore/delete.
// Design language: record-crate dividers, stat chips, no spreadsheet vibe.

const POOL_FILTERS = [
  { id: 'active',         label: 'ACTIVE' },
  { id: 'all',            label: 'ALL' },
  { id: 'hidden',         label: 'HIDDEN' },
  { id: 'never_drafted',  label: 'NEVER DRAFTED' },
  { id: 'most_drafted',   label: 'MOST DRAFTED' },
  { id: 'highest_rate',   label: 'HIGHEST RATE' },
  { id: 'recently_played',label: 'RECENT PLAYS' },
];

function StationArtistPool({ station, stationPool, onAdd, onDelete, onSetActive, onSetSongs, onReseed, onRename, setScreen }) {
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [reseedMsg, setReseedMsg] = useState(null);

  const handleReseed = () => {
    if (!onReseed) return;
    onReseed((added) => {
      setReseedMsg(added > 0
        ? `Added ${added} artist${added === 1 ? '' : 's'} from ${station?.format || 'format'} defaults`
        : 'Pool already up to date');
      // Auto-clear the toast-style banner after 3.5s
      setTimeout(() => setReseedMsg(null), 3500);
    });
  };

  // Build the filtered + sorted record list per active tab.
  const records = React.useMemo(() => {
    const all = Object.entries(stationPool || {}).map(([name, rec]) => ({
      name, rec, success: draftSuccessRate(rec),
    }));
    // Search filter (applied across all tabs)
    const q = search.trim().toLowerCase();
    const matching = q
      ? all.filter(r => r.name.toLowerCase().includes(q))
      : all;
    let out = matching;
    switch (filter) {
      case 'active':
        out = matching.filter(r => r.rec.active && !r.rec.deleted);
        break;
      case 'hidden':
        out = matching.filter(r => !r.rec.active || r.rec.deleted);
        break;
      case 'never_drafted':
        out = matching.filter(r => !r.rec.deleted && (r.rec.stats?.draftedCount || 0) === 0);
        break;
      case 'most_drafted':
        out = matching.filter(r => !r.rec.deleted).sort(
          (a, b) => (b.rec.stats?.draftedCount || 0) - (a.rec.stats?.draftedCount || 0)
        );
        break;
      case 'highest_rate':
        out = matching.filter(r => !r.rec.deleted && r.success !== null).sort(
          (a, b) => (b.success || 0) - (a.success || 0)
        );
        break;
      case 'recently_played':
        out = matching.filter(r => !r.rec.deleted && r.rec.lastPlayedAt).sort(
          (a, b) => new Date(b.rec.lastPlayedAt).getTime() - new Date(a.rec.lastPlayedAt).getTime()
        );
        break;
      case 'all':
      default:
        out = matching;
        break;
    }
    // Default secondary sort: alpha
    if (filter === 'active' || filter === 'all' || filter === 'hidden' || filter === 'never_drafted') {
      out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    }
    return out;
  }, [stationPool, filter, search]);

  // Totals strip
  const totals = React.useMemo(() => {
    const all = Object.values(stationPool || {});
    return {
      total: all.length,
      active: all.filter(r => r.active && !r.deleted).length,
      hidden: all.filter(r => !r.active || r.deleted).length,
      neverDrafted: all.filter(r => !r.deleted && (r.stats?.draftedCount || 0) === 0).length,
    };
  }, [stationPool]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
    setAdding(false);
  };

  const fmtAccent = station?.format && STATION_FORMATS[station.format]
    ? STATION_FORMATS[station.format].accent
    : C.silver;

  return (
    <div className="px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setScreen('draft')} style={iconBtn}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <Stencil size={14} tracking="0.25em">ARTIST POOL</Stencil>
        <div style={{ width: 20 }} />
      </div>
      <TrimBar accent="silver" thickness={8} className="mb-4" />

      {/* V12.13: station identity rendered as a filing-cabinet drawer
          label — the frequency/call-sign on the left reads as a catalog
          code stamped into the metal, the station name as the engraved
          drawer label, and the format as a category tag.

          Visual hierarchy: a 3-band card with the format-accent stripe
          on the left, the brass-style code plate, and the engraved name
          on the right. Reads as "ARCHIVE: KRFX-92.5 / CLASSIC ROCK"
          rather than "Station: KRFX in Denver / Classic Rock". */}
      <div style={{
        background: C.darker,
        border: `2px solid ${C.border}`,
        marginBottom: 14,
        borderLeft: `5px solid ${fmtAccent}`,
        position: 'relative',
        display: 'flex', alignItems: 'stretch',
      }}>
        {/* Catalog code plate — frequency + call sign engraved */}
        <div style={{
          minWidth: 78,
          padding: '12px 10px',
          background: `linear-gradient(180deg, #5C6573 0%, #4A5260 100%)`,
          borderRight: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)`,
        }}>
          <Stencil size={20} color="#fff" tracking="0.02em" style={{
            display: 'block', lineHeight: 1,
            textShadow: `0 1px 0 rgba(0,0,0,0.4)`,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {station?.frequency || '—'}
          </Stencil>
          <Mono size={8} color={C.silver} style={{
            letterSpacing: '0.25em', display: 'block', marginTop: 4, fontWeight: 700,
          }}>
            {station?.callSign || 'STN'}
          </Mono>
        </div>
        {/* Engraved drawer-label area */}
        <div style={{
          flex: 1, minWidth: 0,
          padding: '12px 12px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <Mono size={8} color={C.textDim} style={{
            letterSpacing: '0.35em', display: 'block', marginBottom: 4, fontWeight: 700,
          }}>
            ARCHIVE — STATION ROSTER
          </Mono>
          <Stencil size={16} color="#fff" tracking="0.04em" style={{
            display: 'block', lineHeight: 1.1,
          }}>
            {station?.name || 'STATION'}
          </Stencil>
          {station?.format && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, background: fmtAccent, border: `1px solid ${C.border}` }} />
              <Mono size={8} color={C.silver} style={{ letterSpacing: '0.2em', fontWeight: 700 }}>
                {station.format.toUpperCase()}
              </Mono>
            </div>
          )}
        </div>
      </div>

      {/* V12.13: stat footer reads as a library-card inscription, not
          four chiclet stats. Uses inline typography with vertical rules
          between values — like the back of an old library catalog card. */}
      <div style={{
        background: C.darker,
        border: `2px solid ${C.border}`,
        padding: '8px 12px',
        marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <PoolStatInscription label="TOTAL" value={totals.total} />
        <div style={{ width: 1, alignSelf: 'stretch', background: C.border }} />
        <PoolStatInscription label="ACTIVE" value={totals.active} accent={C.greenLight} />
        <div style={{ width: 1, alignSelf: 'stretch', background: C.border }} />
        <PoolStatInscription label="HIDDEN" value={totals.hidden} accent={C.silver} />
        <div style={{ width: 1, alignSelf: 'stretch', background: C.border }} />
        <PoolStatInscription label="UNUSED" value={totals.neverDrafted} accent={C.amber} />
      </div>

      {/* Reseed-from-format action. Pulls in any new artists added to
          this station's format defaults without disturbing existing
          records, stats, or hidden/deleted state. Useful when the app's
          catalog has been expanded (e.g. via playlist scrapes). */}
      {onReseed && station?.format && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={handleReseed}
            style={{
              width: '100%',
              padding: '8px 11px',
              background: C.darker,
              border: `1px dashed ${C.silver}`,
              color: C.silver,
              fontFamily: '"Oswald", sans-serif', fontWeight: 600, fontSize: 11,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <RotateCcw size={12} />
            PULL LATEST {station.format.toUpperCase()} DEFAULTS
          </button>
          {reseedMsg && (
            <Mono size={9} color={C.amber} style={{
              display: 'block', marginTop: 6, textAlign: 'center',
              letterSpacing: '0.1em',
            }}>{reseedMsg}</Mono>
          )}
        </div>
      )}

      {/* V12.13: filter row rendered as a strip of archive index tabs.
          The active tab gets a "stuck out" appearance — heavier border,
          amber underline, sits flush against the list below to read as
          a continuous filing-tab surface. */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <div style={{
          display: 'flex', gap: 0,
          overflowX: 'auto', paddingBottom: 0,
          borderBottom: `2px solid ${C.borderHi}`,
        }} className="scrollbar-hide">
          {POOL_FILTERS.map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '7px 11px 8px',
                  background: active ? C.cardHi : 'transparent',
                  border: 'none',
                  borderTop: `2px solid ${active ? C.amber : 'transparent'}`,
                  borderLeft: `1px solid ${active ? C.borderHi : 'transparent'}`,
                  borderRight: `1px solid ${active ? C.borderHi : 'transparent'}`,
                  marginBottom: -2, // overlap the underline so active tab joins the list
                  color: active ? '#fff' : C.silver,
                  fontFamily: '"Oswald", sans-serif',
                  fontWeight: 700, fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  flexShrink: 0,
                  position: 'relative',
                }}>{f.label}</button>
            );
          })}
        </div>
      </div>

      {/* Search + Add */}
      <div className="flex gap-2 mb-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH POOL…"
          style={{ ...inputStyle, fontSize: 13, flex: 1 }}
        />
        <button
          onClick={() => setAdding(a => !a)}
          style={{
            padding: '0 12px',
            background: adding ? C.darker : C.amber,
            border: `2px solid ${C.amber}`,
            color: adding ? C.amber : C.darker,
            fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 12,
            letterSpacing: '0.1em',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
          {adding ? <X size={14} /> : <Plus size={14} />}
          {adding ? 'CANCEL' : 'ADD'}
        </button>
      </div>

      {/* Inline add form */}
      {adding && (
        <div style={{
          background: C.card, border: `2px dashed ${C.amber}`,
          padding: 10, marginBottom: 12, display: 'flex', gap: 6,
        }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="ARTIST NAME"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            style={{ ...inputStyle, fontSize: 14, flex: 1 }}
          />
          <Btn onClick={handleAdd} variant="amber" size="md" disabled={!newName.trim()}>
            SAVE
          </Btn>
        </div>
      )}

      {/* Record list */}
      <div className="space-y-1.5">
        {records.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Mono size={10} color={C.textDim} style={{ letterSpacing: '0.15em' }}>
              {filter === 'never_drafted' ? 'NO UNUSED ARTISTS — POOL IS WELL-WORN'
                : filter === 'hidden' ? 'NOTHING HIDDEN'
                : 'NO ARTISTS MATCH THIS VIEW'}
            </Mono>
          </div>
        ) : records.map(({ name, rec, success }) => (
          <StationArtistRow
            key={name}
            name={name}
            record={rec}
            success={success}
            onHide={() => onSetActive(name, false)}
            onRestore={() => onSetActive(name, true)}
            onDelete={() => onDelete(name)}
            onSetSongs={onSetSongs ? (songs) => onSetSongs(name, songs) : null}
            onRename={onRename ? (newName) => onRename(name, newName) : null}
          />
        ))}
      </div>
    </div>
  );
}

function PoolTotalChip({ label, value, accent }) {
  const color = accent || C.silver;
  return (
    <div style={{
      background: C.darker, border: `1px solid ${C.border}`,
      padding: '6px 4px', textAlign: 'center',
    }}>
      <Mono size={7} color={C.silver} style={{ letterSpacing: '0.25em', display: 'block', marginBottom: 2 }}>
        {label}
      </Mono>
      <Stencil size={16} color={color} style={{ fontVariantNumeric: 'tabular-nums', display: 'block', lineHeight: 1 }}>
        {value}
      </Stencil>
    </div>
  );
}

// V12.13: an inline stat reading for the library-card style footer.
// Renders as "LABEL · 12" — typographic, no chiclet container, lets the
// surrounding cell + vertical rules provide structure.
function PoolStatInscription({ label, value, accent }) {
  const valueColor = accent || '#fff';
  return (
    <div style={{
      padding: '0 4px', textAlign: 'center', flex: 1, minWidth: 0,
    }}>
      <Mono size={8} color={C.textDim} style={{
        letterSpacing: '0.3em', display: 'block', marginBottom: 2, fontWeight: 700,
      }}>
        {label}
      </Mono>
      <Stencil size={18} color={valueColor} style={{
        fontVariantNumeric: 'tabular-nums', display: 'block', lineHeight: 1,
      }}>
        {value}
      </Stencil>
    </div>
  );
}

// V12.4: Expanded artist row. Collapsed by default — tap to open a
// "scouting report" view with heat tag, last-played, full stats, and
// action buttons including EDIT SONGS. Goal: feel like a record-crate
// index card, not an admin table row.
function StationArtistRow({ name, record, success, onHide, onRestore, onDelete, onSetSongs, onRename }) {
  const [expanded, setExpanded] = useState(false);
  const [editingSongs, setEditingSongs] = useState(false);
  const [songDraft, setSongDraft] = useState('');
  // V12.19: rename mode — when active, the artist name becomes an input.
  // Submit applies the rename globally (touches catalog, pools, history,
  // stats). Confirmation modal gates the apply.
  const [renamingTo, setRenamingTo] = useState(null);
  const [pendingRename, setPendingRename] = useState(null);

  const isHidden = !record.active || record.deleted;
  const drafted = record.stats?.draftedCount || 0;
  const played = record.stats?.playedWhenDraftedCount || 0;
  const totalPlays = record.stats?.timesPlayedTotal || 0;
  const successPct = success === null ? null : Math.round(success * 100);
  const sourceAccent = record.source === 'manual' ? C.amber
    : record.source === 'seed' ? C.silver
    : record.source === 'playlist' ? C.green
    : C.silver;

  // Heat tag — uses derived helpers from up top.
  const heatTag = artistHeatTag(record);
  const heat = heatTagDisplay(heatTag);

  // Last played relative (only when there's actual data).
  let lastPlayedRel = null;
  if (record.lastPlayedAt) {
    const days = Math.floor((Date.now() - new Date(record.lastPlayedAt).getTime()) / (1000 * 60 * 60 * 24));
    lastPlayedRel = days === 0 ? 'TODAY'
      : days === 1 ? 'YESTERDAY'
      : days < 7 ? `${days} DAYS AGO`
      : days < 30 ? `${Math.floor(days / 7)}W AGO`
      : days < 365 ? `${Math.floor(days / 30)}MO AGO`
      : `${Math.floor(days / 365)}Y AGO`;
  }

  // Render the heat tag icon — small lucide component pick.
  const HeatIcon = ({ which, color, size = 11 }) => {
    if (which === 'flame')     return <Flame size={size} color={color} />;
    if (which === 'shield')    return <Shield size={size} color={color} />;
    if (which === 'snowflake') return <Snowflake size={size} color={color} />;
    if (which === 'alert')     return <AlertCircle size={size} color={color} />;
    if (which === 'plus')      return <Plus size={size} color={color} />;
    if (which === 'star')      return <Star size={size} color={color} />;
    return null;
  };

  const songs = Array.isArray(record.songs) ? record.songs : [];

  return (
    <div style={{
      background: isHidden ? C.darker : C.card,
      border: `2px solid ${C.border}`,
      borderLeft: `8px solid ${sourceAccent}`,
      opacity: isHidden ? 0.7 : 1,
      overflow: 'hidden',
      // V12.13: subtle drop-stack so rows read as physical cards stacked
      // in a crate, not flat list items.
      boxShadow: !isHidden ? `0 1px 0 rgba(0,0,0,0.25)` : 'none',
    }}>
      {/* COLLAPSED HEADER — entire row is the tap target.
          V12.13: rebuilt as a record-crate index card. Artist name is
          the dominant typography; heat tag becomes a category band
          below it; stats line is a typographic footer, not chiclets. */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          padding: '11px 12px 10px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          textAlign: 'left', color: 'inherit',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Artist name — dominant anchor */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <Stencil size={15} color="#fff" tracking="0.04em" style={{ lineHeight: 1 }}>
              {name}
            </Stencil>
            {isHidden && (
              <Mono size={7} color={C.redLight} style={{ letterSpacing: '0.25em', fontWeight: 700 }}>
                {record.deleted ? 'DELETED' : 'HIDDEN'}
              </Mono>
            )}
          </div>

          {/* Heat tag — category band below the name */}
          {heat && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              marginTop: 6,
              padding: '2px 7px',
              background: `${heat.color}1F`,
              borderLeft: `2px solid ${heat.color}`,
            }}>
              <HeatIcon which={heat.icon} color={heat.color} size={10} />
              <Mono size={8} color={heat.color} style={{ letterSpacing: '0.2em', fontWeight: 700 }}>
                {heat.label}
              </Mono>
            </div>
          )}

          {/* Inscribed stats footer — separated by middle dots */}
          <div style={{ marginTop: 7, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 0 }}>
            {drafted === 0 ? (
              <Mono size={9} color={C.silver} style={{ letterSpacing: '0.14em', fontWeight: 600 }}>
                {lastPlayedRel ? `LAST PLAYED ${lastPlayedRel}` : 'NOT YET DRAFTED'}
              </Mono>
            ) : (
              <>
                <Mono size={9} color={C.textDim} style={{ letterSpacing: '0.12em' }}>
                  DRAFTED <span style={{ color: '#fff', fontWeight: 700 }}>{drafted}</span>
                </Mono>
                <Mono size={9} color={C.border} style={{ padding: '0 8px' }}>·</Mono>
                <Mono size={9} color={C.textDim} style={{ letterSpacing: '0.12em' }}>
                  HITS <span style={{ color: '#fff', fontWeight: 700 }}>{played}</span>
                </Mono>
                <Mono size={9} color={C.border} style={{ padding: '0 8px' }}>·</Mono>
                <Mono size={9} color={
                    successPct === null ? C.silver
                    : successPct >= 67 ? C.greenLight
                    : successPct >= 34 ? C.amber
                    : C.redLight
                  } style={{ letterSpacing: '0.12em', fontWeight: 700 }}>
                  {successPct !== null ? `${successPct}%` : '—'}
                </Mono>
                {lastPlayedRel && (
                  <>
                    <Mono size={9} color={C.border} style={{ padding: '0 8px' }}>·</Mono>
                    <Mono size={9} color={C.textDim} style={{ letterSpacing: '0.12em' }}>
                      {lastPlayedRel}
                    </Mono>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} color={C.silver} /> : <ChevronDown size={16} color={C.silver} />}
        </div>
      </button>

      {/* EXPANDED SCOUTING REPORT */}
      {expanded && (
        <div style={{
          padding: '10px 11px 11px',
          borderTop: `1px dashed ${C.border}`,
          background: C.darker,
        }}>
          {!editingSongs && (
            <>
              {/* Stat grid */}
              {(() => {
                const an = deriveArtistAnalytics(record);
                const station = record.stats?.bestSingleDay?.stationId;
                return (
                  <>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 6, marginBottom: 10,
                    }}>
                      <StatChip label="DRAFTED" value={drafted} />
                      <StatChip label="HITS" value={played} />
                      <StatChip
                        label="HIT RATE"
                        value={successPct !== null ? `${successPct}%` : 'N/A'}
                        accent={successPct === null ? C.silver
                          : successPct >= 67 ? C.green
                          : successPct >= 34 ? C.amber
                          : C.red}
                      />
                      <StatChip label="TOTAL PLAYS" value={totalPlays} accent={totalPlays > 0 ? C.silver : C.textDim} />
                      {/* V12.22: ADP and pick range — show whenever we have positions */}
                      {an.avgDraftPosition !== null && (
                        <StatChip
                          label="AVG PICK"
                          value={an.avgDraftPosition.toFixed(1)}
                          accent={an.avgDraftPosition <= 3 ? C.amber
                            : an.avgDraftPosition <= 6 ? C.green
                            : C.silver}
                        />
                      )}
                      {an.avgDraftPosition !== null && an.earliestPick !== an.latestPick && (
                        <StatChip
                          label="PICK RANGE"
                          value={`${an.earliestPick}-${an.latestPick}`}
                          accent={C.silver}
                        />
                      )}
                      {/* V12.22: average points — only after 3+ drafts */}
                      {an.hasEnough && an.avgPointsWhenDrafted !== null && (
                        <StatChip
                          label="AVG PTS/DRAFT"
                          value={an.avgPointsWhenDrafted.toFixed(1)}
                          accent={an.avgPointsWhenDrafted >= 4 ? C.green
                            : an.avgPointsWhenDrafted >= 2 ? C.amber
                            : C.red}
                        />
                      )}
                      {an.hasEnough && an.avgPointsWhenHits !== null && (
                        <StatChip
                          label="AVG PTS/HIT"
                          value={an.avgPointsWhenHits.toFixed(1)}
                          accent={C.green}
                        />
                      )}
                      {/* V12.22: best single day */}
                      {an.bestSingleDay && (
                        <StatChip
                          label="BEST DAY"
                          value={`+${an.bestSingleDay.points}`}
                          accent={C.amber}
                        />
                      )}
                      {(record.stats?.bonusSongCount || 0) > 0 && (
                        <StatChip label="BONUS HITS" value={record.stats.bonusSongCount} accent={C.amber} />
                      )}
                      {(record.stats?.blockedCount || 0) > 0 && (
                        <StatChip label="BLOCKED" value={record.stats.blockedCount} accent={C.red} />
                      )}
                      {(record.stats?.stolenCount || 0) > 0 && (
                        <StatChip label="STOLEN" value={record.stats.stolenCount} accent={C.red} />
                      )}
                      {(record.stats?.fiveForFiveContributionCount || 0) > 0 && (
                        <StatChip label="5-FOR-5" value={record.stats.fiveForFiveContributionCount} accent={C.amber} />
                      )}
                      {/* V12.22: granular event-type breakdowns */}
                      {an.walkOffCount > 0 && (
                        <StatChip label="WALK-OFFS" value={an.walkOffCount} accent={C.amber} />
                      )}
                      {an.retaliationCount > 0 && (
                        <StatChip label="RETALS" value={an.retaliationCount} accent={C.blueLight} />
                      )}
                      {an.b2bCount > 0 && (
                        <StatChip label="B2B" value={an.b2bCount} accent={C.amber} />
                      )}
                      {an.tripleEndCount > 0 && (
                        <StatChip label="TRIPLES" value={an.tripleEndCount} accent={C.green} />
                      )}
                    </div>
                    {/* V12.22: footnote for low-sample artists */}
                    {!an.hasEnough && drafted > 0 && (
                      <Mono size={8} color={C.textDim} style={{
                        letterSpacing: '0.12em', display: 'block', marginBottom: 8, lineHeight: 1.4,
                      }}>
                        ↳ ANALYTICS LIGHT — DRAFT THIS ARTIST {3 - drafted} MORE {3 - drafted === 1 ? 'TIME' : 'TIMES'} FOR FULL STATS
                      </Mono>
                    )}
                  </>
                );
              })()}

              {/* Provenance */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <Mono size={7} color={sourceAccent} style={{
                  letterSpacing: '0.25em',
                  padding: '2px 5px', background: `${sourceAccent}22`,
                  border: `1px solid ${sourceAccent}55`,
                }}>SOURCE · {(record.source || 'manual').toUpperCase()}</Mono>
                {record.addedAt && (
                  <Mono size={7} color={C.textDim} style={{ letterSpacing: '0.2em' }}>
                    ADDED {new Date(record.addedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()}
                  </Mono>
                )}
              </div>

              {/* Song list preview */}
              <div style={{
                padding: 8, background: C.card,
                border: `1px solid ${C.border}`, marginBottom: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <Mono size={7} color={C.textDim} style={{ letterSpacing: '0.3em' }}>SONGS ON FILE</Mono>
                  <Mono size={8} color={C.silver} style={{ letterSpacing: '0.1em', fontWeight: 700 }}>
                    {songs.length}
                  </Mono>
                </div>
                {songs.length === 0 ? (
                  <Mono size={9} color={C.textDim} style={{ letterSpacing: '0.1em', display: 'block', textAlign: 'center', padding: '6px 0' }}>
                    — no songs tracked —
                  </Mono>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 110, overflowY: 'auto' }} className="scrollbar-hide">
                    {songs.slice(0, 12).map((s, i) => (
                      <Mono key={i} size={9} color="#fff" style={{ letterSpacing: '0.03em' }}>
                        · {s}
                      </Mono>
                    ))}
                    {songs.length > 12 && (
                      <Mono size={8} color={C.textDim} style={{ letterSpacing: '0.15em', marginTop: 2 }}>
                        ...+{songs.length - 12} MORE
                      </Mono>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {onSetSongs && (
                  <button
                    onClick={() => { setEditingSongs(true); setSongDraft(songs.join('\n')); }}
                    style={poolActionBtnText(C.amber)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Plus size={11} /> EDIT SONGS
                    </span>
                  </button>
                )}
                {onRename && !renamingTo && (
                  <button
                    onClick={() => setRenamingTo(name)}
                    style={poolActionBtnText(C.blueLight)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <RotateCcw size={11} /> RENAME
                    </span>
                  </button>
                )}
                {isHidden ? (
                  <button onClick={onRestore} style={poolActionBtnText(C.green)}>
                    <span className="inline-flex items-center gap-1.5">
                      <RotateCcw size={11} /> RESTORE
                    </span>
                  </button>
                ) : (
                  <button onClick={onHide} style={poolActionBtnText(C.silver)}>
                    <span className="inline-flex items-center gap-1.5">
                      <Lock size={11} /> HIDE
                    </span>
                  </button>
                )}
                <button onClick={onDelete} style={poolActionBtnText(C.red)}>
                  <span className="inline-flex items-center gap-1.5">
                    <X size={11} /> DELETE
                  </span>
                </button>
              </div>

              {/* V12.19: RENAME sub-form */}
              {renamingTo !== null && (
                <div style={{
                  marginTop: 10, padding: 10,
                  background: C.dark, border: `2px solid ${C.blueLight}`,
                }}>
                  <Mono size={8} color={C.blueLight} style={{
                    letterSpacing: '0.25em', display: 'block', marginBottom: 6, fontWeight: 700,
                  }}>
                    RENAME — FIX SPELLING / TYPO
                  </Mono>
                  <Mono size={8} color={C.textDim} style={{
                    letterSpacing: '0.05em', display: 'block', marginBottom: 8, lineHeight: 1.4,
                  }}>
                    Rewrites this artist EVERYWHERE: catalog, every station's pool, all event history, career stats. Cannot be undone except via game-level UNDO (which only restores game state, not stats/pools).
                  </Mono>
                  <input
                    type="text"
                    value={renamingTo}
                    onChange={e => setRenamingTo(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      background: C.darker, border: `2px solid ${C.border}`,
                      color: C.text,
                      fontFamily: '"Oswald", sans-serif', fontSize: 14, fontWeight: 700,
                      padding: '8px 10px', marginBottom: 8,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button
                      onClick={() => {
                        const trimmed = (renamingTo || '').trim();
                        if (!trimmed || trimmed === name) {
                          setRenamingTo(null);
                          return;
                        }
                        setPendingRename(trimmed);
                      }}
                      style={poolActionBtnText(C.green)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        APPLY RENAME
                      </span>
                    </button>
                    <button
                      onClick={() => { setRenamingTo(null); }}
                      style={poolActionBtnText(C.silver)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        CANCEL
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* V12.19: Rename confirmation modal */}
              {pendingRename && (
                <Modal
                  title="CONFIRM RENAME"
                  onClose={() => setPendingRename(null)}
                  dismissible={true}
                >
                  <div style={{ padding: 12 }}>
                    <Mono size={9} color={C.silver} style={{
                      letterSpacing: '0.15em', display: 'block', marginBottom: 8,
                    }}>
                      RENAME ARTIST:
                    </Mono>
                    <div style={{
                      padding: 10, background: C.darker, border: `1px solid ${C.border}`, marginBottom: 10,
                    }}>
                      <Stencil size={14} color={C.redLight} tracking="0.05em" style={{
                        display: 'block', textDecoration: 'line-through', marginBottom: 4,
                      }}>
                        {name}
                      </Stencil>
                      <Mono size={8} color={C.textDim} style={{ letterSpacing: '0.2em', display: 'block', marginBottom: 4 }}>
                        →
                      </Mono>
                      <Stencil size={16} color={C.greenLight} tracking="0.05em">
                        {pendingRename}
                      </Stencil>
                    </div>
                    <Mono size={9} color={C.textDim} style={{
                      letterSpacing: '0.05em', lineHeight: 1.5, display: 'block', marginBottom: 12,
                    }}>
                      This will rewrite the artist's name across this station's pool, all stations' pools, the current game state, every entry in week history, and your career stats. If a record with the new name already exists, the two will be merged.
                    </Mono>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn
                        onClick={() => {
                          onRename(pendingRename);
                          setPendingRename(null);
                          setRenamingTo(null);
                          setExpanded(false);
                        }}
                        variant="primary"
                      >
                        APPLY RENAME
                      </Btn>
                      <Btn onClick={() => setPendingRename(null)} variant="ghost">
                        CANCEL
                      </Btn>
                    </div>
                  </div>
                </Modal>
              )}
            </>
          )}

          {/* EDIT SONGS sub-step */}
          {editingSongs && (
            <div>
              <Mono size={8} color={C.amber} style={{ letterSpacing: '0.25em', display: 'block', marginBottom: 6 }}>
                EDIT SONGS · ONE PER LINE
              </Mono>
              <textarea
                value={songDraft}
                onChange={e => setSongDraft(e.target.value)}
                placeholder={`e.g.\nAlive\nBlack\nEven Flow`}
                rows={8}
                style={{
                  width: '100%',
                  background: C.dark, border: `2px solid ${C.border}`,
                  color: C.text,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                  padding: '8px 10px', resize: 'vertical',
                  marginBottom: 8,
                }}
              />
              <div style={{ display: 'flex', gap: 5 }}>
                <button
                  onClick={() => {
                    const list = songDraft.split('\n').map(s => s.trim()).filter(Boolean);
                    onSetSongs(list);
                    setEditingSongs(false);
                  }}
                  style={{ ...poolActionBtnText(C.green), flex: 1 }}
                >
                  SAVE
                </button>
                <button
                  onClick={() => setEditingSongs(false)}
                  style={{ ...poolActionBtnText(C.silver), flex: 1 }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Wider text-button variant for the expanded scouting actions.
const poolActionBtnText = (color) => ({
  flex: 'none', padding: '6px 10px',
  background: `${color}15`,
  border: `1px solid ${color}55`,
  color,
  fontFamily: '"Oswald", sans-serif', fontWeight: 700, fontSize: 10,
  letterSpacing: '0.15em', textTransform: 'uppercase',
  cursor: 'pointer',
});

function StatChip({ label, value, accent }) {
  const color = accent || C.silver;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3 }}>
      <Mono size={7} color={C.textDim} style={{ letterSpacing: '0.2em' }}>{label}</Mono>
      <Mono size={10} color={color} style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Mono>
    </span>
  );
}

const poolActionBtn = (color) => ({
  width: 30, height: 30,
  background: 'transparent',
  border: `1px solid ${color}66`,
  color,
  cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
});

// ============================================================
// ADJACENCY CONFIRM MODAL (V12.3)
// ============================================================
// Pops when a score would trigger B2B or Triple. Asks: was the previous
// scoring song the song IMMEDIATELY BEFORE this one on the radio? If yes,
// the engine applies the streak bonus normally. If no, we break the
// streak before scoring so no spurious bonus fires.

function AdjacencyConfirmModal({ ds, game, pending, onYes, onNo, onCancel }) {
  const prevPlayer = ds.lastScorer;
  // V12.6: pending.kind tags which variant of the prompt to show.
  // Falls back to the inferred B2B/Triple flow for legacy callers.
  const kind = pending.kind || (ds.consecutiveCount >= 2 ? 'triple' : 'b2b');
  const isTripleAttempt = kind === 'triple';
  const isRetaliation = kind === 'retaliation';
  const playerColor = pending.player === 0 ? C.green : C.silver;
  const playerName = game.players[pending.player].name;
  const opponentName = game.players[1 - pending.player].name;

  // Find the most recent live (non-removed, non-meta) event by the
  // *previous scoring player* (which for retaliation is the opponent,
  // for B2B/Triple is the same player extending their own streak).
  const lastEv = ds.events.find(e =>
    !e.removed && !e.meta && !e.blocked && e.effectivePlayer === prevPlayer
  );
  const lastArtist = lastEv?.artist || (isRetaliation ? 'THEIR LAST SONG' : 'YOUR LAST SONG');

  // Title + button copy per variant.
  const title = isRetaliation ? 'RETALIATION?'
    : isTripleAttempt ? 'THIRD IN A ROW?'
    : 'BACK-TO-BACK?';
  const yesLabel = isRetaliation ? 'YES — APPLY RETALIATION +1'
    : isTripleAttempt ? 'YES — TRIPLE IT'
    : 'YES — APPLY +1';
  const explanation = isRetaliation
    ? `Retaliation only fires when your song plays IMMEDIATELY AFTER ${opponentName.toUpperCase()}'s — no other artist between them.`
    : isTripleAttempt
    ? 'Triple-in-a-row only fires when 3 of your songs play back-to-back-to-back without any other artist between them.'
    : 'Back-to-Back only fires when your songs play consecutively without any other artist between them.';

  return (
    <Modal title={title} onClose={onCancel} dismissible={true}>
      <div style={{
        padding: 12,
        background: `${C.amber}22`,
        border: `2px solid ${C.amber}`,
        marginBottom: 12, textAlign: 'center',
      }}>
        <Stencil size={13} color={C.amber} tracking="0.15em" style={{ display: 'block', marginBottom: 6 }}>
          CONFIRM RADIO ADJACENCY
        </Stencil>
        <Mono size={10} color="#fff" style={{ display: 'block', letterSpacing: '0.05em', lineHeight: 1.5 }}>
          {isRetaliation ? (
            <>
              Did <span style={{ color: C.silver, fontWeight: 700 }}>{opponentName.toUpperCase()}'S {lastArtist.toUpperCase()}</span> play{' '}
              <span style={{ color: C.amber, fontWeight: 700 }}>immediately before</span>{' '}
              <span style={{ color: playerColor, fontWeight: 700 }}>{pending.artist.toUpperCase()}</span> on the radio?
            </>
          ) : (
            <>
              Did <span style={{ color: C.amber, fontWeight: 700 }}>{lastArtist.toUpperCase()}</span> play{' '}
              <span style={{ color: C.amber, fontWeight: 700 }}>immediately before</span>{' '}
              <span style={{ color: playerColor, fontWeight: 700 }}>{pending.artist.toUpperCase()}</span> on the radio?
            </>
          )}
        </Mono>
        <Mono size={9} color={C.silver} style={{ display: 'block', marginTop: 8, letterSpacing: '0.1em', opacity: 0.85 }}>
          {explanation}
        </Mono>
      </div>

      <div className="space-y-2">
        <Btn onClick={onYes} variant="primary">
          <span className="inline-flex items-center gap-2">
            {isRetaliation ? <Zap size={16} /> : <Flame size={16} />} {yesLabel}
          </span>
        </Btn>
        <Btn onClick={onNo} variant="ghost">
          NO — SOMETHING ELSE PLAYED IN BETWEEN
        </Btn>
      </div>

      <Mono size={8} color={C.textDim} style={{
        display: 'block', textAlign: 'center', marginTop: 10, letterSpacing: '0.1em',
      }}>
        TIP: TAP "NEUTRAL SONG PLAYED" WHEN UNRELATED SONGS PLAY TO AVOID THIS PROMPT
      </Mono>
    </Modal>
  );
}

// V12.15: COUNTER-STEAL modal. Shown immediately when a Steal is
// armed. The victim picks ONE artist from the stealer's CURRENT
// drafted roster — that artist becomes a "trap" for the next song:
// if it plays, the victim collects all scoring outcomes instead of
// the stealer. If the victim declines, the original Steal proceeds
// uncontested.
function CounterStealModal({ game, ds, stealerIdx, victimIdx, stealerDrafts, onPick, onDecline }) {
  const stealerName = game.players[stealerIdx].name;
  const victimName = game.players[victimIdx].name;
  const stealerColor = stealerIdx === 0 ? C.green : C.silver;
  const victimColor = victimIdx === 0 ? C.green : C.silver;
  return (
    <Modal title="COUNTER-STEAL" onClose={onDecline} dismissible={false}>
      {/* Dramatic header — frames the moment */}
      <div style={{
        padding: 12,
        background: `${C.red}22`,
        border: `2px solid ${C.red}`,
        marginBottom: 12, textAlign: 'center',
      }}>
        <Stencil size={13} color={C.red} tracking="0.18em" style={{ display: 'block', marginBottom: 6 }}>
          STEAL ACTIVATED
        </Stencil>
        <Mono size={10} color="#fff" style={{ display: 'block', letterSpacing: '0.06em', lineHeight: 1.5 }}>
          <span style={{ color: stealerColor, fontWeight: 700 }}>{stealerName.toUpperCase()}</span>{' '}
          is stealing{' '}
          <span style={{ color: victimColor, fontWeight: 700 }}>{victimName.toUpperCase()}</span>'s
          next scoring outcome.
        </Mono>
        <Mono size={9} color={C.amber} style={{
          display: 'block', marginTop: 8, letterSpacing: '0.12em', lineHeight: 1.5, fontWeight: 700,
        }}>
          {victimName.toUpperCase()} — PICK 1 ARTIST FROM {stealerName.toUpperCase()}'S TEAM TO HIJACK BACK.
        </Mono>
      </div>

      <Mono size={9} color={C.textDim} className="block" style={{
        marginBottom: 8, letterSpacing: '0.12em',
      }}>
        IF THE NEXT SONG IS YOUR PICK, YOU GET THE POINTS.
      </Mono>

      {/* Artist grid — opponent's currently drafted roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 12 }}>
        {stealerDrafts.map(artist => (
          <button
            key={artist}
            onClick={() => onPick(artist)}
            style={{
              padding: '14px 8px',
              background: `${stealerColor}22`,
              border: `2px solid ${stealerColor}`,
              color: '#fff',
              fontFamily: '"Oswald", sans-serif',
              fontWeight: 700, fontSize: 13,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              textAlign: 'center', cursor: 'pointer',
              minHeight: 52,
            }}
            className="active:translate-y-0.5 transition-transform"
          >
            {artist}
          </button>
        ))}
      </div>

      <Btn onClick={onDecline} variant="ghost" size="md">
        DECLINE — TAKE THE LOSS
      </Btn>

      <Mono size={8} color={C.textDim} style={{
        display: 'block', textAlign: 'center', marginTop: 10, letterSpacing: '0.1em',
      }}>
        COUNTER-STEAL RESOLVES ON THE SAME SONG AS THE STEAL. BOTH ARMS CLEAR AFTERWARD.
      </Mono>
    </Modal>
  );
}

// ============================================================
// EDIT EVENT MODAL (V12.3)
// ============================================================
// Tap any past event in the feed to inspect it and remove if needed.
// Removal subtracts points and rebuilds derived state — see
// engine.removeEvent. For now the only action is REMOVE; full editing
// (change artist, change song) is a future addition.

function EditEventModal({ event, game, canCorrect, customSongs, onClose, onRemove, onCorrect }) {
  // Internal sub-step state: null = main review, 'pickArtist' = artist swap,
  // 'pickSong' = song swap (when keeping same artist).
  const [step, setStep] = useState(null);
  const [chosenArtist, setChosenArtist] = useState(null);
  const [chosenSong, setChosenSong] = useState(null);
  const [songInput, setSongInput] = useState('');

  const playerColor = event.effectivePlayer === 0 ? C.green : event.effectivePlayer === 1 ? C.silver : C.amber;
  const playerName = event.effectivePlayer !== null && event.effectivePlayer !== undefined
    ? game.players[event.effectivePlayer].name
    : null;
  const ts = typeof event.timestamp === 'object'
    ? event.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : new Date(event.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (event.removed) {
    return (
      <Modal title="EVENT" onClose={onClose} dismissible={true}>
        <div style={{ padding: 14, textAlign: 'center' }}>
          <Mono size={10} color={C.redLight} style={{ letterSpacing: '0.25em', display: 'block', marginBottom: 6, fontWeight: 700 }}>
            ALREADY REMOVED
          </Mono>
          <Stencil size={14} color="#fff" tracking="0.05em" style={{ display: 'block', textDecoration: 'line-through', opacity: 0.6 }}>
            {event.artist}
          </Stencil>
          <Mono size={9} color={C.silver} style={{ display: 'block', marginTop: 6, letterSpacing: '0.1em' }}>
            {ts} · was {playerName || 'unknown'} · -{event.totalPoints || 0} pts removed
          </Mono>
        </div>
        <Btn onClick={onClose} variant="ghost">CLOSE</Btn>
      </Modal>
    );
  }

  // SUB-STEP: pick a replacement artist from the scoring player's roster.
  // Restricted to the same player who originally scored, because changing
  // the player is closer to "different event entirely" — use REMOVE + tap
  // the other player's artist for that.
  if (step === 'pickArtist') {
    const ownRoster = event.effectivePlayer !== null && event.effectivePlayer !== undefined
      ? game.currentDayState?.drafts?.[event.effectivePlayer] || []
      : [];
    // Engine state isn't passed here directly; pull drafts from event.owner
    // as fallback via game.currentDayState.
    const drafts = game.currentDayState?.drafts?.[event.effectivePlayer] || [];
    return (
      <Modal title="REVIEW PLAY" onClose={onClose} dismissible={true}>
        <div style={{
          padding: 10, background: `${C.amber}22`, border: `2px solid ${C.amber}`,
          marginBottom: 10,
        }}>
          <Stencil size={12} color={C.amber} tracking="0.15em" style={{ display: 'block' }}>
            WHO ACTUALLY PLAYED?
          </Stencil>
          <Mono size={9} color="#fff" style={{ marginTop: 3, display: 'block', lineHeight: 1.4 }}>
            ORIGINAL: <span style={{ color: C.silver, textDecoration: 'line-through' }}>{event.artist}</span>
          </Mono>
        </div>
        <div className="grid grid-cols-2 gap-1.5" style={{ marginBottom: 10 }}>
          {drafts.map(a => (
            <button
              key={a}
              onClick={() => {
                setChosenArtist(a);
                setStep('pickSong');
                setSongInput('');
              }}
              style={{
                padding: '9px 7px', background: C.darker,
                border: `2px solid ${a === event.artist ? C.silver : C.border}`,
                color: C.text,
                fontFamily: '"Oswald", sans-serif', fontWeight: 600, fontSize: 12,
                letterSpacing: '0.03em', textTransform: 'uppercase',
                cursor: 'pointer', minHeight: 40, textAlign: 'left',
              }}
            >{a}</button>
          ))}
        </div>
        <Btn onClick={() => setStep(null)} variant="ghost" size="md">BACK</Btn>
      </Modal>
    );
  }

  // SUB-STEP: optional song clarification. User can keep song blank
  // (which resolves any bonus matching as "no specific song claimed")
  // or enter the actual song title.
  if (step === 'pickSong' && chosenArtist) {
    const catalogSongs = [
      ...(ARTIST_SONG_CATALOG[chosenArtist] || []),
      ...((customSongs?.[chosenArtist]) || []),
    ];
    return (
      <Modal title="REVIEW PLAY" onClose={onClose} dismissible={true}>
        <div style={{
          padding: 10, background: `${C.amber}22`, border: `2px solid ${C.amber}`,
          marginBottom: 10,
        }}>
          <Stencil size={12} color={C.amber} tracking="0.15em" style={{ display: 'block' }}>
            {chosenArtist.toUpperCase()} — WHICH SONG?
          </Stencil>
          <Mono size={9} color="#fff" style={{ marginTop: 3, display: 'block', lineHeight: 1.4 }}>
            Specifying the song lets Bonus Song matching apply correctly.
          </Mono>
        </div>
        {catalogSongs.length > 0 && (
          <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 10 }} className="scrollbar-hide">
            <div className="space-y-1.5">
              {catalogSongs.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    onCorrect({ artist: chosenArtist, song: s });
                  }}
                  style={{
                    width: '100%', padding: '9px 11px',
                    background: C.darker, border: `2px solid ${C.border}`, color: C.text,
                    fontFamily: '"Oswald", sans-serif', fontWeight: 600, fontSize: 12,
                    letterSpacing: '0.03em', textAlign: 'left', cursor: 'pointer',
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}
        <input
          value={songInput}
          onChange={e => setSongInput(e.target.value)}
          placeholder="OR TYPE THE SONG"
          maxLength={40}
          style={{ ...inputStyle, fontSize: 13, padding: '10px 12px', marginBottom: 8 }}
        />
        <div className="space-y-2">
          <Btn
            onClick={() => onCorrect({ artist: chosenArtist, song: songInput.trim() || null })}
            variant="primary"
          >
            CONFIRM CORRECTION
          </Btn>
          <Btn onClick={() => setStep('pickArtist')} variant="ghost" size="md">BACK</Btn>
        </div>
      </Modal>
    );
  }

  // MAIN: review play, choose CORRECT or REMOVE
  return (
    <Modal title="REVIEW PLAY" onClose={onClose} dismissible={true}>
      <div style={{
        padding: 12, background: C.card,
        border: `2px solid ${C.border}`, borderLeft: `4px solid ${playerColor}`,
        marginBottom: 12, position: 'relative',
      }}>
        {event.isCorrection && (
          <Mono size={7} color={C.amber} style={{
            position: 'absolute', top: 6, right: 8,
            letterSpacing: '0.3em',
            padding: '1px 5px',
            background: `${C.amber}22`,
            border: `1px solid ${C.amber}55`,
          }}>CORRECTED</Mono>
        )}
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <Mono size={9} color={C.textDim}>{ts}</Mono>
          {playerName && (
            <Stencil size={11} color={playerColor} tracking="0.18em">{playerName}</Stencil>
          )}
        </div>
        <Stencil size={16} color="#fff" tracking="0.04em" style={{ display: 'block', marginBottom: 4 }}>
          {event.artist || '(no artist)'}
        </Stencil>
        {event.song && (
          <Mono size={10} color={C.silver} style={{ display: 'block', marginBottom: 4 }}>
            "{event.song}"
          </Mono>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginTop: 6 }}>
          <Mono size={9} color={C.textDim} style={{ letterSpacing: '0.2em' }}>TOTAL</Mono>
          <Stencil size={20} color={playerColor} style={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            +{event.totalPoints || 0}
          </Stencil>
        </div>
        {event.parts && event.parts.length > 1 && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${C.border}` }}>
            <Mono size={8} color={C.textDim} style={{ letterSpacing: '0.25em', display: 'block', marginBottom: 4 }}>
              BREAKDOWN
            </Mono>
            {event.parts.slice(event.song ? 2 : 1).map((p, i) => (
              <Mono key={i} size={9} color="#fff" style={{ display: 'block', letterSpacing: '0.05em' }}>
                · {p}
              </Mono>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {canCorrect && onCorrect && (
          <Btn onClick={() => setStep('pickArtist')} variant="amber">
            <span className="inline-flex items-center gap-2">
              <RotateCcw size={16} /> CORRECT THIS PLAY
            </span>
          </Btn>
        )}
        <Btn onClick={onRemove} variant="danger">
          <span className="inline-flex items-center gap-2">
            <X size={16} /> REMOVE
          </span>
        </Btn>
        <Btn onClick={onClose} variant="ghost">CLOSE</Btn>
      </div>

      {canCorrect && (
        <Mono size={8} color={C.textDim} style={{
          display: 'block', textAlign: 'center', marginTop: 8, letterSpacing: '0.1em',
        }}>
          CORRECT IS AVAILABLE ON THE MOST RECENT PLAY ONLY
        </Mono>
      )}
    </Modal>
  );
}

// ============================================================
// SKIP DAY MODAL (V12.5)
// ============================================================
// Shared confirmation surface for skipping a workday without
// declaring a winner. Triggered from two places:
//   1. Draft screen (day hasn't really started)
//   2. End Day modal (you played but don't want to call it)
// Both flows dispatch the same SKIP_DAY action. The destructive
// nature (partial state discarded) is called out explicitly.

function SkipDayModal({ game, onClose, onConfirm }) {
  const ds = game.currentDayState;
  const hasDraft = (ds.drafts?.[0]?.length || 0) > 0 || (ds.drafts?.[1]?.length || 0) > 0;
  const hasScore = (ds.scores?.[0] || 0) > 0 || (ds.scores?.[1] || 0) > 0;
  const hasEvents = (ds.events || []).some(e => !e.meta && !e.removed);

  return (
    <Modal title="SKIP THIS DAY" onClose={onClose}>
      <div style={{
        padding: 12,
        background: `${C.amber}22`,
        border: `2px solid ${C.amber}`,
        marginBottom: 12,
      }}>
        <Stencil size={13} color={C.amber} tracking="0.15em" style={{ display: 'block', marginBottom: 6 }}>
          NO WORK TODAY?
        </Stencil>
        <Mono size={10} color="#fff" style={{ display: 'block', lineHeight: 1.5, letterSpacing: '0.04em' }}>
          Skipping a day means <span style={{ color: C.amber, fontWeight: 700 }}>no winner is declared</span> and{' '}
          <span style={{ color: C.amber, fontWeight: 700 }}>no weekly win is awarded</span>. The week continues from the next day.
        </Mono>
      </div>

      {(hasDraft || hasScore || hasEvents) && (
        <div style={{
          padding: 11,
          background: `${C.red}11`,
          border: `1px solid ${C.red}66`,
          marginBottom: 12,
        }}>
          <Mono size={9} color={C.redLight} style={{
            letterSpacing: '0.18em', display: 'block', marginBottom: 6, fontWeight: 700,
          }}>
            WILL BE DISCARDED:
          </Mono>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {hasDraft && (
              <Mono size={9} color="#fff" style={{ letterSpacing: '0.05em' }}>
                · DRAFTS ({(ds.drafts[0]?.length || 0) + (ds.drafts[1]?.length || 0)} ARTISTS)
              </Mono>
            )}
            {hasEvents && (
              <Mono size={9} color="#fff" style={{ letterSpacing: '0.05em' }}>
                · {ds.events.filter(e => !e.meta && !e.removed).length} SCORED PLAY{ds.events.filter(e => !e.meta && !e.removed).length === 1 ? '' : 'S'}
              </Mono>
            )}
            {hasScore && (
              <Mono size={9} color="#fff" style={{ letterSpacing: '0.05em' }}>
                · CURRENT SCORE {ds.scores[0]}–{ds.scores[1]}
              </Mono>
            )}
          </div>
          <Mono size={8} color={C.textDim} style={{
            display: 'block', marginTop: 6, letterSpacing: '0.1em', lineHeight: 1.4,
          }}>
            (UNDO IS AVAILABLE IF YOU CHANGE YOUR MIND)
          </Mono>
        </div>
      )}

      <Mono size={9} color={C.silver} style={{
        display: 'block', textAlign: 'center', marginBottom: 12,
        letterSpacing: '0.1em', lineHeight: 1.5,
      }}>
        DAY {game.currentDay} WILL BE MARKED <span style={{ color: C.amber, fontWeight: 700 }}>SKIPPED</span> IN THE WEEKLY RECAP.
        {game.currentDay >= 5 && (
          <>
            <br />
            <span style={{ color: C.amber, fontWeight: 700 }}>THIS ENDS THE WEEK.</span>
          </>
        )}
      </Mono>

      <div className="space-y-2">
        <Btn onClick={onConfirm} variant="amber">
          <span className="inline-flex items-center gap-2">
            <ChevronRight size={16} /> CONFIRM — SKIP DAY {game.currentDay}
          </span>
        </Btn>
        <Btn onClick={onClose} variant="ghost" size="md">CANCEL</Btn>
      </div>
    </Modal>
  );
}
