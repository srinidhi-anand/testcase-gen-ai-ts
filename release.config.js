module.exports = {
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',        // analyze commits
    '@semantic-release/release-notes-generator', 
    ['@semantic-release/changelog', {
      changelogFile: 'CHANGELOG.md',
    }],
    ['@semantic-release/npm', {
      npmPublish: true,
    }],
    ['@semantic-release/git', {
      assets: ['CHANGELOG.md', 'package.json', 'docs/**'],
      message: 'chore(release): ${nextRelease.version} [skip ci]',
    }],
    '@semantic-release/github',
  ],
};
