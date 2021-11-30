// Copyright 2020 ChainLab
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const http = require('http');
const server = http.createServer();
const crypto = require("crypto");
const fetch = require("node-fetch");

const fs = require('fs');

let configraw = fs.readFileSync('./config.json');
let config = JSON.parse(configraw);
console.log("Config: " + config);

const stdio = require("stdio");
const args = stdio.getopt({
    "ip": {key: "ip", args: 1, description: "IP address", mandatory: true},
    "port": {key: "port", args: 1, description: "Port", mandatory: true},
    "name": {key: "name", args: 1, description: "MSP Name", mandatory: true},
    "agentUrl": {key: "agentUrl", args: 1, description: "Agent URL", mandatory: true},
    "schemaName": {key: "schemaName", args: 1, description: "Schema Name", mandatory: true},
    "imageUrl": {key: "imageUrl", args: 1, description: "Agent Image URL", mandatory: true}
});

const ip_address = args.ip;
console.log("ip address: " + ip_address);

const port = args.port
console.log("port: " + port);

const name = args.name;
console.log("name: " + name);

const agentUrl = args.agentUrl;
console.log("Agent URL: " + agentUrl);

const schemaName = args.schemaName;
console.log("schemaName: " + schemaName);

const imageUrl = args.imageUrl;
console.log("imageUrl: " + imageUrl);

var schemaId;
var credDefId;

let bookings = [];

class Test {

    async getIp() {
        let ip_address;
        await fs.readFile('../ip_address', function (err, data) {
            if (err) {
                return console.log(err);
                console.log("Please create a file called ip_address that contains the private ip address");
                return Promise.reject(-1);
            }
            return Promise.resolve(data.toString());
        });
    }

    async httpRequestWithBody(url, method, payload) {
        console.log("Submitting request...");
        console.log("Connecting to " + url);
        let response = await fetch(url, {
            headers: {"X-Api-Key": "abcdefghijkl", "Content-Type": 'application/json'},
            method: method,
            body: JSON.stringify(payload)
        }).catch(err => {
            return Promise.reject(err)
        });
        // console.log(response);
        let json = await response.json();
        console.log("Status code: " + response.status);
        if (response.status == "200") {
            return Promise.resolve(json);
        } else {
            return Promise.reject("-1");
        }
    };

    async httpRequestWithoutBody(url, method) {
        console.log("Submitting request...");
        console.log("Connecting to " + url);
        let response = await fetch(url, {
            headers: {"X-Api-Key": "abcdefghijkl", "Content-Type": 'application/json'},
            method: method
        }).catch(err => {
            return Promise.reject(err)
        });
        // console.log(response);
        let json = await response.json();
        console.log("Status code: " + response.status);
        if (response.status == "200") {
            return Promise.resolve(json);
        } else {
            return Promise.reject("-1");
        }
    };

    async createSchema() {
        let schema_name, schemaBody;
        if (schemaName != "CreditCard") {
            schema_name = name + "-Ticket Nr. " + Math.round(Math.random() * 1000);
            schemaBody = {
                "attributes": [
                    "Departure",
                    "Destination",
                    "Departure Time",
                    "Firstname",
                    "Lastname"
                ],
                "schema_name": schema_name,
                "schema_version": "1.0"
            };
        } else {
            schema_name = name + " Nr. " + Math.round(Math.random() * 1000);
            schemaBody = {
                "attributes": [
                    "Firstname",
                    "Lastname"
                ],
                "schema_name": schema_name,
                "schema_version": "1.0"
            }
        }
        console.log(schemaBody);
        console.log(JSON.stringify(schemaBody));
        let response = await this.httpRequestWithBody(agentUrl + "/schemas", "POST", schemaBody).catch(err => {
            console.log(err);
            return Promise.reject(-1);
        });
        console.log(response);
        console.log("Create schema response: " + response);

        schemaId = response.schema_id;
        console.log("Schema-ID: " + schemaId);
        if (typeof(schemaId !== undefined)) {
            config["schemaId"] = schemaId;
            let configraw = JSON.stringify(config);
            fs.writeFileSync('./config.json', configraw);
        }

        return Promise.resolve(response);
    }

