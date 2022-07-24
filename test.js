import test from "ava"
import { readFile } from "fs/promises"
import { execSync } from "child_process"
import recursiveReadir from "recursive-readdir"
import rmfr from "rmfr"

async function dirToTree(dir) {
  const filePaths = await recursiveReadir(dir)
  const obj = {}
  for (const filePath of filePaths) {
    const fileContent = (await readFile(filePath, "utf8")).toString()
    obj[filePath] = fileContent
  }
  return obj
}

const commands = [
  `ava-config`,
  `gitignore`,
  `prettierrc`,
  "node-pg-migrate",
  "github-ci-test no",
  "github-ci-test yes",
  "github-ci-vercel-deploy",
  "github-ci-release no",
  "github-ci-release yes",
]

test("snapshot for a bunch of commands", async (t) => {
  for (const cmd of commands) {
    try {
      await rmfr("./test-output")
      execSync(
        `mkdir -p ./test-output && yarn init -y --cwd ./test-output && npx plop --plopfile ./plopfile.js --dest ./test-output ${cmd}`,
        {
          shell: true,
        }
      )
      t.snapshot(await dirToTree("./test-output"), `seam-plop ${cmd}`)
      await rmfr("./test-output")
    } catch (e) {
      t.fail(
        `Command failed "${cmd}"\n${e.toString()}\nstdout:${e.stdout?.toString()}\nstderr:${e.stderr?.toString()}`
      )
    }
  }
})
