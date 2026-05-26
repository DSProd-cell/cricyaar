// ─── PLAYERS ────────────────────────────────────────────────────────────────
export const PLAYERS = [
  { id:'p1',  name:'Rohit Sharma',     username:'rohit_s',    phone:'+919876543210', city:'Mumbai',   roles:['player','organiser'], avatar:null,
    batting:{ runs:3247, innings:98,  dismissed:80, notOut:18, avg:40.6, sr:138.4, hs:143, fifties:18, hundreds:4, ducks:5 },
    bowling:{ wkts:22,  overs:87.3,  runs:712,  eco:8.1,  avg:32.4, best:'3/18', threeWickets:2, fiveWickets:0 },
    fielding:{ catches:34, runOuts:8, stumpings:0 } },
  { id:'p2',  name:'Virat Kohli',      username:'virat_k',    phone:'+919876543211', city:'Delhi',    roles:['player'], avatar:null,
    batting:{ runs:4108, innings:112, dismissed:95, notOut:17, avg:43.2, sr:142.1, hs:168, fifties:22, hundreds:6, ducks:3 },
    bowling:{ wkts:8,   overs:31.0,  runs:289,  eco:9.3,  avg:36.1, best:'2/24', threeWickets:0, fiveWickets:0 },
    fielding:{ catches:51, runOuts:12, stumpings:0 } },
  { id:'p3',  name:'Hardik Pandya',    username:'hardik_p',   phone:'+919876543212', city:'Mumbai',   roles:['player'], avatar:null,
    batting:{ runs:1834, innings:72,  dismissed:58, notOut:14, avg:31.6, sr:162.3, hs:89,  fifties:9,  hundreds:0, ducks:7 },
    bowling:{ wkts:67,  overs:142.4, runs:1087, eco:7.6,  avg:16.2, best:'4/22', threeWickets:5, fiveWickets:1 },
    fielding:{ catches:28, runOuts:6, stumpings:0 } },
  { id:'p4',  name:'Jasprit Bumrah',   username:'jasprit_b',  phone:'+919876543213', city:'Mumbai',   roles:['player'], avatar:null,
    batting:{ runs:58,   innings:28,  dismissed:14, notOut:14, avg:4.1,  sr:68.2,  hs:12,  fifties:0,  hundreds:0, ducks:11 },
    bowling:{ wkts:118, overs:212.1, runs:1547, eco:7.3,  avg:13.1, best:'5/14', threeWickets:12, fiveWickets:3 },
    fielding:{ catches:18, runOuts:3, stumpings:0 } },
  { id:'p5',  name:'Shubman Gill',     username:'shubman_g',  phone:'+919876543214', city:'Chandigarh', roles:['player'], avatar:null,
    batting:{ runs:2867, innings:88,  dismissed:74, notOut:14, avg:38.7, sr:133.8, hs:126, fifties:16, hundreds:3, ducks:4 },
    bowling:{ wkts:3,   overs:9.2,   runs:78,   eco:8.4,  avg:26.0, best:'1/8',  threeWickets:0, fiveWickets:0 },
    fielding:{ catches:29, runOuts:5, stumpings:0 } },
  { id:'p6',  name:'KL Rahul',         username:'kl_rahul',   phone:'+919876543215', city:'Bengaluru', roles:['player','umpire'], avatar:null,
    batting:{ runs:2541, innings:82,  dismissed:68, notOut:14, avg:37.4, sr:128.6, hs:114, fifties:14, hundreds:2, ducks:6 },
    bowling:{ wkts:0,   overs:0,     runs:0,    eco:0,    avg:0,    best:'—',  threeWickets:0, fiveWickets:0 },
    fielding:{ catches:44, runOuts:4, stumpings:18 } },
  { id:'p7',  name:'Ravindra Jadeja',  username:'jadeja_r',   phone:'+919876543216', city:'Rajkot',   roles:['player'], avatar:null,
    batting:{ runs:1623, innings:65,  dismissed:48, notOut:17, avg:33.8, sr:148.7, hs:78,  fifties:7,  hundreds:0, ducks:5 },
    bowling:{ wkts:94,  overs:198.3, runs:1401, eco:7.1,  avg:14.9, best:'5/22', threeWickets:9, fiveWickets:2 },
    fielding:{ catches:38, runOuts:14, stumpings:0 } },
  { id:'p8',  name:'Axar Patel',       username:'axar_p',     phone:'+919876543217', city:'Ahmedabad', roles:['player'], avatar:null,
    batting:{ runs:987,  innings:48,  dismissed:34, notOut:14, avg:29.0, sr:139.4, hs:64,  fifties:3,  hundreds:0, ducks:4 },
    bowling:{ wkts:72,  overs:156.2, runs:1082, eco:6.9,  avg:15.0, best:'4/18', threeWickets:7, fiveWickets:1 },
    fielding:{ catches:22, runOuts:7, stumpings:0 } },
  { id:'p9',  name:'Rishabh Pant',     username:'rishabh_p',  phone:'+919876543218', city:'Delhi',    roles:['player'], avatar:null,
    batting:{ runs:2134, innings:76,  dismissed:61, notOut:15, avg:34.9, sr:155.2, hs:102, fifties:11, hundreds:2, ducks:8 },
    bowling:{ wkts:0,   overs:0,     runs:0,    eco:0,    avg:0,    best:'—',  threeWickets:0, fiveWickets:0 },
    fielding:{ catches:34, runOuts:3, stumpings:22 } },
  { id:'p10', name:'Mohammed Siraj',   username:'siraj_m',    phone:'+919876543219', city:'Hyderabad', roles:['player'], avatar:null,
    batting:{ runs:124,  innings:38,  dismissed:22, notOut:16, avg:5.6,  sr:72.1,  hs:14,  fifties:0,  hundreds:0, ducks:13 },
    bowling:{ wkts:89,  overs:176.4, runs:1312, eco:7.4,  avg:14.7, best:'4/12', threeWickets:9, fiveWickets:2 },
    fielding:{ catches:12, runOuts:4, stumpings:0 } },
  { id:'p11', name:'Suryakumar Yadav', username:'surya_k',    phone:'+919876543220', city:'Mumbai',   roles:['player'], avatar:null,
    batting:{ runs:3012, innings:94,  dismissed:78, notOut:16, avg:38.6, sr:172.4, hs:117, fifties:16, hundreds:3, ducks:6 },
    bowling:{ wkts:4,   overs:12.1,  runs:98,   eco:8.1,  avg:24.5, best:'2/12', threeWickets:0, fiveWickets:0 },
    fielding:{ catches:36, runOuts:7, stumpings:0 } },
  { id:'p12', name:'Priya Menon',      username:'priya_m',    phone:'+919876543221', city:'Chennai',  roles:['organiser','ground_owner'], avatar:null,
    batting:{ runs:0, innings:0, dismissed:0, notOut:0, avg:0, sr:0, hs:0, fifties:0, hundreds:0, ducks:0 },
    bowling:{ wkts:0, overs:0, runs:0, eco:0, avg:0, best:'—', threeWickets:0, fiveWickets:0 },
    fielding:{ catches:0, runOuts:0, stumpings:0 } },
];

