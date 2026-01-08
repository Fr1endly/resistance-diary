//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  ...tanstackConfig,
  {
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // React Hooks rules - catches dependency issues
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility rules - catches missing aria-labels
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/html-has-lang': 'warn',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-access-key': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/tabindex-no-positive': 'warn',
    },
  },
]
