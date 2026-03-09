When committing code:

1. Analyze the full git diff.
2. Split changes into logical commits.
3. Each commit must represent ONE concern:
   - refactor
   - feature
   - fix
   - tests
   - formatting
4. Stage only related files for each commit.
5. Never create a single large commit if changes are unrelated.
6. Always use `git commit --verbose` to include a detailed commit message.
7. Use `git commit --amend` to fix mistakes in the last commit.
8. Use `git rebase` to clean up commit history before pushing.
9. Use `git push --force-with-lease` to push changes after rebasing.
10. Always pull latest changes before starting work.
11. Use English for commit messages.
