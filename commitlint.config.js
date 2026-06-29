/**
 * @fileoverview commitlint 配置 - 强约束 Angular/Conventional Commits 提交规范
 * @see https://commitlint.js.org/reference/rules.html
 * 格式：type(scope): subject
 * type 可选：feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
    ],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100]
  }
}
