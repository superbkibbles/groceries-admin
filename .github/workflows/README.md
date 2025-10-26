# GitHub Actions Workflows - Admin Panel

This directory contains GitHub Actions workflows for automated building and testing of the Groceries Admin Panel.

## Available Workflows

### Admin Panel CI (`ci.yml`)

**Purpose**: Automatically build and test the Next.js admin panel on pull requests and pushes to main.

**Triggers**:
- Pull requests to any branch
- Pushes to the `main` branch

**Jobs**:

1. **build-and-test**: Builds and tests the Next.js application
   - Sets up Node.js 20
   - Installs dependencies with `npm ci`
   - Runs ESLint for code quality
   - Builds the Next.js application
   - Runs tests (if any exist)
   - Uploads build artifacts

2. **build-summary**: Provides a summary of build results

## Setup Requirements

### Prerequisites

No special setup required! The workflow will automatically run when:
- You create a pull request
- You push to the main branch

### Environment Variables

The workflow sets the following environment variables during build:
- `NEXT_PUBLIC_API_URL`: Set to `http://localhost/api/v1` (change if needed)

To add more environment variables, edit the build step in `ci.yml`:

```yaml
- name: Build application
  run: npm run build
  env:
    NEXT_PUBLIC_API_URL: http://localhost/api/v1
    NEXT_PUBLIC_CUSTOM_VAR: your_value
```

## What Gets Checked

### Code Quality
- ✅ ESLint checks for code style and potential errors
- ✅ TypeScript compilation
- ✅ Next.js build validation

### Build Process
- ✅ All dependencies can be installed
- ✅ Application builds without errors
- ✅ Static pages generate correctly
- ✅ No TypeScript errors

## Monitoring Builds

### View Build Status

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. See all workflow runs and their status

### Add Status Badge to README

Add this to your `README.md`:

```markdown
![Admin Panel CI](https://github.com/YOUR_USERNAME/groceries-admin/workflows/Admin%20Panel%20CI/badge.svg)
```

## Troubleshooting

### Build Fails on Dependencies

**Issue**: `npm ci` fails or packages can't be installed

**Solutions**:
- Ensure `package.json` and `package-lock.json` are committed
- Delete `node_modules` locally and run `npm install` to regenerate `package-lock.json`
- Check for platform-specific dependencies

### Next.js Build Fails

**Issue**: Build errors during `npm run build`

**Solutions**:
1. Test build locally first:
   ```bash
   npm run build
   ```
2. Check for:
   - TypeScript errors
   - Import errors
   - Missing environment variables
   - Broken links or image references
3. Review the build logs in GitHub Actions for specific errors

### Linting Errors

**Issue**: ESLint fails with code style issues

**Solutions**:
- Run linting locally: `npm run lint`
- Auto-fix issues: `npm run lint -- --fix`
- Check ESLint configuration in `eslint.config.mjs`

### Environment Variable Issues

**Issue**: Build fails due to missing environment variables

**Solutions**:
1. Add them to the workflow file:
   ```yaml
   - name: Build application
     run: npm run build
     env:
       NEXT_PUBLIC_API_URL: http://localhost/api/v1
       NEXT_PUBLIC_OTHER_VAR: value
   ```
2. For secrets, use GitHub Secrets (Settings → Secrets and variables → Actions)

## Customization

### Change Node.js Version

Edit line 18 in `ci.yml`:
```yaml
node-version: "20"  # Change to your preferred version
```

### Skip Linting

If you don't want to run linting, remove or comment out the linting step:
```yaml
# - name: Run linter
#   run: npm run lint
```

### Add Additional Checks

You can add more steps like:
- Type checking: `npm run type-check`
- Unit tests: `npm run test:unit`
- E2E tests: `npm run test:e2e`

Example:
```yaml
- name: Type check
  run: npm run type-check

- name: Run unit tests
  run: npm run test:unit
```

## Integration with Backend CI

The backend repository's CI workflow is configured to also check out and build this admin panel. Both workflows work together:

- **This workflow**: Runs when you push to the admin repository
- **Backend workflow**: Runs when you push to the backend repository and also builds the admin panel

This ensures:
- Admin panel changes are validated independently
- Backend changes don't break the admin panel integration
- Both can be developed and deployed together

## Local Testing

Before pushing, always test locally:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Build the application
npm run build

# Run tests (if available)
npm test
```

## Best Practices

1. **Always test builds locally** before pushing
2. **Keep dependencies updated** but test before updating major versions
3. **Review failed builds immediately** to catch issues early
4. **Use meaningful commit messages** to understand build history
5. **Don't skip linting fixes** - they prevent bugs

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Node Setup Action](https://github.com/actions/setup-node)

## Success Indicators

You'll know everything is working when:
- ✅ The CI badge shows "passing"
- ✅ Pull requests show green checkmarks
- ✅ Build completes in under 5 minutes
- ✅ No red X marks in the Actions tab
- ✅ Build artifacts are uploaded successfully

Happy coding! 🚀

