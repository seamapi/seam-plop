import test from "ava"
import { readFile } from "fs/promises"
import { execSync } from "child_process"
import recursiveReadir from "recursive-readdir"
import rmfr from "rmfr"

async function dirToTree(dir) {
  const filePaths = await recursiveReadir(dir)
  const obj = {}
  for (const filePath of filePaths) {
    if (filePath.includes("node_modules/")) continue
    const fileContent = (await readFile(filePath, "utf8")).toString()
    obj[filePath] = fileContent
  }
  return obj
}

const commands = [
  `ava-config`,
  `gitignore`,
  `prettierrc yes`,
  "node-pg-migrate",
  "github-ci-test no",
  "github-ci-test yes",
  "github-ci-vercel-deploy",
  "github-ci-release no",
  "github-ci-release yes",
  "tsconfig",
]

test("snapshot for a bunch of commands", async (t) => {
  for (const cmd of commands) {
    try {
      await rmfr("./test-output")
      execSync(
        `mkdir -p ./test-output && cd ./test-output && echo '{ "name": "some-package" }' > package.json && npx plop --plopfile ../plopfile.js --cwd $(pwd) --dest $(pwd) ${cmd}`,
        {
          shell: true,
        }
      )
      const fileTree = await dirToTree("./test-output")
      t.snapshot(
        `${Object.entries(fileTree)
          .map(([fp, fc]) => [fp.replace("test-output/", ""), fc])
          .filter(([fp]) => fp !== "yarn.lock")
          .filter(([fp, content]) => {
            // Filter out package.json unless it's been modified
            if (fp !== "package.json") return true

            const packageJSON = JSON.parse(content)
            // If it has more than just the "name", it's been modified
            if (Object.keys(packageJSON).length > 1) return true
            return false
          })
          .map(
            ([filePath, fileContent]) =>
              `\n\n\n// ${filePath}\n\n${fileContent}`
          )
          .join("")}`.trim(),
        `seam-plop ${cmd}`
      )
      await rmfr("./test-output")
    } catch (e) {
      t.fail(
        `Command failed "${cmd}"\n${e.toString()}\nstdout:${e.stdout?.toString()}\nstderr:${e.stderr?.toString()}`
      )
    }
  }
})
