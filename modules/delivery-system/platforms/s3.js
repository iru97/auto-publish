// AWS S3 Platform Handler
// Placeholder implementation - will be fully implemented when external platforms are needed

class S3Handler {
  async upload(content, config, platformConfig) {
    throw new Error(
      "S3 delivery not implemented yet. Use local delivery for testing first."
    );
  }
}

module.exports = new S3Handler();