    async createCredDef() {
        let tag;
        if (schemaName != "CreditCard") {
            tag = schemaName
        } else {
            tag = "MasterCard"
        }
        let credDefBody = {
            "revocation_registry_size": 1000,
            "schema_id": schemaId,
            "support_revocation": true,
            "tag": tag
        }
        console.log(credDefBody);
        console.log(JSON.stringify(credDefBody));
        let response = await this.httpRequestWithBody(agentUrl + "/credential-definitions", "POST", credDefBody).catch(err => {
            console.log(err);
            return Promise.reject(-1);
        });
        console.log(response);
        console.log("Credential definition response: " + response);

        credDefId = response.credential_definition_id;
        console.log("CredDefId: " + credDefId);
        if (typeof(credDefId !== undefined)) {
            config["credDefId"] = credDefId;
            let configraw = JSON.stringify(config);
            fs.writeFileSync('./config.json', configraw);
        }

        return Promise.resolve(response);
    }

    async getInvitation() {

        let response = await this.httpRequestWithBody(agentUrl + "/connections/create-invitation?auto_accept=true", "POST", {}).catch(err => {
            console.log(err)
            return Promise.reject(-1)
        });
        //console.log("Response " + response)
        return Promise.resolve(response)
    };

    async sendProofRequest(connectionId) {
        let credentialBody;
        if (name != "Ticket Inspector") {
            credentialBody = {
                "connection_id": connectionId,
                "comment": "string",
                "proof_request": {
                    "name": "Proof request",
                    "requested_predicates": {},
                    "requested_attributes": {
                        "Credit Card": {
                            "names": [
                                "Firstname", "Lastname"
                            ],
                            "restrictions": [
                                {
                                    "issuer_did": "4cU41vWW82ArfxJxHkzXPG"
                                }
                            ]
                        }
                    },
                    "version": "0.1",
                    "nonce": "123456789"
                }
            }
        } else {
            credentialBody = {
                "connection_id": connectionId,
                "comment": "string",
                "proof_request": {
                    "name": "Proof request",
                    "requested_predicates": {},
                    "requested_attributes": {
                        "Credit Card": {
                            "names": [
                                "Firstname", "Lastname"
                            ],
                            "restrictions": [
                                {
                                    "issuer_did": "4cU41vWW82ArfxJxHkzXPG"
                                }
                            ]
                        },
                        "Ticket": {
                            "names": [
                                "Departure", "Destination", "Departure Time"
                            ],
                            "restrictions": [
                                {
                                    "issuer_did": "Th7MpTaRZVRYnPiabds81Y"
                                }
                            ]
                        }
                    },
                    "version": "0.1",
                    "nonce": "123456789"
                }
            }
        }
        console.log(credentialBody);
        let response = await this.httpRequestWithBody(agentUrl + "/present-proof/send-request", "POST", credentialBody).catch(err => {
            console.log(err);
            return Promise.reject(-1);
        });
        console.log(response);
        return Promise.resolve(response);
    }

