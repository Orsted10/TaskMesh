export const calculateExpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // EXP required for Level N = 100 * (1.15 ^ (N - 1))
  return Math.floor(100 * Math.pow(1.15, level - 1));
};

export const getLevelFromTotalExp = (totalExp: number): number => {
  let level = 1;
  while (calculateExpForLevel(level + 1) <= totalExp) {
    level++;
    if (level >= 100) break;
  }
  return level;
};

export const getTitleForLevel = (level: number): string => {
  if (level >= 80) return 'Ascended AI Overlord';
  if (level >= 60) return 'Ghost Sovereign';
  if (level >= 45) return 'Cybernetics Architect';
  if (level >= 30) return 'Cyber Blade';
  if (level >= 20) return 'Vanguard Specialist';
  if (level >= 10) return 'Tactical Operative';
  if (level >= 5) return 'Initiate Agent';
  return 'Novice';
};

export const getProgressToNextLevel = (totalExp: number, currentLevel?: number) => {
  const level = currentLevel ?? getLevelFromTotalExp(totalExp);
  const expForCurrentLevel = calculateExpForLevel(level);
  const expForNextLevel = calculateExpForLevel(level + 1);
  
  const expIntoCurrentLevel = Math.max(0, totalExp - expForCurrentLevel);
  const expRequiredForNextLevel = Math.max(1, expForNextLevel - expForCurrentLevel);
  
  const progressPercentage = Math.min(100, Math.max(0, (expIntoCurrentLevel / expRequiredForNextLevel) * 100));
  
  return {
    level,
    expIntoCurrentLevel,
    expRequiredForNextLevel,
    progressPercentage,
  };
};