// ─── TEAMS ──────────────────────────────────────────────────────────────────
export const TEAMS = [
  { id:'t1', name:'Mumbai Mavericks',  code:'MUM-7X2', city:'Mumbai',    color:'#22c55e', captain:'p1', wins:18, losses:7, nr:1, visibility:'invite_only',
    squad:['p1','p3','p4','p5','p9','p11','p12'], matchHistory:[] },
  { id:'t2', name:'Delhi Dragons',     code:'DEL-9K4', city:'Delhi',     color:'#dc2626', captain:'p2', wins:14, losses:10, nr:2, visibility:'open',
    squad:['p2','p6','p9','p10','p12'], matchHistory:[] },
  { id:'t3', name:'Chennai Chiefs',    code:'CHE-3M8', city:'Chennai',   color:'#f59e0b', captain:'p12', wins:11, losses:12, nr:1, visibility:'invite_only',
    squad:['p7','p8','p12'], matchHistory:[] },
  { id:'t4', name:'Bengaluru Bulls',   code:'BLR-5P1', city:'Bengaluru', color:'#8b5cf6', captain:'p6', wins:9, losses:14, nr:0, visibility:'open',
    squad:['p6','p7','p8'], matchHistory:[] },
];

// ─── GROUNDS ────────────────────────────────────────────────────────────────
export const GROUNDS = [
  { id:'g1', name:'Wankhede Cricket Ground',      area:'Marine Drive',     city:'Mumbai',    state:'Maharashtra',
    pitchType:'Turf',    pitchCondition:'Fresh', floodlights:true, floodlightHours:'6 PM – 11 PM',
    rentPerHour:1200, rentPerMatch:null, rating:4.7, ratingCount:138, matchCount:312,
    facilities:{ parking:true, changingRoom:true, practiceNets:true, washrooms:true, cafeteria:true, firstAid:true },
    photos:[], lat:18.938, lng:72.825,
    ownerName:'Anil Kurup', ownerPhone:'+912222345678',
    recentMatches:['m1','m3'] },
  { id:'g2', name:'Kotla Cricket Club',           area:'Vikas Marg',       city:'Delhi',     state:'Delhi',
    pitchType:'Turf',    pitchCondition:'Worn',  floodlights:true, floodlightHours:'5 PM – 10 PM',
    rentPerHour:900,  rentPerMatch:3500, rating:4.2, ratingCount:84, matchCount:218,
    facilities:{ parking:true, changingRoom:true, practiceNets:false, washrooms:true, cafeteria:false, firstAid:true },
    photos:[], lat:28.649, lng:77.235,
    ownerName:'Deepak Verma', ownerPhone:'+911145678901',
    recentMatches:[] },
  { id:'g3', name:'Chepauk Sports Arena',         area:'Chepauk',          city:'Chennai',   state:'Tamil Nadu',
    pitchType:'Red Soil',pitchCondition:'Damp',  floodlights:false, floodlightHours:null,
    rentPerHour:null, rentPerMatch:2000, rating:3.8, ratingCount:52, matchCount:97,
    facilities:{ parking:false, changingRoom:true, practiceNets:true, washrooms:true, cafeteria:false, firstAid:false },
    photos:[], lat:13.061, lng:80.279,
    ownerName:'Priya Sundar', ownerPhone:'+914423456789',
    recentMatches:[] },
  { id:'g4', name:'Chinnaswamy Box Cricket',      area:'MG Road',          city:'Bengaluru', state:'Karnataka',
    pitchType:'Matting', pitchCondition:'Unknown',floodlights:true, floodlightHours:'7 PM – 12 AM',
    rentPerHour:600,  rentPerMatch:null, rating:4.5, ratingCount:203, matchCount:478,
    facilities:{ parking:true, changingRoom:false, practiceNets:false, washrooms:true, cafeteria:true, firstAid:true },
    photos:[], lat:12.978, lng:77.597,
    ownerName:'Kiran Rao', ownerPhone:'+918023456789',
    recentMatches:[] },
  { id:'g5', name:'Bandra Box Cricket Arena',     area:'Bandra West',      city:'Mumbai',    state:'Maharashtra',
    pitchType:'Matting', pitchCondition:'Fresh', floodlights:true, floodlightHours:'All day',
    rentPerHour:500,  rentPerMatch:null, rating:4.3, ratingCount:167, matchCount:541,
    facilities:{ parking:false, changingRoom:true, practiceNets:false, washrooms:true, cafeteria:true, firstAid:false },
    photos:[], lat:19.059, lng:72.829,
    ownerName:'Salim Sheikh', ownerPhone:'+912222987654',
    recentMatches:[] },
  { id:'g6', name:'Mullanpur Sports Complex',     area:'Mullanpur',        city:'Chandigarh',state:'Punjab',
    pitchType:'Astro Turf',pitchCondition:'Fresh',floodlights:true, floodlightHours:'6 PM – 11 PM',
    rentPerHour:800,  rentPerMatch:2800, rating:4.6, ratingCount:89, matchCount:164,
    facilities:{ parking:true, changingRoom:true, practiceNets:true, washrooms:true, cafeteria:true, firstAid:true },
    photos:[], lat:30.671, lng:76.745,
    ownerName:'Gurpreet Singh', ownerPhone:'+911723456789',
    recentMatches:[] },
  { id:'g7', name:'Hyderabad Cricket Club',       area:'Banjara Hills',    city:'Hyderabad', state:'Telangana',
    pitchType:'Cement',  pitchCondition:'Worn',  floodlights:false, floodlightHours:null,
    rentPerHour:400,  rentPerMatch:1200, rating:3.5, ratingCount:41, matchCount:73,
    facilities:{ parking:true, changingRoom:false, practiceNets:false, washrooms:false, cafeteria:false, firstAid:false },
    photos:[], lat:17.413, lng:78.448,
    ownerName:'Venkat Reddy', ownerPhone:'+914023456789',
    recentMatches:[] },
];

