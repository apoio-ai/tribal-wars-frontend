import React, { useState, useEffect } from 'react';
import * as api from './services/api';
import './styles/App.css';
import { buildingsData, troopsData, buildingKeyMap, troopKeyMap } from './gameData';

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

  // Map
  const [map, setMap] = useState(null);

  // Battle
  const [npcVillages, setNPCVillages] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [attackTroops, setAttackTroops] = useState({});
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [lastBattleReport, setLastBattleReport] = useState(null);

  // Timers
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    checkAuth();
    
    // Atualizar relógio a cada segundo
    const clockInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadVillageData();
      const interval = setInterval(loadVillageData, 30000); // A cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

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
      showNotification('Bem-vindo ao Tribal Wars! ⚔️', 'success');
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
      showNotification('Conta criada! Boa sorte na conquista! 🏰', 'success');
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
    showNotification('Até breve, guerreiro!', 'info');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBuild = async (building) => {
    try {
      setLoading(true);
      const response = await api.buildBuilding(building);
      showNotification(response.data.message, 'success');
      await loadVillageData();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Erro ao construir', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async (troop, amount) => {
    try {
      setLoading(true);
      const response = await api.trainTroops(troop, parseInt(amount));
      showNotification(response.data.message, 'success');
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
      setLastBattleReport(response.data.battle);
      showNotification(response.data.message, response.data.battle.winner === 'attacker' ? 'success' : 'error');
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
      showNotification(response.data.message + ` Streak: ${response.data.streak} dias!`, 'success');
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
      setMap(response.data);
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
    if (activeTab === 'ranking' && !rankings) loadRankings(rankingType);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ranking' && rankings) {
      loadRankings(rankingType);
    }
  }, [rankingType]);

  // Função para calcular tempo restante
  const getTimeRemaining = (completesAt) => {
    const now = currentTime;
    const remaining = new Date(completesAt).getTime() - now;
    
    if (remaining <= 0) return 'Concluído!';
    
    const seconds = Math.floor((remaining / 1000) % 60);
    const minutes = Math.floor((remaining / 1000 / 60) % 60);
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Função auxiliar para obter dados do edifício
  const getBuildingData = (buildingKey) => {
    const lowerKey = buildingKey.toLowerCase();
    return buildingsData[lowerKey] || buildingsData[buildingKeyMap[buildingKey]] || {
      name: buildingKey,
      emoji: '🏛️',
      description: 'Edifício da aldeia'
    };
  };

  // Função auxiliar para obter dados da tropa
  const getTroopData = (troopKey) => {
    const lowerKey = troopKey.toLowerCase();
    return troopsData[lowerKey] || troopsData[troopKeyMap[troopKey]] || {
      name: troopKey,
      emoji: '⚔️',
      description: 'Unidade militar',
      attack: 0,
      defense: 0
    };
  };

  // Calcular custo de construção
  const calculateBuildCost = (building, level) => {
    const baseCosts = {
      headquarters: { wood: 100, clay: 150, iron: 50 },
      barracks: { wood: 200, clay: 170, iron: 90 },
      lumbermill: { wood: 80, clay: 100, iron: 30 },
      claypit: { wood: 100, clay: 80, iron: 30 },
      ironmine: { wood: 100, clay: 80, iron: 50 },
      warehouse: { wood: 130, clay: 160, iron: 90 },
      farm: { wood: 100, clay: 80, iron: 40 },
      market: { wood: 200, clay: 150, iron: 150 },
      workshop: { wood: 300, clay: 200, iron: 250 },
      wall: { wood: 150, clay: 200, iron: 100 }
    };

    const base = baseCosts[building] || { wood: 100, clay: 100, iron: 50 };
    const multiplier = 1.26;
    
    return {
      wood: Math.floor(base.wood * Math.pow(multiplier, level)),
      clay: Math.floor(base.clay * Math.pow(multiplier, level)),
      iron: Math.floor(base.iron * Math.pow(multiplier, level))
    };
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>⚔️ Tribal Wars</h1>
          {!isRegistering ? (
            <form onSubmit={handleLogin}>
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit" disabled={loading}>
                {loading ? 'A ENTRAR...' : 'ENTRAR'}
              </button>
              <p className="switch-text">
                Não tens conta? <span onClick={() => setIsRegistering(true)}>Regista-te</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <input type="text" name="username" placeholder="Username (3-20 caracteres)" required minLength="3" maxLength="20" />
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password (mín. 6 caracteres)" required minLength="6" />
              <button type="submit" disabled={loading}>
                {loading ? 'A CRIAR...' : 'CRIAR CONTA'}
              </button>
              <p className="switch-text">
                Já tens conta? <span onClick={() => setIsRegistering(false)}>Entra aqui</span>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (!village) {
    return <div className="loading">A carregar aldeia...</div>;
  }

  return (
    <div className="game-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <header className="game-header">
        <h1>⚔️ Tribal Wars</h1>
        <div className="user-info">
          <span>👤 {user.username}</span>
          <span>⭐ Nível {village.stats.level}</span>
          <span>🏆 {village.stats.points} pontos</span>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      <div className="resources-bar">
        <div className="resource">
          <span>🪵</span> Madeira: <strong>{Math.floor(village.village.resources.wood)}</strong>
        </div>
        <div className="resource">
          <span>🏺</span> Argila: <strong>{Math.floor(village.village.resources.clay)}</strong>
        </div>
        <div className="resource">
          <span>⚒️</span> Ferro: <strong>{Math.floor(village.village.resources.iron)}</strong>
        </div>
        <div className="resource">
          <span>💎</span> Ouro: <strong>{village.village.resources.gold}</strong>
        </div>
      </div>

      <div className="tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          🏠 Visão Geral
        </button>
        <button className={activeTab === 'buildings' ? 'active' : ''} onClick={() => setActiveTab('buildings')}>
          🏰 Edifícios
        </button>
        <button className={activeTab === 'troops' ? 'active' : ''} onClick={() => setActiveTab('troops')}>
          ⚔️ Tropas
        </button>
        <button className={activeTab === 'battle' ? 'active' : ''} onClick={() => setActiveTab('battle')}>
          🎯 Batalha
        </button>
        <button className={activeTab === 'map' ? 'active' : ''} onClick={() => setActiveTab('map')}>
          🗺️ Mapa
        </button>
        <button className={activeTab === 'ranking' ? 'active' : ''} onClick={() => setActiveTab('ranking')}>
          🏆 Rankings
        </button>
      </div>

      <div className="content">
        {/* ========== VISÃO GERAL ========== */}
        {activeTab === 'overview' && (
          <div className="overview">
            <div className="card">
              <h2>🏛️ Bem-vindo à tua aldeia, {user.username}!</h2>
              <p><strong>Nível:</strong> {village.stats.level} | <strong>EXP:</strong> {village.stats.exp}/{village.stats.level * 100}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${(village.stats.exp / (village.stats.level * 100)) * 100}%`}}>
                  {Math.floor((village.stats.exp / (village.stats.level * 100)) * 100)}%
                </div>
              </div>
              <button onClick={handleClaimBonus} className="btn-primary">🎁 Coletar Bônus Diário</button>
            </div>

            {/* Fila de Construção */}
            {village.village.buildQueue && village.village.buildQueue.length > 0 && (
              <div className="build-queue">
                <h3>🔨 Fila de Construção</h3>
                {village.village.buildQueue.map((item, index) => {
                  const buildingInfo = getBuildingData(item.building);
                  return (
                    <div key={index} className="queue-item">
                      <div className="queue-item-info">
                        <span className="queue-icon">{buildingInfo.emoji}</span>
                        <div className="queue-details">
                          <strong>{buildingInfo.name}</strong> → Nível {item.level}
                        </div>
                      </div>
                      <div className="queue-timer">
                        ⏱️ {getTimeRemaining(item.completesAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fila de Tropas */}
            {village.village.troopQueue && village.village.troopQueue.length > 0 && (
              <div className="build-queue">
                <h3>⚔️ Fila de Treino</h3>
                {village.village.troopQueue.map((item, index) => {
                  const troopInfo = getTroopData(item.troop);
                  return (
                    <div key={index} className="queue-item">
                      <div className="queue-item-info">
                        <span className="queue-icon">{troopInfo.emoji}</span>
                        <div className="queue-details">
                          <strong>{item.amount}x {troopInfo.name}</strong>
                        </div>
                      </div>
                      <div className="queue-timer">
                        ⏱️ {getTimeRemaining(item.completesAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card">
                <h3>⚔️ Estatísticas de Ataque</h3>
                <p>Vitórias: <strong>{village.stats.attacksWon}</strong></p>
                <p>Derrotas: <strong>{village.stats.attacksLost}</strong></p>
                <p>Tropas eliminadas: <strong>{village.stats.troopsKilled}</strong></p>
              </div>
              <div className="stat-card">
                <h3>🛡️ Estatísticas de Defesa</h3>
                <p>Vitórias: <strong>{village.stats.defensesWon}</strong></p>
                <p>Derrotas: <strong>{village.stats.defensesLost}</strong></p>
                <p>Tropas perdidas: <strong>{village.stats.troopsLost}</strong></p>
              </div>
              <div className="stat-card">
                <h3>💰 Economia</h3>
                <p>Recursos saqueados: <strong>{village.stats.resourcesLooted}</strong></p>
                <p>Aldeias conquistadas: <strong>{village.conqueredVillages?.length || 0}</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* ========== EDIFÍCIOS ========== */}
        {activeTab === 'buildings' && (
          <div>
            <h2 style={{color: '#7d510f', marginBottom: '15px', fontSize: '1.4rem', fontWeight: 'bold'}}>
              🏰 Edifícios da Aldeia
            </h2>
            
            <table className="buildings-table">
              <thead>
                <tr>
                  <th>Edifício</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Nível</th>
                  <th>Custo</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(village.village.buildings).map(([building, level]) => {
                  const buildingInfo = getBuildingData(building);
                  const cost = calculateBuildCost(building, level);
                  const canAfford = village.village.resources.wood >= cost.wood &&
                                   village.village.resources.clay >= cost.clay &&
                                   village.village.resources.iron >= cost.iron;
                  const isBuilding = village.village.buildQueue?.some(b => b.building === building);
                  
                  return (
                    <tr key={building}>
                      <td className="building-icon-cell">{buildingInfo.emoji}</td>
                      <td><strong>{buildingInfo.name}</strong></td>
                      <td>{buildingInfo.description}</td>
                      <td className="building-level">Nível {level}</td>
                      <td style={{fontSize: '10px'}}>
                        🪵 {cost.wood} | 🏺 {cost.clay} | ⚒️ {cost.iron}
                      </td>
                      <td>
                        <button 
                          onClick={() => handleBuild(building)} 
                          disabled={loading || !canAfford || isBuilding}
                          className="btn-build"
                        >
                          {isBuilding ? '🔨 Construindo...' : 'Melhorar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ========== TROPAS ========== */}
        {activeTab === 'troops' && (
          <div className="troops-section">
            <h2>⚔️ Tropas e Treino</h2>
            
            <table className="troops-table">
              <thead>
                <tr>
                  <th>Tropa</th>
                  <th>Nome</th>
                  <th>Estatísticas</th>
                  <th>Disponível</th>
                  <th>Quantidade</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(village.village.troops).map(([troop, count]) => {
                  const troopInfo = getTroopData(troop);
                  
                  return (
                    <tr key={troop}>
                      <td className="troop-icon-cell">{troopInfo.emoji}</td>
                      <td><strong>{troopInfo.name}</strong></td>
                      <td className="troop-stats">
                        ⚔️ {troopInfo.attack} | 🛡️ {troopInfo.defense}
                      </td>
                      <td className="troop-count">{count}</td>
                      <td>
                        <input 
                          type="number" 
                          min="1" 
                          max="100"
                          placeholder="Qtd"
                          className="train-input"
                          id={`train-${troop}`}
                        />
                      </td>
                      <td>
                        <button 
                          className="btn-train"
                          onClick={() => {
                            const amount = document.getElementById(`train-${troop}`).value;
                            if (amount && amount > 0) {
                              handleTrain(troop, amount);
                              document.getElementById(`train-${troop}`).value = '';
                            }
                          }}
                        >
                          Treinar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ========== BATALHA ========== */}
        {activeTab === 'battle' && (
          <div className="battle-section">
            <h2>🎯 Centro de Batalha</h2>
            
            {lastBattleReport && (
              <div className="battle-report">
                <h3>📜 Relatório de Batalha</h3>
                <div className={`battle-result ${lastBattleReport.winner === 'attacker' ? 'victory' : 'defeat'}`}>
                  {lastBattleReport.winner === 'attacker' ? '🎉 VITÓRIA!' : '😢 DERROTA'}
                </div>
                
                <div className="battle-details">
                  <div className="battle-side">
                    <h4>👤 Atacante</h4>
                    <div className="battle-losses">
                      <p><strong>Poder de Ataque:</strong> {lastBattleReport.attackPower}</p>
                      <p><strong>Perdas:</strong></p>
                      {Object.entries(lastBattleReport.attackerLosses).map(([troop, losses]) => (
                        losses > 0 && <p key={troop}>• {getTroopData(troop).name}: {losses}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="battle-side">
                    <h4>🛡️ Defensor</h4>
                    <div className="battle-losses">
                      <p><strong>Poder de Defesa:</strong> {lastBattleReport.defensePower}</p>
                      <p><strong>Perdas:</strong></p>
                      {Object.entries(lastBattleReport.defenderLosses).map(([troop, losses]) => (
                        losses > 0 && <p key={troop}>• {getTroopData(troop).name}: {losses}</p>
                      ))}
                    </div>
                  </div>
                </div>
                
                {lastBattleReport.loot && lastBattleReport.winner === 'attacker' && (
                  <div className="battle-loot">
                    <h4>💰 Saque Obtido</h4>
                    <p>
                      🪵 {lastBattleReport.loot.wood} | 
                      🏺 {lastBattleReport.loot.clay} | 
                      ⚒️ {lastBattleReport.loot.iron} | 
                      💎 {lastBattleReport.loot.gold}
                    </p>
                  </div>
                )}
                
                <button 
                  className="btn-primary" 
                  onClick={() => setLastBattleReport(null)}
                  style={{width: '100%', marginTop: '15px'}}
                >
                  Fechar Relatório
                </button>
              </div>
            )}
            
            <div className="npc-villages-grid">
              {npcVillages.map((npc, index) => (
                <div key={index} className="npc-village-card">
                  <h3>
                    {npc.name}
                    <span className={`difficulty-badge difficulty-${npc.difficulty}`}>
                      Nível {npc.difficulty}
                    </span>
                  </h3>
                  <p><strong>💰 Saque:</strong> {npc.loot} recursos</p>
                  <p><strong>🛡️ Defesas:</strong> 
                    {Object.entries(npc.troops).map(([troop, count]) => (
                      ` ${count}x ${getTroopData(troop).emoji}`
                    ))}
                  </p>
                  
                  {selectedNPC === index ? (
                    <div className="attack-form">
                      {Object.keys(village.village.troops).map(troop => {
                        const troopInfo = getTroopData(troop);
                        return (
                          <input
                            key={troop}
                            type="number"
                            className="attack-input"
                            placeholder={`${troopInfo.emoji} ${troopInfo.name} (${village.village.troops[troop]})`}
                            min="0"
                            max={village.village.troops[troop]}
                            value={attackTroops[troop] || ''}
                            onChange={(e) => setAttackTroops({
                              ...attackTroops, 
                              [troop]: parseInt(e.target.value) || 0
                            })}
                          />
                        );
                      })}
                      <button 
                        onClick={() => handleAttackNPC(index)} 
                        disabled={loading}
                        className="btn-attack"
                      >
                        {loading ? '⚔️ Atacando...' : '⚔️ ATACAR'}
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedNPC(null);
                          setAttackTroops({});
                        }}
                        className="btn-primary"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSelectedNPC(index)}
                      className="btn-primary"
                      style={{width: '100%', marginTop: '10px'}}
                    >
                      Selecionar Tropas
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== MAPA ========== */}
        {activeTab === 'map' && map && (
          <div className="map-section">
            <h2>🗺️ Mapa Mundial</h2>
            <p style={{marginBottom: '15px', color: '#603000'}}>
              <strong>📍 Tuas coordenadas:</strong> ({map.myCoordinates.x}, {map.myCoordinates.y})
            </p>
            
            <div className="villages-grid">
              {map.nearbyVillages.map(village => (
                <div key={village.id} className="village-card">
                  <strong>👤 {village.username}</strong>
                  <div className="village-card-info">
                    🏘️ {village.villageName}
                  </div>
                  <div className="village-card-info">
                    📍 ({village.coordinates.x}, {village.coordinates.y})
                  </div>
                  <div className="village-card-info">
                    🏆 {village.points} pontos
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== RANKINGS ========== */}
        {activeTab === 'ranking' && rankings && (
          <div className="ranking-section">
            <h2 style={{color: '#7d510f', marginBottom: '15px', fontSize: '1.4rem', fontWeight: 'bold'}}>
              🏆 Rankings Globais
            </h2>
            
            <div className="ranking-tabs">
              <button onClick={() => setRankingType('points')} className={rankingType === 'points' ? 'active' : ''}>
                🏆 Pontos
              </button>
              <button onClick={() => setRankingType('attackers')} className={rankingType === 'attackers' ? 'active' : ''}>
                ⚔️ Atacantes
              </button>
              <button onClick={() => setRankingType('defenders')} className={rankingType === 'defenders' ? 'active' : ''}>
                🛡️ Defensores
              </button>
              <button onClick={() => setRankingType('level')} className={rankingType === 'level' ? 'active' : ''}>
                ⭐ Nível
              </button>
            </div>
            
            <p style={{marginBottom: '15px', fontWeight: 'bold', color: '#7d510f'}}>
              Tua posição: <strong style={{fontSize: '1.2rem'}}>#{rankings.myRank}</strong>
            </p>
            
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Jogador</th>
                  <th>
                    {rankingType === 'points' && 'Pontos'}
                    {rankingType === 'attackers' && 'Ataques Vencidos'}
                    {rankingType === 'defenders' && 'Defesas Vencidas'}
                    {rankingType === 'level' && 'Nível'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankings.ranking.map(player => (
                  <tr key={player.rank}>
                    <td className="rank-position">
                      {player.rank === 1 && <span className="rank-gold">🥇</span>}
                      {player.rank === 2 && <span className="rank-silver">🥈</span>}
                      {player.rank === 3 && <span className="rank-bronze">🥉</span>}
                      {player.rank > 3 && player.rank}
                    </td>
                    <td><strong>{player.username}</strong></td>
                    <td>
                      <strong>
                        {player.points || player.attacksWon || player.defensesWon || player.level}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
