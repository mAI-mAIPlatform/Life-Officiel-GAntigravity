import { create } from 'zustand';

type GameStatus = 'menu' | 'loading' | 'playing';

interface GameState {
    gameStatus: GameStatus;
    currency: number;
    xp: number;
    level: number;
    currentDistrictId: string | null;

    // Actions
    setGameStatus: (status: GameStatus) => void;
    setCurrency: (amount: number) => void;
    addCurrency: (amount: number) => void;
    setXp: (amount: number) => void;
    addXp: (amount: number) => void;
    setLevel: (level: number) => void;
    setCurrentDistrictId: (id: string | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
    gameStatus: 'menu',
    currency: 0,
    xp: 0,
    level: 1,
    currentDistrictId: null,

    setGameStatus: (status) => set({ gameStatus: status }),
    setCurrency: (amount) => set({ currency: amount }),
    addCurrency: (amount) => set((state) => ({ currency: state.currency + amount })),
    setXp: (amount) => set({ xp: amount }),
    addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
    setLevel: (level) => set({ level }),
    setCurrentDistrictId: (id) => set({ currentDistrictId: id }),
}));
