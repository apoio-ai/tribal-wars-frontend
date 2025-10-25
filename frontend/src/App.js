import React, { useState, useEffect } from 'react';
import * as api from './services/api';
import './styles/App.css';
import MapComponent from './components/MapComponent';
import VillageView from './components/VillageView';

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
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuild = async (building) => {
    try {
      setLoading(true);
      const response = await api.buildBuilding(building);
      showNotification(response.data.message);
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
    if (activeTab === 'ranking' && !rankings) loadRankings(rankingType);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ranking' && rankings) {
      loadRankings(rankingType);
    }
  }, [rankingType]);

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
        <h1>⚔️ Tribal Wars</h1>
        <div className="user-info">
          <span>👤 {user.username}</span>
          <span>⭐ Nível {village.stats.level}</span>
          <span>🏆 {village.stats.points} pontos</span>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      <div className="resources-bar">
        <div className="resource">🪵 Madeira: {Math.floor(village.village.resources.wood)}</div>
        <div className="resource">🏺 Argila: {Math.floor(village.village.resources.clay)}</div>
        <div className="resource">⚒️ Ferro: {Math.floor(village.village.resources.iron)}</div>
        <div className="resource">💎 Ouro: {village.village.resources.gold}</div>
      </div>

      <div className="tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>🏠 Visão Geral</button>
        <button className={activeTab === 'buildings' ? 'active' : ''} onClick={() => setActiveTab('buildings')}>🏰 Edifícios</button>
        <button className={activeTab === 'troops' ? 'active' : ''} onClick={() => setActiveTab('troops')}>⚔️ Tropas</button>
        <button className={activeTab === 'battle' ? 'active' : ''} onClick={() => setActiveTab('battle')}>🎯 Batalha</button>
        <button className={activeTab === 'map' ? 'active' : ''} onClick={() => setActiveTab('map')}>🗺️ Mapa</button>
        <button className={activeTab === 'ranking' ? 'active' : ''} onClick={() => setActiveTab('ranking')}>🏆 Rankings</button>
      </div>

      <div className="content">
        {activeTab === 'overview' && (
          <div className="overview">
            {/* Vista 3D da Aldeia */}
            <VillageView
              village={village}
              buildings={village.village.buildings}
              onBuildingClick={(buildingKey) => {
                handleBuild(buildingKey);
              }}
            />

            {/* Card de Boas-vindas */}
            <div className="card">
              <h2>🏛️ Bem-vindo, {user.username}!</h2>
              <p>Nível: {village.stats.level} | EXP: {village.stats.exp}/{village.stats.level * 100}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${(village.stats.exp / (village.stats.level * 100)) * 100}%`}}></div>
              </div>
              <button onClick={handleClaimBonus} className="btn-primary">🎁 Coletar Bônus Diário</button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>⚔️ Ataques</h3>
                <p>Vitórias: {village.stats.attacksWon}</p>
                <p>Derrotas: {village.stats.attacksLost}</p>
              </div>
              <div className="stat-card">
                <h3>🛡️ Defesas</h3>
                <p>Vitórias: {village.stats.defensesWon}</p>
                <p>Derrotas: {village.stats.defensesLost}</p>
              </div>
              <div className="stat-card">
                <h3>💀 Tropas</h3>
                <p>Mortas: {village.stats.troopsKilled}</p>
                <p>Perdidas: {village.stats.troopsLost}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'buildings' && (
          <div className="buildings-grid">
            {Object.entries(village.village.buildings).map(([building, level]) => (
              <div key={building} className="building-card">
                <h3>{building} - Nível {level}</h3>
                <button onClick={() => handleBuild(building)} disabled={loading}>
                  Melhorar
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'troops' && (
          <div className="troops-section">
            <h2>Suas Tropas</h2>
            <div className="troops-list">
              {Object.entries(village.village.troops).map(([troop, count]) => (
                <div key={troop} className="troop-item">
                  <span>{troop}: {count}</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="100"
                    placeholder="Quantidade"
                    onChange={(e) => {
                      const amount = e.target.value;
                      if (amount) handleTrain(troop, amount);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'battle' && (
          <div className="battle-section">
            <h2>Aldeias para Atacar</h2>
            {npcVillages.map((npc, index) => (
              <div key={index} className="npc-village">
                <h3>{npc.name} (Dificuldade: {npc.difficulty})</h3>
                <p>Saque: {npc.loot} recursos</p>
                <div className="attack-form">
                  {Object.keys(village.village.troops).map(troop => (
                    <input
                      key={troop}
                      type="number"
                      placeholder={`${troop} (${village.village.troops[troop]})`}
                      min="0"
                      max={village.village.troops[troop]}
                      onChange={(e) => setAttackTroops({...attackTroops, [troop]: parseInt(e.target.value) || 0})}
                    />
                  ))}
                  <button onClick={() => handleAttackNPC(index)} disabled={loading}>
                    Atacar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'map' && map && (
          <div className="map-section">
            <h2 className="section-title">🗺️ Mapa Mundial</h2>
            
            <MapComponent
              myCoordinates={map.myCoordinates}
              nearbyVillages={map.nearbyVillages}
              onVillageClick={(village) => {
                console.log('Aldeia clicada:', village);
              }}
            />
          </div>
        )}

        {activeTab === 'ranking' && rankings && (
          <div className="ranking-section">
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
            <p>Tua posição: #{rankings.myRank}</p>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Jogador</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {rankings.ranking.map(player => (
                  <tr key={player.rank}>
                    <td>{player.rank}</td>
                    <td>{player.username}</td>
                    <td>{player.points || player.attacksWon || player.defensesWon || player.level}</td>
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
