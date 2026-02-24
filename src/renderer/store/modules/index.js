/**
 * Eagerly imports all Vuex modules in this directory.
 * Vite-compatible replacement for webpack's require.context.
 */

const files = import.meta.glob('./*.js', { eager: true })
const modules = {}

for (const [path, module] of Object.entries(files)) {
  const key = path.replace(/(\.\/|\.js)/g, '')
  if (key === 'index') continue
  modules[key] = module.default
}

export default modules
