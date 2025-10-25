import React, { useState, useEffect } from 'react';
import * as api from './services/api';
import { buildingsData, troopsData, villageTypes, getBuildingInfo, getTroopInfo } from './gameData';
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

  // Battle
  const [npcVillages, setNPCVillages] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [attackTroops, setAttackTroops] = useState({});
  const [selectedNPC, setSelectedNPC] = useState(null);

  // Troops
  const [selectedTroop, setSelectedTroop] = useState(null);

  // Buildings
  const [buildingQueue, setBuildingQueue] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadVillageData();
      const interval = setInterval(loadVillageData, 60000); // Atualizar a cada minuto
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Building timer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBuildingQueue(prev => prev.map(building => ({
        ...building,
        timeRemaining: Math.max(0, building.timeRemaining - 1)
      })).filter(b => b.timeRemaining > 0));
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
      showNotification('Login bem-sucedido!');
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
      showNotification('Conta criada com sucesso! Bem-vindo!');
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
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuild = async (building) => {
    try {
      setLoading(true);
      const buildingInfo = getBuildingInfo(building, village.village.buildings[building]);

      // Add to building queue for visual feedback
      setBuildingQueue(prev => [...prev, {
        name: building,
        timeRemaining: buildingInfo.buildTime,
        totalTime: buildingInfo.buildTime
      }]);

      const response = await api.buildBuilding(building);
      showNotification(response.data.message);
      await loadVillageData();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erro ao construir', 'error');
      setBuildingQueue(prev => prev.filter(b => b.name !== building));
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async (troop, amount) => {
    if (!amount || amount <= 0) return;

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
      setSelectedNPC(null);
      await loadVillageData();
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
      // Simulate village types for demo
      const enrichedMap = {
        ...response.data,
        nearbyVillages: response.data.nearbyVillages.map((v, idx) => ({
          ...v,
          type: idx % 4 === 0 ? 'bonus' : idx % 3 === 0 ? 'abandoned' : 'player'
        }))
      };
      setMap(enrichedMap);
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

  useEffect(() => {
    if (activeTab === 'map' && !map) loadMap();
    if (activeTab === 'battle' && npcVillages.length === 0) loadNPCVillages();
    if (activeTab === 'battle' && battleHistory.length === 0) loadBattleHistory();
    if (activeTab === 'ranking' && !rankings) loadRankings(rankingType);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ranking') loadRankings(rankingType);
  }, [rankingType]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
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
    return <div className="loading">Carregando aldeia...</div>;
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
          <span className="village-name">Aldeia de {user.username}</span>
        </div>
        <div className="user-info">
          <span className="user-stat">👤 {user.username}</span>
          <span className="user-stat level">⭐ Nível {village.stats.level}</span>
          <span className="user-stat points">🏆 {village.stats.points} pontos</span>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      <div className="resources-bar">
        <div className="resource wood">
          <span className="resource-icon">🪵</span>
          <div className="resource-info">
            <span className="resource-label">Madeira</span>
            <span className="resource-value">{Math.floor(village.village.resources.wood)}</span>
          </div>
        </div>
        <div className="resource clay">
          <span className="resource-icon">🏺</span>
          <div className="resource-info">
            <span className="resource-label">Argila</span>
            <span className="resource-value">{Math.floor(village.village.resources.clay)}</span>
          </div>
        </div>
        <div className="resource iron">
          <span className="resource-icon">⚒️</span>
          <div className="resource-info">
            <span className="resource-label">Ferro</span>
            <span className="resource-value">{Math.floor(village.village.resources.iron)}</span>
          </div>
        </div>
        <div className="resource gold">
          <span className="resource-icon">💎</span>
          <div className="resource-info">
            <span className="resource-label">Ouro</span>
            <span className="resource-value">{village.village.resources.gold}</span>
          </div>
        </div>
      </div>

      {buildingQueue.length > 0 && (
        <div className="building-queue">
          <h3>🏗️ Construção em Andamento:</h3>
          {buildingQueue.map((building, idx) => {
            const info = buildingsData[building.name];
            return (
              <div key={idx} className="queue-item">
                <span>{info?.icon} {info?.name || building.name}</span>
                <div className="queue-progress">
                  <div
                    className="queue-progress-fill"
                    style={{width: `${((building.totalTime - building.timeRemaining) / building.totalTime) * 100}%`}}
                  ></div>
                </div>
                <span className="queue-time">{formatTime(building.timeRemaining)}</span>
              </div>
            );
          })}
        </div>
      )}

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
            <div className="overview-header">
              <div className="card welcome-card">
                <h2>🏛️ Bem-vindo, {user.username}!</h2>
                <div className="level-info">
                  <span>Nível {village.stats.level}</span>
                  <span className="exp-text">EXP: {village.stats.exp}/{village.stats.level * 100}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${(village.stats.exp / (village.stats.level * 100)) * 100}%`}}></div>
                </div>
                <button onClick={handleClaimBonus} className="btn-primary">
                  🎁 Coletar Bónus Diário
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card attacks">
                  <div className="stat-icon">⚔️</div>
                  <h3>Ataques</h3>
                  <div className="stat-values">
                    <p><span className="stat-label">Vitórias:</span> <span className="stat-number win">{village.stats.attacksWon}</span></p>
                    <p><span className="stat-label">Derrotas:</span> <span className="stat-number loss">{village.stats.attacksLost}</span></p>
                  </div>
                </div>
                <div className="stat-card defenses">
                  <div className="stat-icon">🛡️</div>
                  <h3>Defesas</h3>
                  <div className="stat-values">
                    <p><span className="stat-label">Vitórias:</span> <span className="stat-number win">{village.stats.defensesWon}</span></p>
                    <p><span className="stat-label">Derrotas:</span> <span className="stat-number loss">{village.stats.defensesLost}</span></p>
                  </div>
                </div>
                <div className="stat-card troops-stats">
                  <div className="stat-icon">💀</div>
                  <h3>Tropas</h3>
                  <div className="stat-values">
                    <p><span className="stat-label">Mortas:</span> <span className="stat-number">{village.stats.troopsKilled}</span></p>
                    <p><span className="stat-label">Perdidas:</span> <span className="stat-number">{village.stats.troopsLost}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="village-layout">
              <h2>🏘️ Vista da Aldeia</h2>
              <div className="village-grid">
                {Object.entries(village.village.buildings).map(([building, level]) => {
                  const buildingInfo = buildingsData[building];
                  return (
                    <div key={building} className="village-building" title={buildingInfo?.name || building}>
                      <div className="village-building-image" style={{backgroundImage: `url(${buildingInfo?.image})`}}>
                        <span className="village-building-icon">{buildingInfo?.icon}</span>
                      </div>
                      <div className="village-building-info">
                        <span className="village-building-name">{buildingInfo?.name || building}</span>
                        <span className="village-building-level">Nível {level}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'buildings' && (
          <div className="buildings-section">
            <h2>🏗️ Edifícios da Aldeia</h2>
            <div className="buildings-grid">
              {Object.entries(village.village.buildings).map(([building, level]) => {
                const buildingInfo = getBuildingInfo(building, level);
                const isBuilding = buildingQueue.some(b => b.name === building);
                const canAfford = buildingInfo &&
                  village.village.resources.wood >= buildingInfo.costs.wood &&
                  village.village.resources.clay >= buildingInfo.costs.clay &&
                  village.village.resources.iron >= buildingInfo.costs.iron;

                return (
                  <div key={building} className={`building-card ${!canAfford ? 'insufficient-resources' : ''}`}>
                    <div className="building-image" style={{backgroundImage: `url(${buildingInfo?.image})`}}>
                      <span className="building-level-badge">Nível {level}</span>
                    </div>
                    <div className="building-content">
                      <h3>{buildingInfo?.icon} {buildingInfo?.name}</h3>
                      <p className="building-description">{buildingInfo?.description}</p>

                      {buildingInfo && (
                        <>
                          <div className="building-costs">
                            <h4>Custo para Nível {level + 1}:</h4>
                            <div className="cost-list">
                              <span className={village.village.resources.wood >= buildingInfo.costs.wood ? '' : 'insufficient'}>
                                🪵 {buildingInfo.costs.wood}
                              </span>
                              <span className={village.village.resources.clay >= buildingInfo.costs.clay ? '' : 'insufficient'}>
                                🏺 {buildingInfo.costs.clay}
                              </span>
                              <span className={village.village.resources.iron >= buildingInfo.costs.iron ? '' : 'insufficient'}>
                                ⚒️ {buildingInfo.costs.iron}
                              </span>
                            </div>
                          </div>

                          <div className="building-time">
                            <span>⏱️ Tempo: {formatTime(buildingInfo.buildTime)}</span>
                          </div>
                        </>
                      )}

                      {isBuilding ? (
                        <button className="btn-building" disabled>
                          🏗️ Construindo...
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuild(building)}
                          disabled={loading || !canAfford}
                          className={canAfford ? 'btn-build' : 'btn-build disabled'}
                        >
                          {canAfford ? '⬆️ Melhorar' : '❌ Recursos Insuficientes'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'troops' && (
          <div className="troops-section">
            <div className="troops-layout">
              <div className="troops-list-panel">
                <h2>⚔️ Suas Tropas</h2>
                <div className="troops-list">
                  {Object.entries(village.village.troops).map(([troop, count]) => {
                    const troopInfo = getTroopInfo(troop);
                    return (
                      <div
                        key={troop}
                        className={`troop-item ${selectedTroop === troop ? 'selected' : ''}`}
                        onClick={() => setSelectedTroop(troop)}
                      >
                        <div className="troop-item-image" style={{backgroundImage: `url(${troopInfo?.image})`}}>
                          <span className="troop-icon">{troopInfo?.icon}</span>
                        </div>
                        <div className="troop-item-info">
                          <h4>{troopInfo?.name || troop}</h4>
                          <p className="troop-count">Quantidade: <strong>{count}</strong></p>
                        </div>
                        <button className="btn-select">Ver Detalhes</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedTroop && (
                <div className="troop-details-panel">
                  {(() => {
                    const troopInfo = getTroopInfo(selectedTroop);
                    return (
                      <>
                        <div className="troop-details-header">
                          <div className="troop-details-image" style={{backgroundImage: `url(${troopInfo?.image})`}}>
                            <span className="troop-details-icon">{troopInfo?.icon}</span>
                          </div>
                          <div>
                            <h2>{troopInfo?.name}</h2>
                            <p className="troop-details-description">{troopInfo?.description}</p>
                          </div>
                        </div>

                        <div className="troop-history">
                          <h3>📜 História</h3>
                          <p>{troopInfo?.history}</p>
                        </div>

                        <div className="troop-stats">
                          <h3>📊 Estatísticas</h3>
                          <div className="stats-list">
                            <div className="stat-item">
                              <span className="stat-label">⚔️ Ataque:</span>
                              <div className="stat-bar">
                                <div className="stat-bar-fill attack" style={{width: `${troopInfo?.stats.attack / 2}%`}}></div>
                                <span className="stat-value">{troopInfo?.stats.attack}</span>
                              </div>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">🛡️ Defesa:</span>
                              <div className="stat-bar">
                                <div className="stat-bar-fill defense" style={{width: `${troopInfo?.stats.defense / 2}%`}}></div>
                                <span className="stat-value">{troopInfo?.stats.defense}</span>
                              </div>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">🐎 Def. vs Cavalaria:</span>
                              <div className="stat-bar">
                                <div className="stat-bar-fill cavalry" style={{width: `${troopInfo?.stats.defenseAgainstCavalry / 2}%`}}></div>
                                <span className="stat-value">{troopInfo?.stats.defenseAgainstCavalry}</span>
                              </div>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">⚡ Velocidade:</span>
                              <span className="stat-value">{troopInfo?.stats.speed} min/campo</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">📦 Capacidade:</span>
                              <span className="stat-value">{troopInfo?.stats.carryCapacity}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">👥 População:</span>
                              <span className="stat-value">{troopInfo?.stats.population}</span>
                            </div>
                          </div>
                        </div>

                        <div className="troop-training">
                          <h3>🎓 Treinar Tropas</h3>
                          <div className="training-costs">
                            <span>🪵 {troopInfo?.costs.wood}</span>
                            <span>🏺 {troopInfo?.costs.clay}</span>
                            <span>⚒️ {troopInfo?.costs.iron}</span>
                            <span>⏱️ {formatTime(troopInfo?.costs.time)}</span>
                          </div>
                          <div className="training-input">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="Quantidade"
                              id={`train-${selectedTroop}`}
                            />
                            <button
                              className="btn-train"
                              onClick={() => {
                                const amount = document.getElementById(`train-${selectedTroop}`).value;
                                handleTrain(selectedTroop, amount);
                                document.getElementById(`train-${selectedTroop}`).value = '';
                              }}
                            >
                              🎓 Treinar
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'battle' && (
          <div className="battle-section">
            <h2>⚔️ Centro de Batalha</h2>

            <div className="battle-layout">
              <div className="npc-villages-panel">
                <h3>🏴 Aldeias Disponíveis para Ataque</h3>
                <div className="npc-villages-grid">
                  {npcVillages.map((npc, index) => (
                    <div
                      key={index}
                      className={`npc-village-card ${selectedNPC === index ? 'selected' : ''}`}
                      onClick={() => setSelectedNPC(index)}
                    >
                      <div className="npc-image" style={{backgroundImage: `url(${villageTypes.npc.image})`}}>
                        <span className="npc-icon">{villageTypes.npc.icon}</span>
                        <span className="difficulty-badge difficulty-${npc.difficulty.toLowerCase()}">
                          {npc.difficulty}
                        </span>
                      </div>
                      <div className="npc-info">
                        <h4>{npc.name}</h4>
                        <p className="npc-loot">💰 Saque: {npc.loot} recursos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNPC !== null && (
                <div className="attack-panel">
                  <h3>🎯 Preparar Ataque</h3>
                  <div className="attack-target">
                    <h4>Alvo: {npcVillages[selectedNPC].name}</h4>
                    <p>Dificuldade: <span className={`difficulty-${npcVillages[selectedNPC].difficulty.toLowerCase()}`}>
                      {npcVillages[selectedNPC].difficulty}
                    </span></p>
                  </div>

                  <div className="troops-selection">
                    <h4>Selecionar Tropas:</h4>
                    {Object.entries(village.village.troops).map(([troop, count]) => {
                      const troopInfo = getTroopInfo(troop);
                      return (
                        <div key={troop} className="troop-selector">
                          <div className="troop-selector-info">
                            <span className="troop-selector-icon">{troopInfo?.icon}</span>
                            <span className="troop-selector-name">{troopInfo?.name}</span>
                            <span className="troop-selector-available">({count} disponíveis)</span>
                          </div>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            max={count}
                            value={attackTroops[troop] || ''}
                            onChange={(e) => setAttackTroops({
                              ...attackTroops,
                              [troop]: Math.min(parseInt(e.target.value) || 0, count)
                            })}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleAttackNPC(selectedNPC)}
                    disabled={loading || Object.values(attackTroops).every(v => !v || v === 0)}
                    className="btn-attack"
                  >
                    ⚔️ ATACAR!
                  </button>
                </div>
              )}
            </div>

            {battleHistory.length > 0 && (
              <div className="battle-history">
                <h3>📜 Histórico de Batalhas</h3>
                <div className="history-list">
                  {battleHistory.slice(0, 5).map((battle, idx) => (
                    <div key={idx} className={`history-item ${battle.result}`}>
                      <span className="history-icon">{battle.result === 'victory' ? '🎉' : '💀'}</span>
                      <span className="history-text">{battle.description}</span>
                      <span className="history-time">{new Date(battle.timestamp).toLocaleString('pt-PT')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && map && (
          <div className="map-section">
            <h2>🗺️ Mapa do Mundo</h2>
            <div className="map-info">
              <p>📍 Suas coordenadas: <strong>({map.myCoordinates.x}, {map.myCoordinates.y})</strong></p>
            </div>

            <div className="map-legend">
              <h3>Legenda:</h3>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-icon" style={{color: villageTypes.player.color}}>{villageTypes.player.icon}</span>
                  <span>{villageTypes.player.name}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon" style={{color: villageTypes.abandoned.color}}>{villageTypes.abandoned.icon}</span>
                  <span>{villageTypes.abandoned.name}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon" style={{color: villageTypes.bonus.color}}>{villageTypes.bonus.icon}</span>
                  <span>{villageTypes.bonus.name}</span>
                </div>
              </div>
            </div>

            <div className="villages-grid">
              {map.nearbyVillages.map(village => {
                const villageType = villageTypes[village.type] || villageTypes.player;
                return (
                  <div key={village.id} className={`map-village-card ${village.type}`}>
                    <div className="map-village-image" style={{backgroundImage: `url(${villageType.image})`}}>
                      <span className="map-village-icon" style={{color: villageType.color}}>
                        {villageType.icon}
                      </span>
                    </div>
                    <div className="map-village-info">
                      <h4>{village.username}</h4>
                      <p className="village-name">{village.villageName}</p>
                      <p className="village-coords">📍 ({village.coordinates.x}, {village.coordinates.y})</p>
                      <p className="village-points">🏆 {village.points} pontos</p>
                      {village.type === 'bonus' && (
                        <p className="village-bonus">✨ Bónus especial disponível</p>
                      )}
                      {village.type === 'abandoned' && (
                        <p className="village-abandoned">🏚️ Pode ser conquistada</p>
                      )}
                    </div>
                    <button className="btn-map-action">
                      {village.type === 'abandoned' ? '🎯 Conquistar' : '⚔️ Atacar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'ranking' && rankings && (
          <div className="ranking-section">
            <h2>🏆 Rankings Globais</h2>
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

            <div className="my-rank">
              <p>Sua posição: <strong>#{rankings.myRank}</strong></p>
            </div>

            <div className="ranking-table-container">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Jogador</th>
                    <th>Valor</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.ranking.map(player => (
                    <tr key={player.rank} className={player.username === user.username ? 'current-player' : ''}>
                      <td className="rank-position">
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                      </td>
                      <td className="rank-player">{player.username}</td>
                      <td className="rank-value">
                        {player.points || player.attacksWon || player.defensesWon || player.level}
                      </td>
                      <td>
                        <button
                          className="btn-view-profile"
                          onClick={() => setSelectedPlayer(player)}
                        >
                          👁️ Ver Perfil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <div className="modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPlayer(null)}>×</button>
            <div className="player-profile">
              <h2>👤 Perfil de {selectedPlayer.username}</h2>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-label">🏆 Pontos:</span>
                  <span className="profile-stat-value">{selectedPlayer.points || 'N/A'}</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-label">⚔️ Ataques Vencidos:</span>
                  <span className="profile-stat-value">{selectedPlayer.attacksWon || 'N/A'}</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-label">🛡️ Defesas Vencidas:</span>
                  <span className="profile-stat-value">{selectedPlayer.defensesWon || 'N/A'}</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-label">⭐ Nível:</span>
                  <span className="profile-stat-value">{selectedPlayer.level || 'N/A'}</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-label">📊 Posição:</span>
                  <span className="profile-stat-value">#{selectedPlayer.rank}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="btn-attack-player">⚔️ Atacar Jogador</button>
                <button className="btn-send-message">💌 Enviar Mensagem</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