// ─── MATCHES ─────────────────────────────────────────────────────────────────
export const MATCHES = [
  {
    id:'m1', status:'live', name:'MUM vs DEL — MPL Final',
    ground:'g1', date:'2024-03-20', time:'14:00',
    overs:20, tournament:'tr1',
    assignedScorerUserId:'p1',
    team1:'t1', team2:'t2',
    tossWinner:'t1', tossChoice:'bat',
    xi1:['p1','p3','p4','p5','p9','p11'], xi2:['p2','p6','p10'],
    innings:[
      { team:'t1', balls:[], runs:78, wkts:1, overs:3.4,
        batters:{ p1:{ runs:47, balls:26, fours:4, sixes:3, out:false },
                  p5:{ runs:31, balls:22, fours:2, sixes:1, out:false },
                  p3:{ runs:0,  balls:0,  fours:0, sixes:0, out:false } },
        bowlers:{ p2:{ overs:0, runs:0, wkts:0 }, p10:{ overs:3.4, runs:28, wkts:1 } },
        striker:'p1', nonStriker:'p5', currentBowler:'p10',
        fow:[ { wkt:1, runs:18, over:'2.3', player:'p3', how:'Caught' } ] },
      { team:'t2', balls:[], runs:0, wkts:0, overs:0, batters:{}, bowlers:{}, striker:null, nonStriker:null, currentBowler:null, fow:[] }
    ],
    scoring:{ currentInnings:0, legalBallsThisOver:0, thisOver:['4','•','1','6'] }
  },
  {
    id:'m2', status:'upcoming', name:'CHE vs BLR — Group A',
    ground:'g3', date:'2024-03-22', time:'09:00',
    overs:15, tournament:'tr1',
    assignedScorerUserId:'p7',
    team1:'t3', team2:'t4',
    tossWinner:null, tossChoice:null,
    xi1:[], xi2:[],
    innings:[], scoring:null
  },
  {
    id:'m3', status:'completed', name:'MUM vs CHE — Group B',
    ground:'g1', date:'2024-03-15', time:'14:00',
    overs:20, tournament:'tr1',
    team1:'t1', team2:'t3',
    tossWinner:'t3', tossChoice:'field',
    xi1:['p1','p3','p5','p9','p11'], xi2:['p7','p8','p12'],
    result:{ winner:'t1', margin:'38 runs', type:'runs' },
    innings:[
      { team:'t1', runs:187, wkts:5, overs:20,
        batters:{ p1:{ runs:78, balls:48, fours:6, sixes:4, out:true, how:'Caught', bowler:'p7' },
                  p5:{ runs:52, balls:38, fours:5, sixes:1, out:false },
                  p3:{ runs:33, balls:18, fours:2, sixes:2, out:true, how:'Bowled', bowler:'p8' },
                  p9:{ runs:12, balls:10, fours:1, sixes:0, out:true, how:'Run Out' },
                  p11:{ runs:8,  balls:6,  fours:1, sixes:0, out:true, how:'LBW', bowler:'p7' } },
        bowlers:{}, fow:[
          { wkt:1, runs:54,  over:'6.2',  player:'p1',  how:'Caught' },
          { wkt:2, runs:121, over:'13.4', player:'p3',  how:'Bowled' },
          { wkt:3, runs:148, over:'16.1', player:'p9',  how:'Run Out' },
          { wkt:4, runs:162, over:'17.3', player:'p11', how:'LBW' },
        ] },
      { team:'t3', runs:149, wkts:8, overs:20,
        batters:{ p7:{ runs:44, balls:34, fours:3, sixes:1, out:true, how:'Caught' },
                  p8:{ runs:61, balls:42, fours:5, sixes:2, out:false },
                  p12:{ runs:22, balls:18, fours:2, sixes:0, out:true, how:'Bowled' } },
        bowlers:{ p4:{ overs:4, runs:28, wkts:3 }, p3:{ overs:3, runs:31, wkts:2 } },
        fow:[] }
    ], scoring:null
  },
  {
    id:'m4', status:'completed', name:'DEL vs BLR — Group A',
    ground:'g2', date:'2024-03-14', time:'09:00',
    overs:20, tournament:'tr1',
    team1:'t2', team2:'t4',
    tossWinner:'t2', tossChoice:'bat',
    xi1:['p2','p6','p10'], xi2:['p6','p7','p8'],
    result:{ winner:'t2', margin:'6 wickets', type:'wickets' },
    innings:[
      { team:'t2', runs:168, wkts:4, overs:17.2,
        batters:{ p2:{ runs:91, balls:58, fours:7, sixes:5, out:false },
                  p6:{ runs:44, balls:32, fours:4, sixes:1, out:true, how:'Caught' } },
        bowlers:{}, fow:[] },
      { team:'t4', runs:167, wkts:10, overs:20,
        batters:{ p7:{ runs:58, balls:44, fours:4, sixes:2, out:true, how:'Bowled' },
                  p8:{ runs:42, balls:35, fours:3, sixes:1, out:true, how:'Caught' } },
        bowlers:{ p10:{ overs:4, runs:26, wkts:4 } }, fow:[] }
    ], scoring:null
  }
];

