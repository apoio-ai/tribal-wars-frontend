import axios from 'axios';

// Configurar URL da API
   const API_URL = 'https://tribal-wars-backend.onrender.com';

// Criar instância do axios
const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth
export const register = (username, email, password) => 
    api.post('/auth/register', { username, email, password });

export const login = (email, password) => 
    api.post('/auth/login', { email, password });

export const getMe = () => 
    api.get('/auth/me');

// Village
export const getVillage = () => 
    api.get('/village');

export const buildBuilding = (building) => 
    api.post('/village/build', { building });

export const getMap = () => 
    api.get('/village/map');

export const claimDailyBonus = () => 
    api.post('/village/daily-bonus');

// Troops
export const getTroops = () => 
    api.get('/troops');

export const trainTroops = (troop, amount) => 
    api.post('/troops/train', { troop, amount });

// Battle
export const getNPCVillages = () => 
    api.get('/battle/npc-villages');

export const attackNPC = (villageIndex, troops) => 
    api.post('/battle/attack-npc', { villageIndex, troops });

export const attackPlayer = (defenderId, troops) => 
    api.post('/battle/attack-player', { defenderId, troops });

export const getBattleHistory = () => 
    api.get('/battle/history');

// Rankings
export const getRankingByPoints = (limit = 50) => 
    api.get(`/ranking/points?limit=${limit}`);

export const getRankingByAttackers = (limit = 50) => 
    api.get(`/ranking/attackers?limit=${limit}`);

export const getRankingByDefenders = (limit = 50) => 
    api.get(`/ranking/defenders?limit=${limit}`);

export const getRankingByLevel = (limit = 50) => 
    api.get(`/ranking/level?limit=${limit}`);

export default api;
