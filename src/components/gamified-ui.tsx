"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Plus, Crosshair, Sword, ShieldAlert, PackageOpen, Hexagon, Triangle, Shield, Backpack, Zap, Flame, Snowflake, Skull, X, Book } from 'lucide-react'
import { LOOT_POOL, SKILL_POOL, Item, ItemType, Rarity, RARITY_COLORS, Skill } from '@/lib/rpg-data'

// ==========================================
// 1. DYNAMIC TACTICAL MOUSE GLOW & TRAIL
// ==========================================
export function MouseGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([])

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY })
      setTrail(prev => {
        const newTrail = [...prev, { x: ev.clientX, y: ev.clientY, id: Date.now() + "-" + Math.random() }]
        if (newTrail.length > 20) newTrail.shift()
        return newTrail
      })
    }
    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 w-[800px] h-[800px] rounded-full blur-[150px] z-0 opacity-40 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 60%, transparent 100%)'
        }}
        animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
        transition={{ type: "tween", ease: "backOut", duration: 0.8 }}
      />
      {trail.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed w-1 h-1 bg-primary rounded-full z-[9998]"
          style={{ left: t.x, top: t.y }}
        />
      ))}
    </>
  )
}

// ==========================================
// 2. ADVANCED TACTICAL CUSTOM CURSOR
// ==========================================
export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    document.body.style.cursor = 'none'
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY })
    }
    window.addEventListener('mousemove', updateMousePosition)
    return () => {
      document.body.style.cursor = 'auto'
      window.removeEventListener('mousemove', updateMousePosition)
    }
  }, [])

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center mix-blend-difference"
      animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16 }}
      transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
    >
      <div className="relative w-8 h-8">
        <Plus className="w-8 h-8 text-primary absolute inset-0 drop-shadow-[0_0_8px_rgba(255,70,85,0.8)]" />
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute inset-[-4px] border-[1px] border-dashed border-white/40 rounded-full"
        />
      </div>
    </motion.div>
  )
}

// ==========================================
// 3. INFINITE SCROLLING MARQUEE TICKER
// ==========================================
export function MarqueeTicker({ text, reverse = false }: { text: string, reverse?: boolean }) {
  return (
    <div className="w-full overflow-hidden whitespace-nowrap bg-background border-y border-primary/20 py-2 flex relative">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      <motion.div
        className="flex gap-4 items-center"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="font-teko text-xl font-bold tracking-widest text-primary uppercase flex items-center gap-4">
            {text} <Plus className="w-4 h-4 text-foreground/20" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ==========================================
// 4. GEOMETRIC PARTICLES BACKGROUND
// ==========================================
export function GeometricParticles() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(15)].map((_, i) => {
        const isHex = i % 2 === 0
        return (
          <motion.div
            key={i}
            className="absolute text-primary/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          >
            {isHex ? <Hexagon className="w-12 h-12" /> : <Triangle className="w-8 h-8" />}
          </motion.div>
        )
      })}
    </div>
  )
}

// ==========================================
// 5. THE EPIC RPG ENGINE (BOSS BATTLE)
// ==========================================

const BOSS_NAMES = ["Procrastination", "Doomscrolling", "Tutorial Hell", "Imposter Syndrome", "Feature Creep", "Burnout", "Distraction"]

