module.exports = (client, message) => {
    if(message.channel.type === 'dm' || message.author.bot) return;
    message.reply('123');
}