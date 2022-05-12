const Discord = require("discord.js");
const { getUserExists, deleteUserData } = require("../../database/db");
require("dotenv").config();

async function makeUnlinkEmbed(userID) {
	return await getUserExists(userID).then(result => {
		if (result == true) {
			deleteUserData(userID);
			const embed = new Discord.MessageEmbed()
				.setTitle("IGN has been successfully unlinked!")
				.setColor("#e3a600");
			return embed;
		}
		const embed = new Discord.MessageEmbed()
			.setTitle("You don't have any linked IGN-s!")
			.setDescription("You can link your username: **>link [Apex IGN] [PC | xbox | playstation | switch]**")
			.setColor("#e3a600");
		return embed;

	}).catch(error => {
		const embed = new Discord.MessageEmbed()
			.setTitle("Error")
			.setDescription(error)
			.setColor("#e3a600");
		return Promise.reject(embed);
	});

}

module.exports = {
	makeUnlinkEmbed,
};