// ─── TOURNAMENTS ─────────────────────────────────────────────────────────────
export const TOURNAMENTS = [
  { id:'tr1', name:'Mumbai Premier League 2024', type:'League+Knockout', overs:20,
    startDate:'2024-03-10', endDate:'2024-03-30', regDeadline:'2024-03-05',
    maxTeams:8, entryFee:5000, prize:'₹50,000 cash + trophy', status:'active',
    organiser:'p12',
    registeredTeams:['t1','t2','t3','t4'],
    approvedTeams:['t1','t2','t3','t4'],
    points:{ t1:{ p:3,w:2,l:1,nr:0,pts:4, nrr:0.82 }, t2:{ p:3,w:2,l:1,nr:0,pts:4, nrr:0.45 },
             t3:{ p:2,w:1,l:1,nr:0,pts:2, nrr:-0.38 }, t4:{ p:2,w:0,l:2,nr:0,pts:0, nrr:-1.12 } },
    matches:['m1','m2','m3','m4'] },
  { id:'tr2', name:'Delhi Corporate T10', type:'Knockout', overs:10,
    startDate:'2024-01-15', endDate:'2024-01-20', regDeadline:'2024-01-10',
    maxTeams:4, entryFee:2000, prize:'₹20,000 + medals', status:'completed',
    organiser:'p2',
    registeredTeams:['t1','t2'],
    approvedTeams:['t1','t2'],
    points:{ t1:{ p:1,w:1,l:0,nr:0,pts:2,nrr:1.24 }, t2:{ p:1,w:0,l:1,nr:0,pts:0,nrr:-1.24 } },
    matches:[], winner:'t1', runnerUp:'t2', potm:'p1' }
];

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const NOTIFICATIONS = [
  { id:'n1', type:'match',    read:false, time:'2 min ago',   title:'Match Starting Soon',
    body:'MUM vs DEL final starts in 30 minutes at Wankhede! 🏏',       link:'/my-cricket' },
  { id:'n2', type:'team',     read:false, time:'1 hour ago',  title:'Player Joined Your Team',
    body:'Suryakumar Yadav (@surya_k) joined Mumbai Mavericks.',         link:'/teams/t1' },
  { id:'n3', type:'tournament',read:true, time:'3 hours ago', title:'You\'re in the Final',
    body:'Mumbai Mavericks qualified for the MPL 2024 Final.',           link:'/tournaments/tr1' },
  { id:'n4', type:'ground',   read:true,  time:'Yesterday',   title:'Ground Approved',
    body:'Wankhede Cricket Ground submission has been verified.',         link:'/grounds/g1' },
  { id:'n5', type:'result',   read:true,  time:'2 days ago',  title:'Match Result',
    body:'Mumbai Mavericks beat Chennai Chiefs by 38 runs.',             link:'/my-cricket' },
];

