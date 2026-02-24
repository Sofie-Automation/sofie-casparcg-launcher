import path from 'path'

export function getExeDir() {
	return process.env.PORTABLE_EXECUTABLE_DIR || process.cwd()
}

export function getAbsolutePath(path1, path2) {
	if (path.isAbsolute(path2)) {
		return path2
	}
	return path.join(path1, path2)
}

export function getBasePath(config) {
	return getAbsolutePath(getExeDir(), config.get('basePath', './'))
}

export function getLogsPath(config) {
	return getAbsolutePath(getBasePath(config), config.get('logsPath') || 'logs/')
}
