const {globSync} = require('node:fs');

const entries = globSync('./src/**/*.ts').map(file => ({
	filePath: `${__dirname}/${file}`,
	libraries: {
		inlinedLibraries: ['@oscarpalmer/atoms'],
	},
	noCheck: true,
	outFile: `${__dirname}/types/${file.replace('src/', '').replace('.ts', '.d.cts')}`,
}));

module.exports = {
	entries,
	compilationOptions: {
		preferredConfigPath: `${__dirname}/tsconfig.json`,
	},
};
