--- 
name: "Dependency update"
about: 'Update a dependency to a newer version that requires code changes'
title: 'Update  from  to'
labels: ['dependencies', 'Tech Debt :hammer_and_wrench:']
assignees: ''
--- 

**Dependency update**

`dependency-name` from `current-version` to `newer-version`

**Additional context**

Steps broken in the pipeline or any identified issues.

**Update checklist:**
- [ ] Dependency removed in all ignore lists of `.github/dependabot.yml`.
- [ ] Check any reference to the dependency in the resolutions section of `package.json`.
- [ ] The dependency is no longer needed.
