import React, { useState, useEffect, useRef } from 'react';
import './MapComponent.css';

const MapComponent = ({ myCoordinates, nearbyVillages, onVillageClick }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  // Tamanho do mapa otimizado
  const MAP_SIZE = 50; // Reduzido para 50x50 para melhor performance
  const CELL_SIZE = 80;

  // Gerar aldeias no mapa
  const generateVillages = () => {
    const villages = [];
    
    // Sua aldeia
    villages.push({
      x: myCoordinates?.x || 25,
      y: myCoordinates?.y || 25,
      type: 'player',
      name: 'Tua Aldeia',
      player: 'Tu',
      emoji: '🏰',
      color: '#10b981',
      points: 5000,
      population: 500,
      level: 15
    });
    
    // Aldeias de outros jogadores (30 aldeias)
    for (let i = 0; i < 30; i++) {
      villages.push({
        x: Math.floor(Math.random() * MAP_SIZE),
        y: Math.floor(Math.random() * MAP_SIZE),
        type: 'enemy',
        name: `Aldeia ${i + 1}`,
        player: `Jogador ${i + 1}`,
        emoji: '⚔️',
        color: '#ef4444',
        points: Math.floor(Math.random() * 10000) + 1000,
        population: Math.floor(Math.random() * 1000) + 100,
        level: Math.floor(Math.random() * 20) + 1
      });
    }
    
    // Aldeias abandonadas (20 aldeias)
    for (let i = 0; i < 20; i++) {
      villages.push({
        x: Math.floor(Math.random() * MAP_SIZE),
        y: Math.floor(Math.random() * MAP_SIZE),
        type: 'abandoned',
        name: `Ruínas ${i + 1}`,
        player: 'Abandonada',
        emoji: '🏚️',
        color: '#9e9e9e',
        resources: Math.floor(Math.random() * 5000) + 500,
        population: 0,
        level: Math.floor(Math.random() * 10) + 1
      });
    }
    
    // Aldeias com bônus (15 aldeias)
    const bonusTypes = [
      { emoji: '🌾', name: 'Fazenda Rica', bonus: 'Comida +50%' },
      { emoji: '🪵', name: 'Serraria', bonus: 'Madeira +50%' },
      { emoji: '⛏️', name: 'Mina de Ferro', bonus: 'Ferro +50%' },
      { emoji: '💎', name: 'Mina de Ouro', bonus: 'Ouro +30%' }
    ];
    
    for (let i = 0; i < 15; i++) {
      const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
      villages.push({
        x: Math.floor(Math.random() * MAP_SIZE),
        y: Math.floor(Math.random() * MAP_SIZE),
        type: 'bonus',
        name: bonusType.name,
        player: 'Bônus',
        emoji: bonusType.emoji,
        color: '#fbbf24',
        bonus: bonusType.bonus,
        population: 0,
        level: 0
      });
    }
    
    return villages;
  };

  const [villages] = useState(() => generateVillages());

  // Centralizar no jogador ao carregar
  useEffect(() => {
    setTimeout(() => {
      centerOnPlayer();
      setIsLoading(false);
    }, 100);
  }, []);

  const centerOnPlayer = () => {
    if (mapRef.current) {
      const mapWidth = mapRef.current.clientWidth;
      const mapHeight = mapRef.current.clientHeight;
      const playerX = myCoordinates?.x || 25;
      const playerY = myCoordinates?.y || 25;
      
      setOffset({
        x: -playerX * CELL_SIZE * zoom + mapWidth / 2,
        y: -playerY * CELL_SIZE * zoom + mapHeight / 2
      });
    }
  };

  // Controles de zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  // Arrastar o mapa
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(2.5, prev + delta)));
  };

  // Clicar em aldeia
  const handleVillageClick = (village) => {
    setSelectedVillage(village);
    if (onVillageClick) {
      onVillageClick(village);
    }
  };

  // Minimap
  const renderMinimap = () => {
    const minimapSize = 150;
    const scale = minimapSize / (MAP_SIZE * CELL_SIZE);
    
    return (
      <div className="minimap">
        <div className="minimap-content">
          {villages.map((village, index) => {
            const isPlayer = village.type === 'player';
            return (
              <div
                key={index}
                className={`minimap-dot ${village.type}`}
                style={{
                  left: village.x * CELL_SIZE * scale,
                  top: village.y * CELL_SIZE * scale,
                  width: isPlayer ? 8 : 4,
                  height: isPlayer ? 8 : 4
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar terreno de fundo (simplificado - apenas cores)
  const getTerrainColor = (x, y) => {
    const noise = (Math.sin(x * 0.2) + Math.cos(y * 0.2)) * 0.5;
    
    if (noise < -0.3) return '#2196F3'; // Água
    if (noise > 0.4) return '#795548'; // Montanhas
    if (Math.random() < 0.2) return '#388E3C'; // Floresta
    return '#7CB342'; // Planícies
  };

  if (isLoading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner">⏳</div>
        <p>Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="map-container-realistic">
      {/* Controles */}
      <div className="map-controls">
        <button className="map-btn zoom-btn" onClick={handleZoomIn} title="Zoom In">
          🔍+
        </button>
        <button className="map-btn zoom-btn" onClick={handleZoomOut} title="Zoom Out">
          🔍-
        </button>
        <button className="map-btn center-btn" onClick={centerOnPlayer} title="Centrar em Ti">
          🎯
        </button>
        <div className="zoom-indicator">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Legenda */}
      <div className="map-legend-realistic">
        <h4>📍 Legenda</h4>
        <div className="legend-items">
          <div className="legend-item"><span className="legend-emoji">🏰</span> Tua Aldeia</div>
          <div className="legend-item"><span className="legend-emoji">⚔️</span> Jogadores</div>
          <div className="legend-item"><span className="legend-emoji">🏚️</span> Abandonadas</div>
          <div className="legend-item"><span className="legend-emoji">🌾💎</span> Bônus</div>
        </div>
      </div>

      {/* Minimap */}
      {renderMinimap()}

      {/* Tooltip ao passar mouse */}
      {hoveredCell && (
        <div 
          className="map-tooltip"
          style={{
            left: hoveredCell.screenX + 20,
            top: hoveredCell.screenY + 20
          }}
        >
          <strong>{hoveredCell.village.name}</strong>
          <div>Jogador: {hoveredCell.village.player}</div>
          <div>📍 ({hoveredCell.village.x}, {hoveredCell.village.y})</div>
          {hoveredCell.village.points && (
            <div>🏆 {hoveredCell.village.points.toLocaleString()} pontos</div>
          )}
          {hoveredCell.village.population !== undefined && (
            <div>👥 {hoveredCell.village.population} habitantes</div>
          )}
          {hoveredCell.village.bonus && (
            <div>⭐ {hoveredCell.village.bonus}</div>
          )}
        </div>
      )}

      {/* Painel de detalhes da aldeia selecionada */}
      {selectedVillage && (
        <div className="village-details-panel">
          <button className="close-panel" onClick={() => setSelectedVillage(null)}>✖</button>
          <div className="village-details-header">
            <span className="village-emoji-large">{selectedVillage.emoji}</span>
            <div>
              <h3>{selectedVillage.name}</h3>
              <p className="village-player">👤 {selectedVillage.player}</p>
            </div>
          </div>
          
          <div className="village-details-content">
            <div className="detail-row">
              <span className="detail-label">📍 Coordenadas:</span>
              <span className="detail-value">({selectedVillage.x}, {selectedVillage.y})</span>
            </div>
            
            {selectedVillage.points && (
              <div className="detail-row">
                <span className="detail-label">🏆 Pontos:</span>
                <span className="detail-value">{selectedVillage.points.toLocaleString()}</span>
              </div>
            )}
            
            {selectedVillage.population !== undefined && (
              <div className="detail-row">
                <span className="detail-label">👥 População:</span>
                <span className="detail-value">{selectedVillage.population}</span>
              </div>
            )}
            
            {selectedVillage.level > 0 && (
              <div className="detail-row">
                <span className="detail-label">⭐ Nível:</span>
                <span className="detail-value">{selectedVillage.level}</span>
              </div>
            )}
            
            {selectedVillage.resources && (
              <div className="detail-row">
                <span className="detail-label">💰 Recursos:</span>
                <span className="detail-value">{selectedVillage.resources.toLocaleString()}</span>
              </div>
            )}
            
            {selectedVillage.bonus && (
              <div className="detail-row bonus-row">
                <span className="detail-label">⭐ Bônus:</span>
                <span className="detail-value">{selectedVillage.bonus}</span>
              </div>
            )}

            <div className="village-actions">
              {selectedVillage.type === 'enemy' && (
                <button className="action-btn attack-btn">⚔️ Atacar</button>
              )}
              {selectedVillage.type === 'abandoned' && (
                <button className="action-btn conquer-btn">🏴 Conquistar</button>
              )}
              {selectedVillage.type === 'bonus' && (
                <button className="action-btn claim-btn">🎁 Reivindicar</button>
              )}
              <button className="action-btn spy-btn">👁️ Espionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Coordenadas do mouse */}
      <div className="coordinates-display">
        📍 Posição: ({Math.floor(-offset.x / (CELL_SIZE * zoom))}, {Math.floor(-offset.y / (CELL_SIZE * zoom))})
      </div>

      {/* Mapa principal */}
      <div 
        className="map-viewport"
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="map-grid-realistic"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            width: MAP_SIZE * CELL_SIZE,
            height: MAP_SIZE * CELL_SIZE,
            background: `
              linear-gradient(45deg, #7CB342 25%, transparent 25%),
              linear-gradient(-45deg, #7CB342 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #7CB342 75%),
              linear-gradient(-45deg, transparent 75%, #7CB342 75%)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
            backgroundColor: '#8BC34A'
          }}
        >
          {/* Renderizar aldeias */}
          {villages.map((village, index) => {
            const style = {
              position: 'absolute',
              left: village.x * CELL_SIZE,
              top: village.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE
            };

            return (
              <div
                key={`village-${index}`}
                className={`village-marker ${village.type}`}
                style={style}
                onClick={() => handleVillageClick(village)}
                onMouseEnter={(e) => {
                  setHoveredCell({
                    village,
                    screenX: e.clientX,
                    screenY: e.clientY
                  });
                }}
                onMouseLeave={() => setHoveredCell(null)}
              >
                <div className="village-icon" style={{ borderColor: village.color }}>
                  <span className="village-emoji">{village.emoji}</span>
                </div>
                <div className="village-label">{village.name}</div>
                {village.type === 'player' && (
                  <div className="player-indicator">TU</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Instruções */}
      <div className="map-instructions">
        🖱️ Arrasta para mover | 🔍 Scroll para zoom | 🎯 Clica em aldeias para detalhes
      </div>
    </div>
  );
};

export default MapComponent;
