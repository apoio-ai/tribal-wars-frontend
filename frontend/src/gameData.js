// Game data for Tribal Wars

export const buildingsData = {
  headquarters: {
    name: 'Quartel General',
    icon: '🏛️',
    image: 'https://images.unsplash.com/photo-1555400081-3b0f09c5b0dc?w=400&h=300&fit=crop',
    description: 'Centro de comando da sua aldeia. Aumenta a velocidade de construção.',
    buildTime: (level) => 30 + (level * 15), // seconds
    costs: {
      wood: (level) => 100 * Math.pow(1.3, level),
      clay: (level) => 80 * Math.pow(1.3, level),
      iron: (level) => 60 * Math.pow(1.3, level),
    }
  },
  barracks: {
    name: 'Quartel',
    icon: '⚔️',
    image: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=400&h=300&fit=crop',
    description: 'Local de treino das tropas. Níveis mais altos permitem treinar tropas mais rápido.',
    buildTime: (level) => 45 + (level * 20),
    costs: {
      wood: (level) => 150 * Math.pow(1.3, level),
      clay: (level) => 120 * Math.pow(1.3, level),
      iron: (level) => 100 * Math.pow(1.3, level),
    }
  },
  smithy: {
    name: 'Ferraria',
    icon: '⚒️',
    image: 'https://images.unsplash.com/photo-1595935736416-4bd0f36b6d14?w=400&h=300&fit=crop',
    description: 'Forja armas e armaduras para as suas tropas. Aumenta o ataque e defesa.',
    buildTime: (level) => 60 + (level * 25),
    costs: {
      wood: (level) => 120 * Math.pow(1.3, level),
      clay: (level) => 100 * Math.pow(1.3, level),
      iron: (level) => 200 * Math.pow(1.3, level),
    }
  },
  wall: {
    name: 'Muralha',
    icon: '🏰',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop',
    description: 'Protege a sua aldeia de ataques inimigos. Aumenta a defesa base da aldeia.',
    buildTime: (level) => 90 + (level * 30),
    costs: {
      wood: (level) => 200 * Math.pow(1.3, level),
      clay: (level) => 250 * Math.pow(1.3, level),
      iron: (level) => 150 * Math.pow(1.3, level),
    }
  },
  farm: {
    name: 'Quinta',
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
    description: 'Produz alimentos para alimentar a população. Aumenta o limite de tropas.',
    buildTime: (level) => 40 + (level * 18),
    costs: {
      wood: (level) => 80 * Math.pow(1.3, level),
      clay: (level) => 100 * Math.pow(1.3, level),
      iron: (level) => 40 * Math.pow(1.3, level),
    }
  },
  warehouse: {
    name: 'Armazém',
    icon: '📦',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
    description: 'Armazena recursos. Aumenta a capacidade máxima de recursos.',
    buildTime: (level) => 35 + (level * 15),
    costs: {
      wood: (level) => 120 * Math.pow(1.3, level),
      clay: (level) => 100 * Math.pow(1.3, level),
      iron: (level) => 80 * Math.pow(1.3, level),
    }
  },
  market: {
    name: 'Mercado',
    icon: '🏪',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=300&fit=crop',
    description: 'Permite comercializar recursos com outros jogadores e aldeias.',
    buildTime: (level) => 50 + (level * 22),
    costs: {
      wood: (level) => 100 * Math.pow(1.3, level),
      clay: (level) => 100 * Math.pow(1.3, level),
      iron: (level) => 100 * Math.pow(1.3, level),
    }
  }
};