// ─── UMPIRES ─────────────────────────────────────────────────────────────────
export const UMPIRES = [
  { id:'u1', playerId:'p6', experience:8, certs:'BCCI Level 2, MCA Certified',
    cities:['Mumbai','Pune','Nashik'], rating:4.4, ratingCount:47, matchesUmpired:89 },
];

// ─── ROLE METADATA ───────────────────────────────────────────────────────────
export const ROLE_META = {
  player:    { label:'Player',    color:'#3b82f6', bg:'#dbeafe', desc:'Track your stats, join teams, and play in matches.' },
  organiser: { label:'Organiser', color:'#16a34a', bg:'#dcfce7', desc:'Create matches and tournaments, manage teams, and score live.' },
  umpire:    { label:'Umpire',    color:'#d97706', bg:'#fef3c7', desc:'Get assigned to matches and track your umpiring record.' },
  fan:       { label:'Fan',       color:'#64748b', bg:'#f1f5f9', desc:'Follow live scores and match results.' },
  admin:     { label:'Admin',     color:'#7c3aed', bg:'#ede9fe', desc:'Full access to all features and the admin panel.' },
};

// ─── UMPIRE PROFILE (DEMO) ───────────────────────────────────────────────────
export const UMPIRE_PROFILE = {
  playerId: 'p1',
  rating: 4.3,
  ratingCount: 28,
  matchesUmpired: 28,
  ratingBreakdown: { 5:14, 4:9, 3:3, 2:1, 1:1 },
  certifications: 'BCCI Level 1, MCA Certified',
  cities: ['Mumbai', 'Pune'],
  assignments: [
    { id:'ua1', status:'upcoming',  date:'2024-03-20', teams:'MUM vs DEL — MPL Final',  ground:'Wankhede Cricket Ground', city:'Mumbai',    rating:null },
    { id:'ua2', status:'completed', date:'2024-03-15', teams:'MUM vs CHE — Group B',    ground:'Wankhede Cricket Ground', city:'Mumbai',    rating:4 },
    { id:'ua3', status:'completed', date:'2024-03-14', teams:'DEL vs BLR — Group A',    ground:'Kotla Cricket Club',      city:'Delhi',     rating:5 },
    { id:'ua4', status:'completed', date:'2024-03-08', teams:'MUM vs BLR — Friendly',  ground:'Bandra Box Cricket Arena', city:'Mumbai',    rating:4 },
    { id:'ua5', status:'completed', date:'2024-02-28', teams:'CHE vs DEL — T10 Cup',   ground:'Chepauk Sports Arena',    city:'Chennai',   rating:3 },
  ],
};

// ─── LOGGED-IN USER (DEMO) ───────────────────────────────────────────────────
export const DEMO_USER = {
  id: 'p1',
  phone: '+919876543210',
  name: 'Rohit Sharma',
  username: 'rohit_s',
  city: 'Mumbai',
  role: 'player',        // v1: single primary role
  roles: ['player'],     // kept for squad badge display only
  isNew: false,
  avatar: null,
  lastRoleChangedAt: null,
  subscription: 'free',  // v2: 'free' | 'pro_active' | 'pro_cancelled' | 'pro_expired'
};

