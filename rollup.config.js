import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

let banner = `/*!
 * ${pkg.name}  v${pkg.version}
 * Homepage ${pkg.homepage}
 * License ${pkg.license}
 */
`;

let minOpts = {
	output: {
		preamble: banner,
		comments: false
	}
};

export default [
	{
		input: './src/main.ts',
		plugins: [
			typescript({
				target: 'ES2015',
				module: 'ES2015',
				removeComments: true,
				sourceMap: true
			})
		],
		output: [
			{
				file: pkg.module,
				// file: outDir + 'Base64.es.js',
				format: 'es',
				banner: banner,
				sourcemap: true
			}
			// {
			// 	file: pkg.main,
			// 	// file: outDir + 'Base64.umd.js',
			// 	name: 'Base64',
			// 	format: 'umd'
			// }
		]
	},
	{
		input: pkg.module,
		plugins: [
			babel({
				babelrc: false,
				presets: [['@babel/env', { targets: 'ie 6' }]]
			})
			// es3()
		],
		output: [
			{
				file: pkg.main,
				name: 'Base64',
				format: 'umd',
				sourcemap: true
			}
		]
	},
	{
		input: './src/main.ts',
		plugins: [
			typescript({
				target: 'ES2015',
				module: 'ES2015',
				removeComments: true,
				sourceMap: true
			}),
			terser(minOpts)
		],
		output: [
			{
				file: pkg.module.replace(/\.mjs$/, '.min.mjs'),
				format: 'es',
				sourcemap: true
			}
		]
	},
	{
		input: pkg.module,
		plugins: [
			babel({
				babelrc: false,
				presets: [['@babel/env', { targets: 'ie 6' }]]
			}),
			terser(minOpts)
		],
		output: [
			{
				file: pkg.main.replace(/\.js$/, '.min.js'),
				name: 'Base64',
				format: 'umd',
				sourcemap: true
			}
		]
	}
];
