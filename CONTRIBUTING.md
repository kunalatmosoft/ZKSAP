# Contributing to ZKSAP

First off, thank you for considering contributing to ZKSAP! It’s people like you that make decentralized identity more secure and accessible for everyone.

By participating in this project, you agree to abide by our code of conduct and the mathematical standards set forth in our specification.

---

## 🛡️ Security Vulnerability Reporting

**Please do not open a public issue for security vulnerabilities.**

If you discover a potential security flaw in the ZKSAP protocol or its implementation, please email Kunal Singh directly at [YOUR_EMAIL@DOMAIN.COM]. We follow a coordinated disclosure model to ensure users are protected before a vulnerability is made public.

---

## 🛠️ How Can I Contribute?

### 1. Mathematical Improvements
ZKSAP relies on Ed25519 and BIP-39. If you find a more efficient way to handle scalar multiplication, or if you identify a risk in our deterministic derivation logic, please submit a research-backed PR.

### 2. Implementation & Features
We are always looking to improve:
* **Storage Adapters:** Adding support for different databases (Postgres, MongoDB) or decentralized storage (IPFS).
* **WebAuthn Integration:** Moving private keys from IndexedDB to hardware-backed Secure Enclaves.
* **UI/UX:** Enhancing the "Recovery" and "Mnemonic Reveal" user experience.

---

## 📝 Pull Request Guidelines

1.  **Branching:** Create a new branch for every feature or bug fix (`git checkout -b feature/amazing-feature`).
2.  **Testing:** Any changes to the `lib/crypto` files must include unit tests verifying that derived keys remain consistent across versions.
3.  **Documentation:** Update the `README.md` if your change alters the ZKSAP mathematical workflow.
4.  **Formatting:** We use Prettier and ESLint. Please ensure your code passes linting before submission.

---

## ⚖️ License

By contributing to ZKSAP, you agree that your contributions will be licensed under the project's **MIT License**.

---

**Happy Coding!** — Kunal Singh