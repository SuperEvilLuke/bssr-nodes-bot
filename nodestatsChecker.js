const axios = require("axios");
const ping = require("ping-tcp-js");
const chalk = require("chalk");

let pingLocals = {
    UK: config.Ping.UK,
    CA: config.Ping.CA,
    EU: config.Ping.EU,
};

let stats = {
    node1: {
        serverID: "52db8185",
        IP: config.Nodes.node1,
        ID: "17",
        Location: pingLocals.UK,
    },
    node2: {
        serverID: "f3e4e60a",
        IP: config.Nodes.node2,
        ID: "9",
        Location: pingLocals.UK,
    },
    car: {
        serverID: "f3e5h71c",
        IP: config.Nodes.car,
        ID: "9",
        Location: pingLocals.EU,
    }
};

if (config.Enabled.nodestatsChecker) {
    console.log(chalk.magenta("[NODE CHECKER] ") + chalk.green("Enabled"));
    // Node status
    setInterval(() => {
        // Public and private nodes
        for (let [node, data] of Object.entries(stats)) {
            setTimeout(() => {
                axios({
                    url: `http://${data.Location}?ip=${data.IP}&port=22`,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }).then((response) => {
                    let pingData = response.data.ping;

                    if (isNaN(pingData)) {
                        pingData = "0";
                    }

                    nodePing.set(node, {
                        ip: response.data.address,
                        ping: pingData,
                    });
                }).catch((error) => {});

                axios({
                    url: `${config.Pterodactyl.hosturl}/api/client/servers/${data.serverID}/resources`,
                    method: "GET",
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        Authorization: `Bearer ${config.Pterodactyl.apikeyclient}`,
                        "Content-Type": "application/json",
                        Accept: "Application/vnd.pterodactyl.v1+json",
                    },
                }).then((response) => {
                    nodeStatus.set(`${node}.timestamp`, Date.now());
                    nodeStatus.set(`${node}.status`, true);
                    nodeStatus.set(`${node}.is_vm_online`, true);
                }).catch((error) => {
                    ping.ping(data.IP, 22).then(() => {
                        nodeStatus.set(`${node}.timestamp`, Date.now());
                        nodeStatus.set(`${node}.status`, false);
                        nodeStatus.set(`${node}.is_vm_online`, true);
                    }).catch((e) => {
                        nodeStatus.set(`${node}.timestamp`, Date.now());
                        nodeStatus.set(`${node}.status`, false);
                        nodeStatus.set(`${node}.is_vm_online`, false);
                    });
                });

                setTimeout(() => {
                    axios({
                        url: `${config.Pterodactyl.hosturl}/api/application/nodes/${data.ID}/allocations?per_page=9000`,
                        method: "GET",
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            Authorization: `Bearer ${config.Pterodactyl.apikey}`,
                            "Content-Type": "application/json",
                            Accept: "Application/vnd.pterodactyl.v1+json",
                        },
                    }).then((response) => {
                        const serverCount = response.data.data.filter((m) => m.attributes.assigned === true).length;

                        nodeServers.set(node, {
                            servers: serverCount,
                        });
                    }).catch((err) => {});
                }, 2000);
            }, 2000);
        }
    }, 10000);
} else {
    console.log(chalk.magenta("[NODE CHECKER] ") + chalk.red("Disabled"));
}
