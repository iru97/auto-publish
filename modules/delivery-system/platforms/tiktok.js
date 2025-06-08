// TikTok Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class TikTokHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "TikTok delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new TikTokHandler();
