// Dados dos Edifícios
export const buildingsData = {
  headquarters: {
    name: 'Quartel General',
    emoji: '🏛️',
    description: 'Centro de comando da aldeia',
    color: '#8B4513'
  },
  barracks: {
    name: 'Quartel',
    emoji: '⚔️',
    description: 'Treina infantaria',
    color: '#DC143C'
  },
  farm: {
    name: 'Quinta',
    emoji: '🌾',
    description: 'Produz alimentos',
    color: '#DAA520'
  },
  warehouse: {
    name: 'Armazém',
    emoji: '📦',
    description: 'Armazena recursos',
    color: '#8B7355'
  },
  wall: {
    name: 'Muralha',
    emoji: '🛡️',
    description: 'Defesa da aldeia',
    color: '#708090'
  },
  market: {
    name: 'Mercado',
    emoji: '🏪',
    description: 'Comércio de recursos',
    color: '#FF6347'
  },
  smithy: {
    name: 'Ferreiro',
    emoji: '⚒️',
    description: 'Melhora armas e armaduras',
    color: '#A9A9A9'
  },
  stable: {
    name: 'Estábulo',
    emoji: '🐴',
    description: 'Treina cavalaria',
    color: '#8B4513'
  },
  workshop: {
    name: 'Oficina',
    emoji: '🔧',
    description: 'Constrói máquinas de guerra',
    color: '#696969'
  },
  lumbermill: {
    name: 'Serraria',
    emoji: '🪵',
    description: 'Produz madeira',
    color: '#8B4513'
  },
  claypit: {
    name: 'Mina de Argila',
    emoji: '🏺',
    description: 'Produz argila',
    color: '#CD853F'
  },
  ironmine: {
    name: 'Mina de Ferro',
    emoji: '⛏️',
    description: 'Produz ferro',
    color: '#708090'
  }
};

// Dados das Tropas
export const troopsData = {
  spearman: {
    name: 'Lanceiro',
    emoji: '🗡️',
    description: 'Infantaria básica',
    attack: 10,
    defense: 15
  },
  swordsman: {
    name: 'Espadachim',
    emoji: '⚔️',
    description: 'Infantaria forte',
    attack: 25,
    defense: 20
  },
  archer: {
    name: 'Arqueiro',
    emoji: '🏹',
    description: 'Ataque à distância',
    attack: 20,
    defense: 10
  },
  cavalry: {
    name: 'Cavalaria',
    emoji: '🐎',
    description: 'Unidade rápida',
    attack: 40,
    defense: 25
  },
  catapult: {
    name: 'Catapulta',
    emoji: '💣',
    description: 'Destrói edifícios',
    attack: 50,
    defense: 5
  }
};

// Mapeamento de nomes do backend para os dados
export const buildingKeyMap = {
  'HEADQUARTERS': 'headquarters',
  'BARRACKS': 'barracks',
  'FARM': 'farm',
  'WAREHOUSE': 'warehouse',
  'WALL': 'wall',
  'MARKET': 'market',
  'WORKSHOP': 'workshop',
  'LUMBERMILL': 'lumbermill',
  'CLAYPIT': 'claypit',
  'IRONMINE': 'ironmine'
};

export const troopKeyMap = {
  'SPEARMAN': 'spearman',
  'SWORDSMAN': 'swordsman',
  'ARCHER': 'archer',
  'CAVALRY': 'cavalry',
  'CATAPULT': 'catapult'
};
