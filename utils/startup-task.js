const { execFile } = require("child_process");
const fs = require("fs");

const TASK_NAME = "AchievementsAutoStart";

const pathAutostartFile = `${process.env.HOME}/.config/autostart/git.jokerverse.achievements.desktop`;

function runSchtasks(args) {
  return new Promise((resolve, reject) => {
    const child = execFile(
      "schtasks.exe",
      args,
      { windowsHide: true },
      (err, stdout) => (err ? reject(err) : resolve(stdout))
    );
  });
}

async function hasStartupTask() {
  if (process.platform === "win32") {
  try {
    await runSchtasks(["/Query", "/TN", TASK_NAME]);
    return true;
  } catch {
    return false;
  }
 }
 else {
  return fs.existsSync(pathAutostartFile);
 }
}

async function createStartupTask(commandLine) {
  if (process.platform === "win32") {
    await runSchtasks([
      "/Create",
      "/TN",
      TASK_NAME,
      "/TR",
      commandLine,
      "/SC",
      "ONLOGON",
      "/RL",
      "HIGHEST",
      "/F",
    ]);
  }
  else {
    const desktop = `\
[Desktop Entry]
Type=Application
Exec=${commandLine}
Hidden=false
NoDisplay=false
Name=Achievements
Icon=${fs.realpathSync("resources/icon.png")}
Comment=Monitors running games and displays animated notifications
`
    fs.writeFileSync(pathAutostartFile, desktop, "utf8");
  }
}

async function deleteStartupTask() {
  if (process.platform === "win32") {
    await runSchtasks(["/Delete", "/TN", TASK_NAME, "/F"]);
  }
  else {
    fs.rmSync(pathAutostartFile)
  }
}

module.exports = { hasStartupTask, createStartupTask, deleteStartupTask };
