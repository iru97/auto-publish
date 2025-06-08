// Telegram Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class TelegramHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "Telegram delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new TelegramHandler();
