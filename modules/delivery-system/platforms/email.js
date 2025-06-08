// Email Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class EmailHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "Email delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new EmailHandler();
