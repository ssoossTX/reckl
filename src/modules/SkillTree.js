/**
 * SkillTree - Система умений с тремя ветками развития
 */

class SkillTree {
  constructor(player) {
    this.player = player;
    this.skillPoints = 0;
    this.unlockedSkills = new Set();
    this.skillTrees = {
      warrior: this.createWarriorTree(),
      mage: this.createMageTree(),
      rogue: this.createRogueTree()
    };
    this.init();
  }

  init() {
    this.loadSkills();
  }

  /**
   * Создать дерево боевых умений (Воин)
   */
  createWarriorTree() {
    return {
      name: 'Боевая тактика',
      icon: '⚔️',
      color: '#ff4444',
      description: 'Увеличение силы и выживаемости',
      skills: [
        {
          id: 'warrior_1',
          name: 'Основной удар',
          level: 1,
          bonus: { damage: 10 },
          cost: 1,
          description: '+10% к урону',
          requirements: { level: 1 },
          synergyWith: ['warrior_2']
        },
        {
          id: 'warrior_2',
          name: 'Мощный удар',
          level: 2,
          bonus: { damage: 20, crit: 5 },
          cost: 1,
          description: '+20% урона, +5% крита',
          requirements: { skill: 'warrior_1', level: 5 },
          synergyWith: ['warrior_1', 'warrior_3']
        },
        {
          id: 'warrior_3',
          name: 'Боевой клич',
          level: 3,
          bonus: { damage: 30, health: 15 },
          cost: 2,
          description: '+30% урона, +15% здоровья',
          requirements: { skill: 'warrior_2', level: 10 },
          synergyWith: ['warrior_2', 'warrior_4']
        },
        {
          id: 'warrior_4',
          name: 'Неудержимая мощь',
          level: 4,
          bonus: { damage: 50, health: 25, crit: 10 },
          cost: 3,
          description: '+50% урона, +25% здоровья, +10% крита',
          requirements: { skill: 'warrior_3', level: 15 },
          synergyWith: ['warrior_3']
        },
        {
          id: 'warrior_5',
          name: 'Берсерк',
          level: 5,
          bonus: { damage: 80, health: -10, crit: 20 },
          cost: 3,
          description: '+80% урона, +20% крита (но -10% здоровья)',
          requirements: { skill: 'warrior_4', level: 20 },
          synergyWith: ['warrior_4']
        }
      ]
    };
  }

  /**
   * Создать дерево магических умений (Маг)
   */
  createMageTree() {
    return {
      name: 'Магия знаний',
      icon: '🔮',
      color: '#4444ff',
      description: 'Увеличение опыта и магических способностей',
      skills: [
        {
          id: 'mage_1',
          name: 'Магический импульс',
          level: 1,
          bonus: { exp: 10 },
          cost: 1,
          description: '+10% к опыту',
          requirements: { level: 1 },
          synergyWith: ['mage_2']
        },
        {
          id: 'mage_2',
          name: 'Магический поток',
          level: 2,
          bonus: { exp: 20, mana: 5 },
          cost: 1,
          description: '+20% опыта, +5% маны',
          requirements: { skill: 'mage_1', level: 5 },
          synergyWith: ['mage_1', 'mage_3']
        },
        {
          id: 'mage_3',
          name: 'Отражение',
          level: 3,
          bonus: { exp: 30, reflect: 10 },
          cost: 2,
          description: '+30% опыта, +10% отражения урона',
          requirements: { skill: 'mage_2', level: 10 },
          synergyWith: ['mage_2', 'mage_4']
        },
        {
          id: 'mage_4',
          name: 'Архимагия',
          level: 4,
          bonus: { exp: 50, reflect: 20, crit: 8 },
          cost: 3,
          description: '+50% опыта, +20% отражения, +8% крита',
          requirements: { skill: 'mage_3', level: 15 },
          synergyWith: ['mage_3']
        },
        {
          id: 'mage_5',
          name: 'Мастер элементов',
          level: 5,
          bonus: { exp: 80, damage: 30, reflect: 15 },
          cost: 3,
          description: '+80% опыта, +30% урона, +15% отражения',
          requirements: { skill: 'mage_4', level: 20 },
          synergyWith: ['mage_4']
        }
      ]
    };
  }

  /**
   * Создать дерево разбойничьих умений (Разбойник)
   */
  createRogueTree() {
    return {
      name: 'Искусство кража',
      icon: '🗡️',
      color: '#ff9900',
      description: 'Увеличение добычи и удачи',
      skills: [
        {
          id: 'rogue_1',
          name: 'Лазание',
          level: 1,
          bonus: { loot: 10 },
          cost: 1,
          description: '+10% к добыче',
          requirements: { level: 1 },
          synergyWith: ['rogue_2']
        },
        {
          id: 'rogue_2',
          name: 'Быстрые руки',
          level: 2,
          bonus: { loot: 20, dodge: 5 },
          cost: 1,
          description: '+20% добычи, +5% увёртывания',
          requirements: { skill: 'rogue_1', level: 5 },
          synergyWith: ['rogue_1', 'rogue_3']
        },
        {
          id: 'rogue_3',
          name: 'Мастер воровства',
          level: 3,
          bonus: { loot: 35, dodge: 10 },
          cost: 2,
          description: '+35% добычи, +10% увёртывания',
          requirements: { skill: 'rogue_2', level: 10 },
          synergyWith: ['rogue_2', 'rogue_4']
        },
        {
          id: 'rogue_4',
          name: 'Теневой мастер',
          level: 4,
          bonus: { loot: 50, dodge: 15, damage: 20 },
          cost: 3,
          description: '+50% добычи, +15% увёртывания, +20% урона',
          requirements: { skill: 'rogue_3', level: 15 },
          synergyWith: ['rogue_3']
        },
        {
          id: 'rogue_5',
          name: 'Тень ночи',
          level: 5,
          bonus: { loot: 80, dodge: 25, damage: 40, crit: 15 },
          cost: 3,
          description: '+80% добычи, +25% увёртывания, +40% урона, +15% крита',
          requirements: { skill: 'rogue_4', level: 20 },
          synergyWith: ['rogue_4']
        }
      ]
    };
  }

