const Discord = require("discord.js");
const { getTopGuildUsers } = require("../../database/db");
const { UIDToIGN } = require("../../moduels/UIDToIGN");
require("dotenv").config();

const client = new Discord.Client();

async function fetchUser(id) {
	return await client.users.fetch(id).then(result => {
		return result;
	});
}

async function getData(guildID) {
	return await getTopGuildUsers(guildID).then(result => {
		return result;
	}).catch(error => {
		return Promise.reject(error);
	});
}

async function makeTopEmbed(guildID) {
	return await getData(guildID).then(async result => {
		const embed = new Discord.MessageEmbed()
			.setTitle("Leaderboard")
			.setColor("#e3a600")
			.setTimestamp()
			.setFooter("Top 10", "https://cdn.discordapp.com/avatars/719542118955090011/82a82af55e896972d1a6875ff129f2f7.png?size=256");

		const discordIDToName = async _ => {
			for (let i = 0; i < result.length; i++) {
				const fetch = await fetchUser(result[i].discordID);
				result[i].IGN = await UIDToIGN(result[i].originUID, result[i].platform);
				result[i].discordName = fetch.username;
				result[i].discordDiscriminator = fetch.discriminator;
				result[i].discordImg = fetch.avatarURL();
				embed.addField((i + 1) + ". " + result[i].IGN + " / " + result[i].discordName + "#" + result[i].discordDiscriminator, "RP: " + result[i].RP, false);
			}

			embed.setThumbnail(result[0].discordImg);

			return embed;
		};

		const embed_1 = await discordIDToName();
		return embed_1;

	}).catch(error => {
		if (error == 404) {
			const embed = new Discord.MessageEmbed()
				.setTitle("No user data!")
				.setDescription("No user data has been recorded for this server!")
				.setColor("#e3a600")
				.setTimestamp()
				.setFooter("Error page", "https://cdn.discordapp.com/avatars/719542118955090011/82a82af55e896972d1a6875ff129f2f7.png?size=256");
			return Promise.reject(embed);
		}
		return Promise.reject(error);
	});
}

module.exports = {
	makeTopEmbed,
};