    async issueCredential(connectionId, start, dest, time, firstName, lastName) {
        let schemaResponse = await this.httpRequestWithoutBody(agentUrl + "/schemas/created")
        let schemaId = schemaResponse["schema_ids"][0]
        console.log("SchemaId: " + schemaId);
        let credentialResponse = await this.httpRequestWithoutBody(agentUrl + "/credential-definitions/created")
        let credDefId = credentialResponse["credential_definition_ids"][0]
        console.log("CredDefId: " + credDefId);
        let credentialBody;
        if (schemaName != "CreditCard") {
            credentialBody = {
                "auto_remove": true,
                "comment": "string",
                "connection_id": connectionId,
                "cred_def_id": credDefId,
                "credential_proposal": {
                    "@type": "issue-credential/1.0/credential-preview",
                    "attributes": [
                        {
                            "name": "Departure",
                            "value": start
                        },
                        {
                            "name": "Destination",
                            "value": dest
                        },
                        {
                            "name": "Departure Time",
                            "value": time
                        },
                        {
                            "name": "Firstname",
                            "value": firstName
                        },
                        {
                            "name": "Lastname",
                            "value": lastName
                        }
                    ]
                },
                "issuer_did": credDefId.split(":")[0],
                "schema_id": schemaId,
                "schema_issuer_did": schemaId.split(":")[0],
                "schema_name": schemaId.split(":")[2],
                "schema_version": "1.0",
                "trace": false
            }
        } else {
            credentialBody = {
                "auto_remove": true,
                "comment": "string",
                "connection_id": connectionId,
                "cred_def_id": credDefId,
                "credential_proposal": {
                    "@type": "issue-credential/1.0/credential-preview",
                    "attributes": [
                        {
                            "name": "Firstname",
                            "value": "Jonathan"
                        },
                        {
                            "name": "Lastname",
                            "value": "Lautenschlager"
                        }
                    ]
                },
                "issuer_did": credDefId.split(":")[0],
                "schema_id": schemaId,
                "schema_issuer_did": schemaId.split(":")[0],
                "schema_name": schemaId.split(":")[2],
                "schema_version": "1.0",
                "trace": false
            }
        }
        console.log(credentialBody);
        let response = await this.httpRequestWithBody(agentUrl + "/issue-credential/send", "POST", credentialBody).catch(err => {
            console.log(err);
            return Promise.reject(-1);
        });
        console.log(response);
        return Promise.resolve(response);
    }

    async bootstrap() {
        if (name != "Ticket Inspector") {
            await new Promise(r => setTimeout(r, 10000));
            await this.createSchema();
            await this.createCredDef();
        }
    }

