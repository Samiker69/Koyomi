const GuildSettingsRepository = require('./GuildSettingsRepository');
const ModerationRepository = require('./ModerationRepository');
const TagsRepository = require('./TagsRepository');
const StarboardRepository = require('./StarboardRepository');
const FamilyRepository = require('./FamilyRepository');
const RoleMenuRepository = require('./RoleMenuRepository');
const LogAnalyzerRepository = require('./LogAnalyzerRepository');
const DisabledCommandRepository = require('./DisabledCommandRepository');

module.exports = {
    getSettings: (...args) => GuildSettingsRepository.getSettings(...args),
    updateSetting: (...args) => GuildSettingsRepository.updateSetting(...args),
    addServer: (...args) => GuildSettingsRepository.addServer(...args),
    removeServer: (...args) => GuildSettingsRepository.removeServer(...args),
    getBannedRoleId: (...args) => GuildSettingsRepository.getBannedRoleId(...args),

    addModCase: (...args) => ModerationRepository.addModCase(...args),
    getModCase: (...args) => ModerationRepository.getModCase(...args),
    getTargetModCases: (...args) => ModerationRepository.getTargetModCases(...args),
    getServerModCases: (...args) => ModerationRepository.getServerModCases(...args),
    getUserWarnings: (...args) => ModerationRepository.getUserWarnings(...args),
    updateModCaseReason: (...args) => ModerationRepository.updateModCaseReason(...args),
    updateModCaseEvidenceUrl: (...args) => ModerationRepository.updateModCaseEvidenceUrl(...args),
    updateModCaseLogMessageId: (...args) => ModerationRepository.updateModCaseLogMessageId(...args),
    deleteModCase: (...args) => ModerationRepository.deleteModCase(...args),

    getTag: (...args) => TagsRepository.getTag(...args),
    addTag: (...args) => TagsRepository.addTag(...args),
    editTag: (...args) => TagsRepository.editTag(...args),
    getTagsByServer: (...args) => TagsRepository.getTagsByServer(...args),
    removeTag: (...args) => TagsRepository.removeTag(...args),

    getStarboardSettings: (...args) => StarboardRepository.getStarboardSettings(...args),
    updateStarboardSetting: (...args) => StarboardRepository.updateStarboardSetting(...args),
    isMessageOnStarboard: (...args) => StarboardRepository.isMessageOnStarboard(...args),
    getStarboardMessageId: (...args) => StarboardRepository.getStarboardMessageId(...args),
    addStarboardEntry: (...args) => StarboardRepository.addStarboardEntry(...args),
    deleteStarboardEntry: (...args) => StarboardRepository.deleteStarboardEntry(...args),

    getMarriage: (...args) => FamilyRepository.getMarriage(...args),
    marry: (...args) => FamilyRepository.marry(...args),
    divorce: (...args) => FamilyRepository.divorce(...args),
    adoptChild: (...args) => FamilyRepository.adoptChild(...args),
    abandonChild: (...args) => FamilyRepository.abandonChild(...args),
    leaveParents: (...args) => FamilyRepository.leaveParents(...args),
    getChildren: (...args) => FamilyRepository.getChildren(...args),
    getParents: (...args) => FamilyRepository.getParents(...args),
    getSiblings: (...args) => FamilyRepository.getSiblings(...args),
    getFamily: (...args) => FamilyRepository.getFamily(...args),
    getFullFamilyTree: (...args) => FamilyRepository.getFullFamilyTree(...args),
    isAncestor: (...args) => FamilyRepository.isAncestor(...args),
    isDescendant: (...args) => FamilyRepository.isDescendant(...args),

    addRoleMenu: (...args) => RoleMenuRepository.addRoleMenu(...args),
    getRoleMenu: (...args) => RoleMenuRepository.getRoleMenu(...args),
    deleteRoleMenu: (...args) => RoleMenuRepository.deleteRoleMenu(...args),
    getAllRoleMenus: (...args) => RoleMenuRepository.getAllRoleMenus(...args),

    getLogAnalyzerConfig: (...args) => LogAnalyzerRepository.getLogAnalyzerConfig(...args),
    getUnsupportedMods: (...args) => LogAnalyzerRepository.getUnsupportedMods(...args),
    getBannedMods: (...args) => LogAnalyzerRepository.getBannedMods(...args),
    getModsMapping: (...args) => LogAnalyzerRepository.getModsMapping(...args),
    getAllowedLaunchers: (...args) => LogAnalyzerRepository.getAllowedLaunchers(...args),
    addBannedMod: (...args) => LogAnalyzerRepository.addBannedMod(...args),
    removeBannedMod: (...args) => LogAnalyzerRepository.removeBannedMod(...args),
    addUnsupportedMod: (...args) => LogAnalyzerRepository.addUnsupportedMod(...args),
    removeUnsupportedMod: (...args) => LogAnalyzerRepository.removeUnsupportedMod(...args),
    addAllowedLauncher: (...args) => LogAnalyzerRepository.addAllowedLauncher(...args),
    removeAllowedLauncher: (...args) => LogAnalyzerRepository.removeAllowedLauncher(...args),

    isDisabled: (...args) => DisabledCommandRepository.isDisabled(...args),
    isGuildDisabled: (...args) => DisabledCommandRepository.isGuildDisabled(...args),
    addDisabledCommand: (...args) => DisabledCommandRepository.addDisabledCommand(...args),
    removeDisabledCommand: (...args) => DisabledCommandRepository.removeDisabledCommand(...args),
    getGuildRestrictions: (...args) => DisabledCommandRepository.getGuildRestrictions(...args),
    getUserRestrictions: (...args) => DisabledCommandRepository.getUserRestrictions(...args)
};
