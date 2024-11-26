--- 
name: "Dependency update"
about: 'Update a dependency to a newer version that requires code changes'
title: 'Update  from  to'
labels: ['dependencies', 'Tech Debt :hammer_and_wrench:']
assignees: ''
body:
- type: input
  id: dependency-name
  attributes:
    label: Name
    description: "Name of the dependency"
    placeholder: "dependency-name"
  validations:
    required: true
- type: input
  id: current-version
  attributes:
    label: From
    description: "Current version"
    placeholder: "from"
  validations:
    required: true
- type: input
  id: newer-version
  attributes:
    label: To
    description: "Newer version"
    placeholder: "to"
  validations:
    required: true
- type: markdown
  id: additional-context
  attributes:
    label: Additional context
    description: "Steps broken in the pipeline or any identified issues."
--- 

**Update checklist:**
- [ ] Dependency removed in all ignore lists of `.github/dependabot.yml`.
- [ ] Check any reference to the dependency in the resolutions section of `package.json`.
- [ ] The dependency is no longer needed.