    start() {

        server.on("request", async (req, res) => {
            try {
                console.log("url    : " + req.url);
                console.log("method: " + req.method);

                if (req.method == "GET") {
                    console.log("Serving get request");
                    console.log("Request url: " + req.url);
                    if (req.url.split("?")[0] == "/getInvitation") {
                        console.log("Success");
                        console.log(req.url.split("?")[1]);
                        let params = req.url.split("?")[1].split("&");
                        let start;
                        let dest;
                        let time;
                        params.forEach(element => {
                            if (element.split("=")[0] == "start") {
                               start = element.split("=")[1]
                            } else if (element.split("=")[0] == "dest"){
                               dest =  element.split("=")[1]
                            } else if (element.split("=")[0] == "time"){
                               time = element.split("=")[1]
                            }
                        });
                        console.log(req.url);
                        console.log("Departure (start): " + start);
                        console.log("Destination (dest): " + dest);
                        console.log("Travel Time (time): " + time);
                        let result = await this.getInvitation().catch(err => console.log(err));
                        console.log(result);

                        let invitation = result["invitation"]
                        invitation["imageUrl"] = imageUrl;
                        let encoded = new Buffer(JSON.stringify(invitation), "utf-8").toString("base64");
                        console.log(encoded);
                        /*
                        let invitation_url = result["invitation_url"];
                        invitation_url = invitation_url.replace("c_i=", "c_i=");
                         */
                        let connection_id = result["connection_id"];
                        bookings.push([connection_id, start, dest, time]);
                        console.log("bookings: " + bookings);
                        console.log("connection_id: " + connection_id);
                        //console.log(invitation_url);
                        //res.writeHead(301, {'Location': 'invitation_url'});
                        //let redirect_url = 'didcomm://aries_connection_invitation?' + invitation_url.split("?")[1];
                        let redirect_url = 'didcomm://aries_connection_invitation?c_i=' + encoded;
                        // let redirect_url = invitation_url;
                        //let redirect_url = 'didcomm://192.168.188.21:7000/?d_m=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNTc5YTg1OGItZTI2Mi00M2VlLTlkZmItMmNkMzIwMTg5OWFlIiwgInNlcnZpY2VFbmRwb2ludCI6ICJodHRwOi8vMTkyLjE2OC4xODguMjE6NzAwMC8iLCAicmVjaXBpZW50S2V5cyI6IFsiQWo3ZU5LZFdTazZRemdqWkMzRWF1RUxZNENRSm1EMXcyZ1ZCeVFEb3VHeVkiXSwgImxhYmVsIjogIkhSLURlcGFydG1lbnQifQ=='
                        //let redirect_url = 'didcomm://example.org?d_m=ewoJImNvbW1lbnQiOiBudWxsLAoJImNyZWRlbnRpYWxfcHJldmlldyI6IHsKCQkiYXR0cmlidXRlcyI6IFt7CgkJCSJuYW1lIjogInNjb3JlIiwKCQkJInZhbHVlIjogImhhbGxvIgoJCX1dLAoJCSJAaWQiOiBudWxsLAoJCSJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9pc3N1ZS1jcmVkZW50aWFsLzEuMC9jcmVkZW50aWFsLXByZXZpZXciCgl9LAoJIm9mZmVyc35hdHRhY2giOiBbewoJCSJAaWQiOiAibGliaW5keS1jcmVkLW9mZmVyLTAiLAoJCSJtaW1lLXR5cGUiOiAiYXBwbGljYXRpb24vanNvbiIsCgkJImRhdGEiOiB7CgkJCSJiYXNlNjQiOiAiZXlKelkyaGxiV0ZmYVdRaU9pQWlOR05WTkRGMlYxYzRNa0Z5Wm5oS2VFaHJlbGhRUnpveU9uQnlaV1p6ZEdWemREb3hMakFpTENBaVkzSmxaRjlrWldaZmFXUWlPaUFpTkdOVk5ERjJWMWM0TWtGeVpuaEtlRWhyZWxoUVJ6b3pPa05NT2pRMk5UazZkR1Z6ZENJc0lDSnJaWGxmWTI5eWNtVmpkRzVsYzNOZmNISnZiMllpT2lCN0ltTWlPaUFpTWpjd01EazRNalF3TURrMU1ESTRPVFF5T1RJMk5qa3dOalEwTkRZME5UWXhPREl6TmpJNU9EYzFNak14TlRJMU1UVTJOalV6TmpRMk9UTTVNakUxTlRJd056ZzVOamt3Tmpnek1ERWlMQ0FpZUhwZlkyRndJam9nSWpFMk1Ea3lNakkzTURZeU5qQTRPRGsxTlRnMk1ESTNOems1TnpneU9UWTFOalk0T0RJNU1UVXdOREE0TVRrM05EQTRNelF3T1RjMU5EZ3lOamcwTlRVME1EY3hNemM0TkRrNE5UWTFNVEEzTkRJeU1USTJNVFUwT0RFME1URXhNakV4TkRVd01EWTBOVEkyTkRjeE16azFORFF4TnpjMk1EZ3pPVFkzTURjeU56RTBNalEwTURreU9ERXpOVGsyTWpBNU1qZzJOamsxTnpReU5ESTVNVEkxTkRjMU9EVXhOek00T0RJMU1USTNPVGMzTVRZek9EWTROalk1TVRRNE1UQTJOVEl5TmpZeE1USXhOekV5TmpVek16TXpOekF5T0RNeU9USTFPRGM0TURFek9ERTBORGM1T0RFeU9ESXhOekl5TmpJd09URXdOakEzTURjeU5qSTJOalk0T0RreE5URTFNRE0yTURRMk1ESTRNVGt5TnpnMk5qYzJORFUzTURneU9Ea3dOemM1TlRnME5UY3pOVGs0TXpRM05EZzVPVEkxT0RRM05qSXpORGMyTmpReU1EUTRPVEF3TXpNeE5qTTFPVFk0TWpjMU5UazVPREEzT0RVME5ERTNORFUwT1RZNE5UQXlPRGMzTURJMk1EY3dNVFExTWpneU1ESXpPREV6TURJeE1UWTRPREUwTlRZNE16QTBORFUxTkRrM09UY3hOalkwT1RnM01UWTJPRE16TlRNNE1qQXpOalV3TmpZek5UYzFNalF6T0RFMU5UWTVPVEEwTnpFNE5EVTBNRFUxTWpZeU56VXhNVFk1T0RjM05UTTRPVGszTXpNME1qUTVOamt4TmpRd01EZzFOVFEwT1Rjd09USTBNVFl3TVRneU1UTXpOalF6T0RJeE1qSTVOek13TWpJNE56RTFOakl6TVRBeU9UQTVNRGM1TlRZek16RXlPREU0TXpjME1EUXdNVEE1TVRjeU1qSXdOakU0TXpFMk16azNOelUyTlRRNE5qUTJNemszTkRFMk1qZzJOVGczT0RnM09UazJOek16TXpZME9UQTFOamMxT1RrNU5USTVOREk1T0RFNU1UUTBNemszTnpZMk56ZzBNVGcyTlRneU56QXpPRE01T0RRMU5USTNPVEkxTnpRMk56UTFNekl4TWpReU5URXdNalV4TXpnM05qTXhNekUwTURneU16QXlOalEwT1NJc0lDSjRjbDlqWVhBaU9pQmJXeUp0WVhOMFpYSmZjMlZqY21WMElpd2dJalF3T1RRM05EYzBPVFF3TWpnd05qSXdOVFE0TVRneU1EZzVPVE13TlRZNE5UZzNNVFEwTmpNNU5EYzVNall4TXpNeE56VTVOakUwTXpVMU56YzFOemswTXpVNU1ERTNOREkzTmpJME9EWXpOVFUxT1RFNU5UYzFOVEE0TkRrMk5UTXpOelV3T0RNeE1EVXhOREl6TnpZNU1qTTNNVGt4TkRBek1EZ3lORFEzTnpZMU5qQXhOemcyTWpFek5EZzJORE00TlRFM05qSXhOVGM0TmpBeU9UZzBNakkxTmpjMU5qQTFNVFl4TVRJeE1ESXdNalU1T0RBM016QTBOalkzTVRFMk9UZ3lNek14T1RVeE16a3hOVE01TWprek1EQTJOamc0TXpVek56UTNOamd3TURBeU9EVXpORFU1TXpRMU9URTFPVGMwTmpZME5qSTJNekl4T0RRMk5EY3pPRGc0TURrMk9USTBNamN6TnpZM01UYzVNak16TkRJM05qVXdNRFl4TmpjMk5qYzFPRGs1TVRjMk16SXpOemd5T1RJeE16Y3pOakUyT0RFeU1USXhORFV6TmpVM01qWTFNVGs1TXpjME9UQXpOVGsyTlRNME1qTTJOREUzTnpVMk5qUXdNems1TURjd056STRNRFEzTmpNME56SXlOREUyTnpFNU5qVTFORFE1TlRRek16TXhNalEyTkRnMk56UTRNVEkxTmpBME1qUXlOVEE0TnpBMk9UQTVNVEk0TWpZMk5qTTBOekl3TXpnM056YzNORE14T1RJNU1EUTFOekF5TWprME9EVTRORFF3TlRReE5UZzROVEkwTVRBMU1URTROVFF3TlRFMU5EVTFOalEwTlRRNU1qSTJOVE16Tmpjek5UTXlOakl3T0RZNE5qTTBOamsyT1RJeE1EY3hORE0yT1RjeU5EUTFNVGMwTURZMU5ERXpOakl4TmpZMU9EYzNNalEzTnpJNE5EazNNVFF6TnpjNE16VTNNalEyTWpVeU1EVTJNelV4TXpVNU9UTTROakl4TkRZd016YzJOVEl5TURneU56YzBPRE01TXpreE5ERTNPVFU1TmpreE5EYzNNakl4TURVeU5qY3hNRFl4TkRFNU16TXlORFl4TlRnNU1ERTBPVGN4T0RFNE5UWTRNRGs1TWpFMk9UWTJNelF3TmpjNU9UUTFOemt5TVRrd016YzROell3TlRZd01URTROQ0pkTENCYkluTmpiM0psSWl3Z0lqWXlNakk0T0RFeU56azRORE13TlRjM01qazNOemsxTnpRNE16UTROekkyTkRVME5UZzNNVFV6T1RJd05ESTBNRFE0TWpFeE16a3hOamd5T1RnM09ERXlOVE13TURFd01EYzNPRGMzTXprd05USTFNemN6TnpFMk9UQTJOemsxTURjMk9EWTVOelEzTnpNek56VTJNVEF6TVRrM01UWTNOVFV4T0RnME1ESXdOamt3TmpnME16VTFPVEV6TnpFNE16ZzBOREEzTmpNM09EY3dOekE0T0RnM01UUXhOVFV3TnpNeE16YzVOVFl5T0RnM01UTXdOREl5TnpReE1ERTBNamc0TlRFNU1Ua3pPRGt4TURVME9URTVNekF6TURnNU16ZzVNRE0zT1RNM05qTTJNall3TURFMU16RTBPRFF5TkRZeU5USTJORGMxTlRnd09EYzRNall6TXpVd05UQXhNVE13TXpnNU5EazRNalF3TURRd016TTJPRFUxTURnek5EVXdNakExTnpReE1EZ3pNVE0yTVRFeE1USTVPRFEyTkRRNU16YzFPVE16T1RBME1qa3pORFV5TnpVeE5qZzFOamd5TnpFME1UQTJPVEF4TXpVM09UWTVPVEUwT1RReU1qWTNNVEF3TnpNNE5qUXlNRE0yT1RNMU9UYzNNekkzT0RZME5URTJNalF3TXpnNE5EVTFPRGd4TURjNE56UXdOVEUxT0RZek5qQTJPVEUwTkRFd09EVTJNemd6TWpnMk1ERTNOVGc1TnpJM05UQTBNVGs1TmpRek9EVXpNemN4TkRrNU1EVTNNRGM1TlRZM05qWTFNall3TmpJMk56YzBNakV3T1RRd09UVTBPRE14TnpBeU5qZ3hOekk0T1Rjek1EWXdOelU1TkRnME56YzNOVGt5T0RNNE56QTFNRE0xT0RFd01qQXlPVFE1TlRnNU5EUXhOemt4TlRrd01EUXdOelEyTlRrMU1qVXpOemswTWpZNE9UUTBORFl6T1RVME1qTTFNalExTVRBeU1qVTFOVFF4T1RjeU16ZzNOemd5TVRBNU1qUXlPVE0zTXpRd05ERTBPVGsxT0RFME16TTJPVFUyTWpJek1qVXhNemcwT1RFeE1qQTNNRFEyTnpNd05qTTFNekl6TVRRd056RTBNRE14T0RVMk56TTNOekl5TXpNMU5EUXlNVGd6TWpRMU5qVTRNRE13TmpNNU5DSmRYWDBzSUNKdWIyNWpaU0k2SUNJeE1UTXpNekkyT1RReU16UTFNVEEyT1RneU16WTFNekF6SW4wPSIKCQl9Cgl9XSwKCSJAaWQiOiAiNDVkZDA2MDYtNzgxMi00ZmQ1LWE4NWItYzliMDlmZDNmNzM5IiwKCSJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9pc3N1ZS1jcmVkZW50aWFsLzEuMC9vZmZlci1jcmVkZW50aWFsIiwKCSJ+c2VydmljZSI6IHsKCQkicmVjaXBpZW50S2V5cyI6IFsiSFc5YmJUVXhMZjVpa01iZ2dZNTJjMjlMaE1tWGRTZlhaU0dLNlFISFdRV1MiXSwKCQkicm91dGluZ0tleXMiOiBbXSwKCQkic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly8xOTIuMTY4LjE4OC4yMTo3MDAwIgoJfQp9'
                        //let redirect_url = 'didcomm://example.org?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiZjg0N2NmMTgtNDVlMS00NWFjLTg5YzQtYzkzZmI2ZmM3YWFjIiwgInJlY2lwaWVudEtleXMiOiBbIkhzSmpUcHhKWjZudDNjMU5HU0c2ZVViSkhHZmM4b0ZBbjljY29BVVc3YkQiXSwgImxhYmVsIjogIkhSLURlcGFydG1lbnQiLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly8xMC4yMjMuMTAyLjIzODo3MDAwLyJ9'
                        console.log('redirect_url: ' + redirect_url);
                        res.writeHead(307, {'Location': redirect_url});
                        //res.write("Hallo");
                        res.end("Invitation created")
                    } else if (req.url == "/getServiceLink") {
                        let responseBody = {
                            "serviceUrl": "http://" + ip_address + ":" + port + "/getInvitation"
                        }
                        res.setHeader('Content-Type', 'application/json')
                        res.write(JSON.stringify(responseBody));
                        res.statusCode = 200;
                        res.end()

                    } else {
                        console.log("Not supported");
                        res.writeHead(400, "Not supported");
                        res.end("Not supported");
                    }
                } else if (req.method == "POST") {
                    console.log("Serving POST request");
                    console.log(req.url);
                    if (req.url == "/topic/connections/") {
                        console.log("Receiving a connection webhook")
                        let body = [];
                        req.on('error', (err) => {
                            console.error(err);
                        }).on('data', (chunk) => {
                            body.push(chunk);
                        }).on('end', () => {
                            body = Buffer.concat(body).toString();
                            //console.log(body);
                            let json_body = JSON.parse(body);
                            console.log(json_body);
                            if (json_body["state"] == "response") {
                                console.log("Continuing with request-proof");
                                if (schemaName != "CreditCard") {
                                    console.log("Proceeding with proof request")
                                    this.sendProofRequest(json_body["connection_id"]);
                                } else {
                                    console.log("Proceeding with issuance")
                                    this.issueCredential(json_body["connection_id"]);
                                }

                            } else {
                                console.log("State: " + json_body["state"]);
                                console.log("Nothing to do");
                            }
                            res.writeHead(200, "Ok");
                            res.end("Connection webhook received");
                        });
                    } else if (req.url == "/topic/present_proof/") {
                        console.log("Receiving a present-proof webhook")
                        let body = [];
                        req.on('error', (err) => {
                            console.error(err);
                        }).on('data', (chunk) => {
                            body.push(chunk);
                        }).on('end', () => {
                            body = Buffer.concat(body).toString();
                            let json_body = JSON.parse(body);
                            console.log(json_body);
                            console.log(json_body["state"]);
                            if (json_body["state"] == "verified" && json_body["verified"] == "true") {
                                /*
                                let response = this.httpRequestWithoutBody(agentUrl + "/present-proof/records", "GET", {}).catch(err => {
                                    console.log(err)
                                    return Promise.reject(-1)
                                });
                                let proof = response["results"][0];
                                 */

                                let verified = json_body["verified"];
                                console.log("verified: " + verified);
                                if (verified == "true") {
                                    /*
                                    console.log("Continuing with proof record deletion and credential issuance")
                                    let pres_ex_id = proof["pres_ex_id"];
                                    console.log("Deleting proof record");
                                    let del_response = this.httpRequestWithoutBody(agentUrl + "/present-proof/records/" + pres_ex_id, "DELETE").catch(err => {
                                        console.log(err);
                                        return Promise.reject(-1);
                                    });
                                    console.log("Deletion response: " + del_response);
                                     */
                                    console.log("Continuing with issue credential");
                                    console.log("Getting the attribute");
                                    let firstName = json_body["presentation"]["requested_proof"]["revealed_attr_groups"]["Credit Card"]["values"]["Firstname"]["raw"];
                                    console.log("Firstname: " + firstName);
                                    let lastName = json_body["presentation"]["requested_proof"]["revealed_attr_groups"]["Credit Card"]["values"]["Lastname"]["raw"];
                                    console.log("Lastname: " + lastName);
                                    if (name != "Ticket Inspector") {
                                        bookings.forEach(element => {
                                            console.log("Looking at element " + element);
                                            //TODO Credential Schema von Ticket um Firstname und Lastname erweitern und das aus der Presentation übernehmen
                                            if (element[0] == json_body["connection_id"]) {
                                                console.log("Found booking with connection_id: " + json_body["connection_id"]);
                                                console.log("issuing a credential with start " + element[1] + ", dest " + element[2] + ", time " + element[3] + ", firstName " + firstName + " and lastName " + lastName);
                                                this.issueCredential(json_body["connection_id"], element[1], element[2], element[3], firstName, lastName);
                                            }
                                        });
                                    } else {
                                        console.log("Verificatin successful")
                                    }
                                }
                            } else {
                                console.log("State: " + json_body["state"]);
                                console.log("Nothing to do");
                            }
                            res.writeHead(200, "Ok");
                            res.end("Connection webhook received");
                        });
                    } else if (req.url == "/topic/revocation_registry/") {
                        console.log("Receiving a revocation-registry webhook")
                        const {headers, method, url} = req;
                        let body = [];
                        req.on('error', (err) => {
                            console.error(err);
                        }).on('data', (chunk) => {
                            body.push(chunk);
                        }).on('end', () => {
                            body = Buffer.concat(body).toString();
                            // console.log(body);
                            let json_body = JSON.parse(body);
                            console.log(json_body);
                            res.writeHead(200, "Ok");
                            res.end("Revocation-registry webhook received")
                        })
                    } else if (req.url == "/topic/issue_credential/") {
                        console.log("Receiving an issue_credential webhook")
                        const {headers, method, url} = req;
                        let body = [];
                        req.on('error', (err) => {
                            console.error(err);
                        }).on('data', (chunk) => {
                            body.push(chunk);
                        }).on('end', () => {
                            body = Buffer.concat(body).toString();
                            // console.log(body);
                            let json_body = JSON.parse(body);
                            console.log(json_body);
                            res.writeHead(200, "Ok");
                            res.end("Issue-credential webhook received")
                        })
                    } else if (req.url == "/topic/issuer_cred_rev/") {
                        console.log("Receiving an issuer_cred_rev webhook")
                        const {headers, method, url} = req;
                        let body = [];
                        req.on('error', (err) => {
                            console.error(err);
                        }).on('data', (chunk) => {
                            body.push(chunk);
                        }).on('end', () => {
                            body = Buffer.concat(body).toString();
                            // console.log(body);
                            let json_body = JSON.parse(body);
                            console.log(json_body);
                            res.writeHead(200, "Ok");
                            res.end("Issuer_cred_rev webhook received")
                        })
                    } else {
                        console.log("Not supported");
                        res.writeHead(400, "Not supported");
                        res.end("Not supported");
                    }
                }
                ;
            } catch (err) {
                console.log("An error occurred");
                console.log(err);
                res.writeHead(400, "An error occurred");
                res.end("Error");
            }
            ;
        })

        server.listen(port, "0.0.0.0");
        console.log('Server running...');
    }
}

const test = new Test();
test.bootstrap();
test.start();