export const troopsData = {
  spearmen: {
    name: 'Lanceiros',
    icon: '🗡️',
    image: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=400&h=300&fit=crop',
    description: 'Infantaria básica armada com lanças. Bons contra cavalaria.',
    history: 'Desde tempos antigos, os lanceiros formam a espinha dorsal de qualquer exército. Com suas longas lanças, são especialmente eficazes contra cavalaria inimiga.',
    stats: {
      attack: 10,
      defense: 15,
      defenseAgainstCavalry: 45,
      speed: 18, // minutes per field
      carryCapacity: 25,
      population: 1
    },
    costs: {
      wood: 50,
      clay: 30,
      iron: 10,
      time: 300 // seconds
    }
  },
  swordsmen: {
    name: 'Espadachins',
    icon: '⚔️',
    image: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?w=400&h=300&fit=crop',
    description: 'Guerreiros de elite com espadas e armaduras pesadas. Excelente defesa.',
    history: 'Os espadachins são guerreiros veteranos, treinados nas artes da guerra medieval. Sua armadura pesada e espadas afiadas fazem deles uma força formidável tanto no ataque quanto na defesa.',
    stats: {
      attack: 25,
      defense: 50,
      defenseAgainstCavalry: 15,
      speed: 22,
      carryCapacity: 15,
      population: 1
    },
    costs: {
      wood: 30,
      clay: 30,
      iron: 70,
      time: 600
    }
  },
  axemen: {
    name: 'Guerreiros com Machado',
    icon: '🪓',
    image: 'https://images.unsplash.com/photo-1605733513597-a8a5be932b3c?w=400&h=300&fit=crop',
    description: 'Guerreiros brutais armados com machados de guerra. Alto poder de ataque.',
    history: 'Temidos em todo o reino, os guerreiros com machado são conhecidos por sua ferocidade em batalha. Suas armas pesadas causam devastação nas linhas inimigas.',
    stats: {
      attack: 40,
      defense: 10,
      defenseAgainstCavalry: 5,
      speed: 18,
      carryCapacity: 10,
      population: 1
    },
    costs: {
      wood: 60,
      clay: 30,
      iron: 40,
      time: 720
    }
  },
  archers: {
    name: 'Arqueiros',
    icon: '🏹',
    image: 'https://images.unsplash.com/photo-1599909533730-f38b8c50ce8d?w=400&h=300&fit=crop',
    description: 'Atiradores de elite. Atacam à distância com alta precisão.',
    history: 'Mestres do arco longo, os arqueiros podem eliminar inimigos antes mesmo que eles se aproximem. Sua precisão mortal os torna invaluáveis em qualquer batalha.',
    stats: {
      attack: 15,
      defense: 50,
      defenseAgainstCavalry: 40,
      speed: 18,
      carryCapacity: 10,
      population: 1
    },
    costs: {
      wood: 100,
      clay: 30,
      iron: 60,
      time: 900
    }
  },
  cavalry: {
    name: 'Cavalaria Leve',
    icon: '🐎',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=300&fit=crop',
    description: 'Cavaleiros rápidos e móveis. Perfeitos para raids e reconhecimento.',
    history: 'A cavalaria leve é o braço móvel do exército. Montados em cavalos velozes, podem atacar rapidamente e recuar antes que o inimigo possa reagir.',
    stats: {
      attack: 50,
      defense: 30,
      defenseAgainstCavalry: 40,
      speed: 10,
      carryCapacity: 80,
      population: 4
    },
    costs: {
      wood: 125,
      clay: 100,
      iron: 250,
      time: 1200
    }
  },
  heavyCavalry: {
    name: 'Cavalaria Pesada',
    icon: '🐴',
    image: 'https://images.unsplash.com/photo-1551122089-4e3e72477c95?w=400&h=300&fit=crop',
    description: 'Cavaleiros blindados montados em cavalos de guerra. Poder de ataque devastador.',
    history: 'Os cavaleiros pesados são a elite do exército. Com armaduras completas e montados em poderosos cavalos de guerra, eles esmagam tudo em seu caminho.',
    stats: {
      attack: 150,
      defense: 200,
      defenseAgainstCavalry: 80,
      speed: 11,
      carryCapacity: 50,
      population: 6
    },
    costs: {
      wood: 250,
      clay: 100,
      iron: 500,
      time: 1800
    }
  },
  rams: {
    name: 'Aríetes',
    icon: '🐏',
    image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400&h=300&fit=crop',
    description: 'Máquinas de cerco para destruir muralhas inimigas.',
    history: 'Armas de cerco antigas mas eficazes, os aríetes são essenciais para quebrar as defesas inimigas. Protegidos por estruturas de madeira e metal, eles podem derrubar até as muralhas mais resistentes.',
    stats: {
      attack: 2,
      defense: 20,
      defenseAgainstCavalry: 50,
      speed: 30,
      carryCapacity: 0,
      population: 5
    },
    costs: {
      wood: 300,
      clay: 200,
      iron: 200,
      time: 2400
    }
  },
  catapults: {
    name: 'Catapultas',
    icon: '⚡',
    image: 'https://images.unsplash.com/photo-1595347097560-69238724e7bd?w=400&h=300&fit=crop',
    description: 'Armas de cerco pesadas. Destroem edifícios inimigos à distância.',
    history: 'A arma de cerco mais temida de todas, as catapultas podem lançar projéteis pesados a grandes distâncias, destruindo edifícios e causando terror entre os defensores.',
    stats: {
      attack: 100,
      defense: 100,
      defenseAgainstCavalry: 50,
      speed: 30,
      carryCapacity: 0,
      population: 8
    },
    costs: {
      wood: 320,
      clay: 400,
      iron: 100,
      time: 3600
    }
  }
};

export const villageTypes = {
  player: {
    name: 'Aldeia de Jogador',
    icon: '🏘️',
    color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop'
  },
  abandoned: {
    name: 'Aldeia Abandonada',
    icon: '🏚️',
    color: '#6b7280',
    image: 'https://images.unsplash.com/photo-1615092296061-e2ccfeb2f3d6?w=200&h=200&fit=crop',
    description: 'Aldeias abandonadas podem ser conquistadas facilmente e contêm recursos.'
  },
  bonus: {
    name: 'Aldeia com Bónus',
    icon: '✨',
    color: '#f59e0b',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop',
    description: 'Aldeias especiais que fornecem bónus de recursos quando conquistadas.'
  },
  npc: {
    name: 'Aldeia NPC',
    icon: '🏴',
    color: '#ef4444',
    image: 'https://images.unsplash.com/photo-1590272456521-1bbe160a18ce?w=200&h=200&fit=crop',
    description: 'Aldeias controladas por NPCs. Derrote-as para ganhar recursos e experiência.'
  }
};

export const getBuildingInfo = (buildingKey, level) => {
  const building = buildingsData[buildingKey];
  if (!building) return null;

  return {
    ...building,
    level,
    buildTime: building.buildTime(level),
    costs: {
      wood: Math.floor(building.costs.wood(level)),
      clay: Math.floor(building.costs.clay(level)),
      iron: Math.floor(building.costs.iron(level)),
    }
  };
};

export const getTroopInfo = (troopKey) => {
  return troopsData[troopKey] || null;
};
