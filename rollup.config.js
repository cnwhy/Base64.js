import typescript from 'rollup-plugin-typescript';
import pkg from './package.json'

export default [
	{
		input: 'Base64.ts',
		plugins: [
			typescript({
				target: 'ES2015',
				module: 'ES2015'
			})
		],
		output: [
			{
				file: pkg.module,
				// file: outDir + 'Base64.es.js',
				format: 'es'
			},
			{
				file: pkg.main,
				// file: outDir + 'Base64.umd.js',
				name: 'Base64',
				format: 'umd'
			}
		]
	}
];
