import { ActivityType, Client, Collection, Command, GatewayIntentBits, InteractionType } from "discord.js";
import { readdirSync, existsSync, mkdir } from "fs";
import { logger } from "./components/logger";
import { hostname, type, version } from "os";
import { filename } from "./components/const";
import { DBGlobal } from "./components/database";
import path from "path";
import "./components/scheduler";
import moment from "moment";

export const client = new Client({ intents: [GatewayIntentBits.Guilds] });

export const commands: Collection<unknown, Command> = new Collection();
const commandsPath = path.join(__dirname, "commands");

for (const folder of readdirSync(commandsPath)) {
      const files = readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith(".js"));
      for (const file of files) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const command = require(path.join(commandsPath, folder, file));
            commands.set(command.data.name, command);
      }
}

const tempFolder = path.join(__dirname, "temp");
if (!existsSync(tempFolder)) {
      logger.info("Temp directory doesn't exist!", { file: filename(__filename) });
      mkdir(tempFolder, error => {
            if (error) return logger.error(error);
            logger.info("Made temp directory!", { file: filename(__filename) });
      });
}

client.once("ready", () => {
      logger.info("▬▬ι═══════ﺤ Edgy Loba is now online -═══════ι▬▬", { file: filename(__filename) });
      logger.info(`Hostname: ${hostname} | Environment: ${process.env.NODE_ENV} | Version: ${process.env.npm_package_version} | OS: ${type} ${version}`, { file: filename(__filename) });

      const duration = moment(client.uptime as number).format("H [hrs], m [mins]");
      const presences = [
            { type: 3, name: `${client.guilds.cache.size} servers!` },
            { type: 1, name: `${client.guilds.cache.size} servers!` },
            { type: 2, name: `${client.guilds.cache.size} servers!` },
            { type: 3, name: `uptime ${duration}` },
            { type: 2, name: "/help" },
            { type: 2, name: "/about" },
            { type: 1, name: `version ${process.env.npm_package_version}` },
      ];

      if (process.env.NODE_ENV == "production") {
            client.user?.setPresence({ activities: [{ name: `${client.guilds.cache.size} servers!`, type: ActivityType.Playing }], status: "online" });
            setInterval(() => {
                  const presence = presences[Math.floor(Math.random() * presences.length)];
                  client.user?.setPresence({ activities: [{ name: `${presence.name}`, type: presence.type }], status: "online" });
            }, 600000);
      }
      else {
            client.user?.setPresence({ activities: [{ name: "Internal build!" }], status: "dnd" });
      }
});

client.on("interactionCreate", async interaction => {
      if (interaction.type === InteractionType.ApplicationCommand) {
            const command = commands.get(interaction.commandName);

            if (!command) return;

            try {
                  if (interaction.commandName == "bug") {
                        await command.execute(interaction);
                        logger.info(`[${interaction.user.username}] used [/${interaction.commandName}] in [${interaction.guild?.name}].`, { command: interaction.commandName, discordId: interaction.user.id, serverId: interaction.guild?.id, file: filename(__filename) });
                        return;
                  }
                  const deferredReply = await interaction.deferReply({ fetchReply: true });
                  const dateNow = Date.now();
                  await command.execute(interaction);
                  logger.info(`[${interaction.user.username}] used [/${interaction.commandName}] in [${interaction.guild?.name}]. Bot response time: ${interaction.createdTimestamp - dateNow}ms`, { command: interaction.commandName, discordId: interaction.user.id, serverId: interaction.guild?.id, file: filename(__filename), responseTime: interaction.createdTimestamp - dateNow });
            }
            catch (error) {
                  await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            }
      }

      if (interaction.type == InteractionType.ModalSubmit) {
            if (interaction.customId === "bugReport") {
                  const commandInput = interaction.fields.getTextInputValue("commandInput");
                  const messageInput = interaction.fields.getTextInputValue("messageInput");

                  await new DBGlobal().addBug(interaction.user.id, interaction.guildId as string, commandInput, messageInput);
                  interaction.reply({ content: "Bug reported!", ephemeral: true });
            }
      }
});

client.login(process.env.DISCORD_TOKEN);