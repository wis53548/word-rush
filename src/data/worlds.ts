export type WorldId =
  | 'egypt'
  | 'pirate'
  | 'castle'
  | 'west'
  | 'future'
  | 'dino'
  | 'space'
  | 'viking';

export type WorldTheme = {
  id: WorldId;
  name: string;
  status: 'MVP' | 'Preview';
  introPrompt: string;
  palette: {
    sky: string;
    horizon: string;
    road: string;
    lane: string;
    accent: string;
    accent2: string;
    danger: string;
    panel: string;
  };
  scenery: string[];
  collectibles: string[];
  obstacles: string[];
  wordObjects: string[];
};

export const WORLDS: WorldTheme[] = [
  {
    id: 'egypt',
    name: 'Ancient Egypt',
    status: 'MVP',
    introPrompt: 'Welcome to Ancient Egypt.',
    palette: {
      sky: '#ffb347',
      horizon: '#ffe88a',
      road: '#c97922',
      lane: '#ffe06b',
      accent: '#00d5ff',
      accent2: '#ff3d81',
      danger: '#8a4f15',
      panel: '#10294f',
    },
    scenery: ['Pyramids', 'Sphinx ruins', 'Obelisks', 'Sun temples'],
    collectibles: ['Scarab coin', 'Golden relic', 'Star gem'],
    obstacles: ['Sand trap', 'Fallen column', 'Mummy gate'],
    wordObjects: ['Stone tablet', 'Mummy gate', 'Treasure chest', 'Golden relic'],
  },
  {
    id: 'pirate',
    name: 'Pirate Seas',
    status: 'Preview',
    introPrompt: 'Welcome to Pirate Seas.',
    palette: { sky: '#56c7ff', horizon: '#a8f0ff', road: '#8b5a2b', lane: '#ffd166', accent: '#21d19f', accent2: '#e63946', danger: '#2d4059', panel: '#17324d' },
    scenery: ['Pirate ships', 'Wooden docks', 'Sea cliffs', 'Parrots'],
    collectibles: ['Treasure coin', 'Pearl star', 'Map scrap'],
    obstacles: ['Cannonball', 'Broken plank', 'Rolling barrel'],
    wordObjects: ['Treasure chest', 'Word map', 'Ship sign', 'Bottle note'],
  },
  {
    id: 'castle',
    name: 'Medieval Castle',
    status: 'Preview',
    introPrompt: 'Welcome to Medieval Castle.',
    palette: { sky: '#8dd7ff', horizon: '#dff6ff', road: '#6f7885', lane: '#f7d774', accent: '#7cffc4', accent2: '#ff6b6b', danger: '#444b5a', panel: '#1d2b4f' },
    scenery: ['Castle bridge', 'Banners', 'Dragon clouds', 'Towers'],
    collectibles: ['Knight star', 'Ruby coin', 'Royal seal'],
    obstacles: ['Drawbridge gap', 'Shield block', 'Dragon puff'],
    wordObjects: ['Shield', 'Banner', 'Knight gate', 'Castle sign'],
  },
  {
    id: 'west',
    name: 'Wild West',
    status: 'Preview',
    introPrompt: 'Welcome to the Wild West.',
    palette: { sky: '#ff9f68', horizon: '#ffd166', road: '#a85d2a', lane: '#ffe66d', accent: '#2ec4b6', accent2: '#ff477e', danger: '#6a381f', panel: '#2b304d' },
    scenery: ['Train tracks', 'Canyons', 'Mine carts', 'Sheriff posts'],
    collectibles: ['Sheriff star', 'Gold nugget', 'Rail token'],
    obstacles: ['Barrel', 'Tumbleweed', 'Mine cart'],
    wordObjects: ['Wanted poster', 'Rail sign', 'Saloon board', 'Crate label'],
  },
  {
    id: 'future',
    name: 'Future City',
    status: 'Preview',
    introPrompt: 'Welcome to Future City.',
    palette: { sky: '#1526a3', horizon: '#6c5ce7', road: '#111827', lane: '#00f5ff', accent: '#00ff9f', accent2: '#ff2bd6', danger: '#ff3864', panel: '#07152e' },
    scenery: ['Neon towers', 'Hover lanes', 'Robot drones', 'Energy rails'],
    collectibles: ['Neon coin', 'Power cell', 'Light star'],
    obstacles: ['Robot drone', 'Laser cone', 'Hover crate'],
    wordObjects: ['Hologram sign', 'Energy gate', 'Robot screen', 'Neon poster'],
  },
  {
    id: 'dino',
    name: 'Dinosaur Jungle',
    status: 'Preview',
    introPrompt: 'Welcome to Dinosaur Jungle.',
    palette: { sky: '#4ecdc4', horizon: '#c7f464', road: '#5c8d3b', lane: '#ffe66d', accent: '#ff6b6b', accent2: '#8f5cff', danger: '#7c3f20', panel: '#143d2b' },
    scenery: ['Vines', 'Volcano rocks', 'Fossils', 'Dino footprints'],
    collectibles: ['Amber coin', 'Leaf star', 'Fossil gem'],
    obstacles: ['Volcano rock', 'Vine snag', 'Footprint pit'],
    wordObjects: ['Jungle leaf', 'Fossil slab', 'Dino sign', 'Stone nest'],
  },
  {
    id: 'space',
    name: 'Space Colony',
    status: 'Preview',
    introPrompt: 'Welcome to Space Colony.',
    palette: { sky: '#07111f', horizon: '#243b80', road: '#778da9', lane: '#e0fbfc', accent: '#80ffdb', accent2: '#ff4dcb', danger: '#f72585', panel: '#0b132b' },
    scenery: ['Moon domes', 'Stars', 'Alien signs', 'Space doors'],
    collectibles: ['Star token', 'Moon coin', 'Comet gem'],
    obstacles: ['Asteroid', 'Moon crater', 'Space cone'],
    wordObjects: ['Alien sign', 'Space door', 'Moon tablet', 'Rocket panel'],
  },
  {
    id: 'viking',
    name: 'Viking Fjords',
    status: 'Preview',
    introPrompt: 'Welcome to Viking Fjords.',
    palette: { sky: '#91d5ff', horizon: '#edfaff', road: '#7ba7bc', lane: '#ffffff', accent: '#00b4d8', accent2: '#ffb703', danger: '#31576b', panel: '#13293d' },
    scenery: ['Ice bridges', 'Longships', 'Snow cliffs', 'Northern lights'],
    collectibles: ['Rune coin', 'Ice star', 'Longship charm'],
    obstacles: ['Snow block', 'Ice crack', 'Shield wall'],
    wordObjects: ['Rune stone', 'Viking shield', 'Snow sign', 'Longship sail'],
  },
];

export const getWorld = (id: WorldId): WorldTheme => WORLDS.find((world) => world.id === id) ?? WORLDS[0];
