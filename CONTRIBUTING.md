# Contributions are warmly welcome

If you want to contribute, please follow this guideline.

## Steps

1. You need to install [Node.js](https://nodejs.org/en/download) and [Hugo](https://gohugo.io/installation/).
2. Fork this project.
3. Clone your fork to your PC.
4. Install dependencies, run command: `$ npm ci`
5. Create a new branch for your contributions
6. Write your code. Some helping commands:
   * Build page: `npm run build`. The built page will be `/src/public/index.html`.
   * Run local Hugo server to monitor your changes in real-time as you write code: `npm run start-server`
7. Test your code with command `$ npm test`. It should pass, otherwise fix the errors. Some commands available for
   automatic fix of errors:
   * For ESLint (JS): `$ npm run lint:fix`
   * For Stylelint (CSS): `$ npm run stylelint:fix`
   * For Markdown: `$ npm run markdown:fix`
8. Commit your changes and open PR.

### Useful links

* GitHub
  Guide: [Contributing to projects. Learn how to contribute to a project through forking.](https://docs.github.com/en/get-started/quickstart/contributing-to-projects)
  Useful if you're not familiar with GitHub forking yet.
* [Hugo manual](https://gohugo.io/documentation/)
