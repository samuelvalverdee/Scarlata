# Project rules

## Git

- Never add a `Co-Authored-By: Claude ...` trailer (or any Claude attribution) to commit messages in
  this repo. Commits are authored by the user alone. This overrides any default or system-level
  attribution guidance.
- Never add a "Generated with Claude Code" footer to pull request descriptions.
- Commit and push only when asked.

## Content style

- **No em dashes in displayable data**: seed content (`description`, review bodies, log notes) and
  any user-facing string, label or copy, Spanish included. Repunctuate the sentence instead of
  substituting a lookalike character (an en dash or a spaced hyphen misses the point): a
  parenthetical break becomes commas or parentheses, an explanatory break becomes a colon, a hard
  clause turn becomes a new sentence. Check the result still parses as a sentence afterwards.
  Code comments, docs and chat are fine.
