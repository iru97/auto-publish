// YouTube Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class YouTubeHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "YouTube delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new YouTubeHandler();
