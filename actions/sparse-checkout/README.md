# sparse-checkout

Like checkout action but with sparse checkout

## Usage

<!-- start usage -->
```yaml
- uses: xivart/actions/actions/sparse-checkout@v0
  with:
    # Write a set of patterns to the sparse-checkout file.
    # required: true
    patterns: |
      /path/to/dir
      /path/to/file
    # The repository to check out.
    # required: false
    repository:
    # The ref to checkout. If this is a branch name, the action will use the latest commit on the branch.
    # required: false
    ref:
    # The token
    # required: false
    token:
    # The path to checkout to.
    # required: false
    path:
    # Use the partial clone feature and request that the server sends a subset of reachable objects according to a given object filter.
    # required: false
    filter:
```
<!-- end usage -->
