export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Unique" | "Legendary" | "Mythic"
export type ItemType = "Head" | "Chest" | "Legs" | "Weapon" | "Accessory" | "SkillBook"

export interface ItemStats {
  attack?: number
  defense?: number
  hp?: number
  mana?: number
  attackPercent?: number // e.g. 0.1 for 10% increase
  defensePercent?: number
  manaRegen?: number
  hpRegen?: number
}

export interface Item {
  id: string
  name: string
  type: ItemType
  rarity: Rarity
  color: string
  stats: ItemStats
  skillId?: string
}

export const RARITY_COLORS: Record<Rarity, string> = {
  Common: "text-gray-400 border-gray-400 bg-gray-400",
  Uncommon: "text-green-400 border-green-400 bg-green-400",
  Rare: "text-blue-400 border-blue-400 bg-blue-400",
  Epic: "text-purple-400 border-purple-400 bg-purple-400",
  Unique: "text-pink-400 border-pink-400 bg-pink-400",
  Legendary: "text-orange-400 border-orange-400 bg-orange-400",
  Mythic: "text-red-500 border-red-500 bg-red-500 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]",
}

export type SkillType = "Offensive" | "Defensive" | "Utility" | "Ultimate"

export interface Skill {
  id: string
  name: string
  type: SkillType
  rarity: Rarity
  manaCost: number
  cooldown: number // in seconds
  damage?: number // Base damage
  heal?: number // Base heal
  description: string
}

// Helper to generate IDs
const genId = () => Math.random().toString(36).substring(2, 9)

// ==========================================
// EQUIPMENT GENERATION (100+ Items)
// ==========================================

const adjectives = ["Rusty", "Shiny", "Ancient", "Cursed", "Blessed", "Mechanical", "Cybernetic", "Ethereal", "Void", "Celestial", "Quantum", "Focused", "Chaotic", "Orderly", "Furious"]
const materials = ["Iron", "Steel", "Mithril", "Adamantite", "Code", "Data", "Plasma", "Neon", "Crystal", "Obsidian"]
const itemNames: Record<ItemType, string[]> = {
  Head: ["Helmet", "Crown", "Visor", "Headband", "Neural Link", "Hood"],
  Chest: ["Chestplate", "Armor", "Robes", "Jacket", "Exosuit", "Tunic"],
  Legs: ["Greaves", "Pants", "Leggings", "Shorts", "Trousers", "Exo-Legs"],
  Weapon: ["Sword", "Axe", "Bow", "Staff", "Keyboard", "Mouse", "Glove", "Whip"],
  Accessory: ["Ring", "Amulet", "Charm", "Badge", "USB Drive", "Token"],
  SkillBook: ["Tome", "Scroll", "Manual", "Grimoire", "Script", "Codex"]
}

