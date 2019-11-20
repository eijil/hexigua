import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from '@rollup/plugin-replace';
import { uglify } from 'rollup-plugin-uglify';

const extensions = [
    '.ts', '.tsx'
];

export default {

    input: [
        './src/game.ts'
    ],

    output: {
        file: './dist/game.js',
        name: 'MyGame',
        format: 'umd',
        sourcemap: false,
        intro: 'var global = window;'
    },

    plugins: [

        replace({
            'typeof CANVAS_RENDERER': JSON.stringify(true),
            'typeof WEBGL_RENDERER': JSON.stringify(true),
            'typeof EXPERIMENTAL': JSON.stringify(true),
            'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
            'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
            'typeof FEATURE_SOUND': JSON.stringify(true)
        }),

        resolve({
            extensions
        }),

        commonjs({
            include: [
                'node_modules/eventemitter3/**',
                'node_modules/phaser/**'
            ],
            exclude: [ 
                'node_modules/phaser/src/polyfills/requestAnimationFrame.js'
            ],
            sourceMap: false,
            ignoreGlobal: true
        }),

        //  Used here instead of .babelrc so it applies to external modules, too.
        babel({
            extensions,
            comments: false,
            presets: [
                "@babel/preset-env",
                "@babel/preset-typescript",
            ],
            plugins: [
                "@babel/proposal-class-properties",
                "@babel/proposal-object-rest-spread"
            ]
        }),

        uglify({
            mangle: false
        })

    ]
};