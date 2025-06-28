export default {
  port: process.env.PORT || 1337,
  models: {
    'llama3-8b': {
      provider: 'huggingface',
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      temperature: 0.7,
      maxTokens: 1024
    }
  }
}
