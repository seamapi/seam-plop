export default (plop) => {
  plop.setGenerator("ava-config", {
    description: "Create ava.config.js",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "./ava.config.js",
        templateFile: "./plop-templates/ava.config.hbs",
      },
    ],
  })

  plop.setGenerator("github-ci-test", {
    description: "Create Github CI Test",
    prompts: [
      {
        type: "confirm",
        message: "Start postgres in workflow?",
        default: false,
      },
    ],
    actions: [
      {
        type: "add",
        path: "./.github/workflows/npm-test.yml",
        templateFile: "./plop-templates/github-test.hbs",
      },
    ],
  })

  plop.setGenerator("github-ci-release", {
    description: "Create Github CI Release System with Semantic Release",
    prompts: [
      {
        name: "internal",
        type: "confirm",
        message: "Is this an internal module (@seamapi/*)?",
        default: true,
      },
    ],
    actions: [
      {
        type: "add",
        path: "./.github/workflows/npm-semantic-release.yml",
        templateFile: "./plop-templates/github-release.yml.hbs",
      },
      {
        type: "add",
        path: "./release.config.js",
        templateFile: "./plop-templates/release-config.js.hbs",
      },
      // add repository + deps
      // {
      //   type: "modify",
      //   path: "./package.json",
      //   transform: {},
      // },
    ],
  })

  plop.setGenerator("github-ci-vercel-deploy", {
    description: "Setup Vercel Deployments",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "./.github/vercel-deploy.yml",
        templateFile: "./plop-templates/vercel-deploy.hbs",
      },
    ],
  })

  plop.setGenerator("prettierrc", {
    description: "Create Prettier Config",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "./.prettierrc",
        template: `{ "semi": false }`,
      },
    ],
  })

  plop.setGenerator("gitignore", {
    description: "Create .gitignore file",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "./.prettierrc",
        templateFile: "./plop-templates/gitignore.hbs",
      },
    ],
  })
}
