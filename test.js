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
        `mkdir -p ./test-output && cd ./test-output && git init && yarn init -y && git add . && git commit -m 'initial' && npx plop --plopfile ../plopfile.js --cwd $(pwd) --dest $(pwd) ${cmd}`,
        {
          shell: true,
        }
      )
      const fileTree = await dirToTree("./test-output")
      for (const filePath in fileTree) {
        if (filePath.startsWith("test-output/.git/")) {
          delete fileTree[filePath]
        }
      }
      const packageJSONDiff = execSync(
        "cd test-output && git diff package.json"
      )
        .toString()
        .trim()
      t.snapshot(
        `${
          packageJSONDiff ? `package.json changes:\n\n${packageJSONDiff}` : ""
        }${Object.entries(fileTree)
          .map(([fp, fc]) => [fp.replace("test-output/", ""), fc])
          .filter(([fp]) => fp !== "package.json")
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
