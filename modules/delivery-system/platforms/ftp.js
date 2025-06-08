// FTP Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class FTPHandler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "FTP delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new FTPHandler();
