import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import { terser } from 'rollup-plugin-terser';
// import es3 from 'rollup-plugin-es3'
import pkg from './package.json';

let banner = `/*!
 * ${pkg.name}  v${pkg.version}
 * Homepage ${pkg.homepage}
 * License ${pkg.license}
 */
`;

let minOpts = {
	output: {
		preamble: banner
	}
};

export default [
	{
		input: './src/Base64.ts',
		plugins: [
			typescript({
				target: 'ES2015',
				module: 'ES2015',
				removeComments: true
			})
		],
		output: [
			{
				file: pkg.module,
				// file: outDir + 'Base64.es.js',
				format: 'es',
				banner: banner
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
				format: 'umd'
			}
		]
	},
	{
		input: './src/Base64.ts',
		plugins: [
			typescript({
				target: 'ES2015',
				module: 'ES2015',
				removeComments: true
			}),
			terser(minOpts)
		],
		output: [
			{
				file: pkg.module.replace(/\.js$/, '.min.js'),
				format: 'es',
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
			uglify(minOpts)
		],
		output: [
			{
				file: pkg.main.replace(/\.js$/, '.min.js'),
				name: 'Base64',
				format: 'umd'
			}
		]
	}
];
