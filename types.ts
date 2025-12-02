
export enum CharacterId {
  MIMI = 'Mimi',
  ROKO = 'Roko',
  COCO = 'Coco',
  TITI = 'Titi'
}

export interface Character {
  id: CharacterId;
  name: string;
  color: string;
  description: string;
  greeting: string;
  voiceName: string; // 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'
  imageUrl: string;
}

export enum PlanetId {
  MERCURY = 'Merkür',
  VENUS = 'Venüs',
  EARTH = 'Dünya',
  MARS = 'Mars',
  JUPITER = 'Jüpiter',
  SATURN = 'Satürn',
  URANUS = 'Uranüs',
  NEPTUNE = 'Neptün',
  PLUTO = 'Plüton'
}

export interface Planet {
  id: PlanetId;
  name: string;
  color: string;
  isUnlocked: boolean;
  stars: number; // 0-3
  description: string;
}

export interface GameState {
  selectedCharacter: Character | null;
  planets: Planet[];
  currentPlanet: PlanetId | null;
  totalStars: number;
}