// ─── v2: FAN HOME — CITY LIVE DATA ───────────────────────────────────────────
export const CITY_LIVE_DATA = {
  Mumbai: {
    live: [
      { teamA:'Borivali Bears',   scoreA:'87/3',  teamB:'Andheri Aces',     scoreB:'Yet to bat', overs:'12.3' },
      { teamA:'Thane Tigers',     scoreA:'143/6', teamB:'Navi Stars',        scoreB:'134/8',      overs:'19.4' },
      { teamA:'Dharavi Dons',     scoreA:'62/1',  teamB:'Colaba Cannons',    scoreB:'Yet to bat', overs:'7.2'  },
    ],
    today: 23,
  },
  Delhi: {
    live: [
      { teamA:'Karol Bagh Kings', scoreA:'108/4', teamB:'Lajpat Lions',      scoreB:'Yet to bat', overs:'15.1' },
      { teamA:'Rohini Rockets',   scoreA:'34/0',  teamB:'Dwarka Dynamos',    scoreB:'Yet to bat', overs:'5.0'  },
    ],
    today: 14,
  },
  Bengaluru: {
    live: [
      { teamA:'Indiranagar XI',   scoreA:'54/2',  teamB:'Koramangala KC',    scoreB:'Yet to bat', overs:'9.0'  },
      { teamA:'BTM Blazers',      scoreA:'176/5', teamB:'JP Nagar Jets',     scoreB:'Yet to bat', overs:'20.0' },
    ],
    today: 19,
  },
  Chennai: {
    live: [],
    today: 7,
  },
  Pune: {
    live: [
      { teamA:'Kothrud Kings',    scoreA:'91/3',  teamB:'Baner Bats',        scoreB:'Yet to bat', overs:'13.4' },
    ],
    today: 11,
  },
  Hyderabad: {
    live: [
      { teamA:'Banjara Hawks',    scoreA:'117/4', teamB:'Hitech Hurricanes', scoreB:'98/7',       overs:'17.2' },
    ],
    today: 9,
  },
};
export const ALL_CITIES = ['Mumbai','Delhi','Bengaluru','Chennai','Pune','Hyderabad','Kolkata','Ahmedabad','Jaipur','Chandigarh'];

// ─── v2: OPEN MATCHES (for umpire requests) ──────────────────────────────────
export const OPEN_MATCHES = [
  { id:'om1', name:'BLR vs HYD — T20 Friendly', teams:'Bengaluru XI vs Hyderabad Hawks', format:'T20', overs:20,
    date:'2024-03-21', time:'08:00 AM', ground:'Chinnaswamy Stadium', city:'Bengaluru',
    organiser:'Raj Sports Club' },
  { id:'om2', name:'MUM vs CHE — T10 Cup',       teams:'Mumbai Mavericks vs Chennai Chiefs', format:'T10', overs:10,
    date:'2024-03-22', time:'06:00 AM', ground:'Bandra Box Cricket', city:'Mumbai',
    organiser:'Mumbai Cricket Academy' },
  { id:'om3', name:'DEL vs BLR — League Match',  teams:'Delhi Dragons vs Bengaluru Bulls', format:'T20', overs:20,
    date:'2024-03-23', time:'07:30 AM', ground:'Kotla Cricket Club', city:'Delhi',
    organiser:'Delhi Cricket Board' },
  { id:'om4', name:'Pune vs Nashik — Knockout',  teams:'Pune Warriors vs Nashik Nagas', format:'T10', overs:10,
    date:'2024-03-24', time:'09:00 AM', ground:'Shivajinagar Ground', city:'Pune',
    organiser:'PCB Amateur Circuit' },
  { id:'om5', name:'HYD vs CHE — Box Cup',       teams:'Hyderabad Hawks vs Chennai Chiefs', format:'T10', overs:10,
    date:'2024-03-25', time:'10:00 AM', ground:'Hyderabad Cricket Club', city:'Hyderabad',
    organiser:'Deccan Cricket Trust' },
];

// ─── v2: OPEN TOURNAMENTS (for captain join requests) ────────────────────────
export const OPEN_TOURNAMENTS_LIST = [
  { id:'ot1', name:'Bengaluru Premier League',  city:'Bengaluru', organiser:'BCA Sports',
    format:'T20', overs:20, startDate:'2024-04-01', entryFee:3000,
    spotsTotal:12, spotsTaken:8, prize:'₹50,000 + Trophy', acceptingFreeAgents:true, freeAgentCount:3 },
  { id:'ot2', name:'All India Box Cricket Cup', city:'Mumbai',   organiser:'AIBC',
    format:'T10', overs:10, startDate:'2024-04-15', entryFee:5000,
    spotsTotal:16, spotsTaken:10, prize:'₹1,00,000 Cash', acceptingFreeAgents:true, freeAgentCount:1 },
  { id:'ot3', name:'Delhi Corporate T20',       city:'Delhi',    organiser:'DCB',
    format:'T20', overs:20, startDate:'2024-04-08', entryFee:2000,
    spotsTotal:8,  spotsTaken:3,  prize:'₹20,000 + Medals', acceptingFreeAgents:false, freeAgentCount:0 },
  { id:'ot4', name:'Chennai Beach Cricket Fest',city:'Chennai',  organiser:'CBF Events',
    format:'T10', overs:10, startDate:'2024-05-01', entryFee:1500,
    spotsTotal:10, spotsTaken:6,  prize:'₹15,000 + Kit Bags', acceptingFreeAgents:true, freeAgentCount:0 },
];

