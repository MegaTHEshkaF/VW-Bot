const commands = require('../data/commands.json');

// Commands builder
module.exports = {
    run: (lang, guild, wikies) => {
        commands.forEach(command => {
            const data = {
                name: command.name,
                description: command.description[lang],
            };

            // 1 lvl options
            if(command.options) {
                data.options = [];
                command.options.forEach((option, optionIndex) => {
                    // console.log(option);
                    data.options[optionIndex] = {
                        name: option.name,
                        description: option.description[lang],
                        type: option.type,
                        required: option.required,
                    }

                    // 2 lvl options
                    if(option.options) {
                        data.options[optionIndex].options = [];
                        option.options.forEach((subOption, subOptionIndex) => {
                            //console.log(subOption);
                            data.options[optionIndex].options[subOptionIndex] = {
                                name: subOption.name,
                                description: subOption.description[lang],
                                type: subOption.type,
                                required: subOption.required,
                            }

                            // 3 lvl options
                            if(subOption.options) {
                                data.options[optionIndex].options[subOptionIndex].options = [];
                                subOption.options.forEach((subSubOption, subSubOptionIndex) => {
                                    // console.log(subSubOption);
                                    data.options[optionIndex].options[subOptionIndex].options[subSubOptionIndex] = {
                                        name: subSubOption.name,
                                        description: subSubOption.description[lang],
                                        type: subSubOption.type,
                                        required: subSubOption.required,
                                    }

                                    // Choices for userinfo wikies
                                    if(subSubOption.choices_special == 'wikies') {
                                        data.options[optionIndex].options[subOptionIndex].options[subSubOptionIndex].choices = [];
                                        wikies.forEach((wiki, wikiIndex) => {
                                            // console.log(wiki);
                                            data.options[optionIndex].options[subOptionIndex].options[subSubOptionIndex].choices[wikiIndex] = {
                                                name: wiki.sitename,
                                                value: wiki.domain,
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
            // console.log(data);
            guild.commands.create(data);
        });
    }
}