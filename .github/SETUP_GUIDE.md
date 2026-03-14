# GitHub Actions Setup Guide - Admin Panel

Quick guide to get your admin panel CI/CD workflow up and running.

## ✅ What's Included

The following files have been created:

1. **`.github/workflows/ci.yml`** - CI workflow for building and testing
2. **`.github/workflows/README.md`** - Detailed workflow documentation
3. **`README.md`** - Updated with CI badge and project info

## 🚀 Getting Started

### Step 1: Initialize Git Repository (if not already done)

```bash
cd /Users/superbkibbles/Documents/projects/groceries/groceries-admin

# Initialize git if not already done
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit with GitHub Actions CI"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `groceries-admin`
3. **Don't** initialize with README (you already have one)

### Step 3: Push to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/groceries-admin.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Verify Workflow

1. Go to your repository on GitHub
2. Click the **"Actions"** tab
3. You should see the "Admin Panel CI" workflow
4. It will run automatically on the next push or PR

## 📊 What the CI Does

On every pull request and push to main:

✅ **Installs dependencies** - Ensures all packages are available  
✅ **Runs ESLint** - Checks code quality  
✅ **Builds the app** - Verifies the Next.js build works  
✅ **Runs tests** - Executes any tests (if present)  
✅ **Uploads artifacts** - Saves build output for review  

## 🧪 Test the Workflow

Create a test PR to see it in action:

```bash
# Create a test branch
git checkout -b test-ci

# Make a small change
echo "# CI Test" >> TEST.md
git add TEST.md
git commit -m "Test CI workflow"

# Push and create PR
git push origin test-ci
```

Then create a pull request on GitHub and watch the workflow run!

## 🔧 Configuration

### Environment Variables

The workflow uses these environment variables during build:

- `NEXT_PUBLIC_API_URL`: Set to `http://localhost/api/v1`

To add more, edit `.github/workflows/ci.yml`:

```yaml
- name: Build application
  run: npm run build
  env:
    NEXT_PUBLIC_API_URL: http://localhost/api/v1
    NEXT_PUBLIC_OTHER_VAR: value
```

### For Production Deployment

When deploying to production, set the correct API URL:

```yaml
env:
  NEXT_PUBLIC_API_URL: http://37.156.107.164/api/v1
```

## 🔗 Integration with Backend

Your backend and admin panel work together:

- **Backend repo**: Has its own CI that builds the Go API
- **Admin repo**: Has this CI that builds the Next.js app
- **Deployment**: Both will be deployed together on your VPS

The backend proxy setup (port 80) routes:
- `/api/v1/*` → Backend API
- `/admin/*` → Admin Panel (Next.js)

## 🐛 Troubleshooting

### Build Fails with Dependencies Error

```bash
# Regenerate package-lock.json
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

### Linting Errors

```bash
# Fix linting issues locally
npm run lint -- --fix

# Commit fixes
git add .
git commit -m "Fix linting issues"
git push
```

### TypeScript Errors

```bash
# Check TypeScript errors locally
npm run build

# Fix errors in your code
# Then commit and push
```

## 📈 Next Steps

1. ✅ Push code to GitHub
2. ✅ Verify CI passes
3. 🔄 Set up automatic deployment (see deployment guide)
4. 🚀 Deploy to VPS at 37.156.107.164

## 📚 Additional Resources

- [Workflow README](.github/workflows/README.md) - Detailed documentation
- [Backend Setup Guide](https://github.com/superbkibbles/groceries-backend/.github/SETUP_GUIDE.md) - Backend CI setup
- [GitHub Actions Docs](https://docs.github.com/en/actions)

## ✨ Success Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] CI badge shows "passing" in README
- [ ] Pull requests trigger automated builds
- [ ] Build completes successfully

Happy coding! 🎉

