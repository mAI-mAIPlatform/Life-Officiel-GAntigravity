export const lifePassLevels = Array.from({ length: 50 }, (_, i) => {
    const level = i + 1;
    let rewardName = `${level * 50} m's`;
    let type = 'credits';
    let value = level * 50;

    if (level === 1) {
        rewardName = "Starter Pack"; type = "item"; value = "pack_start";
    } else if (level % 10 === 0) {
        rewardName = `Skin Épique Lvl ${level}`; type = "skin"; value = `skin_epic_${level}`;
    } else if (level % 5 === 0) {
        rewardName = "XP Mega Boost"; type = "boost"; value = "xp_boost";
    } else if (level === 50) {
        rewardName = "Moto Légendaire (Asset 50)"; type = "vehicle"; value = "asset_50";
    }

    return {
        level: level,
        requiredXp: level * 1000,
        reward: {
            name: rewardName,
            type: type,
            value: value
        }
    };
});