export function EpicBossBattle() {
  // === PROGRESSION STATE ===
  const [level, setLevel] = useState(1)
  const [statPoints, setStatPoints] = useState(0)
  const [baseStats, setBaseStats] = useState({ STR: 5, VIT: 5, INT: 5 })
  
  // === BOSS STATE ===
  const maxBossHp = 100 + (level * 100)
  const maxBossMana = 50 + (level * 20)
  const [bossHp, setBossHp] = useState(maxBossHp)
  const [bossMana, setBossMana] = useState(maxBossMana)
  const [bossState, setBossState] = useState<"idle" | "attacking" | "ultimate" | "dead" | "casting">("idle")
  const [bossShake, setBossShake] = useState(false)
  
  // === PLAYER STATE ===
  const [playerState, setPlayerState] = useState<"alive" | "dead">("alive")
  const [playerShake, setPlayerShake] = useState(false)
  const [shieldActive, setShieldActive] = useState(false)
  
  // === INVENTORY & EQUIPMENT ===
  const [inventory, setInventory] = useState<Item[]>([])
  const [backpackOpen, setBackpackOpen] = useState(false)
  const [inventoryFilter, setInventoryFilter] = useState<"All" | "Weapon" | "Armor" | "Accessory" | "SkillBook">("All")
  const [equipment, setEquipment] = useState<{ [key in ItemType]: Item | null }>({
    Head: null, Chest: null, Legs: null, Weapon: null, Accessory: null, SkillBook: null
  })
  
  // === SKILLS ===
  const [unlockedSkills, setUnlockedSkills] = useState<Skill[]>([SKILL_POOL[0], SKILL_POOL[1], SKILL_POOL[2], SKILL_POOL[9]])
  const [equippedSkills, setEquippedSkills] = useState<(Skill | null)[]>([SKILL_POOL[0], SKILL_POOL[1], SKILL_POOL[2], SKILL_POOL[9]])
  const [grimoireOpen, setGrimoireOpen] = useState(false)
  const [slotSelectMode, setSlotSelectMode] = useState<Skill | null>(null)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  const [basicCooldown, setBasicCooldown] = useState(0)

  const [particles, setParticles] = useState<{ id: string; x: number; y: number; text: string; color: string }[]>([])

  // === CALCULATE TOTAL STATS ===
  const totalStats = Object.values(equipment).reduce(
    (acc, item) => {
      if (item) {
        acc.attack += item.stats.attack || 0
        acc.defense += item.stats.defense || 0
        acc.maxHp += item.stats.hp || 0
        acc.maxMana += item.stats.mana || 0
        acc.attackPercent += item.stats.attackPercent || 0
        acc.manaRegen += item.stats.manaRegen || 0
        acc.hpRegen += item.stats.hpRegen || 0
      }
      return acc
    },
    { 
      attack: baseStats.STR * 3, 
      defense: Math.floor(baseStats.VIT / 2), 
      maxHp: 100 + (baseStats.VIT * 15), 
      maxMana: 50 + (baseStats.INT * 10),
      attackPercent: 0,
      manaRegen: Math.floor(baseStats.INT / 3) + 1,
      hpRegen: 0
    }
  )

  totalStats.attack = Math.floor(totalStats.attack * (1 + totalStats.attackPercent))

  const [playerHp, setPlayerHp] = useState(totalStats.maxHp)
  const [playerMana, setPlayerMana] = useState(totalStats.maxMana)

  // Heal/Mana max cap adjustments when max increases
  useEffect(() => {
    if (playerHp > totalStats.maxHp) setPlayerHp(totalStats.maxHp)
    if (playerMana > totalStats.maxMana) setPlayerMana(totalStats.maxMana)
  }, [totalStats.maxHp, totalStats.maxMana, playerHp, playerMana])

  const spawnParticle = (x: number, y: number, text: string, color: string) => {
    const newParticle = { id: crypto.randomUUID(), x, y, text, color }
    setParticles(prev => [...prev, newParticle])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id))
    }, 1000)
  }

  // === GAME LOOP: REGEN & COOLDOWNS ===
  useEffect(() => {
    if (bossState === "dead" || playerState === "dead") return
    const regenInterval = setInterval(() => {
      setPlayerMana(p => Math.min(totalStats.maxMana, p + totalStats.manaRegen))
      if (totalStats.hpRegen > 0) setPlayerHp(p => Math.min(totalStats.maxHp, p + totalStats.hpRegen))
      
      setBossMana(p => Math.min(maxBossMana, p + (level * 2))) // Boss mana regen
      
      if (basicCooldown > 0) setBasicCooldown(p => p - 1)
      
      setCooldowns(prev => {
        const next = { ...prev }
        let changed = false
        for (const [id, cd] of Object.entries(next)) {
          if (cd > 0) {
            next[id] = cd - 1
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(regenInterval)
  }, [bossState, playerState, totalStats, maxBossMana, level, basicCooldown])

  // === GAME LOOP: BOSS AI ===
  useEffect(() => {
    if (bossState === "dead" || playerState === "dead") return

    const attackInterval = setInterval(() => {
      const availableBossSkills = SKILL_POOL.filter(s => s.manaCost <= bossMana && s.rarity !== "Mythic" && s.type === "Offensive")
      const useSkill = availableBossSkills.length > 0 && Math.random() > 0.5
      
      if (useSkill) {
        const skill = availableBossSkills[Math.floor(Math.random() * availableBossSkills.length)]
        setBossState("casting")
        setTimeout(() => {
          setBossMana(m => Math.max(0, m - skill.manaCost))
          setBossState("idle")
          let dmg = (skill.damage || 0) + (level * 10)
          dmg = Math.max(1, dmg - totalStats.defense)
          if (shieldActive) dmg = Math.floor(dmg * 0.2)
          
          setPlayerHp(p => {
            const nh = Math.max(0, p - dmg)
            if (nh === 0) setPlayerState("dead")
            return nh
          })
          setPlayerShake(true)
          setTimeout(() => setPlayerShake(false), 400)
          
          const rect = document.getElementById('player-hp-bar')?.getBoundingClientRect()
          if (rect) spawnParticle(rect.left + 50, rect.top - 20, `${skill.name} -${dmg}`, "text-purple-400 drop-shadow-[0_0_10px_purple]")
        }, 1000)
      } else {
        const isUltimate = Math.random() > 0.8
        setBossState(isUltimate ? "ultimate" : "attacking")
        setTimeout(() => {
          setBossState("idle")
          let damage = isUltimate ? (level * 20 + 30) : (level * 8 + 10)
          damage = Math.max(1, damage - totalStats.defense)
          if (shieldActive) damage = Math.floor(damage * 0.2)
          
          setPlayerHp(p => {
            const nh = Math.max(0, p - damage)
            if (nh === 0) setPlayerState("dead")
            return nh
          })
          setPlayerShake(true)
          setTimeout(() => setPlayerShake(false), 400)
          
          const rect = document.getElementById('player-hp-bar')?.getBoundingClientRect()
          if (rect) spawnParticle(rect.left + 50, rect.top - 20, isUltimate ? `ULTIMATE -${damage}` : `-${damage}`, "text-red-400 font-bold drop-shadow-[0_0_10px_red]")
        }, isUltimate ? 1500 : 500)
      }
    }, Math.max(2000, 4000 - level * 150))
    return () => clearInterval(attackInterval)
  }, [bossState, playerState, level, bossMana, shieldActive, totalStats.defense])

  // === BOSS DEATH ===
  useEffect(() => {
    if (bossHp === 0 && bossState !== "dead") {
      setBossState("dead")
      // Level-scaled Drop Logic
      const drops = Math.floor(Math.random() * 3) + (level > 2 ? 3 : 1)
      const newItems: Item[] = []
      
      const allowedRarities = ["Common", "Uncommon"]
      if (level >= 2) allowedRarities.push("Rare")
      if (level >= 4) allowedRarities.push("Epic", "Unique")
      if (level >= 6) allowedRarities.push("Legendary")
      if (level >= 8) allowedRarities.push("Mythic")

      const validPool = LOOT_POOL.filter(item => allowedRarities.includes(item.rarity))
      const fallbackPool = validPool.length > 0 ? validPool : LOOT_POOL.filter(i => i.rarity === "Common")

      for(let i=0; i<drops; i++) {
        const item = fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
        newItems.push({ ...item, id: crypto.randomUUID() })
      }
      setInventory(prev => [...prev, ...newItems])
      
      setTimeout(() => {
        setLevel(prev => prev + 1)
        setStatPoints(prev => prev + 3)
        const nextMaxHp = 100 + ((level + 1) * 100)
        const nextMaxMana = 50 + ((level + 1) * 20)
        setBossHp(nextMaxHp)
        setBossMana(nextMaxMana)
        setPlayerHp(totalStats.maxHp)
        setPlayerMana(totalStats.maxMana)
        setBossState("idle")
      }, 3000)
    }
  }, [bossHp, bossState, level, totalStats.maxHp, totalStats.maxMana])

  const castSkill = (e: React.MouseEvent, skill: Skill) => {
    if (bossState === "dead" || playerState === "dead" || bossHp === 0) return
    if (cooldowns[skill.id] > 0 || playerMana < skill.manaCost) return

    setPlayerMana(p => p - skill.manaCost)
    setCooldowns(prev => ({ ...prev, [skill.id]: skill.cooldown }))

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left + (Math.random() * 60 - 30)
    const y = e.clientY - rect.top + (Math.random() * 40 - 20)

    if (skill.type === "Defensive") {
      setShieldActive(true)
      setTimeout(() => setShieldActive(false), 3000)
      spawnParticle(x, y, `SHIELD UP`, "text-blue-400 drop-shadow-[0_0_10px_blue]")
    } else if (skill.type === "Utility" && skill.heal) {
      const healAmt = skill.heal + Math.floor(baseStats.INT * 5)
      setPlayerHp(p => Math.min(totalStats.maxHp, p + healAmt))
      spawnParticle(x, y, `+${healAmt} HP`, "text-green-400 drop-shadow-[0_0_10px_green]")
    } else if (skill.damage) {
      let dmg = skill.damage + totalStats.attack + (baseStats.INT * 2)
      const isCrit = Math.random() > 0.85
      if (isCrit) dmg = Math.floor(dmg * 2.5)
      
      setBossHp(prev => Math.max(0, prev - dmg))
      spawnParticle(x, y, isCrit ? `CRIT -${dmg}` : `-${dmg}`, skill.rarity === "Mythic" ? "text-red-500 font-bold text-6xl drop-shadow-[0_0_20px_red]" : "text-primary font-bold text-4xl drop-shadow-[0_0_10px_rgba(255,70,85,0.8)]")
      
      setBossShake(true)
      setTimeout(() => setBossShake(false), 400)
    }
  }

  const handleRespawn = () => {
    setPlayerHp(totalStats.maxHp)
    setPlayerMana(totalStats.maxMana)
    setBossHp(maxBossHp)
    setBossMana(maxBossMana)
    setPlayerState("alive")
    setBossState("idle")
  }

  const equipItem = (item: Item) => {
    if (item.type === "SkillBook") {
      const skill = SKILL_POOL.find(s => s.id === item.skillId)
      if (skill) {
        if (!unlockedSkills.some(s => s.id === skill.id)) {
           setUnlockedSkills(prev => [...prev, skill])
           spawnParticle(window.innerWidth/2, window.innerHeight/2, `LEARNED: ${skill.name}`, "text-purple-400 drop-shadow-[0_0_20px_purple] text-6xl")
        } else {
           spawnParticle(window.innerWidth/2, window.innerHeight/2, `ALREADY KNOWN`, "text-muted drop-shadow-[0_0_20px_white] text-4xl")
        }
        setInventory(inv => inv.filter(i => i.id !== item.id))
      }
      return
    }

    setEquipment(prev => {
      const current = prev[item.type]
      if (current?.id === item.id) return prev
      setInventory(inv => {
        const newInv = inv.filter(i => i.id !== item.id)
        if (current && !newInv.some(i => i.id === current.id)) newInv.push(current)
        return newInv
      })
      return { ...prev, [item.type]: item }
    })
  }

  const currentBossName = BOSS_NAMES[(level - 1) % BOSS_NAMES.length]

  const unequipItem = (type: ItemType) => {
    setEquipment(prev => {
      const current = prev[type]
      if (!current) return prev
      setInventory(inv => [...inv, current])
      return { ...prev, [type]: null }
    })
  }

  const PaperDollItem = ({ type, className }: { type: ItemType, className: string }) => {
    const item = equipment[type]
    return (
      <div className="group relative z-30">
        <div 
          onClick={() => item && unequipItem(type)}
          className={`relative ${className} ${item ? item.color + " cursor-none hover:brightness-150 transition-all duration-300" : "border-muted/30 bg-transparent text-muted/30 transition-all duration-300"}`}
        >
          {type === "Chest" && <div className="absolute inset-2 border border-current opacity-40 pointer-events-none" />}
          {type === "Head" && <div className="w-3 h-1 bg-current opacity-60 pointer-events-none" />}
          {type === "Legs" && <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-current opacity-40 -translate-x-1/2 pointer-events-none" />}
        </div>
        {item && (
          <div className="absolute hidden group-hover:flex flex-col gap-1 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-background/90 backdrop-blur-md border border-primary/50 p-3 z-50 shadow-[0_0_20px_rgba(255,70,85,0.4)] text-left clip-angled-tl pointer-events-none">
            <span className="font-teko text-xl font-bold uppercase text-white truncate drop-shadow-md">{item.name}</span>
            <span className="text-xs font-mono text-muted mb-1">{item.rarity} {item.type}</span>
            {item.stats.attack && <span className="text-xs font-mono text-primary">ATK +{item.stats.attack}</span>}
            {item.stats.defense && <span className="text-xs font-mono text-cyan-400">DEF +{item.stats.defense}</span>}
            {item.stats.hp && <span className="text-xs font-mono text-green-400">HP +{item.stats.hp}</span>}
            {item.stats.mana && <span className="text-xs font-mono text-blue-400">MANA +{item.stats.mana}</span>}
            <span className="text-[10px] text-muted italic mt-2 text-center border-t border-muted/20 pt-1">Click to unequip</span>
          </div>
        )}
      </div>
    )
  }

  const PaperDoll = () => (
    <div className="relative w-32 h-48 flex flex-col items-center justify-center gap-[2px] opacity-90 mt-2 z-20">
      <PaperDollItem type="Head" className="w-10 h-10 clip-angled border-2 flex items-center justify-center" />
      <div className="w-3 h-2 bg-muted/20" />
      <div className="flex items-start gap-1">
        <PaperDollItem type="Weapon" className="w-5 h-20 clip-angled border-2 mt-2 rotate-6" />
        <PaperDollItem type="Chest" className="w-16 h-20 clip-angled-tl border-2 relative" />
        <PaperDollItem type="Accessory" className="w-5 h-20 clip-angled border-2 mt-2 -rotate-6" />
      </div>
      <div className="w-10 h-2 bg-muted/20" />
      <PaperDollItem type="Legs" className="w-14 h-16 clip-angled-br border-2 relative" />
    </div>
  )

  return (
    <div className="relative flex flex-col w-full max-w-6xl mx-auto z-10 font-sans cursor-none select-none text-foreground">
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT PANEL: AVATAR & STATS */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <motion.div 
            animate={playerShake ? { x: [-10, 10, -10, 10, 0], filter: "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)" } : {}}
            transition={{ duration: 0.4 }}
            className="w-full relative"
          >
            <div className="absolute inset-0 bg-background/50 border border-muted/20 clip-angled-tl backdrop-blur-md pointer-events-none" />
            <div className="w-full p-6 flex flex-col items-center relative z-10">
              <span className="font-teko text-3xl uppercase text-muted font-bold tracking-widest border-b border-muted/20 w-full text-center pb-2">
                YOUR AVATAR
              </span>
              <PaperDoll />
            
            <div className="w-full mt-4 space-y-1">
              <div className="flex justify-between font-mono text-sm border-b border-white/5 pb-1">
                <span className="text-muted">ATK:</span>
                <span className="text-primary font-bold">{totalStats.attack}</span>
              </div>
              <div className="flex justify-between font-mono text-sm border-b border-white/5 pb-1">
                <span className="text-muted">DEF:</span>
                <span className="text-cyan-400 font-bold">{totalStats.defense}</span>
              </div>
              <div className="flex justify-between font-mono text-sm border-b border-white/5 pb-1">
                <span className="text-muted">HP:</span>
                <span className="text-green-400 font-bold">{playerHp}/{totalStats.maxHp}</span>
              </div>
              <div className="flex justify-between font-mono text-sm pb-1">
                <span className="text-muted">MANA:</span>
                <span className="text-blue-400 font-bold">{playerMana}/{totalStats.maxMana}</span>
              </div>
            </div>

            {statPoints > 0 && (
              <div className="w-full mt-4 p-3 bg-primary/10 border border-primary/30 flex flex-col gap-2 relative z-10 shadow-[inset_0_0_20px_rgba(255,70,85,0.1)]">
                <div className="text-primary font-bold font-teko text-xl uppercase animate-pulse text-center tracking-widest border-b border-primary/20 pb-1">Level Up! {statPoints} Pts</div>
                <div className="flex justify-between gap-2 mt-1">
                  {(["STR", "VIT", "INT"] as const).map(stat => (
                    <button 
                      key={stat}
                      onClick={() => { setBaseStats(p => ({...p, [stat]: p[stat]+1})); setStatPoints(p => p - 1) }}
                      className="flex-1 bg-background hover:bg-primary text-primary hover:text-black border border-primary/50 text-sm font-mono py-1 font-bold cursor-none transition-all"
                    >
                      {stat}+
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4 w-full mt-6">
              <button 
                onClick={() => setBackpackOpen(true)}
                className="flex-1 relative h-24 bg-background border-2 border-cyan-500/50 hover:border-cyan-400 flex flex-col items-center justify-center gap-1 cursor-none transition-all duration-300 group/btn overflow-hidden px-2"
                style={{ boxShadow: "inset 0 0 20px rgba(34,211,238,0.1), 0 0 15px rgba(34,211,238,0.2)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                <Backpack className="w-6 h-6 text-cyan-400 group-hover/btn:-translate-y-1 transition-transform duration-300 relative z-10" /> 
                <span className="relative z-10 font-teko text-xl lg:text-2xl uppercase text-cyan-100 font-bold tracking-widest group-hover/btn:text-white transition-colors w-full text-center truncate">BACKPACK</span>
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />
              </button>

              <button 
                onClick={() => setGrimoireOpen(true)}
                className="flex-1 relative h-24 bg-background border-2 border-purple-500/50 hover:border-purple-400 flex flex-col items-center justify-center gap-1 cursor-none transition-all duration-300 group/btn overflow-hidden px-2"
                style={{ boxShadow: "inset 0 0 20px rgba(168,85,247,0.1), 0 0 15px rgba(168,85,247,0.2)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                <Book className="w-6 h-6 text-purple-400 group-hover/btn:-translate-y-1 transition-transform duration-300 relative z-10" /> 
                <span className="relative z-10 font-teko text-xl lg:text-2xl uppercase text-purple-100 font-bold tracking-widest group-hover/btn:text-white transition-colors w-full text-center truncate">GRIMOIRE</span>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-purple-400" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-purple-400" />
              </button>
            </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL: BOSS & COMBAT */}
        <div className="w-full md:w-2/3 flex flex-col pt-2">
          <motion.div 
            animate={bossShake ? { x: [-15, 15, -15, 15, 0], filter: "brightness(1.5) sepia(1) saturate(3)" } : {}}
            transition={{ duration: 0.4 }}
            className="w-full mb-8 relative"
          >
            <div className="absolute -top-5 left-4 bg-primary text-white px-4 py-1 font-teko text-xl font-bold uppercase clip-angled shadow-lg z-10 flex items-center gap-2">
              <Skull className="w-4 h-4" /> BOSS LVL_{level}
            </div>
            
            <div className={`w-full relative border bg-background/80 p-6 clip-angled-tl backdrop-blur-sm transition-colors duration-300 ${bossState === "ultimate" ? 'border-primary shadow-[0_0_50px_rgba(255,70,85,0.4)]' : bossState === "casting" ? 'border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.4)]' : 'border-primary/30'}`}>
              <div className="flex justify-between items-end mb-2 mt-4">
                <span className="font-teko text-5xl uppercase tracking-widest text-foreground font-black drop-shadow-md">
                  {currentBossName}
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-teko text-primary">{bossHp}/{maxBossHp}</span>
                  <span className="text-xl font-teko text-blue-400 -mt-2">{bossMana} MP</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="h-6 bg-[#111111] relative p-[2px] border border-white/10">
                  <motion.div 
                    className="h-full bg-primary shadow-[0_0_10px_rgba(255,70,85,0.8)]"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(bossHp / maxBossHp) * 100}%` }}
                    transition={{ type: "spring", bounce: 0 }}
                  />
                </div>
                <div className="h-2 bg-[#111111] relative border border-white/10">
                  <motion.div 
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(bossMana / maxBossMana) * 100}%` }}
                    transition={{ type: "spring", bounce: 0 }}
                  />
                </div>
              </div>
              
              {bossState === "ultimate" && <div className="absolute inset-0 border-4 border-primary animate-ping pointer-events-none" />}
              {bossState === "casting" && <div className="absolute inset-0 border-4 border-purple-500 animate-pulse pointer-events-none" />}
              
              {bossState === "dead" && (
                <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20 backdrop-blur-sm pointer-events-none z-10">
                  <span className="font-teko text-6xl font-black text-cyan-400 drop-shadow-lg">ENEMY DEFEATED</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* PLAYER BARS */}
          <div id="player-hp-bar" className="w-full mb-6 relative">
            <div className="flex justify-between items-end mb-1">
              <span className="font-teko text-2xl uppercase text-muted font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> YOUR VITALS</span>
              <div className="flex gap-4">
                 <span className="text-2xl font-teko text-cyan-400 font-bold">{playerHp}/{totalStats.maxHp} HP</span>
                 <span className="text-2xl font-teko text-blue-400 font-bold">{playerMana}/{totalStats.maxMana} MP</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-4 bg-[#111111] relative border border-white/5">
                <motion.div 
                  className={`h-full ${shieldActive ? 'bg-blue-300 shadow-[0_0_15px_rgba(147,197,253,0.8)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'}`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${(playerHp / totalStats.maxHp) * 100}%` }}
                />
              </div>
              <div className="h-2 bg-[#111111] relative border border-white/5">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: "100%" }}
                  animate={{ width: `${(playerMana / totalStats.maxMana) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          {slotSelectMode && (
             <div className="w-full mt-6 mb-2 p-2 bg-primary/20 border border-primary text-white font-teko text-2xl uppercase font-bold text-center tracking-widest flex items-center justify-center gap-4 animate-pulse shadow-[0_0_20px_rgba(255,70,85,0.4)]">
                <Sword className="w-6 h-6" />
                SELECT A SLOT BELOW TO EQUIP {slotSelectMode.name}
             </div>
          )}
          {playerState === "dead" ? (
            <button 
              onClick={handleRespawn}
              className={`w-full py-6 bg-red-900 hover:bg-red-700 text-white font-teko text-5xl font-bold uppercase tracking-widest clip-angled-br cursor-none transition-colors shadow-[0_0_40px_rgba(255,0,0,0.5)] ${!slotSelectMode ? 'mt-6' : ''}`}
            >
              SYSTEM FAILURE // RESPAWN
            </button>
          ) : (
            <div className={`flex gap-2 w-full ${!slotSelectMode ? 'mt-6' : ''}`}>
              {/* Basic Attack is always slot 1 */}
              <button
                onClick={(e) => {
                  const damage = totalStats.attack
                  const isCrit = Math.random() > 0.8
                  setBossHp(prev => Math.max(0, prev - (isCrit ? damage * 2 : damage)))
                  spawnParticle(e.clientX, e.clientY, isCrit ? `CRIT -${damage*2}` : `-${damage}`, "text-white drop-shadow-md")
                }}
                className={`flex-[0.8] relative h-24 bg-secondary border border-muted/20 clip-angled-bl flex flex-col items-center justify-center cursor-none transition-colors hover:bg-primary/20 hover:border-primary/50`}
              >
                <Sword className={`w-6 h-6 mb-1 text-primary`} />
                <span className="font-teko text-2xl font-bold uppercase">Basic Strike</span>
              </button>

              {equippedSkills.map((skill, idx) => (
                <div key={idx} className={`flex-1 relative h-24 bg-secondary border flex items-center justify-center cursor-none group transition-colors ${slotSelectMode ? "border-primary animate-pulse hover:bg-primary/20" : "border-muted/20 hover:bg-muted/10"}`}>
                  {slotSelectMode && (
                    <div 
                      onClick={() => {
                        setEquippedSkills(prev => {
                          const next = [...prev];
                          next[idx] = slotSelectMode;
                          return next;
                        });
                        setSlotSelectMode(null);
                        setGrimoireOpen(false);
                      }}
                      className="absolute inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm cursor-none"
                    >
                      <span className="font-teko text-xl font-bold uppercase text-white drop-shadow-md">EQUIP HERE</span>
                    </div>
                  )}
                  {skill ? (
                    <button 
                      onClick={(e) => { if (!slotSelectMode) castSkill(e, skill) }}
                      disabled={cooldowns[skill.id] > 0 || playerMana < skill.manaCost}
                      className="w-full h-full flex flex-col items-center justify-center relative p-2"
                    >
                       {skill.type === "Offensive" && <Flame className={`w-6 h-6 mb-1 ${RARITY_COLORS[skill.rarity].split(' ')[0]}`} />}
                       {skill.type === "Defensive" && <Shield className={`w-6 h-6 mb-1 ${RARITY_COLORS[skill.rarity].split(' ')[0]}`} />}
                       {skill.type === "Utility" && <Zap className={`w-6 h-6 mb-1 ${RARITY_COLORS[skill.rarity].split(' ')[0]}`} />}
                       {skill.type === "Ultimate" && <Skull className={`w-6 h-6 mb-1 text-red-500 drop-shadow-[0_0_5px_red]`} />}
                       
                       <span className="font-teko text-xl font-bold uppercase leading-none truncate w-full text-center mt-1">{skill.name}</span>
                       <span className="font-mono text-xs text-blue-400 mt-1">{skill.manaCost} MP</span>
                       
                       {cooldowns[skill.id] > 0 && (
                         <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 pointer-events-none">
                           <span className="font-teko text-4xl font-black text-white">{cooldowns[skill.id]}</span>
                         </div>
                       )}
                       {playerMana < skill.manaCost && cooldowns[skill.id] <= 0 && (
                         <div className="absolute inset-0 bg-blue-900/20 flex flex-col items-center justify-center z-10 pointer-events-none">
                           <span className="font-mono text-xs font-bold text-blue-300 mt-8 opacity-80">NO MANA</span>
                         </div>
                       )}
                    </button>
                  ) : (
                    <span className="font-teko text-xl text-muted/30">EMPTY SLOT</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BACKPACK OVERLAY */}
      <AnimatePresence>
        {backpackOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="w-full max-w-7xl h-[85vh] bg-secondary border border-primary/30 flex flex-col relative clip-angled shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-muted/20 bg-background/50">
                <span className="font-teko text-5xl uppercase font-bold text-foreground flex items-center gap-4">
                  <Backpack className="w-10 h-10 text-primary" /> 
                  INVENTORY_HUD // <span className="text-muted text-3xl mt-2 ml-2">SPACE: {inventory.length}/INF</span>
                </span>
                <button onClick={() => setBackpackOpen(false)} className="hover:text-primary transition-colors cursor-none p-2 border border-transparent hover:border-primary/50">
                  <X className="w-10 h-10" />
                </button>
              </div>

              {/* FILTERS */}
              <div className="flex gap-6 px-6 pt-4 pb-0 bg-background/50 border-b border-muted/20">
                {(["All", "Weapon", "Armor", "Accessory", "SkillBook"] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setInventoryFilter(f)} 
                    className={`font-teko text-2xl px-2 py-2 uppercase transition-colors cursor-none border-b-2 ${inventoryFilter === f ? 'text-cyan-400 border-cyan-400' : 'text-muted border-transparent hover:text-white'}`}
                  >
                    {f === 'Armor' ? 'Armor' : f === 'SkillBook' ? 'Spells' : f}
                  </button>
                ))}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" style={{ alignContent: 'start' }}>
                <AnimatePresence mode="popLayout">
                  {inventory.filter(item => {
                    if (inventoryFilter === "All") return true;
                    if (inventoryFilter === "Armor") return ["Head", "Chest", "Legs"].includes(item.type);
                    return item.type === inventoryFilter;
                  }).map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      key={item.id} 
                      onClick={() => equipItem(item)}
                      className={`flex flex-col p-4 bg-background hover:bg-muted/10 border-2 cursor-none transition-transform hover:scale-105 active:scale-95 ${RARITY_COLORS[item.rarity].split(' ')[1]}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold uppercase tracking-widest ${RARITY_COLORS[item.rarity].split(' ')[0]}`}>
                          [{item.rarity}]
                        </span>
                        <div className="flex items-center gap-1 opacity-70" title={item.type}>
                          {item.type === "SkillBook" ? <Book className="w-4 h-4 text-purple-400" /> : 
                           item.type === "Weapon" ? <Sword className="w-4 h-4 text-red-400" /> : 
                           item.type === "Accessory" ? <Zap className="w-4 h-4 text-yellow-400" /> : 
                           <Shield className="w-4 h-4 text-cyan-400" />}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-muted/80 mt-1">{item.type}</span>
                      <span className="font-mono text-base font-bold mt-1 text-foreground leading-tight min-h-[40px]">{item.name}</span>
                      <div className="flex flex-col gap-1 mt-4 text-xs font-mono opacity-80 border-t border-white/10 pt-2">
                        {item.stats.attack !== undefined && <span className="text-primary">ATK +{item.stats.attack}</span>}
                        {item.stats.attackPercent !== undefined && <span className="text-primary">ATK +{item.stats.attackPercent * 100}%</span>}
                        {item.stats.defense !== undefined && <span className="text-cyan-400">DEF +{item.stats.defense}</span>}
                        {item.stats.hp !== undefined && <span className="text-green-400">HP +{item.stats.hp}</span>}
                        {item.stats.mana !== undefined && <span className="text-blue-400">MANA +{item.stats.mana}</span>}
                        {item.stats.manaRegen !== undefined && <span className="text-blue-400">M.REG +{item.stats.manaRegen}</span>}
                        {item.stats.hpRegen !== undefined && <span className="text-green-400">H.REG +{item.stats.hpRegen}</span>}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {inventory.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-32 text-muted/50 font-mono italic">
                    <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
                    No items found. Defeat bosses for massive loot drops.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRIMOIRE OVERLAY */}
      <AnimatePresence>
        {grimoireOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="w-full max-w-7xl h-[85vh] bg-secondary border border-primary/30 flex flex-col relative clip-angled-br shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-muted/20 bg-background/50">
                <span className="font-teko text-5xl uppercase font-bold text-foreground flex items-center gap-4">
                  <Book className="w-10 h-10 text-primary" /> 
                  GRIMOIRE // <span className="text-muted text-3xl mt-2 ml-2">UNLOCKED: {unlockedSkills.length}</span>
                </span>
                <button onClick={() => { setGrimoireOpen(false); setSlotSelectMode(null); }} className="hover:text-primary transition-colors cursor-none p-2 border border-transparent hover:border-primary/50">
                  <X className="w-10 h-10" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" style={{ alignContent: 'start' }}>
                <AnimatePresence mode="popLayout">
                  {unlockedSkills.map((skill) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      key={skill.id} 
                      onClick={() => { setSlotSelectMode(skill); setGrimoireOpen(false); }}
                      className={`flex flex-col p-4 bg-background hover:bg-muted/10 border-2 cursor-none transition-transform hover:scale-105 active:scale-95 ${slotSelectMode?.id === skill.id ? 'border-primary shadow-[0_0_20px_rgba(255,70,85,0.4)]' : RARITY_COLORS[skill.rarity].split(' ')[1]}`}
                    >
                      <span className={`text-xs font-bold uppercase tracking-widest ${RARITY_COLORS[skill.rarity].split(' ')[0]}`}>
                        [{skill.rarity}] {skill.type}
                      </span>
                      <span className="font-teko text-2xl font-bold mt-2 text-foreground leading-tight min-h-[40px] uppercase">{skill.name}</span>
                      <div className="flex flex-col gap-1 mt-2 text-xs font-mono opacity-80 border-t border-white/10 pt-2">
                        {skill.manaCost > 0 && <span className="text-blue-400">MANA COST: {skill.manaCost}</span>}
                        {skill.cooldown > 0 && <span className="text-muted">COOLDOWN: {skill.cooldown}s</span>}
                        {skill.damage && <span className="text-primary">DAMAGE: {skill.damage}</span>}
                        {skill.heal && <span className="text-green-400">HEAL: {skill.heal}</span>}
                        <span className="text-muted italic mt-1 leading-tight">{skill.description}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PARTICLES */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: p.y, x: p.x, scale: 0.5, rotate: Math.random() * 20 - 10 }}
            animate={{ opacity: 0, y: p.y - 120, x: p.x + (Math.random() * 40 - 20), scale: 1.5, rotate: Math.random() * 40 - 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`fixed font-black text-4xl font-mono ${p.color} pointer-events-none z-[9999] drop-shadow-xl`}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ==========================================
// 6. TILT CARD (With Targeting Brackets)
// ==========================================
export function TiltCard({ children, className, index = "01" }: { children: React.ReactNode, className?: string, index?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const xPos = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const yPos = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    x.set(xPos)
    y.set(yPos)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const rotateX = useTransform(y, [-1, 1], [4, -4])
  const rotateY = useTransform(x, [-1, 1], [-4, 4])

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1500 }}
      className="w-full h-full cursor-none relative group/card"
    >
      <div className="absolute -inset-4 border-2 border-primary/0 group-hover/card:border-primary/30 transition-colors duration-500 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary opacity-0 group-hover/card:opacity-100 transition-opacity" />
         <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary opacity-0 group-hover/card:opacity-100 transition-opacity" />
         <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary opacity-0 group-hover/card:opacity-100 transition-opacity" />
         <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary opacity-0 group-hover/card:opacity-100 transition-opacity" />
      </div>

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`relative w-full h-full bg-secondary border border-muted/20 clip-angled-tl group overflow-hidden z-10 ${className}`}
      >
        <Plus className="absolute top-2 right-2 w-4 h-4 text-foreground/20" />
        <Plus className="absolute bottom-2 left-2 w-4 h-4 text-foreground/20" />
        <Plus className="absolute bottom-2 right-2 w-4 h-4 text-foreground/20" />

        <div className="absolute top-0 left-0 w-full h-1 bg-primary scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out z-20" />

        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 border-[2px] border-dashed border-muted/20 rounded-full pointer-events-none group-hover:border-primary/20 transition-colors duration-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-14 left-14 w-24 h-24 border border-muted/20 rounded-full pointer-events-none group-hover:border-cyan-500/20 transition-colors duration-500"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        />

        <div className="absolute -bottom-10 -right-4 text-[12rem] font-teko text-foreground/[0.02] font-black z-0 pointer-events-none group-hover:text-foreground/[0.04] transition-colors duration-500">
          {index}
        </div>

        <div style={{ transform: "translateZ(30px)" }} className="w-full h-full relative z-10 p-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==========================================
// 7. SCROLL EXP BAR (Tactical Laser)
// ==========================================
export function ScrollExpBar({ progress }: { progress: any }) {
  return (
    <div className="fixed top-0 left-0 w-full z-[100] pointer-events-none">
      <div className="h-[4px] w-full bg-background relative">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(255,70,85,0.8)]"
          style={{ width: useTransform(progress, [0, 1], ["0%", "100%"]) }}
        >
           <div className="absolute right-0 top-0 w-2 h-full bg-white animate-pulse" />
        </motion.div>
      </div>
    </div>
  )
}
