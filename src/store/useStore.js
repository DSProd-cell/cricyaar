import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────────────────
      user: null,              // start unauthenticated — USP/landing page shows first
      isAuthenticated: false,
      pendingPhone: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setPendingPhone: (phone) => set({ pendingPhone: phone }),
      logout: () => set({
        user: null, isAuthenticated: false, pendingPhone: null, otpMode: 'login',
        umpireRequests: [], tournamentRequests: [], teamJoinRequests: [], freeAgentRequests: [],
        umpireTournamentRequests: [], proIntent: false, showProSheet: false, showRoleModal: false,
      }),

      // Role management
      otpMode: 'login',   // 'login' | 'role-switch'
      setOtpMode: (mode) => set({ otpMode: mode }),
      setRole: (role) => set(s => ({
        user: s.user ? { ...s.user, role, lastRoleChangedAt: Date.now() } : s.user,
        otpMode: 'login',
      })),

      // Role welcome modal (shown once after role selection)
      showRoleModal: false,
      setShowRoleModal: (v) => set({ showRoleModal: v }),

      // ── v2: Subscription ─────────────────────────────────────────────────────
      setSubscription: (status) => set(s => ({
        user: s.user ? { ...s.user, subscription: status, proRenewalDate: status === 'pro_active' ? '2024-04-20' : s.user?.proRenewalDate } : s.user,
      })),

      // ── v2: Umpire requests ──────────────────────────────────────────────────
      umpireRequests: [],
      addUmpireRequest: (matchId, matchName) => set(s => ({
        umpireRequests: [...s.umpireRequests, { matchId, matchName, status: 'pending' }],
      })),
      withdrawUmpireRequest: (matchId) => set(s => ({
        umpireRequests: s.umpireRequests.filter(r => r.matchId !== matchId),
      })),

      // ── v2: Tournament join requests ─────────────────────────────────────────
      tournamentRequests: [],
      addTournamentRequest: (tournamentId, tournamentName, teamId, teamName) => set(s => ({
        tournamentRequests: [...s.tournamentRequests, { tournamentId, tournamentName, teamId, teamName, status: 'pending' }],
      })),

      // ── v2: Organiser inbox ──────────────────────────────────────────────────
      organiserInboxUnread: 3,
      clearOrganiserInbox: () => set({ organiserInboxUnread: 0 }),

      // ── Toast ─────────────────────────────────────────────────────────────────
      toasts: [],
      addToast: (msg, type = 'success') => {
        const id = Date.now();
        set(s => ({ toasts: [...s.toasts, { id, msg, type }] }));
        setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
      },
      removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

      // ── Notifications ─────────────────────────────────────────────────────────
      notificationCount: 2,
      decrementNotifications: () => set(s => ({ notificationCount: Math.max(0, s.notificationCount - 1) })),
      clearNotifications: () => set({ notificationCount: 0 }),

      // ── Live Scoring State ────────────────────────────────────────────────────
      scoring: {
        matchId: 'm1',
        inningsIdx: 0,
        legalBalls: 4,
        thisOver: ['4', '•', '1', '6'],
        undoStack: [],
        freehit: false,
        striker:    { id: 'p1', runs: 47, balls: 26, fours: 4, sixes: 3 },
        nonStriker: { id: 'p5', runs: 31, balls: 22, fours: 2, sixes: 1 },
        currentBowler: { id: 'p10', overs: 3, runs: 28, wkts: 1 },
        runs: 78, wkts: 1, overs: 3.4,
        target: null,
        requiredBalls: null,
      },

      recordBall: (type, val) => {
        const s = get().scoring;
        const snap = JSON.parse(JSON.stringify(s));

        let runsBall = 0;
        let isLegal  = true;
        let newBallStr = '';
        let wicket = false;
        let newFreehit = false;

        if (type === 'run')     { runsBall = val; newBallStr = val === 0 ? '•' : String(val); }
        else if (type === 'four')    { runsBall = 4; newBallStr = '4'; }
        else if (type === 'six')     { runsBall = 6; newBallStr = '6'; }
        else if (type === 'wide')    { runsBall = 1; isLegal = false; newBallStr = 'Wd'; }
        else if (type === 'noball')  { runsBall = 1; isLegal = false; newBallStr = 'Nb'; newFreehit = true; }
        else if (type === 'legbye')  { runsBall = val || 1; newBallStr = `Lb${val || 1}`; }
        else if (type === 'penalty') { runsBall = 5; isLegal = false; newBallStr = 'P5'; }
        else if (type === 'wicket')  { runsBall = 0; wicket = true; newBallStr = 'W'; }

        const newOver = [...s.thisOver, newBallStr];
        let newLegal  = isLegal ? s.legalBalls + 1 : s.legalBalls;
        let newRuns   = s.runs + runsBall;
        let newWkts   = wicket ? s.wkts + 1 : s.wkts;
        let newOvers  = s.overs;

        let newStriker    = { ...s.striker };
        let newNonStriker = { ...s.nonStriker };
        if (!wicket && type !== 'wide' && type !== 'penalty') {
          if (type === 'four') { newStriker.runs += 4; newStriker.fours++; newStriker.balls++; }
          else if (type === 'six') { newStriker.runs += 6; newStriker.sixes++; newStriker.balls++; }
          else if (type === 'run') { newStriker.runs += val; newStriker.balls++; if (val % 2 === 1) { [newStriker, newNonStriker] = [newNonStriker, newStriker]; } }
          else if (type === 'legbye') { newStriker.balls++; }
        }

        if (newLegal >= 6) {
          newOvers = Math.floor(s.overs) + 1;
          newLegal = 0;
          [newStriker, newNonStriker] = [newNonStriker, newStriker];
        } else {
          newOvers = Math.floor(s.overs) + (newLegal / 10);
        }

        set({
          scoring: {
            ...s,
            runs: newRuns, wkts: newWkts, overs: newOvers,
            legalBalls: newLegal,
            thisOver: newLegal === 0 ? [] : newOver,
            striker: newStriker, nonStriker: newNonStriker,
            freehit: newFreehit,
            undoStack: [...s.undoStack.slice(-9), snap],
          }
        });
      },

      undoLastBall: () => {
        const s = get().scoring;
        if (!s.undoStack.length) return;
        const prev = s.undoStack[s.undoStack.length - 1];
        set({ scoring: { ...prev, undoStack: s.undoStack.slice(0, -1) } });
      },

      // ── Ground search ─────────────────────────────────────────────────────────
      groundFilters: { search: '', pitchType: 'All', floodlights: 'Any', city: '' },
      setGroundFilters: (f) => set(s => ({ groundFilters: { ...s.groundFilters, ...f } })),

      // ── Active team/tournament tab ────────────────────────────────────────────
      teamsTab: 'teams',
      setTeamsTab: (tab) => set({ teamsTab: tab }),

      // ── v3: Pro intent (session flag for USP → signup flow) ──────────────────
      proIntent: false,
      setProIntent: (val) => set({ proIntent: val }),
      showProSheet: false,
      setShowProSheet: (val) => set({ showProSheet: val }),

      // ── v3: Team join requests (player side) ──────────────────────────────────
      teamJoinRequests: [],
      addTeamJoinRequest: (teamId, teamName, message) => set(s => ({
        teamJoinRequests: [...s.teamJoinRequests, { teamId, teamName, message, status: 'pending' }],
      })),

      // ── v3: Free agent tournament requests (player side) ──────────────────────
      freeAgentRequests: [],
      addFreeAgentRequest: (tournamentId, tournamentName, position, note) => set(s => ({
        freeAgentRequests: [...s.freeAgentRequests, { tournamentId, tournamentName, position, note, status: 'submitted' }],
      })),

      // ── v3: Umpire tournament requests ────────────────────────────────────────
      umpireTournamentRequests: [],
      addUmpireTournamentRequest: (tournamentId, tournamentName, type) => set(s => ({
        umpireTournamentRequests: [...s.umpireTournamentRequests, { tournamentId, tournamentName, type, status: 'pending' }],
      })),
      withdrawUmpireTournamentRequest: (tournamentId) => set(s => ({
        umpireTournamentRequests: s.umpireTournamentRequests.filter(r => r.tournamentId !== tournamentId),
      })),

      // ── v3: AI Ground Assistant rate limiting ─────────────────────────────────
      aiQueryCount: 0,
      aiQueryResetDate: null,
      incrementAiQuery: () => set(s => {
        const today = new Date().toDateString()
        if (s.aiQueryResetDate !== today) return { aiQueryCount: 1, aiQueryResetDate: today }
        return { aiQueryCount: s.aiQueryCount + 1 }
      }),
      canAskAI: () => {
        const s = get()
        const today = new Date().toDateString()
        if (s.user?.role === 'admin') return true
        if (s.aiQueryResetDate !== today) return true
        return s.aiQueryCount < 10
      },
      aiQueriesLeft: () => {
        const s = get()
        if (s.user?.role === 'admin') return Infinity
        const today = new Date().toDateString()
        if (s.aiQueryResetDate !== today) return 10
        return Math.max(0, 10 - s.aiQueryCount)
      },

      // ── v4: Published tournaments (user-created, persisted) ───────────────────
      publishedTournaments: [],
      publishTournament: (tournament) => set(s => ({
        publishedTournaments: [...s.publishedTournaments, tournament],
      })),

      // ── v4: Published teams (auto-created when tournament is published) ────────
      publishedTeams: [],
      addPublishedTeam: (team) => set(s => ({
        publishedTeams: [...s.publishedTeams, team],
      })),

      // ── v4: Ground booking requests ───────────────────────────────────────────
      groundBookings: [],
      addGroundBooking: (booking) => set(s => ({
        groundBookings: [...s.groundBookings, { ...booking, createdAt: Date.now() }],
      })),
    }),
    {
      name: 'cricyaar-store-v4',
      partialize: (state) => ({
        user:                      state.user,
        publishedTournaments:      state.publishedTournaments,
        publishedTeams:            state.publishedTeams,
        groundBookings:            state.groundBookings,
        umpireRequests:            state.umpireRequests,
        tournamentRequests:        state.tournamentRequests,
        teamJoinRequests:          state.teamJoinRequests,
        freeAgentRequests:         state.freeAgentRequests,
        umpireTournamentRequests:  state.umpireTournamentRequests,
        aiQueryCount:              state.aiQueryCount,
        aiQueryResetDate:          state.aiQueryResetDate,
        proIntent:                 state.proIntent,
        notificationCount:         state.notificationCount,
      }),
    }
  )
)