// ─── v3: OPEN TEAMS (Browse Open Teams — Find a Team) ────────────────────────
export const OPEN_TEAMS_LIST = [
  { id:'bt1', name:'Andheri Avengers',    city:'Mumbai',    color:'#3b82f6', wins:12, losses:5, nr:1,
    squadSize:9,  maxSquad:15, lookingFor:['Batsman','All-rounder'], lastActive:'2 days ago' },
  { id:'bt2', name:'Koramangala Kings',   city:'Bengaluru', color:'#7c3aed', wins:8,  losses:6, nr:0,
    squadSize:7,  maxSquad:15, lookingFor:['Bowler','Wicketkeeper'], lastActive:'1 day ago' },
  { id:'bt3', name:'Rohini Rockets',      city:'Delhi',     color:'#dc2626', wins:15, losses:4, nr:2,
    squadSize:11, maxSquad:15, lookingFor:['All-rounder'],            lastActive:'5 hours ago' },
  { id:'bt4', name:'Chepauk Challengers', city:'Chennai',   color:'#f59e0b', wins:6,  losses:8, nr:1,
    squadSize:8,  maxSquad:15, lookingFor:['Batsman','Bowler','All-rounder'], lastActive:'3 days ago' },
  { id:'bt5', name:'Banjara Hawks',       city:'Hyderabad', color:'#059669', wins:10, losses:7, nr:0,
    squadSize:10, maxSquad:15, lookingFor:['Batsman'],                lastActive:'6 hours ago' },
  { id:'bt6', name:'Chandigarh Chargers', city:'Chandigarh',color:'#0ea5e9', wins:7,  losses:9, nr:1,
    squadSize:6,  maxSquad:15, lookingFor:['Bowler','Batsman'],       lastActive:'Today' },
];

// ─── v3: TEAM JOIN REQUESTS INBOX (for captain inbox) ────────────────────────
export const TEAM_JOIN_REQUESTS_INBOX = [
  { id:'jr1', playerId:'p5', playerName:'Shubman Gill',    username:'shubman_g', city:'Mumbai',
    role:'player', message:'Right-hand opening bat, 38+ avg. Available all weekends.', status:'pending', requested:'2 hours ago' },
  { id:'jr2', playerId:'p8', playerName:'Axar Patel',      username:'axar_p',    city:'Mumbai',
    role:'player', message:'Left-arm spinner. Looking for competitive club cricket.', status:'pending', requested:'5 hours ago' },
  { id:'jr3', playerId:'p10',playerName:'Mohammed Siraj',  username:'siraj_m',   city:'Mumbai',
    role:'player', message:'', status:'accepted', requested:'1 day ago' },
];

// ─── v3: UMPIRE OPEN TOURNAMENTS (Browse Tournaments for umpires) ─────────────
export const UMPIRE_OPEN_TOURNAMENTS = [
  { id:'uot1', name:'Bengaluru Premier League S2', city:'Bengaluru', organiser:'BCA Sports',
    format:'T20', overs:20, startDate:'2024-04-01', endDate:'2024-04-20', status:'upcoming',
    totalMatches:14, umpireSlotsFilled:6, totalUmpireSlots:14,
    upcomingMatchDates:['Apr 1','Apr 3','Apr 5','Apr 8','Apr 10','Apr 12','Apr 15','Apr 20'],
    matches:[
      { id:'uom1', date:'Apr 1',  teams:'BCA XI vs KCC Warriors',   ground:'Chinnaswamy Stadium' },
      { id:'uom2', date:'Apr 3',  teams:'Indiranagar XI vs BTM XI', ground:'KSCA Stadium' },
      { id:'uom3', date:'Apr 5',  teams:'Koramangala KC vs Whitefield CC', ground:'Chinnaswamy Stadium' },
    ]
  },
  { id:'uot2', name:'Mumbai Box League 2024', city:'Mumbai', organiser:'MCA Events',
    format:'T10', overs:10, startDate:'2024-03-22', endDate:'2024-03-26', status:'live',
    totalMatches:8, umpireSlotsFilled:6, totalUmpireSlots:8,
    upcomingMatchDates:['Mar 24','Mar 25','Mar 26'],
    matches:[
      { id:'uom4', date:'Mar 24', teams:'Bandra Bears vs Andheri Aces',   ground:'Bandra Box Cricket' },
      { id:'uom5', date:'Mar 25', teams:'Thane Tigers vs Navi Stars',      ground:'Bandra Box Cricket' },
      { id:'uom6', date:'Mar 26', teams:'Final',                           ground:'Bandra Box Cricket' },
    ]
  },
  { id:'uot3', name:'Hyderabad Corporate T20', city:'Hyderabad', organiser:'Deccan Cricket Trust',
    format:'T20', overs:20, startDate:'2024-04-10', endDate:'2024-04-15', status:'upcoming',
    totalMatches:6, umpireSlotsFilled:2, totalUmpireSlots:6,
    upcomingMatchDates:['Apr 10','Apr 12','Apr 15'],
    matches:[
      { id:'uom7', date:'Apr 10', teams:'Banjara Hawks vs Hitech Hurricanes', ground:'Hyderabad Cricket Club' },
      { id:'uom8', date:'Apr 12', teams:'KBR Kings vs Jubilee Jets',           ground:'Hyderabad Cricket Club' },
      { id:'uom9', date:'Apr 15', teams:'Final',                               ground:'LB Stadium' },
    ]
  },
];

