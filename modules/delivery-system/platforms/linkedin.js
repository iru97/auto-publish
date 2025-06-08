// LinkedIn Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class LinkedInHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "LinkedIn delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new LinkedInHandler();
