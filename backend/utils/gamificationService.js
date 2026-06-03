const User = require('../models/User');

const BADGES = [
  { name: 'Profile Complete', icon: '🌟', description: 'Fully completed your profile.', requiredLevel: 1 },
  { name: 'First Application', icon: '🚀', description: 'Applied for your first job.', requiredLevel: 1 },
  { name: 'Active Sleuth', icon: '🔥', description: 'Logged in for 7 consecutive days.', requiredLevel: 2 },
  { name: 'Interview Ready', icon: '🎤', description: 'Received your first interview invite.', requiredLevel: 3 },
  { name: 'Top Talent', icon: '🏆', description: 'Reached Level 5.', requiredLevel: 5 },
];

const RANKS = [
  { minXP: 0, name: 'Initiate' },
  { minXP: 500, name: 'Job Seeker' },
  { minXP: 1500, name: 'Rising Talent' },
  { minXP: 3000, name: 'Pro Sleuth' },
  { minXP: 6000, name: 'Elite Candidate' },
  { minXP: 10000, name: 'Market Legend' },
];

const addExperience = async (userId, xpAmount, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'CANDIDATE') return;

    user.gamification.experience += xpAmount;

    // Calculate level (1 level per 500 XP)
    const newLevel = Math.floor(user.gamification.experience / 500) + 1;
    let levelUp = false;

    if (newLevel > user.gamification.level) {
      user.gamification.level = newLevel;
      levelUp = true;
    }

    // Determine Rank
    let newRank = RANKS[0].name;
    for (const rank of RANKS) {
      if (user.gamification.experience >= rank.minXP) {
        newRank = rank.name;
      }
    }
    user.gamification.rank = newRank;

    // Award Badges based on level
    for (const badge of BADGES) {
      if (user.gamification.level >= badge.requiredLevel) {
        const hasBadge = user.gamification.badges.some(b => b.name === badge.name);
        if (!hasBadge && badge.name === 'Top Talent') { // Example logic for level badge
          user.gamification.badges.push({
            name: badge.name,
            icon: badge.icon,
            description: badge.description,
            earnedAt: new Date()
          });
        }
      }
    }

    await user.save();

    // Create a notification if they leveled up
    if (levelUp) {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: user._id,
        type: 'SYSTEM_ALERT',
        title: 'Level Up!',
        message: `Congratulations! You reached Level ${newLevel} and earned the rank of ${newRank}.`,
      });
    }

    return { success: true, levelUp, newLevel, newRank };
  } catch (error) {
    console.error('Gamification Service Error:', error);
  }
};

const awardBadge = async (userId, badgeName) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const badgeDef = BADGES.find(b => b.name === badgeName);
    if (!badgeDef) return;

    const hasBadge = user.gamification.badges.some(b => b.name === badgeName);
    if (hasBadge) return; // Already has badge

    user.gamification.badges.push({
      name: badgeDef.name,
      icon: badgeDef.icon,
      description: badgeDef.description,
      earnedAt: new Date()
    });

    // Award XP for getting a badge
    user.gamification.experience += 100;

    await user.save();

    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: user._id,
      type: 'SYSTEM_ALERT',
      title: 'New Badge Unlocked!',
      message: `You earned the "${badgeDef.name}" badge! +100 XP`,
    });

  } catch (error) {
    console.error('Gamification Badge Error:', error);
  }
};

const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const lastActive = new Date(user.gamification.lastActive);
    
    // Check difference in days
    const diffTime = Math.abs(now - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      user.gamification.streak += 1;
      
      if (user.gamification.streak === 7) {
        await awardBadge(userId, 'Active Sleuth');
      }
    } else if (diffDays > 1) {
      // Streak broken
      user.gamification.streak = 1;
    }

    user.gamification.lastActive = now;
    await user.save();

  } catch (error) {
    console.error('Gamification Streak Error:', error);
  }
};

module.exports = {
  addExperience,
  awardBadge,
  updateStreak
};