// ─── v3: FREE AGENT POOL (for organiser view in Tournament screen) ─────────────
export const TOURNAMENT_FREE_AGENT_POOL = [
  { id:'fa1', playerId:'p5',  playerName:'Shubman Gill',   username:'shubman_g',
    position:'Batsman',     availableDates:['Apr 1','Apr 5','Apr 8'],
    note:'Right-hand opener, 38+ avg in club cricket',
    runs:2867, wickets:3,   tournamentId:'ot1', status:'submitted' },
  { id:'fa2', playerId:'p8',  playerName:'Axar Patel',     username:'axar_p',
    position:'All-rounder', availableDates:['Apr 1','Apr 3','Apr 5'],
    note:'Left-arm spinner and handy lower-order bat',
    runs:987,  wickets:72,  tournamentId:'ot1', status:'submitted' },
  { id:'fa3', playerId:'p10', playerName:'Mohammed Siraj', username:'siraj_m',
    position:'Bowler',      availableDates:['Apr 1','Apr 3'],
    note:'Right-arm fast. 4+ wickets in multiple games.',
    runs:124,  wickets:89,  tournamentId:'ot1', status:'submitted' },
];

// ─── v2: ORGANISER INBOX MOCK DATA ───────────────────────────────────────────
export const ORGANISER_INBOX_DATA = {
  umpireRequests: [
    { id:'ur1', umpireName:'KL Rahul',    city:'Bengaluru', rating:4.3, matches:28, matchId:'om1', matchName:'BLR vs HYD', date:'2024-03-21', status:'pending' },
    { id:'ur2', umpireName:'Priya Menon', city:'Mumbai',    rating:3.9, matches:14, matchId:'om2', matchName:'MUM vs CHE', date:'2024-03-22', status:'pending' },
    { id:'ur3', umpireName:'Ajay Kumar',  city:'Delhi',     rating:4.1, matches:21, matchId:'om3', matchName:'DEL vs BLR', date:'2024-03-23', status:'pending' },
  ],
  tournamentRequests: [
    { id:'tr1', teamName:'Kothrud Kings', captainName:'Raj Patel',  city:'Pune',      record:'9W 4L',  tournamentId:'ot4', tournamentName:'Chennai Beach Cricket Fest', requested:'2024-03-18', status:'pending' },
    { id:'tr2', teamName:'BTM Blazers',   captainName:'Suresh K',   city:'Bengaluru', record:'12W 3L', tournamentId:'ot1', tournamentName:'Bengaluru Premier League',    requested:'2024-03-17', status:'pending' },
    { id:'tr3', teamName:'Rohini Rockets',captainName:'Amit Singh', city:'Delhi',     record:'7W 6L',  tournamentId:'ot3', tournamentName:'Delhi Corporate T20',          requested:'2024-03-16', status:'pending' },
  ],
  tournamentUmpireRequests: [
    { id:'tur1', umpireName:'KL Rahul',   city:'Bengaluru', rating:4.3, matches:28, certifications:'BCCI Level 2',
      tournamentId:'uot1', tournamentName:'Bengaluru Premier League S2',
      availableDates:['Apr 1','Apr 3','Apr 5','Apr 8','Apr 10'],
      note:'Available all days. BCCI Level 2 certified.', status:'pending' },
    { id:'tur2', umpireName:'Ajay Kumar', city:'Mumbai',    rating:4.1, matches:21, certifications:'MCA Certified',
      tournamentId:'uot1', tournamentName:'Bengaluru Premier League S2',
      availableDates:['Apr 1','Apr 5'],
      note:'Available weekends only.', status:'pending' },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export const playerById  = id => PLAYERS.find(p => p.id === id);
export const teamById    = id => TEAMS.find(t => t.id === id);
export const groundById  = id => GROUNDS.find(g => g.id === id);
export const matchById   = id => MATCHES.find(m => m.id === id);
export const tournamentById = id => TOURNAMENTS.find(tr => tr.id === id);
export const umpireById  = id => UMPIRES.find(u => u.id === id);

export const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);
export const initials = name => name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?';
export const conditionColor = c => ({
  Fresh:'bg-green-100 text-green-700', Worn:'bg-amber-100 text-amber-700',
  Damp:'bg-blue-100 text-blue-700', Unknown:'bg-gray-100 text-gray-600'
})[c] || 'bg-gray-100 text-gray-600';
export const pitchBadge = t => ({
  Turf:'bg-green-100 text-green-700', Matting:'bg-purple-100 text-purple-700',
  Cement:'bg-gray-100 text-gray-700', 'Red Soil':'bg-red-100 text-red-700',
  'Astro Turf':'bg-cyan-100 text-cyan-700'
})[t] || 'bg-gray-100 text-gray-600';
