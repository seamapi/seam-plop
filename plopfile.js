export default (
  /** @type {import('plop').NodePlopAPI} */
  plop
) => {
  plop.setActionType("install-deps", async (answers, config, plop) => {
    // TODO IMPLEMENT
    console.log(`install-deps not implemented, please manually install...`)
    console.log({
      answers,
      config,
    })
  })

  plop.setGenerator("ava-config", {
    description: "Create ava.config.js",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "./ava.config.js",
        templateFile: "./plop-templates/ava.config.js.hbs",
      },
    ],
  })

  plop.setGenerator("github-ci-test", {
    description: "Create Github CI Test",
    prompts: [
      {
        type: "confirm",
        name: "startPostgres",
        message: "Start postgres in workflow?",
        default: false,
      },
    ],
    actions: [
      {
        type: "add",
        path: "./.github/workflows/npm-test.yml",
        templateFile: "./plop-templates/github-test.yml.hbs",
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
      {
        type: "install-deps",
        devDependencies: ["semantic-release"],
      },
      // add repository
      {
        type: "modify",
        path: "./package.json",
        transform: async (template, data, cfg) => {
          // TODO check that "repository" is set
          // get the correct value using `git remote -v`
          // if no remote, guess based on package.json["name"] e.g.
          // git@github.com:seamapi/package-name.git
          return template
        },
      },
    ],
  })

  plop.setGenerator("github-ci-vercel-deploy", {
    description: "Setup Vercel Deployments",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "./.github/vercel-deploy.yml",
        templateFile: "./plop-templates/vercel-deploy.yml.hbs",
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
        path: "./.gitignore",
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
          console.log({ template, data, cfg })
          const pkg = JSON.parse(template)
          if (!pkg.scripts) pkg.scripts = {}
          pkg.scripts["db:create-migration"] =
            "node-pg-migrate --migration-file-language ts -m src/db/migrations create"
          pkg.scripts["db:migrate"] = "esr src/scripts/migrate-db.ts"
          pkg.scripts["db:reset"] = "esr src/scripts/reset-db.ts"
          return JSON.stringify(pkg, null, 2)
        },
      },
      {
        type: "install-deps",
        devDependencies: ["node-pg-migrate"],
      },
    ],
  })
}