export function generateLootPool(): Item[] {
  const pool: Item[] = []
  const rarities: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Unique", "Legendary", "Mythic"]
  
  // Generate a massive list of combinations
  for (let i = 0; i < 250; i++) {
    const type = Object.keys(itemNames)[Math.floor(Math.random() * 5)] as ItemType
    const rarity = rarities[Math.floor(Math.random() * rarities.length)]
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const mat = materials[Math.floor(Math.random() * materials.length)]
    const noun = itemNames[type][Math.floor(Math.random() * itemNames[type].length)]
    
    let name = `${adj} ${noun}`
    if (Math.random() > 0.5) name = `${mat} ${noun}`
    if (rarity === "Mythic") name = `${adj} ${mat} ${noun}`

    // Base stat multiplier based on rarity (nerfed for balanced early game)
    const rarityMult = { Common: 1, Uncommon: 2, Rare: 3, Epic: 5, Unique: 8, Legendary: 15, Mythic: 30 }[rarity]

    const stats: ItemStats = {}
    
    if (type === "Weapon") {
      stats.attack = Math.floor(Math.random() * 5 * rarityMult) + rarityMult
      if (rarityMult > 3) stats.attackPercent = parseFloat((Math.random() * 0.1 * (rarityMult/10)).toFixed(2))
    } else {
      stats.defense = Math.floor(Math.random() * 3 * rarityMult) + rarityMult
      stats.hp = Math.floor(Math.random() * 10 * rarityMult)
    }

    if (type === "Head" || type === "Accessory") {
      stats.mana = Math.floor(Math.random() * 5 * rarityMult)
      stats.manaRegen = Math.floor(Math.random() * 1 * rarityMult)
    }

    if (rarity === "Mythic" || rarity === "Legendary") {
      stats.hpRegen = Math.floor(Math.random() * 3 * rarityMult)
    }

    pool.push({
      id: genId(),
      name,
      type,
      rarity,
      color: RARITY_COLORS[rarity],
      stats
    })
  }

  // Generate Skill Books
  for (let i = 0; i < 50; i++) {
    const randomSkill = SKILL_POOL[Math.floor(Math.random() * SKILL_POOL.length)];
    pool.push({
      id: genId(),
      name: `Tome of ${randomSkill.name}`,
      type: "SkillBook",
      rarity: randomSkill.rarity,
      color: RARITY_COLORS[randomSkill.rarity],
      stats: {},
      skillId: randomSkill.id
    })
  }

  // Add some specific hardcoded legendary/mythics
  pool.push(
    { id: "mjolnir", name: "Ban Hammer", type: "Weapon", rarity: "Mythic", color: RARITY_COLORS.Mythic, stats: { attack: 999, attackPercent: 0.5, mana: 500 } },
    { id: "god-robe", name: "Robes of the Senior Dev", type: "Chest", rarity: "Mythic", color: RARITY_COLORS.Mythic, stats: { defense: 500, hp: 2000, manaRegen: 50 } },
    { id: "coffee", name: "Infinite Coffee Mug", type: "Accessory", rarity: "Legendary", color: RARITY_COLORS.Legendary, stats: { manaRegen: 100, hpRegen: 20 } }
  )

  return pool
}
// ==========================================
// SKILLS GENERATION (50+ Skills)
// ==========================================

export const SKILL_POOL: Skill[] = [
  // Common
  { id: "s1", name: "Quick Slash", type: "Offensive", rarity: "Common", manaCost: 5, cooldown: 1, damage: 15, description: "A fast, basic attack." },
  { id: "s2", name: "Minor Heal", type: "Utility", rarity: "Common", manaCost: 10, cooldown: 5, heal: 30, description: "Heals a small amount of HP." },
  { id: "s3", name: "Block", type: "Defensive", rarity: "Common", manaCost: 5, cooldown: 3, description: "Reduces incoming damage briefly." },
  
  // Uncommon
  { id: "s4", name: "Fireball", type: "Offensive", rarity: "Uncommon", manaCost: 20, cooldown: 4, damage: 45, description: "Hurls a ball of fire." },
  { id: "s5", name: "Ice Shard", type: "Offensive", rarity: "Uncommon", manaCost: 15, cooldown: 3, damage: 35, description: "Fires a chilling shard." },
  { id: "s6", name: "Mana Tap", type: "Utility", rarity: "Uncommon", manaCost: 0, cooldown: 10, description: "Restores a burst of mana." },
  
  // Rare
  { id: "s7", name: "Lightning Strike", type: "Offensive", rarity: "Rare", manaCost: 40, cooldown: 6, damage: 100, description: "Calls down a bolt of lightning." },
  { id: "s8", name: "Holy Light", type: "Utility", rarity: "Rare", manaCost: 35, cooldown: 8, heal: 150, description: "Heals a moderate amount of HP." },
  { id: "s9", name: "Energy Shield", type: "Defensive", rarity: "Rare", manaCost: 30, cooldown: 12, description: "Creates a temporary shield absorbing damage." },
  
  // Epic
  { id: "s10", name: "Meteor Shower", type: "Offensive", rarity: "Epic", manaCost: 80, cooldown: 12, damage: 250, description: "Drops meteors on the enemy." },
  { id: "s11", name: "Vampiric Drain", type: "Utility", rarity: "Epic", manaCost: 50, cooldown: 10, damage: 100, heal: 100, description: "Deals damage and heals for the same amount." },
  { id: "s12", name: "Time Warp", type: "Defensive", rarity: "Epic", manaCost: 60, cooldown: 20, description: "Slows down the enemy's next attack." },
  
  // Legendary
  { id: "s13", name: "Dragon's Breath", type: "Offensive", rarity: "Legendary", manaCost: 120, cooldown: 15, damage: 500, description: "Unleashes a torrent of ancient fire." },
  { id: "s14", name: "Divine Intervention", type: "Utility", rarity: "Legendary", manaCost: 200, cooldown: 30, heal: 1000, description: "Massively restores HP." },
  { id: "s15", name: "Absolute Zero", type: "Defensive", rarity: "Legendary", manaCost: 150, cooldown: 25, description: "Completely freezes the enemy for a few seconds." },
  
  // Mythic (Ultimates)
  { id: "s16", name: "SUPERNOVA", type: "Ultimate", rarity: "Mythic", manaCost: 300, cooldown: 60, damage: 2000, description: "Destroy everything." },
  { id: "s17", name: "REWRITE HISTORY", type: "Ultimate", rarity: "Mythic", manaCost: 250, cooldown: 60, heal: 9999, description: "Fully restores HP and Mana." },
]

