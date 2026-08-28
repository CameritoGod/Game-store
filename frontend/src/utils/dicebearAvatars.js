/**
 * Colección de avatares predefinidos utilizando la API de DiceBear v9.x.
 * Incluye variantes para los estilos:
 * - Adventurer
 * - Adventurer Neutral
 * - Bottts
 * - Bottts Neutral
 */

const BASE_URL = 'https://api.dicebear.com/9.x';

export const DICEBEAR_STYLES = [
  { id: 'all', name: 'Todos' },
  { id: 'adventurer', name: 'Adventurer' },
  { id: 'adventurer-neutral', name: 'Adventurer Neutral' },
  { id: 'bottts', name: 'Bottts' },
  { id: 'bottts-neutral', name: 'Bottts Neutral' }
];

export const PREDEFINED_AVATARS = [
  // Adventurer
  { id: 'adv-1', style: 'adventurer', styleLabel: 'Adventurer', seed: 'Felix', name: 'Aventurero Felix', url: `${BASE_URL}/adventurer/svg?seed=Felix` },
  { id: 'adv-2', style: 'adventurer', styleLabel: 'Adventurer', seed: 'Aneria', name: 'Aventurera Aneria', url: `${BASE_URL}/adventurer/svg?seed=Aneria` },
  { id: 'adv-3', style: 'adventurer', styleLabel: 'Adventurer', seed: 'Jack', name: 'Aventurero Jack', url: `${BASE_URL}/adventurer/svg?seed=Jack` },
  { id: 'adv-4', style: 'adventurer', styleLabel: 'Adventurer', seed: 'Willow', name: 'Aventurera Willow', url: `${BASE_URL}/adventurer/svg?seed=Willow` },
  { id: 'adv-5', style: 'adventurer', styleLabel: 'Adventurer', seed: 'Alexander', name: 'Aventurero Alexander', url: `${BASE_URL}/adventurer/svg?seed=Alexander` },
  { id: 'adv-6', style: 'adventurer', styleLabel: 'Adventurer', seed: 'Zoey', name: 'Aventurera Zoey', url: `${BASE_URL}/adventurer/svg?seed=Zoey` },

  // Adventurer Neutral
  { id: 'adv-neu-1', style: 'adventurer-neutral', styleLabel: 'Adventurer Neutral', seed: 'Amaya', name: 'Explorer Amaya', url: `${BASE_URL}/adventurer-neutral/svg?seed=Amaya` },
  { id: 'adv-neu-2', style: 'adventurer-neutral', styleLabel: 'Adventurer Neutral', seed: 'Jude', name: 'Explorer Jude', url: `${BASE_URL}/adventurer-neutral/svg?seed=Jude` },
  { id: 'adv-neu-3', style: 'adventurer-neutral', styleLabel: 'Adventurer Neutral', seed: 'Riley', name: 'Explorer Riley', url: `${BASE_URL}/adventurer-neutral/svg?seed=Riley` },
  { id: 'adv-neu-4', style: 'adventurer-neutral', styleLabel: 'Adventurer Neutral', seed: 'Jordan', name: 'Explorer Jordan', url: `${BASE_URL}/adventurer-neutral/svg?seed=Jordan` },
  { id: 'adv-neu-5', style: 'adventurer-neutral', styleLabel: 'Adventurer Neutral', seed: 'Morgan', name: 'Explorer Morgan', url: `${BASE_URL}/adventurer-neutral/svg?seed=Morgan` },
  { id: 'adv-neu-6', style: 'adventurer-neutral', styleLabel: 'Adventurer Neutral', seed: 'Avery', name: 'Explorer Avery', url: `${BASE_URL}/adventurer-neutral/svg?seed=Avery` },

  // Bottts
  { id: 'bot-1', style: 'bottts', styleLabel: 'Bottts', seed: 'Buster', name: 'Cyborg Buster', url: `${BASE_URL}/bottts/svg?seed=Buster` },
  { id: 'bot-2', style: 'bottts', styleLabel: 'Bottts', seed: 'Gizmo', name: 'Robot Gizmo', url: `${BASE_URL}/bottts/svg?seed=Gizmo` },
  { id: 'bot-3', style: 'bottts', styleLabel: 'Bottts', seed: 'Sparky', name: 'Robot Sparky', url: `${BASE_URL}/bottts/svg?seed=Sparky` },
  { id: 'bot-4', style: 'bottts', styleLabel: 'Bottts', seed: 'Volt', name: 'Mecha Volt', url: `${BASE_URL}/bottts/svg?seed=Volt` },
  { id: 'bot-5', style: 'bottts', styleLabel: 'Bottts', seed: 'Circuit', name: 'Unit Circuit', url: `${BASE_URL}/bottts/svg?seed=Circuit` },
  { id: 'bot-6', style: 'bottts', styleLabel: 'Bottts', seed: 'Byte', name: 'Unit Byte', url: `${BASE_URL}/bottts/svg?seed=Byte` },

  // Bottts Neutral
  { id: 'bot-neu-1', style: 'bottts-neutral', styleLabel: 'Bottts Neutral', seed: 'Alpha', name: 'Bot Alpha', url: `${BASE_URL}/bottts-neutral/svg?seed=Alpha` },
  { id: 'bot-neu-2', style: 'bottts-neutral', styleLabel: 'Bottts Neutral', seed: 'Beta', name: 'Bot Beta', url: `${BASE_URL}/bottts-neutral/svg?seed=Beta` },
  { id: 'bot-neu-3', style: 'bottts-neutral', styleLabel: 'Bottts Neutral', seed: 'Gamma', name: 'Bot Gamma', url: `${BASE_URL}/bottts-neutral/svg?seed=Gamma` },
  { id: 'bot-neu-4', style: 'bottts-neutral', styleLabel: 'Bottts Neutral', seed: 'Delta', name: 'Bot Delta', url: `${BASE_URL}/bottts-neutral/svg?seed=Delta` },
  { id: 'bot-neu-5', style: 'bottts-neutral', styleLabel: 'Bottts Neutral', seed: 'Epsilon', name: 'Bot Epsilon', url: `${BASE_URL}/bottts-neutral/svg?seed=Epsilon` },
  { id: 'bot-neu-6', style: 'bottts-neutral', styleLabel: 'Bottts Neutral', seed: 'Zeta', name: 'Bot Zeta', url: `${BASE_URL}/bottts-neutral/svg?seed=Zeta` }
];
