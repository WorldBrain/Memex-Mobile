const fs = require('fs')
const path = require('path')

const EXTERNAL_DIR_PATH = path.join(__dirname, 'external')

function getExternalPackageNames() {
    const topLevelDirs = fs.readdirSync(EXTERNAL_DIR_PATH)

    const externalPackageNames = []
    for (let topLevelDir of topLevelDirs) {
        if (topLevelDir.charAt(0) === '@') {
            const namespaceDirPath = path.join(EXTERNAL_DIR_PATH, topLevelDir)
            const packageDirs = fs.readdirSync(namespaceDirPath)
            for (let packageDir of packageDirs) {
                externalPackageNames.push([topLevelDir, packageDir].join('/'))
            }
        } else {
            externalPackageNames.push(topLevelDir)
        }
    }

    return externalPackageNames
}

function isTypescriptPackage(packageName) {
    const packageDirPath = path.join(EXTERNAL_DIR_PATH, packageName)
    const tsDirPath = path.join(packageDirPath, 'ts')
    return fs.existsSync(tsDirPath)
}

function getAliases() {
    const aliases = {
        dist: './dist',
    }

    for (const packageName of getExternalPackageNames()) {
        if (isTypescriptPackage(packageName)) {
            Object.assign(aliases, {
                [`^${packageName}$`]: `./external/${packageName}/ts`,
                [`^${packageName}/lib(.+)$`]: `./external/${packageName}/ts\\1`,
            })
        } else if (packageName === 'react-native-simple-peer') {
            aliases['react-native-simple-peer'] =
                './external/react-native-simple-peer'
        }
    }

    return aliases
}

module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        'transform-inline-environment-variables',
        [
            'inline-import',
            {
                extensions: ['.md', '.text', '.txt'],
            },
        ],
        [
            'module-resolver',
            {
                // root: ["./src/"],
                alias: getAliases(),
            },
        ],
        '@babel/plugin-proposal-async-generator-functions',
    ],
}