// Generate the rest of the skills programmatically to reach 100+
const elements = ["Fire", "Ice", "Void", "Light", "Dark", "Earth", "Wind", "Cosmic", "Quantum", "Blood", "Soul", "Plasma", "Neon", "Thunder", "Steel"]
const attacks = ["Strike", "Blast", "Wave", "Burst", "Beam", "Nova", "Surge", "Rift", "Crash", "Maelstrom", "Tempest", "Eruption"]
const raritiesList: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"]

for (let i = 18; i <= 120; i++) {
  const el = elements[Math.floor(Math.random() * elements.length)]
  const atk = attacks[Math.floor(Math.random() * attacks.length)]
  const rarity = raritiesList[Math.floor(Math.random() * raritiesList.length)]
  
  const mult = rarity === "Common" ? 1 : rarity === "Uncommon" ? 1.5 : rarity === "Rare" ? 2.5 : rarity === "Epic" ? 4 : rarity === "Legendary" ? 8 : 15;
  
  SKILL_POOL.push({
    id: `s${i}`,
    name: `${el} ${atk}`,
    type: "Offensive",
    rarity: rarity,
    manaCost: Math.floor((Math.random() * 20 + 10) * (mult * 0.5)),
    cooldown: Math.floor(Math.random() * 5) + 2,
    damage: Math.floor((Math.random() * 30 + 10) * mult),
    description: `A powerful ${el} attack.`
  })
}

export const LOOT_POOL = generateLootPool()

// ==========================================
// DYNAMIC TIER AESTHETICS
// ==========================================

export function getTierAesthetic(tier: string) {
  const t = (tier || '').toLowerCase();
  
  if (t.includes('boss') || t.includes('legendary') || t.includes('impossible') || t.includes('unique')) {
    return {
      text: "text-purple-700 dark:text-purple-400",
      textDark: "text-purple-700 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-950/30",
      bgSoft: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-300 dark:border-purple-500/50",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)] dark:shadow-[0_0_20px_rgba(168,85,247,0.3)]",
      primaryBorder: "border-purple-500",
      accent: "bg-purple-600 dark:bg-purple-500"
    };
  }
  
  if (t.includes('epic') || t.includes('extreme') || t.includes('hard') || t.includes('challenge')) {
    return {
      text: "text-orange-700 dark:text-orange-400",
      textDark: "text-orange-700 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-950/30",
      bgSoft: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-300 dark:border-orange-500/50",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)] dark:shadow-[0_0_20px_rgba(249,115,22,0.3)]",
      primaryBorder: "border-orange-500",
      accent: "bg-orange-600 dark:bg-orange-500"
    };
  }
  
  if (t.includes('medium') || t.includes('standard') || t.includes('weekly') || t.includes('monthly')) {
    return {
      text: "text-cyan-700 dark:text-cyan-400",
      textDark: "text-cyan-700 dark:text-cyan-400",
      bg: "bg-cyan-100 dark:bg-cyan-950/30",
      bgSoft: "bg-cyan-50 dark:bg-cyan-900/20",
      border: "border-cyan-300 dark:border-cyan-500/50",
      glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:shadow-[0_0_15px_rgba(6,182,212,0.2)]",
      primaryBorder: "border-cyan-500",
      accent: "bg-cyan-600 dark:bg-cyan-500"
    };
  }
  
  return {
    text: "text-emerald-700 dark:text-emerald-400",
    textDark: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-950/30",
    bgSoft: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-300 dark:border-emerald-500/50",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    primaryBorder: "border-emerald-500",
    accent: "bg-emerald-600 dark:bg-emerald-500"
  };
}