  /**
   * Получить информацию об умении
   */
  getSkill(skillId) {
    for (const tree of Object.values(this.skillTrees)) {
      const skill = tree.skills.find(s => s.id === skillId);
      if (skill) return skill;
    }
    return null;
  }

  /**
   * Проверить, разблокировано ли умение
   */
  isSkillUnlocked(skillId) {
    return this.unlockedSkills.has(skillId);
  }

  /**
   * Разблокировать умение
   */
  unlockSkill(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) return false;

    // Проверяем требования
    if (!this.checkRequirements(skill)) {
      return false;
    }

    // Проверяем стоимость
    if (this.player.points < skill.cost) {
      return false;
    }

    // Разблокируем умение
    this.unlockedSkills.add(skillId);
    this.player.points -= skill.cost;
    
    // Применяем бонусы
    this.applySkillBonuses(skill);
    this.saveSkills();
    
    return true;
  }

  /**
   * Проверить требования для разблокировки умения
   */
  checkRequirements(skill) {
    const reqs = skill.requirements;
    
    // Проверяем уровень
    if (reqs.level && this.player.level < reqs.level) {
      return false;
    }
    
    // Проверяем зависимость от другого умения
    if (reqs.skill && !this.isSkillUnlocked(reqs.skill)) {
      return false;
    }
    
    return true;
  }

  /**
   * Применить бонусы умения к игроку
   */
  applySkillBonuses(skill) {
    const bonus = skill.bonus;
    
    if (bonus.damage) {
      this.player.clickPower *= (1 + bonus.damage / 100);
    }
    if (bonus.health) {
      this.player.maxHealth *= (1 + bonus.health / 100);
    }
    if (bonus.exp) {
      // Бонус к опыту будет применяться при получении опыта
    }
    if (bonus.loot) {
      // Бонус к добыче будет применяться при убийстве врага
    }
  }

  /**
   * Получить всё дерево умений с информацией о разблокировке
   */
  getFullSkillTrees() {
    return Object.entries(this.skillTrees).map(([key, tree]) => ({
      key,
      ...tree,
      skills: tree.skills.map(skill => ({
        ...skill,
        unlocked: this.isSkillUnlocked(skill.id),
        canUnlock: this.canUnlockSkill(skill),
        requirementsMet: this.checkRequirements(skill)
      }))
    }));
  }

  /**
   * Проверить, может ли быть разблокировано умение
   */
  canUnlockSkill(skill) {
    return this.checkRequirements(skill) && this.player.points >= skill.cost;
  }

  /**
   * Получить общий бонус от всех разблокированных умений определённого типа
   */
  getTotalBonus(bonusType) {
    let total = 0;
    
    for (const skillId of this.unlockedSkills) {
      const skill = this.getSkill(skillId);
      if (skill && skill.bonus[bonusType]) {
        total += skill.bonus[bonusType];
      }
    }
    
    return total;
  }

  /**
   * Получить синергию с другими умениями
   */
  getSynergyBonus(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) return 0;
    
    let bonus = 0;
    for (const synergySkillId of skill.synergyWith) {
      if (this.isSkillUnlocked(synergySkillId)) {
        bonus += 5; // +5% бонус за каждое синергизирующееся умение
      }
    }
    
    return bonus;
  }

  /**
   * Сохранить умения
   */
  saveSkills() {
    localStorage.setItem('skillTree', JSON.stringify({
      unlockedSkills: Array.from(this.unlockedSkills)
    }));
  }

  /**
   * Загрузить умения
   */
  loadSkills() {
    const saved = localStorage.getItem('skillTree');
    if (saved) {
      const data = JSON.parse(saved);
      this.unlockedSkills = new Set(data.unlockedSkills || []);
      
      // Переприменяем все бонусы
      for (const skillId of this.unlockedSkills) {
        const skill = this.getSkill(skillId);
        if (skill) {
          this.applySkillBonuses(skill);
        }
      }
    }
  }

  /**
   * Получить статистику древа умений
   */
  getStats() {
    const totalSkills = Object.values(this.skillTrees)
      .reduce((sum, tree) => sum + tree.skills.length, 0);
    
    return {
      unlockedCount: this.unlockedSkills.size,
      totalCount: totalSkills,
      percentUnlocked: Math.round((this.unlockedSkills.size / totalSkills) * 100)
    };
  }
}

export default SkillTree;
