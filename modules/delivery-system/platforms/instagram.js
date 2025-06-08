// Instagram Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class InstagramHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "Instagram delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new InstagramHandler();
