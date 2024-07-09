// models/Title.js
class Title {
    constructor(title) {
      this.title = title;
    }
  
    static isValidTitle(title) {
      // Example validation: Title must be a non-empty string
      return typeof title === 'string' && title.trim().length > 0;
    }
  }
  
  module.exports = Title;
  