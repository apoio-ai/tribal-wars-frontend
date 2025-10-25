import React, { useState, useEffect } from 'react';
import * as api from './services/api';
import './styles/App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState(null);
  const [village, setVillage] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Rankings
  const [rankings, setRankings] = useState(null);
  const [rankingType, setRankingType] = useState('points');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Map
  const [map, setMap] = useState(null);
  const [selectedMapCell, setSelectedMapCell] = useState(null);

  // Battle
  const [npcVillages, setNPCVillages] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [attackTroops, setAttackTroops] = useState({});

  // Building timers
  const [buildingTimers, setBuildingTimers] = useState({});

  // Dados dos edifícios com imagens e informações
  const buildingsData = {
    headquarters: {
      name: 'Quartel General',
      icon: '🏛️',
      emoji: '🏛️',
      description: 'Centro de comando da sua aldeia. Permite construir e melhorar outros edifícios.',
      bonus: 'Velocidade de construção +5% por nível'
    },
    barracks: {
      name: 'Quartel',
      icon: '⚔️',
      emoji: '⚔️',
      description: 'Centro de treino militar. Permite recrutar e treinar diferentes tipos de tropas.',
      bonus: 'Velocidade de treino +10% por nível'
    },
    farm: {
      name: 'Quinta',
      icon: '🌾',
      emoji: '🌾',
      description: 'Produz comida para alimentar sua população e tropas.',
      bonus: 'Produção +50 comida/hora por nível'
    },
    warehouse: {
      name: 'Armazém',
      icon: '📦',
      emoji: '📦',
      description: 'Armazena recursos. Maior capacidade permite guardar mais recursos.',
      bonus: 'Capacidade +1000 por nível'
    },
    wall: {
      name: 'Muralha',
      icon: '🛡️',
      emoji: '🛡️',
      description: 'Defesa principal da aldeia. Aumenta a força defensiva das tropas.',
      bonus: 'Bônus defensivo +5% por nível'
    },
    market: {
      name: 'Mercado',
      icon: '🏪',
      emoji: '🏪',
      description: 'Permite trocar recursos com outros jogadores.',
      bonus: 'Capacidade comercial +100 por nível'
    },
    smithy: {
      name: 'Ferreiro',
      icon: '⚒️',
      emoji: '⚒️',
      description: 'Melhora armas e armaduras das tropas.',
      bonus: 'Ataque/Defesa +2% por nível'
    },
    stable: {
      name: 'Estábulo',
      icon: '🐴',
      emoji: '🐴',
      description: 'Permite treinar unidades montadas.',
      bonus: 'Velocidade de cavalaria +3% por nível'
    }
  };

  // Dados das tropas com estatísticas completas
  const troopsData = {
    spearman: {
      name: 'Lanceiro',
      emoji: '🗡️',
      attack: 10,
      defense: 15,
      speed: 18,
      carry: 25,
      cost: { wood: 50, clay: 30, iron: 10, time: 300 },
      description: 'Infantaria básica equipada com lanças. Excelente contra cavalaria.',
      history: 'Os lanceiros são a espinha dorsal de qualquer exército. Treinados desde jovens, dominam a arte do combate com lança e escudo.'
    },
    swordsman: {
      name: 'Espadachim',
      emoji: '⚔️',
      attack: 25,
      defense: 50,
      speed: 22,
      carry: 15,
      cost: { wood: 30, clay: 30, iron: 70, time: 480 },
      description: 'Guerreiro pesado com espada e armadura. Alta defesa.',
      history: 'Veteranos de guerra forjados em batalha. Sua armadura pesada e espada afiada os tornam uma fortaleza ambulante.'
    },
    axeman: {
      name: 'Guerreiro',
      emoji: '🪓',
      attack: 40,
      defense: 10,
      speed: 18,
      carry: 10,
      cost: { wood: 60, clay: 30, iron: 40, time: 420 },
      description: 'Atacante feroz com machado. Alto poder de ataque.',
      history: 'Selvagens guerreiros que preferem a força bruta à técnica. Seu machado é capaz de partir escudos com um único golpe.'
    },
    archer: {
      name: 'Arqueiro',
      emoji: '🏹',
      attack: 15,
      defense: 50,
      speed: 18,
      carry: 10,
      cost: { wood: 100, clay: 30, iron: 60, time: 600 },
      description: 'Atirador de longo alcance. Bom em defesa.',
      history: 'Mestres do arco que podem acertar um alvo a 100 metros. Sua precisão mortal intimida qualquer invasor.'
    },
    scout: {
      name: 'Batedor',
      emoji: '👁️',
      attack: 0,
      defense: 2,
      speed: 35,
      carry: 0,
      cost: { wood: 50, clay: 50, iron: 20, time: 240 },
      description: 'Unidade rápida para espionagem. Não participa em combate.',
      history: 'Espiões ágeis que se movem nas sombras. Podem infiltrar aldeias inimigas e retornar com informações valiosas.'
    },
    light_cavalry: {
      name: 'Cavalaria Leve',
      emoji: '🐎',
      attack: 130,
      defense: 30,
      speed: 40,
      carry: 80,
      cost: { wood: 125, clay: 100, iron: 250, time: 900 },
      description: 'Cavalaria rápida para ataques e saques.',
      history: 'Cavaleiros velozes montados em cavalos ágeis. Perfeitos para ataques relâmpago e pilhagem de recursos.'
    },
    heavy_cavalry: {
      name: 'Cavalaria Pesada',
      emoji: '🏇',
      attack: 150,
      defense: 200,
      speed: 30,
      carry: 50,
      cost: { wood: 250, clay: 100, iron: 150, time: 1200 },
      description: 'Cavalaria blindada. Unidade mais poderosa.',
      history: 'A elite da cavalaria. Cavaleiros em armadura completa sobre corcéis de guerra. Nada pode resistir à sua carga devastadora.'
    },
    ram: {
      name: 'Aríete',
      emoji: '🪵',
      attack: 2,
      defense: 20,
      speed: 15,
      carry: 0,
      cost: { wood: 300, clay: 200, iron: 200, time: 1800 },
      description: 'Máquina de cerco para destruir muralhas.',
      history: 'Enorme tronco reforçado com ferro. Operado por dezenas de homens, é capaz de derrubar os portões mais resistentes.'
    },
    catapult: {
      name: 'Catapulta',
      emoji: '💣',
      attack: 100,
      defense: 100,
      speed: 10,
      carry: 0,
      cost: { wood: 320, clay: 400, iron: 100, time: 2400 },
      description: 'Arma de cerco para destruir edifícios.',
      history: 'Máquina de guerra devastadora que lança pedras gigantes. Pode reduzir edifícios a escombros à distância.'
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadVillageData();
      const interval = setInterval(loadVillageData, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeTab === 'map' && !map) loadMap();
    if (activeTab === 'battle' && npcVillages.length === 0) loadNPCVillages();
    if (activeTab === 'battle' && battleHistory.length === 0) loadBattleHistory();
    if (activeTab === 'ranking' && !rankings) loadRankings(rankingType);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ranking') loadRankings(rankingType);
  }, [rankingType]);

  // Timer para construções
  useEffect(() => {
    const interval = setInterval(() => {
      setBuildingTimers(prev => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach(building => {
          if (newTimers[building] > 0) {
            newTimers[building]--;
          }
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.getMe();
        setUser(response.data.user);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  };

  const loadVillageData = async () => {
    try {
      const response = await api.getVillage();
      setVillage(response.data);
    } catch (error) {
      console.error('Erro ao carregar aldeia:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      setLoading(true);
      const response = await api.login(email, password);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsLoggedIn(true);
      showNotification('Login bem-sucedido! 🎉');
    } catch (error) {
      showNotification('Erro no login: ' + (error.response?.data?.error || 'Erro desconhecido'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      setLoading(true);
      const response = await api.register(username, email, password);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsLoggedIn(true);
      showNotification('Conta criada com sucesso! Bem-vindo! 🎉');
    } catch (error) {
      showNotification('Erro no registro: ' + (error.response?.data?.error || 'Erro desconhecido'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setVillage(null);
    showNotification('Logout realizado!');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBuild = async (building) => {
    const buildingInfo = buildingsData[building];
    const currentLevel = village.village.buildings[building] || 0;
    const cost = calculateBuildCost(building, currentLevel);
    
    // Simular tempo de construção
    const buildTime = (currentLevel + 1) * 60; // segundos
    setBuildingTimers(prev => ({ ...prev, [building]: buildTime }));

    try {
      setLoading(true);
      const response = await api.buildBuilding(building);
      showNotification(response.data.message);
      await loadVillageData();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erro ao construir', 'error');
      setBuildingTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[building];
        return newTimers;
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateBuildCost = (building, level) => {
    const baseCost = {
      headquarters: { wood: 100, clay: 150, iron: 50 },
      barracks: { wood: 150, clay: 100, iron: 100 },
      farm: { wood: 80, clay: 100, iron: 30 },
      warehouse: { wood: 60, clay: 50, iron: 40 },
      wall: { wood: 50, clay: 100, iron: 150 },
      market: { wood: 100, clay: 100, iron: 100 },
      smithy: { wood: 170, clay: 200, iron: 250 },
      stable: { wood: 200, clay: 150, iron: 250 }
    };

    const base = baseCost[building] || { wood: 100, clay: 100, iron: 100 };
    const multiplier = Math.pow(1.26, level);

    return {
      wood: Math.floor(base.wood * multiplier),
      clay: Math.floor(base.clay * multiplier),
      iron: Math.floor(base.iron * multiplier)
    };
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return 'Pronto';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const handleTrain = async (troop, amount) => {
    try {
      setLoading(true);
      const response = await api.trainTroops(troop, parseInt(amount));
      showNotification(response.data.message);
      await loadVillageData();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erro ao treinar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAttackNPC = async (villageIndex) => {
    if (Object.values(attackTroops).every(v => !v || v === 0)) {
      showNotification('Selecione pelo menos 1 tropa para atacar!', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await api.attackNPC(villageIndex, attackTroops);
      showNotification(response.data.message);
      setAttackTroops({});
      await loadVillageData();
      await loadBattleHistory();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erro na batalha', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    try {
      setLoading(true);
      const response = await api.claimDailyBonus();
      showNotification(response.data.message);
      await loadVillageData();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erro ao coletar bônus', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMap = async () => {
    try {
      const response = await api.getMap();
      
      // Gerar mapa 20x20 com diferentes tipos de aldeias
      const mapGrid = [];
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          const random = Math.random();
          let cell = {
            x,
            y,
            type: 'empty',
            emoji: '🌳'
          };

          if (x === response.data.myCoordinates.x && y === response.data.myCoordinates.y) {
            cell = { x, y, type: 'player', emoji: '🏰', player: user.username };
          } else if (random < 0.1) {
            cell = { x, y, type: 'enemy', emoji: '⚔️', player: 'Inimigo ' + Math.floor(Math.random() * 100) };
          } else if (random < 0.15) {
            cell = { x, y, type: 'abandoned', emoji: '🏚️', resources: Math.floor(Math.random() * 500) + 200 };
          } else if (random < 0.18) {
            const bonusTypes = ['🌾', '🪵', '⛏️', '💎'];
            cell = { x, y, type: 'bonus', emoji: bonusTypes[Math.floor(Math.random() * bonusTypes.length)] };
          }

          mapGrid.push(cell);
        }
      }

      setMap({ ...response.data, grid: mapGrid });
    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
    }
  };

  const loadNPCVillages = async () => {
    try {
      const response = await api.getNPCVillages();
      setNPCVillages(response.data.villages);
    } catch (error) {
      console.error('Erro ao carregar aldeias NPC:', error);
    }
  };

  const loadBattleHistory = async () => {
    try {
      const response = await api.getBattleHistory();
      setBattleHistory(response.data.battles);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadRankings = async (type) => {
    try {
      let response;
      switch(type) {
        case 'attackers':
          response = await api.getRankingByAttackers();
          break;
        case 'defenders':
          response = await api.getRankingByDefenders();
          break;
        case 'level':
          response = await api.getRankingByLevel();
          break;
        default:
          response = await api.getRankingByPoints();
      }
      setRankings(response.data);
    } catch (error) {
      console.error('Erro ao carregar rankings:', error);
    }
  };

  const handlePlayerClick = (playerUsername) => {
    const playerData = rankings.ranking.find(p => p.username === playerUsername);
    setSelectedPlayer(playerData);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1 className="title">⚔️ TRIBAL WARS</h1>
          <p className="subtitle">Conquiste o Mundo Medieval!</p>
          
          {!isRegistering ? (
            <form onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'ENTRAR'}
              </button>
              <p className="switch-text">
                Não tens conta? <span onClick={() => setIsRegistering(true)}>Regista-te</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <input type="text" name="username" placeholder="Username" required />
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'CRIAR CONTA'}
              </button>
              <p className="switch-text">
                Já tens conta? <span onClick={() => setIsRegistering(false)}>Entra</span>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (!village) {
    return <div className="loading">⏳ Carregando aldeia...</div>;
  }

  return (
    <div className="game-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <header className="game-header">
        <div className="header-left">
          <h1>⚔️ Tribal Wars</h1>
          <span className="village-name">🏘️ {user.username}'s Village</span>
        </div>
        <div className="user-info">
          <div className="user-stat">👤 {user.username}</div>
          <div className="user-stat">⭐ Nível {village.stats.level}</div>
          <div className="user-stat">🏆 {village.stats.points} pts</div>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      <div className="resources-bar">
        <div className="resource wood-res">
          <span className="res-icon">🪵</span>
          <div>
            <div className="res-label">Madeira</div>
            <div className="res-value">{Math.floor(village.village.resources.wood)}</div>
          </div>
        </div>
        <div className="resource clay-res">
          <span className="res-icon">🏺</span>
          <div>
            <div className="res-label">Argila</div>
            <div className="res-value">{Math.floor(village.village.resources.clay)}</div>
          </div>
        </div>
        <div className="resource iron-res">
          <span className="res-icon">⚒️</span>
          <div>
            <div className="res-label">Ferro</div>
            <div className="res-value">{Math.floor(village.village.resources.iron)}</div>
          </div>
        </div>
        <div className="resource gold-res">
          <span className="res-icon">💎</span>
          <div>
            <div className="res-label">Ouro</div>
            <div className="res-value">{village.village.resources.gold}</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          <span className="tab-icon">🏠</span> Visão Geral
        </button>
        <button className={activeTab === 'buildings' ? 'active' : ''} onClick={() => setActiveTab('buildings')}>
          <span className="tab-icon">🏰</span> Edifícios
        </button>
        <button className={activeTab === 'troops' ? 'active' : ''} onClick={() => setActiveTab('troops')}>
          <span className="tab-icon">⚔️</span> Tropas
        </button>
        <button className={activeTab === 'battle' ? 'active' : ''} onClick={() => setActiveTab('battle')}>
          <span className="tab-icon">🎯</span> Batalha
        </button>
        <button className={activeTab === 'map' ? 'active' : ''} onClick={() => setActiveTab('map')}>
          <span className="tab-icon">🗺️</span> Mapa
        </button>
        <button className={activeTab === 'ranking' ? 'active' : ''} onClick={() => setActiveTab('ranking')}>
          <span className="tab-icon">🏆</span> Rankings
        </button>
      </div>

      <div className="content">
        {activeTab === 'overview' && (
          <div className="overview">
            {/* Vista da Aldeia com Imagens */}
            <div className="village-view">
              <h2 className="section-title">🏘️ Tua Aldeia</h2>
              <div className="village-scene">
                <div className="sky"></div>
                <div className="village-buildings">
                  {Object.entries(village.village.buildings).map(([building, level]) => {
                    const buildingInfo = buildingsData[building];
                    if (!buildingInfo) return null;
                    
                    const positions = {
                      headquarters: { left: '45%', top: '30%' },
                      barracks: { left: '25%', top: '45%' },
                      farm: { left: '70%', top: '50%' },
                      warehouse: { left: '60%', top: '70%' },
                      wall: { left: '15%', top: '20%' },
                      market: { left: '75%', top: '30%' },
                      smithy: { left: '35%', top: '65%' },
                      stable: { left: '55%', top: '45%' }
                    };

                    return (
                      <div 
                        key={building}
                        className="village-building"
                        style={positions[building]}
                        title={`${buildingInfo.name} - Nível ${level}`}
                      >
                        <div className="building-icon-3d">{buildingInfo.emoji}</div>
                        <div className="building-level-badge">{level}</div>
                        <div className="building-name-label">{buildingInfo.name}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="ground"></div>
              </div>
            </div>

            {/* Estatísticas do Jogador */}
            <div className="player-stats-card">
              <h2>👑 Perfil de {user.username}</h2>
              <div className="exp-section">
                <p>Nível {village.stats.level} | EXP: {village.stats.exp}/{village.stats.level * 100}</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${(village.stats.exp / (village.stats.level * 100)) * 100}%`}}
                  >
                    {Math.floor((village.stats.exp / (village.stats.level * 100)) * 100)}%
                  </div>
                </div>
              </div>
              <button onClick={handleClaimBonus} className="btn-bonus">
                🎁 Coletar Bônus Diário
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card attack-card">
                <div className="stat-icon">⚔️</div>
                <h3>Ataques</h3>
                <div className="stat-numbers">
                  <div className="stat-item">
                    <span className="stat-label">Vitórias</span>
                    <span className="stat-value win">{village.stats.attacksWon}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Derrotas</span>
                    <span className="stat-value loss">{village.stats.attacksLost}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card defense-card">
                <div className="stat-icon">🛡️</div>
                <h3>Defesas</h3>
                <div className="stat-numbers">
                  <div className="stat-item">
                    <span className="stat-label">Vitórias</span>
                    <span className="stat-value win">{village.stats.defensesWon}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Derrotas</span>
                    <span className="stat-value loss">{village.stats.defensesLost}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card troops-card">
                <div className="stat-icon">💀</div>
                <h3>Tropas</h3>
                <div className="stat-numbers">
                  <div className="stat-item">
                    <span className="stat-label">Inimigas Mortas</span>
                    <span className="stat-value kill">{village.stats.troopsKilled}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Perdidas</span>
                    <span className="stat-value loss">{village.stats.troopsLost}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'buildings' && (
          <div className="buildings-section">
            <h2 className="section-title">🏰 Edifícios</h2>
            
            {/* Construções em progresso */}
            {Object.keys(buildingTimers).filter(b => buildingTimers[b] > 0).length > 0 && (
              <div className="construction-progress">
                <h3>⏱️ Em Construção</h3>
                {Object.entries(buildingTimers).filter(([_, time]) => time > 0).map(([building, time]) => {
                  const buildingInfo = buildingsData[building];
                  const currentLevel = village.village.buildings[building] || 0;
                  const progress = Math.max(0, 100 - (time / ((currentLevel + 1) * 60)) * 100);
                  
                  return (
                    <div key={building} className="construction-item">
                      <div className="construction-header">
                        <span className="construction-icon">{buildingInfo.emoji}</span>
                        <span>{buildingInfo.name} → Nível {currentLevel + 1}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: `${progress}%`}}>
                          {Math.floor(progress)}%
                        </div>
                      </div>
                      <div className="construction-timer">⏰ {formatTime(time)}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="buildings-grid">
              {Object.entries(buildingsData).map(([buildingKey, buildingInfo]) => {
                const level = village.village.buildings[buildingKey] || 0;
                const cost = calculateBuildCost(buildingKey, level);
                const isBuilding = buildingTimers[buildingKey] > 0;
                const canAfford = village.village.resources.wood >= cost.wood &&
                                village.village.resources.clay >= cost.clay &&
                                village.village.resources.iron >= cost.iron;

                return (
                  <div key={buildingKey} className="building-card-new">
                    <div className="building-image">
                      <div className="building-emoji-large">{buildingInfo.emoji}</div>
                      <div className="building-level-badge-large">Nível {level}</div>
                    </div>
                    
                    <div className="building-info">
                      <h3>{buildingInfo.name}</h3>
                      <p className="building-description">{buildingInfo.description}</p>
                      
                      <div className="building-bonus">
                        <span className="bonus-icon">⭐</span>
                        <span>{buildingInfo.bonus}</span>
                      </div>

                      <div className="building-cost">
                        <h4>Custo para Nível {level + 1}:</h4>
                        <div className="cost-items">
                          <div className={`cost-item ${village.village.resources.wood >= cost.wood ? 'affordable' : 'expensive'}`}>
                            <span>🪵</span> {cost.wood}
                          </div>
                          <div className={`cost-item ${village.village.resources.clay >= cost.clay ? 'affordable' : 'expensive'}`}>
                            <span>🏺</span> {cost.clay}
                          </div>
                          <div className={`cost-item ${village.village.resources.iron >= cost.iron ? 'affordable' : 'expensive'}`}>
                            <span>⚒️</span> {cost.iron}
                          </div>
                        </div>
                        <div className="build-time">
                          <span>⏱️</span> Tempo: {formatTime((level + 1) * 60)}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleBuild(buildingKey)}
                        disabled={loading || isBuilding || !canAfford}
                        className="btn-build"
                      >
                        {isBuilding ? '🔨 Construindo...' : canAfford ? '⬆️ Melhorar' : '❌ Recursos Insuficientes'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'troops' && (
          <div className="troops-section">
            <h2 className="section-title">⚔️ Exército</h2>
            
            <div className="troops-summary">
              <h3>Tuas Tropas</h3>
              <div className="troops-count-grid">
                {Object.entries(village.village.troops).map(([troop, count]) => {
                  const troopInfo = troopsData[troop];
                  if (!troopInfo) return null;
                  
                  return (
                    <div key={troop} className="troop-count-item">
                      <span className="troop-emoji-big">{troopInfo.emoji}</span>
                      <span className="troop-count-number">{count}</span>
                      <span className="troop-count-name">{troopInfo.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="troops-grid">
              {Object.entries(troopsData).map(([troopKey, troopInfo]) => {
                const count = village.village.troops[troopKey] || 0;

                return (
                  <div key={troopKey} className="troop-card-new">
                    <div className="troop-header">
                      <div className="troop-image">
                        <div className="troop-emoji-huge">{troopInfo.emoji}</div>
                      </div>
                      <div className="troop-title-section">
                        <h3>{troopInfo.name}</h3>
                        <p className="troop-count-owned">Possuis: {count}</p>
                      </div>
                    </div>

                    <p className="troop-description">{troopInfo.description}</p>

                    <div className="troop-history">
                      <h4>📜 História</h4>
                      <p>{troopInfo.history}</p>
                    </div>

                    <div className="troop-stats">
                      <h4>📊 Estatísticas</h4>
                      <div className="stat-row">
                        <span className="stat-label">⚔️ Ataque:</span>
                        <span className="stat-value">{troopInfo.attack}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">🛡️ Defesa:</span>
                        <span className="stat-value">{troopInfo.defense}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">🏃 Velocidade:</span>
                        <span className="stat-value">{troopInfo.speed}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">📦 Carga:</span>
                        <span className="stat-value">{troopInfo.carry}</span>
                      </div>
                    </div>

                    <div className="troop-cost">
                      <h4>💰 Custo</h4>
                      <div className="cost-items">
                        <div className="cost-item">
                          <span>🪵</span> {troopInfo.cost.wood}
                        </div>
                        <div className="cost-item">
                          <span>🏺</span> {troopInfo.cost.clay}
                        </div>
                        <div className="cost-item">
                          <span>⚒️</span> {troopInfo.cost.iron}
                        </div>
                      </div>
                      <div className="training-time">
                        <span>⏱️</span> Treino: {formatTime(troopInfo.cost.time)}
                      </div>
                    </div>

                    <div className="troop-train-section">
                      <input 
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Quantidade"
                        className="train-input"
                        id={`train-${troopKey}`}
                      />
                      <button 
                        onClick={() => {
                          const amount = document.getElementById(`train-${troopKey}`).value;
                          if (amount && amount > 0) {
                            handleTrain(troopKey, amount);
                            document.getElementById(`train-${troopKey}`).value = '';
                          }
                        }}
                        className="btn-train"
                        disabled={loading}
                      >
                        🎯 Treinar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'battle' && (
          <div className="battle-section">
            <h2 className="section-title">⚡ Campo de Batalha</h2>
            
            <div className="battle-layout">
              <div className="npc-villages-section">
                <h3>🎯 Aldeias para Atacar</h3>
                {npcVillages.map((npc, index) => (
                  <div key={index} className="npc-village-card">
                    <div className="npc-header">
                      <h4>{npc.name}</h4>
                      <span className={`difficulty-badge ${npc.difficulty}`}>
                        {npc.difficulty === 'easy' && '🟢 Fácil'}
                        {npc.difficulty === 'medium' && '🟡 Médio'}
                        {npc.difficulty === 'hard' && '🔴 Difícil'}
                      </span>
                    </div>
                    <div className="npc-rewards">
                      <span>💰 Saque: {npc.loot} recursos</span>
                      <span>⭐ EXP: {npc.loot / 10}</span>
                    </div>

                    <div className="attack-form">
                      <h5>Selecionar Tropas:</h5>
                      <div className="troops-selector">
                        {Object.entries(village.village.troops).map(([troop, count]) => {
                          const troopInfo = troopsData[troop];
                          if (!troopInfo) return null;
                          
                          return (
                            <div key={troop} className="troop-selector-item">
                              <span className="troop-selector-emoji">{troopInfo.emoji}</span>
                              <input
                                type="number"
                                placeholder="0"
                                min="0"
                                max={count}
                                className="troop-selector-input"
                                onChange={(e) => setAttackTroops({
                                  ...attackTroops, 
                                  [troop]: parseInt(e.target.value) || 0
                                })}
                              />
                              <span className="troop-selector-max">/ {count}</span>
                            </div>
                          );
                        })}
                      </div>
                      <button 
                        onClick={() => handleAttackNPC(index)} 
                        disabled={loading}
                        className="btn-attack"
                      >
                        ⚔️ ATACAR
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="battle-history-section">
                <h3>📜 Histórico de Batalhas</h3>
                {battleHistory.length === 0 ? (
                  <p className="no-battles">Ainda não lutaste nenhuma batalha!</p>
                ) : (
                  <div className="battle-history-list">
                    {battleHistory.slice(0, 10).map((battle, index) => (
                      <div key={index} className={`battle-history-item ${battle.result}`}>
                        <div className="battle-result-icon">
                          {battle.result === 'victory' ? '🏆' : '💀'}
                        </div>
                        <div className="battle-details">
                          <div className="battle-title">
                            {battle.result === 'victory' ? 'VITÓRIA!' : 'DERROTA'}
                          </div>
                          <div className="battle-info">
                            vs {battle.defender} • {new Date(battle.date).toLocaleDateString()}
                          </div>
                          <div className="battle-loot">
                            💰 {battle.loot || 0} recursos saqueados
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && map && (
          <div className="map-section">
            <h2 className="section-title">🗺️ Mapa Mundial</h2>
            
            <div className="map-info">
              <p>📍 Tuas coordenadas: <strong>({map.myCoordinates.x}, {map.myCoordinates.y})</strong></p>
              <div className="map-legend">
                <span><span className="legend-icon">🏰</span> Tua Aldeia</span>
                <span><span className="legend-icon">⚔️</span> Jogadores</span>
                <span><span className="legend-icon">🏚️</span> Abandonadas</span>
                <span><span className="legend-icon">🌾</span> Bônus</span>
                <span><span className="legend-icon">🌳</span> Vazio</span>
              </div>
            </div>

            {selectedMapCell && (
              <div className="map-cell-details">
                <h3>Detalhes da Célula ({selectedMapCell.x}, {selectedMapCell.y})</h3>
                {selectedMapCell.type === 'player' && (
                  <p>🏰 Aldeia de <strong>{selectedMapCell.player}</strong></p>
                )}
                {selectedMapCell.type === 'enemy' && (
                  <p>⚔️ Aldeia de <strong>{selectedMapCell.player}</strong> - Clique para atacar!</p>
                )}
                {selectedMapCell.type === 'abandoned' && (
                  <p>🏚️ Aldeia Abandonada - {selectedMapCell.resources} recursos disponíveis</p>
                )}
                {selectedMapCell.type === 'bonus' && (
                  <p>{selectedMapCell.emoji} Aldeia com Bônus Especial!</p>
                )}
                <button onClick={() => setSelectedMapCell(null)} className="btn-close">Fechar</button>
              </div>
            )}

            <div className="map-grid">
              {map.grid && map.grid.map((cell, index) => (
                <div
                  key={index}
                  className={`map-cell ${cell.type}`}
                  onClick={() => setSelectedMapCell(cell)}
                  title={`(${cell.x}, ${cell.y}) ${cell.player || ''}`}
                >
                  {cell.emoji}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ranking' && rankings && (
          <div className="ranking-section">
            <h2 className="section-title">🏆 Rankings Globais</h2>
            
            <div className="ranking-tabs">
              <button 
                onClick={() => setRankingType('points')} 
                className={rankingType === 'points' ? 'active' : ''}
              >
                🏆 Pontos
              </button>
              <button 
                onClick={() => setRankingType('attackers')} 
                className={rankingType === 'attackers' ? 'active' : ''}
              >
                ⚔️ Atacantes
              </button>
              <button 
                onClick={() => setRankingType('defenders')} 
                className={rankingType === 'defenders' ? 'active' : ''}
              >
                🛡️ Defensores
              </button>
              <button 
                onClick={() => setRankingType('level')} 
                className={rankingType === 'level' ? 'active' : ''}
              >
                ⭐ Nível
              </button>
            </div>

            <div className="my-rank-banner">
              <span>Tua posição: <strong>#{rankings.myRank}</strong></span>
            </div>

            <div className="ranking-table-container">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Jogador</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.ranking.map((player, index) => (
                    <tr 
                      key={player.rank}
                      className={`ranking-row ${player.username === user.username ? 'my-rank' : ''} ${index < 3 ? 'top-rank' : ''}`}
                      onClick={() => handlePlayerClick(player.username)}
                    >
                      <td className="rank-cell">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${player.rank}`}
                      </td>
                      <td className="player-cell">
                        <span className="player-avatar">👤</span>
                        <span className="player-name">{player.username}</span>
                      </td>
                      <td className="value-cell">
                        {player.points || player.attacksWon || player.defensesWon || player.level}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedPlayer && (
              <div className="player-profile-modal" onClick={() => setSelectedPlayer(null)}>
                <div className="player-profile-content" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setSelectedPlayer(null)}>✖</button>
                  <h3>👤 Perfil de {selectedPlayer.username}</h3>
                  <div className="profile-stats">
                    <div className="profile-stat">
                      <span className="profile-label">🏆 Pontos:</span>
                      <span className="profile-value">{selectedPlayer.points}</span>
                    </div>
                    <div className="profile-stat">
                      <span className="profile-label">⭐ Nível:</span>
                      <span className="profile-value">{selectedPlayer.level}</span>
                    </div>
                    <div className="profile-stat">
                      <span className="profile-label">⚔️ Ataques Ganhos:</span>
                      <span className="profile-value">{selectedPlayer.attacksWon}</span>
                    </div>
                    <div className="profile-stat">
                      <span className="profile-label">🛡️ Defesas Ganhas:</span>
                      <span className="profile-value">{selectedPlayer.defensesWon}</span>
                    </div>
                  </div>
                  <button className="btn-attack-player" disabled>
                    ⚔️ Atacar Jogador (Em breve)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
