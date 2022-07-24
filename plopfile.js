inquirer.registerPrompt("directory", require("inquirer-directory"))

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

  plop.setGenerator("node-pg-migrate", {
    description: "Initialize node-pg-migrate in project",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "src/scripts/reset-db.ts",
        template: `import resetDb from "lib/reset-db"\n\nresetDb()`,
      },
      {
        type: "add",
        path: "src/scripts/migrate-db.ts",
        template: `import migrateDb from "lib/migrate-db"\n\nmigrateDb()`,
      },
      {
        type: "add",
        path: "src/lib/db/migrate-db.ts",
        templateFile: "./plop-templates/migrate-db.ts.hbs",
      },
      {
        type: "add",
        path: "src/lib/db/reset-db.ts",
        templateFile: "./plop-templates/reset-db.ts.hbs",
      },
      {
        type: "modify",
        path: "./package.json",
        transform: (template, data, cfg) => {
          const pkg = JSON.parse(template)
          pkg.scripts["db:create-migration"] =
            "node-pg-migrate --migration-file-language ts -m src/db/migrations create"
          pkg.scripts["db:migrate"] = "esr src/scripts/migrate-db.ts"
          pkg.scripts["db:reset"] = "esr src/scripts/reset-db.ts"
          return JSON.stringify(pkg, null, 2)
        },
      },
      // TODO Install node-pg-migrate
    ],
  })
}
