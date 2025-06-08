// Google Drive Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class DriveHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "Google Drive delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new DriveHandler();
