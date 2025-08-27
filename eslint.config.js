import antfu from '@antfu/eslint-config'

export default antfu({

}).removeRules(
  'regexp/no-unused-capturing-group',
  'regexp/no-misleading-capturing-group',
  'test/no-only-tests',
)
