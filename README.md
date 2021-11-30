# SSI-Mobility

## Deployment (work in progress; will be improved)

### Prepare the backend
- Clone with submodules: ```git clone https://github.com/JSedlmeir92/SSI-Mobility.git --recurse-submodules```
- Make sure all ports used in docker-compose.yml are open
- Replace the information in .env with the correct private ip_address and path to the repository (go into the repository and check the result of ```pwd```
- For the time being: Insert the correct ip_address twice in App.js

### Prepare the wallet app
- Download the esatus or trinsic digital wallet on your mobile phone
- Run ```start.sh```
- Download the file at http://<<ip_address>>:9000/genesis, send it to your mobile phone
- Change the ledger on your digital wallet to the one representit by the genesis file

These steps are only required initially or when your ip_address changes. 

## Run the demo
- Scan a QR Code representing http://<<ip_address>>:5229/getInvitation?start=Hamburg-Hbf\&dest=KoelnBonn-Airport\&time=14:41 to receive a credit card
- Run the Demo at http://<<ip_address>>:3000
- Scan a QR Code representing http://<<ip_address>>:6229/getInvitation?start=Hamburg-Hbf\&dest=KoelnBonn-Airport\&time=14:41 to receive a proof request from a ticket inspector
