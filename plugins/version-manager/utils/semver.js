/**
 * Semantic Versioning Parser and Utilities
 * Based on Semantic Versioning 2.0.0 (https://semver.org/)
 */

class SemVer {
  /**
   * Parse version string
   * @param {string} version - Version string (e.g., "1.2.3")
   * @returns {Object} Parsed version object
   */
  static parse(version) {
    const cleanVersion = version.replace(/^v/, '');
    const parts = cleanVersion.split('.');

    if (parts.length !== 3) {
      throw new Error(`Invalid version format: ${version}`);
    }

    const [major, minor, patch] = parts.map(p => {
      const num = parseInt(p, 10);
      if (isNaN(num)) {
        throw new Error(`Invalid version number: ${p}`);
      }
      return num;
    });

    return { major, minor, patch, original: version };
  }

  /**
   * Increment version based on type
   * @param {string} version - Current version (e.g., "1.2.3")
   * @param {string} type - Increment type: "major", "minor", or "patch"
   * @returns {string} Next version (e.g., "2.0.0", "1.3.0", "1.2.4")
   */
  static increment(version, type) {
    const v = this.parse(version);

    switch (type.toLowerCase()) {
      case 'major':
        return `v${v.major + 1}.0.0`;
      case 'minor':
        return `v${v.major}.${v.minor + 1}.0`;
      case 'patch':
        return `v${v.major}.${v.minor}.${v.patch + 1}`;
      default:
        throw new Error(`Invalid increment type: ${type}`);
    }
  }

  /**
   * Compare two versions
   * @param {string} v1 - First version
   * @param {string} v2 - Second version
   * @returns {number} -1 (v1 < v2), 0 (v1 == v2), 1 (v1 > v2)
   */
  static compare(v1, v2) {
    const version1 = this.parse(v1);
    const version2 = this.parse(v2);

    if (version1.major !== version2.major) {
      return version1.major > version2.major ? 1 : -1;
    }
    if (version1.minor !== version2.minor) {
      return version1.minor > version2.minor ? 1 : -1;
    }
    if (version1.patch !== version2.patch) {
      return version1.patch > version2.patch ? 1 : -1;
    }
    return 0;
  }

  /**
   * Suggest version increment type based on changes
   * @param {Object} changes - Change analysis result
   * @param {boolean} changes.hasBreakingChanges - Has breaking changes
   * @param {boolean} changes.hasNewFeatures - Has new features
   * @param {boolean} changes.hasBugFixes - Has bug fixes
   * @returns {string} Suggested increment type
   */
  static suggestIncrementType(changes) {
    if (changes.hasBreakingChanges) {
      return 'major';
    } else if (changes.hasNewFeatures) {
      return 'minor';
    } else if (changes.hasBugFixes) {
      return 'patch';
    }
    return 'patch'; // Default to patch for releases with no clear changes
  }

  /**
   * Validate version string
   * @param {string} version - Version string to validate
   * @returns {boolean} True if valid
   */
  static isValid(version) {
    try {
      this.parse(version);
      return true;
    } catch {
      return false;
    }
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SemVer;
}
