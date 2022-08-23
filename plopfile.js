import prettier from "prettier"
import { execSync } from "child_process"
import fs from "fs"

const getPrettierTransform = (parser) => (template, data, cfg) => {
  console.log({ template, data, cfg })
  return prettier.format(template, { semi: false, parser })
}

export default (
  /** @type {import('plop').NodePlopAPI} */
  plop
) => {
  plop.setActionType("install-deps", async (answers, config, plop) => {
    if (answers.runInstall || answers.runInstall !== undefined) {
      if (config.devDependencies && config.devDependencies.length > 0) {
        const execLine = `yarn add --dev ${config.devDependencies.join(" ")}`
        console.log(`Running "${execLine}"`)
        execSync(execLine, { shell: true })
      }
      if (config.dependencies && config.dependencies.length > 0) {
        const execLine = `yarn add ${config.dependencies.join(" ")}`
        console.log(`Running "${execLine}"`)
        execSync(execLine, { shell: true })
      }
    }
  })

  plop.setGenerator("ava-config", {
    description: "Create ava.config.js",
    prompts: [],
    actions: () => {
      const packageJSON = JSON.parse(fs.readFileSync("./package.json"))
      const isESM = packageJSON.type === "module"

      return [
        {
          type: "add",
          path: "./ava.config.js",
          templateFile: "./plop-templates/ava.config.js.hbs",
          data: { isESM },
          transform: getPrettierTransform("babel"),
        },
      ]
    },
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
        transform: getPrettierTransform("yaml"),
      },
    ],
  })

  plop.setGenerator("github-ci-git", {
    description: "Create Github CI Release System with Semantic Release",
    prompts: [
      {
        name: "internal",
        type: "confirm",
        message: "Is this an internal module (@seamapi/*)?",
        default: true,
      },
      {
        name: "runInstall",
        type: "confirm",
        message: "Do you want to install semantic-release dependency?",
        default: true,
      },
    ],
    actions: () => {
      const packageJSON = JSON.parse(fs.readFileSync("./package.json"))
      const isESM = packageJSON.type === "module"

      return [
        {
          type: "add",
          path: "./.github/workflows/npm-semantic-release.yml",
          templateFile: "./plop-templates/github-release.yml.hbs",
          transform: getPrettierTransform("yaml"),
        },
        {
          type: "add",
          path: "./release.config.js",
          templateFile: "./plop-templates/release-config.js.hbs",
          data: { isESM },
          transform: getPrettierTransform("babel"),
        },
        {
          type: "install-deps",
          devDependencies: [
            "@semantic-release/commit-analyzer",
            "@semantic-release/release-notes-generator",
            "@semantic-release/npm",
            "@semantic-release/git",
          ],
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
      ]
    },
  })

  plop.setGenerator("github-ci-vercel-deploy", {
    description: "Setup Vercel Deployments",
    prompts: [
      {
        name: "migrate",
        type: "confirm",
        message:
          "Do you want to migrate the production database before deploy?",
        default: false,
      },
    ],
    actions: [
      {
        type: "add",
        path: "./.github/vercel-deploy.yml",
        templateFile: "./plop-templates/vercel-deploy.yml.hbs",
        transform: getPrettierTransform("yaml"),
      },
    ],
  })

  plop.setGenerator("prettierrc", {
    description: "Create Prettier Config & Install Prettier",
    prompts: [
      {
        name: "runInstall",
        type: "confirm",
        message: "Do you want to install prettier dependency?",
        default: true,
      },
    ],
    actions: [
      {
        type: "add",
        path: "./.prettierrc",
        template: `{ "semi": false }`,
        transform: getPrettierTransform("json"),
      },
      {
        type: "install-deps",
        devDependencies: ["prettier"],
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
    prompts: [
      {
        name: "runInstall",
        type: "confirm",
        message: "Do you want to install the dependencies?",
        default: true,
      },
    ],
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
        devDependencies: [
          "node-pg-migrate",
          "pg-connection-from-env",
          "chalk",
          "debug",
        ],
        dependencies: ["zapatos", "pg"],
      },
    ],
  })

  plop.setGenerator("tsconfig", {
    description: "Create TypeScript Config",
    prompts: [],
    actions: [
      {
        type: "add",
        path: "./tsconfig.json",
        templateFile: "./plop-templates/tsconfig.json.hbs",
        transform: getPrettierTransform("json"),
      },
    ],
  })
}
