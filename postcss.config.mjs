const config = {
  plugins: [
    "@tailwindcss/postcss",
    ...(process.env.NODE_ENV === 'production' ? [
      [
        'cssnano',
        {
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
            minifySelectors: true,
            minifyFontValues: true,
            minifyParams: true,
            colormin: true,
            convertValues: true,
            discardDuplicates: true,
            discardEmpty: true,
            discardOverridden: true,
            discardUnused: true,
            mergeIdents: true,
            mergeLonghand: true,
            mergeRules: true,
            minifyGradients: true,
            normalizeCharset: true,
            normalizeDisplayValues: true,
            normalizePositions: true,
            normalizeRepeatStyle: true,
            normalizeString: true,
            normalizeTimingFunctions: true,
            normalizeUnicode: true,
            normalizeUrl: true,
            orderedValues: true,
            reduceIdents: true,
            reduceInitial: true,
            reduceTransforms: true,
            svgo: true,
            uniqueSelectors: true,
          }],
        },
      ],
    ] : []),
  ],
};

export default config;
