import React, { useState } from 'react';
import './VillageView.css';

const VillageView = ({ village, buildings, onBuildingClick }) => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  // Dados dos edifícios com posições e visuais
  const buildingsData = {
    headquarters: {
      name: 'Quartel General',
      icon: '🏛️',
      position: { x: '48%', y: '45%' },
      size: 'extra-large',
      color: '#8B4513',
      description: 'Centro de comando da aldeia'
    },
    barracks: {
      name: 'Quartel',
      icon: '⚔️',
      position: { x: '25%', y: '35%' },
      size: 'large',
      color: '#DC143C',
      description: 'Treina tropas militares'
    },
    farm: {
      name: 'Quinta',
      icon: '🌾',
      position: { x: '72%', y: '30%' },
      size: 'medium',
      color: '#DAA520',
      description: 'Produz comida'
    },
    warehouse: {
      name: 'Armazém',
      icon: '📦',
      position: { x: '65%', y: '55%' },
      size: 'medium',
      color: '#8B7355',
      description: 'Armazena recursos'
    },
    wall: {
      name: 'Muralha',
      icon: '🛡️',
      position: { x: '10%', y: '60%' },
      size: 'large',
      color: '#708090',
      description: 'Defesa da aldeia'
    },
    market: {
      name: 'Mercado',
      icon: '🏪',
      position: { x: '35%', y: '65%' },
      size: 'medium',
      color: '#FF6347',
      description: 'Comércio de recursos'
    },
    smithy: {
      name: 'Ferreiro',
      icon: '⚒️',
      position: { x: '18%', y: '25%' },
      size: 'small',
      color: '#A9A9A9',
      description: 'Melhora equipamento'
    },
    stable: {
      name: 'Estábulo',
      icon: '🐴',
      position: { x: '78%', y: '65%' },
      size: 'medium',
      color: '#8B4513',
      description: 'Treina cavalaria'
    }
  };

  const handleBuildingClick = (buildingKey, buildingInfo) => {
    const level = village?.buildings[buildingKey] || 0;
    setSelectedBuilding({ ...buildingInfo, key: buildingKey, level });
    if (onBuildingClick) {
      onBuildingClick(buildingKey);
    }
  };

  const getBuildingScale = (size, level) => {
    const baseScales = {
      'small': 0.8,
      'medium': 1.0,
      'large': 1.3,
      'extra-large': 1.6
    };
    const levelBonus = (level || 0) * 0.05;
    return baseScales[size] + levelBonus;
  };

  return (
    <div className="village-view-container">
      {/* Céu e Fundo */}
      <div className="village-background">
        <div className="sky-gradient"></div>
        <div className="mountains"></div>
        <div className="clouds">
          <div className="cloud cloud-1">☁️</div>
          <div className="cloud cloud-2">☁️</div>
          <div className="cloud cloud-3">☁️</div>
        </div>
      </div>

      {/* Aldeia Principal */}
      <div className="village-scene">
        {/* Chão da aldeia */}
        <div className="village-ground">
          {/* Caminhos */}
          <div className="path horizontal-path"></div>
          <div className="path vertical-path"></div>
          
          {/* Decorações */}
          <div className="decoration tree" style={{ left: '5%', top: '15%' }}>🌲</div>
          <div className="decoration tree" style={{ left: '90%', top: '20%' }}>🌲</div>
          <div className="decoration tree" style={{ left: '8%', top: '75%' }}>🌳</div>
          <div className="decoration tree" style={{ left: '85%', top: '80%' }}>🌳</div>
          <div className="decoration rock" style={{ left: '15%', top: '10%' }}>🪨</div>
          <div className="decoration rock" style={{ left: '80%', top: '12%' }}>🪨</div>
          <div className="decoration flower" style={{ left: '40%', top: '20%' }}>🌸</div>
          <div className="decoration flower" style={{ left: '60%', top: '25%' }}>🌺</div>
        </div>

        {/* Edifícios */}
        <div className="buildings-layer">
          {Object.entries(buildingsData).map(([buildingKey, buildingInfo]) => {
            const level = village?.buildings[buildingKey] || 0;
            const scale = getBuildingScale(buildingInfo.size, level);
            const isHovered = hoveredBuilding === buildingKey;
            const isSelected = selectedBuilding?.key === buildingKey;

            return (
              <div
                key={buildingKey}
                className={`building-3d ${buildingInfo.size} ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`}
                style={{
                  left: buildingInfo.position.x,
                  top: buildingInfo.position.y,
                  transform: `scale(${scale})`,
                  zIndex: Math.floor(parseFloat(buildingInfo.position.y))
                }}
                onClick={() => handleBuildingClick(buildingKey, buildingInfo)}
                onMouseEnter={() => setHoveredBuilding(buildingKey)}
                onMouseLeave={() => setHoveredBuilding(null)}
              >
                {/* Sombra do edifício */}
                <div className="building-shadow"></div>

                {/* Estrutura do edifício */}
                <div 
                  className="building-structure"
                  style={{ backgroundColor: buildingInfo.color }}
                >
                  {/* Telhado */}
                  <div className="building-roof"></div>
                  
                  {/* Corpo do edifício */}
                  <div className="building-body">
                    <div className="building-icon-large">{buildingInfo.icon}</div>
                  </div>

                  {/* Frente do edifício */}
                  <div className="building-front"></div>

                  {/* Badge de nível */}
                  {level > 0 && (
                    <div className="building-level-badge">
                      Nv. {level}
                    </div>
                  )}

                  {/* Indicador de construção */}
                  {level === 0 && (
                    <div className="building-locked">
                      <span>🔒</span>
                    </div>
                  )}
                </div>

                {/* Nome do edifício (aparece ao hover) */}
                <div className="building-name-tag">
                  {buildingInfo.name}
                  <div className="building-level-tag">Nível {level}</div>
                </div>

                {/* Animação de upgrade se em construção */}
                {level > 0 && Math.random() < 0.2 && (
                  <div className="construction-indicator">
                    <span className="construction-icon">🔨</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Muralha ao redor da aldeia */}
        <div className="village-walls">
          <div className="wall-segment wall-top"></div>
          <div className="wall-segment wall-right"></div>
          <div className="wall-segment wall-bottom"></div>
          <div className="wall-segment wall-left"></div>
          
          {/* Torres da muralha */}
          <div className="wall-tower tower-top-left">🏰</div>
          <div className="wall-tower tower-top-right">🏰</div>
          <div className="wall-tower tower-bottom-left">🏰</div>
          <div className="wall-tower tower-bottom-right">🏰</div>
        </div>

        {/* Portão principal */}
        <div className="main-gate">
          <div className="gate-structure">🚪</div>
          <div className="gate-flag">🚩</div>
        </div>
      </div>

      {/* Painel de detalhes do edifício selecionado */}
      {selectedBuilding && (
        <div className="building-details-overlay" onClick={() => setSelectedBuilding(null)}>
          <div className="building-details-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-details" onClick={() => setSelectedBuilding(null)}>✖</button>
            
            <div className="details-header">
              <div className="details-icon">{selectedBuilding.icon}</div>
              <div className="details-title">
                <h2>{selectedBuilding.name}</h2>
                <p className="details-subtitle">{selectedBuilding.description}</p>
              </div>
            </div>

            <div className="details-content">
              <div className="detail-item">
                <span className="detail-label">📊 Nível Atual:</span>
                <span className="detail-value level-value">{selectedBuilding.level}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">🎯 Próximo Nível:</span>
                <span className="detail-value">{selectedBuilding.level + 1}</span>
              </div>

              <div className="details-divider"></div>

              <h3 className="details-section-title">💰 Custo para Melhorar</h3>
              <div className="cost-grid">
                <div className="cost-item">
                  <span className="cost-icon">🪵</span>
                  <span className="cost-amount">{Math.floor(100 * Math.pow(1.26, selectedBuilding.level))}</span>
                </div>
                <div className="cost-item">
                  <span className="cost-icon">🏺</span>
                  <span className="cost-amount">{Math.floor(100 * Math.pow(1.26, selectedBuilding.level))}</span>
                </div>
                <div className="cost-item">
                  <span className="cost-icon">⚒️</span>
                  <span className="cost-amount">{Math.floor(50 * Math.pow(1.26, selectedBuilding.level))}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">⏱️ Tempo:</span>
                <span className="detail-value">{Math.floor((selectedBuilding.level + 1) * 1.5)} minutos</span>
              </div>

              <button className="btn-upgrade" onClick={() => {
                if (onBuildingClick) {
                  onBuildingClick(selectedBuilding.key);
                }
                setSelectedBuilding(null);
              }}>
                🔨 Melhorar Edifício
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info da aldeia */}
      <div className="village-info-bar">
        <div className="village-name">
          <span className="village-icon">🏘️</span>
          <span className="village-name-text">Tua Aldeia</span>
        </div>
        <div className="village-stats">
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <span className="stat-value">{village?.population || 0}/{village?.populationMax || 100}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{village?.points || 0} pts</span>
          </div>
        </div>
      </div>

      {/* Controles de vista */}
      <div className="view-controls">
        <button className="view-btn" title="Vista de Cima">📐</button>
        <button className="view-btn" title="Vista Isométrica">🎨</button>
        <button className="view-btn" title="Modo Noturno">🌙</button>
      </div>

      {/* Legenda */}
      <div className="village-legend">
        <div className="legend-item">
          <span className="legend-dot available"></span>
          <span>Clica para melhorar</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot constructing"></span>
          <span>Em construção</span>
        </div>
      </div>
    </div>
  );
};

export default VillageView;
