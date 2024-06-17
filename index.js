import axios from "axios";
import input from "input";
import inquirer from "inquirer";
import readline from "readline";
import chalk from "chalk";

let session;

let sessionBlum = 0;
let sessionTickets = 0;

(async () => {
  session = await input.text("Введите ваш токен: ");
  menu();
})();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const keypress = async () => {
  console.log(chalk.yellow("Нажмите любую кнопку, чтобы продолжить..."));
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      rl.close();
      resolve();
    });
  });
};

const mainMenu = [
  {
    type: "list",
    name: "menu",
    message: chalk.green("Выберите действие:"),
    choices: [
      "Просмотреть Blum баланс",
      "Узнать кол-во билетов",
      "Запустить фармилку",
      "Данные о текущей сессии",
      new inquirer.Separator(),
      "Выход",
    ],
  },
];

async function getBalance() {
  try {
    const response = await axios.get(
      "https://game-domain.blum.codes/api/v1/user/balance",
      {
        headers: {
          Authorization: session,
        },
      }
    );
    console.log(
      chalk.cyan(`Ваш баланс: ${parseFloat(response.data.availableBalance)}`)
    );
  } catch (err) {
    console.error(chalk.red(err));
  }
  await keypress();
  menu();
}

async function getTickets() {
  try {
    const response = await axios.get(
      "https://game-domain.blum.codes/api/v1/user/balance",
      {
        headers: {
          Authorization: session,
        },
      }
    );
    console.log(chalk.cyan(`Билетов на аккаунте: ${response.data.playPasses}`));
  } catch (err) {
    console.error(chalk.red(err));
  }
  await keypress();
  menu();
}

async function startFarming() {
  try {
    let rounds = await input.text("Введите кол-во повторений: ");
    console.log(chalk.yellow("Запускаем фарм..."));
    for (let i = 0; i < rounds; i++) {
      console.log(chalk.yellow(`Запускаем повторение #${i + 1}`));
      let { gameId } = (
        await axios.post(
          "https://game-domain.blum.codes/api/v1/game/play",
          {},
          {
            headers: { Authorization: session },
          }
        )
      ).data;
      const before = await axios.get(
        "https://game-domain.blum.codes/api/v1/user/balance",
        {
          headers: {
            Authorization: session,
          },
        }
      );
      console.log(chalk.cyan(`Игра создана. Game ID: ${gameId}`));
      console.log(chalk.yellow("Собираем BLUM, это займет 30 сек."));
      await sleep(30500);
      await axios.post(
        "https://game-domain.blum.codes/api/v1/game/claim",
        {
          gameId,
          points: 280,
        },
        {
          headers: {
            Authorization: session,
          },
        }
      );
      const after = await axios.get(
        "https://game-domain.blum.codes/api/v1/user/balance",
        {
          headers: {
            Authorization: session,
          },
        }
      );
      sessionTickets--;
      sessionBlum +=
        parseFloat(after.data.availableBalance) -
        parseFloat(before.data.availableBalance);

      console.log(
        chalk.green(
          `Старый баланс: ${parseFloat(
            before.data.availableBalance
          )}\tНовый баланс: ${parseFloat(
            after.data.availableBalance
          )}\tРазница: ${
            parseFloat(after.data.availableBalance) -
            parseFloat(before.data.availableBalance)
          }`
        )
      );
    }
    await keypress();
    menu();
  } catch (err) {
    console.error(chalk.red(err));
  }
}

async function getSessionInfo() {
  console.log(chalk.greenBright(`BLUM полученых за сессию: ${sessionBlum}`));
  console.log(
    chalk.yellowBright(`Тикетов, потраченных за сессию: ${sessionTickets}`)
  );
  await keypress();
  menu();
}

function handleMenuSelection(answer) {
  switch (answer.menu) {
    case "Просмотреть Blum баланс":
      getBalance();
      break;
    case "Узнать кол-во билетов":
      getTickets();
      break;
    case "Запустить фармилку":
      startFarming();
      break;
    case "Данные о текущей сессии":
      getSessionInfo();
      break;
    case "Выход":
      console.log(chalk.yellow("Выход из программы"));
      process.exit();
      break;
    default:
      console.log(chalk.red("Неизвестная опция"));
      menu();
  }
}

function menu() {
  console.clear();
  console.log(
    chalk.yellow(" _____ __    _____ _____    _____ _____ _____ _____ _____ ")
  );
  console.log(
    chalk.yellow("| __  |  |  |  |  |     |  | __  |     | __  |     |_   _|")
  );
  console.log(
    chalk.yellow("| __ -|  |__|  |  | | | |  |    -|  |  | __ -|  |  | | |  ")
  );
  console.log(
    chalk.yellow("|_____|_____|_____|_|_|_|  |__|__|_____|_____|_____| |_|  ")
  );
  console.log();
  inquirer.prompt(mainMenu).then(handleMenuSelection);
}
