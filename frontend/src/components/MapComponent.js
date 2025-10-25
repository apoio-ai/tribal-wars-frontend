import React, { useState, useEffect, useRef } from 'react';
import './MapComponent.css';

const MapComponent = ({ myCoordinates, nearbyVillages, onVillageClick }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const mapRef = useRef(null);

  // Tamanho do mapa (aumentado para 100x100 para ser mais realista)
  const MAP_SIZE = 100;
  const CELL_SIZE = 60;

  // Gerar terreno procedural
  const generateTerrain = () => {
    const terrain = [];
    
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        // Usar ruído para terreno mais natural
        const noise = (Math.sin(x * 0.1) + Math.cos(y * 0.1)) * 0.5;
        const random = Math.random();
        
        let type = 'grass';
        let emoji = '🌱';
        let color = '#7CB342';
        
        // Água (rios e lagos)
        if (noise < -0.3 && random < 0.3) {
          type = 'water';
          emoji = '💧';
          color = '#2196F3';
        }
        // Floresta
        else if (random < 0.25) {
          type = 'forest';
          emoji = '🌲';
          color = '#388E3C';
        }
        // Montanhas
        else if (noise > 0.4 && random < 0.15) {
          type = 'mountain';
          emoji = '⛰️';
          color = '#795548';
        }
        // Deserto
        else if (x > 60 && y > 60 && random < 0.2) {
          type = 'desert';
          emoji = '🏜️';
          color = '#FFD54F';
        }
        
        terrain.push({
          x,
          y,
          type,
          emoji,
          color,
          id: `${x}-${y}`
        });
      }
    }
    
    return terrain;
  };

  // Gerar aldeias no mapa
  const generateVillages = () => {
    const villages = [];
    
    // Sua aldeia
    villages.push({
      x: myCoordinates.x,
      y: myCoordinates.y,
      type: 'player',
      name: 'Tua Aldeia',
      player: 'Tu',
      emoji: '🏰',
      color: '#10b981',
      points: 5000,
      population: 500,
      level: 15
    });
    
    // Aldeias de outros jogadores (50 aldeias)
    for (let i = 0; i < 50; i++) {
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
    
    // Aldeias abandonadas (30 aldeias)
    for (let i = 0; i < 30; i++) {
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
    
    // Aldeias com bônus (20 aldeias)
    const bonusTypes = [
      { emoji: '🌾', name: 'Fazenda Rica', bonus: 'Comida +50%' },
      { emoji: '🪵', name: 'Serraria', bonus: 'Madeira +50%' },
      { emoji: '⛏️', name: 'Mina de Ferro', bonus: 'Ferro +50%' },
      { emoji: '💎', name: 'Mina de Ouro', bonus: 'Ouro +30%' }
    ];
    
    for (let i = 0; i < 20; i++) {
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

  const [terrain] = useState(() => generateTerrain());
  const [villages] = useState(() => generateVillages());

  // Centralizar no jogador ao carregar
  useEffect(() => {
    centerOnPlayer();
  }, []);

  const centerOnPlayer = () => {
    if (mapRef.current) {
      const mapWidth = mapRef.current.clientWidth;
      const mapHeight = mapRef.current.clientHeight;
      
      setOffset({
        x: -myCoordinates.x * CELL_SIZE * zoom + mapWidth / 2,
        y: -myCoordinates.y * CELL_SIZE * zoom + mapHeight / 2
      });
    }
  };

  // Controles de zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
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
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
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
          {/* Viewport indicator */}
          <div
            className="minimap-viewport"
            style={{
              left: -offset.x * scale / zoom,
              top: -offset.y * scale / zoom,
              width: (mapRef.current?.clientWidth || 800) * scale / zoom,
              height: (mapRef.current?.clientHeight || 600) * scale / zoom
            }}
          />
        </div>
      </div>
    );
  };

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
          <div className="legend-item"><span className="legend-emoji">🌲</span> Floresta</div>
          <div className="legend-item"><span className="legend-emoji">💧</span> Água</div>
          <div className="legend-item"><span className="legend-emoji">⛰️</span> Montanhas</div>
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
            <div>🏆 {hoveredCell.village.points} pontos</div>
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
                <span className="detail-value">{selectedVillage.resources}</span>
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
            height: MAP_SIZE * CELL_SIZE
          }}
        >
          {/* Renderizar terreno */}
          {terrain.map((cell) => (
            <div
              key={cell.id}
              className={`terrain-cell ${cell.type}`}
              style={{
                left: cell.x * CELL_SIZE,
                top: cell.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: cell.color
              }}
            >
              <span className="terrain-emoji">{cell.emoji}</span>
            </div>
          ))}

          {/* Renderizar aldeias */}
          {villages.map((village, index) => {
            const style = {
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
