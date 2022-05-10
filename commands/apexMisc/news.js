const axios = require("axios");
const Discord = require("discord.js");
require("dotenv").config();

async function getData() {
	const URI = `${process.env.ALS_ENDPOINT}/news?auth=${process.env.ALS_TOKEN}`;
	return await axios.get(encodeURI(URI))
		.then(function(response) {
			return response;
		}).catch(error => {
			const embed = new Discord.MessageEmbed()
				.setColor("#e3a600");
			switch (error.response.status) {
			case 400:
				embed.setTitle("Something went wrong.");
				embed.setDescription("Try again in a few minutes.");
				return Promise.reject(embed);
			case 403:
				embed.setTitle("Unauthorized / Unknown API key.");
				embed.setDescription("The bot might be worked on at this moment. If this continues to happen report it with /bug.");
				return Promise.reject(embed);
			case 404:
				embed.setTitle("Player could not be found.");
				embed.setDescription("If this continues to happen check that you are using your origin username or report the bug with /bug.");
				return Promise.reject(embed);
			case 405:
				embed.setTitle("External API error.");
				embed.setDescription("Try again in a few seconds.");
				return Promise.reject(embed);
			case 410:
				embed.setTitle("Unknown platform provided.");
				embed.setDescription("If this continues to happen report it as a bug with /bug");
				return Promise.reject(embed);
			case 429:
				embed.setTitle("API Rate limit reached.");
				embed.setDescription("Try again in a few seconds.");
				return Promise.reject(embed);
			case 500:
				embed.setDescription("API Internal error.");
				return Promise.reject(embed);
			}
		});
}

async function shortenUrl(link) {
	const URI = `${process.env.BITLY_ENDPOINT}/v4/shorten`;
	return await axios.post(encodeURI(URI), { "long_url": link }, { headers:{ "Authorization": `Bearer ${process.env.BITLY_TOKEN}` } })
		.then(result => {
			return result;
		});
}

async function makeNewsEmbed() {
	return await getData().then(async result => {

		const linkToShorten = async _ => {
			const embed = new Discord.MessageEmbed()
				.setTitle("Latest news")
				.setColor("#e3a600");

			for (let i = 0; i < result.data.length; i++) {
				if (i == 3) {
					break;
				}

				result.data[i].link = (await shortenUrl(result.data[i].link)).data.link;
				embed.addField(`${i + 1}. ` + result.data[i].title, result.data[i].short_desc + "\n **Link: " + result.data[i].link + "**", true);
			}
			return embed;
		};

		return await linkToShorten();
	}).catch(error => {
		return Promise.reject(error);
	});
}

module.exports = {
	makeNewsEmbed,
};