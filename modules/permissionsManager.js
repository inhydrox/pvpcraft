/**
 * Created by macdja38 on 2016-05-04.
 */
/**
 * Created by macdja38 on 2016-04-25.
 */
"use strict";

var Utils = require('../lib/utils');
var utils = new Utils();

var permsURL = "https://pvpcraft.ca/pvpbot/perms/?server=";

module.exports = class permissionsManager {
    constructor(cl) {
        this.client = cl;
    }

    getCommands() {
        return ["pex"];
    }

    checkMisc() {
        return false;
    }

    onCommand(msg, command, perms, l) {
        console.log("Perms initiated");
        console.log(command);
        if(command.command === "pex") {
            if (command.arguments.length === 0) {
                msg.reply("You need help! visit \<https://pvpcraft.ca/pvpbot\> for more info");
                return true;
            }
            if(command.arguments[0] === "set") {
                command.arguments.splice(0,1);
                if(command.arguments.length < 2) {
                    msg.reply("pex set <allow|deny|remove> <node>");
                    return true;
                }
                var channel;
                var server;
                if(command.options.channel) {
                    //user has specified a channel level permission
                    if(/<#\d+>/.test(command.options.channel)) {
                        channel = msg.channel.server.channels.get("id", command.options.channel.match(/<#(\d+)>/)[1]);
                    }
                    else {
                        channel = msg.channel.server.channels.get("name", command.options.channel);
                    }
                    if(channel) {
                        //if we found the channel check their permissions then define the channel.
                        if (!perms.checkManageRolesChannel(msg.author, channel)) {
                            msg.reply("You don't have perms to edit perms in this channel, you need manage Roles!");
                            return true;
                        }
                        server = msg.channel.server.id;
                        channel = channel.id;
                    }
                    else {
                        msg.reply("Could not find channel specified please either mention the channel or use it's full name")
                        return true;
                    }
                }
                else{
                    //user has not specified channel, assume server wide
                    if(!perms.checkManageRolesServer(msg.author, msg.channel.server)) {
                        msg.reply("You don't have perms to edit perms in this server, you need manage Roles!");
                        return true;
                    }
                    channel = "*";
                    server = msg.channel.server.id;
                }
                //here we find the group's or users effected.
                var target;
                if(command.options.group && !command.options.role) {
                    command.options.role = command.options.group
                }
                if(command.options.user) {
                    console.log(command.options.user);
                    if(/<@!?\d+>/.test(command.options.user)) {
                        console.log("Found user mention");
                        target = msg.channel.server.members.get("id", command.options.user.match(/<@!?(\d+)>/)[1]);
                    }
                    else {
                        target = msg.channel.server.members.get("name", command.options.user)
                    }
                    if(target) {
                        target = "u" + target.id
                    }
                    else {
                        msg.reply("Could not find user with that name, please try a mention or name, names are case sensitive");
                        return true;
                    }
                }
                else if(command.options.role) {
                    console.log(command.options.role);
                    if(/<@&\d+>/.test(command.options.role)) {
                        console.log("Found role mention");
                        target = msg.channel.server.roles.get("id", command.options.role.match(/<@&(\d+)>/)[1]);
                    }
                    else {
                        target = msg.channel.server.roles.get("name", command.options.role);
                    }
                    if(target) {
                        target = "g" + target.id
                    }
                    else {
                        msg.reply("Could not find role with that name, please try a mention or name, names are case sensitive");
                        return true;
                    }
                }
                else {
                    target = "*"
                }
                console.log("setting permissions here".red);
                console.log("channel:" + channel);
                console.log("server:" + server);
                console.log("target:" + target);
                console.log(command);
                var action = command.arguments.splice(0,1)[0];
                console.log(command);
                var node = server + "." + channel + "." + target + "." + command.arguments.join(".");
                msg.reply("Trying to " + action + " node ```" + node + "```");
                console.log(node);
                perms.set(node, action);
            }
            if(command.arguments[0] === "list") {
                msg.reply(permsURL + msg.channel.server.id);
            }
            return true;
        }
        return false;
    }
};