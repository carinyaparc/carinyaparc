import { nextJsConfig } from '@repo/eslint-config/next-js';
import prettier from 'eslint-plugin-prettier';

const eslintConfig = [
  ...nextJsConfig,
  {
    plugins: {
      prettier,
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      'prettier/prettier': 'error',
      'react-hooks/set-state-in-effect': 'off',
      'turbo/no-undeclared-env-vars': [
        'warn',
        {
          allowList: [
            'NODE_ENV',
            'MAILERLITE_API_KEY',
            'NEXT_PUBLIC_GTM_ID',
            'NEXT_RUNTIME',
            'SESSION_SECRET',
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
