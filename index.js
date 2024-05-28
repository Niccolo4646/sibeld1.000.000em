const Discord = require("discord.js");
const { Permissions } = require('discord.js');
const { Modal } = require("discord.js");
const { token, GuildId, FooterEmbeds, CategoriaAccount, RingraziamentoAperturaTicket, CategoriaStore, CategoriaSegnalaPlayer, CategoriaBug, CategoriaAppelaBanMute, CategoriaAltro, CategoriaAttesa, CanaleTranscript, RuoloStaff } = require('./config.json');
const { Intents, GatewayIntentBits, Client } = require("discord.js"); 

const intents = new Intents([
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_MEMBERS,
]);

const client = new Client({ intents, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.login(token)

client.on("ready", () => {
    console.log("BOT ONLINE")

    var server = client.guilds.cache.get(GuildId);

    server.commands.create({
        name: "sposta", //fatto
        description: "sposta un ticket",
        options: [
            {
                name: "categoria",
                description: "La categoria dove spostare il ticket",
                type: "CHANNEL",
                required: true
            }
        ]
    }),
    server.commands.create({
        name: "aggiungi",
        description: "Dai l'accesso a un utente nel ticket",
        options: [
            {
                name: "utente",
                description: "Utente a cui si vuole dare l'accesso",
                type: "USER",
                required: true
            }
        ]
    }),
    server.commands.create({
        name: "rimuovi",
        description: "Togli l'accesso a un utente nel ticket",
        options: [
            {
                name: "utente",
                description: "Utente a cui si vuole togliere l'accesso",
                type: "USER",
                required: true
            }
        ]
    }),
    server.commands.create({
        name: "rinomina",
        description: "Rinomina il ticket",
        options: [
            {
                name: "nome",
                description: "Nome che si vuole dare al ticket",
                type: "STRING",
                required: true
            }
        ]
    }),
    server.commands.create({
        name: "claim",
        description: "Claima il ticket"
    })
})

client.on("message", message => {
    if (message.content == "!ticket") {
        message.delete()
        if(message.member.roles.cache.has(RuoloStaff)){ 
        let embed = new Discord.MessageEmbed()
            .setTitle("Supporto")
            .setDescription("\n\n👋 **Hai bisogno di assistenza?**\nNon preoccuparti! **Il nostro staff** è qui per assisterti! 🏝️\nClicca sulla sezione corrispondete al tuo problema. ⬇️")
            .setFooter({ text: FooterEmbeds })
            .setColor("#68D3FF")

        let select = new Discord.MessageSelectMenu()
            .setCustomId("ticket")
            .setPlaceholder("Select a category")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                {
                    label: "Account / Reset Passsword",
                    description: "Per problemi riguardanti l'account.",
                    value: "account",
                    emoji: "👤"
                },
                {
                    label: "Supporto Store / Trasferimenti VIP",
                    description: "Per problemi riguardanti lo store o i pagamenti.",
                    value: "store",
                    emoji: "💸"
                },
                {
                    label: "Segnala Un Player",
                    description: "Se desideri segnalare un giocatore.",
                    value: "player",
                    emoji: "📃"
                },
                {
                    label: "Segnala Un bug",
                    description: "Se desideri segnalare un bug.",
                    value: "bug",
                    emoji: "🖌️"
                },
                {
                    label: "Appella Un Ban / Mute",
                    description: "Se vuoi appellare un ban o un mute.",
                    value: "appella",
                    emoji: "✉️"
                },
                {
                    label: "Altro",
                    description: "Se il problema non riguarda le catorie soprastanti.",
                    value: "altro",
                    emoji: "❕"
                }
            ])

        let row = new Discord.MessageActionRow()
            .addComponents(select)

        message.channel.send({ embeds: [embed], components: [row] })
    }}
})

