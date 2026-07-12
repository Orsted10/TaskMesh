export const calculateExpForLevel = (level: number) => {
  if (level <= 1) return 0;
  // EXP required for Level N = 100 * (1.15 ^ (N - 1))
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export const getProgressToNextLevel = (totalExp: number, currentLevel: number) => {
  const expForCurrentLevel = calculateExpForLevel(currentLevel);
  const expForNextLevel = calculateExpForLevel(currentLevel + 1);
  
  const expIntoCurrentLevel = totalExp - expForCurrentLevel;
  const expRequiredForNextLevel = expForNextLevel - expForCurrentLevel;
  
  const progressPercentage = Math.min(100, Math.max(0, (expIntoCurrentLevel / expRequiredForNextLevel) * 100));
  
  return {
    expIntoCurrentLevel,
    expRequiredForNextLevel,
    progressPercentage,
  };
}
