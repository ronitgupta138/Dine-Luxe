# Contributing to Dine Luxe

Thank you for your interest in contributing to **Dine Luxe**! This document outlines guidelines for issues, branching, and pull requests.

---

## 🛠️ Development Workflow

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ronitgupta138/dine-luxe.git
   cd dine-luxe
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   # or npm install
   ```

3. **Branching Conventions**:
   - `feat/<feature-name>`: New features (table layout, KDS views, billing)
   - `fix/<bug-name>`: Bug fixes (lock release, race condition fixes)
   - `docs/<doc-topic>`: Documentation updates
   - `test/<test-suite>`: Concurrency or integration test additions

4. **Running Tests**:
   Ensure all tests pass before submitting changes:
   ```bash
   npm test
   ```

---

## 📝 Pull Request Guidelines

- **Commit Message Format**: Follow conventional commits (`feat:`, `fix:`, `docs:`, `test:`).
- **Verification**: Ensure all builds, typechecks, and tests pass cleanly.
- **Concurrency Checks**: Changes touching reservation endpoints must verify mutex lock safety and transactional rollbacks.

---

## ⚖️ License
By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