//LOGICA TICKET SELECT MENU
client.on("interactionCreate", interaction => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId == "ticket") {

        switch (interaction.values[0]) {
            case "account": {
                var server = client.guilds.cache.get(GuildId);

                interaction.reply({ content: "Sto aprendo un ticket", ephemeral: true });
                server.channels.create("account " + interaction.user.username, {
                    type: "text"
                }).then(canale => {
                    canale.setTopic(`User ID: ${interaction.user.id}`);
                    canale.setParent(CategoriaAccount); //Settare la categoria
                    if (canale.type === 'GUILD_TEXT') {
                        // Crea un oggetto 'PermissionOverwriteFlags' per definire le autorizzazioni
                        const permissionOverwrites = [
                            {
                                id: server.id,
                                deny: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: interaction.user.id, // Utilizza interaction.user.id come ID dell'utente
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: RuoloStaff,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                        ];

                        // Utilizza 'permissionOverwrites.edit()' per aggiornare le autorizzazioni del canale
                        canale.permissionOverwrites.set(permissionOverwrites)
                            .then(() => {
                                console.log("aggiornati permessi ticket");
                            })
                            .catch((error) => {
                                console.error('Errore durante la modifica delle autorizzazioni del canale:', error);
                            });
                    } else {
                        console.error('Il canale non è una TextChannel valida.');
                    }
                    canale.send(`<@&`+RuoloStaff+`> <@${interaction.user.id}>`);
                    

                    let bchiudialtro = new Discord.MessageButton()
                        .setLabel("Chiudi")
                        .setStyle("DANGER")
                        .setCustomId("chiudialtro");

                    let brisolto = new Discord.MessageButton()
                        .setLabel("Risolto")
                        .setStyle("SUCCESS")
                        .setCustomId("risoltoaltro");

                    let battesa = new Discord.MessageButton()
                        .setLabel("In attesa")
                        .setStyle("SECONDARY")
                        .setCustomId("attesaaltro");

                    let row = new Discord.MessageActionRow()
                        .addComponents(bchiudialtro, brisolto, battesa);

                    let ebenvenuto = new Discord.MessageEmbed()
                        .setTitle("Benvenuto nell'assistenza!")
                        .setDescription("Benvenuto nell'assistenza del nostro sever! Nell'attesa ti preghiamo di non menzionare lo staff. Ci potrebbero volere fino a 24h per ricevere una risposta.")
                    canale.send({embeds: [ebenvenuto], components: [row]});
                });
            } break;
            case "store": { //head
                var server = client.guilds.cache.get(GuildId);

                interaction.reply({ content: "Sto aprendo un ticket.", ephemeral: true });
                server.channels.create("store " + interaction.user.username, {
                    type: "text"
                }).then(canale => {
                    canale.setTopic(`User ID: ${interaction.user.id}`);
                    canale.setParent(CategoriaStore); //Settare la categoria
                    if (canale.type === 'GUILD_TEXT') {
                        // Crea un oggetto 'PermissionOverwriteFlags' per definire le autorizzazioni
                        const permissionOverwrites = [
                            {
                                id: server.id,
                                deny: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: interaction.user.id, // Utilizza interaction.user.id come ID dell'utente
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: RuoloStaff,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                        ];

                        // Utilizza 'permissionOverwrites.edit()' per aggiornare le autorizzazioni del canale
                        canale.permissionOverwrites.set(permissionOverwrites)
                            .then(() => {
                                console.log("aggiornati permessi ticket");
                            })
                            .catch((error) => {
                                console.error('Errore durante la modifica delle autorizzazioni del canale:', error);
                            });
                    } else {
                        console.error('Il canale non è una TextChannel valida.');
                    }
                    canale.send(`<@&`+RuoloStaff+`> <@${interaction.user.id}>`);
                    

                    let bchiudialtro = new Discord.MessageButton()
                        .setLabel("Chiudi")
                        .setStyle("DANGER")
                        .setCustomId("chiudialtro");

                    let brisolto = new Discord.MessageButton()
                        .setLabel("Risolto")
                        .setStyle("SUCCESS")
                        .setCustomId("risoltoaltro");

                    let battesa = new Discord.MessageButton()
                        .setLabel("In attesa")
                        .setStyle("SECONDARY")
                        .setCustomId("attesaaltro");

                    let row = new Discord.MessageActionRow()
                        .addComponents(bchiudialtro, brisolto, battesa);

                    let ebenvenuto = new Discord.MessageEmbed()
                        .setTitle("Benvenuto nell'assistenza!")
                        .setDescription("Benvenuto nell'assistenza del nostro sever! Nell'attesa ti preghiamo di non menzionare lo staff. Ci potrebbero volere fino a 24h per ricevere una risposta.")
                    canale.send({embeds: [ebenvenuto], components: [row]});
                });
            } break;
            case "player": { //SEGNALA PLAYER
                var server = client.guilds.cache.get(GuildId);

                interaction.reply({ content: "I'm opening ticket", ephemeral: true });
                server.channels.create("player " + interaction.user.username, {
                    type: "text"
                }).then(canale => {
                    canale.setTopic(`User ID: ${interaction.user.id}`);
                    canale.setParent(CategoriaSegnalaPlayer); //Settare la categoria
                    if (canale.type === 'GUILD_TEXT') {
                        // Crea un oggetto 'PermissionOverwriteFlags' per definire le autorizzazioni
                        const permissionOverwrites = [
                            {
                                id: server.id,
                                deny: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: interaction.user.id, // Utilizza interaction.user.id come ID dell'utente
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: RuoloStaff,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                        ];

                        // Utilizza 'permissionOverwrites.edit()' per aggiornare le autorizzazioni del canale
                        canale.permissionOverwrites.set(permissionOverwrites)
                            .then(() => {
                                console.log("aggiornati permessi ticket");
                            })
                            .catch((error) => {
                                console.error('Errore durante la modifica delle autorizzazioni del canale:', error);
                            });
                    } else {
                        console.error('Il canale non è una TextChannel valida.');
                    }
                    canale.send(`<@&`+RuoloStaff+`> <@${interaction.user.id}>`);
                    

                    let bchiudialtro = new Discord.MessageButton()
                        .setLabel("Chiudi")
                        .setStyle("DANGER")
                        .setCustomId("chiudialtro");

                    let brisolto = new Discord.MessageButton()
                        .setLabel("Risolto")
                        .setStyle("SUCCESS")
                        .setCustomId("risoltoaltro");

                    let battesa = new Discord.MessageButton()
                        .setLabel("In attesa")
                        .setStyle("SECONDARY")
                        .setCustomId("attesaaltro");

                    let row = new Discord.MessageActionRow()
                        .addComponents(bchiudialtro, brisolto, battesa);

                    let ebenvenuto = new Discord.MessageEmbed()
                        .setTitle("Benvenuto nell'assistenza!")
                        .setDescription("Benvenuto nell'assistenza del nostro sever! Nell'attesa ti preghiamo di non menzionare lo staff. Ci potrebbero volere fino a 24h per ricevere una risposta.")
                    canale.send({embeds: [ebenvenuto], components: [row]});
                });
            } break;
            case "bug": {
                var server = client.guilds.cache.get(GuildId);

                interaction.reply({ content: "I'm opening the ticket", ephemeral: true });
                server.channels.create("bug " + interaction.user.username, {
                    type: "text"
                }).then(canale => {
                    canale.setTopic(`User ID: ${interaction.user.id}`);
                    canale.setParent(CategoriaBug); //Settare la categoria
                    if (canale.type === 'GUILD_TEXT') {
                        // Crea un oggetto 'PermissionOverwriteFlags' per definire le autorizzazioni
                        const permissionOverwrites = [
                            {
                                id: server.id,
                                deny: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: interaction.user.id, // Utilizza interaction.user.id come ID dell'utente
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: RuoloStaff,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                        ];

                        // Utilizza 'permissionOverwrites.edit()' per aggiornare le autorizzazioni del canale
                        canale.permissionOverwrites.set(permissionOverwrites)
                            .then(() => {
                                console.log("aggiornati permessi ticket");
                            })
                            .catch((error) => {
                                console.error('Errore durante la modifica delle autorizzazioni del canale:', error);
                            });
                    } else {
                        console.error('Il canale non è una TextChannel valida.');
                    }
                    canale.send(`<@&`+RuoloStaff+`> <@${interaction.user.id}>`);
                    

                    let bchiudialtro = new Discord.MessageButton()
                        .setLabel("Chiudi")
                        .setStyle("DANGER")
                        .setCustomId("chiudialtro");

                    let brisolto = new Discord.MessageButton()
                        .setLabel("Risolto")
                        .setStyle("SUCCESS")
                        .setCustomId("risoltoaltro");

                    let battesa = new Discord.MessageButton()
                        .setLabel("In attesa")
                        .setStyle("SECONDARY")
                        .setCustomId("attesaaltro");

                    let row = new Discord.MessageActionRow()
                        .addComponents(bchiudialtro, brisolto, battesa);

                    let ebenvenuto = new Discord.MessageEmbed()
                        .setTitle("Benvenuto nell'assistenza!")
                        .setDescription("Benvenuto nell'assistenza del nostro sever! Nell'attesa ti preghiamo di non menzionare lo staff. Ci potrebbero volere fino a 24h per ricevere una risposta.")
                    canale.send({embeds: [ebenvenuto], components: [row]});
                });
            } break;
            case "appella": { // head
                var server = client.guilds.cache.get(GuildId);

                interaction.reply({ content: "Sto aprendo un ticket", ephemeral: true });
                server.channels.create("ban-mute " + interaction.user.username, {
                    type: "text"
                }).then(canale => {
                    canale.setTopic(`User ID: ${interaction.user.id}`);
                    canale.setParent(CategoriaAppelaBanMute); //Settare la categoria
                    if (canale.type === 'GUILD_TEXT') {
                        // Crea un oggetto 'PermissionOverwriteFlags' per definire le autorizzazioni
                        const permissionOverwrites = [
                            {
                                id: server.id,
                                deny: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: interaction.user.id, // Utilizza interaction.user.id come ID dell'utente
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: RuoloStaff,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                        ];

                        // Utilizza 'permissionOverwrites.edit()' per aggiornare le autorizzazioni del canale
                        canale.permissionOverwrites.set(permissionOverwrites)
                            .then(() => {
                                console.log("aggiornati permessi ticket");
                            })
                            .catch((error) => {
                                console.error('Errore durante la modifica delle autorizzazioni del canale:', error);
                            });
                    } else {
                        console.error('Il canale non è una TextChannel valida.');
                    }
                    canale.send(`<@&`+RuoloStaff+`> <@${interaction.user.id}>`);
                    

                    let bchiudialtro = new Discord.MessageButton()
                        .setLabel("Chiudi")
                        .setStyle("DANGER")
                        .setCustomId("chiudialtro");

                    let brisolto = new Discord.MessageButton()
                        .setLabel("Risolto")
                        .setStyle("SUCCESS")
                        .setCustomId("risoltoaltro");

                    let battesa = new Discord.MessageButton()
                        .setLabel("In attesa")
                        .setStyle("SECONDARY")
                        .setCustomId("attesaaltro");

                    let row = new Discord.MessageActionRow()
                        .addComponents(bchiudialtro, brisolto, battesa);

                    let ebenvenuto = new Discord.MessageEmbed()
                        .setTitle("Benvenuto nell'assistenza!")
                        .setDescription("Benvenuto nell'assistenza del nostro sever! Nell'attesa ti preghiamo di non menzionare lo staff. Ci potrebbero volere fino a 24h per ricevere una risposta.")
                    canale.send({embeds: [ebenvenuto], components: [row]});
                });
            } break;
            case "altro": {
                var server = client.guilds.cache.get(GuildId);

                interaction.reply({ content: "Sto aprendo un ticket", ephemeral: true });
                server.channels.create("altro " + interaction.user.username, {
                    type: "text"
                }).then(canale => {
                    canale.setTopic(`User ID: ${interaction.user.id}`);
                    canale.setParent(CategoriaAltro); //Settare la categoria
                    if (canale.type === 'GUILD_TEXT') {
                        // Crea un oggetto 'PermissionOverwriteFlags' per definire le autorizzazioni
                        const permissionOverwrites = [
                            {
                                id: server.id,
                                deny: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: interaction.user.id, // Utilizza interaction.user.id come ID dell'utente
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: RuoloStaff,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                        ];

                        // Utilizza 'permissionOverwrites.edit()' per aggiornare le autorizzazioni del canale
                        canale.permissionOverwrites.set(permissionOverwrites)
                            .then(() => {
                                console.log("aggiornati permessi ticket");
                            })
                            .catch((error) => {
                                console.error('Errore durante la modifica delle autorizzazioni del canale:', error);
                            });
                    } else {
                        console.error('Il canale non è una TextChannel valida.');
                    }
                    canale.send(`<@&`+RuoloStaff+`> <@${interaction.user.id}>`);

                    

                    let bchiudialtro = new Discord.MessageButton()
                        .setLabel("Chiudi")
                        .setStyle("DANGER")
                        .setCustomId("chiudialtro");

                    let brisolto = new Discord.MessageButton()
                        .setLabel("Risolto")
                        .setStyle("SUCCESS")
                        .setCustomId("risoltoaltro");

                    let battesa = new Discord.MessageButton()
                        .setLabel("In attesa")
                        .setStyle("SECONDARY")
                        .setCustomId("attesaaltro");

                    let row = new Discord.MessageActionRow()
                        .addComponents(bchiudialtro, brisolto, battesa);

                    let ebenvenuto = new Discord.MessageEmbed()
                        .setTitle("Benvenuto nell'assistenza!")
                        .setDescription("Benvenuto nell'assistenza del nostro sever! Nell'attesa ti preghiamo di non menzionare lo staff. Ci potrebbero volere fino a 24h per ricevere una risposta.")
                    canale.send({embeds: [ebenvenuto], components: [row]});
                });
            } break;
        }
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    
    if (interaction.customId === "chiudialtro") {
        const topic = interaction.channel.topic;
        
        if (!topic || !topic.startsWith("User ID:")) {
            return interaction.reply("Non puoi usare questo comando qui.");
        }
        
        const idUtente = topic.slice(9);
        
        if (interaction.user.id == idUtente || interaction.member.roles.cache.has(RuoloStaff)) {
            
            const echiudi = new Discord.MessageEmbed()
                .setTitle("Chiusura ticket!")
                .setDescription("Il ticket si chiuderà in `5 secondi`")
                .setFooter({ text: FooterEmbeds });

            await interaction.reply({ embeds: [echiudi] });
            setTimeout(() => {
                interaction.channel.delete()
                    .then(() => {
                        console.log(`Un ticket è stato chiuso`);
                    })
                    .catch(error => {
                        console.error('Catch attivato (tutto apposto compa)');
                    });
            }, 5000); // 5000 millisecondi = 5 secondi

            let chatLog = `-- CHAT LOG #${interaction.channel.name} --\n\n`;

            const messages = await getAllMessages(interaction.channel);
            messages.reverse().forEach(msg => {
                chatLog += `@${msg.author.tag} ID: ${msg.author.id} - ${msg.createdAt.toLocaleString()}\n`;

                if (msg.content) chatLog += `${msg.content}\n`;

                if (msg.embeds[0]) {
                    chatLog += `Embed:\n`;
                    if (msg.embeds[0].title) chatLog += `Title: ${msg.embeds[0].title}\n`;
                    if (msg.embeds[0].description) chatLog += `Description: ${msg.embeds[0].description}\n`;
                    if (msg.embeds[0].fields[0]) chatLog += `Fields: ${msg.embeds[0].fields.map(x => `${x.name}-${x.value}`).join(", ")}\n`;
                }

                if (msg.attachments.size > 0) {
                    chatLog += `Files: ${msg.attachments.map(x => `${x.name} (${x.url})`).join(", ")}\n`;
                }

                if (msg.stickers.size > 0) {
                    chatLog += `Stickers: ${msg.stickers.map(x => `${x.name} (${x.url})`).join(", ")}\n`;
                }

                chatLog += "\n";
            });

            const attachment = new Discord.MessageAttachment(Buffer.from(chatLog, "utf-8"), `chatLog-channel-${interaction.channel.id}.txt`);
            const now = new Date();

            const embed = new Discord.MessageEmbed()
                .setTitle("Transcript Ticket")
                .setDescription(`Name: ${interaction.channel.name}\nData: ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`);

            const channelt = client.channels.cache.get(CanaleTranscript); //CANALE TRANSCRIPT

            channelt.send({ embeds: [embed], files: [attachment] });
        } else {
            interaction.reply("Non hai il permesso.");
        }
    } else if (interaction.customId === "risoltoaltro") {
        const erisolto = new Discord.MessageEmbed()
            .setTitle("✅ **RISOLTO!**")
            .setDescription("Il tuo problema è stato **risolto** con successo!")
            .setFooter({ text: FooterEmbeds })
            .setColor("#00ffff");
        interaction.reply({ embeds: [erisolto] });
    } else if (interaction.customId === "attesaaltro") {
        if (!interaction.member.roles.cache.has(RuoloStaff)) {
            return interaction.reply({ content: "Non hai il permesso", ephemeral: true })
        }
        
        const eattesa = new Discord.MessageEmbed()
            .setTitle("🕰️**MODALITA' ATTESA!**")
            .setDescription(`Il tuo ticket è stato messo in modalità attesa da <@${interaction.user.id}>.\nPer favore attendI.`)
            .setFooter({ text: FooterEmbeds })
            .setColor("#00ffff");
        interaction.reply({ embeds: [eattesa] });
        interaction.channel.setParent(CategoriaAttesa);
    }
});

client.on('interactionCreate', async  (interaction) => {
    if (!interaction.isCommand()) return;

    if(interaction.commandName == "claim"){
        if (!interaction.member.roles.cache.has(RuoloStaff)) {
            return interaction.reply({ content: "Non hai il permesso", ephemeral: true });
        }
        if(interaction.channel.topic.startsWith('User ID:')) {
            const eclaim = new Discord.MessageEmbed()
            .setTitle("Ticket Management")
            .setDescription(`Il tuo ticket sarà gestito da <@${interaction.user.id}>.`)
            .setColor("#00ffff");

            interaction.reply({ embeds: [eclaim] });
        }
        
    }

    if(interaction.commandName == "sposta") {
        if(interaction.member.roles.cache.has(RuoloStaff)) {
            if(interaction.channel.topic.startsWith('Topic ID:')){
                const categoria = interaction.options.getChannel('categoria');
                const canaleDaSpostare = interaction.channel;

                if (!categoria) {
                    return interaction.reply({ content: 'Devi specificare una categoria.', ephemeral: true });
                }

                const server = interaction.guild;

                // Verifica se l'opzione "categoria" è una categoria di canali
                if (categoria.type !== 'GUILD_CATEGORY') {
                    return interaction.reply({ content: 'L\'opzione specificata non è una categoria.', ephemeral: true });
                }
                
                try {
                    // Sposta il canale nella categoria di destinazione
                    await canaleDaSpostare.setParent(categoria);
            
                    return interaction.reply({ content: `Il canale è stato spostato in '${categoria}'.` });
                } catch (error) {
                    console.error('Errore durante lo spostamento del canale:', error);
                    return interaction.reply({ content: 'Si è verificato un errore durante lo spostamento del canale.', ephemeral: true });
                }
            }
        } else {
            interaction.reply({content: "Non hai il permesso!", ephemeral: true});
        }
    }

    if(interaction.commandName == "aggiungi") {
        if(interaction.member.roles.cache.has(RuoloStaff)) {

            if (!interaction.channel.topic || !interaction.channel.topic.startsWith("User ID:")) {
                return interaction.reply("Non puoi usare questo comando qui.");
            }
            
            const user = interaction.options.getMember('utente');

            const permissionOverwrites = [
                {
                    id: user,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL],
                }
            ];

            // Utilizza 'permissionOverwrites.edit()' per aggiornare le autorizzazioni del canale
            interaction.channel.permissionOverwrites.set(permissionOverwrites)
                .then(() => {
                    console.log("aggiornati permessi ticket");
                    interaction.reply(`Aggiunto l'utente: <@${user.id}>`)
                })
                .catch((error) => {
                    console.error('Errore durante la modifica delle autorizzazioni del canale:', error);
                });

        } else {
            interaction.reply({ content: "Non hai il permesso di usare questo comando!", ephemeral: true })
        }
    }
    
    if(interaction.commandName == "rimuovi") {
        if(interaction.member.roles.cache.has(RuoloStaff)) {

            if (!interaction.channel.topic || !interaction.channel.topic.startsWith("User ID:")) {
                return interaction.reply("Non puoi usare questo comando qui.");
            }
            
            const user = interaction.options.getMember('utente');

            const permissionOverwrites = [
                {
                    id: user,
                    deny: [Permissions.FLAGS.VIEW_CHANNEL],
                }
            ];

            // Utilizza 'permissionOverwrites.edit()' per aggiornare le autorizzazioni del canale
            interaction.channel.permissionOverwrites.set(permissionOverwrites)
                .then(() => {
                    console.log("aggiornati permessi ticket");
                    interaction.reply(`Rimosso l'utente: <@${user.id}>`)
                })
                .catch((error) => {
                    console.error('Errore durante la modifica delle autorizzazioni del canale:', error);
                });

        } else {
            interaction.reply({ content: "Non hai il permesso di usare questo comando!", ephemeral: true })
        }
    }

    if(interaction.commandName == "rinomina") {
        if(interaction.member.roles.cache.has(RuoloStaff)) {

            if (!interaction.channel.topic || !interaction.channel.topic.startsWith("User ID:")) {
                return interaction.reply("Non puoi usare questo comando qui.");
            }
            
            const name = interaction.options.getString('nome');

            interaction.channel.setName(name);

            interaction.reply("Canale rinominato in: `"+name+"`")

        } else {
            interaction.reply({ content: "Non hai il permesso di usare questo comando!", ephemeral: true })
        }
    }
});

const getAllMessages = async (channel) => {
    let allMessages = []
    let lastMessage

    while (true) {
        const options = { limit: 100 }
        if (lastMessage) options.before = lastMessage

        let messages = await channel.messages.fetch(options)

        allMessages = allMessages.concat(Array.from(messages.values()))

        lastMessage = messages.last().id

        if (messages.size != 100) {
            break
        }
    }

    return allMessages
};
    

