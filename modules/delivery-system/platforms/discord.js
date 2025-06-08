// Discord Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class DiscordHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "Discord delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new DiscordHandler();
