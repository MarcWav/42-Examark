const path = require('node:path');

// APPIMAGE points to the original file, outside the temporary mounted AppDir.
// The archive carries a marker beside the executable instead.
function portableDirectory({platform, env, executable, packaged, hasMarker}) {
 if (platform === 'win32') return env.PORTABLE_EXECUTABLE_DIR || null;
 if (platform !== 'linux' || !packaged) return null;
 if (env.APPIMAGE && path.isAbsolute(env.APPIMAGE)) return path.dirname(env.APPIMAGE);
 if (hasMarker) return path.dirname(executable);
 return null;
}
module.exports = {portableDirectory};
