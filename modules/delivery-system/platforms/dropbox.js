// Dropbox Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class DropboxHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "Dropbox delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new DropboxHandler();
