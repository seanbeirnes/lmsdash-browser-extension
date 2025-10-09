import * as fs from "node:fs";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";

const manifest = JSON.parse(fs.readFileSync("manifest.json"));

const isProduction = process.env.NODE_ENV === 'production';

export default {
	input: 'src/ContentScript/main.js',
	output: {
		file: 'dist/src/ContentScript/index.js',
		format: 'iife'
	},
    plugins: [replace({
			'process.env.NODE_ENV': () => isProduction ? JSON.stringify('production') : JSON.stringify('development'),
			__dirname: (id) => isProduction ? `''` : `'${id}'`,
			__app_version: () => `'${manifest.version}'`,
			__app_description: () => `'${manifest.description}'`,
			preventAssignment: true
		}),
        typescript({
          tsconfig: './tsconfig.json'
        }),
			isProduction && terser()]
};